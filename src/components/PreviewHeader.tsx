/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sliders, RotateCcw, RotateCw, Palette } from 'lucide-react';
import GradientManager from './GradientManager';
import { AppSettings } from '../types';

interface PreviewHeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  settings: AppSettings;
  onChange: (fn: (prev: AppSettings) => AppSettings) => void;
  activePage: 'main' | 'gradient' | 'ribbons' | 'silk' | 'cell';
  setActivePage: (page: 'main' | 'gradient' | 'ribbons' | 'silk' | 'cell') => void;
}

export default function PreviewHeader({ onUndo, onRedo, settings, onChange, activePage, setActivePage }: PreviewHeaderProps) {
  return (
    <header className="w-full bg-[#0a0a0a] border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4 relative">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-600/20 border border-indigo-400/20 shrink-0">
            <Sliders size={16} className="text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-[#e0e0e0] font-mono uppercase">CogniStudio</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-center md:flex-1 md:justify-end">
          <button 
              onClick={() => setActivePage('main')}
              className={`px-3 py-2 rounded text-xs font-bold uppercase transition-all duration-200 cursor-pointer flex-grow md:flex-grow-0 text-center ${activePage === 'main' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
              Source
          </button>
          <button 
              onClick={() => setActivePage('gradient')}
              className={`px-3 py-2 rounded text-xs font-bold uppercase transition-all duration-200 cursor-pointer flex-grow md:flex-grow-0 text-center ${activePage === 'gradient' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
              Mosaic
          </button>
          <button 
              onClick={() => setActivePage('ribbons')}
              className={`px-3 py-2 rounded text-xs font-bold uppercase transition-all duration-200 cursor-pointer flex-grow md:flex-grow-0 text-center ${activePage === 'ribbons' ? 'bg-[#ff5500] text-black shadow-lg shadow-[#ff5500]/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
              Network
          </button>
          <button 
              onClick={() => setActivePage('silk')}
              className={`px-3 py-2 rounded text-xs font-bold uppercase transition-all duration-200 cursor-pointer flex-grow md:flex-grow-0 text-center ${activePage === 'silk' ? 'bg-pink-650 text-white shadow-lg shadow-pink-650/40 border border-pink-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
              3D Silk
          </button>
          <button 
              onClick={() => setActivePage('cell')}
              className={`px-3 py-2 rounded text-xs font-bold uppercase transition-all duration-200 cursor-pointer flex-grow md:flex-grow-0 text-center ${activePage === 'cell' ? 'bg-[#ffeb3b] text-black shadow-lg shadow-yellow-400/30 border border-yellow-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
              Organic Cell
          </button>
        </div>
      </div>
    </header>
  );
}
