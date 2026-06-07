/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LightingSettings {
  intensity: number;
  fillIntensity: number;
  ambientIntensity: number;
  angleDegrees: number;
  height: number;
  shadowOpacity: number;
  shadowBlur: number;
}

export interface MaterialSettings {
  surface: 'solid' | 'glass' | 'wireframe';
  color: string;
  roughness: number;
  metalness: number;
  thickness: number;
  refraction: number;
  environmentPower: number;
}

export interface HalftoneSettings {
  enabled: boolean;
  shape: 'dots' | 'squares' | 'lines' | 'crosshatch' | 'none';
  scale: number;
  power: number;
  toneTarget: 'light' | 'dark';
  width: number;
  imageContrast: number;
  dashColor: string;
  hoverDashColor: string;
  gridAngle: number;
  useImageColors: boolean;
  waveAmplitude: number;
  waveFrequency: number;
  shadowToneIntensity: number;
  shadowToneBlur: number;
}

export interface BackgroundSettings {
  transparent: boolean;
  color: string;
}

export interface GradientStop {
  offset: number;
  color: string;
}

export interface GradientSettings {
  enabled: boolean;
  stops: GradientStop[];
  type: 'linear' | 'radial';
  angle: number;
  animate: boolean;
  speed: number;
  noise: number; // Grain intensity, 0 to 1
  blur: number; // Blur intensity, 40 to 120
  interactive: boolean; // Interactive drag or mouse hover flow
  waveComplexity: number; // Dynamic displacement intensity
  styleKey: 'blobs' | 'stripes' | 'plasma' | 'fluid';
  tilt: number; // Shear display slant, e.g. -15 to 15
  overlayType: 'none' | 'scanlines' | 'grid' | 'vignette';
  rippleStrength: number; // Ripple wave force on pointer click, 0 to 1
  blendMode: 'screen' | 'overlay' | 'multiply' | 'soft-light';
  movementPattern: 'flow' | 'pulse' | 'shift' | 'drift';
  colorBoost: number; // Color saturation/brightness amplifier, e.g. 1.0 to 2.0
  shimmerSpeed: number; // Fine luminance shimmer speed
  tiltJitter: boolean; // Dynamic micro slant rotation
  vibrationLevel: number; // High frequency micro vibration level
  bgBlur: number; // CSS backdrop-filter blur overlay, 0 to 100
}

export interface BloomSettings {
  enabled: boolean;
  bloomIntensity: number;
}

export interface AnimationSettings {
  autoRotateEnabled: boolean;
  breatheEnabled: boolean;
  cameraParallaxEnabled: boolean;
  followHoverEnabled: boolean;
  followDragEnabled: boolean;
  floatEnabled: boolean;
  hoverHalftoneEnabled: boolean;
  hoverLightEnabled: boolean;
  dragFlowEnabled: boolean;
  lightSweepEnabled: boolean;
  rotateEnabled: boolean;
  autoSpeed: number;
  autoWobble: number;
  breatheAmount: number;
  breatheSpeed: number;
  cameraParallaxAmount: number;
  cameraParallaxEase: number;
  driftAmount: number;
  hoverRange: number;
  hoverEase: number;
  hoverReturn: boolean;
  dragSens: number;
  dragFriction: number;
  dragMomentum: boolean;
  rotateAxis: 'x' | 'y' | 'z';
  rotatePreset: 'axis' | 'free';
  rotateSpeed: number;
  rotatePingPong: boolean;
  floatAmplitude: number;
  floatSpeed: number;
  lightSweepHeightRange: number;
  lightSweepRange: number;
  lightSweepSpeed: number;
  springDamping: number;
  springReturnEnabled: boolean;
  springStrength: number;
  waveEnabled: boolean;
  waveSpeed: number;
  waveAmount: number;
  hoverHalftonePowerShift: number;
  hoverHalftoneRadius: number;
  hoverHalftoneWidthShift: number;
  hoverLightIntensity: number;
  hoverLightRadius: number;
  dragFlowDecay: number;
  dragFlowRadius: number;
}

export type SourceMode = 'shape' | 'image' | 'video' | 'text';

export interface ShapeModifiers {
  twistAmount: number;
  inflateAmount: number;
  detailLevel: number;
  rippleAmount: number;
  rippleFrequency: number;
  bevelSize: number;
  vertexNodes: number;
  wireframeOpacity: number;
  innerCoreSize: number;
  noiseAmount: number;
  noiseScale: number;
  spikeAmount: number;
  fragmentationAmount: number;
  particlesEnabled: boolean;
  particlesCount: number;
}

export interface AppSettings {
  sourceMode: SourceMode;
  shapeKey: string;
  shapeModifiers: ShapeModifiers;
  textString: string;
  fontFamily: string;
  fontSize: number;
  fontBold: boolean;
  imageSrc: string | null;
  videoSrc: string | null;
  distance: number;
  lighting: LightingSettings;
  material: MaterialSettings;
  halftone: HalftoneSettings;
  background: BackgroundSettings;
  animation: AnimationSettings;
  bloom: BloomSettings;
  gradient: GradientSettings;
}

