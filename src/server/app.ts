import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import 'dotenv/config';
import fs from "fs";

console.log("[DEBUG] EXECUTING CLEAN EXPRESS APP ROUTER");

// Fallback to manual loading if dotenv/config didn't pick it up
if (!process.env.GEMINI_API_KEY) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) return;
        
        const key = trimmed.substring(0, eqIdx).trim();
        let value = trimmed.substring(eqIdx + 1).trim();
        
        // Remove trailing comment
        const hashIdx = value.indexOf('#');
        if (hashIdx !== -1) {
          value = value.substring(0, hashIdx).trim();
        }
        
        // Strip single/double quotes around value
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1).trim();
        }
        
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      });
      console.log("[DEBUG] Manually loaded .env in app.ts. GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
    }
  } catch (e) {
    console.error("[DEBUG] Failed to manually load .env in app.ts", e);
  }
}

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

// API route for dynamic AI suggestions
apiRouter.post("/gemini/suggest-concepts", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Gemini API] GEMINI_API_KEY environment variable is not configured.");
      return res.status(400).json({ error: "GEMINI_API_KEY environment variable is not configured. Please supply it in your .env file." });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `You are an extremely creative 3D designer and UI prompt specialist. 
Your task is to generate 5 unique, poetic, innovative, and highly contrasting concept ideas/prompts for an interactive 3D halftone vector generator.
Each concept must have:
- A short, eye-catching name with a matching emoji (e.g. "🪐 Sapphire Orbit", "🧬 Bio-Neon Core")
- A descriptive prompt detailing the vibe, geometry, colors, and pattern shape.

Return a raw JSON object containing an array under the "concepts" key.`;

    const suggestConfig = {
      systemInstruction,
      temperature: 1.1,
      responseMimeType: "application/json" as const,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          concepts: {
            type: Type.ARRAY,
            description: "List of 5 highly creative concept inspirations",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Display name with emoji, max 20 chars. E.g. '🔮 Glass Torus'" },
                prompt: { type: Type.STRING, description: "Descriptive design prompt for styling. Look-and-feel, colors, halftone style. Max 120 chars." }
              },
              required: ["name", "prompt"]
            }
          }
        },
        required: ["concepts"]
      }
    };

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
    let response;
    let generatedByAI = false;

    // Select a fully randomized target theme dynamically to force completely new suggestions on every API call!
    const themes = [
      "Cyberpunk Neon & Retro Hacker", 
      "Minimalist Sage Japanese Zen & Organic Material", 
      "Glass Prismatic Refractions & Holographic Iridescence", 
      "Raw Brutalist Steel Space Station Interface", 
      "Psychedelic Liquid Lava-Lamp Swaying Gradients", 
      "Dreamy Synthwave Magenta Sunset & Retro grid lines", 
      "Deep Abyss Oceanic Glowing Coral & Bioluminescent Dots", 
      "Astral Cosmic Solar eclipses with Gold Halftone halos",
      "Aesthetic Pastel Whimsey candy-coated glass spheres"
    ];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const randomSeed = Math.random().toString(36).substring(4);

    for (const model of modelsToTry) {
      try {
        console.log(`Generating suggestions using model: ${model}`);
        response = await ai.models.generateContent({
          model,
          contents: `Please generate 5 extremely cool and completely different 3D halftone design concept prompts. Focus primarily on the organic style: "${randomTheme}". Be creative, artistic, and do NOT duplicate previous names. Make sure the designs have rich visual variety. Seed Identifier: ${randomSeed}`,
          config: suggestConfig
        });
        if (response && response.text) {
          generatedByAI = true;
          break;
        }
      } catch (err: any) {
        const rawMsg = err?.message || String(err);
        let reasonOfFail = "Temporarily Unavailable";
        if (rawMsg.includes("429") || rawMsg.includes("RESOURCE_EXHAUSTED") || rawMsg.includes("quota")) {
          reasonOfFail = "Rate-Limit or Quota Exceeded (429)";
        } else if (rawMsg.includes("503") || rawMsg.includes("UNAVAILABLE") || rawMsg.includes("demand")) {
          reasonOfFail = "Model experiencing heavy demand (503)";
        } else {
          reasonOfFail = rawMsg.substring(0, 100);
        }
        console.log(`[Gemini API] Suggestions model ${model} bypassed. Reason: ${reasonOfFail}`);
      }
    }

    let data;
    if (generatedByAI && response) {
      try {
        data = JSON.parse(response.text || "{}");
      } catch (jsonErr) {
        console.error("Failed to parse suggest response as JSON, falling back to procedural:", jsonErr);
        data = {
          concepts: Array.from({ length: 5 }, () => generateProceduralConcept())
        };
      }
    } else {
      console.warn("All Gemini models bypassed or failed. Selecting 5 fully randomized procedural concept prompts.");
      data = {
        concepts: Array.from({ length: 5 }, () => generateProceduralConcept())
      };
    }

    res.json(data);
  } catch (error: any) {
    console.log(`[Gemini API] Failed to run suggestions endpoint: ${error?.message || error}`);
    res.status(500).json({ error: error.message || "Failed to generate suggestions with Gemini API" });
  }
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

