/**
 * Single Idea Regeneration API
 * Called by Telegram bot when user clicks "🔄 New Idea" button
 * Generates ONE fresh idea for the specified platform and saves to Firestore
 */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "@/lib/firebase/admin";
import { sendApprovalCard } from "@/lib/telegram";

const PLATFORM_GUIDELINES: Record<string, string> = {
  instagram:
    "Instagram: Visual-first, engaging captions 150-200 chars, 15-20 hashtags, strong hook, emoji-friendly, Stories/Reels focus",
  facebook:
    "Facebook: Longer form okay (200-400 chars), community focused, shareable, 3-5 hashtags, conversational tone",
  linkedin:
    "LinkedIn: Professional, thought leadership, 300-600 chars, 3-5 hashtags, add value, B2B focus, no excessive emoji",
  pinterest:
    "Pinterest: Descriptive title + rich description 200-300 chars, 10-15 hashtags, discovery keywords, visual inspiration",
  youtube:
    "YouTube: Community post or short description, 100-200 chars, drive to video, 5-8 hashtags, include call to subscribe",
  whatsapp:
    "WhatsApp Community: Conversational, no hashtags, 100-150 chars, personal and direct, include value proposition",
};

export async function POST(req: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const { brandId, platform, pillarId, excludeTitle } = await req.json();

    if (!brandId || !platform) {
      return NextResponse.json(
        { error: "brandId and platform are required" },
        { status: 400 }
      );
    }

    // Fetch brand
    const brandsSnap = await adminDb
      .collection("brands")
      .where("brandKey", "==", brandId)
      .limit(1)
      .get();
    const brand = brandsSnap.empty ? {} : brandsSnap.docs[0].data();

    // Fetch pillar
    let pillarContext = "";
    let pillarName = "General";
    if (pillarId) {
      const pillarDoc = await adminDb.collection("pillars").doc(pillarId).get();
      if (pillarDoc.exists) {
        const pillar = pillarDoc.data()!;
        pillarContext = `Content Pillar: "${pillar.name}" — ${pillar.description}`;
        pillarName = pillar.name;
      }
    }

    const platformGuide =
      PLATFORM_GUIDELINES[platform] || "General social media post";
    const brandName = (brand as any).name || "Softecai";

    const prompt = `You are an expert social media content creator for ${brandName}.

Brand Details:
- Industry: ${(brand as any).industry || "Technology / AI"}
- Tone: ${(brand as any).tone || "Professional"}
- Target Audience: ${(brand as any).targetAudience || "businesses"}
- USP: ${(brand as any).usp || "AI-driven solutions"}
${pillarContext ? `\n${pillarContext}` : ""}

Platform Guidelines: ${platformGuide}

Generate exactly ONE fresh, unique post idea for ${platform}.
${excludeTitle ? `IMPORTANT: Do NOT create something similar to: "${excludeTitle}". Make it completely different angle.` : ""}

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "title": "Short descriptive title",
  "hook": "Opening line to grab attention (1-2 sentences)",
  "body": "Main caption content",
  "cta": "Call to action",
  "hashtags": ["tag1", "tag2"],
  "suggestedImagePrompt": "Detailed image generation prompt"
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON — handle both raw object and wrapped in array
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI did not return valid JSON");
    const idea = JSON.parse(jsonMatch[0]);

    // Save to Firestore
    const ref = adminDb.collection("ideas").doc();
    await ref.set({
      ...idea,
      brandId,
      pillarId: pillarId || null,
      platform,
      status: "pending_approval",
      aiGenerated: true,
      regenerated: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send new approval card to Telegram
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    if (telegramChatId) {
      await sendApprovalCard(telegramChatId, {
        ideaId: ref.id,
        platform,
        pillarName,
        title: idea.title || "Untitled",
        hook: idea.hook || "",
        body: idea.body || "",
        cta: idea.cta || "",
        hashtags: idea.hashtags || [],
        brandName,
      });
    }

    return NextResponse.json({ success: true, idea, id: ref.id });
  } catch (error) {
    console.error("[Regenerate Idea Error]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
