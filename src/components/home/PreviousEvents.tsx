"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ExternalLink, Film, X } from "lucide-react";

interface Edition {
  name: string;
  editionNum: number;
  url: string;
  videoId: string;
  tagline?: string;
}

const allEditions: Edition[] = [
  {
    name: "1st Edition",
    editionNum: 1,
    url: "https://youtu.be/tuwzvorehqM?si=G0UwKYDsD9OMsg1V",
    videoId: "tuwzvorehqM",
    tagline: "Founders Meetup Kickoff",
  },
  {
    name: "2nd Edition",
    editionNum: 2,
    url: "https://youtu.be/1NRjgtUv-jw?si=eCZZZmkIuaWOfIzh",
    videoId: "1NRjgtUv-jw",
    tagline: "Building Business Legacies",
  },
  {
    name: "3rd Edition",
    editionNum: 3,
    url: "https://youtu.be/0JLg6DHOhnw?si=ejMTzz8sOPezeI16",
    videoId: "0JLg6DHOhnw",
    tagline: "Startup Scaling & Network",
  },
  {
    name: "4th Edition",
    editionNum: 4,
    url: "https://youtu.be/pKNw9uvzv_I?si=cmtrFDd_vNu_lgWw",
    videoId: "pKNw9uvzv_I",
    tagline: "Visionary Leaders Meet",
  },
  {
    name: "5th Edition",
    editionNum: 5,
    url: "https://youtu.be/jwA8g2VSiio?si=dEX4Gzp3Gk4UEjAD",
    videoId: "jwA8g2VSiio",
    tagline: "Empowering Entrepreneurs",
  },
  {
    name: "7th Edition",
    editionNum: 7,
    url: "https://www.youtube.com/watch?v=igylowzdQiY",
    videoId: "igylowzdQiY",
    tagline: "Scaling New Heights",
  },
  {
    name: "9th Edition",
    editionNum: 9,
    url: "https://youtu.be/YVuGJRioXfI?si=QU5i9-CR3Kclw9Qo",
    videoId: "YVuGJRioXfI",
    tagline: "Ecosystem Growth & Capital",
  },
  {
    name: "11th Edition",
    editionNum: 11,
    url: "https://youtu.be/Zr7UpnXbvb0?si=G5389WfboJqNKbWJ",
    videoId: "Zr7UpnXbvb0",
    tagline: "CEO & Founder Exchange",
  },
  {
    name: "13th Edition",
    editionNum: 13,
    url: "https://www.youtube.com/watch?v=FH4mqbz8piI",
    videoId: "FH4mqbz8piI",
    tagline: "Global Vision & Resilience",
  },
  {
    name: "14th Edition",
    editionNum: 14,
    url: "https://www.youtube.com/watch?v=CxfYif02l3k",
    videoId: "CxfYif02l3k",
    tagline: "The Future of Enterprise",
  },
];

function getYouTubeThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function PreviousEvents() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Edition | null>(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedVideo(null);
    };
    if (selectedVideo) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [selectedVideo]);

  // Chronological list
  const sortedEditions = allEditions;

  return (
    <section
      className="section-wrapper previous-events-section"
      style={{
        padding: "4.5rem 1.5rem 5.5rem",
        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: "2.5rem" }}
      >
        <span className="section-tag" style={{ justifyContent: "center" }}>
          <Film size={15} style={{ marginRight: "0.4rem" }} />
          Our Journey
        </span>
        <h2 className="section-heading" style={{ marginTop: "0.5rem" }}>
          Highlights from <span className="gradient-text-cyan">Previous Editions</span>
        </h2>
        <p
          className="section-subtext"
          style={{ maxWidth: "620px", margin: "0.75rem auto 0", lineHeight: 1.7 }}
        >
          Relive the energy, keynote discussions, and peer networking from our past Nexus Founders editions.
        </p>

      </motion.div>

      {/* Grid of Video Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
          gap: "1.5rem",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        {sortedEditions.map((edition, i) => (
          <motion.div
            key={edition.videoId}
            className="previous-event-card"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: (i % 6) * 0.06 }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => setSelectedVideo(edition)}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow:
                hoveredIdx === i
                  ? "0 20px 40px rgba(2, 132, 199, 0.2)"
                  : "0 4px 18px rgba(15, 23, 42, 0.06)",
              border:
                hoveredIdx === i
                  ? "1.5px solid rgba(2, 132, 199, 0.5)"
                  : "1.5px solid rgba(226, 232, 240, 0.8)",
              transform: hoveredIdx === i ? "translateY(-5px)" : "translateY(0)",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              background: "#ffffff",
              cursor: "pointer",
              position: "relative",
            }}
          >
            {/* Thumbnail Box */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "185px",
                background: "#0f172a",
                overflow: "hidden",
              }}
            >
              <img
                src={getYouTubeThumbnail(edition.videoId)}
                alt={`${edition.tagline || "Meetup"} video thumbnail`}
                loading="lazy"
                decoding="async"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.4s ease",
                  transform: hoveredIdx === i ? "scale(1.06)" : "scale(1)",
                }}
              />

              {/* Dark overlay + Play Button */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    hoveredIdx === i
                      ? "linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.3) 100%)"
                      : "linear-gradient(to top, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.15) 60%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.25s ease",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: hoveredIdx === i ? "#0284c7" : "rgba(255,255,255,0.92)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 22px rgba(0,0,0,0.35)",
                    transition: "all 0.25s ease",
                    transform: hoveredIdx === i ? "scale(1.12)" : "scale(1)",
                  }}
                >
                  <Play
                    size={22}
                    fill={hoveredIdx === i ? "#ffffff" : "#0284c7"}
                    color={hoveredIdx === i ? "#ffffff" : "#0284c7"}
                    style={{ marginLeft: "3px" }}
                  />
                </div>
              </div>

              {/* YouTube Tag */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(2, 132, 199, 0.95)",
                  color: "#ffffff",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.65rem",
                  borderRadius: "6px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                }}
              >
                YouTube
              </div>
            </div>

            {/* Card Content & Action */}
            <div
              style={{
                padding: "1.1rem 1.15rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="previous-event-title"
                    style={{
                      fontWeight: 700,
                      fontSize: "0.98rem",
                      color: "#0f172a",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.35,
                    }}
                  >
                    {edition.tagline || "Meetup Highlights"}
                  </span>
                  <a
                    href={edition.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="Open directly on YouTube"
                    style={{
                      color: hoveredIdx === i ? "#0284c7" : "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      flexShrink: 0,
                      marginTop: "1px",
                      transition: "color 0.2s ease, transform 0.2s ease",
                    }}
                  >
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "0.6rem",
                  paddingTop: "0.6rem",
                  borderTop: "1px solid #f1f5f9",
                  fontSize: "0.78rem",
                  color: "#0284c7",
                  fontWeight: 600,
                }}
              >
                <span>Watch highlights</span>
                <span>▶</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── HIGH DEFINITION EMBEDDED MODAL PLAYER ───────────────────────────── */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: "rgba(15, 23, 42, 0.88)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "clamp(0.75rem, 2vh, 1.5rem)",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "min(900px, 94vw, calc((90vh - 65px) * (16 / 9)))",
                maxHeight: "min(92vh, 92dvh)",
                background: "#0f172a",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                margin: "auto",
              }}
            >
              {/* Modal Top Header */}
              <div
                style={{
                  padding: "0.75rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  flexShrink: 0,
                  gap: "0.75rem",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3
                    style={{
                      color: "#ffffff",
                      fontSize: "1rem",
                      fontWeight: 700,
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {selectedVideo.tagline || "Nexus Founders Meetup"}
                  </h3>
                  <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                    Nexus Founders Community
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexShrink: 0 }}>
                  <a
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#ffffff",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "8px",
                      padding: "0.35rem 0.7rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <ExternalLink size={13} />
                    Open in YouTube
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(null)}
                    aria-label="Close modal"
                    style={{
                      background: "rgba(255, 255, 255, 0.12)",
                      border: "none",
                      color: "#ffffff",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Video Iframe Container in standard 16:9 */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  background: "#000000",
                  flex: "1 1 auto",
                  minHeight: 0,
                }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${selectedVideo.tagline || "Nexus Founders"} highlights`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: "block",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