// API route for dynamic custom palette generation
apiRouter.post("/gemini/generate-palette", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Gemini API] GEMINI_API_KEY environment variable is not configured. Returning custom procedurally generated harmonies with infinite combinations.");
      const data = {
        palette: generateProceduralPalette(),
        curated: Array.from({ length: 6 }, () => generateProceduralPalette())
      };
      return res.json(data);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `You are a world-class typographic, color theorist, and generative digital artist.
Your task is to generate one master, active color palette ('palette') and exactly 6 highly diverse, creative, and beautiful alternative color palettes ('curated') for a 3D HTML5 halftone rendering app.
Be incredibly unique and avant-garde! Invent ultra-modern color combinations (e.g. Cyberpunk glow, warm sunset flares, emerald chemical matrices, vaporwave purple/teals, dark brutalist slate, neon acid orange).
Ensure high-contrast backgrounds and gorgeous material vs halftone colors.

The JSON schema requires:
1. 'palette' (the main active design palette)
2. 'curated' (exactly 6 alternative design palettes)

Each palette must have:
- name: A cool descriptive name (max 20 characters)
- background: Sleek hex color string
- material: Main color for the 3D matte surface
- dashColor: High-contrast halftone dot color
- hoverDashColor: Complementary glow hover color
- stops: Exactly 3 gradient stops (spanning from offset 0.0 to 1.0) with custom hex color values.`;

    const paletteConfig = {
      systemInstruction,
      responseMimeType: "application/json" as const,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          palette: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the palette, max 20 chars" },
              background: { type: Type.STRING },
              material: { type: Type.STRING },
              dashColor: { type: Type.STRING },
              hoverDashColor: { type: Type.STRING },
              stops: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    offset: { type: Type.NUMBER },
                    color: { type: Type.STRING }
                  },
                  required: ["offset", "color"]
                }
              }
            },
            required: ["name", "background", "material", "dashColor", "hoverDashColor", "stops"]
          },
          curated: {
            type: Type.ARRAY,
            description: "Strictly 6 highly diverse alternative color palettes",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the alternative palette" },
                background: { type: Type.STRING },
                material: { type: Type.STRING },
                dashColor: { type: Type.STRING },
                hoverDashColor: { type: Type.STRING },
                stops: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      offset: { type: Type.NUMBER },
                      color: { type: Type.STRING }
                    },
                    required: ["offset", "color"]
                  }
                }
              },
              required: ["name", "background", "material", "dashColor", "hoverDashColor", "stops"]
            }
          }
        },
        required: ["palette", "curated"]
      },
      temperature: 1.0
    };

    const randomThemes = [
      "Retro Synthwave with warm violet, dark cobalt neon and hot magenta highlights",
      "Japanese Sakura with elegant peach blooms, soft cherry reds, and fresh mint greens",
      "Brutalist industrial structure with high-contrast glowing safety warning orange and stark dark charcoal black",
      "Deep Oceanic abyss with glowing neon bioluminescent cyan beads and dark sapphire depths",
      "Golden sand solar flare with magnificent metallic copper and highly polished warm luxury yellow",
      "Lime acid toxicity with hyper-radioactive green flares and dark volcanic basalt stone background",
      "Cyberpunk cyberpunk overdrive with glowing hot-pinks, screaming chartreuse, and deep galactic purple sky",
      "Cosmic hyper-space rift with bright mystical cyan, interstellar magenta, and deep ambient stardust purple",
      "Vaporwave pastel horizon with soft dreamy sunset orange, pale lilac mist, and cool teal reflections"
    ];
    const chosenThemeSelected = randomThemes[Math.floor(Math.random() * randomThemes.length)];
    const seedStringValue = Math.random().toString(36).substring(4);

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
    let response;
    let generatedByAI = false;

    for (const model of modelsToTry) {
      try {
        console.log(`Generating interactive master + 6 alternative design palettes using: ${model}. Theme chosen: ${chosenThemeSelected}`);
        response = await ai.models.generateContent({
          model,
          contents: `Please generate one perfect master palette (inspired by ${chosenThemeSelected}) and 6 highly distinct alternative design palettes with beautiful modern color harmony options. Random Seed: ${seedStringValue}. Do not repeat color coordinates. Ensure rich variation, high brightness contrast and artistic names!`,
          config: paletteConfig
        });
        if (response && response.text) {
          generatedByAI = true;
          break;
        }
      } catch (err: any) {
        const rawMsg = err?.message || String(err);
        let reasonOfFail = "Temporarily Unavailable";
        if (rawMsg.includes("429") || rawMsg.includes("RESOURCE_EXHAUSTED") || rawMsg.includes("quota")) {
          reasonOfFail = "Rate-Limit or Quota Exceeded (429)";
        } else if (rawMsg.includes("503") || rawMsg.includes("UNAVAILABLE") || rawMsg.includes("demand")) {
          reasonOfFail = "Model experiencing heavy demand (503)";
        } else {
          reasonOfFail = rawMsg.substring(0, 100);
        }
        console.log(`[Gemini API] Palette model ${model} bypassed. Reason: ${reasonOfFail}`);
      }
    }

    let data;
    if (generatedByAI && response) {
      try {
        data = JSON.parse(response.text || "{}");
        // Ensure structure has valid elements, otherwise procedurally back them up
        if (!data.palette) {
          data.palette = generateProceduralPalette();
        }
        if (!data.curated || !Array.isArray(data.curated) || data.curated.length < 3) {
          data.curated = Array.from({ length: 6 }, () => generateProceduralPalette());
        }
      } catch (jsonErr) {
        console.error("Failed to parse palette response as JSON, falling back procedurally:", jsonErr);
        data = {
          palette: generateProceduralPalette(),
          curated: Array.from({ length: 6 }, () => generateProceduralPalette())
        };
      }
    } else {
      console.warn("All Gemini models bypassed or failed. Selecting hermosa procedural infinite variety falls.");
      data = {
        palette: generateProceduralPalette(),
        curated: Array.from({ length: 6 }, () => generateProceduralPalette())
      };
    }

    res.json(data);
  } catch (error: any) {
    console.log(`[Gemini API] Failed to run palette generator endpoint: ${error?.message || error}`);
    res.status(500).json({ error: error.message || "Failed to generate palette with Gemini API" });
  }
});

