"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Sparkles,
  Zap,
  CheckCircle2,
  Award,
  ArrowRight,
  PartyPopper,
  Flame,
  Star,
  X,
  UserCheck,
} from "lucide-react";

interface BingoLevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  tileNumber: number;
  tileTitle?: string;
  contactName?: string;
  contactCompany?: string;
  cardPhotoUrl?: string;
  onCompleteAll?: () => void;
}

function getLevelBadge(level: number) {
  if (level >= 20) {
    return {
      title: "Grand SFF Champion",
      tier: "Max Rank",
      icon: Trophy,
      color: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.45)",
    };
  }
  if (level >= 16) {
    return {
      title: "Ecosystem Champion",
      tier: "Diamond Rank",
      icon: Flame,
      color: "#ec4899",
      glow: "rgba(236, 72, 153, 0.4)",
    };
  }
  if (level >= 11) {
    return {
      title: "Networking Pro",
      tier: "Gold Rank",
      icon: Award,
      color: "#8b5cf6",
      glow: "rgba(139, 92, 246, 0.4)",
    };
  }
  if (level >= 6) {
    return {
      title: "Super Connector",
      tier: "Silver Rank",
      icon: Star,
      color: "#06b6d4",
      glow: "rgba(6, 182, 212, 0.4)",
    };
  }
  if (level >= 3) {
    return {
      title: "Active Networker",
      tier: "Bronze Rank",
      icon: Zap,
      color: "#10b981",
      glow: "rgba(16, 185, 129, 0.4)",
    };
  }
  return {
    title: "First Connection",
    tier: "Rookie Rank",
    icon: Sparkles,
    color: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.4)",
  };
}

// Play pleasant web audio level-up chime
function playLevelUpChime() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (major arpeggio)
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const start = ctx.currentTime + idx * 0.08;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  } catch (e) {
    // Ignore audio policy blocks
  }
}

// 16 Animated Confetti Particles
const CONFETTI_PARTICLES = [
  { x: -140, y: -180, color: "#38bdf8", size: 8, delay: 0 },
  { x: -90, y: -220, color: "#10b981", size: 10, delay: 0.05 },
  { x: -30, y: -240, color: "#f59e0b", size: 7, delay: 0.1 },
  { x: 40, y: -230, color: "#ec4899", size: 9, delay: 0.08 },
  { x: 110, y: -200, color: "#8b5cf6", size: 8, delay: 0.12 },
  { x: 150, y: -160, color: "#38bdf8", size: 10, delay: 0.04 },
  { x: -160, y: -90, color: "#10b981", size: 7, delay: 0.15 },
  { x: 170, y: -80, color: "#f59e0b", size: 9, delay: 0.06 },
  { x: -130, y: 30, color: "#ec4899", size: 8, delay: 0.11 },
  { x: 140, y: 40, color: "#8b5cf6", size: 10, delay: 0.13 },
  { x: -80, y: 120, color: "#38bdf8", size: 9, delay: 0.07 },
  { x: 70, y: 130, color: "#10b981", size: 7, delay: 0.09 },
  { x: -110, y: -130, color: "#f59e0b", size: 8, delay: 0.03 },
  { x: 100, y: -120, color: "#38bdf8", size: 9, delay: 0.14 },
  { x: 0, y: -210, color: "#ec4899", size: 11, delay: 0.02 },
  { x: 0, y: 100, color: "#8b5cf6", size: 8, delay: 0.16 },
];

