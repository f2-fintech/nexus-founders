"use client";
import React from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";

const eventsData = [
  {
    day: "6th",
    month: "January 2025",
    title: "Founder Stories",
    desc: "Join fellow community members for a day of insights and networking!",
    btn: "See More",
  },
  {
    day: "6th",
    month: "January 2025",
    title: "Community Meetup and Networking Session",
    desc: "Hear inspiring stories from successful founders in our community.",
    btn: "Find Out More",
  },
];

export default function UpcomingEvents() {
  const { isEditMode } = useAdmin();

  return (
    <section className="section-wrapper" id="events" style={{ padding: "4rem 1.5rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: "3rem" }}
      >
        <span className="section-tag"><Calendar size={16} /> Connecting Innovators Together</span>
        <h2
          className="section-heading"
          contentEditable={isEditMode}
          suppressContentEditableWarning
          style={{ marginTop: "0.5rem" }}
        >
          Upcoming <span className="gradient-text-cyan">Events</span>
        </h2>
        <p
          className="section-subtext"
          contentEditable={isEditMode}
          suppressContentEditableWarning
          style={{ lineHeight: 1.7 }}
        >
          Join us in exploring innovative ideas and opportunities. Our community thrives on collaboration and creativity. Get ready for engaging discussions, exciting projects, and fruitful partnerships. We are here to foster a supportive environment for growth and development.
        </p>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {eventsData.map((ev, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: "16px",
              padding: "1.75rem 2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              flexWrap: "wrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(2, 132, 199, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.04)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              {/* Date Box */}
              <div style={{
                background: "linear-gradient(135deg, rgba(2, 132, 199, 0.08), rgba(99, 102, 241, 0.08))",
                border: "1px solid rgba(2, 132, 199, 0.2)",
                borderRadius: "12px",
                padding: "0.8rem 1.4rem",
                textAlign: "center",
                minWidth: "120px",
              }}>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 900,
                    color: "#0284c7",
                    lineHeight: 1.1,
                  }}
                  contentEditable={isEditMode}
                  suppressContentEditableWarning
                >
                  {ev.day}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginTop: "0.2rem",
                  }}
                  contentEditable={isEditMode}
                  suppressContentEditableWarning
                >
                  {ev.month}
                </div>
              </div>

              {/* Event Info */}
              <div>
                <h3
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    marginBottom: "0.4rem",
                    color: "#0f172a",
                  }}
                  contentEditable={isEditMode}
                  suppressContentEditableWarning
                >
                  {ev.title}
                </h3>
                <p
                  style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}
                  contentEditable={isEditMode}
                  suppressContentEditableWarning
                >
                  {ev.desc}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <Link
              href="/events/register"
              style={{
                background: "#ffffff",
                border: "1.5px solid #1e293b",
                color: "#1e293b",
                borderRadius: "8px",
                padding: "0.65rem 1.6rem",
                fontSize: "0.92rem",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0284c7";
                e.currentTarget.style.borderColor = "#0284c7";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#1e293b";
                e.currentTarget.style.color = "#1e293b";
              }}
            >
              <span>{ev.btn}</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}