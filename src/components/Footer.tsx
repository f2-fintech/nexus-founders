"use client";
import React from "react";
import Link from "next/link";

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.37 9.74V9.93H5.09v8.57h2.74z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 2,
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 40%, #f1f5f9 100%)",
        marginTop: "5rem",
        overflow: "hidden",
      }}
    >
      {/* Top Accent Gradient Border */}
      <div
        style={{
          height: "2px",
          width: "100%",
          background:
            "linear-gradient(90deg, rgba(2, 132, 199, 0) 0%, rgba(2, 132, 199, 0.45) 25%, rgba(99, 102, 241, 0.45) 75%, rgba(99, 102, 241, 0) 100%)",
        }}
      />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "4.5rem 2rem 2.5rem",
        }}
      >
        {/* Main Content: Flex Container with Connect With Us pushed to the right side */}
        <div
          className="nexus-footer-grid"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "3rem 2rem",
          }}
        >
          {/* Column 1: Brand & Community Identity */}
          <div
            style={{
              flex: "1 1 360px",
              maxWidth: "420px",
              display: "flex",
              flexDirection: "column",
              gap: "1.1rem",
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-block",
                width: "fit-content",
                transition: "opacity 0.2s ease",
              }}
            >
              <img
                src="/images/logo.webp"
                alt="Nexus Founders"
                style={{
                  height: "44px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Link>

            <p
              style={{
                color: "#64748b",
                fontSize: "0.92rem",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Building Business Legacies with Founders. A vibrant ecosystem where dynamic
              entrepreneurs and visionary leaders connect, collaborate, and scale their ventures.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div
            style={{
              flex: "0 1 200px",
              minWidth: "160px",
            }}
          >
            <h4
              style={{
                fontSize: "0.98rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 1.25rem 0",
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              Quick Links
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              {[
                { name: "Home Page", href: "/" },
                { name: "Members Directory", href: "/directory" },
                { name: "Join Community", href: "/join" },
                { name: "Previous Meetups", href: "/#events" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="footer-nav-link"
                    style={{
                      color: "#64748b",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span
                      className="footer-link-bullet"
                      style={{ color: "#94a3b8", fontSize: "0.8rem", transition: "transform 0.2s ease" }}
                    >
                      ›
                    </span>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Connect With Us (Pushed to the Right Edge) */}
          <div
            className="footer-connect-col"
            style={{
              flex: "0 1 320px",
              minWidth: "260px",
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
            }}
          >
            <div>
              <h4
                style={{
                  fontSize: "0.98rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 0.35rem 0",
                  letterSpacing: "-0.01em",
                }}
              >
                Connect With Us
              </h4>
              <p
                style={{
                  fontSize: "0.84rem",
                  color: "#64748b",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Follow our official channels for event highlights and founder stories.
              </p>
            </div>

            {/* Social Icons Row with Custom Brand Hovers */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/nexus-founders"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-pill footer-linkedin"
                aria-label="Nexus Founders LinkedIn"
                title="Follow on LinkedIn"
              >
                <LinkedinIcon size={18} />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/nexusfounders?igsi=b2MxM2Vvc2pnMnV0"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-pill footer-instagram"
                aria-label="Nexus Founders Instagram"
                title="Follow on Instagram"
              >
                <InstagramIcon size={18} />
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@nexusfounders?si=0jLiNKqwWvmMqH7Q"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-pill footer-youtube"
                aria-label="Nexus Founders YouTube Channel"
                title="Subscribe on YouTube"
              >
                <YoutubeIcon size={18} />
              </a>

              {/* Email Direct Button */}
              <a
                href="mailto:NexusFounders369@gmail.com"
                className="footer-social-pill footer-email"
                aria-label="Email Nexus Founders"
                title="Email: NexusFounders369@gmail.com"
              >
                <MailIcon size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar Divider */}
        <div
          style={{
            marginTop: "3.5rem",
            paddingTop: "1.75rem",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.86rem",
            color: "#64748b",
          }}
        >
          <p style={{ margin: 0, fontWeight: 500 }}>
            © {new Date().getFullYear()}{" "}
            <span style={{ fontWeight: 700, color: "#0f172a" }}>Nexus Founders</span>. All rights reserved.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <span style={{ fontWeight: 600, color: "#0284c7" }}>
              Building Business Legacies with Founders
            </span>
          </div>
        </div>
      </div>

      {/* Styled Scoped CSS for Footer Interactions */}
      <style jsx>{`
        .footer-social-pill {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .footer-social-pill:hover {
          transform: translateY(-3px);
        }

        .footer-social-pill.footer-linkedin:hover {
          color: #ffffff;
          background: #0a66c2;
          border-color: #0a66c2;
          box-shadow: 0 8px 20px rgba(10, 102, 194, 0.35);
        }

        .footer-social-pill.footer-instagram:hover {
          color: #ffffff;
          background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%);
          border-color: #d6249f;
          box-shadow: 0 8px 20px rgba(214, 36, 159, 0.35);
        }

        .footer-social-pill.footer-youtube:hover {
          color: #ffffff;
          background: #ff0000;
          border-color: #ff0000;
          box-shadow: 0 8px 20px rgba(255, 0, 0, 0.35);
        }

        .footer-social-pill.footer-email:hover {
          color: #ffffff;
          background: #0284c7;
          border-color: #0284c7;
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.35);
        }

        .footer-nav-link:hover {
          color: #0284c7 !important;
          padding-left: 2px;
        }

        .footer-nav-link:hover .footer-link-bullet {
          color: #0284c7 !important;
          transform: translateX(3px);
        }

        @media (min-width: 992px) {
          .footer-connect-col {
            margin-left: auto;
          }
        }
      `}</style>
    </footer>
  );
}