/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Copy, 
  Palette, 
  Play, 
  Pause, 
  Sparkles, 
  Sliders, 
  Layers, 
  Video, 
  Code,
  Check,
  RefreshCw,
  Sun,
  Upload,
  Image as ImageIcon,
  Tv,
  Eye,
  Info,
  Maximize2,
  Star,
  Film,
  Trash
} from 'lucide-react';
import { 
  SilkRibbonSetting, 
  Node3D, 
  drawPresetToMatrix, 
  parseHexToRGB, 
  getChromaColor 
} from './ThreeDMatrixHelper';

interface GeometryFilterItem {
  id: string;
  label: string;
  style: 'points' | 'wireframe' | 'mesh' | 'plexus' | 'stipple' | 'ascii' | 'topological_contour' | 'disintegrated_voxels';
  desc: string;
}

const geometryFilters: GeometryFilterItem[] = [
  // Plexus based
  { id: 'plexus_classic', label: 'Plexus Core', style: 'plexus', desc: 'Standard interconnected constellation grid' },
  { id: 'plexus_constellation', label: 'Ethereal Starfield', style: 'plexus', desc: 'Sparsely connected high-altitude node field' },
  { id: 'plexus_lattice', label: 'Quantum Lattice', style: 'plexus', desc: 'Denser connection bridges with micro points' },
  
  // Stipple based
  { id: 'stipple_classic', label: 'Stippled Dust', style: 'stipple', desc: 'Shaded halftone particle clouds' },
  { id: 'stipple_micro', label: 'Atomic Vapor', style: 'stipple', desc: 'Ultra-fine stippling with high particle count' },
  { id: 'stipple_giant', label: 'Fluid Globs', style: 'stipple', desc: 'Oversized luminous pixel clusters' },
  
  // ASCII based
  { id: 'ascii_binary', label: 'Binary Waterfall', style: 'ascii', desc: 'Nostalgic matrix with 0 and 1 streams' },
  { id: 'ascii_matrix', label: 'Terminal Scroll', style: 'ascii', desc: 'Classic alphanumeric machine code array' },
  { id: 'ascii_hex', label: 'Hexadecimal Core', style: 'ascii', desc: 'Base-16 software scanning layout' },
  
  // Contour based
  { id: 'contour_classic', label: 'Contours Classic', style: 'topological_contour', desc: 'Topographical altitude lines matching image' },
  { id: 'contour_wave', label: 'Satin Ribbon Wave', style: 'topological_contour', desc: 'Dense flowing elevation sheets' },
  { id: 'contour_heat', label: 'Thermal Isotherms', style: 'topological_contour', desc: 'Wide neon isometric band boundaries' },
  
  // Disintegrated Voxels based
  { id: 'sand_decay', label: 'Sand Disintegration', style: 'disintegrated_voxels', desc: 'Melting voxels that drop downwards' },
  { id: 'voxel_torrent', label: 'Data Torrent', style: 'disintegrated_voxels', desc: 'Highly reactive falling pixel code fragments' },
  { id: 'voxel_heavy', label: 'Cosmic Ash Rain', style: 'disintegrated_voxels', desc: 'Slow, heavy falling ash cubes' },
  
  // Points based
  { id: 'points_classic', label: 'Standard Particles', style: 'points', desc: 'Simple round point cloud representation' },
  { id: 'points_soft', label: 'Interstellar Nebula', style: 'points', desc: 'Microscopic points creating vapor sheen' },
  { id: 'points_glitched', label: 'Aberration Dust', style: 'points', desc: 'Heavy RGB horizontal chromatic offset splinters' },
  
  // Wireframe based
  { id: 'wireframe_grid', label: 'Classic Wireframe', style: 'wireframe', desc: 'Empty polygonal grid framework' },
  { id: 'wireframe_dense', label: 'Brutalist Blueprint', style: 'wireframe', desc: 'Dense architecture layout design sheets' },
  { id: 'wireframe_wave', label: 'Dynamic Scanlines', style: 'wireframe', desc: 'Rhythmic vector strands moving in sequence' },
  
  // Mesh based
  { id: 'mesh_shaded', label: 'Shaded Faces', style: 'mesh', desc: 'Flat retro-shaded polygonal meshes' },
  { id: 'mesh_shiny', label: 'Prismatic Shells', style: 'mesh', desc: 'Chrome-shaded reflective surface elements' },
  { id: 'mesh_solid', label: 'Glass Topography', style: 'mesh', desc: 'Heavy extruded solid block elements' }
];

