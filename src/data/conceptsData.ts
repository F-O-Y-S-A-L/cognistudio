/**
 * 50 High-Fidelity Custom Co-Pilot Design Concepts
 * Offline-friendly, extremely high-performance presets
 */

import { SourceMode } from '../types';

export interface ConceptDesign {
  name: string;
  prompt: string;
  settings: {
    sourceMode?: SourceMode;
    shapeKey?: string;
    distance?: number;
    lighting?: any;
    background?: any;
    shapeModifiers?: any;
    material?: {
      surface?: 'solid' | 'glass' | 'wireframe';
      color?: string;
      roughness?: number;
      metalness?: number;
      thickness?: number;
      refraction?: number;
      environmentPower?: number;
    };
    halftone?: {
      enabled?: boolean;
      shape?: 'dots' | 'squares' | 'lines' | 'crosshatch' | 'none';
      scale?: number;
      power?: number;
      toneTarget?: 'light' | 'dark';
      width?: number;
      imageContrast?: number;
      dashColor?: string;
      hoverColorEnabled?: boolean;
      hoverDashColor?: string;
      gridAngle?: number;
      useImageColors?: boolean;
      waveAmplitude?: number;
      waveFrequency?: number;
      shadowToneIntensity?: number;
      shadowToneBlur?: number;
    };
    animation?: {
      autoRotateEnabled?: boolean;
      breatheEnabled?: boolean;
      cameraParallaxEnabled?: boolean;
      followHoverEnabled?: boolean;
      followDragEnabled?: boolean;
      floatEnabled?: boolean;
      hoverHalftoneEnabled?: boolean;
      hoverLightEnabled?: boolean;
      dragFlowEnabled?: boolean;
      lightSweepEnabled?: boolean;
      rotateEnabled?: boolean;
      autoSpeed?: number;
      autoWobble?: number;
      breatheAmount?: number;
      breatheSpeed?: number;
      cameraParallaxAmount?: number;
      cameraParallaxEase?: number;
      driftAmount?: number;
      hoverRange?: number;
      hoverEase?: number;
      hoverReturn?: boolean;
      dragSens?: number;
      dragFriction?: number;
      dragMomentum?: boolean;
      rotateAxis?: 'x' | 'y' | 'z';
      rotatePreset?: 'axis' | 'free';
      rotateSpeed?: number;
      rotatePingPong?: boolean;
      floatAmplitude?: number;
      floatSpeed?: number;
      lightSweepHeightRange?: number;
      lightSweepRange?: number;
      lightSweepSpeed?: number;
      springDamping?: number;
      springReturnEnabled?: boolean;
      springStrength?: number;
      waveEnabled?: boolean;
      waveSpeed?: number;
      waveAmount?: number;
      hoverHalftonePowerShift?: number;
      hoverHalftoneRadius?: number;
      hoverHalftoneWidthShift?: number;
      hoverLightIntensity?: number;
      hoverLightRadius?: number;
      dragFlowDecay?: number;
      dragFlowRadius?: number;
    };
    gradient?: {
      enabled?: boolean;
      stops?: { offset: number; color: string }[];
      type?: 'linear' | 'radial';
      angle?: number;
      animate?: boolean;
      speed?: number;
      noise?: number;
      blur?: number;
      interactive?: boolean;
      waveComplexity?: number;
      styleKey?: 'blobs' | 'stripes' | 'plasma' | 'fluid';
      tilt?: number;
      overlayType?: 'none' | 'scanlines' | 'grid' | 'vignette';
      rippleStrength?: number;
      blendMode?: 'screen' | 'overlay' | 'multiply' | 'soft-light';
      movementPattern?: 'flow' | 'shift' | 'pulse' | 'drift';
      colorBoost?: number;
      shimmerSpeed?: number;
      tiltJitter?: boolean;
      vibrationLevel?: number;
      bgBlur?: number;
    };
  };
}

