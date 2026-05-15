// Color space conversions for the swatch copy menu.
// All functions take/return numbers in 0..1 unless noted.

(function (global) {
  'use strict';

  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }

  function hexToRgb(hex) {
    let h = hex.replace('#', '').trim();
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length !== 6) return null;
    const n = parseInt(h, 16);
    return {
      r: ((n >> 16) & 255) / 255,
      g: ((n >> 8) & 255) / 255,
      b: (n & 255) / 255,
    };
  }

  function rgbTo255(c) {
    return {
      r: Math.round(clamp(c.r, 0, 1) * 255),
      g: Math.round(clamp(c.g, 0, 1) * 255),
      b: Math.round(clamp(c.b, 0, 1) * 255),
    };
  }

  function rgbToHsl(c) {
    const r = c.r, g = c.g, b = c.b;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  // sRGB gamma <-> linear
  function srgbToLinear(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function linearToSrgb(c) {
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  }

  function rgbToLinear(c) {
    return { r: srgbToLinear(c.r), g: srgbToLinear(c.g), b: srgbToLinear(c.b) };
  }

  // Linear sRGB -> OKLab (Björn Ottosson)
  function linearRgbToOklab(c) {
    const l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
    const m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
    const s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
    const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
    return {
      L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
      a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
      b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    };
  }

  function oklabToOklch(lab) {
    const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
    let H = Math.atan2(lab.b, lab.a) * 180 / Math.PI;
    if (H < 0) H += 360;
    return { L: lab.L, C: C, H: H };
  }

  // Linear sRGB -> XYZ (D65)
  function linearRgbToXyz(c) {
    return {
      x: 0.4124564 * c.r + 0.3575761 * c.g + 0.1804375 * c.b,
      y: 0.2126729 * c.r + 0.7151522 * c.g + 0.0721750 * c.b,
      z: 0.0193339 * c.r + 0.1191920 * c.g + 0.9503041 * c.b,
    };
  }

  // XYZ (D65) -> linear Display-P3
  function xyzToLinearP3(c) {
    return {
      r:  2.4934969 * c.x - 0.9313836 * c.y - 0.4027108 * c.z,
      g: -0.8294890 * c.x + 1.7626641 * c.y + 0.0236247 * c.z,
      b:  0.0358458 * c.x - 0.0761724 * c.y + 0.9568845 * c.z,
    };
  }

  // P3 uses the same transfer as sRGB
  function linearP3ToP3(c) {
    return {
      r: linearToSrgb(clamp(c.r, 0, 1)),
      g: linearToSrgb(clamp(c.g, 0, 1)),
      b: linearToSrgb(clamp(c.b, 0, 1)),
    };
  }

  // -------- Format strings --------

  function fmt(n, d = 3) {
    const f = Number(n.toFixed(d));
    return String(f);
  }

  function toHex(hex) { return hex.toUpperCase(); }

  function toRgb(hex) {
    const c = rgbTo255(hexToRgb(hex));
    return `rgb(${c.r} ${c.g} ${c.b})`;
  }

  function toHsl(hex) {
    const h = rgbToHsl(hexToRgb(hex));
    return `hsl(${Math.round(h.h)} ${Math.round(h.s)}% ${Math.round(h.l)}%)`;
  }

  function toOklch(hex) {
    const rgb = hexToRgb(hex);
    const lab = linearRgbToOklab(rgbToLinear(rgb));
    const lch = oklabToOklch(lab);
    return `oklch(${(lch.L * 100).toFixed(1)}% ${fmt(lch.C, 3)} ${fmt(lch.H, 1)})`;
  }

  function toP3(hex) {
    const rgb = hexToRgb(hex);
    const xyz = linearRgbToXyz(rgbToLinear(rgb));
    const p3 = linearP3ToP3(xyzToLinearP3(xyz));
    return `color(display-p3 ${fmt(p3.r, 4)} ${fmt(p3.g, 4)} ${fmt(p3.b, 4)})`;
  }

  // ------ Relative luminance + contrast (WCAG) ------
  function relativeLuminance(hex) {
    const c = rgbToLinear(hexToRgb(hex));
    return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  }

  function contrast(hexA, hexB) {
    const la = relativeLuminance(hexA);
    const lb = relativeLuminance(hexB);
    const [lo, hi] = la < lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
  }

  // Pick best foreground (black or white-ish) for a swatch
  function pickForeground(hex, light = '#FFFCF0', dark = '#100F0F') {
    return contrast(hex, dark) >= contrast(hex, light) ? dark : light;
  }

  global.ColorUtils = {
    hexToRgb, rgbTo255, rgbToHsl,
    toHex, toRgb, toHsl, toOklch, toP3,
    contrast, relativeLuminance, pickForeground,
  };
})(window);
