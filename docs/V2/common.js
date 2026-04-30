const $ = id => document.getElementById(id);

function fmt(v, d = 3) {
  return Number.isFinite(v) ? Number(v).toFixed(d) : '—';
}

function n(id) {
  const raw = $(id).value.trim().replace('−', '-');
  if (raw === '') return null;
  const x = Number(raw);
  return Number.isFinite(x) ? x : null;
}

function clamp(v) { return Math.min(Math.max(v, 0), 100); }

function pctToMA(p) { return 4 + (p / 100) * 16; }
function maToPct(m) { return ((m - 4) / 16) * 100; }

function toggleTheme() {
  const h = document.documentElement;
  const next = h.getAttribute('data-theme') === 'dark' ? 'auto' : 'dark';
  h.setAttribute('data-theme', next);
  localStorage.setItem('pt-v2-theme', next);
}

(function initTheme() {
  const t = localStorage.getItem('pt-v2-theme');
  if (t) document.documentElement.setAttribute('data-theme', t);
})();

(function initSwipeBack() {
  let startX, startY;
  document.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = Math.abs(e.changedTouches[0].clientY - startY);
    if (startX < 44 && dx > 60 && dy < 80) history.back();
  }, { passive: true });
})();
