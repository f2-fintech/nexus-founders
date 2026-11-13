import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import BankerMessage from "@/models/BankerMessage";
import BankerConnection from "@/models/BankerConnection";
import User from "@/models/User";

function getConversationId(userA: string, userB: string) {
  return [userA, userB].sort().join("_");
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("withUserId");

    if (!targetUserId) {
      // Return conversations list with last message & unread count
      const messages = await BankerMessage.find({
        $or: [{ senderId: currentUserId }, { recipientId: currentUserId }],
      })
        .sort({ createdAt: -1 })
        .lean();

      const conversationsMap = new Map<string, any>();
      for (const msg of messages) {
        const otherId =
          msg.senderId.toString() === currentUserId
            ? msg.recipientId.toString()
            : msg.senderId.toString();

        if (!conversationsMap.has(otherId)) {
          conversationsMap.set(otherId, {
            otherUserId: otherId,
            lastMessage: msg.content,
            lastMessageAt: msg.createdAt,
            unreadCount: 0,
          });
        }
        if (msg.recipientId.toString() === currentUserId && !msg.read) {
          const conv = conversationsMap.get(otherId);
          conv.unreadCount += 1;
        }
      }

      return NextResponse.json({
        success: true,
        conversations: Array.from(conversationsMap.values()),
      });
    }

    const conversationId = getConversationId(currentUserId, targetUserId);

    // Fetch messages for this conversation
    const messages = await BankerMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    // Mark unread messages sent to current user as read
    await BankerMessage.updateMany(
      { conversationId, recipientId: currentUserId, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({
      success: true,
      data: messages,
      conversationId,
    });
  } catch (err: any) {
    console.error("Fetch messages error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch messages" },
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
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, content } = await req.json();
    if (!recipientId || !content?.trim()) {
      return NextResponse.json({ success: false, error: "Recipient and message content are required" }, { status: 400 });
    }

    // Check that recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return NextResponse.json({ success: false, error: "Recipient banker not found" }, { status: 404 });
    }

    const conversationId = getConversationId(currentUserId, recipientId);

    const message = await BankerMessage.create({
      conversationId,
      senderId: currentUserId,
      recipientId,
      content: content.trim(),
      read: false,
    });

    return NextResponse.json(
      {
        success: true,
        data: message,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Post message error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
