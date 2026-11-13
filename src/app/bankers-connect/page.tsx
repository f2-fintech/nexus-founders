"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConnectModal from "@/components/bankers/ConnectModal";
import EmailModal from "@/components/bankers/EmailModal";
import EmailChooserModal from "@/components/bankers/EmailChooserModal";
import { useBankerSocket } from "@/lib/useBankerSocket";
import {
  Building2,
  Users,
  MessageSquare,
  UserCheck,
  Search,
  Filter,
  Check,
  X,
  Mail,
  Send,
  Bell,
  BellRing,
  ShieldCheck,
  MapPin,
  Briefcase,
  Phone,
  Banknote,
  Sparkles,
  RefreshCw,
  LogOut,
  ExternalLink,
  Clock,
  CheckCheck,
  ArrowLeft,
  Info,
  Lock,
  Smile,
  FileText,
  ChevronRight,
} from "lucide-react";
import "./bankers-connect.css";

const INSTITUTION_TYPES = [
  "Bank",
  "NBFC",
  "Fintech",
  "Other financial institute",
];

const EXPERIENCE_OPTIONS = [
  "Less than 1 Year",
  "1 - 3 Years",
  "3 - 5 Years",
  "5 - 8 Years",
  "8 - 12 Years",
  "12 - 15 Years",
  "15+ Years",
];

interface BankerItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  bankerProfile: {
    bankName: string;
    designation: string;
    institutionType?: string;
    experience?: string;
    department?: string;
    city?: string;
    phone?: string;
    ticketSizeMin?: string;
    ticketSizeMax?: string;
    bio?: string;
    linkedinUrl?: string;
    isVerified?: boolean;
    onlineStatus?: boolean;
  };
  connectionStatus: "none" | "pending_sent" | "pending_received" | "connected" | "rejected";
  connectionId?: string;
  introMessage?: string;
  isSelf: boolean;
  createdAt: string;
}

