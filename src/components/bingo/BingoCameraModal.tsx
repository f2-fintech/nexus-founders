"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, X, Check, Upload, AlertCircle, Sparkles } from "lucide-react";

interface BingoCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onCaptureComplete: (data: {
    photoUrl: string;
    contactName?: string;
    contactCompany?: string;
  }) => void;
}

export default function BingoCameraModal({
  isOpen,
  onClose,
  title,
  subtitle,
  onCaptureComplete,
}: BingoCameraModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isStarting, setIsStarting] = useState(false);
  const [isCameraLive, setIsCameraLive] = useState(false);

  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [uploading, setUploading] = useState(false);
  const [useUploadFallback, setUseUploadFallback] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream cleanly without causing React re-render loops
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraLive(false);
  }, []);

  // Start camera stream safely
  const startCamera = useCallback(
    async (mode: "environment" | "user") => {
      stopStream();
      setCameraError(null);
      setIsStarting(true);

      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error("Camera API not supported in this browser");
        }

        let mediaStream: MediaStream;
        try {
          // Attempt with desired facing mode (environment on mobile, user on laptop)
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: mode === "environment" ? { ideal: "environment" } : "user",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (firstErr) {
          // Fallback to generic video if constraint fails
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              ?.play()
              .then(() => {
                setIsCameraLive(true);
                setIsStarting(false);
              })
              .catch(() => {
                setIsCameraLive(true);
                setIsStarting(false);
              });
          };
        }
      } catch (err: any) {
        console.warn("Could not start camera, using fallback:", err);
        setCameraError(
          "Camera access is not available or was blocked. You can snap a photo or choose an image directly using the button below."
        );
        setIsStarting(false);
        setUseUploadFallback(true);
      }
    },
    [stopStream]
  );

  // Trigger camera only when modal opens or camera facing mode is flipped
  useEffect(() => {
    if (isOpen && !capturedPreview && !useUploadFallback) {
      startCamera(facingMode);
    } else if (!isOpen) {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, useUploadFallback, capturedPreview, startCamera, stopStream]);

  // Handle modal close
  const handleClose = () => {
    stopStream();
    if (capturedPreview) {
      try {
        URL.revokeObjectURL(capturedPreview);
      } catch (e) {}
    }
    setCapturedBlob(null);
    setCapturedPreview(null);
    setContactName("");
    setContactCompany("");
    setCameraError(null);
    setUseUploadFallback(false);
    onClose();
  };

  // Switch between back & front camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Capture frame from video element
  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      alert("Camera is still initializing. Please wait a second.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          const previewUrl = URL.createObjectURL(blob);
          setCapturedPreview(previewUrl);
          stopStream();
        }
      },
      "image/jpeg",
      0.92
    );
  };

  // Fallback file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapturedBlob(file);
      const previewUrl = URL.createObjectURL(file);
      setCapturedPreview(previewUrl);
      stopStream();
    }
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedPreview) {
      try {
        URL.revokeObjectURL(capturedPreview);
      } catch (e) {}
    }
    setCapturedBlob(null);
    setCapturedPreview(null);
    if (!useUploadFallback) {
      startCamera(facingMode);
    }
  };

  // Upload image to server
  const handleConfirmAndUpload = async () => {
    if (!capturedBlob) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", capturedBlob, "visiting-card.jpg");
      formData.append("folder", "nexus-founders/bingo-cards");

      const res = await fetch("/api/bingo/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      onCaptureComplete({
        photoUrl: data.url,
        contactName: contactName.trim(),
        contactCompany: contactCompany.trim(),
      });
      handleClose();
    } catch (err: any) {
      alert(`Error uploading visiting card: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 15, 29, 0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        overscrollBehavior: "contain",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) handleClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#0f172a",
          borderRadius: "20px",
          border: "1.5px solid rgba(255, 255, 255, 0.12)",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
          color: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(15, 23, 42, 0.98)",
          }}
        >
          <div style={{ paddingRight: "0.5rem" }}>
            <h3
              style={{
                margin: 0,
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "#38bdf8",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Camera size={18} />
              {title}
            </h3>
            {subtitle && (
              <p
                style={{
                  margin: "0.2rem 0 0",
                  fontSize: "0.8rem",
                  color: "#94a3b8",
                  lineHeight: 1.3,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "none",
              borderRadius: "50%",
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#cbd5e1",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder / Preview Body (FIXED STABLE HEIGHT: 300px) */}
        <div
          style={{
            position: "relative",
            background: "#020617",
            width: "100%",
            height: "300px",
            minHeight: "300px",
            maxHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {capturedPreview ? (
            /* Snapshot Preview */
            <img
              src={capturedPreview}
              alt="Visiting card snapshot"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#000000",
                display: "block",
              }}
            />
          ) : !useUploadFallback ? (
            /* Live Camera View */
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Starting Camera Loading Indicator */}
              {isStarting && !isCameraLive && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(10, 15, 29, 0.9)",
                    color: "#38bdf8",
                    gap: "0.6rem",
                    zIndex: 2,
                  }}
                >
                  <RefreshCw
                    size={26}
                    style={{
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    Opening Camera Feed...
                  </span>
                </div>
              )}

              {/* Visiting Card Guide Overlay Frame */}
              <div
                style={{
                  position: "absolute",
                  inset: "12% 10%",
                  border: "2px dashed #38bdf8",
                  borderRadius: "14px",
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: "0.5rem",
                  zIndex: 3,
                }}
              >
                <span
                  style={{
                    background: "rgba(2, 132, 199, 0.9)",
                    color: "#ffffff",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.65rem",
                    borderRadius: "6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  }}
                >
                  Align Visiting Card Here
                </span>
              </div>

              {/* Flip camera button */}
              <button
                type="button"
                onClick={toggleFacingMode}
                title="Switch Camera (Front / Back)"
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  borderRadius: "50%",
                  width: "38px",
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(6px)",
                  zIndex: 4,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}
              >
                <RefreshCw size={17} />
              </button>
            </div>
          ) : (
            /* Upload Fallback */
            <div
              style={{
                padding: "2rem 1.5rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              {cameraError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    color: "#fbbf24",
                    padding: "0.65rem 0.95rem",
                    borderRadius: "10px",
                    fontSize: "0.82rem",
                    textAlign: "left",
                    lineHeight: 1.4,
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{cameraError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "0.85rem 1.75rem",
                  background: "linear-gradient(135deg, #0284c7, #0369a1)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  boxShadow: "0 6px 20px rgba(2, 132, 199, 0.35)",
                }}
              >
                <Camera size={18} />
                Snap Photo or Choose File
              </button>
            </div>
          )}

          {/* Hidden File Input for Native File/Camera Capture */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Form Details & Actions */}
        <div
          style={{
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
            background: "#0f172a",
          }}
        >
          {capturedPreview && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#94a3b8",
                    marginBottom: "0.3rem",
                  }}
                >
                  Contact Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Tan"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    background: "#1e293b",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "0.85rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#94a3b8",
                    marginBottom: "0.3rem",
                  }}
                >
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. FinTech Pte Ltd"
                  value={contactCompany}
                  onChange={(e) => setContactCompany(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    background: "#1e293b",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "0.85rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            {!capturedPreview ? (
              <>
                {!useUploadFallback && (
                  <button
                    type="button"
                    onClick={takeSnapshot}
                    style={{
                      flex: 1,
                      padding: "0.85rem",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                      border: "none",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      boxShadow: "0 6px 18px rgba(2, 132, 199, 0.35)",
                    }}
                  >
                    <Camera size={18} />
                    Snap Card Photo
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  style={{
                    padding: "0.85rem 1rem",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#cbd5e1",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                  }}
                >
                  <Upload size={16} />
                  Choose File
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={uploading}
                  style={{
                    flex: 1,
                    padding: "0.8rem",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#cbd5e1",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: uploading ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                  }}
                >
                  <RefreshCw size={16} />
                  Retake Photo
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndUpload}
                  disabled={uploading}
                  style={{
                    flex: 2,
                    padding: "0.8rem",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    cursor: uploading ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    boxShadow: "0 6px 18px rgba(16, 185, 129, 0.35)",
                  }}
                >
                  {uploading ? (
                    <>
                      <RefreshCw
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Uploading & Verifying...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Confirm & Mark Complete
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
