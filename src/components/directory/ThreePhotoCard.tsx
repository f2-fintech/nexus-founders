"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import * as THREE from "three";

interface Props {
  photoUrl: string;
  name: string;
}

/**
 * Renders the founder photo on a Three.js plane with:
 * - Mouse-tracked tilt (rotates on hover)
 * - Dynamic point light that follows cursor
 * - Subtle gloss / specular highlight
 * - Lazy initialisation (only when first hovered)
 */
export default function ThreePhotoCard({ photoUrl, name }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    mesh: THREE.Mesh;
    pointLight: THREE.PointLight;
    animId: number;
    active: boolean;
  } | null>(null);

  const initThree = useCallback(() => {
    if (threeRef.current || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const { clientWidth: W, clientHeight: H } = containerRef.current;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.z = 3.5;

    // Load texture — only reveal canvas once texture is ready
    const texture = new THREE.TextureLoader().load(photoUrl, () => {
      // Texture loaded: show canvas if user is still hovering
      if (threeRef.current?.active && canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    });
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.PlaneGeometry(2, (H / W) * 2, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.45,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Ambient light
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));

    // Gloss point light that follows mouse
    const pointLight = new THREE.PointLight(0x7dd3fc, 2.5, 8);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // Subtle rim light
    const rimLight = new THREE.DirectionalLight(0xa78bfa, 0.6);
    rimLight.position.set(-2, 2, 1);
    scene.add(rimLight);

    let animId = 0;
    const render = () => {
      animId = requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    render();

    threeRef.current = { renderer, scene, camera, mesh, pointLight, animId, active: true };
  }, [photoUrl]);

  const handleMouseEnter = useCallback(() => {
    initThree();
  }, [initThree]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || !threeRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const { mesh, pointLight, camera } = threeRef.current;

    mesh.rotation.y = x * 0.55;
    mesh.rotation.x = -y * 0.4;

    pointLight.position.x = x * 3;
    pointLight.position.y = -y * 2;

    camera.position.x = -x * 0.15;
    camera.position.y = y * 0.1;
    camera.lookAt(0, 0, 0);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!threeRef.current) return;
    const { mesh, camera } = threeRef.current;
    mesh.rotation.y = 0;
    mesh.rotation.x = 0;
    camera.position.set(0, 0, 3.5);
    camera.lookAt(0, 0, 0);
    if (canvasRef.current) canvasRef.current.style.opacity = "0";
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mousemove", handleMouseMove as EventListener);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mousemove", handleMouseMove as EventListener);
      el.removeEventListener("mouseleave", handleMouseLeave);

      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.animId);
        threeRef.current.renderer.dispose();
        threeRef.current = null;
      }
    };
  }, [handleMouseEnter, handleMouseMove, handleMouseLeave]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%", background: "#f1f5f9", overflow: "hidden" }}>
      {/* Skeleton Shimmer while loading */}
      {!isLoaded && (
        <div
          className="skeleton-shimmer"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
          }}
        />
      )}

      {/* Static image — with lazy loading & async decoding */}
      <img
        src={photoUrl}
        alt={name}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top center",
          display: "block",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.4s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}
      />

      {/* Three.js canvas overlay — fades in on hover */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.35s ease",
          pointerEvents: "none",
          borderRadius: "inherit",
          zIndex: 2,
        }}
      />
    </div>
  );
}
