import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EventRegistration from "@/models/EventRegistration";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST: Register for community / event
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, contactNo, email, companyName, designation, eventEdition } = body;

    if (!name?.trim() || !contactNo?.trim() || !email?.trim() || !companyName?.trim() || !designation?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please fill out all required fields." },
        { status: 400 }
      );
    }

    const registration = await EventRegistration.create({
      name: name.trim(),
      contactNo: contactNo.trim(),
      email: email.trim(),
      companyName: companyName.trim(),
      designation: designation.trim(),
      eventEdition: eventEdition || "Nexus Founders Community Event",
    });

    return NextResponse.json({ success: true, data: registration }, { status: 201 });
  } catch (error: any) {
    console.error("Event registration error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to register for event" },
      { status: 500 }
    );
  }
}

// GET: List all event registrations (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const list = await EventRegistration.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
