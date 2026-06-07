/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef, useReducer } from 'react';
import { AppSettings, INITIAL_SETTINGS } from './types';
import PreviewHeader from './components/PreviewHeader';
import CanvasViewport from './components/CanvasViewport';
import ControlPanel from './components/ControlPanel';
import MosaicStudio from './components/MosaicStudio';
import ServeoNetwork from './components/ServeoNetwork';
import SilkGenerator from './components/SilkGenerator';
import CellGenerator from './components/CellGenerator';
import { Sparkles, Layers } from 'lucide-react';

const HISTORY_LIMIT = 20;

type AppAction =
  | { type: 'SET_SETTINGS'; settings: AppSettings }
  | { type: 'UNDO' }
  | { type: 'REDO' };

interface AppState {
  past: AppSettings[];
  present: AppSettings;
  future: AppSettings[];
}

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_SETTINGS': {
      if (action.settings === state.present) return state;

      const newPast = [...state.past, state.present].slice(-HISTORY_LIMIT);
      return {
        past: newPast,
        present: action.settings,
        future: [],
      };
    }
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    }
    default:
      return state;
  }
};

// Unicode-safe Base64 encoder and decoder
const encodeSettingsToBase64 = (settings: AppSettings): string => {
  try {
    const payload = JSON.stringify({ settings });
    return btoa(unescape(encodeURIComponent(payload)));
  } catch (error) {
    console.error('Failure encoding settings:', error);
    return '';
  }
};

