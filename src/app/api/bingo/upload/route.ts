import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadBufferToS3 } from "@/lib/s3";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "nexus-founders/bingo-cards";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Limit to 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image file exceeds 15 MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // Compress & optimize visiting card photo to high-clarity WebP
    const webpBuffer = await sharp(inputBuffer)
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const rawName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "card";
    const sanitized = rawName.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 30);
    const fileName = `${Date.now()}_${sanitized}.webp`;

    let fileUrl: string;

    try {
      // Primary: upload to AWS S3 bucket
      fileUrl = await uploadBufferToS3(webpBuffer, folder, fileName, "image/webp");
      console.log("Bingo card successfully uploaded to S3:", fileUrl);
    } catch (s3Err: any) {
      console.warn("S3 upload failed, falling back to base64 encoding:", s3Err?.message);
      // Fallback: encode as data URI so game never halts
      fileUrl = `data:image/webp;base64,${webpBuffer.toString("base64")}`;
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (error: any) {
    console.error("Bingo upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to upload visiting card image" },
      { status: 500 }
    );
  }
}
