/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AppSettings } from '../types';
import { RefreshCw, ZoomIn, ZoomOut, Move, Image as ImageIcon } from 'lucide-react';

interface CanvasViewportProps {
  settings: AppSettings;
  isHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  viewportRef: React.MutableRefObject<{
    getPNGDataURL: () => string | null;
    generateSVG: () => string | null;
  } | null>;
  onChange?: (updater: (prev: AppSettings) => AppSettings) => void;
  activePage: 'main' | 'gradient';
}

export default function CanvasViewport({
  settings,
  isHovered,
  onHoverChange,
  viewportRef,
  onChange,
  activePage,
}: CanvasViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Three.js internal references
  const mainSceneRef = useRef<THREE.Scene | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const currentMeshRef = useRef<THREE.Object3D | null>(null);
  const primaryLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const envTextureRef = useRef<THREE.Texture | null>(null);
  
  // Custom Shader Render Pipeline refs
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const postSceneRef = useRef<THREE.Scene | null>(null);
  const postCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // States
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Drag interaction states (refs to prevent re-renders)
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });
  const springVelocityRef = useRef({ x: 0, y: 0 });
  const hoverOffsetRotationRef = useRef({ x: 0, y: 0 });
  const meshRotationXRef = useRef(0.3);
  const meshRotationYRef = useRef(0.4);
  const dragMomentumVelocityRef = useRef({ x: 0, y: 0 });
  
  // Drag flow offset refs
  const dragFlowOffsetRef = useRef({ x: 0, y: 0 });
  const dragFlowVelocityRef = useRef({ x: 0, y: 0 });
  
  // Hover & mouse coordinates
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const hoverProgressRef = useRef(0);
  const timeRef = useRef(0);

  // Keep a live settings reference to prevent animation loop closures stale state issues
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const isHoveredRef = useRef(isHovered);
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Request ID reference to solve async race conditions during 3D geometry updates
  const geometryRequestIdRef = useRef(0);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Exposed API
  useEffect(() => {
    if (viewportRef) {
      viewportRef.current = {
        getPNGDataURL: () => {
          if (!rendererRef.current || !canvasRef.current) return null;
          
          // Ensure renderer clear color matches background settings for correct capture
          if (settings.background.transparent) {
            rendererRef.current.setClearColor(0x000000, 0);
          } else {
            rendererRef.current.setClearColor(new THREE.Color(settings.background.color), 1);
          }

          // Capture the last frame accurately, without alpha overlay if not transparent
          rendererRef.current.render(
            postSceneRef.current || mainSceneRef.current!,
            postCameraRef.current || cameraRef.current!
          );
          return canvasRef.current.toDataURL('image/png');
        },
        generateSVG: () => {
          // Generates a vectorized SVG replica of the active halftone screen with specular highlights & realistic shadows
          if (!canvasRef.current || !renderTargetRef.current || !rendererRef.current) return null;
          
          // Force a final render to ensure current halftone state is captured
          const useHalftone = settings.halftone.enabled;
          
          // Ensure renderer clear color matches background settings for correct capture
          if (settings.background.transparent) {
            rendererRef.current.setClearColor(0x000000, 0);
          } else {
            rendererRef.current.setClearColor(new THREE.Color(settings.background.color), 1);
          }

          // Ensure unhalftoned 3D scene is rendered into the offscreen render target to refresh its pixels
          if (mainSceneRef.current && cameraRef.current) {
            rendererRef.current.setRenderTarget(renderTargetRef.current);
            rendererRef.current.render(mainSceneRef.current, cameraRef.current);
          }

          rendererRef.current.setRenderTarget(null);
          rendererRef.current.render(
            useHalftone ? (postSceneRef.current || mainSceneRef.current!) : mainSceneRef.current!,
            useHalftone ? (postCameraRef.current || cameraRef.current!) : cameraRef.current!
          );

          const width = canvasRef.current.clientWidth || 930;
          const height = canvasRef.current.clientHeight || 614;
          const bgColor = settings.background.transparent ? 'none' : settings.background.color;
          
          // If halftone pattern is not active, export as a beautiful high-fidelity rasterized image inside SVG
          if (!useHalftone) {
            const dataURL = rendererRef.current.domElement.toDataURL('image/png');
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background: ${bgColor}"><image href="${dataURL}" width="${width}" height="${height}"/></svg>`;
          }

          const scale = settings.halftone.scale;
          const toneTarget = settings.halftone.toneTarget;
          const dotWidth = settings.halftone.width;
          const patternType = settings.halftone.shape;
          const patternColor = settings.halftone.dashColor;

          // Read the precise pixels of the rendered unhalftoned 3D scene / image / text
          const rtWidth = renderTargetRef.current.width;
          const rtHeight = renderTargetRef.current.height;
          const pixels = new Uint8Array(rtWidth * rtHeight * 4);
          
          // Force standard binding and read the pixels
          rendererRef.current.readRenderTargetPixels(renderTargetRef.current, 0, 0, rtWidth, rtHeight, pixels);

          // Prepare beautiful SVG
          let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background: ${bgColor}">\n`;
          
          // Set up CSS dynamic animations keyframes
          let styleContent = '';
          const groupClasses: string[] = [];

          if (settings.animation.breatheEnabled) {
            const speedSec = (1 / (settings.animation.breatheSpeed || 0.4)).toFixed(2);
            styleContent += `
    @keyframes svg-breathe {
      0%, 100% { transform: scale(1.0); }
      50% { transform: scale(${(1.0 + settings.animation.breatheAmount).toFixed(3)}); }
    }
    .svg-animated-breathe {
      transform-origin: center;
      transform-box: fill-box;
      -webkit-transform-origin: center;
      animation: svg-breathe ${speedSec}s ease-in-out infinite;
    }`;
            groupClasses.push('svg-animated-breathe');
          }

          if (settings.animation.floatEnabled) {
            const speedSec = (1 / (settings.animation.floatSpeed || 0.45)).toFixed(2);
            const amtPx = (settings.animation.floatAmplitude * 25).toFixed(1);
            styleContent += `
    @keyframes svg-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-${amtPx}px); }
    }
    .svg-animated-float {
      transform-origin: center;
      transform-box: fill-box;
      -webkit-transform-origin: center;
      animation: svg-float ${speedSec}s ease-in-out infinite;
    }`;
            groupClasses.push('svg-animated-float');
          }

          if (settings.animation.autoRotateEnabled) {
            const speedSec = (60 / (settings.animation.autoSpeed || 0.5)).toFixed(2);
            styleContent += `
    @keyframes svg-rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .svg-animated-rotate {
      transform-origin: center;
      transform-box: fill-box;
      -webkit-transform-origin: center;
      animation: svg-rotate ${speedSec}s linear infinite;
    }`;
            groupClasses.push('svg-animated-rotate');
          } else if (settings.animation.autoWobble > 0) {
            styleContent += `
    @keyframes svg-wobble {
      0%, 100% { transform: rotate(0deg) scale(1.0); }
      50% { transform: rotate(${(settings.animation.autoWobble * 4).toFixed(1)}deg) scale(1.02); }
    }
    .svg-animated-wobble {
      transform-origin: center;
      transform-box: fill-box;
      -webkit-transform-origin: center;
      animation: svg-wobble 5s ease-in-out infinite;
    }`;
            groupClasses.push('svg-animated-wobble');
          }

          // Inject high-precision vector filters & radial gradients to replicate live GPU shaders!
          const shadowOpacity = settings.lighting.shadowOpacity ?? 0.55;
          svgContent += `  <defs>
    <filter id="svg-dot-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0.8" dy="1.4" stdDeviation="0.9" flood-color="#000000" flood-opacity="${(shadowOpacity * 0.42).toFixed(2)}" />
    </filter>
    <radialGradient id="svg-gloss-overlay" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
    </radialGradient>
    <linearGradient id="svg-rect-gloss" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.18" />
    </linearGradient>
  </defs>\n`;
          
          if (styleContent) {
            svgContent += `  <style>${styleContent}</style>\n`;
          }

          const gridRotAngle = settings.halftone.gridAngle ?? 45;
          const aspectRatio = width / height;

          // Determine grid cell spacing
          const spacing = height / scale;

          // Helper to safely get pixel color and mask status at normalized coordinate (u, v)
          const getPixelAt = (u: number, v: number) => {
            const cu = Math.max(0, Math.min(0.999, u));
            const cv = Math.max(0, Math.min(0.999, v));
            const px = Math.floor(cu * rtWidth);
            const py = Math.floor(cv * rtHeight);
            const idx = (py * rtWidth + px) * 4;
            return {
              r: pixels[idx] / 255,
              g: pixels[idx + 1] / 255,
              b: pixels[idx + 2] / 255,
              a: pixels[idx + 3] / 255
            };
          };

          // Define loop ranges based on diagonal bounds to guarantee full rotated coverage
          // Range is scale-based and adjusted for aspect ratio
          const bufferFactor = 1.6;
          const rangeY = Math.ceil(scale * bufferFactor);
          const rangeX = Math.ceil(scale * aspectRatio * bufferFactor);

          if (groupClasses.length > 0) {
            svgContent += `  <g class="${groupClasses.join(' ')}">\n`;
          }

          for (let gx = -rangeX; gx <= rangeX; gx++) {
            for (let gy = -rangeY; gy <= rangeY; gy++) {
              let gridUvX = gx + 0.5;
              let gridUvY = gy + 0.5;

              // Apply the rhythmic wave/sway:
              const waveAmp = settings.halftone.waveAmplitude ?? 0.0;
              const waveFreq = settings.halftone.waveFrequency ?? 2.5;
              const curTime = timeRef.current;
              if (waveAmp > 0.0) {
                const swayX = Math.sin(gridUvY * 0.5 + curTime * waveFreq) * waveAmp;
                const swayY = Math.cos(gridUvX * 0.5 + curTime * waveFreq) * waveAmp;
                gridUvX += swayX;
                gridUvY += swayY;
              }

              // Position coordinates in rotated grid space
              const localX = gridUvX / scale;
              const localY = gridUvY / scale;

              // Rotate back to unrotated screen space (in radians)
              const angleRad = -(gridRotAngle * Math.PI) / 180;
              const s = Math.sin(angleRad);
              const c = Math.cos(angleRad);
              const unX = localX * c - localY * s;
              const unY = localX * s + localY * c;

              // Un-adjust for aspect ratio to get normalized screen UV
              const uvX = (unX / aspectRatio) + 0.5;
              const uvY = unY + 0.5;

              // Skip cells whose centers lie outside visible screen boundary
              if (uvX < 0 || uvX >= 1 || uvY < 0 || uvY >= 1) {
                continue;
              }

              // Retrieve precise scene elements at this location
              const pixel = getPixelAt(uvX, uvY);
              const mask = pixel.a;

              // Mask check - do not render grid cell if outside shape boundary
              if (mask < 0.05) {
                continue;
              }

              // Calculate luminance & contrast matching the fragment shader exactly
              let luminance = 0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;
              const contrast = settings.halftone.imageContrast;
              luminance = Math.max(0.0, Math.min(1.0, (luminance - 0.5) * contrast + 0.5));

              // Compute tone val multiplier
              const val = (toneTarget === 'light') ? luminance : (1.0 - luminance);

              // Sizing threshold matching the shader
              const cellRadius = val * dotWidth * spacing * 0.5;

              if (cellRadius > 0.1) {
                // Compute absolute unrotated SVG coordinates
                const cx_un = uvX * width;
                const cy_un = (1.0 - uvY) * height;

                // Color calculation: blend with 3D lighting, gloss glints, and shadows
                let r = Math.round(pixel.r * 255);
                let g = Math.round(pixel.g * 255);
                let b = Math.round(pixel.b * 255);

                if (!settings.halftone.useImageColors) {
                  const patColor = new THREE.Color(patternColor);
                  const minIntensity = 1.0 - shadowOpacity * 0.75;
                  const maxIntensity = 1.0 + shadowOpacity * 0.45;
                  const lightingIntensity = minIntensity + (maxIntensity - minIntensity) * luminance;
                  
                  let pr = patColor.r * lightingIntensity;
                  let pg = patColor.g * lightingIntensity;
                  let pb = patColor.b * lightingIntensity;

                  // Apply high-contrast specular reflection glint based on pixel brightness
                  const spec = Math.max(0.0, Math.min(1.0, (luminance - 0.48) * 2.8));
                  r = Math.round(THREE.MathUtils.lerp(pr, 1.0, spec * 0.95) * 255);
                  g = Math.round(THREE.MathUtils.lerp(pg, 1.0, spec * 0.95) * 255);
                  b = Math.round(THREE.MathUtils.lerp(pb, 1.0, spec * 0.95) * 255);
                }

                const resolvedColor = `rgb(${r}, ${g}, ${b})`;

                if (patternType === 'squares') {
                  const rad = (gridRotAngle * Math.PI) / 180;
                  const cosR = Math.cos(rad);
                  const sinR = Math.sin(rad);
                  
                  svgContent += `  <g opacity="${mask.toFixed(2)}">\n`;
                  // Compute perfect rotated square polygon corners
                  const ux_x = cellRadius * cosR;
                  const ux_y = -cellRadius * sinR;
                  const uy_x = cellRadius * sinR;
                  const uy_y = cellRadius * cosR;

                  const p1x = (cx_un + ux_x + uy_x).toFixed(1);
                  const p1y = (cy_un + ux_y + uy_y).toFixed(1);
                  const p2x = (cx_un + ux_x - uy_x).toFixed(1);
                  const p2y = (cy_un + ux_y - uy_y).toFixed(1);
                  const p3x = (cx_un - ux_x - uy_x).toFixed(1);
                  const p3y = (cy_un - ux_y - uy_y).toFixed(1);
                  const p4x = (cx_un - ux_x + uy_x).toFixed(1);
                  const p4y = (cy_un - ux_y + uy_y).toFixed(1);

                  // Base shadow polygon
                  svgContent += `    <polygon points="${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}" fill="${resolvedColor}" filter="url(#svg-dot-shadow)" />\n`;
                  // Flat metallic linear gloss on top
                  svgContent += `    <polygon points="${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}" fill="url(#svg-rect-gloss)" />\n`;
                  svgContent += `  </g>\n`;
                } else if (patternType === 'lines') {
                  // Replaced line pattern with properly centered <circle> elements, mapping density and scale to radius
                  const finalRadius = Math.max(0.15, cellRadius);
                  svgContent += `  <g opacity="${mask.toFixed(2)}">\n`;
                  svgContent += `    <circle cx="${cx_un.toFixed(1)}" cy="${cy_un.toFixed(1)}" r="${finalRadius.toFixed(1)}" fill="${resolvedColor}" filter="url(#svg-dot-shadow)" />\n`;
                  
                  const glossRadius = finalRadius * 0.42;
                  const gx = cx_un - finalRadius * 0.32;
                  const gy = cy_un - finalRadius * 0.32;
                  if (glossRadius > 0.6) {
                    svgContent += `    <circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="${glossRadius.toFixed(1)}" fill="url(#svg-gloss-overlay)" opacity="0.9" />\n`;
                  }
                  svgContent += `  </g>\n`;
                } else if (patternType === 'crosshatch') {
                  // Replaced crosshatch pattern with properly centered <circle> elements, mapping density and scale to radius
                  const finalRadius = Math.max(0.15, cellRadius);
                  svgContent += `  <g opacity="${mask.toFixed(2)}">\n`;
                  svgContent += `    <circle cx="${cx_un.toFixed(1)}" cy="${cy_un.toFixed(1)}" r="${finalRadius.toFixed(1)}" fill="${resolvedColor}" filter="url(#svg-dot-shadow)" />\n`;
                  
                  const glossRadius = finalRadius * 0.42;
                  const gx = cx_un - finalRadius * 0.32;
                  const gy = cy_un - finalRadius * 0.32;
                  if (glossRadius > 0.6) {
                    svgContent += `    <circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="${glossRadius.toFixed(1)}" fill="url(#svg-gloss-overlay)" opacity="0.9" />\n`;
                  }
                  svgContent += `  </g>\n`;
                } else { // Default to 'dots' (proper circles)
                  const finalRadius = Math.max(0.15, cellRadius);
                  svgContent += `  <g opacity="${mask.toFixed(2)}">\n`;
                  // Base 3D shadow circle
                  svgContent += `    <circle cx="${cx_un.toFixed(1)}" cy="${cy_un.toFixed(1)}" r="${finalRadius.toFixed(1)}" fill="${resolvedColor}" filter="url(#svg-dot-shadow)" />\n`;
                  
                  // Glass glint glossy overlay
                  const glossRadius = finalRadius * 0.42;
                  const gx = cx_un - finalRadius * 0.32;
                  const gy = cy_un - finalRadius * 0.32;
                  if (glossRadius > 0.6) {
                    svgContent += `    <circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="${glossRadius.toFixed(1)}" fill="url(#svg-gloss-overlay)" opacity="0.9" />\n`;
                  }
                  svgContent += `  </g>\n`;
                }
              }
            }
          }

          if (groupClasses.length > 0) {
            svgContent += `  </g>\n`;
          }

          svgContent += '</svg>';
          return svgContent;
        }
      };
    }
  }, [settings, isHovered]);

  // Adjust zoom/camera distance
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = settings.distance;
    }
  }, [settings.distance]);

  // Helper to load image src as THREE.Texture asynchronously
  const loadTextureAsync = (src: string | null): Promise<THREE.Texture | null> => {
    return new Promise((resolve) => {
      if (!src) {
        resolve(null);
        return;
      }
      
      let processedSrc = src;
      if (src.startsWith('data:image/svg+xml') && !src.includes(';base64,')) {
        const parts = src.split(',');
        if (parts.length > 1) {
          const rawContent = parts.slice(1).join(',').replace(/%23/g, '#');
          try {
            const base64Data = btoa(unescape(encodeURIComponent(rawContent)));
            processedSrc = 'data:image/svg+xml;base64,' + base64Data;
          } catch (err) {
            console.error("Base64 SVG mapping failed, fallback used", err);
            processedSrc = 'data:image/svg+xml;utf8,' + encodeURIComponent(rawContent);
          }
        }
      }

      const img = new Image();
      if (!processedSrc.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        resolve(texture);
      };
      img.onerror = (err) => {
        console.error("Texture async load failed", err);
        resolve(null);
      };
      img.src = processedSrc;
    });
  };

  // Re-build custom geometry details depending on shapeKey
  const updateGeometry = async (shapeKey: string, sourceMode: string, textStr: string, imageSrc: string | null, fontBold: boolean) => {
    if (!meshGroupRef.current) return;
    setLoading(true);

    const requestId = ++geometryRequestIdRef.current;

    // Load texture if we have any imageSrc
    let loadedTexture: THREE.Texture | null = null;
    
    if (sourceMode === 'video' && settings.videoSrc) {
       const video = document.createElement('video');
       video.src = settings.videoSrc;
       video.loop = true;
       video.muted = true;
       video.play();
       loadedTexture = new THREE.VideoTexture(video);
    } else if (imageSrc) {
       loadedTexture = await loadTextureAsync(imageSrc);
    }

    // If a newer geometry request has started in the meantime, abort and clean up loaded texture!
    if (requestId !== geometryRequestIdRef.current) {
      if (loadedTexture) loadedTexture.dispose();
      return;
    }

    // Configure corrected colors space/wrapping
    if (loadedTexture) {
      loadedTexture.colorSpace = THREE.SRGBColorSpace;
      loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
      loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
    }

    // Prepare materials
    const baseColorParams: any = {
      color: new THREE.Color(settings.material.color),
      roughness: settings.material.roughness,
      metalness: settings.material.metalness,
      envMapIntensity: settings.material.environmentPower,
      wireframe: settings.material.surface === 'wireframe',
      flatShading: false,
    };

    if (settings.material.surface === 'glass') {
      baseColorParams.transparent = false;
      baseColorParams.opacity = 1.0;
      baseColorParams.transmission = 0.65;
      baseColorParams.ior = settings.material.refraction;
      baseColorParams.thickness = settings.material.thickness / 100.0;
      baseColorParams.roughness = Math.max(0.04, settings.material.roughness);
      baseColorParams.metalness = Math.max(0.1, settings.material.metalness);
      baseColorParams.clearcoat = 1.0;
      baseColorParams.clearcoatRoughness = 0.05;
    } else if (settings.material.surface === 'solid') {
      baseColorParams.clearcoat = 0.5;
      baseColorParams.clearcoatRoughness = 0.1;
    }
    const baseColorMaterial = new THREE.MeshPhysicalMaterial(baseColorParams);

    const rimDetailParams: any = {
      color: new THREE.Color(settings.material.color),
      roughness: settings.material.roughness,
      metalness: settings.material.metalness,
      envMapIntensity: settings.material.environmentPower,
      wireframe: settings.material.surface === 'wireframe',
      flatShading: false,
    };
    if (settings.material.surface === 'glass') {
      rimDetailParams.transparent = true;
      rimDetailParams.opacity = 0.7;
      rimDetailParams.transmission = 0.85;
      rimDetailParams.ior = settings.material.refraction;
      rimDetailParams.thickness = settings.material.thickness / 100.0;
      rimDetailParams.roughness = Math.max(0.04, settings.material.roughness);
      rimDetailParams.metalness = Math.max(0.1, settings.material.metalness);
      rimDetailParams.clearcoat = 1.0;
      rimDetailParams.clearcoatRoughness = 0.05;
    } else if (settings.material.surface === 'solid') {
      rimDetailParams.clearcoat = 0.5;
      rimDetailParams.clearcoatRoughness = 0.1;
    }
    const rimDetailMaterial = new THREE.MeshPhysicalMaterial(rimDetailParams);

    let overlayMaterial: THREE.MeshPhysicalMaterial | null = null;
    if (loadedTexture) {
      const overlayParams: any = {
        map: loadedTexture,
        color: new THREE.Color('#ffffff'),
        roughness: settings.material.roughness,
        metalness: settings.material.metalness,
        envMapIntensity: settings.material.environmentPower,
        transparent: true,
        alphaTest: 0.01,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1.0,
        polygonOffsetUnits: -4.0,
      };

      if (settings.material.surface === 'glass') {
        overlayParams.transmission = 0.35;
        overlayParams.ior = settings.material.refraction;
        overlayParams.thickness = settings.material.thickness / 100.0;
        overlayParams.clearcoat = 1.0;
        overlayParams.clearcoatRoughness = 0.05;
      } else if (settings.material.surface === 'solid') {
        overlayParams.clearcoat = 0.4;
        overlayParams.clearcoatRoughness = 0.1;
      }
      overlayMaterial = new THREE.MeshPhysicalMaterial(overlayParams);
    }

    const applyShapeModifiers = (geom: THREE.BufferGeometry) => {
      const mods = settings.shapeModifiers;
      if (!mods || !geom.attributes.position) return;
      
      geom.computeVertexNormals();
      const posAttribute = geom.attributes.position;
      const normalAttribute = geom.attributes.normal;
      const pos = posAttribute.array as Float32Array;
      const norm = normalAttribute.array as Float32Array;

      const origPos = new Float32Array(pos);
      let hasMods = false;

      // Pseudo FBM noise
      const fbm = (x: number, y: number, z: number, scale: number) => {
        let n = 0;
        let amp = 0.5;
        let f = scale;
        // 3 octaves for some rock-like texture
        for(let o = 0; o < 3; o++) {
           n += amp * Math.sin(x * f + Math.cos(y * f)) * 
                      Math.sin(y * f + Math.cos(z * f)) * 
                      Math.sin(z * f + Math.cos(x * f));
           f *= 2.03;
           amp *= 0.5;
        }
        return n;
      };

      for (let i = 0; i < posAttribute.count; i++) {
        let x = origPos[i * 3];
        let y = origPos[i * 3 + 1];
        let z = origPos[i * 3 + 2];
        const nx = norm[i * 3];
        const ny = norm[i * 3 + 1];
        const nz = norm[i * 3 + 2];

        // Ripple Displacement
        if (mods.rippleAmount > 0) {
          hasMods = true;
          const rf = mods.rippleFrequency;
          const dist = Math.sqrt(x*x + y*y + z*z);
          // Try to make a very organic fluid ripple
          const ripple = Math.sin(x * rf + dist) * Math.cos(y * rf) * Math.sin(z * rf);
          const push = ripple * mods.rippleAmount;
          x += nx * push;
          y += ny * push;
          z += nz * push;
        }

        // Noise Displacement (Craters / Rocks)
        if (mods.noiseAmount !== 0) {
          hasMods = true;
          const nVal = fbm(origPos[i*3], origPos[i*3+1], origPos[i*3+2], mods.noiseScale);
          x += nx * (nVal * mods.noiseAmount);
          y += ny * (nVal * mods.noiseAmount);
          z += nz * (nVal * mods.noiseAmount);
        }

        // Spikes / Extrusions (Pushes based on normal and some sharp frequency)
        if (mods.spikeAmount !== 0) {
          hasMods = true;
          // create a spiky frequency
          const sx = origPos[i*3] * 15.0;
          const sy = origPos[i*3+1] * 15.0;
          const sz = origPos[i*3+2] * 15.0;
          let spike = Math.pow(Math.abs(Math.sin(sx) * Math.sin(sy) * Math.sin(sz)), 10.0);
          x += nx * (spike * mods.spikeAmount);
          y += ny * (spike * mods.spikeAmount);
          z += nz * (spike * mods.spikeAmount);
        }

        // Twist Deform (around Y axis)
        if (mods.twistAmount > 0) {
          hasMods = true;
          const angle = y * mods.twistAmount;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const nx_twisted = x * cos - z * sin;
          const nz_twisted = x * sin + z * cos;
          x = nx_twisted;
          z = nz_twisted;
        }

        // Inflate / Soft Body
        if (mods.inflateAmount !== 0) {
          hasMods = true;
          x += nx * mods.inflateAmount;
          y += ny * mods.inflateAmount;
          z += nz * mods.inflateAmount;
        }

        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
      }

      if (hasMods) {
        posAttribute.needsUpdate = true;
        geom.computeVertexNormals();
      }
    };

    let activeMesh: THREE.Object3D | null = null;

    if (sourceMode === 'shape') {
      let isCompositeGroup = false;
      const compositeGroup = new THREE.Group();
      let geometry: THREE.BufferGeometry | null = null;

      switch (shapeKey) {
        case 'star':
          {
            const starShape = new THREE.Shape();
            const outerRadius = 1.4;
            const innerRadius = 0.6;
            const points = 5;
            for (let i = 0; i < points * 2; i++) {
              const radius = i % 2 === 0 ? outerRadius : innerRadius;
              const a = (i / (points * 2)) * Math.PI * 2;
              if (i === 0) starShape.moveTo(Math.sin(a) * radius, Math.cos(a) * radius);
              else starShape.lineTo(Math.sin(a) * radius, Math.cos(a) * radius);
            }
            starShape.closePath();
            geometry = new THREE.ExtrudeGeometry(starShape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 });
            // Align center
            geometry.center();
          }
          break;
        case 'heart':
          {
            const heartShape = new THREE.Shape();
            const x = 0, y = 0;
            heartShape.moveTo( x + .25, y + .25 );
            heartShape.bezierCurveTo( x + .25, y + .25, x + .20, y, x, y );
            heartShape.bezierCurveTo( x - .30, y, x - .30, y + .35,x - .30,y + .35 );
            heartShape.bezierCurveTo( x - .30, y + .55, x - .10, y + .77, x + .25, y + .95 );
            heartShape.bezierCurveTo( x + .60, y + .77, x + .80, y + .55, x + .80, y + .35 );
            heartShape.bezierCurveTo( x + .80, y + .35, x + .80, y, x + .50, y );
            heartShape.bezierCurveTo( x + .35, y, x + .25, y + .25, x + .25, y + .25 );
            geometry = new THREE.ExtrudeGeometry(heartShape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 });
            // Scale and center heart
            geometry.scale( 2.2, -2.2, 2.2 );
            geometry.center();
          }
          break;
        case 'capsule':
          geometry = new THREE.CapsuleGeometry(0.8, 1.2, 
            Math.max(16, 16 * settings.shapeModifiers.detailLevel), 
            Math.max(32, 32 * settings.shapeModifiers.detailLevel)
          );
          break;
        case 'ring':
          geometry = new THREE.TorusGeometry(1.2, 0.15, 
            Math.max(16, 16 * settings.shapeModifiers.detailLevel), 
            Math.max(50, 20 * settings.shapeModifiers.detailLevel)
          );
          break;
        case 'cross':
          {
            const crossShape = new THREE.Shape();
            const w = 0.4;
            const l = 1.0;
            crossShape.moveTo(-w, l);
            crossShape.lineTo(w, l);
            crossShape.lineTo(w, w);
            crossShape.lineTo(l, w);
            crossShape.lineTo(l, -w);
            crossShape.lineTo(w, -w);
            crossShape.lineTo(w, -l);
            crossShape.lineTo(-w, -l);
            crossShape.lineTo(-w, -w);
            crossShape.lineTo(-l, -w);
            crossShape.lineTo(-l, w);
            crossShape.lineTo(-w, w);
            crossShape.lineTo(-w, l);
            geometry = new THREE.ExtrudeGeometry(crossShape, { 
              depth: 0.5, 
              bevelEnabled: true, 
              bevelThickness: settings.shapeModifiers.bevelSize, 
              bevelSize: settings.shapeModifiers.bevelSize, 
              bevelSegments: Math.max(3, settings.shapeModifiers.detailLevel * 2),
              curveSegments: Math.max(12, settings.shapeModifiers.detailLevel * 4) 
            });
            geometry.center();
          }
          break;
        case 'arrow':
          {
            const arrowShape = new THREE.Shape();
            arrowShape.moveTo(0, 1.2);
            arrowShape.lineTo(0.8, 0.2);
            arrowShape.lineTo(0.3, 0.2);
            arrowShape.lineTo(0.3, -1.0);
            arrowShape.lineTo(-0.3, -1.0);
            arrowShape.lineTo(-0.3, 0.2);
            arrowShape.lineTo(-0.8, 0.2);
            arrowShape.lineTo(0, 1.2);
            geometry = new THREE.ExtrudeGeometry(arrowShape, { 
              depth: 0.5, 
              bevelEnabled: true, 
              bevelThickness: settings.shapeModifiers.bevelSize, 
              bevelSize: settings.shapeModifiers.bevelSize, 
              bevelSegments: Math.max(3, settings.shapeModifiers.detailLevel * 2),
              curveSegments: Math.max(12, settings.shapeModifiers.detailLevel * 4) 
            });
            geometry.center();
          }
          break;
        case 'diamond':
          geometry = new THREE.OctahedronGeometry(1.4, 0);
          geometry.scale(1, 1.4, 1);
          break;
        case 'gem':
          geometry = new THREE.DodecahedronGeometry(1.4, 0);
          geometry.scale(1, 1.3, 1);
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(1.3, 
            Math.max(32, 16 * settings.shapeModifiers.detailLevel), 
            Math.max(32, 16 * settings.shapeModifiers.detailLevel)
          );
          break;
        case 'cube':
        case 'box':
          {
            const s = Math.max(1, settings.shapeModifiers.detailLevel * 3);
            geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5, s, s, s);
          }
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(1.0, 0.35, 
            Math.max(16, 16 * settings.shapeModifiers.detailLevel), 
            Math.max(50, 20 * settings.shapeModifiers.detailLevel)
          );
          break;
        case 'icosahedron':
          geometry = new THREE.IcosahedronGeometry(1.4, Math.max(0, settings.shapeModifiers.detailLevel - 1));
          break;
        case 'wavy-sphere': {
          isCompositeGroup = true;
          const wgeom = new THREE.SphereGeometry(1.2, 64, 64);
          const pos = wgeom.attributes.position;
          for(let i=0; i<pos.count; i++) {
             const x = pos.getX(i);
             const y = pos.getY(i);
             const z = pos.getZ(i);
             const freq = 4.0 + settings.shapeModifiers.detailLevel;
             const noise = 1 + 0.15 * Math.sin(x * freq) * Math.sin(y * freq) * Math.sin(z * freq);
             pos.setXYZ(i, x * noise, y * noise, z * noise);
          }
          wgeom.computeVertexNormals();
          const baseMesh = new THREE.Mesh(wgeom, baseColorMaterial);
          compositeGroup.add(baseMesh);
          
          if (overlayMaterial) {
             const overlayMesh = new THREE.Mesh(wgeom, overlayMaterial);
             overlayMesh.scale.set(1.02, 1.02, 1.02);
             compositeGroup.add(overlayMesh);
          }
          break;
        }
        case 'layered-sphere': {
          isCompositeGroup = true;
          const numLayers = 3 + settings.shapeModifiers.detailLevel;
          for(let i=0; i<numLayers; i++) {
             const layerRadius = 0.5 + 0.8 * (i / (numLayers-1));
             const rgeom = new THREE.SphereGeometry(layerRadius, 32, 32);
             const mat = baseColorMaterial.clone();
             mat.wireframe = (i % 2 !== 0);
             mat.transparent = true;
             mat.opacity = (i % 2 !== 0) ? 0.3 : 1.0;
             const bmesh = new THREE.Mesh(rgeom, mat);
             compositeGroup.add(bmesh);
          }
          break;
        }
        case 'molecular-sphere': {
          isCompositeGroup = true;
          const coreGeom = new THREE.IcosahedronGeometry(0.8, 1);
          const pos = coreGeom.attributes.position;
          const baseB = new THREE.Mesh(coreGeom, baseColorMaterial);
          compositeGroup.add(baseB);
          
          const atomGeom = new THREE.SphereGeometry(0.15, 16, 16);
          const bondGeom = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);
          bondGeom.translate(0, 0.5, 0);
          bondGeom.rotateX(Math.PI/2);
          
          for(let i=0; i<pos.count; i++) {
             const x = pos.getX(i);
             const y = pos.getY(i);
             const z = pos.getZ(i);
             const vec = new THREE.Vector3(x,y,z).normalize();
             const dist = 1.0 + Math.random() * 0.5;
             const ax = vec.x * dist;
             const ay = vec.y * dist;
             const az = vec.z * dist;
             
             const aMesh = new THREE.Mesh(atomGeom, overlayMaterial || baseColorMaterial);
             aMesh.position.set(ax, ay, az);
             compositeGroup.add(aMesh);
             
             const bond = new THREE.Mesh(bondGeom, baseColorMaterial);
             bond.position.set(vec.x * 0.8, vec.y * 0.8, vec.z * 0.8);
             bond.lookAt(new THREE.Vector3(ax, ay, az));
             bond.scale.z = (dist - 0.8);
             compositeGroup.add(bond);
          }
          break;
        }
        case '3d-jack': {
          isCompositeGroup = true;
          const cylGeom = new THREE.CylinderGeometry(0.25, 0.25, 2.4, 32);
          const capGeom = new THREE.SphereGeometry(0.35, 32, 32);
          
          for (let i = 0; i < 3; i++) {
             const mesh = new THREE.Mesh(cylGeom, baseColorMaterial);
             const cap1 = new THREE.Mesh(capGeom, baseColorMaterial);
             const cap2 = new THREE.Mesh(capGeom, baseColorMaterial);
             cap1.position.y = 1.2;
             cap2.position.y = -1.2;
             mesh.add(cap1);
             mesh.add(cap2);
             
             if (i === 1) mesh.rotation.x = Math.PI / 2;
             if (i === 2) mesh.rotation.z = Math.PI / 2;
             compositeGroup.add(mesh);
             
             if (overlayMaterial) {
                const meshO = new THREE.Mesh(cylGeom, overlayMaterial);
                meshO.scale.set(1.02, 1.02, 1.02);
                const capO1 = new THREE.Mesh(capGeom, overlayMaterial);
                const capO2 = new THREE.Mesh(capGeom, overlayMaterial);
                capO1.position.y = 1.2;
                capO2.position.y = -1.2;
                capO1.scale.set(1.02, 1.02, 1.02);
                capO2.scale.set(1.02, 1.02, 1.02);
                meshO.add(capO1);
                meshO.add(capO2);
                if (i === 1) meshO.rotation.x = Math.PI / 2;
                if (i === 2) meshO.rotation.z = Math.PI / 2;
                compositeGroup.add(meshO);
             }
          }
          break;
        }
        case 'wooden-puzzle': {
           isCompositeGroup = true;
           const wGeom = new THREE.BoxGeometry(0.4, 0.4, 2.5);
           const bar1 = new THREE.Mesh(wGeom, baseColorMaterial);
           const bar2 = new THREE.Mesh(wGeom, baseColorMaterial);
           bar2.rotation.y = Math.PI / 2;
           bar2.position.set(0, 0.2, 0);
           const bar3 = new THREE.Mesh(wGeom, baseColorMaterial);
           bar3.rotation.x = Math.PI / 2;
           bar3.position.set(0.2, 0, 0);

           [bar1, bar2, bar3].forEach((b, idx) => {
               compositeGroup.add(b);
               if (overlayMaterial) {
                  const o = new THREE.Mesh(wGeom, overlayMaterial);
                  o.position.copy(b.position);
                  o.rotation.copy(b.rotation);
                  o.scale.set(1.02, 1.02, 1.02);
                  compositeGroup.add(o);
               }
           });
           break;
        }
        case 'city-blocks': {
           isCompositeGroup = true;
           const gridSize = 5;
           const blockSize = 0.35;
           const spacing = 0.4;
           const offset = (gridSize - 1) * spacing / 2;
           const bGeom = new THREE.BoxGeometry(blockSize, 1, blockSize);
           
           const seedRand = (s: number) => {
              const x = Math.sin(s) * 10000;
              return x - Math.floor(x);
           };

           for(let x=0; x<gridSize; x++) {
              for(let z=0; z<gridSize; z++) {
                 const height = 0.4 + seedRand((x+1) * 10 + z) * 2.2;
                 const bMesh = new THREE.Mesh(bGeom, baseColorMaterial);
                 bMesh.scale.y = height;
                 bMesh.position.set(x * spacing - offset, (height - 1) / 2, z * spacing - offset);
                 compositeGroup.add(bMesh);
                 
                 if (overlayMaterial) {
                    const o = new THREE.Mesh(bGeom, overlayMaterial);
                    o.scale.set(1.02, height * 1.02, 1.02);
                    o.position.copy(bMesh.position);
                    compositeGroup.add(o);
                 }
              }
           }
           compositeGroup.position.y = -0.5;
           break;
        }
        case 'puffy-cube': {
           geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6, 64, 64, 64);
           const pos = geometry.attributes.position;
           for(let i=0; i<pos.count; i++) {
               const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
               const s = v.clone().normalize().multiplyScalar(1.2);
               v.lerp(s, 0.4);
               
               const ax = Math.abs(v.x), ay = Math.abs(v.y), az = Math.abs(v.z);
               let cx = v.x, cy = v.y, cz = v.z;
               if (ax > ay && ax > az) { cy *= 5; cz *= 5; }
               else if (ay > ax && ay > az) { cx *= 5; cz *= 5; }
               else { cx *= 5; cy *= 5; }
               
               const quilt = 0.05 * Math.sin(cx) * Math.sin(cy) * Math.sin(cz);
               const finalV = v.add(v.clone().normalize().multiplyScalar(quilt));
               pos.setXYZ(i, finalV.x, finalV.y, finalV.z);
           }
           geometry.computeVertexNormals();
           break;
        }
        case 'gears': {
          isCompositeGroup = true;
          const makeGear = () => {
             const gGroup = new THREE.Group();
             const core = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32), baseColorMaterial);
             const rim = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.15, 16, 64), baseColorMaterial);
             rim.rotation.x = Math.PI/2;
             gGroup.add(core);
             gGroup.add(rim);
             
             if (overlayMaterial) {
                 const coreO = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32), overlayMaterial);
                 coreO.scale.set(1.02, 1.05, 1.02);
                 const rimO = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.15, 16, 64), overlayMaterial);
                 rimO.rotation.x = Math.PI/2;
                 rimO.scale.set(1.02, 1.02, 1.02);
                 gGroup.add(coreO);
                 gGroup.add(rimO);
             }

             const numTeeth = 16;
             const toothGeom = new THREE.BoxGeometry(0.2, 0.3, 0.3);
             for(let i=0; i<numTeeth; i++) {
                const angle = (i/numTeeth) * Math.PI * 2;
                const tooth = new THREE.Mesh(toothGeom, baseColorMaterial);
                tooth.position.set(Math.cos(angle)*0.85, 0, Math.sin(angle)*0.85);
                tooth.rotation.y = -angle;
                gGroup.add(tooth);
                
                if (overlayMaterial) {
                   const toothO = new THREE.Mesh(toothGeom, overlayMaterial);
                   toothO.position.copy(tooth.position);
                   toothO.rotation.copy(tooth.rotation);
                   toothO.scale.set(1.05, 1.05, 1.05);
                   gGroup.add(toothO);
                }
             }
             return gGroup;
          };
          
          const gear1 = makeGear();
          gear1.position.set(-0.85, 0, 0);
          
          const gear2 = makeGear();
          gear2.position.set(0.85, 0, 0);
          gear2.rotation.y = (Math.PI / 16); 
          
          compositeGroup.add(gear1);
          compositeGroup.add(gear2);
          
          compositeGroup.rotation.x = Math.PI/4;
          compositeGroup.rotation.z = Math.PI/4;
          break;
        }
        case 'crater-moon': {
           geometry = new THREE.SphereGeometry(1.3, 128, 128);
           const pos = geometry.attributes.position;
           const craters: {p: THREE.Vector3, r: number}[] = [];
           for(let i=0; i<25; i++) {
               const r = 0.1 + Math.sin(i*123) * 0.3; // stable random
               const p = new THREE.Vector3(
                  Math.sin(i*11), Math.cos(i*23), Math.sin(i*37)
               ).normalize().multiplyScalar(1.3);
               craters.push({p, r: Math.abs(r)});
           }
           
           for(let i=0; i<pos.count; i++) {
              const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
              let displace = 0;
              for(const c of craters) {
                 const d = v.distanceTo(c.p);
                 if (d < c.r) {
                    const dent = Math.cos((d / c.r) * Math.PI) * 0.5 + 0.5;
                    displace -= dent * (c.r * 0.4);
                 } else if (d < c.r * 1.5) {
                    const rim = Math.sin(((d - c.r)/(c.r*0.5)) * Math.PI);
                    displace += rim * (c.r * 0.1);
                 }
              }
              const noise = Math.sin(v.x*15)*Math.sin(v.y*15)*Math.sin(v.z*15)*0.015;
              v.add(v.clone().normalize().multiplyScalar(displace + noise));
              pos.setXYZ(i, v.x, v.y, v.z);
           }
           geometry.computeVertexNormals();
           break;
        }
        case 'hollow-dodeca': {
          isCompositeGroup = true;
          const baseGeom = new THREE.IcosahedronGeometry(1.3, 1);
          const edges = new THREE.EdgesGeometry(baseGeom);
          const pos = edges.attributes.position;
          const tubeGeom = new THREE.CylinderGeometry(0.04, 0.04, 1, 6);
          tubeGeom.rotateX(Math.PI / 2);
          for(let i=0; i<pos.count; i+=2) {
             const v1 = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
             const v2 = new THREE.Vector3(pos.getX(i+1), pos.getY(i+1), pos.getZ(i+1));
             const len = v1.distanceTo(v2);
             const mid = v1.clone().lerp(v2, 0.5);
             const mesh = new THREE.Mesh(tubeGeom, baseColorMaterial);
             mesh.position.copy(mid);
             mesh.lookAt(v2);
             mesh.scale.z = len;
             compositeGroup.add(mesh);
             
             if (overlayMaterial) {
                const mo = new THREE.Mesh(tubeGeom, overlayMaterial);
                mo.position.copy(mid);
                mo.lookAt(v2);
                mo.scale.set(1.2, 1.2, len * 1.05);
                compositeGroup.add(mo);
             }
          }
          break;
        }
        case 'grooved-cube': {
           isCompositeGroup = true;
           const s = 0.44;
           const g = new THREE.BoxGeometry(s, s, s);
           for (let x of [-0.5, 0, 0.5]) {
             for (let y of [-0.5, 0, 0.5]) {
               for (let z of [-0.5, 0, 0.5]) {
                  const m = new THREE.Mesh(g, baseColorMaterial);
                  m.position.set(x * 1.1, y * 1.1, z * 1.1);
                  compositeGroup.add(m);
                  if (overlayMaterial) {
                     const mo = new THREE.Mesh(g, overlayMaterial);
                     mo.position.copy(m.position);
                     mo.scale.set(1.05, 1.05, 1.05);
                     compositeGroup.add(mo);
                  }
               }
             }
           }
           break;
        }
        case 'knot-ring':
          geometry = new THREE.TorusKnotGeometry(1, 0.4, 
            Math.max(64, 30 * settings.shapeModifiers.detailLevel), 
            Math.max(16, 8 * settings.shapeModifiers.detailLevel), 
            2, 3
          );
          break;
        case 'faceted-sphere':
          geometry = new THREE.IcosahedronGeometry(1.4, Math.max(1, settings.shapeModifiers.detailLevel - 1));
          break;
        case 'exploding-cube': {
          isCompositeGroup = true;
          const numCubes = 150 + (settings.shapeModifiers.detailLevel * 20);
          for(let i=0; i<numCubes; i++) {
             const dist = 0.3 + Math.pow(Math.random(), 2) * 1.3;
             const theta = Math.random() * Math.PI * 2;
             const phi = Math.acos(2 * Math.random() - 1);
             const x = dist * Math.sin(phi) * Math.cos(theta);
             const y = dist * Math.sin(phi) * Math.sin(theta);
             const z = dist * Math.cos(phi);
             
             const size = (0.05 + Math.random() * 0.25) * (1.8 - dist); // smaller further out
             const geom = new THREE.BoxGeometry(size,size,size);
             const baseB = new THREE.Mesh(geom, baseColorMaterial);
             baseB.position.set(x,y,z);
             baseB.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
             compositeGroup.add(baseB);
             
             if (overlayMaterial) {
               const overB = new THREE.Mesh(geom, overlayMaterial);
               overB.position.set(x,y,z);
               overB.rotation.copy(baseB.rotation);
               overB.scale.set(1.05,1.05,1.05);
               compositeGroup.add(overB);
             }
          }
          break;
        }
        case 'bubble-sphere': {
          isCompositeGroup = true;
          const numBubbles = 100 + (settings.shapeModifiers.detailLevel * 30);
          const goldenRatio = (1 + Math.sqrt(5)) / 2;
          const radius = 1.1;
          const bubbleRad = 0.25 * (3 / settings.shapeModifiers.detailLevel); // scale bubbles based on count
          const bubbleGeom = new THREE.SphereGeometry(bubbleRad, 32, 32);
          
          for (let i = 0; i < numBubbles; i++) {
            const z = 1 - (2 * i) / (numBubbles - 1);
            const r = Math.sqrt(1 - z * z);
            const theta = 2 * Math.PI * i / goldenRatio;
            
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            
            const bBase = new THREE.Mesh(bubbleGeom, baseColorMaterial);
            bBase.position.set(x * radius, y * radius, z * radius);
            compositeGroup.add(bBase);
            
            if (overlayMaterial) {
              const bOverlay = new THREE.Mesh(bubbleGeom, overlayMaterial);
              bOverlay.position.set(x * radius, y * radius, z * radius);
              const sm = 1.05;
              bOverlay.scale.set(sm, sm, sm);
              compositeGroup.add(bOverlay);
            }
          }
          break;
        }
        case 'sliced-sphere': {
          isCompositeGroup = true;
          const numSlices = Math.max(5, settings.shapeModifiers.detailLevel * 2);
          const sphereRadius = 1.3;
          const sliceThickness = (sphereRadius * 2) / numSlices * 0.5; // leaving gaps
          for (let i = 0; i < numSlices; i++) {
             const y = -sphereRadius + (i + 0.5) * ((sphereRadius * 2) / numSlices);
             const sliceRadius = Math.sqrt(sphereRadius * sphereRadius - y * y);
             if (sliceRadius > 0.01) {
                const geom = new THREE.CylinderGeometry(sliceRadius, sliceRadius, sliceThickness, 64);
                const bBase = new THREE.Mesh(geom, baseColorMaterial);
                bBase.position.y = y;
                compositeGroup.add(bBase);

                if (overlayMaterial) {
                   const overB = new THREE.Mesh(geom, overlayMaterial);
                   overB.position.y = y;
                   overB.scale.set(1.02, 1.05, 1.02);
                   compositeGroup.add(overB);
                }
             }
          }
          break;
        }
        case 'particle-cloud': {
          isCompositeGroup = true;
          const numParticles = 300 + (settings.shapeModifiers.detailLevel * 100);
          const radius = 1.5;
          const particleGeom = new THREE.BoxGeometry(0.05, 0.05, 0.05);
          for (let i = 0; i < numParticles; i++) {
             const u = Math.random();
             const v = Math.random();
             const theta = u * 2.0 * Math.PI;
             const phi = Math.acos(2.0 * v - 1.0);
             const r = Math.cbrt(Math.random()) * radius;
             const x = r * Math.sin(phi) * Math.cos(theta);
             const y = r * Math.sin(phi) * Math.sin(theta);
             const z = r * Math.cos(phi);

             const pBase = new THREE.Mesh(particleGeom, baseColorMaterial);
             pBase.position.set(x, y, z);
             pBase.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
             compositeGroup.add(pBase);
          }
          break;
        }
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(0.8, 0.8, 2.0, 
            Math.max(16, 8 * settings.shapeModifiers.detailLevel), 
            Math.max(1, settings.shapeModifiers.detailLevel * 4)
          );
          break;
        case 'octahedron':
          geometry = new THREE.OctahedronGeometry(1.5, Math.max(0, settings.shapeModifiers.detailLevel - 1));
          break;
        case 'cone':
          geometry = new THREE.ConeGeometry(1.0, 2.0, 
             Math.max(16, 8 * settings.shapeModifiers.detailLevel),
             Math.max(1, settings.shapeModifiers.detailLevel * 4)
          );
          break;
        case 'dodecahedron':
          geometry = new THREE.DodecahedronGeometry(1.3, Math.max(0, settings.shapeModifiers.detailLevel - 1));
          break;
        case 'tetrahedron':
          geometry = new THREE.TetrahedronGeometry(1.5, Math.max(0, settings.shapeModifiers.detailLevel - 1));
          break;
        case 'sunCoin':
        case 'sun_coin': {
          isCompositeGroup = true;
          const coinGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.18, 64);
          const coinBaseMesh = new THREE.Mesh(coinGeom, baseColorMaterial);
          coinBaseMesh.rotation.x = Math.PI / 2;
          compositeGroup.add(coinBaseMesh);

          if (overlayMaterial) {
            const frontOverlay = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.002, 64), overlayMaterial);
            frontOverlay.rotation.x = Math.PI / 2;
            frontOverlay.position.z = 0.091;
            compositeGroup.add(frontOverlay);

            const backOverlay = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.002, 64), overlayMaterial);
            backOverlay.rotation.x = Math.PI / 2;
            backOverlay.position.z = -0.091;
            compositeGroup.add(backOverlay);
          }

          const rimGeom = new THREE.TorusGeometry(1.1, 0.08, 16, 100);
          const rimMesh = new THREE.Mesh(rimGeom, rimDetailMaterial);
          rimMesh.position.z = 0.1;
          compositeGroup.add(rimMesh);

          const rimMeshBack = new THREE.Mesh(rimGeom, rimDetailMaterial);
          rimMeshBack.position.z = -0.1;
          compositeGroup.add(rimMeshBack);

          const sunCoreGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32);
          const sunCoreMesh = new THREE.Mesh(sunCoreGeom, rimDetailMaterial);
          sunCoreMesh.rotation.x = Math.PI / 2;
          sunCoreMesh.position.z = 0.1;
          compositeGroup.add(sunCoreMesh);

          const numRays = 10;
          for (let i = 0; i < numRays; i++) {
            const angle = (i / numRays) * Math.PI * 2;
            const rayGeom = new THREE.ConeGeometry(0.08, 0.45, 4);
            const rayMesh = new THREE.Mesh(rayGeom, rimDetailMaterial);
            rayMesh.rotation.z = angle - Math.PI / 2;
            rayMesh.position.set(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, 0.1);
            compositeGroup.add(rayMesh);

            const backRayMesh = new THREE.Mesh(rayGeom, rimDetailMaterial);
            backRayMesh.rotation.z = angle - Math.PI / 2;
            backRayMesh.position.set(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, -0.1);
            compositeGroup.add(backRayMesh);
          }
          break;
        }
        case 'lotusCoin':
        case 'lotus_coin': {
          isCompositeGroup = true;
          const coinGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.18, 64);
          const coinBaseMesh = new THREE.Mesh(coinGeom, baseColorMaterial);
          coinBaseMesh.rotation.x = Math.PI / 2;
          compositeGroup.add(coinBaseMesh);

          if (overlayMaterial) {
            const frontOverlay = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.002, 64), overlayMaterial);
            frontOverlay.rotation.x = Math.PI / 2;
            frontOverlay.position.z = 0.091;
            compositeGroup.add(frontOverlay);

            const backOverlay = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.002, 64), overlayMaterial);
            backOverlay.rotation.x = Math.PI / 2;
            backOverlay.position.z = -0.091;
            compositeGroup.add(backOverlay);
          }

          const rimGeom = new THREE.TorusGeometry(1.1, 0.08, 16, 100);
          const rimMesh = new THREE.Mesh(rimGeom, rimDetailMaterial);
          rimMesh.position.z = 0.1;
          compositeGroup.add(rimMesh);

          const rimMeshBack = new THREE.Mesh(rimGeom, rimDetailMaterial);
          rimMeshBack.position.z = -0.1;
          compositeGroup.add(rimMeshBack);

          const numPetals = 8;
          for (let i = 0; i < numPetals; i++) {
            const angle = (i / numPetals) * Math.PI * 2;
            const petalGeom = new THREE.SphereGeometry(0.24, 16, 16);

            const petalMesh = new THREE.Mesh(petalGeom, rimDetailMaterial);
            petalMesh.scale.set(0.65, 1.3, 0.15);
            petalMesh.rotation.z = angle;
            petalMesh.rotation.x = 0.15 * Math.sin(angle);
            petalMesh.rotation.y = -0.15 * Math.cos(angle);
            petalMesh.position.set(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, 0.1);
            compositeGroup.add(petalMesh);

            const petalMeshBack = new THREE.Mesh(petalGeom, rimDetailMaterial);
            petalMeshBack.scale.set(0.65, 1.3, 0.15);
            petalMeshBack.rotation.z = angle;
            petalMeshBack.rotation.x = -0.15 * Math.sin(angle);
            petalMeshBack.rotation.y = 0.15 * Math.cos(angle);
            petalMeshBack.position.set(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, -0.1);
            compositeGroup.add(petalMeshBack);
          }

          const centerGeom = new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
          const centerMesh = new THREE.Mesh(centerGeom, rimDetailMaterial);
          centerMesh.rotation.x = Math.PI / 2;
          centerMesh.position.z = 0.15;
          compositeGroup.add(centerMesh);
          break;
        }
        case 'arrowTarget':
        case 'arrow_target': {
          isCompositeGroup = true;
          const targetGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.15, 64);
          const baseBoard = new THREE.Mesh(targetGeom, baseColorMaterial);
          baseBoard.rotation.x = Math.PI / 2;
          compositeGroup.add(baseBoard);

          if (overlayMaterial) {
            const frontOverlay = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.002, 64), overlayMaterial);
            frontOverlay.rotation.x = Math.PI / 2;
            frontOverlay.position.z = 0.076;
            compositeGroup.add(frontOverlay);

            const backOverlay = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.002, 64), overlayMaterial);
            backOverlay.rotation.x = Math.PI / 2;
            backOverlay.position.z = -0.076;
            compositeGroup.add(backOverlay);
          }

          const rings = [0.95, 0.65, 0.35];
          rings.forEach((radius, sIdx) => {
            const ringGeom = new THREE.TorusGeometry(radius, 0.05, 12, 64);
            const rMesh = new THREE.Mesh(ringGeom, rimDetailMaterial);
            rMesh.position.z = 0.08 + sIdx * 0.01;
            compositeGroup.add(rMesh);

            const rMeshBack = new THREE.Mesh(ringGeom, rimDetailMaterial);
            rMeshBack.position.z = -0.08 - sIdx * 0.01;
            compositeGroup.add(rMeshBack);
          });

          const bulletGeom = new THREE.SphereGeometry(0.12, 16, 16);
          const bulletMesh = new THREE.Mesh(bulletGeom, rimDetailMaterial);
          bulletMesh.scale.set(1.0, 1.0, 0.5);
          bulletMesh.position.z = 0.08;
          compositeGroup.add(bulletMesh);

          const shaftGeom = new THREE.CylinderGeometry(0.024, 0.024, 1.2, 8);
          const shaftMesh = new THREE.Mesh(shaftGeom, rimDetailMaterial);
          shaftMesh.rotation.x = -Math.PI / 4;
          shaftMesh.rotation.y = Math.PI / 6;
          shaftMesh.position.set(-0.35, 0.35, 0.5);
          compositeGroup.add(shaftMesh);

          const headGeom = new THREE.ConeGeometry(0.07, 0.15, 6);
          const headMesh = new THREE.Mesh(headGeom, rimDetailMaterial);
          headMesh.rotation.x = -Math.PI / 4 + Math.PI;
          headMesh.rotation.y = Math.PI / 6;
          headMesh.position.set(0, 0, 0.1);
          compositeGroup.add(headMesh);

          for (let f = 0; f < 3; f++) {
            const fAngle = (f / 3) * Math.PI * 2;
            const fletchGeom = new THREE.BoxGeometry(0.01, 0.08, 0.18);
            const fMesh = new THREE.Mesh(fletchGeom, rimDetailMaterial);
            fMesh.position.set(
              -0.7 + Math.cos(fAngle) * 0.05,
              0.7 + Math.sin(fAngle) * 0.05,
              0.9
            );
            fMesh.rotation.x = -Math.PI / 4;
            fMesh.rotation.y = Math.PI / 6;
            fMesh.rotation.z = fAngle;
            compositeGroup.add(fMesh);
          }
          break;
        }
        case 'dollarCoin':
        case 'dollar_coin': {
          isCompositeGroup = true;
          const coinGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.18, 64);
          const coinBaseMesh = new THREE.Mesh(coinGeom, baseColorMaterial);
          coinBaseMesh.rotation.x = Math.PI / 2;
          compositeGroup.add(coinBaseMesh);

          if (overlayMaterial) {
            const frontOverlay = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.002, 64), overlayMaterial);
            frontOverlay.rotation.x = Math.PI / 2;
            frontOverlay.position.z = 0.091;
            compositeGroup.add(frontOverlay);

            const backOverlay = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.002, 64), overlayMaterial);
            backOverlay.rotation.x = Math.PI / 2;
            backOverlay.position.z = -0.091;
            compositeGroup.add(backOverlay);
          }

          const rimGeom = new THREE.TorusGeometry(1.1, 0.08, 16, 100);
          const rimMesh = new THREE.Mesh(rimGeom, rimDetailMaterial);
          rimMesh.position.z = 0.1;
          compositeGroup.add(rimMesh);

          const rimMeshBack = new THREE.Mesh(rimGeom, rimDetailMaterial);
          rimMeshBack.position.z = -0.1;
          compositeGroup.add(rimMeshBack);

          const createDollarLogo = (isFront: boolean) => {
            const zOff = isFront ? 0.11 : -0.11;
            const logoGroup = new THREE.Group();

            const barGeom = new THREE.CylinderGeometry(0.045, 0.045, 1.2, 16);
            const barMesh = new THREE.Mesh(barGeom, rimDetailMaterial);
            barMesh.position.set(0, 0, zOff);
            logoGroup.add(barMesh);

            const archRad = 0.25;
            const archTub = 0.052;

            const topLoopGeom = new THREE.TorusGeometry(archRad, archTub, 16, 32, Math.PI * 1.5 + 0.1);
            const topLoop = new THREE.Mesh(topLoopGeom, rimDetailMaterial);
            topLoop.position.set(-0.06, 0.25, zOff);
            topLoop.rotation.z = -Math.PI / 4;
            logoGroup.add(topLoop);

            const bottomLoopGeom = new THREE.TorusGeometry(archRad, archTub, 16, 32, Math.PI * 1.5 + 0.1);
            const bottomLoop = new THREE.Mesh(bottomLoopGeom, rimDetailMaterial);
            bottomLoop.position.set(0.06, -0.25, zOff);
            bottomLoop.rotation.z = Math.PI * 0.75;
            logoGroup.add(bottomLoop);

            return logoGroup;
          };

          compositeGroup.add(createDollarLogo(true));
          compositeGroup.add(createDollarLogo(false));
          break;
        }
        case 'torusKnot':
        default:
          geometry = new THREE.TorusKnotGeometry(0.85, 0.28, 
            Math.max(64, 30 * settings.shapeModifiers.detailLevel), 
            Math.max(8, 6 * settings.shapeModifiers.detailLevel)
          );
          break;
      }

      if (!isCompositeGroup && geometry) {
        applyShapeModifiers(geometry);
      } else if (isCompositeGroup) {
        compositeGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            // Ensure we aren't modifying a shared geometry among multiple instances
            if (mesh.geometry) {
               mesh.geometry = mesh.geometry.clone(); 
               applyShapeModifiers(mesh.geometry);
            }
          }
        });
      }

      if (isCompositeGroup) {
        compositeGroup.scale.set(1.0, 1.0, 1.0);
        activeMesh = compositeGroup;
      } else if (geometry) {
        const shapeGroup = new THREE.Group();
        const mods = settings.shapeModifiers;
        
        let shouldRenderBaseMesh = true;

        if (mods.innerCoreSize > 0) {
          const coreGeom = new THREE.SphereGeometry(mods.innerCoreSize, 64, 64);
          const coreMesh = new THREE.Mesh(coreGeom, baseColorMaterial);
          shapeGroup.add(coreMesh);
          
          // If inner core is active, user likely wants the base to be transparent or wireframe
          if (settings.material.surface === 'solid' && mods.wireframeOpacity > 0.5) {
             shouldRenderBaseMesh = false; // Hide base solid so we can see the core and wireframe shell
          }
        }

        if (shouldRenderBaseMesh) {
          const baseMesh = new THREE.Mesh(geometry, baseColorMaterial);
          shapeGroup.add(baseMesh);
        }

        const latticeMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0xffffff),
          metalness: 0.9,
          roughness: 0.1,
          clearcoat: 1.0,
        });

        if (mods.wireframeOpacity > 0) {
          const wireGeom = new THREE.WireframeGeometry(geometry);
          const wireMat = new THREE.LineBasicMaterial({ 
            color: new THREE.Color(0xffffff),
            transparent: true,
            opacity: mods.wireframeOpacity,
            depthTest: true
          });
          const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
          shapeGroup.add(wireMesh);
        }

        if (mods.vertexNodes > 0 && geometry.attributes.position) {
          const pos = geometry.attributes.position;
          const uniquePositions: THREE.Vector3[] = [];
          const setKeys = new Set<string>();
          for(let i = 0; i < pos.count; i++) {
             const x = pos.getX(i);
             const y = pos.getY(i);
             const z = pos.getZ(i);
             const k = `${x.toFixed(3)}_${y.toFixed(3)}_${z.toFixed(3)}`;
             if(!setKeys.has(k)) {
                setKeys.add(k);
                uniquePositions.push(new THREE.Vector3(x, y, z));
             }
          }
          
          const nodeGeom = new THREE.SphereGeometry(mods.vertexNodes, 16, 16);
          const instancedNodes = new THREE.InstancedMesh(nodeGeom, latticeMaterial, uniquePositions.length);
          const dummy = new THREE.Object3D();
          uniquePositions.forEach((p, i) => {
             dummy.position.copy(p);
             dummy.updateMatrix();
             instancedNodes.setMatrixAt(i, dummy.matrix);
          });
          shapeGroup.add(instancedNodes);
        }

        if (overlayMaterial && shouldRenderBaseMesh) {
          const overlayMesh = new THREE.Mesh(geometry, overlayMaterial);
          let scaleMultiplier = 1.003;
          if (shapeKey === 'torus') scaleMultiplier = 1.006;
          if (shapeKey === 'torusKnot') scaleMultiplier = 1.005;
          if (shapeKey === 'sphere') scaleMultiplier = 1.002;

          overlayMesh.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
          shapeGroup.add(overlayMesh);
        }
        activeMesh = shapeGroup;
      }
    } 
    else if (sourceMode === 'text') {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffffff'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const fontWeight = fontBold ? 'bold' : 'normal';
        ctx.font = `${fontWeight} ${settings.fontSize * 1.8}px ${settings.fontFamily ?? 'Inter'}, sans-serif`;
        
        ctx.fillText(textStr.toUpperCase(), canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `400 24px monospace`;
        ctx.fillText('H A L F T O N E', canvas.width / 2, canvas.height / 2 + 100);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const geometry = new THREE.PlaneGeometry(3.6, 1.8);
      
      const textGroup = new THREE.Group();

      const textBaseParams: any = {
        color: new THREE.Color(settings.material.color),
        roughness: settings.material.roughness,
        metalness: settings.material.metalness,
        envMapIntensity: settings.material.environmentPower,
        alphaMap: texture,
        transparent: true,
        alphaTest: 0.05,
        side: THREE.DoubleSide,
        depthWrite: false,
      };
      if (settings.material.surface === 'glass') {
        textBaseParams.transmission = 0.65;
        textBaseParams.ior = settings.material.refraction;
        textBaseParams.thickness = settings.material.thickness / 100.0;
        textBaseParams.clearcoat = 1.0;
        textBaseParams.clearcoatRoughness = 0.05;
      } else if (settings.material.surface === 'solid') {
        textBaseParams.clearcoat = 0.4;
        textBaseParams.clearcoatRoughness = 0.1;
      }
      const textBaseMaterial = new THREE.MeshPhysicalMaterial(textBaseParams);
      const baseMesh = new THREE.Mesh(geometry, textBaseMaterial);
      textGroup.add(baseMesh);

      if (overlayMaterial) {
        const textOverlayParams: any = {
          map: loadedTexture,
          color: new THREE.Color('#ffffff'),
          roughness: settings.material.roughness,
          metalness: settings.material.metalness,
          envMapIntensity: settings.material.environmentPower,
          alphaMap: texture,
          transparent: true,
          alphaTest: 0.05,
          side: THREE.DoubleSide,
          depthWrite: false,
        };
        if (settings.material.surface === 'glass') {
          textOverlayParams.transmission = 0.35;
          textOverlayParams.ior = settings.material.refraction;
          textOverlayParams.thickness = settings.material.thickness / 100.0;
          textOverlayParams.clearcoat = 1.0;
          textOverlayParams.clearcoatRoughness = 0.05;
        } else if (settings.material.surface === 'solid') {
          textOverlayParams.clearcoat = 0.4;
          textOverlayParams.clearcoatRoughness = 0.1;
        }
        const textOverlayMaterial = new THREE.MeshPhysicalMaterial(textOverlayParams);
        const overlayMesh = new THREE.Mesh(geometry, textOverlayMaterial);
        overlayMesh.position.z = 0.003;
        textGroup.add(overlayMesh);
      }

      activeMesh = textGroup;
    } 
    else if (sourceMode === 'image') {
      const renderPlaceholder = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 512, 512);

          const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 240);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, '#bbbbbb');
          grad.addColorStop(0.6, '#555555');
          grad.addColorStop(1, '#000000');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(256, 256, 220, 0, Math.PI * 2);
          ctx.fill();
        }
        return new THREE.CanvasTexture(canvas);
      };

      const finalTex = loadedTexture || renderPlaceholder();
      const geometry = new THREE.PlaneGeometry(2.6, 2.6);

      const imgMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: finalTex }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          varying vec2 vUv;
          void main() {
            vec4 texColor = texture2D(uTexture, vUv);
            gl_FragColor = texColor;
          }
        `,
        transparent: true,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, imgMaterial);
      activeMesh = mesh;
    }

    if (requestId === geometryRequestIdRef.current) {
      // 1. Completely clear any old child objects inside meshGroupRef.current
      while (meshGroupRef.current.children.length > 0) {
        const oldElem = meshGroupRef.current.children[0];
        meshGroupRef.current.remove(oldElem);
        oldElem.traverse((subChild: any) => {
          if (subChild.geometry) subChild.geometry.dispose();
          if (subChild.material) {
            if (Array.isArray(subChild.material)) {
              subChild.material.forEach((m) => m.dispose());
            } else {
              subChild.material.dispose();
            }
          }
        });
      }

      // 2. Set current mesh and add exclusive new mesh
      if (activeMesh) {
        currentMeshRef.current = activeMesh;
        meshGroupRef.current.add(activeMesh);
      }
      
      setLoading(false);
    }
  };

  // Keep geometry inputs updated
  useEffect(() => {
    updateGeometry(settings.shapeKey, settings.sourceMode, settings.textString, settings.imageSrc, settings.fontBold);
  }, [
    settings.shapeKey,
    settings.sourceMode,
    settings.textString,
    settings.imageSrc,
    settings.videoSrc,
    settings.fontBold,
    settings.material.surface,
    settings.material.color,
    settings.material.roughness,
    settings.material.metalness,
    settings.fontSize,
    settings.fontFamily,
    settings.shapeModifiers.twistAmount,
    settings.shapeModifiers.inflateAmount,
    settings.shapeModifiers.detailLevel,
    settings.shapeModifiers.rippleAmount,
    settings.shapeModifiers.rippleFrequency,
    settings.shapeModifiers.bevelSize,
    settings.shapeModifiers.vertexNodes,
    settings.shapeModifiers.wireframeOpacity,
    settings.shapeModifiers.innerCoreSize
  ]);

  // Synchronize background settings
  useEffect(() => {
    if (rendererRef.current) {
        // ALWAYS transparent clear color for the renderer canvas itself to isolate 3D.
        rendererRef.current.setClearColor(0x000000, 0);
        
        // Use mainScene background for app UI
        if (mainSceneRef.current) {
            mainSceneRef.current.background = settings.background.transparent 
                ? null 
                : new THREE.Color(settings.background.color);
        }
    }
  }, [settings.background.transparent, settings.background.color]);

  // Primary scene and shader compilation
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Create custom WebGL context
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const mainScene = new THREE.Scene();
    mainSceneRef.current = mainScene;

    // Generate beautiful glossy studio reflections for realistic metalness & roughness
    const generateStudioEnvMap = (webGlRenderer: THREE.WebGLRenderer) => {
      const pmremGenerator = new THREE.PMREMGenerator(webGlRenderer);
      pmremGenerator.compileEquirectangularShader();

      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Deep cosmic ambient gradient with vibrant reflection spots
        const grad = ctx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, '#555562');
        grad.addColorStop(0.5, '#1e1e24');
        grad.addColorStop(1, '#050508');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 256);

        // Bright studio spotlights that reflect gorgeous shiny dots
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(160, 70, 55, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ececff';
        ctx.beginPath();
        ctx.arc(380, 110, 40, 0, Math.PI * 2);
        ctx.fill();

        // Secondary soft highlights
        ctx.fillStyle = '#dddfff';
        ctx.beginPath();
        ctx.arc(260, 190, 75, 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      const renderTarget = pmremGenerator.fromEquirectangular(texture);
      texture.dispose();
      pmremGenerator.dispose();
      return renderTarget.texture;
    };

    const envTexture = generateStudioEnvMap(renderer);
    mainScene.environment = envTexture;
    envTextureRef.current = envTexture;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, settings.distance);
    cameraRef.current = camera;

    // Setup Mesh group
    const meshGroup = new THREE.Group();
    mainScene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Default Rotations
    targetRotationRef.current = { x: 0.3, y: 0.4 };
    currentRotationRef.current = { x: 0.3, y: 0.4 };
    meshRotationXRef.current = 0.3;
    meshRotationYRef.current = 0.4;
    meshGroup.rotation.set(0.3, 0.4, 0);

    // Setup basic studio lighting that will map to smooth halftone contrast gradient
    const ambientLight = new THREE.AmbientLight(0xffffff, settings.lighting.ambientIntensity);
    mainScene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const primaryLight = new THREE.DirectionalLight(0xffffff, settings.lighting.intensity);
    mainScene.add(primaryLight);
    primaryLightRef.current = primaryLight;

    const fillLight = new THREE.DirectionalLight(0xffffff, settings.lighting.fillIntensity);
    mainScene.add(fillLight);
    fillLightRef.current = fillLight;

    // Atmospheric Particle Field setup
    const pointsGeom = new THREE.BufferGeometry();
    const pointsCount = 2000;
    const coords = new Float32Array(pointsCount * 3);
    for(let i=0; i<pointsCount * 3; i++) coords[i] = (Math.random() - 0.5) * 15;
    pointsGeom.setAttribute('position', new THREE.BufferAttribute(coords, 3));
    const pointsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.015,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true
    });
    const particles = new THREE.Points(pointsGeom, pointsMat);
    mainScene.add(particles);
    particlesRef.current = particles;

    // Position light based on input angle
    const angleRad = (settings.lighting.angleDegrees * Math.PI) / 180;
    primaryLight.position.set(Math.cos(angleRad) * 4.0, settings.lighting.height, Math.sin(angleRad) * 4.0);
    fillLight.position.set(-Math.cos(angleRad) * 3.0, -settings.lighting.height * 0.3, -Math.sin(angleRad) * 3.0);

    // BUILD DEEPLY CUSTOM CUSTOM SCREEN-SPACE POSTPROCESSING ENGINE
    // WebGLRenderTarget holds the rendered un-halftoned 3D shape
    const renderTarget = new THREE.WebGLRenderTarget(width * window.devicePixelRatio, height * window.devicePixelRatio, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    renderTargetRef.current = renderTarget;

    // Full screen 2D post scene
    const postScene = new THREE.Scene();
    postSceneRef.current = postScene;

    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    postCameraRef.current = postCamera;

    // Dynamic Shader uniform variables
    const toneTargetCode = settings.halftone.toneTarget === 'light' ? 0 : 1;

    const shaderMaterial = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 uResolution;
        uniform float uScale;
        uniform float uPower;
        uniform float uWidth;
        uniform int uToneTarget;
        uniform vec4 uPatternWeights;
        uniform vec3 uPatternColor;
        uniform vec3 uHoverColor;
        uniform float uHoverProgress;
        uniform bool uTransparent;
        uniform vec3 uBgColor;
        uniform bool uHalftoneEnabled;
        uniform float uContrast;
        uniform vec2 uDragOffset;
        uniform bool uDragFlowEnabled;
        uniform float uGridAngle;
        uniform bool uUseImageColors;
        uniform float uShadowOpacity;
        uniform float uShadowBlur;
        uniform float uTime;
        uniform float uWaveAmplitude;
        uniform float uWaveFrequency;
        uniform float uShadowToneIntensity;
        uniform float uShadowToneBlur;
        uniform bool uBloomEnabled;
        uniform float uBloomIntensity;
        uniform int uGradientCount;
        uniform vec3 uGradientColors[8];
        uniform float uGradientOffsets[8];
        uniform bool uGradientAnimate;
        uniform float uGradientSpeed;
        uniform bool uGradientEnabled;

        varying vec2 vUv;

        vec3 getGradient(vec2 uv) {
            float t = uv.x;
            if (uGradientAnimate) {
                t = fract(t + uTime * uGradientSpeed);
            }
            vec3 color = uGradientColors[0];
            for (int i = 0; i < 7; i++) {
                if (i < uGradientCount - 1) {
                    float stop = uGradientOffsets[i];
                    float nextStop = uGradientOffsets[i+1];
                    if (t >= stop && t <= nextStop) {
                        float mixT = (t - stop) / (nextStop - stop);
                        color = mix(uGradientColors[i], uGradientColors[i+1], mixT);
                    }
                }
            }
            return color;
        }

        void main() {
          vec4 sceneColor = texture2D(tDiffuse, vUv);
          
          if (!uHalftoneEnabled) {
            if (sceneColor.a < 0.05) {
              if (uTransparent) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
              } else {
                gl_FragColor = vec4(uGradientEnabled ? getGradient(vUv) : uBgColor, 1.0);
              }
            } else {
              gl_FragColor = vec4(sceneColor.rgb, sceneColor.a);
            }
            return;
          }

          // Ambient Masking: halftone renders only where shape exists
          float mask = sceneColor.a;
          
          if (mask < 0.05) {
            if (uTransparent) {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            } else {
              gl_FragColor = vec4(uGradientEnabled ? getGradient(vUv) : uBgColor, 1.0);
            }
            return;
          }

          // Calculate visual brightness with dynamic contrast correction
          float luminance = dot(sceneColor.rgb, vec3(0.299, 0.587, 0.114));
          luminance = clamp((luminance - 0.5) * uContrast + 0.5, 0.0, 1.0);
          
          // Reverse if targeting dark or light
          float val = (uToneTarget == 0) ? luminance : (1.0 - luminance);
          
          // S-curve for punchier shadow dots
          if (uToneTarget == 1) {
            val = pow(val, uShadowToneIntensity); 
          }

          // Setup halftone pattern grid cells
          vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
          vec2 gridUv = vUv - 0.5;
          gridUv.x *= aspect.x; // Force perfectly circular grid alignments

          // Rotate grid lines by uGridAngle
          float s = sin(uGridAngle);
          float c = cos(uGridAngle);
          gridUv = vec2(gridUv.x * c - gridUv.y * s, gridUv.x * s + gridUv.y * c);

          gridUv *= uScale;

          // Apply rhythmic sway animation to make the pattern appear liquid
          if (uWaveAmplitude > 0.0) {
            float swayX = sin(gridUv.y * 0.5 + uTime * uWaveFrequency) * uWaveAmplitude;
            float swayY = cos(gridUv.x * 0.5 + uTime * uWaveFrequency) * uWaveAmplitude;
            gridUv += vec2(swayX, swayY);
          }

          // Apply drag flow distortion
          if (uDragFlowEnabled) {
            gridUv += uDragOffset * 3.5;
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

          // Contrast threshold sizing
          float thresholdRadius = val * uWidth;
          float fuzz = max(0.005, uPower);

          // Compute smooth shape borders
          float patternAlpha = 1.0 - smoothstep(thresholdRadius - fuzz, thresholdRadius + fuzz, distValue);
          
          // For shadow-tone mode, if it's transparent, we want the bright areas to remain visible as highlights?
          // No, standard halftone replaces everything. 
          // But maybe we can give a bit of leakage for highlights to make it "work" better.
          if (uToneTarget == 1 && uTransparent) {
             // In shadow-only mode on transparent, allow some object color in highlights
             patternAlpha = max(patternAlpha, (1.0 - val) * uShadowToneBlur);
          }

          patternAlpha = clamp(patternAlpha * mask, 0.0, 1.0);

          // Interpolated active pattern colors (supports premium hover transit)
          vec3 activeColor = mix(uPatternColor, uHoverColor, uHoverProgress);
          
          if (uUseImageColors) {
            activeColor = sceneColor.rgb;
          } else {
            // Incorporate real-time 3D lighting, reflections, and glassy depth into the dot color!
            // First calculate luminance of the 3D scene point to modulate the dot's intensity.
            float sceneLuma = dot(sceneColor.rgb, vec3(0.299, 0.587, 0.114));
            
            // Soft shadow blur sampling
            float blurredLuma = 0.0;
            if (uShadowBlur > 0.0) {
              float blurAmount = uShadowBlur * 0.003;
              blurredLuma += dot(texture2D(tDiffuse, vUv + vec2(-blurAmount, -blurAmount)).rgb, vec3(0.299, 0.587, 0.114));
              blurredLuma += dot(texture2D(tDiffuse, vUv + vec2(0.0, -blurAmount)).rgb, vec3(0.299, 0.587, 0.114));
              blurredLuma += dot(texture2D(tDiffuse, vUv + vec2(blurAmount, -blurAmount)).rgb, vec3(0.299, 0.587, 0.114));
              blurredLuma += dot(texture2D(tDiffuse, vUv + vec2(-blurAmount, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
              blurredLuma += dot(texture2D(tDiffuse, vUv).rgb, vec3(0.299, 0.587, 0.114));
              blurredLuma += dot(texture2D(tDiffuse, vUv + vec2(blurAmount, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
              blurredLuma += dot(texture2D(tDiffuse, vUv + vec2(-blurAmount, blurAmount)).rgb, vec3(0.299, 0.587, 0.114));
              blurredLuma += dot(texture2D(tDiffuse, vUv + vec2(0.0, blurAmount)).rgb, vec3(0.299, 0.587, 0.114));
              blurredLuma += dot(texture2D(tDiffuse, vUv + vec2(blurAmount, blurAmount)).rgb, vec3(0.299, 0.587, 0.114));
              blurredLuma /= 9.0;
            } else {
              blurredLuma = sceneLuma;
            }

            // Blend based on shadow softness
            float finalLuma = mix(sceneLuma, blurredLuma, clamp(uShadowBlur * 0.2, 0.0, 1.0));

            // Map luma to a soft lighting intensity booster so shadows add depth, but keep colors clear
            float minIntensity = mix(1.0, 0.25, uShadowOpacity);
            float maxIntensity = mix(1.0, 1.45, uShadowOpacity);
            
            float lightingIntensity = mix(minIntensity, maxIntensity, finalLuma);
            activeColor = clamp(activeColor * lightingIntensity, 0.0, 1.0);
            
            // Extract the brilliant specular hot spots (the glistening lights reflected by glass/metal).
            // A specular glint is a highly bright component in the 3D render.
            vec3 specularGlint = clamp((sceneColor.rgb - vec3(0.48)) * 2.8, 0.0, 1.0);
            activeColor = mix(activeColor, vec3(1.0), specularGlint * 0.95);
          }

          // Bloom adjustment
          if (uBloomEnabled) {
             float brightness = dot(activeColor, vec3(0.2126, 0.7152, 0.0722));
             if (brightness > 0.6) {
                 activeColor += (brightness - 0.6) * uBloomIntensity;
             }
          }

          if (uTransparent) {
            // Alpha transparent grid dots - use premultiplied alpha for cleaner transparency
            gl_FragColor = vec4(activeColor * patternAlpha, patternAlpha);
          } else {
            // Solid filled backdrop grid dots
            gl_FragColor = vec4(mix(uBgColor, activeColor, patternAlpha), 1.0);
          }
        }
      `,
      uniforms: {
        tDiffuse: { value: renderTarget.texture },
        uResolution: { value: new THREE.Vector2(width, height) },
        uScale: { value: settings.halftone.scale },
        uPower: { value: settings.halftone.power },
        uWidth: { value: settings.halftone.width },
        uToneTarget: { value: toneTargetCode },
        uPatternWeights: { value: new THREE.Vector4(
          settings.halftone.shape === 'dots' ? 1.0 : 0.0,
          settings.halftone.shape === 'squares' ? 1.0 : 0.0,
          settings.halftone.shape === 'lines' ? 1.0 : 0.0,
          settings.halftone.shape === 'crosshatch' ? 1.0 : 0.0
        ) },
        uPatternColor: { value: new THREE.Color(settings.halftone.dashColor) },
        uHoverColor: { value: new THREE.Color(settings.halftone.hoverDashColor) },
        uHoverProgress: { value: 0.0 },
        uTransparent: { value: true },
        uBgColor: { value: new THREE.Color(settings.background.color) },
        uHalftoneEnabled: { value: settings.halftone.enabled },
        uContrast: { value: settings.halftone.imageContrast },
        uDragOffset: { value: new THREE.Vector2(0, 0) },
        uDragFlowEnabled: { value: settings.animation?.dragFlowEnabled ?? false },
        uGridAngle: { value: (settings.halftone.gridAngle * Math.PI) / 180 },
        uUseImageColors: { value: settings.halftone.useImageColors },
        uShadowOpacity: { value: settings.lighting.shadowOpacity },
        uShadowBlur: { value: settings.lighting.shadowBlur },
        uTime: { value: 0.0 },
        uWaveAmplitude: { value: settings.halftone.waveAmplitude ?? 0.0 },
        uWaveFrequency: { value: settings.halftone.waveFrequency ?? 2.5 },
        uShadowToneIntensity: { value: settings.halftone.shadowToneIntensity },
        uShadowToneBlur: { value: settings.halftone.shadowToneBlur },
        uBloomEnabled: { value: settings.bloom.enabled },
        uBloomIntensity: { value: settings.bloom.bloomIntensity },
        uGradientEnabled: { value: settings.gradient.enabled },
        uGradientCount: { value: settings.gradient.stops.length },
        uGradientColors: { value: (() => {
          const arr = settings.gradient.stops.map(s => { const c = new THREE.Color(s.color); return new THREE.Vector3(c.r, c.g, c.b); });
          while (arr.length < 8) arr.push(new THREE.Vector3(0, 0, 0));
          return arr;
        })() },
        uGradientOffsets: { value: (() => {
          const arr = settings.gradient.stops.map(s => s.offset);
          while (arr.length < 8) arr.push(0);
          return arr;
        })() },
        uGradientAnimate: { value: settings.gradient.animate },
        uGradientSpeed: { value: settings.gradient.speed },
      },
    });

    shaderMaterialRef.current = shaderMaterial;

    const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial);
    postScene.add(postQuad);

    // Bootstrap Geometry
    updateGeometry(settings.shapeKey, settings.sourceMode, settings.textString, settings.imageSrc, settings.fontBold);

    // Animation Tick Frame
    let clock = new THREE.Clock();
    let animationFrameId: number;

    const currentPatternWeights = new THREE.Vector4(
      settings.halftone.shape === 'dots' ? 1.0 : 0.0,
      settings.halftone.shape === 'squares' ? 1.0 : 0.0,
      settings.halftone.shape === 'lines' ? 1.0 : 0.0,
      settings.halftone.shape === 'crosshatch' ? 1.0 : 0.0
    );

    const tick = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Blend pattern weights smoothly to prevent snapping
      const targetWeights = new THREE.Vector4(0, 0, 0, 0);
      const activeShape = settingsRef.current.halftone.shape;
      if (activeShape === 'dots') targetWeights.x = 1.0;
      else if (activeShape === 'squares') targetWeights.y = 1.0;
      else if (activeShape === 'lines') targetWeights.z = 1.0;
      else if (activeShape === 'crosshatch') targetWeights.w = 1.0;

      const lerpSpeed = 7.0;
      const factor = 1.0 - Math.exp(-lerpSpeed * delta);
      currentPatternWeights.x += (targetWeights.x - currentPatternWeights.x) * factor;
      currentPatternWeights.y += (targetWeights.y - currentPatternWeights.y) * factor;
      currentPatternWeights.z += (targetWeights.z - currentPatternWeights.z) * factor;
      currentPatternWeights.w += (targetWeights.w - currentPatternWeights.w) * factor;

      // Lerp mouse rotations for premium spring reaction
      if (meshGroupRef.current) {
        meshGroupRef.current.rotation.z = 0;

        // Apply Drag Momentum decay and sliding when NOT dragging
        if (settingsRef.current.animation.followDragEnabled && settingsRef.current.animation.dragMomentum && !isDraggingRef.current) {
          targetRotationRef.current.y += dragMomentumVelocityRef.current.x;
          targetRotationRef.current.x += dragMomentumVelocityRef.current.y;
          
          // Apply friction damping
          const friction = 1.0 - settingsRef.current.animation.dragFriction;
          dragMomentumVelocityRef.current.x *= friction;
          dragMomentumVelocityRef.current.y *= friction;

          // Clamping to prevent flipping upside down during momentum
          targetRotationRef.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, targetRotationRef.current.x));
        } else if (!isDraggingRef.current) {
          dragMomentumVelocityRef.current = { x: 0, y: 0 };
        }

        if (!isDraggingRef.current) {
          if (settingsRef.current.animation.rotateEnabled) {
            // Rotation preset is active
            const preset = settingsRef.current.animation.rotatePreset;
            const axis = settingsRef.current.animation.rotateAxis;
            const rSpeed = settingsRef.current.animation.rotateSpeed * 1.5;
            const isPingPong = settingsRef.current.animation.rotatePingPong;

            if (preset === 'free') {
              // Free rotate on all axes
              if (isPingPong) {
                targetRotationRef.current.x = Math.sin(time * rSpeed * 0.6) * 0.4;
                targetRotationRef.current.y = Math.cos(time * rSpeed * 0.5) * 0.4;
                meshGroupRef.current.rotation.z = Math.sin(time * rSpeed * 0.3) * 0.3;
              } else {
                targetRotationRef.current.x += rSpeed * 0.4 * delta;
                targetRotationRef.current.y += rSpeed * 0.6 * delta;
                meshGroupRef.current.rotation.z = time * rSpeed * 0.25;
              }
            } else {
              // Axis rotate
              if (isPingPong) {
                const angle = Math.sin(time * rSpeed) * 0.8;
                if (axis === 'x') {
                  targetRotationRef.current.x = angle;
                } else if (axis === 'y') {
                  targetRotationRef.current.y = angle;
                } else if (axis === 'z') {
                  meshGroupRef.current.rotation.z = angle;
                }
              } else {
                if (axis === 'x') {
                  targetRotationRef.current.x += rSpeed * delta;
                } else if (axis === 'y') {
                  targetRotationRef.current.y += rSpeed * delta;
                } else if (axis === 'z') {
                  meshGroupRef.current.rotation.z = time * rSpeed;
                }
              }
            }
          } else if (settingsRef.current.animation.autoRotateEnabled) {
            // Idle auto-rotate is active
            if (settingsRef.current.sourceMode === 'shape') {
              // Slow continuous rotation
              targetRotationRef.current.y += settingsRef.current.animation.autoSpeed * delta;
            } else {
              // Gentle periodic sway on both axis for text and image modes to prevent turning sideways
              targetRotationRef.current.y = Math.sin(time * settingsRef.current.animation.autoSpeed * 1.25) * 0.24;
              targetRotationRef.current.x = 0.12 + Math.cos(time * settingsRef.current.animation.autoSpeed * 0.6) * 0.08;
            }
          }
        }

        // --- POSITION & ROTATION PHYSICS SOLVER ---
        let finalRotX = 0;
        let finalRotY = 0;

        if (settingsRef.current.animation.springReturnEnabled && !isDraggingRef.current) {
          // Dynamic mass-spring-damper ODE physical solver
          const tension = settingsRef.current.animation.springStrength * 100.0;
          const damping = settingsRef.current.animation.springDamping * 10.0;

          const diffX = targetRotationRef.current.x - meshRotationXRef.current;
          const forceX = diffX * tension - springVelocityRef.current.x * damping;
          springVelocityRef.current.x += forceX * delta;
          meshRotationXRef.current += springVelocityRef.current.x * delta;

          const diffY = targetRotationRef.current.y - meshRotationYRef.current;
          const forceY = diffY * tension - springVelocityRef.current.y * damping;
          springVelocityRef.current.y += forceY * delta;
          meshRotationYRef.current += springVelocityRef.current.y * delta;

          finalRotX = meshRotationXRef.current;
          finalRotY = meshRotationYRef.current;
        } else {
          // Standard high-frame-rate linear lerping
          meshRotationXRef.current = THREE.MathUtils.lerp(
            meshRotationXRef.current,
            targetRotationRef.current.x,
            settingsRef.current.animation.springStrength
          );
          meshRotationYRef.current = THREE.MathUtils.lerp(
            meshRotationYRef.current,
            targetRotationRef.current.y,
            settingsRef.current.animation.springStrength
          );

          finalRotX = meshRotationXRef.current;
          finalRotY = meshRotationYRef.current;
          springVelocityRef.current = { x: 0, y: 0 };
        }

        // Apply gentle background wobble (only when general rotation preset is disabled)
        if (settingsRef.current.animation.autoWobble > 0 && !isDraggingRef.current && !settingsRef.current.animation.rotateEnabled) {
          finalRotX += Math.sin(time) * settingsRef.current.animation.autoWobble * 0.15;
        }

        // --- MOUSE HOVER TILT MATHEMATICS ---
        let hoverTargetX = 0;
        let hoverTargetY = 0;

        if (settingsRef.current.animation.followHoverEnabled && !isDraggingRef.current) {
          if (isHoveredRef.current) {
            const maxTiltAngleRad = (settingsRef.current.animation.hoverRange * Math.PI) / 180;
            // Screen coordinate mapping
            hoverTargetX = -mousePositionRef.current.y * maxTiltAngleRad;
            hoverTargetY = mousePositionRef.current.x * maxTiltAngleRad;
          } else if (settingsRef.current.animation.hoverReturn) {
            hoverTargetX = 0;
            hoverTargetY = 0;
          } else {
            // Keep current hover tilt if return to center is disabled
            hoverTargetX = hoverOffsetRotationRef.current.x;
            hoverTargetY = hoverOffsetRotationRef.current.y;
          }
        }

        const easeCoeff = settingsRef.current.animation.hoverEase;
        hoverOffsetRotationRef.current.x += (hoverTargetX - hoverOffsetRotationRef.current.x) * easeCoeff;
        hoverOffsetRotationRef.current.y += (hoverTargetY - hoverOffsetRotationRef.current.y) * easeCoeff;

        // Apply additive Hover tilt offset
        finalRotX += hoverOffsetRotationRef.current.x;
        finalRotY += hoverOffsetRotationRef.current.y;

        // Commit outputs to WebGL scene mesh components
        meshGroupRef.current.rotation.x = finalRotX;
        meshGroupRef.current.rotation.y = finalRotY;

        // Breathing geometry scale
        if (settingsRef.current.animation.breatheEnabled) {
          const osc = 1.0 + Math.sin(time * settingsRef.current.animation.breatheSpeed * 3) * settingsRef.current.animation.breatheAmount;
          meshGroupRef.current.scale.set(osc, osc, osc);
        } else {
          meshGroupRef.current.scale.set(1, 1, 1);
        }

        // Float motion up and down with Drift sideways swaying
        if (settingsRef.current.animation.floatEnabled) {
          meshGroupRef.current.position.y = Math.sin(time * settingsRef.current.animation.floatSpeed * 2.5) * settingsRef.current.animation.floatAmplitude;
          const driftAngleRad = ((settingsRef.current.animation.driftAmount ?? 8) * Math.PI) / 180;
          meshGroupRef.current.position.x = Math.sin(time * settingsRef.current.animation.floatSpeed * 1.25) * Math.sin(driftAngleRad) * 0.8;
        } else {
          meshGroupRef.current.position.y = 0;
          meshGroupRef.current.position.x = 0;
        }

        // --- VERTEX / PART WAVE SWAY SYSTEM ---
        if (settingsRef.current.animation.waveEnabled) {
          const wSpeed = settingsRef.current.animation.waveSpeed;
          const wAmount = settingsRef.current.animation.waveAmount;
          meshGroupRef.current.children.forEach((child, idx) => {
            child.position.y = Math.sin(time * wSpeed * 4.0 + idx * 0.8) * wAmount * 0.12;
            child.rotation.z = Math.cos(time * wSpeed * 3.0 + idx * 0.6) * wAmount * 0.04;
          });
        } else {
          // Reset wave coordinates
          meshGroupRef.current.children.forEach((child) => {
            child.position.y = 0;
            child.rotation.z = 0;
          });
        }
      }

      // Light Sweep animation back and forth
      if (primaryLightRef.current && settingsRef.current.animation.lightSweepEnabled) {
        const sweepSpeed = settingsRef.current.animation.lightSweepSpeed ?? 0.5;
        const sweepRange = settingsRef.current.animation.lightSweepRange ?? 28; 
        const sweepHeightRange = settingsRef.current.animation.lightSweepHeightRange ?? 0.5;
        
        const dynamicAngleRad = ((settingsRef.current.lighting.angleDegrees + Math.sin(time * sweepSpeed * 3.0) * sweepRange) * Math.PI) / 180;
        const dynamicHeight = settingsRef.current.lighting.height + Math.cos(time * sweepSpeed * 2.0) * sweepHeightRange;
        primaryLightRef.current.position.set(
          Math.cos(dynamicAngleRad) * 4.0,
          dynamicHeight,
          Math.sin(dynamicAngleRad) * 4.0
        );
      }

      // Parallax interaction mapping
      if (settingsRef.current.animation.cameraParallaxEnabled && cameraRef.current) {
        const targetCamX = mousePositionRef.current.x * settingsRef.current.animation.cameraParallaxAmount;
        const targetCamY = mousePositionRef.current.y * settingsRef.current.animation.cameraParallaxAmount;
        cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, targetCamX, settingsRef.current.animation.cameraParallaxEase);
        cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, targetCamY, settingsRef.current.animation.cameraParallaxEase);
        cameraRef.current.lookAt(0, 0, 0);
      }

      // Hover color smooth interpolation blending
      const targetHover = isHoveredRef.current ? 1.0 : 0.0;
      hoverProgressRef.current = THREE.MathUtils.lerp(hoverProgressRef.current, targetHover, 0.1);
      
      // Drag Flow inertia update
      if (settingsRef.current.animation.dragFlowEnabled) {
        dragFlowOffsetRef.current.x += dragFlowVelocityRef.current.x;
        dragFlowOffsetRef.current.y += dragFlowVelocityRef.current.y;

        dragFlowVelocityRef.current.x *= (1.0 - settingsRef.current.animation.dragFlowDecay);
        dragFlowVelocityRef.current.y *= (1.0 - settingsRef.current.animation.dragFlowDecay);

        dragFlowOffsetRef.current.x *= 0.95;
        dragFlowOffsetRef.current.y *= 0.95;
      } else {
        dragFlowOffsetRef.current = { x: 0, y: 0 };
        dragFlowVelocityRef.current = { x: 0, y: 0 };
      }

      if (shaderMaterialRef.current) {
        timeRef.current = time;
        shaderMaterialRef.current.uniforms.uTime.value = time;
        shaderMaterialRef.current.uniforms.uHoverProgress.value = hoverProgressRef.current;
        shaderMaterialRef.current.uniforms.uDragOffset.value.set(
          dragFlowOffsetRef.current.x,
          dragFlowOffsetRef.current.y
        );
        shaderMaterialRef.current.uniforms.uPatternWeights.value.copy(currentPatternWeights);
        shaderMaterialRef.current.uniforms.uHalftoneEnabled.value = settingsRef.current.halftone.enabled;
        shaderMaterialRef.current.uniforms.uShadowToneIntensity.value = settingsRef.current.halftone.shadowToneIntensity;
        shaderMaterialRef.current.uniforms.uShadowToneBlur.value = settingsRef.current.halftone.shadowToneBlur;
      }

      // Update Fragmentation and Particles
      if (meshGroupRef.current) {
        const frag = settingsRef.current.shapeModifiers.fragmentationAmount || 0;
        meshGroupRef.current.children.forEach((child: any) => {
          if (child.isMesh || child.isGroup) {
            if (!child.userData.origin) child.userData.origin = child.position.clone();
            const dir = child.userData.origin.clone().normalize();
            child.position.copy(child.userData.origin).add(dir.multiplyScalar(frag));
            
            // Random micro-rotation for fragment look
            if (frag > 0.1) {
              child.rotation.x += frag * 0.005;
              child.rotation.z += frag * 0.003;
            }
          }
        });
      }

      if (particlesRef.current) {
        particlesRef.current.visible = settingsRef.current.shapeModifiers.particlesEnabled;
        if (particlesRef.current.visible) {
          particlesRef.current.material.opacity = THREE.MathUtils.lerp(particlesRef.current.material.opacity, 0.4, 0.05);
          particlesRef.current.rotation.y += 0.001;
          particlesRef.current.rotation.x += 0.0005;
        } else {
          particlesRef.current.material.opacity = 0;
        }
      }

      // Dual-Pass engine rendering
      renderer.setRenderTarget(renderTarget);
      const savedBackground = mainScene.background;
      mainScene.background = null;
      renderer.setClearColor(0x000000, 0);
      renderer.render(mainScene, camera);
      mainScene.background = savedBackground;
      
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // Resize container observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;

      // Reset sizes in structures
      if (cameraRef.current) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }

      if (rendererRef.current) {
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }

      if (renderTargetRef.current) {
        renderTargetRef.current.setSize(width * window.devicePixelRatio, height * window.devicePixelRatio);
      }

      if (shaderMaterialRef.current) {
        shaderMaterialRef.current.uniforms.uResolution.value.set(width, height);
      }
    });

    resizeObserver.observe(containerRef.current);

    // Garbage Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      renderTarget.dispose();
      if (envTextureRef.current) {
        envTextureRef.current.dispose();
      }
      
      // Clean up geometries
      mainScene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, []);

  // Adjust live parameters on existing uniform references to save GPU rebuilds
  useEffect(() => {
    if (shaderMaterialRef.current) {
      const u = shaderMaterialRef.current.uniforms;
      u.uScale.value = settings.halftone.scale;
      u.uPower.value = settings.halftone.power;
      u.uWidth.value = settings.halftone.width;
      u.uToneTarget.value = settings.halftone.toneTarget === 'light' ? 0 : 1;
      u.uPatternColor.value.set(settings.halftone.dashColor);
      u.uHoverColor.value.set(settings.halftone.hoverDashColor);
      u.uTransparent.value = settings.background.transparent;
      u.uBgColor.value.set(settings.background.color);
      u.uHalftoneEnabled.value = settings.halftone.enabled;
      u.uContrast.value = settings.halftone.imageContrast;
      u.uDragFlowEnabled.value = settings.animation?.dragFlowEnabled ?? false;
      u.uGridAngle.value = (settings.halftone.gridAngle * Math.PI) / 180;
      u.uUseImageColors.value = settings.halftone.useImageColors;
      u.uShadowOpacity.value = settings.lighting.shadowOpacity;
      u.uShadowBlur.value = settings.lighting.shadowBlur;
      u.uWaveAmplitude.value = settings.halftone.waveAmplitude ?? 0.0;
      u.uWaveFrequency.value = settings.halftone.waveFrequency ?? 2.5;
      u.uShadowToneIntensity.value = settings.halftone.shadowToneIntensity;
      u.uShadowToneBlur.value = settings.halftone.shadowToneBlur;
      if (u.uBloomEnabled) u.uBloomEnabled.value = settings.bloom.enabled;
      if (u.uBloomIntensity) u.uBloomIntensity.value = settings.bloom.bloomIntensity;
      if (u.uGradientEnabled) {
          u.uGradientEnabled.value = activePage === 'gradient' || settings.gradient.enabled;
          u.uGradientCount.value = settings.gradient.stops.length;
          u.uGradientColors.value = (() => {
            const arr = settings.gradient.stops.map(s => { const c = new THREE.Color(s.color); return new THREE.Vector3(c.r, c.g, c.b); });
            while (arr.length < 8) arr.push(new THREE.Vector3(0, 0, 0));
            return arr;
          })();
          u.uGradientOffsets.value = (() => {
            const arr = settings.gradient.stops.map(s => s.offset);
            while (arr.length < 8) arr.push(0);
            return arr;
          })();
          u.uGradientAnimate.value = settings.gradient.animate;
          u.uGradientSpeed.value = settings.gradient.speed;
      }
    }
    
    // Light changes
    if (primaryLightRef.current && fillLightRef.current && ambientLightRef.current) {
      primaryLightRef.current.intensity = settings.lighting.intensity;
      fillLightRef.current.intensity = settings.lighting.fillIntensity;
      ambientLightRef.current.intensity = settings.lighting.ambientIntensity;
      
      const angleRad = (settings.lighting.angleDegrees * Math.PI) / 180;
      primaryLightRef.current.position.set(Math.cos(angleRad) * 4.0, settings.lighting.height, Math.sin(angleRad) * 4.0);
      fillLightRef.current.position.set(-Math.cos(angleRad) * 3.0, -settings.lighting.height * 0.3, -Math.sin(angleRad) * 3.0);
    }
  }, [settings.halftone, settings.background, settings.lighting, settings.animation?.dragFlowEnabled, settings.bloom, settings.gradient, activePage]);

  // Handle Drag rotations
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    setDragActive(true);
    previousMousePositionRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Record screen normalized mouse for parallax
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mousePositionRef.current = { x: mx, y: my };
    }

    if (!isDraggingRef.current) return;
    if (!settingsRef.current.animation.followDragEnabled) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    const sens = settingsRef.current.animation.dragSens;
    targetRotationRef.current.y += deltaX * sens;
    targetRotationRef.current.x += deltaY * sens;

    // Record kinetic velocity for drag momentum inertia
    if (settingsRef.current.animation.dragMomentum) {
      dragMomentumVelocityRef.current.x = deltaX * sens * 1.5;
      dragMomentumVelocityRef.current.y = deltaY * sens * 1.5;
    }

    // Limit X axis rotation to prevent flipping upside down
    targetRotationRef.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, targetRotationRef.current.x));

    if (settingsRef.current.animation.dragFlowEnabled) {
      dragFlowVelocityRef.current.x += deltaX * 0.003;
      dragFlowVelocityRef.current.y -= deltaY * 0.003; // Note: Screen coordinate space is inverted compared to shader space
    }

    previousMousePositionRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    setDragActive(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    // If spring return is enabled, spring back to the default coordinates upon drag release
    if (settingsRef.current.animation.springReturnEnabled) {
      if (!settingsRef.current.animation.autoRotateEnabled && !settingsRef.current.animation.rotateEnabled) {
        targetRotationRef.current = { x: 0.3, y: 0.4 };
      }
    }
  };

  const handleResetRotation = () => {
    targetRotationRef.current = { x: 0.3, y: 0.4 };
  };

  return (
    <div 
      id="viewport-frame"
      ref={containerRef} 
      className={`relative w-full h-[32rem] md:h-full flex items-center justify-center overflow-hidden border border-white/10 rounded cursor-grab active:cursor-grabbing transition-all shadow-2xl ${
        settings.background.transparent ? 'bg-[#050505]' : ''
      }`}
      style={!settings.background.transparent ? { backgroundColor: settings.background.color } : undefined}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => {
        onHoverChange(false);
        mousePositionRef.current = { x: 0, y: 0 };
      }}
      onPointerMove={handlePointerMove}
    >
      {/* Three.js Canvas Element */}
      <canvas
        id="halftone-3d-canvas"
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerEnter={() => onHoverChange(true)}
        onPointerLeave={() => onHoverChange(false)}
      />

      {/* Floating Toolbar Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-1.5">
        <button
          id="btn-zoom-in"
          onClick={() => {
            if (onChange) {
              onChange((prev) => ({ ...prev, distance: Math.max(1.5, Number((prev.distance - 0.5).toFixed(1))) }));
            }
          }}
          className="p-1.5 bg-black/80 backdrop-blur border border-white/10 text-white/60 hover:text-white rounded hover:bg-neutral-900 active:scale-95 transition-all shadow-md"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          id="btn-zoom-out"
          onClick={() => {
            if (onChange) {
              onChange((prev) => ({ ...prev, distance: Math.min(10.0, Number((prev.distance + 0.5).toFixed(1))) }));
            }
          }}
          className="p-1.5 bg-black/80 backdrop-blur border border-white/10 text-white/60 hover:text-white rounded hover:bg-neutral-900 active:scale-95 transition-all shadow-md"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          id="btn-reset-view"
          onClick={handleResetRotation}
          className="px-2 py-1 bg-black/80 backdrop-blur border border-white/10 text-white/60 hover:text-white rounded hover:bg-neutral-900 active:scale-95 transition-all shadow-md flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest font-mono"
          title="Reset View Rotation"
        >
          <RefreshCw size={10} />
          Reset Rotation
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="animate-spin text-indigo-500" size={24} />
            <span className="text-[10px] text-white/50 font-bold tracking-widest font-mono uppercase">Compiling vector grid...</span>
          </div>
        </div>
      )}

      {/* Sophisticated Dark Interaction Hints */}
      {!dragActive && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/5 backdrop-blur px-3 py-1.5 rounded border border-white/10 pointer-events-none z-10">
          <div className="w-4 h-4 border border-white/20 rounded flex items-center justify-center text-[9px] text-white/60 font-mono">L</div>
          <span className="text-[9px] uppercase tracking-widest text-white/60 font-mono">Click & Drag to Rotate</span>
        </div>
      )}
    </div>
  );
}