const decodeSettingsFromBase64 = (base64: string): AppSettings | null => {
  try {
    const cleanBase64 = base64.replace(/^#/, '');
    if (!cleanBase64) return null;
    const payload = decodeURIComponent(escape(atob(cleanBase64)));
    const parsed = JSON.parse(payload);
    if (parsed && parsed.settings) {
      return parsed.settings;
    }
  } catch (error) {
    console.error('Failure decoding settings:', error);
  }
  return null;
};

const mergeSettings = (target: AppSettings, source: any): AppSettings => {
  const merged = { ...target };
  if (!source) return merged;

  if (source.sourceMode) merged.sourceMode = source.sourceMode;
  if (source.shapeKey) merged.shapeKey = source.shapeKey;
  if (source.textString !== undefined) merged.textString = source.textString;
  if (source.fontFamily) merged.fontFamily = source.fontFamily;
  if (source.fontSize) merged.fontSize = source.fontSize;
  if (source.imageSrc !== undefined) merged.imageSrc = source.imageSrc;

  if (source.lighting) {
    merged.lighting = { ...merged.lighting, ...source.lighting };
  }
  if (source.material) {
    merged.material = { ...merged.material, ...source.material };
  }
  if (source.halftone) {
    merged.halftone = { ...merged.halftone, ...source.halftone };
  }
  if (source.background) {
    merged.background = { ...merged.background, ...source.background };
  }
  if (source.animation) {
    merged.animation = { ...merged.animation, ...source.animation };
  }

  return merged;
};

export default function App() {
  const [activePage, setActivePage] = useState<'main' | 'gradient' | 'ribbons' | 'silk' | 'cell'>('main');
  const [state, dispatch] = useReducer(appReducer, {
    past: [],
    present: INITIAL_SETTINGS,
    future: [],
  });
  const settings = state.present;
  const setSettings = (newSettings: AppSettings | ((prev: AppSettings) => AppSettings)) => {
    if (typeof newSettings === 'function') {
      dispatch({ type: 'SET_SETTINGS', settings: newSettings(state.present) });
    } else {
      dispatch({ type: 'SET_SETTINGS', settings: newSettings });
    }
  };
  const [isHovered, setIsHovered] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Custom ref to call export engines in the canvas viewport
  const viewportRef = useRef<{
    getPNGDataURL: () => string | null;
    generateSVG: () => string | null;
  } | null>(null);

  // Parse location hash on mount to restore user designs
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const decoded = decodeSettingsFromBase64(hash);
      if (decoded) {
        setSettings((prev) => mergeSettings(prev, decoded));
        showToast('Success: Loaded configuration from URL hash preset!');
      }
    }
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Action: Copy Share Link
  const handleCopyLink = () => {
    const base64Str = encodeSettingsToBase64(settings);
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const shareUrl = base64Str ? `${origin}${pathname}#${base64Str}` : window.location.href;
    navigator.clipboard.writeText(shareUrl);
    showToast('Success: Live share link copied!');
  };

  // Action: Export PNG Capture
  const handleExportPNG = () => {
    if (!viewportRef.current) return;
    const url = viewportRef.current.getPNGDataURL();
    if (url) {
      const anchor = document.createElement('a');
      anchor.download = `twenty-halftone-${settings.sourceMode}-${settings.shapeKey || 'text'}.png`;
      anchor.href = url;
      anchor.click();
      showToast('Finished downloading PNG frame!');
    } else {
      showToast('Error generating PNG preview. Try again.');
    }
  };

  // Action: Export SVG Vector Grid
  const handleExportSVG = () => {
    if (!viewportRef.current) return;
    const svgStr = viewportRef.current.generateSVG();
    if (svgStr) {
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.download = `twenty-halftone-${settings.sourceMode}-${settings.shapeKey || 'text'}.svg`;
      anchor.href = url;
      anchor.click();
      showToast('Finished downloading high-contrast SVG vectors!');
    } else {
      showToast('Error compiling vector grid. Try again.');
    }
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#050505] text-[#e0e0e0] flex flex-col font-sans select-none antialiased">
      {/* Dynamic Floating Toast Alerts */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#0a0a0a] border border-white/10 text-white/90 text-xs font-mono font-medium tracking-wide px-4 py-3 rounded shadow-2xl flex items-center gap-2.5 transition-all animate-bounce">
          <Sparkles size={14} className="text-indigo-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Header Section */}
      <PreviewHeader 
        onUndo={() => dispatch({ type: 'UNDO' })}
        onRedo={() => dispatch({ type: 'REDO' })}
        settings={settings}
        onChange={setSettings}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Grid: Canvas + Sidebar or Ribbon Studio */}
      {activePage === 'cell' ? (
        <div className="flex-1 p-2 md:p-4 lg:p-6 overflow-y-auto lg:overflow-hidden min-h-0 flex flex-col bg-[#020202]">
          <CellGenerator />
        </div>
      ) : activePage === 'silk' ? (
        <div className="flex-1 p-2 md:p-4 lg:p-6 overflow-y-auto lg:overflow-hidden min-h-0 flex flex-col bg-[#020202]">
          <SilkGenerator />
        </div>
      ) : activePage === 'ribbons' ? (
        <div className="flex-grow flex-1 p-2 md:p-4 lg:p-6 overflow-y-auto lg:overflow-hidden min-h-0 flex flex-col bg-[#020202]">
          <ServeoNetwork />
        </div>
      ) : activePage === 'gradient' ? (
        <div className="flex-1 p-2 md:p-4 lg:p-6 overflow-y-auto lg:overflow-hidden min-h-0 flex flex-col bg-[#050505]">
          <MosaicStudio />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0">
          
          {/* Core Canvas Viewport */}
          <main className="flex-1 p-2 md:p-4 lg:p-6 flex flex-col gap-4 relative min-w-0 min-h-[400px] lg:min-h-0 shrink-0 lg:shrink">
            <div className="flex-1 relative rounded overflow-hidden shadow-2xl">
              <CanvasViewport
                settings={settings}
                onChange={setSettings}
                isHovered={isHovered}
                onHoverChange={setIsHovered}
                viewportRef={viewportRef}
                activePage={activePage}
              />
            </div>

            {/* Quick-stats and feature insights panel (Clean Margin Labels) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#080808] border border-white/10 rounded text-[11px] text-white/60 font-mono tracking-wide">
              <div className="flex items-center gap-2">
                <Layers size={13} className="text-indigo-400" />
                <span className="uppercase text-white/30 font-bold text-[10px] tracking-wider">Active Mode:</span>
                <span className="text-white uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5 text-[10px] font-bold">
                  Halftone Source
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-white/20">•</span>
                <span className="text-white/30 font-bold uppercase text-[9px] tracking-wider">DENSITY:</span>
                <span className="text-indigo-400 font-bold">{settings.halftone.scale}</span>
                <span className="text-xs text-white/20">•</span>
                <span className="text-white/30 font-bold uppercase text-[9px] tracking-wider">FUZZ:</span>
                <span className="text-indigo-400 font-bold">{settings.halftone.power}</span>
                <span className="text-xs text-white/20">•</span>
                <span className="text-white/30 font-bold uppercase text-[9px] tracking-wider">COMPRESSION:</span>
                <span className="text-indigo-400 font-bold">{settings.halftone.width}</span>
              </div>
            </div>
          </main>

          {/* Sidebar Controls Area */}
          <div className="w-full lg:w-[400px] shrink-0 bg-[#0a0a0a] border-l border-white/10 h-full overflow-hidden">
            <ControlPanel 
              settings={settings} 
              onChange={setSettings} 
              onCopyLink={handleCopyLink}
              onExportPNG={handleExportPNG}
              onExportSVG={handleExportSVG}
              onGetSVGCode={() => viewportRef.current?.generateSVG() ?? ''}
              onReset={() => {
                setSettings(INITIAL_SETTINGS);
                showToast('Success: All parameters reset to factory standards!');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

