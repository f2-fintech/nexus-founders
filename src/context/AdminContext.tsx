"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Founder {
  _id: string;
  name: string;
  role: string;
  company: string;
  photo: string;
  linkedin?: string;
  instagram?: string;
  googleplus?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  order?: number;
}

interface AdminContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  setEditModeOff: () => void;
  founders: Founder[];
  loadingFounders: boolean;
  addFounder: (f: Omit<Founder, "_id">) => Promise<void>;
  updateFounder: (f: Founder) => Promise<void>;
  deleteFounder: (id: string) => Promise<void>;
  refreshFounders: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loadingFounders, setLoadingFounders] = useState(true);

  // Read edit mode state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nexus_admin_edit_mode");
      if (saved === "true") {
        setIsEditMode(true);
      }
    } catch (e) {}
  }, []);

  const toggleEditMode = () => {
    setIsEditMode((prev) => {
      const next = !prev;
      try {
        if (next) {
          localStorage.setItem("nexus_admin_edit_mode", "true");
        } else {
          localStorage.removeItem("nexus_admin_edit_mode");
        }
      } catch (e) {}
      return next;
    });
  };

  const setEditModeOff = () => {
    setIsEditMode(false);
    try {
      localStorage.removeItem("nexus_admin_edit_mode");
    } catch (e) {}
  };

  const fetchFounders = async () => {
    try {
      setLoadingFounders(true);
      const res = await fetch("/api/founders");
      const json = await res.json();
      if (json.success) setFounders(json.data);
    } catch (e) {
      console.error("Failed to fetch founders", e);
    } finally {
      setLoadingFounders(false);
    }
  };

  useEffect(() => { fetchFounders(); }, []);

  const addFounder = async (f: Omit<Founder, "_id">) => {
    const res = await fetch("/api/founders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to create founder");
    setFounders((p) => [...p, json.data]);
  };

  const updateFounder = async (f: Founder) => {
    const res = await fetch(`/api/founders/${f._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to update founder");
    setFounders((p) => p.map((x) => (x._id === f._id ? json.data : x)));
  };

  const deleteFounder = async (id: string) => {
    const res = await fetch(`/api/founders/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to delete founder");
    setFounders((p) => p.filter((x) => x._id !== id));
  };

  return (
    <AdminContext.Provider value={{ isEditMode, toggleEditMode, setEditModeOff, founders, loadingFounders, addFounder, updateFounder, deleteFounder, refreshFounders: fetchFounders }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}