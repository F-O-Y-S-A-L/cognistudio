/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  Activity, 
  Cpu, 
  Code, 
  Terminal, 
  Play, 
  Zap, 
  ExternalLink, 
  HelpCircle, 
  ChevronRight, 
  SlidersHorizontal, 
  Compass, 
  ShieldAlert,
  ArrowRight,
  MonitorPlay,
  RotateCcw,
  Sliders,
  Award,
  RefreshCw
} from 'lucide-react';

interface AIHomePageProps {
  onEnterStudio: (page?: 'main' | 'gradient' | 'ribbons' | 'silk' | 'cell') => void;
}

export default function AIHomePage({ onEnterStudio }: AIHomePageProps) {
  // Sliders for interactive AI simulation
  const [complexity, setComplexity] = useState<number>(75);
  const [dimensionality, setDimensionality] = useState<number>(60);
  const [chroma, setChroma] = useState<number>(85);
  const [frequency, setFrequency] = useState<number>(45);

  // Selected preset for interactive visualizer
  const [activePreset, setActivePreset] = useState<'aetheric' | 'halftone' | 'quantum'>('aetheric');

  // Input prompt state
  const [promptInput, setPromptInput] = useState<string>("Hyperdimensional neural cluster with iridescent filaments and deep space particles");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthProgress, setSynthProgress] = useState<number>(0);
  const [generatedArtSeed, setGeneratedArtSeed] = useState<number>(101);
  const [synthTerminalLogs, setSynthTerminalLogs] = useState<string[]>([]);

  // Suggested prompt chips
  const promptSuggestions = [
    "Nebula plasma wave with high-frequency frequency noise",
    "Brutalist steel sphere with sharp geometric overlay",
    "Voronoi cell colony under high temperature kinetic drift",
    "Quantum 3D silk ribbon spiraling into a golden ratio"
  ];

  // Simulated live system monitor metrics
  const [gpuLoad, setGpuLoad] = useState<number>(24);
  const [fps, setFps] = useState<number>(60);
  const [memoryUsed, setMemoryUsed] = useState<number>(1.12);

  // System stats ticking
  useEffect(() => {
    const interval = setInterval(() => {
      setGpuLoad(Math.floor(20 + Math.random() * 15));
      setFps(Math.floor(58 + Math.random() * 4));
      setMemoryUsed(parseFloat((1.05 + Math.random() * 0.15).toFixed(2)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Run simulated prompt synthesis
  const handleSynthesize = () => {
    if (isSynthesizing) return;
    setIsSynthesizing(true);
    setSynthProgress(0);
    setSynthTerminalLogs(["[COGNISTUDIO-AI-CORE]: Initializing prompt tokenization...", "[COGNISTUDIO-AI-CORE]: Semantic weights mapped successfully."]);

    const logs = [
      "[INFO]: Querying cognitive weight databases...",
      "[LATENT-SPACE]: Sampling latent space tensor structures at index 0x7FF3B",
      "[PROCEDURAL-ENGINE]: Compiling raster geometry models...",
      "[COMPILED-RENDERER]: Vector noise matrix aligned. Injecting seed coefficients.",
      "[COGNISTUDIO-AI-CORE]: Synthesis successful inside browser-native WebGL layer!"
    ];

    let currentLogIndex = 0;

    const progressInterval = setInterval(() => {
      setSynthProgress((prev) => {
        const next = prev + 5;
        if (next % 20 === 0 && currentLogIndex < logs.length) {
          setSynthTerminalLogs(prevLogs => [...prevLogs, logs[currentLogIndex]]);
          currentLogIndex++;
        }
        if (next >= 100) {
          clearInterval(progressInterval);
          setIsSynthesizing(false);
          setGeneratedArtSeed(Math.floor(Math.random() * 1000));
          return 100;
        }
        return next;
      });
    }, 120);
  };

  // Preset settings map
  useEffect(() => {
    if (activePreset === 'aetheric') {
      setComplexity(75);
      setDimensionality(60);
      setChroma(85);
      setFrequency(45);
    } else if (activePreset === 'halftone') {
      setComplexity(40);
      setDimensionality(90);
      setChroma(35);
      setFrequency(75);
    } else {
      setComplexity(95);
      setDimensionality(30);
      setChroma(90);
      setFrequency(25);
    }
  }, [activePreset]);

  // Generate interactive SVG values dynamically based on ranges
  const generateAethericPaths = () => {
    let paths = [];
    const waveCount = Math.floor(complexity / 15) + 2;
    const steps = 60;
    
    for (let w = 0; w < waveCount; w++) {
      let points = [];
      const amp = (dimensionality / 100) * 80;
      const freqMultiplier = (frequency / 100) * 6;
      const hue = (chroma * 3.6 + (w * 40)) % 360;

      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * 450;
        const radian = (i / steps) * Math.PI * freqMultiplier + (w * 1.5);
        // Harmonic noise simulation using sinusoidal waves
        const y = 150 + Math.sin(radian) * amp + Math.cos(radian * 2) * (amp * 0.3);
        points.push(`${x},${y}`);
      }
      
      paths.push(
        <path 
          key={w}
          d={`M ${points.join(' L ')}`}
          fill="none"
          stroke={`hsla(${hue}, 85%, 65%, ${0.35 + (w * 0.15)})`}
          strokeWidth={2 + (w * 0.5)}
          className="transition-all duration-300"
          style={{ mixBlendMode: 'screen' }}
        />
      );
    }
    return paths;
  };

  const generateHalftoneDots = () => {
    let dots = [];
    const rows = 12;
    const cols = 22;
    const densityPower = (complexity / 100) * 1.5 + 0.5;
    const maxRadius = (dimensionality / 100) * 12 + 2;
    const rippleFreq = (frequency / 100) * 15;
    const hue = chroma * 3.6;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 30 + c * 19;
        const y = 45 + r * 19;
        
        // Distance to center for beautiful mathematical ripples
        const dx = x - 225;
        const dy = y - 150;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const factor = Math.abs(Math.sin((dist / 300) * rippleFreq)) * densityPower;
        const radius = Math.min(maxRadius, Math.max(1, factor * 7.5));
        
        dots.push(
          <circle 
            key={`${r}-${c}`}
            cx={x}
            cy={y}
            r={radius}
            fill={`hsla(${(hue + dist * 0.2) % 360}, 80%, 60%, 0.85)`}
            className="transition-all duration-200"
          />
        );
      }
    }
    return dots;
  };

  const generateQuantumNodes = () => {
    let elements = [];
    const nodeCount = Math.floor(complexity / 8) + 8;
    const nodes: { x: number; y: number; s: number }[] = [];
    
    // Seeded random generation based on parameters 
    // to simulate procedural network architecture
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2 + (dimensionality * 0.02);
      const radius = 50 + (i % 3) * 35 + (frequency * 0.8);
      const x = 225 + Math.cos(angle) * radius;
      const y = 150 + Math.sin(angle) * radius;
      nodes.push({ x, y, s: 4 + (i % 4) * 3 });
    }

    // Generate link vectors
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Only connect nodes under certain proximity metric
        if (dist < 100 + (dimensionality * 0.5)) {
          const depthMultiplier = (1 - dist / (100 + (dimensionality * 0.5)));
          elements.push(
            <line 
              key={`l-${i}-${j}`}
              x1={nodes[i].x}
              y1={nodes[i].y}
              x2={nodes[j].x}
              y2={nodes[j].y}
              stroke={`hsla(${(chroma * 3.6 + dist * 0.3) % 360}, 90%, 70%, ${0.15 * depthMultiplier})`}
              strokeWidth={1 + depthMultiplier * 1.5}
            />
          );
        }
      }
    }

    // Render nodes
    nodes.forEach((node, idx) => {
      elements.push(
        <circle 
          key={`n-${idx}`}
          cx={node.x}
          cy={node.y}
          r={node.s}
          fill={`hsla(${(chroma * 3.6 + idx * 25) % 360}, 85%, 65%, 0.95)`}
          stroke="#000"
          strokeWidth={1}
          className="transition-all duration-300"
        />
      );
    });

    return elements;
  };

  // Generate custom visual based on Prompt seed
  const renderSynthesizedVisual = () => {
    const seedAngle = (generatedArtSeed % 100) * 3.6;
    const shapes = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (seedAngle * Math.PI / 180);
      const length = 40 + Math.sin(i * 1.5) * 45;
      const x1 = 150 + Math.cos(angle) * 20;
      const y1 = 150 + Math.sin(angle) * 20;
      const x2 = 150 + Math.cos(angle) * (length + 30);
      const y2 = 150 + Math.sin(angle) * (length + 30);
      
      shapes.push(
        <line 
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={`url(#synthGrad)`}
          strokeWidth={1.5 + (i % 3)}
          opacity={0.45 + (i % 5) * 0.12}
        />
      );

      // Node circles at endings
      shapes.push(
        <circle 
          key={`c-${i}`}
          cx={x2}
          cy={y2}
          r={3 + (i % 4)}
          fill={`hsla(${(seedAngle + i * 20) % 360}, 90%, 70%, 1)`}
          className="animate-pulse"
        />
      );
    }
    return shapes;
  };

  return (
    <div id="ai-homepage-wrapper" className="flex-1 w-full overflow-y-auto bg-gradient-to-b from-[#030303] via-[#070709] to-[#040405] text-[#eaeaea] custom-scrollbar selection:bg-indigo-600/30">
      
      {/* Immersive Dark Cosmic Glowing Decors */}
      <div className="absolute top-[10%] left-1/4 w-[35rem] h-[35rem] bg-indigo-700/8 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-10 w-[28rem] h-[28rem] bg-pink-700/8 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-10 w-[32rem] h-[32rem] bg-emerald-700/5 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Hero Visual Block */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-12 z-10 flex flex-col items-center text-center">
        {/* Subtle high-tech tag */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-semibold mb-8 animate-fade-in shadow-lg shadow-indigo-600/5">
          <Sparkles size={11} className="text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
          <span>Generative AI Procedural Laboratory suite</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>

        {/* Major Brand Headers */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-['Space_Grotesk'] tracking-tight text-white leading-[0.95] max-w-5xl">
          THE ART OF <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-400 bg-clip-text text-transparent drop-shadow-sm">PROCEDURAL</span> CREATIVE INTELLIGENCE.
        </h1>
        
        {/* Supporting description */}
        <p className="mt-8 text-sm sm:text-base md:text-lg text-white/50 font-sans max-w-3xl leading-relaxed">
          Unlock a high-fidelity playground of instant browser-native shaders, interconnected dynamic vector topologies, fluid mosaic structures, and cell-division simulations. Modeled with neural harmony.
        </p>

        {/* Dual Actions CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button 
            id="launch-studio-main-cta"
            onClick={() => onEnterStudio('main')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-2xl hover:shadow-indigo-500/20 active:translate-y-0.5 hover:-translate-y-0.5 border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-3 group"
          >
            <Zap size={14} className="text-white fill-white/20 animate-pulse" />
            <span>Launch Laboratory App</span>
            <ArrowRight size={14} className="text-white group-hover:translate-x-1.5 transition-transform" />
          </button>
          
          <a
            href="#interactive-playground"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0e0e11] hover:bg-[#131318] text-white/70 hover:text-white border border-white/5 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <MonitorPlay size={14} />
            <span>Try AI Engine Below</span>
          </a>
        </div>

        {/* System telemetry banner */}
        <div className="mt-14 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-white/5 rounded-2xl bg-zinc-950/40 backdrop-blur-md font-mono text-left">
          <div className="p-3 border-r border-white/5 last:border-r-0">
            <span className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Compute Core</span>
            <div className="text-white font-bold text-xs flex items-center gap-1.5">
              <Cpu size={12} className="text-indigo-400" />
              <span>GPU WebGL Raster</span>
            </div>
          </div>
          <div className="p-3 md:border-r border-white/5 last:border-r-0">
            <span className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Pipeline FPS</span>
            <div className="text-white font-bold text-xs flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400" />
              <span>{fps} FPS Dynamic</span>
            </div>
          </div>
          <div className="p-3 border-r border-white/5 last:border-r-0">
            <span className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Local Memory</span>
            <div className="text-white font-bold text-xs flex items-center gap-1.5">
              <Code size={12} className="text-purple-400" />
              <span>{gpuLoad}% Load ({memoryUsed} GB)</span>
            </div>
          </div>
          <div className="p-3">
            <span className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Model Accuracy</span>
            <div className="text-white font-bold text-xs flex items-center gap-1.5">
              <Award size={12} className="text-amber-400" />
              <span>V2.8 Tensor Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Procedural Playground Section */}
      <section id="interactive-playground" className="w-full max-w-7xl mx-auto px-6 py-16 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left panel: Info & Slider Parameters Controls */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-6 text-left">
            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase mb-2">Interactive Preview Sandbox</div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-['Space_Grotesk'] tracking-tight text-white leading-tight">
                Tweak parameters, synthesize in real-time.
              </h2>
              <p className="mt-4 text-sm text-white/50 leading-relaxed font-sans">
                Observe how adjustments immediately alter vector and mathematical matrix densities. This sandbox simulates the procedural parameter generation layers that fuel the main laboratory engines.
              </p>
            </div>

            {/* Presets Selection Tabs */}
            <div className="flex gap-2 p-1.5 bg-[#0b0c0e] border border-white/5 rounded-xl z-10">
              {(['aetheric', 'halftone', 'quantum'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setActivePreset(preset)}
                  className={`flex-1 py-2 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                    activePreset === preset 
                      ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-300 shadow-md' 
                      : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {preset === 'aetheric' ? '✦ Aether Wave' : preset === 'halftone' ? '░ Halftone Ripple' : '⚙ Quantum Net'}
                </button>
              ))}
            </div>

            {/* Custom Interactive Sliders UI */}
            <div className="flex flex-col gap-4 p-5 bg-[#090a0c] border border-white/5 rounded-2xl z-10 font-mono">
              <div className="flex items-center gap-2 mb-2 text-white/30 text-[10px] uppercase tracking-widest font-bold">
                <SlidersHorizontal size={12} className="text-indigo-400" />
                <span>Procedural Coefficients</span>
              </div>

              {/* Slider 1: Amplitude/Density */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center text-[10px] text-white/60 mb-1">
                  <span>COMPLEXITY INDEX</span>
                  <span className="text-indigo-400 font-bold">{complexity}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={complexity}
                  onChange={(e) => setComplexity(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-white/5 rounded-md cursor-pointer outline-none"
                />
              </div>

              {/* Slider 2: Dimensionality */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center text-[10px] text-white/60 mb-1">
                  <span>DIMENSION MULTIPLIER</span>
                  <span className="text-indigo-400 font-bold">{dimensionality}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={dimensionality}
                  onChange={(e) => setDimensionality(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-white/5 rounded-md cursor-pointer outline-none"
                />
              </div>

              {/* Slider 3: Chroma */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center text-[10px] text-white/60 mb-1">
                  <span>CHROMA SPECTRUM</span>
                  <span className="text-pink-400 font-bold">{chroma}° Hue</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={chroma}
                  onChange={(e) => setChroma(parseInt(e.target.value))}
                  className="w-full accent-pink-500 h-1 bg-white/5 rounded-md cursor-pointer outline-none"
                />
              </div>

              {/* Slider 4: Frequency */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center text-[10px] text-white/60 mb-1">
                  <span>WAVE FREQUENCY</span>
                  <span className="text-amber-400 font-bold">{frequency}Hz</span>
                </div>
                <input 
                  type="range" 
                  min="15" 
                  max="100" 
                  value={frequency}
                  onChange={(e) => setFrequency(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-white/5 rounded-md cursor-pointer outline-none"
                />
              </div>

              {/* Reset button inside panel */}
              <button
                onClick={() => setActivePreset('aetheric')}
                className="mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-white/5 bg-white/2 hover:bg-white/5 text-[10px] text-white/50 hover:text-white transition-all cursor-pointer"
              >
                <RotateCcw size={10} />
                <span>Reset Parameters</span>
              </button>
            </div>
          </div>

          {/* Right panel: Live Generated Render Frame simulating deep WebGL parameters */}
          <div className="col-span-1 lg:col-span-7 flex flex-col items-center">
            <div className="w-full aspect-4/3 max-w-2xl bg-[#050507] border border-white/10 rounded-2xl relative overflow-hidden shadow-2xl flex flex-col group">
              {/* Device browser header mockup */}
              <div className="px-4 py-3 bg-[#0d0d10] border-b border-white/5 flex items-center justify-between font-mono text-[9px] text-white/40 shrink-0 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
                  <span className="ml-2 font-semibold text-white/50 tracking-wide uppercase">Generative Viewport // CogniRender</span>
                </div>
                <div className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 uppercase font-bold text-[8px] tracking-wider leading-none">
                  VIRTUAL_GL_HOST_903
                </div>
              </div>

              {/* Central canvas stage holding our dynamic mathematical SVG paths */}
              <div className="flex-1 min-h-0 relative flex items-center justify-center bg-radial from-[#121319] to-[#040406] p-4 overflow-hidden">
                {/* Visual gridlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                
                {/* Center glowing spot */}
                <div className="absolute w-44 h-44 rounded-full bg-indigo-500/10 blur-[50px] pointer-events-none" />

                <svg 
                  className="w-full h-full max-h-[300px] max-w-[450px]" 
                  viewBox="0 0 450 300"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {activePreset === 'aetheric' && generateAethericPaths()}
                  {activePreset === 'halftone' && generateHalftoneDots()}
                  {activePreset === 'quantum' && generateQuantumNodes()}
                </svg>

                {/* Micro metrics watermarks on canvas edge */}
                <div className="absolute left-4 bottom-4 font-mono text-[8px] text-white/30 tracking-widest leading-normal">
                  COORD_SPACE: 450x300<br />
                  LATENT_COEF_X: {(complexity * 1.5).toFixed(1)}<br />
                  RESONANCE: {(frequency * 1.25).toFixed(1)}
                </div>
                
                <div className="absolute right-4 bottom-4 font-mono text-right text-[8px] text-indigo-400/50 tracking-widest uppercase font-bold">
                  MODEL STATE: ONLINE<br />
                  SAMPLE: {activePreset.toUpperCase()}
                </div>
              </div>

              {/* Frame footer for actions */}
              <div className="p-4 bg-[#08080b] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0">
                <span className="font-mono text-[10px] text-white/50 text-center sm:text-left">
                  Ready to test with fully loaded features in high fidelity?
                </span>
                <button
                  onClick={() => onEnterStudio('main')}
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Launch Main Control Deck</span>
                  <ChevronRight size={12} />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Featured Labs Carousel (The 5 powerful sub-visualizer suites) */}
      <section className="w-full max-w-7xl mx-auto px-6 py-16 z-10 relative">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-[#ff5500] uppercase mb-2 block">Multiversal Engines</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Space_Grotesk'] tracking-tight text-white">
            Explore 5 Dedicated Creative Laboratories.
          </h2>
          <p className="mt-4 text-sm text-white/40 max-w-2xl mx-auto">
            Each laboratory is a separate specialized synthesis matrix driven by deep WebGL computations, custom formulas, and user presets.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Lab 1: Halftone Source */}
          <div 
            onClick={() => onEnterStudio('main')}
            className="group p-5 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-indigo-500/30 hover:bg-[#0c0d12] transition-all cursor-pointer flex flex-col justify-between h-64 text-left"
          >
            <div>
              <div className="w-10 h-10 bg-indigo-600/10 rounded-xl border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Sliders size={18} />
              </div>
              <h3 className="text-sm font-bold font-mono text-white group-hover:text-indigo-400 transition-colors uppercase">
                Source Halftone
              </h3>
              <p className="mt-2 text-xs text-white/50 leading-relaxed font-sans">
                Render custom 3D models with detailed vector halftone dots. Absolute control over mesh sizes, light focus, and rotation.
              </p>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-400/60 group-hover:text-indigo-400 mt-4">
              <span>EXPLORE</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Lab 2: Vortex Mosaic */}
          <div 
            onClick={() => onEnterStudio('gradient')}
            className="group p-5 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-blue-500/30 hover:bg-[#0c0f16] transition-all cursor-pointer flex flex-col justify-between h-64 text-left"
          >
            <div>
              <div className="w-10 h-10 bg-blue-600/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Layers size={18} />
              </div>
              <h3 className="text-sm font-bold font-mono text-white group-hover:text-blue-400 transition-colors uppercase">
                Vortex Mosaic
              </h3>
              <p className="mt-2 text-xs text-white/50 leading-relaxed font-sans">
                Liquid fluid simulations combining rich linear gradients with flowing vortex nodes. High-fidelity motion and color blends.
              </p>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-blue-400/60 group-hover:text-blue-400 mt-4">
              <span>EXPLORE</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Lab 3: Physics Network */}
          <div 
            onClick={() => onEnterStudio('ribbons')}
            className="group p-5 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-orange-500/30 hover:bg-[#130d0a] transition-all cursor-pointer flex flex-col justify-between h-64 text-left"
          >
            <div>
              <div className="w-10 h-10 bg-orange-600/10 rounded-xl border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                <Activity size={18} />
              </div>
              <h3 className="text-sm font-bold font-mono text-white group-hover:text-orange-400 transition-colors uppercase">
                Physics Web
              </h3>
              <p className="mt-2 text-xs text-white/50 leading-relaxed font-sans">
                Interconnected dynamic node arrays interacting on spring physics coordinates. Perfect for high-tech digital structures.
              </p>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-orange-400/60 group-hover:text-orange-400 mt-4">
              <span>EXPLORE</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Lab 4: Infinite 3D Silk */}
          <div 
            onClick={() => onEnterStudio('silk')}
            className="group p-5 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-pink-500/30 hover:bg-[#130c11] transition-all cursor-pointer flex flex-col justify-between h-64 text-left"
          >
            <div>
              <div className="w-10 h-10 bg-pink-600/10 rounded-xl border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                <Compass size={18} />
              </div>
              <h3 className="text-sm font-bold font-mono text-white group-hover:text-pink-400 transition-colors uppercase">
                3D Light Silk
              </h3>
              <p className="mt-2 text-xs text-white/50 leading-relaxed font-sans">
                Continuous dynamic line sweeps rasterizing complex curves in full 3D space. Generates stunning space ribbon loops.
              </p>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-pink-400/60 group-hover:text-pink-400 mt-4">
              <span>EXPLORE</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Lab 5: Organic Cell Physics */}
          <div 
            onClick={() => onEnterStudio('cell')}
            className="group p-5 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-yellow-500/30 hover:bg-[#12120a] transition-all cursor-pointer flex flex-col justify-between h-64 text-left"
          >
            <div>
              <div className="w-10 h-10 bg-yellow-600/10 rounded-xl border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-4 group-hover:scale-110 transition-transform">
                <Sparkles size={18} />
              </div>
              <h3 className="text-sm font-bold font-mono text-white group-hover:text-yellow-400 transition-colors uppercase">
                Organic Cell
              </h3>
              <p className="mt-2 text-xs text-white/50 leading-relaxed font-sans">
                Voronoi-based cell grids replicating natural organic division and cellular structures under strict user force modifiers.
              </p>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-yellow-400/60 group-hover:text-yellow-400 mt-4">
              <span>EXPLORE</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* Prompts Neural Synthesis Core Playground */}
      <section className="w-full max-w-5xl mx-auto px-6 py-12 z-10 relative">
        <div className="bg-[#08080a] border border-white/10 rounded-3xl p-6 sm:p-10 relative overflow-hidden text-left shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-pink-500/10 to-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] uppercase tracking-widest font-bold mb-4">
            <Cpu size={14} className="animate-pulse" />
            <span>AI Neural Synthesis Sandbox (PROMPT CODES)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-['Space_Grotesk'] tracking-tight text-white mb-4">
            Input custom tags & synthesize unique designs.
          </h2>
          <p className="text-sm text-white/50 mb-8 max-w-2xl leading-relaxed">
            Synthesize shapes manually. Specify themes, materials, and motion rules inside our cognitive model simulation engine. Select a suggested starting point to begin.
          </p>

          <div className="flex flex-col gap-6">
            {/* Prompt input with synthesize button inside */}
            <div className="relative">
              <input 
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Enter custom generative tags..."
                className="w-full bg-[#0a0a0d] border border-white/10 rounded-xl px-4 py-4 pr-32 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/60 font-mono"
                disabled={isSynthesizing}
              />
              <button
                onClick={handleSynthesize}
                disabled={isSynthesizing || !promptInput}
                className="absolute right-2 top-2 bottom-2 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/30 text-white rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCw size={11} className="animate-spin" />
                    <span>{synthProgress}%</span>
                  </>
                ) : (
                  <>
                    <Zap size={10} className="fill-white" />
                    <span>Synthesize</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggetion chips */}
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => setPromptInput(sug)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 hover:border-white/10 text-[9px] text-white/50 hover:text-white font-mono transition-colors cursor-pointer"
                  disabled={isSynthesizing}
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Synthesizer Processing Logs & Dynamic Output Preview */}
            {(isSynthesizing || synthProgress === 100) && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 bg-zinc-950/80 rounded-2xl border border-white/5 p-4 items-stretch">
                
                {/* Visual result preview panel */}
                <div className="col-span-1 md:col-span-5 flex flex-col items-center justify-center p-3 bg-zinc-900/40 border border-white/5 rounded-xl min-h-[220px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial from-stone-900 via-zinc-950 to-zinc-950 opacity-40" />
                  
                  {isSynthesizing ? (
                    <div className="flex flex-col items-center gap-3 text-center z-10 font-mono text-[10px] text-indigo-400">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                        <Sparkles size={14} className="absolute inset-0 m-auto text-indigo-400 animate-pulse" />
                      </div>
                      <span className="animate-pulse">Rasterizing vectors...</span>
                    </div>
                  ) : (
                    <div className="z-10 flex flex-col items-center gap-4 w-full">
                      <div className="text-[9px] font-bold font-mono tracking-widest text-[#ff5500] uppercase mb-1">SEED RESULT #{generatedArtSeed}</div>
                      
                      {/* Generative customized SVG shape based on seed */}
                      <svg viewBox="0 0 300 300" className="w-40 h-40">
                        <defs>
                          <linearGradient id="synthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="50%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                        {renderSynthesizedVisual()}
                      </svg>

                      <button
                        onClick={() => onEnterStudio('main')}
                        className="px-4 py-1.5 rounded border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300 font-mono text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        Launch with result settings
                      </button>
                    </div>
                  )}
                </div>

                {/* Simulated compiling logs stream */}
                <div className="col-span-1 md:col-span-7 bg-[#050507] p-4 rounded-xl border border-white/5 flex flex-col gap-2 font-mono text-[9px] text-zinc-400 overflow-y-auto max-h-[220px] text-left">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-2 uppercase tracking-widest mb-1 font-semibold text-white/60">
                    <Terminal size={11} className="text-emerald-400" />
                    <span>Compiler Standard Streams // live</span>
                  </div>
                  {synthTerminalLogs.map((log, idx) => (
                    <div key={idx} className={`${idx === synthTerminalLogs.length - 1 ? 'text-emerald-400' : 'text-zinc-500'} font-mono leading-relaxed`}>
                      {log}
                    </div>
                  ))}
                  {isSynthesizing && (
                    <div className="text-zinc-600 animate-pulse mt-1">
                      [LOADING] Processing layer weights... [{(synthProgress / 100).toFixed(2)}]
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </section>

      {/* Premium Membership & Custom Licensing Tiers block */}
      <section className="w-full max-w-7xl mx-auto px-6 py-16 z-10 relative">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-[#00ff88] uppercase mb-2 block">Enterprise Models</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Space_Grotesk'] tracking-tight text-white">
            Simple License Plans for Every Creator.
          </h2>
          <p className="mt-4 text-sm text-white/40 max-w-2xl mx-auto">
            Experience premium-tier capabilities. Full WebM dynamic recordings up to 2160p (4K UHD) and continuous vector vector mapping.
          </p>
        </div>

        {/* Pricing panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Plan 1 */}
          <div className="p-6 rounded-2xl bg-zinc-950/40 border border-white/5 flex flex-col justify-between text-left">
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-500 uppercase">TIER 01</span>
              <h3 className="text-xl font-bold font-sans text-white mt-2">Hobbyist</h3>
              <p className="mt-2 text-xs text-zinc-500 font-sans">For exploring browser-native WebGL parameters and sandbox modes.</p>
              <div className="mt-6 flex items-baseline text-white">
                <span className="text-3xl font-extrabold font-sans">$0</span>
                <span className="ml-1 text-xs text-zinc-500 font-mono">/ Free forever</span>
              </div>
              <ul className="mt-6 space-y-3 font-mono text-[10px] text-[#bcbcbc]">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span>Access to 5 interactive matrix labs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span>Interactive canvas adjustments</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span>Single frame standard PNG exports</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => onEnterStudio('main')}
              className="mt-8 w-full py-3 rounded-lg border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-[10px] font-mono font-bold uppercase tracking-wider text-white transition-all cursor-pointer text-center"
            >
              Start Exploring
            </button>
          </div>

          {/* Plan 2: Best Choice with Indigo gradient border theme */}
          <div className="p-6 rounded-2xl bg-indigo-600/5 border-2 border-indigo-500/50 flex flex-col justify-between text-left relative shadow-2xl shadow-indigo-600/10">
            <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-indigo-600 text-white rounded-full font-mono text-[8px] font-bold uppercase tracking-wider">
              PRIME CHOICE
            </div>
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-indigo-400 uppercase">TIER 02</span>
              <h3 className="text-xl font-bold font-sans text-white mt-2">Design Pro</h3>
              <p className="mt-2 text-xs text-zinc-400 font-sans">For digital artists, directors, and procedural software creators.</p>
              <div className="mt-6 flex items-baseline text-white">
                <span className="text-3xl font-extrabold font-sans">$19</span>
                <span className="ml-1 text-xs text-zinc-500 font-mono">/ monthly token</span>
              </div>
              <ul className="mt-6 space-y-3 font-mono text-[10px] text-[#eaeaea]">
                <li className="flex items-center gap-2 font-bold text-indigo-300">
                  <Zap size={11} className="fill-indigo-400 text-indigo-400" />
                  <span>All 5 advanced laboratory engines</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span>High-Res PNG & Vector SVG downloads</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span>WebM dynamic capturing (720p/1080p)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span>Custom theme & gradient parameter sync</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => onEnterStudio('main')}
              className="mt-8 w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-mono font-bold uppercase tracking-wider text-white transition-all cursor-pointer text-center font-bold"
            >
              Get License Access
            </button>
          </div>

          {/* Plan 3 */}
          <div className="p-6 rounded-2xl bg-zinc-950/40 border border-white/5 flex flex-col justify-between text-left">
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-500 uppercase">TIER 03</span>
              <h3 className="text-xl font-bold font-sans text-white mt-2">Enterprise Lab</h3>
              <p className="mt-2 text-xs text-zinc-500 font-sans">For agencies requiring custom procedural assets and server pipelines.</p>
              <div className="mt-6 flex items-baseline text-white">
                <span className="text-3xl font-extrabold font-sans">$149</span>
                <span className="ml-1 text-xs text-zinc-500 font-mono">/ monthly token</span>
              </div>
              <ul className="mt-6 space-y-3 font-mono text-[10px] text-[#bcbcbc]">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span>Unlimited multi-user collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span>High Bitrate 2160p (4k UHD) exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span>API pipelines with Custom Shaders</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => onEnterStudio('main')}
              className="mt-8 w-full py-3 rounded-lg border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-[10px] font-mono font-bold uppercase tracking-wider text-white transition-all cursor-pointer text-center"
            >
              Contact Solutions
            </button>
          </div>

        </div>
      </section>

      {/* Footer Branding Area */}
      <footer className="w-full bg-[#050506] border-t border-white/5 py-10 px-6 mt-12 text-center select-none z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-black tracking-[0.25em] text-white font-mono uppercase">CogniStudio AI</h1>
            <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 uppercase tracking-widest leading-none">V2.8</span>
          </div>
          <p className="text-[11px] text-white/30 font-mono uppercase tracking-widest font-semibold max-w-xl leading-normal text-center sm:text-left">
            Autonomous WebGL synthesis suite powerered by advanced procedural mathematics. Designed for the browser-native design future.
          </p>
          <div className="text-[9px] text-white/20 font-mono uppercase mt-4">
            © {new Date().getFullYear()} CogniStudio Systems. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
