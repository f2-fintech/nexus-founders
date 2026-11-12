"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  RefreshCw,
  X,
  Check,
  Upload,
  AlertCircle,
  Sparkles,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";

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

// Play pleasant camera shutter click sound
function playShutterSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const bufferSize = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.038);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch (e) {
    // Ignore audio policy errors
  }
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
  const [shutterFlashing, setShutterFlashing] = useState(false);

  // Captured snapshot & OCR scanning state
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    isValidCard: boolean;
    contactName?: string;
    contactCompany?: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
  } | null>(null);

  const [contactName, setContactName] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [useUploadFallback, setUseUploadFallback] = useState(false);
  const [manualBypass, setManualBypass] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputCameraRef = useRef<HTMLInputElement>(null);
  const fileInputGalleryRef = useRef<HTMLInputElement>(null);

  // Stop camera stream cleanly
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

  // Start live camera stream safely with device-friendly fallbacks
  const startCamera = useCallback(
    async (mode: "environment" | "user") => {
      stopStream();
      setCameraError(null);
      setIsStarting(true);

      const isSecure = typeof window !== "undefined" ? window.isSecureContext : true;
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

      if (!isSecure && !isLocalhost && typeof window !== "undefined") {
        setCameraError(
          `In-browser live camera requires HTTPS. Since you are testing over local network (http://${window.location.hostname}), tap "Open Phone Camera" below to snap directly.`
        );
        setIsStarting(false);
        setUseUploadFallback(true);
        return;
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraError("Camera API is not supported in this browser. Please use the button below to upload a card photo.");
        setIsStarting(false);
        setUseUploadFallback(true);
        return;
      }

      let mediaStream: MediaStream | null = null;

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err1) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: mode === "environment" ? "user" : "environment",
            },
            audio: false,
          });
        } catch (err2) {
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          } catch (err3: any) {
            console.warn("Could not start camera, using fallback:", err3);
            let msg = "Camera access is not available or was blocked.";
            if (err3?.name === "NotAllowedError" || err3?.name === "PermissionDeniedError") {
              msg = "Camera permission was blocked. Please tap the permissions / lock icon in your browser address bar and allow Camera.";
            } else if (err3?.name === "NotFoundError" || err3?.name === "DevicesNotFoundError") {
              msg = "No camera found on this device. You can choose a photo from your gallery below.";
            }
            setCameraError(msg);
            setIsStarting(false);
            setUseUploadFallback(true);
            return;
          }
        }
      }

      if (!mediaStream) return;
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .then(() => {
              setIsCameraLive(true);
              setIsStarting(false);
              setUseUploadFallback(false);
            })
            .catch(() => {
              setIsCameraLive(true);
              setIsStarting(false);
              setUseUploadFallback(false);
            });
        };
      }
    },
    [stopStream]
  );

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
    setScanResult(null);
    setIsScanning(false);
    setUploadedUrl(null);
    setContactName("");
    setContactCompany("");
    setCameraError(null);
    setUseUploadFallback(false);
    setManualBypass(false);
    onClose();
  };

  // Flip front & back camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  /**
   * Process captured card image:
   * Runs real OCR & card validation via /api/bingo/scan.
   * Auto-extracts Contact Name & Company only when a genuine card is detected.
   */
  const processCardScan = async (blob: Blob) => {
    setIsScanning(true);
    setScanResult(null);
    setManualBypass(false);

    try {
      const formData = new FormData();
      formData.append("file", blob, "visiting-card.jpg");
      formData.append("folder", "nexus-founders/bingo-cards");

      const res = await fetch("/api/bingo/scan", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Card scan failed");
      }

      setUploadedUrl(data.url);
      setScanResult({
        isValidCard: data.isValidCard,
        contactName: data.contactName,
        contactCompany: data.contactCompany,
        email: data.email,
        phone: data.phone,
        photoUrl: data.url,
      });

      if (data.isValidCard) {
        if (data.contactName) setContactName(data.contactName);
        if (data.contactCompany) setContactCompany(data.contactCompany);
      }
    } catch (err: any) {
      console.warn("Scan OCR error:", err);
      setScanResult({
        isValidCard: false,
      });
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * MANUAL CAPTURE:
   * User explicitly taps the capture button when the card is aligned in the frame.
   * Maps the guide frame's on-screen bounding rect to the native camera feed
   * for a 100% pixel-perfect crop containing ONLY the card in the guide frame.
   */
  const takeSnapshot = useCallback(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    const guide = guideRef.current;
    if (!video || !container || !guide || !video.videoWidth || !video.videoHeight) {
      return;
    }

    try {
      setShutterFlashing(true);
      playShutterSound();
      setTimeout(() => setShutterFlashing(false), 240);

      const containerRect = container.getBoundingClientRect();
      const guideRect = guide.getBoundingClientRect();

      const cw = containerRect.width;
      const ch = containerRect.height;
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      const scale = Math.max(cw / vw, ch / vh);
      const renderedW = vw * scale;
      const renderedH = vh * scale;

      const offsetX = (renderedW - cw) / 2;
      const offsetY = (renderedH - ch) / 2;

      const gx = guideRect.left - containerRect.left;
      const gy = guideRect.top - containerRect.top;
      const gw = guideRect.width;
      const gh = guideRect.height;

      const srcX = Math.max(0, Math.min(vw - 20, (gx + offsetX) / scale));
      const srcY = Math.max(0, Math.min(vh - 20, (gy + offsetY) / scale));
      const srcW = Math.max(20, Math.min(vw - srcX, gw / scale));
      const srcH = Math.max(20, Math.min(vh - srcY, gh / scale));

      const outputWidth = Math.min(1280, Math.max(800, Math.round(srcW)));
      const outputHeight = Math.round(outputWidth * (gh / gw));

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, outputWidth, outputHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCapturedBlob(blob);
            const previewUrl = URL.createObjectURL(blob);
            setCapturedPreview(previewUrl);
            stopStream();
            processCardScan(blob);
          }
        },
        "image/jpeg",
        0.92
      );
    } catch (err) {
      console.error("Snapshot error:", err);
    }
  }, [stopStream]);

  // Fallback file input change (auto-crops file to 1.586:1 card ratio)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const targetAspect = 1.586;
        const imgAspect = img.width / img.height;
        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height;

        if (imgAspect > targetAspect) {
          sw = Math.round(img.height * targetAspect);
          sx = Math.round((img.width - sw) / 2);
        } else {
          sh = Math.round(img.width / targetAspect);
          sy = Math.round((img.height - sh) / 2);
        }

        const canvas = document.createElement("canvas");
        const outW = Math.min(1280, Math.max(800, sw));
        const outH = Math.round(outW / targetAspect);
        canvas.width = outW;
        canvas.height = outH;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                setCapturedBlob(blob);
                setCapturedPreview(URL.createObjectURL(blob));
                stopStream();
                processCardScan(blob);
              }
            },
            "image/jpeg",
            0.92
          );
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Retake photo: resets preview and starts camera again
  const handleRetake = () => {
    if (capturedPreview) {
      try {
        URL.revokeObjectURL(capturedPreview);
      } catch (e) {}
    }
    setCapturedBlob(null);
    setCapturedPreview(null);
    setScanResult(null);
    setIsScanning(false);
    setUploadedUrl(null);
    setContactName("");
    setContactCompany("");
    setManualBypass(false);
    if (!useUploadFallback) {
      startCamera(facingMode);
    }
  };

  // Confirm and complete tile
  const handleConfirmAndUpload = async () => {
    if (!capturedBlob) return;

    // Check if card is valid or user chose to manually bypass
    const isValid = scanResult?.isValidCard || manualBypass || (contactName.trim() && contactCompany.trim());
    if (!isValid) {
      alert("Please ensure a valid visiting card is scanned, or enter both Contact Name and Company Name manually.");
      return;
    }

    // If already uploaded during OCR scan, complete instantly!
    if (uploadedUrl) {
      onCaptureComplete({
        photoUrl: uploadedUrl,
        contactName: contactName.trim(),
        contactCompany: contactCompany.trim(),
      });
      handleClose();
      return;
    }

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
      alert(`Error saving visiting card: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const isCardVerified = Boolean(scanResult?.isValidCard);
  const canSubmit = isCardVerified || manualBypass || (contactName.trim().length > 1 && contactCompany.trim().length > 1);

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
        if (e.target === e.currentTarget && !uploading && !isScanning) handleClose();
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
            padding: "0.85rem 1.15rem",
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
                fontSize: "1rem",
                fontWeight: 800,
                color: "#38bdf8",
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              <Camera size={17} />
              {title}
            </h3>
            {subtitle && (
              <p
                style={{
                  margin: "0.15rem 0 0",
                  fontSize: "0.78rem",
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
            disabled={uploading || isScanning}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#cbd5e1",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div
          ref={containerRef}
          style={{
            position: "relative",
            background: "#020617",
            width: "100%",
            height: "330px",
            minHeight: "330px",
            maxHeight: "330px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {capturedPreview ? (
            /* Snapshot Preview with Real OCR Scanning Overlay */
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                boxSizing: "border-box",
                background: "radial-gradient(circle at center, rgba(15, 23, 42, 0.95), #020617)",
              }}
            >
              <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}>
                {/* Laser scan beam animation while OCR is reading card text */}
                {isScanning && <div className="ocr-scanning-laser" />}

                <img
                  src={capturedPreview}
                  alt="Visiting card cropped snapshot"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "260px",
                    objectFit: "contain",
                    borderRadius: "12px",
                    border: isScanning
                      ? "2px solid #38bdf8"
                      : isCardVerified
                      ? "2.5px solid #10b981"
                      : "2px solid #ef4444",
                    boxShadow: isScanning
                      ? "0 0 25px rgba(56, 189, 248, 0.45)"
                      : isCardVerified
                      ? "0 0 25px rgba(16, 185, 129, 0.45)"
                      : "0 0 25px rgba(239, 68, 68, 0.35)",
                    display: "block",
                  }}
                />

                {/* Scan Status Badge on top of Preview */}
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: isScanning
                      ? "rgba(2, 132, 199, 0.95)"
                      : isCardVerified
                      ? "rgba(16, 185, 129, 0.95)"
                      : "rgba(239, 68, 68, 0.95)",
                    color: "#ffffff",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "0.22rem 0.65rem",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} />
                      <span>Verifying Card Text...</span>
                    </>
                  ) : isCardVerified ? (
                    <>
                      <Check size={13} strokeWidth={3} />
                      <span>Card Verified</span>
                    </>
                  ) : (
                    <>
                      <X size={13} strokeWidth={3} />
                      <span>Not a Card</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : !useUploadFallback ? (
            /* Live Camera View with Centered Viewfinder Overlay */
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
            >
              {/* Camera Shutter Flash Animation */}
              {shutterFlashing && <div className="shutter-flash-overlay" />}

              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  zIndex: 1,
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
                  <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Opening Camera Feed...</span>
                </div>
              )}

              {/* Centered Guide Frame Overlay Layer */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              >
                {/* The Business Card Guide Frame with standard ratio (1.586:1) */}
                <div
                  ref={guideRef}
                  style={{
                    position: "relative",
                    width: "min(88%, 320px)",
                    aspectRatio: "1.586 / 1",
                    borderRadius: "14px",
                    border: "2px dashed #38bdf8",
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* 4 Corner High-Tech Brackets */}
                  <div className="corner-bracket corner-top-left" />
                  <div className="corner-bracket corner-top-right" />
                  <div className="corner-bracket corner-bottom-left" />
                  <div className="corner-bracket corner-bottom-right" />

                  {/* Animated Subtle Scanner Laser Beam */}
                  <div className="scanner-laser-beam" />

                  {/* Guide Status Badge */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-35px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(2, 132, 199, 0.95)",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.28rem 0.95rem",
                      borderRadius: "20px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.45)",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <span>💳 Align Visiting Card & Tap Capture</span>
                  </div>
                </div>
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
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(6px)",
                  zIndex: 4,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          ) : (
            /* Upload Fallback Screen */
            <div
              style={{
                padding: "1.75rem 1.25rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.85rem",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {cameraError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.6rem",
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    color: "#fbbf24",
                    padding: "0.75rem 0.95rem",
                    borderRadius: "12px",
                    fontSize: "0.82rem",
                    textAlign: "left",
                    lineHeight: 1.45,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{cameraError}</span>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", width: "100%", maxWidth: "340px" }}>
                <button
                  type="button"
                  onClick={() => fileInputCameraRef.current?.click()}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1.25rem",
                    background: "linear-gradient(135deg, #0284c7, #0369a1)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.6rem",
                    boxShadow: "0 6px 20px rgba(2, 132, 199, 0.35)",
                  }}
                >
                  <Camera size={19} />
                  Snap with Phone Camera
                </button>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => fileInputGalleryRef.current?.click()}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "10px",
                      color: "#cbd5e1",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.45rem",
                    }}
                  >
                    <Upload size={16} />
                    Choose File
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUseUploadFallback(false);
                      startCamera(facingMode);
                    }}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      background: "rgba(56, 189, 248, 0.1)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      borderRadius: "10px",
                      color: "#38bdf8",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.45rem",
                    }}
                  >
                    <RefreshCw size={15} />
                    Retry Scanner
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden File Input for Native Phone Camera Capture */}
          <input
            ref={fileInputCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {/* Hidden File Input for Gallery / File Picker */}
          <input
            ref={fileInputGalleryRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Form Details & Actions */}
        <div
          style={{
            padding: "1.15rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
            background: "#0f172a",
          }}
        >
          {capturedPreview && (
            <>
              {/* Real OCR Scan Result Feedback Banner */}
              {isScanning ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.75rem 0.95rem",
                    borderRadius: "12px",
                    background: "rgba(56, 189, 248, 0.1)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    color: "#38bdf8",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                  }}
                >
                  <RefreshCw size={16} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                  <span>Analyzing visiting card with OCR... Verifying details...</span>
                </div>
              ) : isCardVerified ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.6rem",
                    padding: "0.75rem 0.95rem",
                    borderRadius: "12px",
                    background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    color: "#10b981",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  <Sparkles size={17} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.86rem" }}>
                      Visiting Card Verified Successfully!
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#6ee7b7", marginTop: "0.2rem" }}>
                      {[contactName, contactCompany, scanResult?.email, scanResult?.phone]
                        .filter(Boolean)
                        .join(" • ")}
                    </div>
                  </div>
                </div>
              ) : (
                /* Card Rejected Banner: Clearly informs user that the captured image is not a visiting card */
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                    padding: "0.75rem 0.95rem",
                    borderRadius: "12px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    color: "#f87171",
                    fontSize: "0.82rem",
                    lineHeight: 1.4,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontWeight: 700, color: "#ef4444" }}>
                    <AlertTriangle size={16} />
                    <span>No Visiting Card Detected!</span>
                  </div>
                  <div>
                    Is photo mein visiting card ka text ya contact details nahi mili. Kripya visiting card ko theek se frame mein rakh kar dobara photo lein.
                  </div>
                  {!manualBypass && (
                    <button
                      type="button"
                      onClick={() => setManualBypass(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#38bdf8",
                        textDecoration: "underline",
                        fontSize: "0.74rem",
                        cursor: "pointer",
                        alignSelf: "flex-start",
                        padding: 0,
                        marginTop: "0.2rem",
                      }}
                    >
                      Card details manually type karke proceed karein
                    </button>
                  )}
                </div>
              )}

              {/* Editable Name & Company Input Fields */}
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
                    Contact Name {contactName ? "(Detected)" : ""}
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
                    Company Name {contactCompany ? "(Detected)" : ""}
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
            </>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.2rem" }}>
            {!capturedPreview ? (
              <>
                {!useUploadFallback && (
                  <button
                    type="button"
                    onClick={() => takeSnapshot()}
                    className="card-scanner-shutter-btn"
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
                    <Camera size={19} />
                    <span>Capture Visiting Card</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    fileInputGalleryRef.current?.click();
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
                  disabled={uploading || isScanning}
                  style={{
                    flex: 1,
                    padding: "0.8rem",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#cbd5e1",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: uploading || isScanning ? "wait" : "pointer",
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
                  disabled={uploading || isScanning || !canSubmit}
                  style={{
                    flex: 2,
                    padding: "0.8rem",
                    borderRadius: "12px",
                    background: canSubmit
                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      : "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    color: canSubmit ? "#fff" : "#64748b",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    cursor: canSubmit ? (uploading ? "wait" : "pointer") : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    boxShadow: canSubmit ? "0 6px 18px rgba(16, 185, 129, 0.35)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {uploading || isScanning ? (
                    <>
                      <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
                      {isScanning ? "Verifying..." : "Saving..."}
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