export const CONCEPTS_LIBRARY: ConceptDesign[] = [
  {
    name: "Solar Flare",
    prompt: "A blazing golden core inside high-contrast copper lines of a torus knot.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torusKnot',
      distance: 5.6,
      material: { color: '#ffd700', surface: 'solid', roughness: 0.1, metalness: 0.95 },
      halftone: { enabled: true, shape: 'lines', scale: 28, power: 0.05, width: 0.5, dashColor: '#ff4c00', gridAngle: 30 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 60,
        speed: 0.35,
        styleKey: 'blobs',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#ff2a00' },
          { offset: 0.5, color: '#ffaa00' },
          { offset: 1.0, color: '#ffea00' }
        ]
      }
    }
  },
  {
    name: "Cyber Grid",
    prompt: "Vivid digital matrix of high-contrast cyber green lines running across a futuristic sphere.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'sphere',
      distance: 6.2,
      material: { color: '#00ff66', surface: 'wireframe', roughness: 0.4, metalness: 0.8 },
      halftone: { enabled: true, shape: 'squares', scale: 22, power: -0.15, width: 0.45, dashColor: '#003311', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 135,
        speed: 0.15,
        styleKey: 'stripes',
        blendMode: 'overlay',
        stops: [
          { offset: 0.0, color: '#030712' },
          { offset: 0.5, color: '#0f172a' },
          { offset: 1.0, color: '#020617' }
        ]
      }
    }
  },
  {
    name: "Sunset Synth",
    prompt: "Synthwave aesthetic with dense pink and purple crosshatch on a floating torus.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torus',
      distance: 6.0,
      material: { color: '#ff007f', surface: 'glass', roughness: 0.2, metalness: 0.5 },
      halftone: { enabled: true, shape: 'crosshatch', scale: 25, power: 0.12, width: 0.38, dashColor: '#4f1a8e', gridAngle: 15 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 90,
        speed: 0.28,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#ff007f' },
          { offset: 0.5, color: '#7a00ff' },
          { offset: 1.0, color: '#00e5ff' }
        ]
      }
    }
  },
  {
    name: "Ice Palace",
    prompt: "A frozen geometry in frosted glass blue and pristine white matrix.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'icosahedron',
      distance: 5.5,
      material: { color: '#99f6e4', surface: 'glass', roughness: 0.01, metalness: 0.1, thickness: 180, refraction: 2.4 },
      halftone: { enabled: true, shape: 'dots', scale: 32, power: -0.05, width: 0.52, dashColor: '#0c4a6e', gridAngle: 60 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 45,
        speed: 0.1,
        styleKey: 'fluid',
        blendMode: 'soft-light',
        stops: [
          { offset: 0.0, color: '#f0f9ff' },
          { offset: 0.5, color: '#e0f2fe' },
          { offset: 1.0, color: '#bae6fd' }
        ]
      }
    }
  },
  {
    name: "Obsidian Edge",
    prompt: "Deep metallic carbon structures shaded with sharp silver dots.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'cylinder',
      distance: 6.5,
      material: { color: '#18181b', surface: 'solid', roughness: 0.6, metalness: 0.99 },
      halftone: { enabled: true, shape: 'dots', scale: 18, power: 0.2, width: 0.3, dashColor: '#fafafa', gridAngle: 90 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 0,
        speed: 0.05,
        styleKey: 'stripes',
        blendMode: 'multiply',
        stops: [
          { offset: 0.0, color: '#09090b' },
          { offset: 1.0, color: '#27272a' }
        ]
      }
    }
  },
  {
    name: "Sakura Breeze",
    prompt: "Pastel cherry-blossom pink with contrasting magenta lines on a rotating knot.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torusKnot',
      distance: 5.8,
      material: { color: '#fbcfe8', surface: 'solid', roughness: 0.3, metalness: 0.3 },
      halftone: { enabled: true, shape: 'lines', scale: 22, power: -0.08, width: 0.44, dashColor: '#be185d', gridAngle: 75 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 120,
        speed: 0.15,
        styleKey: 'blobs',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#ffe4e6' },
          { offset: 0.5, color: '#fbcfe8' },
          { offset: 1.0, color: '#f472b6' }
        ]
      }
    }
  },
  {
    name: "Midnight Ocean",
    prompt: "Deep aquatic blue and turquoise waves with elegant wave frequency halftone patterns.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'sphere',
      distance: 5.3,
      material: { color: '#047857', surface: 'glass', roughness: 0.05, metalness: 0.7 },
      halftone: { enabled: true, shape: 'none', scale: 25, power: 0.0, width: 0.45, dashColor: '#0f172a', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 45,
        speed: 0.4,
        styleKey: 'fluid',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#06b6d4' },
          { offset: 0.5, color: '#1e40af' },
          { offset: 1.0, color: '#020617' }
        ]
      }
    }
  },
  {
    name: "Atomic Lime",
    prompt: "High voltage lime green dynamic structures with contrasting dark violet shapes.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'faceted-sphere',
      distance: 5.9,
      material: { color: '#adff2f', surface: 'solid', roughness: 0.2, metalness: 0.9 },
      halftone: { enabled: true, shape: 'squares', scale: 30, power: 0.06, width: 0.42, dashColor: '#4c1d95', gridAngle: 0 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 45,
        speed: 0.3,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#2e1065' },
          { offset: 1.0, color: '#adff2f' }
        ]
      }
    }
  },
  {
    name: "Copper Forge",
    prompt: "Raw industrial copper sheets combined with dynamic high-frequency orange and brown lines.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'exploding-cube',
      distance: 5.8,
      material: { color: '#ea580c', surface: 'solid', roughness: 0.4, metalness: 0.9 },
      halftone: { enabled: true, shape: 'crosshatch', scale: 20, power: 0.15, width: 0.48, dashColor: '#431407', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 15,
        speed: 0.22,
        styleKey: 'stripes',
        blendMode: 'soft-light',
        stops: [
          { offset: 0.0, color: '#1c1917' },
          { offset: 0.5, color: '#78716c' },
          { offset: 1.0, color: '#d6d3d1' }
        ]
      }
    }
  },
  {
    name: "Royal Velvet",
    prompt: "Shimmering royal gold and velvety indigo dots on a rotating torus knot.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torusKnot',
      distance: 5.7,
      material: { color: '#eab308', surface: 'glass', roughness: 0.1, metalness: 0.8 },
      halftone: { enabled: true, shape: 'dots', scale: 26, power: -0.06, width: 0.5, dashColor: '#3b0764', gridAngle: 30 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 90,
        speed: 0.18,
        styleKey: 'blobs',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#6b21a8' },
          { offset: 0.5, color: '#1e1b4b' },
          { offset: 1.0, color: '#eab308' }
        ]
      }
    }
  },
  {
    name: "Cosmic Dust",
    prompt: "Vast purple interstellar nebula with high scale stellar dust points.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'sphere',
      distance: 6.4,
      material: { color: '#c084fc', surface: 'solid', roughness: 0.5, metalness: 0.5 },
      halftone: { enabled: true, shape: 'dots', scale: 40, power: 0.18, width: 0.35, dashColor: '#faf800', gridAngle: 120 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 0,
        speed: 0.5,
        styleKey: 'fluid',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#6814af' },
          { offset: 0.4, color: '#ff5c00' },
          { offset: 1.0, color: '#0b001a' }
        ]
      }
    }
  },
  {
    name: "Acid Hologram",
    prompt: "Retro glitchy neon green, yellow, and shifting turquoise wires.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'wavy-sphere',
      distance: 5.2,
      material: { color: '#00ffff', surface: 'wireframe', roughness: 0.2, metalness: 0.9 },
      halftone: { enabled: true, shape: 'lines', scale: 15, power: -0.22, width: 0.6, dashColor: '#facc15', gridAngle: 60 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 45,
        speed: 0.38,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#cc00ff' },
          { offset: 0.5, color: '#00ffff' },
          { offset: 1.0, color: '#ccff00' }
        ]
      }
    }
  },
  {
    name: "Arctic Auroras",
    prompt: "Soft polar auroral curtains of green and violet cascading across a glass torus.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torus',
      distance: 5.9,
      material: { color: '#2dd4bf', surface: 'glass', roughness: 0.1, metalness: 0.4 },
      halftone: { enabled: true, shape: 'none', scale: 20, power: 0.0, width: 0.4, dashColor: '#4a044e', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 120,
        speed: 0.3,
        styleKey: 'fluid',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#4a0e4e' },
          { offset: 0.5, color: '#22c55e' },
          { offset: 1.0, color: '#10b981' }
        ]
      }
    }
  },
  {
    name: "Carbon Grid",
    prompt: "Monochrome stealth look with carbon gray tiles and ultra-thin grid lines.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'puffy-cube',
      distance: 6.3,
      material: { color: '#27272a', surface: 'solid', roughness: 0.8, metalness: 0.1 },
      halftone: { enabled: true, shape: 'squares', scale: 35, power: 0.11, width: 0.5, dashColor: '#09090b', gridAngle: 15 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 45,
        speed: 0.05,
        styleKey: 'stripes',
        blendMode: 'multiply',
        stops: [
          { offset: 0.0, color: '#3f3f46' },
          { offset: 1.0, color: '#18181b' }
        ]
      }
    }
  },
  {
    name: "Vaporwave Grid",
    prompt: "Synthwave grid with glowing pastel blue and magenta stripes on a cylinder.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'cylinder',
      distance: 5.7,
      material: { color: '#ec4899', surface: 'solid', roughness: 0.2, metalness: 0.8 },
      halftone: { enabled: true, shape: 'lines', scale: 19, power: -0.1, width: 0.4, dashColor: '#06b6d2', gridAngle: 90 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 30,
        speed: 0.25,
        styleKey: 'blobs',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#c084fc' },
          { offset: 0.5, color: '#ec4899' },
          { offset: 1.0, color: '#67e8f9' }
        ]
      }
    }
  },
  {
    name: "Gold Foil",
    prompt: "Foil-textured bright golden surfaces reflecting radial amber waves.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torusKnot',
      distance: 5.4,
      material: { color: '#facc15', surface: 'solid', roughness: 0.15, metalness: 0.95 },
      halftone: { enabled: true, shape: 'crosshatch', scale: 28, power: 0.08, width: 0.45, dashColor: '#78350f', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 30,
        speed: 0.16,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#ca8a04' },
          { offset: 0.5, color: '#fbbf24' },
          { offset: 1.0, color: '#fef08a' }
        ]
      }
    }
  },
  {
    name: "Crimson Spark",
    prompt: "Vibrant scarlet ruby facets reflecting high speed glowing yellow particles.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'bubble-sphere',
      distance: 5.6,
      material: { color: '#dc2626', surface: 'glass', roughness: 0.02, metalness: 0.72 },
      halftone: { enabled: true, shape: 'dots', scale: 22, power: 0.05, width: 0.42, dashColor: '#fbbf24', gridAngle: 30 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 45,
        speed: 0.45,
        styleKey: 'stripes',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#7f1d1d' },
          { offset: 0.5, color: '#ef4444' },
          { offset: 1.0, color: '#fbbf24' }
        ]
      }
    }
  },
  {
    name: "Ultramarine Blue",
    prompt: "Pure architectural blue shading with stark white dot particles on an obelisk.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'particle-cloud',
      distance: 6.2,
      material: { color: '#1d4ed8', surface: 'solid', roughness: 0.3, metalness: 0.2 },
      halftone: { enabled: true, shape: 'dots', scale: 30, power: -0.12, width: 0.55, dashColor: '#ffffff', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 90,
        speed: 0.1,
        styleKey: 'blobs',
        blendMode: 'overlay',
        stops: [
          { offset: 0.0, color: '#172554' },
          { offset: 1.0, color: '#3b82f6' }
        ]
      }
    }
  },
  {
    name: "Emerald Forest",
    prompt: "Intense deep emerald forest colors under crosshatched glowing sage lines.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torus',
      distance: 6.0,
      material: { color: '#065f46', surface: 'solid', roughness: 0.2, metalness: 0.8 },
      halftone: { enabled: true, shape: 'crosshatch', scale: 24, power: 0.09, width: 0.44, dashColor: '#a7f3d0', gridAngle: 15 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 45,
        speed: 0.12,
        styleKey: 'fluid',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#022c22' },
          { offset: 0.5, color: '#059669' },
          { offset: 1.0, color: '#6ee7b7' }
        ]
      }
    }
  },
  {
    name: "Cyber Punk Yellow",
    prompt: "High-voltage neon yellow combined with dark charcoal wireframe silhouettes.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torusKnot',
      distance: 5.8,
      material: { color: '#18181b', surface: 'wireframe', roughness: 0.5, metalness: 0.9 },
      halftone: { enabled: true, shape: 'lines', scale: 18, power: -0.15, width: 0.58, dashColor: '#facc15', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 15,
        speed: 0.35,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#dc2626' },
          { offset: 0.5, color: '#000000' },
          { offset: 1.0, color: '#facc15' }
        ]
      }
    }
  },
  {
    name: "Amethyst Crystal",
    prompt: "Deep amethyst mineral texture with detailed magenta facets on an icosahedron.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'layered-sphere',
      distance: 5.5,
      material: { color: '#a855f7', surface: 'glass', roughness: 0.05, metalness: 0.3, thickness: 190 },
      halftone: { enabled: true, shape: 'dots', scale: 26, power: 0.04, width: 0.52, dashColor: '#ec4899', gridAngle: 60 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 45,
        speed: 0.22,
        styleKey: 'blobs',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#3b0764' },
          { offset: 0.5, color: '#a855f7' },
          { offset: 1.0, color: '#fbcfe8' }
        ]
      }
    }
  },
  {
    name: "Electric Amber",
    prompt: "Electrified molten orange and copper drops with custom grid overlay.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'sphere',
      distance: 5.8,
      material: { color: '#f97316', surface: 'solid', roughness: 0.1, metalness: 0.9 },
      halftone: { enabled: true, shape: 'squares', scale: 25, power: 0.1, width: 0.46, dashColor: '#ffffff', gridAngle: 30 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 75,
        speed: 0.26,
        styleKey: 'stripes',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#ff2a00' },
          { offset: 0.5, color: '#ff7a00' },
          { offset: 1.0, color: '#ffea00' }
        ]
      }
    }
  },
  {
    name: "Space Vignette",
    prompt: "Stealthy deep space black holes mapped inside circular lines on a sphere.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'sphere',
      distance: 6.0,
      material: { color: '#09090b', surface: 'solid', roughness: 0.7, metalness: 0.1 },
      halftone: { enabled: true, shape: 'lines', scale: 28, power: 0.18, width: 0.48, dashColor: '#3f3f46', gridAngle: 90 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 0,
        speed: 0.08,
        styleKey: 'fluid',
        blendMode: 'multiply',
        stops: [
          { offset: 0.0, color: '#18181b' },
          { offset: 1.0, color: '#09090b' }
        ]
      }
    }
  },
  {
    name: "Neon Mint",
    prompt: "Refreshing cold mint pastel colors paired with cyber pink lines.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torus',
      distance: 5.7,
      material: { color: '#a7f3d0', surface: 'solid', roughness: 0.25, metalness: 0.1 },
      halftone: { enabled: true, shape: 'dots', scale: 22, power: -0.06, width: 0.5, dashColor: '#db2777', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 45,
        speed: 0.18,
        styleKey: 'blobs',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#c1ffea' },
          { offset: 0.5, color: '#14b8a6' },
          { offset: 1.0, color: '#db2777' }
        ]
      }
    }
  },
  {
    name: "Hologram Prism",
    prompt: "Iridescent multicolored rainbow refraction indexes across a glass torus knot.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torusKnot',
      distance: 5.8,
      material: { color: '#e2e8f0', surface: 'glass', roughness: 0.01, metalness: 0.9, thickness: 210, refraction: 2.8 },
      halftone: { enabled: true, shape: 'none', scale: 20, power: 0.0, width: 0.4, dashColor: '#000000', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 135,
        speed: 0.45,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#ff3366' },
          { offset: 0.33, color: '#33ff66' },
          { offset: 0.66, color: '#3366ff' },
          { offset: 1.0, color: '#ffff33' }
        ]
      }
    }
  },
  {
    name: "Burnt Copper",
    prompt: "Heavily oxide coppers detailed with burnt amber crosshatching.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'cylinder',
      distance: 6.4,
      material: { color: '#431407', surface: 'solid', roughness: 0.5, metalness: 0.95 },
      halftone: { enabled: true, shape: 'crosshatch', scale: 20, power: 0.14, width: 0.46, dashColor: '#ea580c', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 60,
        speed: 0.15,
        styleKey: 'stripes',
        blendMode: 'soft-light',
        stops: [
          { offset: 0.0, color: '#292524' },
          { offset: 1.0, color: '#78716c' }
        ]
      }
    }
  },
  {
    name: "Liquid Ruby",
    prompt: "Slick liquid ruby flows shaded inside gorgeous black dot geometries.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'sphere',
      distance: 5.6,
      material: { color: '#ef4444', surface: 'glass', roughness: 0.1, metalness: 0.9 },
      halftone: { enabled: true, shape: 'dots', scale: 32, power: 0.05, width: 0.45, dashColor: '#000000', gridAngle: 30 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 0,
        speed: 0.32,
        styleKey: 'fluid',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#7f1d1d' },
          { offset: 0.5, color: '#dc2626' },
          { offset: 1.0, color: '#fca5a5' }
        ]
      }
    }
  },
  {
    name: "Deep Forest",
    prompt: "Silent pine greens detailed with bright neon green line points on a torus.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torus',
      distance: 5.9,
      material: { color: '#052e16', surface: 'solid', roughness: 0.4, metalness: 0.7 },
      halftone: { enabled: true, shape: 'lines', scale: 24, power: -0.05, width: 0.52, dashColor: '#22c55e', gridAngle: 60 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 90,
        speed: 0.12,
        styleKey: 'blobs',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#022c22' },
          { offset: 1.0, color: '#15803d' }
        ]
      }
    }
  },
  {
    name: "Carbon Metal",
    prompt: "Anthracite steel panels detailed with carbon fiber style crosshatching.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'molecular-sphere',
      distance: 6.2,
      material: { color: '#3f3f46', surface: 'solid', roughness: 0.3, metalness: 0.9 },
      halftone: { enabled: true, shape: 'crosshatch', scale: 35, power: 0.16, width: 0.4, dashColor: '#09090b', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 45,
        speed: 0.08,
        styleKey: 'stripes',
        blendMode: 'multiply',
        stops: [
          { offset: 0.0, color: '#52525b' },
          { offset: 1.0, color: '#18181b' }
        ]
      }
    }
  },
  {
    name: "Laser Horizon",
    prompt: "Outrun grid aesthetic with synthwave neon hot pink and bright cyber blue grid.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'cylinder',
      distance: 5.8,
      material: { color: '#ff007f', surface: 'wireframe', roughness: 0.2, metalness: 0.9 },
      halftone: { enabled: true, shape: 'squares', scale: 22, power: -0.18, width: 0.55, dashColor: '#00f0ff', gridAngle: 0 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 90,
        speed: 0.35,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#2e0854' },
          { offset: 0.5, color: '#ff007f' },
          { offset: 1.0, color: '#00f0ff' }
        ]
      }
    }
  },
  {
    name: "Sapphire Wave",
    prompt: "Iridescent sapphire blue details highlighted with pristine neon white lines.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torusKnot',
      distance: 5.6,
      material: { color: '#1e3a8a', surface: 'glass', roughness: 0.02, metalness: 0.8 },
      halftone: { enabled: true, shape: 'lines', scale: 26, power: 0.06, width: 0.48, dashColor: '#38bdf8', gridAngle: 15 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 45,
        speed: 0.25,
        styleKey: 'fluid',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#1d4ed8' },
          { offset: 0.5, color: '#0f172a' },
          { offset: 1.0, color: '#60a5fa' }
        ]
      }
    }
  },
  {
    name: "Atomic Melon",
    prompt: "Vivid melon orange core nested inside nuclear radioactive green lines.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'sphere',
      distance: 5.8,
      material: { color: '#f97316', surface: 'solid', roughness: 0.15, metalness: 0.8 },
      halftone: { enabled: true, shape: 'dots', scale: 28, power: -0.08, width: 0.52, dashColor: '#22c55e', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 120,
        speed: 0.3,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#22c55e' },
          { offset: 0.5, color: '#10b981' },
          { offset: 1.0, color: '#f97316' }
        ]
      }
    }
  },
  {
    name: "Steel Mesh",
    prompt: "Industrial grey structural cage mapped with high-density wire crosshatching.",
    settings: {
      sourceMode: 'shape',
      shapeKey: '3d-jack',
      distance: 5.4,
      material: { color: '#71717a', surface: 'wireframe', roughness: 0.5, metalness: 0.9 },
      halftone: { enabled: true, shape: 'crosshatch', scale: 40, power: 0.12, width: 0.38, dashColor: '#fafafa', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 45,
        speed: 0.05,
        styleKey: 'stripes',
        blendMode: 'overlay',
        stops: [
          { offset: 0.0, color: '#27272a' },
          { offset: 1.0, color: '#e4e4e7' }
        ]
      }
    }
  },
  {
    name: "Golden Halo",
    prompt: "Ethereal luminous gold halos with light gold dots across a cylinder.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'cylinder',
      distance: 6.1,
      material: { color: '#eab308', surface: 'glass', roughness: 0.08, metalness: 0.95 },
      halftone: { enabled: true, shape: 'dots', scale: 25, power: -0.05, width: 0.5, dashColor: '#fef08a', gridAngle: 30 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 45,
        speed: 0.15,
        styleKey: 'blobs',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#ca8a04' },
          { offset: 0.5, color: '#854d0e' },
          { offset: 1.0, color: '#fef08a' }
        ]
      }
    }
  },
  {
    name: "Neon Grape",
    prompt: "Radical electric violet core surrounded by contrasting hot lime dots.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torus',
      distance: 5.9,
      material: { color: '#7c3aed', surface: 'solid', roughness: 0.2, metalness: 0.7 },
      halftone: { enabled: true, shape: 'dots', scale: 23, power: 0.1, width: 0.46, dashColor: '#a3e635', gridAngle: 60 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 60,
        speed: 0.32,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#4c1d95' },
          { offset: 0.5, color: '#7c3aed' },
          { offset: 1.0, color: '#a3e635' }
        ]
      }
    }
  },
  {
    name: "Desert Mirage",
    prompt: "Warm shifting terracotta, gold, and desert dune copper ripples.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'sphere',
      distance: 5.8,
      material: { color: '#b45309', surface: 'solid', roughness: 0.45, metalness: 0.5 },
      halftone: { enabled: true, shape: 'lines', scale: 20, power: -0.05, width: 0.45, dashColor: '#fed7aa', gridAngle: 15 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 45,
        speed: 0.2,
        styleKey: 'fluid',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#7c2d12' },
          { offset: 0.5, color: '#ea580c' },
          { offset: 1.0, color: '#fef08a' }
        ]
      }
    }
  },
  {
    name: "Cyber Coral",
    prompt: "Tropical neon pink coral structures reflecting bright deep ocean cyan.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torusKnot',
      distance: 5.4,
      material: { color: '#f43f5e', surface: 'glass', roughness: 0.1, metalness: 0.8 },
      halftone: { enabled: true, shape: 'squares', scale: 25, power: 0.08, width: 0.48, dashColor: '#06b6d2', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 30,
        speed: 0.24,
        styleKey: 'blobs',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#ec4899' },
          { offset: 0.5, color: '#1e1b4b' },
          { offset: 1.0, color: '#22d3ee' }
        ]
      }
    }
  },
  {
    name: "Glacial Aurora",
    prompt: "Subzero pale blue icebergs under deep teal auroral matrix arrays.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'wooden-puzzle',
      distance: 5.6,
      material: { color: '#e0f2fe', surface: 'glass', roughness: 0.02, metalness: 0.3, thickness: 170 },
      halftone: { enabled: true, shape: 'lines', scale: 30, power: -0.14, width: 0.56, dashColor: '#0f766e', gridAngle: 120 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 15,
        speed: 0.18,
        styleKey: 'fluid',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#115e59' },
          { offset: 0.5, color: '#0c4a6e' },
          { offset: 1.0, color: '#bae6fd' }
        ]
      }
    }
  },
  {
    name: "Crimson Forge",
    prompt: "Molten glowing crimson iron and dense black volcanic lava textures.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'sphere',
      distance: 5.7,
      material: { color: '#b91c1c', surface: 'solid', roughness: 0.35, metalness: 0.9 },
      halftone: { enabled: true, shape: 'dots', scale: 28, power: 0.15, width: 0.42, dashColor: '#18181b', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 75,
        speed: 0.28,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#450a0a' },
          { offset: 0.5, color: '#dc2626' },
          { offset: 1.0, color: '#fb7185' }
        ]
      }
    }
  },
  {
    name: "Plum Velvet",
    prompt: "Deep dark plum purple with detailed glowing sky-blue and bronze grids.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torus',
      distance: 6.0,
      material: { color: '#581c87', surface: 'solid', roughness: 0.2, metalness: 0.65 },
      halftone: { enabled: true, shape: 'squares', scale: 26, power: -0.05, width: 0.48, dashColor: '#38bdf8', gridAngle: 30 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 90,
        speed: 0.14,
        styleKey: 'blobs',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#3b0764' },
          { offset: 0.5, color: '#581c87' },
          { offset: 1.0, color: '#ca8a04' }
        ]
      }
    }
  },
  {
    name: "Opal Sheen",
    prompt: "Opalescent milky white refractions of subtle pink, blue, and gold highlights.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'sphere',
      distance: 5.5,
      material: { color: '#ffffff', surface: 'glass', roughness: 0.03, metalness: 0.7, thickness: 200, refraction: 2.5 },
      halftone: { enabled: true, shape: 'none', scale: 20, power: 0.0, width: 0.4, dashColor: '#000000', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 135,
        speed: 0.16,
        styleKey: 'fluid',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#fee2e2' },
          { offset: 0.33, color: '#e0f2fe' },
          { offset: 0.66, color: '#fef9c3' },
          { offset: 1.0, color: '#fae8ff' }
        ]
      }
    }
  },
  {
    name: "Carbon Steel",
    prompt: "Monochrome technical blueprints of industrial brushed high-grade steels.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'city-blocks',
      distance: 6.3,
      material: { color: '#52525b', surface: 'solid', roughness: 0.4, metalness: 0.95 },
      halftone: { enabled: true, shape: 'crosshatch', scale: 32, power: 0.14, width: 0.35, dashColor: '#09090b', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 45,
        speed: 0.05,
        styleKey: 'stripes',
        blendMode: 'overlay',
        stops: [
          { offset: 0.0, color: '#27272a' },
          { offset: 1.0, color: '#f4f4f5' }
        ]
      }
    }
  },
  {
    name: "Electric Sunflower",
    prompt: "Supercharged bright sunflower yellow highlighted with deep indigo dots.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torusKnot',
      distance: 5.7,
      material: { color: '#facc15', surface: 'solid', roughness: 0.25, metalness: 0.5 },
      halftone: { enabled: true, shape: 'dots', scale: 24, power: 0.08, width: 0.5, dashColor: '#311060', gridAngle: 60 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 60,
        speed: 0.35,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#311060' },
          { offset: 0.5, color: '#e11d48' },
          { offset: 1.0, color: '#facc15' }
        ]
      }
    }
  },
  {
    name: "Stealth Violet",
    prompt: "Deep dark charcoal bodies mapped inside high-contrast electric violet wireframes.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'gears',
      distance: 5.8,
      material: { color: '#09090b', surface: 'wireframe', roughness: 0.6, metalness: 0.8 },
      halftone: { enabled: true, shape: 'squares', scale: 28, power: -0.15, width: 0.55, dashColor: '#c084fc', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 15,
        speed: 0.15,
        styleKey: 'blobs',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#020617' },
          { offset: 1.0, color: '#4a044e' }
        ]
      }
    }
  },
  {
    name: "Sunset Dunes",
    prompt: "Terracotta sun-drenched desert slopes detailed with stark gold stripes.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'sphere',
      distance: 6.0,
      material: { color: '#c2410c', surface: 'solid', roughness: 0.5, metalness: 0.4 },
      halftone: { enabled: true, shape: 'lines', scale: 20, power: -0.04, width: 0.42, dashColor: '#fef08a', gridAngle: 15 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 45,
        speed: 0.15,
        styleKey: 'fluid',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#451a03' },
          { offset: 0.5, color: '#ea580c' },
          { offset: 1.0, color: '#ca8a04' }
        ]
      }
    }
  },
  {
    name: "Lagoon Splash",
    prompt: "Vivid azure, teal, and lime green tropical lagoon water structures.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torus',
      distance: 5.8,
      material: { color: '#0d9488', surface: 'glass', roughness: 0.05, metalness: 0.7 },
      halftone: { enabled: true, shape: 'dots', scale: 26, power: -0.05, width: 0.48, dashColor: '#3b82f6', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 135,
        speed: 0.28,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#1e3a8a' },
          { offset: 0.5, color: '#14b8a6' },
          { offset: 1.0, color: '#a3e635' }
        ]
      }
    }
  },
  {
    name: "Molten Lava",
    prompt: "Volcanic lava magma eruptions detailed with deep charcoal crosshatching.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'sphere',
      distance: 5.7,
      material: { color: '#dc2626', surface: 'solid', roughness: 0.3, metalness: 0.8 },
      halftone: { enabled: true, shape: 'crosshatch', scale: 28, power: 0.12, width: 0.44, dashColor: '#09090b', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 60,
        speed: 0.32,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#180808' },
          { offset: 0.5, color: '#ef4444' },
          { offset: 1.0, color: '#facc15' }
        ]
      }
    }
  },
  {
    name: "Glacier Ridge",
    prompt: "Solid glacial ridges colored in arctic cobalt blue with bright silver dots.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'cylinder',
      distance: 6.2,
      material: { color: '#2563eb', surface: 'solid', roughness: 0.15, metalness: 0.85 },
      halftone: { enabled: true, shape: 'dots', scale: 30, power: -0.08, width: 0.5, dashColor: '#e0f2fe', gridAngle: 30 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 45,
        speed: 0.12,
        styleKey: 'fluid',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#1e3a8a' },
          { offset: 0.5, color: '#0284c7' },
          { offset: 1.0, color: '#bae6fd' }
        ]
      }
    }
  },
  {
    name: "Retro Terminal",
    prompt: "Stark green 80s terminal amber phosphorus screens with high-contrast dots.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'crater-moon',
      distance: 6.0,
      material: { color: '#052e16', surface: 'wireframe', roughness: 0.8, metalness: 0.5 },
      halftone: { enabled: true, shape: 'dots', scale: 35, power: 0.18, width: 0.54, dashColor: '#22c55e', gridAngle: 0 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 0,
        speed: 0.08,
        styleKey: 'stripes',
        blendMode: 'overlay',
        stops: [
          { offset: 0.0, color: '#022c22' },
          { offset: 1.0, color: '#064e3b' }
        ]
      }
    }
  },
  {
    name: "Nebula Core",
    prompt: "Core of a newborn star exploding with pink, red, and golden stellar dust clouds.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'torusKnot',
      distance: 5.6,
      material: { color: '#f43f5e', surface: 'solid', roughness: 0.2, metalness: 0.6 },
      halftone: { enabled: true, shape: 'dots', scale: 28, power: -0.06, width: 0.46, dashColor: '#fbbf24', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'radial',
        angle: 45,
        speed: 0.38,
        styleKey: 'plasma',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#570a24' },
          { offset: 0.5, color: '#e11d48' },
          { offset: 1.0, color: '#fbbf24' }
        ]
      }
    }
  },
  {
    name: "Iceberg Frost",
    prompt: "Frozen pale turquoise crystals highlighted with stark navy blue shadows.",
    settings: {
      sourceMode: 'shape',
      shapeKey: 'hollow-dodeca',
      distance: 5.5,
      material: { color: '#ccfbf1', surface: 'glass', roughness: 0.05, metalness: 0.2, thickness: 160 },
      halftone: { enabled: true, shape: 'crosshatch', scale: 32, power: 0.1, width: 0.45, dashColor: '#115e59', gridAngle: 45 },
      gradient: {
        enabled: true,
        type: 'linear',
        angle: 15,
        speed: 0.14,
        styleKey: 'fluid',
        blendMode: 'screen',
        stops: [
          { offset: 0.0, color: '#134e4a' },
          { offset: 0.5, color: '#0d9488' },
          { offset: 1.0, color: '#ccfbf1' }
        ]
      }
    }
  }
];
