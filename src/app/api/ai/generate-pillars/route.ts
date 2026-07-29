import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const { brandId } = await req.json();

    // Fetch brand data
    const brandsSnap = await adminDb
      .collection("brands")
      .where("brandKey", "==", brandId)
      .limit(1)
      .get();

    const brand = brandsSnap.empty ? null : brandsSnap.docs[0].data();
    const brandName = brand?.name || "Softecai";
    const industry = brand?.industry || "Technology / AI";
    const tone = brand?.tone || "Professional";
    const audience = brand?.targetAudience || "tech-savvy businesses";
    const usp = brand?.usp || "AI-driven software solutions";

    const prompt = `You are a social media content strategist.

Create exactly 5 content pillars for a brand with these details:
- Brand Name: ${brandName}
- Industry: ${industry}
- Brand Tone: ${tone}
- Target Audience: ${audience}
- USP: ${usp}

Return ONLY a valid JSON array. No explanation, no markdown. Format:
[
  {
    "name": "Pillar Name",
    "description": "2-3 sentence description of what content goes here",
    "emoji": "relevant emoji",
    "percentage": 20,
    "examples": ["example post idea 1", "example post idea 2", "example post idea 3"]
  }
]

The percentages must add up to exactly 100. Make them relevant and specific to ${brandName}.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("AI did not return valid JSON");
    }
    const pillars = JSON.parse(jsonMatch[0]);

    // Delete existing pillars for this brand first
    const existing = await adminDb.collection("pillars").where("brandId", "==", brandId).get();
    const deletePromises = existing.docs.map((d) => d.ref.delete());
    await Promise.all(deletePromises);

    // Save new pillars to Firestore
    const batch = adminDb.batch();
    for (const pillar of pillars) {
      const ref = adminDb.collection("pillars").doc();
      batch.set(ref, {
        ...pillar,
        brandId,
        aiGenerated: true,
        createdAt: new Date(),
      });
    }
    await batch.commit();

    return NextResponse.json({ success: true, count: pillars.length, pillars });
  } catch (error) {
    console.error("[AI Pillars Error]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
