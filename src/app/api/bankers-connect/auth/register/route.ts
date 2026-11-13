import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      name,
      email,
      password,
      institutionType,
      bankName,
      designation,
      experience,
      department,
      city,
      country,
      phone,
      ticketSizeMin,
      ticketSizeMax,
      bio,
      linkedinUrl,
    } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: "Full Name is required" }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ success: false, error: "Official Email is required" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }
    if (!bankName?.trim()) {
      return NextResponse.json({ success: false, error: "Institution / Bank name is required" }, { status: 400 });
    }
    if (!designation?.trim()) {
      return NextResponse.json({ success: false, error: "Designation / Title is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const newBanker = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password, // Password hashing handled in UserSchema pre-save hook
      role: "banker",
      bankerProfile: {
        bankName: bankName.trim(),
        designation: designation.trim(),
        institutionType: institutionType?.trim() || "Bank",
        experience: experience?.trim() || "",
        department: department?.trim() || "Corporate & SME Banking",
        city: city?.trim() || "",
        country: country?.trim() || "India",
        phone: phone?.trim() || "",
        ticketSizeMin: ticketSizeMin?.trim() || "",
        ticketSizeMax: ticketSizeMax?.trim() || "",
        bio: bio?.trim() || "",
        linkedinUrl: linkedinUrl?.trim() || "",
        isVerified: true,
        onlineStatus: true,
        lastSeen: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Banker account registered successfully",
        user: {
          id: newBanker._id.toString(),
          name: newBanker.name,
          email: newBanker.email,
          role: newBanker.role,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Banker registration error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to register banker account" },
      { status: 500 }
    );
  }
}
