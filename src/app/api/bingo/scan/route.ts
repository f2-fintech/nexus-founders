import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { uploadBufferToS3 } from "@/lib/s3";
import { parseVisitingCardText } from "@/lib/visiting-card-parser";

export const dynamic = "force-dynamic";

const workerScriptPath = path.join(
  process.cwd(),
  "node_modules",
  "tesseract.js",
  "src",
  "worker-script",
  "node",
  "index.js"
);

async function performCardOcr(buffer: Buffer): Promise<string> {
  try {
    const options: Record<string, any> = {};
    if (fs.existsSync(workerScriptPath)) {
      options.workerPath = workerScriptPath;
    }

    const worker = await createWorker("eng", 1, options);
    try {
      const result = await worker.recognize(buffer);
      return result?.data?.text || "";
    } finally {
      await worker.terminate();
    }
  } catch (err) {
    console.warn("OCR recognition attempt error:", err);
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "nexus-founders/bingo-cards";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No visiting card image provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed for card scanning" },
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

    // 1. Prepare display & storage image: High-clarity WebP
    const webpBuffer = await sharp(inputBuffer)
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer();

    // 2. Prepare optimized image for OCR text extraction (grayscale + normalise contrast + sharpen)
    const ocrBuffer = await sharp(inputBuffer)
      .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
      .grayscale()
      .normalise()
      .sharpen()
      .png()
      .toBuffer();

    // 3. Upload image in parallel or sequence
    const rawName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "card";
    const sanitized = rawName.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 30);
    const fileName = `${Date.now()}_${sanitized}.webp`;

    let fileUrl: string;
    try {
      fileUrl = await uploadBufferToS3(webpBuffer, folder, fileName, "image/webp");
      console.log("Bingo card successfully uploaded to S3:", fileUrl);
    } catch (s3Err: any) {
      console.warn("S3 upload fallback to base64 data URI:", s3Err?.message);
      fileUrl = `data:image/webp;base64,${webpBuffer.toString("base64")}`;
    }

    // 4. Run Real OCR on the Visiting Card
    const rawOcrText = await performCardOcr(ocrBuffer);

    // 5. Parse extracted card text for Name, Company, Email, Phone
    const parsed = parseVisitingCardText(rawOcrText);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      isValidCard: parsed.isValidCard,
      contactName: parsed.contactName,
      contactCompany: parsed.contactCompany,
      email: parsed.email,
      phone: parsed.phone,
      designation: parsed.designation,
      rawText: rawOcrText.trim(),
    });
  } catch (error: any) {
    console.error("Bingo scan API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to scan visiting card" },
      { status: 500 }
    );
  }
}
