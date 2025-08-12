"use client";

import React, { useState, useRef } from "react";
import { Camera, X, Upload, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc-client";

interface ScanSeedPacketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScanSeedPacketModal({
  isOpen,
  onClose,
}: ScanSeedPacketModalProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getUploadUrlMutation = trpc.getUploadUrl.useMutation();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
    }
    
    setIsCapturing(false);
    stopCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (mode === 'camera') {
      startCamera();
    }
  };

  const handleProcess = async () => {
    if (!capturedImage) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Get upload URL
      const uploadResult = await getUploadUrlMutation.mutateAsync({
        fileName: `seed-packet-${Date.now()}.jpg`,
        fileType: 'image/jpeg'
      });
      
      setUploadProgress(50);
      
      // Upload to Supabase
      const uploadResponse = await fetch(uploadResult.uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      setUploadProgress(100);
      
      // TODO: Call OCR processing endpoint with the public URL
      console.log('Image uploaded successfully:', uploadResult.publicUrl);
      
      // Show success message and close modal
      alert('Image processed successfully! (Demo mode - OCR data would be extracted here)') ;
      setTimeout(() => {
        setIsUploading(false);
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof Error && error.message.includes('Supabase not configured')) {
        alert('Upload service not configured. This is a demo - the image was captured successfully!') ;
      } else {
        alert('Failed to upload image. Please try again.') ;
      }
      setIsUploading(false);
    }
  };

  // Start camera when modal opens in camera mode
  React.useEffect(() => {
    if (isOpen && mode === 'camera' && !capturedImage) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, capturedImage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Hidden canvas for capturing video frames */}
      <canvas ref={canvasRef} className="hidden" />
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Scan Seed Packet
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              onClick={() => setMode('camera')}
              variant={mode === 'camera' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </Button>
            <Button
              onClick={() => setMode('upload')}
              variant={mode === 'upload' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>

          {!capturedImage ? (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 overflow-hidden relative">
              {mode === 'camera' ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {isCapturing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="text-center">
                        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                        <p className="text-sm text-white">Capturing image...</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <FileImage className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Select an image file
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  >
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
              <img
                src={capturedImage}
                alt="Captured seed packet"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="flex gap-2">
            {!capturedImage ? (
              mode === 'camera' ? (
                <Button
                  onClick={handleCapture}
                  disabled={isCapturing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isCapturing ? "Capturing..." : "Take Photo"}
                </Button>
              ) : null
            ) : (
              <>
                <Button
                  onClick={handleRetake}
                  variant="outline"
                  className="flex-1"
                  disabled={isUploading}
                >
                  Retake
                </Button>
                <Button
                  onClick={handleProcess}
                  disabled={isUploading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? "Uploading..." : "Process Image"}
                </Button>
              </>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 text-center">
                {uploadProgress < 50 ? "Getting upload URL..." : 
                 uploadProgress < 100 ? "Uploading image..." : 
                 "Processing..."}
              </p>
            </div>
          )}

          <div className="rounded-lg bg-blue-50 p-3">
            <h3 className="mb-1 text-sm font-medium text-blue-800">
              💡 Tips for best results:
            </h3>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>• Ensure good lighting</li>
              <li>• Keep the packet flat and in focus</li>
              <li>• Include all text on the packet</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
