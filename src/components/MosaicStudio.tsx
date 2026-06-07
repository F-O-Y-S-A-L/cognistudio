/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Download, 
  RotateCcw, 
  Grid, 
  Layers, 
  Sliders, 
  Info, 
  Image as ImageIcon, 
  Sparkles, 
  Sun, 
  SlidersHorizontal,
  Flame,
  User,
  Check,
  RefreshCw,
  Palette,
  ZoomIn,
  ZoomOut,
  Move,
  Play,
  Pause,
  Activity,
  Copy,
  Code
} from 'lucide-react';

type DotStyle = 
  | 'bead' 
  | 'ring' 
  | 'halftone' 
  | 'lego' 
  | 'target' 
  | 'cross' 
  | 'hex'
  // Selected dot pixel shape styles (More features)
  | 'star' 
  | 'triangle' 
  | 'diamond' 
  | 'heart' 
  | 'spiral' 
  | 'wave' 
  | 'burst';

type PaletteType = 'original' | 'hama' | 'gameboy' | 'cyberpunk' | 'thermal' | 'slate' | 'sunset';
type BgStyle = 'black' | 'white' | 'transparent' | 'blurred';
type AnimationType = 'pulse' | 'wave' | 'colorCycle' | 'drift' | 'orbit' | 'matrix' | 'explodingStars' | 'rippleBounce' | 'shimmerGlow' | 'dnaSpiral';

const CONSTANTS = {
  DEFAULT_DOT_SIZE: 12,
  DEFAULT_SPACING: 2,
  DEFAULT_BRIGHTNESS: 0,
  DEFAULT_CONTRAST: 12,
  DEFAULT_COLOR_INTENSITY: 1.15,
  DEFAULT_GLOW: 0,
};

// Custom color palette tables
const HAMA_BEAD_COLORS: [number, number, number][] = [
  [255, 255, 255], [0, 0, 0], [222, 54, 54], [250, 203, 72],
  [61, 163, 85], [46, 117, 217], [227, 134, 187], [148, 88, 222],
  [217, 108, 48], [112, 70, 46], [166, 219, 105], [105, 219, 213],
  [255, 179, 179], [255, 255, 179], [179, 255, 179], [179, 179, 255]
];

const GAMEBOY_COLORS: [number, number, number][] = [
  [15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]
];

