"use client";
import React from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";

export default function HeroSection() {
  const { isEditMode } = useAdmin();

  return (
    <section className="hero-wrapper" style={{ padding: "4rem 1.5rem 3rem" }}>
      <div className="hero-grid" style={{ maxWidth: "1280px", margin: "0 auto", alignItems: "center" }}>
        {/* Left Column: Text & CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Edition Tag */}
          <div style={{ marginBottom: "1rem" }}>
            <span
              style={{
                display: "inline-block",
                color: "var(--neon-cyan)",
                fontSize: "0.95rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                textTransform: "none",
              }}
              contentEditable={isEditMode}
              suppressContentEditableWarning
            >
              Nexus Founders 16th Edition–7th Aug 2026 at IIM Lucknow Noida Campus, Sector 62
            </span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#0f172a",
              marginBottom: "1.25rem",
            }}
            contentEditable={isEditMode}
            suppressContentEditableWarning
          >
            Building Business <span className="gradient-text-cyan">Legacies</span> with Founders
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              marginBottom: "2.25rem",
              maxWidth: "580px",
            }}
            contentEditable={isEditMode}
            suppressContentEditableWarning
          >
            Welcome to Founder Nexus, a vibrant community where innovators thrive! Connect with dynamic entrepreneurs and visionary leaders. Join us for engaging discussions, insightful events, and collaboration opportunities that empower you to reach new heights in your entrepreneurial journey.
          </p>

          {/* Two Action Buttons */}
          <div className="hero-action-buttons">
            {/* 1. Join Us Now button */}
            <Link
              href="/join"
              className="hero-btn-primary"
            >
              Join Us Now
            </Link>

            {/* 2. Explore Events button */}
            <a
              href="#events"
              className="hero-btn-secondary"
            >
              Explore Events
            </a>
          </div>
        </motion.div>

        {/* Right Column: YouTube Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          style={{ width: "100%" }}
        >
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: "16px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.12), 0 0 30px rgba(14,165,233,0.15)",
              border: "1px solid rgba(14,165,233,0.3)",
              background: "#000000",
            }}
          >
            <iframe
              src="https://www.youtube.com/embed/tuwzvorehqM?start=8"
              title="Nexus Founders Meetup"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}