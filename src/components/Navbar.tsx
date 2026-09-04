"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Shield,
  User,
  LogOut,
  Edit3,
  ChevronDown,
  Menu,
  X,
  Home,
  Users,
  LogIn,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isEditMode, toggleEditMode, setEditModeOff } = useAdmin();
  const role = (session?.user as any)?.role || "User";
  const userEmail = session?.user?.email || "admin@nexusfounders.com";
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navbarContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on route change
  useEffect(() => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (navbarContainerRef.current && !navbarContainerRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // When admin logs out or session is absent, turn edit mode OFF and clear storage
  useEffect(() => {
    if (!session || (session.user as any)?.role !== "admin") {
      setEditModeOff();
    }
  }, [session, setEditModeOff]);

  const baseLinks = [
    { href: "/", label: "Home Page", icon: Home },
    { href: "/directory", label: "Directory", icon: Users },
    { href: "/join", label: "Join Us", icon: Sparkles },
  ];

  return (
    <header className="navbar-wrapper" ref={navbarContainerRef}>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="navbar-capsule"
      >
        {/* Brand Logo */}
        <Link href="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <img src="/images/logo.webp" alt="Nexus Founders" />
        </Link>

        {/* ── Desktop Navigation Links ── */}
        <div className="navbar-links desktop-only" style={{ position: "relative" }}>
          {baseLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => setProfileOpen(false)}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="nav-link-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}

          {/* Profile Tab (for logged in admin/user) */}
          {session ? (
            <div ref={profileRef} style={{ position: "relative", display: "inline-block" }}>
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className={`nav-link ${profileOpen ? "active" : ""}`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                <User size={15} />
                <span>Profile</span>
                <ChevronDown
                  size={14}
                  style={{
                    transition: "transform 0.2s ease",
                    transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 12px)",
                      right: 0,
                      minWidth: "260px",
                      background: "#ffffff",
                      borderRadius: "16px",
                      boxShadow: "0 15px 40px rgba(15, 23, 42, 0.12), 0 0 1px rgba(0,0,0,0.1)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      padding: "1.25rem",
                      zIndex: 1000,
                    }}
                  >
                    {/* User Info & Role */}
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #0284c7, #6366f1)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                        }}>
                          {userEmail[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                            {session.user?.name || "Administrator"}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b", wordBreak: "break-all" }}>
                            {userEmail}
                          </div>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        marginTop: "0.4rem",
                        padding: "0.25rem 0.75rem",
                        background: role === "admin" ? "rgba(217, 119, 6, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        color: role === "admin" ? "#d97706" : "#059669",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}>
                        {role === "admin" ? <Shield size={13} /> : <User size={13} />}
                        <span>Role: {role}</span>
                      </div>
                    </div>

                    <div style={{ height: "1px", background: "#f1f5f9", margin: "0.75rem 0" }} />

                    {/* Edit Mode Toggle (for Admin) */}
                    {role === "admin" && (
                      <div style={{ marginBottom: "0.75rem" }}>
                        <button
                          type="button"
                          onClick={() => {
                            toggleEditMode();
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.65rem 0.9rem",
                            borderRadius: "10px",
                            border: "1px solid",
                            borderColor: isEditMode ? "rgba(217, 119, 6, 0.4)" : "#e2e8f0",
                            background: isEditMode ? "rgba(217, 119, 6, 0.08)" : "#f8fafc",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Edit3 size={15} color={isEditMode ? "#d97706" : "#64748b"} />
                            <span style={{
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              color: isEditMode ? "#d97706" : "#334155",
                            }}>
                              Edit Mode
                            </span>
                          </div>
                          <span style={{
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            color: isEditMode ? "#d97706" : "#94a3b8",
                            background: isEditMode ? "#fef3c7" : "#e2e8f0",
                            padding: "0.2rem 0.55rem",
                            borderRadius: "12px",
                          }}>
                            {isEditMode ? "ON" : "OFF"}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Logout Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditModeOff();
                        signOut({ callbackUrl: "/login" });
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.65rem 0.9rem",
                        borderRadius: "10px",
                        border: "1px solid #fee2e2",
                        background: "#fff5f5",
                        color: "#dc2626",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fee2e2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff5f5";
                      }}
                    >
                      <LogOut size={15} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}
        </div>

        {/* Right side: Login button when logged out (Desktop only) */}
        {!session && (
          <div className="navbar-actions desktop-only">
            <Link
              href="/login"
              className="btn-neon-primary"
              style={{ padding: "0.5rem 1.4rem", fontSize: "0.88rem" }}
            >
              <Sparkles size={16} />
              <span>Login</span>
            </Link>
          </div>
        )}

        {/* ── Mobile & Tablet Controls (<= 860px) ── */}
        <div className="navbar-mobile-controls">
          {session && (
            <div
              className="navbar-mobile-user-badge"
              title={`${session.user?.name || userEmail} (${role})`}
            >
              {userEmail[0].toUpperCase()}
            </div>
          )}

          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile Backdrop Overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            className="navbar-mobile-backdrop"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile / Tablet Dropdown Drawer (<= 860px) ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="navbar-mobile-menu"
          >
            {/* Navigation Links with Icons */}
            <div className="mobile-nav-links">
              {baseLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`mobile-nav-link ${isActive ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mobile-nav-icon">
                      <Icon size={18} />
                    </span>
                    <span className="mobile-nav-label">{link.label}</span>
                    {isActive && <span className="mobile-nav-active-dot" />}
                  </Link>
                );
              })}
            </div>

            <div className="mobile-nav-divider" />

            {/* Profile or Login section */}
            {session ? (
              <div className="mobile-profile-section">
                <div className="mobile-user-card">
                  <div className="mobile-user-avatar">
                    {userEmail[0].toUpperCase()}
                  </div>
                  <div className="mobile-user-details">
                    <div className="mobile-user-name">{session.user?.name || "Administrator"}</div>
                    <div className="mobile-user-email">{userEmail}</div>
                    <div className="mobile-user-badge">
                      {role === "admin" ? <Shield size={12} /> : <User size={12} />}
                      <span>{role}</span>
                    </div>
                  </div>
                </div>

                {role === "admin" && (
                  <button
                    type="button"
                    onClick={() => {
                      toggleEditMode();
                      setMobileMenuOpen(false);
                    }}
                    className={`mobile-edit-mode-btn ${isEditMode ? "active" : ""}`}
                  >
                    <div className="mobile-edit-mode-left">
                      <Edit3 size={16} />
                      <span>Edit Mode</span>
                    </div>
                    <span className="mobile-edit-mode-pill">
                      {isEditMode ? "ON" : "OFF"}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditModeOff();
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="mobile-logout-btn"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="mobile-auth-section">
                <Link
                  href="/login"
                  className="mobile-login-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={17} />
                  <span>Login</span>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}