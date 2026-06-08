/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppSettings, SourceMode, INITIAL_SETTINGS } from '../types';
import { 
  Eye, 
  Lightbulb, 
  Paintbrush, 
  Play, 
  Layout, 
  Upload, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Info,
  HelpCircle,
  Copy,
  Download,
  Share2,
  RotateCcw,
  Code,
  Check,
  RefreshCw,
  Video
} from 'lucide-react';

interface ControlPanelProps {
  settings: AppSettings;
  onChange: (updater: (prev: AppSettings) => AppSettings) => void;
  onCopyLink?: () => void;
  onExportPNG?: () => void;
  onExportWebM?: () => void;
  recordingStatus?: 'idle' | 'recording' | 'finished';
  onReset?: () => void;
  videoQuality?: '720' | '1080' | '1440' | '2160';
  onVideoQualityChange?: (val: '720' | '1080' | '1440' | '2160') => void;
  videoDuration?: number;
  onVideoDurationChange?: (val: number) => void;
}

export default function ControlPanel({ 
  settings, 
  onChange,
  onCopyLink,
  onExportPNG,
  onExportWebM,
  recordingStatus = 'idle',
  onReset,
  videoQuality = '1080',
  onVideoQualityChange,
  videoDuration = 20,
  onVideoDurationChange
}: ControlPanelProps) {
  // Sidebar tab state matching twenty.com UI
  const [activeTab, setActiveTab] = useState<'design' | 'animations' | 'export'>('design');

  const [codeTab, setCodeTab] = useState<'react' | 'html'>('react');
  const [copiedCode, setCopiedCode] = useState(false);

  // AI Design Co-Pilot states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // AI idea suggestion presets pool
  const CONCEPT_POOL = [
    { name: "🎴 Solar Flare", prompt: "A warm blazing solar eclipse with fiery gold colors, thin concentric circles and smooth halo glow" },
    { name: "💻 Neon Matrix", prompt: "Emerald retro digital hacker code matrix, high density square halftone in dark background" },
    { name: "🔮 Glass Torus", prompt: "A beautiful glassy refraction torus with shiny metalness, light pastel blue colors and crosshatch dots" },
    { name: "🪙 Cyber Coin", prompt: "A sleek silver sun coin with high-tech cyan vector dots, moody directional light and dark transparent glass" },
    { name: "🪐 Cosmic Blast", prompt: "Cosmic stardust nebula icosahedron, cyan and magenta halftone dots, floating on transparent canvas" },
    { name: "🌸 Zen Lotus", prompt: "Zen lotus coin with teal circles halftone, soft white matte material, clean ambient studio lights" },
    { name: "🌇 Retro Sunset", prompt: "Cyberpunk highway neon sunset grid, violet cylinder, high metalness, bright pink glowing lines" },
    { name: "💎 Crystal Prism", prompt: "Prismatic crystal pyramid, high environmental power, multi-colored dots overlap, black transparent space" },
    { name: "⚙️ Brutalist Steel", prompt: "Brutalist bold steel box with heavy yellow crosshatch dots, high contrast edge light, dark shadow" },
    { name: "💧 Water Droplet", prompt: "Glistening water droplet sphere, high thickness refraction, liquid pattern, neon green halftone accents" },
    { name: "🐆 Vintage News", prompt: "Vintage monochrome newspaper print of an octahedron, large dots halftone, pure black and white high contrast" },
    { name: "🎷 Brass Antique", prompt: "Art deco brass coin, dark bronze lines grid, warm spotlight angle, smooth metal roughness" },
    { name: "🧬 Bio-Neon", prompt: "Glowing biological core structure, vibrant fluorescent pink and cyan halftone plasma, intricate neural network lines" },
    { name: "🏔️ Arctic Peak", prompt: "Minimalist geometric mountain peak with icy blue crosshatch dots, clean white background, sharp edge lighting" },
    { name: "⚡ Liquid Volt", prompt: "Spilled liquid electricity sphere, high-speed motion, electric yellow lines, cyan halftone particles" }
  ];

  const [suggestions, setSuggestions] = useState(() => CONCEPT_POOL.slice(0, 5));
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  const rotateSuggestions = async () => {
    if (isSuggestionsLoading) return;
    setIsSuggestionsLoading(true);
    try {
      const response = await fetch("/api/gemini/suggest-concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
      });
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.concepts) && data.concepts.length > 0) {
          setSuggestions(data.concepts);
        } else {
          const shuffled = [...CONCEPT_POOL].sort(() => 0.5 - Math.random());
          setSuggestions(shuffled.slice(0, 5));
        }
      } else {
        const shuffled = [...CONCEPT_POOL].sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 5));
      }
    } catch (err) {
      console.warn("Faced issue loading suggestions from Gemini, falling back gracefully:", err);
      const shuffled = [...CONCEPT_POOL].sort(() => 0.5 - Math.random());
      setSuggestions(shuffled.slice(0, 5));
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  // Snippet Builders
  const getReactCode = () => {
    const toneTargetCode = settings.halftone.toneTarget === 'light' ? 0 : 1;
    const isAutoRotate = settings.animation.autoRotateEnabled ? 'true' : 'false';
    const useImgColors = settings.halftone.useImageColors ? 'true' : 'false';

    return `import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- STYLING CONFIGURATION ---
// Customize these constants easily to integrate with any website design!
const EXPORT_PATTERN_COLOR = '${settings.halftone.dashColor}'; // Halftone dot grids color pigment

export default function StandaloneHalftoneViewer() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 640;
    const height = containerRef.current.clientHeight || 480;

    // 1. Scene setup for 3D active objects
    const scene = new THREE.Scene();
    scene.background = null; // Forced to null for pure transparent 3D asset overlays

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, ${settings.distance});

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setClearColor(0x000000, 0); // Always completely transparent background
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    containerRef.current.appendChild(renderer.domElement);

    // Orbit controls support for responsive click-and-drag 3D interaction!
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Disabled so page scrolling doesn't zoom into the 3D canvas
    controls.enablePan = false;  // Disabled to prevent right-click dragging from shifting the 3D model off-canvas

    // Render target for offscreen pass (pre-halftone scene capture)
    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });

    // Mesh group to hold elements for synchronized coordinates sways & scales
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);

    // 2. Geometries & Materials Configuration
    let geometry;
    const shape = "${settings.shapeKey}";
    const sourceMode = "${settings.sourceMode}";

    if (sourceMode === 'text') {
      // Procedural canvas text generator to render custom vector fonts
      const canvasText = document.createElement('canvas');
      canvasText.width = 512;
      canvasText.height = 256;
      const ctxText = canvasText.getContext('2d');
      if (ctxText) {
        ctxText.clearRect(0, 0, 512, 256);
        ctxText.fillStyle = '#ffffff';
        ctxText.textAlign = 'center';
        ctxText.textBaseline = 'middle';
        ctxText.font = 'bold 84px sans-serif';
        ctxText.fillText("${settings.textString.replace(/"/g, '\\"')}", 256, 128);
      }
      const textTexture = new THREE.CanvasTexture(canvasText);
      textTexture.colorSpace = THREE.SRGBColorSpace;

      geometry = new THREE.PlaneGeometry(3.2, 1.6);
      const textMaterial = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const textMesh = new THREE.Mesh(geometry, textMaterial);
      meshGroup.add(textMesh);
    } else if (sourceMode === 'image') {
      const imgTextureLoader = new THREE.TextureLoader();
      const base64Img = "${settings.imageSrc ? settings.imageSrc : ''}";
      let finalTex;

      if (base64Img) {
        finalTex = imgTextureLoader.load(base64Img, () => {
          renderer.render(scene, camera);
        });
      } else {
        const canvasPlaceholder = document.createElement('canvas');
        canvasPlaceholder.width = 512;
        canvasPlaceholder.height = 512;
        const ctxP = canvasPlaceholder.getContext('2d');
        if (ctxP) {
          ctxP.clearRect(0, 0, 512, 512);
          const grad = ctxP.createRadialGradient(256, 256, 50, 256, 256, 240);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, '#bbbbbb');
          grad.addColorStop(0.6, '#555555');
          grad.addColorStop(1, '#000000');
          ctxP.fillStyle = grad;
          ctxP.beginPath();
          ctxP.arc(256, 256, 220, 0, Math.PI * 2);
          ctxP.fill();
        }
        finalTex = new THREE.CanvasTexture(canvasPlaceholder);
      }

      geometry = new THREE.PlaneGeometry(2.6, 2.6);
      const imgMaterial = new THREE.MeshBasicMaterial({
        map: finalTex,
        transparent: true,
        side: THREE.DoubleSide
      });
      const imgMesh = new THREE.Mesh(geometry, imgMaterial);
      meshGroup.add(imgMesh);
    } else {
      // Main Physical material matching current configurations
      const materialParams = {
        color: new THREE.Color('${settings.material.color}'),
        roughness: ${settings.material.roughness},
        metalness: ${settings.material.metalness}
      };

      if ("${settings.material.surface}" === 'glass') {
        Object.assign(materialParams, {
          transmission: 0.65,
          ior: ${settings.material.refraction},
          thickness: ${settings.material.thickness / 100.0},
          clearcoat: 1.0,
          clearcoatRoughness: 0.05
        });
      } else {
        Object.assign(materialParams, {
          clearcoat: 0.5,
          clearcoatRoughness: 0.1
        });
      }

      const activeMaterial = new THREE.MeshPhysicalMaterial(materialParams);
      const detailMaterial = activeMaterial.clone();
      let activeMesh;

      if (shape === 'sphere') {
        activeMesh = new THREE.Mesh(new THREE.SphereGeometry(1.3, 64, 64), activeMaterial);
      } else if (shape === 'star') {
        const starShape = new THREE.Shape();
        const outerRadius = 1.4;
        const innerRadius = 0.6;
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerRadius : innerRadius;
          const a = (i / 10) * Math.PI * 2;
          if (i === 0) starShape.moveTo(Math.sin(a) * r, Math.cos(a) * r);
          else starShape.lineTo(Math.sin(a) * r, Math.cos(a) * r);
        }
        starShape.closePath();
        const geom = new THREE.ExtrudeGeometry(starShape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 });
        geom.center();
        activeMesh = new THREE.Mesh(geom, activeMaterial);
      } else if (shape === 'heart') {
        const heartShape = new THREE.Shape();
        const x = 0, y = 0;
        heartShape.moveTo( x + .25, y + .25 );
        heartShape.bezierCurveTo( x + .25, y + .25, x + .20, y, x, y );
        heartShape.bezierCurveTo( x - .30, y, x - .30, y + .35,x - .30,y + .35 );
        heartShape.bezierCurveTo( x - .30, y + .55, x - .10, y + .77, x + .25, y + .95 );
        heartShape.bezierCurveTo( x + .60, y + .77, x + .80, y + .55, x + .80, y + .35 );
        heartShape.bezierCurveTo( x + .80, y + .35, x + .80, y, x + .50, y );
        heartShape.bezierCurveTo( x + .35, y, x + .25, y + .25, x + .25, y + .25 );
        const geom = new THREE.ExtrudeGeometry(heartShape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 });
        geom.scale(2.2, -2.2, 2.2);
        geom.center();
        activeMesh = new THREE.Mesh(geom, activeMaterial);
      } else if (shape === 'capsule') {
        activeMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 1.2, 32, 64), activeMaterial);
      } else if (shape === 'ring') {
        activeMesh = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.15, 32, 100), activeMaterial);
      } else if (shape === 'diamond') {
        const geom = new THREE.OctahedronGeometry(1.4, 0);
        geom.scale(1, 1.4, 1);
        activeMesh = new THREE.Mesh(geom, activeMaterial);
      } else if (shape === 'gem') {
        const geom = new THREE.DodecahedronGeometry(1.4, 0);
        geom.scale(1, 1.3, 1);
        activeMesh = new THREE.Mesh(geom, activeMaterial);
      } else if (shape === 'box' || shape === 'cube') {
        activeMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), activeMaterial);
      } else if (shape === 'torus') {
        activeMesh = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.35, 32, 120), activeMaterial);
      } else if (shape === 'icosahedron') {
        activeMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 0), activeMaterial);
      } else if (shape === 'cylinder') {
        activeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.8, 32), activeMaterial);
      } else if (shape === 'cone') {
        activeMesh = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 32), activeMaterial);
      } else if (shape === 'octahedron') {
        activeMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), activeMaterial);
      } else if (shape === 'dodecahedron') {
        activeMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 0), activeMaterial);
      } else if (shape === 'tetrahedron') {
        activeMesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1.5, 0), activeMaterial);
      } else if (shape === 'sunCoin' || shape === 'sun_coin') {
        const group = new THREE.Group();
        const coinMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.18, 64), activeMaterial);
        coinMesh.rotation.x = Math.PI / 2;
        group.add(coinMesh);

        const rimGeom = new THREE.TorusGeometry(1.1, 0.08, 16, 100);
        const rimMesh = new THREE.Mesh(rimGeom, detailMaterial);
        rimMesh.position.z = 0.1;
        group.add(rimMesh);

        const rimMeshBack = new THREE.Mesh(rimGeom, detailMaterial);
        rimMeshBack.position.z = -0.1;
        group.add(rimMeshBack);

        const sunCoreMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32), detailMaterial);
        sunCoreMesh.rotation.x = Math.PI / 2;
        sunCoreMesh.position.z = 0.1;
        group.add(sunCoreMesh);

        const numRays = 10;
        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI * 2;
          const rayGeom = new THREE.ConeGeometry(0.08, 0.45, 4);
          const rayMesh = new THREE.Mesh(rayGeom, detailMaterial);
          rayMesh.rotation.z = angle - Math.PI / 2;
          rayMesh.position.set(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, 0.1);
          group.add(rayMesh);

          const backRayMesh = new THREE.Mesh(rayGeom, detailMaterial);
          backRayMesh.rotation.z = angle - Math.PI / 2;
          backRayMesh.position.set(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, -0.1);
          group.add(backRayMesh);
        }
        activeMesh = group;
      } else if (shape === 'lotusCoin' || shape === 'lotus_coin') {
        const group = new THREE.Group();
        const coinMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.18, 64), activeMaterial);
        coinMesh.rotation.x = Math.PI / 2;
        group.add(coinMesh);

        const rimGeom = new THREE.TorusGeometry(1.1, 0.08, 16, 100);
        const rimMesh = new THREE.Mesh(rimGeom, detailMaterial);
        rimMesh.position.z = 0.1;
        group.add(rimMesh);

        const rimMeshBack = new THREE.Mesh(rimGeom, detailMaterial);
        rimMeshBack.position.z = -0.1;
        group.add(rimMeshBack);

        const numPetals = 8;
        for (let i = 0; i < numPetals; i++) {
          const angle = (i / numPetals) * Math.PI * 2;
          const petalGeom = new THREE.SphereGeometry(0.24, 16, 16);

          const petalMesh = new THREE.Mesh(petalGeom, detailMaterial);
          petalMesh.scale.set(0.65, 1.3, 0.15);
          petalMesh.rotation.z = angle;
          petalMesh.rotation.x = 0.15 * Math.sin(angle);
          petalMesh.rotation.y = -0.15 * Math.cos(angle);
          petalMesh.position.set(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, 0.1);
          group.add(petalMesh);

          const petalMeshBack = new THREE.Mesh(petalGeom, detailMaterial);
          petalMeshBack.scale.set(0.65, 1.3, 0.15);
          petalMeshBack.rotation.z = angle;
          petalMeshBack.rotation.x = -0.15 * Math.sin(angle);
          petalMeshBack.rotation.y = 0.15 * Math.cos(angle);
          petalMeshBack.position.set(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, -0.1);
          group.add(petalMeshBack);
        }

        const centerGeom = new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const centerMesh = new THREE.Mesh(centerGeom, detailMaterial);
        centerMesh.rotation.x = Math.PI / 2;
        centerMesh.position.z = 0.15;
        group.add(centerMesh);
        activeMesh = group;
      } else if (shape === 'arrowTarget' || shape === 'arrow_target') {
        const group = new THREE.Group();
        const baseBoard = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.15, 64), activeMaterial);
        baseBoard.rotation.x = Math.PI / 2;
        group.add(baseBoard);

        const rings = [0.95, 0.65, 0.35];
        rings.forEach((radius, sIdx) => {
          const ringGeom = new THREE.TorusGeometry(radius, 0.05, 12, 64);
          const rMesh = new THREE.Mesh(ringGeom, detailMaterial);
          rMesh.position.z = 0.08 + sIdx * 0.01;
          group.add(rMesh);

          const rMeshBack = new THREE.Mesh(ringGeom, detailMaterial);
          rMeshBack.position.z = -0.08 - sIdx * 0.01;
          group.add(rMeshBack);
        });

        const bulletMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), detailMaterial);
        bulletMesh.scale.set(1.0, 1.0, 0.5);
        bulletMesh.position.z = 0.08;
        group.add(bulletMesh);

        const shaftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 1.2, 8), detailMaterial);
        shaftMesh.rotation.x = -Math.PI / 4;
        shaftMesh.rotation.y = Math.PI / 6;
        shaftMesh.position.set(-0.35, 0.35, 0.5);
        group.add(shaftMesh);

        const headMesh = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.15, 6), detailMaterial);
        headMesh.rotation.x = -Math.PI / 4 + Math.PI;
        headMesh.rotation.y = Math.PI / 6;
        headMesh.position.set(0, 0, 0.1);
        group.add(headMesh);

        for (let f = 0; f < 3; f++) {
          const fAngle = (f / 3) * Math.PI * 2;
          const fMesh = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.08, 0.18), detailMaterial);
          fMesh.position.set(-0.7 + Math.cos(fAngle) * 0.05, 0.7 + Math.sin(fAngle) * 0.05, 0.9);
          fMesh.rotation.x = -Math.PI / 4;
          fMesh.rotation.y = Math.PI / 6;
          fMesh.rotation.z = fAngle;
          group.add(fMesh);
        }
        activeMesh = group;
      } else if (shape === 'dollarCoin' || shape === 'dollar_coin') {
        const group = new THREE.Group();
        const coinMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.18, 64), activeMaterial);
        coinMesh.rotation.x = Math.PI / 2;
        group.add(coinMesh);

        const rimGeom = new THREE.TorusGeometry(1.1, 0.08, 16, 100);
        const rimMesh = new THREE.Mesh(rimGeom, detailMaterial);
        rimMesh.position.z = 0.1;
        group.add(rimMesh);

        const rimMeshBack = new THREE.Mesh(rimGeom, detailMaterial);
        rimMeshBack.position.z = -0.1;
        group.add(rimMeshBack);

        const createDollarLogo = (isFront: boolean) => {
          const zOff = isFront ? 0.11 : -0.11;
          const logoGroup = new THREE.Group();

          const barMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.2, 16), detailMaterial);
          barMesh.position.set(0, 0, zOff);
          logoGroup.add(barMesh);

          const topLoop = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.052, 16, 32, Math.PI * 1.5 + 0.1), detailMaterial);
          topLoop.position.set(-0.06, 0.25, zOff);
          topLoop.rotation.z = -Math.PI / 4;
          logoGroup.add(topLoop);

          const bottomLoop = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.052, 16, 32, Math.PI * 1.5 + 0.1), detailMaterial);
          bottomLoop.position.set(0.06, -0.25, zOff);
          bottomLoop.rotation.z = Math.PI * 0.75;
          logoGroup.add(bottomLoop);

          return logoGroup;
        };

        group.add(createDollarLogo(true));
        group.add(createDollarLogo(false));
        activeMesh = group;
      } else {
        activeMesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.85, 0.28, 150, 16), activeMaterial);
      }

      meshGroup.add(activeMesh);
    }

    // Interactive lighting models
    const dirLight = new THREE.DirectionalLight('#ffffff', ${settings.lighting.intensity * 2});
    dirLight.position.set(5, ${settings.lighting.height}, 5);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight('#ffffff', ${settings.lighting.ambientIntensity});
    scene.add(ambientLight);

    // 3. Post-processing Halftone Shaders pipeline
    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const vertexShader = \`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    \`;

    const fragmentShader = \`
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform vec2 uResolution;
      uniform float uScale;
      uniform float uPower;
      uniform float uWidth;
      uniform int uToneTarget;
      uniform vec4 uPatternWeights;
      uniform vec3 uPatternColor;
      uniform bool uTransparent;
      uniform vec3 uBgColor;
      uniform float uContrast;
      uniform float uGridAngle;
      uniform bool uUseImageColors;
      uniform float uShadowOpacity;
      uniform float uTime;
      uniform float uWaveAmplitude;
      uniform float uWaveFrequency;

      void main() {
        vec4 sceneColor = texture2D(tDiffuse, vUv);
        float mask = sceneColor.a;
        if (mask < 0.05) {
          if (uTransparent) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          } else {
            gl_FragColor = vec4(uBgColor, 1.0);
          }
          return;
        }

        float luminance = dot(sceneColor.rgb, vec3(0.299, 0.587, 0.114));
        luminance = clamp((luminance - 0.5) * uContrast + 0.5, 0.0, 1.0);
        
        float val = (uToneTarget == 0) ? luminance : (1.0 - luminance);

        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 gridUv = vUv - 0.5;
        gridUv.x *= aspect.x;

        float s = sin(uGridAngle);
        float c = cos(uGridAngle);
        gridUv = vec2(gridUv.x * c - gridUv.y * s, gridUv.x * s + gridUv.y * c);
        gridUv *= uScale;

        if (uWaveAmplitude > 0.0) {
          float swayX = sin(gridUv.y * 0.5 + uTime * uWaveFrequency) * uWaveAmplitude;
          float swayY = cos(gridUv.x * 0.5 + uTime * uWaveFrequency) * uWaveAmplitude;
          gridUv += vec2(swayX, swayY);
        }

        vec2 localUv = fract(gridUv) - 0.5;
        float distDot = length(localUv);
        float distSquare = max(abs(localUv.x), abs(localUv.y));
        float distLine = abs(localUv.y);
        float distCross = min(abs(localUv.x), abs(localUv.y));

        float distValue = distDot * uPatternWeights.x +
                          distSquare * uPatternWeights.y +
                          distLine * uPatternWeights.z +
                          distCross * uPatternWeights.w;

        float thresholdRadius = val * uWidth;
        float fuzz = max(0.005, uPower);

        float patternAlpha = 1.0 - smoothstep(thresholdRadius - fuzz, thresholdRadius + fuzz, distValue);
        patternAlpha = clamp(patternAlpha * mask, 0.0, 1.0);

        vec3 activeColor = uPatternColor;
        
        if (uUseImageColors) {
          activeColor = sceneColor.rgb;
        } else {
          float sceneLuma = dot(sceneColor.rgb, vec3(0.299, 0.587, 0.114));
          float minIntensity = mix(1.0, 0.25, uShadowOpacity);
          float maxIntensity = mix(1.0, 1.45, uShadowOpacity);
          float lightingIntensity = mix(minIntensity, maxIntensity, sceneLuma);
          activeColor = clamp(activeColor * lightingIntensity, 0.0, 1.0);
          
          vec3 specularGlint = clamp((sceneColor.rgb - vec3(0.48)) * 2.8, 0.0, 1.0);
          activeColor = mix(activeColor, vec3(1.0), specularGlint * 0.95);
        }

        if (uTransparent) {
          gl_FragColor = vec4(activeColor * patternAlpha, patternAlpha);
        } else {
          gl_FragColor = vec4(mix(uBgColor, activeColor, patternAlpha), 1.0);
        }
      }
    \`;

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        tDiffuse: { value: renderTarget.texture },
        uResolution: { value: new THREE.Vector2(width, height) },
        uScale: { value: ${settings.halftone.scale} },
        uPower: { value: ${settings.halftone.power} },
        uWidth: { value: ${settings.halftone.width} },
        uToneTarget: { value: ${toneTargetCode} },
        uPatternWeights: { value: new THREE.Vector4(
          ${settings.halftone.shape === 'dots' ? '1.0' : '0.0'},
          ${settings.halftone.shape === 'squares' ? '1.0' : '0.0'},
          ${settings.halftone.shape === 'lines' ? '1.0' : '0.0'},
          ${settings.halftone.shape === 'crosshatch' ? '1.0' : '0.0'}
        ) },
        uPatternColor: { value: new THREE.Color(EXPORT_PATTERN_COLOR) },
        uTransparent: { value: ${settings.background.transparent ? 'true' : 'false'} },
        uBgColor: { value: new THREE.Color('${settings.background.color}') },
        uContrast: { value: ${settings.halftone.imageContrast} },
        uGridAngle: { value: ${(settings.halftone.gridAngle * Math.PI) / 180} },
        uUseImageColors: { value: ${useImgColors} },
        uShadowOpacity: { value: ${settings.lighting.shadowOpacity} },
        uTime: { value: 0.0 },
        uWaveAmplitude: { value: ${settings.halftone.waveAmplitude ?? 0.0} },
        uWaveFrequency: { value: ${settings.halftone.waveFrequency ?? 2.5} }
      }
    });

    // Fragment Shader Logic
    function getFragmentShader() {
       return \`
        #define GLSL
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        // ... (etc, this is getting complicated)
       \`;
    }

    const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial);
    postScene.add(postQuad);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Maintain Orbit controls inertia rotation
      controls.update();

      // Trigger user configured parameters dynamically
      if (${isAutoRotate}) {
        if ("${settings.sourceMode}" === 'shape') {
          meshGroup.rotation.y = elapsedTime * ${settings.animation.rotateSpeed || 0.45};
          meshGroup.rotation.x = elapsedTime * ${(settings.animation.rotateSpeed || 0.45) * 0.5};
        } else {
          meshGroup.rotation.y = Math.sin(elapsedTime * ${(settings.animation.autoSpeed || 0.5) * 1.25}) * 0.24;
          meshGroup.rotation.x = 0.12 + Math.cos(elapsedTime * ${(settings.animation.autoSpeed || 0.5) * 0.6}) * 0.08;
        }
      }

      // Breathing
      if (${settings.animation.breatheEnabled}) {
        const osc = 1.0 + Math.sin(elapsedTime * ${(settings.animation.breatheSpeed || 0.4) * 3}) * ${settings.animation.breatheAmount || 0.1};
        meshGroup.scale.set(osc, osc, osc);
      } else {
        meshGroup.scale.set(1, 1, 1);
      }

      // Floating
      if (${settings.animation.floatEnabled}) {
        meshGroup.position.y = Math.sin(elapsedTime * ${(settings.animation.floatSpeed || 0.45) * 2.5}) * ${settings.animation.floatAmplitude || 0.15};
        const driftAngleRad = ${(settings.animation.driftAmount ?? 8) * Math.PI / 180};
        meshGroup.position.x = Math.sin(elapsedTime * ${(settings.animation.floatSpeed || 0.45) * 1.25}) * Math.sin(driftAngleRad) * 0.8;
      } else {
        meshGroup.position.y = 0;
        meshGroup.position.x = 0;
      }

      // Wave sways
      if (${settings.animation.waveEnabled}) {
        meshGroup.children.forEach((child, idx) => {
          child.position.y = Math.sin(elapsedTime * ${settings.animation.waveSpeed || 0.5} * 4.0 + idx * 0.8) * ${settings.animation.waveAmount || 0.15} * 0.12;
          child.rotation.z = Math.cos(elapsedTime * ${settings.animation.waveSpeed || 0.5} * 3.0 + idx * 0.6) * ${settings.animation.waveAmount || 0.15} * 0.04;
        });
      }

      // Wobble
      if (${settings.animation.autoWobble > 0}) {
        meshGroup.rotation.z = Math.sin(elapsedTime) * ${settings.animation.autoWobble * 0.15};
      }

      // Lighting sweep animation
      if (dirLight && ${settings.animation.lightSweepEnabled}) {
        const sweepSpeed = ${settings.animation.lightSweepSpeed ?? 0.5};
        const sweepRange = ${settings.animation.lightSweepRange ?? 28};
        const sweepHeightRange = ${settings.animation.lightSweepHeightRange ?? 0.5};
        const dynamicAngleRad = ((${settings.lighting.angleDegrees} + Math.sin(elapsedTime * sweepSpeed * 3.0) * sweepRange) * Math.PI) / 180;
        const dynamicHeight = ${settings.lighting.height} + Math.cos(elapsedTime * sweepSpeed * 2.0) * sweepHeightRange;
        dirLight.position.set(
          Math.cos(dynamicAngleRad) * 4.0,
          dynamicHeight,
          Math.sin(dynamicAngleRad) * 4.0
        );
      }

      shaderMaterial.uniforms.uTime.value = elapsedTime;

      // Pass 1: Render original object to intermediate renderTarget
      renderer.setRenderTarget(renderTarget);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(scene, camera);

      // Pass 2: Render shaderMaterial halftone pattern to on-screen Canvas
      renderer.setRenderTarget(null);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(postScene, postCamera);
    };
    animate();

    // Responsiveness handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || 640;
      const h = containerRef.current.clientHeight || 480;
      renderer.setSize(w, h);
      renderTarget.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      shaderMaterial.uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      renderTarget.dispose();
      shaderMaterial.dispose();
      controls.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '400px', background: ${settings.background.transparent ? "'transparent'" : `'${settings.background.color}'`} }} />
  );
}`;
  };

  const getTailwindCode = () => {
    return `<div class="relative w-full h-[400px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-zinc-850">
  <!-- Halftone Pattern Overlay -->
  <div class="absolute inset-0 opacity-80 pointer-events-none mix-blend-screen"
       style="background-image: radial-gradient(circle, ${settings.halftone.dashColor} ${settings.halftone.width * 22}%, transparent ${settings.halftone.width * 22}%);
              background-size: ${settings.halftone.scale}px ${settings.halftone.scale}px;">
  </div>
  
  <!-- Interactive Visual Display -->
  <div class="z-10 flex flex-col items-center gap-3 animate-pulse">
    <span class="text-zinc-100 font-extrabold uppercase tracking-widest text-4xl"
          style="font-family: '${settings.fontFamily}', sans-serif; color: ${settings.material.color};">
      ${settings.sourceMode === 'text' ? settings.textString : settings.sourceMode.toUpperCase()}
    </span>
    <span class="font-mono text-[9px] text-[#4A38F5] tracking-widest uppercase bg-[#4A38F5]/10 px-2 py-1 rounded">
      HALFTONE GRID SCALE: ${settings.halftone.scale}px
    </span>
  </div>
</div>`;
  };

  const getHtmlCode = () => {
    const toneTargetCode = settings.halftone.toneTarget === 'light' ? 0 : 1;
    const isTransparent = settings.background.transparent ? 'true' : 'false';
    const isAutoRotate = settings.animation.autoRotateEnabled ? 'true' : 'false';
    const useImgColors = settings.halftone.useImageColors ? 'true' : 'false';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mosaic Halftone 3D Specimen</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: ${settings.background.transparent ? 'transparent' : settings.background.color}; font-family: sans-serif; }
    #canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  <script>
    // --- STYLING CONFIGURATION ---
    // Customize these constants easily to integrate with any website design!
    const CONFIG_BACKGROUND_TRANSPARENT = ${isTransparent}; // Set to true to make background transparent (for layering on other websites)
    const CONFIG_BACKGROUND_COLOR = "${settings.background.color}"; // Used if CONFIG_BACKGROUND_TRANSPARENT is false
    const CONFIG_PATTERN_COLOR = "${settings.halftone.dashColor}"; // Color of halftone dot grids
    const CONFIG_HALFTONE_ENABLED = ${settings.halftone.enabled ? 1 : 0};

    const container = document.getElementById('canvas-container');
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene setup for 3D active objects
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, ${settings.distance});

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);

    // Orbit controls support for responsive click-and-drag 3D interaction!
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Disabled so page scrolling doesn't zoom into the 3D canvas
    controls.enablePan = false;  // Disabled to prevent right-click dragging from shifting the 3D model off-canvas

    // Render target for offscreen pass (pre-halftone scene capture)
    const renderTarget = new THREE.WebGLRenderTarget(width * (window.devicePixelRatio || 1), height * (window.devicePixelRatio || 1), {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });

    // Mesh group to hold elements for synchronized coordinates sways & scales
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);

    // 2. Geometries & Materials Configuration
    let geometry;
    const shape = "${settings.shapeKey}";
    const sourceMode = "${settings.sourceMode}";

    if (sourceMode === 'text') {
      // Procedural canvas text generator to render custom vector fonts
      const canvasText = document.createElement('canvas');
      canvasText.width = 512;
      canvasText.height = 256;
      const ctxText = canvasText.getContext('2d');
      if (ctxText) {
        ctxText.clearRect(0, 0, 512, 256);
        ctxText.fillStyle = '#ffffff';
        ctxText.textAlign = 'center';
        ctxText.textBaseline = 'middle';
        ctxText.font = 'bold 84px sans-serif';
        ctxText.fillText("${settings.textString.replace(/"/g, '\\"')}", 256, 128);
      }
      const textTexture = new THREE.CanvasTexture(canvasText);
      textTexture.colorSpace = THREE.SRGBColorSpace;

      geometry = new THREE.PlaneGeometry(3.2, 1.6);
      const textMaterial = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const textMesh = new THREE.Mesh(geometry, textMaterial);
      meshGroup.add(textMesh);
    } else if (sourceMode === 'image') {
      // Procedural loading of custom uploaded images with a stunning radial gradient fallback
      const imgTextureLoader = new THREE.TextureLoader();
      const base64Img = "${settings.imageSrc ? settings.imageSrc : ''}";
      let finalTex;

      if (base64Img) {
        finalTex = imgTextureLoader.load(base64Img, () => {
          // Force render refresh once the base64 image async-loads fully!
          renderer.render(scene, camera);
        });
      } else {
        const canvasPlaceholder = document.createElement('canvas');
        canvasPlaceholder.width = 512;
        canvasPlaceholder.height = 512;
        const ctxP = canvasPlaceholder.getContext('2d');
        if (ctxP) {
          ctxP.clearRect(0, 0, 512, 512);
          const grad = ctxP.createRadialGradient(256, 256, 50, 256, 256, 240);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, '#bbbbbb');
          grad.addColorStop(0.6, '#555555');
          grad.addColorStop(1, '#000000');
          ctxP.fillStyle = grad;
          ctxP.beginPath();
          ctxP.arc(256, 256, 220, 0, Math.PI * 2);
          ctxP.fill();
        }
        finalTex = new THREE.CanvasTexture(canvasPlaceholder);
      }

      geometry = new THREE.PlaneGeometry(2.6, 2.6);
      const imgMaterial = new THREE.MeshBasicMaterial({
        map: finalTex,
        transparent: true,
        side: THREE.DoubleSide
      });
      const imgMesh = new THREE.Mesh(geometry, imgMaterial);
      meshGroup.add(imgMesh);
    } else {
      // Main Physical material matching current configurations
      const materialParams = {
        color: new THREE.Color('${settings.material.color}'),
        roughness: ${settings.material.roughness},
        metalness: ${settings.material.metalness}
      };

      if ("${settings.material.surface}" === 'glass') {
        Object.assign(materialParams, {
          transmission: 0.65,
          ior: ${settings.material.refraction},
          thickness: ${settings.material.thickness / 100.0},
          clearcoat: 1.0,
          clearcoatRoughness: 0.05
        });
      } else {
        Object.assign(materialParams, {
          clearcoat: 0.5,
          clearcoatRoughness: 0.1
        });
      }

      const activeMaterial = new THREE.MeshPhysicalMaterial(materialParams);
      const detailMaterial = activeMaterial.clone();
      let activeMesh;

      if (shape === 'sphere') {
        activeMesh = new THREE.Mesh(new THREE.SphereGeometry(1.3, 64, 64), activeMaterial);
      } else if (shape === 'star') {
        const starShape = new THREE.Shape();
        const outerRadius = 1.4;
        const innerRadius = 0.6;
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerRadius : innerRadius;
          const a = (i / 10) * Math.PI * 2;
          if (i === 0) starShape.moveTo(Math.sin(a) * r, Math.cos(a) * r);
          else starShape.lineTo(Math.sin(a) * r, Math.cos(a) * r);
        }
        starShape.closePath();
        const geom = new THREE.ExtrudeGeometry(starShape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 });
        geom.center();
        activeMesh = new THREE.Mesh(geom, activeMaterial);
      } else if (shape === 'heart') {
        const heartShape = new THREE.Shape();
        const x = 0, y = 0;
        heartShape.moveTo( x + .25, y + .25 );
        heartShape.bezierCurveTo( x + .25, y + .25, x + .20, y, x, y );
        heartShape.bezierCurveTo( x - .30, y, x - .30, y + .35,x - .30,y + .35 );
        heartShape.bezierCurveTo( x - .30, y + .55, x - .10, y + .77, x + .25, y + .95 );
        heartShape.bezierCurveTo( x + .60, y + .77, x + .80, y + .55, x + .80, y + .35 );
        heartShape.bezierCurveTo( x + .80, y + .35, x + .80, y, x + .50, y );
        heartShape.bezierCurveTo( x + .35, y, x + .25, y + .25, x + .25, y + .25 );
        const geom = new THREE.ExtrudeGeometry(heartShape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 });
        geom.scale(2.2, -2.2, 2.2);
        geom.center();
        activeMesh = new THREE.Mesh(geom, activeMaterial);
      } else if (shape === 'capsule') {
        activeMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 1.2, 32, 64), activeMaterial);
      } else if (shape === 'ring') {
        activeMesh = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.15, 32, 100), activeMaterial);
      } else if (shape === 'diamond') {
        const geom = new THREE.OctahedronGeometry(1.4, 0);
        geom.scale(1, 1.4, 1);
        activeMesh = new THREE.Mesh(geom, activeMaterial);
      } else if (shape === 'gem') {
        const geom = new THREE.DodecahedronGeometry(1.4, 0);
        geom.scale(1, 1.3, 1);
        activeMesh = new THREE.Mesh(geom, activeMaterial);
      } else if (shape === 'box' || shape === 'cube') {
        activeMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), activeMaterial);
      } else if (shape === 'torus') {
        activeMesh = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.35, 32, 120), activeMaterial);
      } else if (shape === 'icosahedron') {
        activeMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 0), activeMaterial);
      } else if (shape === 'cylinder') {
        activeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.8, 32), activeMaterial);
      } else if (shape === 'cone') {
        activeMesh = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 32), activeMaterial);
      } else if (shape === 'octahedron') {
        activeMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), activeMaterial);
      } else if (shape === 'dodecahedron') {
        activeMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 0), activeMaterial);
      } else if (shape === 'tetrahedron') {
        activeMesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1.5, 0), activeMaterial);
      } else if (shape === 'sunCoin' || shape === 'sun_coin') {
        const group = new THREE.Group();
        const coinMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.18, 64), activeMaterial);
        coinMesh.rotation.x = Math.PI / 2;
        group.add(coinMesh);

        const rimGeom = new THREE.TorusGeometry(1.1, 0.08, 16, 100);
        const rimMesh = new THREE.Mesh(rimGeom, detailMaterial);
        rimMesh.position.z = 0.1;
        group.add(rimMesh);

        const rimMeshBack = new THREE.Mesh(rimGeom, detailMaterial);
        rimMeshBack.position.z = -0.1;
        group.add(rimMeshBack);

        const sunCoreMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32), detailMaterial);
        sunCoreMesh.rotation.x = Math.PI / 2;
        sunCoreMesh.position.z = 0.1;
        group.add(sunCoreMesh);

        const numRays = 10;
        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI * 2;
          const rayGeom = new THREE.ConeGeometry(0.08, 0.45, 4);
          const rayMesh = new THREE.Mesh(rayGeom, detailMaterial);
          rayMesh.rotation.z = angle - Math.PI / 2;
          rayMesh.position.set(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, 0.1);
          group.add(rayMesh);

          const backRayMesh = new THREE.Mesh(rayGeom, detailMaterial);
          backRayMesh.rotation.z = angle - Math.PI / 2;
          backRayMesh.position.set(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, -0.1);
          group.add(backRayMesh);
        }
        activeMesh = group;
      } else if (shape === 'lotusCoin' || shape === 'lotus_coin') {
        const group = new THREE.Group();
        const coinMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.18, 64), activeMaterial);
        coinMesh.rotation.x = Math.PI / 2;
        group.add(coinMesh);

        const rimGeom = new THREE.TorusGeometry(1.1, 0.08, 16, 100);
        const rimMesh = new THREE.Mesh(rimGeom, detailMaterial);
        rimMesh.position.z = 0.1;
        group.add(rimMesh);

        const rimMeshBack = new THREE.Mesh(rimGeom, detailMaterial);
        rimMeshBack.position.z = -0.1;
        group.add(rimMeshBack);

        const numPetals = 8;
        for (let i = 0; i < numPetals; i++) {
          const angle = (i / numPetals) * Math.PI * 2;
          const petalGeom = new THREE.SphereGeometry(0.24, 16, 16);

          const petalMesh = new THREE.Mesh(petalGeom, detailMaterial);
          petalMesh.scale.set(0.65, 1.3, 0.15);
          petalMesh.rotation.z = angle;
          petalMesh.rotation.x = 0.15 * Math.sin(angle);
          petalMesh.rotation.y = -0.15 * Math.cos(angle);
          petalMesh.position.set(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, 0.1);
          group.add(petalMesh);

          const petalMeshBack = new THREE.Mesh(petalGeom, detailMaterial);
          petalMeshBack.scale.set(0.65, 1.3, 0.15);
          petalMeshBack.rotation.z = angle;
          petalMeshBack.rotation.x = -0.15 * Math.sin(angle);
          petalMeshBack.rotation.y = 0.15 * Math.cos(angle);
          petalMeshBack.position.set(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, -0.1);
          group.add(petalMeshBack);
        }

        const centerGeom = new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const centerMesh = new THREE.Mesh(centerGeom, detailMaterial);
        centerMesh.rotation.x = Math.PI / 2;
        centerMesh.position.z = 0.15;
        group.add(centerMesh);
        activeMesh = group;
      } else if (shape === 'arrowTarget' || shape === 'arrow_target') {
        const group = new THREE.Group();
        const baseBoard = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.15, 64), activeMaterial);
        baseBoard.rotation.x = Math.PI / 2;
        group.add(baseBoard);

        const rings = [0.95, 0.65, 0.35];
        rings.forEach((radius, sIdx) => {
          const ringGeom = new THREE.TorusGeometry(radius, 0.05, 12, 64);
          const rMesh = new THREE.Mesh(ringGeom, detailMaterial);
          rMesh.position.z = 0.08 + sIdx * 0.01;
          group.add(rMesh);

          const rMeshBack = new THREE.Mesh(ringGeom, detailMaterial);
          rMeshBack.position.z = -0.08 - sIdx * 0.01;
          group.add(rMeshBack);
        });

        const bulletMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), detailMaterial);
        bulletMesh.scale.set(1.0, 1.0, 0.5);
        bulletMesh.position.z = 0.08;
        group.add(bulletMesh);

        const shaftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 1.2, 8), detailMaterial);
        shaftMesh.rotation.x = -Math.PI / 4;
        shaftMesh.rotation.y = Math.PI / 6;
        shaftMesh.position.set(-0.35, 0.35, 0.5);
        group.add(shaftMesh);

        const headMesh = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.15, 6), detailMaterial);
        headMesh.rotation.x = -Math.PI / 4 + Math.PI;
        headMesh.rotation.y = Math.PI / 6;
        headMesh.position.set(0, 0, 0.1);
        group.add(headMesh);

        for (let f = 0; f < 3; f++) {
          const fAngle = (f / 3) * Math.PI * 2;
          const fMesh = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.08, 0.18), detailMaterial);
          fMesh.position.set(-0.7 + Math.cos(fAngle) * 0.05, 0.7 + Math.sin(fAngle) * 0.05, 0.9);
          fMesh.rotation.x = -Math.PI / 4;
          fMesh.rotation.y = Math.PI / 6;
          fMesh.rotation.z = fAngle;
          group.add(fMesh);
        }
        activeMesh = group;
      } else if (shape === 'dollarCoin' || shape === 'dollar_coin') {
        const group = new THREE.Group();
        const coinMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.18, 64), activeMaterial);
        coinMesh.rotation.x = Math.PI / 2;
        group.add(coinMesh);

        const rimGeom = new THREE.TorusGeometry(1.1, 0.08, 16, 100);
        const rimMesh = new THREE.Mesh(rimGeom, detailMaterial);
        rimMesh.position.z = 0.1;
        group.add(rimMesh);

        const rimMeshBack = new THREE.Mesh(rimGeom, detailMaterial);
        rimMeshBack.position.z = -0.1;
        group.add(rimMeshBack);

        const createDollarLogo = (isFront: boolean) => {
          const zOff = isFront ? 0.11 : -0.11;
          const logoGroup = new THREE.Group();

          const barMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.2, 16), detailMaterial);
          barMesh.position.set(0, 0, zOff);
          logoGroup.add(barMesh);

          const topLoop = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.052, 16, 32, Math.PI * 1.5 + 0.1), detailMaterial);
          topLoop.position.set(-0.06, 0.25, zOff);
          topLoop.rotation.z = -Math.PI / 4;
          logoGroup.add(topLoop);

          const bottomLoop = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.052, 16, 32, Math.PI * 1.5 + 0.1), detailMaterial);
          bottomLoop.position.set(0.06, -0.25, zOff);
          bottomLoop.rotation.z = Math.PI * 0.75;
          logoGroup.add(bottomLoop);

          return logoGroup;
        };

        group.add(createDollarLogo(true));
        group.add(createDollarLogo(false));
        activeMesh = group;
      } else {
        activeMesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.85, 0.28, 150, 16), activeMaterial);
      }

      meshGroup.add(activeMesh);
    }

    // Interactive lighting models
    const dirLight = new THREE.DirectionalLight('#ffffff', ${settings.lighting.intensity * 2});
    dirLight.position.set(5, ${settings.lighting.height}, 5);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight('#ffffff', ${settings.lighting.ambientIntensity});
    scene.add(ambientLight);

    // 3. Post-processing Halftone Shaders pipeline
    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const vertexShader = \`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    \`;

    const fragmentShader = \`
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform vec2 uResolution;
      uniform float uScale;
      uniform float uPower;
      uniform float uWidth;
      uniform int uToneTarget;
      uniform vec4 uPatternWeights;
      uniform vec3 uPatternColor;
      uniform bool uTransparent;
      uniform vec3 uBgColor;
      uniform float uContrast;
      uniform float uGridAngle;
      uniform bool uUseImageColors;
      uniform float uShadowOpacity;
      uniform float uTime;
      uniform float uWaveAmplitude;
      uniform float uWaveFrequency;
      uniform float uHalftoneEnabled;

      void main() {
        vec4 sceneColor = texture2D(tDiffuse, vUv);
        
        if (uHalftoneEnabled < 0.5) {
          if (uTransparent && sceneColor.a < 0.05) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          } else {
            gl_FragColor = sceneColor;
          }
          return;
        }

        float mask = sceneColor.a;
        if (mask < 0.05) {
          if (uTransparent) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          } else {
            gl_FragColor = vec4(uBgColor, 1.0);
          }
          return;
        }

        float luminance = dot(sceneColor.rgb, vec3(0.299, 0.587, 0.114));
        luminance = clamp((luminance - 0.5) * uContrast + 0.5, 0.0, 1.0);
        
        float val = (uToneTarget == 0) ? luminance : (1.0 - luminance);

        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 gridUv = vUv - 0.5;
        gridUv.x *= aspect.x;

        float s = sin(uGridAngle);
        float c = cos(uGridAngle);
        gridUv = vec2(gridUv.x * c - gridUv.y * s, gridUv.x * s + gridUv.y * c);
        gridUv *= uScale;

        if (uWaveAmplitude > 0.0) {
          float swayX = sin(gridUv.y * 0.5 + uTime * uWaveFrequency) * uWaveAmplitude;
          float swayY = cos(gridUv.x * 0.5 + uTime * uWaveFrequency) * uWaveAmplitude;
          gridUv += vec2(swayX, swayY);
        }

        vec2 localUv = fract(gridUv) - 0.5;
        float distDot = length(localUv);
        float distSquare = max(abs(localUv.x), abs(localUv.y));
        float distLine = abs(localUv.y);
        float distCross = min(abs(localUv.x), abs(localUv.y));

        float distValue = distDot * uPatternWeights.x +
                          distSquare * uPatternWeights.y +
                          distLine * uPatternWeights.z +
                          distCross * uPatternWeights.w;

        float thresholdRadius = val * uWidth;
        float fuzz = max(0.005, uPower);

        float patternAlpha = 1.0 - smoothstep(thresholdRadius - fuzz, thresholdRadius + fuzz, distValue);
        patternAlpha = clamp(patternAlpha * mask, 0.0, 1.0);

        vec3 activeColor = uPatternColor;
        
        if (uUseImageColors) {
          activeColor = sceneColor.rgb;
        } else {
          float sceneLuma = dot(sceneColor.rgb, vec3(0.299, 0.587, 0.114));
          float minIntensity = mix(1.0, 0.25, uShadowOpacity);
          float maxIntensity = mix(1.0, 1.45, uShadowOpacity);
          float lightingIntensity = mix(minIntensity, maxIntensity, sceneLuma);
          activeColor = clamp(activeColor * lightingIntensity, 0.0, 1.0);
          
          vec3 specularGlint = clamp((sceneColor.rgb - vec3(0.48)) * 2.8, 0.0, 1.0);
          activeColor = mix(activeColor, vec3(1.0), specularGlint * 0.95);
        }

        if (uTransparent) {
          gl_FragColor = vec4(activeColor * patternAlpha, patternAlpha);
        } else {
          gl_FragColor = vec4(mix(uBgColor, activeColor, patternAlpha), 1.0);
        }
      }
    \`;

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        tDiffuse: { value: renderTarget.texture },
        uResolution: { value: new THREE.Vector2(width, height) },
        uScale: { value: ${settings.halftone.scale} },
        uPower: { value: ${settings.halftone.power} },
        uWidth: { value: ${settings.halftone.width} },
        uToneTarget: { value: ${toneTargetCode} },
        uPatternWeights: { value: new THREE.Vector4(
          ${settings.halftone.shape === 'dots' ? '1.0' : '0.0'},
          ${settings.halftone.shape === 'squares' ? '1.0' : '0.0'},
          ${settings.halftone.shape === 'lines' ? '1.0' : '0.0'},
          ${settings.halftone.shape === 'crosshatch' ? '1.0' : '0.0'}
        ) },
        uPatternColor: { value: new THREE.Color(CONFIG_PATTERN_COLOR) },
        uTransparent: { value: CONFIG_BACKGROUND_TRANSPARENT },
        uBgColor: { value: new THREE.Color(CONFIG_BACKGROUND_COLOR) },
        uContrast: { value: ${settings.halftone.imageContrast} },
        uGridAngle: { value: ${(settings.halftone.gridAngle * Math.PI) / 180} },
        uUseImageColors: { value: ${useImgColors} },
        uShadowOpacity: { value: ${settings.lighting.shadowOpacity} },
        uTime: { value: 0.0 },
        uWaveAmplitude: { value: ${settings.halftone.waveAmplitude ?? 0.0} },
        uWaveFrequency: { value: ${settings.halftone.waveFrequency ?? 2.5} },
        uHalftoneEnabled: { value: CONFIG_HALFTONE_ENABLED }
      }
    });

    const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial);
    postScene.add(postQuad);

    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Maintain Orbit controls inertia rotation
      controls.update();

      // Trigger user configured parameters dynamically
      if (${isAutoRotate}) {
        if ("${settings.sourceMode}" === 'shape') {
          meshGroup.rotation.y = elapsedTime * ${settings.animation.rotateSpeed || 0.45};
          meshGroup.rotation.x = elapsedTime * ${(settings.animation.rotateSpeed || 0.45) * 0.5};
        } else {
          meshGroup.rotation.y = Math.sin(elapsedTime * ${(settings.animation.autoSpeed || 0.5) * 1.25}) * 0.24;
          meshGroup.rotation.x = 0.12 + Math.cos(elapsedTime * ${(settings.animation.autoSpeed || 0.5) * 0.6}) * 0.08;
        }
      }

      // Breathing
      if (${settings.animation.breatheEnabled}) {
        const osc = 1.0 + Math.sin(elapsedTime * ${(settings.animation.breatheSpeed || 0.4) * 3}) * ${settings.animation.breatheAmount || 0.1};
        meshGroup.scale.set(osc, osc, osc);
      } else {
        meshGroup.scale.set(1, 1, 1);
      }

      // Floating
      if (${settings.animation.floatEnabled}) {
        meshGroup.position.y = Math.sin(elapsedTime * ${(settings.animation.floatSpeed || 0.45) * 2.5}) * ${settings.animation.floatAmplitude || 0.15};
        const driftAngleRad = ${(settings.animation.driftAmount ?? 8) * Math.PI / 180};
        meshGroup.position.x = Math.sin(elapsedTime * ${(settings.animation.floatSpeed || 0.45) * 1.25}) * Math.sin(driftAngleRad) * 0.8;
      } else {
        meshGroup.position.y = 0;
        meshGroup.position.x = 0;
      }

      // Wave sways
      if (${settings.animation.waveEnabled}) {
        meshGroup.children.forEach((child, idx) => {
          child.position.y = Math.sin(elapsedTime * ${settings.animation.waveSpeed || 0.5} * 4.0 + idx * 0.8) * ${settings.animation.waveAmount || 0.15} * 0.12;
          child.rotation.z = Math.cos(elapsedTime * ${settings.animation.waveSpeed || 0.5} * 3.0 + idx * 0.6) * ${settings.animation.waveAmount || 0.15} * 0.04;
        });
      }

      // Wobble
      if (${settings.animation.autoWobble > 0}) {
        meshGroup.rotation.z = Math.sin(elapsedTime) * ${settings.animation.autoWobble * 0.15};
      }

      // Lighting sweep animation
      if (dirLight && ${settings.animation.lightSweepEnabled}) {
        const sweepSpeed = ${settings.animation.lightSweepSpeed ?? 0.5};
        const sweepRange = ${settings.animation.lightSweepRange ?? 28};
        const sweepHeightRange = ${settings.animation.lightSweepHeightRange ?? 0.5};
        const dynamicAngleRad = ((${settings.lighting.angleDegrees} + Math.sin(elapsedTime * sweepSpeed * 3.0) * sweepRange) * Math.PI) / 180;
        const dynamicHeight = ${settings.lighting.height} + Math.cos(elapsedTime * sweepSpeed * 2.0) * sweepHeightRange;
        dirLight.position.set(
          Math.cos(dynamicAngleRad) * 4.0,
          dynamicHeight,
          Math.sin(dynamicAngleRad) * 4.0
        );
      }

      shaderMaterial.uniforms.uTime.value = elapsedTime;

      // Pass 1: Render original object to intermediate renderTarget
      renderer.setRenderTarget(renderTarget);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(scene, camera);

      // Pass 2: Render shaderMaterial halftone pattern to on-screen Canvas
      renderer.setRenderTarget(null);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(postScene, postCamera);
    }
    animate();

    // Responsiveness handler
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      renderTarget.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      shaderMaterial.uniforms.uResolution.value.set(w, h);
    });
  </script>
</body>
</html>`;
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadHtmlFile = () => {
    const htmlCode = getHtmlCode();
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `twenty-halftone-animated-${settings.sourceMode}-${Date.now()}.html`;
    link.href = url;
    link.click();
  };

  // Collapsible accordion panels states for Design tab
  const [openSection, setOpenSection] = useState<string>('source');

  const toggleSection = (sectionName: string) => {
    setOpenSection((prev) => (prev === sectionName ? '' : sectionName));
    if (sectionName === 'source') {
      updateNestedSetting('halftone', 'shape', 'none');
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onChange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedSetting = <
    K extends 'lighting' | 'material' | 'halftone' | 'background' | 'animation' | 'bloom',
    NK extends keyof AppSettings[K]
  >(
    section: K,
    subKey: NK,
    value: AppSettings[K][NK]
  ) => {
    onChange((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subKey]: value,
      },
    }));
  };

  // Image Upload handler for local assets
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          updateSetting('imageSrc', loadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Video Upload handler for local assets
  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          updateSetting('videoSrc', loadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Curated Preset Gradients for rapid user interactions
  const PRESET_GRADIENTS = [
    { name: 'Pure Radial', data: null },
    { name: 'Linear Split', data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23fff" /><stop offset="100%" stop-color="%23000" /></linearGradient></defs><rect width="512" height="512" fill="url(%23g)" /></svg>' },
    { name: 'Geometric Spiral', data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="%23fff"/><circle cx="256" cy="256" r="200" fill="none" stroke="%23000" stroke-width="40"/><circle cx="256" cy="256" r="120" fill="none" stroke="%23000" stroke-width="30"/><circle cx="256" cy="256" r="50" fill="%23000"/></svg>' },
    { name: 'Grid Matrix', data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="%23ffffff"/><rect x="50" y="50" width="150" height="150" fill="%23000000"/><rect x="312" y="50" width="150" height="150" fill="%23555555"/><rect x="50" y="312" width="150" height="150" fill="%23999999"/><circle cx="387" cy="387" r="80" fill="%23000000"/></svg>' },
  ];

  // custom styling helper for active tabs
  const getTabClass = (tab: 'design' | 'animations' | 'export') => {
    return activeTab === tab
      ? 'bg-zinc-800 text-zinc-100 font-bold shadow-md shadow-black/40'
      : 'text-zinc-500 hover:text-zinc-300 font-semibold';
  };

  return (
    <div id="control-sidebar" className="w-full flex flex-col bg-[#0c0c0e] border-t lg:border-t-0 lg:border-l border-zinc-850 overflow-y-auto overflow-x-hidden min-h-0 h-full custom-scrollbar pb-10 shrink-0">
      
      {/* Dynamic Tab bar switcher matching screenshot */}
      <div className="px-5 pt-4 pb-3 border-b border-zinc-900 flex flex-col gap-3">
        <div className="grid grid-cols-3 p-1 bg-zinc-950 rounded-lg border border-zinc-850">
          <button
            onClick={() => setActiveTab('design')}
            className={`py-1.5 text-[10px] tracking-widest rounded-md transition-all uppercase font-sans ${getTabClass('design')}`}
          >
            Design
          </button>
          <button
            onClick={() => setActiveTab('animations')}
            className={`py-1.5 text-[10px] tracking-widest rounded-md transition-all uppercase font-sans ${getTabClass('animations')}`}
          >
            Animations
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-1.5 text-[10px] tracking-widest rounded-md transition-all uppercase font-sans ${getTabClass('export')}`}
          >
            Export
          </button>
        </div>
      </div>

      {/* RENDER DYNAMIC INNER TABS */}
      {activeTab === 'design' && (
        <div className="flex flex-col animate-fade-in" id="design-tab-panel">
          
          {/* SECTION 0: AI DESIGN CO-PILOT */}
          <div className="border-b border-zinc-900 bg-indigo-950/10" id="sect-ai-copilot">
            <button
              onClick={() => toggleSection('ai-copilot')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#07070a] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={13} className="text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest font-mono text-indigo-300 uppercase">0. AI DESIGN CO-PILOT</span>
              </div>
              {openSection === 'ai-copilot' ? <ChevronUp size={11} className="text-zinc-500" /> : <ChevronDown size={11} className="text-zinc-500" />}
            </button>

            {openSection === 'ai-copilot' && (
              <div className="px-5 pb-5 pt-1 flex flex-col gap-4">
                {/* AI Prompter */}
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] font-bold font-mono tracking-widest text-zinc-500 uppercase">Describe Your Dream Design</span>
                  <div className="relative">
                    <textarea
                      placeholder="e.g., Warm solar eclipse with thin lines, Emerald digital retro matrix, Glass coin in neon sunset..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-200 focus:outline-none focus:border-indigo-600 font-sans text-xs rounded-lg transition-colors placeholder:text-zinc-600 resize-none"
                    />
                  </div>

                  {aiError && (
                    <div className="text-[10px] font-mono text-rose-500 bg-rose-950/20 px-2 py-1 rounded border border-rose-950/50">
                      {aiError}
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      if (!aiPrompt.trim()) return;
                      setIsAiGenerating(true);
                      setAiError(null);
                      try {
                        const res = await fetch('/api/gemini/generate-design', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ prompt: aiPrompt }),
                        });
                        const data = await res.json();
                        if (res.ok && data.settings) {
                          onChange((prev) => {
                            const newSettings = { ...prev, ...data.settings };
                            if (data.settings.lighting) newSettings.lighting = { ...prev.lighting, ...data.settings.lighting };
                            if (data.settings.material) newSettings.material = { ...prev.material, ...data.settings.material };
                            if (data.settings.halftone) newSettings.halftone = { ...prev.halftone, ...data.settings.halftone };
                            if (data.settings.background) newSettings.background = { ...prev.background, ...data.settings.background };
                            if (data.settings.animation) {
                              newSettings.animation = { ...prev.animation, ...data.settings.animation };
                            } else {
                              newSettings.animation = { ...prev.animation };
                            }
                            return newSettings;
                          });
                          setAiPrompt('');
                        } else {
                          setAiError(data.error || 'Failed to generate design');
                        }
                      } catch (err: any) {
                        setAiError(err.message || 'An error occurred while generating the design.');
                      } finally {
                        setIsAiGenerating(false);
                      }
                    }}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-850 disabled:text-zinc-500 text-white rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
                  >
                    {isAiGenerating ? (
                      <>
                        <RefreshCw size={11} className="animate-spin text-white" />
                        AI GENERATING PRESET...
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} />
                        GENERATE INSTANTLY WITH AI
                      </>
                    )}
                  </button>
                </div>

                {/* AI Concept Inspirations with Auto Suggestions */}
                <div className="flex flex-col gap-2.5 p-3 rounded-lg border border-indigo-950/40 bg-indigo-950/5 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold font-mono tracking-widest text-[#818cf8] uppercase">AI Concept Inspirations</span>
                    <span className="text-[8px] font-bold font-mono text-zinc-550">GEMINI CO-PILOT</span>
                  </div>

                  <button
                    type="button"
                    onClick={rotateSuggestions}
                    disabled={isSuggestionsLoading}
                    className="w-full py-2 px-3 bg-indigo-950/40 hover:bg-indigo-900/40 active:scale-98 border border-indigo-800/30 text-indigo-200 rounded-lg font-sans text-[11px] font-semibold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:border-indigo-600/40"
                    title="ক্লিক করে ৫টি সম্পূর্ণ নতুন জেনারেটিভ আইডিয়া তৈরি করুন"
                  >
                    {isSuggestionsLoading ? (
                      <>
                        <RefreshCw size={11} className="animate-spin text-indigo-400" />
                        <span>আইডিয়া তৈরি হচ্ছে... (Fetching from Gemini)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} className="text-indigo-400 animate-pulse" />
                        <span>🪄 Auto-Suggest 5 New Dynamic Concepts</span>
                      </>
                    )}
                  </button>

                  <div className="flex flex-wrap gap-1.5 min-h-[34px] relative">
                    {isSuggestionsLoading ? (
                      // Beautiful dynamic skeleton loaders during dynamic Gemini API call!
                      Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={`loading-shimmer-${i}`}
                          className="h-[28px] flex-1 min-w-[75px] rounded-lg bg-zinc-950 border border-zinc-900/50 animate-pulse flex items-center justify-center gap-1"
                        >
                          <div className="h-2 w-2 rounded-full bg-indigo-500/30 animate-ping"></div>
                          <div className="h-1.5 w-10 bg-zinc-900 rounded"></div>
                        </div>
                      ))
                    ) : (
                      suggestions.map((concept, index) => (
                        <button
                          key={`${concept.name}-${index}`}
                          type="button"
                          onClick={() => {
                            setAiPrompt(concept.prompt);
                            setAiError(null);
                          }}
                          className="text-[9px] px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-indigo-500/60 hover:bg-indigo-900/20 text-zinc-300 transition-all cursor-pointer flex items-center gap-1 font-sans font-medium hover:scale-102 hover:text-white"
                          title={concept.prompt}
                        >
                          {concept.name}
                        </button>
                      ))
                    )}
                  </div>
                  
                  {!isSuggestionsLoading && (
                    <p className="text-[8px] text-zinc-500 text-center font-mono italic">
                      💡 Click any concept button above to populate the AI prompt area instantenously.
                    </p>
                  )}
                </div>

                {/* Import / Export System Codes (Support pasted user base64 codes!) */}
                <div className="mt-2 pt-3 border-t border-zinc-900/60 flex flex-col gap-2">
                  <span className="text-[8px] font-bold font-mono tracking-widest text-zinc-500 uppercase">IMPORT / EXPORT SETTINGS CODE</span>
                  
                  <div className="flex gap-1.5">
                    <input
                      placeholder="Paste Base64 settings code here..."
                      value={importCode}
                      onChange={(e) => {
                        setImportCode(e.target.value);
                        setImportError(null);
                      }}
                      className="flex-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-850 text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono text-[9px] rounded"
                    />
                    <button
                      onClick={() => {
                        if (!importCode.trim()) return;
                        try {
                          const cleanB64 = importCode.trim().replace(/^#/, '');
                          
                          // Ensure base64 padding
                          let paddedB64 = cleanB64;
                          while (paddedB64.length % 4 !== 0) {
                            paddedB64 += '=';
                          }

                          let decodedString = '';
                          try {
                            decodedString = decodeURIComponent(escape(atob(paddedB64)));
                          } catch (e1) {
                            // Secondary fallback decoder if binary or raw characters exist
                            decodedString = atob(paddedB64);
                          }
                          
                          let parsed: any = null;
                          try {
                            parsed = JSON.parse(decodedString);
                          } catch (e2) {
                            // Resilient JSON parser for truncated strings
                            let jsonStr = decodedString.trim();
                            for (let i = jsonStr.length; i > 0; i--) {
                              const sub = jsonStr.substring(0, i);
                              const subOpenBraces = (sub.match(/\{/g) || []).length;
                              const subClosedBraces = (sub.match(/\}/g) || []).length;
                              const subOpenBrackets = (sub.match(/\[/g) || []).length;
                              const subClosedBrackets = (sub.match(/\]/g) || []).length;
                              
                              let closing = '';
                              for (let b = 0; b < (subOpenBraces - subClosedBraces); b++) closing += '}';
                              for (let b = 0; b < (subOpenBrackets - subClosedBrackets); b++) closing += ']';
                              
                              try {
                                parsed = JSON.parse(sub + closing);
                                if (parsed && parsed.settings) break;
                              } catch (err) {}
                              
                              try {
                                parsed = JSON.parse(sub + '"' + closing);
                                if (parsed && parsed.settings) break;
                              } catch (err) {}
                              
                              try {
                                parsed = JSON.parse(sub + '0' + closing);
                                if (parsed && parsed.settings) break;
                              } catch (err) {}
                            }
                          }

                          if (parsed && parsed.settings) {
                            // Merge imported settings with initial settings inside a clean updater
                            onChange((prev) => {
                              const newSettings = { ...prev, ...parsed.settings };
                              // Deep merge nesting if needed
                              if (parsed.settings.lighting) newSettings.lighting = { ...prev.lighting, ...parsed.settings.lighting };
                              if (parsed.settings.material) newSettings.material = { ...prev.material, ...parsed.settings.material };
                              if (parsed.settings.halftone) newSettings.halftone = { ...prev.halftone, ...parsed.settings.halftone };
                              if (parsed.settings.background) newSettings.background = { ...prev.background, ...parsed.settings.background };
                              if (parsed.settings.animation) newSettings.animation = { ...prev.animation, ...parsed.settings.animation };
                              return newSettings;
                            });
                            setImportCode('');
                            setImportError('Import successful!');
                            setTimeout(() => setImportError(null), 3000);
                          } else {
                            throw new Error('Invalid settings format.');
                          }
                        } catch (err) {
                          setImportError('Could not decode settings code. Ensure it is copied correctly.');
                        }
                      }}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors"
                    >
                      Import
                    </button>
                  </div>

                  {importError && (
                    <span className="text-[9px] text-zinc-400 font-mono">{importError}</span>
                  )}

                  <button
                    onClick={() => {
                      try {
                        const payload = JSON.stringify({ settings });
                        const base64 = btoa(unescape(encodeURIComponent(payload)));
                        navigator.clipboard.writeText(base64);
                        setImportCode(base64);
                        setImportError('Current configuration copied to clipboard!');
                        setTimeout(() => setImportError(null), 3000);
                      } catch (err) {
                        setImportError('Failed to export current configuration.');
                      }
                    }}
                    className="w-full py-1.5 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-300 border border-zinc-850 border-dashed rounded text-[9px] font-mono tracking-wider uppercase transition-all text-center cursor-pointer"
                  >
                    Export Current Config as Base64 Code
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION: BLOOM */}
          <div className="border-b border-zinc-900" id="sect-bloom">
            <button
              onClick={() => toggleSection('bloom')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-950/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={13} className="text-zinc-400" />
                <span className="text-[10px] font-bold tracking-widest font-mono text-zinc-300 uppercase">BLOOM SETTINGS</span>
              </div>
              {openSection === 'bloom' ? <ChevronUp size={11} className="text-zinc-500" /> : <ChevronDown size={11} className="text-zinc-500" />}
            </button>
            {openSection === 'bloom' && (
              <div className="px-5 pb-5 pt-1 flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center justify-between py-2 bg-zinc-950 px-3 rounded-lg border border-zinc-900">
                  <span className="text-[8px] font-bold font-mono tracking-widest text-zinc-500 uppercase">Enable Bloom</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.bloom.enabled}
                      onChange={(e) => updateNestedSetting('bloom', 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-zinc-805/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                {settings.bloom.enabled && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-400 font-bold uppercase tracking-wider">INTENSITY</span>
                      <span className="text-zinc-300 font-bold">{settings.bloom.bloomIntensity.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.05}
                      value={settings.bloom.bloomIntensity}
                      onChange={(e) => updateNestedSetting('bloom', 'bloomIntensity', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 1: INPUT SOURCE */}
          <div className="border-b border-zinc-900" id="sect-source">
            <button
              onClick={() => toggleSection('source')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-950/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Layout size={13} className="text-zinc-400" />
                <span className="text-[10px] font-bold tracking-widest font-mono text-zinc-300 uppercase">1. INPUT SOURCE</span>
              </div>
              {openSection === 'source' ? <ChevronUp size={11} className="text-zinc-500" /> : <ChevronDown size={11} className="text-zinc-500" />}
            </button>

            {openSection === 'source' && (
              <div className="px-5 pb-5 pt-1 flex flex-col gap-4">
                {/* Rendering Quality & View Mode Toggle to bypass halftime dots */}
                <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-900/60 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Rendering View Mode</span>
                    <span className="text-[8px] px-1.5 py-0.5 bg-indigo-950/40 text-indigo-400 font-mono rounded font-bold uppercase tracking-wider border border-indigo-900/40">
                      {settings.halftone.enabled ? "Halftone Grid" : "Original Smooth"}
                    </span>
                  </div>
                  <p className="text-[7.5px] text-zinc-550 -mt-1 leading-normal">
                    Toggle to bypass the dot pattern and see your original, 100% smooth SVG vector / PNG image.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        updateNestedSetting('halftone', 'enabled', false);
                      }}
                      className={`py-1.5 px-2 rounded text-center transition-all cursor-pointer border text-[8.5px] font-mono font-bold uppercase ${
                        !settings.halftone.enabled
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow'
                          : 'bg-zinc-900 border-zinc-805 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Original (Smooth)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateNestedSetting('halftone', 'enabled', true);
                      }}
                      className={`py-1.5 px-2 rounded text-center transition-all cursor-pointer border text-[8.5px] font-mono font-bold uppercase ${
                        settings.halftone.enabled
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow'
                          : 'bg-zinc-900 border-zinc-805 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Dotted (Halftone)
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 tracking-wider font-semibold uppercase">Source</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={settings.sourceMode === 'shape' ? settings.shapeKey : settings.sourceMode}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'image') {
                          updateSetting('sourceMode', 'image');
                          if (!settings.imageSrc && PRESET_GRADIENTS[0]) {
                            updateSetting('imageSrc', PRESET_GRADIENTS[0].data);
                          }
                        } else if (val === 'video') {
                          updateSetting('sourceMode', 'video');
                        } else if (val === 'text') {
                          updateSetting('sourceMode', 'text');
                        } else {
                          updateSetting('sourceMode', 'shape');
                          updateSetting('shapeKey', val);
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-850 hover:border-zinc-750 text-zinc-200 focus:outline-none focus:border-zinc-600 font-sans text-xs rounded-md transition-colors cursor-pointer animate-fade-in"
                    >
                      <optgroup label="3D Shapes">
                        <option value="torusKnot">Torus Knot</option>
                        <option value="sphere">Sphere</option>
                        <option value="torus">Torus</option>
                        <option value="cross">Cross</option>
                        <option value="arrow">Arrow</option>
                        <option value="icosahedron">Icosahedron</option>
                        <option value="box">Box (Cube)</option>
                        <option value="cone">Cone</option>
                        <option value="cylinder">Cylinder</option>
                        <option value="octahedron">Octahedron</option>
                        <option value="dodecahedron">Dodecahedron</option>
                        <option value="tetrahedron">Tetrahedron</option>
                        <option value="sunCoin">Sun Coin</option>
                        <option value="lotusCoin">Lotus Coin</option>
                        <option value="arrowTarget">Arrow Target</option>
                        <option value="dollarCoin">Dollar Coin</option>
                        <option value="faceted-sphere">Faceted Sphere</option>
                        <option value="bubble-sphere">Bubble Sphere</option>
                        <option value="exploding-cube">Exploding Cube</option>
                        <option value="sliced-sphere">Sliced Sphere</option>
                        <option value="particle-cloud">Particle Cloud</option>
                        <option value="wavy-sphere">Wavy Sphere</option>
                        <option value="layered-sphere">Layered Sphere</option>
                        <option value="molecular-sphere">Molecular Sphere</option>
                        <option value="3d-jack">3D Jack</option>
                        <option value="wooden-puzzle">Wooden Puzzle</option>
                        <option value="city-blocks">City Blocks</option>
                        <option value="puffy-cube">Puffy Cube</option>
                        <option value="gears">Gears</option>
                        <option value="crater-moon">Crater Moon</option>
                        <option value="hollow-dodeca">Hollow Dodeca</option>
                        <option value="grooved-cube">Grooved Cube</option>
                      </optgroup>
                      <optgroup label="Other Core Modes">
                        <option value="text">Interactive Text</option>
                        <option value="image">Uploaded Image</option>
                      </optgroup>
                    </select>

                    <div className="flex gap-2">
                    {/* Quick Upload Indicator Trigger (Image) */}
                    <div className="relative group p-2.5 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900/60 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-md cursor-pointer transition-all aspect-square flex items-center justify-center h-[36px] w-[36px]" title="Upload logo or graphic">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFile}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload size={14} />
                    </div>
                    </div>
                  </div>
                </div>




                {/* Modifiers for Parametric Design */}
                {settings.sourceMode === 'shape' && (
                  <div className="flex flex-col gap-3 mt-1.5 p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-900/40">
                    <div className="flex items-center justify-between text-[8px] text-zinc-500 tracking-wider font-mono font-bold uppercase select-none">
                      <span>Shape Modifiers (Premium)</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-sans font-medium">Twist Deform</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.twistAmount.toFixed(1)}</span>
                        </div>
                        <input type="range" min={0} max={10.0} step={0.1} value={settings.shapeModifiers.twistAmount}
                          onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, twistAmount: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-sans font-medium">Inflate / Puff (Soft Body)</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.inflateAmount.toFixed(2)}</span>
                        </div>
                        <input type="range" min={-1.0} max={2.0} step={0.05} value={settings.shapeModifiers.inflateAmount}
                          onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, inflateAmount: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-sans font-medium">Mesh Detail (Subdivision)</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.detailLevel.toFixed(0)}</span>
                        </div>
                        <input type="range" min={1} max={10} step={1} value={settings.shapeModifiers.detailLevel}
                          onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, detailLevel: parseInt(e.target.value, 10) })}
                          className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-sans font-medium">Ripple Displacement</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.rippleAmount.toFixed(2)}</span>
                        </div>
                        <input type="range" min={0} max={2.0} step={0.05} value={settings.shapeModifiers.rippleAmount}
                          onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, rippleAmount: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-sans font-medium">Ripple Frequency</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.rippleFrequency.toFixed(1)}</span>
                        </div>
                        <input type="range" min={0.5} max={10.0} step={0.1} value={settings.shapeModifiers.rippleFrequency}
                          onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, rippleFrequency: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-sans font-medium">Bevel / Roundness</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.bevelSize.toFixed(2)}</span>
                        </div>
                        <input type="range" min={0.01} max={0.5} step={0.01} value={settings.shapeModifiers.bevelSize}
                          onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, bevelSize: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-sans font-medium">Inner Core Solid</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.innerCoreSize.toFixed(2)}</span>
                        </div>
                        <input type="range" min={0.0} max={1.5} step={0.01} value={settings.shapeModifiers.innerCoreSize}
                          onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, innerCoreSize: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-sans font-medium">Wireframe Shell</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.wireframeOpacity.toFixed(2)}</span>
                        </div>
                        <input type="range" min={0.0} max={1.0} step={0.01} value={settings.shapeModifiers.wireframeOpacity}
                          onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, wireframeOpacity: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-sans font-medium">Lattice Nodes (Atoms)</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.vertexNodes.toFixed(2)}</span>
                        </div>
                        <input type="range" min={0.0} max={0.2} step={0.01} value={settings.shapeModifiers.vertexNodes}
                          onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, vertexNodes: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-sans font-medium">Surface Noise (Crater/Rock)</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.noiseAmount.toFixed(2)}</span>
                        </div>
                        <input type="range" min={0.0} max={1.5} step={0.01} value={settings.shapeModifiers.noiseAmount}
                          onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, noiseAmount: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-sans font-medium">Noise Scale</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.noiseScale.toFixed(1)}</span>
                        </div>
                        <input type="range" min={0.5} max={10.0} step={0.1} value={settings.shapeModifiers.noiseScale}
                          onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, noiseScale: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-sans font-medium">Spikes / Extrusion</span>
                          <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.spikeAmount.toFixed(2)}</span>
                        </div>
                        <input type="range" min={-0.5} max={1.5} step={0.01} value={settings.shapeModifiers.spikeAmount}
                          onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, spikeAmount: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
                         <div className="flex items-center justify-between text-[11px]">
                           <span className="text-rose-500 font-sans font-extrabold uppercase tracking-tighter">Geometric Explosion</span>
                           <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.shapeModifiers.fragmentationAmount.toFixed(2)}</span>
                         </div>
                         <input type="range" min={0.0} max={10.0} step={0.05} value={settings.shapeModifiers.fragmentationAmount}
                           onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, fragmentationAmount: parseFloat(e.target.value) })}
                           className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer hover:bg-zinc-700 transition-[#bg] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-500"
                         />
                      </div>

                      <div className="flex flex-col gap-2.5 p-3.5 mt-2 bg-indigo-950/10 border border-indigo-900/30 rounded-xl relative overflow-hidden group">
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-linear-to-r from-transparent via-indigo-500/20 to-transparent"></div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles size={11} className="text-indigo-400" />
                            <span className="text-[10px] font-mono text-zinc-300 font-black uppercase tracking-widest">Particle Field</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={settings.shapeModifiers.particlesEnabled}
                              onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, particlesEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600 shadow-sm border border-zinc-700/50"></div>
                          </label>
                        </div>
                        {settings.shapeModifiers.particlesEnabled && (
                          <div className="flex flex-col gap-2.5 pt-1 animate-fade-in">
                            <div className="flex items-center justify-between text-[9px] font-mono">
                              <span className="text-zinc-500 font-bold uppercase tracking-wider">COUNT (NODES)</span>
                              <span className="text-zinc-300 font-bold">{settings.shapeModifiers.particlesCount}</span>
                            </div>
                            <input type="range" min={50} max={3000} step={50} value={settings.shapeModifiers.particlesCount}
                              onChange={(e) => updateSetting('shapeModifiers', { ...settings.shapeModifiers, particlesCount: parseInt(e.target.value, 10) })}
                              className="w-full h-1 bg-zinc-805 rounded-full appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode conditional options or general image overlay options */}
                {(settings.sourceMode === 'image' || settings.imageSrc) && (
                  <div className="flex flex-col gap-3 pt-1 border-t border-zinc-900">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] text-zinc-500 tracking-widest font-mono uppercase font-bold">
                          {settings.sourceMode === 'image' ? 'Contrast Maps' : 'Smart Overlay Image'}
                        </label>
                        {settings.imageSrc && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-indigo-950/40 text-indigo-400 font-mono rounded font-bold uppercase tracking-wider border border-indigo-900/40 animate-pulse">
                            Active 3D Smart Overlay
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PRESET_GRADIENTS.map((p) => (
                          <button
                            key={p.name}
                            onClick={() => updateSetting('imageSrc', p.data)}
                            className={`p-2 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider border transition-all ${
                              settings.imageSrc === p.data
                                ? 'bg-zinc-900 border-zinc-650 text-white'
                                : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-900/30'
                            }`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Toggle to Use Image Colors */}
                    <div className="flex items-center justify-between py-2 bg-zinc-950 px-3 rounded-lg border border-zinc-900 mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold font-mono tracking-widest text-zinc-400 uppercase">Apply Original Colors</span>
                        <span className="text-[7.5px] text-zinc-600 font-medium tracking-tight">Render grid dots using logo colors</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={settings.halftone.useImageColors}
                          onChange={(e) => updateNestedSetting('halftone', 'useImageColors', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-zinc-805/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                )}

                {settings.sourceMode === 'text' && (
                  <div className="flex flex-col gap-3.5 pt-1 border-t border-zinc-900">
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] text-zinc-400 font-sans font-semibold">Interactive Text Value</label>
                      <input
                        type="text"
                        value={settings.textString}
                        maxLength={14}
                        onChange={(e) => updateSetting('textString', e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-md text-xs text-zinc-100 font-sans tracking-wide focus:outline-none focus:border-zinc-600 transition-all font-semibold"
                        placeholder="TWENTY"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] text-zinc-400 font-sans font-semibold">Font Family</label>
                      <select
                        value={settings.fontFamily}
                        onChange={(e) => updateSetting('fontFamily', e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-850 rounded-md text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-sans tracking-wide font-medium"
                      >
                        <option value="Inter">Inter (Swiss Sans)</option>
                        <option value="Space Grotesk">Space Grotesk (Tech Head)</option>
                        <option value="Outfit">Outfit (Clean Sans)</option>
                        <option value="Fira Code">Fira Code (Geometric Mono)</option>
                        <option value="Playfair Display">Playfair Display (Serif)</option>
                      </select>
                    </div>

                    {/* Toggle to make typography bold */}
                    <div className="flex items-center justify-between py-2 bg-zinc-950 px-3 rounded-lg border border-zinc-900">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold font-mono tracking-widest text-zinc-400 uppercase">Bold Typography</span>
                        <span className="text-[7.5px] text-zinc-600 font-medium tracking-tight font-sans">Apply heavy font weight</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={settings.fontBold}
                          onChange={(e) => updateSetting('fontBold', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-zinc-805/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600 animate-fade-in"></div>
                      </label>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-500 font-bold uppercase tracking-widest">FONT SIZE</span>
                        <span className="text-zinc-300 font-bold">{settings.fontSize}PX</span>
                      </div>
                      <input
                        type="range"
                        min={24}
                        max={84}
                        step={1}
                        value={settings.fontSize}
                        onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION: VISUALIZATION */}
          <div className="border-b border-zinc-900" id="sect-visualization">
            <button
              onClick={() => toggleSection('visualization')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-950/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal size={13} className="text-zinc-400" />
                <span className="text-[10px] font-bold tracking-widest font-mono text-zinc-300 uppercase">2. VISUALIZATION</span>
              </div>
              {openSection === 'visualization' ? <ChevronUp size={11} className="text-zinc-500" /> : <ChevronDown size={11} className="text-zinc-500" />}
            </button>

            {openSection === 'visualization' && (
              <div className="px-5 pb-5 pt-1 flex flex-col gap-4 animate-fade-in">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider">CAMERA DISTANCE</span>
                    <span className="text-zinc-300 font-bold">{settings.distance.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={1.5}
                    max={10.0}
                    step={0.1}
                    value={settings.distance}
                    onChange={(e) => updateSetting('distance', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: HALFTONE DETAILS */}
          <div className="border-b border-zinc-900" id="sect-halftone">
            <button
              onClick={() => toggleSection('halftone')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-950/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Eye size={13} className="text-zinc-400" />
                <span className="text-[10px] font-bold tracking-widest font-mono text-zinc-300 uppercase">3. HALFTONE GRID</span>
              </div>
              {openSection === 'halftone' ? <ChevronUp size={11} className="text-zinc-500" /> : <ChevronDown size={11} className="text-zinc-500" />}
            </button>

            {openSection === 'halftone' && (
              <div className="px-5 pb-5 pt-1 flex flex-col gap-4">
                {/* Enable logic Toggle */}
                <div className="flex items-center justify-between py-2 bg-zinc-950 px-3 rounded-lg border border-zinc-900">
                  <span className="text-[8px] font-bold font-mono tracking-widest text-zinc-500 uppercase">Enable Pattern Grid</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.halftone.enabled}
                      onChange={(e) => updateNestedSetting('halftone', 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-zinc-805/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {settings.halftone.enabled && (
                  <>
                    {/* Shapes Selector */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[8px] text-zinc-500 tracking-widest font-mono uppercase font-bold">Element Shape</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { key: 'dots', label: 'Dots (Circle)' },
                          { key: 'squares', label: 'Squares' },
                          { key: 'lines', label: 'Lines (Aesthetic)' },
                          { key: 'crosshatch', label: 'Crosshatch' },
                          { key: 'none', label: 'None (Off)' },
                        ].map((shape) => (
                          <button
                            key={shape.key}
                            onClick={() => updateNestedSetting('halftone', 'shape', shape.key as any)}
                            className={`py-1.5 px-3 text-left rounded-md border text-[10px] font-medium tracking-wide transition-all ${
                              settings.halftone.shape === shape.key
                                ? 'bg-zinc-900 border-zinc-500 text-white font-semibold'
                                : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }`}
                          >
                            {shape.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scale density slider */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-500 font-bold uppercase tracking-widest">GRID DENSITY</span>
                        <span className="text-zinc-300 font-bold">{settings.halftone.scale.toFixed(0)}</span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={85}
                        step={1}
                        value={settings.halftone.scale}
                        onChange={(e) => {
                          const rawVal = Number(e.target.value);
                          const commonSnaps = [20, 30, 40, 50, 60, 70, 80];
                          let finalVal = rawVal;
                          for (const snap of commonSnaps) {
                            if (Math.abs(rawVal - snap) <= 2) {
                              finalVal = snap;
                              break;
                            }
                          }
                          updateNestedSetting('halftone', 'scale', finalVal);
                        }}
                        className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                      />
                    </div>

                    {/* Width slider */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-500 font-bold uppercase tracking-widest">DOT SIZING (WIDTH)</span>
                        <span className="text-zinc-300 font-bold">{settings.halftone.width.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={0.15}
                        max={1.4}
                        step={0.01}
                        value={settings.halftone.width}
                        onChange={(e) => updateNestedSetting('halftone', 'width', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                      />
                    </div>

                    {/* Grid angle */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-500 font-bold uppercase tracking-widest">GRID ANGLE</span>
                        <span className="text-zinc-300 font-bold">{(settings.halftone.gridAngle ?? 45).toFixed(0)}°</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={180}
                        step={1}
                        value={settings.halftone.gridAngle ?? 45}
                        onChange={(e) => updateNestedSetting('halftone', 'gridAngle', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                      />
                    </div>

                    {/* Contrast/Fuzziness edge */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-500 font-bold uppercase tracking-widest">EDGE CONTRAST (FUZZ)</span>
                        <span className="text-zinc-300 font-bold">{settings.halftone.power.toFixed(3)}</span>
                      </div>
                      <input
                        type="range"
                        min={0.005}
                        max={0.20}
                        step={0.005}
                        value={settings.halftone.power}
                        onChange={(e) => updateNestedSetting('halftone', 'power', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                      />
                    </div>

                    {/* Contrast slider */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-500 font-bold uppercase tracking-widest">SOURCE CONTRAST</span>
                        <span className="text-zinc-300 font-bold">{(settings.halftone.imageContrast ?? 1.0).toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.3}
                        max={2.5}
                        step={0.05}
                        value={settings.halftone.imageContrast ?? 1.0}
                        onChange={(e) => updateNestedSetting('halftone', 'imageContrast', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                      />
                    </div>

                    {/* Liquid Sway (Amplitude) */}
                    <div className="flex flex-col gap-1.5 p-2 bg-indigo-950/10 border border-indigo-900/20 rounded-lg">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                          LIQUID SWAY
                        </span>
                        <span className="text-indigo-300 font-bold">{(settings.halftone.waveAmplitude ?? 0.0).toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={0.0}
                        max={1.5}
                        step={0.05}
                        value={settings.halftone.waveAmplitude ?? 0.0}
                        onChange={(e) => updateNestedSetting('halftone', 'waveAmplitude', Number(e.target.value))}
                        className="w-full h-1 bg-indigo-900/40 rounded appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Sway Frequency (Frequency) */}
                    <div className="flex flex-col gap-1.5 p-2 bg-indigo-950/10 border border-indigo-900/20 rounded-lg">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          SWAY SPEED (FREQ)
                        </span>
                        <span className="text-indigo-300 font-bold">{(settings.halftone.waveFrequency ?? 2.5).toFixed(1)}Hz</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={10.0}
                        step={0.1}
                        value={settings.halftone.waveFrequency ?? 2.5}
                        onChange={(e) => updateNestedSetting('halftone', 'waveFrequency', Number(e.target.value))}
                        className="w-full h-1 bg-indigo-900/40 rounded appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Dark/Light Tones */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[8px] text-zinc-500 tracking-widest font-mono uppercase font-bold">LIGHT vs SHADOW TONING</label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 border border-zinc-900 rounded-lg">
                        <button
                          onClick={() => updateNestedSetting('halftone', 'toneTarget', 'light')}
                          className={`py-1 text-center font-mono text-[9px] font-bold tracking-widest rounded transition-all uppercase ${
                            settings.halftone.toneTarget === 'light'
                              ? 'bg-zinc-900 text-zinc-100'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Highlight-Tone
                        </button>
                        <button
                          onClick={() => updateNestedSetting('halftone', 'toneTarget', 'dark')}
                          className={`py-1 text-center font-mono text-[9px] font-bold tracking-widest rounded transition-all uppercase ${
                            settings.halftone.toneTarget === 'dark'
                              ? 'bg-zinc-900 text-zinc-100'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Shadow-Tone
                        </button>
                      </div>
                    </div>

                    {/* Colors custom pickers */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] text-zinc-500 tracking-widest font-mono uppercase font-bold">Primary Grid</label>
                        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 p-1.5 rounded-md">
                          <input
                            type="color"
                            value={settings.halftone.dashColor}
                            onChange={(e) => updateNestedSetting('halftone', 'dashColor', e.target.value)}
                            className="w-5 h-5 rounded border border-zinc-700 bg-transparent cursor-pointer"
                          />
                          <span className="text-[9px] font-mono text-zinc-400 font-bold">{settings.halftone.dashColor.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] text-zinc-500 tracking-widest font-mono uppercase font-bold">Hover Accent</label>
                        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 p-1.5 rounded-md">
                          <input
                            type="color"
                            value={settings.halftone.hoverDashColor}
                            onChange={(e) => updateNestedSetting('halftone', 'hoverDashColor', e.target.value)}
                            className="w-5 h-5 rounded border border-zinc-700 bg-transparent cursor-pointer"
                          />
                          <span className="text-[9px] font-mono text-zinc-400 font-bold">{settings.halftone.hoverDashColor.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: STUDIO LIGHTING */}
          <div className="border-b border-zinc-900" id="sect-lighting">
            <button
              onClick={() => toggleSection('lighting')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-950/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Lightbulb size={13} className="text-zinc-400" />
                <span className="text-[10px] font-bold tracking-widest font-mono text-zinc-300 uppercase">4. STUDIO LIGHTING</span>
              </div>
              {openSection === 'lighting' ? <ChevronUp size={11} className="text-zinc-500" /> : <ChevronDown size={11} className="text-zinc-500" />}
            </button>

            {openSection === 'lighting' && (
              <div className="px-5 pb-5 pt-1 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">PRIMARY LIGHT INTENSITY</span>
                    <span className="text-zinc-300 font-bold">{settings.lighting.intensity.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2.5}
                    step={0.1}
                    value={settings.lighting.intensity}
                    onChange={(e) => updateNestedSetting('lighting', 'intensity', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">SECONDARY FILL FIELD</span>
                    <span className="text-zinc-300 font-bold">{settings.lighting.fillIntensity.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={1.8}
                    step={0.05}
                    value={settings.lighting.fillIntensity}
                    onChange={(e) => updateNestedSetting('lighting', 'fillIntensity', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">AMBIENT CONSTANT</span>
                    <span className="text-zinc-300 font-bold">{settings.lighting.ambientIntensity.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={0.8}
                    step={0.02}
                    value={settings.lighting.ambientIntensity}
                    onChange={(e) => updateNestedSetting('lighting', 'ambientIntensity', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">LIGHT ORBIT ANGLE</span>
                    <span className="text-zinc-300 font-bold">{settings.lighting.angleDegrees}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={5}
                    value={settings.lighting.angleDegrees}
                    onChange={(e) => updateNestedSetting('lighting', 'angleDegrees', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">SPOT HEIGHT</span>
                    <span className="text-zinc-300 font-bold">{settings.lighting.height.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={8.0}
                    step={0.1}
                    value={settings.lighting.height}
                    onChange={(e) => updateNestedSetting('lighting', 'height', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">SHADOW OPACITY</span>
                    <span className="text-zinc-300 font-bold">{(settings.lighting.shadowOpacity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={1.0}
                    step={0.01}
                    value={settings.lighting.shadowOpacity}
                    onChange={(e) => updateNestedSetting('lighting', 'shadowOpacity', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">SHADOW BLUR / SOFTNESS</span>
                    <span className="text-zinc-300 font-bold">{settings.lighting.shadowBlur.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={10.0}
                    step={0.1}
                    value={settings.lighting.shadowBlur}
                    onChange={(e) => updateNestedSetting('lighting', 'shadowBlur', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: SURFACE MATERIAL */}
          {settings.sourceMode !== 'image' && (
            <div className="border-b border-zinc-900" id="sect-material">
              <button
                onClick={() => toggleSection('material')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-950/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Paintbrush size={13} className="text-zinc-400" />
                  <span className="text-[10px] font-bold tracking-widest font-mono text-zinc-300 uppercase">5. SURFACE SHADING</span>
                </div>
                {openSection === 'material' ? <ChevronUp size={11} className="text-zinc-500" /> : <ChevronDown size={11} className="text-zinc-500" />}
              </button>

              {openSection === 'material' && (
                <div className="px-5 pb-5 pt-1 flex flex-col gap-4 animate-fade-in">
                  <div className="grid grid-cols-3 p-1 bg-zinc-950 border border-zinc-900 rounded-lg">
                    <button
                      onClick={() => updateNestedSetting('material', 'surface', 'solid')}
                      className={`py-1 text-center font-mono text-[9px] font-bold tracking-widest rounded transition-all uppercase ${
                        settings.material.surface === 'solid'
                          ? 'bg-zinc-900 text-zinc-100 font-bold shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Solid
                    </button>
                    <button
                      onClick={() => updateNestedSetting('material', 'surface', 'glass')}
                      className={`py-1 text-center font-mono text-[9px] font-bold tracking-widest rounded transition-all uppercase ${
                        settings.material.surface === 'glass'
                          ? 'bg-zinc-900 text-zinc-100 font-bold shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Glass
                    </button>
                    <button
                      onClick={() => updateNestedSetting('material', 'surface', 'wireframe')}
                      className={`py-1 text-center font-mono text-[9px] font-bold tracking-widest rounded transition-all uppercase ${
                        settings.material.surface === 'wireframe'
                          ? 'bg-zinc-900 text-zinc-100 font-bold shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Wireframe
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] text-zinc-500 tracking-widest font-mono uppercase font-bold">Material Color</label>
                    <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 p-1.5 rounded-md">
                      <input
                        type="color"
                        value={settings.material.color}
                        onChange={(e) => updateNestedSetting('material', 'color', e.target.value)}
                        className="w-5 h-5 rounded border border-zinc-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-zinc-400 font-bold">{settings.material.color.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest">SURFACE ROUGHNESS</span>
                      <span className="text-zinc-300 font-bold">{settings.material.roughness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={1.0}
                      step={0.05}
                      value={settings.material.roughness}
                      onChange={(e) => updateNestedSetting('material', 'roughness', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest">METALLIC REFLECTIVITY</span>
                      <span className="text-zinc-300 font-bold">{settings.material.metalness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={1.0}
                      step={0.05}
                      value={settings.material.metalness}
                      onChange={(e) => updateNestedSetting('material', 'metalness', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                    />
                  </div>

                  {settings.material.surface === 'glass' && (
                    <>
                      <div className="flex flex-col gap-1.5 border-t border-zinc-900 pt-3">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-500 font-bold uppercase tracking-widest">GLASS THICKNESS</span>
                          <span className="text-zinc-300 font-bold">{settings.material.thickness}</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={100}
                          step={1}
                          value={settings.material.thickness}
                          onChange={(e) => updateNestedSetting('material', 'thickness', Number(e.target.value))}
                          className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-500 font-bold uppercase tracking-widest">IOR REFRACTION</span>
                          <span className="text-zinc-300 font-bold">{settings.material.refraction.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={1.0}
                          max={3.0}
                          step={0.05}
                          value={settings.material.refraction}
                          onChange={(e) => updateNestedSetting('material', 'refraction', Number(e.target.value))}
                          className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest">ENV MAP INTENSITY</span>
                      <span className="text-zinc-300 font-bold">{settings.material.environmentPower.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={10.0}
                      step={0.5}
                      value={settings.material.environmentPower}
                      onChange={(e) => updateNestedSetting('material', 'environmentPower', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5 pt-3 border-t border-zinc-900">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles size={11} className="text-indigo-400" />
                      <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase font-mono">Shadow-Tone Engine</span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-500 font-bold uppercase tracking-widest">TONE INTENSITY</span>
                        <span className="text-zinc-300 font-bold">{settings.halftone.shadowToneIntensity.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={3.0}
                        step={0.05}
                        value={settings.halftone.shadowToneIntensity}
                        onChange={(e) => updateNestedSetting('halftone', 'shadowToneIntensity', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-500 font-bold uppercase tracking-widest">TONE SOFTNESS / BLUR</span>
                        <span className="text-zinc-300 font-bold">{(settings.halftone.shadowToneBlur * 100).toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.0}
                        max={0.2}
                        step={0.001}
                        value={settings.halftone.shadowToneBlur}
                        onChange={(e) => updateNestedSetting('halftone', 'shadowToneBlur', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                        updateNestedSetting('material', 'roughness', INITIAL_SETTINGS.material.roughness);
                        updateNestedSetting('material', 'metalness', INITIAL_SETTINGS.material.metalness);
                        updateNestedSetting('material', 'environmentPower', INITIAL_SETTINGS.material.environmentPower);
                        updateNestedSetting('material', 'surface', INITIAL_SETTINGS.material.surface);
                        updateNestedSetting('material', 'color', INITIAL_SETTINGS.material.color);
                        updateNestedSetting('material', 'thickness', INITIAL_SETTINGS.material.thickness);
                        updateNestedSetting('material', 'refraction', INITIAL_SETTINGS.material.refraction);
                    }}
                    className="mt-2 py-1.5 text-center font-mono text-[9px] font-bold tracking-widest rounded border border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all uppercase flex items-center justify-center gap-2"
                  >
                    <span>🔄 Reset Material</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: CANVAS BACKDROP */}
          <div className="border-b border-zinc-900" id="sect-background">
            <button
              onClick={() => toggleSection('background')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-950/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={13} className="text-zinc-400" />
                <span className="text-[10px] font-bold tracking-widest font-mono text-zinc-300 uppercase">6. CANVAS BACKDROP</span>
              </div>
              {openSection === 'background' ? <ChevronUp size={11} className="text-zinc-500" /> : <ChevronDown size={11} className="text-zinc-500" />}
            </button>

            {openSection === 'background' && (
              <div className="px-5 pb-5 pt-1 flex flex-col gap-4">
                <div className="flex items-center justify-between py-2 bg-zinc-950 px-3 rounded-lg border border-zinc-900">
                  <span className="text-[8px] font-bold font-mono tracking-widest text-zinc-500 uppercase">Transparent Backdrop</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.background.transparent}
                      onChange={(e) => updateNestedSetting('background', 'transparent', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-zinc-805/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {!settings.background.transparent && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] text-zinc-500 tracking-widest font-mono uppercase font-bold">SOLID BACKGROUND COLOR</label>
                    <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-905 p-1.5 rounded-md">
                      <input
                        type="color"
                        value={settings.background.color}
                        onChange={(e) => updateNestedSetting('background', 'color', e.target.value)}
                        className="w-5 h-5 rounded border border-zinc-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-zinc-450 font-bold">{settings.background.color.toUpperCase()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* RENDER DYNAMIC ANIMATIONS SECTION MATCHING SCREENSHOT */}
      {activeTab === 'animations' && (
        <div className="px-5 py-4 flex flex-col gap-6 animate-fade-in font-sans" id="animations-tab-panel">
          
          {/* SECTION: ROTATION */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase font-mono">
              ROTATION
            </h3>
            
            {/* Idle auto-rotate */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-250">Idle auto-rotate</span>
                  <button title="Continuous rotation when pointer is idle" className="text-zinc-550 hover:text-zinc-300">
                    <Info size={11} className="text-zinc-500" />
                  </button>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.animation.autoRotateEnabled}
                    onChange={(e) => updateNestedSetting('animation', 'autoRotateEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {settings.animation.autoRotateEnabled && (
                <div className="pl-3 border-l border-zinc-850 flex flex-col gap-3 animate-fade-in">
                  {/* Idle auto-rotate speed */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 font-sans font-medium">Speed</span>
                      <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.autoSpeed.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.01}
                      max={1.2}
                      step={0.01}
                      value={settings.animation.autoSpeed}
                      onChange={(e) => updateNestedSetting('animation', 'autoSpeed', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                    />
                  </div>

                  {/* Idle auto-rotate wobble */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 font-sans font-medium">Wobble</span>
                      <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.autoWobble.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={3.0}
                      step={0.1}
                      value={settings.animation.autoWobble}
                      onChange={(e) => updateNestedSetting('animation', 'autoWobble', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rotation preset */}
            <div className="flex flex-col gap-3 pt-1 border-t border-zinc-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-250">Rotation preset</span>
                  <button title="Force strict rotation patterns on 3D geometry" className="text-zinc-550 hover:text-zinc-300">
                    <Info size={11} className="text-zinc-500" />
                  </button>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.animation.rotateEnabled}
                    onChange={(e) => updateNestedSetting('animation', 'rotateEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {settings.animation.rotateEnabled && (
                <div className="pl-3 border-l border-zinc-850 flex flex-col gap-3.5 animate-fade-in">
                  {/* Pattern Mode selection */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-zinc-500 text-[11px] font-sans font-medium">Pattern</span>
                    <select
                      value={settings.animation.rotatePreset}
                      onChange={(e) => updateNestedSetting('animation', 'rotatePreset', e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-md text-xs text-zinc-300 focus:outline-none focus:border-zinc-650 tracking-wide font-sans font-semibold"
                    >
                      <option value="axis">Axis rotate</option>
                      <option value="free">Free rotate (Multi-Axis)</option>
                    </select>
                  </div>

                  {/* Selective Angle Axis */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-zinc-500 text-[11px] font-sans font-medium">Axis</span>
                    <select
                      value={settings.animation.rotateAxis}
                      onChange={(e) => updateNestedSetting('animation', 'rotateAxis', e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-md text-xs text-zinc-300 focus:outline-none focus:border-zinc-650 tracking-wide font-sans font-semibold"
                    >
                      <option value="y">Y (horizontal)</option>
                      <option value="x">X (vertical)</option>
                      <option value="z">Z (depth)</option>
                    </select>
                  </div>

                  {/* Speed slider list */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 font-sans font-medium">Speed</span>
                      <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.rotateSpeed.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={1.0}
                      step={0.05}
                      value={settings.animation.rotateSpeed}
                      onChange={(e) => updateNestedSetting('animation', 'rotateSpeed', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                    />
                  </div>

                  {/* PingPong option */}
                  <div className="flex items-center justify-between py-1 bg-zinc-950 px-2 rounded border border-zinc-900">
                    <span className="text-[10px] font-sans font-semibold text-zinc-500 uppercase tracking-wider">Ping-pong</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.animation.rotatePingPong}
                        onChange={(e) => updateNestedSetting('animation', 'rotatePingPong', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION: FLOAT + DRIFT */}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-200">Float + Drift</span>
                <button title="Adds a gentle vertical floating and horizontal drift animation" className="text-zinc-550 hover:text-zinc-300">
                  <Info size={11} className="text-zinc-500" />
                </button>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.animation.floatEnabled}
                  onChange={(e) => updateNestedSetting('animation', 'floatEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {settings.animation.floatEnabled && (
              <div className="pl-3 border-l border-zinc-850 flex flex-col gap-3 animate-fade-in">
                {/* Speed */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Speed</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.floatSpeed.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={2.5}
                    step={0.05}
                    value={settings.animation.floatSpeed}
                    onChange={(e) => updateNestedSetting('animation', 'floatSpeed', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Height ( floatAmplitude ) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Height</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.floatAmplitude.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.02}
                    max={0.7}
                    step={0.01}
                    value={settings.animation.floatAmplitude}
                    onChange={(e) => updateNestedSetting('animation', 'floatAmplitude', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Drift sideways swaying */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Drift</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{(settings.animation.driftAmount ?? 8)}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    step={1}
                    value={settings.animation.driftAmount ?? 8}
                    onChange={(e) => updateNestedSetting('animation', 'driftAmount', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION: BREATHING SCALE */}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-200">Breathing Scale</span>
                <button title="Rhythmic scale expansion that mimics gentle breathing" className="text-zinc-550 hover:text-zinc-300">
                  <Info size={11} className="text-zinc-500" />
                </button>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.animation.breatheEnabled}
                  onChange={(e) => updateNestedSetting('animation', 'breatheEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {settings.animation.breatheEnabled && (
              <div className="pl-3 border-l border-zinc-850 flex flex-col gap-3 animate-fade-in">
                {/* Speed */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Speed</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.breatheSpeed.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={2.5}
                    step={0.05}
                    value={settings.animation.breatheSpeed}
                    onChange={(e) => updateNestedSetting('animation', 'breatheSpeed', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Amount</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{(settings.animation.breatheAmount * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={0.20}
                    step={0.01}
                    value={settings.animation.breatheAmount}
                    onChange={(e) => updateNestedSetting('animation', 'breatheAmount', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION: LIGHT SWEEP */}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-200">Light Sweep</span>
                <button title="Moves the source spotlight dynamically for responsive dot gradients" className="text-zinc-550 hover:text-zinc-300">
                  <Info size={11} className="text-zinc-500" />
                </button>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.animation.lightSweepEnabled}
                  onChange={(e) => updateNestedSetting('animation', 'lightSweepEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {settings.animation.lightSweepEnabled && (
              <div className="pl-3 border-l border-zinc-850 flex flex-col gap-3 animate-fade-in">
                {/* Speed */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Speed</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.lightSweepSpeed.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={2.0}
                    step={0.05}
                    value={settings.animation.lightSweepSpeed}
                    onChange={(e) => updateNestedSetting('animation', 'lightSweepSpeed', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Range (Angle) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Angle Range</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.lightSweepRange.toFixed(0)}°</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={1}
                    value={settings.animation.lightSweepRange}
                    onChange={(e) => updateNestedSetting('animation', 'lightSweepRange', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Height sweep deviation range */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Height Range</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.lightSweepHeightRange.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={2.0}
                    step={0.05}
                    value={settings.animation.lightSweepHeightRange}
                    onChange={(e) => updateNestedSetting('animation', 'lightSweepHeightRange', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION: CAMERA PARALLAX */}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-200">Camera Parallax</span>
                <button title="Slight perspective camera reaction to pointer pointer coordinates" className="text-zinc-550 hover:text-zinc-300">
                  <Info size={11} className="text-zinc-500" />
                </button>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.animation.cameraParallaxEnabled}
                  onChange={(e) => updateNestedSetting('animation', 'cameraParallaxEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {settings.animation.cameraParallaxEnabled && (
              <div className="pl-3 border-l border-zinc-850 flex flex-col gap-3 animate-fade-in">
                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Amount</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.cameraParallaxAmount.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.80}
                    step={0.05}
                    value={settings.animation.cameraParallaxAmount}
                    onChange={(e) => updateNestedSetting('animation', 'cameraParallaxAmount', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Easing */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Easing</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.cameraParallaxEase.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={0.25}
                    step={0.01}
                    value={settings.animation.cameraParallaxEase}
                    onChange={(e) => updateNestedSetting('animation', 'cameraParallaxEase', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION: SPRING RETURN */}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-200">Spring Return</span>
                <button title="Adds a physics elastic bounce-back tension to drag releases" className="text-zinc-550 hover:text-zinc-300">
                  <Info size={11} className="text-zinc-500" />
                </button>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.animation.springReturnEnabled}
                  onChange={(e) => updateNestedSetting('animation', 'springReturnEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {settings.animation.springReturnEnabled && (
              <div className="pl-3 border-l border-zinc-850 flex flex-col gap-3 animate-fade-in">
                {/* Strength */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Strength</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.springStrength.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={0.50}
                    step={0.01}
                    value={settings.animation.springStrength}
                    onChange={(e) => updateNestedSetting('animation', 'springStrength', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Damping */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Damping</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.springDamping.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.02}
                    value={settings.animation.springDamping}
                    onChange={(e) => updateNestedSetting('animation', 'springDamping', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION: FOLLOW MOUSE (HOVER) */}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-200">Follow Mouse (Hover)</span>
                <button title="Adds smooth tilting reaction to hover" className="text-zinc-550 hover:text-zinc-300">
                  <Info size={11} className="text-zinc-500" />
                </button>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.animation.followHoverEnabled}
                  onChange={(e) => updateNestedSetting('animation', 'followHoverEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {settings.animation.followHoverEnabled && (
              <div className="pl-3 border-l border-zinc-850 flex flex-col gap-3 animate-fade-in">
                {/* Range */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Range</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.hoverRange}°</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={90}
                    step={1}
                    value={settings.animation.hoverRange}
                    onChange={(e) => updateNestedSetting('animation', 'hoverRange', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Easing */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Easing</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.hoverEase.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    value={settings.animation.hoverEase}
                    onChange={(e) => updateNestedSetting('animation', 'hoverEase', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Return to Center */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-500 font-sans font-medium">Return to center</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.animation.hoverReturn}
                      onChange={(e) => updateNestedSetting('animation', 'hoverReturn', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SECTION: FOLLOW MOUSE (DRAG) */}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-200">Follow Mouse (Drag)</span>
                <button title="Adds drag rotations and inertia physics on drag release" className="text-zinc-550 hover:text-zinc-300">
                  <Info size={11} className="text-zinc-500" />
                </button>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.animation.followDragEnabled}
                  onChange={(e) => updateNestedSetting('animation', 'followDragEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {settings.animation.followDragEnabled && (
              <div className="pl-3 border-l border-zinc-850 flex flex-col gap-3 animate-fade-in">
                {/* Sensitivity */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Sensitivity</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.dragSens.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.001}
                    max={0.05}
                    step={0.001}
                    value={settings.animation.dragSens}
                    onChange={(e) => updateNestedSetting('animation', 'dragSens', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Friction */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Friction</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.dragFriction.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    value={settings.animation.dragFriction}
                    onChange={(e) => updateNestedSetting('animation', 'dragFriction', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Momentum */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-500 font-sans font-medium">Momentum</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.animation.dragMomentum}
                      onChange={(e) => updateNestedSetting('animation', 'dragMomentum', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SECTION: WAVE */}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-200">Wave</span>
                <button title="Adds wavy sinewave displacement behavior across mesh patterns" className="text-zinc-550 hover:text-zinc-300">
                  <Info size={11} className="text-zinc-500" />
                </button>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.animation.waveEnabled}
                  onChange={(e) => updateNestedSetting('animation', 'waveEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-zinc-800/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {settings.animation.waveEnabled && (
              <div className="pl-3 border-l border-zinc-850 flex flex-col gap-3 animate-fade-in">
                {/* Speed */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Speed</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.waveSpeed.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={5.0}
                    step={0.1}
                    value={settings.animation.waveSpeed}
                    onChange={(e) => updateNestedSetting('animation', 'waveSpeed', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-sans font-medium">Amount</span>
                    <span className="text-zinc-300 font-mono text-[10px] font-semibold">{settings.animation.waveAmount.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={10.0}
                    step={0.1}
                    value={settings.animation.waveAmount}
                    onChange={(e) => updateNestedSetting('animation', 'waveAmount', Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* RENDER EXPORT SECTION UNDER THIRD TAB */}
      {activeTab === 'export' && (
        <div className="px-5 py-5 flex flex-col gap-5 animate-fade-in font-sans" id="export-tab-panel">
          
          <div className="flex flex-col gap-1 bg-zinc-950 p-4 rounded-xl border border-zinc-850/80">
            <h4 className="text-[10px] font-bold tracking-widest text-[#a1a1aa] uppercase font-mono mb-2">3D RASTER CAPTURES</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans mb-3">
              Get pixel-perfect 3D raster renders of the viewport utilizing GPU postprocessing. Transparent channels and interactive lighting are fully rendered.
            </p>
            
            {/* Dynamic HD Video Quality & Duration Selector System */}
            <div className="grid grid-cols-2 gap-3 mb-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono">Video Quality</label>
                <select
                  value={videoQuality}
                  onChange={(e) => onVideoQualityChange?.(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-zinc-100 font-sans focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="720">720p (HD)</option>
                  <option value="1080">1080p (FHD)</option>
                  <option value="1440">1440p (2K)</option>
                  <option value="2160">2160p (4K)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono">Duration</label>
                <select
                  value={videoDuration}
                  onChange={(e) => onVideoDurationChange?.(parseInt(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-zinc-100 font-sans focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="3">3 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="20">20 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 min</option>
                  <option value="120">2 mins</option>
                  <option value="180">3 mins</option>
                  <option value="240">4 mins</option>
                  <option value="300">5 mins</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={onExportPNG}
                className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-[#151515] text-zinc-100 rounded-lg text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download size={14} className="text-zinc-400" />
                Download PNG Frame (.PNG)
              </button>

              <button
                onClick={onExportWebM}
                className={`w-full py-2.5 border text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer rounded-lg active:scale-95 ${
                  recordingStatus === 'recording'
                    ? 'bg-rose-950/40 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-zinc-100 hover:bg-white text-zinc-950 border-zinc-200'
                }`}
              >
                <Video size={14} className={recordingStatus === 'recording' ? 'text-rose-400 animate-spin-slow' : 'text-indigo-600'} />
                {recordingStatus === 'recording' ? 'Recording WebM Loop...' : 'Download WebM Loop (.WEBM)'}
              </button>
            </div>
          </div>

          {/* DEVELOPER CODE EXPORTS SYSTEM */}
          <div className="flex flex-col gap-1 bg-zinc-950 p-4 rounded-xl border border-zinc-850/80 mt-1">
            <div className="flex items-center gap-2 mb-2">
              <Code size={14} className="text-indigo-400" />
              <h4 className="text-[10px] font-bold tracking-widest text-zinc-300 uppercase font-mono">DEVELOPER CODE EXPORTS</h4>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans mb-3">
              Instantly export the active halftone state, colors, configurations, and lighting coordinates into copyable production-ready code.
            </p>
            
            {/* Inline Tabs for code files */}
            <div className="grid grid-cols-2 p-0.5 bg-zinc-900 rounded-lg mb-3 border border-zinc-800">
              {(['react', 'html'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCodeTab(tab)}
                  className={`py-1 text-[8.5px] font-mono font-bold tracking-wider rounded transition-all uppercase cursor-pointer ${
                    codeTab === tab
                      ? 'bg-zinc-850 text-indigo-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Monospace Code Editor Block with copy functionality */}
            <div className="relative rounded-lg overflow-hidden bg-[#050505] border border-zinc-900 p-3 max-h-[160px] overflow-y-auto overflow-x-hidden custom-scrollbar font-mono text-[9.5px] text-zinc-300 leading-normal select-all w-full break-all">
              <pre className="whitespace-pre-wrap break-all select-all pr-8 overflow-x-hidden w-full">
                {codeTab === 'react' && getReactCode()}
                {codeTab === 'html' && getHtmlCode()}
              </pre>

              {/* Floating Copy Button */}
              <button
                type="button"
                onClick={() => {
                  const val = 
                    codeTab === 'react' ? getReactCode() : getHtmlCode();
                  handleCopyCode(val);
                }}
                className="absolute top-2 right-2 p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-all active:scale-90 cursor-pointer"
                title="Copy code to clipboard"
              >
                {copiedCode ? <Check size={11} className="text-emerald-400 animate-pulse" /> : <Copy size={11} />}
              </button>
            </div>

            {/* Direct Interactive HTML file download */}
            <div className="mt-2.5">
              <button
                type="button"
                onClick={handleDownloadHtmlFile}
                className="w-full py-2 bg-indigo-950/40 border border-indigo-500/25 hover:bg-indigo-900/45 hover:text-indigo-200 text-indigo-300 rounded-lg text-[10.5px] font-mono uppercase font-black tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Download 100% portable, fully-animated stand-alone HTML viewer widget"
              >
                <Download size={12} className="text-indigo-400 animate-pulse" />
                Download Standalone HTML (.HTML)
              </button>
            </div>
          </div>

          {/* DANGER ZONE RESET BUTTON */}
          {onReset && (
            <div className="flex flex-col gap-1 bg-zinc-950 p-4 rounded-xl border border-red-950/40 mt-1">
              <h4 className="text-[10px] font-bold tracking-widest text-red-400/80 uppercase font-mono mb-2">DANGER ZONE</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-sans mb-4">
                Instantly restore all grids, mesh parameters, camera orbits, material parameters, and lights back to original defaults.
              </p>
              <button
                onClick={onReset}
                className="w-full py-2.5 bg-red-950/10 hover:bg-red-950/25 text-red-400 border border-red-900/40 rounded-lg text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={14} className="animate-spin-slow" />
                Reset Defaults
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
