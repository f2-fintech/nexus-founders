import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import BankerConnection from "@/models/BankerConnection";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const [receivedRequests, sentRequests, acceptedConnections] = await Promise.all([
      BankerConnection.find({ recipientId: currentUserId, status: "pending" })
        .populate("requesterId", "name email bankerProfile role")
        .sort({ createdAt: -1 })
        .lean(),
      BankerConnection.find({ requesterId: currentUserId, status: "pending" })
        .populate("recipientId", "name email bankerProfile role")
        .sort({ createdAt: -1 })
        .lean(),
      BankerConnection.find({
        $or: [{ requesterId: currentUserId }, { recipientId: currentUserId }],
        status: "accepted",
      })
        .populate("requesterId", "name email bankerProfile role")
        .populate("recipientId", "name email bankerProfile role")
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        receivedRequests,
        sentRequests,
        acceptedConnections,
      },
    });
  } catch (err: any) {
    console.error("Fetch connections error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Please log in first" }, { status: 401 });
    }

    const { recipientId, introMessage } = await req.json();
    if (!recipientId) {
      return NextResponse.json({ success: false, error: "Target banker is required" }, { status: 400 });
    }

    if (currentUserId === recipientId) {
      return NextResponse.json({ success: false, error: "Cannot connect with yourself" }, { status: 400 });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return NextResponse.json({ success: false, error: "Banker not found" }, { status: 404 });
    }

    // Check if a connection already exists
    const existing = await BankerConnection.findOne({
      $or: [
        { requesterId: currentUserId, recipientId },
        { requesterId: recipientId, recipientId: currentUserId },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        return NextResponse.json({ success: false, error: "You are already connected" }, { status: 400 });
      }
      if (existing.status === "pending") {
        return NextResponse.json({ success: false, error: "A connection request is already pending" }, { status: 400 });
      }
      // If rejected, allow re-request
      existing.status = "pending";
      existing.requesterId = currentUserId;
      existing.recipientId = recipientId;
      existing.introMessage = introMessage?.trim() || "";
      await existing.save();
      return NextResponse.json({ success: true, message: "Connection request re-sent!", data: existing });
    }

    const connection = await BankerConnection.create({
      requesterId: currentUserId,
      recipientId,
      status: "pending",
      introMessage: introMessage?.trim() || "",
    });

    return NextResponse.json({
      success: true,
      message: "Connection request sent successfully!",
      data: connection,
    });
  } catch (err: any) {
    console.error("Create connection error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send connection request" },
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
      return NextResponse.json({ success: false, error: "Please log in first" }, { status: 401 });
    }

    const { connectionId, action } = await req.json();
    if (!connectionId || !["accept", "reject", "cancel"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid action or missing connectionId" }, { status: 400 });
    }

    const connection = await BankerConnection.findById(connectionId);
    if (!connection) {
      return NextResponse.json({ success: false, error: "Connection request not found" }, { status: 404 });
    }

    if (action === "accept") {
      if (connection.recipientId.toString() !== currentUserId) {
        return NextResponse.json({ success: false, error: "Only the recipient can accept" }, { status: 403 });
      }
      connection.status = "accepted";
      await connection.save();
      return NextResponse.json({ success: true, message: "Connection accepted! You can now chat in real-time." });
    }

    if (action === "reject") {
      if (connection.recipientId.toString() !== currentUserId) {
        return NextResponse.json({ success: false, error: "Only the recipient can decline" }, { status: 403 });
      }
      connection.status = "rejected";
      await connection.save();
      return NextResponse.json({ success: true, message: "Connection request declined." });
    }

    if (action === "cancel") {
      if (connection.requesterId.toString() !== currentUserId) {
        return NextResponse.json({ success: false, error: "Only the requester can cancel" }, { status: 403 });
      }
      await BankerConnection.findByIdAndDelete(connectionId);
      return NextResponse.json({ success: true, message: "Connection request cancelled." });
    }

    return NextResponse.json({ success: false, error: "Unhandled action" }, { status: 400 });
  } catch (err: any) {
    console.error("Update connection error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update connection" },
      { status: 500 }
    );
  }
}
