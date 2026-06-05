/**
 * Shared helpers for loading game scripts into a jsdom environment.
 *
 * The game JS files rely on DOM elements from index.html.  We read the
 * template, strip the Jinja `{{ url_for(...) }}` script tags (jsdom can't
 * resolve them), then manually inject the source of each required JS file.
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..', '..');

function readJS(filename) {
  return fs.readFileSync(path.join(ROOT, 'static', 'js', filename), 'utf-8');
}

/**
 * Build a JSDOM instance from the real index.html template with the
 * specified JS files executed in order.
 */
function buildDOM(jsFiles) {
  let html = fs.readFileSync(path.join(ROOT, 'templates', 'index.html'), 'utf-8');

  // Remove Jinja script tags so jsdom doesn't try to fetch them
  html = html.replace(/<script\s+src="\{\{.*?\}\}"><\/script>/g, '');

  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    resources: 'usable',
  });

  const { window } = dom;

  // Stub canvas getContext (jsdom doesn't support canvas natively)
  const origCreateElement = window.document.createElement.bind(window.document);
  window.document.createElement = function (tag, options) {
    const el = origCreateElement(tag, options);
    if (tag.toLowerCase() === 'canvas' && !el.getContext) {
      el.getContext = () => ({
        clearRect() {},
        beginPath() {},
        arc() {},
        fill() {},
        stroke() {},
        moveTo() {},
        lineTo() {},
        closePath() {},
        fillRect() {},
        strokeRect() {},
        save() {},
        restore() {},
        translate() {},
        rotate() {},
        scale() {},
        setTransform() {},
        fillText() {},
        strokeText() {},
        drawImage() {},
      });
    }
    return el;
  };

  // Also patch any existing canvas elements already in the DOM
  window.document.querySelectorAll('canvas').forEach(c => {
    if (!c.getContext.__patched) {
      const orig = c.getContext.bind(c);
      c.getContext = (...args) => {
        const ctx = orig(...args);
        if (ctx) return ctx;
        // Return stub if native returns null
        return {
          clearRect() {}, beginPath() {}, arc() {}, fill() {},
          stroke() {}, moveTo() {}, lineTo() {}, closePath() {},
          fillRect() {}, strokeRect() {}, save() {}, restore() {},
          translate() {}, rotate() {}, scale() {}, setTransform() {},
          fillText() {}, strokeText() {}, drawImage() {},
        };
      };
      c.getContext.__patched = true;
    }
  });

  // Inject each JS file in order
  for (const file of jsFiles) {
    const src = readJS(file);
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = src;
    window.document.body.appendChild(scriptEl);
  }

  return dom;
}

module.exports = { buildDOM, readJS, ROOT };
