/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, Sparkles, Activity, Layers, Terminal, Award, 
  HelpCircle, ArrowLeft, GitPullRequest, Globe, Zap,
  CheckCircle, Hammer, Code, ArrowUpRight, Compass, Flame
} from 'lucide-react';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-12 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-0 relative z-10 font-sans selection:bg-indigo-500/30">
      
      {/* Immersive glowing orbs */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-0 w-[30rem] h-[30rem] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      {/* Dynamic Header Actions */}
      <div id="about-header" className="flex items-center justify-between border-b border-white/5 pb-6 z-10 relative">
        <button 
          id="back-to-studio-btn"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer font-mono text-[10px] font-bold uppercase tracking-wider shadow-lg"
        >
          <ArrowLeft size={13} className="text-indigo-400" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest text-emerald-400 font-semibold uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Integrity: Passed Secure Sandbox</span>
        </div>
      </div>

      {/* Hero Branding Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-widest text-[#a5b4fc] uppercase font-bold">
            <Sparkles size={11} className="text-indigo-400 animate-pulse" />
            <span>Procedural Mathematics & Art Integration</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-['Space_Grotesk'] tracking-tight text-white leading-tight">
            BEHIND THE <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">ALGORITHMIC</span> CANVAS.
          </h2>
          
          <p className="text-white/60 leading-relaxed font-sans text-sm md:text-base font-medium">
            CogniStudio is a high-fidelity laboratory developed to explore the boundaries of generative aesthetics. By marrying multi-dimensional vector math, spring physics equations, and real-time noise algorithms, it provides digital creators with a canvas where logic translates directly into elegant visual motion.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 font-mono text-[10px] uppercase font-bold text-white/70">
            <div className="flex items-center gap-1.5 bg-zinc-900/60 hover:bg-zinc-900 px-3 py-2 rounded-xl border border-white/5 transition-colors">
              <Cpu size={12} className="text-indigo-400" />
              <span>GPU Accelerated Shaders</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-900/60 hover:bg-zinc-900 px-3 py-2 rounded-xl border border-white/5 transition-colors">
              <Zap size={12} className="text-yellow-400" />
              <span>Instant WebM Captures</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-900/60 hover:bg-zinc-900 px-3 py-2 rounded-xl border border-white/5 transition-colors">
              <GitPullRequest size={12} className="text-purple-400" />
              <span>Zero Server Latency</span>
            </div>
          </div>
        </div>

        {/* Decorative Algorithmic Cube Map Widget representing 3D coordinates */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-radial from-indigo-950/20 to-zinc-950/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden group shadow-2xl flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-44 h-44 bg-linear-to-bl from-indigo-500/10 to-transparent rounded-full blur-[40px]" />
            
            <div className="flex items-center justify-between font-mono text-[9px] text-white/40 mb-8 border-b border-white/5 pb-3">
              <span>MODEL_GRID_DYNAMICS // C300</span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            </div>

            {/* Simulated 3D matrix wireframe */}
            <div className="relative h-44 flex items-center justify-center my-4 overflow-hidden">
              <svg className="w-40 h-40 transform group-hover:rotate-12 transition-transform duration-700" viewBox="0 0 100 100">
                {/* Cube coordinates vectors */}
                <polygon points="50,15 85,32 50,50 15,32" fill="none" stroke="rgba(129, 140, 248, 0.45)" strokeWidth="0.8" />
                <polygon points="15,32 50,50 50,90 15,70" fill="none" stroke="rgba(236, 72, 153, 0.35)" strokeWidth="0.8" />
                <polygon points="85,32 50,50 50,90 85,70" fill="none" stroke="rgba(245, 158, 11, 0.35)" strokeWidth="0.8" />
                
                {/* Intersecting rings */}
                <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" strokeWidth="0.8" />
                <circle cx="50" cy="50" r="24" fill="none" stroke="rgba(129, 140, 248, 0.25)" strokeWidth="0.8" />
                
                {/* Core particle center */}
                <circle cx="50" cy="50" r="4" fill="#a5b4fc" className="animate-ping" style={{ animationDuration: '2s' }} />
                <circle cx="50" cy="50" r="2.5" fill="#818cf8" />
              </svg>

              <div className="absolute left-0 bottom-0 font-mono text-[8px] text-white/30 text-left">
                X: 45.109<br />
                Y: 33.220<br />
                Z: 10.952
              </div>
            </div>

            <div className="mt-4 font-mono text-[9px] text-[#bcbcbc] flex justify-between items-center bg-zinc-950/60 p-2.5 rounded-xl border border-white/5">
              <span>CHASSIS TEMPERATURE:</span>
              <span className="text-[#00ff88] font-bold">28.5°C OPTIMAL</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: 4 Core Core Philosophies */}
      <section className="space-y-6 relative z-10">
        <div className="text-left">
          <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase">Framework Architecture</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] tracking-tight text-white mt-1">
            Core Principles Behind Every Pixel.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-6 rounded-2xl bg-[#090a0d] border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between text-left group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Compass size={18} />
              </div>
              <h4 className="text-sm font-bold font-mono text-white tracking-wider uppercase">Multi-Engine Laboratory</h4>
              <p className="mt-2 text-xs text-white/50 leading-relaxed font-sans">
                Exchange instant shaders with specialized formulas. Halftones, liquid vortex gradients, networks, silk trails, and cell splits operate side-by-side.
              </p>
            </div>
            <span className="text-[9px] font-mono font-bold text-indigo-400 mt-4 block">01 / DUALITY SYSTEM</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#090a0d] border border-white/5 hover:border-pink-500/30 transition-all flex flex-col justify-between text-left group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                <Activity size={18} />
               </div>
              <h4 className="text-sm font-bold font-mono text-white tracking-wider uppercase">Active Vector Kinetics</h4>
              <p className="mt-2 text-xs text-white/50 leading-relaxed font-sans">
                Points operate inside a coordinate cloud driven by physical speeds, friction coefficient dampers, magnetic vortex loops, and inertial decay forces.
              </p>
            </div>
            <span className="text-[9px] font-mono font-bold text-pink-400 mt-4 block">02 / INTERPOLATIVE CALCULATIONS</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#090a0d] border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between text-left group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Terminal size={18} />
              </div>
              <h4 className="text-sm font-bold font-mono text-white tracking-wider uppercase">Zero Quality Loss Export</h4>
              <p className="mt-2 text-xs text-white/50 leading-relaxed font-sans">
                Render pixel-perfect vectors. Download files losslessly as scalable vector files (.SVG), standard high-res PNG arrays, or upscaled WebM looping videos.
              </p>
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-400 mt-4 block">03 / LOSSLESS ENCODER COMPILER</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#090a0d] border border-white/5 hover:border-[#00ff88]/30 transition-all flex flex-col justify-between text-left group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center text-[#00ff88] mb-4 group-hover:scale-110 transition-transform">
                <Award size={18} />
              </div>
              <h4 className="text-sm font-bold font-mono text-white tracking-wider uppercase">Premium Visual Decors</h4>
              <p className="mt-2 text-xs text-white/50 leading-relaxed font-sans">
                Tailored typography matches responsive geometry configurations. Space Grotesk display headings align together with mono data feeds to secure luxury style.
              </p>
            </div>
            <span className="text-[9px] font-mono font-bold text-[#00ff88] mt-4 block">04 / ARCHITECTURAL TRUTH</span>
          </div>

        </div>
      </section>

      {/* Visual Workspace Stats Row */}
      <section className="bg-gradient-to-r from-zinc-950 via-[#0d0d10] to-zinc-950 border border-white/5 rounded-2xl p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center font-mono relative z-10">
        <div className="p-2 border-r border-white/5 last:border-0">
          <span className="block text-2xl sm:text-3xl font-black text-indigo-400 font-['Space_Grotesk']">144 FPS</span>
          <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest block mt-1">Calculations Frame Optimized</span>
        </div>
        <div className="p-2 lg:border-r border-white/5 last:border-0">
          <span className="block text-2xl sm:text-3xl font-black text-pink-500 font-['Space_Grotesk']">70+</span>
          <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest block mt-1">Aesthetic Themes Map</span>
        </div>
        <div className="p-2 border-r border-[#ffffff05] lg:border-r border-white/5 last:border-0">
          <span className="block text-2xl sm:text-3xl font-black text-[#00ff88] font-['Space_Grotesk']">0.0 ms</span>
          <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest block mt-1">Pipeline Stream Latency</span>
        </div>
        <div className="p-2">
          <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-['Space_Grotesk']">Browser Native</span>
          <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest block mt-1">Total Client Sandbox Integrity</span>
        </div>
      </section>

      {/* Tech Stack Blueprint / Interactive Section */}
      <section id="blueprint-section" className="p-8 border border-white/10 bg-[#08080c] rounded-3xl relative overflow-hidden text-left z-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-indigo-500/5 to-transparent rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] uppercase tracking-widest font-bold mb-4">
          <Flame size={12} className="animate-pulse" />
          <span>Under the Hood Technology</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] tracking-tight text-white mb-4">
          Engineered for local modern performance.
        </h3>
        
        <p className="text-sm text-white/50 mb-8 max-w-3xl leading-relaxed font-sans">
          The app uses high-frequency math formulas mapped into lightweight vector structures, preserving memory state and local render accuracy. No dynamic cloud database hops make rendering instantaneous and responsive.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          
          <div className="space-y-2 p-5 bg-[#0a0c10] border border-white/5 rounded-xl hover:bg-[#0c0f16] transition-colors text-left font-mono">
            <span className="font-bold text-indigo-400 text-[10px]">WEBGL / SVG HYBRID RESIZE</span>
            <p className="text-white/40 leading-relaxed font-sans text-xs">
              We leverage clean canvas math calculations, automatically listening to window dimension changes through ResizeObserver cycles. Say goodbye to static calculations typos!
            </p>
          </div>

          <div className="space-y-2 p-5 bg-[#0a0c10] border border-white/5 rounded-xl hover:bg-[#0c0f16] transition-colors text-left font-mono">
            <span className="font-bold text-pink-400 text-[10px]">TENSOR INERTIER SPRING</span>
            <p className="text-white/40 leading-relaxed font-sans text-xs">
              Interactions compute custom Hookean elasticity ratios. This delivers satisfying fluid bounce coordinates when manipulating elements inside active canvas modes.
            </p>
          </div>

          <div className="space-y-2 p-5 bg-[#0a0c10] border border-white/5 rounded-xl hover:bg-[#0c0f16] transition-colors text-left font-mono">
            <span className="font-bold text-amber-400 text-[10px]">PROMPT TRANSLATION LOGS</span>
            <p className="text-white/40 leading-relaxed font-sans text-xs font-serif">
              Our unique tags synthesis playground converts keywords into specific mathematical seed coefficients, allowing you to quickly explore abstract procedural art natively.
            </p>
          </div>

        </div>
      </section>

      {/* Labs Quick Launch Cards */}
      <section className="space-y-4 relative z-10">
        <h4 className="text-xs font-mono font-bold uppercase text-white/40 tracking-wider text-left">Quick Launch Specialty Laboratories</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {([
            { id: '', label: 'Source Mesh', color: 'hover:border-indigo-500/30 hover:bg-[#0f0e1a]' },
            { id: 'mosaic', label: 'Vortex Mosaic', color: 'hover:border-blue-500/30 hover:bg-[#0e121a]' },
            { id: 'network', label: 'Physics Web', color: 'hover:border-orange-500/30 hover:bg-[#1a110e]' },
            { id: 'silk', label: '3D Silk Brush', color: 'hover:border-pink-500/30 hover:bg-[#1a0e14]' },
            { id: 'cell', label: 'Voronoi Organic', color: 'hover:border-yellow-500/30 hover:bg-[#1a190e]' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(`/${tab.id}`)}
              className={`px-4 py-3.5 rounded-xl border border-white/5 bg-zinc-950/40 text-white/60 hover:text-white transition-all cursor-pointer font-mono font-bold uppercase text-[9px] tracking-widest text-center ${tab.color}`}
            >
              🚀 {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Footer information bar */}
      <footer className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono relative z-10">
        <div className="flex items-center gap-2 text-white/30 text-[10px] text-center sm:text-left">
          <HelpCircle size={12} className="text-indigo-400 shrink-0" />
          <span>Seeking specific calculations setup? Go find them in our Interactive manual docs.</span>
        </div>
        <div className="text-white/30 text-[10px]">
          Suite Integrity: <span className="text-emerald-400 font-bold uppercase">Passed Secure Sandbox Checks</span>
        </div>
      </footer>

    </div>
  );
}
