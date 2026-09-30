"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Maximize2, ExternalLink } from "lucide-react";

interface Edition {
  name: string;
  tagline: string;
  editionNumber: string;
  type: "youtube" | "instagram";
  videoId?: string;
  embedUrl: string;
  url: string;
}

const highlightEditions: Edition[] = [
  {
    name: "14th Edition",
    tagline: "Nexus Founders 14th Edition",
    editionNumber: "14th",
    type: "instagram",
    embedUrl: "https://www.instagram.com/p/DZFfXtGyQgg/embed/",
    url: "https://www.instagram.com/p/DZFfXtGyQgg/",
  },
  {
    name: "15th Edition",
    tagline: "Nexus Founders 15th Edition",
    editionNumber: "15th",
    type: "youtube",
    videoId: "a-n7nUnesUM",
    embedUrl: "https://www.youtube.com/embed/a-n7nUnesUM",
    url: "https://www.youtube.com/shorts/a-n7nUnesUM",
  },
  {
    name: "16th Edition",
    tagline: "Nexus Founders 16th Edition",
    editionNumber: "16th",
    type: "youtube",
    videoId: "ZdpptrNGw5o",
    embedUrl: "https://www.youtube.com/embed/ZdpptrNGw5o",
    url: "https://www.youtube.com/shorts/ZdpptrNGw5o",
  },
  {
    name: "17th Edition",
    tagline: "Nexus Founders 17th Edition",
    editionNumber: "17th",
    type: "youtube",
    videoId: "ZdpptrNGw5o",
    embedUrl: "https://www.youtube.com/embed/ZdpptrNGw5o",
    url: "https://www.youtube.com/shorts/ZdpptrNGw5o",
  },
];

// Duration in milliseconds each video preview plays before auto-advancing to the next
const AUTO_PLAY_DURATION = 12000;

