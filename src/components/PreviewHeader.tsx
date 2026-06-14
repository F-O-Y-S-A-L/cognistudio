/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sliders, RotateCcw, RotateCw, RefreshCw, Palette, BookOpen, Info, Sparkles, HelpCircle, Home } from 'lucide-react';
import { AppSettings } from '../types';

interface PreviewHeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  settings: AppSettings;
  onChange: (fn: (prev: AppSettings) => AppSettings) => void;
  activePage: 'main' | 'gradient' | 'ribbons' | 'silk' | 'cell';
  setActivePage: (page: 'main' | 'gradient' | 'ribbons' | 'silk' | 'cell') => void;
  onOpenAbout: () => void;
  onOpenDocs: () => void;
  onReset?: () => void;
  onResetRotation?: () => void;
  onResetNetwork?: () => void;
  activeView?: 'home' | 'studio' | 'about' | 'docs';
  onGoHome?: () => void;
}

export default function PreviewHeader({ 
  onUndo, 
  onRedo, 
  settings, 
  onChange, 
  activePage, 
  setActivePage,
  onOpenAbout,
  onOpenDocs,
  onReset,
  onResetRotation,
  onResetNetwork,
  activeView = 'studio',
  onGoHome
}: PreviewHeaderProps) {
  const [showResetMenu, setShowResetMenu] = useState(false);
  return (
    <header className="w-full bg-[#070707] border-b border-white/5 px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 z-30 relative shrink-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        {/* Brand Information */}
        <div 
          onClick={onGoHome} 
          className="flex items-center gap-3 self-start sm:self-auto cursor-pointer group active:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 bg-linear-to-tr from-indigo-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/10 border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
            <Sliders size={15} className="text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-black tracking-[0.25em] text-white font-mono uppercase group-hover:text-indigo-400 transition-colors">CogniStudio</h1>
              <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 uppercase tracking-widest leading-none">V2</span>
            </div>
            <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest font-semibold mt-0.5">Procedural Synthesis Suite</p>
          </div>
        </div>
        
        {/* Main Laboratories Navigation Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center flex-1 max-w-2xl px-2">
          <button 
              onClick={onGoHome}
              className={`px-3 py-2 rounded-lg text-[9px] font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 ${activeView === 'home' ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30' : 'bg-white/2 hover:bg-white/5 text-white/55 hover:text-white border border-transparent'}`}
          >
              <Home size={11} className={`${activeView === 'home' ? 'text-indigo-400' : 'text-white/40'}`} />
              Home
          </button>

          <button 
              onClick={() => setActivePage('main')}
              className={`px-3 py-2 rounded-lg text-[9px] font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 ${activeView === 'studio' && activePage === 'main' ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-600/5' : 'bg-white/2 hover:bg-white/5 text-white/55 hover:text-white border border-transparent'}`}
          >
              <span className={`w-1.5 h-1.5 rounded-full ${activeView === 'studio' && activePage === 'main' ? 'bg-indigo-400' : 'bg-indigo-400/40'}`} />
              Source
          </button>
          
          <button 
              onClick={() => setActivePage('gradient')}
              className={`px-3 py-2 rounded-lg text-[9px] font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 ${activePage === 'gradient' ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-600/5' : 'bg-white/2 hover:bg-white/5 text-white/55 hover:text-white border border-transparent'}`}
          >
              <span className={`w-1.5 h-1.5 rounded-full ${activePage === 'gradient' ? 'bg-blue-400' : 'bg-blue-400/40'}`} />
              Mosaic
          </button>
          
          <button 
              onClick={() => setActivePage('ribbons')}
              className={`px-3 py-2 rounded-lg text-[9px] font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 ${activePage === 'ribbons' ? 'bg-[#ff5500]/15 text-[#ff7733] border border-[#ff5500]/30 shadow-md shadow-orange-600/5' : 'bg-white/2 hover:bg-white/5 text-white/55 hover:text-white border border-transparent'}`}
          >
              <span className={`w-1.5 h-1.5 rounded-full ${activePage === 'ribbons' ? 'bg-orange-500' : 'bg-orange-500/40'}`} />
              Network
          </button>
          
          <button 
              onClick={() => setActivePage('silk')}
              className={`px-3 py-2 rounded-lg text-[9px] font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 ${activePage === 'silk' ? 'bg-pink-600/15 text-pink-400 border border-pink-500/30' : 'bg-white/2 hover:bg-white/5 text-white/55 hover:text-white border border-transparent'}`}
          >
              <span className={`w-1.5 h-1.5 rounded-full ${activePage === 'silk' ? 'bg-pink-400' : 'bg-pink-400/40'}`} />
              3D Silk
          </button>
          
          <button 
              onClick={() => setActivePage('cell')}
              className={`px-3 py-2 rounded-lg text-[9px] font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 ${activePage === 'cell' ? 'bg-yellow-400/15 text-yellow-400 border border-yellow-500/30' : 'bg-white/2 hover:bg-white/5 text-white/55 hover:text-white border border-transparent'}`}
          >
              <span className={`w-1.5 h-1.5 rounded-full ${activePage === 'cell' ? 'bg-yellow-400' : 'bg-yellow-400/40'}`} />
              Organic Cell
          </button>
        </div>

        {/* Right Action Controls Area */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={onUndo}
            className="p-2 rounded-lg bg-white/2 hover:bg-white/6 hover:text-white border border-white/5 text-white/60 transition-all cursor-pointer"
            title="Undo"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={onRedo}
            className="p-2 rounded-lg bg-white/2 hover:bg-white/6 hover:text-white border border-white/5 text-white/60 transition-all cursor-pointer"
            title="Redo"
          >
            <RotateCw size={12} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowResetMenu(!showResetMenu)}
              className="p-2 rounded-lg bg-white/2 hover:bg-white/6 hover:text-white border border-white/5 text-white/60 transition-all cursor-pointer"
              title="Reset Options"
            >
              <RefreshCw size={12} />
            </button>
            {showResetMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-white/10 rounded-lg shadow-xl z-50 p-1 flex flex-col text-[11px] font-mono">
                {onReset && <button onClick={() => { onReset(); setShowResetMenu(false); }} className="px-3 py-2 text-left hover:bg-white/5 rounded text-white/70">Reset All</button>}
                {onResetRotation && <button onClick={() => { onResetRotation(); setShowResetMenu(false); }} className="px-3 py-2 text-left hover:bg-white/5 rounded text-white/70">Reset Rotation</button>}
                {onResetNetwork && <button onClick={() => { onResetNetwork(); setShowResetMenu(false); }} className="px-3 py-2 text-left hover:bg-white/5 rounded text-white/70">Reset Network</button>}
              </div>
            )}
          </div>
          <button
            className="p-2 rounded-lg bg-white/2 hover:bg-white/6 hover:text-white border border-white/5 text-white/60 transition-all cursor-pointer"
            title="Shortcut Hints: Cmd/Ctrl+Z for Undo, Cmd/Ctrl+Shift+Z for Redo"
          >
            <HelpCircle size={12} />
          </button>
          <button
            onClick={onOpenAbout}
            className="px-3 py-2 rounded-lg bg-white/2 hover:bg-white/6 hover:text-white border border-white/5 text-white/60 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            title="About Concept Lab"
          >
            <Info size={11} className="text-indigo-400" />
            About
          </button>

          <button
            onClick={onOpenDocs}
            className="px-3 py-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer relative overflow-hidden group"
            title="Interactive Operations Manual"
          >
            <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <BookOpen size={11} className="text-indigo-400 group-hover:animate-pulse" />
            Docs
          </button>
        </div>
      </div>
    </header>
  );
}
