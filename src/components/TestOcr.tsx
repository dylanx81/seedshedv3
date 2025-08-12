"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";

export function TestOcr() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const processImageMutation = trpc.processSeedPacketImage.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error:", error);
      setLoading(false);
    },
  });

  const handleTestOcr = async () => {
    setLoading(true);
    // Test with a sample seed packet image URL
    processImageMutation.mutate({
      imageUrl: "https://example.com/sample-seed-packet.jpg", // Replace with actual test image
    });
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Test OCR Processing</h3>
      <Button 
        onClick={handleTestOcr} 
        disabled={loading}
        className="mb-4"
      >
        {loading ? "Processing..." : "Test OCR Processing"}
      </Button>
      
      {result && (
        <div className="space-y-2">
          <h4 className="font-medium">OCR Results:</h4>
          <div className="bg-gray-100 p-2 rounded text-sm">
            <h5 className="font-medium">Raw Text:</h5>
            <pre className="whitespace-pre-wrap text-xs">{result.rawText}</pre>
          </div>
          <div className="bg-blue-100 p-2 rounded text-sm">
            <h5 className="font-medium">Parsed Data:</h5>
            <pre className="text-xs">{JSON.stringify(result.parsedData, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
