"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  Banknote,
  ShieldCheck,
  Download,
  Search,
  X,
  Eye,
  ExternalLink,
  RefreshCw,
  Filter,
  CheckCircle2,
  UserCheck,
  Send,
} from "lucide-react";
import EmailChooserModal from "@/components/bankers/EmailChooserModal";

interface BankerDoc {
  _id: string;
  name: string;
  email: string;
  role: string;
  bankerProfile: {
    bankName: string;
    designation: string;
    institutionType?: string;
    experience?: string;
    department?: string;
    city?: string;
    country?: string;
    phone?: string;
    ticketSizeMin?: string;
    ticketSizeMax?: string;
    bio?: string;
    linkedinUrl?: string;
    isVerified?: boolean;
    onlineStatus?: boolean;
  };
  createdAt: string;
}

export default function BankersManager() {
  const [bankers, setBankers] = useState<BankerDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedBanker, setSelectedBanker] = useState<BankerDoc | null>(null);
  const [emailTarget, setEmailTarget] = useState<BankerDoc | null>(null);

  const fetchBankers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bankers-connect/bankers");
      const data = await res.json();
      if (data.success) {
        setBankers(data.data || []);
      } else {
        setError(data.error || "Failed to fetch bankers list");
      }
    } catch (e: any) {
      setError(e.message || "Failed to load bankers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankers();
  }, []);

  // Filtered Bankers
  const filteredBankers = useMemo(() => {
    return bankers.filter((b) => {
      const p = b.bankerProfile || {};
      const matchesSearch =
        !searchQuery.trim() ||
        [
          b.name,
          b.email,
          p.bankName,
          p.designation,
          p.department,
          p.city,
          p.phone,
          p.experience,
        ].some((val) => val?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        typeFilter === "all" ||
        (p.institutionType || "Bank").toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [bankers, searchQuery, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = bankers.length;
    let bankCount = 0;
    let nbfcCount = 0;
    let fintechCount = 0;
    let otherCount = 0;
    let verifiedCount = 0;

    bankers.forEach((b) => {
      const t = (b.bankerProfile?.institutionType || "Bank").toLowerCase();
      if (t.includes("bank") && !t.includes("nbfc") && !t.includes("fintech") && !t.includes("other")) {
        bankCount++;
      } else if (t.includes("nbfc")) {
        nbfcCount++;
      } else if (t.includes("fintech")) {
        fintechCount++;
      } else {
        otherCount++;
      }
      if (b.bankerProfile?.isVerified !== false) verifiedCount++;
    });

    return { total, bankCount, nbfcCount, fintechCount, otherCount, verifiedCount };
  }, [bankers]);

  // Export to CSV
  const exportToCSV = () => {
    if (!bankers.length) return;
    const headers = [
      "Full Name",
      "Official Email",
      "Institution Type",
      "Bank / Institution Name",
      "Designation",
      "Department",
      "Experience",
      "The Average Ticket Size Deal In",
      "Minimum Ticket Size",
      "City / Location",
      "Country",
      "Phone",
      "LinkedIn URL",
      "Bio",
      "Joined Date",
    ];

    const rows = bankers.map((b) => {
      const p = b.bankerProfile || {};
      return [
        `"${(b.name || "").replace(/"/g, '""')}"`,
        `"${(b.email || "").replace(/"/g, '""')}"`,
        `"${(p.institutionType || "Bank").replace(/"/g, '""')}"`,
        `"${(p.bankName || "").replace(/"/g, '""')}"`,
        `"${(p.designation || "").replace(/"/g, '""')}"`,
        `"${(p.department || "").replace(/"/g, '""')}"`,
        `"${(p.experience || "").replace(/"/g, '""')}"`,
        `"${(p.ticketSizeMax || "").replace(/"/g, '""')}"`,
        `"${(p.ticketSizeMin || "").replace(/"/g, '""')}"`,
        `"${(p.city || "").replace(/"/g, '""')}"`,
        `"${(p.country || "India").replace(/"/g, '""')}"`,
        `"${(p.phone || "").replace(/"/g, '""')}"`,
        `"${(p.linkedinUrl || "").replace(/"/g, '""')}"`,
        `"${(p.bio || "").replace(/"/g, '""')}"`,
        `"${b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN") : ""}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bankers_list_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInstitutionColor = (type?: string) => {
    const t = (type || "Bank").toLowerCase();
    if (t.includes("bank")) return { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)" };
    if (t.includes("nbfc")) return { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.12)" };
    if (t.includes("fintech")) return { color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" };
    return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" };
  };

  return (
    <div>
      {/* Stat Cards */}
      <div className="db-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        <div className="db-stat">
          <div className="db-stat-num" style={{ color: "#2563eb" }}>{stats.total}</div>
          <div className="db-stat-lbl">Total Bankers</div>
        </div>
        <div className="db-stat">
          <div className="db-stat-num" style={{ color: "#3b82f6" }}>{stats.bankCount}</div>
          <div className="db-stat-lbl">Banks</div>
        </div>
        <div className="db-stat">
          <div className="db-stat-num" style={{ color: "#8b5cf6" }}>{stats.nbfcCount}</div>
          <div className="db-stat-lbl">NBFCs</div>
        </div>
        <div className="db-stat">
          <div className="db-stat-num" style={{ color: "#10b981" }}>{stats.fintechCount}</div>
          <div className="db-stat-lbl">Fintechs</div>
        </div>
        <div className="db-stat">
          <div className="db-stat-num" style={{ color: "#f59e0b" }}>{stats.otherCount}</div>
          <div className="db-stat-lbl">Other Institutes</div>
        </div>
      </div>

      {/* Toolbar: Search, Filter, Export */}
      <div className="db-toolbar" style={{ flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div className="db-search-wrap" style={{ flex: 1, minWidth: "240px" }}>
          <Search size={15} className="db-search-icon" />
          <input
            type="text"
            className="db-search"
            placeholder="Search bankers by name, email, bank, city, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="db-search-clear" onClick={() => setSearchQuery("")}>
              <X size={13} />
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              height: "38px",
              padding: "0 0.85rem",
              borderRadius: "8px",
              border: "1.5px solid #c7d2fe",
              background: "var(--db-card-bg, #fff)",
              color: "inherit",
              fontSize: "0.83rem",
              fontWeight: 600,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Institutions</option>
            <option value="bank">Banks</option>
            <option value="nbfc">NBFCs</option>
            <option value="fintech">Fintechs</option>
            <option value="other financial institute">Other Financial Institutes</option>
          </select>

          <button
            type="button"
            onClick={exportToCSV}
            disabled={!bankers.length}
            style={{
              height: "38px",
              padding: "0 1rem",
              borderRadius: "8px",
              border: "1.5px solid #10b981",
              background: "rgba(16, 185, 129, 0.12)",
              color: "#10b981",
              fontSize: "0.83rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              cursor: bankers.length ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
            title="Export all bankers list to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={fetchBankers}
            disabled={loading}
            style={{
              height: "38px",
              padding: "0 0.85rem",
              borderRadius: "8px",
              border: "1.5px solid #c7d2fe",
              background: "transparent",
              color: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.83rem",
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", padding: "0.75rem 1rem", color: "#ef4444", marginBottom: "1rem", fontSize: "0.88rem" }}>
          {error}
        </div>
      )}

      {/* Table Card */}
      <div className="db-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
            <RefreshCw size={24} className="spin" style={{ margin: "0 auto 0.5rem" }} />
            <p style={{ margin: 0, fontSize: "0.9rem" }}>Loading bankers database...</p>
          </div>
        ) : filteredBankers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
            <Building2 size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
            <h4 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem", fontWeight: 700 }}>No Bankers Found</h4>
            <p style={{ margin: 0, fontSize: "0.85rem" }}>
              {searchQuery || typeFilter !== "all"
                ? "Try adjusting your search query or filter"
                : "No registered bankers yet in the system."}
            </p>
          </div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Banker / Profile</th>
                  <th>Institution & Type</th>
                  <th>Designation & Dept</th>
                  <th>Experience</th>
                  <th>Average Ticket Size</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBankers.map((b) => {
                  const p = b.bankerProfile || {};
                  const instBadge = getInstitutionColor(p.institutionType);
                  return (
                    <tr key={b._id}>
                      {/* Name & Email */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "10px",
                              background: "linear-gradient(135deg, #2563eb, #6366f1)",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "0.9rem",
                              flexShrink: 0,
                            }}
                          >
                            {b.name?.[0]?.toUpperCase() || "B"}
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <span className="cell-name">{b.name}</span>
                              {p.isVerified !== false && (
                                <span title="Verified Banker" style={{ display: "inline-flex" }}>
                                  <ShieldCheck size={13} color="#10b981" />
                                </span>
                              )}
                            </div>
                            <div className="cell-sub">{b.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Institution */}
                      <td>
                        <div style={{ fontWeight: 700, color: "inherit" }}>
                          {p.bankName || "—"}
                        </div>
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "0.2rem",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "12px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            background: instBadge.bg,
                            color: instBadge.color,
                          }}
                        >
                          {p.institutionType || "Bank"}
                        </span>
                      </td>

                      {/* Designation & Dept */}
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.designation || "—"}</div>
                        <div className="cell-sub">{p.department || "Corporate Banking"}</div>
                      </td>

                      {/* Experience */}
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.82rem", fontWeight: 600 }}>
                          <Clock size={12} color="#64748b" />
                          {p.experience || "—"}
                        </span>
                      </td>

                      {/* Average Ticket Size */}
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            color: "#10b981",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            background: "rgba(16, 185, 129, 0.1)",
                            padding: "0.2rem 0.55rem",
                            borderRadius: "8px",
                          }}
                        >
                          <Banknote size={13} />
                          {p.ticketSizeMax || p.ticketSizeMin || "Flexible"}
                        </span>
                      </td>

                      {/* Location */}
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.82rem" }}>
                          <MapPin size={12} color="#64748b" />
                          {p.city || "Pan-India"}{p.country ? `, ${p.country}` : ""}
                        </span>
                      </td>

                      {/* Phone */}
                      <td>
                        <div style={{ fontSize: "0.82rem" }}>{p.phone || "—"}</div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                          <button
                            type="button"
                            onClick={() => setSelectedBanker(b)}
                            style={{
                              padding: "0.4rem 0.65rem",
                              borderRadius: "7px",
                              border: "1px solid #c7d2fe",
                              background: "rgba(99, 102, 241, 0.08)",
                              color: "#4f46e5",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              cursor: "pointer",
                            }}
                            title="View Full Profile Details"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEmailTarget(b)}
                            style={{
                              padding: "0.4rem 0.65rem",
                              borderRadius: "7px",
                              border: "1px solid rgba(16, 185, 129, 0.4)",
                              background: "rgba(16, 185, 129, 0.1)",
                              color: "#10b981",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              cursor: "pointer",
                            }}
                            title="Send Email / Contact"
                          >
                            <Mail size={13} />
                            <span>Email</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBanker && (
        <BankerDetailModal
          banker={selectedBanker}
          onClose={() => setSelectedBanker(null)}
          onEmail={() => {
            const b = selectedBanker;
            setSelectedBanker(null);
            setEmailTarget(b);
          }}
        />
      )}

      {/* Email Application Chooser */}
      {emailTarget && (
        <EmailChooserModal
          banker={emailTarget}
          onClose={() => setEmailTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Full Banker Detail Modal ──────────────────────────────────────────
function BankerDetailModal({
  banker,
  onClose,
  onEmail,
}: {
  banker: BankerDoc;
  onClose: () => void;
  onEmail: () => void;
}) {
  const p = banker.bankerProfile || {};

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--db-card-bg, #ffffff)",
          color: "inherit",
          borderRadius: "20px",
          padding: "1.75rem",
          maxWidth: "680px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 65px rgba(0,0,0,0.3)",
          border: "1.5px solid #c7d2fe",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            border: "none",
            background: "rgba(148, 163, 184, 0.15)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(13deg, #2563eb, #6366f1)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: 800,
              boxShadow: "0 6px 18px rgba(37, 99, 235, 0.3)",
            }}
          >
            {banker.name?.[0]?.toUpperCase() || "B"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>{banker.name}</h3>
              {p.isVerified !== false && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "12px",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
            </div>
            <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.88rem" }}>
              {p.designation || "Banking Professional"} &bull; {p.bankName}
            </p>
          </div>
        </div>

        {/* Grid info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0.9rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: "12px", padding: "0.85rem 1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Institution Type</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2563eb", marginTop: "0.2rem" }}>
              {p.institutionType || "Bank"}
            </div>
          </div>

          <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: "12px", padding: "0.85rem 1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Bank / Institution</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "0.2rem" }}>
              {p.bankName || "—"}
            </div>
          </div>

          <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "12px", padding: "0.85rem 1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Average Ticket Size (Deals In)</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#10b981", marginTop: "0.2rem" }}>
              {p.ticketSizeMax || p.ticketSizeMin || "Flexible"}
            </div>
          </div>

          <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: "12px", padding: "0.85rem 1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Experience</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "0.2rem" }}>
              {p.experience || "Not Specified"}
            </div>
          </div>

          <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: "12px", padding: "0.85rem 1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Department / Focus</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "0.2rem" }}>
              {p.department || "Corporate & Startup Banking"}
            </div>
          </div>

          <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: "12px", padding: "0.85rem 1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Location / City & Country</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "0.2rem" }}>
              {p.city || "Pan-India"}{p.country ? `, ${p.country}` : ""}
            </div>
          </div>

          <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: "12px", padding: "0.85rem 1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Official Email</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, marginTop: "0.2rem", wordBreak: "break-all" }}>
              {banker.email}
            </div>
          </div>

          <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: "12px", padding: "0.85rem 1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Contact Phone</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "0.2rem" }}>
              {p.phone || "—"}
            </div>
          </div>
        </div>

        {/* Bio */}
        {p.bio && (
          <div style={{ background: "rgba(148, 163, 184, 0.08)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Professional Bio & Portfolio Focus
            </div>
            <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.5, color: "inherit" }}>
              {p.bio}
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px solid rgba(148, 163, 184, 0.2)" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "transparent",
              color: "inherit",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEmail}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              border: "none",
              background: "#10b981",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            <Mail size={15} />
            <span>Send Email to Banker</span>
          </button>
        </div>
      </div>
    </div>
  );
}
