import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Founder from "@/models/Founder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveFounders, invalidateFoundersCache } from "@/lib/foundersCache";

// Opt into per-request dynamic rendering only — allows Cache-Control to be respected by CDN & browser
export const dynamic = "force-dynamic";

// GET founders with backend pagination (16 per page by default) and search
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "16", 10));
    const search = searchParams.get("search")?.trim() || "";
    const all = searchParams.get("all") === "true";

    // Retrieve active founders from in-memory cache (sub-millisecond when warm)
    const allFounders = await getActiveFounders();

    let filtered = allFounders;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filtered = allFounders.filter(
        (f) => regex.test(f.name) || regex.test(f.company) || regex.test(f.role)
      );
    }

    // If all=true requested explicitly, return all filtered/active founders
    if (all) {
      const response = NextResponse.json({
        success: true,
        data: filtered,
        pagination: {
          page: 1,
          limit: filtered.length,
          total: filtered.length,
          totalPages: 1,
          hasMore: false,
        },
      });
      response.headers.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
      return response;
    }

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paginatedFounders = filtered.slice(skip, skip + limit);
    const hasMore = skip + paginatedFounders.length < total;

    const response = NextResponse.json({
      success: true,
      data: paginatedFounders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore,
      },
    });

    // Cache public paginated data: 60s browser cache, 300s CDN cache, background revalidation
    response.headers.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
    return response;
  } catch (error: any) {
    console.error("Error in GET /api/founders:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch founders" },
      { status: 500 }
    );
  }
}

// POST create founder (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const count = await Founder.countDocuments();
    const founder = await Founder.create({ ...body, order: count + 1 });
    invalidateFoundersCache();
    return NextResponse.json({ success: true, data: founder }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/founders:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create founder" },
      { status: 500 }
    );
  }
}