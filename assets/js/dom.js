// Colors.css site — tiny shared DOM/HTML helpers used by render.js and app.js.
(function (global) {
  "use strict";

  function $(sel, root = document) {
    return root.querySelector(sel);
  }
  function $$(sel, root = document) {
    return [...root.querySelectorAll(sel)];
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function escapeAttr(s) {
    return escapeHtml(s);
  }

  global.DOM = { $, $$, escapeHtml, escapeAttr };
})(window);
