import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save locally
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const extension = file.name.split(".").pop() || "png";
    const filename = `ref_${Date.now()}_${uuidv4().split('-')[0]}.${extension}`;
    const filePath = join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const baseUrl = process.env.NODE_ENV === "development" 
      ? "http://localhost:3000" 
      : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

    const url = `${baseUrl}/uploads/${filename}`;

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error("[Upload API Error]", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
