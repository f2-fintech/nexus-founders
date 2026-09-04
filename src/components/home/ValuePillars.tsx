"use client";
import React from "react";
import { useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";
import { Users2, Lightbulb, Globe2 } from "lucide-react";

const items = [
  {
    icon: <Users2 size={36} />,
    title: "Collaboration",
    desc: "Nexus Founder aims to create a collaborative environment where founders and CEOs can support each other, share resources, and overcome challenges together.",
  },
  {
    icon: <Lightbulb size={36} />,
    title: "Innovation",
    desc: "By fostering a spirit of innovation, the platform encourages members to explore new ideas, develop cutting-edge technologies, and drive growth.",
  },
  {
    icon: <Globe2 size={36} />,
    title: "Impact",
    desc: "Nexus Founder strives to create a positive impact on the Noida Sector 63 ecosystem, contributing to its economic development and prosperity.",
  },
];

export default function ValuePillars() {
  const { isEditMode } = useAdmin();
  return (
    <section className="section-wrapper">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: "3.5rem" }}
      >
        <span className="section-tag">Core Values</span>
        <h2 className="section-heading">Our Foundational <span className="gradient-text-cyan">Pillars</span></h2>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "2rem" }}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="pillar-cyber-card"
          >
            <div className="pillar-cyber-icon">{item.icon}</div>
            <h3
              style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.85rem", color: "#fff" }}
              contentEditable={isEditMode}
              suppressContentEditableWarning
            >
              {item.title}
            </h3>
            <p
              style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.7 }}
              contentEditable={isEditMode}
              suppressContentEditableWarning
            >
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}