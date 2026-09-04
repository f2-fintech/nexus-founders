"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

interface EventDoc {
  _id: string;
  title: string;
  day: string;
  month: string;
  eventDate: string;
  desc: string;
  address: string;
  btnText: string;
  isActive: boolean;
}

const EMPTY_FORM = {
  title: "",
  day: "",
  month: "",
  eventDate: "",
  desc: "",
  address: "",
  btnText: "See More",
  isActive: true,
};

export default function UpcomingEventsManager({ onSaved }: { onSaved: () => void }) {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch all events including inactive for admin panel
      const res = await fetch("/api/upcoming-events/all");
      const data = await res.json();
      if (data.success) setEvents(data.data);
    } catch {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setError("");
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = "";
  };

  const openEdit = (ev: EventDoc) => {
    setForm({
      title: ev.title,
      day: ev.day,
      month: ev.month,
      eventDate: ev.eventDate ? ev.eventDate.slice(0, 10) : "",
      desc: ev.desc,
      address: ev.address,
      btnText: ev.btnText || "See More",
      isActive: ev.isActive,
    });
    setEditId(ev._id);
    setError("");
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const handleSave = async () => {
    if (!form.title || !form.day || !form.month || !form.eventDate || !form.desc || !form.address) {
      setError("Please fill all required fields.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editId ? `/api/upcoming-events/${editId}` : "/api/upcoming-events";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Save failed");
      closeModal();
      await fetchAll();
      onSaved();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      await fetch(`/api/upcoming-events/${id}`, { method: "DELETE" });
      await fetchAll();
      onSaved();
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggle = async (ev: EventDoc) => {
    await fetch(`/api/upcoming-events/${ev._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !ev.isActive }),
    });
    await fetchAll();
    onSaved();
  };

  return (
    <>
      {/* Admin Panel Card */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        border: "1.5px solid rgba(14,165,233,0.3)",
        borderRadius: "16px",
        padding: "1.5rem 2rem",
        marginBottom: "2rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "1rem", margin: 0 }}>
            🗓️ Manage Upcoming Events
          </h3>
          <button
            onClick={openAdd}
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.5rem 1.1rem",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Plus size={15} /> Add Event
          </button>
        </div>

        {loading ? (
          <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Loading...</div>
        ) : events.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: "0.9rem" }}>No events yet. Add one above.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {events.map((ev) => (
              <div key={ev._id} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}>
                <div>
                  <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.9rem" }}>{ev.title}</div>
                  <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{ev.day} {ev.month} · {ev.address}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggle(ev)}
                    title={ev.isActive ? "Click to deactivate" : "Click to activate"}
                    style={{ background: "none", border: "none", cursor: "pointer", color: ev.isActive ? "#22c55e" : "#64748b" }}
                  >
                    {ev.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  {/* Edit */}
                  <button
                    onClick={() => openEdit(ev)}
                    style={{ background: "rgba(99,102,241,0.2)", border: "none", borderRadius: "6px", padding: "0.35rem 0.6rem", cursor: "pointer", color: "#818cf8" }}
                  >
                    <Pencil size={14} />
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(ev._id)}
                    disabled={deleteId === ev._id}
                    style={{ background: "rgba(239,68,68,0.15)", border: "none", borderRadius: "6px", padding: "0.35rem 0.6rem", cursor: "pointer", color: "#f87171" }}
                  >
                    {deleteId === ev._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal rendered via Portal directly into document.body to escape stacking context */}
      {showModal && typeof document !== "undefined" && createPortal(
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "2rem",
            width: "100%",
            maxWidth: "520px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
            scrollbarWidth: "none",
          }}>
            {/* Hide scrollbar for webkit */}
            <style>{`
              .event-modal-body::-webkit-scrollbar { display: none; }
            `}</style>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#0f172a", fontWeight: 700, fontSize: "1.15rem", margin: 0 }}>
                {editId ? "✏️ Edit Event" : "➕ Add New Event"}
              </h2>
              <button onClick={closeModal} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", borderRadius: "8px", padding: "0.3rem 0.5rem", display: "flex", alignItems: "center" }}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.6rem 1rem", marginBottom: "1rem", color: "#dc2626", fontSize: "0.85rem" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Event Title *", key: "title", placeholder: "e.g. Nexus Founder's 18th Edition" },
                { label: "Day *", key: "day", placeholder: "e.g. 26th" },
                { label: "Month & Year *", key: "month", placeholder: "e.g. September 2026" },
                { label: "Description *", key: "desc", placeholder: "Short description of the event" },
                { label: "Venue / Address *", key: "address", placeholder: "e.g. Moonlit Infra" },
                { label: "Button Text", key: "btnText", placeholder: "See More" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ color: "#374151", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>{label}</label>
                  {key === "desc" ? (
                    <textarea
                      value={(form as any)[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      rows={3}
                      style={inputStyle}
                    />
                  ) : (
                    <input
                      value={(form as any)[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}

              {/* Date picker */}
              <div>
                <label style={{ color: "#374151", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>Event Date * (for sorting)</label>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                  style={{ ...inputStyle, colorScheme: "light" }}
                />
              </div>

              {/* Active toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#f8fafc", borderRadius: "10px", padding: "0.6rem 0.9rem", border: "1px solid #e2e8f0" }}>
                <label style={{ color: "#374151", fontSize: "0.85rem", fontWeight: 600, flex: 1 }}>Active (visible on site)</label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: form.isActive ? "#16a34a" : "#94a3b8" }}
                >
                  {form.isActive ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={closeModal}
                style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569", borderRadius: "8px", padding: "0.6rem 1.2rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)", color: "#fff", border: "none", borderRadius: "8px", padding: "0.6rem 1.4rem", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? <><Loader2 size={15} /> Saving...</> : (editId ? "Save Changes" : "Create Event")}
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "0.6rem 0.9rem",
  color: "#0f172a",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  resize: "vertical" as const,
  fontFamily: "inherit",
};
