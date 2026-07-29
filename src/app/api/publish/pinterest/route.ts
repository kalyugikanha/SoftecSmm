/**
 * Pinterest Publishing API Route
 * Posts approved content with AI-generated images to Pinterest boards
 */
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

const PINTEREST_API = "https://api.pinterest.com/v5";

export async function POST(req: NextRequest) {
  try {
    const { ideaId } = await req.json();

    if (!process.env.PINTEREST_ACCESS_TOKEN) {
      return NextResponse.json({ error: "PINTEREST_ACCESS_TOKEN not configured" }, { status: 500 });
    }

    // Fetch the idea from Firestore
    const ideaSnap = await adminDb.collection("ideas").doc(ideaId).get();
    if (!ideaSnap.exists) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const idea = ideaSnap.data()!;

    if (!idea.imageUrl) {
      return NextResponse.json({ error: "No image generated yet. Generate image first." }, { status: 400 });
    }

    // Fetch brand for board info
    let boardId = process.env.PINTEREST_BOARD_ID || "";
    let brandName = "Softecai";
    if (idea.brandId) {
      const brandsSnap = await adminDb.collection("brands")
        .where("brandKey", "==", idea.brandId).limit(1).get();
      if (!brandsSnap.empty) {
        brandName = brandsSnap.docs[0].data().name || "Softecai";
      }
    }

    // Build pin description
    const hashtagStr = (idea.hashtags || [])
      .slice(0, 20)
      .map((h: string) => `#${h.replace(/^#/, "")}`)
      .join(" ");

    const description = [
      idea.hook,
      "",
      idea.body,
      "",
      idea.cta,
      "",
      hashtagStr,
    ].filter((l) => l !== undefined).join("\n");

    // Create Pinterest Pin
    const pinPayload = {
      title: idea.title,
      description: description.slice(0, 800), // Pinterest max
      link: process.env.NEXT_PUBLIC_WEBSITE_URL || "https://softecai.com",
      media_source: {
        source_type: "image_url",
        url: idea.imageUrl,
      },
      ...(boardId ? { board_id: boardId } : {}),
    };

    console.log("[Pinterest] Creating pin:", idea.title);

    const pinRes = await fetch(`${PINTEREST_API}/pins`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pinPayload),
    });

    const pinData = await pinRes.json();
    console.log("[Pinterest] Response:", JSON.stringify(pinData));

    if (!pinRes.ok) {
      throw new Error(pinData.message || `Pinterest API error: ${pinRes.status}`);
    }

    // Update Firestore
    await adminDb.collection("ideas").doc(ideaId).update({
      status: "published",
      publishedAt: new Date().toISOString(),
      publishedTo: "pinterest",
      pinterestPinId: pinData.id,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      pinId: pinData.id,
      pinUrl: `https://pinterest.com/pin/${pinData.id}`,
    });
  } catch (error: any) {
    console.error("[Pinterest Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - fetch user's Pinterest boards
export async function GET() {
  if (!process.env.PINTEREST_ACCESS_TOKEN) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const res = await fetch(`${PINTEREST_API}/boards?page_size=25`, {
    headers: {
      Authorization: `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`,
    },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
