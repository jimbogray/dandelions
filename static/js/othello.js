// ── Othello Navigation ────────────────────────────────────────────
const screenOthello         = document.getElementById('screen-othello');
const screenOthelloSettings = document.getElementById('screen-othello-settings');
const btnOthello            = document.getElementById('btn-othello');
const btnOthelloBack        = document.getElementById('btn-othello-back');
const btnOthelloSettings    = document.getElementById('btn-othello-settings');
const btnOthSettingsBack    = document.getElementById('btn-oth-settings-back');
const othTimeSlider         = document.getElementById('oth-time-slider');
const othTimeValue          = document.getElementById('oth-time-value');

othTimeSlider.addEventListener('input', function () {
  othTimeValue.textContent = timeLevels[this.value];
});

btnOthello.addEventListener('click', function () { warpIn(screenOthello, this); });
btnOthelloBack.addEventListener('click', function () { warpOut(screenOthello, btnOthello); });
btnOthelloSettings.addEventListener('click', function () { warpIn(screenOthelloSettings, this); });
btnOthSettingsBack.addEventListener('click', function () { warpOut(screenOthelloSettings, btnOthelloSettings); });

// ── Othello decorative pieces ─────────────────────────────────────
(function () {
  const container = document.getElementById('othello-deco');
  const W = window.innerWidth, H = window.innerHeight;
  const safeX1 = W * 0.25, safeX2 = W * 0.75;
  const safeY1 = H * 0.20, safeY2 = H * 0.80;

  function overlaps(cx, cy, size) {
    return cx + size > safeX1 && cx < safeX2 &&
           cy + size > safeY1 && cy < safeY2;
  }

  const count = 16;
  const boardSizes = [52, 64, 76, 88, 104];
  let placed = 0, attempts = 0;

  while (placed < count && attempts < 400) {
    attempts++;
    const bs   = boardSizes[Math.floor(Math.random() * boardSizes.length)];
    const gap  = Math.round(bs * 0.06);
    const size = bs + gap;
    const x    = Math.random() * (W - size);
    const y    = Math.random() * (H - size);
    if (overlaps(x, y, size)) continue;

    const angle = Math.random() * 360;
    const board = document.createElement('div');
    board.className       = 'oth-deco-board';
    board.style.width     = size + 'px';
    board.style.height    = size + 'px';
    board.style.left      = x + 'px';
    board.style.top       = y + 'px';
    board.style.transform = `rotate(${angle}deg)`;
    board.style.gap       = gap + 'px';

    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      cell.className = 'oth-deco-cell';
      const r = Math.random();
      if (r < 0.4)      cell.style.background = '#1a4a6e';
      else if (r < 0.8) cell.style.background = '#ffffff';
      board.appendChild(cell);
    }
    container.appendChild(board);
    placed++;
  }
})();

