"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Sparkles } from "lucide-react";
import UpcomingEventsManager from "@/components/admin/UpcomingEventsManager";

interface EventDoc {
  _id: string;
  title: string;
  day: string;
  month: string;
  desc: string;
  address: string;
  btnText: string;
  registrationLink: string;
}

const ACCENT_COLORS = [
  { gradient: "linear-gradient(135deg, #0ea5e9, #6366f1)", light: "rgba(14,165,233,0.08)", border: "rgba(14,165,233,0.25)", dot: "#0ea5e9" },
  { gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)", light: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)", dot: "#8b5cf6" },
  { gradient: "linear-gradient(135deg, #06b6d4, #10b981)", light: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.25)", dot: "#06b6d4" },
];

export default function UpcomingEvents() {
  const { isEditMode } = useAdmin();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/upcoming-events");
      const data = await res.json();
      if (data.success) setEvents(data.data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return (
    <section className="section-wrapper" id="events" style={{ padding: "5rem 1.5rem" }}>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: "3.5rem" }}
      >
        <span className="section-tag"><Calendar size={15} /> Connecting Innovators Together</span>
        <h2 className="section-heading" style={{ marginTop: "0.6rem" }}>
          Upcoming <span className="gradient-text-cyan">Events</span>
        </h2>
        <p className="section-subtext" style={{ lineHeight: 1.8, maxWidth: "600px" }}>
          Join us in exploring innovative ideas and opportunities. Our community thrives on
          collaboration, creativity, and fruitful partnerships.
        </p>
      </motion.div>

      {/* Admin Manager */}
      {isEditMode && <UpcomingEventsManager onSaved={fetchEvents} />}

      {/* Events List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {loading ? (
          [0, 1].map((i) => (
            <div key={i} style={{
              background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
              backgroundSize: "200% 100%",
              borderRadius: "20px",
              height: "140px",
              animation: "shimmer 1.6s infinite",
            }} />
          ))
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              border: "2px dashed rgba(14,165,233,0.2)",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(14,165,233,0.03), rgba(99,102,241,0.03))",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗓️</div>
            <p style={{ color: "#64748b", fontSize: "1rem", fontWeight: 500 }}>
              No upcoming events at the moment. Check back soon!
            </p>
          </motion.div>
        ) : (
          events.map((ev, i) => {
            const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
            return (
              <motion.div
                key={ev._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                style={{
                  position: "relative",
                  background: "#ffffff",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.07)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 16px 40px ${accent.light.replace("0.08", "0.18")}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 20px rgba(0,0,0,0.06)";
                }}
              >
                {/* Gradient left accent bar */}
                <div style={{
                  position: "absolute",
                  left: 0, top: 0, bottom: 0,
                  width: "5px",
                  background: accent.gradient,
                  borderRadius: "20px 0 0 20px",
                }} />

                {/* Top gradient stripe */}
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: "2px",
                  background: accent.gradient,
                  opacity: 0.5,
                }} />

                <div style={{
                  padding: "1.75rem 2rem 1.75rem 2.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "2rem",
                  flexWrap: "wrap",
                }}>
                  {/* Left: Date + Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1.75rem", flexWrap: "wrap", flex: 1 }}>

                    {/* Date Badge */}
                    <div style={{
                      background: accent.light,
                      border: `1.5px solid ${accent.border}`,
                      borderRadius: "16px",
                      padding: "1rem 1.4rem",
                      textAlign: "center",
                      minWidth: "110px",
                      flexShrink: 0,
                    }}>
                      <div style={{
                        fontSize: "2.2rem",
                        fontWeight: 900,
                        background: accent.gradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        lineHeight: 1,
                      }}>
                        {ev.day}
                      </div>
                      <div style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginTop: "0.3rem",
                      }}>
                        {ev.month}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div style={{ flex: 1 }}>
                      {/* Live badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          background: accent.light,
                          color: accent.dot,
                          border: `1px solid ${accent.border}`,
                          borderRadius: "999px",
                          padding: "0.2rem 0.65rem",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}>
                          <Sparkles size={10} />
                          Upcoming
                        </span>
                      </div>

                      <h3 style={{
                        fontSize: "1.2rem",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginBottom: "0.45rem",
                        lineHeight: 1.3,
                      }}>
                        {ev.title}
                      </h3>

                      <p style={{
                        color: "#64748b",
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                        margin: "0 0 0.6rem",
                      }}>
                        {ev.desc}
                      </p>

                      {/* Venue pill */}
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "999px",
                        padding: "0.25rem 0.75rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#475569",
                      }}>
                        <MapPin size={11} style={{ color: accent.dot }} />
                        {ev.address}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/events/register"
                    style={{
                      background: accent.gradient,
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "0.75rem 1.8rem",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      transition: "opacity 0.2s ease, transform 0.2s ease",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      boxShadow: `0 4px 15px ${accent.light.replace("0.08", "0.4")}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.88";
                      e.currentTarget.style.transform = "scale(1.03)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <span>{ev.btnText || "Register Now"}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}