// Returns the nearest RGB color from table to input r,g,b
function findNearestColor(r: number, g: number, b: number, palette: [number, number, number][]): [number, number, number] {
  let minDistance = Infinity;
  let nearest: [number, number, number] = [r, g, b];
  for (const color of palette) {
    const dist = Math.sqrt(
      Math.pow(r - color[0], 2) +
      Math.pow(g - color[1], 2) +
      Math.pow(b - color[2], 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearest = color;
    }
  }
  return nearest;
}

// Math helper to check if point falls within the morphed rounded/circle border boundary
function isInsideRoundedRect(cx: number, cy: number, w: number, h: number, r: number): boolean {
  if (r <= 0) return true;
  // If coordinates fall entirely outside the bounding rectangle, reject
  if (cx < 0 || cx > w || cy < 0 || cy > h) return false;
  
  // Corners analysis
  if (cx < r && cy < r) {
    return Math.pow(cx - r, 2) + Math.pow(cy - r, 2) <= r * r;
  }
  if (cx > w - r && cy < r) {
    return Math.pow(cx - (w - r), 2) + Math.pow(cy - r, 2) <= r * r;
  }
  if (cx < r && cy > h - r) {
    return Math.pow(cx - r, 2) + Math.pow(cy - (h - r), 2) <= r * r;
  }
  if (cx > w - r && cy > h - r) {
    return Math.pow(cx - (w - r), 2) + Math.pow(cy - (h - r), 2) <= r * r;
  }
  return true;
}

// Math helper to execute standard Gray-axis RGB rotations (High-speed hue shifter)
function rotateColor(r: number, g: number, b: number, angle: number): [number, number, number] {
  const cosA = Math.cos((angle * Math.PI) / 180);
  const sinA = Math.sin((angle * Math.PI) / 180);
  const rOut = r * (0.299 + 0.701 * cosA + 0.168 * sinA) +
               g * (0.587 - 0.587 * cosA + 0.330 * sinA) +
               b * (0.114 - 0.114 * cosA - 0.497 * sinA);
  const gOut = r * (0.299 - 0.299 * cosA - 0.328 * sinA) +
               g * (0.587 + 0.413 * cosA + 0.035 * sinA) +
               b * (0.114 - 0.114 * cosA + 0.292 * sinA);
  const bOut = r * (0.299 - 0.3 * cosA + 1.25 * sinA) +
               g * (0.587 - 0.588 * cosA - 1.05 * sinA) +
               b * (0.114 + 0.886 * cosA - 0.203 * sinA);
  return [
    Math.max(0, Math.min(255, rOut)),
    Math.max(0, Math.min(255, gOut)),
    Math.max(0, Math.min(255, bOut))
  ];
}

// Star graphics drawer
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

export default function MosaicStudio() {
  // Configurable Image Settings
  const [dotSize, setDotSize] = useState<number>(CONSTANTS.DEFAULT_DOT_SIZE);
  const [spacing, setSpacing] = useState<number>(CONSTANTS.DEFAULT_SPACING);
  const [brightness, setBrightness] = useState<number>(CONSTANTS.DEFAULT_BRIGHTNESS);
  const [contrast, setContrast] = useState<number>(CONSTANTS.DEFAULT_CONTRAST);
  const [colorIntensity, setColorIntensity] = useState<number>(CONSTANTS.DEFAULT_COLOR_INTENSITY);
  
  // Style and Filters
  const [dotStyle, setDotStyle] = useState<DotStyle>('bead');
  const [palette, setPalette] = useState<PaletteType>('original');
  const [bgStyle, setBgStyle] = useState<BgStyle>('transparent');
  const [sizeVariesWithBrightness, setSizeVariesWithBrightness] = useState<boolean>(true);
  const [toneTarget, setToneTarget] = useState<'light' | 'dark'>('light');
  const [gridAngle, setGridAngle] = useState<number>(0);
  const [glowStrength, setGlowStrength] = useState<number>(0);

  // NEW FEATURES: Continuous Morphing Boundary & Canvas Shape Mask
  // 0% yields perfect box/rectangle, 100% yields perfect matching circle/elipsoid!
  const [boundaryMorph, setBoundaryMorph] = useState<number>(0);

  const [radialDispersion, setRadialDispersion] = useState<number>(0);
  
  // NEW FEATURES: Real-time Interactive Zoom & Translate System
  const [imageZoom, setImageZoom] = useState<number>(1.0);
  const [imageRotate, setImageRotate] = useState<number>(0);
  const [imageOffsetX, setImageOffsetX] = useState<number>(0);
  const [imageOffsetY, setImageOffsetY] = useState<number>(0);

  // NEW FEATURES: Dynamic Custom Painting Overlay / Hue blending
  const [colorTintHex, setColorTintHex] = useState<string>('#4f46e5');
  const [colorTintStrength, setColorTintStrength] = useState<number>(0);

  // NEW FEATURES: Stunning Custom Animated Rendering engine
  const [isAnimated, setIsAnimated] = useState<boolean>(false);
  const [animationType, setAnimationType] = useState<AnimationType>('pulse');
  const [animationSpeed, setAnimationSpeed] = useState<number>(1.2);
  const [timeState, setTimeState] = useState<number>(0);

  // States for Video Recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // States
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Refs
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const sourceVideoRef = useRef<HTMLVideoElement | null>(null);

  // Default Image Seed on Mount
  useEffect(() => {
    generateProceduralDefault();
  }, []);

  // Frame Timer system for Animations hook
  useEffect(() => {
    let animId: number;
    if (isAnimated) {
      const tick = () => {
        setTimeState((prev) => prev + 0.04 * animationSpeed);
        animId = requestAnimationFrame(tick);
      };
      animId = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isAnimated, animationSpeed]);

  // Update canvas when state changes
  useEffect(() => {
    if ((imageLoaded && sourceImageRef.current) || (videoLoaded && sourceVideoRef.current)) {
      renderMosaic();
    }
  }, [
    imageSrc,
    videoSrc,
    imageLoaded,
    videoLoaded,
    dotSize,
    spacing,
    brightness,
    contrast,
    colorIntensity,
    dotStyle,
    palette,
    bgStyle,
    sizeVariesWithBrightness,
    toneTarget,
    gridAngle,
    glowStrength,
    
    // Dependencies of the new features
    boundaryMorph,
    radialDispersion,
    imageZoom,
    imageRotate,
    imageOffsetX,
    imageOffsetY,
    colorTintHex,
    colorTintStrength,
    isAnimated,
    animationType,
    timeState
  ]);

  // Dedicated Video Playback Loop & Stale-closure Guard
  const lastRenderRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    lastRenderRef.current = renderMosaic;
  });

  useEffect(() => {
    let animId: number;
    const tick = () => {
      // If video is loaded and playing, force re-render for every frame
      if (videoLoaded && sourceVideoRef.current && !sourceVideoRef.current.paused) {
        lastRenderRef.current?.();
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [videoLoaded]);

  // Generate a beautiful, vibrant procedural art sample when no image is uploaded
  const generateProceduralDefault = () => {
    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a rich digital sunset landscape with glowing abstract geometric faces/nodes
    const grad = ctx.createLinearGradient(0, 0, 640, 640);
    grad.addColorStop(0.0, '#0f0c1b');
    grad.addColorStop(0.3, '#301c5c');
    grad.addColorStop(0.6, '#a81c70');
    grad.addColorStop(0.8, '#f56215');
    grad.addColorStop(1.0, '#f2d53c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 640);

    // Draw glowing sun circle
    const sunGrad = ctx.createRadialGradient(320, 260, 5, 320, 260, 180);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.2, '#fff176');
    sunGrad.addColorStop(0.5, '#f57c00');
    sunGrad.addColorStop(1.0, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(320, 260, 180, 0, Math.PI * 2);
    ctx.fill();

    // Draw procedural grid pattern blocks with bright primary tones
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#26c6da';
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
       ctx.arc(320, 320, 70 + i * 55, 0.1, Math.PI * 1.5);
    }
    ctx.stroke();

    // Add colorful abstract vector curves
    ctx.fillStyle = '#1de9b6';
    ctx.beginPath();
    ctx.arc(200, 360, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#651fff';
    ctx.beginPath();
    ctx.arc(440, 420, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.arc(320, 480, 100, 0, Math.PI);
    ctx.fill();

    // Draw dynamic eye shape
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(320, 280, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0d47a1';
    ctx.beginPath();
    ctx.arc(320, 280, 15, 0, Math.PI * 2);
    ctx.fill();

    const url = canvas.toDataURL();
    setImageSrc(url);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      sourceImageRef.current = img;
      setImageLoaded(true);
      setIsProcessing(false);
    };
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Main Rendering Loop executing on changes
  const renderMosaic = () => {
    const img: CanvasImageSource | null = videoLoaded ? sourceVideoRef.current : sourceImageRef.current;
    const canvas = mainCanvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Robust dimension calculation for both Image and Video sources
    const vWidth = (img as HTMLVideoElement).videoWidth || (img as HTMLImageElement).width || 640;
    const vHeight = (img as HTMLVideoElement).videoHeight || (img as HTMLImageElement).height || 640;
    
    const targetWidth = 640;
    const rawRatio = vHeight / (vWidth || 1);
    const targetHeight = Math.max(120, Math.min(800, Math.floor(targetWidth * rawRatio)));

    const paddingX = radialDispersion > 0 ? radialDispersion * 3 : 0;
    const paddingY = radialDispersion > 0 ? radialDispersion * 3 : 0;

    canvas.width = targetWidth + paddingX * 2;
    canvas.height = targetHeight + paddingY * 2;

    const stepSize = Math.max(1, dotSize + spacing);
    const cols = Math.max(1, Math.ceil(targetWidth / stepSize));
    const rows = Math.max(1, Math.ceil(targetHeight / stepSize));

    // Offscreen Canvas for Downscaling sampling
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = cols;
    offscreenCanvas.height = rows;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (!offscreenCtx) {
      return;
    }

    offscreenCtx.imageSmoothingEnabled = true;

    // Apply interactive Zoom, Rotate and translation adjustments before downsample copying
    offscreenCtx.save();
    // Center point for transformations
    offscreenCtx.translate(cols / 2 + (imageOffsetX / 100) * cols, rows / 2 + (imageOffsetY / 100) * rows);
    offscreenCtx.rotate((imageRotate * Math.PI) / 180);
    offscreenCtx.scale(imageZoom, imageZoom);
    // Draw centered on transform axis
    offscreenCtx.drawImage(img, -cols / 2, -rows / 2, cols, rows);
    offscreenCtx.restore();

    const imgData = offscreenCtx.getImageData(0, 0, Math.floor(cols), Math.floor(rows));
    const { data } = imgData;

    // Draw background on output canvas (covering full padded size)
    if (bgStyle === 'black') {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgStyle === 'white') {
      ctx.fillStyle = '#fafffd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgStyle === 'transparent') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else if (bgStyle === 'blurred') {
      ctx.save();
      // Translate to draw blurred background in center
      ctx.translate(paddingX, paddingY);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      ctx.restore();
      ctx.fillStyle = 'rgba(5, 5, 5, 0.85)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Set up glow styling if enabled (using canvas shadow attributes)
    if (glowStrength > 0) {
      ctx.shadowBlur = glowStrength * 3;
    } else {
      ctx.shadowBlur = 0;
    }

    // Move drawing origin to the padded center for dots
    ctx.save();
    ctx.translate(paddingX, paddingY);

    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const morphRadiusInPixels = (Math.min(targetWidth, targetHeight) / 2) * (boundaryMorph / 100);

    // Parse Tint Hex code once
    let tintR = 79, tintG = 70, tintB = 229;
    if (colorTintStrength > 0 && /^#[0-9A-F]{6}$/i.test(colorTintHex)) {
      tintR = parseInt(colorTintHex.slice(1, 3), 16);
      tintG = parseInt(colorTintHex.slice(3, 5), 16);
      tintB = parseInt(colorTintHex.slice(5, 7), 16);
    }

    // Draw the dot/mosaic grid shapes
    for (let rIndex = 0; rIndex < rows; rIndex++) {
      for (let cIndex = 0; cIndex < cols; cIndex++) {
        // Compute Tile Anchor coordinates inside main viewport canvas
        const originalCx = cIndex * stepSize + stepSize / 2;
        const originalCy = rIndex * stepSize + stepSize / 2;
        
        let cx = originalCx;
        let cy = originalCy;

        // Edge Dispersion / Organic Scatter
        if (radialDispersion > 0) {
          const centerX = targetWidth / 2;
          const centerY = targetHeight / 2;
          const dx = originalCx - centerX;
          const dy = originalCy - centerY;
          
          // Using rectangle bounds to determine distance from center proportionally
          const boxDistX = Math.abs(dx) / centerX;
          const boxDistY = Math.abs(dy) / centerY;
          const normalizedDist = Math.max(boxDistX, boxDistY);
          
          // Only scatter dots near the edge boundaries
          const edgeFactor = Math.max(0, normalizedDist - 0.5) * 2.0; // 0 at 50% from center, 1.0 at edge
          
          if (edgeFactor > 0) {
            // Accelerate scattering at the edge
            const scatterIntensity = Math.pow(edgeFactor, 3) * radialDispersion * 4; 
            
            // Stable psuedo-random values based on grid position
            const seed = cIndex * 31337 + rIndex * 1337;
            const staticAngle = (seed * 11) % (Math.PI * 2);
            
            let animOffsetX = 0;
            let animOffsetY = 0;
            
            if (isAnimated) {
              const timeOffset = seed % (Math.PI * 2);
              // Floating organic animation around the scattered point
              animOffsetX = Math.sin(timeState * 3 + timeOffset) * scatterIntensity * 0.3;
              animOffsetY = Math.cos(timeState * 2.5 + timeOffset) * scatterIntensity * 0.3;
            }
            
            cx += Math.cos(staticAngle) * scatterIntensity + animOffsetX;
            cy += Math.sin(staticAngle) * scatterIntensity + animOffsetY;
          }
        }

        // NEW FEATURE: Boundary mask shape morphing. Smoothly cut out dots falling outside circular bounds.
        if (boundaryMorph > 0) {
          if (!isInsideRoundedRect(originalCx, originalCy, targetWidth, targetHeight, morphRadiusInPixels)) {
            continue;
          }
        }

        const i = (rIndex * cols + cIndex) * 4;
        let rVal = data[i];
        let gVal = data[i + 1];
        let bVal = data[i + 2];
        const aVal = data[i + 3] / 255;

        if (aVal < 0.15) continue; // Skip transparency

        // Adjust Brightness
        rVal = rVal + brightness;
        gVal = gVal + brightness;
        bVal = bVal + brightness;

        // Adjust Contrast
        rVal = contrastFactor * (rVal - 128) + 128;
        gVal = contrastFactor * (gVal - 128) + 128;
        bVal = contrastFactor * (bVal - 128) + 128;

        // Adjust Color Intensity (Saturation)
        const luma = 0.299 * rVal + 0.587 * gVal + 0.114 * bVal;
        rVal = luma + (rVal - luma) * colorIntensity;
        gVal = luma + (gVal - luma) * colorIntensity;
        bVal = luma + (bVal - luma) * colorIntensity;

        // NEW FEATURE: Painting color tint blending ("sei image e ami color add korte parbo")
        if (colorTintStrength > 0) {
          rVal = rVal * (1 - colorTintStrength) + tintR * colorTintStrength;
          gVal = gVal * (1 - colorTintStrength) + tintG * colorTintStrength;
          bVal = bVal * (1 - colorTintStrength) + tintB * colorTintStrength;
        }

        // Clamp values to valid values
        rVal = Math.max(0, Math.min(255, rVal));
        gVal = Math.max(0, Math.min(255, gVal));
        bVal = Math.max(0, Math.min(255, bVal));

        // NEW FEATURE: Animation: Hue Color cycle
        if (isAnimated && animationType === 'colorCycle') {
          const cycleAngle = (timeState * 40) % 360;
          [rVal, gVal, bVal] = rotateColor(rVal, gVal, bVal, cycleAngle);
        }

        // Apply Preset Color Palette Mapper (If any selected)
        if (palette === 'hama') {
          [rVal, gVal, bVal] = findNearestColor(rVal, gVal, bVal, HAMA_BEAD_COLORS);
        } else if (palette === 'gameboy') {
          [rVal, gVal, bVal] = findNearestColor(rVal, gVal, bVal, GAMEBOY_COLORS);
        } else if (palette === 'cyberpunk') {
          const br = (rVal + gVal + bVal) / 3;
          if (br < 80) {
            rVal = 20; gVal = 5; bVal = 50; // Midnight violet
          } else if (br < 160) {
            rVal = 245; gVal = 0; bVal = 135; // Hot magenta
          } else {
            rVal = 10; gVal = 250; bVal = 230; // Neon turquoise
          }
        } else if (palette === 'thermal') {
          const br = (rVal + gVal + bVal) / 3;
          if (br < 50) {
            rVal = 0; gVal = 0; bVal = 139; // Dark blue
          } else if (br < 100) {
            rVal = 148; gVal = 0; bVal = 211; // Violet
          } else if (br < 150) {
            rVal = 220; gVal = 20; bVal = 60; // Crimson red
          } else if (br < 200) {
            rVal = 255; gVal = 140; bVal = 0; // Dark orange
          } else {
            rVal = 255; gVal = 225; bVal = 50; // Flare yellow
          }
        } else if (palette === 'sunset') {
          const br = (rVal + gVal + bVal) / 3;
          if (br < 80) {
            rVal = 30; gVal = 10; bVal = 36;
          } else if (br < 170) {
            rVal = 220; gVal = 50; bVal = 90;
          } else {
            rVal = 255; gVal = 180; bVal = 30;
          }
        } else if (palette === 'slate') {
          const avg = 0.299 * rVal + 0.587 * gVal + 0.114 * bVal;
          rVal = avg; gVal = avg; bVal = avg;
        }

        const tileColor = `rgb(${Math.round(rVal)}, ${Math.round(gVal)}, ${Math.round(bVal)})`;
        const shadowColor = `rgba(${Math.round(rVal)}, ${Math.round(gVal)}, ${Math.round(bVal)}, 0.4)`;

        ctx.save();

        if (glowStrength > 0) {
          ctx.shadowColor = shadowColor;
        }

        // Apply grid angle rotation if tweaked
        if (gridAngle !== 0) {
          ctx.translate(cx, cy);
          ctx.rotate((gridAngle * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        }

        // NEW FEATURE: Animation drift & orbit (orbit mechanics)
        let renderCx = cx;
        let renderCy = cy;
        if (isAnimated) {
          if (animationType === 'drift') {
            renderCx += Math.sin(timeState * 1.5 + cy * 0.08) * (dotSize * 0.18);
            renderCy += Math.cos(timeState * 1.5 + cx * 0.08) * (dotSize * 0.18);
          } else if (animationType === 'orbit') {
            const dx = cx - targetWidth / 2;
            const dy = cy - targetHeight / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              const angle = Math.atan2(dy, dx) + 0.08 * Math.sin(timeState * 0.3 + dist * 0.005);
              renderCx = targetWidth / 2 + Math.cos(angle) * dist;
              renderCy = targetHeight / 2 + Math.sin(angle) * dist;
            }
          }
        }

        const cellBrightness = (rVal + gVal + bVal) / 3 / 255;
        const isToneMatch = toneTarget === 'light' ? cellBrightness : (1.0 - cellBrightness);
        
        // Base bright scale modifier
        let styleFactor = sizeVariesWithBrightness ? (0.2 + 0.8 * isToneMatch) : 1.0;

        // NEW FEATURE: Animations modifiers
        if (isAnimated) {
          if (animationType === 'pulse') {
            styleFactor *= (1.0 + 0.22 * Math.sin(timeState * 2.0 + (cx + cy) * 0.006));
          } else if (animationType === 'wave') {
            const centerDist = Math.sqrt(Math.pow(cx - targetWidth / 2, 2) + Math.pow(cy - targetHeight / 2, 2));
            styleFactor *= (0.55 + 0.45 * Math.sin((centerDist * 0.038) - timeState * 2.5));
          } else if (animationType === 'matrix') {
            styleFactor *= (0.5 + 0.5 * Math.max(0, Math.sin((rIndex * 0.4) - timeState * 2.0 + cIndex * 0.1)));
          } else if (animationType === 'explodingStars') {
            styleFactor *= (0.3 + 0.7 * Math.abs(Math.sin(timeState * 3 + (cx * cy) * 0.001)));
          } else if (animationType === 'rippleBounce') {
            const dist = Math.sqrt(Math.pow(cx - targetWidth / 2, 2) + Math.pow(cy - targetHeight / 2, 2));
            styleFactor *= (0.7 + 0.3 * Math.sin(timeState * 3.0 - dist * 0.05));
          } else if (animationType === 'shimmerGlow') {
            styleFactor *= (0.6 + 0.4 * Math.sin(timeState * 4.0 + (rIndex * 13 + cIndex * 37) % 100));
          } else if (animationType === 'dnaSpiral') {
            const angleVal = Math.atan2(cy - targetHeight / 2, cx - targetWidth / 2);
            styleFactor *= (0.55 + 0.45 * Math.sin(angleVal * 3.0 + timeState * 2.5));
          }
        }

        const activeRadius = (dotSize / 2) * styleFactor;

        // Choose and Render from extended custom shape catalog
        switch (dotStyle) {
          case 'bead': {
            ctx.strokeStyle = bgStyle === 'white' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            ctx.strokeRect(renderCx - dotSize / 2, renderCy - dotSize / 2, dotSize, dotSize);

            const radius = Math.max(1.5, activeRadius);
            ctx.fillStyle = tileColor;
            ctx.beginPath();
            ctx.arc(renderCx, renderCy, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.beginPath();
            ctx.arc(renderCx - radius * 0.35, renderCy - radius * 0.35, Math.max(0.5, radius * 0.25), 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(0,0,0,0.25)';
            ctx.lineWidth = radius * 0.15;
            ctx.beginPath();
            ctx.arc(renderCx, renderCy, radius * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            break;
          }

          case 'ring': {
            const outerR = Math.max(1.2, activeRadius);
            const lineW = Math.max(1.0, outerR * 0.35);
            ctx.strokeStyle = tileColor;
            ctx.lineWidth = lineW;
            ctx.beginPath();
            ctx.arc(renderCx, renderCy, outerR, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = tileColor;
            ctx.beginPath();
            ctx.arc(renderCx, renderCy, Math.max(0.8, outerR * 0.25), 0, Math.PI * 2);
            ctx.fill();
            break;
          }

          case 'halftone': {
            const radius = Math.max(0.5, activeRadius);
            ctx.fillStyle = tileColor;
            ctx.beginPath();
            ctx.arc(renderCx, renderCy, radius, 0, Math.PI * 2);
            ctx.fill();
            break;
          }

          case 'lego': {
            const side = dotSize - 1;
            ctx.fillStyle = tileColor;
            ctx.beginPath();
            ctx.rect(renderCx - side / 2, renderCy - side / 2, side, side);
            ctx.fill();

            ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
            ctx.lineWidth = 1;
            ctx.strokeRect(renderCx - side / 2, renderCy - side / 2, side, side);

            const pegR = side * 0.28;
            ctx.fillStyle = tileColor;
            ctx.beginPath();
            ctx.arc(renderCx, renderCy, pegR, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = Math.max(1, pegR * 0.25);
            ctx.beginPath();
            ctx.arc(renderCx, renderCy, pegR, Math.PI, Math.PI * 1.5);
            ctx.stroke();
            break;
          }

          case 'target': {
            const maxR = Math.max(1.2, activeRadius);
            ctx.strokeStyle = tileColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(renderCx, renderCy, maxR, 0, Math.PI * 2);
            ctx.stroke();

            if (maxR > 4) {
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(renderCx, renderCy, maxR * 0.6, 0, Math.PI * 2);
              ctx.stroke();
            }

            ctx.fillStyle = tileColor;
            ctx.beginPath();
            ctx.arc(renderCx, renderCy, Math.max(1.0, maxR * 0.28), 0, Math.PI * 2);
            ctx.fill();
            break;
          }

          case 'cross': {
            const w = dotSize * 0.75 * styleFactor;
            ctx.strokeStyle = tileColor;
            ctx.lineWidth = Math.max(1.2, dotSize * 0.14);
            ctx.beginPath();
            ctx.moveTo(renderCx - w / 2, renderCy - w / 2);
            ctx.lineTo(renderCx + w / 2, renderCy + w / 2);
            ctx.moveTo(renderCx + w / 2, renderCy - w / 2);
            ctx.lineTo(renderCx - w / 2, renderCy + w / 2);
            ctx.stroke();
            break;
          }

          case 'hex': {
            const radius = (dotSize / 2) * 1.15;
            ctx.fillStyle = tileColor;
            ctx.strokeStyle = bgStyle === 'white' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            for (let angleDir = 0; angleDir < 6; angleDir++) {
              const aDeg = (60 * angleDir * Math.PI) / 180;
              const hx = renderCx + radius * Math.cos(aDeg);
              const hy = renderCy + radius * Math.sin(aDeg);
              if (angleDir === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
          }

          // NEW EXCITING CUSTOM SHAPE FEATURES REQUIRED BY USER
          case 'star': {
            const outerR = Math.max(2.0, activeRadius * 1.2);
            const innerR = outerR * 0.42;
            ctx.fillStyle = tileColor;
            drawStar(ctx, renderCx, renderCy, 5, outerR, innerR);
            break;
          }

          case 'triangle': {
            const baseSide = Math.max(2.0, activeRadius * 1.35);
            ctx.fillStyle = tileColor;
            ctx.beginPath();
            ctx.moveTo(renderCx, renderCy - baseSide);
            ctx.lineTo(renderCx - baseSide, renderCy + baseSide * 0.8);
            ctx.lineTo(renderCx + baseSide, renderCy + baseSide * 0.8);
            ctx.closePath();
            ctx.fill();
            break;
          }

          case 'diamond': {
            const dimR = Math.max(2.0, activeRadius * 1.2);
            ctx.fillStyle = tileColor;
            ctx.beginPath();
            ctx.moveTo(renderCx, renderCy - dimR);
            ctx.lineTo(renderCx + dimR, renderCy);
            ctx.lineTo(renderCx, renderCy + dimR);
            ctx.lineTo(renderCx - dimR, renderCy);
            ctx.closePath();
            ctx.fill();
            break;
          }

          case 'heart': {
            const heartR = Math.max(2.0, activeRadius * 1.1);
            ctx.fillStyle = tileColor;
            ctx.beginPath();
            const topY = renderCy - heartR * 0.35;
            ctx.moveTo(renderCx, topY + heartR * 0.3);
            ctx.bezierCurveTo(renderCx - heartR * 0.55, topY - heartR * 0.75, renderCx - heartR * 1.15, topY, renderCx, renderCy + heartR);
            ctx.bezierCurveTo(renderCx + heartR * 1.15, topY, renderCx + heartR * 0.55, topY - heartR * 0.75, renderCx, topY + heartR * 0.3);
            ctx.closePath();
            ctx.fill();
            break;
          }

          case 'spiral': {
            const spiR = Math.max(2.0, activeRadius * 1.1);
            ctx.strokeStyle = tileColor;
            ctx.lineWidth = Math.max(1.2, spiR * 0.22);
            ctx.beginPath();
            for (let theta = 0; theta < Math.PI * 4; theta += 0.15) {
              const currentR = (theta / (Math.PI * 4)) * spiR;
              const sx = renderCx + currentR * Math.cos(theta);
              const sy = renderCy + currentR * Math.sin(theta);
              if (theta === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
            break;
          }

          case 'wave': {
            const waveLen = Math.max(1.5, activeRadius * 1.15);
            ctx.strokeStyle = tileColor;
            ctx.lineWidth = Math.max(1.2, waveLen * 0.25);
            ctx.beginPath();
            for (let dx = -waveLen; dx <= waveLen; dx += 1.2) {
              const dy = Math.sin(dx * 0.45) * (waveLen * 0.45);
              if (dx === -waveLen) ctx.moveTo(renderCx + dx, renderCy + dy);
              else ctx.lineTo(renderCx + dx, renderCy + dy);
            }
            ctx.stroke();
            break;
          }

          case 'burst': {
            const burstR = Math.max(2.0, activeRadius * 1.2);
            ctx.strokeStyle = tileColor;
            ctx.lineWidth = Math.max(1.0, burstR * 0.18);
            const rays = 8;
            for (let r = 0; r < rays; r++) {
              const ang = (r * Math.PI * 2) / rays;
              ctx.beginPath();
              ctx.moveTo(renderCx, renderCy);
              ctx.lineTo(renderCx + burstR * Math.cos(ang), renderCy + burstR * Math.sin(ang));
              ctx.stroke();
            }
            break;
          }
        }

        ctx.restore(); // Restores from individual dot styling
      }
    }
    
    // Restore the padded center transformation
    ctx.restore();
  };

  // Image Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  // Video Upload Handlers
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedVideo(files[0]);
    }
  };

  const processSelectedVideo = (file: File) => {
    if (!file.type.startsWith('video/')) {
        triggerToast('Error: File must be a valid video format!');
        return;
    }
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.crossOrigin = 'anonymous';

    video.onloadeddata = () => {
        sourceVideoRef.current = video;
        setVideoSrc(url);
        setVideoLoaded(true);
        // If image was loaded, disable it? No, maybe just replace.
        setImageLoaded(false); 
        setImageSrc(null);
        triggerToast('Success: Loaded custom video source successfully!');
        renderMosaic(); // Re-render
    };
    video.play();
  };

  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerToast('Error: File must be a valid image format!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setImageSrc(url);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        sourceImageRef.current = img;
        setImageLoaded(true);
        triggerToast('Success: Loaded custom image source vector successfully!');
      };
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop implementation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files[0].type.startsWith('video/')) {
        processSelectedVideo(files[0]);
      } else {
        processSelectedFile(files[0]);
      }
    }
  };

  // Recording functionality
  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      recordedChunksRef.current = [];
      try {
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `mosaic-pix-dot-studio-${Date.now()}.webm`;
          link.click();
          triggerToast('Success: Exported mosaic video successfully!');
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        triggerToast('Recording started: Capturing mosaic output...');
      } catch (err) {
        triggerToast('Error: Recording not supported in this browser environment.');
      }
    }
  };

  // Core Actions
  const handleDownload = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    try {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.id = 'download-anchor-node';
      link.download = `mosaic-pixel-dot-${dotStyle}-${palette}.png`;
      link.href = url;
      link.click();
      triggerToast('Success: Downloaded mosaic artwork high-res PNG framing successfully!');
    } catch (e) {
      triggerToast('Security Limit: Since this is procedural or cross-origin canvas, please click download with your uploaded image local source.');
    }
  };

  const getMosaicSVGString = (forceAnimated = true) => {
    const img = videoLoaded ? sourceVideoRef.current : sourceImageRef.current;
    if (!img) return null;

    try {
      const vWidth = (img as HTMLVideoElement).videoWidth || (img as HTMLImageElement).width || 640;
      const vHeight = (img as HTMLVideoElement).videoHeight || (img as HTMLImageElement).height || 640;
      
      const targetWidth = 640;
      const rawRatio = vHeight / (vWidth || 1);
      const targetHeight = Math.max(120, Math.min(800, Math.floor(targetWidth * rawRatio)));
      
      const stepSize = Math.max(1, dotSize + spacing);
      const cols = Math.max(1, Math.ceil(targetWidth / stepSize));
      const rows = Math.max(1, Math.ceil(targetHeight / stepSize));

      const paddingX = radialDispersion > 0 ? radialDispersion * 3 : 0;
      const paddingY = radialDispersion > 0 ? radialDispersion * 3 : 0;
      
      const svgWidth = targetWidth + paddingX * 2;
      const svgHeight = targetHeight + paddingY * 2;

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = cols;
      offscreenCanvas.height = rows;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      if (!offscreenCtx) return;

      offscreenCtx.imageSmoothingEnabled = true;

      offscreenCtx.save();
      offscreenCtx.translate(cols / 2 + (imageOffsetX / 100) * cols, rows / 2 + (imageOffsetY / 100) * rows);
      offscreenCtx.rotate((imageRotate * Math.PI) / 180);
      offscreenCtx.scale(imageZoom, imageZoom);
      offscreenCtx.drawImage(img, -cols / 2, -rows / 2, cols, rows);
      offscreenCtx.restore();

      const imgData = offscreenCtx.getImageData(0, 0, Math.floor(cols), Math.floor(rows));
      const { data } = imgData;

      const animated = forceAnimated || isAnimated;

      let svgContent = `<?xml version="1.0" encoding="utf-8"?>\n`;
      svgContent += `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">\n`;

      if (glowStrength > 0) {
        svgContent += `  <defs>\n`;
        svgContent += `    <filter id="vector-glow" x="-50%" y="-50%" width="200%" height="200%">\n`;
        svgContent += `      <feGaussianBlur in="SourceGraphic" stdDeviation="${(glowStrength * 1.5).toFixed(1)}" result="blur" />\n`;
        svgContent += `      <feMerge>\n`;
        svgContent += `        <feMergeNode in="blur" />\n`;
        svgContent += `        <feMergeNode in="SourceGraphic" />\n`;
        svgContent += `      </feMerge>\n`;
        svgContent += `    </filter>\n`;
        svgContent += `  </defs>\n`;
      }

      if (animated) {
        svgContent += `  <style>\n`;
        svgContent += `    @keyframes pulse { 0%, 100% { transform: scale(0.8); } 50% { transform: scale(1.15); } }\n`;
        svgContent += `    @keyframes drift { 0%, 100% { transform: translate(0px, 0px); } 50% { transform: translate(3px, -3px); } }\n`;
        svgContent += `    @keyframes orbit { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\n`;
        svgContent += `    @keyframes shimmerGlow { 0%, 100% { opacity: 0.5; filter: brightness(0.8); } 50% { opacity: 1; filter: brightness(1.2); } }\n`;
        svgContent += `    @keyframes wave { 0%, 100% { transform: translateY(0px) scale(0.7); } 50% { transform: translateY(-3.5px) scale(1.12); } }\n`;
        svgContent += `    @keyframes rippleBounce { 0%, 100% { transform: scale(0.65); } 50% { transform: scale(1.15); } }\n`;
        svgContent += `    @keyframes matrix { 0%, 100% { opacity: 0.25; transform: scale(0.6); } 50% { opacity: 1.0; transform: scale(1.15); } }\n`;
        svgContent += `    @keyframes explodingStars { 0%, 100% { transform: scale(0.4) rotate(0deg); } 50% { transform: scale(1.15) rotate(180deg); } }\n`;
        svgContent += `    @keyframes dnaSpiral { 0%, 100% { transform: rotate(0deg) scale(0.8); } 50% { transform: rotate(180deg) scale(1.15); } }\n`;
        svgContent += `    @keyframes colorCycle { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }\n`;
        svgContent += `    .animated-dot { transform-box: fill-box; transform-origin: center; }\n`;
        svgContent += `  </style>\n`;
      }

      if (bgStyle === 'black') {
        svgContent += `  <rect width="${svgWidth}" height="${svgHeight}" fill="#050505" />\n`;
      } else if (bgStyle === 'white') {
        svgContent += `  <rect width="${svgWidth}" height="${svgHeight}" fill="#fafffd" />\n`;
      } else if (bgStyle === 'blurred') {
        svgContent += `  <rect width="${svgWidth}" height="${svgHeight}" fill="#0a0a0d" />\n`;
      }

      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      const morphRadiusInPixels = (Math.min(targetWidth, targetHeight) / 2) * (boundaryMorph / 100);

      let tintR = 79, tintG = 70, tintB = 229;
      if (colorTintStrength > 0 && /^#[0-9A-F]{6}$/i.test(colorTintHex)) {
        tintR = parseInt(colorTintHex.slice(1, 3), 16);
        tintG = parseInt(colorTintHex.slice(3, 5), 16);
        tintB = parseInt(colorTintHex.slice(5, 7), 16);
      }

      if (glowStrength > 0) {
        svgContent += `  <g filter="url(#vector-glow)">\n`;
      }

      for (let rIndex = 0; rIndex < rows; rIndex++) {
        for (let cIndex = 0; cIndex < cols; cIndex++) {
          const originalCx = cIndex * stepSize + stepSize / 2;
          const originalCy = rIndex * stepSize + stepSize / 2;

          let cx = originalCx;
          let cy = originalCy;

          // Edge Dispersion / Organic Scatter
          if (radialDispersion > 0) {
            const centerX = targetWidth / 2;
            const centerY = targetHeight / 2;
            const dx = originalCx - centerX;
            const dy = originalCy - centerY;
            
            const boxDistX = Math.abs(dx) / centerX;
            const boxDistY = Math.abs(dy) / centerY;
            const normalizedDist = Math.max(boxDistX, boxDistY);
            
            const edgeFactor = Math.max(0, normalizedDist - 0.5) * 2.0;
            
            if (edgeFactor > 0) {
              const scatterIntensity = Math.pow(edgeFactor, 3) * radialDispersion * 4; 
              const seed = cIndex * 31337 + rIndex * 1337;
              const staticAngle = (seed * 11) % (Math.PI * 2);
              
              let animOffsetX = 0;
              let animOffsetY = 0;
              
              if (animated) {
                const timeOffset = seed % (Math.PI * 2);
                animOffsetX = Math.sin(timeState * 3 + timeOffset) * scatterIntensity * 0.3;
                animOffsetY = Math.cos(timeState * 2.5 + timeOffset) * scatterIntensity * 0.3;
              }
              
              cx += Math.cos(staticAngle) * scatterIntensity + animOffsetX;
              cy += Math.sin(staticAngle) * scatterIntensity + animOffsetY;
            }
          }

          if (boundaryMorph > 0) {
            if (!isInsideRoundedRect(originalCx, originalCy, targetWidth, targetHeight, morphRadiusInPixels)) {
              continue;
            }
          }

          const i = (rIndex * cols + cIndex) * 4;
          let rVal = data[i];
          let gVal = data[i + 1];
          let bVal = data[i + 2];
          const aVal = data[i + 3] / 255;

          if (aVal < 0.15) continue;

          rVal = rVal + brightness;
          gVal = gVal + brightness;
          bVal = bVal + brightness;

          rVal = contrastFactor * (rVal - 128) + 128;
          gVal = contrastFactor * (gVal - 128) + 128;
          bVal = contrastFactor * (bVal - 128) + 128;

          const luma = 0.299 * rVal + 0.587 * gVal + 0.114 * bVal;
          rVal = luma + (rVal - luma) * colorIntensity;
          gVal = luma + (gVal - luma) * colorIntensity;
          bVal = luma + (bVal - luma) * colorIntensity;

          if (colorTintStrength > 0) {
            rVal = rVal * (1 - colorTintStrength) + tintR * colorTintStrength;
            gVal = gVal * (1 - colorTintStrength) + tintG * colorTintStrength;
            bVal = bVal * (1 - colorTintStrength) + tintB * colorTintStrength;
          }

          rVal = Math.max(0, Math.min(255, rVal));
          gVal = Math.max(0, Math.min(255, gVal));
          bVal = Math.max(0, Math.min(255, bVal));

          if (animated && animationType === 'colorCycle') {
            const cycleAngle = (timeState * 40) % 360;
            [rVal, gVal, bVal] = rotateColor(rVal, gVal, bVal, cycleAngle);
          }

          if (palette === 'hama') {
            [rVal, gVal, bVal] = findNearestColor(rVal, gVal, bVal, HAMA_BEAD_COLORS);
          } else if (palette === 'gameboy') {
            [rVal, gVal, bVal] = findNearestColor(rVal, gVal, bVal, GAMEBOY_COLORS);
          } else if (palette === 'cyberpunk') {
            const br = (rVal + gVal + bVal) / 3;
            if (br < 80) { rVal = 20; gVal = 5; bVal = 50; }
            else if (br < 160) { rVal = 245; gVal = 0; bVal = 135; }
            else { rVal = 10; gVal = 250; bVal = 230; }
          } else if (palette === 'thermal') {
            const br = (rVal + gVal + bVal) / 3;
            if (br < 50) { rVal = 0; gVal = 0; bVal = 139; }
            else if (br < 100) { rVal = 148; gVal = 0; bVal = 211; }
            else if (br < 150) { rVal = 220; gVal = 20; bVal = 60; }
            else if (br < 200) { rVal = 255; gVal = 140; bVal = 0; }
            else { rVal = 255; gVal = 225; bVal = 50; }
          } else if (palette === 'sunset') {
            const br = (rVal + gVal + bVal) / 3;
            if (br < 80) { rVal = 30; gVal = 10; bVal = 36; }
            else if (br < 170) { rVal = 220; gVal = 50; bVal = 90; }
            else { rVal = 255; gVal = 180; bVal = 30; }
          } else if (palette === 'slate') {
            const avg = 0.299 * rVal + 0.587 * gVal + 0.114 * bVal;
            rVal = avg; gVal = avg; bVal = avg;
          }

          const hexColor = "#" + ((1 << 24) + (Math.round(rVal) << 16) + (Math.round(gVal) << 8) + Math.round(bVal)).toString(16).slice(1);

          let renderCx = cx + paddingX;
          let renderCy = cy + paddingY;
          if (animated) {
            if (animationType === 'drift') {
              renderCx += Math.sin(timeState * 1.5 + cy * 0.08) * (dotSize * 0.18);
              renderCy += Math.cos(timeState * 1.5 + cx * 0.08) * (dotSize * 0.18);
            } else if (animationType === 'orbit') {
              const dx = cx - targetWidth / 2;
              const dy = cy - targetHeight / 2;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0) {
                const angle = Math.atan2(dy, dx) + 0.08 * Math.sin(timeState * 0.3 + dist * 0.005);
                renderCx = targetWidth / 2 + paddingX + Math.cos(angle) * dist;
                renderCy = targetHeight / 2 + paddingY + Math.sin(angle) * dist;
              }
            }
          }

          const cellBrightness = (rVal + gVal + bVal) / 3 / 255;
          const isToneMatch = toneTarget === 'light' ? cellBrightness : (1.0 - cellBrightness);
          let styleFactor = sizeVariesWithBrightness ? (0.2 + 0.8 * isToneMatch) : 1.0;

          if (animated) {
            if (animationType === 'pulse') {
              styleFactor *= (1.0 + 0.22 * Math.sin(timeState * 2.0 + (cx + cy) * 0.006));
            } else if (animationType === 'wave') {
              const centerDist = Math.sqrt(Math.pow(cx - targetWidth / 2, 2) + Math.pow(cy - targetHeight / 2, 2));
              styleFactor *= (0.55 + 0.45 * Math.sin((centerDist * 0.038) - timeState * 2.5));
            } else if (animationType === 'matrix') {
              styleFactor *= (0.5 + 0.5 * Math.max(0, Math.sin((rIndex * 0.4) - timeState * 2.0 + cIndex * 0.1)));
            } else if (animationType === 'explodingStars') {
              styleFactor *= (0.3 + 0.7 * Math.abs(Math.sin(timeState * 3 + (cx * cy) * 0.001)));
            } else if (animationType === 'rippleBounce') {
              const dist = Math.sqrt(Math.pow(cx - targetWidth / 2, 2) + Math.pow(cy - targetHeight / 2, 2));
              styleFactor *= (0.7 + 0.3 * Math.sin(timeState * 3.0 - dist * 0.05));
            } else if (animationType === 'shimmerGlow') {
              styleFactor *= (0.6 + 0.4 * Math.sin(timeState * 4.0 + (rIndex * 13 + cIndex * 37) % 100));
            } else if (animationType === 'dnaSpiral') {
              const angleVal = Math.atan2(cy - targetHeight / 2, cx - targetWidth / 2);
              styleFactor *= (0.55 + 0.45 * Math.sin(angleVal * 3.0 + timeState * 2.5));
            }
          }

          const activeRadius = (dotSize / 2) * styleFactor;
          
          let animAttr = "";
          if (animated) {
            const delay = ((rIndex * 0.04) + (cIndex * 0.02)).toFixed(2);
            let cssAnimName = animationType;
            let duration = (2.8 / animationSpeed).toFixed(2);
            
            if (animationType === 'wave') {
              duration = (2.2 / animationSpeed).toFixed(2);
            } else if (animationType === 'colorCycle') {
              cssAnimName = 'colorCycle';
              duration = (5.5 / animationSpeed).toFixed(2);
            } else if (animationType === 'orbit') {
              cssAnimName = 'orbit';
              duration = (10.0 / animationSpeed).toFixed(2);
            }
            
            animAttr = ` class="animated-dot" style="transform-origin: ${renderCx.toFixed(1)}px ${renderCy.toFixed(1)}px; animation: ${cssAnimName} ${duration}s ease-in-out ${delay}s infinite;"`;
          }

          const transformAttr = gridAngle !== 0 ? ` transform="rotate(${gridAngle} ${renderCx} ${renderCy})"` : "";

          svgContent += `  <g${transformAttr}${animAttr}>\n`;

          switch (dotStyle) {
            case 'bead': {
              const bgGridStrokeColor = bgStyle === 'white' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
              svgContent += `    <rect x="${(renderCx - dotSize / 2).toFixed(1)}" y="${(renderCy - dotSize / 2).toFixed(1)}" width="${dotSize}" height="${dotSize}" fill="none" stroke="${bgGridStrokeColor}" stroke-width="1" />\n`;
              const radius = Math.max(1.5, activeRadius);
              svgContent += `    <circle cx="${renderCx.toFixed(1)}" cy="${renderCy.toFixed(1)}" r="${radius.toFixed(1)}" fill="${hexColor}" />\n`;
              svgContent += `    <circle cx="${(renderCx - radius * 0.35).toFixed(1)}" cy="${(renderCy - radius * 0.35).toFixed(1)}" r="${Math.max(0.5, radius * 0.25).toFixed(1)}" fill="rgba(255,255,255,0.7)" />\n`;
              svgContent += `    <circle cx="${renderCx.toFixed(1)}" cy="${renderCy.toFixed(1)}" r="${(radius * 0.7).toFixed(1)}" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="${(radius * 0.15).toFixed(1)}" />\n`;
              break;
            }
            case 'halftone':
              svgContent += `    <circle cx="${renderCx.toFixed(1)}" cy="${renderCy.toFixed(1)}" r="${Math.max(0.5, activeRadius).toFixed(1)}" fill="${hexColor}" />\n`;
              break;
            case 'ring':
              svgContent += `    <circle cx="${renderCx.toFixed(1)}" cy="${renderCy.toFixed(1)}" r="${Math.max(1.2, activeRadius).toFixed(1)}" fill="none" stroke="${hexColor}" stroke-width="${Math.max(1.0, activeRadius * 0.35).toFixed(1)}" />\n`;
              svgContent += `    <circle cx="${renderCx.toFixed(1)}" cy="${renderCy.toFixed(1)}" r="${Math.max(0.8, activeRadius * 0.25).toFixed(1)}" fill="${hexColor}" />\n`;
              break;
            case 'lego': {
              const side = dotSize - 1;
              const pegR = side * 0.28;
              const highlightWidth = Math.max(1, pegR * 0.25);
              svgContent += `    <rect x="${(renderCx - side / 2).toFixed(1)}" y="${(renderCy - side / 2).toFixed(1)}" width="${side}" height="${side}" rx="1" fill="${hexColor}" stroke="rgba(0,0,0,0.28)" stroke-width="1.0" />\n`;
              svgContent += `    <circle cx="${renderCx.toFixed(1)}" cy="${renderCy.toFixed(1)}" r="${pegR.toFixed(1)}" fill="${hexColor}" />\n`;
              svgContent += `    <path d="M ${(renderCx - pegR).toFixed(1)} ${renderCy.toFixed(1)} A ${pegR.toFixed(1)} ${pegR.toFixed(1)} 0 0 1 ${renderCx.toFixed(1)} ${(renderCy - pegR).toFixed(1)}" fill="none" stroke="rgba(255,255,100,0.4)" stroke-width="${highlightWidth.toFixed(1)}" />\n`;
              break;
            }
            case 'target': {
              const maxR = Math.max(1.2, activeRadius);
              svgContent += `    <circle cx="${renderCx.toFixed(1)}" cy="${renderCy.toFixed(1)}" r="${maxR.toFixed(1)}" fill="none" stroke="${hexColor}" stroke-width="1.2" />\n`;
              if (maxR > 4) {
                svgContent += `    <circle cx="${renderCx.toFixed(1)}" cy="${renderCy.toFixed(1)}" r="${(maxR * 0.6).toFixed(1)}" fill="none" stroke="${hexColor}" stroke-width="1" />\n`;
              }
              svgContent += `    <circle cx="${renderCx.toFixed(1)}" cy="${renderCy.toFixed(1)}" r="${Math.max(1.0, maxR * 0.28).toFixed(1)}" fill="${hexColor}" />\n`;
              break;
            }
            case 'cross': {
              const tW = dotSize * 0.75 * styleFactor;
              const strokeW = Math.max(1.2, dotSize * 0.14);
              svgContent += `    <g stroke="${hexColor}" stroke-width="${strokeW.toFixed(1)}">\n`;
              svgContent += `      <line x1="${(renderCx - tW / 2).toFixed(1)}" y1="${(renderCy - tW / 2).toFixed(1)}" x2="${(renderCx + tW / 2).toFixed(1)}" y2="${(renderCy + tW / 2).toFixed(1)}" />\n`;
              svgContent += `      <line x1="${(renderCx + tW / 2).toFixed(1)}" y1="${(renderCy - tW / 2).toFixed(1)}" x2="${(renderCx - tW / 2).toFixed(1)}" y2="${(renderCy + tW / 2).toFixed(1)}" />\n`;
              svgContent += `    </g>\n`;
              break;
            }
            case 'hex': {
              const hR = (dotSize / 2) * 1.15;
              const hpts = [];
              for (let angleDir = 0; angleDir < 6; angleDir++) {
                const aDeg = (60 * angleDir * Math.PI) / 180;
                hpts.push(`${(renderCx + hR * Math.cos(aDeg)).toFixed(1)},${(renderCy + hR * Math.sin(aDeg)).toFixed(1)}`);
              }
              svgContent += `    <polygon points="${hpts.join(' ')}" fill="${hexColor}" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" />\n`;
              break;
            }
            case 'star': {
              const oR = Math.max(2.0, activeRadius * 1.2);
              const iR = oR * 0.42;
              let rotIdx = (Math.PI / 2) * 3;
              let stepIdx = Math.PI / 5;
              const pts = [];
              for (let ptIdx = 0; ptIdx < 10; ptIdx++) {
                const r = ptIdx % 2 === 0 ? oR : iR;
                pts.push(`${(renderCx + Math.cos(rotIdx) * r).toFixed(1)},${(renderCy + Math.sin(rotIdx) * r).toFixed(1)}`);
                rotIdx += stepIdx;
              }
              svgContent += `    <polygon points="${pts.join(' ')}" fill="${hexColor}" />\n`;
              break;
            }
            case 'triangle': {
              const tBase = Math.max(2.0, activeRadius * 1.35);
              const tPoints = `${renderCx.toFixed(1)},${(renderCy - tBase).toFixed(1)} ${(renderCx - tBase).toFixed(1)},${(renderCy + tBase * 0.8).toFixed(1)} ${(renderCx + tBase).toFixed(1)},${(renderCy + tBase * 0.8).toFixed(1)}`;
              svgContent += `    <polygon points="${tPoints}" fill="${hexColor}" />\n`;
              break;
            }
            case 'diamond': {
              const dR = Math.max(2.0, activeRadius * 1.2);
              const dPoints = `${renderCx.toFixed(1)},${(renderCy - dR).toFixed(1)} ${(renderCx + dR).toFixed(1)},${renderCy.toFixed(1)} ${renderCx.toFixed(1)},${(renderCy + dR).toFixed(1)} ${(renderCx - dR).toFixed(1)},${renderCy.toFixed(1)}`;
              svgContent += `    <polygon points="${dPoints}" fill="${hexColor}" />\n`;
              break;
            }
            case 'heart': {
              const hRadius = Math.max(2.0, activeRadius * 1.1);
              const topHeartY = renderCy - hRadius * 0.35;
              const dPath = `M ${renderCx.toFixed(1)} ${(topHeartY + hRadius * 0.3).toFixed(1)} ` +
                            `C ${(renderCx - hRadius * 0.55).toFixed(1)} ${(topHeartY - hRadius * 0.75).toFixed(1)} ` +
                            `${(renderCx - hRadius * 1.15).toFixed(1)} ${topHeartY.toFixed(1)} ` +
                            `${renderCx.toFixed(1)} ${(renderCy + hRadius).toFixed(1)} ` +
                            `C ${(renderCx + hRadius * 1.15).toFixed(1)} ${topHeartY.toFixed(1)} ` +
                            `${(renderCx + hRadius * 0.55).toFixed(1)} ${(topHeartY - hRadius * 0.75).toFixed(1)} ` +
                            `${renderCx.toFixed(1)} ${(topHeartY + hRadius * 0.3).toFixed(1)} Z`;
              svgContent += `    <path d="${dPath}" fill="${hexColor}" />\n`;
              break;
            }
            case 'spiral': {
              const spirR = Math.max(2.0, activeRadius * 1.1);
              const sLW = Math.max(1.2, spirR * 0.22);
              svgContent += `    <path d="`;
              for (let th = 0; th < Math.PI * 4; th += 0.3) {
                const cR = (th / (Math.PI * 4)) * spirR;
                const sx = renderCx + cR * Math.cos(th);
                const sy = renderCy + cR * Math.sin(th);
                svgContent += `${th === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)} `;
              }
              svgContent += `" fill="none" stroke="${hexColor}" stroke-width="${sLW.toFixed(1)}" />\n`;
              break;
            }
            case 'wave': {
              const waveLen = Math.max(1.5, activeRadius * 1.15);
              const wLW = Math.max(1.2, waveLen * 0.25);
              svgContent += `    <path d="`;
              for (let dx = -waveLen; dx <= waveLen; dx += 2.0) {
                const dy = Math.sin(dx * 0.45) * (waveLen * 0.45);
                svgContent += `${dx === -waveLen ? 'M' : 'L'} ${(renderCx + dx).toFixed(1)} ${(renderCy + dy).toFixed(1)} `;
              }
              svgContent += `" fill="none" stroke="${hexColor}" stroke-width="${wLW.toFixed(1)}" />\n`;
              break;
            }
            case 'burst': {
              const burstR = Math.max(2.0, activeRadius * 1.2);
              const bLW = Math.max(1.0, burstR * 0.18);
              const rays = 8;
              for (let ry = 0; ry < rays; ry++) {
                const ang = (ry * Math.PI * 2) / rays;
                svgContent += `    <line x1="${renderCx.toFixed(1)}" y1="${renderCy.toFixed(1)}" x2="${(renderCx + burstR * Math.cos(ang)).toFixed(1)}" y2="${(renderCy + burstR * Math.sin(ang)).toFixed(1)}" stroke="${hexColor}" stroke-width="${bLW.toFixed(1)}" />\n`;
              }
              break;
            }
          }

          svgContent += `  </g>\n`;
        }
      }

      if (glowStrength > 0) {
        svgContent += `  </g>\n`;
      }

      svgContent += `</svg>\n`;
      return svgContent;
    } catch (e) {
      triggerToast('Code extraction failed. Please try again with another setting.');
      return null;
    }
  };

  const handleDownloadSVG = () => {
    const svgContent = getMosaicSVGString();
    if (!svgContent) return;
    try {
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.id = 'download-svg-anchor-node';
      link.download = `mosaic-pixel-dot-${dotStyle}-${palette}.svg`;
      link.href = url;
      link.click();
      triggerToast('Success: Exported floating vector dots as SVG successfully!');
    } catch (e) {
      triggerToast('Export failed. Please try again.');
    }
  };

  const handleCopyHTMLCode = () => {
    const svgContent = getMosaicSVGString();
    if (!svgContent) {
      triggerToast('Upload or select an image to generate exportable HTML code.');
      return;
    }
    const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mosaic Halftone Artwork Specimen</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: ${bgStyle === 'white' ? '#fafffd' : '#050505'};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    svg {
      max-width: 100%;
      max-height: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;
    navigator.clipboard.writeText(htmlCode);
    triggerToast('Copied full standalone HTML code to clipboard!');
  };

  const handleCopyReactCode = () => {
    const svgContent = getMosaicSVGString();
    if (!svgContent) {
      triggerToast('Upload or select an image to generate exportable React code.');
      return;
    }
    const reactCode = `import React from 'react';

// --- MOSAIC HALFTONE PIX-DOT COMPONENT ---
// Rendered pixel-perfect vector shapes and custom inline stylesheet animation rules.
// Completely self-contained and ready to copy/paste into any React/Next.js layout!
export default function MosaicHalftone() {
  const svgMarkup = \`${svgContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

  return (
    <div 
      className="mosaic-halftone-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '${bgStyle === 'white' ? '#fafffd' : '#050505'}'
      }}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}`;
    navigator.clipboard.writeText(reactCode);
    triggerToast('Copied complete React component code to clipboard!');
  };

  const handleReset = () => {
    setDotSize(CONSTANTS.DEFAULT_DOT_SIZE);
    setSpacing(CONSTANTS.DEFAULT_SPACING);
    setBrightness(CONSTANTS.DEFAULT_BRIGHTNESS);
    setContrast(CONSTANTS.DEFAULT_CONTRAST);
    setColorIntensity(CONSTANTS.DEFAULT_COLOR_INTENSITY);
    setDotStyle('bead');
    setPalette('original');
    setBgStyle('transparent');
    setSizeVariesWithBrightness(true);
    setToneTarget('light');
    setGridAngle(0);
    setGlowStrength(0);
    
    // Reset newly added variables
    setBoundaryMorph(0);
    setRadialDispersion(0);
    setImageZoom(1.0);
    setImageRotate(0);
    setImageOffsetX(0);
    setImageOffsetY(0);
    setColorTintHex('#4f46e5');
    setColorTintStrength(0);
    setIsAnimated(false);
    setAnimationType('pulse');
    setAnimationSpeed(1.2);

    triggerToast('Success: Re-initialized mosaic pixel settings!');
  };

  return (
    <div className="flex-grow flex flex-col lg:flex-row lg:overflow-hidden min-h-0 bg-[#050505]" id="mosaic-studio-main-viewport">
      
      {/* LEFT AREA: Canvas Display Workspace */}
      <div className="w-full h-[60vh] lg:h-full lg:flex-1 p-0 lg:p-6 flex flex-col gap-4 relative min-w-0 overflow-hidden shrink-0 lg:shrink" id="mosaic-canvas-area-wrapper">
        
        {/* Top bar removed and moved to sidebar to maximize canvas space */}

        {/* DRAG ZONE & CANVAS VIEWER CARD (Dynamically sized, fits the browser website viewport exactly, floating and borderless like input source stage) */}
        <div 
          id="mosaic-viewport-drag-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 w-full flex items-center justify-center relative transition-all duration-300 overflow-auto custom-scrollbar bg-[#050505] p-2 lg:p-6 min-h-[400px] lg:min-h-0 shrink-0 lg:shrink ${
            dragActive 
              ? 'border border-dashed border-indigo-500 bg-indigo-950/20' 
              : 'border-none bg-transparent'
          }`}
        >
          {dragActive && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#07070a]/90 gap-3">
              <Upload size={40} className="text-indigo-400 animate-bounce" />
              <p className="font-mono text-xs text-indigo-300 uppercase tracking-widest font-bold">
                Drop your image file here to process!
              </p>
            </div>
          )}

          {/* Canvas Render viewport */}
          <canvas 
            ref={mainCanvasRef} 
            className="max-w-full max-h-full object-contain transition-transform duration-200 origin-center" 
            style={{ 
              transform: `scale(${imageZoom})`,
            }}
            id="main-rendering-mosaic-canvas"
          />

          <div className="absolute bottom-3 right-4 flex items-center gap-2 text-zinc-600 font-mono text-[9px] pointer-events-none select-none">
            <Layers size={10} />
            <span>DRAG & DROP LOCAL IMAGES FREELY</span>
          </div>
        </div>

        {/* FOOTER STATS INFO */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#08080a] border border-white/5 rounded-lg text-[10px] text-white/50 font-mono tracking-wider shadow-inner" id="mosaic-info-metrics-bar">
          <div className="flex items-center gap-2">
            <Grid size={12} className="text-indigo-400" />
            <span className="uppercase text-white/30 font-bold">GRID SHAPE:</span>
            <span className="text-white uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {dotStyle} Style
            </span>
            {isAnimated && (
              <span className="flex items-center gap-1 text-emerald-400 font-bold ml-1 animate-pulse">
                <Activity size={10} />
                ANIMATED ({animationType.toUpperCase()})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/20">•</span>
            <span className="uppercase text-white/30">SIZE:</span>
            <span className="text-[#ff5500] font-black">{dotSize}px</span>
            <span className="text-white/20">•</span>
            <span className="uppercase text-white/30">GAP:</span>
            <span className="text-[#ff5500] font-black">{spacing}px</span>
            <span className="text-white/20">•</span>
            <span className="uppercase text-white/30">MORPH:</span>
            <span className="text-[#ff5500] font-black">{boundaryMorph}%</span>
            <span className="text-white/20">•</span>
            <span className="uppercase text-white/30">ZOOM:</span>
            <span className="text-[#ff5500] font-black">{imageZoom.toFixed(1)}x</span>
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR: Creative Customizer Controls with independent scrollbar */}
      <div className="w-full lg:w-[360px] bg-[#0a0a0c] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col min-h-0 relative select-none lg:h-full overflow-hidden shrink-0" id="mosaic-sidebar-panel">
        
        {/* PANEL TITLE */}
        <div className="p-4 border-b border-white/5 bg-[#0a0a0d] flex flex-shrink-0 items-center justify-between gap-2 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-500 animate-pulse" size={14} />
            <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white/95">
              MOSAIC PIX-DOT <span className="text-[#ff5500]">PRO</span>
            </span>
          </div>
        </div>

        <div className="p-5 space-y-6 flex-1 overflow-y-auto custom-scrollbar" id="mosaic-customizer-scrollable-content">
          
          {/* SECTION 0: ACTIONS & EXPORT */}
          <div className="space-y-3" id="config-sect-actions">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider font-bold">
                0. Actions & Export
              </p>
              {isProcessing && (
                <span className="text-[10px] text-zinc-400 font-mono animate-pulse uppercase">
                  • Compiling...
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-trigger-file-pick"
                onClick={() => fileInputRef.current?.click()}
                className="col-span-1 p-2 bg-[#ff5500]/10 border border-[#ff5500]/30 hover:border-[#ff5500]/50 rounded font-mono text-[10px] text-[#ff5500] hover:text-[#ff7733] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload size={12} />
                Image
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              
              <button
                id="btn-trigger-video-pick"
                onClick={() => videoInputRef.current?.click()}
                className="col-span-1 p-2 bg-white/5 border border-white/10 hover:border-white/20 rounded font-mono text-[10px] text-white hover:text-white uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Play size={12} />
                Video
              </button>
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoFileUpload} className="hidden" />
              
              <button
                id="btn-download-high-res-artwork"
                onClick={handleDownload}
                className="col-span-1 p-2 bg-[#4A38F5] hover:bg-[#3b2bc7] text-white font-mono text-[10px] rounded uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#4A38F5]/25 border border-white/5 cursor-pointer"
              >
                <Download size={12} />
                PNG
              </button>

              <button
                id="btn-download-svg-artwork"
                onClick={handleDownloadSVG}
                className="col-span-1 p-2 bg-[#ff5500] hover:bg-[#d94800] text-white font-mono text-[10px] rounded uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#ff5500]/25 border border-white/5 cursor-pointer"
              >
                <Layers size={11} />
                SVG
              </button>

              <button
                id="btn-toggle-video-recording"
                onClick={toggleRecording}
                className={`col-span-2 p-2 ${isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse text-white' : 'bg-red-500/20 hover:bg-red-500/30 text-red-100'} border border-red-500/30 font-mono text-[10px] rounded uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer`}
              >
                <Activity size={12} className={isRecording ? 'animate-spin' : ''} />
                {isRecording ? 'STOP RECORDING' : 'RECORD VIDEO SCENE'}
              </button>

              <button
                onClick={handleCopyHTMLCode}
                className="col-span-1 p-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] rounded uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 border border-white/5 cursor-pointer shadow-md"
              >
                <Copy size={11} />
                HTML Code
              </button>

              <button
                onClick={handleCopyReactCode}
                className="col-span-1 p-2 bg-indigo-700 hover:bg-indigo-600 text-white font-mono text-[10px] rounded uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 border border-white/5 cursor-pointer shadow-md"
              >
                <Code size={11} />
                React Code
              </button>

              <button
                id="btn-reset-mosaic-params"
                onClick={handleReset}
                className="col-span-2 p-2 bg-white/5 border border-white/10 hover:border-[#ff5500]/50 hover:bg-[#ff5500]/10 rounded font-mono text-[10px] text-zinc-300 hover:text-[#ff5500] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw size={13} />
                Reset Parameters Factory Default
              </button>
            </div>
          </div>
          
          <div className="w-full h-px bg-white/5 my-2"></div>

          {/* SECTION 1: STYLE PRESET MAPPER */}
          <div className="space-y-3" id="config-sect-styles">
            <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider font-bold">
              1. Choose Dot Pixel Shape Style
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'bead', label: 'Hama Bead Tile' },
                { key: 'ring', label: 'Aperture Ring' },
                { key: 'halftone', label: 'Halftone Dot' },
                { key: 'lego', label: 'LEGO 3D Stud' },
                { key: 'target', label: 'Target Ring' },
                { key: 'cross', label: 'Cross Stitch' },
                { key: 'hex', label: 'Hexagon Tiles' },
                
                // NEW AWESOME STYLES REQUESTED BY USER
                { key: 'star', label: '★ Star Shape' },
                { key: 'triangle', label: '▲ Triangles' },
                { key: 'diamond', label: '♦ Diamond Art' },
                { key: 'heart', label: '♥ Pix Heart' },
                { key: 'spiral', label: '🌀 Spiral Curl' },
                { key: 'wave', label: '〰️ Waves Sine' },
                { key: 'burst', label: '💥 Burst Spikes' }
              ].map((styleObj) => (
                <button
                  key={styleObj.key}
                  id={`btn-style-selector-${styleObj.key}`}
                  onClick={() => {
                    setDotStyle(styleObj.key as DotStyle);
                    triggerToast(`Selected ${styleObj.label} rendering model.`);
                  }}
                  className={`py-2 px-2.5 rounded font-mono text-[10px] text-left uppercase font-bold border transition-all cursor-pointer ${
                    dotStyle === styleObj.key
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                      : 'bg-[#101014] border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  {styleObj.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 1.5: ANIMATION ENGINE CONFIGURATION (NEW) */}
          <div className="space-y-4 bg-white/5 p-4 rounded-lg border border-white/5" id="config-sect-animation">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase font-mono text-[#e0e0e0] tracking-wider font-bold flex items-center gap-1.5">
                <Activity size={12} className="text-emerald-400" />
                Live Animated Mode
              </p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isAnimated} 
                  onChange={(e) => {
                    setIsAnimated(e.target.checked);
                    triggerToast(e.target.checked ? "Animation engine booted!" : "Animation paused.");
                  }} 
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 after:border-zinc-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white"></div>
              </label>
            </div>

            {isAnimated && (
              <div className="space-y-3 pt-1 animate-fadeIn">
                {/* Animation selection */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-zinc-400">ANIMATION ALGORITHM:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { key: 'pulse', label: 'Breathing Pulse' },
                      { key: 'wave', label: 'Vector Wave' },
                      { key: 'colorCycle', label: 'Hue Rotation' },
                      { key: 'drift', label: 'Organic Drift' },
                      { key: 'orbit', label: 'Cosmic Orbit' },
                      { key: 'matrix', label: 'Falling Matrix' },
                      { key: 'explodingStars', label: 'Star Twinkle' },
                      { key: 'rippleBounce', label: 'Concentric Ripples' },
                      { key: 'shimmerGlow', label: 'Sparkling Shimmer' },
                      { key: 'dnaSpiral', label: 'Helix DNA Spiral' }
                    ].map((typeObj) => (
                      <button
                        key={typeObj.key}
                        onClick={() => setAnimationType(typeObj.key as AnimationType)}
                        className={`py-1 text-[9px] font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                          animationType === typeObj.key
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                            : 'bg-[#101014] border-white/5 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {typeObj.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animation speed */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-400">ANIMATION VELOCITY:</span>
                    <span className="text-emerald-400 font-bold">{animationSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="3.5"
                    step="0.1"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: VECTOR SIZING METRICS */}
          <div className="space-y-4 bg-white/5 p-4 rounded-lg border border-white/5" id="config-sect-sizing">
            <p className="text-[10px] uppercase font-mono text-[#e0e0e0] tracking-wider font-bold flex items-center gap-1.5">
              <Grid size={12} className="text-[#ff5500]" />
              Sizing & Grid
            </p>

            {/* Dot Scale Preset Dropdown */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-400 uppercase">Dot Scale Preset Density:</label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'small') {
                    setDotSize(6);
                    setSpacing(1);
                  } else if (val === 'medium') {
                    setDotSize(12);
                    setSpacing(2);
                  } else if (val === 'large') {
                    setDotSize(20);
                    setSpacing(3);
                  } else if (val === 'extraLarge') {
                    setDotSize(32);
                    setSpacing(4);
                  }
                }}
                defaultValue="medium"
                className="w-full bg-[#101014] border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="small">Small Density (6px dots, 1px gap)</option>
                <option value="medium">Medium Density (12px dots, 2px gap)</option>
                <option value="large">Large Density (20px dots, 3px gap)</option>
                <option value="extraLarge">Extra Large Density (32px dots, 4px gap)</option>
              </select>
            </div>

            {/* Slider: Dot Size */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">DOT MATRIX SIZE:</span>
                <span className="text-[#ff5500] font-black">{dotSize}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="45"
                step="1"
                value={dotSize}
                onChange={(e) => setDotSize(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Slider: Spacing Gap */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">BETWEEN GRID SPACING:</span>
                <span className="text-[#ff5500] font-black">{spacing}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                step="1"
                value={spacing}
                onChange={(e) => setSpacing(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Slider: Radial Edge Dispersion */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">RADIAL EDGE SPACING:</span>
                <span className="text-emerald-400 font-black">{radialDispersion}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={radialDispersion}
                onChange={(e) => setRadialDispersion(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Slider: Grid Angle Rotation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">GRID ANGLE ROTATE:</span>
                <span className="text-[#ff5500] font-black">{gridAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="15"
                value={gridAngle}
                onChange={(e) => setGridAngle(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[8px] font-mono text-zinc-650">
                <span>0° Normal</span>
                <span>15°</span>
                <span>30°</span>
                <span>45° Diamond</span>
              </div>
            </div>

            {/* NEW FEATURE: Continuous Morphing Boundary Mask control (Box -> Circle) */}
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400 font-bold uppercase">Boundary Mask Morph:</span>
                <span className="text-indigo-400 font-black">{boundaryMorph}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={boundaryMorph}
                onChange={(e) => setBoundaryMorph(Number(e.target.value))}
                className="w-full accent-indigo-550"
              />
              <div className="flex justify-between text-[8px] font-mono text-zinc-600">
                <span>0% Box</span>
                <span>50% Rounded</span>
                <span>100% Circle</span>
              </div>
            </div>
          </div>

          {/* SECTION 2.5: SOURCE IMAGE POSITION TRANSFORM & SYSTEM ZONE (NEW) */}
          <div className="space-y-4 bg-white/5 p-4 rounded-lg border border-white/5" id="config-sect-positional-transforms">
            <p className="text-[10px] uppercase font-mono text-[#e0e0e0] tracking-wider font-bold flex items-center gap-1.5">
              <Move size={12} className="text-[#ff5500]" />
              Image Zoom & Position
            </p>

            {/* Scale Zoom Factor */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">IMAGE ZOOM SCALE:</span>
                <span className="text-indigo-400 font-black">{imageZoom.toFixed(2)}x</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImageZoom((prev) => Math.max(0.5, prev - 0.25))}
                  className="p-1 text-zinc-400 bg-[#101014] hover:bg-zinc-800 rounded border border-white/5 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={12} />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={imageZoom}
                  onChange={(e) => setImageZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <button
                  onClick={() => setImageZoom((prev) => Math.min(5.0, prev + 0.25))}
                  className="p-1 text-zinc-400 bg-[#101014] hover:bg-zinc-800 rounded border border-white/5 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={12} />
                </button>
              </div>
            </div>

            {/* Source Image Rotation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">SOURCE IMAGE ROTATE:</span>
                <span className="text-[#ff5500] font-black">{imageRotate}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={imageRotate}
                onChange={(e) => setImageRotate(Number(e.target.value))}
                className="w-full accent-indigo-550"
              />
            </div>

            {/* Horizontal translate / Pan X */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">PAN X (HORIZONTAL):</span>
                <span className="text-indigo-400 font-black">{imageOffsetX}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={imageOffsetX}
                onChange={(e) => setImageOffsetX(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Vertical translate / Pan Y */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">PAN Y (VERTICAL):</span>
                <span className="text-indigo-400 font-black">{imageOffsetY}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={imageOffsetY}
                onChange={(e) => setImageOffsetY(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* SECTION 2.7: PAINTING OVERLAY / CUSTOM COLOR TINT (NEW) */}
          <div className="space-y-4 bg-white/5 p-4 rounded-lg border border-white/5" id="config-sect-painting-overlay-tints">
            <p className="text-[10px] uppercase font-mono text-[#e0e0e0] tracking-wider font-bold flex items-center gap-1.5">
              <Palette size={12} className="text-[#ff5500]" />
              Chromatic Paint Overlay & Blend
            </p>

            {/* Strength amount */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">TINT BLEND OVERLAY:</span>
                <span className="text-indigo-400 font-black">{Math.round(colorTintStrength * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={colorTintStrength}
                onChange={(e) => setColorTintStrength(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Color selector input and preset circles */}
            {colorTintStrength > 0 && (
              <div className="space-y-2.5 pt-1 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-zinc-400">SELECT COLOUR:</span>
                  <input
                    type="color"
                    value={colorTintHex}
                    onChange={(e) => setColorTintHex(e.target.value)}
                    className="w-6 h-6 rounded bg-transparent border border-white/10 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-zinc-300">{colorTintHex.toUpperCase()}</span>
                </div>

                <div className="flex gap-2 justify-between flex-wrap">
                  {[
                    { color: '#00f0ff', label: 'Cyan' },
                    { color: '#ff2a85', label: 'Magenta' },
                    { color: '#fffb00', label: 'Acid' },
                    { color: '#ffffff', label: 'White' },
                    { color: '#7b2cbf', label: 'Violet' },
                    { color: '#e65c00', label: 'Neon' }
                  ].map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => {
                        setColorTintHex(preset.color);
                        triggerToast(`Applied custom tint preset color ${preset.label}!`);
                      }}
                      className="w-5 h-5 rounded-full border border-white/10 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow"
                      style={{ backgroundColor: preset.color }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: IMAGE ADJUSTMENT FILTERS */}
          <div className="space-y-4 bg-white/5 p-4 rounded-lg border border-white/5" id="config-sect-filters">
            <p className="text-[10px] uppercase font-mono text-[#e0e0e0] tracking-wider font-bold flex items-center gap-1.5">
              <Sliders size={12} className="text-[#ff5500]" />
              Image Tone Modifiers
            </p>

            {/* Slider: Brightness */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">BRIGHTNESS:</span>
                <span className={`font-black ${brightness >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                  {brightness > 0 ? `+${brightness}` : brightness}
                </span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                step="2"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Slider: Contrast */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">CONTRAST:</span>
                <span className="text-indigo-400 font-black">+{contrast}</span>
              </div>
              <input
                type="range"
                min="-40"
                max="60"
                step="2"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Slider: Color Saturation Intensity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">COLOR INTENSITY (CHROMA):</span>
                <span className="text-indigo-400 font-black">{colorIntensity.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.5"
                step="0.05"
                value={colorIntensity}
                onChange={(e) => setColorIntensity(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Slider: Bloom Neon Glow */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">NEON GLOW EMISSION Blur:</span>
                <span className="text-indigo-400 font-black">{glowStrength}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={glowStrength}
                onChange={(e) => setGlowStrength(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* SECTION 4: COLOR PALETTE MAPPER */}
          <div className="space-y-3" id="config-sect-palettes">
            <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider font-bold flex items-center gap-1">
              <Palette size={12} className="text-[#ff5500]" />
              Chromatic Color Presets
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'original', label: 'True Colors' },
                { key: 'hama', label: '16-Bead Hama' },
                { key: 'gameboy', label: 'Retro GameBoy' },
                { key: 'cyberpunk', label: 'Neon Cyberpunk' },
                { key: 'sunset', label: 'Warm Sunset' },
                { key: 'thermal', label: 'Infrared Thermal' },
                { key: 'slate', label: 'Noir Slate (Mono)' }
              ].map((palItem) => (
                <button
                  key={palItem.key}
                  id={`btn-palette-selector-${palItem.key}`}
                  onClick={() => {
                    setPalette(palItem.key as PaletteType);
                    triggerToast(`Switched color gamut maps to '${palItem.label}'.`);
                  }}
                  className={`py-1.5 px-2 rounded font-mono text-[10px] text-left uppercase transition-all font-bold border flex items-center justify-between cursor-pointer ${
                    palette === palItem.key
                      ? 'bg-[#ff5500]/10 border-[#ff5500] text-[#ff5500]'
                      : 'bg-[#101014] border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <span>{palItem.label}</span>
                  {palette === palItem.key && <Check size={10} />}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 5: ADVANCED TONAL OPTIONS */}
          <div className="space-y-4 bg-white/5 p-4 rounded-lg border border-white/5" id="config-sect-toggles">
            <p className="text-[10px] uppercase font-mono text-[#e0e0e0] tracking-wider font-bold">
              Advanced Tonal Control
            </p>

            {/* Checkbox: Variable Size with Brightness */}
            <label className="flex items-start gap-2.5 text-[10px] font-mono text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sizeVariesWithBrightness}
                onChange={(e) => setSizeVariesWithBrightness(e.target.checked)}
                className="mt-0.5 rounded accent-indigo-500"
              />
              <div className="space-y-0.5">
                <span className="font-bold">Aperture Size Modulation</span>
                <p className="text-[9px] text-zinc-500 leading-normal font-normal">
                  Vary dot dimensions dynamically according to cell's light luminance intensity.
                </p>
              </div>
            </label>

            {/* Slider/Segment: Tone Target Selection */}
            {sizeVariesWithBrightness && (
              <div className="space-y-1.5 pl-5 pt-1">
                <span className="text-[9px] text-zinc-400 font-mono block">MODULATION TARGET AREA:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setToneTarget('light')}
                    className={`flex-1 py-1 rounded font-mono text-[9px] font-bold uppercase border cursor-pointer ${
                      toneTarget === 'light'
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                        : 'bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Denser Lights
                  </button>
                  <button
                    onClick={() => setToneTarget('dark')}
                    className={`flex-1 py-1 rounded font-mono text-[9px] font-bold uppercase border cursor-pointer ${
                      toneTarget === 'dark'
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                        : 'bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Denser Darks
                  </button>
                </div>
              </div>
            )}

            {/* Dropdown Backdrop style */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-400 block font-bold">BACKDROP STYLE STATE:</label>
              <select
                value={bgStyle}
                onChange={(e) => setBgStyle(e.target.value as BgStyle)}
                className="w-full bg-[#101014] border border-white/10 rounded text-[10px] font-mono p-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
                id="select-canvas-background-modes"
              >
                <option value="black">Deep Charcoal Dark (0-Lux)</option>
                <option value="white">Pristine Pure-White (100-Lux)</option>
                <option value="transparent">Alpha Channel (Transparent)</option>
                <option value="blurred">Blurred Original Underlay</option>
              </select>
            </div>
          </div>

          <div className="p-3 border border-indigo-500/10 bg-indigo-950/10 rounded text-[9px] font-mono text-zinc-400 leading-relaxed">
            <Info size={11} className="text-indigo-400 inline mr-1.5 align-text-bottom" />
            Each dot uses highly optimized downscale grid sampling. Try uploading custom geometric illustrations, portraits, or dynamic photos.
          </div>

        </div>

      </div>

      {/* Floating Status Toast Notifications */}
      {toastMessage && (
        <div 
          className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#0c0c10] border border-indigo-500/30 text-white rounded font-mono text-[10px] shadow-2xl tracking-widest z-50 uppercase animate-bounce"
          id="mosaic-vocal-toast"
        >
          {toastMessage}
        </div>
      )}

    </div>
  );
}
