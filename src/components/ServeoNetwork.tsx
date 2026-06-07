/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Copy, 
  Palette, 
  Sliders, 
  Check, 
  Undo2,
  RefreshCw,
  Maximize2,
  Circle,
  Square,
  Activity,
  ChevronRight,
  MousePointer,
  Sparkle,
  HelpCircle
} from 'lucide-react';

interface Vertex {
  id: string;
  x: number; // Fractional 0.0 to 1.0 (scales perfectly)
  y: number;
  role: 'outer' | 'inner' | 'circle' | 'left' | 'right' | 'center';
  name?: string;
  x3d?: number;
  y3d?: number;
  z3d?: number;
}

interface Line {
  fromId: string;
  toId: string;
}

interface IntersectionPoint {
  x: number;
  y: number;
  lineA: Line;
  lineB: Line;
}

export default function ServeoNetwork() {
  // --- Global Styles (Bg, Stroke, Accent Colors + Output Size) ---
  const [backgroundColor, setBackgroundColor] = useState('#ede9e0'); // Modern paper cream
  const [strokeColor, setStrokeColor] = useState('#3c3b39'); // Charcoal wireframe
  const [accentColor, setAccentColor] = useState('#ff5500'); // Neon orange highlights
  const [lineWidth, setLineWidth] = useState(1);
  const [nodeSize, setNodeSize] = useState(6);
  const [intersectionSize, setIntersectionSize] = useState(4);
  const [nodeShape, setNodeShape] = useState<'square' | 'circle' | 'none'>('square');
  const [intersectionShape, setIntersectionShape] = useState<'circle' | 'square' | 'none'>('circle');
  
  // Custom bounding Aspect Ratio relative layouts
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:2' | '16:9' | '21:9'>('3:2'); 
  const [paddingScale, setPaddingScale] = useState(0.18); // Margin padding from outline borders

  // --- Dynamic Layout Configuration states ---
  const [activeType, setActiveType] = useState<
    'Multipartite' | 'Lattice' | 'Complete' | 'Bipartite' | 'Wheel' | 'Petersen' | 'Circulant' | 'Concentric' | 'Rose' | 'Geodesic' | 'Apollonian' | 'Hypercube'
  >('Multipartite');

  // Parameters
  const [layersCount, setLayersCount] = useState(3); // Multipartite layers
  const [nodesPerLayer, setNodesPerLayer] = useState(3); // Multipartite nodes per layer
  const [multipartiteOrientation, setMultipartiteOrientation] = useState<'H' | 'V'>('V');
  const [multipartiteConnectAll, setMultipartiteConnectAll] = useState(false);

  const [latticeRows, setLatticeRows] = useState(4);
  const [latticeCols, setLatticeCols] = useState(4);
  const [latticeDiagonals, setLatticeDiagonals] = useState(true);

  const [completeVertices, setCompleteVertices] = useState(8);

  const [bipartiteLeft, setBipartiteLeft] = useState(5);
  const [bipartiteRight, setBipartiteRight] = useState(5);
  const [bipartiteSpacing, setBipartiteSpacing] = useState(0.2); // margin distance offset
  const [bipartiteOrientation, setBipartiteOrientation] = useState<'H' | 'V'>('V');

  const [wheelRim, setWheelRim] = useState(8);
  const [wheelRings, setWheelRings] = useState(1);

  const [petersenN, setPetersenN] = useState(5);
  const [petersenSkip, setPetersenSkip] = useState(2);

  const [circulantN, setCirculantN] = useState(8);
  const [circulantJump1, setCirculantJump1] = useState(true);
  const [circulantJump2, setCirculantJump2] = useState(true);
  const [circulantJump3, setCirculantJump3] = useState(false);

  const [concentricRings, setConcentricRings] = useState(3);
  const [concentricPts, setConcentricPts] = useState(6);
  const [concentricStagger, setConcentricStagger] = useState(true);

  const [roseN, setRoseN] = useState(5);
  const [roseD, setRoseD] = useState(4);
  const [rosePts, setRosePts] = useState(60);
  const [roseSkip, setRoseSkip] = useState(13);

  const [geodesicFreq, setGeodesicFreq] = useState(3);

  const [apollonianDepth, setApollonianDepth] = useState(3);

  const [hypercubeInner, setHypercubeInner] = useState(0.5);
  const [rotX, setRotX] = useState(25);
  const [rotY, setRotY] = useState(35);

  // --- Dynamic Geometry Lists ---
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [connections, setConnections] = useState<Line[]>([]);
  const [intersections, setIntersections] = useState<IntersectionPoint[]>([]);
  const [draggedVertexId, setDraggedVertexId] = useState<string | null>(null);
  const [history, setHistory] = useState<Vertex[][]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const [showLabels, setShowLabels] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isAnimated, setIsAnimated] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(0.2);

  // --- Selected & Hovered Node highlighting tags ---
  const [selectedVertexId, setSelectedVertexId] = useState<string | null>(null);
  const [hoveredVertexId, setHoveredVertexId] = useState<string | null>(null);

  // --- Manual Coordinate Overrides ---
  const [customCoords, setCustomCoords] = useState<Record<string, { x?: number; y?: number; x3d?: number; y3d?: number; z3d?: number }>>({});

  // --- Sidebar active tab ---
  const [sidebarTab, setSidebarTab] = useState<'structure' | 'animation' | 'styling'>('structure');



  // --- Custom animation Drift & Particle Pulse parameters ---
  const [driftAmplitude, setDriftAmplitude] = useState(1.5);
  const [particlePulseEnabled, setParticlePulseEnabled] = useState(true);
  const [pulseSpeed, setPulseSpeed] = useState(2.0);
  const [pulseIntensity, setPulseIntensity] = useState(3.0);
  const [pulseDensity, setPulseDensity] = useState(12.0);

  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const angleTime = useRef(0);

  // Auto-resize viewport container cleanly
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        let { width, height } = entry.contentRect;
        width = Math.max(width, 300);
        
        // Lock aspect ratios dynamically for visual prototyping elegance
        let calculatedHeight = width * 0.66; // standard 3:2
        if (aspectRatio === '1:1') calculatedHeight = width;
        else if (aspectRatio === '16:9') calculatedHeight = width * 0.5625;
        else if (aspectRatio === '21:9') calculatedHeight = width * 0.428;

        setDimensions({ width, height: Math.max(calculatedHeight, 300) });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [aspectRatio]);

  // --- Theme configurations ---
  const THEMES = {
    minimalist: { bg: '#efebe3', stroke: '#3a3a38', accent: '#ff4c00', label: 'Paper Cream' },
    charcoal: { bg: '#101012', stroke: '#505058', accent: '#ede8df', label: 'Tech Blueprint' },
    cosmic: { bg: '#030611', stroke: '#1e293b', accent: '#38bdf8', label: 'Cosmic Sky' },
    clay: { bg: '#faf5f0', stroke: '#716e6a', accent: '#059669', label: 'Organic Sage' },
    royal: { bg: '#0f0c1b', stroke: '#473d72', accent: '#fbbf24', label: 'Royal Velvet' }
  };

  const selectPresetTheme = (key: keyof typeof THEMES) => {
    const t = THEMES[key];
    setBackgroundColor(t.bg);
    setStrokeColor(t.stroke);
    setAccentColor(t.accent);
    triggerToast(`Applied ${t.label} presentation aesthetics!`);
  };

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // --- Segment Intersection Mathematics (High-Accuracy Analytical Crossing Solver) ---
  const lineIntersect = (
    p1: { x: number; y: number }, p2: { x: number; y: number },
    p3: { x: number; y: number }, p4: { x: number; y: number }
  ): { x: number; y: number } | null => {
    const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (Math.abs(denom) < 1e-9) return null; // parallel

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

    // Must intersect strictly along the segments (not at the endpoint itself to keep lines neat)
    if (ua >= 0.005 && ua <= 0.995 && ub >= 0.005 && ub <= 0.995) {
      return {
        x: p1.x + ua * (p2.x - p1.x),
        y: p1.y + ua * (p2.y - p1.y)
      };
    }
    return null;
  };

  const solveIntersections = (nodeList: Vertex[], lineList: Line[]) => {
    const found: IntersectionPoint[] = [];
    const nodeMap = new Map<string, Vertex>();
    nodeList.forEach(v => nodeMap.set(v.id, v));

    for (let i = 0; i < lineList.length; i++) {
      for (let j = i + 1; j < lineList.length; j++) {
        const lineA = lineList[i];
        const lineB = lineList[j];

        // Do not cross lines sharing a node
        if (
          lineA.fromId === lineB.fromId || lineA.fromId === lineB.toId ||
          lineA.toId === lineB.fromId || lineA.toId === lineB.toId
        ) continue;

        const vA1 = nodeMap.get(lineA.fromId);
        const vA2 = nodeMap.get(lineA.toId);
        const vB1 = nodeMap.get(lineB.fromId);
        const vB2 = nodeMap.get(lineB.toId);

        if (!vA1 || !vA2 || !vB1 || !vB2) continue;

        const p = lineIntersect(vA1, vA2, vB1, vB2);
        if (p) {
          // Merge duplicates matching very closely
          let isDup = false;
          for (const ext of found) {
            if (Math.hypot(ext.x - p.x, ext.y - p.y) < 0.003) {
              isDup = true;
              break;
            }
          }
          if (!isDup) {
            found.push({ x: p.x, y: p.y, lineA, lineB });
          }
        }
      }
    }
    setIntersections(found);
  };

  // --- Dynamic Math Generators for All 12 Types ---
  const generateVerticesAndLines = (type: typeof activeType) => {
    const list: Vertex[] = [];
    const lines: Line[] = [];
    const half = 0.5;

    switch (type) {
      case 'Multipartite': {
        const span = 1.0 - paddingScale * 2;
        for (let l = 0; l < layersCount; l++) {
          const lFrac = layersCount > 1 ? l / (layersCount - 1) : 0.5;
          for (let i = 0; i < nodesPerLayer; i++) {
            const nFrac = nodesPerLayer > 1 ? i / (nodesPerLayer - 1) : 0.5;
            
            const x = multipartiteOrientation === 'V' 
              ? paddingScale + lFrac * span 
              : paddingScale + nFrac * span;
            const y = multipartiteOrientation === 'V' 
              ? paddingScale + nFrac * span 
              : paddingScale + lFrac * span;

            list.push({
              id: `mp_${l}_${i}`,
              x,
              y,
              role: 'inner',
              name: `L${l+1}P${i+1}`
            });
          }
        }
        // Connect layers
        for (let l = 0; l < layersCount; l++) {
          for (let target = l + 1; target < layersCount; target++) {
            // adjacent check or connect all option
            if (!multipartiteConnectAll && target !== l + 1) continue;
            for (let i = 0; i < nodesPerLayer; i++) {
              for (let j = 0; j < nodesPerLayer; j++) {
                lines.push({ fromId: `mp_${l}_${i}`, toId: `mp_${target}_${j}` });
              }
            }
          }
        }
        break;
      }

      case 'Lattice': {
        const span = 1.0 - paddingScale * 2;
        for (let r = 0; r < latticeRows; r++) {
          const rFrac = latticeRows > 1 ? r / (latticeRows - 1) : 0.5;
          const y = paddingScale + rFrac * span;
          for (let c = 0; c < latticeCols; c++) {
            const cFrac = latticeCols > 1 ? c / (latticeCols - 1) : 0.5;
            const x = paddingScale + cFrac * span;
            list.push({ id: `grid_${r}_${c}`, x, y, role: 'inner', name: `R${r+1}C${c+1}` });
          }
        }
        for (let r = 0; r < latticeRows; r++) {
          for (let c = 0; c < latticeCols; c++) {
            if (c < latticeCols - 1) lines.push({ fromId: `grid_${r}_${c}`, toId: `grid_${r}_${c+1}` });
            if (r < latticeRows - 1) lines.push({ fromId: `grid_${r}_${c}`, toId: `grid_${r+1}_${c}` });
            if (latticeDiagonals && r < latticeRows - 1 && c < latticeCols - 1) {
              lines.push({ fromId: `grid_${r}_${c}`, toId: `grid_${r+1}_${c+1}` });
              lines.push({ fromId: `grid_${r}_${c+1}`, toId: `grid_${r+1}_${c}` });
            }
          }
        }
        break;
      }

      case 'Complete': {
        const r = 0.5 - paddingScale;
        for (let i = 0; i < completeVertices; i++) {
          const theta = (i / completeVertices) * 2 * Math.PI - Math.PI / 2;
          list.push({
            id: `kn_${i}`,
            x: half + r * Math.cos(theta),
            y: half + r * Math.sin(theta),
            role: 'outer',
            name: `N${i+1}`
          });
        }
        for (let i = 0; i < completeVertices; i++) {
          for (let j = i + 1; j < completeVertices; j++) {
            lines.push({ fromId: `kn_${i}`, toId: `kn_${j}` });
          }
        }
        break;
      }

      case 'Bipartite': {
        const span = 1.0 - paddingScale * 2;
        for (let i = 0; i < bipartiteLeft; i++) {
          const frac = bipartiteLeft > 1 ? i / (bipartiteLeft - 1) : 0.5;
          const x = bipartiteOrientation === 'H' ? paddingScale + frac * span : 0.5 - bipartiteSpacing;
          const y = bipartiteOrientation === 'H' ? 0.5 - bipartiteSpacing : paddingScale + frac * span;
          list.push({ id: `bp_a_${i}`, x, y, role: 'left', name: `A${i+1}` });
        }
        for (let j = 0; j < bipartiteRight; j++) {
          const frac = bipartiteRight > 1 ? j / (bipartiteRight - 1) : 0.5;
          const x = bipartiteOrientation === 'H' ? paddingScale + frac * span : 0.5 + bipartiteSpacing;
          const y = bipartiteOrientation === 'H' ? 0.5 + bipartiteSpacing : paddingScale + frac * span;
          list.push({ id: `bp_b_${j}`, x, y, role: 'right', name: `B${j+1}` });
        }
        for (let i = 0; i < bipartiteLeft; i++) {
          for (let j = 0; j < bipartiteRight; j++) {
            lines.push({ fromId: `bp_a_${i}`, toId: `bp_b_${j}` });
          }
        }
        break;
      }

      case 'Wheel': {
        const maxR = 0.5 - paddingScale;
        list.push({ id: `wh_c`, x: half, y: half, role: 'center', name: 'HUB' });

        for (let g = 1; g <= wheelRings; g++) {
          const r = maxR * (g / wheelRings);
          for (let i = 0; i < wheelRim; i++) {
            const th = (i / wheelRim) * 2 * Math.PI - Math.PI / 2;
            const nid = `wh_${g}_${i}`;
            list.push({ id: nid, x: half + r * Math.cos(th), y: half + r * Math.sin(th), role: 'circle', name: `G${g}R${i+1}` });
            
            // Rim connection cycle
            lines.push({ fromId: nid, toId: `wh_${g}_${(i + 1) % wheelRim}` });
            // Spokes integration
            if (g === 1) {
              lines.push({ fromId: `wh_c`, toId: nid });
            } else {
              lines.push({ fromId: `wh_${g-1}_${i}`, toId: nid });
            }
          }
        }
        break;
      }

      case 'Petersen': {
        const rOuter = 0.5 - paddingScale;
        const rInner = (0.5 - paddingScale) * 0.45;
        for (let i = 0; i < petersenN; i++) {
          const th = (i / petersenN) * 2 * Math.PI - Math.PI / 2;
          list.push({ id: `pet_o_${i}`, x: half + rOuter * Math.cos(th), y: half + rOuter * Math.sin(th), role: 'outer', name: `O${i+1}` });
          list.push({ id: `pet_i_${i}`, x: half + rInner * Math.cos(th), y: half + rInner * Math.sin(th), role: 'inner', name: `I${i+1}` });
          
          lines.push({ fromId: `pet_o_${i}`, toId: `pet_i_${i}` }); // connection spoke
          lines.push({ fromId: `pet_o_${i}`, toId: `pet_o_${(i + 1) % petersenN}` }); // outer cycle
          lines.push({ fromId: `pet_i_${i}`, toId: `pet_i_${(i + petersenSkip) % petersenN}` }); // star cycle
        }
        break;
      }

      case 'Circulant': {
        const r = 0.5 - paddingScale;
        for (let i = 0; i < circulantN; i++) {
          const th = (i / circulantN) * 2 * Math.PI - Math.PI / 2;
          list.push({ id: `cir_${i}`, x: half + r * Math.cos(th), y: half + r * Math.sin(th), role: 'circle', name: `C${i+1}` });
        }
        for (let i = 0; i < circulantN; i++) {
          if (circulantJump1) lines.push({ fromId: `cir_${i}`, toId: `cir_${(i + 1) % circulantN}` });
          if (circulantJump2 && circulantN > 2) lines.push({ fromId: `cir_${i}`, toId: `cir_${(i + 2) % circulantN}` });
          if (circulantJump3 && circulantN > 3) lines.push({ fromId: `cir_${i}`, toId: `cir_${(i + 3) % circulantN}` });
        }
        break;
      }

      case 'Concentric': {
        const maxR = 0.5 - paddingScale;
        for (let g = 0; g < concentricRings; g++) {
          const r = maxR * ((g + 1) / concentricRings);
          const offsetShift = concentricStagger ? (g * Math.PI) / concentricPts : 0;
          for (let i = 0; i < concentricPts; i++) {
            const th = (i / concentricPts) * 2 * Math.PI - Math.PI / 2 + offsetShift;
            const nid = `cc_${g}_${i}`;
            list.push({ id: nid, x: half + r * Math.cos(th), y: half + r * Math.sin(th), role: 'circle', name: `L${g+1}V${i+1}` });
            
            lines.push({ fromId: nid, toId: `cc_${g}_${(i + 1) % concentricPts}` });
            if (g > 0) {
              lines.push({ fromId: `cc_${g-1}_${i}`, toId: nid });
            }
          }
        }
        break;
      }

      case 'Rose': {
        const radiusMultiplier = 0.5 - paddingScale;
        const totalThetaSweep = roseD * 2 * Math.PI;
        for (let i = 0; i < rosePts; i++) {
          const th = (i / rosePts) * totalThetaSweep;
          const r = Math.cos((roseN / roseD) * th) * radiusMultiplier;
          list.push({
            id: `rose_${i}`,
            x: half + r * Math.cos(th),
            y: half + r * Math.sin(th),
            role: 'circle',
            name: `R${i+1}`
          });
        }
        for (let i = 0; i < rosePts; i++) {
          lines.push({ fromId: `rose_${i}`, toId: `rose_${(i + roseSkip) % rosePts}` });
        }
        break;
      }

      case 'Geodesic': {
        const rSize = 0.5 - paddingScale;
        list.push({ id: `geo_0_0`, x: half, y: half, role: 'center', name: 'G0' });

        for (let l = 1; l <= geodesicFreq; l++) {
          const sectorCount = 6 * l;
          const r = rSize * (l / geodesicFreq);
          for (let i = 0; i < sectorCount; i++) {
            const th = (i / sectorCount) * 2 * Math.PI - Math.PI / 2;
            const nid = `geo_${l}_${i}`;
            list.push({ id: nid, x: half + r * Math.cos(th), y: half + r * Math.sin(th), role: 'inner', name: `L${l}G${i+1}` });
            lines.push({ fromId: nid, toId: `geo_${l}_${(i + 1) % sectorCount}` });
          }
        }
        // Triangulate between sectors
        for (let l = 1; l <= geodesicFreq; l++) {
          const nextCount = 6 * l;
          if (l === 1) {
            for (let i = 0; i < nextCount; i++) {
              lines.push({ fromId: `geo_0_0`, toId: `geo_1_${i}` });
            }
          } else {
            const prevCount = 6 * (l - 1);
            for (let i = 0; i < nextCount; i++) {
              const previousMatchedIndex = Math.round((i / nextCount) * prevCount) % prevCount;
              lines.push({ fromId: `geo_${l-1}_${previousMatchedIndex}`, toId: `geo_${l}_${i}` });
              lines.push({ fromId: `geo_${l-1}_${(previousMatchedIndex + 1) % prevCount}`, toId: `geo_${l}_${i}` });
            }
          }
        }
        break;
      }

      case 'Apollonian': {
        const centers = [
          { x: 0.5, y: 0.22 },
          { x: 0.23, y: 0.72 },
          { x: 0.77, y: 0.72 },
          { x: 0.5, y: 0.54 }, // inner tangent center
          { x: 0.5, y: 0.38 }, // upper triad
          { x: 0.35, y: 0.63 }, // left triad
          { x: 0.65, y: 0.63 }, // right triad
          { x: 0.40, y: 0.45 },
          { x: 0.60, y: 0.45 },
          { x: 0.5, y: 0.64 }
        ];

        const nodeLimit = Math.min(centers.length, apollonianDepth * 3 + 1);
        const mappedCenters = centers.slice(0, nodeLimit);
        
        const innerRad = 0.5 - paddingScale;
        mappedCenters.forEach((c, idx) => {
          // Centered translation coordinates
          const x = half + (c.x - 0.5) * innerRad * 2;
          const y = half + (c.y - 0.5) * innerRad * 2;
          list.push({
            id: `ap_${idx}`,
            x,
            y,
            role: idx < 3 ? 'outer' : 'inner',
            name: `A${idx+1}`
          });
        });

        const connectionMapping = [
          [0, 1], [1, 2], [2, 0], // level 1 tangent
          [0, 3], [1, 3], [2, 3], // level 2 nesting tangent
          [0, 4], [3, 4], [1, 4], // level 3 tangent pairings
          [1, 5], [3, 5], [2, 5],
          [2, 6], [3, 6], [0, 6],
          [0, 7], [3, 7], [4, 7],
          [0, 8], [3, 8], [4, 8],
          [1, 9], [3, 9], [5, 9]
        ];

        connectionMapping.forEach(([fIdx, tIdx]) => {
          if (fIdx < list.length && tIdx < list.length) {
            lines.push({ fromId: `ap_${fIdx}`, toId: `ap_${tIdx}` });
          }
        });
        break;
      }

      case 'Hypercube': {
        const cube3DPoints = [
          { id: 'hc_o0', x3d: -1, y3d: -1, z3d: -1, isInner: false },
          { id: 'hc_o1', x3d:  1, y3d: -1, z3d: -1, isInner: false },
          { id: 'hc_o2', x3d:  1, y3d:  1, z3d: -1, isInner: false },
          { id: 'hc_o3', x3d: -1, y3d:  1, z3d: -1, isInner: false },
          { id: 'hc_o4', x3d: -1, y3d: -1, z3d:  1, isInner: false },
          { id: 'hc_o5', x3d:  1, y3d: -1, z3d:  1, isInner: false },
          { id: 'hc_o6', x3d:  1, y3d:  1, z3d:  1, isInner: false },
          { id: 'hc_o7', x3d: -1, y3d:  1, z3d:  1, isInner: false },

          { id: 'hc_i0', x3d: -1, y3d: -1, z3d: -1, isInner: true },
          { id: 'hc_i1', x3d:  1, y3d: -1, z3d: -1, isInner: true },
          { id: 'hc_i2', x3d:  1, y3d:  1, z3d: -1, isInner: true },
          { id: 'hc_i3', x3d: -1, y3d:  1, z3d: -1, isInner: true },
          { id: 'hc_i4', x3d: -1, y3d: -1, z3d:  1, isInner: true },
          { id: 'hc_i5', x3d:  1, y3d: -1, z3d:  1, isInner: true },
          { id: 'hc_i6', x3d:  1, y3d:  1, z3d:  1, isInner: true },
          { id: 'hc_i7', x3d: -1, y3d:  1, z3d:  1, isInner: true }
        ];

        const radX = (rotX * Math.PI) / 180;
        const radY = (rotY * Math.PI) / 180;

        cube3DPoints.forEach(p => {
          const custom = customCoords[p.id];
          const px3d = custom?.x3d !== undefined ? custom.x3d : p.x3d;
          const py3d = custom?.y3d !== undefined ? custom.y3d : p.y3d;
          const pz3d = custom?.z3d !== undefined ? custom.z3d : p.z3d;

          const factor = p.isInner ? hypercubeInner : 1.0;
          const px = px3d * factor;
          const py = py3d * factor;
          const pz = pz3d * factor;

          // Trigonometric Rotation transformations
          const xRotated = px * Math.cos(radY) - pz * Math.sin(radY);
          const zRotated = px * Math.sin(radY) + pz * Math.cos(radY);
          const yRotated = py * Math.cos(radX) - zRotated * Math.sin(radX);

          // Bound mappings
          const rMultiplier = (0.5 - paddingScale) * 0.9;
          list.push({
            id: p.id,
            x: half + xRotated * rMultiplier,
            y: half + yRotated * rMultiplier,
            role: p.isInner ? 'inner' : 'outer',
            name: `${p.isInner ? 'I' : 'O'}${p.id.slice(-1)}`,
            x3d: px3d,
            y3d: py3d,
            z3d: pz3d
          });
        });

        // Wire cubes coordinates
        for (let i = 0; i < 8; i++) {
          for (let j = i + 1; j < 8; j++) {
            // Hamming distance logic for adjacent vertices
            const isEdge = ((i ^ j) & 1) + (((i ^ j) & 2) >> 1) + (((i ^ j) & 4) >> 2) === 1;
            if (isEdge) {
              lines.push({ fromId: `hc_o${i}`, toId: `hc_o${j}` });
              lines.push({ fromId: `hc_i${i}`, toId: `hc_i${j}` });
            }
          }
        }
        // Connect internal shell with external shell
        for (let i = 0; i < 8; i++) {
          lines.push({ fromId: `hc_o${i}`, toId: `hc_i${i}` });
        }
        break;
      }
    }

    // Apply manual overrides for non-hypercube structures
    list.forEach(v => {
      const custom = customCoords[v.id];
      if (custom) {
        if (type !== 'Hypercube') {
          if (custom.x !== undefined) v.x = custom.x;
          if (custom.y !== undefined) v.y = custom.y;
        } else {
          if (custom.x3d !== undefined) v.x3d = custom.x3d;
          if (custom.y3d !== undefined) v.y3d = custom.y3d;
          if (custom.z3d !== undefined) v.z3d = custom.z3d;
        }
      }
    });

    return { list, lines };
  };

  // Rebuild whole configuration on state parameters changes
  const rebuildMatrix = (type: typeof activeType) => {
    // Save history coordinate state before mutations
    if (vertices.length > 0) {
      setHistory(prev => [...prev.slice(-30), [...vertices]]);
    }

    const payload = generateVerticesAndLines(type);
    setVertices(payload.list);
    setConnections(payload.lines);
    solveIntersections(payload.list, payload.lines);
  };

  useEffect(() => {
    rebuildMatrix(activeType);
  }, [
    activeType,
    layersCount,
    nodesPerLayer,
    multipartiteOrientation,
    multipartiteConnectAll,
    latticeRows,
    latticeCols,
    latticeDiagonals,
    completeVertices,
    bipartiteLeft,
    bipartiteRight,
    bipartiteSpacing,
    bipartiteOrientation,
    wheelRim,
    wheelRings,
    petersenN,
    petersenSkip,
    circulantN,
    circulantJump1,
    circulantJump2,
    circulantJump3,
    concentricRings,
    concentricPts,
    concentricStagger,
    roseN,
    roseD,
    rosePts,
    roseSkip,
    geodesicFreq,
    apollonianDepth,
    hypercubeInner,
    rotX,
    rotY,
    paddingScale,
    customCoords
  ]);

  // --- Real-Time Trigonometrical Micro-Animation Loop ---
  useEffect(() => {
    if (!isAnimated) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    let lastTime = performance.now();
    const tick = (now: number) => {
      const delta = (now - lastTime) * 0.001 * animationSpeed;
      lastTime = now;
      angleTime.current += delta;

      setVertices(prev => {
        const drift = prev.map((v, idx) => {
          let dx = 0;
          let dy = 0;

          if (activeType === 'Hypercube') {
            // Spin hypercube rotations in rotation angles state directly but without storing history
            return v; 
          } else {
            // Orbiting or soft breathing offsets
            const angleOffset = angleTime.current * 1.5 + idx;
            dx = Math.sin(angleOffset) * 0.0006 * driftAmplitude;
            dy = Math.cos(angleOffset * 0.8) * 0.0006 * driftAmplitude;
          }

          return {
            ...v,
            x: Math.max(0.01, Math.min(0.99, v.x + dx)),
            y: Math.max(0.01, Math.min(0.99, v.y + dy))
          };
        });

        solveIntersections(drift, connections);
        return drift;
      });

      // For automatic smooth hypercube interactive spinning with intensity speedup
      if (activeType === 'Hypercube') {
        const intensityFactor = driftAmplitude / 1.5;
        setRotY(prev => (prev + animationSpeed * 2 * intensityFactor) % 360);
        setRotX(prev => (prev + animationSpeed * 0.8 * intensityFactor) % 360);
      }

      animationFrameId.current = requestAnimationFrame(tick);
    };

    animationFrameId.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isAnimated, animationSpeed, activeType, connections, driftAmplitude]);

  // --- Pointer Click and Drag Engine ---
  const handlePointerDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    let closest: Vertex | null = null;
    let minDist = 0.055; // Generous node touch selection radius

    vertices.forEach(v => {
      const d = Math.hypot(v.x - px, v.y - py);
      if (d < minDist) {
        minDist = d;
        closest = v;
      }
    });

    if (closest) {
      setHistory(prev => [...prev.slice(-30), [...vertices]]);
      setDraggedVertexId(closest.id);
      setSelectedVertexId(closest.id);
    } else {
      setSelectedVertexId(null);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedVertexId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.max(0.005, Math.min(0.995, (e.clientX - rect.left) / rect.width));
    const py = Math.max(0.005, Math.min(0.995, (e.clientY - rect.top) / rect.height));

    if (activeType === 'Hypercube') {
      const v = vertices.find(item => item.id === draggedVertexId);
      if (!v) return;

      const px3d_raw = v.x3d !== undefined ? v.x3d : 0;
      const py3d_raw = v.y3d !== undefined ? v.y3d : 0;

      // Calculate relative delta in visual screen space
      const dx = px - v.x;
      const dy = py - v.y;

      const radX = (rotX * Math.PI) / 180;
      const radY = (rotY * Math.PI) / 180;

      const isInner = v.role === 'inner';
      const factor = isInner ? hypercubeInner : 1.0;
      const rMultiplier = (0.5 - paddingScale) * 0.9 * factor;

      // Inverse map the screen visual translation back to unprojected 3D axes
      const dxRot = dx / rMultiplier;
      const dyRot = dy / rMultiplier;

      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);

      // Solve trigonometry offsets
      const dx3d = dxRot * cosY - dyRot * sinY * sinX;
      const dy3d = dyRot * cosX;

      const finalX3d = Math.max(-3, Math.min(3, px3d_raw + dx3d));
      const finalY3d = Math.max(-3, Math.min(3, py3d_raw + dy3d));

      setCustomCoords(prev => ({
        ...prev,
        [draggedVertexId]: {
          ...prev[draggedVertexId],
          x3d: finalX3d,
          y3d: finalY3d
        }
      }));
    } else {
      // 2D manual overrides
      setCustomCoords(prev => ({
        ...prev,
        [draggedVertexId]: {
          ...prev[draggedVertexId],
          x: px,
          y: py
        }
      }));
    }
  };

  const handlePointerUp = () => {
    setDraggedVertexId(null);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));
    setVertices(previous);
    solveIntersections(previous, connections);
    triggerToast('Undo successful! Restored previous state.');
  };

  // --- Exporters Engine (Scalable vector SVG, High-Res PNG) ---
  const generateSVGContent = (width = 1200, height = 800, forceAnimated = true) => {
    const uniqueId = Math.floor(Math.random() * 1000000);
    const svgId = `serveo-svg-${uniqueId}`;

    const linesStr = connections.map((line, idx) => {
      const f = vertices.find(v => v.id === line.fromId);
      const t = vertices.find(v => v.id === line.toId);
      if (!f || !t) return '';
      return `  <line id="line-${idx}" x1="${(f.x * width).toFixed(1)}" y1="${(f.y * height).toFixed(1)}" x2="${(t.x * width).toFixed(1)}" y2="${(t.y * height).toFixed(1)}" stroke="${strokeColor}" stroke-width="${lineWidth}" opacity="0.85" />`;
    }).filter(Boolean).join('\n');

    const pulsesStr = particlePulseEnabled ? connections.map((line, idx) => {
      const f = vertices.find(v => v.id === line.fromId);
      const t = vertices.find(v => v.id === line.toId);
      if (!f || !t) return '';
      return `  <line id="pulse-${idx}" class="svg-pulse-line" x1="${(f.x * width).toFixed(1)}" y1="${(f.y * height).toFixed(1)}" x2="${(t.x * width).toFixed(1)}" y2="${(t.y * height).toFixed(1)}" stroke="${accentColor}" stroke-width="${lineWidth + (pulseIntensity * 0.45)}" stroke-dasharray="${pulseIntensity * 2.5} ${pulseDensity * 2}" stroke-dashoffset="${-angleTime.current * pulseSpeed * 35 + idx * 5}" opacity="0.7" />`;
    }).filter(Boolean).join('\n') : '';

    const nodesStr = nodeShape !== 'none' ? vertices.map(v => {
      const cx = v.x * width;
      const cy = v.y * height;
      if (nodeShape === 'square') {
        return `  <rect id="node-rect-${v.id}" x="${(cx - nodeSize).toFixed(1)}" y="${(cy - nodeSize).toFixed(1)}" width="${(nodeSize * 2).toFixed(1)}" height="${(nodeSize * 2).toFixed(1)}" fill="${accentColor}" rx="1.5" />`;
      } else {
        return `  <circle id="node-circle-${v.id}" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${nodeSize}" fill="${accentColor}" />`;
      }
    }).join('\n') : '';

    const intersStr = `<g id="intersections-group">
${intersectionShape !== 'none' ? intersections.map(item => {
      const cx = item.x * width;
      const cy = item.y * height;
      if (intersectionShape === 'square') {
        return `  <rect x="${(cx - intersectionSize).toFixed(1)}" y="${(cy - intersectionSize).toFixed(1)}" width="${(intersectionSize * 2).toFixed(1)}" height="${(intersectionSize * 2).toFixed(1)}" fill="${accentColor}" rx="1" />`;
      } else {
        return `  <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${intersectionSize}" fill="${accentColor}" />`;
      }
    }).join('\n') : ''}
