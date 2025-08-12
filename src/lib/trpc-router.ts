import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { supabase } from "./supabase";

export const appRouter = router({
  getUploadUrl: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!supabase) {
          throw new Error("Supabase not configured");
        }

        const { fileName, fileType } = input;
        
        // Generate a unique file name to prevent conflicts
        const uniqueFileName = `${Date.now()}-${fileName}`;
        
        // Create a pre-signed URL for uploading to the "seed-packets" bucket
        const { data, error } = await supabase.storage
          .from("seed-packets")
          .createSignedUploadUrl(uniqueFileName, {
            expiresIn: 300, // 5 minutes
          });

        if (error) {
          throw new Error(`Failed to create upload URL: ${error.message}`);
        }

        return {
          uploadUrl: data.signedUrl,
          filePath: uniqueFileName,
          publicUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/seed-packets/${uniqueFileName}`,
        };
      } catch (error) {
        console.error("Error creating upload URL:", error);
        throw new Error("Failed to create upload URL");
      }
    }),

  processSeedPacketImage: publicProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { imageUrl } = input;
        
        console.log("Starting OCR processing for:", imageUrl);
        
        // For now, return mock data since Tesseract.js requires server-side setup
        // TODO: Implement real OCR processing
        const mockData = {
          rawText: "Sample seed packet text extracted via OCR",
          parsedData: {
            plantName: "Tomato",
            variety: "Roma",
            daysToGermination: "7-14",
            sowingDepth: "1/4",
            spacing: "18",
            sunExposure: "full sun",
            confidence: 85,
          },
        };
        
        console.log("OCR completed. Mock data:", mockData);
        
        return mockData;
      } catch (error) {
        console.error("Error processing image with OCR:", error);
        throw new Error("Failed to process image with OCR");
      }
    }),
});

export type AppRouter = typeof appRouter;
