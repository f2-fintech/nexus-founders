"use client";
import React from "react";
import { motion } from "framer-motion";

export function GlowingOrbs() {
  return (
    <div className="glow-orbs-container" style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {/* Orb 1: Soft Cyan Pastel (GPU-friendly radial gradient instead of heavy blur on iOS) */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -35, 25, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "5%",
          left: "10%",
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(224, 242, 254, 0.6) 0%, rgba(224, 242, 254, 0.2) 45%, rgba(224, 242, 254, 0) 70%)",
          willChange: "transform",
        }}
      />
      {/* Orb 2: Soft Indigo Pastel */}
      <motion.div
        animate={{
          x: [0, -45, 35, 0],
          y: [0, 40, -20, 0],
          scale: [1, 1.06, 0.96, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "40%",
          right: "8%",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(238, 242, 255, 0.7) 0%, rgba(238, 242, 255, 0.2) 45%, rgba(238, 242, 255, 0) 70%)",
          willChange: "transform",
        }}
      />
    </div>
  );
}

export function NeonBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="neon-badge-wrapper">
      <div className="neon-badge-content">
        <span className="neon-badge-dot" />
        {children}
      </div>
    </div>
  );
}