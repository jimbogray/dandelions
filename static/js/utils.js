// ── Shared utilities ──────────────────────────────────────────────
const timeLevels = ['Unlimited', '10s', '15s', '20s', '30s', '45s', '60s', '90s'];

function getCenter(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function warpIn(screen, originEl) {
  const { x, y } = getCenter(originEl);
  screen.style.setProperty('--ox', x + 'px');
  screen.style.setProperty('--oy', y + 'px');
  screen.style.animation = 'none';
  screen.getBoundingClientRect();
  screen.style.animation = 'warp-in 1s cubic-bezier(0.35, 0, 0.75, 0) forwards';
}

function warpOut(screen, targetEl) {
  const { x, y } = getCenter(targetEl);
  screen.style.setProperty('--ox', x + 'px');
  screen.style.setProperty('--oy', y + 'px');
  screen.style.animation = 'none';
  screen.getBoundingClientRect();
  screen.style.animation = 'warp-out 1s cubic-bezier(0.25, 1, 0.65, 1) forwards';
}