export default function SilkGenerator() {
  // --- Common Configuration States ---
  const [generatorMode, setGeneratorMode] = useState<'ribbon' | 'mediamesh'>('mediamesh');
  const [isTransparentBg, setIsTransparentBg] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#040608');
  const [animate, setAnimate] = useState(true);
  const [speed, setSpeed] = useState(0.45);
  const [opacity, setOpacity] = useState(0.9);
  
  // 3D dual-axis rotation angles
  const [pitchAngle, setPitchAngle] = useState(25); // X-axis vertical tilt
  const [rotationAngle, setRotationAngle] = useState(45); // Y-axis horizontal yaw (backward-compatible)
  const [isometricMode, setIsometricMode] = useState(false);
  
  const [bgBlur, setBgBlur] = useState(0);
  const [meshBlur, setMeshBlur] = useState(0);
  const [mouseMode, setMouseMode] = useState<'hover' | 'drag' | 'none'>('hover');
  const [mouseStrength, setMouseStrength] = useState(0.65);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'animation' | 'export'>('design');

  // --- Enhanced Aesthetic Customization States ---
  const [presetSearch, setPresetSearch] = useState('');
  const [presetFilter, setPresetFilter] = useState<'all' | 'ribbon' | 'mediamesh'>('all');
  const [chromaColorStart, setChromaColorStart] = useState('#ff007f');
  const [chromaColorEnd, setChromaColorEnd] = useState('#7a00ff');
  const [selectedRibbonId, setSelectedRibbonId] = useState<number>(1);
  const [autoYawSpeed, setAutoYawSpeed] = useState(0.12);
  const [autoPitchSpeed, setAutoPitchSpeed] = useState(0.04);
  const [showCodeHub, setShowCodeHub] = useState(false);
  const [codeHubTab, setCodeHubTab] = useState<'embed' | 'script' | 'guide'>('embed');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // --- Ribbon Mode States ---
  const [numRibbons, setNumRibbons] = useState(4);
  const [ribbons, setRibbons] = useState<SilkRibbonSetting[]>([
    { id: 1, colorStart: '#ff007f', colorEnd: '#7a00ff', twistPhase: 0 },
    { id: 2, colorStart: '#00f2fe', colorEnd: '#1b45ff', twistPhase: Math.PI / 3 },
    { id: 3, colorStart: '#ffbe3b', colorEnd: '#ff5e62', twistPhase: (2 * Math.PI) / 3 },
    { id: 4, colorStart: '#00f260', colorEnd: '#0575e6', twistPhase: Math.PI },
    { id: 5, colorStart: '#fa8bff', colorEnd: '#2bd2ff', twistPhase: Math.PI * 1.2 },
    { id: 6, colorStart: '#ff5858', colorEnd: '#f857a6', twistPhase: Math.PI * 1.5 }
  ]);
  const [waveIntensity, setWaveIntensity] = useState(70);
  const [thickness, setThickness] = useState(130);
  const [lightIntensity, setLightIntensity] = useState(0.85);
  const [twistRate, setTwistRate] = useState(1.4);
  const [shadingDetail, setShadingDetail] = useState(45);
  const [wavePattern, setWavePattern] = useState<'satin' | 'turbulent' | 'spiral' | 'sea_swell'>('satin');
  const [waveFrequency, setWaveFrequency] = useState(1.0);
  const [twistSpeed, setTwistSpeed] = useState(2.1);

  // --- Creative 3D Media Mesh Mode States ---
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'preset'>('preset');
  const [presetIndex, setPresetIndex] = useState(0);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedVideoSrc, setUploadedVideoSrc] = useState<string | null>(null);
  
  // Geometry Styles matching precise reference items
  const [meshStyle, setMeshStyle] = useState<'points' | 'wireframe' | 'mesh' | 'plexus' | 'stipple' | 'ascii' | 'topological_contour' | 'disintegrated_voxels'>('plexus');
  const [activeGeometryFilter, setActiveGeometryFilter] = useState<string>('plexus_classic');
  
  // Quality & Preprocessing filters
  const [gridDensity, setGridDensity] = useState(45); // Mesh point rows/columns (e.g. 45x45)
  const [extrusionDepth, setExtrusionDepth] = useState(120); // Z height stretching
  const [particleSize, setParticleSize] = useState(3.5); // Weight sizing
  const [meshWaveScale, setMeshWaveScale] = useState(20); // Idle wavy breeze ripple amplitude
  const [colorProfile, setColorProfile] = useState<'media' | 'chroma' | 'neon'>('chroma');

  // Special Creative Filters matching the outstanding designs
  const [chromaticAberration, setChromaticAberration] = useState(4); // RGB split offset in pixels (0 for off)
  const [glitchIntensity, setGlitchIntensity] = useState(0); // Horizon scanline offsets (0 for off)
  const [contrastBoost, setContrastBoost] = useState(1.1); // Pre-brightness image contrast multiplier
  const [brightnessThreshold, setBrightnessThreshold] = useState(0.05); // High-pass threshold filter to dissolve dark backings
  const [plexusMaxDistance, setPlexusMaxDistance] = useState(40); // Maximum 2D distance to link plexus wires
  const [plexusMaxConnections, setPlexusMaxConnections] = useState(5); // Bound connection counts per node
  const [asciiCharacterPalette, setAsciiCharacterPalette] = useState<'matrix' | 'binary' | 'typographic' | 'symbols'>('matrix');
  const [particleDecaySpeed, setParticleDecaySpeed] = useState(2.5); // Dissolution rising float speed
  const [contourLevels, setContourLevels] = useState(12); // Count rings divider

  // Refs & Media Controllers
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedBlobsRef = useRef<Blob[]>([]);
  const isRecordingHighResRef = useRef(false);
  const recordingScaleRef = useRef(1);
  const animationFrameId = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // --- 5-SECOND LOOP RECORDER, FAVORITES & UNDO/REDO ENGINES ---
  const [recordCountdown, setRecordCountdown] = useState<number | null>(null);
  const [localHistory, setLocalHistory] = useState<any[]>([]);
  const [localFuture, setLocalFuture] = useState<any[]>([]);
  const lastSavedConfigRef = useRef<any>(null);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('favorites_silk_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customPresets, setCustomPresets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('custom_silk_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newPresetName, setNewPresetName] = useState('');

  const getCurrentConfig = () => {
    return {
      generatorMode,
      chromaColorStart,
      chromaColorEnd,
      selectedRibbonId,
      autoYawSpeed,
      autoPitchSpeed,
      numRibbons,
      ribbons,
      waveIntensity,
      thickness,
      lightIntensity,
      twistRate,
      shadingDetail,
      wavePattern,
      waveFrequency,
      twistSpeed,
      mediaType,
      presetIndex,
      meshStyle,
      activeGeometryFilter,
      gridDensity,
      extrusionDepth,
      particleSize,
      meshWaveScale,
      colorProfile,
      chromaticAberration,
      glitchIntensity,
      contrastBoost,
      brightnessThreshold,
      plexusMaxDistance,
      plexusMaxConnections,
      asciiCharacterPalette,
      particleDecaySpeed,
      contourLevels
    };
  };

  const applyConfig = (conf: any) => {
    if (!conf) return;
    if (conf.generatorMode !== undefined) setGeneratorMode(conf.generatorMode);
    if (conf.chromaColorStart !== undefined) setChromaColorStart(conf.chromaColorStart);
    if (conf.chromaColorEnd !== undefined) setChromaColorEnd(conf.chromaColorEnd);
    if (conf.selectedRibbonId !== undefined) setSelectedRibbonId(conf.selectedRibbonId);
    if (conf.autoYawSpeed !== undefined) setAutoYawSpeed(conf.autoYawSpeed);
    if (conf.autoPitchSpeed !== undefined) setAutoPitchSpeed(conf.autoPitchSpeed);
    if (conf.numRibbons !== undefined) setNumRibbons(conf.numRibbons);
    if (conf.ribbons !== undefined) setRibbons(conf.ribbons);
    if (conf.waveIntensity !== undefined) setWaveIntensity(conf.waveIntensity);
    if (conf.thickness !== undefined) setThickness(conf.thickness);
    if (conf.lightIntensity !== undefined) setLightIntensity(conf.lightIntensity);
    if (conf.twistRate !== undefined) setTwistRate(conf.twistRate);
    if (conf.shadingDetail !== undefined) setShadingDetail(conf.shadingDetail);
    if (conf.wavePattern !== undefined) setWavePattern(conf.wavePattern);
    if (conf.waveFrequency !== undefined) setWaveFrequency(conf.waveFrequency);
    if (conf.twistSpeed !== undefined) setTwistSpeed(conf.twistSpeed);
    if (conf.mediaType !== undefined) setMediaType(conf.mediaType);
    if (conf.presetIndex !== undefined) setPresetIndex(conf.presetIndex);
    if (conf.meshStyle !== undefined) setMeshStyle(conf.meshStyle);
    if (conf.activeGeometryFilter !== undefined) setActiveGeometryFilter(conf.activeGeometryFilter);
    if (conf.gridDensity !== undefined) setGridDensity(conf.gridDensity);
    if (conf.extrusionDepth !== undefined) setExtrusionDepth(conf.extrusionDepth);
    if (conf.particleSize !== undefined) setParticleSize(conf.particleSize);
    if (conf.meshWaveScale !== undefined) setMeshWaveScale(conf.meshWaveScale);
    if (conf.colorProfile !== undefined) setColorProfile(conf.colorProfile);
    if (conf.chromaticAberration !== undefined) setChromaticAberration(conf.chromaticAberration);
    if (conf.glitchIntensity !== undefined) setGlitchIntensity(conf.glitchIntensity);
    if (conf.contrastBoost !== undefined) setContrastBoost(conf.contrastBoost);
    if (conf.brightnessThreshold !== undefined) setBrightnessThreshold(conf.brightnessThreshold);
    if (conf.plexusMaxDistance !== undefined) setPlexusMaxDistance(conf.plexusMaxDistance);
    if (conf.plexusMaxConnections !== undefined) setPlexusMaxConnections(conf.plexusMaxConnections);
    if (conf.asciiCharacterPalette !== undefined) setAsciiCharacterPalette(conf.asciiCharacterPalette);
    if (conf.particleDecaySpeed !== undefined) setParticleDecaySpeed(conf.particleDecaySpeed);
    if (conf.contourLevels !== undefined) setContourLevels(conf.contourLevels);
  };

  const saveToHistory = (newConf: any) => {
    if (lastSavedConfigRef.current && JSON.stringify(lastSavedConfigRef.current) === JSON.stringify(newConf)) {
      return;
    }
    setLocalHistory(prev => {
      const updated = [...prev, lastSavedConfigRef.current || newConf];
      if (updated.length > 50) updated.shift();
      return updated;
    });
    setLocalFuture([]);
    lastSavedConfigRef.current = newConf;
  };

  const handleRecord5Sec = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      triggerToast('Error: Canvas coordinate viewport not initialized.');
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
    
    let targetHeight = 1080; 
    let scale = targetHeight / originalHeight;
    let finalWidth = originalWidth * scale;
    let finalHeight = originalHeight * scale;

    isRecordingHighResRef.current = true;
    recordingScaleRef.current = scale;
    canvas.width = Math.floor(finalWidth);
    canvas.height = Math.floor(finalHeight);

    recordedBlobsRef.current = [];
    const stream = canvas.captureStream(30);

    let options = { 
      mimeType: 'video/webm;codecs=vp9,opus', 
      videoBitsPerSecond: 12000000 
    };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { 
        mimeType: 'video/webm', 
        videoBitsPerSecond: 12000000 
      };
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      setRecordingStatus('recording');
      setRecordCountdown(5);

      const intervalId = setInterval(() => {
        setRecordCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(intervalId);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedBlobsRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        clearInterval(intervalId);
        setRecordCountdown(null);
        isRecordingHighResRef.current = false;
        if (containerRef.current) {
          canvas.width = containerRef.current.clientWidth;
          canvas.height = containerRef.current.clientHeight;
        }
        setRecordingStatus('idle');
        const superBuffer = new Blob(recordedBlobsRef.current, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(superBuffer);
        const link = document.createElement('a');
        link.download = `silk-flow-5s-loop-${Date.now()}.webm`;
        link.href = videoURL;
        link.click();
        triggerToast('Success: 5s Flow Loop Recorder complete!');
      };

      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 5000);

    } catch (err) {
      console.warn(err);
      setRecordCountdown(null);
      triggerToast('Media recording blocked in current frame sandbox.');
    }
  };

  const toggleFavoritePreset = (presetId: string) => {
    setFavoriteIds(prev => {
      const updated = prev.includes(presetId) 
        ? prev.filter(id => id !== presetId)
        : [...prev, presetId];
      localStorage.setItem('favorites_silk_presets', JSON.stringify(updated));
      triggerToast(prev.includes(presetId) ? 'Removed from favorites' : 'Added to favorites!');
      return updated;
    });
  };

  const saveCurrentAsCustomPreset = () => {
    if (!newPresetName.trim()) {
      triggerToast('Please type a preset name first!');
      return;
    }
    const newPreset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      category: generatorMode === 'ribbon' ? 'Ribbon Design' : 'Media Mesh Design',
      description: 'Your custom designed silk flow pattern configuration',
      config: getCurrentConfig()
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('custom_silk_presets', JSON.stringify(updated));
    setNewPresetName('');
    triggerToast(`Saved Custom Preset: "${newPreset.name}"!`);
  };

  const deleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('custom_silk_presets', JSON.stringify(updated));
    triggerToast('Deleted custom preset');
  };
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const isDraggingRef = useRef(false);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'finished'>('idle');
  const [videoQuality, setVideoQuality] = useState<'720' | '1080' | '1440' | '2160'>('1080');
  const [videoDuration, setVideoDuration] = useState<number>(20);
  const [copiableEmbed, setCopiableEmbed] = useState<boolean>(false);
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const [copiedWidget, setCopiedWidget] = useState<boolean>(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const triggerToast = showToast;

  const applyThemePreset = (themeId: string) => {
    if (themeId && themeId.startsWith('custom_')) {
      const custom = customPresets.find(p => p.id === themeId);
      if (custom) {
        saveToHistory(getCurrentConfig());
        applyConfig(custom.config);
        showToast(`Applied Custom Preset: "${custom.name}"`);
        return;
      }
    }
    saveToHistory(getCurrentConfig());
    switch (themeId) {
      case 'plexus_core':
        setGeneratorMode('mediamesh');
        setMeshStyle('plexus');
        setColorProfile('chroma');
        setGridDensity(45);
        setExtrusionDepth(130);
        setParticleSize(3.5);
        setMeshWaveScale(25);
        setPlexusMaxDistance(45);
        setPlexusMaxConnections(5);
        setContrastBoost(1.2);
        setBrightnessThreshold(0.04);
        setSpeed(0.3);
        setChromaticAberration(4);
        setIsTransparentBg(true);
        setChromaColorStart('#00f0ff');
        setChromaColorEnd('#ff007f');
        showToast('Applied Theme: Prismatic Plexus Core');
        break;
      case 'cyber_grid':
        setGeneratorMode('mediamesh');
        setMeshStyle('stipple');
        setColorProfile('chroma');
        setGridDensity(50);
        setExtrusionDepth(150);
        setParticleSize(3.0);
        setMeshWaveScale(30);
        setContrastBoost(1.4);
        setBrightnessThreshold(0.04);
        setSpeed(0.5);
        setChromaticAberration(8);
        setIsTransparentBg(true);
        setChromaColorStart('#39ff14');
        setChromaColorEnd('#ff007f');
        showToast('Applied Theme: Cyberpunk Grid Storm');
        break;
      case 'obsidian_flow':
        setGeneratorMode('ribbon');
        setNumRibbons(3);
        setThickness(140);
        setWaveIntensity(50);
        setWavePattern('satin');
        setWaveFrequency(0.7);
        setTwistRate(1.0);
        setTwistSpeed(1.2);
        setSpeed(0.2);
        setLightIntensity(0.5);
        setIsTransparentBg(false);
        setBackgroundColor('#050510');
        setRibbons([
          { id: 1, colorStart: '#111111', colorEnd: '#312e81', twistPhase: 0 },
          { id: 2, colorStart: '#1e1b4b', colorEnd: '#4f46e5', twistPhase: Math.PI / 3 },
          { id: 3, colorStart: '#111827', colorEnd: '#4338ca', twistPhase: (2 * Math.PI) / 3 }
        ]);
        showToast('Applied Theme: Obsidian Midnight Flow');
        break;
      case 'solar_flare':
        setGeneratorMode('ribbon');
        setNumRibbons(5);
        setThickness(135);
        setWaveIntensity(95);
        setWavePattern('turbulent');
        setWaveFrequency(1.5);
        setTwistRate(1.7);
        setTwistSpeed(2.8);
        setSpeed(0.65);
        setLightIntensity(1.35);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#ff4500', colorEnd: '#ffcc00', twistPhase: 0 },
          { id: 2, colorStart: '#ff0000', colorEnd: '#ff8800', twistPhase: Math.PI / 5 },
          { id: 3, colorStart: '#d84315', colorEnd: '#ffeb3b', twistPhase: (2 * Math.PI) / 5 },
          { id: 4, colorStart: '#ff5722', colorEnd: '#ffc107', twistPhase: (3 * Math.PI) / 5 },
          { id: 5, colorStart: '#ff3d00', colorEnd: '#ffe082', twistPhase: (4 * Math.PI) / 5 }
        ]);
        showToast('Applied Theme: Burning Solar Flare');
        break;
      case 'electric_jelly':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(160);
        setWaveIntensity(90);
        setWavePattern('sea_swell');
        setWaveFrequency(1.2);
        setTwistRate(1.9);
        setTwistSpeed(2.2);
        setSpeed(0.45);
        setLightIntensity(1.15);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#00f2fe', colorEnd: '#09f783', twistPhase: 0 },
          { id: 2, colorStart: '#00c6ff', colorEnd: '#0072ff', twistPhase: Math.PI / 4 },
          { id: 3, colorStart: '#a8ff78', colorEnd: '#78ffd6', twistPhase: Math.PI / 2 },
          { id: 4, colorStart: '#00f260', colorEnd: '#0575e6', twistPhase: (3 * Math.PI) / 4 }
        ]);
        showToast('Applied Theme: Bioluminescent Electric Jellyfish');
        break;
      case 'quantum_stardust':
        setGeneratorMode('mediamesh');
        setMeshStyle('stipple');
        setColorProfile('chroma');
        setGridDensity(60);
        setExtrusionDepth(170);
        setParticleSize(2.5);
        setMeshWaveScale(15);
        setContrastBoost(1.5);
        setBrightnessThreshold(0.02);
        setSpeed(0.65);
        setChromaticAberration(6);
        setIsTransparentBg(true);
        setChromaColorStart('#ff00b7');
        setChromaColorEnd('#3300ff');
        showToast('Applied Theme: Quantum Stardust');
        break;
      case 'digital_vapor':
        setGeneratorMode('mediamesh');
        setMeshStyle('ascii');
        setColorProfile('neon');
        setGridDensity(40);
        setExtrusionDepth(100);
        setParticleSize(4.0);
        setMeshWaveScale(30);
        setAsciiCharacterPalette('matrix');
        setContrastBoost(1.3);
        setBrightnessThreshold(0.05);
        setSpeed(0.4);
        setChromaticAberration(0);
        setIsTransparentBg(true);
        setChromaColorStart('#00ffcc');
        setChromaColorEnd('#ff00ff');
        showToast('Applied Theme: Digital Vaporwave Matrix');
        break;
      case 'matrix_hack':
        setGeneratorMode('mediamesh');
        setMeshStyle('ascii');
        setColorProfile('neon');
        setGridDensity(45);
        setExtrusionDepth(110);
        setParticleSize(4.0);
        setMeshWaveScale(35);
        setAsciiCharacterPalette('binary');
        setContrastBoost(1.4);
        setBrightnessThreshold(0.04);
        setSpeed(0.45);
        setChromaticAberration(0);
        setIsTransparentBg(true);
        setChromaColorStart('#00ff00');
        setChromaColorEnd('#003300');
        showToast('Applied Theme: Core Matrix Cascades');
        break;
      case 'golden_satin':
        setGeneratorMode('mediamesh');
        setMeshStyle('topological_contour');
        setColorProfile('chroma');
        setGridDensity(50);
        setExtrusionDepth(110);
        setParticleSize(3.0);
        setMeshWaveScale(40);
        setContourLevels(15);
        setContrastBoost(1.1);
        setBrightnessThreshold(0.03);
        setSpeed(0.5);
        setChromaticAberration(2);
        setIsTransparentBg(true);
        setChromaColorStart('#ffe066');
        setChromaColorEnd('#cc9900');
        showToast('Applied Theme: Golden Contour Satin');
        break;
      case 'kintsugi_gold':
        setGeneratorMode('mediamesh');
        setMeshStyle('wireframe');
        setColorProfile('chroma');
        setGridDensity(52);
        setExtrusionDepth(90);
        setParticleSize(2.2);
        setMeshWaveScale(22);
        setContrastBoost(1.55);
        setBrightnessThreshold(0.02);
        setSpeed(0.3);
        setChromaticAberration(1);
        setIsTransparentBg(false);
        setBackgroundColor('#050505');
        setChromaColorStart('#d4af37');
        setChromaColorEnd('#1a1a1a');
        showToast('Applied Theme: Cracked Kintsugi Porcelain');
        break;
      case 'amethyst_res':
        setGeneratorMode('mediamesh');
        setMeshStyle('topological_contour');
        setColorProfile('chroma');
        setGridDensity(48);
        setExtrusionDepth(140);
        setParticleSize(3.0);
        setMeshWaveScale(30);
        setContourLevels(18);
        setContrastBoost(1.3);
        setBrightnessThreshold(0.04);
        setSpeed(0.38);
        setChromaticAberration(4);
        setIsTransparentBg(true);
        setChromaColorStart('#9333ea');
        setChromaColorEnd('#ec4899');
        showToast('Applied Theme: Amethyst Crystal Contours');
        break;
      case 'mint_frost':
        setGeneratorMode('mediamesh');
        setMeshStyle('plexus');
        setColorProfile('chroma');
        setGridDensity(44);
        setExtrusionDepth(120);
        setParticleSize(2.5);
        setMeshWaveScale(25);
        setPlexusMaxDistance(42);
        setPlexusMaxConnections(4);
        setContrastBoost(1.1);
        setBrightnessThreshold(0.03);
        setSpeed(0.28);
        setChromaticAberration(3);
        setIsTransparentBg(true);
        setChromaColorStart('#2dd4bf');
        setChromaColorEnd('#0284c7');
        showToast('Applied Theme: Arctic Glacier Plexus');
        break;
      case 'ethereal_aurora':
        setGeneratorMode('mediamesh');
        setMeshStyle('plexus');
        setColorProfile('chroma');
        setGridDensity(48);
        setExtrusionDepth(130);
        setParticleSize(1.8);
        setMeshWaveScale(40);
        setContrastBoost(1.45);
        setBrightnessThreshold(0.01);
        setSpeed(0.5);
        setChromaticAberration(8);
        setMeshBlur(25);
        setIsTransparentBg(true);
        setChromaColorStart('#00f0ff');
        setChromaColorEnd('#ff00aa');
        showToast('Applied Theme: Ethereal Aurora Constellations');
        break;
      case 'cherry_blossom':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(145);
        setWaveIntensity(60);
        setWavePattern('spiral');
        setWaveFrequency(0.9);
        setTwistRate(1.2);
        setTwistSpeed(1.5);
        setSpeed(0.35);
        setLightIntensity(1.1);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#fbcfe8', colorEnd: '#f472b6', twistPhase: 0 },
          { id: 2, colorStart: '#ffe4e6', colorEnd: '#fb7185', twistPhase: Math.PI / 4 },
          { id: 3, colorStart: '#fff1f2', colorEnd: '#fda4af', twistPhase: Math.PI / 2 },
          { id: 4, colorStart: '#fae8ff', colorEnd: '#f472b6', twistPhase: (3 * Math.PI) / 4 }
        ]);
        showToast('Applied Theme: Ethereal Sakura Whisper');
        break;
      case 'supernova_burst':
        setGeneratorMode('mediamesh');
        setMeshStyle('plexus');
        setColorProfile('chroma');
        setGridDensity(54);
        setExtrusionDepth(180);
        setParticleSize(2.0);
        setMeshWaveScale(45);
        setPlexusMaxDistance(55);
        setPlexusMaxConnections(6);
        setContrastBoost(1.6);
        setBrightnessThreshold(0.01);
        setSpeed(0.6);
        setChromaticAberration(10);
        setIsTransparentBg(true);
        setChromaColorStart('#e879f9');
        setChromaColorEnd('#38bdf8');
        showToast('Applied Theme: Celestial Supernova');
        break;
      case 'lava_lamp':
        setGeneratorMode('mediamesh');
        setMeshStyle('stipple');
        setColorProfile('chroma');
        setGridDensity(46);
        setExtrusionDepth(130);
        setParticleSize(4.5);
        setMeshWaveScale(40);
        setContrastBoost(1.25);
        setBrightnessThreshold(0.04);
        setSpeed(0.32);
        setChromaticAberration(4);
        setIsTransparentBg(true);
        setChromaColorStart('#ea580c');
        setChromaColorEnd('#f43f5e');
        showToast('Applied Theme: Volcanic Magma Spheres');
        break;
      case 'opal_aurora':
        setGeneratorMode('mediamesh');
        setMeshStyle('plexus');
        setColorProfile('chroma');
        setGridDensity(46);
        setExtrusionDepth(115);
        setParticleSize(1.6);
        setMeshWaveScale(35);
        setPlexusMaxDistance(40);
        setPlexusMaxConnections(4);
        setContrastBoost(1.2);
        setBrightnessThreshold(0.02);
        setSpeed(0.35);
        setChromaticAberration(6);
        setIsTransparentBg(true);
        setChromaColorStart('#ffedd5');
        setChromaColorEnd('#a5f3fc');
        showToast('Applied Theme: Pearlescent Opaline Halo');
        break;
      case 'neon_monolith':
        setGeneratorMode('mediamesh');
        setMeshStyle('wireframe');
        setColorProfile('chroma');
        setGridDensity(35);
        setExtrusionDepth(160);
        setParticleSize(3.0);
        setMeshWaveScale(20);
        setContrastBoost(1.55);
        setBrightnessThreshold(0.05);
        setSpeed(0.42);
        setChromaticAberration(2);
        setIsTransparentBg(false);
        setBackgroundColor('#18181b');
        setChromaColorStart('#facc15');
        setChromaColorEnd('#27272a');
        showToast('Applied Theme: Hard Brutalist Monolith');
        break;
      case 'toxic_fallout':
        setGeneratorMode('mediamesh');
        setMeshStyle('ascii');
        setColorProfile('neon');
        setGridDensity(42);
        setExtrusionDepth(125);
        setParticleSize(3.5);
        setMeshWaveScale(40);
        setAsciiCharacterPalette('symbols');
        setContrastBoost(1.35);
        setBrightnessThreshold(0.06);
        setSpeed(0.5);
        setChromaticAberration(5);
        setIsTransparentBg(true);
        setChromaColorStart('#a3e635');
        setChromaColorEnd('#166534');
        showToast('Applied Theme: Toxic Radioactive Fallout');
        break;
      case 'star_velocity':
        setGeneratorMode('mediamesh');
        setMeshStyle('stipple');
        setColorProfile('chroma');
        setGridDensity(65);
        setExtrusionDepth(180);
        setParticleSize(2.2);
        setMeshWaveScale(10);
        setContrastBoost(1.4);
        setBrightnessThreshold(0.02);
        setSpeed(0.75);
        setChromaticAberration(8);
        setIsTransparentBg(true);
        setChromaColorStart('#ffffff');
        setChromaColorEnd('#1d4ed8');
        showToast('Applied Theme: Warp Speed Hyperdrive');
        break;
      case 'cosmic_neon_ribbon':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(140);
        setWaveIntensity(80);
        setWavePattern('turbulent');
        setWaveFrequency(1.4);
        setTwistRate(1.6);
        setTwistSpeed(2.5);
        setSpeed(0.5);
        setLightIntensity(1.1);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#ff007f', colorEnd: '#7a00ff', twistPhase: 0 },
          { id: 2, colorStart: '#00f2fe', colorEnd: '#1b45ff', twistPhase: Math.PI / 3 },
          { id: 3, colorStart: '#ffbe3b', colorEnd: '#ff5e62', twistPhase: (2 * Math.PI) / 3 },
          { id: 4, colorStart: '#00f260', colorEnd: '#0575e6', twistPhase: Math.PI }
        ]);
        showToast('Applied Theme: Cosmic Neon Ribbons');
        break;
      case 'royal_velvet':
        setGeneratorMode('ribbon');
        setNumRibbons(5);
        setThickness(155);
        setWaveIntensity(75);
        setWavePattern('satin');
        setWaveFrequency(1.1);
        setTwistRate(1.4);
        setTwistSpeed(2.0);
        setSpeed(0.3);
        setLightIntensity(1.2);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#701a75', colorEnd: '#b45309', twistPhase: 0 },
          { id: 2, colorStart: '#4a044e', colorEnd: '#d97706', twistPhase: Math.PI / 5 },
          { id: 3, colorStart: '#3b0764', colorEnd: '#ea580c', twistPhase: (2 * Math.PI) / 5 },
          { id: 4, colorStart: '#1e1b4b', colorEnd: '#f97316', twistPhase: (3 * Math.PI) / 5 },
          { id: 5, colorStart: '#2e1065', colorEnd: '#f59e0b', twistPhase: (4 * Math.PI) / 5 }
        ]);
        showToast('Applied Theme: Royal Plum Satin Velvet');
        break;
      case 'liquid_chrome':
        setGeneratorMode('mediamesh');
        setMeshStyle('topological_contour');
        setColorProfile('chroma');
        setGridDensity(54);
        setExtrusionDepth(110);
        setParticleSize(2.8);
        setMeshWaveScale(45);
        setContourLevels(22);
        setContrastBoost(1.6);
        setBrightnessThreshold(0.02);
        setSpeed(0.45);
        setChromaticAberration(3);
        setIsTransparentBg(true);
        setChromaColorStart('#f1f5f9');
        setChromaColorEnd('#334155');
        showToast('Applied Theme: Liquid Mercury Metal');
        break;
      case 'pastel_glass_ribbon':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(150);
        setWaveIntensity(45);
        setWavePattern('sea_swell');
        setWaveFrequency(0.8);
        setTwistRate(1.1);
        setTwistSpeed(1.2);
        setSpeed(0.25);
        setLightIntensity(1.45);
        setBgBlur(45);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#ffd3e8', colorEnd: '#c1c9ff', twistPhase: 0 },
          { id: 2, colorStart: '#bfdbfe', colorEnd: '#fbcfe8', twistPhase: Math.PI / 4 },
          { id: 3, colorStart: '#e0f2fe', colorEnd: '#ffe4e6', twistPhase: Math.PI / 2 },
          { id: 4, colorStart: '#fae8ff', colorEnd: '#dbeafe', twistPhase: (3 * Math.PI) / 4 }
        ]);
        showToast('Applied Theme: Pastel Glass Ribbons');
        break;
      case 'sunset_satin_ribbon':
        setGeneratorMode('ribbon');
        setNumRibbons(5);
        setThickness(125);
        setWaveIntensity(75);
        setWavePattern('satin');
        setWaveFrequency(1.0);
        setTwistRate(1.3);
        setTwistSpeed(1.8);
        setSpeed(0.4);
        setLightIntensity(0.95);
        setIsTransparentBg(false);
        setBackgroundColor('#090503');
        setRibbons([
          { id: 1, colorStart: '#ff0a7c', colorEnd: '#ffbe3b', twistPhase: 0 },
          { id: 2, colorStart: '#ff5e62', colorEnd: '#ff9966', twistPhase: Math.PI / 5 },
          { id: 3, colorStart: '#ffd700', colorEnd: '#de5c83', twistPhase: (2 * Math.PI) / 5 },
          { id: 4, colorStart: '#e21b5a', colorEnd: '#8b008b', twistPhase: (3 * Math.PI) / 5 },
          { id: 5, colorStart: '#ff9f43', colorEnd: '#ff5252', twistPhase: (4 * Math.PI) / 5 }
        ]);
        showToast('Applied Theme: Sunset Satin Ribbons');
        break;
      case 'abyssal_trench':
        setGeneratorMode('ribbon');
        setNumRibbons(3);
        setThickness(165);
        setWaveIntensity(105);
        setWavePattern('sea_swell');
        setWaveFrequency(1.3);
        setTwistRate(1.6);
        setTwistSpeed(1.6);
        setSpeed(0.25);
        setLightIntensity(1.0);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#1e3a8a', colorEnd: '#10b981', twistPhase: 0 },
          { id: 2, colorStart: '#172554', colorEnd: '#059669', twistPhase: Math.PI / 3 },
          { id: 3, colorStart: '#0f172a', colorEnd: '#34d399', twistPhase: (2 * Math.PI) / 3 }
        ]);
        showToast('Applied Theme: Abyssal Biolum Filament');
        break;
      case 'iridescent_bubble':
        setGeneratorMode('mediamesh');
        setMeshStyle('mesh');
        setColorProfile('chroma');
        setGridDensity(48);
        setExtrusionDepth(120);
        setParticleSize(3.0);
        setMeshWaveScale(35);
        setContrastBoost(1.3);
        setBrightnessThreshold(0.02);
        setSpeed(0.48);
        setChromaticAberration(9);
        setIsTransparentBg(true);
        setChromaColorStart('#f472b6');
        setChromaColorEnd('#38bdf8');
        showToast('Applied Theme: Prismatic Bubble Surfaces');
        break;
      case 'digital_glitch_core':
        setGeneratorMode('mediamesh');
        setMeshStyle('disintegrated_voxels');
        setColorProfile('chroma');
        setGridDensity(44);
        setExtrusionDepth(150);
        setParticleSize(3.5);
        setMeshWaveScale(40);
        setContrastBoost(1.4);
        setBrightnessThreshold(0.03);
        setSpeed(0.65);
        setChromaticAberration(10);
        setGlitchIntensity(8);
        setIsTransparentBg(true);
        setChromaColorStart('#a855f7');
        setChromaColorEnd('#4ade80');
        showToast('Applied Theme: Cybernetic Glitch Lattice');
        break;
      case 'dusty_rose':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(135);
        setWaveIntensity(55);
        setWavePattern('satin');
        setWaveFrequency(0.8);
        setTwistRate(1.1);
        setTwistSpeed(1.3);
        setSpeed(0.24);
        setLightIntensity(0.9);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#fda4af', colorEnd: '#aa1f46', twistPhase: 0 },
          { id: 2, colorStart: '#ffe4e6', colorEnd: '#9f1239', twistPhase: Math.PI / 4 },
          { id: 3, colorStart: '#fecdd3', colorEnd: '#881337', twistPhase: Math.PI / 2 },
          { id: 4, colorStart: '#fff1f2', colorEnd: '#aa1f46', twistPhase: (3 * Math.PI) / 4 }
        ]);
        showToast('Applied Theme: Vintage Damask Crimson');
        break;
      case 'acid_emerald_ribbon':
        setGeneratorMode('ribbon');
        setNumRibbons(3);
        setThickness(160);
        setWaveIntensity(95);
        setWavePattern('spiral');
        setWaveFrequency(1.5);
        setTwistRate(1.85);
        setTwistSpeed(3.0);
        setSpeed(0.6);
        setLightIntensity(1.25);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#00ff66', colorEnd: '#0033cc', twistPhase: 0 },
          { id: 2, colorStart: '#00ffff', colorEnd: '#0575e6', twistPhase: Math.PI / 3 },
          { id: 3, colorStart: '#00ffaa', colorEnd: '#000066', twistPhase: (2 * Math.PI) / 3 }
        ]);
        showToast('Applied Theme: Acid Emerald Ribbons');
        break;
      case 'holographic_pastels':
        setGeneratorMode('mediamesh');
        setMeshStyle('wireframe');
        setColorProfile('chroma');
        setGridDensity(50);
        setExtrusionDepth(80);
        setParticleSize(2.2);
        setMeshWaveScale(35);
        setContrastBoost(1.0);
        setBrightnessThreshold(0.01);
        setSpeed(0.55);
        setChromaticAberration(8);
        setIsTransparentBg(true);
        setChromaColorStart('#fa8bff');
        setChromaColorEnd('#2bd2ff');
        showToast('Applied Theme: Holographic Wireframe Pastels');
        break;
      case 'hyper_grid_orange':
        setGeneratorMode('mediamesh');
        setMeshStyle('wireframe');
        setColorProfile('chroma');
        setGridDensity(45);
        setExtrusionDepth(140);
        setParticleSize(1.5);
        setMeshWaveScale(25);
        setContrastBoost(1.3);
        setBrightnessThreshold(0.03);
        setSpeed(0.35);
        setChromaticAberration(2);
        setIsTransparentBg(true);
        setChromaColorStart('#ff5500');
        setChromaColorEnd('#1a0033');
        showToast('Applied Theme: Orange Cyber Grid');
        break;
      case 'plasma_leak':
        setGeneratorMode('mediamesh');
        setMeshStyle('stipple');
        setColorProfile('chroma');
        setGridDensity(55);
        setExtrusionDepth(160);
        setParticleSize(4.5);
        setMeshWaveScale(30);
        setContrastBoost(1.55);
        setBrightnessThreshold(0.02);
        setSpeed(0.5);
        setChromaticAberration(5);
        setIsTransparentBg(false);
        setBackgroundColor('#022c22');
        setChromaColorStart('#d9f99d');
        setChromaColorEnd('#059669');
        showToast('Applied Theme: Plasma Radiation Leak');
        break;
      case 'glacial_mesh':
        setGeneratorMode('mediamesh');
        setMeshStyle('mesh');
        setColorProfile('chroma');
        setGridDensity(50);
        setExtrusionDepth(120);
        setParticleSize(2.8);
        setMeshWaveScale(20);
        setContrastBoost(1.2);
        setBrightnessThreshold(0.01);
        setSpeed(0.2);
        setChromaticAberration(3);
        setIsTransparentBg(true);
        setChromaColorStart('#e0f2fe');
        setChromaColorEnd('#0284c7');
        showToast('Applied Theme: Glacial Crystal Mesh');
        break;
      case 'binary_waterfall':
        setGeneratorMode('mediamesh');
        setMeshStyle('ascii');
        setColorProfile('neon');
        setGridDensity(50);
        setExtrusionDepth(130);
        setParticleSize(3.5);
        setMeshWaveScale(35);
        setAsciiCharacterPalette('binary');
        setContrastBoost(1.4);
        setBrightnessThreshold(0.04);
        setSpeed(0.55);
        setChromaticAberration(0);
        setIsTransparentBg(true);
        setChromaColorStart('#00f0ff');
        setChromaColorEnd('#003333');
        showToast('Applied Theme: Binary Code Cascade');
        break;
      case 'nebula_plexus':
        setGeneratorMode('mediamesh');
        setMeshStyle('plexus');
        setColorProfile('chroma');
        setGridDensity(52);
        setExtrusionDepth(150);
        setParticleSize(1.8);
        setMeshWaveScale(28);
        setPlexusMaxDistance(48);
        setPlexusMaxConnections(5);
        setContrastBoost(1.35);
        setBrightnessThreshold(0.02);
        setSpeed(0.3);
        setChromaticAberration(6);
        setIsTransparentBg(true);
        setChromaColorStart('#f472b6');
        setChromaColorEnd('#818cf8');
        showToast('Applied Theme: Orion Nebula Nexus');
        break;
      case 'magma_wire':
        setGeneratorMode('mediamesh');
        setMeshStyle('wireframe');
        setColorProfile('chroma');
        setGridDensity(42);
        setExtrusionDepth(180);
        setParticleSize(2.2);
        setMeshWaveScale(35);
        setContrastBoost(1.5);
        setBrightnessThreshold(0.03);
        setSpeed(0.4);
        setChromaticAberration(5);
        setIsTransparentBg(false);
        setBackgroundColor('#1c0a0a');
        setChromaColorStart('#f97316');
        setChromaColorEnd('#7f1d1d');
        showToast('Applied Theme: Tectonic Magma Fissure');
        break;
      case 'copper_sheet':
        setGeneratorMode('mediamesh');
        setMeshStyle('topological_contour');
        setColorProfile('chroma');
        setGridDensity(40);
        setExtrusionDepth(100);
        setParticleSize(3.0);
        setMeshWaveScale(25);
        setContourLevels(15);
        setContrastBoost(1.25);
        setBrightnessThreshold(0.04);
        setSpeed(0.28);
        setChromaticAberration(2);
        setIsTransparentBg(true);
        setChromaColorStart('#b45309');
        setChromaColorEnd('#0f766e');
        showToast('Applied Theme: Oxidized Amber Foil');
        break;
      case 'hologram_scan':
        setGeneratorMode('mediamesh');
        setMeshStyle('stipple');
        setColorProfile('chroma');
        setGridDensity(60);
        setExtrusionDepth(130);
        setParticleSize(3.2);
        setMeshWaveScale(40);
        setContrastBoost(1.45);
        setBrightnessThreshold(0.01);
        setSpeed(0.5);
        setChromaticAberration(8);
        setIsTransparentBg(true);
        setChromaColorStart('#fa8bff');
        setChromaColorEnd('#2bd2ff');
        showToast('Applied Theme: Holographic LIDAR Scan');
        break;
      case 'sublime_slime':
        setGeneratorMode('mediamesh');
        setMeshStyle('disintegrated_voxels');
        setColorProfile('chroma');
        setGridDensity(45);
        setExtrusionDepth(140);
        setParticleSize(3.5);
        setMeshWaveScale(30);
        setContrastBoost(1.3);
        setBrightnessThreshold(0.04);
        setSpeed(0.5);
        setChromaticAberration(4);
        setIsTransparentBg(true);
        setChromaColorStart('#bef264');
        setChromaColorEnd('#0369a1');
        showToast('Applied Theme: Sublime Acid Ripple');
        break;
      case 'ghostly_apparition':
        setGeneratorMode('mediamesh');
        setMeshStyle('mesh');
        setColorProfile('chroma');
        setGridDensity(48);
        setExtrusionDepth(110);
        setParticleSize(2.5);
        setMeshWaveScale(22);
        setContrastBoost(1.15);
        setBrightnessThreshold(0.02);
        setSpeed(0.15);
        setChromaticAberration(5);
        setIsTransparentBg(true);
        setChromaColorStart('#ccfbf1');
        setChromaColorEnd('#5b21b6');
        showToast('Applied Theme: Ectoplasmic Vapor Map');
        break;
      case 'digital_monochrome':
        setGeneratorMode('mediamesh');
        setMeshStyle('stipple');
        setColorProfile('chroma');
        setGridDensity(50);
        setExtrusionDepth(120);
        setParticleSize(3.0);
        setMeshWaveScale(15);
        setContrastBoost(1.75);
        setBrightnessThreshold(0.01);
        setSpeed(0.35);
        setChromaticAberration(0);
        setIsTransparentBg(false);
        setBackgroundColor('#000000');
        setChromaColorStart('#ffffff');
        setChromaColorEnd('#000000');
        showToast('Applied Theme: Brutalist Obsidian Matrix');
        break;
      case 'celestial_silk':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(140);
        setWaveIntensity(70);
        setWavePattern('satin');
        setWaveFrequency(0.85);
        setTwistRate(1.2);
        setTwistSpeed(1.8);
        setSpeed(0.3);
        setLightIntensity(1.15);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#38bdf8', colorEnd: '#22d3ee', twistPhase: 0 },
          { id: 2, colorStart: '#818cf8', colorEnd: '#a78bfa', twistPhase: Math.PI / 4 },
          { id: 3, colorStart: '#06b6d4', colorEnd: '#0891b2', twistPhase: Math.PI / 2 },
          { id: 4, colorStart: '#6366f1', colorEnd: '#4f46e5', twistPhase: (3 * Math.PI) / 4 }
        ]);
        showToast('Applied Theme: Celestial Silk Constellations');
        break;
      case 'phoenix_ashes':
        setGeneratorMode('ribbon');
        setNumRibbons(3);
        setThickness(150);
        setWaveIntensity(80);
        setWavePattern('turbulent');
        setWaveFrequency(1.1);
        setTwistRate(2.0);
        setTwistSpeed(2.5);
        setSpeed(0.4);
        setLightIntensity(1.3);
        setIsTransparentBg(false);
        setBackgroundColor('#111113');
        setRibbons([
          { id: 1, colorStart: '#f97316', colorEnd: '#1e1b4b', twistPhase: 0 },
          { id: 2, colorStart: '#ef4444', colorEnd: '#111827', twistPhase: Math.PI / 3 },
          { id: 3, colorStart: '#ff003c', colorEnd: '#111113', twistPhase: (2 * Math.PI) / 3 }
        ]);
        showToast('Applied Theme: Phoenix Obsidian Fire');
        break;
      case 'northern_dance':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(155);
        setWaveIntensity(85);
        setWavePattern('sea_swell');
        setWaveFrequency(0.95);
        setTwistRate(1.3);
        setTwistSpeed(1.6);
        setSpeed(0.28);
        setLightIntensity(1.2);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#10b981', colorEnd: '#06b6d4', twistPhase: 0 },
          { id: 2, colorStart: '#34d399', colorEnd: '#3b82f6', twistPhase: Math.PI / 4 },
          { id: 3, colorStart: '#059669', colorEnd: '#0284c7', twistPhase: Math.PI / 2 },
          { id: 4, colorStart: '#0284c7', colorEnd: '#1d4ed8', twistPhase: (3 * Math.PI) / 4 }
        ]);
        showToast('Applied Theme: Aurora Borealis Ribbon');
        break;
      case 'ocean_depths':
        setGeneratorMode('ribbon');
        setNumRibbons(5);
        setThickness(165);
        setWaveIntensity(95);
        setWavePattern('sea_swell');
        setWaveFrequency(0.8);
        setTwistRate(1.2);
        setTwistSpeed(1.4);
        setSpeed(0.2);
        setLightIntensity(1.0);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#1d4ed8', colorEnd: '#0f172a', twistPhase: 0 },
          { id: 2, colorStart: '#014f86', colorEnd: '#1e3a8a', twistPhase: Math.PI / 5 },
          { id: 3, colorStart: '#1e40af', colorEnd: '#0f172a', twistPhase: (2 * Math.PI) / 5 },
          { id: 4, colorStart: '#3b82f6', colorEnd: '#1d4ed8', twistPhase: (3 * Math.PI) / 5 },
          { id: 5, colorStart: '#2563eb', colorEnd: '#1e3a8a', twistPhase: (4 * Math.PI) / 5 }
        ]);
        showToast('Applied Theme: Deep Pacific Silk');
        break;
      case 'golden_hour':
        setGeneratorMode('ribbon');
        setNumRibbons(3);
        setThickness(145);
        setWaveIntensity(90);
        setWavePattern('satin');
        setWaveFrequency(1.0);
        setTwistRate(1.1);
        setTwistSpeed(1.5);
        setSpeed(0.3);
        setLightIntensity(1.25);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#fbbf24', colorEnd: '#f59e0b', twistPhase: 0 },
          { id: 2, colorStart: '#fcd34d', colorEnd: '#d97706', twistPhase: Math.PI / 3 },
          { id: 3, colorStart: '#f59e0b', colorEnd: '#ca8a04', twistPhase: (2 * Math.PI) / 3 }
        ]);
        showToast('Applied Theme: Golden Hour Satin');
        break;
      case 'cyber_pulse':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(130);
        setWaveIntensity(100);
        setWavePattern('spiral');
        setWaveFrequency(1.4);
        setTwistRate(2.2);
        setTwistSpeed(3.0);
        setSpeed(0.5);
        setLightIntensity(1.4);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#ff007f', colorEnd: '#39ff14', twistPhase: 0 },
          { id: 2, colorStart: '#00f0ff', colorEnd: '#7a00ff', twistPhase: Math.PI / 4 },
          { id: 3, colorStart: '#ffef00', colorEnd: '#ff007f', twistPhase: Math.PI / 2 },
          { id: 4, colorStart: '#39ff14', colorEnd: '#00ffff', twistPhase: (3 * Math.PI) / 4 }
        ]);
        showToast('Applied Theme: Tokyo Cyber Grid Pulse');
        break;
      case 'bubblegum_dream':
        setGeneratorMode('ribbon');
        setNumRibbons(5);
        setThickness(140);
        setWaveIntensity(75);
        setWavePattern('satin');
        setWaveFrequency(0.8);
        setTwistRate(1.1);
        setTwistSpeed(1.3);
        setSpeed(0.25);
        setLightIntensity(1.1);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#f472b6', colorEnd: '#fbcfe8', twistPhase: 0 },
          { id: 2, colorStart: '#c084fc', colorEnd: '#e9d5ff', twistPhase: Math.PI / 5 },
          { id: 3, colorStart: '#fb7185', colorEnd: '#fff1f2', twistPhase: (2 * Math.PI) / 5 },
          { id: 4, colorStart: '#f472b6', colorEnd: '#fecdd3', twistPhase: (3 * Math.PI) / 5 },
          { id: 5, colorStart: '#a78bfa', colorEnd: '#c084fc', twistPhase: (4 * Math.PI) / 5 }
        ]);
        showToast('Applied Theme: Bubblegum Pastel Stream');
        break;
      case 'lavender_mist':
        setGeneratorMode('ribbon');
        setNumRibbons(3);
        setThickness(135);
        setWaveIntensity(70);
        setWavePattern('satin');
        setWaveFrequency(0.75);
        setTwistRate(1.0);
        setTwistSpeed(1.2);
        setSpeed(0.22);
        setLightIntensity(1.0);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#c084fc', colorEnd: '#818cf8', twistPhase: 0 },
          { id: 2, colorStart: '#e9d5ff', colorEnd: '#c1c9ff', twistPhase: Math.PI / 3 },
          { id: 3, colorStart: '#a78bfa', colorEnd: '#6366f1', twistPhase: (2 * Math.PI) / 3 }
        ]);
        showToast('Applied Theme: Ethereal Lavender Sleep');
        break;
      case 'magma_core':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(150);
        setWaveIntensity(95);
        setWavePattern('turbulent');
        setWaveFrequency(1.25);
        setTwistRate(1.8);
        setTwistSpeed(2.4);
        setSpeed(0.42);
        setLightIntensity(1.3);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#ea580c', colorEnd: '#ff003c', twistPhase: 0 },
          { id: 2, colorStart: '#ea580c', colorEnd: '#f43f5e', twistPhase: Math.PI / 4 },
          { id: 3, colorStart: '#ff4500', colorEnd: '#3f0011', twistPhase: Math.PI / 2 },
          { id: 4, colorStart: '#d84315', colorEnd: '#ff4500', twistPhase: (3 * Math.PI) / 4 }
        ]);
        showToast('Applied Theme: Viscous Lava Stream');
        break;
      case 'sand_dune':
        setGeneratorMode('ribbon');
        setNumRibbons(3);
        setThickness(145);
        setWaveIntensity(80);
        setWavePattern('satin');
        setWaveFrequency(0.85);
        setTwistRate(1.1);
        setTwistSpeed(1.4);
        setSpeed(0.24);
        setLightIntensity(1.1);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#f59e0b', colorEnd: '#78350f', twistPhase: 0 },
          { id: 2, colorStart: '#fbbf24', colorEnd: '#451a03', twistPhase: Math.PI / 3 },
          { id: 3, colorStart: '#d97706', colorEnd: '#78350f', twistPhase: (2 * Math.PI) / 3 }
        ]);
        showToast('Applied Theme: Sahara Silk Ripple');
        break;
      case 'ice_cavern':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(150);
        setWaveIntensity(85);
        setWavePattern('sea_swell');
        setWaveFrequency(1.0);
        setTwistRate(1.4);
        setTwistSpeed(1.8);
        setSpeed(0.32);
        setLightIntensity(1.2);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#06b6d4', colorEnd: '#0891b2', twistPhase: 0 },
          { id: 2, colorStart: '#67e8f9', colorEnd: '#1e40af', twistPhase: Math.PI / 4 },
          { id: 3, colorStart: '#22d3ee', colorEnd: '#0369a1', twistPhase: Math.PI / 2 },
          { id: 4, colorStart: '#00f2fe', colorEnd: '#09f783', twistPhase: (3 * Math.PI) / 4 }
        ]);
        showToast('Applied Theme: Glacial Fjord Stream');
        break;
      case 'monotech':
        setGeneratorMode('ribbon');
        setNumRibbons(3);
        setThickness(130);
        setWaveIntensity(75);
        setWavePattern('satin');
        setWaveFrequency(0.8);
        setTwistRate(1.0);
        setTwistSpeed(1.2);
        setSpeed(0.25);
        setLightIntensity(1.0);
        setIsTransparentBg(false);
        setBackgroundColor('#000000');
        setRibbons([
          { id: 1, colorStart: '#ffffff', colorEnd: '#475569', twistPhase: 0 },
          { id: 2, colorStart: '#cbd5e1', colorEnd: '#1e293b', twistPhase: Math.PI / 3 },
          { id: 3, colorStart: '#94a3b8', colorEnd: '#0f172a', twistPhase: (2 * Math.PI) / 3 }
        ]);
        showToast('Applied Theme: Sleek Minimal Slate');
        break;
      case 'autumn_canopy':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(140);
        setWaveIntensity(85);
        setWavePattern('satin');
        setWaveFrequency(0.9);
        setTwistRate(1.2);
        setTwistSpeed(1.4);
        setSpeed(0.26);
        setLightIntensity(1.15);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#b45309', colorEnd: '#78350f', twistPhase: 0 },
          { id: 2, colorStart: '#f97316', colorEnd: '#9a3412', twistPhase: Math.PI / 4 },
          { id: 3, colorStart: '#ea580c', colorEnd: '#78350f', twistPhase: Math.PI / 2 },
          { id: 4, colorStart: '#fbbf24', colorEnd: '#f97316', twistPhase: (3 * Math.PI) / 4 }
        ]);
        showToast('Applied Theme: October Autumn Woods');
        break;
      case 'toxic_sludge':
        setGeneratorMode('ribbon');
        setNumRibbons(3);
        setThickness(145);
        setWaveIntensity(90);
        setWavePattern('sea_swell');
        setWaveFrequency(1.1);
        setTwistRate(1.6);
        setTwistSpeed(2.0);
        setSpeed(0.35);
        setLightIntensity(1.2);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#a3e635', colorEnd: '#166534', twistPhase: 0 },
          { id: 2, colorStart: '#84cc16', colorEnd: '#14532d', twistPhase: Math.PI / 3 },
          { id: 3, colorStart: '#65a30d', colorEnd: '#022c22', twistPhase: (2 * Math.PI) / 3 }
        ]);
        showToast('Applied Theme: Nuclear Acid Stream');
        break;
      case 'unicorn_tear':
        setGeneratorMode('ribbon');
        setNumRibbons(5);
        setThickness(140);
        setWaveIntensity(80);
        setWavePattern('satin');
        setWaveFrequency(0.85);
        setTwistRate(1.15);
        setTwistSpeed(1.4);
        setSpeed(0.27);
        setLightIntensity(1.1);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#f472b6', colorEnd: '#a5f3fc', twistPhase: 0 },
          { id: 2, colorStart: '#fbcfe8', colorEnd: '#cbd5e1', twistPhase: Math.PI / 5 },
          { id: 3, colorStart: '#ffe4e6', colorEnd: '#bae6fd', twistPhase: (2 * Math.PI) / 5 },
          { id: 4, colorStart: '#fae8ff', colorEnd: '#f472b6', twistPhase: (3 * Math.PI) / 5 },
          { id: 5, colorStart: '#fbcfe8', colorEnd: '#38bdf8', twistPhase: (4 * Math.PI) / 5 }
        ]);
        showToast('Applied Theme: Iridescent Unicorn Veil');
        break;
      case 'crimson_tide':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(155);
        setWaveIntensity(95);
        setWavePattern('sea_swell');
        setWaveFrequency(1.0);
        setTwistRate(1.4);
        setTwistSpeed(1.6);
        setSpeed(0.23);
        setLightIntensity(1.05);
        setIsTransparentBg(false);
        setBackgroundColor('#050103');
        setRibbons([
          { id: 1, colorStart: '#9f1239', colorEnd: '#3f0712', twistPhase: 0 },
          { id: 2, colorStart: '#f43f5e', colorEnd: '#000000', twistPhase: Math.PI / 4 },
          { id: 3, colorStart: '#881337', colorEnd: '#000000', twistPhase: Math.PI / 2 },
          { id: 4, colorStart: '#e11d48', colorEnd: '#4c0519', twistPhase: (3 * Math.PI) / 4 }
        ]);
        showToast('Applied Theme: Royal Vampire Velvet');
        break;
      case 'electric_violet':
        setGeneratorMode('ribbon');
        setNumRibbons(3);
        setThickness(135);
        setWaveIntensity(105);
        setWavePattern('spiral');
        setWaveFrequency(1.45);
        setTwistRate(2.4);
        setTwistSpeed(3.2);
        setSpeed(0.48);
        setLightIntensity(1.35);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#8b5cf6', colorEnd: '#a78bfa', twistPhase: 0 },
          { id: 2, colorStart: '#7c3aed', colorEnd: '#c084fc', twistPhase: Math.PI / 3 },
          { id: 3, colorStart: '#a855f7', colorEnd: '#cbd5e1', twistPhase: (2 * Math.PI) / 3 }
        ]);
        showToast('Applied Theme: Electric Arc Discharge');
        break;
      case 'emerald_forest':
        setGeneratorMode('ribbon');
        setNumRibbons(4);
        setThickness(145);
        setWaveIntensity(75);
        setWavePattern('satin');
        setWaveFrequency(0.8);
        setTwistRate(1.1);
        setTwistSpeed(1.3);
        setSpeed(0.25);
        setLightIntensity(1.1);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#059669', colorEnd: '#064e3b', twistPhase: 0 },
          { id: 2, colorStart: '#10b981', colorEnd: '#022c22', twistPhase: Math.PI / 4 },
          { id: 3, colorStart: '#047857', colorEnd: '#064e3b', twistPhase: Math.PI / 2 },
          { id: 4, colorStart: '#34d399', colorEnd: '#022c22', twistPhase: (3 * Math.PI) / 4 }
        ]);
        showToast('Applied Theme: Amazonian Canopy Silk');
        break;
      case 'champagne_gold':
        setGeneratorMode('ribbon');
        setNumRibbons(3);
        setThickness(140);
        setWaveIntensity(80);
        setWavePattern('satin');
        setWaveFrequency(0.9);
        setTwistRate(1.15);
        setTwistSpeed(1.4);
        setSpeed(0.26);
        setLightIntensity(1.2);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#fef08a', colorEnd: '#ca8a04', twistPhase: 0 },
          { id: 2, colorStart: '#fef9c3', colorEnd: '#ca8a04', twistPhase: Math.PI / 3 },
          { id: 3, colorStart: '#fef08a', colorEnd: '#854d0e', twistPhase: (2 * Math.PI) / 3 }
        ]);
        showToast('Applied Theme: VIP Champagne Pearl');
        break;
      case 'space_dust':
        setGeneratorMode('ribbon');
        setNumRibbons(5);
        setThickness(135);
        setWaveIntensity(100);
        setWavePattern('turbulent');
        setWaveFrequency(1.3);
        setTwistRate(1.9);
        setTwistSpeed(2.6);
        setSpeed(0.45);
        setLightIntensity(1.25);
        setIsTransparentBg(true);
        setRibbons([
          { id: 1, colorStart: '#ec4899', colorEnd: '#1d4ed8', twistPhase: 0 },
          { id: 2, colorStart: '#a855f7', colorEnd: '#047857', twistPhase: Math.PI / 5 },
          { id: 3, colorStart: '#db2777', colorEnd: '#4f46e5', twistPhase: (2 * Math.PI) / 5 },
          { id: 4, colorStart: '#8b5cf6', colorEnd: '#ef4444', twistPhase: (3 * Math.PI) / 5 },
          { id: 5, colorStart: '#ec4899', colorEnd: '#f97316', twistPhase: (4 * Math.PI) / 5 }
        ]);
        showToast('Applied Theme: Cosmic Starlight Stream');
        break;
      default:
        break;
    }
  };

  const selectGeometryFilter = (gStyle: GeometryFilterItem) => {
    setActiveGeometryFilter(gStyle.id);
    setMeshStyle(gStyle.style);
    
    switch (gStyle.id) {
      // --- Plexus Group ---
      case 'plexus_classic':
        setPlexusMaxDistance(38);
        setPlexusMaxConnections(4);
        setParticleSize(2.2);
        setGridDensity(48);
        setSpeed(0.35);
        setColorProfile('chroma');
        setChromaColorStart('#00f0ff'); // Vibrant Cyan
        setChromaColorEnd('#7a00ff');   // Neon Purple
        setExtrusionDepth(120);
        setChromaticAberration(4);
        setMeshWaveScale(22);
        break;
      case 'plexus_constellation':
        setPlexusMaxDistance(58);
        setPlexusMaxConnections(3);
        setParticleSize(1.2);
        setGridDensity(35);
        setSpeed(0.15); // Slow cosmic float
        setColorProfile('chroma');
        setChromaColorStart('#e0f2fe'); // Pastel Icy White
        setChromaColorEnd('#0369a1');   // Cosmic Dark Blue
        setExtrusionDepth(170);         // Tall vertical clusters
        setChromaticAberration(2);
        setMeshWaveScale(15);
        break;
      case 'plexus_lattice':
        setPlexusMaxDistance(30);
        setPlexusMaxConnections(8);
        setParticleSize(2.0);
        setGridDensity(52);
        setSpeed(0.5);  // High energy electric web
        setColorProfile('chroma');
        setChromaColorStart('#39ff14'); // Cyber Lime Green
        setChromaColorEnd('#0f172a');   // Silent Midnight Slate
        setExtrusionDepth(80);          // Flattened lattice mesh
        setChromaticAberration(6);
        setMeshWaveScale(30);
        break;
        
      // --- Stipple Group ---
      case 'stipple_classic':
        setParticleSize(3.2);
        setGridDensity(50);
        setSpeed(0.4);
        setColorProfile('chroma');
        setChromaColorStart('#f43f5e'); // Energetic Rose Pink
        setChromaColorEnd('#1e1b4b');   // Midnight Indigo
        setExtrusionDepth(110);
        setChromaticAberration(3);
        setMeshWaveScale(25);
        break;
      case 'stipple_micro':
        setParticleSize(1.4); // Stardust grain texture
        setGridDensity(68);   // Ultra dense
        setSpeed(0.25);
        setColorProfile('chroma');
        setChromaColorStart('#ec4899'); // Hot Pink
        setChromaColorEnd('#3b82f6');   // Electric Blue
        setExtrusionDepth(140);
        setChromaticAberration(8);      // Retro chromatic shift
        setMeshWaveScale(18);
        break;
      case 'stipple_giant':
        setParticleSize(6.5); // Thick fluid ink globs
        setGridDensity(38);
        setSpeed(0.55);
        setColorProfile('chroma');
        setChromaColorStart('#fbbf24'); // Luminous Amber
        setChromaColorEnd('#ff4500');   // Deep molten orange flame
        setExtrusionDepth(95);
        setChromaticAberration(0);
        setMeshWaveScale(35);
        setParticleDecaySpeed(1.8);
        break;
        
      // --- ASCII Group ---
      case 'ascii_binary':
        setAsciiCharacterPalette('binary');
        setGridDensity(44);
        setParticleSize(3.6);
        setSpeed(0.5); // Cascading waterfall effect
        setColorProfile('neon');
        setChromaColorStart('#00f260'); // Matrix Green Glow
        setChromaColorEnd('#0575e6');   // Ocean Depths Blue
        setExtrusionDepth(130);
        setChromaticAberration(1);
        setMeshWaveScale(40);
        break;
      case 'ascii_matrix':
        setAsciiCharacterPalette('matrix');
        setParticleSize(2.8);
        setGridDensity(50);
        setSpeed(0.35);
        setColorProfile('chroma');
        setChromaColorStart('#00ff00'); // Phosphor Retro Terminal Green
        setChromaColorEnd('#001100');   // Dark Obsidian
        setExtrusionDepth(100);
        setChromaticAberration(0);
        setMeshWaveScale(20);
        break;
      case 'ascii_hex':
        setAsciiCharacterPalette('symbols');
        setParticleSize(3.2);
        setGridDensity(42);
        setSpeed(0.6); // Swift hexadecimal system decryptor
        setColorProfile('chroma');
        setChromaColorStart('#a855f7'); // Cyber Amethyst Purple
        setChromaColorEnd('#1e1b4b');   // Cosmic Void Space
        setExtrusionDepth(155);
        setChromaticAberration(5);
        setMeshWaveScale(28);
        break;
        
      // --- Contour Group ---
      case 'contour_classic':
        setContourLevels(11);
        setParticleSize(2.8);
        setGridDensity(45);
        setSpeed(0.3);
        setColorProfile('chroma');
        setChromaColorStart('#d4af37'); // Luxury Polished Gold
        setChromaColorEnd('#111827');   // Cosmic Dark Graphite
        setExtrusionDepth(120);
        setChromaticAberration(2);
        setMeshWaveScale(25);
        break;
      case 'contour_wave':
        setContourLevels(22); // Fine elevation micro-lines
        setParticleSize(1.4);
        setGridDensity(52);
        setSpeed(0.22);
        setColorProfile('chroma');
        setChromaColorStart('#fbcfe8'); // Pale Sakura Bloom Pink
        setChromaColorEnd('#cbd5e1');   // Metallic Liquid Silver
        setExtrusionDepth(80);
        setChromaticAberration(3);
        setMeshWaveScale(18);
        break;
      case 'contour_heat':
        setContourLevels(6); // Chunky thermal steps
        setParticleSize(4.5);
        setGridDensity(38);
        setSpeed(0.45);
        setColorProfile('chroma');
        setChromaColorStart('#f97316'); // Volcano Heat Orange
        setChromaColorEnd('#1d4ed8');   // Frigid Antarctic Cobalt
        setExtrusionDepth(175);
        setChromaticAberration(7);
        setMeshWaveScale(33);
        break;
        
      // --- Disintegrated Voxels Group ---
      case 'sand_decay':
        setParticleDecaySpeed(2.2);
        setParticleSize(3.0);
        setGridDensity(46);
        setSpeed(0.38);
        setColorProfile('chroma');
        setChromaColorStart('#fb923c'); // Sunset Desert Sand
        setChromaColorEnd('#431407');   // Burnt Sienna Clay
        setExtrusionDepth(130);
        setChromaticAberration(4);
        setMeshWaveScale(24);
        break;
      case 'voxel_torrent':
        setParticleDecaySpeed(4.8); // High speed terminal code drop
        setParticleSize(4.5);
        setGridDensity(52);
        setSpeed(0.65);
        setColorProfile('chroma');
        setChromaColorStart('#06b6d4'); // High-voltage cyan spark
        setChromaColorEnd('#0f172a');   // Obsidian data bank
        setExtrusionDepth(160);
        setChromaticAberration(9);      // Heavy scanline digital glitch
        setMeshWaveScale(45);
        break;
      case 'voxel_heavy':
        setParticleDecaySpeed(1.0); // Slow ash debris
        setParticleSize(5.5);
        setGridDensity(36);
        setSpeed(0.18);
        setColorProfile('chroma');
        setChromaColorStart('#94a3b8'); // Metallic Charcoal Platinum
        setChromaColorEnd('#030712');   // Deep Space Abyss
        setExtrusionDepth(90);
        setChromaticAberration(2);
        setMeshWaveScale(15);
        break;
        
      // --- Points Group ---
      case 'points_classic':
        setParticleSize(3.4);
        setGridDensity(46);
        setSpeed(0.35);
        setColorProfile('chroma');
        setChromaColorStart('#60a5fa'); // Heavenly Sky Blue
        setChromaColorEnd('#1e3a8a');   // Midnight Deep Navy
        setExtrusionDepth(120);
        setChromaticAberration(1);
        setMeshWaveScale(22);
        break;
      case 'points_soft':
        setParticleSize(1.0); // Mist density cloud
        setGridDensity(75);   // High resolution points
        setSpeed(0.2);
        setColorProfile('chroma');
        setChromaColorStart('#c084fc'); // Magic Lavender Purple
        setChromaColorEnd('#f472b6');   // Orion Rose Dust
        setExtrusionDepth(190);
        setChromaticAberration(5);
        setMeshWaveScale(12);
        break;
      case 'points_glitched':
        setParticleSize(4.0);
        setGridDensity(38);
        setSpeed(0.5);
        setColorProfile('chroma');
        setChromaColorStart('#ff0055'); // Hot Electric Magenta
        setChromaColorEnd('#00ffaa');   // Toxic Cyber Turquoise
        setExtrusionDepth(140);
        setChromaticAberration(12);     // Maximum prism-splitter glitch
        setMeshWaveScale(38);
        break;
        
      // --- Wireframe Group ---
      case 'wireframe_grid':
        setParticleSize(1.8);
        setGridDensity(38);
        setSpeed(0.3);
        setColorProfile('chroma');
        setChromaColorStart('#2dd2ff'); // Holographic Lightway Blue
        setChromaColorEnd('#042f2e');   // Luminous Dark Cyan
        setExtrusionDepth(110);
        setChromaticAberration(2);
        setMeshWaveScale(20);
        break;
      case 'wireframe_dense':
        setParticleSize(1.0); // Blueprint pen stroke weight
        setGridDensity(65);   // Extremely high blueprint grid
        setSpeed(0.12);
        setColorProfile('chroma');
        setChromaColorStart('#cbd5e1'); // Bright drawing board silver
        setChromaColorEnd('#334155');   // Industrial Carbon Graphite
        setExtrusionDepth(180);
        setChromaticAberration(0);
        setMeshWaveScale(10);
        break;
      case 'wireframe_wave':
        setParticleSize(2.2);
        setGridDensity(48);
        setSpeed(0.55);
        setColorProfile('chroma');
        setChromaColorStart('#ff5500'); // Burnished copper orange
        setChromaColorEnd('#1e1b4b');   // Darkest cosmic purple
        setExtrusionDepth(145);
        setChromaticAberration(6);
        setMeshWaveScale(42);
        break;
        
      // --- Mesh Group ---
      case 'mesh_shaded':
        setGridDensity(38);
        setSpeed(0.32);
        setColorProfile('chroma');
        setChromaColorStart('#a3e635'); // Acid lime shade
        setChromaColorEnd('#064e3b');   // Jungle shadow canopy
        setExtrusionDepth(115);
        setChromaticAberration(3);
        setMeshWaveScale(22);
        setParticleSize(3.0);
        break;
      case 'mesh_shiny':
        setGridDensity(44);
        setSpeed(0.45);
        setColorProfile('chroma');
        setChromaColorStart('#fa8bff'); // Rainbow Opal Lustre
        setChromaColorEnd('#2bd2ff');   // Metallic Sky Chrome
        setExtrusionDepth(135);
        setChromaticAberration(8);      // High glass refraction
        setMeshWaveScale(28);
        setParticleSize(2.5);
        break;
      case 'mesh_solid':
        setExtrusionDepth(200);         // Ultra heavy skyscraper projection
        setGridDensity(34);
        setSpeed(0.22);
        setColorProfile('chroma');
        setChromaColorStart('#ffffff'); // Polar Ice Topography
        setChromaColorEnd('#0369a1');   // Deep Glacier Rift Marine
        setChromaticAberration(4);
        setMeshWaveScale(16);
        setParticleSize(3.5);
        break;
        
      default:
        break;
    }
    showToast(`Applied 3D Geometry Filter: ${gStyle.label}`);
  };

  const getLiveInlineScript = () => {
    if (generatorMode === 'ribbon') {
      const ribbonsJSON = JSON.stringify(ribbons);
      return `<div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none; overflow: hidden; background: transparent;">
  <canvas id="digital-silk-flow-underlay" style="width: 100%; height: 100%; display: block;"></canvas>
</div>
<script>
  (function() {
    const canvas = document.getElementById('digital-silk-flow-underlay');
    const ctx = canvas.getContext('2d');
    
    const opt = {
      numRibbons: ${numRibbons},
      ribbons: ${ribbonsJSON},
      thickness: ${thickness},
      waveIntensity: ${waveIntensity},
      lightIntensity: ${lightIntensity},
      twistRate: ${twistRate},
      shadingDetail: ${shadingDetail},
      wavePattern: '${wavePattern}',
      waveFrequency: ${waveFrequency},
      twistSpeed: ${twistSpeed},
      speed: ${speed},
      opacity: ${opacity},
      rotationAngle: ${rotationAngle},
      isTransparentBg: ${isTransparentBg},
      backgroundColor: '${backgroundColor}',
      mouseMode: '${mouseMode}',
      mouseStrength: ${mouseStrength}
    };

    let time = 0;
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX / window.innerWidth;
      mouse.targetY = e.clientY / window.innerHeight;
    });

    function parseHex(hex) {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      const v = parseInt(c, 16);
      return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
    }

    function render() {
      requestAnimationFrame(render);
      time += 0.016 * opt.speed;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const w = canvas.width;
      const h = canvas.height;

      if (opt.isTransparentBg) {
        ctx.clearRect(0, 0, w, h);
      } else {
        ctx.fillStyle = opt.backgroundColor;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((opt.rotationAngle * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);

      for (let rIdx = 0; rIdx < opt.numRibbons; rIdx++) {
        const settings = opt.ribbons[rIdx % opt.ribbons.length] || opt.ribbons[0];
        ctx.save();
        ctx.globalAlpha = opt.opacity;
        
        const stripeCount = opt.shadingDetail;
        const stepsCount = 65;
        const pts = [];

        const mouseXActual = mouse.x * w;
        const mouseYActual = mouse.y * h;
        const pullRadius = 320;

        for (let s = 0; s <= stepsCount; s++) {
          const t = s / stepsCount;
          const x = -150 + t * (w + 300);
          const phaseOffset = rIdx * (Math.PI / 2.3) + settings.twistPhase;

          let sineAccumulator = 0;
          const fx1 = 0.0035 * opt.waveFrequency;
          const fx2 = 0.0015 * opt.waveFrequency;

          if (opt.wavePattern === 'turbulent') {
            sineAccumulator = 
              Math.sin(time * 2.8 + x * fx1 * 2.2 + phaseOffset) * opt.waveIntensity * 0.8 +
              Math.cos(time * 1.8 + x * fx2 * 2.5 + rIdx * 1.7) * (opt.waveIntensity * 0.35);
          } else if (opt.wavePattern === 'spiral') {
            sineAccumulator = Math.sin(time * 1.5 - x * fx1 * 1.4 + phaseOffset * 1.5) * opt.waveIntensity;
          } else if (opt.wavePattern === 'sea_swell') {
            sineAccumulator = Math.sin(time * 0.7 + x * fx1 * 0.6 + phaseOffset) * opt.waveIntensity * 1.3;
          } else {
            sineAccumulator = 
              Math.sin(time * 1.5 + x * fx1 + phaseOffset) * opt.waveIntensity +
              Math.cos(time * 0.82 + x * fx2 + rIdx * 1.2) * (opt.waveIntensity * 0.4);
          }

          let y = h * 0.5 + sineAccumulator;

          if (opt.mouseMode !== 'none') {
            const dx = x - mouseXActual;
            const dy = y - mouseYActual;
            const dist = Math.hypot(dx, dy);
            if (dist < pullRadius) {
              const pullPower = Math.pow(1.0 - dist / pullRadius, 2);
              y += (mouseYActual - y) * pullPower * opt.mouseStrength;
            }
            y += (mouse.y - 0.5) * (h * 0.18);
          }

          const lookX = x + 1.0;
          let lookSine = 0;
          if (opt.wavePattern === 'turbulent') {
            lookSine = 
              Math.sin(time * 2.8 + lookX * fx1 * 2.2 + phaseOffset) * opt.waveIntensity * 0.8 +
              Math.cos(time * 1.8 + lookX * fx2 * 2.5 + rIdx * 1.7) * (opt.waveIntensity * 0.35);
          } else if (opt.wavePattern === 'spiral') {
            lookSine = Math.sin(time * 1.5 - lookX * fx1 * 1.4 + phaseOffset * 1.5) * opt.waveIntensity;
          } else if (opt.wavePattern === 'sea_swell') {
            lookSine = Math.sin(time * 0.7 + lookX * fx1 * 0.6 + phaseOffset) * opt.waveIntensity * 1.3;
          } else {
            lookSine = 
              Math.sin(time * 1.5 + lookX * fx1 + phaseOffset) * opt.waveIntensity +
              Math.cos(time * 0.82 + lookX * fx2 + rIdx * 1.2) * (opt.waveIntensity * 0.4);
          }
          let lookY = h * 0.5 + lookSine;

          if (opt.mouseMode !== 'none') {
            const dx = lookX - mouseXActual;
            const dy = lookY - mouseYActual;
            const dist = Math.hypot(dx, dy);
            if (dist < pullRadius) {
              const pullPower = Math.pow(1.0 - dist / pullRadius, 2);
              lookY += (mouseYActual - lookY) * pullPower * opt.mouseStrength;
            }
            lookY += (mouse.y - 0.5) * (h * 0.18);
          }

          const tanAngle = Math.atan2(lookY - y, 1.0);
          const normalX = -Math.sin(tanAngle);
          const normalY = Math.cos(tanAngle);
          const twistAngle = time * opt.twistSpeed + (x * 0.004 * opt.twistRate) + phaseOffset;

          pts.push({ x, y, normalX, normalY, twist: twistAngle });
        }

        for (let f = 0; f < stripeCount; f++) {
          const normFilament = (f / (stripeCount - 1)) - 0.5;
          ctx.beginPath();
          const dCenter = Math.abs(normFilament);

          for (let p = 0; p < pts.length; p++) {
            const pt = pts[p];
            const projection = Math.cos(pt.twist + normFilament * Math.PI);
            const curHalfWidth = (opt.thickness * 0.5) * projection;
            const extX = pt.x + pt.normalX * curHalfWidth;
            const extY = pt.y + pt.normalY * curHalfWidth;

            if (p === 0) ctx.moveTo(extX, extY);
            else ctx.lineTo(extX, extY);
          }

          const lightIncidence = Math.cos(normFilament * Math.PI * 1.2);
          const shadowFactor = 0.35 + 0.65 * (1.0 - dCenter * 1.8);
          const specular = Math.pow(Math.max(0, lightIncidence), 6.5) * opt.lightIntensity;

          const colS = parseHex(settings.colorStart);
          const colE = parseHex(settings.colorEnd);

          const rS = Math.min(255, Math.max(0, Math.round((colS.r + (colE.r - colS.r) * 0) * shadowFactor + specular * 240)));
          const gS = Math.min(255, Math.max(0, Math.round((colS.g + (colE.g - colS.g) * 0) * shadowFactor + specular * 240)));
          const bS = Math.min(255, Math.max(0, Math.round((colS.b + (colE.b - colS.b) * 0) * shadowFactor + specular * 240)));

          const rE = Math.min(255, Math.max(0, Math.round((colS.r + (colE.r - colS.r) * 1) * shadowFactor + specular * 240)));
          const gE = Math.min(255, Math.max(0, Math.round((colS.g + (colE.g - colS.g) * 1) * shadowFactor + specular * 240)));
          const bE = Math.min(255, Math.max(0, Math.round((colS.b + (colE.b - colS.b) * 1) * shadowFactor + specular * 240)));

          const cGrad = ctx.createLinearGradient(0, 0, w, 0);
          cGrad.addColorStop(0, "rgb(" + rS + "," + gS + "," + bS + ")");
          cGrad.addColorStop(1, "rgb(" + rE + "," + gE + "," + bE + ")");

          ctx.strokeStyle = cGrad;
          ctx.lineWidth = (opt.thickness / stripeCount) * 2.8;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.restore();
    }
    render();
  })();
</script>`;
    }

    return `<div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none; overflow: hidden; background: transparent;">
  <canvas id="digital-silk-mesh-underlay" style="width: 100%; height: 100%; display: block;"></canvas>
</div>
<script>
  (function() {
    const canvas = document.getElementById('digital-silk-mesh-underlay');
    const ctx = canvas.getContext('2d');
    
    const opt = {
      style: '${meshStyle}',
      res: ${gridDensity},
      depth: ${extrusionDepth},
      size: ${particleSize},
      wave: ${meshWaveScale},
      speed: ${speed},
      alpha: ${opacity},
      pitch: ${pitchAngle},
      yaw: ${rotationAngle},
      iso: ${isometricMode ? 'true' : 'false'},
      aberration: ${chromaticAberration},
      glitch: ${glitchIntensity},
      contrast: ${contrastBoost},
      threshold: ${brightnessThreshold},
      plexDist: ${plexusMaxDistance},
      plexMax: ${plexusMaxConnections},
      cStart: '${chromaColorStart}',
      cEnd: '${chromaColorEnd}',
      autoYaw: ${autoYawSpeed},
      autoPitch: ${autoPitchSpeed}
    };

    let time = 0;
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX / window.innerWidth;
      mouse.targetY = e.clientY / window.innerHeight;
    });

    function parseHex(hex) {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      const v = parseInt(c, 16);
      return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
    }

    function chroma(u, b, cs, ce) {
      const s = parseHex(cs); const e = parseHex(ce);
      const r = Math.round(s.r + (e.r - s.r)*u);
      const g = Math.round(s.g + (e.g - s.g)*u);
      const bC = Math.round(s.b + (e.b - s.b)*u);
      return "rgb(" + Math.round(r*(0.45+0.55*b)) + "," + Math.round(g*(0.45+0.55*b)) + "," + Math.round(bC*(0.45+0.55*b)) + ")";
    }

    const off = document.createElement('canvas');
    off.width = opt.res; off.height = opt.res;
    const oCtx = off.getContext('2d');

    function drawPreset(oCtx, w, h, t) {
      oCtx.fillStyle = '#010204'; oCtx.fillRect(0,0,w,h);
      for(let i=0; i<3; i++) {
        const px = w/2 + Math.sin(t*1.5 + i*2)*w*0.3;
        const py = h/2 + Math.cos(t*1.2 + i*1.5)*h*0.3;
        const rad = w*(0.22 + 0.08*Math.sin(t+i));
        const grad = oCtx.createRadialGradient(px,py,0,px,py,rad);
        grad.addColorStop(0, i===0 ? 'rgba(255,0,128,0.9)' : 'rgba(0,240,255,0.9)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        oCtx.fillStyle = grad;
        oCtx.beginPath(); oCtx.arc(px,py,rad,0,Math.PI*2); oCtx.fill();
      }
    }

    function render() {
      requestAnimationFrame(render);
      time += 0.016 * opt.speed;
      mouse.x += (mouse.targetX - mouse.x)*0.08;
      mouse.y += (mouse.targetY - mouse.y)*0.08;

      ctx.clearRect(0,0,canvas.width,canvas.height);
      drawPreset(oCtx, off.width, off.height, time);

      const imgData = oCtx.getImageData(0,0,off.width,off.height);
      const data = imgData.data;

      const nodes = [];
      const ry = (opt.yaw + time * 22 * opt.autoYaw) * Math.PI / 180;
      const rx = (opt.pitch + time * 22 * opt.autoPitch) * Math.PI / 180;
      const cx = canvas.width/2; const cy = canvas.height/2;
      const sw = canvas.width*0.72; const sh = canvas.height*0.72;

      for (let y=0; y<opt.res; y++) {
        let gl = 0;
        if(opt.glitch > 0 && Math.sin(time*10 + y*0.5) > 0.88) {
          gl = Math.sin(time*40)*opt.glitch;
        }
        for (let x=0; x<opt.res; x++) {
          const u = x/(opt.res-1); const v = y/(opt.res-1);
          const idx = (y*off.width + x)*4;
          let r = data[idx]||0; let g = data[idx+1]||0; let b = data[idx+2]||0;
          let br = (0.3*r + 0.59*g + 0.11*b)/255;
          if(br < opt.threshold) { br=0; r=0; g=0; b=0; }
          else br = (br - opt.threshold)/(1 - opt.threshold);

          const x3d = (u-0.5)*sw; const y3d = (v-0.5)*sh;
          const wave = Math.sin(time*3 + (u+v)*12)*opt.wave;
          const z3d = br*opt.depth + wave;

          const xr = x3d*Math.cos(ry) - z3d*Math.sin(ry);
          const zr = x3d*Math.sin(ry) + z3d*Math.cos(ry);
          const yr = y3d*Math.cos(rx) - zr*Math.sin(rx);
          const zr2 = y3d*Math.sin(rx) + zr*Math.cos(rx);

          const p = opt.iso ? 0.95 : 750/(750+zr2);
          nodes.push({ u, v, x2d: cx + xr*p + gl, y2d: cy + yr*p, r, g, b, br, size: opt.size*(0.35 + 1.2*br)*p });
        }
      }

      ctx.globalAlpha = opt.alpha;
      if (opt.style === 'points' || opt.style === 'stipple') {
        nodes.forEach(n => {
          if(n.br < 0.05) return;
          const c = chroma(n.u, n.br, opt.cStart, opt.cEnd);
          const rad = opt.style==='stipple' ? n.size*n.br*1.5 : n.size;
          ctx.fillStyle = c;
          ctx.beginPath(); ctx.arc(n.x2d, n.y2d, rad, 0, Math.PI*2); ctx.fill();
        });
      } else {
        for(let i=0; i<nodes.length; i++) {
          const nA = nodes[i]; if(nA.br < 0.08) continue;
          let cnt = 0;
          for(let j=i+1; j<Math.min(nodes.length, i+80); j++) {
            if(cnt >= opt.plexMax) break;
            const nB = nodes[j]; if(nB.br < 0.08) continue;
            const dst = Math.hypot(nA.x2d - nB.x2d, nA.y2d - nB.y2d);
            if(dst < opt.plexDist) {
              cnt++;
              ctx.strokeStyle = chroma(nA.u, nA.br, opt.cStart, opt.cEnd);
              ctx.lineWidth = 0.5;
              ctx.beginPath(); ctx.moveTo(nA.x2d, nA.y2d); ctx.lineTo(nB.x2d, nB.y2d); ctx.stroke();
            }
          }
        }
      }
    }
    render();
  })();
</script>`;
  };

  // --- HTML5 Video Element Live Sync Hook ---
  useEffect(() => {
    if (generatorMode === 'mediamesh' && mediaType === 'video' && uploadedVideoSrc) {
      const video = document.createElement('video');
      video.src = uploadedVideoSrc;
      video.loop = true;
      video.muted = true;
      video.crossOrigin = 'anonymous';
      video.playsInline = true;
      video.play().then(() => {
        videoElRef.current = video;
      }).catch(err => {
        console.warn("Autoplay blocked:", err);
        videoElRef.current = video;
      });
    } else {
      if (videoElRef.current) {
        videoElRef.current.pause();
        videoElRef.current = null;
      }
    }
    return () => {
      if (videoElRef.current) {
        videoElRef.current.pause();
        videoElRef.current = null;
      }
    };
  }, [uploadedVideoSrc, mediaType, generatorMode]);

  // --- Mouse / Swipe Events Handlers ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mouseMode === 'drag') {
      isDraggingRef.current = true;
      updateMouseTarget(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mouseMode === 'hover' || (mouseMode === 'drag' && isDraggingRef.current)) {
      updateMouseTarget(e);
    }
  };

  const handleMouseUp = () => { isDraggingRef.current = false; };
  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    if (mouseMode !== 'none') {
      mouseRef.current.targetX = 0.5;
      mouseRef.current.targetY = 0.5;
    }
  };

  const updateMouseTarget = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(1, rect.width);
    const y = (e.clientY - rect.top) / Math.max(1, rect.height);
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (mouseMode === 'drag' && e.touches.length > 0) {
      isDraggingRef.current = true;
      updateTouchTarget(e);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (mouseMode === 'hover' || (mouseMode === 'drag' && isDraggingRef.current)) {
      updateTouchTarget(e);
    }
  };

  const updateTouchTarget = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.touches[0].clientX - rect.left) / Math.max(1, rect.width);
    const y = (e.touches[0].clientY - rect.top) / Math.max(1, rect.height);
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
  };

  // --- Real-time Draw Render Loop ---
  useEffect(() => {
    let lastTime = performance.now();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (isRecordingHighResRef.current) return;
      for (let entry of entries) {
        canvas.width = Math.max(entry.contentRect.width, 350);
        canvas.height = Math.max(entry.contentRect.height, 350);
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const render = (now: number) => {
      const deltaTime = now - lastTime;
      lastTime = now;

      // Mouse smoothing interpolation damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      if (animate) {
        timeRef.current += deltaTime * 0.002 * speed;
      }

      const w = containerRef.current?.clientWidth || canvas.width;
      const h = containerRef.current?.clientHeight || canvas.height;

      // Draw background
      if (isTransparentBg) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const renderScale = isRecordingHighResRef.current ? recordingScaleRef.current : 1.0;
      ctx.save();
      ctx.scale(renderScale, renderScale);

      // --- RENDERING SCENE 1: THREE-DIMENSIONAL SILK RIBBONS ---
      if (generatorMode === 'ribbon') {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((rotationAngle * Math.PI) / 180);
        ctx.translate(-w / 2, -h / 2);

        for (let rIdx = 0; rIdx < numRibbons; rIdx++) {
          const settings = ribbons[rIdx % ribbons.length] || ribbons[0];
          ctx.save();
          ctx.globalAlpha = opacity;
          
          const stripeCount = shadingDetail;
          const stepsCount = 65;
          const pts: { x: number; y: number; normalX: number; normalY: number; twist: number }[] = [];

          const mouseXActual = mouseRef.current.x * w;
          const mouseYActual = mouseRef.current.y * h;
          const pullRadius = 320;

          for (let s = 0; s <= stepsCount; s++) {
            const t = s / stepsCount;
            const x = -150 + t * (w + 300);
            const phaseOffset = rIdx * (Math.PI / 2.3) + settings.twistPhase;

            let sineAccumulator = 0;
            const fx1 = 0.0035 * waveFrequency;
            const fx2 = 0.0015 * waveFrequency;

            if (wavePattern === 'turbulent') {
              sineAccumulator = 
                Math.sin(timeRef.current * 2.8 + x * fx1 * 2.2 + phaseOffset) * waveIntensity * 0.8 +
                Math.cos(timeRef.current * 1.8 + x * fx2 * 2.5 + rIdx * 1.7) * (waveIntensity * 0.35);
            } else if (wavePattern === 'spiral') {
              sineAccumulator = Math.sin(timeRef.current * 1.5 - x * fx1 * 1.4 + phaseOffset * 1.5) * waveIntensity;
            } else if (wavePattern === 'sea_swell') {
              sineAccumulator = Math.sin(timeRef.current * 0.7 + x * fx1 * 0.6 + phaseOffset) * waveIntensity * 1.3;
            } else {
              sineAccumulator = 
                Math.sin(timeRef.current * 1.5 + x * fx1 + phaseOffset) * waveIntensity +
                Math.cos(timeRef.current * 0.82 + x * fx2 + rIdx * 1.2) * (waveIntensity * 0.4);
            }

            let y = h * 0.5 + sineAccumulator;

            if (mouseMode !== 'none') {
              const dx = x - mouseXActual;
              const dy = y - mouseYActual;
              const dist = Math.hypot(dx, dy);
              if (dist < pullRadius) {
                const pullPower = Math.pow(1.0 - dist / pullRadius, 2);
                y += (mouseYActual - y) * pullPower * mouseStrength;
              }
              y += (mouseRef.current.y - 0.5) * (h * 0.18);
            }

            // Normal angle calculations
            const lookX = x + 1.0;
            let lookSine = 0;
            if (wavePattern === 'turbulent') {
              lookSine = 
                Math.sin(timeRef.current * 2.8 + lookX * fx1 * 2.2 + phaseOffset) * waveIntensity * 0.8 +
                Math.cos(timeRef.current * 1.8 + lookX * fx2 * 2.5 + rIdx * 1.7) * (waveIntensity * 0.35);
            } else if (wavePattern === 'spiral') {
              lookSine = Math.sin(timeRef.current * 1.5 - lookX * fx1 * 1.4 + phaseOffset * 1.5) * waveIntensity;
            } else if (wavePattern === 'sea_swell') {
              lookSine = Math.sin(timeRef.current * 0.7 + lookX * fx1 * 0.6 + phaseOffset) * waveIntensity * 1.3;
            } else {
              lookSine = 
                Math.sin(timeRef.current * 1.5 + lookX * fx1 + phaseOffset) * waveIntensity +
                Math.cos(timeRef.current * 0.82 + lookX * fx2 + rIdx * 1.2) * (waveIntensity * 0.4);
            }
            let lookY = h * 0.5 + lookSine;

            if (mouseMode !== 'none') {
              const dx = lookX - mouseXActual;
              const dy = lookY - mouseYActual;
              const dist = Math.hypot(dx, dy);
              if (dist < pullRadius) {
                const pullPower = Math.pow(1.0 - dist / pullRadius, 2);
                lookY += (mouseYActual - lookY) * pullPower * mouseStrength;
              }
              lookY += (mouseRef.current.y - 0.5) * (h * 0.18);
            }

            const tanAngle = Math.atan2(lookY - y, 1.0);
            const normalX = -Math.sin(tanAngle);
            const normalY = Math.cos(tanAngle);
            const twistAngle = timeRef.current * twistSpeed + (x * 0.004 * twistRate) + phaseOffset;

            pts.push({ x, y, normalX, normalY, twist: twistAngle });
          }

          // Shading loop lines
          for (let f = 0; f < stripeCount; f++) {
            const normFilament = (f / (stripeCount - 1)) - 0.5;
            ctx.beginPath();
            const dCenter = Math.abs(normFilament);

            for (let p = 0; p < pts.length; p++) {
              const pt = pts[p];
              const projection = Math.cos(pt.twist + normFilament * Math.PI);
              const curHalfWidth = (thickness * 0.5) * projection;
              const extX = pt.x + pt.normalX * curHalfWidth;
              const extY = pt.y + pt.normalY * curHalfWidth;

              if (p === 0) ctx.moveTo(extX, extY);
              else ctx.lineTo(extX, extY);
            }

            const lightIncidence = Math.cos(normFilament * Math.PI * 1.2);
            const shadowFactor = 0.35 + 0.65 * (1.0 - dCenter * 1.8);
            const specular = Math.pow(Math.max(0, lightIncidence), 6.5) * lightIntensity;

            const colS = parseHexToRGB(settings.colorStart);
            const colE = parseHexToRGB(settings.colorEnd);

            const rS = Math.min(255, Math.max(0, Math.round((colS.r + (colE.r - colS.r) * 0) * shadowFactor + specular * 240)));
            const gS = Math.min(255, Math.max(0, Math.round((colS.g + (colE.g - colS.g) * 0) * shadowFactor + specular * 240)));
            const bS = Math.min(255, Math.max(0, Math.round((colS.b + (colE.b - colS.b) * 0) * shadowFactor + specular * 240)));

            const rE = Math.min(255, Math.max(0, Math.round((colS.r + (colE.r - colS.r) * 1) * shadowFactor + specular * 240)));
            const gE = Math.min(255, Math.max(0, Math.round((colS.g + (colE.g - colS.g) * 1) * shadowFactor + specular * 240)));
            const bE = Math.min(255, Math.max(0, Math.round((colS.b + (colE.b - colS.b) * 1) * shadowFactor + specular * 240)));

            const cGrad = ctx.createLinearGradient(0, 0, w, 0);
            cGrad.addColorStop(0, `rgb(${rS},${gS},${bS})`);
            cGrad.addColorStop(1, `rgb(${rE},${gE},${bE})`);

            ctx.strokeStyle = cGrad;
            ctx.lineWidth = (thickness / stripeCount) * 2.8;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
          }
          ctx.restore();
        }
        ctx.restore();

      } else {
        // --- RENDERING SCENE 2: INTERACTIVE 3D COMPREHENSIVE MEDIA MESH ---
        if (!offscreenCanvasRef.current) {
          offscreenCanvasRef.current = document.createElement('canvas');
        }
        const offscreen = offscreenCanvasRef.current;
        offscreen.width = gridDensity;
        offscreen.height = gridDensity;
        const oCtx = offscreen.getContext('2d');

        if (oCtx) {
          // Draw video image frame or procedural preset onto matrix grid canvas
          if (mediaType === 'image' && uploadedImageSrc) {
            const img = new Image();
            img.src = uploadedImageSrc;
            if (img.complete) {
              oCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
            }
          } else if (mediaType === 'video' && videoElRef.current) {
            const v = videoElRef.current;
            if (v.readyState >= 2) {
              oCtx.drawImage(v, 0, 0, offscreen.width, offscreen.height);
            }
          } else {
            drawPresetToMatrix(oCtx, offscreen.width, offscreen.height, timeRef.current, presetIndex);
          }

          const imgData = oCtx.getImageData(0, 0, offscreen.width, offscreen.height);
          const data = imgData.data;

          const gridWidth = gridDensity;
          const gridHeight = gridDensity;
          const nodes: Node3D[] = [];

          // Translate dual pitch-yaw rotations to radians with dynamic auto-spin
          const activeYaw = rotationAngle + (animate ? timeRef.current * autoYawSpeed * 22 : 0);
          const activePitch = pitchAngle + (animate ? timeRef.current * autoPitchSpeed * 22 : 0);
          const radX = (activePitch * Math.PI) / 180;
          const radY = (activeYaw * Math.PI) / 180;

          const centerProjX = w / 2;
          const centerProjY = h / 2;
          const scaleWidth = w * 0.72;
          const scaleHeight = h * 0.72;

          const mouseXActual = mouseRef.current.x * w;
          const mouseYActual = mouseRef.current.y * h;
          const pullRadius = 180;

          for (let cy = 0; cy < gridHeight; cy++) {
            // Horizontal scanline glitch offset shift
            let glitchShift = 0;
            if (glitchIntensity > 0) {
              const rowNoise = Math.sin(timeRef.current * 9.0 + cy * 0.6);
              if (rowNoise > 0.86) {
                glitchShift = Math.sin(timeRef.current * 38.0) * glitchIntensity * 1.4;
              }
            }

            for (let cx = 0; cx < gridWidth; cx++) {
              const u = cx / (gridWidth - 1);
              const v = cy / (gridHeight - 1);

              const pixX = Math.round(u * (offscreen.width - 1));
              const pixY = Math.round(v * (offscreen.height - 1));
              const idx = (pixY * offscreen.width + pixX) * 4;

              let r = data[idx] ?? 0;
              let g = data[idx+1] ?? 0;
              let b = data[idx+2] ?? 0;

              // Apply preprocessed contrast booster
              if (contrastBoost !== 1.0) {
                r = Math.min(255, Math.max(0, ((r / 255 - 0.5) * contrastBoost + 0.5) * 255));
                g = Math.min(255, Math.max(0, ((g / 255 - 0.5) * contrastBoost + 0.5) * 255));
                b = Math.min(255, Math.max(0, ((b / 255 - 0.5) * contrastBoost + 0.5) * 255));
              }

              let brightness = (0.299*r + 0.587*g + 0.114*b) / 255;

              // High-pass threshold gate to dissolve black pixels out
              if (brightness < brightnessThreshold) {
                brightness = 0;
                r = 0;
                g = 0;
                b = 0;
              } else {
                brightness = (brightness - brightnessThreshold) / (1.0 - brightnessThreshold);
              }

              // Disintegration / ascending particles decay offsets
              let decayX = 0, decayY = 0, decayZ = 0;
              if (meshStyle === 'disintegrated_voxels' && particleDecaySpeed > 0) {
                const seed = u * 40 + v * 90;
                const progressAge = (timeRef.current * particleDecaySpeed * 0.25 + seed) % 5.0;
                decayY = -progressAge * 50.0 * (0.35 + brightness * 0.65);
                decayX = Math.sin(progressAge * 3.5 + seed) * 16.0;
                decayZ = Math.cos(progressAge * 3.0 + seed) * 16.0;
              }

              // Apply coordinates
              const x3d = (u - 0.5) * scaleWidth + decayX;
              const y3d = (v - 0.5) * scaleHeight + decayY;
              const waveRipple = Math.sin(timeRef.current * 3.2 + (u + v) * 13.0) * meshWaveScale;
              const z3d = brightness * extrusionDepth + waveRipple + decayZ;

              // Perform 3D dual-axis rotation projection calculations
              const xRot1 = x3d * Math.cos(radY) - z3d * Math.sin(radY);
              const zRot1 = x3d * Math.sin(radY) + z3d * Math.cos(radY);
              const yRot1 = y3d * Math.cos(radX) - zRot1 * Math.sin(radX);
              const zRot2 = y3d * Math.sin(radX) + zRot1 * Math.cos(radX);

              // Standard vs Isometric Camera
              const persp = isometricMode ? 0.95 : 750 / (750 + zRot2);

              let screenX = centerProjX + xRot1 * persp + glitchShift;
              let screenY = centerProjY + yRot1 * persp;

              // Mouse pull displacement warping
              if (mouseMode !== 'none') {
                const dx = screenX - mouseXActual;
                const dy = screenY - mouseYActual;
                const distDist = Math.hypot(dx, dy);
                if (distDist < pullRadius) {
                  const force = Math.pow(1.0 - distDist / pullRadius, 2.0) * mouseStrength;
                  screenX += dx * force * 0.42;
                  screenY += dy * force * 0.42;
                }
              }

              nodes.push({
                u,
                v,
                x2d: screenX,
                y2d: screenY,
                z3d: zRot2,
                r,
                g,
                b,
                brightness,
                size: particleSize * (0.35 + 1.25 * brightness) * persp
              });
            }
          }

          // --- GRAPHICAL STYLES DRAWER SWITCHER (Satisfies all reference photos) ---

          // 1. STANDARD PARTICLE POINTS
          if (meshStyle === 'points') {
            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i];
              if (node.brightness < 0.05 || node.x2d < -20 || node.x2d > w + 20) continue;

              let fillStyle = '';
              if (colorProfile === 'media') {
                fillStyle = `rgb(${node.r}, ${node.g}, ${node.b})`;
              } else if (colorProfile === 'neon') {
                fillStyle = node.brightness < 0.45 ? 'rgb(255, 0, 140)' : 'rgb(0, 248, 255)';
              } else {
                fillStyle = getChromaColor(node.u, node.brightness, chromaColorStart, chromaColorEnd);
              }

              // Real-time optimized Chromatic Aberration splits
              if (chromaticAberration > 0) {
                ctx.fillStyle = 'rgba(255, 5, 80, 0.45)';
                ctx.beginPath();
                ctx.arc(node.x2d - chromaticAberration, node.y2d, Math.max(0.4, node.size * opacity), 0, Math.PI*2);
                ctx.fill();

                ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
                ctx.beginPath();
                ctx.arc(node.x2d + chromaticAberration, node.y2d, Math.max(0.4, node.size * opacity), 0, Math.PI*2);
                ctx.fill();
              }

              ctx.fillStyle = fillStyle;
              ctx.beginPath();
              ctx.arc(node.x2d, node.y2d, Math.max(0.5, node.size * opacity), 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // 2. TECH WIREFRAME CORES
          else if (meshStyle === 'wireframe') {
            ctx.save();
            ctx.globalAlpha = opacity;
            
            for (let cy = 0; cy < gridHeight; cy++) {
              for (let cx = 0; cx < gridWidth; cx++) {
                const curIdx = cy * gridWidth + cx;
                const nodeA = nodes[curIdx];
                if (!nodeA || nodeA.brightness < 0.05) continue;

                let strokeStyle = '';
                if (colorProfile === 'media') {
                  strokeStyle = `rgba(${nodeA.r}, ${nodeA.g}, ${nodeA.b}, 0.55)`;
                } else if (colorProfile === 'neon') {
                  strokeStyle = nodeA.brightness < 0.45 ? 'rgba(255, 0, 140, 0.55)' : 'rgba(0, 248, 255, 0.55)';
                } else {
                  strokeStyle = getChromaColor(nodeA.u, nodeA.brightness, chromaColorStart, chromaColorEnd);
                }

                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = Math.max(0.2, particleSize * 0.2);

                if (cx < gridWidth - 1) {
                  const nodeB = nodes[cy * gridWidth + (cx + 1)];
                  if (nodeB && nodeB.brightness >= 0.05) {
                    ctx.beginPath();
                    ctx.moveTo(nodeA.x2d, nodeA.y2d);
                    ctx.lineTo(nodeB.x2d, nodeB.y2d);
                    ctx.stroke();
                  }
                }
                if (cy < gridHeight - 1) {
                  const nodeC = nodes[(cy + 1) * gridWidth + cx];
                  if (nodeC && nodeC.brightness >= 0.05) {
                    ctx.beginPath();
                    ctx.moveTo(nodeA.x2d, nodeA.y2d);
                    ctx.lineTo(nodeC.x2d, nodeC.y2d);
                    ctx.stroke();
                  }
                }
              }
            }
            ctx.restore();
          }

          // 3. SHADED POLYGONAL MESH GRID
          else if (meshStyle === 'mesh') {
            ctx.save();
            ctx.globalAlpha = opacity;
            for (let cy = 0; cy < gridHeight - 1; cy++) {
              for (let cx = 0; cx < gridWidth - 1; cx++) {
                const i00 = cy * gridWidth + cx;
                const i10 = cy * gridWidth + (cx + 1);
                const i01 = (cy + 1) * gridWidth + cx;
                const i11 = (cy + 1) * gridWidth + (cx + 1);

                const n00 = nodes[i00];
                const n10 = nodes[i10];
                const n01 = nodes[i01];
                const n11 = nodes[i11];

                if (!n00 || !n10 || !n01 || !n11) continue;
                if (n00.brightness < 0.05 || n10.brightness < 0.05) continue;

                // Triangle 1
                let c1 = '';
                if (colorProfile === 'media') {
                  c1 = `rgba(${Math.round((n00.r+n10.r+n01.r)/3)}, ${Math.round((n00.g+n10.g+n01.g)/3)}, ${Math.round((n00.b+n10.b+n01.b)/3)}, 0.45)`;
                } else if (colorProfile === 'neon') {
                  c1 = n00.brightness < 0.45 ? 'rgba(255, 0, 140, 0.45)' : 'rgba(0, 248, 255, 0.45)';
                } else {
                  const avgU = (n00.u+n10.u+n01.u)/3;
                  const avgB = (n00.brightness+n10.brightness+n01.brightness)/3;
                  c1 = getChromaColor(avgU, avgB, chromaColorStart, chromaColorEnd);
                }

                ctx.fillStyle = c1;
                ctx.strokeStyle = 'rgba(255,255,255,0.08)';
                ctx.lineWidth = 0.35;

                ctx.beginPath();
                ctx.moveTo(n00.x2d, n00.y2d);
                ctx.lineTo(n10.x2d, n10.y2d);
                ctx.lineTo(n01.x2d, n01.y2d);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Triangle 2
                let c2 = '';
                if (colorProfile === 'media') {
                  c2 = `rgba(${Math.round((n10.r+n11.r+n01.r)/3)}, ${Math.round((n10.g+n11.g+n01.g)/3)}, ${Math.round((n10.b+n11.b+n01.b)/3)}, 0.45)`;
                } else if (colorProfile === 'neon') {
                  c2 = n11.brightness < 0.45 ? 'rgba(255, 0, 140, 0.45)' : 'rgba(0, 248, 255, 0.45)';
                } else {
                  const avgU = (n10.u+n11.u+n01.u)/3;
                  const avgB = (n10.brightness+n11.brightness+n01.brightness)/3;
                  c2 = getChromaColor(avgU, avgB, chromaColorStart, chromaColorEnd);
                }

                ctx.fillStyle = c2;
                ctx.beginPath();
                ctx.moveTo(n10.x2d, n10.y2d);
                ctx.lineTo(n11.x2d, n11.y2d);
                ctx.lineTo(n01.x2d, n01.y2d);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
              }
            }
            ctx.restore();
          }

          // 4. INTERACTIVE HIGH-TECH PLEXUS GRID NETWORKS
          else if (meshStyle === 'plexus') {
            ctx.save();
            ctx.globalAlpha = opacity;
            
            // Render proximity vector plexus cables
            for (let i = 0; i < nodes.length; i += 1) {
              const nodeA = nodes[i];
              if (!nodeA || nodeA.brightness < 0.08) continue;

              let lineCount = 0;
              // Check near neighbors index sequences to avoid nested O(N^2) bottlenecks
              for (let j = i + 1; j < Math.min(nodes.length, i + 130); j++) {
                if (lineCount >= plexusMaxConnections) break;
                const nodeB = nodes[j];
                if (!nodeB || nodeB.brightness < 0.08) continue;

                const dx = nodeA.x2d - nodeB.x2d;
                const dy = nodeA.y2d - nodeB.y2d;
                const dist = Math.hypot(dx, dy);

                if (dist < plexusMaxDistance) {
                  lineCount++;
                  const alphaFactor = (1.0 - dist / plexusMaxDistance) * 0.48;

                  let strColor = '';
                  if (colorProfile === 'media') {
                    strColor = `rgba(${nodeA.r}, ${nodeA.g}, ${nodeA.b}, ${alphaFactor})`;
                  } else if (colorProfile === 'neon') {
                    strColor = nodeA.brightness < 0.45 ? `rgba(255, 0, 140, ${alphaFactor})` : `rgba(0, 248, 255, ${alphaFactor})`;
                  } else {
                    const chr = getChromaColor(nodeA.u, nodeA.brightness, chromaColorStart, chromaColorEnd);
                    strColor = chr.replace('rgb', 'rgba').replace(')', `, ${alphaFactor})`);
                  }

                  ctx.strokeStyle = strColor;
                  ctx.lineWidth = Math.max(0.3, particleSize * 0.15);
                  ctx.beginPath();
                  ctx.moveTo(nodeA.x2d, nodeA.y2d);
                  ctx.lineTo(nodeB.x2d, nodeB.y2d);
                  ctx.stroke();
                }
              }

              // Draw circular nexus joints
              let jointFill = (colorProfile === 'media') 
                ? `rgb(${nodeA.r}, ${nodeA.g}, ${nodeA.b})` 
                : (colorProfile === 'neon')
                  ? (nodeA.brightness < 0.45 ? 'rgb(255, 0, 140)' : 'rgb(0, 248, 255)')
                  : getChromaColor(nodeA.u, nodeA.brightness, chromaColorStart, chromaColorEnd);

              ctx.fillStyle = jointFill;
              ctx.beginPath();
              ctx.arc(nodeA.x2d, nodeA.y2d, Math.max(0.7, nodeA.size * 0.65), 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }

          // 5. STIPPLED HALFTONE GRAPHICS
          else if (meshStyle === 'stipple') {
            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i];
              if (node.brightness < 0.05 || node.x2d < -20) continue;

              let fillStyle = '';
              if (colorProfile === 'media') {
                fillStyle = `rgb(${node.r}, ${node.g}, ${node.b})`;
              } else if (colorProfile === 'neon') {
                fillStyle = node.brightness < 0.45 ? 'rgb(255, 0, 140)' : 'rgb(0, 248, 255)';
              } else {
                fillStyle = getChromaColor(node.u, node.brightness, chromaColorStart, chromaColorEnd);
              }

              const dynamicRadius = node.size * node.brightness * 1.55;
              if (dynamicRadius > 0.3) {
                ctx.fillStyle = fillStyle;
                ctx.beginPath();
                ctx.arc(node.x2d, node.y2d, dynamicRadius, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          // 6. CYBER TERMINAL GLOWING ASCII CODE MATRICES
          else if (meshStyle === 'ascii') {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const charSize = Math.max(7, particleSize * 2.3);
            ctx.font = `bold ${charSize}px monospace`;

            let charset = "01";
            if (asciiCharacterPalette === 'matrix') {
              charset = "01ZEON9X8M7A5XW2Oｦｧｨｩｪｫｬｭｮ";
            } else if (asciiCharacterPalette === 'typographic') {
              charset = " .;-=+*%#@";
            } else if (asciiCharacterPalette === 'symbols') {
              charset = "<>/{}[];:*&^$#@";
            }

            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i];
              if (node.brightness < 0.06) continue;

              const valIdx = Math.floor(node.brightness * (charset.length - 1));
              const textChar = charset[valIdx] || charset[0];

              let charColor = '';
              if (colorProfile === 'media') {
                charColor = `rgb(${node.r}, ${node.g}, ${node.b})`;
              } else if (colorProfile === 'neon') {
                charColor = node.brightness < 0.45 ? 'rgb(255, 0, 140)' : 'rgb(0, 248, 255)';
              } else {
                charColor = getChromaColor(node.u, node.brightness, chromaColorStart, chromaColorEnd);
              }

              ctx.fillStyle = charColor;
              ctx.fillText(textChar, node.x2d, node.y2d);
            }
            ctx.restore();
          }

          // 7. SLEEK TOPOGRAPHIC CONTOUR LINES
          else if (meshStyle === 'topological_contour') {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.lineWidth = Math.max(0.4, particleSize * 0.22);

            for (let cy = 0; cy < gridHeight - 1; cy++) {
              for (let cx = 0; cx < gridWidth - 1; cx++) {
                const i00 = cy * gridWidth + cx;
                const i10 = cy * gridWidth + (cx + 1);
                const i01 = (cy + 1) * gridWidth + cx;

                const n00 = nodes[i00];
                const n10 = nodes[i10];
                const n01 = nodes[i01];

                if (!n00 || !n10 || !n01) continue;
                
                const avgBrightness = (n00.brightness + n10.brightness + n01.brightness) / 3;
                if (avgBrightness < 0.09) continue;

                const sliceLvl0 = Math.floor(n00.brightness * contourLevels);
                const sliceLvl1 = Math.floor(n10.brightness * contourLevels);
                const sliceLvl2 = Math.floor(n01.brightness * contourLevels);

                if (sliceLvl0 !== sliceLvl1 || sliceLvl0 !== sliceLvl2) {
                  let contourStroke = '';
                  if (colorProfile === 'media') {
                    contourStroke = `rgba(${n00.r}, ${n00.g}, ${n00.b}, 0.78)`;
                  } else if (colorProfile === 'neon') {
                    contourStroke = n00.brightness < 0.45 ? 'rgba(255, 0, 140, 0.78)' : 'rgba(0, 248, 255, 0.78)';
                  } else {
                    contourStroke = getChromaColor(n00.u, n00.brightness, chromaColorStart, chromaColorEnd);
                  }

                  ctx.strokeStyle = contourStroke;
                  ctx.beginPath();
                  ctx.moveTo(n00.x2d, n00.y2d);
                  ctx.lineTo(n10.x2d, n10.y2d);
                  ctx.lineTo(n01.x2d, n01.y2d);
                  ctx.stroke();
                }
              }
            }
            ctx.restore();
          }

          // 8. DISINTEGRATING PARTICLES VOXEL DECAY
          else if (meshStyle === 'disintegrated_voxels') {
            ctx.save();
            ctx.globalAlpha = opacity;
            
            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i];
              if (node.brightness < 0.05) continue;

              let voxelColor = '';
              if (colorProfile === 'media') {
                voxelColor = `rgb(${node.r}, ${node.g}, ${node.b})`;
              } else if (colorProfile === 'neon') {
                voxelColor = node.brightness < 0.45 ? 'rgb(255, 0, 140)' : 'rgb(0, 248, 255)';
              } else {
                voxelColor = getChromaColor(node.u, node.brightness, chromaColorStart, chromaColorEnd);
              }

              ctx.fillStyle = voxelColor;
              ctx.strokeStyle = 'rgba(0,0,0,0.22)';
              ctx.lineWidth = 0.4;

              const vSize = Math.max(1.2, node.size * 1.55);
              ctx.beginPath();
              ctx.rect(node.x2d - vSize/2, node.y2d - vSize/2, vSize, vSize);
              ctx.fill();
              ctx.stroke();
            }
            ctx.restore();
          }

        }
      }

      ctx.restore(); // Restore scaled context

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    generatorMode,
    isTransparentBg,
    backgroundColor,
    animate,
    speed,
    opacity,
    pitchAngle,
    rotationAngle,
    isometricMode,
    bgBlur,
    mouseMode,
    mouseStrength,
    numRibbons,
    ribbons,
    waveIntensity,
    thickness,
    lightIntensity,
    twistRate,
    shadingDetail,
    wavePattern,
    waveFrequency,
    twistSpeed,
    mediaType,
    presetIndex,
    uploadedImageSrc,
    meshStyle,
    gridDensity,
    extrusionDepth,
    particleSize,
    meshWaveScale,
    colorProfile,
    chromaticAberration,
    glitchIntensity,
    contrastBoost,
    brightnessThreshold,
    plexusMaxDistance,
    plexusMaxConnections,
    asciiCharacterPalette,
    particleDecaySpeed,
    contourLevels,
    chromaColorStart,
    chromaColorEnd,
    autoYawSpeed,
    autoPitchSpeed
  ]);

  // --- Image / Video Drag-and-Drop and Upload Handlers ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    const fileReader = new FileReader();
    if (file.type.startsWith('image/')) {
      fileReader.onload = () => {
        setUploadedImageSrc(fileReader.result as string);
        setMediaType('image');
        showToast('Success: Image mapped to 3D mesh matrices!');
      };
      fileReader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setUploadedVideoSrc(url);
      setMediaType('video');
      showToast('Success: Video stream mapped to 3D dynamics!');
    } else {
      showToast('Error: Please provide static image or video assets.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // --- GENERATE FULLY ANIMATED SMOOTH LOOPING VECTOR SVG ---
  const generateDynamicSVGString = (): string => {
    const w = 960;
    const h = 640;
    const opacityFactor = opacity;
    let svgMiddle = '';

    if (generatorMode === 'ribbon') {
      const stepsCount = 65;
      const ribbonsStrArray: string[] = [];

      // Loop duration: Ribbon wave period with angular frequency 1.5 is:
      // T = (2 * Math.PI) / 1.5 ≈ 4.18879
      const activeSpeed = speed || 0.1 || 1.0;
      const period = (2 * Math.PI) / 1.5;
      const sampleTimes = animate 
        ? [
            timeRef.current,
            timeRef.current + period * 0.25,
            timeRef.current + period * 0.50,
            timeRef.current + period * 0.75
          ]
        : [timeRef.current];

      const durationSec = (period / activeSpeed).toFixed(2) + 's';

      for (let rIdx = 0; rIdx < numRibbons; rIdx++) {
        const settings = ribbons[rIdx % ribbons.length] || ribbons[0];
        const stripeCount = Math.min(25, shadingDetail);

        for (let f = 0; f < stripeCount; f++) {
          const normFilament = (f / (stripeCount - 1)) - 0.5;
          const dCenter = Math.abs(normFilament);

          const pathDFrames: string[] = [];

          // Precompute path strings for multiple frames to morph smoothly
          sampleTimes.forEach((tVal) => {
            const pts: { x: number; y: number; normalX: number; normalY: number; twist: number }[] = [];
            for (let s = 0; s <= stepsCount; s++) {
              const t = s / stepsCount;
              const x = -150 + t * (w + 300);
              const phaseOffset = rIdx * (Math.PI / 2.3) + settings.twistPhase;
              
              let sine = 0;
              const fx1 = 0.0035 * waveFrequency;
              const fx2 = 0.0015 * waveFrequency;

              if (wavePattern === 'turbulent') {
                sine = 
                  Math.sin(tVal * 2.8 + x * fx1 * 2.2 + phaseOffset) * waveIntensity * 0.8 +
                  Math.cos(tVal * 1.8 + x * fx2 * 2.5 + rIdx * 1.7) * (waveIntensity * 0.35);
              } else if (wavePattern === 'spiral') {
                sine = Math.sin(tVal * 1.5 - x * fx1 * 1.4 + phaseOffset * 1.5) * waveIntensity;
              } else if (wavePattern === 'sea_swell') {
                sine = Math.sin(tVal * 0.7 + x * fx1 * 0.6 + phaseOffset) * waveIntensity * 1.3;
              } else {
                sine = 
                  Math.sin(tVal * 1.5 + x * fx1 + phaseOffset) * waveIntensity +
                  Math.cos(tVal * 0.82 + x * fx2 + rIdx * 1.2) * (waveIntensity * 0.4);
              }

              const y = h * 0.5 + sine;

              const lookX = x + 1.0;
              let lookSine = 0;
              if (wavePattern === 'turbulent') {
                lookSine = 
                  Math.sin(tVal * 2.8 + lookX * fx1 * 2.2 + phaseOffset) * waveIntensity * 0.8 +
                  Math.cos(tVal * 1.8 + lookX * fx2 * 2.5 + rIdx * 1.7) * (waveIntensity * 0.35);
              } else if (wavePattern === 'spiral') {
                lookSine = Math.sin(tVal * 1.5 - lookX * fx1 * 1.4 + phaseOffset * 1.5) * waveIntensity;
              } else if (wavePattern === 'sea_swell') {
                lookSine = Math.sin(tVal * 0.7 + lookX * fx1 * 0.6 + phaseOffset) * waveIntensity * 1.3;
              } else {
                lookSine = 
                  Math.sin(tVal * 1.5 + lookX * fx1 + phaseOffset) * waveIntensity +
                  Math.cos(tVal * 0.82 + lookX * fx2 + rIdx * 1.2) * (waveIntensity * 0.4);
              }
              const lookY = h * 0.5 + lookSine;

              const tangent = Math.atan2(lookY - y, 1.0);
              const normalX = -Math.sin(tangent);
              const normalY = Math.cos(tangent);
              const twistAngle = tVal * twistSpeed + (x * 0.004 * twistRate) + phaseOffset;

              pts.push({ x, y, normalX, normalY, twist: twistAngle });
            }

            let pathPoints = '';
            for (let pIdx = 0; pIdx < pts.length; pIdx++) {
              const pt = pts[pIdx];
              const projection = Math.cos(pt.twist + normFilament * Math.PI);
              const curHalfWidth = (thickness * 0.5) * projection;
              const extX = (pt.x + pt.normalX * curHalfWidth).toFixed(1);
              const extY = (pt.y + pt.normalY * curHalfWidth).toFixed(1);
              
              if (pIdx === 0) pathPoints += `M ${extX} ${extY}`;
              else pathPoints += ` L ${extX} ${extY}`;
            }
            pathDFrames.push(pathPoints);
          });

          const lightIncidence = Math.cos(normFilament * Math.PI * 1.2);
          const shadowFactor = 0.35 + 0.65 * (1.0 - dCenter * 1.8);
          const specular = Math.pow(Math.max(0, lightIncidence), 6.5) * lightIntensity;
          const colS = parseHexToRGB(settings.colorStart);
          const colE = parseHexToRGB(settings.colorEnd);

          const r = Math.min(255, Math.max(0, Math.round((colS.r + (colE.r - colS.r) * 0.5) * shadowFactor + specular * 240)));
          const g = Math.min(255, Math.max(0, Math.round((colS.g + (colE.g - colS.g) * 0.5) * shadowFactor + specular * 240)));
          const bColors = Math.min(255, Math.max(0, Math.round((colS.b + (colE.b - colS.b) * 0.5) * shadowFactor + specular * 240)));

          const strokeColorStr = `rgb(${r},${g},${bColors})`;
          const strokeWidthVal = ((thickness / stripeCount) * 2.8).toFixed(1);

          if (animate && pathDFrames.length > 1) {
            ribbonsStrArray.push(`  <path d="${pathDFrames[0]}" fill="none" stroke="${strokeColorStr}" stroke-width="${strokeWidthVal}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacityFactor}">
    <animate attributeName="d" dur="${durationSec}" repeatCount="indefinite" values="${pathDFrames.join('; ')}; ${pathDFrames[0]}" />
  </path>`);
          } else {
            ribbonsStrArray.push(`  <path d="${pathDFrames[0]}" fill="none" stroke="${strokeColorStr}" stroke-width="${strokeWidthVal}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacityFactor}" />`);
          }
        }
      }
      svgMiddle = ribbonsStrArray.join('\n');

    } else {
      // Mesh Mode
      const offscreen = offscreenCanvasRef.current || document.createElement('canvas');
      offscreen.width = gridDensity;
      offscreen.height = gridDensity;
      const oCtx = offscreen.getContext('2d');
      if (oCtx) {
        if (mediaType === 'image' && uploadedImageSrc) {
          const img = new Image();
          img.src = uploadedImageSrc;
          if (img.complete) oCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
        } else if (mediaType === 'video' && videoElRef.current) {
          oCtx.drawImage(videoElRef.current, 0, 0, offscreen.width, offscreen.height);
        } else {
          drawPresetToMatrix(oCtx, offscreen.width, offscreen.height, timeRef.current, presetIndex);
        }

        const imgData = oCtx.getImageData(0, 0, offscreen.width, offscreen.height);
        const data = imgData.data;

        const centerProjX = w / 2;
        const centerProjY = h / 2;
        const scaleW = w * 0.82;
        const scaleH = h * 0.82;

        // Loop period: Mesh wave angular frequency 3.2 is:
        // T_mesh = 2 * PI / 3.2 ≈ 1.96349
        const activeSpeed = speed || 0.1 || 1.0;
        const period = (2 * Math.PI) / 3.2;
        const sampleTimes = animate 
          ? [
              timeRef.current,
              timeRef.current + period * 0.25,
              timeRef.current + period * 0.50,
              timeRef.current + period * 0.75
            ]
          : [timeRef.current];

        const durationSec = (period / activeSpeed).toFixed(2) + 's';

        // Precompute node grids for each sample time frame
        const nodesFrames: Node3D[][] = [];

        sampleTimes.forEach((tVal) => {
          const frameNodes: Node3D[] = [];
          
          const activeYaw = rotationAngle + (animate ? tVal * autoYawSpeed * 22 : 0);
          const activePitch = pitchAngle + (animate ? tVal * autoPitchSpeed * 22 : 0);
          const radX = (activePitch * Math.PI) / 180;
          const radY = (activeYaw * Math.PI) / 180;

          for (let cy = 0; cy < gridDensity; cy++) {
            for (let cx = 0; cx < gridDensity; cx++) {
              const u = cx / (gridDensity - 1);
              const v = cy / (gridDensity - 1);

              const pX = Math.round(u * (offscreen.width - 1));
              const pY = Math.round(v * (offscreen.height - 1));
              const idx = (pY * offscreen.width + pX) * 4;

              let r = data[idx] ?? 0;
              let g = data[idx+1] ?? 0;
              let b = data[idx+2] ?? 0;

              if (contrastBoost !== 1.0) {
                r = Math.min(255, Math.max(0, ((r / 255 - 0.5) * contrastBoost + 0.5) * 255));
                g = Math.min(255, Math.max(0, ((g / 255 - 0.5) * contrastBoost + 0.5) * 255));
                b = Math.min(255, Math.max(0, ((b / 255 - 0.5) * contrastBoost + 0.5) * 255));
              }

              let brightness = (0.299*r + 0.587*g + 0.114*b) / 255;
              if (brightness < brightnessThreshold) {
                brightness = 0; r = 0; g = 0; b = 0;
              } else {
                brightness = (brightness - brightnessThreshold) / (1.0 - brightnessThreshold);
              }

              const x3d = (u - 0.5) * scaleW;
              const y3d = (v - 0.5) * scaleH;
              const wave = Math.sin(tVal * 3.2 + (u + v) * 13.0) * meshWaveScale;
              const z3d = brightness * extrusionDepth + wave;

              const xRot = x3d * Math.cos(radY) - z3d * Math.sin(radY);
              const zRot = x3d * Math.sin(radY) + z3d * Math.cos(radY);
              const yRot = y3d * Math.cos(radX) - zRot * Math.sin(radX);
              const zRot2 = y3d * Math.sin(radX) + zRot * Math.cos(radX);

              const persp = isometricMode ? 0.95 : 750 / (750 + zRot2);

              frameNodes.push({
                u,
                v,
                x2d: centerProjX + xRot * persp,
                y2d: centerProjY + yRot * persp,
                z3d: zRot2,
                r,
                g,
                b,
                brightness,
                size: particleSize * (0.35 + 1.25 * brightness) * persp
              });
            }
          }
          nodesFrames.push(frameNodes);
        });

        const elements: string[] = [];
        const frame0Nodes = nodesFrames[0];

        if (meshStyle === 'points' || meshStyle === 'stipple' || meshStyle === 'disintegrated_voxels') {
          frame0Nodes.forEach((node, nodeIdx) => {
            if (node.brightness < 0.05) return;
            let colorStr = '';
            if (colorProfile === 'media') {
              colorStr = `rgb(${node.r},${node.g},${node.b})`;
            } else if (colorProfile === 'neon') {
              colorStr = node.brightness < 0.45 ? 'rgb(255,0,130)' : 'rgb(0,248,255)';
            } else {
              colorStr = getChromaColor(node.u, node.brightness, chromaColorStart, chromaColorEnd);
            }
            const rad = meshStyle === 'stipple' ? node.size * node.brightness * 1.55 : node.size * opacity;
            
            if (animate && nodesFrames.length > 1) {
              const cxVals = nodesFrames.map(f => f[nodeIdx]?.x2d.toFixed(1) ?? '0');
              const cyVals = nodesFrames.map(f => f[nodeIdx]?.y2d.toFixed(1) ?? '0');
              
              elements.push(`  <circle cx="${cxVals[0]}" cy="${cyVals[0]}" r="${Math.max(0.5, rad).toFixed(1)}" fill="${colorStr}" opacity="${opacityFactor}">
    <animate attributeName="cx" dur="${durationSec}" repeatCount="indefinite" values="${cxVals.join('; ')}; ${cxVals[0]}" />
    <animate attributeName="cy" dur="${durationSec}" repeatCount="indefinite" values="${cyVals.join('; ')}; ${cyVals[0]}" />
  </circle>`);
            } else {
              elements.push(`  <circle cx="${node.x2d.toFixed(1)}" cy="${node.y2d.toFixed(1)}" r="${Math.max(0.5, rad).toFixed(1)}" fill="${colorStr}" opacity="${opacityFactor}" />`);
            }
          });
        } else if (meshStyle === 'wireframe' || meshStyle === 'plexus') {
          for (let cy = 0; cy < gridDensity; cy++) {
            for (let cx = 0; cx < gridDensity; cx++) {
              const curIdx = cy * gridDensity + cx;
              const nodeA = frame0Nodes[curIdx];
              if (!nodeA || nodeA.brightness < 0.08) continue;

              let colorS = '';
              if (colorProfile === 'media') {
                colorS = `rgb(${nodeA.r},${nodeA.g},${nodeA.b})`;
              } else if (colorProfile === 'neon') {
                colorS = nodeA.brightness < 0.45 ? 'rgb(255,0,130)' : 'rgb(0,248,255)';
              } else {
                colorS = getChromaColor(nodeA.u, nodeA.brightness, chromaColorStart, chromaColorEnd);
              }

              if (meshStyle === 'plexus') {
                let linesCount = 0;
                for (let j = curIdx + 1; j < Math.min(frame0Nodes.length, curIdx + 45); j++) {
                  if (linesCount >= plexusMaxConnections) break;
                  const nodeB0 = frame0Nodes[j];
                  if (!nodeB0 || nodeB0.brightness < 0.08) continue;
                  
                  const dist0 = Math.hypot(nodeA.x2d - nodeB0.x2d, nodeA.y2d - nodeB0.y2d);
                  if (dist0 < plexusMaxDistance) {
                    linesCount++;
                    
                    if (animate && nodesFrames.length > 1) {
                      const x1Vals = nodesFrames.map(f => f[curIdx]?.x2d.toFixed(1) ?? '0');
                      const y1Vals = nodesFrames.map(f => f[curIdx]?.y2d.toFixed(1) ?? '0');
                      const x2Vals = nodesFrames.map(f => f[j]?.x2d.toFixed(1) ?? '0');
                      const y2Vals = nodesFrames.map(f => f[j]?.y2d.toFixed(1) ?? '0');
                      
                      elements.push(`  <line x1="${x1Vals[0]}" y1="${y1Vals[0]}" x2="${x2Vals[0]}" y2="${y2Vals[0]}" stroke="${colorS}" stroke-width="0.6" opacity="${((1.0 - dist0/plexusMaxDistance) * 0.4).toFixed(2)}">
    <animate attributeName="x1" dur="${durationSec}" repeatCount="indefinite" values="${x1Vals.join('; ')}; ${x1Vals[0]}" />
    <animate attributeName="y1" dur="${durationSec}" repeatCount="indefinite" values="${y1Vals.join('; ')}; ${y1Vals[0]}" />
    <animate attributeName="x2" dur="${durationSec}" repeatCount="indefinite" values="${x2Vals.join('; ')}; ${x2Vals[0]}" />
    <animate attributeName="y2" dur="${durationSec}" repeatCount="indefinite" values="${y2Vals.join('; ')}; ${y2Vals[0]}" />
  </line>`);
                    } else {
                      elements.push(`  <line x1="${nodeA.x2d.toFixed(1)}" y1="${nodeA.y2d.toFixed(1)}" x2="${nodeB0.x2d.toFixed(1)}" y2="${nodeB0.y2d.toFixed(1)}" stroke="${colorS}" stroke-width="0.6" opacity="${((1.0 - dist0/plexusMaxDistance) * 0.4).toFixed(2)}" />`);
                    }
                  }
                }
              } else {
                if (cx < gridDensity - 1) {
                  const targetIdx = cy * gridDensity + (cx + 1);
                  const nodeB0 = frame0Nodes[targetIdx];
                  if (nodeB0 && nodeB0.brightness >= 0.08) {
                    const strokeWidthVal = Math.max(0.4, particleSize * 0.18).toFixed(1);
                    if (animate && nodesFrames.length > 1) {
                      const x1Vals = nodesFrames.map(f => f[curIdx]?.x2d.toFixed(1) ?? '0');
                      const y1Vals = nodesFrames.map(f => f[curIdx]?.y2d.toFixed(1) ?? '0');
                      const x2Vals = nodesFrames.map(f => f[targetIdx]?.x2d.toFixed(1) ?? '0');
                      const y2Vals = nodesFrames.map(f => f[targetIdx]?.y2d.toFixed(1) ?? '0');
                      
                      elements.push(`  <line x1="${x1Vals[0]}" y1="${y1Vals[0]}" x2="${x2Vals[0]}" y2="${y2Vals[0]}" stroke="${colorS}" stroke-width="${strokeWidthVal}" opacity="${opacityFactor * 0.6}">
    <animate attributeName="x1" dur="${durationSec}" repeatCount="indefinite" values="${x1Vals.join('; ')}; ${x1Vals[0]}" />
    <animate attributeName="y1" dur="${durationSec}" repeatCount="indefinite" values="${y1Vals.join('; ')}; ${y1Vals[0]}" />
    <animate attributeName="x2" dur="${durationSec}" repeatCount="indefinite" values="${x2Vals.join('; ')}; ${x2Vals[0]}" />
    <animate attributeName="y2" dur="${durationSec}" repeatCount="indefinite" values="${y2Vals.join('; ')}; ${y2Vals[0]}" />
  </line>`);
                    } else {
                      elements.push(`  <line x1="${nodeA.x2d.toFixed(1)}" y1="${nodeA.y2d.toFixed(1)}" x2="${nodeB0.x2d.toFixed(1)}" y2="${nodeB0.y2d.toFixed(1)}" stroke="${colorS}" stroke-width="${strokeWidthVal}" opacity="${opacityFactor * 0.6}" />`);
                    }
                  }
                }
                if (cy < gridDensity - 1) {
                  const targetIdx = (cy + 1) * gridDensity + cx;
                  const nodeC0 = frame0Nodes[targetIdx];
                  if (nodeC0 && nodeC0.brightness >= 0.08) {
                    const strokeWidthVal = Math.max(0.4, particleSize * 0.18).toFixed(1);
                    if (animate && nodesFrames.length > 1) {
                      const x1Vals = nodesFrames.map(f => f[curIdx]?.x2d.toFixed(1) ?? '0');
                      const y1Vals = nodesFrames.map(f => f[curIdx]?.y2d.toFixed(1) ?? '0');
                      const x2Vals = nodesFrames.map(f => f[targetIdx]?.x2d.toFixed(1) ?? '0');
                      const y2Vals = nodesFrames.map(f => f[targetIdx]?.y2d.toFixed(1) ?? '0');
                      
                      elements.push(`  <line x1="${x1Vals[0]}" y1="${y1Vals[0]}" x2="${x2Vals[0]}" y2="${y2Vals[0]}" stroke="${colorS}" stroke-width="${strokeWidthVal}" opacity="${opacityFactor * 0.6}">
    <animate attributeName="x1" dur="${durationSec}" repeatCount="indefinite" values="${x1Vals.join('; ')}; ${x1Vals[0]}" />
    <animate attributeName="y1" dur="${durationSec}" repeatCount="indefinite" values="${y1Vals.join('; ')}; ${y1Vals[0]}" />
    <animate attributeName="x2" dur="${durationSec}" repeatCount="indefinite" values="${x2Vals.join('; ')}; ${x2Vals[0]}" />
    <animate attributeName="y2" dur="${durationSec}" repeatCount="indefinite" values="${y2Vals.join('; ')}; ${y2Vals[0]}" />
  </line>`);
                    } else {
                      elements.push(`  <line x1="${nodeA.x2d.toFixed(1)}" y1="${nodeA.y2d.toFixed(1)}" x2="${nodeC0.x2d.toFixed(1)}" y2="${nodeC0.y2d.toFixed(1)}" stroke="${colorS}" stroke-width="${strokeWidthVal}" opacity="${opacityFactor * 0.6}" />`);
                    }
                  }
                }
              }
            }
          }
        } else if (meshStyle === 'ascii') {
          frame0Nodes.forEach((node, nodeIdx) => {
            if (node.brightness < 0.08) return;
            let colorStr = node.brightness < 0.45 ? 'rgb(255,0,130)' : 'rgb(0,248,255)';
            if (colorProfile === 'media') colorStr = `rgb(${node.r},${node.g},${node.b})`;
            const char = node.brightness < 0.5 ? '0' : '1';
            
            if (animate && nodesFrames.length > 1) {
              const xVals = nodesFrames.map(f => f[nodeIdx]?.x2d.toFixed(1) ?? '0');
              const yVals = nodesFrames.map(f => f[nodeIdx]?.y2d.toFixed(1) ?? '0');
              
              elements.push(`  <text x="${xVals[0]}" y="${yVals[0]}" fill="${colorStr}" font-family="monospace" font-size="8" font-weight="bold" text-anchor="middle" alignment-baseline="middle" opacity="${opacityFactor}">
    ${char}
    <animate attributeName="x" dur="${durationSec}" repeatCount="indefinite" values="${xVals.join('; ')}; ${xVals[0]}" />
    <animate attributeName="y" dur="${durationSec}" repeatCount="indefinite" values="${yVals.join('; ')}; ${yVals[0]}" />
  </text>`);
            } else {
              elements.push(`  <text x="${node.x2d.toFixed(1)}" y="${node.y2d.toFixed(1)}" fill="${colorStr}" font-family="monospace" font-size="8" font-weight="bold" text-anchor="middle" alignment-baseline="middle" opacity="${opacityFactor}">${char}</text>`);
            }
          });
        } else {
          // Triangulated Outlines
          for (let cy = 0; cy < gridDensity - 1; cy++) {
            for (let cx = 0; cx < gridDensity - 1; cx++) {
              const idx00 = cy * gridDensity + cx;
              const idx10 = cy * gridDensity + (cx + 1);
              const idx01 = (cy + 1) * gridDensity + cx;
              const idx11 = (cy + 1) * gridDensity + (cx + 1);

              const n00 = frame0Nodes[idx00];
              const n10 = frame0Nodes[idx10];
              const n01 = frame0Nodes[idx01];
              const n11 = frame0Nodes[idx11];

              if (!n00 || !n10 || !n01 || !n11) continue;

              let fillA = '', fillB = '';
              if (colorProfile === 'media') {
                fillA = `rgb(${Math.round((n00.r+n10.r+n01.r)/3)},${Math.round((n00.g+n10.g+n01.g)/3)},${Math.round((n00.b+n10.b+n01.b)/3)})`;
                fillB = `rgb(${Math.round((n10.r+n11.r+n01.r)/3)},${Math.round((n10.g+n11.g+n01.g)/3)},${Math.round((n10.b+n11.b+n01.b)/3)})`;
              } else if (colorProfile === 'neon') {
                fillA = n00.brightness < 0.45 ? 'rgba(255,0,130,0.5)' : 'rgba(0,248,255,0.5)';
                fillB = n11.brightness < 0.45 ? 'rgba(255,0,130,0.5)' : 'rgba(0,248,255,0.5)';
              } else {
                fillA = getChromaColor((n00.u+n10.u+n01.u)/3, (n00.brightness+n10.brightness+n01.brightness)/3, chromaColorStart, chromaColorEnd);
                fillB = getChromaColor((n10.u+n11.u+n01.u)/3, (n10.brightness+n11.brightness+n01.brightness)/3, chromaColorStart, chromaColorEnd);
              }

              if (animate && nodesFrames.length > 1) {
                const pointsAVals = nodesFrames.map(f => {
                  const node00 = f[idx00];
                  const node10 = f[idx10];
                  const node01 = f[idx01];
                  return `${node00?.x2d.toFixed(1)},${node00?.y2d.toFixed(1)} ${node10?.x2d.toFixed(1)},${node10?.y2d.toFixed(1)} ${node01?.x2d.toFixed(1)},${node01?.y2d.toFixed(1)}`;
                });
                const pointsBVals = nodesFrames.map(f => {
                  const node10 = f[idx10];
                  const node11 = f[idx11];
                  const node01 = f[idx01];
                  return `${node10?.x2d.toFixed(1)},${node10?.y2d.toFixed(1)} ${node11?.x2d.toFixed(1)},${node11?.y2d.toFixed(1)} ${node01?.x2d.toFixed(1)},${node01?.y2d.toFixed(1)}`;
                });

                elements.push(`  <polygon points="${pointsAVals[0]}" fill="${fillA}" opacity="${opacityFactor}">
    <animate attributeName="points" dur="${durationSec}" repeatCount="indefinite" values="${pointsAVals.join('; ')}; ${pointsAVals[0]}" />
  </polygon>`);
                elements.push(`  <polygon points="${pointsBVals[0]}" fill="${fillB}" opacity="${opacityFactor}">
    <animate attributeName="points" dur="${durationSec}" repeatCount="indefinite" values="${pointsBVals.join('; ')}; ${pointsBVals[0]}" />
  </polygon>`);
              } else {
                elements.push(`  <polygon points="${n00.x2d.toFixed(1)},${n00.y2d.toFixed(1)} ${n10.x2d.toFixed(1)},${n10.y2d.toFixed(1)} ${n01.x2d.toFixed(1)},${n01.y2d.toFixed(1)}" fill="${fillA}" opacity="${opacityFactor}" />`);
                elements.push(`  <polygon points="${n10.x2d.toFixed(1)},${n10.y2d.toFixed(1)} ${n11.x2d.toFixed(1)},${n11.y2d.toFixed(1)} ${n01.x2d.toFixed(1)},${n01.y2d.toFixed(1)}" fill="${fillB}" opacity="${opacityFactor}" />`);
              }
            }
          }
        }
        svgMiddle = elements.join('\n');
      }
    }

    const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
  <!-- Created with premium 3D Aesthetic Silk & Fluid Mesh Vector Engine -->
  <g id="transparent-aesthetic-container">\n`;
    const svgFooter = '\n  </g>\n</svg>';
    return svgHeader + svgMiddle + svgFooter;
  };

  // --- DOWNLOAD STATIC / ANIMATED VECTOR SVG ---
  const handleExportSVG = () => {
    try {
      showToast('Processing smooth-looping SVG animation coordinates...');
      const svgString = generateDynamicSVGString();
      const uniqueId = Date.now();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.download = `3d-silk-vector-${generatorMode}-${uniqueId}.svg`;
      anchor.href = url;
      anchor.click();
      showToast('Success: Animated Looping Vector SVG downloaded!');
    } catch (err) {
      console.error(err);
      showToast('Export failed. Check settings and retry.');
    }
  };

  // --- COPY ANIMATED SVG CODE DIRECTLY TO CLIPBOARD ---
  const handleCopySVGCodeDirect = () => {
    try {
      const svgString = generateDynamicSVGString();
      navigator.clipboard.writeText(svgString);
      setCopiedSvg(true);
      showToast('Success: Animated SVG vector code copied to clipboard!');
      setTimeout(() => setCopiedSvg(false), 3000);
    } catch (err) {
      console.error(err);
      showToast('Failed to copy. Try downloading the SVG file.');
    }
  };

  // --- COPY CORE HTML BACKDROP WIDGET DIRECTLY ---
  const handleCopyWidgetInlineCode = () => {
    try {
      const liveScript = getLiveInlineScript();
      navigator.clipboard.writeText(liveScript);
      setCopiedWidget(true);
      showToast('Success: HTML canvas backdrop widget copied!');
      setTimeout(() => setCopiedWidget(false), 3000);
    } catch (err) {
      console.error(err);
      showToast('Copy failed.');
    }
  };

  // --- CAPTURE HIGH-RES PNG OVERLAY ---
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `3d-silk-frame-${Date.now()}.png`;
    link.href = url;
    link.click();
    showToast('Success: High-res transparent PNG downloaded!');
  };

  // --- CAPTURE COMPRESSED VIDEO LOOP (WebM with alpha) ---
  const handleToggleRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      showToast(`Recording: Capturing ${videoDuration}s dynamic 3D Silk loop in ${videoQuality}p with ${Math.round(bBps / 1000000)}Mbps Bitrate...`);

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
        setRecordingStatus('finished');
        const superBuffer = new Blob(recordedBlobsRef.current, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(superBuffer);
        const link = document.createElement('a');
        link.download = `3d-alpha-loop-${videoQuality}p-${videoDuration}s-${Date.now()}.webm`;
        link.href = videoURL;
        link.click();
        
        setRecordingStatus('idle');
        showToast(`Success: Transparent high-fidelity ${videoQuality}p WebM loop downloaded!`);
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, videoDuration * 1000);

    } catch (err) {
      showToast('Capturing unsupported within frame sandbox.');
      console.warn(err);
    }
  };

  // --- STANDALONE WEBPAGE EMBED GENERATOR ---
  const handleCopyEmbedCode = () => {
    const embedCode = `<iframe 
  src="${window.location.origin}/" 
  style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; border: none; background: transparent; pointer-events: none; z-index: -1;" 
  allow="autoplay"
  title="3D Premium Interactive Fluid mesh underlay">
</iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopiableEmbed(true);
    showToast('Success: Responsive iframe code copied to clipboard!');
    setTimeout(() => setCopiableEmbed(false), 3000);
  };

  // --- STANDALONE INTERACTIVE HTML WEB COMPONENT DOWNLOADER ---
  const handleDownloadHTMLComponent = () => {
    const bColor = backgroundColor;
    const isTrans = isTransparentBg;
    let htmlContent = '';

    if (generatorMode === 'ribbon') {
      const ribbonsJSON = JSON.stringify(ribbons);
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Interactive Ribbon Silk Flow Backdrop</title>
  <style>
    html, body {
      margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent;
    }
    #transparent-3d-backdrop {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: block; background: transparent; pointer-events: auto; z-index: -1;
    }
  </style>
</head>
<body>
  <canvas id="transparent-3d-backdrop"></canvas>
  <script>
    const canvas = document.getElementById('transparent-3d-backdrop');
    const ctx = canvas.getContext('2d');
    
    const settings = {
      isTransparent: ${isTrans},
      bgColor: '${bColor}',
      numRibbons: ${numRibbons},
      ribbons: ${ribbonsJSON},
      thickness: ${thickness},
      waveIntensity: ${waveIntensity},
      lightIntensity: ${lightIntensity},
      twistRate: ${twistRate},
      shadingDetail: ${shadingDetail},
      wavePattern: '${wavePattern}',
      waveFrequency: ${waveFrequency},
      twistSpeed: ${twistSpeed},
      speed: ${speed},
      opacity: ${opacity},
      rotationAngle: ${rotationAngle},
      mouseMode: '${mouseMode}',
      mouseStrength: ${mouseStrength}
    };

    let time = 0;
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX / window.innerWidth;
      mouse.targetY = e.clientY / window.innerHeight;
    });

    const parseHexToRGB = (hex) => {
      let clean = hex.replace('#', '');
      if (clean.length === 3) clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
      const val = parseInt(clean, 16);
      return { r: (val >> 16) & 255, g: (val >> 8) & 255, b: val & 255 };
    };

    const loop = () => {
      requestAnimationFrame(loop);
      time += 0.016 * settings.speed;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const w = canvas.width;
      const h = canvas.height;

      if (settings.isTransparent) {
        ctx.clearRect(0, 0, w, h);
      } else {
        ctx.fillStyle = settings.bgColor;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((settings.rotationAngle * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);

      for (let rIdx = 0; rIdx < settings.numRibbons; rIdx++) {
        const ribbonSettings = settings.ribbons[rIdx % settings.ribbons.length] || settings.ribbons[0];
        ctx.save();
        ctx.globalAlpha = settings.opacity;
        
        const stripeCount = settings.shadingDetail;
        const stepsCount = 65;
        const pts = [];

        const mouseXActual = mouse.x * w;
        const mouseYActual = mouse.y * h;
        const pullRadius = 320;

        for (let s = 0; s <= stepsCount; s++) {
          const t = s / stepsCount;
          const x = -150 + t * (w + 300);
          const phaseOffset = rIdx * (Math.PI / 2.3) + ribbonSettings.twistPhase;

          let sineAccumulator = 0;
          const fx1 = 0.0035 * settings.waveFrequency;
          const fx2 = 0.0015 * settings.waveFrequency;

          if (settings.wavePattern === 'turbulent') {
            sineAccumulator = 
              Math.sin(time * 2.8 + x * fx1 * 2.2 + phaseOffset) * settings.waveIntensity * 0.8 +
              Math.cos(time * 1.8 + x * fx2 * 2.5 + rIdx * 1.7) * (settings.waveIntensity * 0.35);
          } else if (settings.wavePattern === 'spiral') {
            sineAccumulator = Math.sin(time * 1.5 - x * fx1 * 1.4 + phaseOffset * 1.5) * settings.waveIntensity;
          } else if (settings.wavePattern === 'sea_swell') {
            sineAccumulator = Math.sin(time * 0.7 + x * fx1 * 0.6 + phaseOffset) * settings.waveIntensity * 1.3;
          } else {
            sineAccumulator = 
              Math.sin(time * 1.5 + x * fx1 + phaseOffset) * settings.waveIntensity +
              Math.cos(time * 0.82 + x * fx2 + rIdx * 1.2) * (settings.waveIntensity * 0.4);
          }

          let y = h * 0.5 + sineAccumulator;

          if (settings.mouseMode !== 'none') {
            const dx = x - mouseXActual;
            const dy = y - mouseYActual;
            const dist = Math.hypot(dx, dy);
            if (dist < pullRadius) {
              const pullPower = Math.pow(1.0 - dist / pullRadius, 2);
              y += (mouseYActual - y) * pullPower * settings.mouseStrength;
            }
            y += (mouse.y - 0.5) * (h * 0.18);
          }

          const lookX = x + 1.0;
          let lookSine = 0;
          if (settings.wavePattern === 'turbulent') {
            lookSine = 
              Math.sin(time * 2.8 + lookX * fx1 * 2.2 + phaseOffset) * settings.waveIntensity * 0.8 +
              Math.cos(time * 1.8 + lookX * fx2 * 2.5 + rIdx * 1.7) * (settings.waveIntensity * 0.35);
          } else if (settings.wavePattern === 'spiral') {
            lookSine = Math.sin(time * 1.5 - lookX * fx1 * 1.4 + phaseOffset * 1.5) * settings.waveIntensity;
          } else if (settings.wavePattern === 'sea_swell') {
            lookSine = Math.sin(time * 0.7 + lookX * fx1 * 0.6 + phaseOffset) * settings.waveIntensity * 1.3;
          } else {
            lookSine = 
              Math.sin(time * 1.5 + lookX * fx1 + phaseOffset) * settings.waveIntensity +
              Math.cos(time * 0.82 + lookX * fx2 + rIdx * 1.2) * (settings.waveIntensity * 0.4);
          }
          let lookY = h * 0.5 + lookSine;

          if (settings.mouseMode !== 'none') {
            const dx = lookX - mouseXActual;
            const dy = lookY - mouseYActual;
            const dist = Math.hypot(dx, dy);
            if (dist < pullRadius) {
              const pullPower = Math.pow(1.0 - dist / pullRadius, 2);
              lookY += (mouseYActual - lookY) * pullPower * settings.mouseStrength;
            }
            lookY += (mouse.y - 0.5) * (h * 0.18);
          }

          const tanAngle = Math.atan2(lookY - y, 1.0);
          const normalX = -Math.sin(tanAngle);
          const normalY = Math.cos(tanAngle);
          const twistAngle = time * settings.twistSpeed + (x * 0.004 * settings.twistRate) + phaseOffset;

          pts.push({ x, y, normalX, normalY, twist: twistAngle });
        }

        for (let f = 0; f < stripeCount; f++) {
          const normFilament = (f / (stripeCount - 1)) - 0.5;
          ctx.beginPath();
          const dCenter = Math.abs(normFilament);

          for (let p = 0; p < pts.length; p++) {
            const pt = pts[p];
            const projection = Math.cos(pt.twist + normFilament * Math.PI);
            const curHalfWidth = (settings.thickness * 0.5) * projection;
            const extX = pt.x + pt.normalX * curHalfWidth;
            const extY = pt.y + pt.normalY * curHalfWidth;

            if (p === 0) ctx.moveTo(extX, extY);
            else ctx.lineTo(extX, extY);
          }

          const lightIncidence = Math.cos(normFilament * Math.PI * 1.2);
          const shadowFactor = 0.35 + 0.65 * (1.0 - dCenter * 1.8);
          const specular = Math.pow(Math.max(0, lightIncidence), 6.5) * settings.lightIntensity;

          const colS = parseHexToRGB(ribbonSettings.colorStart);
          const colE = parseHexToRGB(ribbonSettings.colorEnd);

          const rS = Math.min(255, Math.max(0, Math.round((colS.r + (colE.r - colS.r) * 0) * shadowFactor + specular * 240)));
          const gS = Math.min(255, Math.max(0, Math.round((colS.g + (colE.g - colS.g) * 0) * shadowFactor + specular * 240)));
          const bS = Math.min(255, Math.max(0, Math.round((colS.b + (colE.b - colS.b) * 0) * shadowFactor + specular * 240)));

          const rE = Math.min(255, Math.max(0, Math.round((colS.r + (colE.r - colS.r) * 1) * shadowFactor + specular * 240)));
          const gE = Math.min(255, Math.max(0, Math.round((colS.g + (colE.g - colS.g) * 1) * shadowFactor + specular * 240)));
          const bE = Math.min(255, Math.max(0, Math.round((colS.b + (colE.b - colS.b) * 1) * shadowFactor + specular * 240)));

          const cGrad = ctx.createLinearGradient(0, 0, w, 0);
          cGrad.addColorStop(0, "rgb(" + rS + "," + gS + "," + bS + ")");
          cGrad.addColorStop(1, "rgb(" + rE + "," + gE + "," + bE + ")");

          ctx.strokeStyle = cGrad;
          ctx.lineWidth = (settings.thickness / stripeCount) * 2.8;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.restore();
    };

    loop();
  </script>
</body>
</html>`;
    } else {
      const mediaSrcJSON = uploadedImageSrc ? `\`${uploadedImageSrc}\`` : 'null';
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Interactive Transparent mesh backdrop</title>
  <style>
    html, body {
      margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent;
    }
    #transparent-3d-backdrop {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: block; background: transparent; pointer-events: auto; z-index: -1;
    }
  </style>
</head>
<body>
  <canvas id="transparent-3d-backdrop"></canvas>
  <script>
    const canvas = document.getElementById('transparent-3d-backdrop');
    const ctx = canvas.getContext('2d');
    
    const settings = {
      isTransparent: ${isTrans},
      bgColor: '${bColor}',
      meshStyle: '${meshStyle}',
      gridDensity: ${gridDensity},
      extrusionDepth: ${extrusionDepth},
      particleSize: ${particleSize},
      meshWaveScale: ${meshWaveScale},
      colorProfile: '${colorProfile}',
      speed: ${speed},
      opacity: ${opacity},
      pitch: ${pitchAngle},
      yaw: ${rotationAngle},
      isometric: ${isometricMode},
      chromaticAberration: ${chromaticAberration},
      glitchIntensity: ${glitchIntensity},
      contrast: ${contrastBoost},
      threshold: ${brightnessThreshold},
      plexusDist: ${plexusMaxDistance},
      plexusMax: ${plexusMaxConnections},
      asciiPalette: '${asciiCharacterPalette}',
      decay: ${particleDecaySpeed},
      colorStart: '${chromaColorStart}',
      colorEnd: '${chromaColorEnd}',
      autoYawSpeed: ${autoYawSpeed},
      autoPitchSpeed: ${autoPitchSpeed}
    };

    let uploadedSrc = ${mediaSrcJSON};
    let time = 0;
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX / window.innerWidth;
      mouse.targetY = e.clientY / window.innerHeight;
    });

    const parseHexToRGB = (hex) => {
      let clean = hex.replace('#', '');
      if (clean.length === 3) clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
      const val = parseInt(clean, 16);
      return { r: (val >> 16) & 255, g: (val >> 8) & 255, b: val & 255 };
    };

    const getChromaColor = (u, b, cs, ce) => {
      const s = parseHexToRGB(cs); const e = parseHexToRGB(ce);
      const r = Math.round(s.r + (e.r - s.r)*u);
      const g = Math.round(s.g + (e.g - s.g)*u);
      const bC = Math.round(s.b + (e.b - s.b)*u);
      return "rgb(" + Math.round(r*(0.45+0.55*b)) + "," + Math.round(g*(0.45+0.55*b)) + "," + Math.round(bC*(0.45+0.55*b)) + ")";
    };

    const offscreen = document.createElement('canvas');
    offscreen.width = settings.gridDensity;
    offscreen.height = settings.gridDensity;
    const oCtx = offscreen.getContext('2d');

    const drawPreset = (oCtx, w, h, t) => {
      oCtx.fillStyle = '#010204';
      oCtx.fillRect(0,0,w,h);
      for(let i=0; i<3; i++) {
        const px = w/2 + Math.sin(t*1.5 + i*2)*w*0.3;
        const py = h/2 + Math.cos(t*1.2 + i*1.5)*h*0.3;
        const rad = w*(0.22 + 0.08*Math.sin(t+i));
        const grad = oCtx.createRadialGradient(px,py,0,px,py,rad);
        grad.addColorStop(0, i===0 ? 'rgba(255,0,128,0.9)' : 'rgba(0,240,255,0.9)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        oCtx.fillStyle = grad;
        oCtx.beginPath(); oCtx.arc(px,py,rad,0,Math.PI*2); oCtx.fill();
      }
    };

    const loop = () => {
      time += 0.016 * settings.speed;
      mouse.x += (mouse.targetX - mouse.x)*0.08;
      mouse.y += (mouse.targetY - mouse.y)*0.08;

      if (settings.isTransparent) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = settings.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (uploadedSrc) {
        const img = new Image(); img.src = uploadedSrc;
        if(img.complete) oCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
      } else {
        drawPreset(oCtx, offscreen.width, offscreen.height, time);
      }

      const imgData = oCtx.getImageData(0,0,offscreen.width,offscreen.height);
      const data = imgData.data;

      const nodes = [];
      const ry = (settings.yaw + time * 22 * settings.autoYawSpeed) * Math.PI / 180;
      const rx = (settings.pitch + time * 22 * settings.autoPitchSpeed) * Math.PI / 180;
      const cx = canvas.width/2; const cy = canvas.height/2;
      const sw = canvas.width*0.72; const sh = canvas.height*0.72;

      for (let y=0; y<settings.gridDensity; y++) {
        let gl = 0;
        if(settings.glitchIntensity > 0 && Math.sin(time*10 + y*0.5) > 0.88) {
          gl = Math.sin(time*40)*settings.glitchIntensity;
        }
        for (let x=0; x<settings.gridDensity; x++) {
          const u = x/(settings.gridDensity-1); const v = y/(settings.gridDensity-1);
          const idx = (y*offscreen.width + x)*4;
          let r = data[idx]||0; let g = data[idx+1]||0; let b = data[idx+2]||0;
          let br = (0.3*r + 0.59*g + 0.11*b)/255;
          if(br < settings.threshold) { br=0; r=0; g=0; b=0; }
          else br = (br - settings.threshold)/(1 - settings.threshold);

          let decY = 0;
          if (settings.meshStyle === 'disintegrated_voxels') {
            const age = (time*settings.decay*0.25 + u*40 + v*90)%5;
            decY = -age*50*(0.3 + br*0.7);
          }

          const x3d = (u-0.5)*sw; const y3d = (v-0.5)*sh + decY;
          const wave = Math.sin(time*3 + (u+v)*12)*settings.meshWaveScale;
          const z3d = br*settings.extrusionDepth + wave;

          const xr = x3d*Math.cos(ry) - z3d*Math.sin(ry);
          const zr = x3d*Math.sin(ry) + z3d*Math.cos(ry);
          const yr = y3d*Math.cos(rx) - zr*Math.sin(rx);
          const zr2 = y3d*Math.sin(rx) + zr*Math.cos(rx);

          const p = settings.isometric ? 0.95 : 750/(750+zr2);
          nodes.push({ u, v, x2d: cx + xr*p + gl, y2d: cy + yr*p, r, g, b, brightness: br, size: settings.particleSize*(0.35 + 1.2*br)*p });
        }
      }

      // Draw technique points/plexus
      ctx.globalAlpha = settings.opacity;
      if (settings.meshStyle === 'points' || settings.meshStyle === 'stipple' || settings.meshStyle === 'disintegrated_voxels') {
        nodes.forEach(n => {
          if(n.brightness < 0.05) return;
          const c = settings.colorProfile === 'media' ? "rgb("+n.r+","+n.g+","+n.b+")" : getChromaColor(n.u, n.brightness, settings.colorStart, settings.colorEnd);
          const rad = settings.meshStyle==='stipple' ? n.size*n.brightness*1.5 : n.size;
          
          if (settings.chromaticAberration > 0) {
            ctx.fillStyle = 'rgba(255, 10, 80, 0.4)';
            ctx.beginPath(); ctx.arc(n.x2d-settings.chromaticAberration, n.y2d, rad, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.beginPath(); ctx.arc(n.x2d+settings.chromaticAberration, n.y2d, rad, 0, Math.PI*2); ctx.fill();
          }
          ctx.fillStyle = c;
          ctx.beginPath(); ctx.arc(n.x2d, n.y2d, rad, 0, Math.PI*2); ctx.fill();
        });
      } else {
        // Plexus network drawer
        for(let i=0; i<nodes.length; i++) {
          const nA = nodes[i]; if(nA.brightness < 0.08) continue;
          let cnt = 0;
          for(let j=i+1; j<Math.min(nodes.length, i+80); j++) {
            if(cnt >= settings.plexusMax) break;
            const nB = nodes[j]; if(nB.brightness < 0.08) continue;
            const dst = Math.hypot(nA.x2d - nB.x2d, nA.y2d - nB.y2d);
            if(dst < settings.plexusDist) {
              cnt++;
              ctx.strokeStyle = "rgba(0, 248, 255, " + (1.0 - dst/settings.plexusDist)*0.4 + ")";
              ctx.beginPath(); ctx.moveTo(nA.x2d, nA.y2d); ctx.lineTo(nB.x2d, nB.y2d); ctx.stroke();
            }
          }
          ctx.fillStyle = "rgb(0, 248, 255)";
          ctx.beginPath(); ctx.arc(nA.x2d, nA.y2d, nA.size*0.6, 0, Math.PI*2); ctx.fill();
        }
      }

      requestAnimationFrame(loop);
    };
    loop();
  </script>
</body>
</html>`;
    }

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = generatorMode === 'ribbon' ? `3d-standalone-silk-flow-backdrop.html` : `3d-standalone-website-backdrop.html`;
    anchor.href = url;
    anchor.click();
    showToast('Success: Standalone HTML visual backdrop downloaded!');
  };

  return (
    <div className="flex-grow w-full flex flex-col lg:flex-row min-h-0 bg-[#04060a] text-zinc-100 rounded-xl lg:overflow-hidden border border-white/5 shadow-3xl">
      
      {/* Toast Alert Feedback */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-[#080d19] border border-violet-500/40 text-violet-300 text-[10px] font-mono tracking-widest uppercase px-4 py-2.5 rounded shadow-2xl flex items-center gap-2 animate-pulse rounded-full">
          <Sparkles size={11} className="animate-spin text-fuchsia-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Perspective Viewport */}
      <div className="w-full h-[52vh] lg:h-full lg:flex-1 flex flex-col relative min-w-0 bg-[#020305] shrink-0 lg:shrink">
        
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className="flex-grow w-full relative overflow-hidden flex items-center justify-center bg-transparent select-none min-h-[350px] lg:min-h-0 shrink-0 lg:shrink"
          style={{ cursor: mouseMode === 'drag' ? 'grab' : 'crosshair' }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-[2] pointer-events-auto" />

          {/* Frost Backdrop overlay filter for Ribbon (Silk Flow) */}
          {generatorMode === 'ribbon' && bgBlur > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                backdropFilter: `blur(${bgBlur}px)`,
                WebkitBackdropFilter: `blur(${bgBlur}px)`,
              }}
            />
          )}

          {/* Smooth Backdrop overlay filter for Media Mesh */}
          {generatorMode === 'mediamesh' && meshBlur > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                backdropFilter: `blur(${meshBlur}px)`,
                WebkitBackdropFilter: `blur(${meshBlur}px)`,
              }}
            />
          )}

          {/* Vignette Contrast Overlay */}
          {!isTransparentBg && (
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(2,3,5,0.78)_100%)] z-[2]" />
          )}

          {/* Tech Metrics Label */}
          <div className="absolute bottom-4 left-4 pointer-events-none bg-black/60 border border-white/5 backdrop-blur px-2.5 py-1 rounded text-[8px] font-mono text-zinc-500 uppercase tracking-widest z-[3]">
            {generatorMode === 'ribbon' ? '3D Twisted Filament Studio' : `3D Scanned Mesh • ${gridDensity}x${gridDensity}`}
          </div>
        </div>
      </div>

      {/* Control Sidebar Panel */}
      <div className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l border-white/5 bg-[#06080d] flex flex-col lg:h-full shrink-0 shadow-2xl overflow-y-auto">
        
        {/* Rendering Mode selectors */}
        <div className="p-4 border-b border-white/5 bg-[#080b12] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold font-mono tracking-widest uppercase text-violet-400">Rendering Mode</span>
            <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-violet-500/10 text-violet-300 border border-violet-500/20">
              Interactive 3D
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setGeneratorMode('mediamesh'); showToast('Loaded creative mesh engine.'); }}
              className={`py-2 text-center text-[10px] font-mono font-bold uppercase tracking-wider rounded border cursor-pointer transition-all active:scale-95 ${
                generatorMode === 'mediamesh'
                  ? 'bg-linear-to-r from-violet-600/20 to-fuchsia-600/20 border-violet-500 text-violet-200 shadow-lg shadow-violet-500/5'
                  : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Media Mesh
            </button>
            <button
              onClick={() => { setGeneratorMode('ribbon'); showToast('Loaded dynamic ribbons engine.'); }}
              className={`py-2 text-center text-[10px] font-mono font-bold uppercase tracking-wider rounded border cursor-pointer transition-all active:scale-95 ${
                generatorMode === 'ribbon'
                  ? 'bg-linear-to-r from-violet-600/20 to-fuchsia-600/20 border-violet-500 text-violet-200 shadow-lg shadow-violet-500/5'
                  : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Silk Flow
            </button>
          </div>
        </div>

        {/* Backdrop Transparent Toggle Option */}
        <div className="p-4 border-b border-white/5 bg-zinc-950/40 flex items-center justify-between font-mono text-[10px]">
          <span className="text-zinc-400 font-extrabold tracking-wider uppercase flex items-center gap-1.5">
            <Eye size={12} className="text-pink-400 animate-pulse" /> Transparent Canvas backdrop
          </span>
          <button
            onClick={() => {
              setIsTransparentBg(!isTransparentBg);
              showToast(isTransparentBg ? 'Background solid state enabled.' : 'Transparent backing initialized. Perfect for Web iframe overlays!');
            }}
            className={`px-3 py-1 rounded text-[8.5px] font-bold border transition-all cursor-pointer uppercase active:scale-95 ${
              isTransparentBg
                ? 'bg-pink-500/10 border-pink-500/30 text-pink-300'
                : 'bg-zinc-900 border-zinc-850 text-zinc-500'
            }`}
          >
            {isTransparentBg ? 'Transparent ON' : 'Solid OFF'}
          </button>
        </div>

        {/* Tab Selection Headers */}
        <div className="grid grid-cols-3 border-b border-white/5 text-[9px] font-mono uppercase bg-[#080b12]">
          <button
            onClick={() => setActiveTab('design')}
            className={`py-3 text-center font-bold tracking-wider cursor-pointer border-b-2 transition-all ${
              activeTab === 'design' 
                ? 'text-pink-400 border-pink-500 bg-pink-500/5' 
                : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            Design
          </button>
          <button
            onClick={() => setActiveTab('animation')}
            className={`py-3 text-center font-bold tracking-wider cursor-pointer border-b-2 transition-all ${
              activeTab === 'animation' 
                ? 'text-violet-400 border-violet-500 bg-violet-500/5' 
                : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            Forces
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 text-center font-bold tracking-wider cursor-pointer border-b-2 transition-all ${
              activeTab === 'export' 
                ? 'text-cyan-400 border-cyan-500 bg-cyan-500/5' 
                : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            Export
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-4">
          
          {/* TAB 1: STYLING & PARAMETER CONTROLS */}
          {activeTab === 'design' && (
            <div className="flex flex-col gap-4">
              
              {/* Premium 3D Theme Presets Selector */}
              <div className="flex flex-col gap-2.5 p-3 rounded-lg border border-violet-950/40 bg-zinc-950/70">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold tracking-wider font-mono text-violet-400 uppercase leading-none flex items-center gap-1">
                    <Sparkles size={11} className="text-pink-400 animate-pulse" /> {generatorMode === 'mediamesh' ? 'Live Premium Mesh Presets (31)' : 'Live Premium Silk Flow Presets (31)'}
                  </span>
                  <span className="text-[7.5px] font-mono text-zinc-550 uppercase">Interactive</span>
                </div>
                <span className="text-[8.5px] text-zinc-400 leading-tight">
                  {generatorMode === 'mediamesh' 
                    ? 'Click to apply responsive 3D media mesh presets. Customize fully afterward using design dials below!' 
                    : 'Click to load premium 3D Silk Flow ribbon presets. Slide any control below to tweak twist, velocity or color!'}
                </span>

                {/* Filter and Search controls */}
                <div className="flex flex-col gap-1.5 mt-1">
                  {/* Search Input field */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={generatorMode === 'mediamesh' ? "Search mesh presets..." : "Search silk flow presets..."}
                      value={presetSearch}
                      onChange={(e) => setPresetSearch(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] bg-zinc-900 border border-zinc-800 rounded placeholder-zinc-650 text-zinc-300 focus:outline-none focus:border-violet-500/40 font-mono"
                    />
                    {presetSearch && (
                      <button
                        type="button"
                        onClick={() => setPresetSearch('')}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-[8px] uppercase font-bold font-mono"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Save Custom Preset Form */}
                  <div className="flex gap-1.5 mt-1">
                    <input
                      type="text"
                      placeholder="Name custom design..."
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      className="flex-1 px-2 py-1 text-[9px] bg-zinc-900 border border-zinc-800 rounded placeholder-zinc-600 text-zinc-300 focus:outline-none focus:border-violet-500/40 font-mono"
                    />
                    <button
                      type="button"
                      onClick={saveCurrentAsCustomPreset}
                      className="px-2 py-1 bg-violet-650 hover:bg-violet-500 active:scale-95 text-white text-[8px] font-bold uppercase rounded font-mono transition-transform cursor-pointer"
                    >
                      SAVE DESIGN
                    </button>
                  </div>
                </div>

                {/* Live Presets Scrollable Grid */}
                <div className="max-h-[220px] overflow-y-auto pr-1 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {(() => {
                    const meshThemes = [
                      { id: 'plexus_core', label: 'Prismatic Plexus', mode: 'Plexus', model: 'mediamesh', colors: ['#00f0ff', '#ff007f'], desc: 'Responsive grid of multi-colored connected nodes' },
                      { id: 'quantum_stardust', label: 'Quantum Stardust', mode: 'Stipple', model: 'mediamesh', colors: ['#ff00b7', '#3300ff'], desc: 'High-density stippled quantum scale cloud' },
                      { id: 'digital_vapor', label: 'Vapor Wave Matrix', mode: 'Ascii', model: 'mediamesh', colors: ['#00ffcc', '#ff00ff'], desc: 'Nostalgic glowing code character terminal map' },
                      { id: 'golden_satin', label: 'Golden Contour Satin', mode: 'Contour', model: 'mediamesh', colors: ['#ffe066', '#cc9900'], desc: 'Rich topographic altitude vector fields' },
                      { id: 'ethereal_aurora', label: 'Ethereal Aurora', mode: 'Plexus', model: 'mediamesh', colors: ['#00f0ff', '#ff00aa'], desc: 'Floating cosmic light emission constellations' },
                      { id: 'holographic_pastels', label: 'Holograph Wireframe', mode: 'Wireframe', model: 'mediamesh', colors: ['#fa8bff', '#2bd2ff'], desc: 'Subtle high-pass neon wireframe web structures' },
                      { id: 'cyber_grid', label: 'Cyberpunk Grid Storm', mode: 'Stipple', model: 'mediamesh', colors: ['#39ff14', '#ff007f'], desc: 'Toxic neon green and hot pink cyber glitch mesh' },
                      { id: 'matrix_hack', label: 'Core Matrix Cascades', mode: 'Ascii', model: 'mediamesh', colors: ['#00ff00', '#003300'], desc: 'Matrix-terminal green binary rain grid layout' },
                      { id: 'kintsugi_gold', label: 'Kintsugi Cracked Earth', mode: 'Wireframe', model: 'mediamesh', colors: ['#d4af37', '#111111'], desc: 'Elegant broken pottery structure bound with gold lines' },
                      { id: 'amethyst_res', label: 'Amethyst Crystal Rings', mode: 'Contour', model: 'mediamesh', colors: ['#9333ea', '#ec4899'], desc: 'Dense purple concentric energy contour bands' },
                      { id: 'mint_frost', label: 'Arctic Glacier Plexus', mode: 'Plexus', model: 'mediamesh', colors: ['#2dd4bf', '#0284c7'], desc: 'Mint and cyan plexus network mimicking frost shards' },
                      { id: 'supernova_burst', label: 'Celestial Supernova', mode: 'Plexus', model: 'mediamesh', colors: ['#e879f9', '#38bdf8'], desc: 'Hyper-dynamic exploding stellar particles network' },
                      { id: 'lava_lamp', label: 'Volcanic Magma Spheres', mode: 'Stipple', model: 'mediamesh', colors: ['#ea580c', '#f43f5e'], desc: 'Thick, viscous stippled lava globules with warm hues' },
                      { id: 'opal_aurora', label: 'Pearlescent Opal Halo', mode: 'Plexus', model: 'mediamesh', colors: ['#ffedd5', '#a5f3fc'], desc: 'Subtle pearlescent iridescent pastel elements mapping' },
                      { id: 'neon_monolith', label: 'Brutalist Monolith', mode: 'Wireframe', model: 'mediamesh', colors: ['#facc15', '#27272a'], desc: 'Yellow and stone architectural lattice elements' },
                      { id: 'toxic_fallout', label: 'Radioactive Waste Map', mode: 'Ascii', model: 'mediamesh', colors: ['#a3e635', '#166534'], desc: 'Highly luminous toxic hazard symbol matrix grid' },
                      { id: 'star_velocity', label: 'Stellar Hyperdrive', mode: 'Stipple', model: 'mediamesh', colors: ['#ffffff', '#1d4ed8'], desc: 'Warp speed starlight particulate travel field' },
                      { id: 'liquid_chrome', label: 'Molten Liquid Mercury', mode: 'Contour', model: 'mediamesh', colors: ['#f1f5f9', '#334155'], desc: 'Mirror-metallic topological liquid metal landscape' },
                      { id: 'iridescent_bubble', label: 'Prismatic Soap Bubble', mode: 'Mesh', model: 'mediamesh', colors: ['#f472b6', '#38bdf8'], desc: 'Rainbow glass bubble shell with reflective layers' },
                      { id: 'digital_glitch_core', label: 'Glitch Lattice Core', mode: 'Mesh', model: 'mediamesh', colors: ['#a855f7', '#4ade80'], desc: 'Shattered electronic scanlines and data buffers' },
                      { id: 'hyper_grid_orange', label: 'Orange Cyber Grid', mode: 'Wireframe', model: 'mediamesh', colors: ['#ff5500', '#1a0033'], desc: 'Beautiful glowing copper sunset blueprint' },
                      { id: 'plasma_leak', label: 'Plasma Radiation Leak', mode: 'Stipple', model: 'mediamesh', colors: ['#d9f99d', '#059669'], desc: 'Highly atomic luminous toxic fields' },
                      { id: 'glacial_mesh', label: 'Glacial Crystal Mesh', mode: 'Mesh', model: 'mediamesh', colors: ['#e0f2fe', '#0284c7'], desc: 'Cold geometric glass fragments' },
                      { id: 'binary_waterfall', label: 'Binary Code Cascade', mode: 'Ascii', model: 'mediamesh', colors: ['#00f0ff', '#003333'], desc: 'Cybernetic intelligence falling' },
                      { id: 'nebula_plexus', label: 'Orion Nebula Nexus', mode: 'Plexus', model: 'mediamesh', colors: ['#f472b6', '#818cf8'], desc: 'Connected starlights in a dust cloud' },
                      { id: 'magma_wire', label: 'Tectonic Magma Fissure', mode: 'Wireframe', model: 'mediamesh', colors: ['#f97316', '#7f1d1d'], desc: 'Cracked basalt glowing with heat' },
                      { id: 'copper_sheet', label: 'Oxidized Amber Foil', mode: 'Contour', model: 'mediamesh', colors: ['#b45309', '#0f766e'], desc: 'Rich metallic copper and patina' },
                      { id: 'hologram_scan', label: 'Holographic LIDAR Scan', mode: 'Stipple', model: 'mediamesh', colors: ['#fa8bff', '#2bd2ff'], desc: 'Rainbow chromatic point cloud representation' },
                      { id: 'sublime_slime', label: 'Sublime Acid Ripple', mode: 'Mesh', model: 'mediamesh', colors: ['#bef264', '#0369a1'], desc: 'Semi-glitched fluid voxel displacement' },
                      { id: 'ghostly_apparition', label: 'Ectoplasmic Vapor Map', mode: 'Mesh', model: 'mediamesh', colors: ['#ccfbf1', '#5b21b6'], desc: 'Spectral, slow-morphing veil' },
                      { id: 'digital_monochrome', label: 'Brutalist Obsidian Matrix', mode: 'Stipple', model: 'mediamesh', colors: ['#ffffff', '#000000'], desc: 'High contrast black-and-white grain structure' }
                    ];

                    const ribbonThemes = [
                      { id: 'cosmic_neon_ribbon', label: 'Cosmic Neon Flow', mode: 'Ribbon', model: 'ribbon', colors: ['#ff007f', '#7a00ff'], desc: 'Vibrant neon ribbon fibers gliding through hyperspace' },
                      { id: 'pastel_glass_ribbon', label: 'Glass Frost Waves', mode: 'Ribbon', model: 'ribbon', colors: ['#ffd3e8', '#c1c9ff'], desc: 'Soft pastel ice filaments with high refraction' },
                      { id: 'sunset_satin_ribbon', label: 'Sunset Satin Glide', mode: 'Ribbon', model: 'ribbon', colors: ['#ff0a7c', '#ffbe3b'], desc: 'Earthy luxury warmth following sunset satin drapes' },
                      { id: 'acid_emerald_ribbon', label: 'Acid Emerald Coil', mode: 'Ribbon', model: 'ribbon', colors: ['#00ff66', '#0033cc'], desc: 'Hyper-vibrant coiled spring ribbon filaments' },
                      { id: 'obsidian_flow', label: 'Midnight Velvet Flow', mode: 'Ribbon', model: 'ribbon', colors: ['#111111', '#4f46e5'], desc: 'Luxurious ultra-dark slow-flowing velvet ribbons' },
                      { id: 'solar_flare', label: 'Burning Solar Flare', mode: 'Ribbon', model: 'ribbon', colors: ['#ff4500', '#ffcc00'], desc: 'Intense boiling streams of high temperature solar winds' },
                      { id: 'electric_jelly', label: 'Bio-Electric Jellyfish', mode: 'Ribbon', model: 'ribbon', colors: ['#00f2fe', '#09f783'], desc: 'Deep ocean glowing jelly strands weaving in waves' },
                      { id: 'cherry_blossom', label: 'Sakura Petal Whisper', mode: 'Ribbon', model: 'ribbon', colors: ['#fbcfe8', '#f472b6'], desc: 'Gentle, floating baby pink sakura silk streams' },
                      { id: 'royal_velvet', label: 'Royal Plum Satin', mode: 'Ribbon', model: 'ribbon', colors: ['#701a75', '#b45309'], desc: 'Deep cosmic plum satin and orange fire ribbons' },
                      { id: 'abyssal_trench', label: 'Abyssal Bioluminescent', mode: 'Ribbon', model: 'ribbon', colors: ['#1e3a8a', '#10b981'], desc: 'Silent deep-sea neon aquatic glowing filaments' },
                      { id: 'dusty_rose', label: 'Vintage Crimson Damask', mode: 'Ribbon', model: 'ribbon', colors: ['#fda4af', '#aa1f46'], desc: 'Earthy vintage rose and retro magenta silk ribbon drapes' },
                      { id: 'celestial_silk', label: 'Celestial Silk Constellations', mode: 'Ribbon', model: 'ribbon', colors: ['#38bdf8', '#22d3ee'], desc: 'Perfect cosmic starlight weave' },
                      { id: 'phoenix_ashes', label: 'Phoenix Obsidian Fire', mode: 'Ribbon', model: 'ribbon', colors: ['#f97316', '#ef4444'], desc: 'Volcanic ash ribbon glowing with embers' },
                      { id: 'northern_dance', label: 'Aurora Borealis Ribbon', mode: 'Ribbon', model: 'ribbon', colors: ['#10b981', '#34d399'], desc: 'Floating green aurora curtains' },
                      { id: 'ocean_depths', label: 'Deep Pacific Silk', mode: 'Ribbon', model: 'ribbon', colors: ['#1d4ed8', '#014f86'], desc: 'Luxurious oceanic navy streams' },
                      { id: 'golden_hour', label: 'Golden Hour Satin', mode: 'Ribbon', model: 'ribbon', colors: ['#fbbf24', '#f59e0b'], desc: 'Pure warm sunset ambient drapes' },
                      { id: 'cyber_pulse', label: 'Tokyo Cyber Grid Pulse', mode: 'Ribbon', model: 'ribbon', colors: ['#ff007f', '#39ff14'], desc: 'Neon radioactive filaments' },
                      { id: 'bubblegum_dream', label: 'Bubblegum Pastel Stream', mode: 'Ribbon', model: 'ribbon', colors: ['#f472b6', '#c084fc'], desc: 'Vibrant retro toy pinks and purples' },
                      { id: 'lavender_mist', label: 'Ethereal Lavender Sleep', mode: 'Ribbon', model: 'ribbon', colors: ['#c084fc', '#e9d5ff'], desc: 'Soft, relaxing purple haze streams' },
                      { id: 'magma_core', label: 'Viscous Lava Stream', mode: 'Ribbon', model: 'ribbon', colors: ['#ea580c', '#ff003c'], desc: 'Heavy, burning magma tendrils' },
                      { id: 'sand_dune', label: 'Sahara Silk Ripple', mode: 'Ribbon', model: 'ribbon', colors: ['#f59e0b', '#fbbf24'], desc: 'Smooth desert sand dunes in the wind' },
                      { id: 'ice_cavern', label: 'Glacial Fjord Stream', mode: 'Ribbon', model: 'ribbon', colors: ['#06b6d4', '#67e8f9'], desc: 'Sharp, pure, cold crystalline ice streams' },
                      { id: 'monotech', label: 'Sleek Minimal Slate', mode: 'Ribbon', model: 'ribbon', colors: ['#ffffff', '#cbd5e1'], desc: 'Modern high-contrast monochrome design' },
                      { id: 'autumn_canopy', label: 'October Autumn Woods', mode: 'Ribbon', model: 'ribbon', colors: ['#b45309', '#f97316'], desc: 'Rich rust, gold, and crimson foliage' },
                      { id: 'toxic_sludge', label: 'Nuclear Acid Stream', mode: 'Ribbon', model: 'ribbon', colors: ['#a3e635', '#84cc16'], desc: 'Luminous toxic green hazard flows' },
                      { id: 'unicorn_tear', label: 'Iridescent Unicorn Veil', mode: 'Ribbon', model: 'ribbon', colors: ['#f472b6', '#ffe4e6'], desc: 'Super-bright pearlescent streams' },
                      { id: 'crimson_tide', label: 'Royal Vampire Velvet', mode: 'Ribbon', model: 'ribbon', colors: ['#9f1239', '#f43f5e'], desc: 'Moody, deep crimson and dark shadow silk' },
                      { id: 'electric_violet', label: 'Electric Arc Discharge', mode: 'Ribbon', model: 'ribbon', colors: ['#8b5cf6', '#7c3aed'], desc: 'Violet static lightning filaments' },
                      { id: 'emerald_forest', label: 'Amazonian Canopy Silk', mode: 'Ribbon', model: 'ribbon', colors: ['#059669', '#10b981'], desc: 'Lush deep forest emerald luxury streams' },
                      { id: 'champagne_gold', label: 'VIP Champagne Pearl', mode: 'Ribbon', model: 'ribbon', colors: ['#fef08a', '#fef9c3'], desc: 'Deluxe champagne gold drapes' },
                      { id: 'space_dust', label: 'Cosmic Starlight Stream', mode: 'Ribbon', model: 'ribbon', colors: ['#ec4899', '#a855f7'], desc: 'Dynamic nebula dust tail' }
                    ];

                    const currentThemes = generatorMode === 'mediamesh' ? meshThemes : ribbonThemes;

                    // Merge Custom Presets
                    const mergedThemes = [
                      ...customPresets.filter(cp => {
                        const isMesh = cp.category.includes('Mesh');
                        return generatorMode === 'mediamesh' ? isMesh : !isMesh;
                      }).map(cp => ({
                        id: cp.id,
                        label: cp.name,
                        mode: 'Custom',
                        model: generatorMode,
                        colors: [cp.config.chromaColorStart || '#f472b6', cp.config.chromaColorEnd || '#c084fc'],
                        desc: cp.description,
                        isCustom: true
                      })),
                      ...currentThemes
                    ];

                    const filtered = mergedThemes.filter((theme) => {
                      if (presetSearch) {
                        const qToken = presetSearch.toLowerCase();
                        return (
                          theme.label.toLowerCase().includes(qToken) ||
                          theme.mode.toLowerCase().includes(qToken) ||
                          theme.desc.toLowerCase().includes(qToken)
                        );
                      }
                      return true;
                    });

                    // Sort Favorites and Custom Presets to the absolute top of the scrollable frame
                    const sorted = [...filtered].sort((a, b) => {
                      const aFav = favoriteIds.includes(a.id) ? 1 : 0;
                      const bFav = favoriteIds.includes(b.id) ? 1 : 0;
                      if (aFav !== bFav) return bFav - aFav;
                      const aCust = a.isCustom ? 1 : 0;
                      const bCust = b.isCustom ? 1 : 0;
                      return bCust - aCust;
                    });

                    if (sorted.length === 0) {
                      return (
                        <div className="text-center py-6 text-[9px] text-zinc-650 font-mono">
                          No presets match your search.
                        </div>
                      );
                    }

                    return sorted.map((theme) => {
                      const isFav = favoriteIds.includes(theme.id);
                      return (
                        <div
                          key={theme.id}
                          className="w-full text-left p-1.5 rounded transition-all border flex items-center justify-between gap-2 bg-zinc-950/40 border-transparent hover:bg-zinc-900/60 hover:border-zinc-850 group select-none"
                        >
                          <button
                            type="button"
                            onClick={() => applyThemePreset(theme.id)}
                            className="flex-1 flex items-center gap-2 overflow-hidden text-left cursor-pointer"
                          >
                            {/* Color preview circle containing gradient */}
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10 shadow-sm transition-all group-hover:scale-110"
                              style={{ background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})` }}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-zinc-200 text-[9px] group-hover:text-white leading-none truncate flex items-center gap-1">
                                {theme.label}
                                {theme.isCustom && <span className="text-[6px] bg-indigo-500/15 text-indigo-300 px-1 rounded border border-indigo-500/25">Custom</span>}
                                {isFav && <span className="text-[7.5px] text-yellow-400 font-mono">★</span>}
                              </span>
                              <span className="text-[7.5px] text-zinc-500 mt-0.5 truncate leading-none">{theme.desc}</span>
                            </div>
                          </button>

                          {/* Badges and action triggers */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoritePreset(theme.id);
                              }}
                              className={`p-1 rounded transition-colors cursor-pointer ${isFav ? 'text-yellow-400 hover:text-yellow-350' : 'text-zinc-650 hover:text-zinc-400'}`}
                              title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                            >
                              <Star size={9} fill={isFav ? "currentColor" : "none"} />
                            </button>

                            {theme.isCustom && (
                              <button
                                type="button"
                                onClick={(e) => deleteCustomPreset(theme.id, e)}
                                className="p-1 rounded text-rose-500 hover:text-rose-400 cursor-pointer"
                                title="Delete Custom Preset"
                              >
                                <Trash size={9} />
                              </button>
                            )}

                            <span className="text-[6px] font-mono px-1 py-0.5 bg-zinc-800 rounded text-zinc-400 capitalize">
                              {theme.model === 'ribbon' ? 'Silk Flow' : 'Mesh'}
                            </span>
                            <span className="text-[6px] font-bold font-mono px-1 py-0.5 bg-violet-950/40 rounded text-violet-300 uppercase">
                              {theme.mode}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
              
              {/* Mesh source controllers */}
              {generatorMode === 'mediamesh' && (
                <div className="flex flex-col gap-3 p-3 rounded-lg border border-zinc-900 bg-zinc-950/70">
                  <span className="text-[9px] font-extrabold tracking-wider font-mono text-zinc-500 uppercase leading-none block">
                    Choose Input Asset
                  </span>

                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[8px] tracking-wide">
                    <button
                      onClick={() => { setMediaType('preset'); showToast('Loaded procedural dynamic presets!'); }}
                      className={`py-1.5 rounded active:scale-95 text-center transition-all cursor-pointer border uppercase font-bold ${
                        mediaType === 'preset' ? 'bg-pink-500/10 border-pink-500/40 text-pink-300' : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                      }`}
                    >
                      Presets
                    </button>
                    <label className={`py-1.5 rounded text-center transition-all cursor-pointer border flex items-center justify-center gap-1 font-bold uppercase active:scale-95 ${
                      mediaType === 'image' ? 'bg-pink-500/10 border-pink-500/40 text-pink-300' : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                    }`}>
                      <ImageIcon size={10} /> Image
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <label className={`py-1.5 rounded text-center transition-all cursor-pointer border flex items-center justify-center gap-1 font-bold uppercase active:scale-95 ${
                      mediaType === 'video' ? 'bg-pink-500/10 border-pink-500/40 text-pink-300' : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                    }`}>
                      <Tv size={10} /> Video
                      <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Drag and Drop layout */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border border-dashed border-zinc-800 rounded px-2 py-3 text-center text-[9px] text-zinc-500 flex flex-col items-center justify-center gap-1 hover:border-violet-500/35 transition-all text-center leading-tight cursor-pointer"
                  >
                    <Upload size={12} className="text-zinc-600 animate-bounce" />
                    <span>Drag and drop image or video file here</span>
                    <span className="text-[7.5px] text-zinc-600">JPEG, PNG, MP4, WebM supported</span>
                  </div>

                  {/* Procedural pre-loaded assets selection */}
                  {mediaType === 'preset' && (
                    <div className="flex flex-col gap-1 mt-1 font-mono text-[9px]">
                      <span className="text-zinc-600 uppercase font-black text-[8px] tracking-wider mb-1 block">Aesthetic Synthesis:</span>
                      <div className="grid grid-cols-4 gap-1">
                        {['NeoWave', 'Portal', 'SilkLine', 'Cosmos'].map((name, idx2) => (
                          <button
                            key={idx2}
                            onClick={() => { setPresetIndex(idx2); showToast(`Synthesizing procedural pattern: ${name}`); }}
                            className={`py-1 text-center rounded border text-[7.5px] font-bold cursor-pointer transition-all uppercase ${
                              presetIndex === idx2 ? 'border-pink-500/40 text-white bg-pink-500/10' : 'border-zinc-850 bg-zinc-900 text-zinc-500'
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Geometry Styles selectors from user photos */}
              {generatorMode === 'mediamesh' && (
                <div className="flex flex-col gap-2.5 p-3 rounded-lg border border-violet-950/40 bg-zinc-950/70">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold tracking-wider font-mono text-violet-400 uppercase leading-none flex items-center gap-1">
                      <Sparkles size={11} className="text-pink-400 animate-pulse" /> 3D Mesh Geometry Filters (24)
                    </span>
                    <span className="text-[7.5px] font-mono text-zinc-550 uppercase">Direct Scroll</span>
                  </div>
                  <span className="text-[8.5px] text-zinc-400 leading-tight">
                    Select a curated mathematical filter to transform the 3D grid shape representation instantly.
                  </span>
                  
                  {/* Direct scrollable list of 24 filters */}
                  <div className="max-h-[220px] overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-zinc-850 scrollbar-track-transparent">
                    {geometryFilters.map((gStyle) => {
                      const isSelected = meshStyle === gStyle.style && activeGeometryFilter === gStyle.id;
                      return (
                        <button
                          key={gStyle.id}
                          type="button"
                          onClick={() => selectGeometryFilter(gStyle)}
                          className={`w-full text-left p-1.5 rounded transition-all border flex flex-col gap-0.5 cursor-pointer active:scale-[0.99] select-none ${
                            isSelected 
                              ? 'bg-violet-950/20 border-violet-500/50 text-violet-200' 
                              : 'bg-zinc-900 border-zinc-850 hover:bg-zinc-850 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[8.5px] font-black tracking-wide font-mono uppercase flex items-center gap-1">
                              <span className={isSelected ? 'text-violet-400' : 'text-zinc-600'}>✦</span> {gStyle.label}
                            </span>
                            <span className="text-[6.5px] font-bold font-mono px-1 py-0.5 bg-zinc-950/65 rounded text-zinc-500 uppercase tracking-widest scale-90">
                              {gStyle.style === 'topological_contour' ? 'CONTOUR' : gStyle.style === 'disintegrated_voxels' ? 'SAND DECAY' : gStyle.style.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[7.5px] text-zinc-500 leading-tight block">
                            {gStyle.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Parametric slider lists */}
              <div className="flex flex-col gap-3 font-mono text-[10px]">
                <span className="text-[9px] font-extrabold tracking-wider text-zinc-500 uppercase leading-none block">
                  3D Extrusion & Weights
                </span>

                {/* Grid resolution density */}
                {generatorMode === 'mediamesh' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Grid Scanning Desired Density</span>
                      <span className="text-pink-400 font-bold">{gridDensity}x{gridDensity}</span>
                    </div>
                    <input
                      type="range" min={20} max={85} step={5} value={gridDensity}
                      onChange={(e) => setGridDensity(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                )}

                {/* Z structural extrusion depth */}
                {generatorMode === 'mediamesh' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Extrusion Z Height Depth</span>
                      <span className="text-pink-400 font-bold">{extrusionDepth}px</span>
                    </div>
                    <input
                      type="range" min={10} max={250} value={extrusionDepth}
                      onChange={(e) => setExtrusionDepth(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                )}

                {/* Particle diameter weight sizes */}
                {generatorMode === 'mediamesh' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Element Stroke Size / Thickness</span>
                      <span className="text-pink-400 font-bold">{particleSize}px</span>
                    </div>
                    <input
                      type="range" min={0.5} max={10} step={0.5} value={particleSize}
                      onChange={(e) => setParticleSize(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                )}

                {/* Media Mesh Blur Control */}
                {generatorMode === 'mediamesh' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Media Mesh Blur Intensity</span>
                      <span className="text-pink-400 font-bold">{meshBlur}px</span>
                    </div>
                    <input
                      type="range" min={0} max={60} step={1} value={meshBlur}
                      onChange={(e) => setMeshBlur(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                )}

                {/* Chromatic split Aberration Pixels */}
                {generatorMode === 'mediamesh' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Prismatic Chromatic Dispersion</span>
                      <span className="text-pink-400 font-bold">{chromaticAberration}px shift</span>
                    </div>
                    <input
                      type="range" min={0} max={20} step={1} value={chromaticAberration}
                      onChange={(e) => setChromaticAberration(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                )}

                {/* Preprocessing high-contrast filter */}
                {generatorMode === 'mediamesh' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Pre-Contrast Boost</span>
                      <span className="text-pink-400 font-bold">{contrastBoost.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range" min={0.5} max={2.2} step={0.1} value={contrastBoost}
                      onChange={(e) => setContrastBoost(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                )}

                {/* Background high-pass threshold eraser */}
                {generatorMode === 'mediamesh' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>High-Pass Threshold Eraser</span>
                      <span className="text-pink-400 font-bold">{Math.round(brightnessThreshold*100)}% filters</span>
                    </div>
                    <input
                      type="range" min={0.00} max={0.60} step={0.02} value={brightnessThreshold}
                      onChange={(e) => setBrightnessThreshold(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                )}

                {/* SILK RIBBONS MODE PARAMETERS */}
                {generatorMode === 'ribbon' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-zinc-200">
                        <span>Ribbon Track Count</span>
                        <span className="text-pink-400 font-bold">{numRibbons} layers</span>
                      </div>
                      <input
                        type="range" min={1} max={6} value={numRibbons}
                        onChange={(e) => setNumRibbons(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-zinc-200">
                        <span>Base Ribbon Thickness</span>
                        <span className="text-pink-400 font-bold">{thickness}px</span>
                      </div>
                      <input
                        type="range" min={30} max={220} value={thickness}
                        onChange={(e) => setThickness(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-zinc-200">
                        <span>Wave Amplitude Height</span>
                        <span className="text-pink-400 font-bold">{waveIntensity}px</span>
                      </div>
                      <input
                        type="range" min={10} max={180} value={waveIntensity}
                        onChange={(e) => setWaveIntensity(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-zinc-200">
                        <span>Background Glow Blur</span>
                        <span className="text-pink-400 font-bold">{bgBlur}px</span>
                      </div>
                      <input
                        type="range" min={0} max={80} step={1} value={bgBlur}
                        onChange={(e) => setBgBlur(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>
                  </div>
                )}

                {/* Individual Ribbon Designer Customizer */}
                {generatorMode === 'ribbon' && (
                  <div className="flex flex-col gap-3 p-3 bg-zinc-950 border border-white/5 rounded">
                    <span className="text-zinc-500 font-extrabold uppercase text-[8px] tracking-wider mb-1 block">
                      Individual Ribbon Customizer
                    </span>
                    <div className="flex flex-col gap-2">
                      <span className="text-[8px] text-zinc-400 font-mono">Select Track to Edit</span>
                      <div className="flex flex-wrap gap-1">
                        {Array.from({ length: numRibbons }).map((_, i) => {
                          const id = i + 1;
                          return (
                            <button
                              key={id}
                              onClick={() => setSelectedRibbonId(id)}
                              className={`px-3 py-1 text-[9px] font-mono rounded font-bold uppercase transition-all border cursor-pointer ${
                                selectedRibbonId === id 
                                  ? 'bg-pink-500/15 border-pink-500 text-pink-300' 
                                  : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                              }`}
                            >
                              Track {id}
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Ribbon Properties Form */}
                      {(() => {
                        const activeRibbon = ribbons.find(r => r.id === selectedRibbonId) || ribbons[0];
                        if (!activeRibbon) return null;
                        return (
                          <div className="flex flex-col gap-2.5 mt-2 pt-2.5 border-t border-zinc-900">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1">
                                <span className="text-[8px] text-zinc-400 font-mono">Start Color</span>
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="color" 
                                    value={activeRibbon.colorStart} 
                                    onChange={(e) => {
                                      const nextColor = e.target.value;
                                      setRibbons(prev => prev.map(r => r.id === selectedRibbonId ? { ...r, colorStart: nextColor } : r));
                                    }}
                                    className="w-7 h-7 rounded border-none bg-transparent cursor-pointer p-0"
                                  />
                                  <input 
                                    type="text" 
                                    value={activeRibbon.colorStart} 
                                    onChange={(e) => {
                                      const nextColor = e.target.value;
                                      setRibbons(prev => prev.map(r => r.id === selectedRibbonId ? { ...r, colorStart: nextColor } : r));
                                    }}
                                    className="bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono rounded px-1.5 py-0.5 w-16"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[8px] text-zinc-400 font-mono">End Color</span>
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="color" 
                                    value={activeRibbon.colorEnd} 
                                    onChange={(e) => {
                                      const nextColor = e.target.value;
                                      setRibbons(prev => prev.map(r => r.id === selectedRibbonId ? { ...r, colorEnd: nextColor } : r));
                                    }}
                                    className="w-7 h-7 rounded border-none bg-transparent cursor-pointer p-0"
                                  />
                                  <input 
                                    type="text" 
                                    value={activeRibbon.colorEnd} 
                                    onChange={(e) => {
                                      const nextColor = e.target.value;
                                      setRibbons(prev => prev.map(r => r.id === selectedRibbonId ? { ...r, colorEnd: nextColor } : r));
                                    }}
                                    className="bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono rounded px-1.5 py-0.5 w-16"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between text-[8px] text-zinc-400 uppercase">
                                <span>twist rotation phase</span>
                                <span className="font-mono font-black text-pink-400">{activeRibbon.twistPhase.toFixed(2)} rad</span>
                              </div>
                              <input 
                                type="range" 
                                min={-3.14} 
                                max={3.14} 
                                step={0.05} 
                                value={activeRibbon.twistPhase}
                                onChange={(e) => {
                                  const nextPhase = Number(e.target.value);
                                  setRibbons(prev => prev.map(r => r.id === selectedRibbonId ? { ...r, twistPhase: nextPhase } : r));
                                }}
                                className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Color Schemes Switcher */}
                {generatorMode === 'mediamesh' && (
                  <div className="flex flex-col gap-1.5 p-2 bg-zinc-950 border border-white/5 rounded">
                    <span className="text-zinc-500 font-bold uppercase text-[8.5px]">Color Mapping Scheme</span>
                    <div className="grid grid-cols-3 gap-1">
                      {['media', 'chroma', 'neon'].map((profile) => (
                        <button
                          key={profile}
                          onClick={() => { setColorProfile(profile as any); showToast(`Gradient mapping set to: ${profile}`); }}
                          className={`py-1 text-center rounded text-[8px] uppercase font-bold border transition-all cursor-pointer ${
                            colorProfile === profile ? 'bg-violet-500/10 border-violet-500/40 text-violet-300' : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                          }`}
                        >
                          {profile}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Chroma Gradient Color Pickers */}
                {generatorMode === 'mediamesh' && colorProfile === 'chroma' && (
                  <div className="flex flex-col gap-2 p-3 bg-zinc-950 border border-white/5 rounded">
                    <span className="text-zinc-500 font-extrabold uppercase text-[8px] tracking-wider leading-none block mb-1">
                      Custom Gradient Boundaries (Chroma Mode)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-zinc-400">Gradient Start (U=0)</span>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="color" 
                            value={chromaColorStart} 
                            onChange={(e) => setChromaColorStart(e.target.value)}
                            className="w-7 h-7 rounded border-none bg-transparent cursor-pointer p-0"
                          />
                          <input 
                            type="text" 
                            value={chromaColorStart} 
                            onChange={(e) => setChromaColorStart(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono rounded px-1 w-16 py-0.5"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-zinc-400">Gradient End (U=1)</span>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="color" 
                            value={chromaColorEnd} 
                            onChange={(e) => setChromaColorEnd(e.target.value)}
                            className="w-7 h-7 rounded border-none bg-transparent cursor-pointer p-0"
                          />
                          <input 
                            type="text" 
                            value={chromaColorEnd} 
                            onChange={(e) => setChromaColorEnd(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono rounded px-1 w-16 py-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 2: ROTATIONS & INTERACTIVE PHYSICS FORCES */}
          {activeTab === 'animation' && (
            <div className="flex flex-col gap-4 font-mono text-[10px]">
              
              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded border border-white/5">
                <span className="text-zinc-400 font-bold uppercase">Dynamic Wave Float</span>
                <button
                  onClick={() => { setAnimate(!animate); showToast(animate ? 'Wave cycles suspended.' : 'Flow cycle active!'); }}
                  className={`px-3 py-1 text-[8.5px] font-mono font-bold flex items-center gap-1.5 uppercase transition-all active:scale-95 cursor-pointer rounded border ${
                    animate 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                  }`}
                >
                  {animate ? <Play size={10} className="text-emerald-400 animate-pulse" /> : <Pause size={10} className="text-amber-400" />}
                  {animate ? 'Running' : 'Frozen'}
                </button>
              </div>

              {/* THREE-DIMENSIONAL SPHERICAL ROTATION AXES */}
              <div className="flex flex-col gap-3 p-3 bg-zinc-950 rounded border border-white/5">
                <span className="text-[9px] text-zinc-500 font-extrabold uppercase leading-none block mb-1">
                  Spherical Camera Rotation (Yaw / Pitch)
                </span>

                {/* X Rotation Pitch Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Vertical Pitch Angle</span>
                    <span className="text-pink-400 font-bold">{pitchAngle}°</span>
                  </div>
                  <input
                    type="range" min={0} max={360} value={pitchAngle}
                    onChange={(e) => setPitchAngle(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                {/* Y Rotation Yaw Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Horizontal Yaw Angle</span>
                    <span className="text-pink-400 font-bold">{rotationAngle}°</span>
                  </div>
                  <input
                    type="range" min={0} max={360} value={rotationAngle}
                    onChange={(e) => setRotationAngle(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                {/* Perspective vs Architectural Isometric camera projection toggle */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[9px] font-mono">
                  <span className="text-zinc-400 font-bold">ORTHOGRAPHIC ISOMETRIC</span>
                  <button
                    onClick={() => { setIsometricMode(!isometricMode); showToast(!isometricMode ? 'Isometric orthoprojection activated.' : 'Adaptive perspective model restored.'); }}
                    className={`px-3 py-1 rounded text-[8px] font-bold border cursor-pointer uppercase transition-all ${
                      isometricMode ? 'bg-violet-500/10 border-violet-500/30 text-violet-300' : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                    }`}
                  >
                    {isometricMode ? 'ISOMETRIC ON' : 'PERSPECTIVE OFF'}
                  </button>
                </div>
              </div>

              {/* AUTOMATIC CAMERA YAW & PITCH DRIFT VELOCITIES */}
              <div className="flex flex-col gap-3 p-3 bg-zinc-950 rounded border border-white/5">
                <span className="text-[9px] text-zinc-500 font-extrabold uppercase leading-none block mb-1">
                  Automatic Camera Drift (Yaw / Pitch Auto-Spin)
                </span>

                {/* Auto Yaw velocity */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Yaw Rotation Speed (Horizontal Y-Axis)</span>
                    <span className="text-pink-400 font-mono text-[9px] font-bold">{(autoYawSpeed * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range" min={0.0} max={0.4} step={0.01} value={autoYawSpeed}
                    onChange={(e) => setAutoYawSpeed(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                {/* Auto Pitch velocity */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Pitch Oscillation Speed (Vertical X-Axis)</span>
                    <span className="text-pink-400 font-mono text-[9px] font-bold">{(autoPitchSpeed * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range" min={0.0} max={0.15} step={0.005} value={autoPitchSpeed}
                    onChange={(e) => setAutoPitchSpeed(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </div>

              {/* Wave flow velocity speed */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between font-bold text-zinc-300">
                  <span>Wave Cycle Velocity</span>
                  <span className="text-pink-400">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range" min={0.05} max={2.00} step={0.05} value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                />
              </div>

              {/* Slider specifics for premium geometry settings */}
              {meshStyle === 'plexus' && (
                <div className="flex flex-col gap-3 p-3 rounded-lg border border-zinc-900 bg-zinc-950/70">
                  <span className="text-[9.5px] font-extrabold text-violet-400 uppercase leading-none block">
                    Plexus Matrix Parameters
                  </span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Max Nexus Linking Distance</span>
                      <span className="text-pink-400 font-bold">{plexusMaxDistance}px</span>
                    </div>
                    <input
                      type="range" min={15} max={85} value={plexusMaxDistance}
                      onChange={(e) => setPlexusMaxDistance(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                </div>
              )}

              {meshStyle === 'disintegrated_voxels' && (
                <div className="flex flex-col gap-3 p-3 rounded-lg border border-zinc-900 bg-zinc-950/70">
                  <span className="text-[9.5px] font-extrabold text-violet-400 uppercase leading-none block">
                    Dissolution Parameters
                  </span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Ascending Dissolving Speed</span>
                      <span className="text-pink-400 font-bold">{particleDecaySpeed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range" min={0.0} max={6.0} step={0.5} value={particleDecaySpeed}
                      onChange={(e) => setParticleDecaySpeed(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                </div>
              )}

              {meshStyle === 'ascii' && (
                <div className="flex flex-col gap-2.5 p-3 rounded-lg border border-zinc-900 bg-zinc-950/70">
                  <span className="text-[9px] font-extrabold text-violet-400 uppercase leading-none block">
                    ASCII Typography Character Set
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[8px]">
                    {[
                      { id: 'matrix', label: 'FALLING MATRIX' },
                      { id: 'binary', label: 'BINARY 0 / 1' },
                      { id: 'typographic', label: 'TEXT SHADING' },
                      { id: 'symbols', label: 'SYMBOLS BRACE' }
                    ].map((set) => (
                      <button
                        key={set.id}
                        onClick={() => { setAsciiCharacterPalette(set.id as any); showToast(`Character map set: ${set.label}`); }}
                        className={`py-1 text-center rounded border transition-all cursor-pointer uppercase ${
                          asciiCharacterPalette === set.id ? 'border-pink-500 text-pink-300 bg-pink-500/5 font-bold' : 'border-zinc-850 bg-zinc-900 text-zinc-500'
                        }`}
                      >
                        {set.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CURSOR PHYSICS SELECTORS */}
              <div className="flex flex-col gap-2 p-3 rounded bg-zinc-950 border border-white/5 leading-none">
                <span className="text-[9px] text-zinc-500 font-extrabold uppercase">Cursor Magnet Warp Mode</span>
                <div className="grid grid-cols-3 gap-1.5 text-[8.5px] uppercase">
                  {['hover', 'drag', 'none'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { setMouseMode(mode as any); showToast(`Physical cursor mode: ${mode}`); }}
                      className={`py-1.5 rounded text-center transition-all cursor-pointer border font-bold uppercase ${
                        mouseMode === mode
                          ? 'bg-pink-500/15 border-pink-500 text-pink-300 shadow-lg shadow-pink-500/10'
                          : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: WEBSITES DEPLOYMENT CODING EXPORTS */}
          {activeTab === 'export' && (
            <div className="flex flex-col gap-4 font-mono text-[10px]">
              <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase leading-none block">
                Copy Vector Assets
              </span>

              {/* Copy loop-animated SVG Code directly */}
              <button
                onClick={handleCopySVGCodeDirect}
                className="w-full py-2.5 px-3 bg-[#0d0f14] hover:bg-zinc-900 border border-pink-500/20 hover:border-pink-500/40 text-pink-300 rounded text-[9px] font-extrabold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md shadow-pink-500/5"
              >
                {copiedSvg ? <Check size={11} className="text-emerald-400 animate-bounce" /> : <Copy size={11} className="text-pink-400" />}
                {copiedSvg ? 'SVG Code Copied!' : 'Copy Animated SVG Code'}
              </button>

              {/* Single Frame PNG download */}
              <button
                onClick={handleDownloadPNG}
                className="w-full py-2.5 px-3 bg-[#0c0e14] hover:bg-zinc-900 border border-white/5 text-zinc-200 rounded text-[9px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <ImageIcon size={11} className="text-pink-400" />
                Capture Canvas Snapshot (.PNG)
              </button>

              {/* Dynamic HD Video Quality & Duration Selectors */}
              <div className="grid grid-cols-2 gap-2 my-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">WebM Quality</span>
                  <select
                    value={videoQuality}
                    onChange={(e) => setVideoQuality(e.target.value as any)}
                    className="w-full bg-[#0d0f14] border border-pink-500/10 rounded py-1 px-2 text-[9px] text-zinc-300 font-mono focus:outline-none focus:border-pink-500/50 cursor-pointer"
                  >
                    <option value="720">720p (HD)</option>
                    <option value="1080">1080p (FHD)</option>
                    <option value="1440">1440p (2K)</option>
                    <option value="2160">2160p (4K)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Duration</span>
                  <select
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                    className="w-full bg-[#0d0f14] border border-pink-500/10 rounded py-1 px-2 text-[9px] text-zinc-300 font-mono focus:outline-none focus:border-pink-500/50 cursor-pointer"
                  >
                    <option value="3">3s</option>
                    <option value="10">10s</option>
                    <option value="20">20s (Default)</option>
                    <option value="30">30s</option>
                    <option value="60">1m</option>
                    <option value="120">2m</option>
                    <option value="180">3m</option>
                    <option value="240">4m</option>
                    <option value="300">5m</option>
                  </select>
                </div>
              </div>

              {/* Transparent WebM recording */}
              <button
                onClick={handleToggleRecording}
                className={`w-full py-2.5 px-3 border text-[9px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer rounded active:scale-95 ${
                  recordingStatus === 'recording'
                    ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                    : 'bg-[#120722] border-pink-500/20 text-pink-300 hover:border-pink-500/40'
                }`}
              >
                <Video size={11} />
                {recordingStatus === 'recording' ? 'Capturing Video Loop...' : 'Download webm video (.WEBM)'}
              </button>
              
              {/* 5-Second Loop Recorder Trigger */}
              <button 
                onClick={handleRecord5Sec} 
                className="w-full py-2.5 px-3 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 rounded text-[9px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-2"
              >
                <Film size={11} />
                {recordCountdown !== null ? `RECORDING LOOP... ${recordCountdown}s` : '5-SECOND QUICK LOOP RECORDER'}
              </button>

              <div className="border-t border-white/5 my-1" />
              <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase leading-none block">
                Premium Live Webs Integration
              </span>

              {/* Copy Standalone HTML Backdrop Widget directly */}
              <button
                onClick={handleCopyWidgetInlineCode}
                className="w-full py-2.5 px-3 bg-[#0b0c10] hover:bg-zinc-900 border border-violet-500/20 hover:border-violet-500/40 text-violet-300 rounded text-[9px] font-extrabold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md shadow-violet-500/5"
              >
                {copiedWidget ? <Check size={11} className="text-emerald-400 animate-bounce" /> : <Copy size={11} className="text-violet-400" />}
                {copiedWidget ? 'Widget Code Copied!' : 'Copy Live HTML Widget'}
              </button>

              <div className="p-3 bg-zinc-950/80 rounded border border-white/5 mt-0.5 leading-relaxed text-[8px] text-zinc-400 font-sans">
                <span className="text-[8.5px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  platform support & instructions
                </span>
                <p>
                  These components carry native alpha transparent values. Paste or upload these directly to your platform (Webflow, Wix, WordPress, Shopify) in custom code blocks to have your custom 3D mesh layers and silk ribbons flow beautifully behind your main text content!
                </p>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* --- PREMIUM WEB CODE EMBED HUB OVERLAY MODAL --- */}
      {showCodeHub && (
        <div className="fixed inset-0 min-h-screen w-screen bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-2xl flex flex-col text-zinc-300 animate-in fade-in zoom-in-95 duration-200 text-left font-sans">
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/50">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <Sparkles size={16} className="text-violet-400" /> Instant Web Background Code Hub
                </h3>
                <p className="text-[10px] text-zinc-500">Copy premium 3D alpha transparent background widgets directly into your website</p>
              </div>
              <button 
                onClick={() => setShowCodeHub(false)}
                className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all text-xs cursor-pointer font-bold font-mono"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-900 bg-zinc-950/25 px-5 select-none text-xs font-medium font-mono text-[11px]">
              <button
                onClick={() => { setCodeHubTab('embed'); setCopiedKey(null); }}
                className={`py-3.5 px-4 border-b-2 transition-all cursor-pointer ${
                  codeHubTab === 'embed' 
                    ? 'text-violet-400 border-violet-500 bg-violet-500/5 font-extrabold' 
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                HTML Code Widget
              </button>
              <button
                onClick={() => { setCodeHubTab('script'); setCopiedKey(null); }}
                className={`py-3.5 px-4 border-b-2 transition-all cursor-pointer ${
                  codeHubTab === 'script' 
                    ? 'text-pink-400 border-pink-500 bg-pink-500/5 font-extrabold' 
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                IFrame Embed (Zero-Lag)
              </button>
              <button
                onClick={() => { setCodeHubTab('guide'); setCopiedKey(null); }}
                className={`py-3.5 px-4 border-b-2 transition-all cursor-pointer ${
                  codeHubTab === 'guide' 
                    ? 'text-cyan-400 border-cyan-500 bg-cyan-500/5 font-extrabold' 
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Platform Guide
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4 text-xs font-sans">
              
              {codeHubTab === 'embed' && (
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 font-mono">
                      Adaptive Inline Backdrop Script
                    </span>
                    <button
                      onClick={() => {
                        const code = getLiveInlineScript();
                        navigator.clipboard.writeText(code);
                        setCopiedKey('embed');
                        showToast('HTML Code Widget copied!');
                        setTimeout(() => setCopiedKey(null), 3500);
                      }}
                      className="px-3 py-1 bg-violet-500 hover:bg-violet-600 font-mono text-[9px] uppercase font-bold text-white rounded transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'embed' ? <Check size={11} className="text-emerald-300 animate-bounce" /> : <Copy size={11} />}
                      {copiedKey === 'embed' ? 'Copied' : 'Copy Widget Code'}
                    </button>
                  </div>
                  <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans">
                    This self-contained Canvas engine renders in perfect alpha transparent layouts and responds in real-time to cursor movements. Paste this inside any Custom Embed code block on your page!
                  </p>
                  <textarea
                    readOnly
                    value={getLiveInlineScript()}
                    className="w-full h-44 bg-zinc-900 border border-zinc-850 p-3 rounded font-mono text-[9px] text-zinc-300 select-all overflow-y-auto outline-none focus:border-violet-500/35"
                  />
                  <div className="flex gap-2 p-3 bg-zinc-900/50 border border-zinc-850 rounded">
                    <div className="h-2 w-2 rounded-full bg-violet-500 mt-1 animate-ping" />
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      <strong>Design System Pro-Tip:</strong> To place this strictly in the background beneath your text headers, ensure the enclosing containers on your platform (e.g. Webflow, Squarespace section helper) are set to <code className="font-mono text-zinc-400">background: transparent</code>!
                    </p>
                  </div>
                </div>
              )}

              {codeHubTab === 'script' && (
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 font-mono">
                      Underlay Sandbox Iframe
                    </span>
                    <button
                      onClick={() => {
                        const code = `<iframe src="${window.location.origin}/" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; border: none; background: transparent; pointer-events: none; z-index: -1;" allow="autoplay" title="3D Premium Interactive Fluid Backdrop"></iframe>`;
                        navigator.clipboard.writeText(code);
                        setCopiedKey('script');
                        showToast('Iframe embed copied!');
                        setTimeout(() => setCopiedKey(null), 3500);
                      }}
                      className="px-3 py-1 bg-pink-500 hover:bg-pink-600 font-mono text-[9px] uppercase font-bold text-white rounded transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'script' ? <Check size={11} className="text-emerald-300 animate-bounce" /> : <Copy size={11} />}
                      {copiedKey === 'script' ? 'Copied' : 'Copy Iframe Code'}
                    </button>
                  </div>
                  <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                    Loads the current active configuration from AI studio inside an optimized sandbox container. Includes pointer-events bypass for non-blocking page scrolling.
                  </p>
                  <textarea
                    readOnly
                    value={`<iframe src="${window.location.origin}/" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; border: none; background: transparent; pointer-events: none; z-index: -1;" allow="autoplay" title="3D Premium Interactive Fluid Backdrop"></iframe>`}
                    className="w-full h-24 bg-zinc-900 border border-zinc-850 p-3 rounded font-mono text-[9.5px] text-zinc-400 select-all outline-none"
                  />
                </div>
              )}

              {codeHubTab === 'guide' && (
                <div className="flex flex-col gap-3.5 max-h-72 overflow-y-auto pr-1">
                  <span className="text-[10.5px] font-bold text-zinc-200">How to integrate into other platforms step-by-step:</span>
                  
                  <div className="flex flex-col gap-2.5">
                    <div className="p-3 bg-zinc-900/40 rounded border border-zinc-850">
                      <span className="text-[10px] uppercase font-bold text-violet-400 font-mono block mb-1">Webflow CMS Integration</span>
                      <ol className="list-decimal list-inside text-[10px] text-zinc-400 space-y-1">
                        <li>Drag a <strong className="text-zinc-300">"Custom Embed"</strong> component onto your wrapper layer.</li>
                        <li>Paste your copied <strong className="text-zinc-300">HTML Code Widget</strong> script into the box.</li>
                        <li>Set the embed element size to Width: <code className="font-mono">100%</code>, Height: <code className="font-mono">100%</code>.</li>
                        <li>Ensure the Embed has Position set to <strong className="text-zinc-300">Absolute / Fixed (Z-index: -1)</strong>.</li>
                      </ol>
                    </div>

                    <div className="p-3 bg-zinc-900/40 rounded border border-zinc-850">
                      <span className="text-[10px] uppercase font-bold text-pink-400 font-mono block mb-1">Squarespace & Wix Injection</span>
                      <ul className="list-disc list-inside text-[10px] text-zinc-400 space-y-1">
                        <li>Hover over your section background divider and select <strong className="text-zinc-300">"Add block" → "Code / Embed"</strong>.</li>
                        <li>Double click and paste your self-contained widget.</li>
                        <li>Toggle the <strong className="text-zinc-300">"Transparent background"</strong> option to enable absolute overlay!</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-zinc-900/40 rounded border border-zinc-850">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono block mb-1">WordPress Elementor & Gutenberg</span>
                      <ul className="list-disc list-inside text-[10px] text-zinc-400 space-y-1">
                        <li>Insert an <strong className="text-zinc-300">HTML block</strong> immediately at the top of your section.</li>
                        <li>Inject the widget code. It hooks directly to your body viewport automatically.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950/70 text-right">
              <button 
                onClick={() => setShowCodeHub(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 rounded border border-zinc-800 hover:border-zinc-700 text-[10.5px] text-white transition-all cursor-pointer font-bold uppercase active:scale-95"
              >
                Dismiss Code Hub
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
