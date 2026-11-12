"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  RefreshCw,
  X,
  Check,
  Upload,
  AlertCircle,
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
  } catch (e) {}
}

/**
 * Canvas-based card presence heuristic.
 * Samples a small region of the live video to detect if a bright,
 * card-shaped object (moderate contrast, mid-high luminance) is in frame.
 */
function detectCardInFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): boolean {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return false;

  const W = 160, H = 100;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;

  ctx.drawImage(video, 0, 0, vw, vh, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);

  const grays: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    grays.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  const mean = grays.reduce((a, b) => a + b, 0) / grays.length;
  const variance = grays.reduce((s, v) => s + (v - mean) ** 2, 0) / grays.length;

  // Card must have moderate contrast and mid luminance range
  if (variance < 350 || variance > 7000) return false;
  if (mean < 60 || mean > 240) return false;

  // The centre of frame should be brighter than top/bottom edges
  const topMean = grays.slice(0, W).reduce((a, b) => a + b, 0) / W;
  const botMean = grays.slice(-W).reduce((a, b) => a + b, 0) / W;
  const midS = Math.floor((W * H) / 2) - W / 2;
  const midMean = grays.slice(midS, midS + W).reduce((a, b) => a + b, 0) / W;

  return midMean - (topMean + botMean) / 2 > 15;
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

  const [cardDetected, setCardDetected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const stableRef = useRef(0);

  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [uploading, setUploading] = useState(false);
  const [useUploadFallback, setUseUploadFallback] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyzeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const fileInputCameraRef = useRef<HTMLInputElement>(null);
  const fileInputGalleryRef = useRef<HTMLInputElement>(null);

  const stopStream = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (countdownRef.current) { clearTimeout(countdownRef.current); countdownRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => { try { t.stop(); } catch (_) {} });
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraLive(false);
    setCardDetected(false);
    setCountdown(null);
    stableRef.current = 0;
  }, []);

  // Snap from guide-frame region
  const triggerSnap = useCallback((video: HTMLVideoElement) => {
    const container = containerRef.current;
    const guide = guideRef.current;
    if (!container || !guide || !video.videoWidth) return;

    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

    setShutterFlashing(true);
    playShutterSound();
    setTimeout(() => setShutterFlashing(false), 240);

    try {
      const cr = container.getBoundingClientRect();
      const gr = guide.getBoundingClientRect();
      const vw = video.videoWidth, vh = video.videoHeight;
      const scale = Math.max(cr.width / vw, cr.height / vh);
      const offsetX = (vw * scale - cr.width) / 2;
      const offsetY = (vh * scale - cr.height) / 2;
      const gx = gr.left - cr.left, gy = gr.top - cr.top;
      const srcX = Math.max(0, (gx + offsetX) / scale);
      const srcY = Math.max(0, (gy + offsetY) / scale);
      const srcW = Math.min(vw - srcX, gr.width / scale);
      const srcH = Math.min(vh - srcY, gr.height / scale);
      const outW = Math.min(1280, Math.max(800, Math.round(srcW)));
      const outH = Math.round(outW * (gr.height / gr.width));

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCapturedBlob(blob);
            setCapturedPreview(URL.createObjectURL(blob));
            stopStream();
          }
        },
        "image/jpeg",
        0.92
      );
    } catch (e) { console.error(e); }
  }, [stopStream]);

  // Detection RAF loop
  const startDetectionLoop = useCallback((video: HTMLVideoElement) => {
    if (!analyzeCanvasRef.current) analyzeCanvasRef.current = document.createElement("canvas");
    const canvas = analyzeCanvasRef.current;
    let snapQueued = false;

    const loop = () => {
      if (!streamRef.current) return;
      const isCard = detectCardInFrame(video, canvas);
      stableRef.current = isCard
        ? Math.min(stableRef.current + 1, 999)
        : Math.max(stableRef.current - 2, 0);

      const stable = stableRef.current >= 8;
      setCardDetected(stable);

      if (stable && !snapQueued && !countdownRef.current) {
        snapQueued = true;
        let ct = 2;
        setCountdown(ct);
        const tick = () => {
          ct -= 1;
          if (ct <= 0) {
            setCountdown(null);
            countdownRef.current = null;
            triggerSnap(video);
          } else {
            setCountdown(ct);
            countdownRef.current = setTimeout(tick, 700);
          }
        };
        countdownRef.current = setTimeout(tick, 700);
      }

      if (!stable && countdownRef.current) {
        clearTimeout(countdownRef.current);
        countdownRef.current = null;
        snapQueued = false;
        setCountdown(null);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [triggerSnap]);

  const startCamera = useCallback(async (mode: "environment" | "user") => {
    stopStream();
    setCameraError(null);
    setIsStarting(true);
    setCapturedPreview(null);
    setCapturedBlob(null);

    const isSecure = typeof window !== "undefined" ? window.isSecureContext : true;
    const isLocal = typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    if (!isSecure && !isLocal) {
      setCameraError(`Camera requires HTTPS. Use "Snap with Phone Camera" button below.`);
      setIsStarting(false);
      setUseUploadFallback(true);
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError("Camera not supported. Please upload a card photo.");
      setIsStarting(false);
      setUseUploadFallback(true);
      return;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (err: any) {
        let msg = "Camera access was blocked or not available.";
        if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError")
          msg = "Camera permission blocked. Allow it in browser settings.";
        else if (err?.name === "NotFoundError")
          msg = "No camera found. Upload a card photo instead.";
        setCameraError(msg);
        setIsStarting(false);
        setUseUploadFallback(true);
        return;
      }
    }

    if (!stream) return;
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play()
          .then(() => { setIsCameraLive(true); setIsStarting(false); if (videoRef.current) startDetectionLoop(videoRef.current); })
          .catch(() => { setIsCameraLive(true); setIsStarting(false); if (videoRef.current) startDetectionLoop(videoRef.current); });
      };
    }
  }, [stopStream, startDetectionLoop]);

  useEffect(() => {
    if (isOpen && !capturedPreview && !useUploadFallback) startCamera(facingMode);
    else if (!isOpen) stopStream();
    return () => stopStream();
  }, [isOpen, facingMode]); // eslint-disable-line

  const handleClose = () => {
    stopStream();
    if (capturedPreview) try { URL.revokeObjectURL(capturedPreview); } catch (_) {}
    setCapturedBlob(null); setCapturedPreview(null);
    setContactName(""); setContactCompany("");
    setCameraError(null); setUseUploadFallback(false);
    onClose();
  };

  const handleRetake = () => {
    if (capturedPreview) try { URL.revokeObjectURL(capturedPreview); } catch (_) {}
    setCapturedBlob(null); setCapturedPreview(null);
    setContactName(""); setContactCompany("");
    if (!useUploadFallback) startCamera(facingMode);
  };

  const takeManual = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    if (countdownRef.current) { clearTimeout(countdownRef.current); countdownRef.current = null; }
    setCountdown(null);
    triggerSnap(video);
  }, [triggerSnap]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const aspect = 1.586;
        const ia = img.width / img.height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (ia > aspect) { sw = Math.round(img.height * aspect); sx = Math.round((img.width - sw) / 2); }
        else { sh = Math.round(img.width / aspect); sy = Math.round((img.height - sh) / 2); }
        const canvas = document.createElement("canvas");
        const ow = Math.min(1280, Math.max(800, sw)), oh = Math.round(ow / aspect);
        canvas.width = ow; canvas.height = oh;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, ow, oh);
          canvas.toBlob((blob) => {
            if (blob) { setCapturedBlob(blob); setCapturedPreview(URL.createObjectURL(blob)); stopStream(); }
          }, "image/jpeg", 0.92);
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmAndUpload = async () => {
    if (!capturedBlob) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", capturedBlob, "visiting-card.jpg");
      form.append("folder", "nexus-founders/bingo-cards");
      const res = await fetch("/api/bingo/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");
      onCaptureComplete({ photoUrl: data.url, contactName: contactName.trim(), contactCompany: contactCompany.trim() });
      handleClose();
    } catch (err: any) {
      alert(`Error saving card: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(10,15,29,0.88)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", overscrollBehavior:"contain" }}
      onClick={(e) => { if (e.target === e.currentTarget && !uploading) handleClose(); }}
    >
      <div style={{ width:"100%", maxWidth:"480px", background:"#0f172a", borderRadius:"20px", border:"1.5px solid rgba(255,255,255,0.12)", overflow:"hidden", boxShadow:"0 25px 60px rgba(0,0,0,0.7)", color:"#f8fafc", display:"flex", flexDirection:"column", maxHeight:"92vh" }}>

        {/* Header */}
        <div style={{ padding:"0.85rem 1.15rem", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.08)", background:"rgba(15,23,42,0.98)" }}>
          <div style={{ paddingRight:"0.5rem" }}>
            <h3 style={{ margin:0, fontSize:"1rem", fontWeight:800, color:"#38bdf8", display:"flex", alignItems:"center", gap:"0.45rem" }}>
              <Camera size={17} />{title}
            </h3>
            {subtitle && <p style={{ margin:"0.15rem 0 0", fontSize:"0.78rem", color:"#94a3b8", lineHeight:1.3 }}>{subtitle}</p>}
          </div>
          <button type="button" onClick={handleClose} disabled={uploading} style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:"50%", width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center", color:"#cbd5e1", cursor:"pointer", flexShrink:0 }}>
            <X size={17} />
          </button>
        </div>

        {/* Viewfinder */}
        <div ref={containerRef} style={{ position:"relative", background:"#020617", width:"100%", height:"330px", minHeight:"330px", maxHeight:"330px", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
          {capturedPreview ? (
            <div style={{ position:"relative", width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", boxSizing:"border-box", background:"radial-gradient(circle at center, rgba(15,23,42,0.95), #020617)" }}>
              <div style={{ position:"relative", maxWidth:"90%", maxHeight:"90%" }}>
                <img src={capturedPreview} alt="Card snapshot" style={{ maxWidth:"100%", maxHeight:"260px", objectFit:"contain", borderRadius:"12px", border:"2.5px solid #10b981", boxShadow:"0 0 25px rgba(16,185,129,0.45)", display:"block" }} />
                <div style={{ position:"absolute", top:"8px", right:"8px", background:"rgba(16,185,129,0.95)", color:"#fff", fontSize:"0.72rem", fontWeight:700, padding:"0.22rem 0.65rem", borderRadius:"12px", display:"flex", alignItems:"center", gap:"0.3rem" }}>
                  <Check size={12} strokeWidth={3} /><span>Card Captured</span>
                </div>
              </div>
            </div>
          ) : !useUploadFallback ? (
            <div style={{ position:"relative", width:"100%", height:"100%", overflow:"hidden" }}>
              {shutterFlashing && <div className="shutter-flash-overlay" />}
              <video ref={videoRef} playsInline autoPlay muted style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block", zIndex:1 }} />

              {isStarting && !isCameraLive && (
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(10,15,29,0.9)", color:"#38bdf8", gap:"0.6rem", zIndex:2 }}>
                  <RefreshCw size={26} style={{ animation:"spin 1s linear infinite" }} />
                  <span style={{ fontSize:"0.85rem", fontWeight:700 }}>Opening Camera...</span>
                </div>
              )}

              {/* Guide overlay */}
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex:3 }}>
                <div
                  ref={guideRef}
                  style={{
                    position:"relative",
                    width:"min(88%, 320px)",
                    aspectRatio:"1.586 / 1",
                    borderRadius:"14px",
                    border: cardDetected ? "2.5px solid #10b981" : "2px dashed #38bdf8",
                    boxShadow: cardDetected ? "0 0 0 9999px rgba(0,0,0,0.35), 0 0 24px rgba(16,185,129,0.6)" : "0 0 0 9999px rgba(0,0,0,0.55)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div className={`corner-bracket corner-top-left${cardDetected ? " detected" : ""}`} />
                  <div className={`corner-bracket corner-top-right${cardDetected ? " detected" : ""}`} />
                  <div className={`corner-bracket corner-bottom-left${cardDetected ? " detected" : ""}`} />
                  <div className={`corner-bracket corner-bottom-right${cardDetected ? " detected" : ""}`} />
                  <div className={`scanner-laser-beam${cardDetected ? " detected" : ""}`} />

                  {countdown !== null && (
                    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(16,185,129,0.15)", borderRadius:"12px" }}>
                      <span className="countdown-pulse" style={{ fontSize:"3.5rem", fontWeight:900, color:"#10b981", textShadow:"0 0 20px rgba(16,185,129,0.8)" }}>{countdown}</span>
                    </div>
                  )}

                  <div style={{ position:"absolute", bottom:"-38px", left:"50%", transform:"translateX(-50%)", background: cardDetected ? "rgba(16,185,129,0.95)" : "rgba(2,132,199,0.95)", color:"#fff", fontSize:"0.72rem", fontWeight:700, padding:"0.28rem 0.95rem", borderRadius:"20px", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:"0.4rem", transition:"background 0.2s ease" }}>
                    {cardDetected
                      ? <><Check size={12} strokeWidth={3} />{countdown !== null ? `Auto-snap in ${countdown}…` : "Card Detected! Hold steady…"}</>
                      : <span>{"?? Align Visiting Card in Frame"}</span>
                    }
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setFacingMode(p => p === "environment" ? "user" : "environment")} style={{ position:"absolute", top:"12px", right:"12px", background:"rgba(15,23,42,0.85)", border:"1px solid rgba(255,255,255,0.25)", color:"#fff", borderRadius:"50%", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", backdropFilter:"blur(6px)", zIndex:4 }}>
                <RefreshCw size={16} />
              </button>
            </div>
          ) : (
            <div style={{ padding:"1.75rem 1.25rem", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:"0.85rem", width:"100%", boxSizing:"border-box" }}>
              {cameraError && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:"0.6rem", background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.3)", color:"#fbbf24", padding:"0.75rem 0.95rem", borderRadius:"12px", fontSize:"0.82rem", textAlign:"left", lineHeight:1.45 }}>
                  <AlertCircle size={18} style={{ flexShrink:0, marginTop:"2px" }} /><span>{cameraError}</span>
                </div>
              )}
              <div style={{ display:"flex", flexDirection:"column", gap:"0.65rem", width:"100%", maxWidth:"340px" }}>
                <button type="button" onClick={() => fileInputCameraRef.current?.click()} style={{ width:"100%", padding:"0.85rem 1.25rem", background:"linear-gradient(135deg,#0284c7,#0369a1)", border:"none", borderRadius:"12px", color:"#fff", fontWeight:700, fontSize:"0.95rem", cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"0.6rem", boxShadow:"0 6px 20px rgba(2,132,199,0.35)" }}>
                  <Camera size={19} />Snap with Phone Camera
                </button>
                <div style={{ display:"flex", gap:"0.5rem" }}>
                  <button type="button" onClick={() => fileInputGalleryRef.current?.click()} style={{ flex:1, padding:"0.75rem 1rem", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", color:"#cbd5e1", fontWeight:600, fontSize:"0.85rem", cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"0.45rem" }}>
                    <Upload size={16} />Choose File
                  </button>
                  <button type="button" onClick={() => { setUseUploadFallback(false); startCamera(facingMode); }} style={{ flex:1, padding:"0.75rem 1rem", background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.3)", borderRadius:"10px", color:"#38bdf8", fontWeight:600, fontSize:"0.85rem", cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"0.45rem" }}>
                    <RefreshCw size={15} />Retry Scanner
                  </button>
                </div>
              </div>
            </div>
          )}

          <input ref={fileInputCameraRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display:"none" }} />
          <input ref={fileInputGalleryRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display:"none" }} />
        </div>

        {/* Bottom Actions */}
        <div style={{ padding:"1rem 1.15rem", display:"flex", flexDirection:"column", gap:"0.75rem", background:"#0f172a" }}>
          {capturedPreview ? (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.65rem" }}>
                <div>
                  <label style={{ display:"block", fontSize:"0.73rem", fontWeight:600, color:"#94a3b8", marginBottom:"0.28rem" }}>
                    Contact Name <span style={{ color:"#64748b" }}>(optional)</span>
                  </label>
                  <input type="text" placeholder="e.g. John Tan" value={contactName} onChange={(e) => setContactName(e.target.value)} style={{ width:"100%", padding:"0.5rem 0.7rem", background:"#1e293b", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"#f8fafc", fontSize:"0.84rem", outline:"none", boxSizing:"border-box" }} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.73rem", fontWeight:600, color:"#94a3b8", marginBottom:"0.28rem" }}>
                    Company <span style={{ color:"#64748b" }}>(optional)</span>
                  </label>
                  <input type="text" placeholder="e.g. FinTech Pte Ltd" value={contactCompany} onChange={(e) => setContactCompany(e.target.value)} style={{ width:"100%", padding:"0.5rem 0.7rem", background:"#1e293b", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"#f8fafc", fontSize:"0.84rem", outline:"none", boxSizing:"border-box" }} />
                </div>
              </div>
              <div style={{ display:"flex", gap:"0.7rem" }}>
                <button type="button" onClick={handleRetake} disabled={uploading} style={{ flex:1, padding:"0.75rem", borderRadius:"10px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"#94a3b8", fontWeight:600, fontSize:"0.88rem", cursor: uploading ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.45rem" }}>
                  <RefreshCw size={15} />Retake
                </button>
                <button type="button" onClick={handleConfirmAndUpload} disabled={uploading} style={{ flex:2, padding:"0.8rem", borderRadius:"12px", background: uploading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#10b981 0%,#059669 100%)", border:"none", color: uploading ? "#64748b" : "#fff", fontWeight:700, fontSize:"0.92rem", cursor: uploading ? "wait" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", boxShadow: uploading ? "none" : "0 6px 18px rgba(16,185,129,0.35)", transition:"all 0.2s ease" }}>
                  {uploading
                    ? <><RefreshCw size={16} style={{ animation:"spin 1s linear infinite" }} />Saving…</>
                    : <><Check size={18} />Confirm &amp; Mark Complete</>
                  }
                </button>
              </div>
            </>
          ) : (
            <>
              {!useUploadFallback && isCameraLive && (
                <button type="button" onClick={takeManual} className="card-scanner-shutter-btn" style={{ width:"100%", padding:"0.82rem", borderRadius:"12px", background:"linear-gradient(135deg,#0284c7 0%,#0369a1 100%)", border:"none", color:"#fff", fontWeight:700, fontSize:"0.9rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", boxShadow:"0 6px 18px rgba(2,132,199,0.35)" }}>
                  <Camera size={18} />{"?? Tap to Capture Manually"}
                </button>
              )}
              {!useUploadFallback && isCameraLive && (
                <p style={{ margin:0, textAlign:"center", fontSize:"0.75rem", color:"#64748b", lineHeight:1.4 }}>
                  Card auto-detected? It snaps automatically. Otherwise tap above.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