export default function FloatingHighlightVideo() {
  const [isOpen, setIsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const current = highlightEditions[currentIndex];

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % highlightEditions.length);
  }, []);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + highlightEditions.length) % highlightEditions.length);
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  // Auto-play videos 1 by 1 in preview
  useEffect(() => {
    if (!isOpen || isModalOpen || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((curr) => (curr + 1) % highlightEditions.length);
    }, AUTO_PLAY_DURATION);

    return () => clearInterval(timer);
  }, [isOpen, isModalOpen, isHovered]);

  // Keyboard controls for modal (Esc to close, Left/Right arrows to navigate)
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, handleNext, handlePrev]);

  return (
    <>
      {/* Floating Bottom-Right Compact Reel Player (f2fintech.com inspired size) */}
      <aside
        aria-label="Highlights from Previous Editions"
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: 9990,
        }}
      >
        <AnimatePresence>
          {isOpen && (
            /* Compact Vertical Floating Card */
            <motion.div
              key="floating-card"
              initial={{ opacity: 0, y: 25, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 25, scale: 0.92 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 360, damping: 26 }}
              onClick={handleCardClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              title="Click to watch full reel"
              style={{
                width: "clamp(92px, 7.5vw, 104px)",
                aspectRatio: "9 / 16",
                borderRadius: "11px",
                overflow: "hidden",
                background: "#080c18",
                boxShadow:
                  "0 10px 25px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.16)",
                position: "relative",
                cursor: "pointer",
                transform: "translateZ(0)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Top Controls Overlay: Close Button only */}
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  zIndex: 25,
                  pointerEvents: "auto",
                }}
              >
                <button
                  onClick={handleClose}
                  title="Close"
                  aria-label="Close highlights widget"
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "rgba(10, 15, 30, 0.85)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                    padding: 0,
                  }}
                >
                  <X size={10} />
                </button>
              </div>

              {/* Vertical Video Preview in 9:16 */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  background: "#000",
                  overflow: "hidden",
                }}
              >
                {/* Autoplaying Preview Player */}
                {current.type === "youtube" ? (
                  <iframe
                    key={`preview-yt-${current.editionNumber}-${current.videoId}`}
                    src={`https://www.youtube.com/embed/${current.videoId}?autoplay=1&mute=1&loop=1&playlist=${current.videoId}&controls=0&modestbranding=1&rel=0&playsinline=1`}
                    title={`Nexus Founders ${current.name} Preview`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      display: "block",
                      pointerEvents: "none",
                    }}
                  />
                ) : (
                  <iframe
                    key={`preview-ig-${current.editionNumber}`}
                    src={current.embedUrl}
                    title={`Nexus Founders ${current.name} Instagram Reel Preview`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      display: "block",
                      pointerEvents: "none",
                      background: "#000",
                    }}
                  />
                )}

                {/* Bottom Overlay with Edition Title & Tap to Expand */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0.9) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "4px 5px",
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                >
                  {/* Edition Tag */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      marginBottom: "2px",
                    }}
                  >
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "#06b6d4",
                        display: "inline-block",
                        boxShadow: "0 0 4px #06b6d4",
                      }}
                    />
                    <span
                      style={{
                        color: "#38bdf8",
                        fontSize: "0.52rem",
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                      }}
                    >
                      {current.name}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "2px",
                    }}
                  >
                    <span
                      style={{
                        color: "#ffffff",
                        fontSize: "0.48rem",
                        fontWeight: 600,
                        textShadow: "0 1px 2px rgba(0,0,0,0.9)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Tap expand
                    </span>
                    <div
                      style={{
                        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                        color: "#ffffff",
                        borderRadius: "3px",
                        padding: "1px 3px",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        fontSize: "0.46rem",
                        fontWeight: 700,
                        boxShadow: "0 2px 4px rgba(2, 132, 199, 0.4)",
                      }}
                    >
                      <Maximize2 size={7} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* Expanded Vertical Reel Modal (9:16 Aspect Ratio) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="video-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setIsModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: "rgba(0, 0, 0, 0.9)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "clamp(12px, 2vh, 24px)",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            {/* Modal Wrapper for Navigation Arrows & Reel Card */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Edition Arrow Button (<) */}
              <button
                onClick={handlePrev}
                title="Previous Edition (Left arrow)"
                aria-label="Previous Edition"
                style={{
                  position: "absolute",
                  left: "clamp(-54px, -4vw, -18px)",
                  zIndex: 70,
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "rgba(15, 23, 42, 0.8)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
              >
                <ChevronLeft size={22} />
              </button>

              {/* Next Edition Arrow Button (>) */}
              <button
                onClick={handleNext}
                title="Next Edition (Right arrow)"
                aria-label="Next Edition"
                style={{
                  position: "absolute",
                  right: "clamp(-54px, -4vw, -18px)",
                  zIndex: 70,
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "rgba(15, 23, 42, 0.8)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
              >
                <ChevronRight size={22} />
              </button>

              {/* Reel Card (9:16 Aspect Ratio) */}
              <motion.div
                key={`modal-card-${currentIndex}`}
                initial={{ scale: 0.94, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 15 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                style={{
                  position: "relative",
                  width: "min(380px, 86vw, calc((88vh - 40px) * (9 / 16)))",
                  aspectRatio: "9 / 16",
                  maxHeight: "min(88vh, 88dvh)",
                  borderRadius: "22px",
                  overflow: "hidden",
                  background: "#000000",
                  boxShadow:
                    "0 25px 80px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.16)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Top Header Floating Controls */}
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    right: "12px",
                    zIndex: 60,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pointerEvents: "none",
                  }}
                >
                  {/* Edition Pill Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(0, 0, 0, 0.72)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      borderRadius: "20px",
                      padding: "4px 10px",
                      pointerEvents: "auto",
                    }}
                  >
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#06b6d4",
                        display: "inline-block",
                        boxShadow: "0 0 8px #06b6d4",
                      }}
                    />
                    <span
                      style={{
                        color: "#ffffff",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {current.name}
                    </span>
                  </div>

                  {/* Actions: Open in Platform & Close Button */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      pointerEvents: "auto",
                    }}
                  >
                    {/* Direct External Link */}
                    <a
                      href={current.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={
                        current.type === "youtube"
                          ? "Open in YouTube Shorts"
                          : "Open in Instagram"
                      }
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(0, 0, 0, 0.72)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <ExternalLink size={14} />
                    </a>

                    {/* Close Button (✕) */}
                    <button
                      onClick={() => setIsModalOpen(false)}
                      title="Close (Esc)"
                      aria-label="Close modal"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(0, 0, 0, 0.72)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        padding: 0,
                      }}
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                {/* High Definition Vertical Reel Player */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#000",
                    position: "relative",
                    flex: "1 1 auto",
                  }}
                >
                  {current.type === "youtube" ? (
                    <iframe
                      key={`modal-yt-${current.editionNumber}-${current.videoId}`}
                      src={`https://www.youtube.com/embed/${current.videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&playsinline=1`}
                      title={`Nexus Founders ${current.name} Full Vertical Reel`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        display: "block",
                      }}
                    />
                  ) : (
                    <iframe
                      key={`modal-ig-${current.editionNumber}`}
                      src={current.embedUrl}
                      title={`Nexus Founders ${current.name} Instagram Reel`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        display: "block",
                        background: "#000",
                      }}
                    />
                  )}
                </div>

                {/* Bottom Editions Switcher Pill */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 60,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(0, 0, 0, 0.78)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    padding: "5px 8px",
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {highlightEditions.map((item, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={item.editionNumber}
                        onClick={() => setCurrentIndex(idx)}
                        title={item.name}
                        aria-label={item.name}
                        style={{
                          padding: "4px 9px",
                          borderRadius: "16px",
                          background: isActive
                            ? "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)"
                            : "transparent",
                          color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                          border: "none",
                          fontSize: "0.7rem",
                          fontWeight: isActive ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.editionNumber}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
