/**
 * Unit tests for static/js/utils.js
 *
 * utils.js exposes three global functions (getCenter, warpIn, warpOut)
 * and the timeLevels array.  `const` declarations don't attach to
 * `window`, so we access them via eval in the jsdom context.
 */

describe('utils.js', () => {
  let window;
  let dom;

  beforeAll(() => {
    const { JSDOM } = require('jsdom');
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(__dirname, '..', '..', 'static', 'js', 'utils.js'),
      'utf-8',
    );
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost/',
      runScripts: 'dangerously',
    });
    window = dom.window;
    const script = window.document.createElement('script');
    script.textContent = src;
    window.document.body.appendChild(script);
  });

  afterAll(() => {
    dom.window.close();
  });

  // ── timeLevels ──────────────────────────────────────────────────

  test('timeLevels has 8 entries', () => {
    const len = window.eval('timeLevels.length');
    expect(len).toBe(8);
  });

  test('timeLevels first entry is Unlimited', () => {
    const first = window.eval('timeLevels[0]');
    expect(first).toBe('Unlimited');
  });

  test('timeLevels contains expected durations', () => {
    const arr = window.eval('JSON.stringify(timeLevels)');
    const levels = JSON.parse(arr);
    expect(levels).toContain('10s');
    expect(levels).toContain('60s');
    expect(levels).toContain('90s');
  });

  // ── getCenter ───────────────────────────────────────────────────

  test('getCenter returns center of element bounding rect', () => {
    const el = window.document.createElement('div');
    el.getBoundingClientRect = () => ({
      left: 100, top: 50, width: 200, height: 100,
      right: 300, bottom: 150, x: 100, y: 50,
    });
    const center = window.getCenter(el);
    expect(center.x).toBe(200);
    expect(center.y).toBe(100);
  });

  test('getCenter with zero-size element', () => {
    const el = window.document.createElement('div');
    el.getBoundingClientRect = () => ({
      left: 40, top: 60, width: 0, height: 0,
      right: 40, bottom: 60, x: 40, y: 60,
    });
    const center = window.getCenter(el);
    expect(center.x).toBe(40);
    expect(center.y).toBe(60);
  });

  // ── warpIn ──────────────────────────────────────────────────────

  test('warpIn sets CSS custom properties and animation', () => {
    const screen = window.document.createElement('div');
    const origin = window.document.createElement('div');
    origin.getBoundingClientRect = () => ({
      left: 10, top: 20, width: 30, height: 40,
      right: 40, bottom: 60, x: 10, y: 20,
    });

    window.warpIn(screen, origin);

    expect(screen.style.getPropertyValue('--ox')).toBe('25px');
    expect(screen.style.getPropertyValue('--oy')).toBe('40px');
    expect(screen.style.animation).toContain('warp-in');
  });

  // ── warpOut ─────────────────────────────────────────────────────

  test('warpOut sets CSS custom properties and animation', () => {
    const screen = window.document.createElement('div');
    const target = window.document.createElement('div');
    target.getBoundingClientRect = () => ({
      left: 0, top: 0, width: 100, height: 80,
      right: 100, bottom: 80, x: 0, y: 0,
    });

    window.warpOut(screen, target);

    expect(screen.style.getPropertyValue('--ox')).toBe('50px');
    expect(screen.style.getPropertyValue('--oy')).toBe('40px');
    expect(screen.style.animation).toContain('warp-out');
  });
});
