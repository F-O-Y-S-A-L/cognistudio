import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Download, 
  Copy, 
  Palette, 
  Maximize2, 
  RefreshCw, 
  Layers, 
  Zap, 
  Minimize2, 
  Sparkles,
  MousePointer2,
  Box,
  Wind,
  Camera,
  Scissors,
  Shapes,
  Magnet,
  Activity,
  FileCode,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Delaunay } from 'd3-delaunay';

// High-Performance Spatial Partitioning Hash Grid
class ParticleGrid {
  cellSize: number;
  buckets: { [key: string]: number[] };

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.buckets = {};
  }

  clear() {
    this.buckets = {};
  }

  insert(x: number, y: number, id: number) {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const key = `${cx},${cy}`;
    if (!this.buckets[key]) {
      this.buckets[key] = [];
    }
    this.buckets[key].push(id);
  }

  getNeighbors(x: number, y: number): number[] {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const neighbors: number[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cx + dx},${cy + dy}`;
        const bucket = this.buckets[key];
        if (bucket) {
          neighbors.push(...bucket);
        }
      }
    }
    return neighbors;
  }
}

interface CellPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  originalX: number;
  originalY: number;
  noiseOffset: number;
}

export default function CellGenerator() {
  // --- Geometry Configuration ---
  const [pointCount, setPointCount] = useState(45);
  const [cellPadding, setCellPadding] = useState(10);
  const [pointPattern, setPointPattern] = useState<'random' | 'grid' | 'spiral' | 'cluster'>('spiral');
  const [cellRoundness, setCellRoundness] = useState(0.85);
  const [relaxation, setRelaxation] = useState(2); // Lloyd's Algorithm iterations
  const [chaos, setChaos] = useState(0.15);
  const [cellGeometryType, setCellGeometryType] = useState<'voronoi' | 'shards' | 'metaballs' | 'constellation' | 'fluid-teardrop'>('voronoi');
  
  // Wobbly Hand-Drawn Edge settings
  const [handDrawn, setHandDrawn] = useState(true);
  const [wobbleAmplitude, setWobbleAmplitude] = useState(4);
  const [wobbleFrequency, setWobbleFrequency] = useState(14);
  
  // Custom Advanced Geometry features (User requested)
  const [cellScaleMultiplier, setCellScaleMultiplier] = useState(1.0); // Global radius scaling
  const [geomWarp, setGeomWarp] = useState(0); // Swirling stream coordinates force

  // --- Style Configuration ---
  const [colorScheme, setColorScheme] = useState<'minimal' | 'natural-sage' | 'terracotta' | 'cyber-lava' | 'retro-pop' | 'gold' | 'glass' | 'blueprint' | 'vibrant' | 'monochrome'>('natural-sage');
  const [renderMode, setRenderMode] = useState<'topographic' | 'filled' | 'outline' | 'glow' | 'wireframe' | '3D-clay'>('topographic');
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [shadowDepth, setShadowDepth] = useState(6);
  const [glowIntensity, setGlowIntensity] = useState(0.65);
  const [isDashed, setIsDashed] = useState(false);
  const [contourLevels, setContourLevels] = useState(5);
  const [bgTexture, setBgTexture] = useState(true);
  const [contourStyle, setContourStyle] = useState<'solid' | 'alternating' | 'dashed' | 'dotted'>('solid');
  
  // Custom Advanced Style features (User requested)
  const [doubleStroke, setDoubleStroke] = useState(false); // Sticker silhouette fat border

  // Constellation / Joints Style
  const [showJoints, setShowJoints] = useState(false);
  const [jointSize, setJointSize] = useState(3);

  // Custom Color Customizer
  const [useCustomPalette, setUseCustomPalette] = useState(false);
  const [customBgColor, setCustomBgColor] = useState('#faf6eb');
  const [customStrokeColor, setCustomStrokeColor] = useState('#0d4137');
  const [customAccentColor, setCustomAccentColor] = useState('#e85a4f');
  const [customPalette, setCustomPalette] = useState<string[]>(['#0d4137', '#e85a4f', '#eae7dc', '#e98074', '#d8c3a5']);

  // --- Motion & Interactive Configuration ---
  const [isAnimate, setIsAnimate] = useState(true);
  const [speed, setSpeed] = useState(0.4);
  const [oscillation, setOscillation] = useState(0.12);
  const [magneticMode, setMagneticMode] = useState<'none' | 'repel' | 'attract' | 'wiggle' | 'shatter'>('wiggle');
  const [influenceRadius, setInfluenceRadius] = useState(240);
  const [magneticStrength, setMagneticStrength] = useState(6.0);
  const [drift, setDrift] = useState(0.008);
  const [springStrength, setSpringStrength] = useState(0.03); // How stiffly dots spring back to anchor

  // Custom Advanced Motion features (User requested)
  const [hoverScale, setHoverScale] = useState(1.25); // Scaling factor of active node/cell
  const [hoverJiggle, setHoverJiggle] = useState(3.5); // Micro-jiggle speed while hovered
  const [mouseSmoothing, setMouseSmoothing] = useState(0.12); // Viscous lag for soft tracking
  const [breatheIntensity, setBreatheIntensity] = useState(0.2); // Rhythmic breathing scale multiplier

  // --- 3D Hover & Interactive Engine Preset Features (Image Inspired) ---
  const [hoverPresetType, setHoverPresetType] = useState<'wooden-peg' | 'clay-blob' | 'glossy-sphere' | 'extruded-grid' | 'glow-valley'>('wooden-peg');
  const [hover3DDepth, setHover3DDepth] = useState(18); // Output 3D extrusion/height/shadow (0 to 40)
  const [hoverTiltStrength, setHoverTiltStrength] = useState(8); // Spatial rotation tilt (0 to 15)
  const [hoverPinSize, setHoverPinSize] = useState(5.0); // Center pegged pins/hardware studs (0 to 14)
  const [hoverPinColor, setHoverPinColor] = useState<'silver' | 'brass' | 'bronze' | 'charcoal' | 'gold'>('silver'); // Metallic screw types
  const [hoverNeonGlow, setHoverNeonGlow] = useState(25); // Under-cell lighting glow (0 to 50)
  const [hoverBorderExtend, setHoverBorderExtend] = useState(4); // Hover contour border width
  const [hoverIsSinking, setHoverIsSinking] = useState(false); // Sinking (Image 4) vs rising 3D blocks toggle

  // Custom Advanced Style features (User requested UI)
  const [showLabels, setShowLabels] = useState(false);
  const [customLabels, setCustomLabels] = useState('Rock, Pop, Jazz, Folk, Metal, Indie, R&B, Country, Classical, Techno, Rap, Soul, Punk, Blues, Disco, Ambient, Reggae');
  const [labelFontSize, setLabelFontSize] = useState(12);

  // --- UI States ---
  const [activeTab, setActiveTab] = useState<'geometry' | 'style' | 'motion' | 'export'>('geometry');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording'>('idle');
  const [videoQuality, setVideoQuality] = useState<'720' | '1080' | '1440' | '2160'>('1080');
  const [videoDuration, setVideoDuration] = useState<number>(20);
  const [showSettings, setShowSettings] = useState(true);

  // Video recording and export refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedBlobsRef = useRef<Blob[]>([]);
  const isRecordingHighResRef = useRef(false);
  const recordingScaleRef = useRef(1);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<CellPoint[]>([]);
  const mouseRef = useRef({ x: -2000, y: -2000 });
  const smoothMouseRef = useRef({ x: -2000, y: -2000 }); // trailing/lagging physical cursor
  const lastActiveTimeRef = useRef(Date.now());
  const gridRef = useRef<ParticleGrid>(new ParticleGrid(140)); // 140px buckets
  const animationFrameId = useRef<number | null>(null);

  // Compute theme colors dynamically or return custom selections
  const theme = useMemo(() => {
    if (useCustomPalette) {
      return {
        bg: customBgColor,
        colors: customPalette,
        stroke: customStrokeColor,
        accent: customAccentColor,
        glow: customAccentColor
      };
    }

    switch (colorScheme) {
      case 'natural-sage': 
        return { 
          bg: '#e8e5da', 
          colors: ['#2f3e28', '#526e48', '#80af81', '#cfd4c5', '#9ab097'], 
          stroke: '#1e2d19', 
          accent: '#2f3e28', 
          glow: '#80af81' 
        };
      case 'terracotta': 
        return { 
          bg: '#fbf5f2', 
          colors: ['#c97a5b', '#e09a7b', '#a35032', '#de6c45', '#edd7cf'], 
          stroke: '#5c2a17', 
          accent: '#a35032', 
          glow: '#de6c45' 
        };
      case 'cyber-lava': 
        return { 
          bg: '#050303', 
          colors: ['#ff2a00', '#ff5a00', '#222222', '#111111', '#551100'], 
          stroke: '#ff3c14', 
          accent: '#ff2a00', 
          glow: '#ff5a00' 
        };
      case 'retro-pop': 
        return { 
          bg: '#faf6eb', 
          colors: ['#0d4137', '#e85a4f', '#eae7dc', '#e98074', '#d8c3a5'], 
          stroke: '#0d4137', 
          accent: '#e85a4f', 
          glow: '#e98074' 
        };
      case 'gold': 
        return { bg: '#080808', colors: ['#ffd700', '#c5a028', '#8b6d13', '#624e00'], stroke: '#ffd700', accent: '#ffd700', glow: '#ffd700' };
      case 'blueprint': 
        return { bg: '#001a33', colors: ['#00aaff', '#004488', '#ffffff', '#002244'], stroke: '#00aaff', accent: '#00ffcc', glow: '#00aaff' };
      case 'glass': 
        return { bg: '#e0f7fa', colors: ['#ffffff', '#b2ebf2', '#80deea', '#e0f2f1'], stroke: 'rgba(0,0,0,0.15)', accent: '#00bcd4', glow: '#ffffff' };
      case 'monochrome':
        return { bg: '#080808', colors: ['#ffffff', '#a8a8a8', '#555555', '#1e1e1e'], stroke: '#ffffff', accent: '#ffffff', glow: '#ffffff' };
      case 'vibrant':
        return { bg: '#05050c', colors: ['#ff00ff', '#00ffff', '#ffff00', '#00ff00', '#ff3366'], stroke: 'rgba(255,255,255,0.7)', accent: '#00ffff', glow: '#ff00ff' };
      case 'minimal': 
      default:
        return { bg: '#ffffff', colors: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da'], stroke: '#000000', accent: '#000000', glow: '#000000' };
    }
  }, [colorScheme, useCustomPalette, customBgColor, customStrokeColor, customAccentColor, customPalette]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const initPoints = (width: number, height: number) => {
    const p: CellPoint[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < pointCount; i++) {
      let x, y;
      if (pointPattern === 'grid') {
        const cols = Math.ceil(Math.sqrt(pointCount));
        const rows = Math.ceil(pointCount / cols);
        const col = i % cols;
        const row = Math.floor(i / cols);
        x = (width / (cols + 1)) * (col + 1) + (Math.random() - 0.5) * 60 * chaos;
        y = (height / (rows + 1)) * (row + 1) + (Math.random() - 0.5) * 60 * chaos;
      } else if (pointPattern === 'spiral') {
        const angle = i * 0.38;
        const dist = i * (Math.min(width, height) / 1.95 / pointCount) * (1 + chaos);
        x = centerX + Math.cos(angle) * dist + (Math.random() - 0.5) * 30 * chaos;
        y = centerY + Math.sin(angle) * dist + (Math.random() - 0.5) * 30 * chaos;
      } else if (pointPattern === 'cluster') {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 0.6) * (Math.min(width, height) * 0.38);
        x = centerX + Math.cos(angle) * dist;
        y = centerY + Math.sin(angle) * dist;
      } else {
        x = Math.random() * width;
        y = Math.random() * height;
      }

      p.push({
        x, y,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
        color: theme.colors[i % theme.colors.length],
        originalX: x,
        originalY: y,
        noiseOffset: Math.random() * 2000
      });
    }

    // Apply Relaxation if requested
    if (relaxation > 0) {
      for (let r = 0; r < relaxation; r++) {
        const delaunay = Delaunay.from(p.map(pt => [pt.x, pt.y]));
        const voronoi = delaunay.voronoi([0, 0, width, height]);
        for (let i = 0; i < p.length; i++) {
          const poly = voronoi.cellPolygon(i);
          if (poly) {
            let cx = 0, cy = 0;
            for (const [px, py] of poly) { cx += px; cy += py; }
            p[i].x = cx / poly.length;
            p[i].y = cy / poly.length;
            p[i].originalX = p[i].x;
            p[i].originalY = p[i].y;
          }
        }
      }
    }

    pointsRef.current = p;
  };

  useEffect(() => {
    if (containerRef.current) {
      initPoints(containerRef.current.clientWidth, containerRef.current.clientHeight);
    }
  }, [pointCount, pointPattern, colorScheme, relaxation, chaos, useCustomPalette]);

  // Cubic Bezier interpolation calculator to yield high-quality vertex paths
  const getBezierPoint = (p0: number[], p1: number[], p2: number[], p3: number[], t: number) => {
    const mt = 1.0 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    return [
      mt3 * p0[0] + 3.0 * mt2 * t * p1[0] + 3.0 * mt * t2 * p2[0] + t3 * p3[0],
      mt3 * p0[1] + 3.0 * mt2 * t * p1[1] + 3.0 * mt * t2 * p2[1] + t3 * p3[1]
    ];
  };

  // Convert smooth parametric shapes (circles/teardrops) to polygons so they can leverage 
  // wobbly sketching, curvature smoothing, double-strokes and topographics seamlessly!
  const getCirclePolygon = (cx: number, cy: number, rad: number, steps = 30) => {
    const vertices: number[][] = [];
    for (let s = 0; s < steps; s++) {
      const angle = (s / steps) * Math.PI * 2.0;
      vertices.push([
        cx + Math.cos(angle) * rad,
        cy + Math.sin(angle) * rad
      ]);
    }
    return vertices;
  };

  const getTeardropPolygon = (cx: number, cy: number, rad: number, angle: number, steps = 18) => {
    const vertices: number[][] = [];
    
    // Top cubic control points relative to origin
    const p0 = [rad * 1.8, 0];
    const p1 = [rad * 1.0, rad * 1.25];
    const p2 = [-rad * 1.0, rad * 1.15];
    const p3 = [-rad * 1.0, 0];
    
    // Bottom cubic control points
    const q0 = [-rad * 1.0, 0];
    const q1 = [-rad * 1.0, -rad * 1.15];
    const q2 = [rad * 1.0, -rad * 1.25];
    const q3 = [rad * 1.8, 0];
    
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    
    const project = (pt: number[]) => {
      const rx = pt[0] * cosA - pt[1] * sinA;
      const ry = pt[0] * sinA + pt[1] * cosA;
      return [cx + rx, cy + ry];
    };

    // Construct loop profile
    for (let s = 0; s < steps; s++) {
      vertices.push(project(getBezierPoint(p0, p1, p2, p3, s / steps)));
    }
    for (let s = 0; s < steps; s++) {
      vertices.push(project(getBezierPoint(q0, q1, q2, q3, s / steps)));
    }
    return vertices;
  };

  // Setup High-Frequency Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset force refresh frame buffer on every state re-trigger to guarantee fast visual update inside frozen states
    let forceFrames = 20;

    const resize = () => {
      if (isRecordingHighResRef.current) return;
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        initPoints(canvas.width, canvas.height);
      }
    };
    window.addEventListener('resize', resize);
    resize();

    const render = (time: number) => {
      const w = containerRef.current?.clientWidth || canvas.width;
      const h = containerRef.current?.clientHeight || canvas.height;

      // Ensure points are structured inside spatial partitioning hash grid at start of frame
      gridRef.current.clear();
      pointsRef.current.forEach((p, idx) => gridRef.current.insert(p.x, p.y, idx));

      // --- HIGH PERFORMANCE SLEEP FILTER ---
      // If in frozen state and no active mouse interaction, sleep rendering to achieve 0% CPU footprint!
      const isMouseActive = mouseRef.current.x > -1000 && mouseRef.current.x < w && mouseRef.current.y > -1000 && mouseRef.current.y < h;
      let isMoving = isAnimate || isMouseActive;
      if (!isMoving) {
        // Fallback: check if spring physics are still settling down
        const hasVelocity = pointsRef.current.some(p => Math.abs(p.vx) > 0.02 || Math.abs(p.vy) > 0.02);
        if (hasVelocity) isMoving = true;
      }

      if (isMoving) {
        lastActiveTimeRef.current = Date.now();
      }

      const elapsedSinceActive = Date.now() - lastActiveTimeRef.current;
      // Allow 1.5 seconds settling threshold so inertia springs halt beautifully, or force update frames if just adjusted sliders
      const shouldDraw = isMoving || (elapsedSinceActive < 1500) || (forceFrames > 0);

      if (forceFrames > 0) {
        forceFrames--;
      }

      if (!shouldDraw) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }

      // Smooth trailing viscous lag computation
      if (mouseRef.current.x > -1000) {
        if (smoothMouseRef.current.x < -1000) {
          smoothMouseRef.current.x = mouseRef.current.x;
          smoothMouseRef.current.y = mouseRef.current.y;
        } else {
          smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * mouseSmoothing;
          smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * mouseSmoothing;
        }
      } else {
        smoothMouseRef.current = { x: -2000, y: -2000 };
      }

      // Live Candidate Hover Testing using O(1) Spatial Hash Grid Partitioning!
      let minDist = Infinity;
      let nearest = -1;
      
      const candidates = (smoothMouseRef.current.x > -1000) 
        ? gridRef.current.getNeighbors(smoothMouseRef.current.x, smoothMouseRef.current.y)
        : [];
        
      if (candidates.length > 0) {
        candidates.forEach(idx => {
          const p = pointsRef.current[idx];
          if (!p) return;
          const dx = p.x - smoothMouseRef.current.x;
          const dy = p.y - smoothMouseRef.current.y;
          const d = dx * dx + dy * dy;
          if (d < minDist) { minDist = d; nearest = idx; }
        });
      } else {
        // Full scan fallback
        pointsRef.current.forEach((p, i) => {
          const dx = p.x - smoothMouseRef.current.x;
          const dy = p.y - smoothMouseRef.current.y;
          const d = dx * dx + dy * dy;
          if (d < minDist) { minDist = d; nearest = i; }
        });
      }
      // Candidate must be within interaction corridor
      setHoveredIndex(minDist < (influenceRadius * influenceRadius) / 4 ? nearest : null);

      // Pulse breathing loop factor
      const pulseBreathe = 1.0 + Math.sin(time / 1500) * breatheIntensity * 0.15;

      // Particle physics & spring constraints
      pointsRef.current.forEach((p, i) => {
        // Dynamic home anchoring spring
        const targetX = p.originalX + Math.sin(time / 2000 + p.noiseOffset) * chaos * 35;
        const targetY = p.originalY + Math.cos(time / 2000 + p.noiseOffset) * chaos * 35;
        
        const Fx = (targetX - p.x) * springStrength;
        const Fy = (targetY - p.y) * springStrength;
        
        p.vx += Fx;
        p.vy += Fy;

        // Apply interactive micro jitter/shake value if hovered
        if (hoveredIndex === i && hoverJiggle > 0) {
          p.vx += (Math.random() - 0.5) * hoverJiggle * 1.5;
          p.vy += (Math.random() - 0.5) * hoverJiggle * 1.5;
        }

        if (isAnimate) {
          // Wander oscillations
          p.x += p.vx * speed;
          p.y += p.vy * speed;
          p.x += Math.sin(time / 1400 + p.noiseOffset) * oscillation * speed * 2.5;
          p.y += Math.cos(time / 1400 + p.noiseOffset) * oscillation * speed * 2.5;
          p.x += Math.cos(time / 9000 + p.noiseOffset) * drift * 12;
          p.y += Math.sin(time / 9000 + p.noiseOffset) * drift * 12;
        } else {
          // Keep spring physics active even in dry frozen mode
          p.x += p.vx * 0.2;
          p.y += p.vy * 0.2;
        }

        // Apply friction
        p.vx *= 0.93;
        p.vy *= 0.93;

        // Custom mouse hover magnet modes (Repel, Attract, Wiggle, Shatter)
        if (magneticMode !== 'none' && smoothMouseRef.current.x > -1000) {
          const dx = p.x - smoothMouseRef.current.x;
          const dy = p.y - smoothMouseRef.current.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < influenceRadius * influenceRadius) {
            const dist = Math.sqrt(distSq);
            const force = (influenceRadius - dist) / influenceRadius;
            const dirX = dx / dist;
            const dirY = dy / dist;
            const moveForce = force * magneticStrength * 1.6;

            if (magneticMode === 'repel') {
              p.vx += dirX * moveForce;
              p.vy += dirY * moveForce;
            } else if (magneticMode === 'attract') {
              p.vx -= dirX * moveForce;
              p.vy -= dirY * moveForce;
            } else if (magneticMode === 'wiggle') {
              p.vx += (Math.random() - 0.5) * moveForce * 2.5;
              p.vy += (Math.random() - 0.5) * moveForce * 2.5;
            } else if (magneticMode === 'shatter') {
              p.vx += dirX * moveForce * 4.5;
              p.vy += dirY * moveForce * 4.5;
            }
          }
        }

        // Boundary containment
        if (p.x < -100) p.x = w + 100;
        if (p.x > w + 100) p.x = -100;
        if (p.y < -100) p.y = h + 100;
        if (p.y > h + 100) p.y = -100;
      });

      // Erase & refresh viewport using full raw buffer size
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const renderScale = isRecordingHighResRef.current ? recordingScaleRef.current : 1.0;
      ctx.save();
      ctx.scale(renderScale, renderScale);

      // Fine-grained paper texture noise
      if (bgTexture) {
        ctx.save();
        ctx.globalAlpha = theme.bg === '#ffffff' ? 0.04 : 0.08;
        for (let i = 0; i < 750; i++) {
          ctx.fillStyle = i % 2 === 0 ? theme.stroke : theme.accent;
          ctx.fillRect(Math.sin(i * 123) * w, Math.cos(i * 456) * h, 1.2, 1.2);
        }
        ctx.restore();
      }

      // Let's decide if Delaunay and Voronoi are needed
      const needsVoronoi = cellGeometryType === 'voronoi' || 
                           cellGeometryType === 'shards' || 
                           cellGeometryType === 'constellation' || 
                           renderMode === 'wireframe';

      let delaunay: any = null;
      let voronoi: any = null;

      if (needsVoronoi) {
        // Voronoi tessellation generation with swirling wave coordinates
        const inputPoints = pointsRef.current.map(p => {
          if (geomWarp > 0) {
            const angle = (p.originalX / w) * Math.PI * 4.0;
            return [
              p.x + Math.sin(angle + time / 1800) * geomWarp * 35,
              p.y + Math.cos(angle + time / 1800) * geomWarp * 35
            ];
          }
          return [p.x, p.y];
        });

        delaunay = Delaunay.from(inputPoints);
        voronoi = delaunay.voronoi([-120, -120, w + 120, h + 120]);
      }

      // Constellation Wireframe underlay
      if (cellGeometryType === 'constellation' && delaunay) {
        const { halfedges, triangles } = delaunay;
        ctx.save();
        ctx.strokeStyle = theme.stroke + '2a';
        ctx.lineWidth = strokeWidth * 0.45;
        for (let i = 0; i < halfedges.length; i++) {
          if (i < halfedges[i]) continue;
          const t0 = triangles[i];
          const t1 = triangles[i % 3 === 2 ? i - 2 : i + 1];
          const p0 = pointsRef.current[t0];
          const p1 = pointsRef.current[t1];
          if (p0 && p1) {
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Core Cellular Drawing Loop
      pointsRef.current.forEach((p, i) => {
        let polygon: number[][] | null = null;
        if (needsVoronoi && voronoi) {
          polygon = voronoi.cellPolygon(i);
          if (!polygon) return;
        }

        const isHovered = hoveredIndex === i;
        ctx.save();

        if (shadowDepth > 0 && hoverPresetType !== 'glow-valley') {
          ctx.shadowBlur = shadowDepth;
          ctx.shadowColor = theme.bg === '#ffffff' ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.4)';
          ctx.shadowOffsetY = shadowDepth / 2;
        }

        const levels = renderMode === 'topographic' 
          ? (pointCount > 100 ? Math.min(3, contourLevels) : (pointCount > 65 ? Math.min(4, contourLevels) : contourLevels)) 
          : 1;
        const pPadding = cellPadding;
        
        // Base radius for smooth circular clay-balls or fluid teardrops
        const defaultRadius = Math.max(15, (40 - cellPadding * 0.45) * cellScaleMultiplier);
        const rad = defaultRadius * (isHovered ? hoverScale : 1.0) * pulseBreathe;

        // Pre-compute polygon vertex offsets once per cell to optimize math across nested level loops
        let vertexOffsets: { dx: number, dy: number, d: number }[] | null = null;
        if (polygon) {
          vertexOffsets = polygon.map(([px, py]) => {
            const dx = px - p.x;
            const dy = py - p.y;
            return {
              dx,
              dy,
              d: Math.sqrt(dx * dx + dy * dy)
            };
          });
        }

        // --- DYNAMIC INTERACTIVE 3D WAVE MATHEMATICS (Image 4 & 1 Inspired) ---
        const dxMouse = p.x - smoothMouseRef.current.x;
        const dyMouse = p.y - smoothMouseRef.current.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        // Compute smooth proximity index
        const influence = Math.max(0, 1.0 - distMouse / influenceRadius);
        const smoothInfluence = Math.sin(influence * Math.PI / 2); // Creamy ease out sine

        // Determine actual height extrusion factor
        const rawHeight = isHovered 
          ? hover3DDepth * 1.5 
          : (smoothInfluence * hover3DDepth);
        const active3DHeight = hoverIsSinking ? -rawHeight : rawHeight;

        // Calculate perspective lateral shear/tilt shift
        let shiftX = 0;
        let shiftY = 0;
        if (Math.abs(active3DHeight) > 0.1) {
          const dirX = distMouse === 0 ? 0 : dxMouse / distMouse;
          const dirY = distMouse === 0 ? 0 : dyMouse / distMouse;
          shiftX = -dirX * active3DHeight * (hoverTiltStrength / 10);
          shiftY = -dirY * active3DHeight * (hoverTiltStrength / 10);
        }

        // --- 1. NEON GAP VALLEYS GLOW BEHIND CELL BASE (Image 5 & 6 inspired honeycomb) ---
        if (hoverNeonGlow > 0 && (isHovered || smoothInfluence > 0.05)) {
          ctx.save();
          const glowRatio = isHovered ? 1.4 : smoothInfluence;
          ctx.beginPath();
          if (polygon) {
            ctx.moveTo(polygon[0][0], polygon[0][1]);
            for (let pj = 1; pj < polygon.length; pj++) {
              ctx.lineTo(polygon[pj][0], polygon[pj][1]);
            }
            ctx.closePath();
          } else {
            ctx.arc(p.x, p.y, rad * 1.1, 0, Math.PI * 2);
          }
          ctx.shadowBlur = hoverNeonGlow * glowRatio;
          ctx.shadowColor = theme.glow || '#06b6d4';
          ctx.fillStyle = theme.glow || '#06b6d4';
          ctx.globalAlpha = 0.55 * glowRatio;
          ctx.fill();
          ctx.restore();
        }

        for (let l = 0; l < levels; l++) {
          const ratio = (1.0 - (l / levels) * 0.85);
          ctx.beginPath();

          let insetPolygon: number[][];

          if (cellGeometryType === 'metaballs') {
            const currentRad = rad * ratio;
            insetPolygon = getCirclePolygon(p.x, p.y, currentRad);
          } else if (cellGeometryType === 'fluid-teardrop') {
            const currentRad = rad * 0.85 * ratio;
            const angle = Math.atan2(p.vy, p.vx) || (i * 0.3);
            insetPolygon = getTeardropPolygon(p.x, p.y, currentRad, angle);
          } else {
            if (!vertexOffsets) return;
            // Calculate organic inset coordinates for polygonal shapes using pre-calculated offsets
            insetPolygon = vertexOffsets.map(({ dx, dy, d }) => {
              let gap = pPadding;
              if (cellGeometryType === 'shards') {
                gap = pPadding * 2.5 + 4.5;
              }
              
              const move = Math.max(0, d - gap * (l + 1));
              const f = d === 0 ? 0 : move / d;
              
              let shardX = p.x + dx * f * ratio;
              let shardY = p.y + dy * f * ratio;
              
              if (cellGeometryType === 'shards') {
                const shardCentroidDist = 0.95;
                shardX = p.x + (shardX - p.x) * shardCentroidDist;
                shardY = p.y + (shardY - p.y) * shardCentroidDist;
              }
              
              // Scale coordinates relative to individual cell centroid instead of canvas origin (0,0) to prevent sliding/drifting bugs!
              const finalX = p.x + (shardX - p.x) * pulseBreathe;
              const finalY = p.y + (shardY - p.y) * pulseBreathe;
              return [finalX, finalY];
            });
          }

          // Wobbly edge hand-sketched perturbation solver with Level of Detail (LOD) speedups for high point concentrations
          if (handDrawn) {
            const isHighDensity = pointCount > 70;
            const distSq = (p.x - smoothMouseRef.current.x) * (p.x - smoothMouseRef.current.x) + (p.y - smoothMouseRef.current.y) * (p.y - smoothMouseRef.current.y);
            const isDistantCell = distSq > 240 * 240;

            if (isHighDensity && isDistantCell) {
              // Simpler wobble tracking or bypass for massive speedups on distant cells
              insetPolygon = getWobblyPath(insetPolygon, wobbleAmplitude * ratio * 0.4, Math.min(8, wobbleFrequency));
            } else {
              insetPolygon = getWobblyPath(insetPolygon, wobbleAmplitude * ratio, wobbleFrequency);
            }
          }

          // --- 2. GENERATE 3D PARALLAX PERSPECTIVE FRONT POLYGON (Image 1, 2, 4) ---
          const drawPolygon = Math.abs(active3DHeight) > 0.4
            ? insetPolygon.map(([px, py]) => [px + shiftX, py + shiftY])
            : insetPolygon;

          // --- 3. RENDER 3D SOLID EXTRUDED BEVEL SIDEWALLS (Stereoscopic Extrusions) ---
          if (l === 0 && Math.abs(active3DHeight) > 0.4 && insetPolygon.length > 2) {
            const len = insetPolygon.length;
            ctx.save();
            for (let j = 0; j < len; j++) {
              const b1 = insetPolygon[j];
              const b2 = insetPolygon[(j + 1) % len];
              const f1 = drawPolygon[j];
              const f2 = drawPolygon[(j + 1) % len];
              
              ctx.beginPath();
              ctx.moveTo(b1[0], b1[1]);
              ctx.lineTo(b2[0], b2[1]);
              ctx.lineTo(f2[0], f2[1]);
              ctx.lineTo(f1[0], f1[1]);
              ctx.closePath();
              
              // Dynamic depth shading factor
              ctx.fillStyle = theme.bg === '#ffffff' 
                ? 'rgba(0, 0, 0, 0.15)' 
                : 'rgba(0, 0, 0, 0.42)';
              ctx.fill();
              
              ctx.strokeStyle = theme.stroke + '12';
              ctx.lineWidth = 0.55;
              ctx.stroke();
            }
            ctx.restore();
          }

          // Trace final front polygon coordinate paths
          if (drawPolygon.length > 2) {
            const roundedActive = cellRoundness > 0.05 && 
              cellGeometryType !== 'metaballs' && 
              cellGeometryType !== 'fluid-teardrop';
              
            ctx.beginPath();
            if (roundedActive) {
              drawRoundedPolygon(ctx, drawPolygon, cellRoundness * 26.0 * ratio);
            } else {
              ctx.moveTo(drawPolygon[0][0], drawPolygon[0][1]);
              for (let j = 1; j < drawPolygon.length; j++) {
                ctx.lineTo(drawPolygon[j][0], drawPolygon[j][1]);
              }
              ctx.closePath();
            }
          }

          // Render Fill Styles
          if (l === 0) {
            const isHoverActive = isHovered || (smoothInfluence > 0.08);

            if (isHoverActive) {
              // --- 3D PREMIUM HOVER COLOR & GRADIENT ENGINES (Image Inspired) ---
              if (hoverPresetType === 'wooden-peg') {
                // Image 1: Hardwood Voronoi block look with detailed physical grain rings
                const centerXP = p.x + shiftX;
                const centerYP = p.y + shiftY;
                const woodGrad = ctx.createRadialGradient(
                  centerXP, centerYP, 2,
                  centerXP, centerYP, rad * 1.5
                );
                woodGrad.addColorStop(0, '#fbeada'); // polished warm core
                woodGrad.addColorStop(0.3, '#d8aa78'); // oak ring
                woodGrad.addColorStop(0.7, '#96673a'); // walnut body
                woodGrad.addColorStop(1, '#573d1c'); // charcoal bark trim
                ctx.fillStyle = woodGrad;
                ctx.fill();

                // Concentric wooden growth grains mapping
                ctx.save();
                ctx.strokeStyle = 'rgba(87, 61, 28, 0.12)';
                ctx.lineWidth = 1.25;
                for (let ring = 1; ring <= 4; ring++) {
                  const ringScale = ring / 5;
                  const ringPoly = drawPolygon.map(([px, py]) => [
                    centerXP + (px - centerXP) * ringScale,
                    centerYP + (py - centerYP) * ringScale
                  ]);
                  if (ringPoly.length > 2) {
                    ctx.beginPath();
                    if (cellRoundness > 0.05) {
                      drawRoundedPolygon(ctx, ringPoly, cellRoundness * 26.0 * ringScale);
                    } else {
                      ctx.moveTo(ringPoly[0][0], ringPoly[0][1]);
                      for (let rj = 1; rj < ringPoly.length; rj++) ctx.lineTo(ringPoly[rj][0], ringPoly[rj][1]);
                      ctx.closePath();
                    }
                    ctx.stroke();
                  }
                }
                ctx.restore();

              } else if (hoverPresetType === 'clay-blob') {
                // Image 2: Organic, smooth squishy fluid teal clay cushions
                const cx = p.x + shiftX - rad * 0.18;
                const cy = p.y + shiftY - rad * 0.18;
                const clayGrad = ctx.createRadialGradient(
                  cx, cy, rad * 0.04,
                  p.x + shiftX, p.y + shiftY, rad * 1.3
                );
                clayGrad.addColorStop(0, '#ffffff'); // bright gloss light
                clayGrad.addColorStop(0.2, isHovered ? theme.accent : p.color);
                clayGrad.addColorStop(0.75, theme.colors[(i + 3) % theme.colors.length]);
                clayGrad.addColorStop(1, '#111518'); // core clay shadow
                ctx.fillStyle = clayGrad;
                ctx.fill();

                // Highlight inner cushion bevel loop
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
                ctx.lineWidth = 1.45;
                const bevelPoly = drawPolygon.map(([px, py]) => [
                  (p.x + shiftX) + (px - (p.x + shiftX)) * 0.88,
                  (p.y + shiftY) + (py - (p.y + shiftY)) * 0.88
                ]);
                if (bevelPoly.length > 2) {
                  ctx.beginPath();
                  if (cellRoundness > 0.05) {
                    drawRoundedPolygon(ctx, bevelPoly, cellRoundness * 22.0);
                  } else {
                    ctx.moveTo(bevelPoly[0][0], bevelPoly[0][1]);
                    for (let rj = 1; rj < bevelPoly.length; rj++) ctx.lineTo(bevelPoly[rj][0], bevelPoly[rj][1]);
                    ctx.closePath();
                  }
                  ctx.stroke();
                }
                ctx.restore();

              } else if (hoverPresetType === 'glossy-sphere') {
                // Image 3: High-gloss white pearls with specular bubble shine glares
                const cx = p.x + shiftX - rad * 0.26;
                const cy = p.y + shiftY - rad * 0.26;
                const glosGrad = ctx.createRadialGradient(
                  cx, cy, rad * 0.03,
                  p.x + shiftX, p.y + shiftY, rad * 1.05
                );
                glosGrad.addColorStop(0, '#ffffff'); // high specular peak
                glosGrad.addColorStop(0.15, '#f8fafc');
                glosGrad.addColorStop(0.65, p.color === '#ffffff' ? '#e2e8f0' : p.color);
                glosGrad.addColorStop(0.9, theme.stroke + 'bb');
                glosGrad.addColorStop(1, '#20293a');
                ctx.fillStyle = glosGrad;
                ctx.fill();

                // Specification glossy spot
                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
                ctx.beginPath();
                ctx.arc(p.x + shiftX - rad * 0.25, p.y + shiftY - rad * 0.25, rad * 0.16, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

              } else if (hoverPresetType === 'extruded-grid') {
                // Image 4: Minimalist 3D grid architectural block
                const blockGrad = ctx.createLinearGradient(
                  p.x + shiftX - rad, p.y + shiftY - rad,
                  p.x + shiftX + rad, p.y + shiftY + rad
                );
                blockGrad.addColorStop(0, '#ffffff');
                blockGrad.addColorStop(0.3, isHovered ? theme.accent : p.color);
                blockGrad.addColorStop(1, theme.colors[(i + 1) % theme.colors.length]);
                ctx.fillStyle = blockGrad;
                ctx.fill();

              } else if (hoverPresetType === 'glow-valley') {
                // Image 5 & 6: Premium hexagonal basalt carbon rock core
                const valleyGrad = ctx.createLinearGradient(
                  p.x + shiftX - rad, p.y + shiftY - rad,
                  p.x + shiftX + rad, p.y + shiftY + rad
                );
                valleyGrad.addColorStop(0, '#4b5563'); // carbon basalt
                valleyGrad.addColorStop(0.55, '#1e293b');
                valleyGrad.addColorStop(1, '#090d16'); // dark obsidian
                ctx.fillStyle = valleyGrad;
                ctx.fill();
              }

            } else {
              // --- FALLBACK STANDARD COMPLIANT MODES ---
              const fillAllowed = renderMode === 'filled' || 
                renderMode === 'topographic' || 
                renderMode === 'glow' || 
                renderMode === '3D-clay';
                
              if (fillAllowed) {
                if (renderMode === '3D-clay') {
                  const grad = ctx.createRadialGradient(
                    p.x - rad * 0.18, 
                    p.y - rad * 0.18, 
                    rad * 0.05, 
                    p.x, 
                    p.y, 
                    rad * 1.5
                  );
                  grad.addColorStop(0, '#ffffff');
                  grad.addColorStop(0.25, p.color);
                  grad.addColorStop(0.8, theme.colors[(i + 1) % theme.colors.length]);
                  grad.addColorStop(1, '#000000');
                  ctx.fillStyle = grad;
                  ctx.fill();
                } else if (renderMode === 'glow') {
                  ctx.fillStyle = 'rgba(10,10,12,0.85)';
                  ctx.fill();
                } else if (renderMode === 'topographic' && contourStyle === 'alternating') {
                  ctx.fillStyle = l % 2 === 0 ? p.color : theme.bg;
                  ctx.fill();
                } else {
                  ctx.fillStyle = p.color;
                  ctx.fill();
                }
              }
            }
          }

          // Topographic layers shading
          if (renderMode === 'topographic' && l > 0 && !isHovered) {
            ctx.save();
            ctx.globalAlpha = 0.14 + (l / levels) * 0.44;
            ctx.fillStyle = theme.colors[(i + l) % theme.colors.length];
            ctx.fill();
            ctx.restore();
          }

          // Stroke Outline rendering Styles
          if (renderMode === 'wireframe') {
            ctx.strokeStyle = theme.stroke + '44';
            ctx.lineWidth = 0.55;
            ctx.stroke();
          } else {
            // Apply double sticker silhouette stroke contour
            if (doubleStroke || (isHovered && hoverPresetType !== 'glow-valley')) {
              ctx.save();
              ctx.strokeStyle = theme.bg === '#ffffff' ? '#111111' : '#ffffff';
              ctx.lineWidth = (strokeWidth * (isHovered ? (3.2 + hoverBorderExtend * 0.5) : 3.2)) * (1.0 - (l / levels) * 0.58);
              ctx.stroke();
              ctx.restore();
            }

            ctx.strokeStyle = isHovered 
              ? (hoverPresetType === 'glow-valley' ? (theme.glow || '#06b6d4') : theme.accent) 
              : theme.stroke;
            ctx.lineWidth = strokeWidth * (1.0 - (l / levels) * 0.58);
            
            if (isDashed || contourStyle === 'dashed') {
              ctx.setLineDash([strokeWidth * 4 + 2, strokeWidth * 3 + 2]);
            } else if (contourStyle === 'dotted') {
              ctx.setLineDash([1.5, 4.5]);
            } else {
              ctx.setLineDash([]);
            }

            if (renderMode === 'glow') {
              ctx.shadowBlur = glowIntensity * 28.0;
              ctx.shadowColor = theme.glow;
            }
            ctx.stroke();
          }
        }

        // Concentric internal flow vectors
        if (renderMode === 'topographic' && contourLevels > 3 && cellGeometryType === 'voronoi') {
          ctx.save();
          ctx.strokeStyle = theme.stroke + '1a';
          ctx.lineWidth = 0.45;
          ctx.beginPath();
          for (let k = 0; k < 3; k++) {
            const strokeOffset = k * 11;
            ctx.arc(p.x, p.y, cellPadding * 2 + strokeOffset, i * 0.1, i * 0.1 + Math.PI * 0.65);
          }
          ctx.stroke();
          ctx.restore();
        }

        // Structural hardware bolt rivets for Wooden Pegs (Image 1 masterpiece)
        if (hoverPresetType === 'wooden-peg' && hoverPinSize > 0 && (isHovered || smoothInfluence > 0.08)) {
          ctx.save();
          const pX = p.x + shiftX;
          const pY = p.y + shiftY;
          const currentPinRad = hoverPinSize * (isHovered ? 1.3 : 1.0);

          ctx.beginPath();
          ctx.arc(pX, pY, currentPinRad, 0, Math.PI * 2);

          // Realistic brass/gold/silver/bronze metal gradient
          const pinG = ctx.createRadialGradient(
            pX - currentPinRad * 0.3, pY - currentPinRad * 0.3, currentPinRad * 0.08,
            pX, pY, currentPinRad * 1.15
          );

          if (hoverPinColor === 'gold') {
            pinG.addColorStop(0, '#fffbeb');
            pinG.addColorStop(0.35, '#fbbf24');
            pinG.addColorStop(0.85, '#ca8a04');
            pinG.addColorStop(1, '#78350f');
          } else if (hoverPinColor === 'brass') {
            pinG.addColorStop(0, '#fef08a');
            pinG.addColorStop(0.45, '#ca8a04');
            pinG.addColorStop(1, '#422006');
          } else if (hoverPinColor === 'bronze') {
            pinG.addColorStop(0, '#ffedd5');
            pinG.addColorStop(0.4, '#b45309');
            pinG.addColorStop(1, '#451a03');
          } else if (hoverPinColor === 'charcoal') {
            pinG.addColorStop(0, '#9ca3af');
            pinG.addColorStop(0.5, '#4b5563');
            pinG.addColorStop(1, '#111827');
          } else { // silver
            pinG.addColorStop(0, '#ffffff');
            pinG.addColorStop(0.4, '#cbd5e1');
            pinG.addColorStop(0.8, '#64748b');
            pinG.addColorStop(1, '#1e293b');
          }

          ctx.fillStyle = pinG;
          ctx.shadowColor = 'rgba(0,0,0,0.35)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetY = 1;
          ctx.fill();

          // Flat-head hardware screw groove slot
          ctx.strokeStyle = 'rgba(0,0,0,0.42)';
          ctx.lineWidth = 0.95;
          ctx.beginPath();
          ctx.moveTo(pX - currentPinRad * 0.5, pY - currentPinRad * 0.1);
          ctx.lineTo(pX + currentPinRad * 0.5, pY + currentPinRad * 0.1);
          ctx.stroke();

          ctx.restore();
        }

        // Node / Joint highlights (with 3D parallax offsets)
        if (showJoints || cellGeometryType === 'constellation') {
          ctx.beginPath();
          ctx.arc(p.x + shiftX, p.y + shiftY, jointSize * (isHovered ? 1.6 : 1.0), 0, Math.PI * 2);
          ctx.fillStyle = theme.accent;
          ctx.strokeStyle = theme.bg;
          ctx.lineWidth = 1.0;
          ctx.fill();
          ctx.stroke();
        }

        // Dynamic nested text labels (with 3D parallax offsets)
        if (showLabels) {
          const labelList = customLabels.split(',').map(l => l.trim()).filter(Boolean);
          if (labelList.length > 0) {
            const labelText = labelList[i % labelList.length];
            ctx.save();
            ctx.font = `bold ${labelFontSize}px system-ui, -apple-system, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Set contrast-appropriate label fills (charcoal for light cells, white for dark cells)
            if (theme.bg === '#000000') {
              ctx.fillStyle = '#111111';
            } else if (theme.bg === '#ffffff') {
              ctx.fillStyle = '#1c1c1c';
            } else {
              ctx.fillStyle = theme.stroke;
            }
            
            if (renderMode === '3D-clay' || renderMode === 'topographic') {
              ctx.shadowColor = 'rgba(0,0,0,0.3)';
              ctx.shadowBlur = 3;
            }
            ctx.fillText(labelText, p.x + shiftX, p.y + shiftY);
            ctx.restore();
          }
        }

        ctx.restore();
      });

      ctx.restore(); // Restore scaled root context pointer

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resize);
    };
  }, [
    isAnimate, cellRoundness, strokeWidth, shadowDepth, hoveredIndex, contourLevels, 
    renderMode, speed, oscillation, theme, cellPadding, magneticMode, influenceRadius, 
    magneticStrength, isDashed, glowIntensity, drift, bgTexture, handDrawn, 
    wobbleAmplitude, wobbleFrequency, cellGeometryType, showJoints, jointSize, 
    contourStyle, springStrength, chaos, cellScaleMultiplier, geomWarp, doubleStroke,
    hoverScale, hoverJiggle, mouseSmoothing, breatheIntensity, showLabels, customLabels, labelFontSize,
    hoverPresetType, hover3DDepth, hoverTiltStrength, hoverPinSize, hoverPinColor, hoverNeonGlow, hoverBorderExtend, hoverIsSinking
  ]);

  // Rounded coordinate vertex interpolation helper with dynamic tangent radius clamping to prevent visual spikes
  const drawRoundedPolygon = (ctx: CanvasRenderingContext2D, points: number[][], radius: number) => {
    if (points.length < 3) return;
    
    const len = points.length;
    const safeRadii: number[] = [];
    
    // Dynamically clamp corner radius to 45% of adjacent edge lengths to avoid self-intersections or runaway arcTo glitches
    for (let i = 0; i < len; i++) {
      const pPrev = points[(i - 1 + len) % len];
      const pCurr = points[i];
      const pNext = points[(i + 1) % len];
      
      const dx1 = pCurr[0] - pPrev[0];
      const dy1 = pCurr[1] - pPrev[1];
      const d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      
      const dx2 = pNext[0] - pCurr[0];
      const dy2 = pNext[1] - pCurr[1];
      const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      
      const maxSafeRadius = Math.min(d1, d2) * 0.45;
      safeRadii.push(Math.min(radius, maxSafeRadius));
    }

    ctx.moveTo((points[0][0] + points[len - 1][0]) / 2, (points[0][1] + points[len - 1][1]) / 2);
    for (let i = 0; i < len; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % len];
      ctx.arcTo(p1[0], p1[1], (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, safeRadii[i]);
    }
    ctx.closePath();
  };

  // Math-based subdivision and perturbation solver for wobbly pencil lines
  const getWobblyPath = (points: number[][], amp: number, freq: number) => {
    if (points.length < 3 || amp < 0.05) return points;
    const wPoints: number[][] = [];
    const maxSteps = pointCount > 100 ? 3 : (pointCount > 60 ? 5 : 7);
    const lenPoints = points.length;
    
    for (let i = 0; i < lenPoints; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % lenPoints];
      const dx = p2[0] - p1[0];
      const dy = p2[1] - p1[1];
      const len = Math.sqrt(dx * dx + dy * dy);
      
      // Avoid division by zero which generates NaNs and disables Canvas GPU-acceleration
      if (len < 0.1) {
        wPoints.push([p1[0], p1[1]]);
        continue;
      }
      
      const steps = Math.min(maxSteps, Math.max(2, Math.floor(len / freq)));
      // Pull division operations out of the inner loop for high-performance scale optimization
      const nx = -dy / len;
      const ny = dx / len;
      
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const x = p1[0] + dx * t;
        const y = p1[1] + dy * t;
        // Periodic smooth coordinate wobbling offset
        const phase = t * Math.PI + i * 2.3;
        const wobble = Math.sin(phase) * amp * (0.6 + 0.4 * Math.sin(phase * 1.7));
        wPoints.push([x + nx * wobble, y + ny * wobble]);
      }
    }
    return wPoints;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    // Smooth trailing physics update target
    mouseRef.current = { x: mx, y: my };

    // Update float glass cursor visuals
    const cursor = document.getElementById('cell-cursor');
    if (cursor) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursor.style.opacity = '1';
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `organic-clay-design-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('High-fidelity PNG captured!');
  };

  // --- COPY CORE HTML BACKDROP WIDGET DIRECTLY ---
  const handleCopyHTMLCode = () => {
    try {
      const liveScript = `<!-- Self-contained Interactive Organic Cell Backdrop Widget -->