</g>`;

    const labelsStr = showLabels ? vertices.map(v => {
      const tx = v.x * width;
      const ty = v.y * height - nodeSize - 5;
      return `  <text id="node-label-${v.id}" x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="${strokeColor}" font-family="monospace" font-size="10" text-anchor="middle" opacity="0.6">${v.name || v.id}</text>`;
    }).join('\n') : '';

    const scriptStr = forceAnimated ? `
  <script type="text/javascript">
  // <![CDATA[
  (function() {
    const isAnimated = true;
    if (!isAnimated) return;
    
    const scriptEl = document.currentScript;
    const svg = (scriptEl && scriptEl.ownerSVGElement) ? scriptEl.ownerSVGElement : (document.getElementById("${svgId}") || document.querySelector('svg'));
    if (!svg) return;
    const getEl = (id) => svg.querySelector('#' + id);
    const width = ${width};
    const height = ${height};
    
    const vertices = ${JSON.stringify(vertices)};
    const connections = ${JSON.stringify(connections)};
    const activeType = "${activeType}";
    const driftAmplitude = ${driftAmplitude};
    const animationSpeed = ${animationSpeed};
    const strokeColor = "${strokeColor}";
    const nodeSize = ${nodeSize};
    const nodeShape = "${nodeShape}";
    const intersectionShape = "${intersectionShape}";
    const intersectionSize = ${intersectionSize};
    const accentColor = "${accentColor}";
    const showLabels = ${showLabels};
    const paddingScale = ${paddingScale};
    const hypercubeInner = ${hypercubeInner};
    const pulseEnabled = ${particlePulseEnabled ? 'true' : 'false'};
    const pulseSpeed = ${pulseSpeed};
    const pulseIntensity = ${pulseIntensity};
    const pulseDensity = ${pulseDensity};
    const lineWidth = ${lineWidth};
    
    let angleTime = ${angleTime.current};
    let rotX = ${rotX};
    let rotY = ${rotY};
    
    let lastTime = performance.now();
    
    function solveIntersections(nodeList, lineList) {
      const found = [];
      const nodeMap = new Map();
      nodeList.forEach(v => nodeMap.set(v.id, v));
      
      function lineIntersect(p1, p2, p3, p4) {
        const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
        if (Math.abs(denom) < 1e-9) return null;
        const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
        const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;
        if (ua >= 0.005 && ua <= 0.995 && ub >= 0.005 && ub <= 0.995) {
          return {
            x: p1.x + ua * (p2.x - p1.x),
            y: p1.y + ua * (p2.y - p1.y)
          };
        }
        return null;
      }
      
      for (let i = 0; i < lineList.length; i++) {
        for (let j = i + 1; j < lineList.length; j++) {
          const lineA = lineList[i];
          const lineB = lineList[j];
          if (lineA.fromId === lineB.fromId || lineA.fromId === lineB.toId ||
              lineA.toId === lineB.fromId || lineA.toId === lineB.toId) continue;
          
          const vA1 = nodeMap.get(lineA.fromId);
          const vA2 = nodeMap.get(lineA.toId);
          const vB1 = nodeMap.get(lineB.fromId);
          const vB2 = nodeMap.get(lineB.toId);
          
          if (!vA1 || !vA2 || !vB1 || !vB2) continue;
          
          const p = lineIntersect(vA1, vA2, vB1, vB2);
          if (p) {
            let isDup = false;
            for (const ext of found) {
              if (Math.hypot(ext.x - p.x, ext.y - p.y) < 0.003) {
                isDup = true;
                break;
              }
            }
            if (!isDup) {
              found.push({ x: p.x, y: p.y });
            }
          }
        }
      }
      return found;
    }
    
    function tick(now) {
      const delta = (now - lastTime) * 0.001 * animationSpeed;
      lastTime = now;
      angleTime += delta;
      
      let currentVertices = [];
      if (activeType === 'Hypercube') {
        const intensityFactor = driftAmplitude / 1.5;
        rotY = (rotY + animationSpeed * 2 * intensityFactor) % 360;
        rotX = (rotX + animationSpeed * 0.8 * intensityFactor) % 360;
        
        const radX = (rotX * Math.PI) / 180;
        const radY = (rotY * Math.PI) / 180;
        const half = 0.5;
        
        const original3D = [
          { id: 'hc_o0', x3d: -1, y3d: -1, z3d: -1, isInner: false },
          { id: 'hc_o1', x3d:  1, y3d: -1, z3d: -1, isInner: false },
          { id: 'hc_o2', x3d:  1, y3d:  1, z3d: -1, isInner: false },
          { id: 'hc_o3', x3d: -1, y3d:  1, z3d: -1, isInner: false },
          { id: 'hc_o4', x3d: -1, y3d: -1, z3d:  1, isInner: false },
          { id: 'hc_o5', x3d:  1, y3d: -1, z3d:  1, isInner: false },
          { id: 'hc_o6', x3d:  1, y3d:  1, z3d:  1, isInner: false },
          { id: 'hc_o7', x3d: -1, y3d:  1, z3d:  1, isInner: false },
          { id: 'hc_i0', x3d: -1, y3d: -1, z3d: -1, isInner: true },
          { id: 'hc_i1', x3d:  1, y3d: -1, z3d: -1, isInner: true },
          { id: 'hc_i2', x3d:  1, y3d:  1, z3d: -1, isInner: true },
          { id: 'hc_i3', x3d: -1, y3d:  1, z3d: -1, isInner: true },
          { id: 'hc_i4', x3d: -1, y3d: -1, z3d:  1, isInner: true },
          { id: 'hc_i5', x3d:  1, y3d: -1, z3d:  1, isInner: true },
          { id: 'hc_i6', x3d:  1, y3d:  1, z3d:  1, isInner: true },
          { id: 'hc_i7', x3d: -1, y3d:  1, z3d:  1, isInner: true }
        ];
        
        original3D.forEach(p => {
          const factor = p.isInner ? hypercubeInner : 1.0;
          const px = p.x3d * factor;
          const py = p.y3d * factor;
          const pz = p.z3d * factor;
          
          const xRotated = px * Math.cos(radY) - pz * Math.sin(radY);
          const zRotated = px * Math.sin(radY) + pz * Math.cos(radY);
          const yRotated = py * Math.cos(radX) - zRotated * Math.sin(radX);
          
          const rMultiplier = (0.5 - paddingScale) * 0.9;
          currentVertices.push({
            id: p.id,
            x: half + xRotated * rMultiplier,
            y: half + yRotated * rMultiplier
          });
        });
      } else {
        currentVertices = vertices.map((v, idx) => {
          const angleOffset = angleTime * 1.5 + idx;
          const dx = Math.sin(angleOffset) * 0.035 * (driftAmplitude / 1.5);
          const dy = Math.cos(angleOffset * 0.8) * 0.035 * (driftAmplitude / 1.5);
          return {
            ...v,
            x: Math.max(0.01, Math.min(0.99, v.x + dx)),
            y: Math.max(0.01, Math.min(0.99, v.y + dy)),
            id: v.id,
            name: v.name
          };
        });
      }
      
      currentVertices.forEach(v => {
        const cx = v.x * width;
        const cy = v.y * height;
        const elCircle = getEl('node-circle-' + v.id);
        if (elCircle) {
          elCircle.setAttribute('cx', cx.toFixed(1));
          elCircle.setAttribute('cy', cy.toFixed(1));
        }
        const elRect = getEl('node-rect-' + v.id);
        if (elRect) {
          elRect.setAttribute('x', (cx - nodeSize).toFixed(1));
          elRect.setAttribute('y', (cy - nodeSize).toFixed(1));
        }
        const elLabel = getEl('node-label-' + v.id);
        if (elLabel) {
          elLabel.setAttribute('x', cx.toFixed(1));
          elLabel.setAttribute('y', (cy - nodeSize - 5).toFixed(1));
        }
      });
      
      connections.forEach((line, idx) => {
        const f = currentVertices.find(v => v.id === line.fromId);
        const t = currentVertices.find(v => v.id === line.toId);
        if (f && t) {
          const elLine = getEl('line-' + idx);
          if (elLine) {
            elLine.setAttribute('x1', (f.x * width).toFixed(1));
            elLine.setAttribute('y1', (f.y * height).toFixed(1));
            elLine.setAttribute('x2', (t.x * width).toFixed(1));
            elLine.setAttribute('y2', (t.y * height).toFixed(1));
          }
          if (pulseEnabled) {
            const elPulse = getEl('pulse-' + idx);
            if (elPulse) {
              elPulse.setAttribute('x1', (f.x * width).toFixed(1));
              elPulse.setAttribute('y1', (f.y * height).toFixed(1));
              elPulse.setAttribute('x2', (t.x * width).toFixed(1));
              elPulse.setAttribute('y2', (t.y * height).toFixed(1));
              
              const offset = -angleTime * pulseSpeed * 35 + idx * 5;
              elPulse.setAttribute('stroke-dashoffset', offset.toFixed(1));
            }
          }
        }
      });
      
      const inters = solveIntersections(currentVertices, connections);
      const intersGroup = getEl('intersections-group');
      if (intersGroup) {
        let htmlCombined = '';
        inters.forEach((item) => {
          const cx = item.x * width;
          const cy = item.y * height;
          if (intersectionShape === 'square') {
            htmlCombined += '<rect x="' + (cx - intersectionSize).toFixed(1) + '" y="' + (cy - intersectionSize).toFixed(1) + '" width="' + (intersectionSize * 2).toFixed(1) + '" height="' + (intersectionSize * 2).toFixed(1) + '" fill="' + accentColor + '" rx="1" />';
          } else if (intersectionShape !== 'none') {
            htmlCombined += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + intersectionSize + '" fill="' + accentColor + '" />';
          }
        });
        intersGroup.innerHTML = htmlCombined;
      }
      
      requestAnimationFrame(tick);
    }
    
    requestAnimationFrame(tick);
  })();
  // ]]>
  </script>` : '';

    return `<svg id="${svgId}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <!-- Created with Serveo Vector Prototyper Studio -->
  <style>
    @keyframes network-pulse-flow {
      to {
        stroke-dashoffset: -400px;
      }
    }
    .svg-pulse-line {
      animation: network-pulse-flow 12s linear infinite;
    }
    @keyframes network-container-drift {
      0%, 100% { transform: translate(0px, 0px) scale(1.0); }
      50% { transform: translate(8px, -6px) scale(1.01); }
    }
    .svg-network-container {
      transform-origin: center;
      transform-box: fill-box;
      animation: network-container-drift 12s ease-in-out infinite;
    }
  </style>
  <rect width="100%" height="100%" fill="${backgroundColor}" />
  <g class="svg-network-container">
