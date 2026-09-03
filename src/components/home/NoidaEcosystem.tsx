"use client";
import React from "react";
import { useAdmin } from "@/context/AdminContext";
import { motion } from "framer-motion";
import { Cpu, Users, TrendingUp } from "lucide-react";

const cards = [
  {
    img: "https://nexusfounders.com/wp-content/uploads/2024/12/DSC_0725-1-scaled.jpg",
    title: "Emerging Tech Hub",
    desc: "Noida is rapidly becoming a hub for technology companies, attracting entrepreneurs and investors from across the country.",
    icon: <Cpu size={22} className="text-cyan-400" />,
  },
  {
    img: "https://nexusfounders.com/wp-content/uploads/2024/11/Nexus-Founders.jpg",
    title: "Vibrant Community",
    desc: "The sector is home to a diverse range of businesses, from startups to established enterprises, fostering a dynamic and supportive environment.",
    icon: <Users size={22} className="text-indigo-400" />,
  },
  {
    img: "https://nexusfounders.com/wp-content/uploads/2024/12/Nexus-Founders-F2-Fintech-.jpg",
    title: "Growth Potential",
    desc: "With its strategic location and growing infrastructure, Noida offers ample opportunities for businesses to flourish and expand.",
    icon: <TrendingUp size={22} className="text-purple-400" />,
  },
];

export default function NoidaEcosystem() {
  const { isEditMode } = useAdmin();

  return (
    <section className="section-wrapper" id="next" style={{ padding: "4rem 1.5rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: "3.5rem" }}
      >
        <span className="section-tag" style={{ justifyContent: "center" }}>Innovation Capital</span>
        <h2
          className="section-heading"
          contentEditable={isEditMode}
          suppressContentEditableWarning
          style={{ marginTop: "0.5rem" }}
        >
          About the <span className="gradient-text-cyan">Noida Ecosystem</span>
        </h2>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="cyber-card"
          >
            <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
              <img
                src={c.img}
                alt={c.title}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover", background: "#f1f5f9" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, transparent 60%)" }} />
            </div>
            <div className="cyber-card-body">
              <h3
                className="cyber-card-title"
                contentEditable={isEditMode}
                suppressContentEditableWarning
              >
                {c.title}
              </h3>
              <p
                className="cyber-card-desc"
                contentEditable={isEditMode}
                suppressContentEditableWarning
              >
                {c.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}