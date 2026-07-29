import { adminStorage } from "@/lib/firebase/admin";
import { v4 as uuidv4 } from "uuid";
import type { IHeroAssetProvider, HeroAssetRequest } from "../heroAssetProvider";
import type { HeroAsset } from "../types";

import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiImageProvider implements IHeroAssetProvider {
  readonly name = "gemini_image";

  private async fetchImageAsBase64(url: string): Promise<{ mimeType: string, data: string } | null> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const data = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/png';
      return { mimeType, data };
    } catch (error) {
      console.warn("[GeminiImageProvider] Failed to fetch reference image", error);
      return null;
    }
  }

  async provide(request: HeroAssetRequest): Promise<HeroAsset> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const genAI = new GoogleGenerativeAI(apiKey);
    let retries = 2;
    let lastError = null;

    while (retries >= 0) {
      try {
        const promptText = `You are a world-class Art Director designing a highly premium, professional marketing graphic for social media.
        You must design a complete, visually stunning image that integrates the following text seamlessly into the design.
        Headline: "${request.headline}"
        Subhead: "${request.subhead || ''}"
        CTA: "${request.cta || ''}"
        Brand Name: "${request.brandName || ''}"
        
        Visual Concept: ${(request as any).visualConcept || 'A highly premium, realistic professional setting'}. 
        Mood: ${request.mood}. 
        Style: ${request.style}. 
        Brand Colors: ${request.colors.join(", ")}.
        
        CRITICAL INSTRUCTIONS:
        1. The text must be highly legible and perfectly integrated into the environment or UI elements.
        2. ${ (request as any).antiCliche ? `AVOID THESE CLICHES AT ALL COSTS: ${ (request as any).antiCliche }` : 'DO NOT use cheap sci-fi metaphors like glowing 3D spheres, floating nodes, or generic futuristic elements.' }
        3. Do not just draw an isolated object on a plain background. Create a rich, realistic, human-centric or premium UI scene that visualizes the Headline's message.
        4. The overall design must look like it was created by a top-tier design agency.`;

        const parts: any[] = [{ text: promptText }];

        // Handle reference image by extracting its style FIRST, without passing the pixel data to the image generator
        let extractedStyle = "";
        if (request.referenceImageUrl) {
          const refImage = await this.fetchImageAsBase64(request.referenceImageUrl);
          if (refImage) {
            console.log("[GeminiImageProvider] Extracting style from reference image using Gemini 2.5 Flash...");
            const visionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const visionPrompt = `You are a world-class Art Director. Analyze this reference image and write an extremely detailed description of its visual aesthetic.
            Describe the lighting, mood, color palette, composition, camera angle, and structural layout.
            CRITICAL RULE: DO NOT mention any text, brand names, logos, UI buttons, or phone numbers present in the image. We only want the artistic and structural framework.`;
            
            try {
              const visionResult = await visionModel.generateContent([
                visionPrompt,
                { inlineData: { data: refImage.data, mimeType: refImage.mimeType } }
              ]);
              
              extractedStyle = visionResult.response.text().trim();
              console.log("[GeminiImageProvider] Extracted Style:", extractedStyle);
              
              parts.push({ 
                text: `CRITICAL DESIGN INSPIRATION (Must Follow): 
                Design the image using EXACTLY this aesthetic, lighting, and layout structure:
                """
                ${extractedStyle}
                """
                
                However, the final design must be completely original, feature NO competitor branding or weird text blobs, and perfectly fit OUR headline and brand name ("${request.brandName}").`
              });
            } catch (visionError) {
              console.warn("[GeminiImageProvider] Vision extraction failed, proceeding without reference style.", visionError);
            }
          }
        }

        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash-image",
        });

        // Use the new generateContent API with IMAGE response modality
        const result = await model.generateContent({
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseModalities: ["IMAGE"],
          }
        } as any);

        // The image is returned as base64 in the response
        // Wait, the SDK might return it in inlineData or similar. Let's parse it based on expected format.
        // If it's standard, it might be in candidates[0].content.parts[0].inlineData
        const candidate = result.response.candidates?.[0];
        const inlineData = candidate?.content?.parts?.[0]?.inlineData;
        
        if (!inlineData || !inlineData.data) {
          throw new Error("No image data returned from Gemini.");
        }

        const base64Image = inlineData.data;
        
        // Try to upload to Firebase Storage, fallback to local if bucket doesn't exist
        let downloadUrl = '';
        try {
          const bucket = adminStorage.bucket();
          const fileName = `generated/${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
          const file = bucket.file(fileName);
          
          await file.save(Buffer.from(base64Image, 'base64'), {
            metadata: {
              contentType: 'image/png',
            }
          });
          
          // Make public
          await file.makePublic();
          downloadUrl = file.publicUrl();
        } catch (storageError) {
          console.warn('[GeminiImageProvider] Firebase Storage upload failed, falling back to local /public/uploads directory:', storageError);
          const fs = require('fs');
          const path = require('path');
          const crypto = require('crypto');
          
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          const fileName = `ai_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.png`;
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, Buffer.from(base64Image, 'base64'));
          
          // Always use localhost for the OG renderer — Localtunnel blocks direct image requests
          downloadUrl = `http://localhost:3000/uploads/${fileName}`;
        }
        
        console.log(`[GeminiImageProvider] Image generated and saved at: ${downloadUrl}`);
        
        return {
          type: "ai_image",
          provider: "gemini_image",
          data: downloadUrl,
          width: request.width,
          height: request.height
        };

      } catch (error: any) {
        lastError = error;
        retries--;
        if (retries >= 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    throw new Error(`Gemini Image generation failed after retries: ${lastError?.message}`);
  }
}