${linesStr}
${pulsesStr}
${nodesStr}
${intersStr}
${labelsStr}
  </g>
${scriptStr}
</svg>`;
  };

  const downloadSVG = () => {
    const raw = generateSVGContent(1500, 1000);
    const blob = new Blob([raw], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const btn = document.createElement('a');
    btn.download = `serveo-mesh-${activeType.toLowerCase()}-${Date.now()}.svg`;
    btn.href = url;
    btn.click();
    triggerToast('Premium Vector SVG downloaded successfully!');
  };

  const downloadPNG = () => {
    // Canvas conversion at high definition (3000 x 2000 px for gorgeous screen print details)
    const renderW = 3000;
    const renderH = 2000;
    const img = new Image();
    const xml = generateSVGContent(renderW, renderH);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = renderW;
      canvas.height = renderH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `serveo-print-${activeType.toLowerCase()}-${Date.now()}.png`;
        link.href = pngUrl;
        link.click();
        triggerToast('Rendered ultra high-definition PNG! (3000x2000 pixels)');
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const copySVGCode = () => {
    const code = generateSVGContent(1000, 666);
    navigator.clipboard.writeText(code);
    triggerToast('Copied raw inline XML vector code to clipboard!');
  };

  const exportHTMLToClipboard = () => {
    const svgCode = generateSVGContent(1500, 1000);
    const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Serveo Network - Animated Vector Widget</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: ${backgroundColor};
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #widget-wrapper {
      width: 100vw;
      height: 100vh;
      max-width: 100%;
      max-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div id="widget-wrapper">
    ${svgCode}
  </div>
</body>
</html>`;
    navigator.clipboard.writeText(htmlCode);
    triggerToast('Copied standalone animated HTML code to clipboard!');
  };

  const downloadStandaloneHTML = () => {
    const svgCode = generateSVGContent(1500, 1000);
    const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Serveo Network - Animated Vector Widget</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: ${backgroundColor};
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #widget-wrapper {
      width: 100vw;
      height: 100vh;
      max-width: 100%;
      max-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div id="widget-wrapper">
    ${svgCode}
  </div>
</body>
</html>`;
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `serveo-animated-mesh-${activeType.toLowerCase()}-${Date.now()}.html`;
    link.href = url;
    link.click();
    triggerToast('Success: Exported fully-animated portable HTML standalone page!');
  };

  const generateReactCodeContent = () => {
    return `import React, { useState, useEffect, useRef } from 'react';

// --- SERVEO ACTIVE GEOMETRY NETWORK COMPONENT ---
// Perfectly responsive, animated SVG wireframe coordinates, nodes and intersection indicators.
// Ready to drop into your portfolio, landing page, or product dashboard!
export default function AnimatedNetworkWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [rotX, setRotX] = useState(${rotX});
  const [rotY, setRotY] = useState(${rotY});

  // Keep track of animation timeframe
  const angleTime = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const [vertices, setVertices] = useState(${JSON.stringify(vertices)});
  const baseVerticesRef = useRef(${JSON.stringify(vertices)});

  const connections = ${JSON.stringify(connections)};
  const activeType = "${activeType}";
  const driftAmplitude = ${driftAmplitude};
  const animationSpeed = ${animationSpeed};
  const strokeColor = "${strokeColor}";
  const nodeSize = ${nodeSize};
  const nodeShape = "${nodeShape}";
  const intersectionShape = "${intersectionShape}";
  const intersectionSize = ${intersectionSize};
  const accentColor = "${accentColor}";
  const showLabels = ${showLabels};
  const paddingScale = ${paddingScale};
  const hypercubeInner = ${hypercubeInner};
  const pulseEnabled = ${particlePulseEnabled ? 'true' : 'false'};
  const pulseSpeed = ${pulseSpeed};
  const pulseIntensity = ${pulseIntensity};
  const pulseDensity = ${pulseDensity};
  const lineWidth = ${lineWidth};

  // Resize handler
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      setDimensions({
        width: containerRef.current?.clientWidth || 900,
        height: containerRef.current?.clientHeight || 600,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Animation ticks
  useEffect(() => {
    let frameId: number;
    let localRotX = rotX;
    let localRotY = rotY;

    const tick = (now: number) => {
      const delta = (now - lastTimeRef.current) * 0.001 * animationSpeed;
      lastTimeRef.current = now;
      angleTime.current += delta;

      if (activeType === 'Hypercube') {
        const intensityFactor = driftAmplitude / 1.5;
        localRotY = (localRotY + animationSpeed * 2 * intensityFactor) % 360;
        localRotX = (localRotX + animationSpeed * 0.8 * intensityFactor) % 360;
        setRotX(localRotX);
        setRotY(localRotY);

        const radX = (localRotX * Math.PI) / 180;
        const radY = (localRotY * Math.PI) / 180;
        const half = 0.5;

        const original3D = [
          { id: 'hc_o0', x3d: -1, y3d: -1, z3d: -1, isInner: false },
          { id: 'hc_o1', x3d:  1, y3d: -1, z3d: -1, isInner: false },
          { id: 'hc_o2', x3d:  1, y3d:  1, z3d: -1, isInner: false },
          { id: 'hc_o3', x3d: -1, y3d:  1, z3d: -1, isInner: false },
          { id: 'hc_o4', x3d: -1, y3d: -1, z3d:  1, isInner: false },
          { id: 'hc_o5', x3d:  1, y3d: -1, z3d:  1, isInner: false },
          { id: 'hc_o6', x3d:  1, y3d:  1, z3d:  1, isInner: false },
          { id: 'hc_o7', x3d: -1, y3d:  1, z3d:  1, isInner: false },
          { id: 'hc_i0', x3d: -1, y3d: -1, z3d: -1, isInner: true },
          { id: 'hc_i1', x3d:  1, y3d: -1, z3d: -1, isInner: true },
          { id: 'hc_i2', x3d:  1, y3d:  1, z3d: -1, isInner: true },
          { id: 'hc_i3', x3d: -1, y3d:  1, z3d: -1, isInner: true },
          { id: 'hc_i4', x3d: -1, y3d: -1, z3d:  1, isInner: true },
          { id: 'hc_i5', x3d:  1, y3d: -1, z3d:  1, isInner: true },
          { id: 'hc_i6', x3d:  1, y3d:  1, z3d:  1, isInner: true },
          { id: 'hc_i7', x3d: -1, y3d:  1, z3d:  1, isInner: true }
        ];

        const updated = [];
        for (let i = 0; i < original3D.length; i++) {
          const p = original3D[i];
          const factor = p.isInner ? hypercubeInner : 1.0;
          const px = p.x3d * factor;
          const py = p.y3d * factor;
          const pz = p.z3d * factor;

          const xRotated = px * Math.cos(radY) - pz * Math.sin(radY);
          const zRotated = px * Math.sin(radY) + pz * Math.cos(radY);
          const yRotated = py * Math.cos(radX) - zRotated * Math.sin(radX);

          const rMultiplier = (0.5 - paddingScale) * 0.9;
          updated.push({
            id: p.id,
            x: half + xRotated * rMultiplier,
            y: half + yRotated * rMultiplier
          });
        }
        setVertices(updated);
      } else {
        const base = baseVerticesRef.current;
        const updated = base.map((v, idx) => {
          const angleOffset = angleTime.current * 1.5 + idx;
          const dx = Math.sin(angleOffset) * 0.035 * (driftAmplitude / 1.5);
          const dy = Math.cos(angleOffset * 0.8) * 0.035 * (driftAmplitude / 1.5);
          return {
            ...v,
            x: Math.max(0.01, Math.min(0.99, v.x + dx)),
            y: Math.max(0.01, Math.min(0.99, v.y + dy)),
            role: v.role,
            name: v.name
          };
        });
        setVertices(updated);
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [activeType, driftAmplitude, animationSpeed, hypercubeInner, paddingScale, rotX, rotY]);

  // Solve overlapping lines wire intersections
  const solveIntersections = () => {
    const found = [];
    const nodeMap = new Map();
    vertices.forEach(v => nodeMap.set(v.id, v));

    function lineIntersect(p1, p2, p3, p4) {
      const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
      if (Math.abs(denom) < 1e-9) return null;
      const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
      const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;
      if (ua >= 0.005 && ua <= 0.995 && ub >= 0.005 && ub <= 0.995) {
        return {
          x: p1.x + ua * (p2.x - p1.x),
          y: p1.y + ua * (p2.y - p1.y)
        };
      }
      return null;
    }

    for (let i = 0; i < connections.length; i++) {
      for (let j = i + 1; j < connections.length; j++) {
        const lineA = connections[i];
        const lineB = connections[j];
        if (lineA.fromId === lineB.fromId || lineA.fromId === lineB.toId ||
            lineA.toId === lineB.fromId || lineA.toId === lineB.toId) continue;

        const vA1 = nodeMap.get(lineA.fromId);
        const vA2 = nodeMap.get(lineA.toId);
        const vB1 = nodeMap.get(lineB.fromId);
        const vB2 = nodeMap.get(lineB.toId);

        if (!vA1 || !vA2 || !vB1 || !vB2) continue;

        const p = lineIntersect(vA1, vA2, vB1, vB2);
        if (p) {
          let isDup = false;
          for (let k = 0; k < found.length; k++) {
            const ext = found[k];
            if (Math.hypot(ext.x - p.x, ext.y - p.y) < 0.003) {
              isDup = true;
              break;
            }
          }
          if (!isDup) {
            found.push({ x: p.x, y: p.y });
          }
        }
      }
    }
    return found;
  };

  const intersections = solveIntersections();

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[300px] relative overflow-hidden" 
      style={{ backgroundColor: "${backgroundColor}" }}
    >
      <svg 
        className="absolute inset-0 w-full h-full block"
        viewBox={\`0 0 \${dimensions.width} \${dimensions.height}\`}
      >
        {/* Layer 1: Connections */}
        {connections.map((line, idx) => {
          const f = vertices.find(v => v.id === line.fromId);
          const t = vertices.find(v => v.id === line.toId);
          if (!f || !t) return null;
          return (
            <line
              key={\`line-\${idx}\`}
              x1={f.x * dimensions.width}
              y1={f.y * dimensions.height}
              x2={t.x * dimensions.width}
              y2={t.y * dimensions.height}
              stroke={strokeColor}
              strokeWidth={lineWidth}
              opacity={0.85}
            />
          );
        })}

        {/* Layer 2: Pulse Pulses */}
        {pulseEnabled && connections.map((line, idx) => {
          const f = vertices.find(v => v.id === line.fromId);
          const t = vertices.find(v => v.id === line.toId);
          if (!f || !t) return null;
          return (
            <line
              key={\`pulse-\${idx}\`}
              x1={f.x * dimensions.width}
              y1={f.y * dimensions.height}
              x2={t.x * dimensions.width}
              y2={t.y * dimensions.height}
              stroke={accentColor}
              strokeWidth={lineWidth + (pulseIntensity * 0.45)}
              strokeDasharray={\`\${pulseIntensity * 2.5} \${pulseDensity * 2}\`}
              strokeDashoffset={-angleTime.current * pulseSpeed * 35 + idx * 5}
              opacity={0.7}
            />
          );
        })}

        {/* Layer 3: Intersections */}
        {intersectionShape !== 'none' && intersections.map((item, idx) => {
          const cx = item.x * dimensions.width;
          const cy = item.y * dimensions.height;
          if (intersectionShape === 'square') {
            return (
              <rect
                key={\`inter-\${idx}\`}
                x={cx - intersectionSize}
                y={cy - intersectionSize}
                width={intersectionSize * 2}
                height={intersectionSize * 2}
                fill={accentColor}
                rx={1}
              />
            );
          } else {
            return (
              <circle
                key={\`inter-\${idx}\`}
                cx={cx}
                cy={cy}
                r={intersectionSize}
                fill={accentColor}
              />
            );
          }
        })}

        {/* Layer 4: Vertices Nodes */}
        {nodeShape !== 'none' && vertices.map((v) => {
          const cx = v.x * dimensions.width;
          const cy = v.y * dimensions.height;
          if (nodeShape === 'square') {
            return (
              <rect
                key={v.id}
                x={cx - nodeSize}
                y={cy - nodeSize}
                width={nodeSize * 2}
                height={nodeSize * 2}
                fill={accentColor}
                rx={1.5}
              />
            );
          } else {
            return (
              <circle
                key={v.id}
                cx={cx}
                cy={cy}
                r={nodeSize}
                fill={accentColor}
              />
            );
          }
        })}

        {/* Layer 5: Labels */}
        {showLabels && vertices.map((v) => {
          const tx = v.x * dimensions.width;
          const ty = v.y * dimensions.height - nodeSize - 5;
          return (
            <text
              key={\`lbl-\${v.id}\`}
              x={tx}
              y={ty}
              fill={strokeColor}
              fontFamily="monospace"
              fontSize={10}
              textAnchor="middle"
              opacity={0.6}
            >
              {v.name || v.id}
            </text>
          );
        })}
      </svg>
    </div>
  );
}`;
  };

  const exportReactToClipboard = () => {
    const code = generateReactCodeContent();
    navigator.clipboard.writeText(code);
    triggerToast('Copied Premium React Component Code successfully!');
  };

  return (
    <div className="flex-1 w-full flex flex-col lg:flex-row bg-[#08080a] text-[#ede8df] rounded-xl lg:overflow-hidden border border-white/5 shadow-2 shadow-zinc-950/80 select-none min-h-0">
      
      {/* Toast Alert Message */}
      {toast && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 bg-[#161514] border border-[#ff5500]/20 text-[#f5ebd5] text-[10px] uppercase font-mono tracking-widest px-4 py-2.5 rounded shadow-2xl flex items-center gap-2">
          <Sparkle size={11} className="text-[#ff5500] animate-spin" />
          <span>{toast}</span>
        </div>
      )}

      {/* LEFT AREA: Sidebar Custom Controls */}
      <div className="w-full lg:w-[350px] bg-[#0c0c0e] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col min-h-0 shrink-0 lg:h-full">
        <div className="p-5 border-b border-white/5 bg-[#101013] flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#ff5500]/10 text-[#ff5500]">
              <Activity size={15} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest text-[#f5e9d0] font-mono leading-none">SERVEO STUDIO</h1>
              <p className="text-[9px] text-[#818086] uppercase font-mono mt-0.5">High-Precision Geometry Generator</p>
            </div>
          </div>
        </div>

        {/* Workspace Toolbar strips (moved from canvas) */}
        <div className="p-4 border-b border-white/5 bg-[#121216] flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-400 uppercase">
              {activeType} Network
            </span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">
              ({vertices.length} vertices, {intersections.length} crossings)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Aspect ratios triggers */}
            <div className="flex bg-black/40 border border-white/5 rounded p-0.5">
              {(['1:1', '3:2', '16:9', '21:9'] as const).map(ratio => (
                <button
                  key={ratio}
                  onClick={() => {
                    setAspectRatio(ratio);
                    triggerToast(`Switched canvas ratio to ${ratio}`);
                  }}
                  className={`px-2 py-0.5 rounded text-[8px] font-mono cursor-pointer transition-all ${
                    aspectRatio === ratio ? 'bg-[#ff5500]/25 text-[#ff5500]' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            {/* Labels overlay indicator */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2 py-1 rounded text-[9px] font-mono font-bold tracking-wider cursor-pointer border ${
                showLabels 
                  ? 'bg-[#ff5500]/10 border-[#ff5500]/30 text-[#ff5500]' 
                  : 'bg-white/5 border-transparent text-zinc-400 hover:text-[#ede8df]'
              }`}
            >
              Labels
            </button>

            {/* Spin automatic dynamic orbit breathing option */}
            <button
              onClick={() => setIsAnimated(!isAnimated)}
              className={`px-2 py-1 rounded text-[9px] font-mono font-bold tracking-wider cursor-pointer border ${
                isAnimated 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
              }`}
            >
              {isAnimated ? 'Spin Action' : 'Hold Spin'}
            </button>

            {/* Micro grid toggler */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-1 rounded text-[9px] font-mono font-semibold cursor-pointer ${
                showGrid ? 'bg-zinc-800 text-zinc-300' : 'bg-white/5 text-zinc-500'
              }`}
            >
              Grid
            </button>

            {/* Reset alignment key */}
            <button
              onClick={() => {
                rebuildMatrix(activeType);
                triggerToast('Mesh symmetrically calibrated!');
              }}
              className="p-1.5 text-zinc-400 hover:text-[#ff5500] bg-white/5 rounded cursor-pointer transition-colors"
              title="Reset symmetry"
            >
              <RefreshCw size={12} />
            </button>

            {/* Undo step stack tracking */}
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className={`p-1.5 rounded transition-colors ${
                history.length > 0 
                  ? 'text-zinc-300 hover:text-[#ff5500] bg-white/5 cursor-pointer' 
                  : 'text-zinc-700 pointer-events-none opacity-40'
              }`}
              title="Undo coordinate movement"
            >
              <Undo2 size={12} />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-[#0a0a0d] p-1 select-none">
          <button
            onClick={() => setSidebarTab('structure')}
            className={`flex-1 py-1.5 px-1 text-center font-mono text-[9px] tracking-wider uppercase font-bold flex items-center justify-center gap-1 transition-all rounded cursor-pointer ${
              sidebarTab === 'structure'
                ? 'bg-[#121217] text-[#ff5500] shadow border border-white/5'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            <Activity size={12} />
            Lattice
          </button>
          <button
            onClick={() => setSidebarTab('animation')}
            className={`flex-1 py-1.5 px-1 text-center font-mono text-[9px] tracking-wider uppercase font-bold flex items-center justify-center gap-1 transition-all rounded cursor-pointer ${
              sidebarTab === 'animation'
                ? 'bg-[#121217] text-[#ff5500] shadow border border-white/5'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            <Sparkle size={12} />
            Animation
          </button>
          <button
            onClick={() => setSidebarTab('styling')}
            className={`flex-1 py-1.5 px-1 text-center font-mono text-[9px] tracking-wider uppercase font-bold flex items-center justify-center gap-1 transition-all rounded cursor-pointer ${
              sidebarTab === 'styling'
                ? 'bg-[#121217] text-[#ff5500] shadow border border-white/5'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            <Palette size={12} />
            Styling
          </button>
        </div>

        {/* Scrollable Tab Content Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col min-h-0">
        {/* TAB CONTENT: STRUCTURE */}
        {sidebarTab === 'structure' && (
          <div className="flex-grow flex flex-col min-h-0">
            {/* Categories Grid (Interactive selectors matching Adiel theme presets) */}
            <div className="p-4 border-b border-white/5">
          <p className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider mb-2.5 font-bold">1. Select Lattice structure</p>
          <div className="grid grid-cols-2 gap-1.5">
            {([
              'Multipartite', 'Lattice', 'Complete', 'Bipartite', 
              'Wheel', 'Petersen', 'Circulant', 'Concentric', 
              'Rose', 'Geodesic', 'Apollonian', 'Hypercube'
            ] as const).map(type => (
              <button
                key={type}
                onClick={() => {
                  setActiveType(type);
                  triggerToast(`Transitioned to ${type} model geometry.`);
                }}
                className={`py-1.5 px-2.5 rounded text-[10px] font-mono tracking-wider font-semibold uppercase text-left transition-all border cursor-pointer ${
                  activeType === type
                    ? 'bg-[#ff5500]/15 border-[#ff5500]/40 text-[#ff5500]'
                    : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10 hover:text-[#ede8df]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Parameter Settings - Conditional rendering depending strictly on active geometric selector */}
        <div className="p-4 border-b border-white/5 flex-grow">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-1">
            <span className="text-[9px] uppercase font-mono text-zinc-400 tracking-wider font-bold inline-flex items-center gap-1">
              <Sliders size={11} className="text-[#ff5500]" /> 2. {activeType} Attributes
            </span>
          </div>

          <div className="space-y-4">
            
            {activeType === 'Multipartite' && (
              <>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>PARTITION LAYERS:</span>
                    <span className="text-[#ff5500] font-bold">{layersCount}</span>
                  </label>
                  <input type="range" min="2" max="6" step="1" value={layersCount} onChange={e => setLayersCount(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>NODES PER LAYER:</span>
                    <span className="text-[#ff5500] font-bold">{nodesPerLayer}</span>
                  </label>
                  <input type="range" min="2" max="6" step="1" value={nodesPerLayer} onChange={e => setNodesPerLayer(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div className="flex gap-4 items-center mt-2.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Orientation:</label>
                  <button onClick={() => setMultipartiteOrientation(o => o === 'V' ? 'H' : 'V')} className="py-1 px-3 rounded bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-[9px] text-[#ede8df] cursor-pointer">
                    {multipartiteOrientation === 'V' ? 'Vertical ⇅' : 'Horizontal ⇄'}
                  </button>
                </div>
                <div className="flex gap-2.5 items-center mt-2">
                  <input type="checkbox" id="mpAll" checked={multipartiteConnectAll} onChange={e => setMultipartiteConnectAll(e.target.checked)} className="accent-[#ff5500] h-3 w-3 cursor-pointer" />
                  <label htmlFor="mpAll" className="text-[10px] font-mono text-zinc-400 select-none cursor-pointer">CONNECT ALL PARTITIONS (K-PARTITE)</label>
                </div>
              </>
            )}

            {activeType === 'Lattice' && (
              <>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>BOUNDING ROWS:</span>
                    <span className="text-[#ff5500] font-bold">{latticeRows}</span>
                  </label>
                  <input type="range" min="2" max="8" step="1" value={latticeRows} onChange={e => setLatticeRows(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>BOUNDING COLUMNS:</span>
                    <span className="text-[#ff5500] font-bold">{latticeCols}</span>
                  </label>
                  <input type="range" min="2" max="8" step="1" value={latticeCols} onChange={e => setLatticeCols(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div className="flex gap-2.5 items-center mt-2">
                  <input type="checkbox" id="latDiag" checked={latticeDiagonals} onChange={e => setLatticeDiagonals(e.target.checked)} className="accent-[#ff5500] h-3 w-3 cursor-pointer" />
                  <label htmlFor="latDiag" className="text-[10px] font-mono text-zinc-400 select-none cursor-pointer">CROSSING DIAGONAL BOUNDS</label>
                </div>
              </>
            )}

            {activeType === 'Complete' && (
              <div>
                <label className="flex justify-between text-[10px] font-mono text-[#ede8df] mb-1.5">
                  <span>VERTICES COUNT (K_N CLIQUE):</span>
                  <span className="text-[#ff5500] font-bold">{completeVertices} Nodes</span>
                </label>
                <input type="range" min="3" max="18" step="1" value={completeVertices} onChange={e => setCompleteVertices(Number(e.target.value))} className="w-full accent-[#ff5500]" />
              </div>
            )}

            {activeType === 'Bipartite' && (
              <>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>LEFT SET SIZE (A):</span>
                    <span className="text-[#ff5500] font-bold">{bipartiteLeft}</span>
                  </label>
                  <input type="range" min="1" max="12" step="1" value={bipartiteLeft} onChange={e => setBipartiteLeft(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>RIGHT SET SIZE (B):</span>
                    <span className="text-[#ff5500] font-bold">{bipartiteRight}</span>
                  </label>
                  <input type="range" min="1" max="12" step="1" value={bipartiteRight} onChange={e => setBipartiteRight(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>GAP SPACING DISTANCE:</span>
                    <span className="text-[#ff5500] font-bold">{bipartiteSpacing.toFixed(2)}</span>
                  </label>
                  <input type="range" min="0.08" max="0.35" step="0.01" value={bipartiteSpacing} onChange={e => setBipartiteSpacing(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div className="flex gap-4 items-center mt-2">
                  <label className="text-[10px] font-mono text-zinc-400">Orientation:</label>
                  <button onClick={() => setBipartiteOrientation(o => o === 'V' ? 'H' : 'V')} className="py-1 px-3 rounded bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-[9px] text-[#ede8df] cursor-pointer">
                    {bipartiteOrientation === 'V' ? 'Vertical Column ⇄' : 'Horizontal Row ⇅'}
                  </button>
                </div>
              </>
            )}

            {activeType === 'Wheel' && (
              <>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>RIM SPOKES STEPS:</span>
                    <span className="text-[#ff5500] font-bold">{wheelRim}</span>
                  </label>
                  <input type="range" min="3" max="18" step="1" value={wheelRim} onChange={e => setWheelRim(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>CONCENTRIC RING LAYERS:</span>
                    <span className="text-[#ff5500] font-bold">{wheelRings}</span>
                  </label>
                  <input type="range" min="1" max="4" step="1" value={wheelRings} onChange={e => setWheelRings(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
              </>
            )}

            {activeType === 'Petersen' && (
              <>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>N CYCLES:</span>
                    <span className="text-[#ff5500] font-bold">{petersenN} vertices</span>
                  </label>
                  <input type="range" min="3" max="10" step="1" value={petersenN} onChange={e => setPetersenN(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>INNER STAR STEP COUNT:</span>
                    <span className="text-[#ff5500] font-bold">{petersenSkip} skip</span>
                  </label>
                  <input type="range" min="1" max={Math.max(1, Math.floor((petersenN - 1) / 2))} step="1" value={petersenSkip} onChange={e => setPetersenSkip(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
              </>
            )}

            {activeType === 'Circulant' && (
              <>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>VERTICES IN RING (N):</span>
                    <span className="text-[#ff5500] font-bold">{circulantN}</span>
                  </label>
                  <input type="range" min="4" max="24" step="1" value={circulantN} onChange={e => setCirculantN(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div className="flex flex-col gap-2 mt-2 bg-white/5 p-2.5 rounded border border-white/5">
                  <span className="text-[9px] font-mono uppercase text-zinc-500 mb-1">Toggle Link Jump offsets:</span>
                  <label className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 cursor-pointer">
                    <input type="checkbox" checked={circulantJump1} onChange={e => setCirculantJump1(e.target.checked)} className="accent-[#ff5500]" />
                    STEP 1 OVERLAP (Rim Cycle)
                  </label>
                  <label className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 cursor-pointer">
                    <input type="checkbox" checked={circulantJump2} onChange={e => setCirculantJump2(e.target.checked)} className="accent-[#ff5500]" />
                    STEP 2 SPARKED (Star core)
                  </label>
                  <label className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 cursor-pointer">
                    <input type="checkbox" checked={circulantJump3} onChange={e => setCirculantJump3(e.target.checked)} className="accent-[#ff5500]" />
                    STEP 3 SPHERICAL
                  </label>
                </div>
              </>
            )}

            {activeType === 'Concentric' && (
              <>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>RINGS QUANTITY:</span>
                    <span className="text-[#ff5500] font-bold">{concentricRings} rings</span>
                  </label>
                  <input type="range" min="2" max="6" step="1" value={concentricRings} onChange={e => setConcentricRings(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>VERTICES PER RING:</span>
                    <span className="text-[#ff5500] font-bold">{concentricPts} points</span>
                  </label>
                  <input type="range" min="3" max="14" step="1" value={concentricPts} onChange={e => setConcentricPts(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div className="flex gap-2.5 items-center mt-2.5">
                  <input type="checkbox" id="conStag" checked={concentricStagger} onChange={e => setConcentricStagger(e.target.checked)} className="accent-[#ff5500] h-3 w-3 cursor-pointer" />
                  <label htmlFor="conStag" className="text-[10px] font-mono text-zinc-400 select-none cursor-pointer">STAGGER LAYER ROTATION</label>
                </div>
              </>
            )}

            {activeType === 'Rose' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 block mb-1">NUMERATOR (N):</label>
                    <input type="number" min="1" max="15" value={roseN} onChange={e => setRoseN(Math.max(1, Number(e.target.value)))} className="w-full bg-white/5 border border-white/5 rounded text-[10px] p-1 text-center font-mono focus:outline-none focus:border-[#ff5500]/50" />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 block mb-1">DENOMINATOR (D):</label>
                    <input type="number" min="1" max="15" value={roseD} onChange={e => setRoseD(Math.max(1, Number(e.target.value)))} className="w-full bg-white/5 border border-white/5 rounded text-[10px] p-1 text-center font-mono focus:outline-none focus:border-[#ff5500]/50" />
                  </div>
                </div>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>RESOLVING POINTS:</span>
                    <span className="text-[#ff5500] font-bold">{rosePts}</span>
                  </label>
                  <input type="range" min="15" max="150" step="5" value={rosePts} onChange={e => setRosePts(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>CONNECTION SKIP DISTANCE:</span>
                    <span className="text-[#ff5500] font-bold">{roseSkip} steps</span>
                  </label>
                  <input type="range" min="1" max={Math.max(2, Math.floor(rosePts / 2))} step="1" value={roseSkip} onChange={e => setRoseSkip(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
              </>
            )}

            {activeType === 'Geodesic' && (
              <div>
                <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                  <span>SUBDIVISION FREQUENCY:</span>
                  <span className="text-[#ff5500] font-bold">L{geodesicFreq}</span>
                </label>
                <input type="range" min="1" max="5" step="1" value={geodesicFreq} onChange={e => setGeodesicFreq(Number(e.target.value))} className="w-full accent-[#ff5500]" />
              </div>
            )}

            {activeType === 'Apollonian' && (
              <div>
                <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                  <span>NESTED DEPTH LEVEL:</span>
                  <span className="text-[#ff5500] font-bold">L{apollonianDepth} Triads</span>
                </label>
                <input type="range" min="1" max="3" step="1" value={apollonianDepth} onChange={e => setApollonianDepth(Number(e.target.value))} className="w-full accent-[#ff5500]" />
              </div>
            )}

            {activeType === 'Hypercube' && (
              <>
                <div>
                  <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                    <span>INTERNAL INSIDE SCALE:</span>
                    <span className="text-[#ff5500] font-bold">{(hypercubeInner * 100).toFixed(0)}%</span>
                  </label>
                  <input type="range" min="0.15" max="0.85" step="0.05" value={hypercubeInner} onChange={e => setHypercubeInner(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div>
                  <label className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">ROTATE X ANGLE (X):</label>
                  <input type="range" min="0" max="360" value={rotX} onChange={e => setRotX(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
                <div>
                  <label className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">ROTATE Y ANGLE (Y):</label>
                  <input type="range" min="0" max="360" value={rotY} onChange={e => setRotY(Number(e.target.value))} className="w-full accent-[#ff5500]" />
                </div>
              </>
            )}

            {/* Bounding edge scale buffer padding */}
            <div>
              <label className="flex justify-between text-[10px] font-mono text-[#818086] mb-1">
                <span>CONSTRAINED SCALE:</span>
                <span>{((1 - paddingScale * 2) * 100).toFixed(0)}%</span>
              </label>
              <input type="range" min="0.05" max="0.3" step="0.01" value={paddingScale} onChange={e => setPaddingScale(Number(e.target.value))} className="w-full accent-zinc-500" />
            </div>

            {/* Selected Node Inspector Section when clicked */}
            {selectedVertexId && (
              <div className="p-4 mx-4 mb-4 bg-white/5 rounded border border-[#ff5500]/25 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#ff5500] uppercase font-black tracking-widest flex items-center gap-1.5">
                    <Activity size={12} /> Node Inspector
                  </span>
                  <button
                    onClick={() => setSelectedVertexId(null)}
                    className="text-[9px] font-mono text-zinc-500 hover:text-zinc-350 cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Node ID:</span>
                    <span className="text-[#f5ebd5] font-semibold">{selectedVertexId.slice(0, 8)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Role:</span>
                    <span className="text-[#f5ebd5] font-semibold uppercase">{vertices.find(v => v.id === selectedVertexId)?.role || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 text-[9px] uppercase font-mono block mb-1">Rename ID Label:</span>
                  <input
                    type="text"
                    value={vertices.find(v => v.id === selectedVertexId)?.name || ''}
                    placeholder="Rename node label..."
                    onChange={(e) => {
                      const val = e.target.value;
                      setVertices(prev => prev.map(item => item.id === selectedVertexId ? { ...item, name: val } : item));
                    }}
                    className="w-full bg-[#101014] border border-white/5 hover:border-white/10 rounded text-[10px] font-mono p-1.5 text-left focus:outline-none focus:border-[#ff5500]/50 text-white"
                  />
                </div>

                {activeType === 'Hypercube' ? (
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-[#ff5500] uppercase tracking-wider font-bold">3D Coordinate Tuners:</p>
                    <div>
                      <label className="flex justify-between text-[9px] font-mono text-zinc-400">
                        <span>X3D OFFSET:</span>
                        <span className="text-white">{(vertices.find(v => v.id === selectedVertexId)?.x3d || 0).toFixed(2)}</span>
                      </label>
                      <input
                        type="range"
                        min="-3"
                        max="3"
                        step="0.05"
                        value={vertices.find(v => v.id === selectedVertexId)?.x3d || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCustomCoords(prev => ({
                            ...prev,
                            [selectedVertexId]: {
                              ...prev[selectedVertexId],
                              x3d: val
                            }
                          }));
                        }}
                        className="w-full accent-[#ff5500]"
                      />
                    </div>
                    <div>
                      <label className="flex justify-between text-[9px] font-mono text-zinc-400">
                        <span>Y3D OFFSET:</span>
                        <span className="text-white">{(vertices.find(v => v.id === selectedVertexId)?.y3d || 0).toFixed(2)}</span>
                      </label>
                      <input
                        type="range"
                        min="-3"
                        max="3"
                        step="0.05"
                        value={vertices.find(v => v.id === selectedVertexId)?.y3d || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCustomCoords(prev => ({
                            ...prev,
                            [selectedVertexId]: {
                              ...prev[selectedVertexId],
                              y3d: val
                            }
                          }));
                        }}
                        className="w-full accent-[#ff5500]"
                      />
                    </div>
                    <div>
                      <label className="flex justify-between text-[9px] font-mono text-zinc-400">
                        <span>Z3D OFFSET:</span>
                        <span className="text-white">{(vertices.find(v => v.id === selectedVertexId)?.z3d || 0).toFixed(2)}</span>
                      </label>
                      <input
                        type="range"
                        min="-3"
                        max="3"
                        step="0.05"
                        value={vertices.find(v => v.id === selectedVertexId)?.z3d || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCustomCoords(prev => ({
                            ...prev,
                            [selectedVertexId]: {
                              ...prev[selectedVertexId],
                              z3d: val
                            }
                          }));
                        }}
                        className="w-full accent-[#ff5500]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-[#ff5500] uppercase tracking-wider font-bold">2D Visual Plane Coordinates:</p>
                    <div>
                      <label className="flex justify-between text-[9px] font-mono text-zinc-400">
                        <span>COORD X (0 - 1):</span>
                        <span className="text-white">{(vertices.find(v => v.id === selectedVertexId)?.x || 0).toFixed(3)}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.005"
                        value={vertices.find(v => v.id === selectedVertexId)?.x || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCustomCoords(prev => ({
                            ...prev,
                            [selectedVertexId]: {
                              ...prev[selectedVertexId],
                              x: val
                            }
                          }));
                        }}
                        className="w-full accent-[#ff5500]"
                      />
                    </div>
                    <div>
                      <label className="flex justify-between text-[9px] font-mono text-zinc-400">
                        <span>COORD Y (0 - 1):</span>
                        <span className="text-white">{(vertices.find(v => v.id === selectedVertexId)?.y || 0).toFixed(3)}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.005"
                        value={vertices.find(v => v.id === selectedVertexId)?.y || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCustomCoords(prev => ({
                            ...prev,
                            [selectedVertexId]: {
                              ...prev[selectedVertexId],
                              y: val
                            }
                          }));
                        }}
                        className="w-full accent-[#ff5500]"
                      />
                    </div>
                  </div>
                )}

                {/* Button to clear modification override for targeted node */}
                <button
                  onClick={() => {
                    setCustomCoords(prev => {
                      const next = { ...prev };
                      delete next[selectedVertexId];
                      return next;
                    });
                    triggerToast('Cleared manual customization for this node!');
                  }}
                  className="mt-1 w-full py-1.5 bg-[#ff5500]/10 hover:bg-[#ff5500]/20 text-[#ff5500]/90 font-mono text-[9px] uppercase tracking-widest border border-[#ff5500]/20 rounded transition-colors cursor-pointer"
                >
                  Reset Node Constraints
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

        {/* TAB CONTENT: ANIMATION */}
        {sidebarTab === 'animation' && (
          <div className="p-4 space-y-5 flex-grow">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Sparkle size={13} className="text-[#ff5500]" />
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#f5e9d0]">Mesh Animation Studio</span>
            </div>

            {/* Orbit / Rotation controllers */}
            <div className="bg-white/5 p-3 rounded border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Mesh Auto-Spin Rotation</span>
                <button
                  onClick={() => {
                    setIsAnimated(!isAnimated);
                    triggerToast(isAnimated ? 'Paused automatically scheduled spinning.' : 'Started continuous dynamic spin.');
                  }}
                  className={`px-2.5 py-1 text-[9px] font-mono font-black tracking-wider uppercase border border-white/10 rounded cursor-pointer ${
                    isAnimated
                      ? 'bg-[#1a120c] border-[#ff5500]/30 text-[#ff5500]'
                      : 'bg-zinc-850 border-transparent text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  {isAnimated ? 'Spinning' : 'Hold Static'}
                </button>
              </div>

              <div>
                <label className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                  <span>ROTATION VELOCITY SPEED:</span>
                  <span className="text-[#ff5500] font-bold">{(animationSpeed * 10).toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={animationSpeed}
                  disabled={!isAnimated}
                  onChange={e => setAnimationSpeed(Number(e.target.value))}
                  className="w-full accent-[#ff5500] disabled:opacity-30"
                />
              </div>

              <div>
                <label className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                  <span>ROTATION & DRIFT INTENSITY:</span>
                  <span className="text-[#ff5500] font-bold">{(driftAmplitude).toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="4.0"
                  step="0.1"
                  value={driftAmplitude}
                  disabled={!isAnimated}
                  onChange={e => setDriftAmplitude(Number(e.target.value))}
                  className="w-full accent-[#ff5500] disabled:opacity-30"
                />
              </div>
            </div>

            {/* Particle Pulse flow controllers */}
            <div className="bg-white/5 p-3 rounded border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase flex items-center gap-1">
                  <Sparkle size={11} className="text-[#ff5500] animate-pulse" />
                  <span>Wire Particle Pulse Currents</span>
                </span>
                <button
                  onClick={() => {
                    setParticlePulseEnabled(!particlePulseEnabled);
                    triggerToast(particlePulseEnabled ? 'Packet currents turned off.' : 'Current pulses active!');
                  }}
                  className={`px-2.5 py-1 text-[9px] font-mono font-black tracking-wider uppercase border border-white/10 rounded cursor-pointer ${
                    particlePulseEnabled
                      ? 'bg-[#1a120c] border-[#ff5500]/30 text-[#ff5500]'
                      : 'bg-[#101013] border-[#222] text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {particlePulseEnabled ? 'Pulse Active' : 'Pulses Muted'}
                </button>
              </div>

              <div>
                <label className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                  <span>PARTICLE FLOW SPEED:</span>
                  <span className="text-[#ff5500] font-bold">{(pulseSpeed).toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.2"
                  value={pulseSpeed}
                  disabled={!particlePulseEnabled}
                  onChange={e => setPulseSpeed(Number(e.target.value))}
                  className="w-full accent-[#ff5500] disabled:opacity-30"
                />
              </div>

              <div>
                <label className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                  <span>PARTICLE SIZE / GLOW :</span>
                  <span className="text-[#ff5500] font-bold">{(pulseIntensity).toFixed(0)} dot width</span>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="1.0"
                  value={pulseIntensity}
                  disabled={!particlePulseEnabled}
                  onChange={e => setPulseIntensity(Number(e.target.value))}
                  className="w-full accent-[#ff5500] disabled:opacity-30"
                />
              </div>

              <div>
                <label className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                  <span>SPACING INTERVAL GAP (DENSITY):</span>
                  <span className="text-[#ff5500] font-bold">{(pulseDensity).toFixed(0)}px gap</span>
                </label>
                <input
                  type="range"
                  min="4.0"
                  max="24.0"
                  step="1.0"
                  value={pulseDensity}
                  disabled={!particlePulseEnabled}
                  onChange={e => setPulseDensity(Number(e.target.value))}
                  className="w-full accent-[#ff5500] disabled:opacity-30"
                />
              </div>
            </div>

            <p className="text-[9px] font-mono text-zinc-500 text-center leading-normal">
              * Pulse flow currents represent high-speed routing packet telemetry traversing wire pathways! High speed looks perfect for interactive displays.
            </p>
          </div>
        )}

        {/* TAB CONTENT: COSMETIC STYLING */}
        {sidebarTab === 'styling' && (
          <div className="p-4 space-y-4 flex-grow">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Palette size={13} className="text-[#ff5500]" />
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#f5e9d0]">Canvas Stylist Settings</span>
            </div>

            {/* Custom Individual Color Pickers */}
            <div className="bg-white/5 p-3 rounded border border-white/5 space-y-2.5">
              <p className="text-[9px] font-mono uppercase text-[#ede8df] font-bold mb-1">Manual Color Swatches</p>
              
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-400">BACKGROUND COLOR:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-[9px]" style={{ color: backgroundColor }}>{backgroundColor}</span>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={e => setBackgroundColor(e.target.value)}
                    className="w-6 h-6 border border-white/10 rounded cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-400">WIRELINE STROKE COLOR:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-[9px]" style={{ color: strokeColor }}>{strokeColor}</span>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={e => setStrokeColor(e.target.value)}
                    className="w-6 h-6 border border-white/10 rounded cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-[#999]">HIGHLIGHT ACCENT COLOR:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-[9px]" style={{ color: accentColor }}>{accentColor}</span>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    className="w-6 h-6 border border-white/10 rounded cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Wire and Node sizing */}
            <div className="bg-white/5 p-3 rounded border border-white/5 space-y-3.5">
              <p className="text-[9px] font-mono uppercase text-[#ede8df] font-bold">Vector sizing metrics</p>

              <div>
                <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span>WIRELINE THICKNESS:</span>
                  <span className="text-[#ff5500] font-bold">{lineWidth}px</span>
                </label>
                <input type="range" min="0.5" max="4.0" step="0.25" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))} className="w-full accent-[#ff5500]" />
              </div>

              <div>
                <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span>VERTEX NODE SIZE:</span>
                  <span className="text-[#ff5500] font-bold">{nodeSize}px</span>
                </label>
                <input type="range" min="2" max="15" step="1" value={nodeSize} onChange={e => setNodeSize(Number(e.target.value))} className="w-full accent-[#ff5500]" />
              </div>

              <div>
                <label className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span>CROSSING OVERLAPS SIZE:</span>
                  <span className="text-[#ff5500] font-bold">{intersectionSize}px</span>
                </label>
                <input type="range" min="1" max="12" step="1" value={intersectionSize} onChange={e => setIntersectionSize(Number(e.target.value))} className="w-full accent-[#ff5500]" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 block mb-1">NODE SHAPE:</label>
                  <select
                    value={nodeShape}
                    onChange={e => setNodeShape(e.target.value as any)}
                    className="w-full bg-[#101014] border border-white/5 rounded text-[10px] font-mono p-1 bg-[#101014] text-zinc-300"
                  >
                    <option value="square">Square</option>
                    <option value="circle">Circle</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-mono text-zinc-400 block mb-1">CROSS SHAPE:</label>
                  <select
                    value={intersectionShape}
                    onChange={e => setIntersectionShape(e.target.value as any)}
                    className="w-full bg-[#101014] border border-white/5 rounded text-[10px] font-mono p-1 bg-[#101014] text-zinc-300"
                  >
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Clear All manual coordinates overrides duplicity */}
            {Object.keys(customCoords).length > 0 && (
              <button
                onClick={() => {
                  setCustomCoords({});
                  setSelectedVertexId(null);
                  triggerToast('Cleared all custom drag modifications!');
                }}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-mono text-[10px] uppercase font-bold tracking-widest border border-rose-500/20 rounded transition-colors cursor-pointer"
              >
                Reset Drag Constraints ({Object.keys(customCoords).length})
              </button>
            )}
          </div>
        )}
        </div>

        {/* Global cosmetic presets and palettes */}
        <div className="p-4 bg-[#0a0a0c] border-t border-white/5">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-bold flex items-center gap-1">
            <Palette size={11} className="text-zinc-400" /> 3. Workspace Color presets
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {Object.keys(THEMES).map(k => (
              <button
                key={k}
                onClick={() => selectPresetTheme(k as any)}
                className="px-2 py-1 bg-[#16161a] hover:bg-[#202026] border border-white/10 rounded font-mono text-[9px] text-zinc-300 capitalize cursor-pointer"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT AREA: Core Visualization Monitor workbench & canvas display */}
      <div className="w-full h-[60vh] lg:h-full lg:flex-1 flex flex-col relative min-w-0 bg-[#0f0f12] shrink-0 lg:shrink">
        
        {/* Live Vector SVG sandbox area rendering nodes, wire connectors and computed intersections */}
        <div 
          ref={containerRef}
          className="flex-grow w-full relative overflow-hidden flex items-center justify-center select-none p-2 lg:p-4 min-h-[400px] lg:min-h-0 shrink-0 lg:shrink"
        >
          <div 
            className="relative shadow-2xl overflow-hidden rounded border border-white/5 transition-all duration-300 flex items-center justify-center"
            style={{ 
              width: '100%', 
              height: dimensions.height,
              backgroundColor 
            }}
          >
            {/* Technical Blueprint Micro Dots overlay lines */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                  backgroundImage: `radial-gradient(${strokeColor} 1.2px, transparent 1.2px)`,
                  backgroundSize: '16px 16px'
                }}
              />
            )}

            {/* Vectors drawing core viewport */}
            <svg
              className="absolute inset-0 w-full h-full block"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            >
              
              {/* Layer 1: Vector Line Wires */}
              {connections.map((line, idx) => {
                const f = vertices.find(v => v.id === line.fromId);
                const t = vertices.find(v => v.id === line.toId);
                if (!f || !t) return null;

                const activeHighlightNodeId = hoveredVertexId || selectedVertexId;
                const isConnected = activeHighlightNodeId === line.fromId || activeHighlightNodeId === line.toId;

                // Color, Width, and Opacity adaptation depending on hover/click state
                const strokeColorVal = activeHighlightNodeId
                  ? (isConnected ? accentColor : strokeColor)
                  : strokeColor;

                const opacityVal = activeHighlightNodeId
                  ? (isConnected ? 1.0 : 0.12)
                  : 0.8;

                const strokeWidthVal = activeHighlightNodeId
                  ? (isConnected ? lineWidth * 2.5 : lineWidth * 0.7)
                  : lineWidth;

                return (
                  <line
                    key={`l_${idx}`}
                    x1={f.x * dimensions.width}
                    y1={f.y * dimensions.height}
                    x2={t.x * dimensions.width}
                    y2={t.y * dimensions.height}
                    stroke={strokeColorVal}
                    strokeWidth={strokeWidthVal}
                    opacity={opacityVal}
                    className="transition-all duration-150"
                  />
                );
              })}

              {/* Layer 1.5: Glowing particle pulse flows along wires */}
              {particlePulseEnabled && connections.map((line, idx) => {
                const f = vertices.find(v => v.id === line.fromId);
                const t = vertices.find(v => v.id === line.toId);
                if (!f || !t) return null;

                const activeHighlightNodeId = hoveredVertexId || selectedVertexId;
                const isConnected = activeHighlightNodeId === line.fromId || activeHighlightNodeId === line.toId;

                // Opacity fades out for pulses that are not connected
                const opacityVal = activeHighlightNodeId
                  ? (isConnected ? 1.0 : 0.08)
                  : 0.7;

                return (
                  <line
                    key={`pulse_${idx}`}
                    x1={f.x * dimensions.width}
                    y1={f.y * dimensions.height}
                    x2={t.x * dimensions.width}
                    y2={t.y * dimensions.height}
                    stroke={accentColor}
                    strokeWidth={lineWidth + (pulseIntensity * 0.45)}
                    strokeDasharray={`${pulseIntensity * 2.5} ${pulseDensity * 2}`}
                    strokeDashoffset={-angleTime.current * pulseSpeed * 35 + idx * 5}
                    opacity={opacityVal}
                    className="pointer-events-none transition-all duration-150"
                  />
                );
              })}

              {/* Layer 2: Computed Crossed Coordinate Intersections dots */}
              {intersectionShape !== 'none' && intersections.map((it, idx) => {
                const cx = it.x * dimensions.width;
                const cy = it.y * dimensions.height;

                if (intersectionShape === 'square') {
                  return (
                    <rect
                      key={`it_${idx}`}
                      x={cx - intersectionSize}
                      y={cy - intersectionSize}
                      width={intersectionSize * 2}
                      height={intersectionSize * 2}
                      fill={accentColor}
                      rx={1}
                      className="pointer-events-none opacity-90"
                    />
                  );
                } else {
                  return (
                    <circle
                      key={`it_${idx}`}
                      cx={cx}
                      cy={cy}
                      r={intersectionSize}
                      fill={accentColor}
                      className="pointer-events-none opacity-90"
                    />
                  );
                }
              })}

              {/* Layer 3: Controllable Active Source Vertices */}
              {nodeShape !== 'none' && vertices.map((v) => {
                const cx = v.x * dimensions.width;
                const cy = v.y * dimensions.height;
                const isDragged = draggedVertexId === v.id;
                const isSelected = selectedVertexId === v.id;
                const isHovered = hoveredVertexId === v.id;

                const nodeFill = isSelected ? strokeColor : (isHovered ? strokeColor : accentColor);
                const nodeStroke = isSelected ? accentColor : (isHovered ? accentColor : (isDragged ? strokeColor : 'none'));

                return (
                  <g
                    key={`v_grp_${v.id}`}
                    onPointerEnter={() => setHoveredVertexId(v.id)}
                    onPointerLeave={() => setHoveredVertexId(null)}
                  >
                    {/* Pulsing selection circular dashed ring halo under selected node */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={nodeSize + 8}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        className="animate-spin pointer-events-none"
                        style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: '8s' }}
                      />
                    )}

                    {/* Nodes Visual Vector Shape: Rectangle or Circle */}
                    {nodeShape === 'square' ? (
                      <rect
                        x={cx - nodeSize}
                        y={cy - nodeSize}
                        width={nodeSize * 2}
                        height={nodeSize * 2}
                        fill={nodeFill}
                        rx={1.5}
                        stroke={nodeStroke}
                        strokeWidth={(isSelected || isHovered) ? 2 : 1}
                        className="transition-all duration-150 cursor-grab active:cursor-grabbing hover:scale-120"
                        style={{ transformOrigin: `${cx}px ${cy}px` }}
                      />
                    ) : (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={nodeSize}
                        fill={nodeFill}
                        stroke={nodeStroke}
                        strokeWidth={(isSelected || isHovered) ? 2 : 1}
                        className="transition-all duration-150 cursor-grab active:cursor-grabbing hover:scale-120"
                        style={{ transformOrigin: `${cx}px ${cy}px` }}
                      />
                    )}

                    {/* Generous Invisible Interactive Hit Area to make Clicking & Drag-Drop 100% reliable */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={nodeSize + 16}
                      fill="transparent"
                      className="cursor-pointer"
                      style={{ touchAction: 'none' }}
                    />

                    {/* Conditional index text metrics labels */}
                    {showLabels && (
                      <text
                        x={cx}
                        y={cy - nodeSize - 7}
                        fill={(isSelected || isHovered) ? accentColor : strokeColor}
                        className={`text-[9px] font-mono select-none font-bold transition-colors duration-150 ${(isSelected || isHovered) ? 'font-black' : ''}`}
                        textAnchor="middle"
                        opacity={(isSelected || isHovered) ? 1.0 : 0.7}
                      >
                        {v.name || v.id.slice(-2)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Subtle water-marked watermark stats info */}
            <div className="absolute bottom-4 left-4 pointer-events-none py-1 px-2.5 bg-black/60 border border-white/5 backdrop-blur rounded text-[8px] font-mono text-zinc-400 uppercase tracking-widest">
              SEREVO STUDIO MESH • {vertices.length} vertices • {intersections.length} wire overlaps
            </div>
          </div>
        </div>

        {/* BOTTOM MENU AREA: Multi-presets customization tuning + Vector image downloads */}
        <div className="p-4 bg-[#0d0d10] border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1 text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <HelpCircle size={12} className="text-zinc-500" />
              <span>Click and drag any node directly in-canvas to restructure.</span>
            </span>
            <span className="hidden md:inline text-[9px] text-[#ff5500]/80">
              * Perfect for premium card, website, and bag layouts/prints!
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Real SVG downloader */}
            <button
              onClick={downloadSVG}
              className="py-2 px-3.5 bg-white/5 hover:bg-white/10 text-white rounded font-mono text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Download high fidelity SVG vector artwork"
            >
              <Download size={13} className="text-[#ff5500]" />
              Download Vector (SVG)
            </button>

            {/* Raster high definition print PNG */}
            <button
              onClick={downloadPNG}
              className="py-2 px-3.5 bg-[#ff5500] hover:bg-[#e04b00] text-black rounded font-mono text-[10px] uppercase font-black tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
              title="Download 3000x2000 raster print graphic"
            >
              <Maximize2 size={13} />
              HD PNG (3000px)
            </button>

            {/* XML String Copier */}
            <button
              onClick={copySVGCode}
              className="py-2 px-3.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded font-mono text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1.5 cursor-pointer border border-white/5"
              title="Copy inline code"
            >
              <Copy size={12} />
              Copy SVG
            </button>

            {/* Direct Copy HTML Code */}
            <button
              onClick={exportHTMLToClipboard}
              className="py-2 px-3.5 bg-cyan-950/45 hover:bg-cyan-900/60 text-cyan-300 hover:text-cyan-200 rounded font-mono text-[10px] uppercase font-black tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-md border border-cyan-500/25"
              title="Copy standalone interactive animated HTML widget code directly"
            >
              <Copy size={12} className="text-cyan-400 animate-pulse" />
              Copy HTML
            </button>

            {/* Direct Copy React Code */}
            <button
              onClick={exportReactToClipboard}
              className="py-2 px-3.5 bg-indigo-950/45 hover:bg-indigo-900/60 text-indigo-300 hover:text-indigo-200 rounded font-mono text-[10px] uppercase font-black tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-md border border-indigo-500/25"
              title="Copy modular interactive React .tsx component code"
            >
              <Copy size={12} className="text-indigo-400" />
              Copy React
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
