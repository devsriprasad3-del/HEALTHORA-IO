import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export const ThreeHeroScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn("WebGL not supported or failed to initialize", e);
      setHasWebGL(false);
      return;
    }

    // Atmospheric Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const tealKeyLight = new THREE.DirectionalLight(0x16b8a6, 3.2);
    tealKeyLight.position.set(4, 5, 4);
    scene.add(tealKeyLight);

    const aquaRimLight = new THREE.DirectionalLight(0x66e3d3, 2.2);
    aquaRimLight.position.set(-4, -2, 3);
    scene.add(aquaRimLight);

    const navyFillLight = new THREE.PointLight(0x1b2d48, 1.5, 10);
    navyFillLight.position.set(0, -3, 2);
    scene.add(navyFillLight);

    // Main Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Clinical Intelligence Crystal Core (Icosahedron + wireframe halo)
    const coreGeo = new THREE.IcosahedronGeometry(1.25, 2);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x101c31,
      emissive: 0x16b8a6,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.8,
      transparent: true,
      opacity: 0.9,
      ior: 1.4,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Outer crystalline wireframe lattice
    const outerLatticeGeo = new THREE.IcosahedronGeometry(1.7, 1);
    const outerLatticeMat = new THREE.MeshStandardMaterial({
      color: 0x66e3d3,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      roughness: 0.3,
      metalness: 0.8,
    });
    const outerLattice = new THREE.Mesh(outerLatticeGeo, outerLatticeMat);
    mainGroup.add(outerLattice);

    // 2. High-Tech Dynamic Medical Data Texture Plates
    const createDataTexture = (title: string, value: string, sub: string, statusColor: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 320;
      const ctx = canvas.getContext("2d")!;

      // Glass plate background
      const grad = ctx.createLinearGradient(0, 0, 512, 320);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      grad.addColorStop(1, "rgba(240, 248, 255, 0.85)");
      ctx.fillStyle = grad;
      ctx.roundRect ? ctx.roundRect(0, 0, 512, 320, 24) : ctx.rect(0, 0, 512, 320);
      ctx.fill();

      // Border outline
      ctx.strokeStyle = "rgba(22, 184, 166, 0.4)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Clinical Title
      ctx.fillStyle = "#64748B";
      ctx.font = "bold 20px monospace";
      ctx.fillText(title.toUpperCase(), 32, 48);

      // Status indicator dot
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(460, 42, 8, 0, Math.PI * 2);
      ctx.fill();

      // Primary Metric Value
      ctx.fillStyle = "#101C31";
      ctx.font = "bold 56px monospace";
      ctx.fillText(value, 32, 128);

      // Subtitle / Reference Range
      ctx.fillStyle = "#16B8A6";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(sub, 32, 180);

      // Luminous mini sparkline
      ctx.strokeStyle = "#16B8A6";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(32, 260);
      ctx.lineTo(120, 240);
      ctx.lineTo(220, 270);
      ctx.lineTo(340, 220);
      ctx.lineTo(460, 230);
      ctx.stroke();

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 4;
      return texture;
    };

    const cardGroup = new THREE.Group();
    mainGroup.add(cardGroup);

    const plateGeo = new THREE.PlaneGeometry(1.6, 1.0);

    // Plate 1: HbA1c Lab Panel
    const plateMat1 = new THREE.MeshStandardMaterial({
      map: createDataTexture("METABOLIC PANEL · LABS", "HbA1c 7.4%", "REF: 4.0 - 5.6% mg/dL", "#D9972B"),
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      roughness: 0.2,
    });
    const plate1 = new THREE.Mesh(plateGeo, plateMat1);
    plate1.position.set(1.4, 0.9, 0.7);
    plate1.rotation.set(-0.15, -0.35, 0.08);
    cardGroup.add(plate1);

    // Plate 2: AI Clinical Summary Panel
    const plateMat2 = new THREE.MeshStandardMaterial({
      map: createDataTexture("AI SUMMARY · GEMINI 3.8", "GLYCEMIC STABILITY", "Source Verified · English & Hindi", "#278B69"),
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      roughness: 0.2,
    });
    const plate2 = new THREE.Mesh(plateGeo, plateMat2);
    plate2.position.set(-1.45, -0.85, 0.9);
    plate2.rotation.set(0.12, 0.38, -0.05);
    cardGroup.add(plate2);

    // 3. Floating Clinical Data Nodes & Connecting Neural Ribbons
    const nodeCount = 20;
    const nodeGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x66e3d3 });
    const nodes: THREE.Mesh[] = [];
    const nodeRadii: number[] = [];
    const nodeSpeeds: number[] = [];
    const nodeAngles: number[] = [];
    const nodeHeights: number[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const radius = 1.9 + Math.random() * 1.1;
      const angle = (i / nodeCount) * Math.PI * 2;
      const speed = (0.2 + Math.random() * 0.25) * (i % 2 === 0 ? 1 : -1);
      const height = (Math.random() - 0.5) * 1.8;

      nodeRadii.push(radius);
      nodeSpeeds.push(speed);
      nodeAngles.push(angle);
      nodeHeights.push(height);

      node.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      mainGroup.add(node);
      nodes.push(node);
    }

    // Connective laser rays between nodes
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x16b8a6,
      transparent: true,
      opacity: 0.35,
    });
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(nodeCount * 3);
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    mainGroup.add(lines);

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.5;
      targetY = y * 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth parallax damping
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        mainGroup.rotation.y = time * 0.12 + mouseX;
        mainGroup.rotation.x = mouseY * 0.4;

        // Subtle floating oscillations for plates
        plate1.position.y = 0.9 + Math.sin(time * 1.3) * 0.06;
        plate2.position.y = -0.85 + Math.cos(time * 1.1) * 0.06;

        // Core gentle pulse
        outerLattice.rotation.y = -time * 0.15;
        outerLattice.rotation.z = time * 0.08;
        coreMesh.rotation.y = time * 0.05;

        // Orbital nodes & dynamic connection lines
        const posArray = lines.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < nodeCount; i++) {
          nodeAngles[i] += nodeSpeeds[i] * delta * 0.7;
          const r = nodeRadii[i];
          const a = nodeAngles[i];
          const x = Math.cos(a) * r;
          const z = Math.sin(a) * r;
          nodes[i].position.x = x;
          nodes[i].position.z = z;

          posArray[i * 3] = x;
          posArray[i * 3 + 1] = nodes[i].position.y;
          posArray[i * 3 + 2] = z;
        }
        lines.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      outerLatticeGeo.dispose();
      outerLatticeMat.dispose();
      plateGeo.dispose();
      plateMat1.dispose();
      plateMat2.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full min-h-[380px] flex items-center justify-center p-6 text-center text-xs text-slate-400">
        Clinical 3D Data Visualization
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[380px] pointer-events-none relative z-10"
      aria-label="3D visualization of Healthora connected medical data"
    />
  );
};