<div id="organic-cells-container-${Date.now()}" style="position: relative; width: 100%; height: 100vh; overflow: hidden; background: ${theme.bg};">
  <canvas id="organic-cell-canvas-${Date.now()}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block;"></canvas>
  <div style="position: absolute; bottom: 12px; right: 16px; font-family: monospace; font-size: 9px; color: ${theme.stroke}55; pointer-events: none; text-transform: uppercase; letter-spacing: 0.1em;">Live Organic Cell Tissue</div>
</div>

<script>
  (function() {
    const container = document.getElementById("organic-cells-container-${Date.now()}");
    const canvas = document.getElementById("organic-cell-canvas-${Date.now()}");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let width = canvas.width = container.offsetWidth;
    let height = canvas.height = container.offsetHeight;
    
    // Support responsive resizing seamlessly
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        width = canvas.width = Math.floor(entry.contentRect.width);
        height = canvas.height = Math.floor(entry.contentRect.height);
      }
    });
    resizeObserver.observe(container);

    const colors = ${JSON.stringify(theme.colors)};
    const bgCol = "${theme.bg}";
    const strokeCol = "${theme.stroke}";
    
    // Create organic tissue nodes
    const nodes = [];
    const count = ${pointCount};
    for(let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = Math.min(width, height) * 0.25 * Math.sqrt(Math.random());
      nodes.push({
        x: width / 2 + Math.cos(angle) * r,
        y: height / 2 + Math.sin(angle) * r,
        originX: width / 2 + Math.cos(angle) * r,
        originY: height / 2 + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * ${speed * 4},
        vy: (Math.random() - 0.5) * ${speed * 4},
        radius: Math.max(12, Math.random() * 22 + (40 - ${cellPadding} * 0.45) * ${cellScaleMultiplier}),
        color: colors[i % colors.length]
      });
    }

    let mouse = { x: -2000, y: -2000 };
    container.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    container.addEventListener("mouseleave", () => {
      mouse.x = -2000;
      mouse.y = -2000;
    });

    function draw() {
      // Background render
      ctx.fillStyle = bgCol;
      ctx.fillRect(0, 0, width, height);

      // Micro background texture dots if enabled
      ${bgTexture ? `
      ctx.fillStyle = strokeCol + "10";
      for (let x = 0; x < width; x += 40) {
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.arc(x + 20, y + 20, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ` : ''}

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Physics & Node updating
      for(let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        p.x += p.vx;
        p.y += p.vy;

        // Soft boundaries bounce
        if (p.x < 50 || p.x > width - 50) p.vx *= -1;
        if (p.y < 50 || p.y > height - 50) p.vy *= -1;

        // Magnet attraction or repulsion dynamics
        if (mouse.x > -1000) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < ${influenceRadius}) {
            const force = ((${influenceRadius} - dist) / ${influenceRadius}) * ${magneticStrength * 0.35};
            const f = ${magneticMode === 'attract' ? 1.0 : -1.0} * force;
            p.vx += (dx / dist) * f * 0.1;
            p.vy += (dy / dist) * f * 0.1;
          }
        }

        // Limit maximum physical velocity
        const velLimit = 3.5;
        const curVel = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (curVel > velLimit) {
          p.vx = (p.vx / curVel) * velLimit;
          p.vy = (p.vy / curVel) * velLimit;
        }

        // Render cell body representation
        ctx.save();
        ctx.beginPath();
        const baseRad = p.radius;
        // Pulse breathing cycle animation
        const timeFactor = Date.now() * 0.0015 * ${speed ? speed : 1.0};
        const breathe = 1.0 + Math.sin(timeFactor + i * 0.8) * ${breatheIntensity * 0.12};
        const finalRad = baseRad * breathe;

        ctx.arc(p.x, p.y, finalRad, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // High gloss glass style overlay
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = ${strokeWidth};
        ctx.stroke();

        // Inner core nucleolus highlight
        ctx.beginPath();
        ctx.arc(p.x - finalRad * 0.22, p.y - finalRad * 0.22, finalRad * 0.28, 0, Math.PI*2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.fill();

        ctx.restore();
      }

      // Constellation joints linking overlay
      for(let i = 0; i < nodes.length; i++) {
        for(let j = i + 1; j < nodes.length; j++) {
          const p1 = nodes[i];
          const p2 = nodes[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = strokeCol;
            ctx.lineWidth = (1.0 - dist / 160) * ${strokeWidth * 0.75};
            ctx.globalAlpha = (1.0 - dist / 160) * 0.35;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      requestAnimationFrame(draw);
    }
    draw();
  })();
</script>`;

      navigator.clipboard.writeText(liveScript);
      setCopiedHtml(true);
      showToast('Standalone HTML widget code copied to clipboard!');
      setTimeout(() => setCopiedHtml(false), 2500);
    } catch (err) {
      console.error(err);
      showToast('Copying snippet failed.');
    }
  };

  // --- TRANS CELLULAR WEBM VIDEO EXPORTER ---
  const handleExportWebM = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      showToast('Error: Canvas coordinate viewport not initialized.');
      return;
    }

    if (recordingStatus === 'recording') {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    const originalWidth = containerRef.current?.clientWidth || canvas.width;
    const originalHeight = containerRef.current?.clientHeight || canvas.height;
    
    let targetHeight = parseInt(videoQuality);
    let scale = targetHeight / originalHeight;
    
    // Profile safety: constrain within 3840x2160 to prevent browser MediaRecorder downscaling to 480p
    let finalWidth = originalWidth * scale;
    let finalHeight = originalHeight * scale;
    if (finalWidth > 3840) {
      scale *= (3840 / finalWidth);
      finalWidth = originalWidth * scale;
      finalHeight = originalHeight * scale;
    }
    if (finalHeight > 2160) {
      scale *= (2160 / finalHeight);
      finalWidth = originalWidth * scale;
      finalHeight = originalHeight * scale;
    }

    // Set high-res recording references before grabbing stream
    isRecordingHighResRef.current = true;
    recordingScaleRef.current = scale;
    canvas.width = Math.floor(finalWidth);
    canvas.height = Math.floor(finalHeight);

    recordedBlobsRef.current = [];
    const stream = canvas.captureStream(30);

    // Compute high-bitrate targeting to prevent compression artifacts (720p: 6M, 1080p: 15M, 2K: 25M, 4K: 50M)
    let bBps = 15000000;
    if (videoQuality === '720') bBps = 6000000;
    else if (videoQuality === '1440') bBps = 25000000;
    else if (videoQuality === '2160') bBps = 50000000;

    let options = { 
      mimeType: 'video/webm;codecs=vp9,opus', 
      videoBitsPerSecond: bBps 
    };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { 
        mimeType: 'video/webm', 
        videoBitsPerSecond: bBps 
      };
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      setRecordingStatus('recording');
      showToast(`Recording: Capturing ${videoDuration}s organic cell tissue in ${videoQuality}p with ${Math.round(bBps / 1000000)}Mbps Bitrate...`);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedBlobsRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        isRecordingHighResRef.current = false;
        if (containerRef.current) {
          canvas.width = containerRef.current.clientWidth;
          canvas.height = containerRef.current.clientHeight;
        }
        setRecordingStatus('idle');
        const superBuffer = new Blob(recordedBlobsRef.current, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(superBuffer);
        const link = document.createElement('a');
        link.download = `organic-cells-loop-${videoQuality}p-${videoDuration}s-${Date.now()}.webm`;
        link.href = videoURL;
        link.click();
        showToast(`Success: Clean high-fidelity ${videoQuality}p WebM clip downloaded!`);
      };

      mediaRecorder.start();

      // Enforce dynamic clip duration limit
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, videoDuration * 1000);

    } catch (err) {
      console.warn(err);
      showToast('Media recording blocked in current frame sandbox.');
    }
  };

  const copyConfig = () => {
    const config = { 
      pointCount, 
      cellPadding, 
      pointPattern, 
      colorScheme, 
      renderMode, 
      speed, 
      magneticMode, 
      relaxation,
      cellGeometryType,
      handDrawn,
      wobbleAmplitude,
      cellScaleMultiplier,
      geomWarp,
      doubleStroke,
      hoverScale,
      hoverJiggle,
      mouseSmoothing,
      breatheIntensity
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    showToast('Design parameters copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={containerRef} className="flex-1 flex flex-col lg:flex-row gap-6 relative overflow-hidden bg-[#020202] rounded-xl border border-white/5">
      
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-white text-black px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3"
          >
            <Sparkles size={14} className="text-pink-500 animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas Viewport Stage */}
      <div className="flex-1 relative min-h-115 lg:min-h-0 bg-[#000] rounded-xl overflow-hidden border border-white/10 group shadow-2xl">
        <canvas 
          ref={canvasRef} 
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { mouseRef.current = { x: -2000, y: -2000 }; setHoveredIndex(null); }}
          className="absolute inset-0 w-full h-full cursor-none" 
        />
        
        {/* Dynamic Canvas HUD bar */}
        <div className="absolute inset-x-0 bottom-0 p-8 pointer-events-none bg-linear-to-t from-black/80 via-black/20 to-transparent animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] font-mono">Organic Cell Workspace</span>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAnimate(!isAnimate)}
              className="pointer-events-auto px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] font-bold tracking-widest flex items-center gap-2.5 transition-colors backdrop-blur-md"
            >
              <RefreshCw size={11} className={isAnimate ? 'animate-spin' : ''} />
              {isAnimate ? 'SYSTEM LIVE' : 'FROZEN STATE'}
            </motion.button>
          </div>
        </div>

        {/* Liquid floating visual cursor glass lens */}
        <div 
           className="fixed pointer-events-none z-[100] w-14 h-14 border border-white/30 rounded-full flex items-center justify-center mix-blend-difference opacity-0 transition-opacity duration-300 hidden lg:flex"
           id="cell-cursor"
           style={{ transform: 'translate(-50%, -50%)' }}
        >
          <motion.div 
            animate={{ scale: hoveredIndex !== null ? 1.6 : 1, rotate: hoveredIndex !== null ? 45 : 0 }}
            className="w-2 h-2 bg-white rounded-sm" 
          />
        </div>
      </div>

      {/* Interactive Control Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[450px] shrink-0 flex flex-col bg-[#070707] border border-white/10 rounded-xl overflow-hidden shadow-3xl relative z-10"
          >
            {/* Control Panel Tab Hub */}
            <div className="flex p-2 bg-black/90 border-b border-white/10 h-16 items-center">
               {(['geometry', 'style', 'motion', 'export'] as const).map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all relative h-full cursor-pointer ${activeTab === tab ? 'text-yellow-400' : 'text-white/30 hover:text-white/60'}`}
                 >
                   <motion.div animate={{ y: activeTab === tab ? -1 : 0 }}>
                     {tab === 'geometry' && <Shapes size={16} />}
                     {tab === 'style' && <Palette size={16} />}
                     {tab === 'motion' && <Wind size={16} />}
                     {tab === 'export' && <Camera size={16} />}
                   </motion.div>
                   <span className="text-[8px] font-bold uppercase tracking-[0.25em] font-mono">{tab}</span>
                   {activeTab === tab && (
                     <motion.div 
                        layoutId="active-tab-indicator"
                        className="absolute bottom-0 w-8 h-0.5 bg-yellow-400 rounded-full" 
                     />
                   )}
                 </button>
               ))}
            </div>

            {/* Global Animation Controller Status */}
            <div className="flex items-center justify-between px-8 py-4 bg-white/[0.02] border-b border-white/5 font-mono">
              <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Simulation Engine</span>
              <div className="flex items-center gap-3.5">
                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider ${isAnimate ? 'text-[#a3e635] bg-[#a3e635]/15 border border-[#a3e635]/20' : 'text-[#f87171] bg-[#f87171]/15 border border-[#f87171]/20'}`}>
                  {isAnimate ? 'ACTIVE / RUNNING' : 'PAUSED / FROZEN'}
                </span>
                <button 
                  onClick={() => setIsAnimate(!isAnimate)} 
                  className={`w-11 h-6 rounded-full relative transition-all duration-300 cursor-pointer flex items-center px-0.5 ${isAnimate ? 'bg-yellow-400' : 'bg-white/10'}`}
                  aria-label="Toggle Animation"
                >
                  <div 
                    className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform duration-300 transform ${isAnimate ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-10 scrollbar-none max-h-[calc(100vh-220px)]">
              
              {/* --- GEOMETRY TAB --- */}
              {activeTab === 'geometry' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                   
                   {/* Point Layout presets */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2"><Shapes size={12} className="text-yellow-400" /><h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 font-mono">Structure Layout</h3></div>
                      <div className="grid grid-cols-4 gap-1.5 font-mono">
                         {(['random', 'grid', 'spiral', 'cluster'] as const).map(p => (
                           <button 
                              key={p} onClick={() => setPointPattern(p)} 
                              className={`py-3 rounded-lg border text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${pointPattern === p ? 'bg-yellow-400/20 border-yellow-400 text-white font-black' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
                           >
                              {p}
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Geometry Core Generators */}
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 font-mono">Cell Math Generator</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                         {[
                           { id: 'voronoi', label: 'Voronoi Blocks' },
                           { id: 'shards', label: 'Cracked Shards' },
                           { id: 'metaballs', label: 'Clay Balls' },
                           { id: 'constellation', label: 'Joint Mesh' },
                           { id: 'fluid-teardrop', label: 'Fluid Teardrop' }
                         ].map(geo => (
                           <button 
                              key={geo.id} 
                              onClick={() => {
                                setCellGeometryType(geo.id as any);
                                if (geo.id === 'voronoi') {
                                  setCellRoundness(0.85);
                                  setCellPadding(10);
                                  setShowJoints(false);
                                } else if (geo.id === 'shards') {
                                  setCellRoundness(0.05);
                                  setCellPadding(12);
                                  setShowJoints(false);
                                } else if (geo.id === 'metaballs') {
                                  setCellRoundness(1.0);
                                  setCellPadding(6);
                                  setShowJoints(false);
                                } else if (geo.id === 'constellation') {
                                  setCellRoundness(0.15);
                                  setCellPadding(16);
                                  setShowJoints(true);
                                } else if (geo.id === 'fluid-teardrop') {
                                  setCellRoundness(1.0);
                                  setCellPadding(8);
                                  setShowJoints(false);
                                }
                              }} 
                              className={`py-3 rounded-lg border text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${cellGeometryType === geo.id ? 'bg-indigo-500/25 border-indigo-400 text-white font-black' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
                           >
                              {geo.label}
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Sketched Hand-draw loops customizer */}
                   <div className="space-y-4 bg-white/[0.02] p-5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold uppercase text-white/60 tracking-wider font-mono">Wobbly Sketch stroke</span>
                         <button 
                           onClick={() => setHandDrawn(!handDrawn)} 
                           className={`w-11 h-5 rounded-full relative transition-all cursor-pointer flex items-center px-0.5 ${handDrawn ? 'bg-yellow-400' : 'bg-white/10'}`}
                         >
                           <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 transform ${handDrawn ? 'translate-x-6' : 'translate-x-0'}`} />
                         </button>
                      </div>
                      
                      {handDrawn && (
                        <div className="pt-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="space-y-3">
                            <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Wobble Amplitude</span><span className="text-yellow-400">{wobbleAmplitude}px</span></div>
                            <input type="range" min={0.5} max={12} step={0.1} value={wobbleAmplitude} onChange={(e) => setWobbleAmplitude(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Wobble Wavelength</span><span className="text-yellow-400">{wobbleFrequency}px</span></div>
                            <input type="range" min={5} max={40} step={1} value={wobbleFrequency} onChange={(e) => setWobbleFrequency(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                          </div>
                        </div>
                      )}
                   </div>
                   
                   {/* Advanced Sliders */}
                   <div className="space-y-5 bg-white/5 p-6 rounded-xl border border-white/5 shadow-inner">
                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Cell Density</span><span className="text-yellow-400">{pointCount} units</span></div>
                        <input type="range" min={4} max={180} step={2} value={pointCount} onChange={(e) => setPointCount(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Relaxation (Voronoi Smoothness)</span><span className="text-yellow-400">{relaxation} iter.</span></div>
                        <input type="range" min={0} max={10} step={1} value={relaxation} onChange={(e) => setRelaxation(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Cell Gaps / Spacing</span><span className="text-yellow-400">{cellPadding}px</span></div>
                        <input type="range" min={0} max={38} step={1} value={cellPadding} onChange={(e) => setCellPadding(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      {/* User Requested: Advanced Math Geometry controls */}
                      <div className="space-y-3 pt-2 border-t border-white/5">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Global Sizing Volume</span><span className="text-yellow-400">{(cellScaleMultiplier * 100).toFixed(0)}%</span></div>
                        <input type="range" min={0.3} max={2.2} step={0.05} value={cellScaleMultiplier} onChange={(e) => setCellScaleMultiplier(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Warp Swirl Factor</span><span className="text-yellow-400">{(geomWarp * 100).toFixed(0)}%</span></div>
                        <input type="range" min={0} max={3.0} step={0.1} value={geomWarp} onChange={(e) => setGeomWarp(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Entropy Gaps Coefficient</span><span className="text-yellow-400">{(chaos * 100).toFixed(0)}%</span></div>
                        <input type="range" min={0} max={2.5} step={0.01} value={chaos} onChange={(e) => setChaos(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Curvature Smoothness</span><span className="text-yellow-400">{(cellRoundness * 100).toFixed(0)}%</span></div>
                        <input type="range" min={0} max={2} step={0.01} value={cellRoundness} onChange={(e) => setCellRoundness(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>
                   </div>
                </div>
              )}

              {/* --- STYLE TAB --- */}
              {activeTab === 'style' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                   
                   {/* Dream Interactive Presets (Derived directly from uploaded inspiration screenshots) */}
                   <div className="space-y-4 bg-linear-to-r from-yellow-400/10 via-indigo-500/10 to-transparent p-5 rounded-2xl border border-yellow-400/20 ring-1 ring-yellow-400/5">
                     <div className="flex items-center gap-2 font-mono">
                       <Sparkles size={14} className="text-yellow-400 animate-spin" />
                       <span className="text-[10px] font-bold uppercase text-white tracking-widest">Inspiration Presets</span>
                     </div>
                     <p className="text-[9px] text-white/50 leading-relaxed font-mono uppercase tracking-wide">
                       Click a preset to instantly load the exact layout and color palette of your design screenshots!
                     </p>
                     
                     <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                       <button 
                         onClick={() => {
                           setPointPattern('grid');
                           setChaos(0.06);
                           setPointCount(55);
                           setCellGeometryType('voronoi');
                           setRenderMode('topographic');
                           setContourLevels(7);
                           setCellPadding(1);
                           setCellRoundness(0.1);
                           setDoubleStroke(true);
                           setBgTexture(true);
                           setHandDrawn(true);
                           setWobbleAmplitude(3);
                           setWobbleFrequency(16);
                           setGeomWarp(1.2); 
                           setUseCustomPalette(true);
                           setCustomBgColor('#f4f3ef');
                           setCustomStrokeColor('#1e322d');
                           setCustomPalette(['#faf9f5', '#faf9f5', '#f5f4ef', '#faf9f5']);
                           setIsAnimate(true);
                           setSpeed(0.25);
                           setSpringStrength(0.01);
                           setShowLabels(false);
                           showToast('Loaded: Paper Sculpture (Image 1)');
                         }}
                         className="p-3 rounded-lg border bg-white/5 border-white/5 hover:bg-white/10 text-white/70 font-bold transition-all text-left flex flex-col justify-between h-20"
                       >
                         <span className="text-yellow-400">01. RIBBED WAVES</span>
                         <span className="text-[8px] text-white/30 uppercase font-normal font-sans">Image 1: Paper Sculpture</span>
                       </button>

                       <button 
                         onClick={() => {
                           setPointPattern('spiral');
                           setChaos(0.65);
                           setPointCount(25);
                           setCellGeometryType('fluid-teardrop');
                           setRenderMode('topographic');
                           setContourLevels(4);
                           setCellPadding(6);
                           setCellScaleMultiplier(1.85);
                           setHandDrawn(true);
                           setWobbleAmplitude(6.5);
                           setWobbleFrequency(10);
                           setGeomWarp(0);
                           setDoubleStroke(false);
                           setUseCustomPalette(true);
                           setCustomBgColor('#eceae2'); 
                           setCustomStrokeColor('#0f1118'); 
                           setCustomPalette(['#0f1118', '#1b1d28', '#2b2e3c', '#404454']);
                           setIsAnimate(true);
                           setSpeed(0.5);
                           setBreatheIntensity(0.85);
                           setShowLabels(false);
                           showToast('Loaded: Zen Brushstrokes (Image 2)');
                         }}
                         className="p-3 rounded-lg border bg-white/5 border-white/5 hover:bg-white/10 text-white/70 font-bold transition-all text-left flex flex-col justify-between h-20"
                       >
                         <span className="text-indigo-400">02. ZEN INK</span>
                         <span className="text-[8px] text-white/30 uppercase font-normal font-sans">Image 2: Sumi-e Brush</span>
                       </button>

                       <button 
                         onClick={() => {
                           setPointPattern('cluster');
                           setChaos(0.9);
                           setPointCount(14);
                           setCellGeometryType('metaballs');
                           setRenderMode('3D-clay');
                           setShadowDepth(25); 
                           setCellPadding(0);
                           setCellScaleMultiplier(1.8);
                           setHandDrawn(false); 
                           setDoubleStroke(false);
                           setUseCustomPalette(true);
                           setCustomBgColor('#d5d7db'); 
                           setCustomStrokeColor('#7bccc4'); 
                           setCustomPalette(['#7bccc4', '#a8e6cf', '#4db6ac', '#81c784']); 
                           setIsAnimate(true);
                           setSpeed(0.15); 
                           setSpringStrength(0.005);
                           setShowLabels(false);
                           showToast('Loaded: 3D Clay Blobs (Image 3)');
                         }}
                         className="p-3 rounded-lg border bg-white/5 border-white/5 hover:bg-white/10 text-white/70 font-bold transition-all text-left flex flex-col justify-between h-20"
                       >
                         <span className="text-green-400">03. 3D CLAY BLOBS</span>
                         <span className="text-[8px] text-white/30 uppercase font-normal font-sans">Image 3: Matte Shading</span>
                       </button>

                       <button 
                         onClick={() => {
                           setPointPattern('random');
                           setPointCount(18);
                           setCellGeometryType('metaballs');
                           setRenderMode('glow');
                           setGlowIntensity(1.2);
                           setShadowDepth(15);
                           setCellScaleMultiplier(1.4);
                           setCellPadding(4);
                           setHandDrawn(false);
                           setDoubleStroke(false);
                           setShowJoints(true);
                           setJointSize(6);
                           setUseCustomPalette(true);
                           setCustomBgColor('#0a0d16'); 
                           setCustomStrokeColor('#00e5ff'); 
                           setCustomPalette(['rgba(0,102,204,0.7)', 'rgba(0,153,255,0.5)', 'rgba(0,229,255,0.3)']);
                           setIsAnimate(true);
                           setSpeed(0.35);
                           setShowLabels(false);
                           showToast('Loaded: Cyber Connections (Image 4)');
                         }}
                         className="p-3 rounded-lg border bg-white/5 border-white/5 hover:bg-white/10 text-white/70 font-bold transition-all text-left flex flex-col justify-between h-20"
                       >
                         <span className="text-cyan-400">04. TECH CONNECT</span>
                         <span className="text-[8px] text-white/30 uppercase font-normal font-sans">Image 4: Bio-Tech Nodes</span>
                       </button>
                     </div>

                     <button 
                       onClick={() => {
                         setPointPattern('spiral');
                         setRelaxation(6); 
                         setChaos(0.0);
                         setPointCount(24);
                         setCellGeometryType('voronoi');
                         setRenderMode('filled');
                         setCellPadding(12); 
                         setCellRoundness(1.35); 
                         setHandDrawn(false);
                         setDoubleStroke(false);
                         setUseCustomPalette(true);
                         setCustomBgColor('#000000'); 
                         setCustomStrokeColor('#000000');
                         setCustomPalette(['#faf8f5', '#faf8f5', '#f7f5f0', '#fdfcf7']); 
                         setShowLabels(true); 
                         setIsAnimate(false); 
                         showToast('Loaded: Category Bubbles (Image 5 & 6)');
                       }}
                       className="w-full p-3.5 rounded-lg border bg-linear-to-r from-yellow-400/25 to-yellow-500/5 border-yellow-400/30 hover:from-yellow-400/35 hover:to-yellow-500/10 text-white font-bold transition-all text-left flex flex-col justify-between h-20"
                     >
                       <span className="text-yellow-400">05. GENRE CATEGORY PILLOW MAP</span>
                       <span className="text-[8px] text-white/30 uppercase font-normal font-sans">Images 5 & 6: Thick Black Channels + Nested Text Labels</span>
                     </button>
                   </div>
                   
                   {/* Colors Preset Selector */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between font-mono">
                         <span className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Spectrum Schemes</span>
                         <button 
                           onClick={() => setUseCustomPalette(!useCustomPalette)}
                           className={`text-[8px] px-2.5 py-1 rounded border uppercase tracking-widest transition-colors cursor-pointer ${useCustomPalette ? 'bg-yellow-400 border-yellow-400 text-black font-black' : 'bg-transparent border-white/10 text-white/40 hover:text-white/70'}`}
                         >
                           {useCustomPalette ? 'Custom Mode Live' : 'Use Presets'}
                         </button>
                      </div>

                      {!useCustomPalette ? (
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                           {[
                             { id: 'natural-sage', label: 'Natural Sage' },
                             { id: 'terracotta', label: 'Terracotta' },
                             { id: 'cyber-lava', label: 'Cyber Lava' },
                             { id: 'retro-pop', label: 'Retro Pop' },
                             { id: 'minimal', label: 'Minimal Slate' },
                             { id: 'gold', label: 'Rich Gold' },
                             { id: 'glass', label: 'Glass Frozen' },
                             { id: 'blueprint', label: 'Blueprint Blue' },
                             { id: 'monochrome', label: 'Monochrome' },
                             { id: 'vibrant', label: 'Vibrant Acid' }
                           ].map(s => (
                             <button 
                               key={s.id} 
                               onClick={() => setColorScheme(s.id as any)} 
                               className={`p-4 rounded-xl border text-[9px] transition-all font-bold text-left cursor-pointer ${colorScheme === s.id ? 'bg-yellow-400/10 border-yellow-400 text-white shadow-xl' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
                             >
                               {s.label}
                             </button>
                           ))}
                        </div>
                      ) : (
                        <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl animate-in zoom-in-95 duration-200">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-mono text-white/30 block uppercase font-bold">Paper/Bg Color</span>
                              <input type="color" value={customBgColor} onChange={(e) => setCustomBgColor(e.target.value)} className="w-full h-8 rounded-lg bg-transparent cursor-pointer border border-white/10" />
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-mono text-white/30 block uppercase font-bold">Inner Stroke</span>
                              <input type="color" value={customStrokeColor} onChange={(e) => setCustomStrokeColor(e.target.value)} className="w-full h-8 rounded-lg bg-transparent cursor-pointer border border-white/10" />
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-mono text-white/30 block uppercase font-bold">Accent Highlight</span>
                              <input type="color" value={customAccentColor} onChange={(e) => setCustomAccentColor(e.target.value)} className="w-full h-8 rounded-lg bg-transparent cursor-pointer border border-white/10" />
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <span className="text-[8px] font-mono text-white/30 block uppercase font-bold">Cell Segment Colors (Palette)</span>
                            <div className="flex gap-1.5">
                              {customPalette.map((col, idx) => (
                                <input 
                                  key={idx} type="color" value={col} 
                                  onChange={(e) => {
                                    const next = [...customPalette];
                                    next[idx] = e.target.value;
                                    setCustomPalette(next);
                                  }} 
                                  className="flex-1 h-8 rounded-md bg-transparent cursor-pointer border border-white/10" 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                   </div>
                   
                   {/* Render Protocol selection */}
                   <div className="space-y-3 font-mono">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Render System</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                         {[
                           { id: 'topographic', label: 'Topography' },
                           { id: '3D-clay', label: '3D Clay' },
                           { id: 'filled', label: 'Solid Solid' },
                           { id: 'outline', label: 'Fine Outlines' },
                           { id: 'glow', label: 'Neon Cracks' },
                           { id: 'wireframe', label: 'Joint Mesh' }
                         ].map(m => (
                           <button 
                             key={m.id} 
                             onClick={() => setRenderMode(m.id as any)} 
                             className={`w-full py-2.5 rounded-lg text-[8px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${renderMode === m.id ? 'bg-white/15 border-white/20 text-white font-black shadow-lg shadow-white/5' : 'bg-transparent border-white/5 text-white/30 hover:border-white/10'}`}
                           >
                             {m.label}
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Styling slider modifiers */}
                   <div className="space-y-5 bg-white/5 p-6 rounded-xl border border-white/5">
                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Stroke Caliber/Width</span><span className="text-yellow-400">{strokeWidth.toFixed(1)}pt</span></div>
                        <input type="range" min={0.2} max={18} step={0.1} value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Nesting Depth (Eco Rings)</span><span className="text-yellow-400">{contourLevels} layers</span></div>
                        <input type="range" min={1} max={16} step={1} value={contourLevels} onChange={(e) => setContourLevels(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      <div className="space-y-3">
                         <span className="text-[9px] font-mono font-bold uppercase text-white/30 block">Topo Level Style</span>
                         <div className="grid grid-cols-4 gap-1.5 font-mono">
                            {(['solid', 'alternating', 'dashed', 'dotted'] as const).map(style => (
                              <button
                                key={style} onClick={() => setContourStyle(style)}
                                className={`py-2 text-[8px] font-bold uppercase rounded border transition-all cursor-pointer ${contourStyle === style ? 'bg-yellow-400/20 border-yellow-400 text-white' : 'bg-transparent border-white/5 text-white/30 hover:border-white/15'}`}
                              >
                                {style}
                              </button>
                            ))}
                         </div>
                      </div>

                      {/* User requested: Advanced styling features */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="space-y-0.5">
                           <span className="text-[10px] font-bold text-white/60 block uppercase font-mono">Double Stroke Contours</span>
                           <span className="text-[8px] text-white/30 block">Renders retro sticker outline surrounding cells</span>
                        </div>
                        <button onClick={() => setDoubleStroke(!doubleStroke)} className={`w-11 h-5 rounded-full relative transition-all cursor-pointer flex items-center px-0.5 ${doubleStroke ? 'bg-yellow-400' : 'bg-white/10'}`}><div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 transform ${doubleStroke ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="space-y-0.5">
                           <span className="text-[10px] font-bold text-white/60 block uppercase font-mono">Show Node Joints</span>
                           <span className="text-[8px] text-white/30 block">Renders joints on polygon points</span>
                        </div>
                        <button onClick={() => setShowJoints(!showJoints)} className={`w-11 h-5 rounded-full relative transition-all cursor-pointer flex items-center px-0.5 ${showJoints ? 'bg-yellow-400' : 'bg-white/10'}`}><div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 transform ${showJoints ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                      </div>

                      {showJoints && (
                        <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                          <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Joint Dot Size</span><span className="text-yellow-400">{jointSize}px</span></div>
                          <input type="range" min={1} max={10} step={0.5} value={jointSize} onChange={(e) => setJointSize(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                         <span className="text-[10px] font-bold uppercase text-white/60 font-mono">Granular Paper Texture</span>
                         <button onClick={() => setBgTexture(!bgTexture)} className={`w-11 h-5 rounded-full relative transition-all cursor-pointer flex items-center px-0.5 ${bgTexture ? 'bg-yellow-400' : 'bg-white/10'}`}><div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 transform ${bgTexture ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                      </div>

                      {/* Customized Bubble Chart Text Labels (Inspired by Image 5 & 6) */}
                      <div className="border-t border-white/5 pt-5 space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                               <span className="text-[10px] font-bold text-white/60 block uppercase font-mono">Show Text Labels</span>
                               <span className="text-[8px] text-white/30 block">Floating tags inside each cell (Image 5 & 6)</span>
                            </div>
                            <button onClick={() => setShowLabels(!showLabels)} className={`w-11 h-5 rounded-full relative transition-all cursor-pointer flex items-center px-0.5 ${showLabels ? 'bg-yellow-400' : 'bg-white/10'}`}><div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 transform ${showLabels ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                         </div>

                         {showLabels && (
                           <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-200">
                             <div className="space-y-2">
                               <span className="text-[9px] uppercase font-mono font-bold text-white/40 block">Comma-separated Terms List</span>
                               <textarea 
                                 rows={3}
                                 value={customLabels}
                                 onChange={(e) => setCustomLabels(e.target.value)}
                                 className="w-full text-[10px] font-mono p-3 rounded-lg bg-black/60 border border-white/10 text-white/80 focus:border-yellow-400 transition-colors focus:outline-none resize-none"
                               />
                             </div>
                             
                             <div className="space-y-2">
                               <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Label Font Size</span><span className="text-yellow-400">{labelFontSize}px</span></div>
                               <input type="range" min={6} max={28} step={1} value={labelFontSize} onChange={(e) => setLabelFontSize(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                             </div>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              )}

              {/* --- MOTION TAB (With requested hover controllers!) --- */}
              {activeTab === 'motion' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                   
                   {/* Dynamic Animation on/off parameter switch toggle */}
                   <div className="flex items-center justify-between p-4.5 bg-white/[0.03] border border-white/5 rounded-xl">
                     <div className="flex flex-col gap-0.5 font-mono">
                       <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">Simulation Flow</span>
                       <span className="text-[8px] text-white/30 uppercase tracking-[0.05em]">Toggle cellular physics math processing</span>
                     </div>
                     <button 
                       onClick={() => setIsAnimate(!isAnimate)} 
                       className={`w-11 h-5 rounded-full relative transition-all cursor-pointer flex items-center px-0.5 ${isAnimate ? 'bg-yellow-400' : 'bg-white/10'}`}
                     >
                       <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 transform ${isAnimate ? 'translate-x-6' : 'translate-x-0'}`} />
                     </button>
                   </div>
                   
                   {/* Interactive Forces preset selector */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 font-mono"><Magnet size={12} className="text-yellow-400" /><h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Mouse Interaction Mode</h3></div>
                      <div className="grid grid-cols-5 gap-1 font-mono">
                         {(['none', 'repel', 'attract', 'wiggle', 'shatter'] as const).map(m => (
                           <button 
                              key={m} onClick={() => setMagneticMode(m)} 
                              className={`py-3.5 rounded-lg border text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${magneticMode === m ? 'bg-yellow-400/20 border-yellow-400 text-white font-black' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
                           >
                              {m}
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Custom Mouse Hover & Viscous Controls */}
                   <div className="space-y-5 bg-white/5 p-6 rounded-xl border border-white/5">
                      <span className="text-[10px] font-mono font-bold uppercase text-yellow-400 block tracking-wider">Hover Interactivity Controllers</span>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Viscous Mouse lag (Dampening)</span><span className="text-yellow-400">{(mouseSmoothing * 100).toFixed(0)}%</span></div>
                        <input type="range" min={0.01} max={1.00} step={0.01} value={mouseSmoothing} onChange={(e) => setMouseSmoothing(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Hover Expansion Scale</span><span className="text-yellow-400">{hoverScale.toFixed(2)}x</span></div>
                        <input type="range" min={0.9} max={1.9} step={0.05} value={hoverScale} onChange={(e) => setHoverScale(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Hover Micro-Jiggle Force</span><span className="text-yellow-400">{hoverJiggle.toFixed(1)}pt</span></div>
                        <input type="range" min={0} max={12} step={0.2} value={hoverJiggle} onChange={(e) => setHoverJiggle(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      <div className="space-y-3 pt-3 border-t border-white/5">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Breathing Loop Pulsing</span><span className="text-yellow-400">{(breatheIntensity * 100).toFixed(0)}%</span></div>
                        <input type="range" min={0} max={1.5} step={0.02} value={breatheIntensity} onChange={(e) => setBreatheIntensity(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>
                   </div>

                    {/* --- PREMIUM 3D HOVER SCULPTING ENGINE (Image-Inspired Masterpiece Panel) --- */}
                    <div className="space-y-6 bg-white/5 p-6 rounded-xl border border-yellow-400/20 shadow-lg shadow-black/40">
                       <div className="flex items-center gap-2 font-mono">
                         <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                         <span className="text-[10px] font-bold uppercase text-yellow-400 tracking-[0.15em]">3D Hover Sculpting Engine</span>
                       </div>
                       <p className="text-[8px] text-white/50 uppercase tracking-[0.03em] font-sans leading-relaxed">
                         Customize interactive 3D geometry behaviors. Styles are calibrated to recreate organic clay, hardware wooden blocks, glossy beads, and neon basalt valleys.
                       </p>

                       {/* 3D Preset Selection */}
                       <div className="space-y-3">
                          <label className="text-[9px] font-mono uppercase font-bold text-white/40 block">01. Premium 3D Hover Preset</label>
                          <div className="grid grid-cols-1 gap-1.5">
                             {[
                               { id: 'wooden-peg', label: 'HARDWOOD VORONOI PANEL', desc: 'Warm oak blocks with physical concentric grains & metal pegs' },
                               { id: 'clay-blob', label: 'ORGANIC CLAY CUSHION', desc: 'Soft volumetric clay blobs with dual-layer smooth light blend' },
                               { id: 'glossy-sphere', label: 'METABALL GLOSSY PEARLS', desc: 'Stunning glossy white beads with crystal high-contrast reflection spots' },
                               { id: 'extruded-grid', label: '3D GRID BLOCK EXTRUSION', desc: 'Solid cubic extrusion Connectors with volumetric stereoscopic side facets' },
                               { id: 'glow-valley', label: 'NEON BASALT VALLEYS', desc: 'Deep graphite slate stone tiles with radiant neon glowing cracks under them' }
                             ].map(preset => (
                               <button
                                 key={preset.id}
                                 onClick={() => setHoverPresetType(preset.id as any)}
                                 className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${hoverPresetType === preset.id ? 'bg-yellow-400/20 border-yellow-400 text-white font-bold' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}
                               >
                                 <span className="text-[9px] font-mono font-bold tracking-wider">{preset.label}</span>
                                 <span className="text-[7.5px] font-sans text-white/30 font-normal leading-tight">{preset.desc}</span>
                               </button>
                             ))}
                          </div>
                       </div>

                       {/* 3D Height Extrusion Slider (Output) */}
                       <div className="space-y-3">
                         <div className="flex justify-between text-[9px] uppercase font-mono font-bold">
                           <span className="text-white/40">02. 3D Bevel Extrusion Depth</span>
                           <span className="text-yellow-400">{hover3DDepth}px</span>
                         </div>
                         <input 
                           type="range" min={0} max={40} step={1} 
                           value={hover3DDepth} onChange={(e) => setHover3DDepth(Number(e.target.value))} 
                           className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" 
                         />
                         <span className="text-[7.5px] text-white/35 block uppercase tracking-wider font-mono">Controls the extrusion depth of side-wall projection</span>
                       </div>

                       {/* Perspective Angular Tilt Slider (Tilt Output) */}
                       <div className="space-y-3">
                         <div className="flex justify-between text-[9px] uppercase font-mono font-bold">
                           <span className="text-white/40">03. Perspective Angular Tilt</span>
                           <span className="text-yellow-400">{hoverTiltStrength}pt</span>
                         </div>
                         <input 
                           type="range" min={0} max={15} step={1} 
                           value={hoverTiltStrength} onChange={(e) => setHoverTiltStrength(Number(e.target.value))} 
                           className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" 
                         />
                         <span className="text-[7.5px] text-white/35 block uppercase tracking-wider font-mono">Simulates spatial slope orientation from mouse cursor</span>
                       </div>

                       {/* Central Peg hardware peg Size (Center Pin) */}
                       <div className="space-y-3 pt-4 border-t border-white/5">
                         <div className="flex justify-between text-[9px] uppercase font-mono font-bold">
                           <span className="text-white/40">04. Centroid Pin/Rivet Bolt Size</span>
                           <span className="text-yellow-400">{hoverPinSize}px</span>
                         </div>
                         <input 
                           type="range" min={0} max={14} step={0.5} 
                           value={hoverPinSize} onChange={(e) => setHoverPinSize(Number(e.target.value))} 
                           className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" 
                         />
                         <span className="text-[7.5px] text-white/35 block uppercase tracking-wider font-mono">Pins hardware center rivets, essential for Hardwood Panels (Image 1)</span>
                       </div>

                       {/* Hardware Metal Bolt Style Selector */}
                       {hoverPinSize > 0 && (
                         <div className="space-y-3">
                           <label className="text-[9px] font-mono uppercase font-bold text-white/40 block">05. Hardware Bolt Material</label>
                           <div className="grid grid-cols-5 gap-1 font-mono">
                             {(['silver', 'gold', 'brass', 'bronze', 'charcoal'] as const).map(metal => (
                               <button
                                 key={metal}
                                 onClick={() => setHoverPinColor(metal)}
                                 className={`py-1.5 rounded-md border text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${hoverPinColor === metal ? 'bg-white/20 border-white text-white font-black' : 'bg-white/5 border-white/5 text-white/45 hover:bg-white/10'}`}
                               >
                                 {metal}
                               </button>
                             ))}
                           </div>
                         </div>
                       )}

                       {/* Under-cell Neon Glow Spread (Gradient bloom color) */}
                       <div className="space-y-3 pt-4 border-t border-white/5">
                         <div className="flex justify-between text-[9px] uppercase font-mono font-bold">
                           <span className="text-white/40">06. Under-Cell Underglow Spread</span>
                           <span className="text-yellow-400">{hoverNeonGlow}px</span>
                         </div>
                         <input 
                           type="range" min={0} max={50} step={2} 
                           value={hoverNeonGlow} onChange={(e) => setHoverNeonGlow(Number(e.target.value))} 
                           className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" 
                         />
                         <span className="text-[7.5px] text-white/35 block uppercase tracking-wider font-mono">Projects neon lighting beneath cell gaps (Images 5 & 6)</span>
                       </div>

                       {/* Contour Border Width Expand (Border) */}
                       <div className="space-y-3">
                         <div className="flex justify-between text-[9px] uppercase font-mono font-bold">
                           <span className="text-white/40">07. Hover Silhouette Outline Border</span>
                           <span className="text-yellow-400">+{hoverBorderExtend}px</span>
                         </div>
                         <input 
                           type="range" min={0} max={12} step={1} 
                           value={hoverBorderExtend} onChange={(e) => setHoverBorderExtend(Number(e.target.value))} 
                           className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" 
                         />
                         <span className="text-[7.5px] text-white/35 block uppercase tracking-wider font-mono">Expands active outer white/black outline stroke</span>
                       </div>

                       {/* Sinking vs rising option (Input direction) */}
                       <div className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded-lg font-mono">
                         <div className="flex flex-col gap-0.5">
                           <span className="text-[9px] font-bold uppercase text-white/40">Inverse concave depression</span>
                           <span className="text-[7.5px] text-white/35 uppercase tracking-[0.05em]">Tiles SINK INWARD instead of RISING UP (Concave Image 4)</span>
                         </div>
                         <button 
                           onClick={() => setHoverIsSinking(!hoverIsSinking)} 
                           className={`w-11 h-5 rounded-full relative transition-all cursor-pointer flex items-center px-0.5 ${hoverIsSinking ? 'bg-yellow-400' : 'bg-white/10'}`}
                         >
                           <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 transform ${hoverIsSinking ? 'translate-x-6' : 'translate-x-0'}`} />
                         </button>
                       </div>
                    </div>

                   {/* Standard Motion Physics Parameters */}
                   <div className="space-y-5 bg-white/5 p-6 rounded-xl border border-white/5">
                      <span className="text-[10px] font-mono font-bold uppercase text-white/30 block">Workspace Physics Constants</span>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Interactive Wave Horizon (Radius)</span><span className="text-yellow-400">{influenceRadius}px</span></div>
                        <input type="range" min={60} max={500} step={5} value={influenceRadius} onChange={(e) => setInfluenceRadius(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Dynamic Force (Strength)</span><span className="text-yellow-400">{magneticStrength}pt</span></div>
                        <input type="range" min={0.5} max={22} step={0.5} value={magneticStrength} onChange={(e) => setMagneticStrength(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Snap Back Stiffness (Springiness)</span><span className="text-yellow-400">{(springStrength * 1000).toFixed(0)} Index</span></div>
                        <input type="range" min={0.005} max={0.12} step={0.001} value={springStrength} onChange={(e) => setSpringStrength(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      <div className="space-y-3 border-t border-white/5 pt-4">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Slow Flow (Speed)</span><span className="text-yellow-400">{speed.toFixed(1)}x</span></div>
                        <input type="range" min={0} max={3.5} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Oscillation Resonance</span><span className="text-yellow-400">{(oscillation * 100).toFixed(0)}%</span></div>
                        <input type="range" min={0} max={1.5} step={0.01} value={oscillation} onChange={(e) => setOscillation(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] uppercase font-mono font-bold"><span className="text-white/30">Wind Drift</span><span className="text-yellow-400">{drift.toFixed(3)}</span></div>
                        <input type="range" min={0} max={0.08} step={0.001} value={drift} onChange={(e) => setDrift(Number(e.target.value))} className="w-full h-1 appearance-none bg-black/60 rounded-full accent-yellow-400 cursor-pointer" />
                      </div>
                   </div>
                </div>
              )}

              {/* --- EXPORT TAB --- */}
              {activeTab === 'export' && (
                <div className="space-y-8 animate-in inline-fade-in duration-500">
                   <div className="bg-linear-to-br from-yellow-400/20 via-indigo-500/10 to-transparent p-8 rounded-2xl border border-yellow-400/20 space-y-8 text-center ring-1 ring-yellow-400/10 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                      <div className="space-y-4 relative">
                        <motion.div 
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(250,204,21,0.35)] active:scale-95 transition-transform cursor-pointer"
                          onClick={handleCopyHTMLCode}
                        >
                          <FileCode size={28} className="text-black" />
                        </motion.div>
                        <div className="space-y-2">
                           <h4 className="text-lg font-bold text-white tracking-tight">Save & Export</h4>
                           <p className="text-[9px] text-white/40 font-mono leading-relaxed px-4 uppercase tracking-[0.1em]">Generate highly-interactive standalone HTML containers or capture WebM dynamic videos.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3.5 relative z-10">
                         <motion.button 
                           whileHover={{ y: -3, scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={handleExportPNG} 
                           className="col-span-2 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold uppercase text-[9px] tracking-[0.18em] rounded-xl transition-all shadow-xl shadow-yellow-400/5 flex flex-col items-center justify-center gap-2 cursor-pointer"
                         >
                            <Camera size={14} />PNG SNAPSHOT (.PNG)
                         </motion.button>
                         
                         <div className="col-span-1 flex flex-col gap-1.5 mb-1 text-left w-full">
                            <label className="text-[9px] font-bold text-white/50 uppercase tracking-[0.15em] font-mono">WebM Quality</label>
                            <select
                              value={videoQuality}
                              onChange={(e) => setVideoQuality(e.target.value as any)}
                              className="w-full bg-black/80 border border-white/20 rounded-xl py-2 px-3 text-[10px] text-zinc-300 font-mono focus:outline-none focus:border-yellow-400 cursor-pointer"
                            >
                              <option value="720" className="bg-neutral-950 text-white">720p (HD)</option>
                              <option value="1080" className="bg-neutral-950 text-white">1080p (FHD)</option>
                              <option value="1440" className="bg-neutral-950 text-white">1440p (2K)</option>
                              <option value="2160" className="bg-neutral-950 text-white">2160p (4K)</option>
                            </select>
                         </div>

                         <div className="col-span-1 flex flex-col gap-1.5 mb-1 text-left w-full">
                            <label className="text-[9px] font-bold text-white/50 uppercase tracking-[0.15em] font-mono">Duration</label>
                            <select
                              value={videoDuration}
                              onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                              className="w-full bg-black/80 border border-white/20 rounded-xl py-2 px-3 text-[10px] text-zinc-300 font-mono focus:outline-none focus:border-yellow-400 cursor-pointer"
                            >
                              <option value="3" className="bg-neutral-950 text-white">3 seconds</option>
                              <option value="10" className="bg-neutral-950 text-white">10 seconds</option>
                              <option value="20" className="bg-neutral-950 text-white">20 seconds</option>
                              <option value="30" className="bg-neutral-950 text-white">30 seconds</option>
                              <option value="60" className="bg-neutral-950 text-white">1 min</option>
                              <option value="120" className="bg-neutral-950 text-white">2 mins</option>
                              <option value="180" className="bg-neutral-950 text-white">3 mins</option>
                              <option value="240" className="bg-neutral-950 text-white">4 mins</option>
                              <option value="300" className="bg-neutral-950 text-white">5 mins</option>
                            </select>
                         </div>

                         <motion.button 
                           whileHover={{ y: -3, scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={handleCopyHTMLCode} 
                           className={`py-4 font-bold uppercase text-[9px] tracking-[0.18em] rounded-xl transition-all shadow-xl flex flex-col items-center justify-center gap-2 cursor-pointer border ${
                             copiedHtml 
                               ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' 
                               : 'bg-white/5 hover:bg-white/10 text-white border-white/10 shadow-md'
                           }`}
                         >
                            <FileCode size={14} className={copiedHtml ? 'animate-bounce' : ''} />
                            {copiedHtml ? 'HTML COPIED!' : 'COPY HTML CODE'}
                         </motion.button>
                         <motion.button 
                           whileHover={{ y: -3, scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={handleExportWebM} 
                           className={`py-4 font-bold uppercase text-[9px] tracking-[0.18em] rounded-xl transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-md cursor-pointer border ${
                             recordingStatus === 'recording'
                               ? 'bg-rose-600/40 border-rose-500 text-rose-300 animate-pulse'
                               : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                           }`}
                         >
                            <Activity size={14} className={recordingStatus === 'recording' ? 'animate-spin' : 'text-indigo-400'} />
                            {recordingStatus === 'recording' ? 'RECORDING...' : 'WEBM VIDEO (.WEBM)'}
                         </motion.button>
                      </div>

                      <motion.button 
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={copyConfig} 
                        className={`w-full py-4 rounded-xl border font-bold uppercase text-[9px] tracking-[0.25em] flex items-center justify-center gap-3 transition-all cursor-pointer ${copied ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'}`}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'DESIGN DATA COPIED' : 'COPY CONFIG CODE'}
                      </motion.button>
                   </div>
                </div>
              )}
            </div>

            {/* Footer reset option */}
            <div className="p-6 border-t border-white/15 bg-black/95 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => {
                     setPointCount(45);
                     setCellPadding(10);
                     setCellRoundness(0.85);
                     setHandDrawn(true);
                     setWobbleAmplitude(4);
                     setWobbleFrequency(14);
                     setRenderMode('topographic');
                     setColorScheme('natural-sage');
                     setCellGeometryType('voronoi');
                     setUseCustomPalette(false);
                     setHoverScale(1.25);
                     setHoverJiggle(3.5);
                     setMouseSmoothing(0.12);
                     setCellScaleMultiplier(1.0);
                     setGeomWarp(0);
                     setDoubleStroke(false);
                     setBreatheIntensity(0.2);
                     showToast('Reverted parameters to dream baseline!');
                   }}
                   className="text-[9px] text-[#ffeb3b]/80 border border-[#ffeb3b]/20 bg-[#ffeb3b]/5 hover:bg-[#ffeb3b]/10 px-4 py-1.5 rounded-full font-mono tracking-wider font-bold transition-all uppercase cursor-pointer animate-pulse"
                 >
                   Reset Dream Parameters
                 </button>
               </div>
               <div className="flex items-center gap-4">
                  <Minimize2 
                    size={14} className="cursor-pointer text-white/45 hover:text-white transition-colors" 
                    onClick={() => setShowSettings(false)}
                  />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSettings && (
        <motion.button 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowSettings(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-yellow-400 hover:bg-yellow-300 text-black rounded-full flex items-center justify-center shadow-3xl transition-colors z-50 cursor-pointer"
        >
          <Box size={22} className="animate-pulse" />
        </motion.button>
      )}
    </div>
  );
}
