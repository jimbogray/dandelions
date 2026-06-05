/**
 * Unit tests for static/js/taxcollector.js — Tax Collector game logic.
 *
 * The game logic is wrapped in an IIFE, so we test it via DOM interactions
 * using the real index.html + real source files loaded in jsdom.
 *
 * Note: The ceiling slider has min=6, max=50, so all test values must be >= 6.
 */

const { buildDOM } = require('./helpers');

describe('Tax Collector game logic', () => {
  let dom, window, document;

  beforeEach(() => {
    dom = buildDOM(['utils.js', 'menu-deco.js', 'taxcollector.js']);
    window = dom.window;
    document = window.document;
  });

  afterEach(() => {
    dom.window.close();
  });

  function setCeiling(n) {
    const slider = document.getElementById('tc-ceiling-slider');
    slider.value = String(n);
    slider.dispatchEvent(new window.Event('input'));
  }

  function clickPlay() {
    document.getElementById('btn-play-taxcollector').click();
  }

  function getGridButtons() {
    return Array.from(document.querySelectorAll('#tc-grid .tc-num'));
  }

  function pickNumber(n) {
    const btns = getGridButtons();
    const btn = btns.find(b => b.dataset.n === String(n));
    if (btn) btn.click();
    return btn;
  }

  function getScoreText() {
    return document.getElementById('tc-score').textContent;
  }

  // ── Board setup ─────────────────────────────────────────────────

  test('starting a game with ceiling=6 creates buttons 1-6', () => {
    setCeiling(6);
    clickPlay();
    const btns = getGridButtons();
    const nums = btns.map(b => parseInt(b.dataset.n)).sort((a, b) => a - b);
    expect(nums).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('starting a game with ceiling=10 creates 10 buttons', () => {
    setCeiling(10);
    clickPlay();
    expect(getGridButtons()).toHaveLength(10);
  });

  test('all buttons start in a non-player, non-tax state', () => {
    setCeiling(6);
    clickPlay();
    const btns = getGridButtons();
    btns.forEach(b => {
      expect(b.classList.contains('tc-player')).toBe(false);
      expect(b.classList.contains('tc-tax')).toBe(false);
    });
  });

  // ── Pickability rules ───────────────────────────────────────────

  test('number 1 is never pickable (no proper divisors)', () => {
    setCeiling(6);
    clickPlay();
    const btns = getGridButtons();
    const btn1 = btns.find(b => b.dataset.n === '1');
    expect(btn1.classList.contains('tc-blocked')).toBe(true);
  });

  test('primes > 1 are pickable when 1 is free', () => {
    setCeiling(6);
    clickPlay();
    const btns = getGridButtons();
    for (const p of [2, 3, 5]) {
      const btn = btns.find(b => b.dataset.n === String(p));
      expect(btn.classList.contains('tc-pickable')).toBe(true);
    }
  });

  // ── Picking a number ────────────────────────────────────────────

  test('picking 4 gives player 4 and tax gets divisors 1+2', () => {
    setCeiling(8);
    clickPlay();
    pickNumber(4);

    const btns = getGridButtons();
    const btn4 = btns.find(b => b.dataset.n === '4');
    expect(btn4.classList.contains('tc-player')).toBe(true);

    for (const d of [1, 2]) {
      const btnD = btns.find(b => b.dataset.n === String(d));
      expect(btnD.classList.contains('tc-tax')).toBe(true);
    }
  });

  test('picking 6 with ceiling=8 gives tax collector 1+2+3', () => {
    setCeiling(8);
    clickPlay();
    pickNumber(6);

    const btns = getGridButtons();
    expect(btns.find(b => b.dataset.n === '6').classList.contains('tc-player')).toBe(true);
    for (const d of [1, 2, 3]) {
      expect(btns.find(b => b.dataset.n === String(d)).classList.contains('tc-tax')).toBe(true);
    }
  });

  // ── Sequential picks — numbers become blocked ──────────────────

  test('after picking 4 (takes 1,2), primes 3,5,7 are blocked (divisor 1 gone)', () => {
    setCeiling(8);
    clickPlay();
    pickNumber(4); // tax takes 1, 2

    const btns = getGridButtons();
    // 3, 5, 7 only have divisor 1 which is now taken → blocked
    for (const p of [3, 5, 7]) {
      const btn = btns.find(b => b.dataset.n === String(p));
      expect(btn.classList.contains('tc-blocked')).toBe(true);
    }
  });

  test('after picking 4 (takes 1,2), 6 is still pickable via divisor 3', () => {
    setCeiling(8);
    clickPlay();
    pickNumber(4); // tax takes 1, 2

    const btns = getGridButtons();
    // 6's divisors are [1,2,3]; 1 and 2 are taken but 3 is free → pickable
    const btn6 = btns.find(b => b.dataset.n === '6');
    expect(btn6.classList.contains('tc-pickable')).toBe(true);
  });

  // ── End game ────────────────────────────────────────────────────

  test('game ends when no pickable numbers remain after picking 6', () => {
    setCeiling(6);
    clickPlay();

    // With ceiling=6: pick 6, tax gets 1,2,3.
    // Remaining: 4 (divisors 1,2 taken→blocked), 5 (divisor 1 taken→blocked).
    // No pickable numbers → game ends, 4+5 swept to tax.
    pickNumber(6);

    const overlay = document.getElementById('tc-game-over');
    expect(overlay.classList.contains('visible')).toBe(true);
  });

  test('remaining free numbers swept to tax collector at end', () => {
    setCeiling(6);
    clickPlay();
    pickNumber(6); // tax gets 1+2+3=6, then sweeps 4+5=9, total tax=15

    const score = getScoreText();
    expect(score).toContain('15');
  });
});
