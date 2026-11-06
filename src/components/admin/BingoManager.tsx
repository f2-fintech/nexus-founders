"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Trophy,
  Users,
  Camera,
  Download,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  X,
  ExternalLink,
  Sparkles,
  Play,
  Pause,
  Square,
  RotateCcw,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { BINGO_CHALLENGES } from "@/lib/bingo-challenges";
import { ClientBingoParticipant, IBingoTile } from "@/models/BingoParticipant";
import { ClientBingoSession } from "@/models/BingoSession";

export default function BingoManager() {
  const [sessions, setSessions] = useState<ClientBingoSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ClientBingoSession | null>(null);

  const [participants, setParticipants] = useState<ClientBingoParticipant[]>([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    completedCount: 0,
    playingCount: 0,
    totalCardsScanned: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Inspection modal
  const [inspectingPlayer, setInspectingPlayer] = useState<ClientBingoParticipant | null>(null);
  const [zoomCardUrl, setZoomCardUrl] = useState<string | null>(null);

  // Multi-winner selection state
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [sendingEmails, setSendingEmails] = useState(false);

  const [config, setConfig] = useState<{
    isGameActive: boolean;
    gameState: "running" | "paused" | "stopped";
    roundNumber: number;
    currentSessionNumber: number;
    activeSessionId?: string;
    allowRegistration: boolean;
  }>({
    isGameActive: true,
    gameState: "running",
    roundNumber: 1,
    currentSessionNumber: 1,
    allowRegistration: true,
  });
  const [controlLoading, setControlLoading] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/bingo/control");
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/bingo/sessions");
      const data = await res.json();
      if (data.success && data.sessions) {
        setSessions(data.sessions);
        const liveOne = data.sessions.find(
          (s: any) =>
            (data.activeSessionId && String(s._id) === String(data.activeSessionId)) ||
            s.status === "running" ||
            s.status === "paused"
        );
        setSelectedSessionId((prev) => {
          if (prev && data.sessions.some((s: any) => String(s._id) === String(prev))) {
            return prev;
          }
          return liveOne?._id || data.activeSessionId || data.sessions[0]?._id || null;
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSessionId) params.set("sessionId", selectedSessionId);
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/bingo/participants?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants || []);
        if (data.stats) setStats(data.stats);
        if (data.selectedSession) setSelectedSession(data.selectedSession);
      }
    } catch (err) {
      console.error("Failed to fetch bingo participants:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSessionId, searchQuery, statusFilter]);

  useEffect(() => {
    fetchConfig();
    fetchSessions();
  }, [fetchConfig, fetchSessions]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchParticipants();
    }
  }, [selectedSessionId, fetchParticipants]);

  const liveSession = useMemo(() => {
    return (
      sessions.find(
        (s) =>
          (config.activeSessionId && String(s._id) === String(config.activeSessionId)) ||
          s.status === "running" ||
          s.status === "paused"
      ) ||
      sessions[0] ||
      null
    );
  }, [sessions, config.activeSessionId]);

  const activeSessionId = liveSession?._id
    ? String(liveSession._id)
    : config.activeSessionId
    ? String(config.activeSessionId)
    : null;

  const isActiveSessionSelected = Boolean(
    selectedSessionId && activeSessionId && String(selectedSessionId) === activeSessionId
  );

  // START NEW GAME (Archives old game with all progress saved & launches fresh round)
  const handleStartNewGame = async () => {
    const nextRound = (config.currentSessionNumber || config.roundNumber || 1) + 1;
    const customTitle = prompt(
      `🎉 START NEW GAME SESSION?\nThis will safely archive the current game with all participants & data intact.\n\nEnter title for the new game:`,
      `Game Session #${nextRound}`
    );
    if (customTitle === null) return; // User cancelled

    setControlLoading(true);
    try {
      const res = await fetch("/api/bingo/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start_new_game", title: customTitle.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await fetchConfig();
        await fetchSessions();
        if (data.activeSession?._id) {
          setSelectedSessionId(data.activeSession._id);
        }
      } else {
        alert(data.error || "Failed to start new game");
      }
    } catch (err) {
      alert("Failed to start new game");
    } finally {
      setControlLoading(false);
    }
  };

  const setGameState = async (targetState: "running" | "paused" | "stopped") => {
    const actionLabel =
      targetState === "running"
        ? "START & ACTIVATE"
        : targetState === "paused"
        ? "PAUSE"
        : "STOP & CLOSE";
    if (!confirm(`Are you sure you want to ${actionLabel} the Nexus Bingo event?`)) return;

    setControlLoading(true);
    try {
      const res = await fetch("/api/bingo/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_status", gameState: targetState }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        await fetchSessions();
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to update game state");
    } finally {
      setControlLoading(false);
    }
  };

  const togglePlayerSelection = (id: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedPlayerIds.length === participants.length) {
      setSelectedPlayerIds([]);
    } else {
      setSelectedPlayerIds(participants.map((p) => p._id));
    }
  };

  const declareSelectedWinners = async (sendEmailNow = false) => {
    if (selectedPlayerIds.length === 0) {
      alert("Please select at least one player to declare as winner!");
      return;
    }

    const actionText = sendEmailNow
      ? `🏆 DECLARE ${selectedPlayerIds.length} WINNER(S) & SEND EMAIL NOTIFICATIONS NOW?`
      : `🏆 DECLARE ${selectedPlayerIds.length} OFFICIAL WINNER(S)?`;

    if (!confirm(`${actionText}\n\nSelected participants will be officially recorded as winners for this session.`)) {
      return;
    }

    try {
      setControlLoading(true);
      const res = await fetch("/api/bingo/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "declare_winners",
          participantIds: selectedPlayerIds,
          sessionId: selectedSessionId,
          sendEmailNow,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setSelectedPlayerIds([]);
        fetchSessions();
        fetchParticipants();
        fetchConfig();
      } else {
        alert(data.error || "Failed to declare winners");
      }
    } catch (err: any) {
      alert(`Error declaring winners: ${err?.message || "Failed"}`);
    } finally {
      setControlLoading(false);
    }
  };

  const sendEmailsToSessionWinners = async () => {
    if (
      !confirm(
        "📧 SEND WINNER EMAIL NOTIFICATIONS?\n\nThis will send the official congratulations and prize claim email to all declared winners of this session via SMTP."
      )
    ) {
      return;
    }

    try {
      setSendingEmails(true);
      const res = await fetch("/api/bingo/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_winner_emails",
          sessionId: selectedSessionId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchSessions();
        fetchParticipants();
      } else {
        alert(data.error || "Failed to send emails");
      }
    } catch (err: any) {
      alert(`Error sending emails: ${err?.message || "Failed"}`);
    } finally {
      setSendingEmails(false);
    }
  };

  const declareWinner = async (id: string, name: string) => {
    if (
      !confirm(
        `🏆 DECLARE OFFICIAL WINNER?\nAre you sure you want to declare "${name}" as an official winner for this session?`
      )
    )
      return;

    try {
      const res = await fetch("/api/bingo/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "declare_winners",
          participantIds: [id],
          sessionId: selectedSessionId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchSessions();
        fetchParticipants();
        fetchConfig();
      } else {
        alert(data.error || "Failed to declare winner");
      }
    } catch (err) {
      alert("Failed to declare winner");
    }
  };

  const resetSinglePlayer = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to RESTART game for "${name}"?\nTheir progress will reset to 0/20 and timer will restart.`
      )
    )
      return;
    try {
      const res = await fetch("/api/bingo/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_player", participantId: id }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchParticipants();
      }
    } catch (err) {
      alert("Failed to reset player");
    }
  };

  const wipeSessionPlayers = async () => {
    if (
      !confirm(
        `🚨 WIPE TEST ENTRIES FOR "${selectedSession?.title || "Current Session"}"?\nThis will delete test participants for this round only so you have a fresh slate for the event.`
      )
    )
      return;
    setControlLoading(true);
    try {
      const res = await fetch("/api/bingo/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "wipe_session" }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchParticipants();
        fetchSessions();
      }
    } catch (err) {
      alert("Failed to wipe session entries");
    } finally {
      setControlLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bingo/participants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setParticipants((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: status as any } : p))
        );
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const deletePlayer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this Bingo participant?")) return;
    try {
      const res = await fetch(`/api/bingo/participants/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setParticipants((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      alert("Failed to delete participant");
    }
  };

  // Export Leads to CSV
  const exportToCSV = () => {
    if (participants.length === 0) {
      alert("No participants to export.");
      return;
    }

    const headers = [
      "Full Name",
      "Email",
      "Category",
      "Company",
      "Designation",
      "Status",
      "Completed Challenges",
      "Progress %",
      "Time Taken (Seconds)",
      "Registered Visiting Card URL",
      "Started At",
      "Completed At",
      ...BINGO_CHALLENGES.map((c) => `Challenge ${c.id}: ${c.statement.replace(/,/g, ";")}`),
    ];

    const rows = participants.map((p) => {
      const tileCols = BINGO_CHALLENGES.map((c) => {
        const tile = p.tiles?.find((t) => t.tileNumber === c.id);
        if (!tile || !tile.completed) return "Not Completed";
        return `${tile.cardPhotoUrl || "Card Verified"} (Met: ${tile.contactName || "N/A"})`;
      });

      return [
        `"${p.fullName || ""}"`,
        `"${p.email || ""}"`,
        `"${p.category || ""}"`,
        `"${p.companyName || ""}"`,
        `"${p.designation || ""}"`,
        `"${p.status || ""}"`,
        p.completedCount || 0,
        `${p.progressPercent || 0}%`,
        p.timeTakenSeconds || 0,
        `"${p.ownVisitingCardUrl || ""}"`,
        `"${p.startedAt ? new Date(p.startedAt).toLocaleString() : ""}"`,
        `"${p.completedAt ? new Date(p.completedAt).toLocaleString() : ""}"`,
        ...tileCols.map((col) => `"${col}"`),
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexus_bingo_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* ── MASTER LIVE EVENT CONTROLS (ALWAYS VISIBLE AT TOP) ── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))",
          borderRadius: "18px",
          border:
            config.gameState === "running"
              ? "2px solid rgba(16, 185, 129, 0.55)"
              : config.gameState === "paused"
              ? "2px solid rgba(245, 158, 11, 0.65)"
              : "2px solid rgba(239, 68, 68, 0.55)",
          padding: "1.25rem 1.6rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.2rem",
          boxShadow:
            config.gameState === "running"
              ? "0 10px 30px rgba(16, 185, 129, 0.15)"
              : config.gameState === "paused"
              ? "0 10px 30px rgba(245, 158, 11, 0.18)"
              : "0 10px 30px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background:
                config.gameState === "running"
                  ? "rgba(16, 185, 129, 0.2)"
                  : config.gameState === "paused"
                  ? "rgba(245, 158, 11, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
              color:
                config.gameState === "running"
                  ? "#10b981"
                  : config.gameState === "paused"
                  ? "#f59e0b"
                  : "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 0 12px rgba(255, 255, 255, 0.05)",
            }}
          >
            {config.gameState === "running" ? (
              <Play size={24} fill="#10b981" />
            ) : config.gameState === "paused" ? (
              <Pause size={24} fill="#f59e0b" />
            ) : (
              <Square size={22} fill="#ef4444" />
            )}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#f8fafc" }}>
                Live Event:
              </span>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 900,
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  background:
                    config.gameState === "running"
                      ? "#10b981"
                      : config.gameState === "paused"
                      ? "#f59e0b"
                      : "#ef4444",
                  color: "#000",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {config.gameState === "running"
                  ? "🟢 RUNNING (LIVE)"
                  : config.gameState === "paused"
                  ? "⏸️ PAUSED"
                  : "⏹️ STOPPED (OFFLINE)"}
              </span>
              <span style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: 700 }}>
                {liveSession?.title ? `[ ${liveSession.title} ]` : `Round #${config.roundNumber || 1}`}
              </span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.25rem" }}>
              {config.gameState === "running"
                ? "Active in real-time. Players can register and scan visiting cards."
                : config.gameState === "paused"
                ? "Game is temporarily PAUSED. Scanning is locked; players see a pause notice."
                : "Game is STOPPED. Attendees see 'No Game In Progress'."}
            </div>
          </div>
        </div>

        {/* Action Buttons: Pause, Resume, Stop, and Start New Game */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
          {/* Pause Button */}
          <button
            type="button"
            onClick={() => setGameState("paused")}
            disabled={controlLoading || config.gameState === "paused"}
            style={{
              padding: "0.6rem 1.15rem",
              borderRadius: "10px",
              background:
                config.gameState === "paused"
                  ? "rgba(245, 158, 11, 0.15)"
                  : "#f59e0b",
              border: "1.5px solid #f59e0b",
              color: config.gameState === "paused" ? "#fbbf24" : "#000000",
              fontWeight: 800,
              fontSize: "0.88rem",
              cursor: config.gameState === "paused" ? "default" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              boxShadow: config.gameState === "running" ? "0 4px 14px rgba(245, 158, 11, 0.4)" : "none",
            }}
          >
            <Pause size={16} fill={config.gameState === "running" ? "#000" : "none"} />
            Pause Game
          </button>

          {/* Resume / Start Button */}
          <button
            type="button"
            onClick={() => setGameState("running")}
            disabled={controlLoading || config.gameState === "running"}
            style={{
              padding: "0.6rem 1.15rem",
              borderRadius: "10px",
              background:
                config.gameState === "running"
                  ? "rgba(16, 185, 129, 0.15)"
                  : "#10b981",
              border: "1.5px solid #10b981",
              color: config.gameState === "running" ? "#6ee7b7" : "#000000",
              fontWeight: 800,
              fontSize: "0.88rem",
              cursor: config.gameState === "running" ? "default" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              boxShadow: config.gameState !== "running" ? "0 4px 14px rgba(16, 185, 129, 0.4)" : "none",
            }}
          >
            <Play size={16} fill={config.gameState !== "running" ? "#000" : "none"} />
            Resume Game
          </button>

          {/* Stop Button */}
          <button
            type="button"
            onClick={() => setGameState("stopped")}
            disabled={controlLoading || config.gameState === "stopped"}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "10px",
              background:
                config.gameState === "stopped"
                  ? "rgba(239, 68, 68, 0.15)"
                  : "#ef4444",
              border: "1.5px solid #ef4444",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.88rem",
              cursor: config.gameState === "stopped" ? "default" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
            }}
          >
            <Square size={14} fill={config.gameState === "stopped" ? "#fff" : "none"} />
            Stop
          </button>

          {/* Start New Game (Clean Slate) */}
          <button
            type="button"
            onClick={handleStartNewGame}
            disabled={controlLoading}
            style={{
              background: "linear-gradient(135deg, #0284c7, #2563eb)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "0.6rem 1.15rem",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "0.88rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
            }}
          >
            <Sparkles size={15} />
            Start New Game (Clean Slate)
          </button>
        </div>
      </div>

      {/* ── Game Session Records & History Explorer ── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95))",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "1.1rem 1.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#94a3b8",
                fontWeight: 700,
                marginBottom: "0.35rem",
              }}
            >
              Session Records & History Explorer
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <select
                value={selectedSessionId || ""}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                style={{
                  background: "#0f172a",
                  color: "#f8fafc",
                  border: isActiveSessionSelected ? "2px solid #10b981" : "1.5px solid #0284c7",
                  borderRadius: "10px",
                  padding: "0.55rem 1rem",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  outline: "none",
                  cursor: "pointer",
                  minWidth: "280px",
                }}
              >
                {sessions.map((s) => {
                  const isCurrent = String(s._id) === String(activeSessionId);
                  return (
                    <option key={s._id} value={s._id}>
                      {isCurrent ? "🟢 LIVE GAME: " : "📁 PAST ROUND: "}
                      {s.title} ({s.totalParticipants || 0} Players)
                      {s.winner ? ` — 🏆 Winner: ${s.winner.fullName}` : ""}
                    </option>
                  );
                })}
              </select>

              {isActiveSessionSelected ? (
                <span
                  style={{
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#10b981",
                    border: "1px solid #10b981",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                  }}
                >
                  🟢 VIEWING ACTIVE LIVE GAME
                </span>
              ) : (
                <span
                  style={{
                    background: "rgba(148, 163, 184, 0.2)",
                    color: "#cbd5e1",
                    border: "1px solid #64748b",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                  }}
                >
                  📁 VIEWING ARCHIVED PAST ROUND
                </span>
              )}

              {!isActiveSessionSelected && activeSessionId && (
                <button
                  type="button"
                  onClick={() => setSelectedSessionId(activeSessionId)}
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid #10b981",
                    color: "#10b981",
                    padding: "0.35rem 0.85rem",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  👁️ Switch back to Live Game →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right side tools: Export CSV & Wipe Test data */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={exportToCSV}
            style={{
              background: "rgba(2, 132, 199, 0.15)",
              border: "1px solid #0284c7",
              color: "#38bdf8",
              padding: "0.55rem 0.95rem",
              borderRadius: "10px",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Download size={14} />
            Export This Session CSV
          </button>

          {isActiveSessionSelected && (
            <button
              type="button"
              onClick={wipeSessionPlayers}
              disabled={controlLoading}
              title="Delete test entries for active session before kickoff"
              style={{
                padding: "0.55rem 0.85rem",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <Trash2 size={13} />
              Wipe Test Entries
            </button>
          )}
        </div>
      </div>

      {/* ── Official Winner Spotlight Banner (Supports Multiple Winners) ── */}
      {selectedSession && (selectedSession.winners?.length || selectedSession.winner) && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.28))",
            border: "2px solid #f59e0b",
            borderRadius: "16px",
            padding: "1.25rem 1.5rem",
            boxShadow: "0 10px 30px rgba(245, 158, 11, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
                  flexShrink: 0,
                }}
              >
                <Trophy size={24} />
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#fbbf24", fontWeight: 800 }}>
                  🏆 Declared Session Winners ({selectedSession.winners?.length || (selectedSession.winner ? 1 : 0)})
                </div>
                <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                  Announced Date: <strong>20 November</strong> • Notifications sent via Email
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={sendEmailsToSessionWinners}
              disabled={sendingEmails}
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                border: "none",
                color: "#000000",
                padding: "0.6rem 1.1rem",
                borderRadius: "10px",
                fontSize: "0.85rem",
                fontWeight: 800,
                cursor: sendingEmails ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
              }}
            >
              <Mail size={15} />
              {sendingEmails ? "Sending Emails..." : "Send Winner Emails"}
            </button>
          </div>

          {/* List of winners */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
            {(selectedSession.winners && selectedSession.winners.length > 0
              ? selectedSession.winners
              : selectedSession.winner
              ? [selectedSession.winner]
              : []
            ).map((w: any, idx: number) => (
              <div
                key={w.participantId || idx}
                style={{
                  background: "rgba(15, 23, 42, 0.65)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "12px",
                  padding: "0.8rem 1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#fbbf24" }}>
                    #{w.rank || idx + 1} WINNER
                  </span>
                  {w.emailSent || w.emailSentAt ? (
                    <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                      <CheckCircle size={12} /> Email Sent
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      ✉️ Email Pending
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#ffffff" }}>
                  {w.fullName}
                </div>
                {w.email && <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{w.email}</div>}
                {w.companyName && (
                  <div style={{ fontSize: "0.75rem", color: "#38bdf8", marginTop: "0.15rem" }}>
                    {w.companyName} {w.designation ? `(${w.designation})` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats Bar ── */}
      <div className="db-stats">
        {[
          { label: "Total Players", value: stats.totalCount, color: "#0284c7" },
          { label: "Currently Playing", value: stats.playingCount, color: "#f59e0b" },
          { label: "Completed Winners", value: stats.completedCount, color: "#10b981" },
          { label: "Visiting Cards Collected", value: stats.totalCardsScanned, color: "#6366f1" },
        ].map((s) => (
          <div className="db-stat" key={s.label}>
            <div className="db-stat-num" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="db-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="db-toolbar" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
        <div className="db-search-wrap" style={{ flex: 1, minWidth: "240px" }}>
          <Search size={14} className="db-search-ico" />
          <input
            className="db-search"
            placeholder="Search players by name, email, company…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="db-status-select"
            style={{ padding: "0.45rem 0.75rem" }}
          >
            <option value="all">All Statuses</option>
            <option value="playing">Playing</option>
            <option value="completed">Completed / Winners</option>
            <option value="disqualified">Disqualified</option>
          </select>

          <button
            type="button"
            onClick={exportToCSV}
            style={{
              padding: "0.45rem 0.9rem",
              background: "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Download size={14} />
            Export Leads (CSV)
          </button>

          <button
            type="button"
            onClick={fetchParticipants}
            disabled={loading}
            className="db-refresh"
            style={{ padding: "0.45rem 0.85rem" }}
          >
            <RefreshCw size={13} className={loading ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Multi-Winner Selection Actions Floating / Sticky Bar ── */}
      {selectedPlayerIds.length > 0 && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(2, 132, 199, 0.22), rgba(16, 185, 129, 0.22))",
            border: "1.5px solid #0284c7",
            borderRadius: "14px",
            padding: "0.85rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            boxShadow: "0 8px 25px rgba(2, 132, 199, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                background: "#0284c7",
                color: "#ffffff",
                padding: "0.25rem 0.65rem",
                borderRadius: "20px",
                fontSize: "0.82rem",
                fontWeight: 800,
              }}
            >
              {selectedPlayerIds.length} Selected
            </span>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc" }}>
              Declare as Winners for this session
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              type="button"
              onClick={() => declareSelectedWinners(false)}
              disabled={controlLoading}
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                border: "none",
                color: "#000000",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <Trophy size={14} />
              Declare As Winners
            </button>

            <button
              type="button"
              onClick={() => declareSelectedWinners(true)}
              disabled={controlLoading}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
                color: "#ffffff",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <Mail size={14} />
              Declare & Send Email Now
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlayerIds([])}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#cbd5e1",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Participants Table ── */}
      <div className="db-card">
        {loading ? (
          <div className="empty">
            <div className="empty-ico">⏳</div>
            Loading Bingo participants…
          </div>
        ) : participants.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">🎯</div>
            No participants found matching current filters.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="db-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ width: "38px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={
                        participants.length > 0 &&
                        selectedPlayerIds.length === participants.length
                      }
                      onChange={selectAllFiltered}
                      title="Select / Deselect all"
                      style={{ cursor: "pointer", width: "16px", height: "16px" }}
                    />
                  </th>
                  <th>Player & Contact</th>
                  <th>Category</th>
                  <th>Own Card</th>
                  <th>Progress</th>
                  <th>Time Taken</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((player) => (
                  <tr
                    key={player._id}
                    style={{
                      background: selectedPlayerIds.includes(player._id)
                        ? "rgba(2, 132, 199, 0.08)"
                        : player.isWinner
                        ? "rgba(245, 158, 11, 0.05)"
                        : undefined,
                    }}
                  >
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedPlayerIds.includes(player._id)}
                        onChange={() => togglePlayerSelection(player._id)}
                        style={{ cursor: "pointer", width: "16px", height: "16px" }}
                      />
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{player.fullName}</div>
                        {player.isWinner && (
                          <span
                            style={{
                              background: "rgba(245, 158, 11, 0.18)",
                              color: "#fbbf24",
                              border: "1px solid rgba(245, 158, 11, 0.4)",
                              borderRadius: "10px",
                              padding: "0.15rem 0.5rem",
                              fontSize: "0.68rem",
                              fontWeight: 800,
                            }}
                          >
                            🏆 #{player.winnerRank || "W"} WINNER
                          </span>
                        )}
                        {player.winnerEmailSentAt && (
                          <span
                            title={`Email sent at ${new Date(player.winnerEmailSentAt).toLocaleString()}`}
                            style={{
                              color: "#10b981",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            <Mail size={13} />
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{player.email}</div>
                      {player.companyName && (
                        <div style={{ fontSize: "0.75rem", color: "#0284c7", marginTop: "0.15rem" }}>
                          {player.companyName}
                          {player.designation ? ` (${player.designation})` : ""}
                        </div>
                      )}
                    </td>

                    <td>
                      <span
                        style={{
                          padding: "0.2rem 0.55rem",
                          borderRadius: "12px",
                          background: "rgba(2, 132, 199, 0.1)",
                          color: "#0284c7",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {player.category}
                      </span>
                    </td>

                    <td>
                      {player.ownVisitingCardUrl ? (
                        <button
                          type="button"
                          onClick={() => setZoomCardUrl(player.ownVisitingCardUrl!)}
                          title="Click to zoom card"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                          }}
                        >
                          <img
                            src={player.ownVisitingCardUrl}
                            alt="Own card"
                            style={{
                              width: "42px",
                              height: "28px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1.5px solid #0284c7",
                            }}
                          />
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>No card</span>
                      )}
                    </td>

                    <td>
                      <div style={{ minWidth: "120px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            marginBottom: "0.25rem",
                          }}
                        >
                          <span>{player.completedCount}/20</span>
                          <span style={{ color: player.completedCount === 20 ? "#10b981" : "#0284c7" }}>
                            {player.progressPercent}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: "6px",
                            background: "rgba(0,0,0,0.06)",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${player.progressPercent}%`,
                              height: "100%",
                              background:
                                player.completedCount === 20
                                  ? "#10b981"
                                  : "linear-gradient(90deg, #0284c7, #38bdf8)",
                              borderRadius: "3px",
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                        {formatDuration(player.timeTakenSeconds)}
                      </span>
                    </td>

                    <td>
                      <select
                        value={player.status}
                        onChange={(e) => updateStatus(player._id, e.target.value)}
                        className="db-status-select"
                        style={{
                          fontSize: "0.78rem",
                          padding: "0.3rem 0.5rem",
                          fontWeight: 700,
                          color:
                            player.status === "completed"
                              ? "#10b981"
                              : player.status === "playing"
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      >
                        <option value="playing">Playing</option>
                        <option value="completed">Completed / Winner</option>
                        <option value="disqualified">Disqualified</option>
                      </select>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <button
                          type="button"
                          onClick={() => setInspectingPlayer(player)}
                          title="View all 20 scanned visiting cards"
                          style={{
                            padding: "0.35rem 0.65rem",
                            background: "rgba(2, 132, 199, 0.1)",
                            border: "1px solid rgba(2, 132, 199, 0.25)",
                            borderRadius: "8px",
                            color: "#0284c7",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <Eye size={13} />
                          Cards ({player.completedCount})
                        </button>

                        <button
                          type="button"
                          onClick={() => declareWinner(player._id, player.fullName)}
                          title="Declare this participant as an official winner"
                          style={{
                            padding: "0.35rem 0.65rem",
                            background: player.isWinner
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(245, 158, 11, 0.15)",
                            border: player.isWinner
                              ? "1px solid rgba(16, 185, 129, 0.4)"
                              : "1px solid rgba(245, 158, 11, 0.4)",
                            borderRadius: "8px",
                            color: player.isWinner ? "#10b981" : "#fbbf24",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <Trophy size={12} />
                          {player.isWinner ? "Winner" : "Make Winner"}
                        </button>

                        <button
                          type="button"
                          onClick={() => resetSinglePlayer(player._id, player.fullName)}
                          title="Restart / Reset game to 0/20 for this player"
                          style={{
                            padding: "0.35rem 0.6rem",
                            background: "rgba(245, 158, 11, 0.12)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            borderRadius: "8px",
                            color: "#d97706",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <RotateCcw size={12} />
                          Reset
                        </button>

                        <button
                          type="button"
                          onClick={() => deletePlayer(player._id)}
                          title="Delete player"
                          style={{
                            padding: "0.35rem 0.5rem",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "none",
                            borderRadius: "8px",
                            color: "#ef4444",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detailed 20-Cards Inspection Modal ── */}
      {inspectingPlayer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(10, 15, 29, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            overscrollBehavior: "contain",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectingPlayer(null);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "960px",
              background: "#0f172a",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#f8fafc",
              overflow: "hidden",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
                    {inspectingPlayer.fullName} — Scanned Cards Review
                  </h3>
                  <span
                    style={{
                      background: inspectingPlayer.status === "completed" ? "#10b981" : "#f59e0b",
                      color: "#fff",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      padding: "0.15rem 0.5rem",
                      borderRadius: "10px",
                      textTransform: "uppercase",
                    }}
                  >
                    {inspectingPlayer.status}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                  {inspectingPlayer.email} • {inspectingPlayer.companyName || inspectingPlayer.category} •{" "}
                  <strong>{inspectingPlayer.completedCount}/20 Challenges Completed</strong>
                  {inspectingPlayer.timeTakenSeconds
                    ? ` in ${formatDuration(inspectingPlayer.timeTakenSeconds)}`
                    : ""}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingPlayer(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#cbd5e1",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 20 Cards Grid View */}
            <div
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1rem",
              }}
            >
              {BINGO_CHALLENGES.map((challenge) => {
                const tile = inspectingPlayer.tiles?.find((t) => t.tileNumber === challenge.id);
                const isCompleted = !!tile?.completed;

                return (
                  <div
                    key={challenge.id}
                    style={{
                      background: isCompleted ? "rgba(16, 185, 129, 0.08)" : "rgba(30, 41, 59, 0.5)",
                      border: isCompleted
                        ? "1.5px solid #10b981"
                        : "1px dashed rgba(255, 255, 255, 0.15)",
                      borderRadius: "14px",
                      padding: "0.85rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "0.6rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <span
                          style={{
                            background: isCompleted ? "#10b981" : "#0284c7",
                            color: "#fff",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            padding: "0.15rem 0.5rem",
                            borderRadius: "10px",
                          }}
                        >
                          #{challenge.id}
                        </span>

                        {isCompleted ? (
                          <span
                            style={{
                              color: "#34d399",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: "0.2rem",
                            }}
                          >
                            <CheckCircle size={12} /> Verified
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>Pending</span>
                        )}
                      </div>

                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#f8fafc", lineHeight: 1.3 }}>
                        {challenge.statement}
                      </div>
                    </div>

                    {/* Scanned Card Photo */}
                    {isCompleted && tile?.cardPhotoUrl ? (
                      <div style={{ marginTop: "0.25rem" }}>
                        <button
                          type="button"
                          onClick={() => setZoomCardUrl(tile.cardPhotoUrl!)}
                          style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            position: "relative",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={tile.cardPhotoUrl}
                            alt="Scanned card"
                            style={{
                              width: "100%",
                              height: "110px",
                              objectFit: "cover",
                              display: "block",
                              borderRadius: "8px",
                              border: "1px solid rgba(16, 185, 129, 0.4)",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(0,0,0,0.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0,
                              transition: "opacity 0.2s",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: "0.78rem",
                              gap: "0.3rem",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                          >
                            <Eye size={14} /> Click to Zoom
                          </div>
                        </button>

                        {(tile.contactName || tile.contactCompany) && (
                          <div style={{ marginTop: "0.35rem", fontSize: "0.72rem", color: "#cbd5e1" }}>
                            <strong>Met:</strong> {tile.contactName}
                            {tile.contactCompany ? ` (${tile.contactCompany})` : ""}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          height: "90px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748b",
                          fontSize: "0.75rem",
                          background: "rgba(0,0,0,0.2)",
                          borderRadius: "8px",
                        }}
                      >
                        No card uploaded yet
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Zoom Lightbox Modal ── */}
      {zoomCardUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setZoomCardUrl(null)}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <button
              type="button"
              onClick={() => setZoomCardUrl(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                background: "none",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              <X size={28} />
            </button>
            <img
              src={zoomCardUrl}
              alt="Zoomed visiting card"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                borderRadius: "12px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
                display: "block",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