export const INITIAL_SETTINGS: AppSettings = {
  sourceMode: 'shape',
  shapeKey: 'torusKnot',
  shapeModifiers: {
    twistAmount: 0.0,
    inflateAmount: 0.0,
    detailLevel: 3,
    rippleAmount: 0.0,
    rippleFrequency: 2.0,
    bevelSize: 0.1,
    vertexNodes: 0.0,
    wireframeOpacity: 0.0,
    innerCoreSize: 0.0,
    noiseAmount: 0.0,
    noiseScale: 2.0,
    spikeAmount: 0.0,
    fragmentationAmount: 0.0,
    particlesEnabled: false,
    particlesCount: 200,
  },
  textString: 'TWENTY',
  fontFamily: 'Inter',
  fontSize: 48,
  fontBold: true,
  imageSrc: null,
  videoSrc: null,
  distance: 5.9,
  lighting: {
    intensity: 0.5,
    fillIntensity: 0.15,
    ambientIntensity: 0.09,
    angleDegrees: 30,
    height: 7.2,
    shadowOpacity: 0.45,
    shadowBlur: 2.0,
  },
  material: {
    surface: 'solid',
    color: '#d4d0c8',
    roughness: 0,
    metalness: 0.16,
    thickness: 150,
    refraction: 2,
    environmentPower: 5,
  },
  halftone: {
    enabled: true,
    shape: 'none',
    scale: 24.72,
    power: -0.07,
    toneTarget: 'light',
    width: 0.46,
    imageContrast: 1.0,
    dashColor: '#4A38F5',
    hoverDashColor: '#4A38F5',
    gridAngle: 45.0,
    useImageColors: false,
    waveAmplitude: 0.0,
    waveFrequency: 2.5,
    shadowToneIntensity: 1.2,
    shadowToneBlur: 0.05,
  },
  background: {
    transparent: true,
    color: '#000000',
  },
  animation: {
    autoRotateEnabled: true,
    breatheEnabled: false,
    cameraParallaxEnabled: false,
    followHoverEnabled: false,
    followDragEnabled: false,
    floatEnabled: false,
    hoverHalftoneEnabled: false,
    hoverLightEnabled: false,
    dragFlowEnabled: false,
    lightSweepEnabled: false,
    rotateEnabled: false,
    autoSpeed: 0.2,
    autoWobble: 0.3,
    breatheAmount: 0.04,
    breatheSpeed: 0.8,
    cameraParallaxAmount: 0.3,
    cameraParallaxEase: 0.08,
    driftAmount: 8,
    hoverRange: 25,
    hoverEase: 0.08,
    hoverReturn: true,
    dragSens: 0.008,
    dragFriction: 0.08,
    dragMomentum: true,
    rotateAxis: 'y',
    rotatePreset: 'axis',
    rotateSpeed: 0.2,
    rotatePingPong: false,
    floatAmplitude: 0.16,
    floatSpeed: 0.8,
    lightSweepHeightRange: 0.5,
    lightSweepRange: 28,
    lightSweepSpeed: 0.7,
    springDamping: 0.72,
    springReturnEnabled: false,
    springStrength: 0.18,
    waveEnabled: false,
    waveSpeed: 1.0,
    waveAmount: 2.0,
    hoverHalftonePowerShift: 0.42,
    hoverHalftoneRadius: 0.2,
    hoverHalftoneWidthShift: -0.18,
    hoverLightIntensity: 0.8,
    hoverLightRadius: 0.2,
    dragFlowDecay: 0.08,
    dragFlowRadius: 0.5,
  },
  bloom: {
    enabled: false,
    bloomIntensity: 0.4,
  },
  gradient: {
    enabled: true,
    stops: [
      { offset: 0.0, color: '#ff5e62' }, // Coral Orange
      { offset: 0.25, color: '#ff2a85' }, // Vibrant Pink
      { offset: 0.5, color: '#7a00ff' }, // Violet
      { offset: 0.75, color: '#1b45ff' }, // Blue
      { offset: 1.0, color: '#ffbe3b' }, // Sunset Gold
    ],
    type: 'linear',
    angle: 45,
    animate: true,
    speed: 0.22,
    noise: 0.12,
    blur: 70,
    interactive: true,
    waveComplexity: 1.2,
    styleKey: 'stripes',
    tilt: -8,
    overlayType: 'none',
    rippleStrength: 0.45,
    blendMode: 'screen',
    movementPattern: 'flow',
    colorBoost: 1.2,
    shimmerSpeed: 0.15,
    tiltJitter: false,
    vibrationLevel: 0.0,
    bgBlur: 20,
  },
};
