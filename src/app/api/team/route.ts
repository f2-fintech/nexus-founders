import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const defaultTeam = [
  {
    name: "Amit Negi",
    designation: "Video Editor",
    description: "Transforms ideas, events, and stories into captivating videos that engage audiences, strengthen the Nexus Founders brand, and leave a lasting impact.",
    photo: "https://nexusfounders.com/wp-content/uploads/2026/08/amit.jpg_cropped-300x300.jpeg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/feed/",
      email: "mailto:amit8445329604@gmail.com",
    },
    order: 0,
  },
  {
    name: "Bipin Kumar Baitha",
    designation: "Digital Marketing & Portfolio Manager",
    description: "Drives the digital growth of Nexus Founders by turning strategy into reach—making sure the right founders discover, join, and engage with our community.",
    photo: "https://nexusfounders.com/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-1.12.31-PM-1.jpeg",
    socialLinks: {
      linkedin: "http://linkedin.com/in/bipinkumarbaitha-mba",
      instagram: "https://www.instagram.com/wakeup_weepin/",
    },
    order: 1,
  },
  {
    name: "Manisha Panwar",
    designation: "Graphic Designer",
    description: "Brings the visual identity of Nexus Founders to life, transforming ideas and stories into impactful designs that inspire, engage, and build trust.",
    photo: "https://nexusfounders.com/wp-content/uploads/2026/08/Manisha_Panwar_cropped-1-300x300.png",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/manisha-panwar-67718535a",
      email: "mailto:Manishapanwarpanwar007@gmail.com",
    },
    order: 2,
  },
  {
    name: "Isha Rawat",
    designation: "Social Media & UI/UX Designer",
    description: "Brings the Nexus Founders brand to life across social media and digital products, combining creative visuals with intuitive experiences.",
    photo: "https://nexusfounders.com/wp-content/uploads/2026/08/isha.jpg_cropped-300x300.jpeg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/isha-rawat26/",
      email: "mailto:ishaarawat.07@gmail.com",
    },
    order: 3,
  },
];

// GET: List all team members (auto-seeds default 4 if empty)
export async function GET() {
  try {
    await connectDB();
    let members = await TeamMember.find().sort({ order: 1, createdAt: 1 }).lean();

    if (members.length === 0) {
      await TeamMember.insertMany(defaultTeam);
      members = await TeamMember.find().sort({ order: 1, createdAt: 1 }).lean();
    }

    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    console.error("GET /api/team error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to fetch team members" }, { status: 500 });
  }
}

// POST: Add new team member (Admin protected)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const { name, designation, description, photo, socialLinks, order } = body;

    if (!name?.trim() || !designation?.trim()) {
      return NextResponse.json({ success: false, error: "Name and designation are required" }, { status: 400 });
    }

    const member = await TeamMember.create({
      name: name.trim(),
      designation: designation.trim(),
      description: description?.trim() || "",
      photo: photo?.trim() || "/images/avatar-placeholder.webp",
      socialLinks: socialLinks || {},
      order: typeof order === "number" ? order : 0,
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/team error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to create team member" }, { status: 500 });
  }
}
