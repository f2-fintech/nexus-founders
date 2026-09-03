"use client";
import React from "react";
import { motion } from "framer-motion";

export function GlowingOrbs() {
  return (
    <div className="glow-orbs-container" style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {/* Orb 1: Soft Cyan Pastel */}
      <motion.div
        animate={{
          x: [0, 60, -50, 0],
          y: [0, -50, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "5%",
          left: "10%",
          width: "450px",
          height: "450px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(224, 242, 254, 0.7) 0%, rgba(224, 242, 254, 0) 70%)",
          filter: "blur(60px)",
        }}
      />
      {/* Orb 2: Soft Indigo Pastel */}
      <motion.div
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 60, -30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "40%",
          right: "8%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(238, 242, 255, 0.8) 0%, rgba(238, 242, 255, 0) 70%)",
          filter: "blur(70px)",
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