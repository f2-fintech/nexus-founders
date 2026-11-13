import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import BankerConnection from "@/models/BankerConnection";

export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    // Fetch all bankers
    const bankers = await User.find({
      $or: [
        { role: { $in: ["banker", "admin"] } },
        { "bankerProfile.bankName": { $exists: true, $ne: "" } },
      ],
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // If logged in, fetch connection statuses
    let connections: any[] = [];
    if (currentUserId) {
      connections = await BankerConnection.find({
        $or: [{ requesterId: currentUserId }, { recipientId: currentUserId }],
      }).lean();
    }

    const connectionMap = new Map<string, { status: string; connectionId: string; introMessage?: string }>();
    connections.forEach((conn) => {
      const isRequester = conn.requesterId.toString() === currentUserId;
      const otherId = isRequester ? conn.recipientId.toString() : conn.requesterId.toString();

      if (conn.status === "accepted") {
        connectionMap.set(otherId, { status: "connected", connectionId: conn._id.toString() });
      } else if (conn.status === "pending") {
        connectionMap.set(otherId, {
          status: isRequester ? "pending_sent" : "pending_received",
          connectionId: conn._id.toString(),
          introMessage: conn.introMessage,
        });
      } else if (conn.status === "rejected") {
        connectionMap.set(otherId, { status: "rejected", connectionId: conn._id.toString() });
      }
    });

    const formattedBankers = bankers.map((b: any) => {
      const bId = b._id.toString();
      const connInfo = connectionMap.get(bId) || { status: "none", connectionId: "" };

      return {
        _id: bId,
        name: b.name,
        email: b.email,
        role: b.role,
        bankerProfile: {
          bankName: b.bankerProfile?.bankName || (b.role === "admin" ? "Nexus Core Bank" : "Partner Bank"),
          designation: b.bankerProfile?.designation || (b.role === "admin" ? "Executive Director" : "Banking Specialist"),
          institutionType: b.bankerProfile?.institutionType || "Bank",
          experience: b.bankerProfile?.experience || "",
          department: b.bankerProfile?.department || "Corporate & Startup Banking",
          city: b.bankerProfile?.city || "National",
          phone: b.bankerProfile?.phone || "",
          ticketSizeMin: b.bankerProfile?.ticketSizeMin || "₹25L",
          ticketSizeMax: b.bankerProfile?.ticketSizeMax || "₹50Cr",
          bio: b.bankerProfile?.bio || "Active in startup venture financing, debt structuring, and syndication.",
          linkedinUrl: b.bankerProfile?.linkedinUrl || "",
          isVerified: b.bankerProfile?.isVerified !== false,
          onlineStatus: b.bankerProfile?.onlineStatus ?? true,
        },
        connectionStatus: connInfo.status,
        connectionId: connInfo.connectionId,
        introMessage: connInfo.introMessage,
        isSelf: bId === currentUserId,
        createdAt: b.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedBankers,
      currentUserId: currentUserId || null,
    });
  } catch (err: any) {
    console.error("Fetch bankers error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch bankers" },
      { status: 500 }
    );
  }
}
