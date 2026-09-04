import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Founder from "@/models/Founder";
import { getCachedPhoto, setCachedPhoto } from "@/lib/photoCache";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check memory cache first (instant sub-millisecond return)
    const cached = getCachedPhoto(id);
    if (cached) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
        },
      });
    }

    await connectDB();
    const founder = await Founder.findById(id).select("photo").lean();

    if (!founder || !founder.photo) {
      return NextResponse.redirect(new URL("/images/logo.webp", req.url), 307);
    }

    const photo = founder.photo;

    // External URL: redirect directly
    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return NextResponse.redirect(photo, 307);
    }

    // Data URL: "data:image/webp;base64,..."
    if (photo.startsWith("data:")) {
      const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");

        // Cache in memory
        setCachedPhoto(id, { buffer, contentType });

        return new NextResponse(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
          },
        });
      }
    }

    return NextResponse.redirect(new URL("/images/logo.webp", req.url), 307);
  } catch (error: any) {
    return NextResponse.redirect(new URL("/images/logo.webp", req.url), 307);
  }
}
