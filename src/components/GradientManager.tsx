import React, { useState } from 'react';
import { AppSettings, GradientSettings, GradientStop } from '../types';
import { 
  Plus, 
  Trash2, 
  Zap, 
  Palette, 
  Move, 
  SlidersHorizontal, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Play, 
  Eye, 
  RotateCcw, 
  Code,
  Wind,
  Waves,
  Flame,
  Layers
} from 'lucide-react';

interface GradientManagerProps {
  settings: AppSettings;
  onChange: (fn: (prev: AppSettings) => AppSettings) => void;
}

export default function GradientManager({ settings, onChange }: GradientManagerProps) {
  // Tabs modeled after control sidebar
  const [activeTab, setActiveTab] = useState<'design' | 'animations' | 'export'>('design');
  const [codeTab, setCodeTab] = useState<'react' | 'css' | 'tailwind' | 'svg'>('react');
  const [copiedCode, setCopiedCode] = useState(false);

  const { gradient } = settings;

  // Curated premium preset gradients
  const PRESETS = [
    {
      name: '🌅 Sunset Stripe',
      stops: [
        { offset: 0.0, color: '#ff5e62' },
        { offset: 0.25, color: '#ff2a85' },
        { offset: 0.5, color: '#7a00ff' },
        { offset: 0.75, color: '#1b45ff' },
        { offset: 1.0, color: '#ffbe3b' }
      ],
      speed: 0.25,
      blur: 70,
      noise: 0.12,
      waveComplexity: 1.2,
      styleKey: 'stripes' as const,
      tilt: -8,
      overlayType: 'none' as const,
      rippleStrength: 0.45,
      blendMode: 'screen' as const,
      movementPattern: 'flow' as const,
      colorBoost: 1.25,
      shimmerSpeed: 0.12,
      tiltJitter: false,
      vibrationLevel: 0.0,
      bgBlur: 20
    },
    {
      name: '🔮 Cyber Dream',
      stops: [
        { offset: 0.0, color: '#00ffcc' },
        { offset: 0.35, color: '#0099ff' },
        { offset: 0.7, color: '#ff00cc' },
        { offset: 1.0, color: '#7a00ff' }
      ],
      speed: 0.35,
      blur: 65,
      noise: 0.15,
      waveComplexity: 1.6,
      styleKey: 'plasma' as const,
      tilt: 4,
      overlayType: 'scanlines' as const,
      rippleStrength: 0.6,
      blendMode: 'overlay' as const,
      movementPattern: 'pulse' as const,
      colorBoost: 1.5,
      shimmerSpeed: 0.25,
      tiltJitter: true,
      vibrationLevel: 0.15,
      bgBlur: 35
    },
    {
      name: '🌸 Tokyo Calm',
      stops: [
        { offset: 0.0, color: '#e0c3fc' },
        { offset: 0.3, color: '#8ec5fc' },
        { offset: 0.6, color: '#ff9a9e' },
        { offset: 1.0, color: '#fecfef' }
      ],
      speed: 0.15,
      blur: 85,
      noise: 0.06,
      waveComplexity: 0.8,
      styleKey: 'fluid' as const,
      tilt: -5,
      overlayType: 'none' as const,
      rippleStrength: 0.3,
      blendMode: 'screen' as const,
      movementPattern: 'shift' as const,
      colorBoost: 1.0,
      shimmerSpeed: 0.05,
      tiltJitter: false,
      vibrationLevel: 0.0,
      bgBlur: 50
    },
    {
      name: '🌴 Tropic Coral',
      stops: [
        { offset: 0.0, color: '#ff9a9e' },
        { offset: 0.4, color: '#fecfef' },
        { offset: 0.7, color: '#f1f2b5' },
        { offset: 1.0, color: '#135058' }
      ],
      speed: 0.22,
      blur: 75,
      noise: 0.1,
      waveComplexity: 1.1,
      styleKey: 'blobs' as const,
      tilt: -10,
      overlayType: 'vignette' as const,
      rippleStrength: 0.5,
      blendMode: 'soft-light' as const,
      movementPattern: 'drift' as const,
      colorBoost: 1.35,
      shimmerSpeed: 0.18,
      tiltJitter: false,
      vibrationLevel: 0.08,
      bgBlur: 30
    },
    {
      name: '🌌 Space Nebula',
      stops: [
        { offset: 0.0, color: '#0f2027' },
        { offset: 0.3, color: '#203a43' },
        { offset: 0.6, color: '#2c5364' },
        { offset: 0.8, color: '#7a00ff' },
        { offset: 1.0, color: '#ff007f' }
      ],
      speed: 0.28,
      blur: 90,
      noise: 0.18,
      waveComplexity: 1.4,
      styleKey: 'plasma' as const,
      tilt: 8,
      overlayType: 'grid' as const,
      rippleStrength: 0.7,
      blendMode: 'screen' as const,
      movementPattern: 'pulse' as const,
      colorBoost: 1.6,
      shimmerSpeed: 0.3,
      tiltJitter: true,
      vibrationLevel: 0.2,
      bgBlur: 40
    }
  ];

  const updateGradient = (newGradient: Partial<GradientSettings>) => {
    onChange((prev) => ({
      ...prev,
      gradient: { ...prev.gradient, ...newGradient },
    }));
  };

  const randomizePalette = () => {
    const PALETTES = [
      ['#FF4E50', '#F9D423', '#FF007F', '#7A00FF', '#FFB300'],
      ['#0575E6', '#00F260', '#4facfe', '#00f2fe', '#00c6ff'],
      ['#EA8D8D', '#A890FE', '#FBC2EB', '#A6C1EE', '#FFCCD5'],
      ['#00ffcc', '#ff0099', '#330066', '#a000ff', '#001a4d'],
      ['#c5a059', '#e5c07b', '#4facfe', '#7a00ff', '#ffd700'],
      ['#FA8BFF', '#2BD2FF', '#2BFF88', '#FF9F43', '#FF6B6B'],
      ['#2E0854', '#4B0082', '#8A2BE2', '#DDA0DD', '#E6E6FA'],
      ['#ff5f6d', '#ffc371', '#ff1493', '#9400d3', '#00bfff']
    ];
    const chosen = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const stops: GradientStop[] = chosen.map((color, idx) => ({
      offset: Number((idx / (chosen.length - 1)).toFixed(2)),
      color
    }));
    updateGradient({ stops });
  };

  const addStop = () => {
    // Elegant color randomizer to append attractive tones
    const randomColors = ['#ff4e50', '#f9d423', '#4facfe', '#00f2fe', '#f857a6', '#ff5858', '#38ef7d'];
    const chosenColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    const lastOffset = gradient.stops.length > 0 ? gradient.stops[gradient.stops.length - 1].offset : 0.8;
    const newOffset = Math.min(1.0, Number((lastOffset + 0.15).toFixed(2)));

    updateGradient({
      stops: [...gradient.stops, { offset: newOffset, color: chosenColor }],
    });
  };

  const removeStop = (index: number) => {
    if (gradient.stops.length <= 2) return; // Maintain at least 2 stops
    const stops = gradient.stops.filter((_, i) => i !== index);
    updateGradient({ stops });
  };

  const updateStop = (index: number, newStop: GradientStop) => {
    const stops = [...gradient.stops];
    stops[index] = newStop;
    // Sort stops automatically by offset for perfect drawing transitions
    updateGradient({ stops });
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    updateGradient({
      stops: preset.stops,
      speed: preset.speed,
      blur: preset.blur,
      noise: preset.noise,
      waveComplexity: preset.waveComplexity,
      styleKey: preset.styleKey,
      tilt: preset.tilt,
      overlayType: preset.overlayType,
      rippleStrength: preset.rippleStrength,
      blendMode: preset.blendMode,
      movementPattern: preset.movementPattern,
      colorBoost: preset.colorBoost,
      shimmerSpeed: preset.shimmerSpeed,
      tiltJitter: preset.tiltJitter,
      vibrationLevel: preset.vibrationLevel,
      enabled: true
    });
  };

  // Helper Snippets Generator
  const getReactCode = () => {
    const jsonStops = JSON.stringify(gradient.stops, null, 2);
    return `import React, { useEffect, useRef } from 'react';

// Stripe-style Dynamic Mesh Gradient Component
export default function AnimatedMeshGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let time = 0;

    // Core stripe stops
    const stops = ${JSON.stringify(gradient.stops)};
    const blobs = stops.map((stop, i) => ({
      x: 0.5,
      y: 0.5,
      size: 0.45 + (i % 3) * 0.1,
      color: stop.color,
      speedX: 0.15 + (i % 4) * 0.08,
      speedY: 0.18 + (i % 3) * 0.07,
      phaseX: (i * Math.PI) / 2.5,
      phaseY: (i * Math.PI) / 1.7
    }));

    // Generate repeat grain texture
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 128;
    noiseCanvas.height = 128;
    const nCtx = noiseCanvas.getContext('2d');
    if (nCtx) {
      const imgData = nCtx.createImageData(128, 128);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        imgData.data[i] = val;
        imgData.data[i+1] = val;
        imgData.data[i+2] = val;
        imgData.data[i+3] = 18; // soft alpha
      }
      nCtx.putImageData(imgData, 0, 0);
    }

    const tick = () => {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.015 * ${gradient.speed} * ${gradient.waveComplexity};

      const w = canvas.width;
      const h = canvas.height;
      const maxDim = Math.max(w, h);

      blobs.forEach((blob) => {
        // Organic wandering formula
        blob.x = 0.5 + Math.sin(time * blob.speedX + blob.phaseX) * 0.22;
        blob.y = 0.5 + Math.cos(time * blob.speedY + blob.phaseY) * 0.22;

        const radius = blob.size * maxDim * 0.65;
        const radGrad = ctx.createRadialGradient(blob.x * w, blob.y * h, radius * 0.02, blob.x * w, blob.y * h, radius);
        radGrad.addColorStop(0, blob.color);
        radGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = radGrad;
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.arc(blob.x * w, blob.y * h, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      if (${gradient.noise} > 0 && noiseCanvas) {
        ctx.save();
        const pattern = ctx.createPattern(noiseCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.globalAlpha = ${gradient.noise} * 1.5;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.restore();
      }

      animFrame = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden bg-[#0c0b11]">
      <div 
        className="absolute inset-0 filter"
        style={{ filter: 'blur(${gradient.blur}px)', transform: 'scale(1.15)' }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}`;
  };

  const getCSSCode = () => {
    return `/* Animated Flowing CSS Gradient Background */
.stripe-animated-gradient {
  background: linear-gradient(
    ${gradient.angle}deg, 
    ${gradient.stops.map(s => s.color).join(', ')}
  );
  background-size: 400% 400%;
  animation: flowingStripe ${30 / (gradient.speed || 0.1)}s ease infinite;
}

@keyframes flowingStripe {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}`;
  };

  const getTailwindCode = () => {
    return `// Paste custom class keys in tailwind.config.js inside animations section
// Then style your markup directly!

<div className="w-full h-screen bg-linear-to-r from-[${gradient.stops[0]?.color ?? '#ff5e62'}] via-[${gradient.stops[1]?.color ?? '#ff2a85'}] to-[${gradient.stops[gradient.stops.length-1]?.color ?? '#ffbe3b'}] animate-gradient bg-[length:400%_400%] filter blur-[${gradient.blur}px] pointer-events-none opacity-90 transform scale-110">
</div>`;
  };

  const getSVGCode = () => {
    return `<svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="stripeGrad" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${gradient.angle})">
      ${gradient.stops.map(s => `<stop offset="${s.offset * 100}%" stop-color="${s.color}" />`).join('\n      ')}
    </linearGradient>
    <filter id="meshBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${gradient.blur / 2}" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#stripeGrad)" filter="url(#meshBlur)" />
</svg>`;
  };

  const handleCopyCode = () => {
    let t = '';
    if (codeTab === 'react') t = getReactCode();
    else if (codeTab === 'css') t = getCSSCode();
    else if (codeTab === 'tailwind') t = getTailwindCode();
    else if (codeTab === 'svg') t = getSVGCode();

    navigator.clipboard.writeText(t);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Curated Preset Palette selectors
  const STUDIO_GRADIENTS = [
    { name: 'Aurora Sunset', bg: '#09090b', colors: ['#ff8a00', '#da1b60', '#6366f1'] },
    { name: 'Cyber Neon', bg: '#05030a', colors: ['#00ffcc', '#ff007f', '#7a00ff'] },
    { name: 'Tokyo Dusk', bg: '#030712', colors: ['#ff9999', '#ff5e62', '#1b45ff'] },
  ];

  return (
    <div id="gradient-control-panel" className="w-full flex flex-col gap-4">
      {/* Tab Switcher */}
      <div className="grid grid-cols-3 p-1 bg-zinc-950 rounded-lg border border-zinc-850">
        {(['design', 'animations', 'export'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 text-[10px] tracking-widest rounded-md transition-all uppercase font-sans font-medium cursor-pointer ${
              activeTab === tab
                ? 'bg-zinc-850 text-zinc-150 shadow-md shadow-black/40 font-bold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'design' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          
          {/* SECTION: PRESET PALETTES */}
          <div className="flex flex-col gap-2 p-3 rounded-lg border border-indigo-950/40 bg-indigo-950/5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={11} className="text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest font-mono text-indigo-400 uppercase">PRESET AURORAS</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 hover:border-indigo-650/40 hover:bg-zinc-900 text-left rounded-lg text-[10px] text-zinc-350 transition-all font-sans font-semibold flex items-center justify-between group active:scale-98 cursor-pointer"
                >
                  <span>{p.name}</span>
                  <div className="flex items-center gap-1">
                    {p.stops.slice(0, 4).map((s, idx) => (
                      <div
                        key={idx}
                        className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-sm"
                        style={{ backgroundColor: s.color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION: COLOR ACCENTS MANAGER */}
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest font-mono text-zinc-400 uppercase">COLOR STOPS ({gradient.stops.length})</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={randomizePalette}
                  className="px-2 py-1 bg-violet-650/40 active:scale-95 text-violet-300 border border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-600/40 rounded text-[9px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer"
                  title="Generate a highly harmonized premium color palette instantly"
                >
                  <Palette size={10} />
                  Random
                </button>
                <button
                  onClick={addStop}
                  className="px-2 py-1 bg-indigo-600/20 active:scale-95 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-600/30 rounded text-[9px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer"
                  title="Add a new color stop with automatic spacing"
                >
                  <Plus size={10} />
                  Add Stop
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-900 max-h-[220px] overflow-y-auto custom-scrollbar">
              {gradient.stops.map((stop, index) => (
                <div key={index} className="flex items-center gap-2.5 py-1.5 border-b border-white/5 last:border-0">
                  {/* Native highly optimized color box */}
                  <div className="relative group w-7 h-7 rounded border border-white/10 shrink-0 overflow-hidden cursor-pointer">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateStop(index, { ...stop, color: e.target.value })}
                      className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer"
                    />
                  </div>

                  {/* Offset slider control */}
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500">
                      <span>STOP WEIGHT</span>
                      <span className="text-zinc-350 font-bold">{Math.round(stop.offset * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={stop.offset}
                      onChange={(e) => updateStop(index, { ...stop, offset: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-zinc-850 rounded appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Delete button (only if has more than 2 stops to prevent rendering issues) */}
                  <button
                    onClick={() => removeStop(index)}
                    disabled={gradient.stops.length <= 2}
                    className="p-1.5 text-zinc-650 hover:text-rose-400 rounded hover:bg-rose-950/20 shrink-0 transition-colors disabled:opacity-30 disabled:hover:text-zinc-650 disabled:hover:bg-transparent"
                    title="Delete stop tint"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: TEXTURED CANVASES */}
          <div className="flex flex-col gap-3.5 py-1">
            {/* Blur Smearing Size */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400 font-bold uppercase tracking-widest">SMEARING BLUR</span>
                <span className="text-zinc-300 font-bold">{gradient.blur}PX</span>
              </div>
              <input
                type="range"
                min={40}
                max={120}
                step={5}
                value={gradient.blur}
                onChange={(e) => updateGradient({ blur: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-none">Sets the blending width between adjacent color zones.</span>
            </div>

            {/* Grain Noise density */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400 font-bold uppercase tracking-widest">FINE GRANULAR NOISE</span>
                <span className="text-zinc-300 font-bold">{Math.round(gradient.noise * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.4}
                step={0.01}
                value={gradient.noise}
                onChange={(e) => updateGradient({ noise: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-none">Overlays subtle monochrome sand texture for a warm, premium finish.</span>
            </div>

            {/* Tech Overlays Selection */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">DIGITAL OVERLAYS</span>
              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950 border border-zinc-900 rounded">
                {(['none', 'scanlines', 'grid', 'vignette'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateGradient({ overlayType: type })}
                    className={`py-1 text-[8.5px] font-bold uppercase rounded transition-all cursor-pointer ${
                      (gradient.overlayType || 'none') === type
                        ? 'bg-indigo-650 text-white shadow'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-none">Apply visual digital matrix layer or cinematic margins framing.</span>
            </div>

            {/* Layout Slant (Stripe.com slant!) */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400 font-bold uppercase tracking-widest">HERO LAYOUT TILT SLANT</span>
                <span className="text-zinc-300 font-bold">{gradient.tilt}°</span>
              </div>
              <input
                type="range"
                min={-15}
                max={15}
                step={1}
                value={gradient.tilt}
                onChange={(e) => updateGradient({ tilt: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-none">Immersively bends the background canvas diagonally, exactly like Stripe's hero.</span>
            </div>

            {/* Gradient Blend Mode Selector */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">BLEND MODE</span>
              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950 border border-zinc-900 rounded">
                {(['screen', 'overlay', 'multiply', 'soft-light'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateGradient({ blendMode: mode })}
                    className={`py-1 text-[8px] font-bold uppercase rounded transition-all cursor-pointer ${
                      (gradient.blendMode || 'screen') === mode
                        ? 'bg-violet-600 text-white shadow'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {mode === 'soft-light' ? 'soft lt' : mode}
                  </button>
                ))}
              </div>
              <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-none">Sets how overlapping color stops mix with the background texture.</span>
            </div>

            {/* Color Saturation and contrast boost slider */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400 font-bold uppercase tracking-widest">COLOR ACCENT SATURATION BOOST</span>
                <span className="text-zinc-300 font-bold">{(gradient.colorBoost || 1.2).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={2.0}
                step={0.05}
                value={gradient.colorBoost || 1.2}
                onChange={(e) => updateGradient({ colorBoost: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-none text-zinc-500">Amplifies color richness and gradient depth in the viewport.</span>
            </div>

            {/* Shimmer Speed slider */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400 font-bold uppercase tracking-widest">LUMINANCE SHIMMER PATTERN</span>
                <span className="text-zinc-300 font-bold">{Math.round((gradient.shimmerSpeed || 0.15) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.5}
                step={0.05}
                value={gradient.shimmerSpeed || 0.15}
                onChange={(e) => updateGradient({ shimmerSpeed: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-none text-zinc-500">Introduces elegant shining and size-breathing pulses to color nodes.</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'animations' && (
        <div className="flex flex-col gap-4 animate-fade-in pt-1">
          {/* Wave Styles Selector */}
          <div className="flex flex-col gap-2 p-1">
            <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">FLOW WAVE STYLE</span>
            <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950 border border-zinc-900 rounded">
              {(['stripes', 'blobs', 'plasma', 'fluid'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => updateGradient({ styleKey: key })}
                  className={`py-1 text-[8.5px] font-bold uppercase rounded transition-all cursor-pointer ${
                    (gradient.styleKey || 'stripes') === key
                      ? 'bg-indigo-650 text-white shadow'
                      : 'text-zinc-500 hover:text-zinc-305'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
            <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-normal min-h-[20px]">
              {(gradient.styleKey || 'stripes') === 'stripes' && '⚡ Classic Stripe: parallel diagonal streaming bands.'}
              {gradient.styleKey === 'blobs' && '🔮 Floating Orbs: organic wandering gravity bubbles.'}
              {gradient.styleKey === 'plasma' && '🌌 Solar Plasma: active counter-balanced high speed sweeps.'}
              {gradient.styleKey === 'fluid' && '💧 Liquid Flow: slow-churning concentric gravity fluid cycles.'}
            </span>
          </div>

          {/* Movement Preset Selector */}
          <div className="flex flex-col gap-2 p-1">
            <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">MOVEMENT PATTERN</span>
            <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950 border border-zinc-900 rounded">
              {(['flow', 'pulse', 'shift', 'drift'] as const).map((pattern) => (
                <button
                  key={pattern}
                  onClick={() => updateGradient({ movementPattern: pattern })}
                  className={`py-1 text-[8.5px] font-bold uppercase rounded transition-all cursor-pointer ${
                    (gradient.movementPattern || 'flow') === pattern
                      ? 'bg-violet-650 text-white shadow'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  {pattern}
                </button>
              ))}
            </div>
            <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-normal min-h-[20px]">
              {(gradient.movementPattern || 'flow') === 'flow' && '🌊 Flow: smooth, high-fidelity progressive streaming.'}
              {gradient.movementPattern === 'pulse' && '💓 Pulse: rhythmic expanding/breathing scale pulsations.'}
              {gradient.movementPattern === 'shift' && '🔄 Shift: circular swirling orbits around layout anchors.'}
              {gradient.movementPattern === 'drift' && '🍃 Drift: gentle wind-swept linear diagonal translations.'}
            </span>
          </div>

          {/* Toggle Flow Mode */}
          <div className="flex items-center justify-between py-2 bg-zinc-950 px-3 rounded-lg border border-zinc-900">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-400 uppercase">Flow Animation</span>
              <span className="text-[8px] text-zinc-650 font-mono tracking-tight">Enable/disable wander motion</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={gradient.animate}
                onChange={(e) => updateGradient({ animate: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-zinc-805/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Toggle Tilt Sway Jitter */}
          <div className="flex items-center justify-between py-2 bg-zinc-950 px-3 rounded-lg border border-zinc-900">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-400 uppercase">Tilt Jitter Sway</span>
              <span className="text-[8px] text-zinc-650 font-mono tracking-tight">Dynamic micro slant rotation oscillation</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!gradient.tiltJitter}
                onChange={(e) => updateGradient({ tiltJitter: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-zinc-805/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Micro Vibration level */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-400 font-bold uppercase tracking-widest">COORDINATE MICRO-VIBRATION</span>
              <span className="text-zinc-300 font-bold">{Math.round((gradient.vibrationLevel || 0) * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.05}
              value={gradient.vibrationLevel || 0}
              onChange={(e) => updateGradient({ vibrationLevel: Number(e.target.value) })}
              className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-indigo-505"
            />
            <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-none text-zinc-500 font-semibold mb-1">Injects continuous high frequency energy shake directly into vector coordinates.</span>
          </div>

          {/* Toggle Interaction Gravities */}
          <div className="flex items-center justify-between py-2 bg-zinc-950 px-3 rounded-lg border border-zinc-900">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-400 uppercase">Mouse Gravities</span>
              <span className="text-[8px] text-zinc-650 font-mono tracking-tight">Waves follow your pointer interactions</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={gradient.interactive}
                onChange={(e) => updateGradient({ interactive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-zinc-805/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Interactive Ripple Waves Impact Strength */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-400 font-bold uppercase tracking-widest">TAP RIPPLE FORCE</span>
              <span className="text-zinc-300 font-bold">{Math.round((gradient.rippleStrength || 0.4) * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={gradient.rippleStrength || 0.4}
              onChange={(e) => updateGradient({ rippleStrength: Number(e.target.value) })}
              className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-none">Intensity of visual fluid dispersion waves generated on clicking the canvas.</span>
          </div>

          {/* Drift Speed Factor */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-400 font-bold uppercase tracking-widest">DRIFT VELOCITY</span>
              <span className="text-zinc-300 font-bold">{gradient.speed.toFixed(2)}X</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={1.0}
              step={0.05}
              value={gradient.speed}
              onChange={(e) => updateGradient({ speed: Number(e.target.value) })}
              className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-indigo-505"
            />
            <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-none">Controls the speeds of wave wandering vectors.</span>
          </div>

          {/* Wave Displacements / Complexity */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-400 font-bold uppercase tracking-widest">DISPLACEMENT DEPTH</span>
              <span className="text-zinc-300 font-bold">{gradient.waveComplexity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={3.0}
              step={0.1}
              value={gradient.waveComplexity}
              onChange={(e) => updateGradient({ waveComplexity: Number(e.target.value) })}
              className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-indigo-505"
            />
            <span className="text-[8px] text-zinc-650 font-mono tracking-tight leading-none">Modulates organic wavy distortion fields.</span>
          </div>

          {/* Linear Drift Angulation */}
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-400 font-bold uppercase tracking-widest">DRIFT ANGLE</span>
              <span className="text-zinc-300 font-bold">{gradient.angle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={gradient.angle}
              onChange={(e) => updateGradient({ angle: Number(e.target.value) })}
              className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="flex flex-col gap-4 animate-fade-in pt-1">
          {/* Subtabs selectors */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-zinc-900 rounded">
            {(['react', 'css', 'tailwind', 'svg'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCodeTab(tab)}
                className={`flex-1 py-1.5 text-[9px] font-bold rounded cursor-pointer transition-all uppercase ${
                  codeTab === tab ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Dynamic Code area view */}
          <div className="relative">
            <pre className="p-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-850 transition-colors text-zinc-300 font-mono text-[9px] rounded-lg h-[180px] overflow-auto custom-scrollbar select-text leading-relaxed">
              <code>
                {codeTab === 'react' && getReactCode()}
                {codeTab === 'css' && getCSSCode()}
                {codeTab === 'tailwind' && getTailwindCode()}
                {codeTab === 'svg' && getSVGCode()}
              </code>
            </pre>
            <button
              onClick={handleCopyCode}
              className="absolute top-2.5 right-2.5 p-1.5 bg-black/80 backdrop-blur border border-white/10 text-zinc-400 hover:text-white rounded hover:bg-neutral-900 transition-all active:scale-90"
              title="Copy snippet to clipboard"
            >
              {copiedCode ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            </button>
          </div>

          {/* Quick-stats instructions snippet */}
          <p className="text-[8px] text-zinc-500 font-mono italic text-center leading-normal">
            💡 This HTML5 Dynamic Canvas generator compiles native, high-performance math formulas which process at 60 FPS without external runtime wrappers.
          </p>

          {/* Heavy vector SVG downloader */}
          <button
            onClick={() => {
              const svgContent = getSVGCode();
              const blob = new Blob([svgContent], { type: 'image/svg+xml' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `stripe-mesh-gradient-${Date.now()}.svg`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-650/10 cursor-pointer"
          >
            <Download size={12} />
            Download Vector SVG File
          </button>
        </div>
      )}
    </div>
  );
}
