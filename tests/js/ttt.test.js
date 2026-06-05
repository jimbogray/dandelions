/**
 * Unit tests for static/js/ttt.js — Tic-Tac-Toe game logic.
 *
 * Tests board setup, making moves, win detection, draw detection,
 * and game reset by loading the real source into jsdom.
 */

const { buildDOM } = require('./helpers');

describe('Tic-Tac-Toe game logic', () => {
  let dom, window, document;

  beforeEach(() => {
    dom = buildDOM(['utils.js', 'menu-deco.js', 'ttt.js']);
    window = dom.window;
    document = window.document;
  });

  afterEach(() => {
    dom.window.close();
  });

  function clickPlay() {
    // Set timer to unlimited to avoid timer-related complexity
    const slider = document.getElementById('time-slider');
    slider.value = '0';
    slider.dispatchEvent(new window.Event('input'));

    document.getElementById('btn-play-ttt').click();
  }

  function getCells() {
    return Array.from(document.querySelectorAll('.ttt-cell'));
  }

  function getStatusText() {
    return document.getElementById('game-status').textContent;
  }

  // ── Initial state ───────────────────────────────────────────────

  test('game starts with 9 empty cells', () => {
    clickPlay();
    const cells = getCells();
    expect(cells).toHaveLength(9);
    cells.forEach(c => {
      expect(c.textContent.trim()).toBe('');
    });
  });

  test('player 1 (X) moves first by default', () => {
    clickPlay();
    const status = getStatusText();
    expect(status).toContain('Player 1');
  });

  // ── Making moves ────────────────────────────────────────────────

  test('clicking a cell places a mark', () => {
    clickPlay();
    const cells = getCells();
    cells[0].click();
    expect(cells[0].textContent.trim()).not.toBe('');
    expect(cells[0].classList.contains('taken')).toBe(true);
  });

  test('clicking a taken cell does nothing', () => {
    clickPlay();
    const cells = getCells();
    cells[4].click();
    const mark = cells[4].textContent;
    const classes = [...cells[4].classList];

    // Click same cell again
    cells[4].click();
    expect(cells[4].textContent).toBe(mark);
  });

  test('turns alternate between players', () => {
    clickPlay();
    const cells = getCells();

    cells[0].click(); // Player 1
    expect(getStatusText()).toContain('Player 2');

    cells[1].click(); // Player 2
    expect(getStatusText()).toContain('Player 1');
  });

  // ── Win detection ───────────────────────────────────────────────

  test('three in a row (top row) triggers win', () => {
    clickPlay();
    const cells = getCells();

    // X plays cells 0, 1, 2 (top row) with O playing 3, 4
    cells[0].click(); // X
    cells[3].click(); // O
    cells[1].click(); // X
    cells[4].click(); // O
    cells[2].click(); // X wins!

    // Game over overlay should be visible
    const overlay = document.getElementById('game-over-overlay');
    expect(overlay.classList.contains('visible')).toBe(true);

    const msg = document.getElementById('game-over-msg').textContent;
    expect(msg).toContain('wins');
  });

  test('three in a column (left col) triggers win', () => {
    clickPlay();
    const cells = getCells();

    // X plays cells 0, 3, 6 (left column) with O playing 1, 4
    cells[0].click(); // X
    cells[1].click(); // O
    cells[3].click(); // X
    cells[4].click(); // O
    cells[6].click(); // X wins!

    const overlay = document.getElementById('game-over-overlay');
    expect(overlay.classList.contains('visible')).toBe(true);
  });

  test('diagonal win triggers game over', () => {
    clickPlay();
    const cells = getCells();

    // X plays 0, 4, 8 (main diagonal) with O on 1, 2
    cells[0].click(); // X
    cells[1].click(); // O
    cells[4].click(); // X
    cells[2].click(); // O
    cells[8].click(); // X wins!

    const overlay = document.getElementById('game-over-overlay');
    expect(overlay.classList.contains('visible')).toBe(true);
  });

  test('winning cells get the win-cell class', () => {
    clickPlay();
    const cells = getCells();

    cells[0].click(); // X
    cells[3].click(); // O
    cells[1].click(); // X
    cells[4].click(); // O
    cells[2].click(); // X wins top row

    expect(cells[0].classList.contains('win-cell')).toBe(true);
    expect(cells[1].classList.contains('win-cell')).toBe(true);
    expect(cells[2].classList.contains('win-cell')).toBe(true);
  });

  // ── Draw detection ──────────────────────────────────────────────

  test('full board with no winner is a draw', () => {
    clickPlay();
    const cells = getCells();

    // Play a known draw sequence:
    // X O X
    // X X O
    // O X O
    const moves = [0, 1, 3, 4, 2, 6, 5, 8, 7];
    // Move 0: X at 0 → X _ _ / _ _ _ / _ _ _
    // Move 1: O at 1 → X O _ / _ _ _ / _ _ _
    // Move 2: X at 3 → X O _ / X _ _ / _ _ _
    // Move 3: O at 4 → X O _ / X O _ / _ _ _
    // Move 4: X at 2 → X O X / X O _ / _ _ _
    // Move 5: O at 6 → X O X / X O _ / O _ _
    // Move 6: X at 5 → X O X / X O X / O _ _
    // Move 7: O at 8 → X O X / X O X / O _ O
    // Move 8: X at 7 → X O X / X O X / O X O — draw!
    moves.forEach(i => cells[i].click());

    const overlay = document.getElementById('game-over-overlay');
    expect(overlay.classList.contains('visible')).toBe(true);
    const msg = document.getElementById('game-over-msg').textContent;
    expect(msg.toLowerCase()).toContain('draw');
  });

  // ── Play again ──────────────────────────────────────────────────

  test('play again resets the board', () => {
    clickPlay();
    const cells = getCells();
    cells[0].click();

    document.getElementById('btn-play-again').click();

    cells.forEach(c => {
      expect(c.textContent.trim()).toBe('');
      expect(c.classList.contains('taken')).toBe(false);
      expect(c.classList.contains('win-cell')).toBe(false);
    });
  });
});