export default function BankersConnectPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const currentUserId = (session?.user as any)?.id;
  const currentUserName = session?.user?.name || "Banker";
  const currentUserBank =
    (session?.user as any)?.bankerProfile?.bankName || "Partner Financial Institution";

  // Helper to generate direct mailto URL
  const getBankerMailtoUrl = (target?: { email?: string } | null) => {
    return target?.email ? `mailto:${target.email.trim()}` : "#";
  };

  // Navigation and active tab
  const [activeTab, setActiveTab] = useState<"discover" | "requests" | "chat" | "profile">("discover");

  // Data states
  const [bankers, setBankers] = useState<BankerItem[]>([]);
  const [loadingBankers, setLoadingBankers] = useState(true);
  const [connectionsData, setConnectionsData] = useState<{
    receivedRequests: any[];
    sentRequests: any[];
    acceptedConnections: any[];
  }>({
    receivedRequests: [],
    sentRequests: [],
    acceptedConnections: [],
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBankFilter, setSelectedBankFilter] = useState("all");

  // Active Chat States
  const [activeChatBanker, setActiveChatBanker] = useState<BankerItem | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [conversationsSummary, setConversationsSummary] = useState<any[]>([]);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showBankerInfoDrawer, setShowBankerInfoDrawer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Modals
  const [connectModalBanker, setConnectModalBanker] = useState<BankerItem | null>(null);
  const [emailModalBanker, setEmailModalBanker] = useState<BankerItem | null>(null);
  const [emailChooserBanker, setEmailChooserBanker] = useState<BankerItem | null>(null);

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    institutionType: "Bank",
    bankName: "",
    designation: "",
    experience: "3 - 5 Years",
    department: "",
    city: "",
    phone: "",
    ticketSizeMin: "",
    ticketSizeMax: "",
    bio: "",
    linkedinUrl: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Route protection
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/bankers-connect/login");
    }
  }, [sessionStatus, router]);

  // WebSocket Callbacks
  const handleIncomingMessage = useCallback(
    (message: any, sender: { id: string; name: string; bank: string }) => {
      // If chat is currently open with this sender, append message
      if (activeChatBanker && activeChatBanker._id === sender.id) {
        setChatMessages((prev) => [...prev, message]);
      }
      // Refresh conversations list summary
      fetchConversationsSummary();
    },
    [activeChatBanker]
  );

  const handleIncomingConnectionRequest = useCallback((data: any) => {
    fetchBankers();
    fetchConnections();
  }, []);

  const handleConnectionAccepted = useCallback((data: any) => {
    fetchBankers();
    fetchConnections();
  }, []);

  // Initialize WebSocket Hook
  const {
    isConnected: isWsConnected,
    onlineUsers,
    sendChatMessage,
    sendConnectionRequestNotification,
    sendConnectionAcceptedNotification,
    requestNotificationPermission,
  } = useBankerSocket(
    currentUserId,
    currentUserName,
    currentUserBank,
    handleIncomingMessage,
    handleIncomingConnectionRequest,
    handleConnectionAccepted
  );

  // Fetch all registered bankers
  const fetchBankers = useCallback(async () => {
    setLoadingBankers(true);
    try {
      const res = await fetch("/api/bankers-connect/bankers");
      const data = await res.json();
      if (data.success) {
        setBankers(data.data);
      }
    } catch (e) {
      console.error("Error loading bankers:", e);
    } finally {
      setLoadingBankers(false);
    }
  }, []);

  // Fetch connections data
  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/bankers-connect/connections");
      const data = await res.json();
      if (data.success) {
        setConnectionsData(data.data);
      }
    } catch (e) {
      console.error("Error loading connections:", e);
    }
  }, []);

  // Fetch conversations summary for unread counts
  const fetchConversationsSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/bankers-connect/messages");
      const data = await res.json();
      if (data.success) {
        setConversationsSummary(data.conversations || []);
      }
    } catch (e) {
      console.error("Error fetching conversations:", e);
    }
  }, []);

  // Load chat messages when activeChatBanker changes
  const loadChatMessages = useCallback(async (targetUserId: string) => {
    setLoadingChat(true);
    try {
      const res = await fetch(`/api/bankers-connect/messages?withUserId=${targetUserId}`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.data || []);
      }
    } catch (e) {
      console.error("Error loading chat messages:", e);
    } finally {
      setLoadingChat(false);
    }
  }, []);

  // Fetch profile for edit tab
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/bankers-connect/profile");
      const data = await res.json();
      if (data.success && data.data) {
        const u = data.data;
        setProfileForm({
          name: u.name || "",
          institutionType: u.bankerProfile?.institutionType || "Bank",
          bankName: u.bankerProfile?.bankName || "",
          designation: u.bankerProfile?.designation || "",
          experience: u.bankerProfile?.experience || "3 - 5 Years",
          department: u.bankerProfile?.department || "",
          city: u.bankerProfile?.city || "",
          phone: u.bankerProfile?.phone || "",
          ticketSizeMin: u.bankerProfile?.ticketSizeMin || "",
          ticketSizeMax: u.bankerProfile?.ticketSizeMax || "",
          bio: u.bankerProfile?.bio || "",
          linkedinUrl: u.bankerProfile?.linkedinUrl || "",
        });
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchBankers();
      fetchConnections();
      fetchConversationsSummary();
      fetchProfile();
    }
  }, [session, fetchBankers, fetchConnections, fetchConversationsSummary, fetchProfile]);

  useEffect(() => {
    if (activeChatBanker) {
      loadChatMessages(activeChatBanker._id);
    }
  }, [activeChatBanker, loadChatMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle Respond to Connection Request (Accept/Decline)
  const handleRespondConnection = async (connectionId: string, action: "accept" | "reject", requesterId?: string) => {
    try {
      const res = await fetch("/api/bankers-connect/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === "accept" && requesterId) {
          sendConnectionAcceptedNotification(requesterId);
        }
        fetchBankers();
        fetchConnections();
      }
    } catch (e) {
      console.error("Error responding to connection:", e);
    }
  };

  // Handle Cancel Connection Request
  const handleCancelConnection = async (connectionId: string) => {
    try {
      const res = await fetch("/api/bankers-connect/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, action: "cancel" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBankers();
        fetchConnections();
      }
    } catch (e) {
      console.error("Error cancelling connection:", e);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatBanker || !chatInput.trim()) return;

    const messageText = chatInput.trim();
    setChatInput("");

    // Optimistic UI update
    const tempMsg = {
      _id: "temp_" + Date.now(),
      senderId: currentUserId,
      recipientId: activeChatBanker._id,
      content: messageText,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setChatMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/bankers-connect/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: activeChatBanker._id,
          content: messageText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Send via WebSocket for instant 0ms broadcast to recipient
        sendChatMessage(activeChatBanker._id, data.data);
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg("");
    try {
      const res = await fetch("/api/bankers-connect/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (data.success) {
        setProfileSuccessMsg("Profile details successfully updated!");
        fetchBankers();
        setTimeout(() => setProfileSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Filtered Bankers list
  const filteredBankers = bankers.filter((b) => {
    if (b.isSelf) return false; // Don't show self in discover cards
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      b.name.toLowerCase().includes(query) ||
      b.bankerProfile.bankName.toLowerCase().includes(query) ||
      b.bankerProfile.designation.toLowerCase().includes(query) ||
      (b.bankerProfile.city && b.bankerProfile.city.toLowerCase().includes(query));

    const matchesBank =
      selectedBankFilter === "all" ||
      b.bankerProfile.bankName.toLowerCase().includes(selectedBankFilter.toLowerCase());

    return matchesQuery && matchesBank;
  });

  // Calculate unread message badge count
  const totalUnreadMessages = conversationsSummary.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  return (
    <>
      <Navbar />

      <main className="bc-container">
        {/* Top Header Banner */}
        <div className="bc-header-banner">
          <div className="bc-header-title">
            <div className="bc-header-icon">
              <Building2 size={26} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "1.65rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Bankers <span style={{ color: "#10b981" }}>Connect</span>
                </h1>
                <span
                  style={{
                    background: isWsConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                    border: `1px solid ${isWsConnected ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
                    color: isWsConnected ? "#34d399" : "#fbbf24",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "9999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: isWsConnected ? "#10b981" : "#f59e0b",
                    }}
                  />
                  {isWsConnected ? "Real-Time WebSocket Active" : "Connecting WS..."}
                </span>
              </div>
              <p style={{ margin: "0.3rem 0 0", color: "var(--bc-text-muted)", fontSize: "0.88rem" }}>
                Welcome, <strong>{currentUserName}</strong> &bull; {currentUserBank}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="bc-btn-outline"
              title="Enable Browser Desktop Notifications"
            >
              <BellRing size={16} color="#10b981" />
              <span>Enable Notifications</span>
            </button>
            <button
              type="button"
              onClick={() => {
                fetchBankers();
                fetchConnections();
                fetchConversationsSummary();
              }}
              className="bc-btn-outline"
              title="Refresh Data"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bc-tabs-nav">
          <button
            type="button"
            className={`bc-tab-btn ${activeTab === "discover" ? "active" : ""}`}
            onClick={() => setActiveTab("discover")}
          >
            <Users size={17} />
            <span>Discover Bankers</span>
            <span style={{ opacity: 0.85, fontSize: "0.78rem" }}>({bankers.filter((b) => !b.isSelf).length})</span>
          </button>

          <button
            type="button"
            className={`bc-tab-btn ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <UserCheck size={17} />
            <span>My Network & Requests</span>
            {connectionsData.receivedRequests.length > 0 && (
              <span className="bc-badge-count">{connectionsData.receivedRequests.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`bc-tab-btn ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <MessageSquare size={17} />
            <span>Real-Time Messages</span>
            {totalUnreadMessages > 0 && <span className="bc-badge-count">{totalUnreadMessages}</span>}
          </button>

          <button
            type="button"
            className={`bc-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <ShieldCheck size={17} />
            <span>My Banker Profile</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: DISCOVER BANKERS                                  */}
        {/* ======================================================== */}
        {activeTab === "discover" && (
          <div>
            {/* Search and Filters */}
            <div className="bc-search-filters">
              <div className="bc-search-box">
                <Search
                  size={18}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--bc-text-muted)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search bankers by name, bank, designation, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bc-search-input"
                />
              </div>

              {/* Bank quick filter */}
              <select
                value={selectedBankFilter}
                onChange={(e) => setSelectedBankFilter(e.target.value)}
                style={{
                  padding: "0.8rem 1.25rem",
                  background: "var(--bc-card-bg)",
                  border: "1px solid var(--bc-card-border)",
                  borderRadius: "14px",
                  color: "var(--bc-text-main)",
                  outline: "none",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Banking Institutions</option>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="SBI">State Bank of India</option>
                <option value="Axis">Axis Bank</option>
                <option value="Kotak">Kotak Mahindra</option>
                <option value="Standard Chartered">Standard Chartered</option>
                <option value="Venture Debt">Venture Debt / NBFC</option>
              </select>
            </div>

            {/* Banker Cards Grid */}
            {loadingBankers ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--bc-text-muted)" }}>
                <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", marginBottom: "1rem" }} />
                <div>Loading verified bankers directory...</div>
              </div>
            ) : filteredBankers.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  background: "var(--bc-card-bg)",
                  border: "1px solid var(--bc-card-border)",
                  borderRadius: "20px",
                  maxWidth: "600px",
                  margin: "2rem auto",
                }}
              >
                <Users size={36} color="#64748b" style={{ marginBottom: "1rem" }} />
                <h3 style={{ margin: "0 0 0.5rem" }}>No Bankers Found</h3>
                <p style={{ color: "var(--bc-text-muted)", fontSize: "0.9rem" }}>
                  No bankers matched your search criteria. Try modifying your filter or search query.
                </p>
              </div>
            ) : (
              <div className="bc-bankers-grid">
                {filteredBankers.map((banker) => {
                  const isOnline = onlineUsers.includes(banker._id);
                  return (
                    <div key={banker._id} className="bc-banker-card">
                      <div>
                        {/* Header */}
                        <div className="bc-banker-header">
                          <div className="bc-banker-avatar">
                            {banker.name[0]?.toUpperCase()}
                            <span
                              className={`bc-status-dot ${isOnline ? "bc-status-online" : "bc-status-offline"}`}
                              title={isOnline ? "Online Now" : "Offline"}
                            />
                          </div>
                          <div className="bc-banker-info">
                            <h3 className="bc-banker-name">
                              <span>{banker.name}</span>
                              <span title="Verified Banker" style={{ display: "inline-flex" }}>
                                <ShieldCheck size={16} color="#10b981" />
                              </span>
                            </h3>
                            <span className="bc-bank-tag">{banker.bankerProfile.bankName}</span>
                            <p className="bc-banker-role">{banker.bankerProfile.designation}</p>
                          </div>
                        </div>

                        {/* Pills */}
                        <div className="bc-pills-row">
                          {banker.bankerProfile.institutionType && (
                            <span className="bc-pill" style={{ color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)" }}>
                              <Building2 size={12} />
                              {banker.bankerProfile.institutionType}
                            </span>
                          )}
                          {banker.bankerProfile.experience && (
                            <span className="bc-pill" style={{ color: "#a855f7", background: "rgba(168, 85, 247, 0.1)" }}>
                              <Clock size={12} />
                              {banker.bankerProfile.experience}
                            </span>
                          )}
                          {banker.bankerProfile.city && (
                            <span className="bc-pill">
                              <MapPin size={12} />
                              {banker.bankerProfile.city}
                            </span>
                          )}
                          {banker.bankerProfile.department && (
                            <span className="bc-pill">
                              <Briefcase size={12} />
                              {banker.bankerProfile.department}
                            </span>
                          )}
                          {(banker.bankerProfile.ticketSizeMin || banker.bankerProfile.ticketSizeMax) && (
                            <span className="bc-pill" style={{ color: "#34d399", background: "rgba(16, 185, 129, 0.1)" }}>
                              <Banknote size={12} />
                              {banker.bankerProfile.ticketSizeMin || "₹10L"} - {banker.bankerProfile.ticketSizeMax || "₹50Cr"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="bc-actions-row">
                        {banker.connectionStatus === "connected" ? (
                          <button
                            type="button"
                            className="bc-btn-primary"
                            onClick={() => {
                              setActiveChatBanker(banker);
                              setActiveTab("chat");
                            }}
                          >
                            <MessageSquare size={15} />
                            <span>Message</span>
                          </button>
                        ) : banker.connectionStatus === "pending_sent" ? (
                          <button
                            type="button"
                            className="bc-btn-disabled"
                            onClick={() => banker.connectionId && handleCancelConnection(banker.connectionId)}
                            title="Click to cancel pending request"
                          >
                            <Clock size={15} color="#f59e0b" />
                            <span>Request Sent (Cancel)</span>
                          </button>
                        ) : banker.connectionStatus === "pending_received" ? (
                          <button
                            type="button"
                            className="bc-btn-primary"
                            onClick={() =>
                              banker.connectionId && handleRespondConnection(banker.connectionId, "accept", banker._id)
                            }
                          >
                            <Check size={15} />
                            <span>Accept Request</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="bc-btn-primary"
                            onClick={() => setConnectModalBanker(banker)}
                          >
                            <UserCheck size={15} />
                            <span>Connect</span>
                          </button>
                        )}

                        {/* Email Chooser button */}
                        <button
                          type="button"
                          className="bc-btn-outline"
                          title={`Email ${banker.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmailChooserBanker(banker);
                          }}
                        >
                          <Mail size={15} />
                          <span>Email</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MY NETWORK & REQUESTS                             */}
        {/* ======================================================== */}
        {activeTab === "requests" && (
          <div style={{ maxWidth: "1240px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Received Requests */}
            <div
              style={{
                background: "var(--bc-card-bg)",
                border: "1px solid var(--bc-card-border)",
                borderRadius: "20px",
                padding: "1.75rem",
              }}
            >
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <UserCheck size={20} color="#10b981" />
                <span>Received Connection Requests</span>
                <span style={{ fontSize: "0.85rem", color: "var(--bc-text-muted)", fontWeight: 500 }}>
                  ({connectionsData.receivedRequests.length})
                </span>
              </h2>

              {connectionsData.receivedRequests.length === 0 ? (
                <p style={{ color: "var(--bc-text-muted)", fontSize: "0.9rem", margin: 0 }}>
                  You have no pending incoming connection requests.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {connectionsData.receivedRequests.map((req) => (
                    <div
                      key={req._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem 1.25rem",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderRadius: "14px",
                        border: "1px solid var(--bc-card-border)",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{req.requesterId?.name}</div>
                        <div style={{ fontSize: "0.85rem", color: "#38bdf8", marginTop: "0.15rem" }}>
                          {req.requesterId?.bankerProfile?.bankName} &bull; {req.requesterId?.bankerProfile?.designation}
                        </div>
                        {req.introMessage && (
                          <div style={{ fontSize: "0.86rem", color: "var(--bc-text-muted)", marginTop: "0.4rem", fontStyle: "italic" }}>
                            &ldquo;{req.introMessage}&rdquo;
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "0.6rem" }}>
                        <button
                          type="button"
                          className="bc-btn-primary"
                          onClick={() => handleRespondConnection(req._id, "accept", req.requesterId?._id)}
                        >
                          <Check size={16} />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          className="bc-btn-outline"
                          onClick={() => handleRespondConnection(req._id, "reject")}
                        >
                          <X size={16} />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connected Bankers */}
            <div
              style={{
                background: "var(--bc-card-bg)",
                border: "1px solid var(--bc-card-border)",
                borderRadius: "20px",
                padding: "1.75rem",
              }}
            >
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={20} color="#0284c7" />
                <span>My Established Network</span>
                <span style={{ fontSize: "0.85rem", color: "var(--bc-text-muted)", fontWeight: 500 }}>
                  ({connectionsData.acceptedConnections.length})
                </span>
              </h2>

              {connectionsData.acceptedConnections.length === 0 ? (
                <p style={{ color: "var(--bc-text-muted)", fontSize: "0.9rem", margin: 0 }}>
                  No mutual connections yet. Head to <strong>Discover Bankers</strong> to start expanding your banking network!
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {connectionsData.acceptedConnections.map((conn) => {
                    const otherUser =
                      conn.requesterId?._id === currentUserId ? conn.recipientId : conn.requesterId;
                    if (!otherUser) return null;

                    return (
                      <div
                        key={conn._id}
                        style={{
                          padding: "1.25rem",
                          borderRadius: "14px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid var(--bc-card-border)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: "1rem",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{otherUser.name}</div>
                          <div style={{ fontSize: "0.85rem", color: "#38bdf8", marginTop: "0.2rem" }}>
                            {otherUser.bankerProfile?.bankName} &bull; {otherUser.bankerProfile?.designation}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            type="button"
                            className="bc-btn-primary"
                            style={{ flex: 1 }}
                            onClick={() => {
                              const found = bankers.find((b) => b._id === otherUser._id);
                              if (found) setActiveChatBanker(found);
                              setActiveTab("chat");
                            }}
                          >
                            <MessageSquare size={15} />
                            <span>Chat</span>
                          </button>
                          <button
                            type="button"
                            className="bc-btn-outline"
                            title={`Email ${otherUser.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmailChooserBanker(otherUser);
                            }}
                          >
                            <Mail size={15} />
                            <span>Email</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: REAL-TIME MESSENGER (WEBSOCKET CHAT)              */}
        {/* ======================================================== */}
        {activeTab === "chat" && (
          <div className="bc-chat-container">
            {/* Conversations Sidebar (Hidden on mobile if a chat is active) */}
            <div className={`bc-chat-sidebar ${activeChatBanker ? "mobile-hidden" : ""}`}>
              {/* Sidebar Header */}
              <div className="bc-chat-sidebar-header">
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <MessageSquare size={18} color="#10b981" />
                    <span>Banker Discussions</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.15rem" }}>
                    Direct Institutional Channel
                  </div>
                </div>
                <div
                  style={{
                    background: isWsConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                    border: `1px solid ${isWsConnected ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
                    color: isWsConnected ? "#34d399" : "#fbbf24",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.55rem",
                    borderRadius: "9999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: isWsConnected ? "#10b981" : "#f59e0b",
                    }}
                  />
                  <span>{isWsConnected ? "Live" : "Polling"}</span>
                </div>
              </div>

              {/* Sidebar Search Bar */}
              <div className="bc-chat-sidebar-search">
                <Search size={15} style={{ color: "var(--bc-text-muted)", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Filter discussions..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--bc-text-main)",
                    fontSize: "0.85rem",
                    width: "100%",
                  }}
                />
                {chatSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setChatSearchQuery("")}
                    style={{ background: "none", border: "none", color: "var(--bc-text-muted)", cursor: "pointer", padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Conversations List */}
              <div className="bc-conversation-list">
                {bankers
                  .filter((b) => {
                    if (b.isSelf) return false;
                    const isConnectedOrActive = b.connectionStatus === "connected" || activeChatBanker?._id === b._id;
                    if (!isConnectedOrActive) return false;
                    if (!chatSearchQuery.trim()) return true;
                    const q = chatSearchQuery.toLowerCase();
                    return (
                      b.name.toLowerCase().includes(q) ||
                      b.bankerProfile.bankName.toLowerCase().includes(q) ||
                      b.bankerProfile.designation.toLowerCase().includes(q)
                    );
                  })
                  .map((b) => {
                    const isOnline = onlineUsers.includes(b._id);
                    const isActive = activeChatBanker?._id === b._id;
                    const convSummary = conversationsSummary.find((c) => c.otherUserId === b._id);

                    return (
                      <div
                        key={b._id}
                        className={`bc-conversation-item ${isActive ? "active" : ""}`}
                        onClick={() => {
                          setActiveChatBanker(b);
                          setShowBankerInfoDrawer(false);
                        }}
                      >
                        <div className="bc-banker-avatar-wrapper">
                          <div className="bc-banker-avatar" style={{ width: "46px", height: "46px", fontSize: "1.1rem" }}>
                            {b.name[0]?.toUpperCase()}
                          </div>
                          <span
                            className={`bc-status-dot ${isOnline ? "bc-status-online" : "bc-status-offline"}`}
                            title={isOnline ? "Online" : "Offline"}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.2rem" }}>
                            <span className="bc-conv-name">{b.name}</span>
                            {convSummary?.lastMessageAt && (
                              <span style={{ fontSize: "0.72rem", color: "var(--bc-text-muted)" }}>
                                {new Date(convSummary.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                            <span className="bc-conv-bank-badge">{b.bankerProfile.bankName}</span>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="bc-conv-preview">
                              {convSummary?.lastMessage || "Click to open conversation..."}
                            </span>
                            {convSummary?.unreadCount > 0 && (
                              <span className="bc-badge-count">{convSummary.unreadCount}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {bankers.filter((b) => !b.isSelf && b.connectionStatus === "connected").length === 0 && (
                  <div className="bc-conv-empty-state">
                    <Users size={32} style={{ color: "#94a3b8", marginBottom: "0.75rem" }} />
                    <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "#0f172a", marginBottom: "0.3rem" }}>No Active Chats Yet</div>
                    <p style={{ fontSize: "0.84rem", color: "#64748b", margin: "0 0 1rem", lineHeight: 1.5 }}>
                      Connect with fellow bankers from HDFC, ICICI, SBI, and others to unlock real-time messaging.
                    </p>
                    <button
                      type="button"
                      className="bc-btn-primary"
                      onClick={() => setActiveTab("discover")}
                      style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", borderRadius: "10px" }}
                    >
                      Browse Discover Tab
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Active Chat Conversation Pane */}
            <div className={`bc-chat-main ${!activeChatBanker ? "mobile-hidden" : ""}`}>
              {activeChatBanker ? (
                <>
                  {/* Chat Header */}
                  <div className="bc-chat-main-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", minWidth: 0 }}>
                      {/* Mobile Back Button */}
                      <button
                        type="button"
                        onClick={() => setActiveChatBanker(null)}
                        className="bc-mobile-back-btn"
                        title="Back to Conversations"
                      >
                        <ArrowLeft size={18} />
                      </button>

                      <div className="bc-banker-avatar-wrapper">
                        <div className="bc-banker-avatar" style={{ width: "44px", height: "44px", fontSize: "1.1rem" }}>
                          {activeChatBanker.name[0]?.toUpperCase()}
                        </div>
                        <span
                          className={`bc-status-dot ${
                            onlineUsers.includes(activeChatBanker._id) ? "bc-status-online" : "bc-status-offline"
                          }`}
                        />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {activeChatBanker.name}
                          </span>
                          <span title="Verified Institutional Banker" style={{ display: "inline-flex" }}>
                            <ShieldCheck size={16} color="#10b981" />
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem" }}>
                          <span style={{ color: "#0284c7", fontWeight: 700 }}>{activeChatBanker.bankerProfile.bankName}</span>
                          <span style={{ color: "#94a3b8" }}>&bull;</span>
                          <span style={{ color: onlineUsers.includes(activeChatBanker._id) ? "#059669" : "#64748b", fontWeight: 600 }}>
                            {onlineUsers.includes(activeChatBanker._id) ? "● Active Now" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => setShowBankerInfoDrawer(!showBankerInfoDrawer)}
                        className={`bc-chat-header-btn ${showBankerInfoDrawer ? "active" : ""}`}
                        title="Toggle Banker Info"
                      >
                        <Info size={15} />
                        <span className="desktop-text">Banker Info</span>
                      </button>

                      <button
                        type="button"
                        className="bc-chat-header-btn email-btn"
                        title={activeChatBanker ? `Email ${activeChatBanker.name}` : "Email"}
                        onClick={() => {
                          if (activeChatBanker) setEmailChooserBanker(activeChatBanker);
                        }}
                      >
                        <Mail size={15} />
                        <span className="desktop-text">Email</span>
                      </button>
                    </div>
                  </div>

                  {/* Optional Slide-down Quick Info Banner */}
                  {showBankerInfoDrawer && (
                    <div className="bc-chat-info-banner">
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                        <div>
                          <div className="bc-info-label">Designation & Department</div>
                          <div className="bc-info-val">
                            {activeChatBanker.bankerProfile.designation} &bull; {activeChatBanker.bankerProfile.department || "Corporate Banking"}
                          </div>
                        </div>

                        <div>
                          <div className="bc-info-label">Average Ticket Size</div>
                          <div className="bc-info-val" style={{ color: "#34d399", fontWeight: 700 }}>
                            {activeChatBanker.bankerProfile.ticketSizeMax || activeChatBanker.bankerProfile.ticketSizeMin || "₹25L - ₹50Cr"}
                          </div>
                        </div>

                        <div>
                          <div className="bc-info-label">Location / City</div>
                          <div className="bc-info-val">{activeChatBanker.bankerProfile.city || "Pan-India"}</div>
                        </div>

                        {activeChatBanker.bankerProfile.phone && (
                          <div>
                            <div className="bc-info-label">Direct Contact</div>
                            <div className="bc-info-val">{activeChatBanker.bankerProfile.phone}</div>
                          </div>
                        )}
                      </div>

                      {activeChatBanker.bankerProfile.bio && (
                        <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                          <span className="bc-info-label">Portfolio Focus: </span>
                          <span style={{ fontSize: "0.82rem", color: "var(--bc-text-muted)" }}>
                            {activeChatBanker.bankerProfile.bio}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Messages Scroll Area */}
                  <div className="bc-messages-scroll">
                    {/* Date Divider */}
                    <div className="bc-chat-date-divider">
                      <span>Live Encrypted Session</span>
                    </div>

                    {loadingChat ? (
                      <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--bc-text-muted)" }}>
                        <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "0.5rem" }} />
                        <div>Retrieving secure chat messages...</div>
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="bc-chat-welcome-prompt">
                        <div className="bc-welcome-icon-box">
                          <MessageSquare size={26} color="#10b981" />
                        </div>
                        <h4 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem" }}>
                          Start conversation with {activeChatBanker.name}
                        </h4>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--bc-text-muted)" }}>
                          Discuss syndication opportunities, co-lending, or venture debt facilities in real time.
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => {
                        const isMine = msg.senderId === currentUserId;
                        return (
                          <div
                            key={msg._id || i}
                            className={`bc-message-bubble ${isMine ? "bc-msg-sent" : "bc-msg-received"}`}
                          >
                            <div className="bc-msg-text">{msg.content}</div>
                            <span className="bc-msg-time">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {isMine && (
                                <CheckCheck size={13} style={{ display: "inline", marginLeft: "4px", verticalAlign: "middle" }} />
                              )}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Suggestion Chips */}
                  <div className="bc-chat-quick-chips">
                    {[
                      "👋 Hi, let's explore synergies",
                      "💼 What's your sweet spot ticket size?",
                      "📑 Can you share term sheet details?",
                      "📞 Let's coordinate a quick call",
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className="bc-quick-chip"
                        onClick={() => setChatInput((prev) => (prev ? `${prev} ${chip}` : chip))}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input Bar */}
                  <form onSubmit={handleSendMessage} className="bc-chat-input-bar">
                    <input
                      type="text"
                      placeholder={`Type a message to ${activeChatBanker.name}...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="bc-chat-input"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="bc-chat-send-btn"
                      title="Send Message"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="bc-chat-empty-panel">
                  <div className="bc-empty-shield-icon">
                    <ShieldCheck size={36} color="#10b981" />
                  </div>
                  <h3 style={{ margin: "0 0 0.4rem", fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
                    Bankers Direct <span style={{ color: "#10b981" }}>Messenger</span>
                  </h3>
                  <p style={{ margin: "0 0 1.5rem", fontSize: "0.9rem", color: "#64748b", maxWidth: "420px", lineHeight: 1.5 }}>
                    Select a conversation from the sidebar to chat in real time with banking executives, venture lenders, and syndication heads.
                  </p>

                  {/* Quick Start List */}
                  {bankers.filter((b) => !b.isSelf && b.connectionStatus === "connected").length > 0 && (
                    <div style={{ width: "100%", maxWidth: "420px" }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "0.6rem", letterSpacing: "0.04em" }}>
                        Quick Select a Connection:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {bankers
                          .filter((b) => !b.isSelf && b.connectionStatus === "connected")
                          .slice(0, 3)
                          .map((b) => (
                            <button
                              key={b._id}
                              type="button"
                              onClick={() => setActiveChatBanker(b)}
                              className="bc-quick-start-item"
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                                <div className="bc-banker-avatar" style={{ width: "34px", height: "34px", fontSize: "0.9rem" }}>
                                  {b.name[0]?.toUpperCase()}
                                </div>
                                <div style={{ textAlign: "left" }}>
                                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{b.name}</div>
                                  <div style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: 600 }}>{b.bankerProfile.bankName}</div>
                                </div>
                              </div>
                              <ChevronRight size={16} color="#94a3b8" />
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MY BANKER PROFILE                                 */}
        {/* ======================================================== */}
        {activeTab === "profile" && (
          <div
            style={{
              maxWidth: "760px",
              margin: "0 auto",
              background: "var(--bc-card-bg)",
              border: "1px solid var(--bc-card-border)",
              borderRadius: "22px",
              padding: "2.5rem 2rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #10b981 0%, #0284c7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800 }}>My Institutional Banker Profile</h2>
                <span style={{ fontSize: "0.85rem", color: "var(--bc-text-muted)" }}>
                  Visible to other registered bankers across the network
                </span>
              </div>
            </div>

            {profileSuccessMsg && (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: "10px",
                  padding: "0.75rem 1rem",
                  color: "#34d399",
                  fontSize: "0.9rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Check size={18} />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--bc-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="bc-search-input"
                    style={{ padding: "0.75rem 1rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--bc-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Institution Type
                  </label>
                  <select
                    value={profileForm.institutionType}
                    onChange={(e) => setProfileForm({ ...profileForm, institutionType: e.target.value })}
                    className="bc-search-input"
                    style={{ padding: "0.75rem 1rem", background: "#0f172a", color: "#fff" }}
                  >
                    {INSTITUTION_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--bc-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Bank / Institution Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.bankName}
                    onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                    className="bc-search-input"
                    style={{ padding: "0.75rem 1rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--bc-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Total Experience
                  </label>
                  <select
                    value={profileForm.experience}
                    onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                    className="bc-search-input"
                    style={{ padding: "0.75rem 1rem", background: "#0f172a", color: "#fff" }}
                  >
                    {EXPERIENCE_OPTIONS.map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--bc-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.designation}
                    onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                    className="bc-search-input"
                    style={{ padding: "0.75rem 1rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--bc-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Department / Vertical
                  </label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="bc-search-input"
                    style={{ padding: "0.75rem 1rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--bc-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="bc-search-input"
                    style={{ padding: "0.75rem 1rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--bc-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="bc-search-input"
                    style={{ padding: "0.75rem 1rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--bc-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Minimum Ticket Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹50 Lakhs"
                    value={profileForm.ticketSizeMin}
                    onChange={(e) => setProfileForm({ ...profileForm, ticketSizeMin: e.target.value })}
                    className="bc-search-input"
                    style={{ padding: "0.75rem 1rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--bc-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    The average ticket size that you deal in
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹25 Crores"
                    value={profileForm.ticketSizeMax}
                    onChange={(e) => setProfileForm({ ...profileForm, ticketSizeMax: e.target.value })}
                    className="bc-search-input"
                    style={{ padding: "0.75rem 1rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--bc-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                  Professional Bio / Portfolio Focus
                </label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="bc-search-input"
                  style={{ padding: "0.75rem 1rem", resize: "none" }}
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="bc-btn-primary"
                style={{ padding: "0.85rem", alignSelf: "flex-end", minWidth: "180px", borderRadius: "12px" }}
              >
                {savingProfile ? "Saving Details..." : "Save Profile Changes"}
              </button>
            </form>
          </div>
        )}

        {/* Modal: Connect Request */}
        <ConnectModal
          banker={connectModalBanker}
          onClose={() => setConnectModalBanker(null)}
          onSuccess={(targetId, intro) => {
            sendConnectionRequestNotification(targetId, intro);
            fetchBankers();
            fetchConnections();
          }}
        />

        {/* Modal: Direct Email */}
        <EmailModal
          banker={emailModalBanker}
          currentBankerName={currentUserName}
          currentBankerBank={currentUserBank}
          onClose={() => setEmailModalBanker(null)}
        />

        {/* Modal: Email Application Chooser (Gmail vs Default Mail vs Copy) */}
        {emailChooserBanker && (
          <EmailChooserModal
            banker={emailChooserBanker}
            onClose={() => setEmailChooserBanker(null)}
          />
        )}
      </main>

      <Footer />
    </>
  );
}
