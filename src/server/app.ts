import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import 'dotenv/config';
import fs from "fs";

console.log("[DEBUG] EXECUTING CLEAN EXPRESS APP ROUTER");

// REMOVED manual .env file loading logic. 
// Relying strictly on process.env injected by Vercel/Platform.

const generateFallbackPreset = (pr: string) => {
  const normalized = pr.toLowerCase();
  
  let shapeKey = "torusKnot";
  if (normalized.includes("sphere") || normalized.includes("ball") || normalized.includes("bubble") || normalized.includes("drop")) {
    shapeKey = "sphere";
  } else if (normalized.includes("torus") || normalized.includes("donut") || normalized.includes("ring")) {
    shapeKey = "torus";
  } else if (normalized.includes("box") || normalized.includes("cube") || normalized.includes("square")) {
    shapeKey = "box";
  } else if (normalized.includes("cone")) {
    shapeKey = "cone";
  } else if (normalized.includes("cylinder") || normalized.includes("tube") || normalized.includes("pipe")) {
    shapeKey = "cylinder";
  } else if (normalized.includes("octahedron")) {
    shapeKey = "octahedron";
  } else if (normalized.includes("dodecahedron")) {
    shapeKey = "dodecahedron";
  } else if (normalized.includes("tetrahedron")) {
    shapeKey = "tetrahedron";
  } else if (normalized.includes("icosahedron") || normalized.includes("star") || normalized.includes("crystal") || normalized.includes("prism")) {
    shapeKey = "icosahedron";
  } else if (normalized.includes("sun") || normalized.includes("solar") || normalized.includes("eclipse")) {
    shapeKey = "sunCoin";
  } else if (normalized.includes("lotus") || normalized.includes("flower") || normalized.includes("zen") || normalized.includes("garden")) {
    shapeKey = "lotusCoin";
  } else if (normalized.includes("arrow") || normalized.includes("target") || normalized.includes("bullseye")) {
    shapeKey = "arrowTarget";
  } else if (normalized.includes("dollar") || normalized.includes("coin") || normalized.includes("money") || normalized.includes("gold")) {
    shapeKey = "dollarCoin";
  }

  // Generate beautiful randomized color coordinates procedurally by default on start
  const randomHue = Math.floor(Math.random() * 360);
  const mHue = (randomHue + 120 + Math.floor(Math.random() * 60)) % 360;
  const dHue = (randomHue + 240 + Math.floor(Math.random() * 60)) % 360;

  // Local HSL helper to ensure random fallback combinations are always mathematically harmonious
  const toHexStr = (h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  let materialColor = toHexStr(mHue, 80 + Math.round(Math.random() * 20), 45 + Math.round(Math.random() * 15)); 
  let dashColor = toHexStr(dHue, 85 + Math.round(Math.random() * 15), 50 + Math.round(Math.random() * 15)); 
  let hoverDashColor = Math.random() > 0.6 ? '#ffffff' : toHexStr((dHue + 180) % 360, 95, 75); 
  let bgColor = toHexStr(randomHue, 15 + Math.round(Math.random() * 10), 3 + Math.round(Math.random() * 5));
  let transparent = true;
  let surface = "solid";
  let roughness = 0.35 + Math.random() * 0.2;
  let metalness = 0.3 + Math.random() * 0.4;
  let waveAmplitude = 0.0;
  let waveFrequency = 1.5 + Math.random() * 2.5;

  if (normalized.includes("neon") || normalized.includes("cyber") || normalized.includes("matrix")) {
    const cyberHue = Math.floor(Math.random() * 360);
    materialColor = toHexStr(cyberHue, 95 + Math.floor(Math.random() * 5), 45 + Math.floor(Math.random() * 10)); 
    dashColor = toHexStr((cyberHue + 120 + Math.floor(Math.random() * 60)) % 360, 95, 50); 
    hoverDashColor = toHexStr((cyberHue + 240 + Math.floor(Math.random() * 60)) % 360, 95, 60); 
    bgColor = toHexStr(cyberHue, 20 + Math.floor(Math.random() * 10), 2 + Math.floor(Math.random() * 3));
  } else if (normalized.includes("solar") || normalized.includes("sun") || normalized.includes("fire") || normalized.includes("gold") || normalized.includes("orange") || normalized.includes("fiery")) {
    const solarHue = Math.floor(Math.random() * 45); // Red to warm orange/yellow
    materialColor = toHexStr(solarHue, 90 + Math.floor(Math.random() * 10), 45 + Math.floor(Math.random() * 15)); 
    dashColor = toHexStr((solarHue + 30 + Math.floor(Math.random() * 25)) % 360, 95, 50); 
    hoverDashColor = toHexStr((solarHue + 180) % 360, 90, 70); 
    bgColor = toHexStr(solarHue, 30 + Math.floor(Math.random() * 15), 2 + Math.floor(Math.random() * 4));
  } else if (normalized.includes("matrix") || normalized.includes("emerald") || normalized.includes("hacker") || normalized.includes("green")) {
    const greenHue = 90 + Math.floor(Math.random() * 60); // Pure lush emerald to vibrant lime
    materialColor = toHexStr(greenHue, 85 + Math.floor(Math.random() * 15), 40 + Math.floor(Math.random() * 15)); 
    dashColor = toHexStr((greenHue + 60) % 360, 90, 45); 
    hoverDashColor = toHexStr((greenHue + 180) % 360, 95, 70); 
    bgColor = toHexStr(greenHue, 20 + Math.floor(Math.random() * 10), 2 + Math.floor(Math.random() * 3));
  } else if (normalized.includes("glass") || normalized.includes("refract") || normalized.includes("prism") || normalized.includes("crystal")) {
    surface = "glass";
    const glassHue = Math.floor(Math.random() * 360);
    materialColor = toHexStr(glassHue, 60 + Math.floor(Math.random() * 30), 55 + Math.floor(Math.random() * 15)); 
    dashColor = toHexStr((glassHue + 120) % 360, 75 + Math.floor(Math.random() * 20), 45 + Math.floor(Math.random() * 15)); 
    hoverDashColor = toHexStr((glassHue + 240) % 360, 90, 70); 
    roughness = 0.02 + Math.random() * 0.15;
    metalness = 0.75 + Math.random() * 0.2;
  } else if (normalized.includes("water") || normalized.includes("droplet") || normalized.includes("liquid") || normalized.includes("sea") || normalized.includes("ocean") || normalized.includes("blue")) {
    const blueHue = 180 + Math.floor(Math.random() * 60); // Turquoise to deep sea royal blue
    materialColor = toHexStr(blueHue, 85 + Math.floor(Math.random() * 15), 45 + Math.floor(Math.random() * 15)); 
    dashColor = toHexStr((blueHue + 60) % 360, 85, 45); 
    hoverDashColor = toHexStr((blueHue + 180) % 360, 95, 70); 
    waveAmplitude = 0.4 + Math.random() * 0.6;
    waveFrequency = 2.0 + Math.random() * 3.0;
  } else if (normalized.includes("zen") || normalized.includes("lotus") || normalized.includes("teal") || normalized.includes("soft")) {
    const zenHue = 150 + Math.floor(Math.random() * 50); // Muted organic teals, greens, mints
    materialColor = toHexStr(zenHue, 50 + Math.floor(Math.random() * 30), 45 + Math.floor(Math.random() * 15)); 
    dashColor = toHexStr((zenHue + 100) % 360, 60 + Math.floor(Math.random() * 20), 40 + Math.floor(Math.random() * 15)); 
    hoverDashColor = toHexStr((zenHue + 200) % 360, 80, 70); 
    bgColor = toHexStr(zenHue, 10 + Math.floor(Math.random() * 10), 3 + Math.floor(Math.random() * 4));
  } else if (normalized.includes("retro") || normalized.includes("sunset") || normalized.includes("purple") || normalized.includes("pink") || normalized.includes("violet")) {
    const retroHue = 270 + Math.floor(Math.random() * 60); // Synthwave violets, magentas, hot pinks
    materialColor = toHexStr(retroHue, 80 + Math.floor(Math.random() * 20), 45 + Math.floor(Math.random() * 15)); 
    dashColor = toHexStr((retroHue + 120) % 360, 85, 45); 
    hoverDashColor = toHexStr((retroHue + 240) % 360, 95, 70); 
    bgColor = toHexStr(retroHue, 20 + Math.floor(Math.random() * 15), 2 + Math.floor(Math.random() * 4));
  } else if (normalized.includes("steel") || normalized.includes("brutalist") || normalized.includes("metal") || normalized.includes("silver") || normalized.includes("grey") || normalized.includes("gray")) {
    const monoHue = Math.floor(Math.random() * 360);
    materialColor = toHexStr(monoHue, 5 + Math.floor(Math.random() * 15), 45 + Math.floor(Math.random() * 20)); 
    dashColor = toHexStr((monoHue + 180) % 360, 10 + Math.floor(Math.random() * 20), 20 + Math.floor(Math.random() * 15)); 
    hoverDashColor = Math.random() > 0.5 ? "#ffffff" : toHexStr(Math.floor(Math.random() * 360), 95, 65); 
    metalness = 0.5 + Math.random() * 0.45;
    roughness = 0.1 + Math.random() * 0.35;
    bgColor = toHexStr(monoHue, 5 + Math.floor(Math.random() * 10), 4 + Math.floor(Math.random() * 5));
  } else if (normalized.includes("vintage") || normalized.includes("news") || normalized.includes("monochrome") || normalized.includes("black") || normalized.includes("white")) {
    const isDarkTheme = Math.random() > 0.5;
    materialColor = isDarkTheme ? "#f7f7f7" : "#121212";
    dashColor = isDarkTheme ? "#121212" : "#f7f7f7";
    hoverDashColor = isDarkTheme ? toHexStr(Math.floor(Math.random() * 360), 95, 55) : toHexStr(Math.floor(Math.random() * 360), 95, 45);
    bgColor = isDarkTheme ? "#ffffff" : "#0a0a0a";
    transparent = false;
  }

  if (normalized.includes("liquid") || normalized.includes("wave") || normalized.includes("sway") || normalized.includes("flow") || normalized.includes("active") || normalized.includes("fluid")) {
    waveAmplitude = waveAmplitude || (0.4 + Math.random() * 0.7);
    waveFrequency = waveFrequency || (1.5 + Math.random() * 3.5);
  }

  let patternShape = "dots";
  if (normalized.includes("square") || normalized.includes("matrix") || normalized.includes("block")) {
    patternShape = "squares";
  } else if (normalized.includes("line") || normalized.includes("stripe")) {
    patternShape = "lines";
  } else if (normalized.includes("crosshatch") || normalized.includes("sketch") || normalized.includes("hatch")) {
    patternShape = "crosshatch";
  }

  return {
    sourceMode: normalized.includes("text") ? "text" : "shape",
    shapeKey: shapeKey,
    textString: normalized.includes("text") ? (pr.match(/[A-Za-z0-9]+/)?.[0]?.substring(0, 4).toUpperCase() || "AI") : "AI",
    distance: 5.0,
    lighting: {
      intensity: surface === "glass" ? 1.8 : 1.2,
      fillIntensity: 0.8,
      ambientIntensity: 0.15,
      angleDegrees: 135,
      height: 5.0
    },
    material: {
      surface: surface,
      color: materialColor,
      roughness: roughness,
      metalness: metalness,
      thickness: 150,
      refraction: 1.5,
      environmentPower: surface === "glass" ? 5.0 : 2.0
    },
    halftone: {
      shape: patternShape,
      scale: normalized.includes("high density") || normalized.includes("fine") ? 55.0 : 35.0,
      power: 0.2,
      toneTarget: normalized.includes("dark") ? "dark" : "light",
      width: 0.5,
      imageContrast: 1.2,
      dashColor: dashColor,
      hoverDashColor: hoverDashColor,
      gridAngle: 45.0,
      useImageColors: false,
      waveAmplitude: waveAmplitude,
      waveFrequency: waveFrequency
    },
    background: {
      transparent: true,
      color: bgColor
    }
  };
};

function generateProceduralConcept() {
  const emojis = ["🪐", "🧬", "🔮", "💎", "💻", "🏵️", "🌀", "🌊", "👁️", "⚡", "🔥", "🌸", "🎏", "🌠", "🛰️", "🛸", "🗼", "🎇", "☄️", "🌋", "🎆", "🎭", "🎪", "⛲"];
  const adjs = ["Quantum", "Nebula", "Solar", "Cosmic", "Hyper", "Ethereal", "Acid", "Plasma", "Astral", "Synthetic", "Vapor", "Vortex", "Stardust", "Liquid", "Glassy", "Super", "Abyssal", "Onyx", "Saffron", "Prism", "Holographic", "Chroma", "Spectra", "Sublime", "Flux", "Retro", "Brutalist", "Galactic", "Magnetic", "Obsidian"];
  const nouns = ["Core", "Torus", "Eclipse", "Knot", "Matrix", "Globe", "Wave", "Glow", "Aura", "Shell", "Drift", "Grid", "Pulsar", "Prism", "Fringe", "Vibe", "Voxel", "Echo", "Mirage", "Nexus", "Circuit", "Helix", "Sway", "Vortex", "Horizon", "Beacon"];
  const shapes = ["torusKnot", "icosahedron", "sphere", "torus", "customGrid", "hyperbolicTorus", "mobiusStrip", "capsule", "concentricRings", "waveField", "octahedron", "dodecahedron", "box", "cone", "cylinder"];
  const patterns = ["dots", "squares", "lines", "crosshatch"];
  
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const adj = adjs[Math.floor(Math.random() * adjs.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];

  const colors = [
    "glowing neon cyan and vivid violet highlight",
    "sunburst coral, hot amber-red and polished dark gold material style",
    "hyper-acid green matrix rays and neon radioactive yellow",
    "gorgeous polished copper, deep black velvet, and blazing orange glow",
    "glassy blue-sky glass, soft pastel blossom lavender and sweet peach",
    "abyssal oceanic sapphire, bioluminescent teal, and white-hot spark dots",
    "liquid mercury chrome metallic look with deep indigo shadows",
    "vibrant brutalist manganese yellow, raw iron grey and signal orange dots",
    "dreamy synthwave magenta gradients, dark starlight cobalt and pale violet mist"
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const detailTemplates = [
    `A rendering of a 3D ${shape} with high-density ${pattern} halftone layout, styled with ${color}.`,
    `Dynamic floating 3D ${shape} of rich depth on transparent dark canvas, accented with ${pattern} lines and ${color}.`,
    `Interactive procedural refractive 3D ${shape} utilizing ${color} and detailed alignment of ${pattern} cells.`,
    `An aesthetic avant-garde 3D ${shape} showing striking contrast, uses ${pattern} mesh overlay and ${color} glow.`
  ];
  const detail = detailTemplates[Math.floor(Math.random() * detailTemplates.length)];

  return {
    name: `${emoji} ${adj} ${noun}`,
    prompt: detail
  };
}

export const app = express();

console.log("[DEBUG] Current working directory:", process.cwd());
console.log("[DEBUG] Env keys after loading:", Object.keys(process.env).filter(k => k.includes('GEMINI')));

app.use(express.json());

// Request logger for better troubleshooting on Vercel deployment logs
app.use((req, res, next) => {
  console.log(`[DEBUG_ROUTE] Path: ${req.path}, URL: ${req.url}, Method: ${req.method}`);
  next();
});

const apiRouter = express.Router();

// Safe debugging route to help the user diagnose environment variables
apiRouter.get("/debug-env", (req, res) => {
  const keysInfo: Record<string, string> = {};
  Object.keys(process.env).forEach(key => {
    if (key.includes("GEMINI") || key.includes("API") || key.includes("KEY")) {
      const val = process.env[key] || "";
      if (!val) {
        keysInfo[key] = "EMPTY/UNDEFINED";
      } else {
        const masked = val.length > 8 
          ? `${val.substring(0, 6)}...${val.substring(val.length - 4)} (Length: ${val.length})` 
          : `PRESENT BUT SHORT (Length: ${val.length})`;
        keysInfo[key] = masked;
      }
    }
  });

  let envFileStatus = "Not found";
  try {
    const p = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(p)) {
      envFileStatus = "Exists in workspace root";
    }
  } catch (e: any) {
    envFileStatus = "Error: " + e.message;
  }

  res.json({
    envFileStatus,
    processCwd: process.cwd(),
    variablesFound: keysInfo,
    nodeEnv: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
  });
});

// API route for dynamic AI suggestions (Local Heuristic Engine)
apiRouter.post("/gemini/suggest-concepts", async (req, res) => {
  console.log("[DEBUG] Using local heuristic engine for concepts.");
  const data = {
    concepts: Array.from({ length: 5 }, () => generateProceduralConcept())
  };
  res.json(data);
});

// Helper functions for dynamic procedural color generation when API is unavailable or for extra variety
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateProceduralPalette(namePrefix?: string) {
  const baseHue = Math.floor(Math.random() * 360);
  const materialHue = (baseHue + 120 + Math.floor(Math.random() * 60)) % 360;
  const dashHue = (baseHue + 240 + Math.floor(Math.random() * 60)) % 360;
  
  const bgHue = baseHue;
  const bgSat = 12 + Math.floor(Math.random() * 12); // 12% - 24%
  const bgLight = 2 + Math.floor(Math.random() * 6); // 2% - 8%
  const background = hslToHex(bgHue, bgSat, bgLight);
  
  const material = hslToHex(materialHue, 80 + Math.floor(Math.random() * 20), 45 + Math.floor(Math.random() * 15));
  const dashColor = hslToHex(dashHue, 85 + Math.floor(Math.random() * 15), 50 + Math.floor(Math.random() * 15));
  const hoverDashColor = Math.random() > 0.6 ? '#ffffff' : hslToHex((dashHue + 180) % 360, 95, 75);

  const stop1 = hslToHex(bgHue, bgSat + 8, bgLight + 4);
  const stop2 = material;
  const stop3 = dashColor;
  
  const nameParts1 = ["Vortex", "Quantum", "Nebula", "Solar", "Cosmic", "Hyper", "Cyber", "Ethereal", "Acid", "Plasma", "Astral", "Synthetic", "Chroma", "Spectra", "Prism", "Sublime", "Flux"];
  const nameParts2 = ["Dust", "Core", "Flare", "Shade", "Grid", "Shell", "Pulse", "Warp", "Drift", "Ghost", "Matrix", "Wave", "Reflect", "Glow", "Nexus", "Aura", "Torus", "Eclipse"];
  const finalName = namePrefix || `${nameParts1[Math.floor(Math.random() * nameParts1.length)]} ${nameParts2[Math.floor(Math.random() * nameParts2.length)]}`;
  
  return {
    name: finalName,
    background,
    material,
    dashColor,
    hoverDashColor,
    stops: [
      { offset: 0.0, color: stop1 },
      { offset: 0.5, color: stop2 },
      { offset: 1.0, color: stop3 }
    ]
  };
}

// API route for dynamic custom palette generation (Local Heuristic Engine)
apiRouter.post("/gemini/generate-palette", async (req, res) => {
  console.log("[DEBUG] Using local heuristic engine for palettes.");
  const data = {
    palette: generateProceduralPalette(),
    curated: Array.from({ length: 6 }, () => generateProceduralPalette())
  };
  res.json(data);
});

// API route for Gemini Style generation (Local Heuristic Engine)
apiRouter.post("/gemini/generate-design", async (req, res) => {
  console.log("[DEBUG] Using local heuristic engine for design generation.");
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }
  const designSettings = generateFallbackPreset(prompt);
  res.json({ settings: designSettings });
});

// Mount the API Router under multiple namespaces to ensure 100% path resolution on Vercel
app.use("/api", apiRouter);
app.use("/", apiRouter);

export default app;
