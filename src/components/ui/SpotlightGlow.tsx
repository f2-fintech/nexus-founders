"use client";
import React, { useEffect, useState } from "react";

export default function SpotlightGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!isClient) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        background: `radial-gradient(550px circle at ${pos.x}px ${pos.y}px, rgba(2, 132, 199, 0.07), rgba(79, 70, 229, 0.03) 40%, transparent 80%)`,
      }}
    />
  );
}