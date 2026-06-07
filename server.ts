import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // API route for dynamic AI suggestions
  app.post("/api/gemini/suggest-concepts", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY environment variable is not configured." 
        });
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

      const fallbackPool = [
        { name: "🎴 Solar Flare", prompt: "A warm blazing solar eclipse with fiery gold colors, thin concentric circles and smooth halo glow" },
        { name: "💻 Neon Matrix", prompt: "Emerald retro digital hacker code matrix, high density square halftone in dark background" },
        { name: "🔮 Glass Torus", prompt: "A beautiful glassy refraction torus with shiny metalness, light pastel blue colors and crosshatch dots" },
        { name: "🪙 Cyber Coin", prompt: "A sleek silver sun coin with high-tech cyan vector dots, moody directional light and dark transparent glass" },
        { name: "🪐 Cosmic Blast", prompt: "Cosmic stardust nebula icosahedron, cyan and magenta halftone dots, floating on transparent canvas" },
        { name: "🌸 Zen Lotus", prompt: "Zen lotus coin with teal circles halftone, soft white matte material, clean ambient studio lights" },
        { name: "🌇 Retro Sunset", prompt: "Cyberpunk highway neon sunset grid, violet cylinder, high metalness, bright pink glowing lines" },
        { name: "💎 Crystal Prism", prompt: "Prismatic crystal pyramid, high environmental power, multi-colored dots overlap, black transparent space" },
        { name: "⚙️ Brutalist Steel", prompt: "Brutalist bold steel box with heavy yellow crosshatch dots, high contrast edge light, dark shadow" },
        { name: "💧 Water Droplet", prompt: "Glistening water droplet sphere, high thickness refraction, liquid pattern, neon green halftone accents" }
      ];

      const generateFallbackConcepts = () => {
        const shuffled = [...fallbackPool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 5);
      };

      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
      let response;
      let generatedByAI = false;

      for (const model of modelsToTry) {
        try {
          console.log(`Generating suggestions using model: ${model}`);
          response = await ai.models.generateContent({
            model,
            contents: "Please generate 5 extremely cool and different 3D halftone design concept prompts. Be creative, neon, liquid, artistic, spacey, glass-like, retro or futuristic. Do not duplicate.",
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
          console.error("Failed to parse suggest response as JSON, falling back to local pool:", jsonErr);
          data = { concepts: generateFallbackConcepts() };
        }
      } else {
        data = { concepts: generateFallbackConcepts() };
      }

      res.json(data);
    } catch (error: any) {
      console.log(`[Gemini API] Failed to run suggestions endpoint: ${error?.message || error}`);
      res.status(500).json({ error: error.message || "Failed to generate suggestions" });
    }
  });

  // API route for Gemini Style generation
  app.post("/api/gemini/generate-design", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY environment variable is not configured. Please add it in Settings > Secrets." 
        });
      }

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

      // Dynamic, smart local fallback style preset generator in case Gemini is transiently overloaded (503 status)
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

        let materialColor = "#22c55e"; 
        let dashColor = "#2563eb"; 
        let hoverDashColor = "#dc2626"; 
        let bgColor = "#000000";
        let transparent = true;
        let surface = "solid";
        let roughness = 0.4;
        let metalness = 0.5;
        let waveAmplitude = 0.0;
        let waveFrequency = 2.5;

        if (normalized.includes("neon") || normalized.includes("cyber") || normalized.includes("matrix")) {
          materialColor = "#00ffcc";
          dashColor = "#ff007f";
          hoverDashColor = "#39ff14";
          bgColor = "#030712";
        } else if (normalized.includes("solar") || normalized.includes("sun") || normalized.includes("fire") || normalized.includes("gold") || normalized.includes("orange") || normalized.includes("fiery")) {
          materialColor = "#f59e0b"; 
          dashColor = "#dc2626"; 
          hoverDashColor = "#fbbf24"; 
          bgColor = "#080200";
        } else if (normalized.includes("matrix") || normalized.includes("emerald") || normalized.includes("hacker") || normalized.includes("green")) {
          materialColor = "#10b981"; 
          dashColor = "#047857"; 
          hoverDashColor = "#00ff00"; 
          bgColor = "#020617";
        } else if (normalized.includes("glass") || normalized.includes("refract") || normalized.includes("prism") || normalized.includes("crystal")) {
          surface = "glass";
          materialColor = "#38bdf8"; 
          dashColor = "#4f46e5"; 
          hoverDashColor = "#ec4899"; 
          roughness = 0.1;
          metalness = 0.9;
        } else if (normalized.includes("water") || normalized.includes("droplet") || normalized.includes("liquid") || normalized.includes("sea") || normalized.includes("ocean") || normalized.includes("blue")) {
          materialColor = "#06b6d4"; 
          dashColor = "#2563eb"; 
          hoverDashColor = "#00ffff"; 
          waveAmplitude = 0.8;
          waveFrequency = 3.0;
        } else if (normalized.includes("zen") || normalized.includes("lotus") || normalized.includes("teal") || normalized.includes("soft")) {
          materialColor = "#14b8a6"; 
          dashColor = "#0d9488"; 
          hoverDashColor = "#38bdf8"; 
          bgColor = "#0a0a0a";
        } else if (normalized.includes("retro") || normalized.includes("sunset") || normalized.includes("purple") || normalized.includes("pink") || normalized.includes("violet")) {
          materialColor = "#d946ef"; 
          dashColor = "#7c3aed"; 
          hoverDashColor = "#f43f5e"; 
          bgColor = "#0c0a0f";
        } else if (normalized.includes("steel") || normalized.includes("brutalist") || normalized.includes("metal") || normalized.includes("silver") || normalized.includes("grey") || normalized.includes("gray")) {
          materialColor = "#94a3b8"; 
          dashColor = "#334155"; 
          hoverDashColor = "#ffd700"; 
          metalness = 0.8;
          roughness = 0.2;
          bgColor = "#090d16";
        } else if (normalized.includes("vintage") || normalized.includes("news") || normalized.includes("monochrome") || normalized.includes("black") || normalized.includes("white")) {
          materialColor = "#ffffff";
          dashColor = "#000000";
          hoverDashColor = "#525252";
          bgColor = "#ffffff";
          transparent = false;
        }

        if (normalized.includes("liquid") || normalized.includes("wave") || normalized.includes("sway") || normalized.includes("flow") || normalized.includes("active") || normalized.includes("fluid")) {
          waveAmplitude = waveAmplitude || 0.6;
          waveFrequency = waveFrequency || 3.0;
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
            transparent: transparent,
            color: bgColor
          }
        };
      };

      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
      let response;
      let generatedByAI = false;

      for (const model of modelsToTry) {
        try {
          console.log(`Generating design using model: ${model}`);
          response = await ai.models.generateContent({
            model,
            contents: `Generate a gorgeous visual design preset style for: "${prompt}"`,
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
      console.log(`[Gemini API] Failed to run design endpoint: ${error?.message || error}`);
      res.status(500).json({ error: error.message || "Failed to generate design with Gemini API" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
