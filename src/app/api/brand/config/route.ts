import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId") || "softecai";

    const brandsSnap = await adminDb
      .collection("brands")
      .where("brandKey", "==", brandId)
      .limit(1)
      .get();
      
    const brand = brandsSnap.empty ? null : brandsSnap.docs[0].data();

    // Determine actual connected platforms based on API credentials
    const connectedPlatforms: string[] = [];

    if (process.env.PINTEREST_ACCESS_TOKEN) {
      connectedPlatforms.push("pinterest");
    }

    // Add checks for other platforms when they are implemented
    // if (process.env.META_ACCESS_TOKEN) connectedPlatforms.push("instagram", "facebook");
    // if (process.env.LINKEDIN_ACCESS_TOKEN) connectedPlatforms.push("linkedin");

    return NextResponse.json({
      success: true,
      brand,
      connectedPlatforms
    });
  } catch (error) {
    console.error("[Config API Error]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
