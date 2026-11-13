import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(currentUserId).select("-password").lean();
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (err: any) {
    console.error("Get banker profile error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      institutionType,
      bankName,
      designation,
      experience,
      department,
      city,
      phone,
      ticketSizeMin,
      ticketSizeMax,
      bio,
      linkedinUrl,
    } = body;

    const user = await User.findById(currentUserId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (name?.trim()) user.name = name.trim();
    if (!user.bankerProfile) {
      user.bankerProfile = {
        bankName: "",
        designation: "",
      };
    }

    if (institutionType !== undefined) user.bankerProfile.institutionType = institutionType.trim();
    if (experience !== undefined) user.bankerProfile.experience = experience.trim();
    if (bankName !== undefined) user.bankerProfile.bankName = bankName.trim();
    if (designation !== undefined) user.bankerProfile.designation = designation.trim();
    if (department !== undefined) user.bankerProfile.department = department.trim();
    if (city !== undefined) user.bankerProfile.city = city.trim();
    if (phone !== undefined) user.bankerProfile.phone = phone.trim();
    if (ticketSizeMin !== undefined) user.bankerProfile.ticketSizeMin = ticketSizeMin.trim();
    if (ticketSizeMax !== undefined) user.bankerProfile.ticketSizeMax = ticketSizeMax.trim();
    if (bio !== undefined) user.bankerProfile.bio = bio.trim();
    if (linkedinUrl !== undefined) user.bankerProfile.linkedinUrl = linkedinUrl.trim();

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        bankerProfile: user.bankerProfile,
      },
    });
  } catch (err: any) {
    console.error("Update banker profile error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
