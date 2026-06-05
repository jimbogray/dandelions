/**
 * Unit tests for static/js/othello.js — Othello (Reversi) game logic.
 *
 * Tests the core game mechanics (board setup, valid moves, flipping,
 * scoring) by loading the real source into jsdom and interacting through
 * the DOM.
 */

const { buildDOM } = require('./helpers');

describe('Othello game logic', () => {
  let dom, window, document;

  beforeEach(() => {
    dom = buildDOM(['utils.js', 'menu-deco.js', 'othello.js']);
    window = dom.window;
    document = window.document;
  });

  afterEach(() => {
    dom.window.close();
  });

  function clickPlay() {
    document.getElementById('btn-play-othello').click();
  }

  function getCells() {
    return Array.from(document.querySelectorAll('#oth-board .oth-cell'));
  }

  function getScoreText() {
    return document.getElementById('oth-score').textContent;
  }

  function getStatusText() {
    return document.getElementById('oth-status-text').textContent;
  }

  function cellHasPiece(cell, color) {
    const piece = cell.querySelector('.oth-piece');
    if (!piece) return false;
    return piece.classList.contains(color);
  }

  // helper: idx = row * 8 + col
  function idx(r, c) { return r * 8 + c; }

  // ── Initial board setup ─────────────────────────────────────────

  test('game starts with 64 cells', () => {
    clickPlay();
    expect(getCells()).toHaveLength(64);
  });

  test('initial board has 4 pieces in the center', () => {
    clickPlay();
    const cells = getCells();
    // Standard Othello: d4=light, e4=dark, d5=dark, e5=light
    // In 0-indexed: (3,3)=light, (3,4)=dark, (4,3)=dark, (4,4)=light
    expect(cellHasPiece(cells[idx(3, 3)], 'light')).toBe(true);
    expect(cellHasPiece(cells[idx(3, 4)], 'dark')).toBe(true);
    expect(cellHasPiece(cells[idx(4, 3)], 'dark')).toBe(true);
    expect(cellHasPiece(cells[idx(4, 4)], 'light')).toBe(true);
  });

  test('initial score is Black 2 - White 2', () => {
    clickPlay();
    const score = getScoreText();
    expect(score).toContain('2');
  });

  test('player 1 (dark) moves first', () => {
    clickPlay();
    expect(getStatusText()).toContain('1');
  });

  // ── Making a move ───────────────────────────────────────────────

  test('clicking a valid cell places a piece and flips opponent', () => {
    clickPlay();
    const cells = getCells();

    // Dark (player 1) moves first.
    // Valid opening moves for dark: (2,3), (3,2), (4,5), (5,4)
    // Let's play (2,3) — row=2, col=3
    // This should flip the light piece at (3,3) to dark.
    cells[idx(2, 3)].click();

    // After the move, (2,3) should have a dark piece
    expect(cellHasPiece(cells[idx(2, 3)], 'dark')).toBe(true);

    // (3,3) which was light should now be dark (flipped)
    expect(cellHasPiece(cells[idx(3, 3)], 'dark')).toBe(true);

    // Score should update: was 2-2, now dark=4, light=1
    const score = getScoreText();
    expect(score).toContain('4');
    expect(score).toContain('1');
  });

  test('clicking an invalid cell does nothing', () => {
    clickPlay();
    const cells = getCells();

    // (0,0) is not a valid move — no pieces to flip
    cells[idx(0, 0)].click();

    // Should still be player 1's turn
    expect(getStatusText()).toContain('1');

    // Corner cell should be empty
    expect(cellHasPiece(cells[idx(0, 0)], 'dark')).toBe(false);
    expect(cellHasPiece(cells[idx(0, 0)], 'light')).toBe(false);
  });

  test('after valid move, turn passes to opponent', () => {
    clickPlay();
    const cells = getCells();

    // Player 1 makes a valid move
    cells[idx(2, 3)].click();

    // Now it should be player 2's turn
    expect(getStatusText()).toContain('2');
  });

  // ── Multiple moves ──────────────────────────────────────────────

  test('two sequential valid moves alternate players', () => {
    clickPlay();
    const cells = getCells();

    // Player 1 (dark) plays (2,3)
    cells[idx(2, 3)].click();
    expect(getStatusText()).toContain('2');

    // Player 2 (light) plays (2,2)
    cells[idx(2, 2)].click();
    expect(getStatusText()).toContain('1');
  });

  // ── Play again resets ───────────────────────────────────────────

  test('play again resets the board', () => {
    clickPlay();
    const cells = getCells();

    // Make a move
    cells[idx(2, 3)].click();

    // Click play again
    document.getElementById('btn-oth-play-again').click();

    // Board should be reset to initial state
    expect(cellHasPiece(cells[idx(3, 3)], 'light')).toBe(true);
    expect(cellHasPiece(cells[idx(3, 4)], 'dark')).toBe(true);

    const score = getScoreText();
    expect(score).toContain('2');
  });
});
