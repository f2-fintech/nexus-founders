"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Trophy, X, RefreshCw, Clock, CheckCircle, Users } from "lucide-react";

interface LeaderboardItem {
  _id: string;
  fullName: string;
  companyName?: string;
  designation?: string;
  category: string;
  completedCount: number;
  progressPercent: number;
  status: "playing" | "completed" | "disqualified";
  startedAt: string;
  completedAt?: string;
  timeTakenSeconds?: number;
  ownVisitingCardUrl?: string;
}

interface BingoLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParticipantId?: string;
}

export default function BingoLeaderboardModal({
  isOpen,
  onClose,
  currentParticipantId,
}: BingoLeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalCompleted: 0,
    totalCardsScanned: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bingo/leaderboard?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
        setStats(data.stats || { totalParticipants: 0, totalCompleted: 0, totalCardsScanned: 0 });
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
      // Poll every 8 seconds while leaderboard is open
      const interval = setInterval(fetchLeaderboard, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchLeaderboard]);

  if (!isOpen) return null;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        background: "rgba(10, 15, 29, 0.82)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "1rem 0.75rem",
        overflowY: "auto",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          margin: "auto",
          background: "#0f172a",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
          overflow: "hidden",
          color: "#f8fafc",
          maxHeight: "calc(100dvh - 2rem)",
          display: "flex",
          flexDirection: "column",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Header */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trophy size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#f8fafc" }}>
                Live Networking Leaderboard
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>
                First participant to complete all 20 challenges wins the prize!
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={fetchLeaderboard}
              disabled={loading}
              title="Refresh Leaderboard"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "none",
                borderRadius: "50%",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={onClose}
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
        </div>

        {/* Quick Stats Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            padding: "0.85rem 1.25rem",
            background: "rgba(2, 6, 23, 0.6)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            textAlign: "center",
            gap: "0.5rem",
          }}
        >
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#38bdf8" }}>
              {stats.totalParticipants}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase" }}>
              Total Players
            </div>
          </div>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#10b981" }}>
              {stats.totalCompleted}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase" }}>
              Winners / Finished
            </div>
          </div>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f59e0b" }}>
              {stats.totalCardsScanned}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase" }}>
              Cards Exchanged
            </div>
          </div>
        </div>

        {/* Players List */}
        <div style={{ padding: "1rem 1.25rem", overflowY: "auto", flex: 1 }}>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#94a3b8" }}>
              <Users size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>
                No active players yet!
              </p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                Be the first to register and top the SFF Bingo leaderboard.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {leaderboard.map((player, idx) => {
                const isCurrent = player._id === currentParticipantId;
                const isWinner = player.status === "completed" && idx === 0;

                return (
                  <div
                    key={player._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.85rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      background: isCurrent
                        ? "rgba(2, 132, 199, 0.15)"
                        : isWinner
                        ? "rgba(245, 158, 11, 0.12)"
                        : "rgba(30, 41, 59, 0.6)",
                      border: isCurrent
                        ? "1.5px solid #0284c7"
                        : isWinner
                        ? "1.5px solid #f59e0b"
                        : "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    {/* Rank Badge */}
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.88rem",
                        flexShrink: 0,
                        background:
                          idx === 0
                            ? "linear-gradient(135deg, #f59e0b, #d97706)"
                            : idx === 1
                            ? "linear-gradient(135deg, #94a3b8, #64748b)"
                            : idx === 2
                            ? "linear-gradient(135deg, #b45309, #78350f)"
                            : "rgba(255, 255, 255, 0.08)",
                        color: "#ffffff",
                      }}
                    >
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                    </div>

                    {/* Player Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: "#f8fafc",
                        }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {player.fullName}
                        </span>
                        {isCurrent && (
                          <span
                            style={{
                              background: "#0284c7",
                              color: "#fff",
                              fontSize: "0.68rem",
                              padding: "0.1rem 0.45rem",
                              borderRadius: "10px",
                              fontWeight: 700,
                            }}
                          >
                            You
                          </span>
                        )}
                        {isWinner && (
                          <span
                            style={{
                              background: "#f59e0b",
                              color: "#000",
                              fontSize: "0.68rem",
                              padding: "0.1rem 0.45rem",
                              borderRadius: "10px",
                              fontWeight: 800,
                            }}
                          >
                            WINNER
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.15rem" }}>
                        {player.companyName || player.category}
                        {player.designation ? ` • ${player.designation}` : ""}
                      </div>

                      {/* Progress Bar inside row */}
                      <div
                        style={{
                          marginTop: "0.4rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: "6px",
                            borderRadius: "4px",
                            background: "rgba(255, 255, 255, 0.1)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${player.progressPercent}%`,
                              height: "100%",
                              background:
                                player.status === "completed"
                                  ? "#10b981"
                                  : "linear-gradient(90deg, #0284c7, #38bdf8)",
                              borderRadius: "4px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#38bdf8" }}>
                          {player.completedCount}/20 ({player.progressPercent}%)
                        </span>
                      </div>
                    </div>

                    {/* Completion Time / Status */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {player.status === "completed" ? (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#34d399",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          <CheckCircle size={13} />
                          {formatDuration(player.timeTakenSeconds)}
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            color: "#94a3b8",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          <Clock size={12} />
                          Playing
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
