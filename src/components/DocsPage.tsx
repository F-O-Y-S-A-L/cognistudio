/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  X, HelpCircle, Sliders, Palette, Activity, Layers, Terminal, Sparkles, 
  ArrowLeft, CheckCircle2, Info, BookOpen, ChevronRight, Play, Eye,
  Book, Command, Code, Cpu, Database, Compass, Award, Shield, SlidersHorizontal, Settings, Info as InfoIcon
} from 'lucide-react';

type GuideTopic = 'overview' | 'source' | 'mosaic' | 'network' | 'silk' | 'cell';

export default function DocsPage() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState<GuideTopic>('overview');

  const topics: { id: GuideTopic; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'overview', label: 'Suite Overview', icon: BookOpen, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', desc: 'Understanding the main design suite principles.' },
    { id: 'source', label: 'Source Halftone', icon: Sliders, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20', desc: 'Synthesizing 3D coordinate meshes.' },
    { id: 'mosaic', label: 'Mosaic Studio', icon: Palette, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'Modeling fields of fluid vortexes.' },
    { id: 'network', label: 'Physics Network', icon: Activity, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', desc: 'Simulating elastic spring points.' },
    { id: 'silk', label: '3D Silk Brush', icon: Layers, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', desc: 'Trace self-weaving lines in 3D grid.' },
    { id: 'cell', label: 'Organic Cell Lab', icon: Sparkles, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', desc: 'Biological Voronoi subdivisions.' },
  ];

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-8 overflow-hidden relative z-10 font-sans selection:bg-indigo-500/30">
      
      {/* Dynamic ambient background textures */}
      <div className="absolute top-[20%] left-1/4 w-[30rem] h-[30rem] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-10 w-[24rem] h-[24rem] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* LEFT NAVIGATION COLUMN: Operating Index */}
      <div className="w-full lg:w-80 bg-[#07080a] border border-white/10 rounded-2xl flex flex-col text-slate-400 shrink-0 backdrop-blur-md relative z-10 shadow-2xl h-fit lg:max-h-[calc(90vh-100px)] lg:sticky lg:top-4">
        
        {/* Operations Manual header */}
        <div className="p-5 border-b border-white/5 bg-zinc-950/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
            <Command size={14} className="text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">CogniStudio Handbook</h2>
            <p className="text-[8px] text-white/30 uppercase tracking-widest font-semibold font-mono mt-0.5">Specifications manual v2.8</p>
          </div>
        </div>

        {/* Index Links Nav */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[300px] lg:max-h-none scrollbar-thin">
          <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest px-3 mb-2 font-mono">Index categories</div>
          {topics.map((topic) => {
            const Icon = topic.icon;
            const isSelected = activeTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                className={`w-full flex items-start gap-3.5 px-3.5 py-3 rounded-xl transition-all cursor-pointer border text-left ${
                  isSelected 
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-200' 
                    : 'bg-transparent border-transparent hover:bg-white/3 hover:text-white text-white/50'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${topic.color}`}>
                  <Icon size={14} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold font-mono uppercase tracking-wider truncate">{topic.label}</span>
                  <span className="block text-[9px] text-[#888c94] truncate mt-0.5 leading-none font-sans font-medium">{topic.desc}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Environment metadata details */}
        <div className="p-4 border-t border-white/5 bg-zinc-950/60 font-mono text-[9px] text-white/30 space-y-2 select-none">
          <div className="flex justify-between">
            <span>VERSION MODULE:</span>
            <span className="text-[#a5b4fc] font-bold">2.8.0-RELEASE</span>
          </div>
          <div className="flex justify-between">
            <span>CHASSIS INTEGRITY:</span>
            <span className="text-emerald-400 font-bold uppercase font-semibold">SYNCRONIZED</span>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive styled viewport */}
      <div className="flex-grow flex-1 bg-[#050608]/40 border border-white/10 rounded-2xl backdrop-blur-md flex flex-col min-w-0 overflow-hidden relative z-10 shadow-2xl">
        
        {/* Sub-Header Area */}
        <div className="px-6 py-4 border-b border-white/5 bg-[#0a0c10]/85 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            <h3 className="text-[10px] font-mono uppercase font-bold text-indigo-400 tracking-wider">
              DOCUMENTATION INDEX // {activeTopic.toUpperCase()}
            </h3>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-white/70 hover:text-white border border-white/10 transition-all text-[9px] font-mono font-bold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft size={11} className="text-indigo-400" />
            <span>HOME</span>
          </button>
        </div>

        {/* Dynamic Display of active manuals */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar select-text">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTopic}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              
              {/* === OVERVIEW === */}
              {activeTopic === 'overview' && (
                <div className="space-y-6 text-left">
                  <div className="space-y-3">
                    <h4 className="text-xl md:text-2xl font-black font-['Space_Grotesk'] text-white tracking-tight uppercase flex items-center gap-2">
                      <span>Interactive Procedural Suite Manual</span>
                      <Sparkles size={16} className="text-[#a5b4fc] animate-pulse" />
                    </h4>
                    <p className="text-white/60 leading-relaxed font-sans text-xs sm:text-sm">
                      Welcome to the professional operations manual for CogniStudio. The suite is composed of 5 advanced, highly customized interactive design engines running directly in your browser. Since calculations operate locally in-memory, you can experiment with full frame rates, real-time parameters, and vector generation pipelines without any processing lag.
                    </p>
                  </div>

                  {/* Architecture Block */}
                  <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      <Cpu size={14} />
                      <span>THE SEVERLESS WEBGL ENVIRONMENT</span>
                    </div>
                    <p className="text-[11px] text-[#9ca3af] leading-relaxed font-sans">
                      CogniStudio converts parameters like <strong>Complexity, Frequency, Damping, and Attraction force</strong> into direct procedural coordinates. By avoiding heavy external API dependencies of conventional software, the canvas processes equations instantly using Javascript's requestAnimationFrame loops.
                    </p>
                  </div>

                  {/* Step Guide */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">How to Explore the Suite</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-zinc-950/80 border border-white/5 rounded-xl space-y-2">
                        <span className="font-mono text-indigo-400 text-xs font-bold block">1. SELECT LAB</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Choose an engine from the header tabs (Source, Mosaic, Network, 3D Silk, Organic Cell). Each loading resets the control panel configuration to match the model.
                        </p>
                      </div>
                      <div className="p-4 bg-zinc-950/80 border border-white/5 rounded-xl space-y-2">
                        <span className="font-mono text-pink-400 text-xs font-bold block">2. DESIGN CONSTANTS</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Adjust sliders to manipulate calculations. Change colors via custom palettes, or type a custom text string to see text transformed into high-contrast arrays.
                        </p>
                      </div>
                      <div className="p-4 bg-zinc-950/80 border border-white/5 rounded-xl space-y-2">
                        <span className="font-mono text-amber-400 text-xs font-bold block">3. EXPORT MATRICES</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Record dynamic loops via the built-in media encoder, download vector SVG layers, or copy embedded responsive HTML iframe overlay cards.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Highlight Informative Code Box */}
                  <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-[9px] font-mono text-white/30 border-b border-white/5 pb-2">
                      <span className="flex items-center gap-1.5 uppercase font-bold">
                        <Terminal size={12} className="text-[#00ff88]" />
                        <span>CONFIG ENCODING STRUCT</span>
                      </span>
                      <span>JSON PROTOCOL v2</span>
                    </div>
                    <pre className="font-mono text-[10px] text-zinc-400 overflow-x-auto leading-relaxed p-2 select-text">
{`{
  "engine": "CogniStudio_AetherCore",
  "resolution": "RESPONSIVE_CANVAS_GL",
  "coefficients": {
    "damping": 0.957,
    "viscosity": 0.124,
    "springConstant": 0.450
  }
}`}
                    </pre>
                  </div>
                </div>
              )}

              {/* === SOURCE HALFTONE === */}
              {activeTopic === 'source' && (
                <div className="space-y-6 text-left">
                  <div className="space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 font-mono font-black text-xs">01</div>
                    <h4 className="text-xl md:text-2xl font-black font-['Space_Grotesk'] text-white tracking-tight uppercase flex items-center gap-2">
                      <span>Source Halftone Matrix Console</span>
                    </h4>
                    <p className="text-white/60 leading-relaxed font-sans text-xs">
                      The Source Halftone Engine translates three-dimensional vector mathematical coordinates, typographic text strings, or visual assets into beautiful, highly structured raster dot grids. Halftoning simulates shades of grey or color gradients by varying dot sizing.
                    </p>
                  </div>

                  {/* Mathematics of Halftones */}
                  <div className="p-5 rounded-2xl bg-[#090a0d] border border-sky-500/20 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                      <Cpu size={14} />
                      <span>THE MATHEMATICAL FORMULA</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Each individual vector dot's radius ($R$) is determined by calculating the luminance or distance projection on a rotating 3D mathematical shape mesh. For coordinates ($x, y$):
                    </p>
                    <pre className="p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-sky-300 overflow-x-auto leading-normal">
{`Formula:  R(x, y) = MaxRadius * Intensity(x, y) * SineRippleFactor
Where:  SineRippleFactor = abs(sin(x * Frequency + Time) * cos(y * Frequency + Time))`}
                    </pre>
                  </div>

                  {/* Core Sliders Explanation */}
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">Control Parameters Breakdown</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">DOT RESOLUTION (DENSITY)</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Configures the total coordinates step count. Lower values group dots into giant retro spheres, while higher values generate granular high-resolution visuals.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">SPECULAR ROTATION RADIUS</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Rotates the coordinates space of the 3D grid knots. Setting automatic pitch updates rotates the elements slowly along 3D orthographic matrices.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">GRADIENT OFFSET</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Clipping threshholds mapping. Tweaks contrast values, deciding whether vector edges fade smoothly or slice sharply like brutalist typography.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">WAVE FREQUENCY NOISE</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Injects high-frequency mathematical ripple distortions into the base coordinate mesh, translating circles into organic, shimmering textures.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Sandbox Step Guide */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">Step-by-Step Learning Guide</span>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-300 leading-relaxed font-sans pl-2">
                      <li>Use the dropdown inside the Sidebar to load different 3D models (e.g. <strong>Torus Knot</strong>, <strong>Double Mobius Loop</strong>, or select <strong>Custom Typography</strong>).</li>
                      <li>If selecting Custom Typography, input your custom name or tag into the text box. The Canvas immediately rasterizes your string into real-time coordinate arrays.</li>
                      <li>Adjust the <strong>Dot Resolution</strong> slide to <code className="px-1.5 py-0.5 rounded bg-zinc-900 font-mono text-sky-300">25</code>. This delivers a heavy poster-art dithered layout.</li>
                      <li>Adjust <strong>X/Y axis rotations</strong> to capture the perfect isometric spatial angle, then click "Download PNG" or "Copy Embed Code".</li>
                    </ol>
                  </div>

                  <div className="pt-4 flex items-center justify-end">
                    <button 
                      onClick={() => navigate('/')}
                      className="px-4 py-2 rounded bg-sky-500 text-black font-mono font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-sky-400 transition-colors flex items-center gap-1.5"
                    >
                      <Play size={12} />
                      <span>Launch Halftone Engine</span>
                    </button>
                  </div>
                </div>
              )}

              {/* === MOSAIC === */}
              {activeTopic === 'mosaic' && (
                <div className="space-y-6 text-left">
                  <div className="space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-black text-xs">02</div>
                    <h4 className="text-xl md:text-2xl font-black font-['Space_Grotesk'] text-white tracking-tight uppercase flex items-center gap-2">
                      <span>Vortex Mosaic Fluid Field</span>
                    </h4>
                    <p className="text-white/60 leading-relaxed font-sans text-xs">
                      The Vortex Mosaic Laboratory simulates complex computational fluid dynamics inside a matrix grids canvas. By calculating particle densities and introducing rotational torque centers (vortices), it renders beautiful liquid eddies that align perfectly with user movements.
                    </p>
                  </div>

                  {/* Physics of Fluid vortex fields */}
                  <div className="p-5 rounded-2xl bg-[#090a0d] border border-emerald-500/20 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      <Cpu size={14} />
                      <span>FLUID DYNAMICS EQUATION</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Points calculate velocity changes over time ($t$) influenced by friction, cursor attraction, and vortex torque. The speed equations calculate:
                    </p>
                    <pre className="p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-normal">
{`Velocity:  Velocity_Next = (Velocity_Current + TorqueAcceleration) * FrictionDamping
Where:     TorqueAngle = atan2(dy, dx) + Math.PI / 2.0
           TorqueAcceleration = VectorForce / (Distance + ViscositySmoothing)`}
                    </pre>
                  </div>

                  {/* Core Sliders Explanation */}
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">Control Parameters Explained</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">GRID RESIDENCE SIZES</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Specifies the density of the fluid particles layout. Increasing sizes yields dense networks, while decreasing sizes outputs a classic glowing grid coordinate mapping.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">VORTEX TURBULENCE STRENGTH</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Calibrates the rotational torque applied by vortices. Setting higher values produces spiraling hurricane bands that rip coordinates into spectacular cosmic trails.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">FRICTION DAMPING LAYER</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          The fluid state index. Higher friction stops orbits instantly once particles move away, whereas low friction creates continuous, infinite cosmic waves.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">PALETTE GRADIENT PROFILES</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Combines specific designer color charts (such as Obsidian, Jade, Sunset Velvet) to paint cells depending on active rotational speeds. This makes structural stress visible.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Step-by-Step Tutorial */}
                  <div className="space-y-4 font-sans">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">Step-by-Step Learning Guide</span>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-300 leading-relaxed pl-2 font-sans">
                      <li>Load <strong>Vortex Mosaic Mode</strong> inside the main navigation bar.</li>
                      <li>Choose a palette preset. Select <strong>Tokyo Cyber Neon</strong> to inject high-contrast blue, pink, and yellow glow elements.</li>
                      <li>Drag your mouse cursor over the canvas in a slow, circular motion. Notice how the dots cluster and spiral around your pointer in real-time.</li>
                      <li>Increase <strong>Vortex Strength</strong> to maximum. The cells will stretch into elegant orbit filaments that sweep the screen.</li>
                      <li>Click "Copy Code Widget" to grab the dynamic, self-contained HTML/CSS source code for your websites.</li>
                    </ol>
                  </div>

                  <div className="pt-4 flex items-center justify-end">
                    <button 
                      onClick={() => navigate('/mosaic')}
                      className="px-4 py-2 rounded bg-emerald-500 text-black font-mono font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-emerald-400 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play size={12} />
                      <span>Launch Fluid Mosaic Lab</span>
                    </button>
                  </div>
                </div>
              )}

              {/* === PHYSICS NETWORK === */}
              {activeTopic === 'network' && (
                <div className="space-y-6 text-left">
                  <div className="space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 font-mono font-black text-xs">03</div>
                    <h4 className="text-xl md:text-2xl font-black font-['Space_Grotesk'] text-white tracking-tight uppercase flex items-center gap-2">
                      <span>Physics Spring Network Grid</span>
                    </h4>
                    <p className="text-white/60 leading-relaxed font-sans text-xs">
                      The Physics Network simulates collections of interconnected nodes acting inside a closed, responsive gravitational sandbox. By connecting coordinates with Hookean spring constants and modeling friction dampening, it exhibits life-like bounce, tension, and kinetic reactions.
                    </p>
                  </div>

                  {/* Physics of Springs math */}
                  <div className="p-5 rounded-2xl bg-[#090a0d] border border-orange-500/20 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                      <Cpu size={14} />
                      <span>HOOKEAN HOOK BALANCE EQUATION</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      For any two connected points ($A$) and ($B$) separated by a distance ($D$), the acceleration force is calculated by using the spring constant ($k$) and a resting length ($L$):
                    </p>
                    <pre className="p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-orange-300 overflow-x-auto leading-normal">
{`SpringStretch = Distance_Current - SpringRestLength
F_Spring = -SpringConstant * SpringStretch
DampingVelocity = -DampingCoefficient * ParticleVelocity`}
                    </pre>
                  </div>

                  {/* Core Sliders Explanation */}
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">Control Parameters Demystified</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">NODES COUNT LIMIT</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Governs the amount of active physical bodies in the container. Lower limits are great for clean brutalist polygonal arrays, while high limits form dense neon webs.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">SPRING HOOK CONSTANT (STIFFNESS)</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          The elasticity index. Higher stiffness creates tight webs that rebound violently on hover, while lower stiffness forms soft, fluid-like connections.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">CURSOR ATTRACT MODE</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Declares how nodes react on cursor proximity. Modes include: <strong>Attract</strong> (points rush to pointer), <strong>Repel</strong> (mesh bounces away), and <strong>Shatter</strong> (explodes coordinates violently).
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">LINK PROXIMITY INDEX</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          The maximum spatial distance threshold below which two points compile a connecting vector line. Tweak this value to build meshes with variable skeletal densities.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Step-by-Step Tutorial */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">Step-by-Step Learning Guide</span>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-300 leading-relaxed pl-2 font-sans">
                      <li>Load the <strong>Physics Network Mode</strong> in the main laboratory navigation bar.</li>
                      <li>Toggle the cursor modifier option inside the panel and set it to <strong>Repel</strong>.</li>
                      <li>Quickly flick your mouse across the canvas nodes. Notice how the elastic connection lines stretch, shake, and settle back into rest positions.</li>
                      <li>Set <strong>Spring Stiffness</strong> to maximum and <strong>Viscosity</strong> to low. Explore how the grid oscillates like a rigid sheet of digital steel.</li>
                      <li>Toggle <strong>Grid Particles Visibility</strong> on or off to change the aesthetic from point-cloud grids to purely connected structures.</li>
                    </ol>
                  </div>

                  <div className="pt-4 flex items-center justify-end">
                    <button 
                      onClick={() => navigate('/network')}
                      className="px-4 py-2 rounded bg-orange-500 text-black font-mono font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-orange-400 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play size={12} />
                      <span>Launch Springs Laboratory</span>
                    </button>
                  </div>
                </div>
              )}

              {/* === 3D SILK PAINTING === */}
              {activeTopic === 'silk' && (
                <div className="space-y-6 text-left">
                  <div className="space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 font-mono font-black text-xs">04</div>
                    <h4 className="text-xl md:text-2xl font-black font-['Space_Grotesk'] text-white tracking-tight uppercase flex items-center gap-2">
                      <span>3D Silk Ribbon Painting Desk</span>
                    </h4>
                    <p className="text-white/60 leading-relaxed font-sans text-xs">
                      The 3D Silk Brush is a highly immersive spatial tool. It maps mouse drag patterns into continuous, multi-dimensional ribbon lines. By applying angular sweep rotations (3D polar transformations), it draws self-weaving curves that look spectacular.
                    </p>
                  </div>

                  {/* Math of 3D Ribbons */}
                  <div className="p-5 rounded-2xl bg-[#090a0d] border border-pink-500/20 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-pink-400 uppercase tracking-widest">
                      <Cpu size={14} />
                      <span>3D POLAR TRANSFORM THEORY</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      Drawn points are mapped in three dimensions and projected into flat screen space using orthographic perspective projections. Angular translation formulas determine point placements:
                    </p>
                    <pre className="p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-pink-300 overflow-x-auto leading-normal">
{`CoordinateX = ScaleFactor * Radius * sin(Theta) * cos(Phi) + CenterX
CoordinateY = ScaleFactor * Radius * sin(Theta) * sin(Phi) + CenterY
CoordinateZ = ScaleFactor * Radius * cos(Theta)`}
                    </pre>
                  </div>

                  {/* Core Sliders Explanation */}
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">Control Parameters Explained</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">TRAIL ACCUMULATION DURATION</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Sets the lifespan of drawn ribbon trails. Lower values cause lines to fade quickly like ethereal neon sparks, while a value of zero makes drawing lines infinite.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">SILK SWEEP SPEED</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          The speed of the autonomous 3D polar coordinate rotation. Higher velocities spiral lines into gorgeous spheres, while low speeds create elegant, linear ribbons.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">RIBBONS THICKNESS RANGE</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Tweaks parallel rendering paths. Higher settings draw massive satiny sheets that overlap, while lower settings trace narrow, hair-like glowing filaments.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">RESONANCE OSCILLATOR</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Injects high-velocity sinusoidal offset ripples, creating a satisfying organic jitter along drawn paths to mimic physical fabric friction.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Step-by-Step Tutorial */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">Step-by-Step Drawing Guide</span>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-300 leading-relaxed pl-2 font-sans">
                      <li>Load <strong>3D Silk Brush</strong>. Set the <strong>Trail Lifespan</strong> slider to <code className="px-1.5 py-0.5 rounded bg-zinc-900 font-mono text-pink-300">0</code> (for infinite drawing).</li>
                      <li>Choose a premium theme palette from the sidebar, such as <strong>Cosmic Neon Ribbons</strong> or <strong>Liquid Mercury Metal</strong>.</li>
                      <li>Slowly drag your pointer diagonally across the canvas in letters, loops, or infinity curves. Watch as coordinates spiral in 3D perspective grids.</li>
                      <li>Before beginning another drawing step, click <strong>"Start 5s Flow Loop Recording"</strong>. Draw your visual. When complete, the app compiles a seamless WebM looping animation layer which triggers a download instantly!</li>
                    </ol>
                  </div>

                  <div className="pt-4 flex items-center justify-end">
                    <button 
                      onClick={() => navigate('/silk')}
                      className="px-4 py-2 rounded bg-pink-500 text-black font-mono font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-pink-400 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play size={12} />
                      <span>Launch Silk Painting Lab</span>
                    </button>
                  </div>
                </div>
              )}

              {/* === ORGANIC CELLS === */}
              {activeTopic === 'cell' && (
                <div className="space-y-6 text-left">
                  <div className="space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 font-mono font-black text-xs">05</div>
                    <h4 className="text-xl md:text-2xl font-black font-['Space_Grotesk'] text-white tracking-tight uppercase flex items-center gap-2 font-bold">
                      <span>Organic Cell Voronoi Lab</span>
                    </h4>
                    <p className="text-white/60 leading-relaxed font-sans text-xs">
                      The Organic Cell Engine simulates cellular growth, division, and spatial partitioning using mathematically precise 2D Voronoi tessellation arrays. This recreates structures like crystal formations, honeycombs, and natural membrane fabrics.
                    </p>
                  </div>

                  {/* Math of Voronoi subdivisions */}
                  <div className="p-5 rounded-2xl bg-[#090a0d] border border-yellow-500/20 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-yellow-400 uppercase tracking-widest">
                      <Cpu size={14} />
                      <span>VORONOI MATHEMATICS</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      A Voronoi diagram partitions a plane into regions based on closeness to specific seed coordinates ($p$). For any point ($q$) in region ($R_i$), the Euclidean distance satisfies:
                    </p>
                    <pre className="p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-yellow-300 overflow-x-auto leading-normal">
{`Distance Metric:  Distance(q, p_i) < Distance(q, p_j)   (for all indexes j != i)
Where Distance:   EuclideanDistance = Math.sqrt(dx * dx + dy * dy)`}
                    </pre>
                  </div>

                  {/* Core Sliders Explanation */}
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">Control Parameters Explained</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">CELL COLONY POPULATION</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Configures the total quantity of seed coordinates in the grid. Lower values generate grand, brutalist geometric plates, while high settings output organic blood-vessel grids.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">SKETCH BOUNDARY TREMBLE</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Calculates high-frequency coordinate noise shifts along the connecting cell borders. Recreates the comforting hand-drawn tremor of traditional blueprint paper.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">METABALL ROUNDNESS</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Rounds cell corner edges. When roundness is increased, sharp geometric tiles morph into fluid liquid droplets, simulating microscopic cell division forces.
                        </p>
                      </div>

                      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1">
                        <span className="font-mono text-white text-[11px] font-bold block">INNER CELL PADDING (MARGINS)</span>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Extracts or shrinks cell boundaries relative to parent regions. Perfect for generating grid-aligned channels or creating visual neon separation spaces.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Step-by-Step Tutorial */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">Step-by-Step Learning Guide</span>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-300 leading-relaxed pl-2 font-sans">
                      <li>Load <strong>Organic Cell Lab Mode</strong> inside the main navigation.</li>
                      <li>Adjust the <strong>Colony Population</strong> slider to <code className="px-1.5 py-0.5 rounded bg-zinc-900 font-mono text-yellow-300">12</code> to draw some large plates.</li>
                      <li>Drag your mouse pointer over the canvas to see the points repel gently from your cursor, shifting regional borders dynamically.</li>
                      <li>Increase <strong>Cell Margins</strong> to open up glowing channels, then increase <strong>Metaball Roundness</strong> to convert sharp Voronoi cells into organic, dividing cell vectors.</li>
                      <li>Download lossy, scalable vector images via the **"Download Scalable Vector (.SVG)"** button to inspect the neat coordinate paths in illustrator apps!</li>
                    </ol>
                  </div>

                  <div className="pt-4 flex items-center justify-end">
                    <button 
                      onClick={() => navigate('/cell')}
                      className="px-4 py-2 rounded bg-yellow-500 text-black font-mono font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-yellow-400 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play size={12} />
                      <span>Launch Organic Cell Lab</span>
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
