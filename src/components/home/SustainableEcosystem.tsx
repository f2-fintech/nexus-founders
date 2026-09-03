"use client";
import React from "react";
import { useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";

const galleryImages = [
  { src: "/images/eco1.webp", alt: "Nexus Founders Gathering" },
  { src: "/images/eco2.webp", alt: "Nexus Founders Session" },
  { src: "/images/eco3.webp", alt: "Nexus Founders Network" },
  { src: "/images/eco1.webp", alt: "Nexus Founders F2 Fintech" },
  { src: "/images/eco2.webp", alt: "Nexus F2 Fintech Community" },
  { src: "/images/eco3.webp", alt: "Nexus Founders Dialogue" },
];

export default function SustainableEcosystem() {
  const { isEditMode } = useAdmin();

  return (
    <section className="section-wrapper" style={{ textAlign: "center", padding: "4rem 1.5rem 2rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-tag" style={{ justifyContent: "center" }}>Collective Impact</span>
        <h2
          className="section-heading"
          contentEditable={isEditMode}
          suppressContentEditableWarning
          style={{ marginTop: "0.5rem" }}
        >
          Building a <span className="gradient-text-cyan">Sustainable Ecosystem</span>
        </h2>
      </motion.div>

      {/* Gallery Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
        marginTop: "2.5rem",
      }}>
        {galleryImages.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
            style={{
              borderRadius: "14px",
              overflow: "hidden",
              height: "220px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.06)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03) translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 16px 36px rgba(14,165,233,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: "#f1f5f9" }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}