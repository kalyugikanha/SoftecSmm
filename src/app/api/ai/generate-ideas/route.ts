import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "@/lib/firebase/admin";

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
    const { brandId, platform, pillarId, count = 3 } = await req.json();

    // Fetch brand
    const brandsSnap = await adminDb
      .collection("brands")
      .where("brandKey", "==", brandId)
      .limit(1)
      .get();
    const brand = brandsSnap.empty ? {} : brandsSnap.docs[0].data();

    // Determine connected platforms based on API credentials
    const connectedPlatforms: string[] = [];
    if (process.env.PINTEREST_ACCESS_TOKEN) {
      connectedPlatforms.push("pinterest");
    }

    if (!connectedPlatforms.includes(platform)) {
      return NextResponse.json({ 
        error: `Platform '${platform}' is not connected. Missing API credentials.` 
      }, { status: 400 });
    }

    // Fetch pillar if specified
    let pillarContext = "";
    if (pillarId) {
      const pillarDoc = await adminDb.collection("pillars").doc(pillarId).get();
      if (pillarDoc.exists) {
        const pillar = pillarDoc.data()!;
        pillarContext = `Content Pillar: "${pillar.name}" — ${pillar.description}`;
      }
    }

    const platformGuide = PLATFORM_GUIDELINES[platform] || "General social media post";
    const brandName = brand.name || "Softecai";
    const tone = brand.tone || "Professional";
    const audience = brand.targetAudience || "businesses";
    const usp = brand.usp || "AI-driven solutions";

    const prompt = `You are an expert social media content creator for ${brandName}.

Brand Details:
- Industry: ${brand.industry || "Technology / AI"}
- Tone: ${tone}
- Target Audience: ${audience}
- USP: ${usp}
${pillarContext ? `- ${pillarContext}` : ""}

Platform: ${platformGuide}

Generate exactly ${count} unique, compelling post ideas for ${platform.toUpperCase()}.
Return ONLY a valid JSON array. No explanation. Format:

[
  {
    "title": "Short post title/concept",
    "hook": "The opening line that stops the scroll",
    "body": "The main content of the post (platform-appropriate length)",
    "cta": "Call to action",
    "hashtags": ["hashtag1", "hashtag2"],
    "suggestedImagePrompt": "Detailed prompt for AI image generation"
  }
]

Make each idea unique, on-brand, and genuinely valuable to the audience. Use current trends where applicable.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI did not return valid JSON");
    const ideas = JSON.parse(jsonMatch[0]);

    // Save to Firestore
    const batch = adminDb.batch();
    const savedIds: string[] = [];
    for (const idea of ideas) {
      const ref = adminDb.collection("ideas").doc();
      savedIds.push(ref.id);
      batch.set(ref, {
        ...idea,
        brandId,
        pillarId: pillarId || null,
        platform,
        status: "pending_approval",
        aiGenerated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await batch.commit();

    // Send Telegram approval cards (awaited so server doesn't cancel early)
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    console.log("[Telegram] Chat ID from env:", telegramChatId);
    if (telegramChatId && telegramChatId !== "PASTE_YOUR_TELEGRAM_CHAT_ID_HERE") {
      const { sendApprovalCard } = await import("@/lib/telegram");
      // Fetch pillar name if provided
      let pillarName = "General";
      if (pillarId) {
        try {
          const pillarSnap = await adminDb.collection("pillars").doc(pillarId).get();
          if (pillarSnap.exists) pillarName = pillarSnap.data()?.name || "General";
        } catch {}
      }
      console.log(`[Telegram] Sending ${ideas.length} approval cards to chat ${telegramChatId}`);
      try {
        const results = await Promise.all(
          ideas.map((idea: any, idx: number) =>
            sendApprovalCard(telegramChatId, {
              ideaId: savedIds[idx],
              platform,
              pillarName,
              pillarId: pillarId || "",
              brandId,
              title: idea.title || "Untitled",
              hook: idea.hook || "",
              body: idea.body || idea.caption || "",
              cta: idea.cta || "",
              hashtags: idea.hashtags || [],
              brandName: (brand as any)?.name || "Softecai",
            })
          )
        );
        console.log("[Telegram] Results:", JSON.stringify(results));
      } catch (telegramErr) {
        console.error("[Telegram] Send error:", telegramErr);
      }
    } else {
      console.warn("[Telegram] TELEGRAM_CHAT_ID not set, skipping notification");
    }

    return NextResponse.json({ success: true, ideas, ids: savedIds });
  } catch (error) {
    console.error("[AI Ideas Error]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
