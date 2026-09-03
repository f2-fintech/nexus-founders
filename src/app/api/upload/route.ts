import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from "sharp";
import { uploadBufferToS3 } from "@/lib/s3";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Auth check — only admins can upload
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "nexus-founders/founders";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Validate it's an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Only image files are allowed" }, { status: 400 });
    }

    // Max 10 MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "File too large (max 10 MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // Convert and compress to optimized WebP buffer (max 800x800, quality 85)
    const webpBuffer = await sharp(inputBuffer)
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const rawName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "photo";
    const sanitized = rawName.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 30);
    const fileName = `${sanitized}.webp`;

    // Upload directly to AWS S3 bucket
    const s3Url = await uploadBufferToS3(webpBuffer, folder, fileName, "image/webp");
    console.log("Successfully uploaded to AWS S3:", s3Url);

    return NextResponse.json({ success: true, url: s3Url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