// ── Othello Game Logic ────────────────────────────────────────────
(function () {
  const screenOthGame = document.getElementById('screen-oth-game');
  const btnPlayOth    = document.getElementById('btn-play-othello');
  const btnOthAgain   = document.getElementById('btn-oth-play-again');
  const btnOthMenu    = document.getElementById('btn-oth-to-menu');
  const btnOthGBack   = document.getElementById('btn-oth-game-back');
  const boardEl       = document.getElementById('oth-board');
  const statusPiece   = document.getElementById('oth-status-piece');
  const statusText    = document.getElementById('oth-status-text');
  const scoreEl       = document.getElementById('oth-score');
  const timerEl       = document.getElementById('oth-game-timer');
  const timerDisp     = document.getElementById('oth-timer-display');
  const overlay       = document.getElementById('oth-game-over');
  const overlayMsg    = document.getElementById('oth-game-over-msg');

  const SIZE = 8;
  const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  // 1 = dark (player 1), 2 = light (player 2)
  let board, cur, active, countdown, cInt;
  let cells = [];

  // Build the 8x8 cell grid once
  for (let i = 0; i < 64; i++) {
    const cell = document.createElement('div');
    cell.className = 'oth-cell';
    cell.addEventListener('click', () => onCell(i));
    boardEl.appendChild(cell);
    cells.push(cell);
  }

  function idx(r, c) { return r * SIZE + c; }
  function rc(i)     { return [Math.floor(i / SIZE), i % SIZE]; }

  function flips(board, r, c, player) {
    if (board[idx(r, c)] !== 0) return [];
    const all = [];
    for (const [dr, dc] of DIRS) {
      const line = [];
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
        const v = board[idx(nr, nc)];
        if (v === 0) break;
        if (v === player) { all.push(...line); break; }
        line.push(idx(nr, nc));
        nr += dr; nc += dc;
      }
    }
    return all;
  }

  function validMoves(board, player) {
    const moves = [];
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (flips(board, r, c, player).length > 0) moves.push(idx(r, c));
    return moves;
  }

  function applyMove(board, i, player) {
    const [r, c] = rc(i);
    const f = flips(board, r, c, player);
    board[i] = player;
    f.forEach(j => board[j] = player);
  }

  function countScore(board) {
    let d = 0, l = 0;
    board.forEach(v => { if (v === 1) d++; else if (v === 2) l++; });
    return [d, l];
  }

  function renderBoard() {
    cells.forEach((cell, i) => {
      cell.innerHTML = '';
      cell.classList.remove('oth-hint', 'oth-taken');
      if (board[i]) {
        const piece = document.createElement('div');
        piece.className = 'oth-piece ' + (board[i] === 1 ? 'dark' : 'light');
        cell.appendChild(piece);
        cell.classList.add('oth-taken');
      }
    });
  }

  function renderStatus() {
    statusPiece.className = 'oth-piece ' + (cur === 1 ? 'dark' : 'light');
    statusPiece.style.cssText = '';
    statusPiece.style.display = 'inline-block';
    statusText.textContent = `Player ${cur}'s turn`;
    statusText.style.color = '';
    const [d, l] = countScore(board);
    scoreEl.textContent = `Black ${d}  \u2013  White ${l}`;
  }

  function startGame() {
    board = Array(64).fill(0);
    board[idx(3,3)] = 2; board[idx(3,4)] = 1;
    board[idx(4,3)] = 1; board[idx(4,4)] = 2;
    cur = 1;
    active = true;
    overlay.classList.remove('visible');
    renderBoard();
    renderStatus();
    resetTimer();
  }

  function resetTimer() {
    clearInterval(cInt);
    timerEl.classList.remove('urgent', 'ringing');
    const lvl = parseInt(othTimeSlider.value);
    if (lvl === 0) { timerEl.classList.add('hidden'); return; }
    timerEl.classList.remove('hidden');
    countdown = parseInt(timeLevels[lvl]);
    timerDisp.textContent = countdown;
    cInt = setInterval(() => {
      countdown--;
      timerDisp.textContent = countdown;
      if (countdown <= 5) timerEl.classList.add('urgent');
      if (countdown <= 0) { clearInterval(cInt); onTimeout(); }
    }, 1000);
  }

  function onTimeout() {
    if (!active) return;
    active = false;
    timerEl.classList.remove('ringing');
    timerEl.getBoundingClientRect();
    timerEl.classList.add('ringing');
    const forfeited = cur;
    statusText.textContent = `Player ${forfeited} forfeited!`;
    statusText.style.color = '#c0392b';
    setTimeout(() => {
      cur = forfeited === 1 ? 2 : 1;
      active = true;
      renderStatus();
      resetTimer();
    }, 1500);
  }

  function nextTurn() {
    const opponent = cur === 1 ? 2 : 1;
    if (validMoves(board, opponent).length > 0) {
      cur = opponent;
      renderStatus();
      resetTimer();
    } else if (validMoves(board, cur).length > 0) {
      renderStatus();
      resetTimer();
    } else {
      endGame();
    }
  }

  function endGame() {
    active = false;
    clearInterval(cInt);
    timerEl.classList.add('hidden');
    const [d, l] = countScore(board);
    let msg;
    if (d > l)      msg = `Player 1 wins!\nBlack ${d} \u2013 White ${l}`;
    else if (l > d) msg = `Player 2 wins!\nBlack ${d} \u2013 White ${l}`;
    else            msg = `It's a draw!\nBlack ${d} \u2013 White ${l}`;
    overlayMsg.textContent = msg;
    overlay.classList.add('visible');
  }

  function onCell(i) {
    if (!active) return;
    const f = flips(board, ...rc(i), cur);
    if (f.length === 0) return;
    applyMove(board, i, cur);
    renderBoard();
    nextTurn();
  }

  btnPlayOth.addEventListener('click', function () {
    warpIn(screenOthGame, this);
    startGame();
  });

  btnOthAgain.addEventListener('click', startGame);

  btnOthMenu.addEventListener('click', function () {
    clearInterval(cInt);
    warpOut(screenOthGame, btnPlayOth);
  });

  btnOthGBack.addEventListener('click', function () {
    clearInterval(cInt);
    warpOut(screenOthGame, btnPlayOth);
  });
})();
