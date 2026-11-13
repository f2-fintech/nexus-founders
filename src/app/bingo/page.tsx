"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Trophy,
  Clock,
  Sparkles,
  BookOpen,
  Camera,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Gift,
  X,
  Play,
  Share2,
  Square,
  Gamepad2,
} from "lucide-react";
import { BINGO_CHALLENGES } from "@/lib/bingo-challenges";
import BingoTileCard from "@/components/bingo/BingoTileCard";
import BingoCameraModal from "@/components/bingo/BingoCameraModal";
import BingoRegistrationModal from "@/components/bingo/BingoRegistrationModal";
import BingoLeaderboardModal from "@/components/bingo/BingoLeaderboardModal";
import BingoLevelUpModal from "@/components/bingo/BingoLevelUpModal";
import { ClientBingoParticipant } from "@/models/BingoParticipant";
import Navbar from "@/components/Navbar";
import "./bingo.css";

const TOTAL_TIME_SECONDS = 120 * 60; // 120 Minutes

export default function BingoPage() {
  const [participant, setParticipant] = useState<ClientBingoParticipant | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [gameConfig, setGameConfig] = useState<{
    isGameActive: boolean;
    gameState: "running" | "paused" | "stopped";
    roundNumber: number;
    currentSessionNumber?: number;
    activeSessionId?: string;
  } | null>(null);

  // Universal Winner broadcast state
  const [sessionWinner, setSessionWinner] = useState<{
    fullName: string;
    companyName?: string;
    designation?: string;
    timeTakenSeconds?: number;
    completedAt?: string | Date;
  } | null>(null);
  const [showUniversalWinnerModal, setShowUniversalWinnerModal] = useState(false);
  const lastAnnouncedWinnerRef = useRef<string | null>(null);

  // Modals
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [activeScanningTile, setActiveScanningTile] = useState<number | null>(null);
  const [previewCardUrl, setPreviewCardUrl] = useState<string | null>(null);
  const [showWinnerCelebration, setShowWinnerCelebration] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    level: number;
    tileNumber: number;
    tileTitle: string;
    contactName?: string;
    contactCompany?: string;
    cardPhotoUrl?: string;
  } | null>(null);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Fetch global game config and active session state
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/bingo/control");
      const data = await res.json();
      if (data.success && data.config) {
        setGameConfig(data.config);

        // 1. Check for Winner Broadcast (triggers celebration on all devices)
        if (data.winner) {
          setSessionWinner(data.winner);
          const winnerKey = `${data.winner.fullName}_${data.winner.timeTakenSeconds}`;
          if (lastAnnouncedWinnerRef.current !== winnerKey) {
            lastAnnouncedWinnerRef.current = winnerKey;
            setShowUniversalWinnerModal(true);
          }
        } else {
          setSessionWinner(null);
        }

        // 2. Multi-Session Sync: If admin started a new round, reset local session for clean slate
        if (data.activeSessionId) {
          const storedSessionId =
            typeof window !== "undefined"
              ? localStorage.getItem("nexus_bingo_session_id")
              : null;

          if (storedSessionId && storedSessionId !== data.activeSessionId) {
            // A brand new game round has started!
            localStorage.removeItem("nexus_bingo_token");
            localStorage.removeItem("nexus_bingo_session_id");
            setParticipant(null);
            setIsRegModalOpen(true);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    const interval = setInterval(fetchConfig, 3500);
    return () => clearInterval(interval);
  }, [fetchConfig]);

  // 1. Session Restoration on load
  const restoreSession = useCallback(async () => {
    setLoadingSession(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("nexus_bingo_token") : null;
    if (!token) {
      setLoadingSession(false);
      return;
    }

    try {
      const res = await fetch(`/api/bingo/register?token=${token}`);
      const data = await res.json();
      if (data.success && data.participant) {
        setParticipant(data.participant);
        if (data.participant.sessionId) {
          localStorage.setItem("nexus_bingo_session_id", String(data.participant.sessionId));
        }
        // If participant finished previously, show celebrate
        if (data.participant.status === "completed") {
          setShowWinnerCelebration(true);
        }
      }
    } catch (err) {
      console.error("Session restore error:", err);
    } finally {
      setLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // 2. Timer Countdown calculation
  useEffect(() => {
    if (!participant || participant.status === "completed") return;

    const startMs = new Date(participant.startedAt).getTime();

    const interval = setInterval(() => {
      const nowMs = Date.now();
      const diffSecs = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setElapsedSeconds(diffSecs);

      // Auto-complete if 120 minutes expire
      if (diffSecs >= TOTAL_TIME_SECONDS && participant.status !== "completed") {
        setShowWinnerCelebration(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [participant]);

  const remainingSeconds = Math.max(0, TOTAL_TIME_SECONDS - elapsedSeconds);
  const isTimeUp = remainingSeconds === 0 && !!participant;

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, "0")}m ${remainingSecs
        .toString()
        .padStart(2, "0")}s`;
    }
    return `${mins.toString().padStart(2, "0")}:${remainingSecs
      .toString()
      .padStart(2, "0")}`;
  };

  // 3. Tile Scanning Callback
  const handleCaptureComplete = useCallback(
    async (data: {
      photoUrl: string;
      contactName?: string;
      contactCompany?: string;
    }) => {
      if (!participant || activeScanningTile === null) return;

      try {
        const res = await fetch("/api/bingo/tile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionToken: participant.sessionToken,
            tileNumber: activeScanningTile,
            cardPhotoUrl: data.photoUrl,
            contactName: data.contactName,
            contactCompany: data.contactCompany,
          }),
        });

        const resData = await res.json();
        if (!resData.success) {
          throw new Error(resData.error || "Failed to update tile");
        }

        const currentTileNum = activeScanningTile;
        const currentChallenge = BINGO_CHALLENGES.find((c) => c.id === currentTileNum);

        setParticipant(resData.participant);

        const newLevel = resData.completedCount || ((participant?.completedCount || 0) + 1);

        // Always show the congratulatory Level Up celebration modal
        setLevelUpData({
          level: newLevel,
          tileNumber: currentTileNum,
          tileTitle: currentChallenge?.statement || `Challenge #${currentTileNum}`,
          contactName: data.contactName,
          contactCompany: data.contactCompany,
          cardPhotoUrl: data.photoUrl,
        });
        setShowLevelUpModal(true);
      } catch (err: any) {
        alert(`Error updating tile: ${err.message}`);
      } finally {
        setActiveScanningTile(null);
      }
    },
    [participant, activeScanningTile]
  );

  // Progress metrics
  const completedCount = participant?.completedCount || 0;
  const progressPercent = participant?.progressPercent || 0;
  const remainingCount = 20 - completedCount;

  // Active challenge for camera modal
  const activeChallenge = useMemo(() => {
    if (activeScanningTile === null) return null;
    return BINGO_CHALLENGES.find((c) => c.id === activeScanningTile) || null;
  }, [activeScanningTile]);

  const isGameStopped = gameConfig?.gameState === "stopped";
  const isGamePaused = gameConfig?.gameState === "paused";

  return (
    <div className="bingo-page-container">
      <Navbar />
      <div className="bingo-container">
        <div className="bingo-wrapper">


          {/* Paused Banner if game is paused by admin */}
          {isGamePaused && (
            <div
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                border: "1.5px solid rgba(245, 158, 11, 0.4)",
                borderRadius: "16px",
                padding: "1rem 1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                color: "#fbbf24",
                fontWeight: 700,
                fontSize: "0.95rem",
              }}
            >
              <AlertTriangle size={20} />
              <span>Nexus Bingo is currently PAUSED by event organisers. Card scanning will resume shortly!</span>
            </div>
          )}

          {/* ── Top Header Banner ── */}
          <div className="bingo-header-card">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                fontSize: "0.82rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                background: "rgba(2, 132, 199, 0.15)",
                color: "#38bdf8",
                padding: "0.3rem 0.9rem",
                borderRadius: "30px",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                marginBottom: "0.5rem",
              }}
            >
              <Sparkles size={14} />
              F2 Fintech Presents
            </div>

            <h1 className="bingo-title">Nexus Founders Bingo</h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                margin: "0.25rem 0",
                fontWeight: 800,
                fontSize: "0.85rem",
                letterSpacing: "0.15em",
                color: "#38bdf8",
                textTransform: "uppercase",
              }}
            >
              <span>MEET</span>
              <span>•</span>
              <span>CONNECT</span>
              <span>•</span>
              <span>COLLABORATE</span>
            </div>

            <p className="bingo-subtitle">
              Find fellow Singapore FinTech Festival attendees matching each statement. Start a
              genuine conversation, snap their visiting card, and complete all 20 challenges to win
              the exclusive F2 Fintech Gift Hamper!
            </p>

            {/* Action Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.85rem",
                flexWrap: "wrap",
              }}
            >
              {loadingSession ? (
                <>
                  <div
                    className="bingo-skeleton"
                    style={{ width: "220px", height: "48px", borderRadius: "14px" }}
                  />
                  <div
                    className="bingo-skeleton"
                    style={{ width: "155px", height: "48px", borderRadius: "14px" }}
                  />
                  <div
                    className="bingo-skeleton"
                    style={{ width: "165px", height: "48px", borderRadius: "14px" }}
                  />
                </>
              ) : isGameStopped ? (
                <div
                  style={{
                    padding: "0.85rem 1.6rem",
                    borderRadius: "14px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1.5px solid rgba(239, 68, 68, 0.35)",
                    color: "#f87171",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.55rem",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "inline-block",
                      boxShadow: "0 0 10px #ef4444",
                    }}
                  />
                  <span>Session Offline • No Game In Process</span>
                </div>
              ) : !participant ? (
                <button
                  type="button"
                  onClick={() => setIsRegModalOpen(true)}
                  style={{
                    padding: "0.9rem 2rem",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    boxShadow: "0 8px 25px rgba(2, 132, 199, 0.4)",
                    transition: "transform 0.15s, opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Play size={18} fill="#fff" />
                  Start The Game (120 Mins)
                </button>
              ) : (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    padding: "0.45rem 1rem",
                    borderRadius: "30px",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc" }}>
                      Player: {participant.fullName}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      {participant.companyName || participant.category}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Switch or start as a different player?")) {
                        localStorage.removeItem("nexus_bingo_token");
                        setParticipant(null);
                        setIsRegModalOpen(true);
                      }
                    }}
                    title="Switch Player"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "none",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#cbd5e1",
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>
              )}



              {/* Rules Button */}
              {!loadingSession && (
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(true)}
                  style={{
                    padding: "0.85rem 1.4rem",
                    borderRadius: "14px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#e2e8f0",
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <BookOpen size={17} />
                  Rules & Do&apos;s/Don&apos;ts
                </button>
              )}
            </div>
          </div>

          {/* ── Main Content: When Loading vs When Stopped vs When Running ── */}
          {loadingSession ? (
            /* ── Skeleton Loading Grid & Progress ── */
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
              {/* Progress Capsule Skeleton */}
              <div className="bingo-progress-capsule">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                    <div className="bingo-skeleton" style={{ width: "210px", height: "18px", borderRadius: "6px" }} />
                    <div className="bingo-skeleton" style={{ width: "150px", height: "12px", borderRadius: "4px" }} />
                  </div>
                  <div className="bingo-skeleton" style={{ width: "170px", height: "34px", borderRadius: "30px" }} />
                </div>

                <div className="bingo-skeleton" style={{ width: "100%", height: "10px", borderRadius: "6px" }} />
              </div>

              {/* 20 Cards Grid Skeleton */}
              <div className="bingo-grid">
                {Array.from({ length: 20 }).map((_, idx) => (
                  <div key={idx} className="bingo-skeleton-card">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.6rem",
                      }}
                    >
                      <div
                        className="skeleton-pulse"
                        style={{ width: "30px", height: "30px", borderRadius: "50%" }}
                      />
                      <div
                        className="skeleton-pulse"
                        style={{ width: "55px", height: "18px", borderRadius: "10px" }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.55rem",
                        margin: "0.4rem 0",
                      }}
                    >
                      <div
                        className="skeleton-pulse bingo-tile-icon-box"
                      />
                      <div
                        className="skeleton-pulse"
                        style={{ width: "85%", height: "12px", borderRadius: "4px" }}
                      />
                      <div
                        className="skeleton-pulse"
                        style={{ width: "65%", height: "12px", borderRadius: "4px" }}
                      />
                    </div>

                    <div
                      style={{
                        borderTop: "1px dashed #e2e8f0",
                        paddingTop: "0.6rem",
                        marginTop: "0.4rem",
                      }}
                    >
                      <div
                        className="skeleton-pulse"
                        style={{ width: "100%", height: "34px", borderRadius: "10px" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : isGameStopped ? (
            /* ── No Game In Process Screen ── */
            <div
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85))",
                border: "1.5px dashed rgba(56, 189, 248, 0.3)",
                borderRadius: "24px",
                padding: "3.5rem 2rem",
                textAlign: "center",
                maxWidth: "740px",
                margin: "1rem auto 2.5rem auto",
                boxShadow: "0 20px 45px rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Glowing Icon Badge */}
              <div
                style={{
                  width: "84px",
                  height: "84px",
                  margin: "0 auto 1.5rem auto",
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(56, 189, 248, 0.08))",
                  border: "1.5px solid rgba(56, 189, 248, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#38bdf8",
                  boxShadow: "0 0 35px rgba(56, 189, 248, 0.25)",
                }}
              >
                <Gamepad2 size={42} />
              </div>

              {/* Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#f87171",
                  padding: "0.3rem 0.95rem",
                  borderRadius: "30px",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  marginBottom: "1rem",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#ef4444",
                    display: "inline-block",
                  }}
                />
                Round Offline • Stand By
              </div>

              <h2
                style={{
                  fontSize: "2.1rem",
                  fontWeight: 900,
                  color: "#f8fafc",
                  marginBottom: "1rem",
                  lineHeight: 1.25,
                }}
              >
                No Game Is Currently In Process
              </h2>

              <p
                style={{
                  fontSize: "1.05rem",
                  color: "#cbd5e1",
                  maxWidth: "580px",
                  margin: "0 auto 2.25rem auto",
                  lineHeight: 1.6,
                }}
              >
                The Nexus Networking Bingo round is not running at this moment. Please wait for the event coordinators to kick off the next round or announce the start on stage at the Singapore FinTech Festival!
              </p>

              {/* Highlight Cards Preview */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "1rem",
                  margin: "0 auto 2.5rem auto",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "14px",
                    padding: "1rem 1.1rem",
                  }}
                >
                  <div style={{ color: "#38bdf8", fontWeight: 800, fontSize: "0.92rem", marginBottom: "0.3rem" }}>
                    🎯 20 Challenges
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.45 }}>
                    Meet SFF founders, investors, and fintech leaders across Singapore.
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "14px",
                    padding: "1rem 1.1rem",
                  }}
                >
                  <div style={{ color: "#10b981", fontWeight: 800, fontSize: "0.92rem", marginBottom: "0.3rem" }}>
                    📸 Live Card Scan
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.45 }}>
                    Snap physical visiting cards live with camera to verify connections.
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "14px",
                    padding: "1rem 1.1rem",
                  }}
                >
                  <div style={{ color: "#fbbf24", fontWeight: 800, fontSize: "0.92rem", marginBottom: "0.3rem" }}>
                    🎁 Gift Hamper
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.45 }}>
                    Exclusive F2 Fintech Gift Hamper for the first winner to complete all 20!
                  </div>
                </div>
              </div>

              {/* Action buttons inside stopped card */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(true)}
                  style={{
                    padding: "0.85rem 1.5rem",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#e2e8f0",
                    fontWeight: 600,
                    fontSize: "0.92rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <BookOpen size={16} />
                  Read Rules & Guidelines
                </button>
              </div>
            </div>
          ) : (
            /* ── When Running or Paused: Show Active Game Board ── */
            <>
              {/* ── Active Game Progress & Timer Capsule ── */}
              {participant && (
                <div className="bingo-progress-capsule">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#f8fafc" }}>
                        Your Game Progress: {progressPercent}%
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "0.15rem" }}>
                        {completedCount} of 20 Challenges Verified •{" "}
                        <span style={{ color: remainingCount === 0 ? "#10b981" : "#38bdf8", fontWeight: 700 }}>
                          {remainingCount === 0 ? "All Complete! 🎉" : `${remainingCount} remaining`}
                        </span>
                      </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="bingo-timer-pill">
                      <Clock size={16} />
                      <span>
                        {participant.status === "completed"
                          ? `Finished in ${formatTime(participant.timeTakenSeconds || 0)}`
                          : `Time Remaining: ${formatTime(remainingSeconds)}`}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div
                    style={{
                      height: "10px",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "6px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: `${progressPercent}%`,
                        height: "100%",
                        background:
                          progressPercent === 100
                            ? "linear-gradient(90deg, #10b981, #34d399)"
                            : "linear-gradient(90deg, #0284c7, #38bdf8)",
                        borderRadius: "6px",
                        transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: "0 0 12px rgba(56, 189, 248, 0.5)",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ── 20 Bingo Cards Grid ── */}
              <div className="bingo-grid">
                {BINGO_CHALLENGES.map((challenge) => {
                  const tileData = participant?.tiles?.find((t) => t.tileNumber === challenge.id);

                  return (
                    <BingoTileCard
                      key={challenge.id}
                      challenge={challenge}
                      tileData={tileData}
                      onScanClick={() => {
                        if (gameConfig?.gameState === "stopped") {
                          alert("No game is currently in process. Please wait for organizers to start the round!");
                          return;
                        }
                        if (gameConfig?.gameState === "paused") {
                          alert("Nexus Bingo is currently PAUSED by event organisers. Please wait for the round to resume!");
                          return;
                        }
                        if (isTimeUp || participant?.status === "completed") {
                          setShowWinnerCelebration(true);
                          return;
                        }
                        if (!participant) {
                          setIsRegModalOpen(true);
                        } else {
                          setActiveScanningTile(challenge.id);
                        }
                      }}
                      onViewCardClick={(url) => setPreviewCardUrl(url)}
                    />
                  );
                })}
              </div>
            </>
          )}

          {/* ── Bottom Event Footer ── */}
          <div
            style={{
              textAlign: "center",
              padding: "2rem 1rem",
              color: "#64748b",
              fontSize: "0.85rem",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "#38bdf8",
                fontWeight: 700,
                marginBottom: "0.35rem",
              }}
            >
              <Gift size={16} />
              Exclusive F2 Fintech Gift Hampers for Challenge Winners
            </div>
            <div>Winners announced on 20 November via Email notification</div>
            <div style={{ marginTop: "0.25rem", color: "#475569" }}>Singapore FinTech Festival Edition • Nexus Founders</div>
          </div>
        </div>

        {/* ── Registration Modal ── */}
        <BingoRegistrationModal
          isOpen={isRegModalOpen}
          onClose={() => setIsRegModalOpen(false)}
          onRegistered={(newParticipant) => {
            setParticipant(newParticipant);
            if (newParticipant.sessionId) {
              localStorage.setItem("nexus_bingo_session_id", String(newParticipant.sessionId));
            }
          }}
        />

        {/* ── Camera Scanner Modal for Challenge Tiles ── */}
        {activeChallenge && (
          <BingoCameraModal
            isOpen={activeScanningTile !== null}
            onClose={() => setActiveScanningTile(null)}
            title={`Scan Card: Challenge #${activeChallenge.id}`}
            subtitle={activeChallenge.statement}
            onCaptureComplete={handleCaptureComplete}
          />
        )}

        {/* ── Gamified Level Up Celebration Modal ── */}
        {levelUpData && (
          <BingoLevelUpModal
            isOpen={showLevelUpModal}
            onClose={() => {
              setShowLevelUpModal(false);
              if (levelUpData.level >= 20) {
                setShowWinnerCelebration(true);
              }
            }}
            level={levelUpData.level}
            tileNumber={levelUpData.tileNumber}
            tileTitle={levelUpData.tileTitle}
            contactName={levelUpData.contactName}
            contactCompany={levelUpData.contactCompany}
            cardPhotoUrl={levelUpData.cardPhotoUrl}
            onCompleteAll={() => {
              setShowLevelUpModal(false);
              setShowWinnerCelebration(true);
            }}
          />
        )}

        {/* ── Live Leaderboard Modal ── */}
        <BingoLeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
          currentParticipantId={participant?._id ? String(participant._id) : undefined}
        />

        {/* ── Rules & Guidelines Modal ── */}
        {isRulesModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              background: "rgba(10, 15, 29, 0.85)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
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
              if (e.target === e.currentTarget) setIsRulesModalOpen(false);
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "580px",
                margin: "auto",
                background: "#0f172a",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#f8fafc",
                overflow: "hidden",
                maxHeight: "calc(100dvh - 2rem)",
                display: "flex",
                flexDirection: "column",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>
                  Nexus Networking Bingo — Rules & Guidelines
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.88rem", lineHeight: 1.5 }}>
                <div>
                  <h4 style={{ margin: "0 0 0.35rem", color: "#38bdf8", fontWeight: 700 }}>
                    1. How to Play
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#cbd5e1" }}>
                    <li>Register with your Name, Email, Designation, and Category (Exhibitor / Visitor).</li>
                    <li>The 120-minute timer starts immediately upon registration.</li>
                    <li>Find attendees at SFF who match the statements on your Bingo card.</li>
                    <li>Scan their visiting card via the webpage camera to mark challenges complete.</li>
                    <li>Complete all 20 challenges to win!</li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ margin: "0 0 0.35rem", color: "#10b981", fontWeight: 700 }}>
                    2. DO&apos;s
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#cbd5e1" }}>
                    <li>Introduce yourself before starting a conversation.</li>
                    <li>Ask relevant questions and interact genuinely.</li>
                    <li>Meet people from different companies and countries.</li>
                    <li>Scan the correct person&apos;s visiting card.</li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ margin: "0 0 0.35rem", color: "#ef4444", fontWeight: 700 }}>
                    3. DON&apos;Ts
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#cbd5e1" }}>
                    <li>Don&apos;t scan visiting cards without permission.</li>
                    <li>Don&apos;t mark challenges without genuine interactions.</li>
                    <li>Don&apos;t use the same person&apos;s card for multiple challenges.</li>
                    <li>Don&apos;t share misleading or fake information.</li>
                  </ul>
                </div>

                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "12px",
                    padding: "0.85rem",
                    color: "#fbbf24",
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: "0.25rem" }}>
                    🏆 Winner Prize:
                  </div>
                  <div>
                    The first participant to complete and verify all 20 challenges receives an
                    exclusive <strong>F2 Fintech Gift Hamper</strong>! The organisers&apos; decision will be final.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Zoom Lightbox for Visiting Cards ── */}
        {previewCardUrl && (
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
            onClick={() => setPreviewCardUrl(null)}
          >
            <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
              <button
                type="button"
                onClick={() => setPreviewCardUrl(null)}
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
                src={previewCardUrl}
                alt="Scanned visiting card full view"
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

        {/* ── Universal Winner Celebration Modal ── */}
        {(showWinnerCelebration || showUniversalWinnerModal) && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(10, 15, 29, 0.88)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
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
              if (e.target === e.currentTarget) {
                setShowWinnerCelebration(false);
                setShowUniversalWinnerModal(false);
              }
            }}
          >
            <div
              className="bingo-winner-modal"
              style={{
                width: "100%",
                maxWidth: "520px",
                margin: "auto",
                background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                borderRadius: "24px",
                border: "2px solid #f59e0b",
                boxShadow: "0 25px 60px rgba(245, 158, 11, 0.35)",
                padding: "1.75rem 1.4rem",
                textAlign: "center",
                color: "#f8fafc",
                maxHeight: "calc(100dvh - 2rem)",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div
                style={{
                  fontSize: "3rem",
                  marginBottom: "0.35rem",
                }}
              >
                🎉 ⏱️ ✉️
              </div>

              <h2
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "1.6rem",
                  fontWeight: 900,
                  color: "#f59e0b",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                {remainingSeconds === 0 && (participant?.completedCount || 0) < 20
                  ? "Time's Up! Challenge Complete"
                  : "Challenge Completed!"}
              </h2>

              <p style={{ fontSize: "0.95rem", color: "#cbd5e1", lineHeight: 1.55, margin: "0.5rem 0 1.15rem" }}>
                Outstanding effort, <strong>{participant?.fullName}</strong>! You completed{" "}
                <strong style={{ color: "#38bdf8" }}>{participant?.completedCount || 0} of 20</strong> networking
                challenges during your 120-minute round at Singapore FinTech Festival.
              </p>

              <div
                style={{
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1.5px solid rgba(245, 158, 11, 0.35)",
                  borderRadius: "16px",
                  padding: "1rem 1.15rem",
                  marginBottom: "1.25rem",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fbbf24", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span>📢</span> Winner Announcement & Booth Collection
                </div>
                <div style={{ fontSize: "0.85rem", color: "#e2e8f0", lineHeight: 1.55 }}>
                  The official winners will be announced on <strong>20 November</strong>. You can collect your exclusive gift hamper at <strong>Hall 5 - Booth 5K33-B (F2 Fintech)</strong>. Winners will also receive an email at <code style={{ color: "#38bdf8", background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>{participant?.email}</code>.
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowWinnerCelebration(false);
                    setShowUniversalWinnerModal(false);
                  }}
                  style={{
                    padding: "0.85rem 2rem",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    border: "none",
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                  }}
                >
                  Got It, Thank You!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
