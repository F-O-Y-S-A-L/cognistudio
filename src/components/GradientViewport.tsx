import React, { useEffect, useRef, useState } from 'react';
import { AppSettings } from '../types';
import { RefreshCw, Sparkles, Wand2, MousePointer, HelpCircle, Activity } from 'lucide-react';

interface GradientViewportProps {
  settings: AppSettings;
  onChange?: (updater: (prev: AppSettings) => AppSettings) => void;
  isHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
}

export default function GradientViewport({
  settings,
  onChange,
  isHovered,
  onHoverChange,
}: GradientViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blurLayerRef = useRef<HTMLDivElement>(null);
  
  // Track visual states for debugging / controls
  const [showWireframe, setShowWireframe] = useState(false);
  const [interactivePower, setInteractivePower] = useState(1.0);
  const [isHovering, setIsHovering] = useState(false);

  // Mouse coords mapped to 0-1 canvas space
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, active: false });

  // Dynamic click ripples support queue
  const ripplesRef = useRef<Array<{
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    alpha: number;
    speed: number;
    color: string;
  }>>([]);

  // Dynamic blob states
  const blobsRef = useRef<Array<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
    phaseX: number;
    phaseY: number;
  }>>([]);

  // Generate repeating noise pattern canvas to keep canvas render fast
  const noisePatternRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Generate organic 128x128 monochrome fine noise grain texture
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 128;
    noiseCanvas.height = 128;
    const noiseCtx = noiseCanvas.getContext('2d');
    if (noiseCtx) {
      const imgData = noiseCtx.createImageData(128, 128);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;     // R
        data[i + 1] = val; // G
        data[i + 2] = val; // B
        data[i + 3] = 16;  // Super soft transparency for high-end grain
      }
      noiseCtx.putImageData(imgData, 0, 0);
      noisePatternRef.current = noiseCanvas;
    }
  }, []);

  // Initialize and keep tracking colors from settings.gradient.stops
  useEffect(() => {
    const stops = settings.gradient.stops;
    if (stops.length === 0) return;

    // Build or update blobs mapping user selected stops
    blobsRef.current = stops.map((stop, index) => {
      // Offset initial phases to prevent perfect alignment overlap
      const phaseX = (index * Math.PI) / 2.5;
      const phaseY = (index * Math.PI) / 1.7;

      return {
        x: 0.5,
        y: 0.5,
        targetX: 0.5 + Math.cos(phaseX) * 0.25,
        targetY: 0.5 + Math.sin(phaseY) * 0.25,
        size: 0.52 + (index % 3) * 0.12, // Varied blob scale
        color: stop.color,
        speedX: 0.15 + (index % 4) * 0.08,
        speedY: 0.18 + (index % 3) * 0.07,
        phaseX,
        phaseY,
      };
    });
  }, [settings.gradient.stops]);

  // Main Canvas Tick
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let time = 0;

    const tick = () => {
      const g = settings.gradient;
      if (!g.enabled) {
        // Simple default static canvas
        ctx.fillStyle = settings.background.color || '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        animFrame = requestAnimationFrame(tick);
        return;
      }

      // 1. Clear background
      ctx.fillStyle = '#100e17'; // Elegant dark background color
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Multiplier parameters from user's panel
      const speedFactor = g.speed * 0.4;
      if (g.animate) {
        time += 0.015 * speedFactor * g.waveComplexity;
      }

      const w = canvas.width;
      const h = canvas.height;
      const maxDim = Math.max(w, h);

      // Update Mouse coordinate interpolation
      const mouse = mouseRef.current;
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.1;
        mouse.y += (mouse.targetY - mouse.y) * 0.1;
      }

      // Compile color stops and draw based on selected styleKey
      const blobs = blobsRef.current;

      blobs.forEach((blob, idx) => {
        // A. Mathematical positioning vectors depending on selected styleKey and movementPattern
        const pattern = g.movementPattern || 'flow';
        let patternOffsetX = 0;
        let patternOffsetY = 0;
        let sizeMultiplier = 1.0;

        if (g.animate) {
          if (pattern === 'pulse') {
            // Expanding / contracting breathing pulse
            sizeMultiplier = 1.0 + Math.sin(time * 2.2 + idx * 0.7) * 0.18;
          } 
          else if (pattern === 'shift') {
            // Circular rotational offset pattern
            patternOffsetX = Math.cos(time * 1.5 + idx) * 0.08;
            patternOffsetY = Math.sin(time * 1.5 + idx) * 0.08;
          } 
          else if (pattern === 'drift') {
            // Wind-like swaying diagonal shift
            const sway = Math.sin(time * 0.9 + idx * 1.2);
            patternOffsetX = sway * 0.12;
            patternOffsetY = sway * 0.06;
          }
          else {
            // 'flow' (Classic river-like continuous flow)
            patternOffsetX = Math.sin(time * 0.5 + idx) * 0.05;
            patternOffsetY = Math.cos(time * 0.6 + idx) * 0.05;
          }
        }

        // Apply Shimmer effect
        if (g.shimmerSpeed > 0 && g.animate) {
          const shimmer = Math.sin(time * 15 * g.shimmerSpeed + idx) * 0.06;
          sizeMultiplier += shimmer;
        }

        // Apply Micro-vibration level
        let jitterX = 0;
        let jitterY = 0;
        if (g.vibrationLevel > 0) {
          jitterX = (Math.random() - 0.5) * g.vibrationLevel * 0.018;
          jitterY = (Math.random() - 0.5) * g.vibrationLevel * 0.018;
        }

        if (g.styleKey === 'stripes' || !g.styleKey) {
          // Classic Stripe Diagonal Bands algorithm:
          const stripeAngle = (g.angle * Math.PI) / 180;
          const offsetFactor = (idx / blobs.length) - 0.45;
          
          let flowX = 0;
          let flowY = 0;
          
          if (g.animate) {
            flowX = Math.sin(time * 0.5 + idx * 0.8) * 0.16;
            flowY = Math.cos(time * 0.45 + idx * 1.1) * 0.14;
          }
          
          blob.x = 0.5 + Math.cos(stripeAngle) * offsetFactor * 0.75 + flowX + patternOffsetX + jitterX;
          blob.y = 0.5 + Math.sin(stripeAngle) * offsetFactor * 0.75 + flowY + patternOffsetY + jitterY;
          blob.size = (0.65 + (idx % 2) * 0.15) * sizeMultiplier;
        } 
        else if (g.styleKey === 'plasma') {
          // Intense counter-rotating orbitals
          const speedMod = 1.9;
          const orbitRadius = 0.28 + Math.sin(time * 0.65 + idx) * 0.08;
          
          if (g.animate) {
            blob.x = 0.5 + Math.sin(time * speedMod * blob.speedX + blob.phaseX) * orbitRadius + patternOffsetX + jitterX;
            blob.y = 0.5 + Math.cos(time * speedMod * blob.speedY + blob.phaseY) * orbitRadius + patternOffsetY + jitterY;
          } else {
            blob.x = 0.5 + Math.sin(blob.phaseX) * orbitRadius + jitterX;
            blob.y = 0.5 + Math.cos(blob.phaseY) * orbitRadius + jitterY;
          }
          blob.size = (0.44 + (idx % 3) * 0.08) * sizeMultiplier;
        } 
        else if (g.styleKey === 'fluid') {
          // Swirling color-wheel synchronization
          const slowTime = time * 0.65;
          const angle = slowTime + (idx * Math.PI * 2) / blobs.length;
          
          blob.x = 0.5 + Math.cos(angle) * 0.22 + patternOffsetX + jitterX;
          blob.y = 0.5 + Math.sin(angle) * 0.22 + patternOffsetY + jitterY;
          blob.size = (0.55 + Math.sin(slowTime + idx) * 0.15) * sizeMultiplier;
        } 
        else {
          // Standard 'blobs' (Original float drift)
          if (g.animate) {
            const driftX = Math.sin(time * blob.speedX + blob.phaseX) * 0.22;
            const driftY = Math.cos(time * blob.speedY + blob.phaseY) * 0.22;
            blob.x = 0.5 + driftX + patternOffsetX + jitterX;
            blob.y = 0.5 + driftY + patternOffsetY + jitterY;
          } else {
            blob.x = 0.5 + Math.sin(blob.phaseX) * 0.15 + jitterX;
            blob.y = 0.5 + Math.cos(blob.phaseY) * 0.15 + jitterY;
          }
          blob.size = (0.45 + (idx % 3) * 0.12) * sizeMultiplier;
        }

        // B. Interactive pointer gravity forces
        if (g.interactive && mouse.active) {
          const dx = mouse.x - blob.x;
          const dy = mouse.y - blob.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < 0.45) {
            const pull = (1 - dist / 0.45) * 0.16 * interactivePower;
            blob.x += dx * pull;
            blob.y += dy * pull;
          }
        }

        // Convert coordinates to canvas layout dimensions
        const cx = blob.x * w;
        const cy = blob.y * h;
        const radius = blob.size * maxDim * 0.65;

        // Draw overlapping radial mesh
        const radGrad = ctx.createRadialGradient(cx, cy, radius * 0.02, cx, cy, radius);
        radGrad.addColorStop(0, blob.color);
        radGrad.addColorStop(0.35, blob.color + 'd6'); // Half transparent mid stop
        radGrad.addColorStop(0.7, blob.color + '38');  // Soft glow tail
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = radGrad;
        // Apply toggleable blend mode beautifully
        ctx.globalCompositeOperation = g.blendMode || 'screen';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Optional debugging wireframe showing movement paths and coordinate vectors
        if (showWireframe) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = idx === 0 ? '#ff5e62' : idx === 1 ? '#ff2a85' : '#7a00ff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, radius * 0.1, 0, Math.PI * 2);
          ctx.stroke();

          // Connect to neighbor blobs
          if (idx > 0 && blobs[idx - 1]) {
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(blobs[idx - 1].x * w, blobs[idx - 1].y * h);
            ctx.stroke();
          }
        }
      });

      // 2. Draw Dynamic click ripples representing liquid dispersion waves
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha -= r.speed * 1.6;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        const cx = r.x * w;
        const cy = r.y * h;
        const pixRadius = r.radius * maxDim;

        const rippleGrad = ctx.createRadialGradient(cx, cy, pixRadius * 0.05, cx, cy, pixRadius);
        const hexAlpha = Math.max(0, Math.min(255, Math.floor(r.alpha * 255)));
        const hexStr = hexAlpha.toString(16).padStart(2, '0');
        
        rippleGrad.addColorStop(0, 'rgba(255,255,255,0)');
        rippleGrad.addColorStop(0.8, r.color + hexStr);
        rippleGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = rippleGrad;
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.arc(cx, cy, pixRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Restore composite operation to standard source-over
      ctx.globalCompositeOperation = 'source-over';

      // 3. Draw Repeating high-end grain noise overlay if enabled
      if (g.noise > 0 && noisePatternRef.current) {
        ctx.save();
        const pattern = ctx.createPattern(noisePatternRef.current, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.globalAlpha = g.noise * 1.6;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.restore();
      }

      // 4. Overlays: scanlines, digital tech grid, vignette
      if (g.overlayType === 'scanlines') {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.09)';
        ctx.lineWidth = 1.0;
        for (let y = 0; y < h; y += 4) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      } 
      else if (g.overlayType === 'grid') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        const gridSize = 24;
        for (let x = 0; x < w; x += gridSize) {
          for (let y = 0; y < h; y += gridSize) {
            ctx.beginPath();
            ctx.arc(x, y, 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } 
      else if (g.overlayType === 'vignette') {
        const vignGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.1, w * 0.5, h * 0.5, w * 0.9);
        vignGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vignGrad.addColorStop(0.5, 'rgba(0,0,0,0.12)');
        vignGrad.addColorStop(1, 'rgba(10,8,15,0.72)');
        ctx.fillStyle = vignGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Dynamic tilt calculated with possible jitter
      const tiltVal = g.tilt + (g.tiltJitter && g.animate ? Math.sin(time * 6) * 1.5 : 0);
      if (blurLayerRef.current) {
        blurLayerRef.current.style.transform = `scale(1.22) skewY(${tiltVal}deg)`;
        blurLayerRef.current.style.filter = `blur(${g.blur}px) saturate(${g.colorBoost || 1.0}) contrast(${1.0 + ((g.colorBoost || 1.0) - 1.0) * 0.35})`;
      }

      // Show Wireframe analytics details
      if (showWireframe) {
        ctx.font = '10px Courier New';
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText(`ANIM_TIME: ${time.toFixed(2)}`, 16, h - 20);
        ctx.fillText(`FLOW_STYLE: ${(g.styleKey || 'stripes').toUpperCase()}`, 16, h - 35);
        ctx.fillText(`SKEW_TILT: ${g.tilt}°`, 16, h - 50);
        ctx.fillText(`ACTIVE_RIPPLES: ${ripples.length}`, 16, h - 65);
      }

      animFrame = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [settings.gradient, showWireframe, interactivePower]);

  // Handle Canvas Resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;
      
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    });

    resizeObserver.observe(containerRef.current!);
    return () => resizeObserver.disconnect();
  }, []);

  // Handle Coordinates on move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
    mouseRef.current.active = true;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const stops = settings.gradient.stops;
    const color = stops.length > 0 ? stops[Math.floor(Math.random() * stops.length)].color : '#7a00ff';

    // Trigger beautiful soft ripples
    ripplesRef.current.push({
      x,
      y,
      radius: 0.01,
      maxRadius: 0.45 + Math.random() * 0.2,
      alpha: settings.gradient.rippleStrength || 0.4,
      speed: 0.007 + Math.random() * 0.005,
      color,
    });
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
    onHoverChange(false);
    setIsHovering(false);
  };

  const handleMouseEnter = () => {
    onHoverChange(true);
    setIsHovering(true);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[32rem] md:h-full flex items-center justify-center overflow-hidden border border-white/10 rounded-xl bg-[#09080e] shadow-2xl group transition-all"
    >
      {/* Dynamic Blur Layer (Native smearing exactly like Stripe!) */}
      <div 
        ref={blurLayerRef}
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          filter: `blur(${settings.gradient.blur}px)`,
          transform: `scale(1.22) skewY(${settings.gradient.tilt}deg)`, // Binds perfect Stripe-style diagonal slanting!
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block opacity-95"
        />
      </div>

      {/* Transparent pointer capture canvas overlaid exactly on top to prevent blur cursor mismatch or transformation errors */}
      <canvas
        className="absolute inset-0 w-full h-full block cursor-crosshair z-10"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Floating View Adjuster & Mode Info */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowWireframe(!showWireframe)}
          className={`px-2.5 py-1.5 backdrop-blur-md rounded-lg border text-[9px] uppercase font-bold tracking-widest font-mono flex items-center gap-1.5 shadow-lg active:scale-95 transition-all text-white/80 cursor-pointer ${
            showWireframe ? 'bg-indigo-600/30 border-indigo-400' : 'bg-black/60 border-white/10 hover:bg-black/80 hover:border-white/20'
          }`}
          title="Toggle structural wireframes and coordinate analytics"
        >
          <Activity size={11} className={showWireframe ? 'animate-bounce text-indigo-400' : ''} />
          {showWireframe ? 'Debug: ON' : 'Debug: OFF'}
        </button>

        <div className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 text-[9px] font-mono text-white/55 flex items-center gap-1.5">
          <MousePointer size={10} className="text-indigo-400" />
          <span>Click Canvas to Ripple Flow</span>
        </div>
      </div>

      {/* Interactive feedback indicator badge in layout margins */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none select-none flex items-center gap-1.5 px-3 py-1 rounded bg-[#09090b]/80 border border-white/5 backdrop-blur-md text-[9px] font-mono text-white/35 active:scale-95 transition-all uppercase tracking-widest">
        <span>STRIPE MESH CANVASES</span>
        <div className={`w-1.5 h-1.5 rounded-full ${settings.gradient.animate ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
      </div>
    </div>
  );
}
