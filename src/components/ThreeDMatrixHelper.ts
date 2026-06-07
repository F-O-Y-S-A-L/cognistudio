/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SilkRibbonSetting {
  id: number;
  colorStart: string;
  colorEnd: string;
  twistPhase: number;
}

export interface Node3D {
  u: number;
  v: number;
  x2d: number;
  y2d: number;
  z3d: number;
  r: number;
  g: number;
  b: number;
  brightness: number;
  size: number;
}

// Scans pixel matrix of offscreen canvas and applies brightness filters, pre-Contrast and decay velocities
export const drawPresetToMatrix = (
  oCtx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  index: number
) => {
  oCtx.fillStyle = '#010204';
  oCtx.fillRect(0, 0, w, h);

  if (index === 0) {
    // Neo Wave: flowing organic sin waves
    for (let i = 0; i < 4; i++) {
      const px = w / 2 + Math.sin(time * 1.3 + i * 1.8) * (w * 0.32);
      const py = h / 2 + Math.cos(time * 1.1 + i * 1.4) * (h * 0.32);
      const rad = w * (0.28 + 0.1 * Math.sin(time + i));

      const grad = oCtx.createRadialGradient(px, py, 0, px, py, rad);
      if (i === 0) {
        grad.addColorStop(0, 'rgba(255, 10, 130, 0.95)');
        grad.addColorStop(1, 'rgba(120, 0, 255, 0)');
      } else if (i === 1) {
        grad.addColorStop(0, 'rgba(0, 240, 255, 0.95)');
        grad.addColorStop(1, 'rgba(30, 80, 255, 0)');
      } else if (i === 2) {
        grad.addColorStop(0, 'rgba(255, 190, 40, 0.95)');
        grad.addColorStop(1, 'rgba(255, 80, 80, 0)');
      } else {
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.95)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      oCtx.fillStyle = grad;
      oCtx.beginPath();
      oCtx.arc(px, py, rad, 0, Math.PI * 2);
      oCtx.fill();
    }
  } else if (index === 1) {
    // Helix Portal
    const cx = w / 2, cy = h / 2;
    for (let j = 0; j < 5; j++) {
      const tOffset = time * 2.1 + j * ((Math.PI * 2) / 5);
      const radius = w * 0.24 * (1.0 + 0.18 * Math.sin(time * 1.6));
      const px = cx + Math.cos(tOffset) * radius;
      const py = cy + Math.sin(tOffset) * radius;

      const grad = oCtx.createRadialGradient(px, py, 0, px, py, w * 0.25);
      grad.addColorStop(0, j % 2 === 0 ? 'rgba(0, 255, 190, 0.9)' : 'rgba(255, 0, 127, 0.9)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      oCtx.fillStyle = grad;
      oCtx.beginPath();
      oCtx.arc(px, py, w * 0.25, 0, Math.PI * 2);
      oCtx.fill();
    }
  } else if (index === 2) {
    // Prismatic Ripple Lines
    for (let i = 0; i < 5; i++) {
      const grad = oCtx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, i % 2 === 0 ? '#ff1060' : '#00f0ff');
      grad.addColorStop(1, i % 2 === 0 ? '#fa8bff' : '#ffea00');

      oCtx.strokeStyle = grad;
      oCtx.lineWidth = 14;
      oCtx.beginPath();
      oCtx.moveTo(-20, h * 0.15 + i * 28);
      for (let x = 0; x <= w + 20; x += 10) {
        const y = h * 0.22 + i * 20 + Math.sin(time * 2.8 + x * 0.05 + i * 0.8) * (h * 0.24);
        oCtx.lineTo(x, y);
      }
      oCtx.stroke();
    }
  } else {
    // Cosmic Nebula
    const cx = w / 2, cy = h / 2;
    const grad = oCtx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.55);
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.95)');
    grad.addColorStop(0.5, 'rgba(76, 29, 149, 0.75)');
    grad.addColorStop(1, 'rgba(10, 5, 20, 0)');
    oCtx.fillStyle = grad;
    oCtx.beginPath();
    oCtx.arc(cx, cy, w * 0.55, 0, Math.PI * 2);
    oCtx.fill();

    oCtx.fillStyle = 'rgba(236, 72, 153, 0.9)';
    oCtx.beginPath();
    oCtx.arc(cx + Math.cos(time * 1.2) * 20, cy + Math.sin(time * 0.9) * 20, w * 0.18, 0, Math.PI * 2);
    oCtx.fill();
    
    oCtx.fillStyle = 'rgba(59, 130, 246, 0.8)';
    oCtx.beginPath();
    oCtx.arc(cx - Math.sin(time) * 25, cy - Math.cos(time * 0.7) * 25, w * 0.14, 0, Math.PI * 2);
    oCtx.fill();
  }
};

export const parseHexToRGB = (hex: string) => {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  const val = parseInt(clean, 16);
  return {
    r: (val >> 16) & 255,
    g: (val >> 8) & 255,
    b: val & 255
  };
};

export const getChromaColor = (
  u: number,
  brightness: number,
  startColor: string,
  endColor: string
) => {
  const colS = parseHexToRGB(startColor);
  const colE = parseHexToRGB(endColor);

  const r = Math.round(colS.r + (colE.r - colS.r) * u);
  const g = Math.round(colS.g + (colE.g - colS.g) * u);
  const bColor = Math.round(colS.b + (colE.b - colS.b) * u);

  const shadow = 0.45 + 0.55 * brightness;
  return `rgb(${Math.round(r * shadow)}, ${Math.round(g * shadow)}, ${Math.round(bColor * shadow)})`;
};
