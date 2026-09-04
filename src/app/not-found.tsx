import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "3.5rem", fontWeight: 800, color: "var(--neon-cyan)" }}>404</h1>
      <p style={{ margin: "1rem 0 1.5rem", color: "#94a3b8", fontSize: "1.1rem" }}>
        Page Not Found
      </p>
      <Link
        href="/"
        style={{
          padding: "0.7rem 1.5rem",
          borderRadius: "8px",
          background: "var(--gradient-neon)",
          color: "#000",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        Return Home
      </Link>
    </div>
  );
}