// API route for Gemini Style generation
apiRouter.post("/gemini/generate-design", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("[DEBUG] Checking API Key...");
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn("[Gemini API] GEMINI_API_KEY environment variable is not configured.");
      const designSettings = generateFallbackPreset(prompt);
      return res.json({ settings: designSettings, debug: "Key was missing" });
    }

    console.log("[DEBUG] Gemini API Key Length:", apiKey.length);
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `You are a professional 3D graphic designer and AI style generator. 
Your task is to generate cohesive, beautiful visual presets (colors, shapes, halftone grids, and lighting setups) based on the user's prompt.
You must return a raw JSON object matching the exact schema definition.
Make sure values are highly artistic, vibrant, and coordinated:
- Coordinated hex colors for 'material.color', 'halftone.dashColor', 'halftone.hoverDashColor', and 'background.color'.
- Coordinated 3D shapes ('shapeKey') like 'torusKnot', 'sphere', 'torus', etc.
- Unique lighting adjustments.
- Halftone settings that create an elegant vector pattern.`;

    const generatorConfig = {
      systemInstruction,
      temperature: 1.15,
      responseMimeType: "application/json" as const,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sourceMode: { type: Type.STRING, description: "Must be either 'shape' or 'text'." },
          shapeKey: { type: Type.STRING, description: "One of: torusKnot, sphere, torus, icosahedron, box, cone, cylinder, octahedron, dodecahedron, tetrahedron, sunCoin, lotusCoin, arrowTarget, dollarCoin" },
          textString: { type: Type.STRING, description: "Short letter/word to render if sourceMode is 'text'. E.g. AI or VIBE" },
          distance: { type: Type.NUMBER, description: "Camera distance, value between 3.5 and 7.5." },
          lighting: {
            type: Type.OBJECT,
            properties: {
              intensity: { type: Type.NUMBER, description: "Main light intensity, between 0.2 and 2.5." },
              fillIntensity: { type: Type.NUMBER, description: "Fill light intensity, between 0.1 and 1.5." },
              ambientIntensity: { type: Type.NUMBER, description: "Ambient brightness, between 0.05 and 0.5." },
              angleDegrees: { type: Type.NUMBER, description: "Light angle in degrees, between 0 and 360." },
              height: { type: Type.NUMBER, description: "Light projection height, between 2.0 and 10.0." },
            },
            required: ["intensity", "fillIntensity", "ambientIntensity", "angleDegrees", "height"]
          },
          material: {
            type: Type.OBJECT,
            properties: {
              surface: { type: Type.STRING, description: "Either 'solid' or 'glass'." },
              color: { type: Type.STRING, description: "Hex color for the model surface, e.g. '#22c55e'." },
              roughness: { type: Type.NUMBER, description: "Surface roughness from 0.0 to 1.0." },
              metalness: { type: Type.NUMBER, description: "Surface metalness from 0.0 to 1.0." },
              thickness: { type: Type.NUMBER, description: "Glass refraction thickness from 10 to 300." },
              refraction: { type: Type.NUMBER, description: "Refractive index from 1.0 to 3.0." },
              environmentPower: { type: Type.NUMBER, description: "Environment reflection strength, from 1.0 to 10.0." },
            },
            required: ["surface", "color", "roughness", "metalness", "thickness", "refraction", "environmentPower"]
          },
          halftone: {
            type: Type.OBJECT,
            properties: {
              shape: { type: Type.STRING, description: "Pattern style: 'dots', 'squares', 'lines', or 'crosshatch'." },
              scale: { type: Type.NUMBER, description: "Grid detail scale, between 10.0 and 80.0." },
              power: { type: Type.NUMBER, description: "Grid tone control power, from -1.5 to 1.5." },
              toneTarget: { type: Type.STRING, description: "Tone mapping zone: 'light' or 'dark'." },
              width: { type: Type.NUMBER, description: "Halftone dot width compression, from 0.1 to 1.0." },
              imageContrast: { type: Type.NUMBER, description: "Contrast index, between 0.5 and 2.0." },
              dashColor: { type: Type.STRING, description: "Hex color for pattern dash/dots, e.g. '#2563eb'." },
              hoverDashColor: { type: Type.STRING, description: "Hex color when hovered, e.g. '#dc2626'." },
              gridAngle: { type: Type.NUMBER, description: "Pattern angle in degrees, from 0.0 to 90.0." },
              useImageColors: { type: Type.BOOLEAN, description: "Whether to overlay image colors, usually false unless styling for color fidelity." },
              waveAmplitude: { type: Type.NUMBER, description: "Liquid sway flow amplitude, usually 0.0 to keep static, but can go up to 1.5 if waving or liquid pattern requested." },
              waveFrequency: { type: Type.NUMBER, description: "Liquid sway speed in Hz, between 0.5 to 10.0." }
            },
            required: ["shape", "scale", "power", "toneTarget", "width", "imageContrast", "dashColor", "hoverDashColor", "gridAngle", "useImageColors", "waveAmplitude", "waveFrequency"]
          },
          background: {
            type: Type.OBJECT,
            properties: {
              transparent: { type: Type.BOOLEAN, description: "Whether back canvas is transparent." },
              color: { type: Type.STRING, description: "Hex background fill, e.g. '#000000'." }
            },
            required: ["transparent", "color"]
          }
        },
        required: ["sourceMode", "shapeKey", "textString", "distance", "lighting", "material", "halftone", "background"]
      }
    };

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
    let response;
    let generatedByAI = false;
    const apiSeed = Math.random().toString(36).substring(4);

    for (const model of modelsToTry) {
      try {
        console.log(`Generating design using model: ${model}`);
        response = await ai.models.generateContent({
          model,
          contents: `Generate an incredibly unique, highly creative and visually stunning 3D halftone design preset for the theme: "${prompt}". Highly randomize colors, lighting angles, scale factors, shapes, and materials (either glass or solid). Avoid standard colors. Be artistic and surprising! Seed token: ${apiSeed}`,
          config: generatorConfig
        });
        if (response && response.text) {
          generatedByAI = true;
          break;
        }
      } catch (err: any) {
        const rawMsg = err?.message || String(err);
        let reasonOfFail = "Temporarily Unavailable";
        if (rawMsg.includes("429") || rawMsg.includes("RESOURCE_EXHAUSTED") || rawMsg.includes("quota")) {
          reasonOfFail = "Rate-Limit or Quota Exceeded (429)";
        } else if (rawMsg.includes("503") || rawMsg.includes("UNAVAILABLE") || rawMsg.includes("demand")) {
          reasonOfFail = "Model experiencing heavy demand (503)";
        } else {
          reasonOfFail = rawMsg.substring(0, 100);
        }
        console.log(`[Gemini API] Design model ${model} bypassed. Reason: ${reasonOfFail}`);
      }
    }

    let designSettings;
    if (generatedByAI && response) {
      try {
        designSettings = JSON.parse(response.text || "{}");
        if (designSettings.background) designSettings.background.transparent = true;
      } catch (jsonErr) {
        console.error("Failed to parse Gemini generated response as JSON, falling back to heuristic:", jsonErr);
        designSettings = generateFallbackPreset(prompt);
      }
    } else {
      console.warn("All Gemini models failed or faced rate limits. Initiating beautiful local heuristic fallback style for prompt:", prompt);
      designSettings = generateFallbackPreset(prompt);
    }

    res.json({ settings: designSettings });
  } catch (error: any) {
    console.error(`[Gemini API] Failed to run design endpoint:`, error);
    res.status(500).json({ error: error.message || "Failed to generate design with Gemini API" });
  }
});

// Mount the API Router under multiple namespaces to ensure 100% path resolution on Vercel
app.use("/api", apiRouter);
app.use("/", apiRouter);

export default app;
