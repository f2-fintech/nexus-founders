"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Maximize2 } from "lucide-react";

interface Edition {
  name: string;
  tagline: string;
  videoId: string;
  url: string;
}

const highlightEditions: Edition[] = [
  {
    name: "Founders Meetup Kickoff",
    tagline: "Founders Meetup Kickoff",
    videoId: "tuwzvorehqM",
    url: "https://youtu.be/tuwzvorehqM?si=G0UwKYDsD9OMsg1V",
  },
  {
    name: "Building Business Legacies",
    tagline: "Building Business Legacies",
    videoId: "1NRjgtUv-jw",
    url: "https://youtu.be/1NRjgtUv-jw?si=3ohosTBbKnwwt8VN",
  },
  {
    name: "Startup Scaling & Network",
    tagline: "Startup Scaling & Network",
    videoId: "0JLg6DHOhnw",
    url: "https://youtu.be/0JLg6DHOhnw?si=Cngtm6YkMoXCdwg5",
  },
  {
    name: "Visionary Leaders Meet",
    tagline: "Visionary Leaders Meet",
    videoId: "pKNw9uvzv_I",
    url: "https://youtu.be/pKNw9uvzv_I?si=XG62uREi0lnaefE9",
  },
  {
    name: "Empowering Entrepreneurs",
    tagline: "Empowering Entrepreneurs",
    videoId: "jwA8g2VSiio",
    url: "https://youtu.be/jwA8g2VSiio?si=1wVfDYBU3bJAS_UT",
  },
];

export default function FloatingHighlightVideo() {
  const [isOpen, setIsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
      {/* Floating Bottom-Right Mini Video Player */}
      <aside
        aria-label="Highlights from Previous Editions"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9990,
        }}
      >
        <AnimatePresence>
          {isOpen && (
            /* Compact Floating Card (Click to open bigger screen) */
            <motion.div
              key="floating-card"
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={handleCardClick}
              title="Click to watch in bigger screen"
              style={{
                width: "220px",
                borderRadius: "14px",
                overflow: "hidden",
                background: "#0f172a",
                boxShadow: "0 14px 35px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.15)",
                position: "relative",
                cursor: "pointer",
                transform: "translateZ(0)",
              }}
            >
              {/* Top Controls Overlay */}
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  left: "6px",
                  right: "6px",
                  zIndex: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                {/* Previous / Next & Edition Pill */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    pointerEvents: "auto",
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "20px",
                    padding: "2px 5px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handlePrev}
                    title="Previous Edition"
                    aria-label="Previous Edition"
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "transparent",
                      border: "none",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "0 4px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {currentIndex + 1} / {highlightEditions.length}
                  </span>
                  <button
                    onClick={handleNext}
                    title="Next Edition"
                    aria-label="Next Edition"
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "transparent",
                      border: "none",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  title="Close"
                  aria-label="Close highlights widget"
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    pointerEvents: "auto",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              </div>

              {/* Compact Video Preview in 16:9 */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  position: "relative",
                  background: "#000",
                  overflow: "hidden",
                }}
              >
                {/* Autoplaying muted video iframe preview */}
                <iframe
                  key={current.videoId}
                  src={`https://www.youtube.com/embed/${current.videoId}?autoplay=1&mute=1&loop=1&playlist=${current.videoId}&controls=0&modestbranding=1&rel=0&playsinline=1`}
                  title={`Nexus Founders ${current.name} Highlights Preview`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: "block",
                    pointerEvents: "none", // Allows clicking anywhere on card to open bigger screen
                  }}
                />

                {/* Subtle Click-to-Expand hover overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.6) 100%)",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    padding: "6px 8px",
                    zIndex: 10,
                  }}
                >
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      textShadow: "0 1px 2px rgba(0,0,0,0.9)",
                    }}
                  >
                    Tap to expand
                  </span>
                  <div
                    style={{
                      background: "rgba(2, 132, 199, 0.8)",
                      color: "#ffffff",
                      borderRadius: "4px",
                      padding: "2px 5px",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                    }}
                  >
                    <Maximize2 size={10} />
                    <span>Enlarge</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* Bigger Screen Modal (Lightbox matching shared screenshot) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="video-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: "rgba(0, 0, 0, 0.88)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "clamp(12px, 2vh, 24px)",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            {/* Modal Card */}
            <motion.div
              key="video-modal-card"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "min(920px, 94vw, calc((90vh - 40px) * (16 / 9)))",
                maxHeight: "min(92vh, 92dvh)",
                borderRadius: "20px",
                overflow: "hidden",
                background: "#000000",
                boxShadow: "0 25px 70px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.15)",
                margin: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Top Close Button (✕) */}
              <button
                onClick={() => setIsModalOpen(false)}
                title="Close (Esc)"
                aria-label="Close modal"
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  zIndex: 60,
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.65)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <X size={20} />
              </button>

              {/* Previous Edition Arrow Button (<) on Left */}
              <button
                onClick={handlePrev}
                title="Previous Edition (Left arrow)"
                aria-label="Previous Edition"
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 60,
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <ChevronLeft size={24} />
              </button>

              {/* Next Edition Arrow Button (>) on Right */}
              <button
                onClick={handleNext}
                title="Next Edition (Right arrow)"
                aria-label="Next Edition"
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 60,
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <ChevronRight size={24} />
              </button>

              {/* Large High-Definition Video Player */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  background: "#000",
                  position: "relative",
                  flex: "1 1 auto",
                  minHeight: 0,
                }}
              >
                <iframe
                  key={`modal-${current.videoId}`}
                  src={`https://www.youtube.com/embed/${current.videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1`}
                  title={`Nexus Founders ${current.name} Highlights Full Video`}
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

              {/* Bottom Dots Carousel Indicator matching the screenshot */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 60,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(0, 0, 0, 0.65)",
                  backdropFilter: "blur(8px)",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {highlightEditions.map((item, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setCurrentIndex(idx)}
                      title={item.name}
                      aria-label={item.name}
                      style={{
                        width: isActive ? "22px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        background: isActive ? "#06b6d4" : "rgba(255, 255, 255, 0.35)",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        transition: "all 0.3s ease",
                      }}
                    />
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