export default function BingoLevelUpModal({
  isOpen,
  onClose,
  level,
  tileNumber,
  tileTitle,
  contactName,
  contactCompany,
  cardPhotoUrl,
  onCompleteAll,
}: BingoLevelUpModalProps) {
  const badge = getLevelBadge(level);
  const BadgeIcon = badge.icon;
  const progressPercent = Math.min(100, Math.round((level / 20) * 100));
  const remainingCount = Math.max(0, 20 - level);
  const isFinalLevel = level >= 20;

  useEffect(() => {
    if (isOpen) {
      playLevelUpChime();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(10, 15, 29, 0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
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
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.75, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 360, damping: 25 }}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "480px",
            margin: "auto",
            maxHeight: "calc(100dvh - 2rem)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            background: "linear-gradient(145deg, #131d33 0%, #0b1120 100%)",
            borderRadius: "24px",
            border: `2px solid ${badge.color}`,
            boxShadow: `0 25px 60px rgba(0, 0, 0, 0.65), 0 0 35px ${badge.glow}`,
            padding: "1.75rem 1.4rem",
            textAlign: "center",
            color: "#f8fafc",
            boxSizing: "border-box",
          }}
        >
          {/* Confetti Particles */}
          <div style={{ position: "absolute", top: "50%", left: "50%", pointerEvents: "none" }}>
            {CONFETTI_PARTICLES.map((p, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  scale: [0, 1.4, 1],
                  opacity: [1, 1, 0.75],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 0.9,
                  delay: p.delay,
                  ease: "easeOut",
                }}
                style={{
                  position: "absolute",
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  borderRadius: i % 2 === 0 ? "50%" : "3px",
                  background: p.color,
                  boxShadow: `0 0 10px ${p.color}`,
                }}
              />
            ))}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              cursor: "pointer",
              transition: "all 0.2s ease",
              zIndex: 10,
            }}
          >
            <X size={16} />
          </button>

          {/* Top Level Up Pill */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 1.15rem",
              borderRadius: "30px",
              background: `linear-gradient(135deg, ${badge.color}22, ${badge.color}44)`,
              border: `1.5px solid ${badge.color}`,
              color: badge.color,
              fontWeight: 800,
              fontSize: "0.82rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "1rem",
              boxShadow: `0 0 15px ${badge.glow}`,
            }}
          >
            <PartyPopper size={15} />
            <span>LEVEL UP! CHALLENGE COMPLETED</span>
          </motion.div>

          {/* Animated Big Badge Icon */}
          <motion.div
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 18, delay: 0.15 }}
            style={{
              width: "82px",
              height: "82px",
              margin: "0 auto 1.1rem auto",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${badge.color}33 0%, rgba(15, 23, 42, 0.8) 100%)`,
              border: `2.5px solid ${badge.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: badge.color,
              boxShadow: `0 0 35px ${badge.glow}, inset 0 0 15px ${badge.color}33`,
            }}
          >
            <BadgeIcon size={42} strokeWidth={2.2} />
          </motion.div>

          {/* Congratulations Title */}
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              margin: "0 0 0.35rem 0",
              lineHeight: 1.2,
              background: "linear-gradient(135deg, #ffffff 30%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Congratulations!
          </h2>

          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: badge.color,
              marginBottom: "1.15rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
            }}
          >
            <span>You Reached Level {level}</span>
            <span style={{ fontSize: "0.85rem", opacity: 0.85 }}>• {badge.title}</span>
          </div>

          {/* Challenge Completed Box */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "1rem 1.15rem",
              marginBottom: "1.25rem",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
                color: "#10b981",
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "0.35rem",
              }}
            >
              <CheckCircle2 size={16} />
              <span>Challenge #{tileNumber} Completed</span>
            </div>

            {tileTitle && (
              <div
                style={{
                  fontSize: "0.92rem",
                  color: "#e2e8f0",
                  fontWeight: 600,
                  lineHeight: 1.45,
                  marginBottom: contactName ? "0.6rem" : "0",
                }}
              >
                &ldquo;{tileTitle}&rdquo;
              </div>
            )}

            {/* Connected contact pill if available */}
            {contactName && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  background: "rgba(2, 132, 199, 0.15)",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "20px",
                  fontSize: "0.82rem",
                  color: "#38bdf8",
                  fontWeight: 600,
                  marginTop: "0.35rem",
                }}
              >
                <UserCheck size={14} />
                <span>
                  Connected: <strong>{contactName}</strong>
                  {contactCompany ? ` (${contactCompany})` : ""}
                </span>
              </div>
            )}

            {cardPhotoUrl && (
              <div style={{ marginTop: "0.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <img
                  src={cardPhotoUrl}
                  alt="Scanned card thumbnail"
                  style={{
                    width: "44px",
                    height: "28px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Visiting card verified & saved</span>
              </div>
            )}
          </div>

          {/* Progress Bar & Metrics */}
          <div style={{ marginBottom: "1.4rem", textAlign: "left" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.45rem",
                fontSize: "0.82rem",
                fontWeight: 700,
              }}
            >
              <span style={{ color: "#94a3b8" }}>Total Progress</span>
              <span style={{ color: "#38bdf8" }}>
                {level} of 20 ({progressPercent}%)
              </span>
            </div>

            <div
              style={{
                width: "100%",
                height: "10px",
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <motion.div
                initial={{ width: `${Math.max(0, ((level - 1) / 20) * 100)}%` }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  height: "100%",
                  borderRadius: "10px",
                  background:
                    isFinalLevel
                      ? "linear-gradient(90deg, #10b981, #f59e0b)"
                      : "linear-gradient(90deg, #0284c7, #38bdf8, #10b981)",
                  boxShadow: `0 0 12px ${badge.glow}`,
                }}
              />
            </div>

            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.78rem",
                color: remainingCount === 0 ? "#10b981" : "#cbd5e1",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {remainingCount === 0
                ? "🎉 You have completed all 20 challenges! Outstanding achievement!"
                : `🎯 Only ${remainingCount} more challenge${remainingCount > 1 ? "s" : ""} left to complete your card!`}
            </div>
          </div>

          {/* Action CTA */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            {isFinalLevel && onCompleteAll ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCompleteAll();
                }}
                style={{
                  width: "100%",
                  padding: "0.9rem 1.5rem",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  border: "none",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 8px 25px rgba(245, 158, 11, 0.4)",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Trophy size={18} />
                <span>View Grand Status & Details</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "100%",
                  padding: "0.9rem 1.5rem",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  border: "none",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.55rem",
                  boxShadow: "0 8px 25px rgba(2, 132, 199, 0.45)",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <span>Continue Playing</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
