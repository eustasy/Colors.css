// Colors.css site — interactive layer: popover, clipboard, toast, and event
// wiring. The initial page build lives in render.js (window.ColorPage); this
// file reacts to the user against the DOM that render.js produced.
(function () {
  "use strict";

  const U = window.ColorUtils;
  const { $, $$, escapeHtml } = window.DOM;

  const palettesRoot = $("#palettes-root");

  // ---------- Helpers ----------
  function slugify(s) {
    return String(s)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // ---------- Format computation ----------
  function formatsFor(slug, name, hex) {
    const slugName = slugify(name);
    const base = {
      name,
      var: `var(--${slug}-${slugName})`,
      class: `${slug}-${slugName}`,
    };
    if (!U.isHex(hex)) {
      return { ...base, hex: hex, rgb: hex, hsl: hex, oklch: hex, p3: hex };
    }
    return {
      ...base,
      hex: U.toHex(hex),
      rgb: U.toRgb(hex),
      hsl: U.toHsl(hex),
      oklch: U.toOklch(hex),
      p3: U.toP3(hex),
    };
  }

  // ---------- Popover ----------
  const pop = $("#copy-pop");
  const popChip = $("#pop-chip");
  const popName = $("#pop-name");
  const popSub = $("#pop-sub");
  const popRows = $("#pop-rows");
  const popContrast = $("#pop-contrast");

  let popTarget = null;
  let popHideTimer = null;

  const FORMATS = [
    ["name", "Name"],
    ["var", "CSS var"],
    ["class", "Class"],
    ["hex", "Hex"],
    ["rgb", "RGB"],
    ["hsl", "HSL"],
    ["oklch", "OKLCH"],
    ["p3", "P3"],
  ];

  function buildPopRows(fmts, hasHex = true) {
    popRows.innerHTML = "";
    const list = hasHex ? FORMATS : FORMATS.filter(([k]) => ["name", "var", "class", "hex"].includes(k));
    for (const [key, label] of list) {
      const row = document.createElement("button");
      row.className = "pop-row";
      row.dataset.fmt = key;
      row.innerHTML = `
        <span class="label">${label}</span>
        <span class="val">${escapeHtml(fmts[key])}</span>
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
      `;
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        copyText(fmts[key]);
        flashRow(row);
        showToast(`Copied ${label.toLowerCase()} · ${truncate(fmts[key], 40)}`);
      });
      popRows.appendChild(row);
    }
  }

  function showPopFor(btn) {
    clearTimeout(popHideTimer);
    popTarget = btn;
    const slug = btn.dataset.slug;
    const name = btn.dataset.name;
    const hex = btn.dataset.hex;
    const fmts = formatsFor(slug, name, hex);
    const hasHex = U.isHex(hex);

    popChip.style.background = hasHex ? hex : "repeating-linear-gradient(45deg, var(--paper-2) 0 4px, var(--ui-2) 4px 5px)";
    popName.textContent = `${slug}-${slugify(name)}`;
    popSub.textContent = hasHex ? `${name} · ${hex.toUpperCase()}` : `${name} · CSS keyword`;

    if (hasHex) {
      const styles = getComputedStyle(document.documentElement);
      const bg = styles.getPropertyValue("--paper").trim() || "#FFFCF0";
      const fg = styles.getPropertyValue("--tx").trim() || "#100F0F";
      const cBg = U.contrast(hex, bg).toFixed(2);
      const cFg = U.contrast(hex, fg).toFixed(2);
      popContrast.innerHTML = `<span title="Contrast vs page background / vs body text">${cBg}:1 bg &nbsp;·&nbsp; ${cFg}:1 tx</span>`;
    } else {
      popContrast.innerHTML = `<span>CSS keyword</span>`;
    }

    buildPopRows(fmts, hasHex);

    positionPop(btn);
    pop.classList.add("open");
  }

  function positionPop(btn) {
    const r = btn.getBoundingClientRect();
    pop.style.visibility = "hidden";
    pop.classList.add("open");
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    pop.classList.remove("open");
    pop.style.visibility = "";

    let left = r.left + r.width / 2 - pw / 2;
    let top = r.bottom + 8;
    if (left + pw + 8 > innerWidth) left = innerWidth - pw - 8;
    if (left < 8) left = 8;
    if (top + ph + 8 > innerHeight) top = r.top - ph - 8;
    if (top < 8) top = 8;
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function hidePop(delay = 100) {
    clearTimeout(popHideTimer);
    popHideTimer = setTimeout(() => {
      pop.classList.remove("open");
      popTarget = null;
    }, delay);
  }

  function flashRow(row) {
    row.classList.add("copied");
    setTimeout(() => row.classList.remove("copied"), 700);
  }
  function truncate(s, n) {
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  // ---------- Clipboard + toast ----------
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {}
    document.body.removeChild(ta);
  }

  const toast = $("#toast");
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  // ---------- Wiring ----------
  function wireSwatches() {
    palettesRoot.addEventListener("pointerover", (e) => {
      const sw = e.target.closest(".swatch");
      if (!sw) return;
      showPopFor(sw);
    });
    palettesRoot.addEventListener("pointerleave", () => hidePop(150), true);
    palettesRoot.addEventListener("focusin", (e) => {
      const sw = e.target.closest(".swatch");
      if (sw) showPopFor(sw);
    });

    // Swatch click → copy the default (toolbar-selected) format
    palettesRoot.addEventListener("click", (e) => {
      const sw = e.target.closest(".swatch");
      if (!sw) return;
      const fmt = $("#format-select").value;
      const fmts = formatsFor(sw.dataset.slug, sw.dataset.name, sw.dataset.hex);
      copyText(fmts[fmt]);
      const label = FORMATS.find((f) => f[0] === fmt)[1];
      showToast(`Copied ${label.toLowerCase()} · ${truncate(fmts[fmt], 40)}`);
    });
  }

  function wirePopover() {
    pop.addEventListener("pointerenter", () => clearTimeout(popHideTimer));
    pop.addEventListener("pointerleave", () => hidePop(100));

    window.addEventListener(
      "scroll",
      () => {
        if (popTarget) positionPop(popTarget);
      },
      { passive: true },
    );
    window.addEventListener("resize", () => {
      if (popTarget) positionPop(popTarget);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hidePop(0);
    });
  }

  function wireCopyButtons() {
    // Codeblock copy buttons
    $$(".codeblock").forEach((cb) => {
      const btn = cb.querySelector(".copy-btn");
      if (!btn) return;
      btn.addEventListener("click", () => {
        const src = cb.dataset.copySrc || cb.querySelector("pre").textContent;
        copyText(src);
        btn.textContent = "Copied";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 1500);
      });
    });

    // Palette embed copy
    palettesRoot.addEventListener("click", (e) => {
      const eb = e.target.closest(".palette-embed button[data-embed]");
      if (!eb) return;
      e.stopPropagation();
      copyText(eb.dataset.embed);
      const orig = eb.textContent;
      eb.textContent = "Copied";
      eb.classList.add("copied");
      setTimeout(() => {
        eb.textContent = orig;
        eb.classList.remove("copied");
      }, 1500);
    });
  }

  function wireThemeAndFormat() {
    const themeBtn = $("#theme-toggle");
    themeBtn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "light";
      const next = cur === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("colorscss-theme", next);
      themeBtn.querySelector("svg").style.transform = next === "dark" ? "rotate(180deg)" : "";
    });

    const fs = $("#format-select");
    const savedFmt = localStorage.getItem("colorscss-format");
    if (savedFmt && [...fs.options].some((o) => o.value === savedFmt)) fs.value = savedFmt;
    fs.addEventListener("change", () => localStorage.setItem("colorscss-format", fs.value));
  }

  function wireScrollspy() {
    const navLinks = $$("#palette-nav a");
    const sections = $$(".palette");
    function updateActive() {
      const threshold = 130; // just below site header + palette nav
      let current = null;
      for (const s of sections) {
        const top = s.getBoundingClientRect().top;
        if (top <= threshold) current = s;
        else break;
      }
      // If we're scrolled past the last one's bottom, keep it active
      const last = sections[sections.length - 1];
      if (last && last.getBoundingClientRect().bottom < threshold) current = last;
      navLinks.forEach((l) => l.classList.toggle("active", current ? l.dataset.slug === current.dataset.slug : false));
    }
    let raf = 0;
    window.addEventListener(
      "scroll",
      () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          updateActive();
        });
      },
      { passive: true },
    );
    updateActive();
  }

  function wire() {
    wireSwatches();
    wirePopover();
    wireCopyButtons();
    wireThemeAndFormat();
    wireScrollspy();
    window.ColorSearch.wire($("#search"));
  }

  // ---------- Init ----------
  function init() {
    window.ColorPage.render();
    wire();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
