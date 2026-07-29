/**
 * AI Image Generation API Route
 * Uses Pollinations.ai (Free, no API key needed) to generate social media graphics
 * Uploads to Firebase Storage and returns the URL
 */
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase/admin";

// Platform-specific image dimensions and style guidelines
const PLATFORM_IMAGE_SPECS: Record<string, {
  width: number;
  height: number;
  style: string;
}> = {
  instagram: {
    width: 1024,
    height: 1024,
    style: "Square format. Bold, vibrant, eye-catching. Clean composition, strong focal point, lifestyle feel, high contrast. Text-free image.",
  },
  facebook: {
    width: 1200,
    height: 630,
    style: "Landscape format. Clean, professional, shareable. Clear subject, good lighting, brand colors. Text-free image.",
  },
  linkedin: {
    width: 1200,
    height: 627,
    style: "Landscape format. Corporate, premium, professional. Business context, modern office or tech environment, sophisticated color palette. Text-free image.",
  },
  pinterest: {
    width: 1000,
    height: 1500,
    style: "Tall vertical format. Beautiful, aspirational, visually rich. Lifestyle, creative, highly shareable. Inspirational mood. Text-free image.",
  },
  youtube: {
    width: 1280,
    height: 720,
    style: "Landscape format. Bold, dramatic, high energy. Strong contrast, vibrant colors. Dynamic composition. Text-free image.",
  },
  whatsapp: {
    width: 1024,
    height: 1024,
    style: "Square format. Clean, friendly, warm. Simple and direct composition. Relatable and approachable. Text-free image.",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { ideaId, platform, brandName, title, imagePrompt, brandColors } = await req.json();

    if (!ideaId || !platform) {
      return NextResponse.json({ error: "ideaId and platform are required" }, { status: 400 });
    }

    const spec = PLATFORM_IMAGE_SPECS[platform] || PLATFORM_IMAGE_SPECS.instagram;
    const colorHint = brandColors?.length
      ? `Brand color palette: ${brandColors.join(", ")}.`
      : "Use a modern, professional color palette with deep red/crimson accents.";

    // Build enhanced prompt for premium quality
    const fullPrompt = [
      `A stunning, ultra-premium, high-end social media graphic for ${brandName}.`,
      `Concept: "${title}".`,
      imagePrompt ? `Visual direction: ${imagePrompt}` : "",
      spec.style,
      colorHint,
      "Masterpiece, 8k resolution, photorealistic, highly detailed, professional studio lighting, sleek and modern aesthetic. Absolutely NO TEXT, NO LOGOS, NO WATERMARKS. Visually breathtaking and ready for a top-tier marketing campaign."
    ].filter(Boolean).join(" ");

    console.log(`[ImageGen] Generating SaaS infographic for ${platform}...`);

    // Use our new dynamic OG image generator! No more AI gibberish text.
    // In production, this would use process.env.NEXT_PUBLIC_APP_URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    // Build the dynamic URL
    const ogUrl = new URL(`${baseUrl}/api/og`);
    ogUrl.searchParams.set("title", title);
    ogUrl.searchParams.set("platform", platform);
    ogUrl.searchParams.set("brand", brandName);
    ogUrl.searchParams.set("t", Date.now().toString()); // Cache buster

    const finalImageUrl = ogUrl.toString();

    // Update the idea in Firestore with the direct image URL
    await adminDb.collection("ideas").doc(ideaId).update({
      imageUrl: finalImageUrl,
      imageGeneratedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`[ImageGen] ✅ Infographic generated: ${finalImageUrl}`);

    return NextResponse.json({
      success: true,
      imageUrl: finalImageUrl,
      platform,
      size: `${spec.width}x${spec.height}`,
    });
  } catch (error: any) {
    console.error("[ImageGen Error]", error);
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}
