/* ═══ A Thread Across Continents — interactions ═══ */

// ── Scroll reveals ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Hero falling petals ──
const PETAL_COLORS = ['#e8b64c', '#f0932b', '#e05a4e', '#f7dd8e', '#e883a8'];

function makePetal(sizeMin, sizeMax) {
  const p = document.createElement('span');
  p.className = 'petal';
  const size = sizeMin + Math.random() * (sizeMax - sizeMin);
  p.style.width = size + 'px';
  p.style.height = size + 'px';
  p.style.left = Math.random() * 100 + 'vw';
  p.style.background = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  return p;
}

const heroPetals = document.querySelector('.petals');
for (let i = 0; i < 14; i++) {
  const p = makePetal(7, 14);
  p.style.animationDuration = (7 + Math.random() * 8) + 's';
  p.style.animationDelay = (Math.random() * 10) + 's';
  heroPetals.appendChild(p);
}

// ── Terrace night stars ──
const nightSky = document.querySelector('.night-stars');
for (let i = 0; i < 45; i++) {
  const s = document.createElement('span');
  s.className = 'night-star';
  s.style.left = Math.random() * 100 + '%';
  s.style.top = Math.random() * 100 + '%';
  s.style.animationDuration = (2 + Math.random() * 3.5) + 's';
  s.style.animationDelay = (Math.random() * 3) + 's';
  const sc = .5 + Math.random();
  s.style.transform = `scale(${sc})`;
  nightSky.appendChild(s);
}

// ── The letter ──
const envelope = document.getElementById('envelope');
const letterPaper = document.getElementById('letterPaper');

function openLetter() {
  if (envelope.classList.contains('open')) return;
  envelope.classList.add('open');
  envelope.setAttribute('aria-expanded', 'true');
  setTimeout(() => {
    letterPaper.hidden = false;
    letterPaper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 700);
}
envelope.addEventListener('click', openLetter);
envelope.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLetter(); }
});

// ── Finale: tie the rakhi ──
const picker = document.getElementById('rakhiPicker');
const wristZone = document.getElementById('wristZone');
const tiedRakhi = document.getElementById('tiedRakhi');
const finaleMessage = document.getElementById('finaleMessage');
let rakhiTied = false;

function wristTarget() {
  const r = wristZone.getBoundingClientRect();
  return { x: r.left + r.width * 0.56, y: r.top + r.height * 0.5 };
}

function nearWrist(x, y) {
  const t = wristTarget();
  return Math.hypot(x - t.x, y - t.y) < Math.max(90, wristZone.getBoundingClientRect().width * 0.3);
}

function tieRakhi(button) {
  if (rakhiTied) return;
  rakhiTied = true;
  button.classList.add('used');
  picker.classList.add('done');
  tiedRakhi.innerHTML = button.querySelector('svg').outerHTML;
  wristZone.classList.add('tied');
  setTimeout(() => {
    finaleMessage.hidden = false;
    finaleMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    petalShower();
  }, 650);
}

function petalShower() {
  const layer = document.getElementById('confettiLayer');
  for (let i = 0; i < 60; i++) {
    const p = makePetal(8, 16);
    p.style.animationDuration = (2.6 + Math.random() * 2.4) + 's';
    p.style.animationDelay = (Math.random() * 1.4) + 's';
    layer.appendChild(p);
  }
  setTimeout(() => { layer.innerHTML = ''; }, 7000);
}

// tap → the rakhi flies to the wrist by itself
function flyToWrist(button) {
  const from = button.getBoundingClientRect();
  const fly = document.createElement('div');
  fly.className = 'fly-rakhi';
  fly.innerHTML = button.querySelector('svg').outerHTML;
  fly.style.left = (from.left + from.width / 2) + 'px';
  fly.style.top = (from.top + from.height / 2) + 'px';
  document.body.appendChild(fly);
  button.classList.add('used');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const t = wristTarget();
    fly.style.left = t.x + 'px';
    fly.style.top = t.y + 'px';
  }));
  setTimeout(() => { fly.remove(); tieRakhi(button); }, 950);
}

// drag support (pointer events, works for touch + mouse)
picker.querySelectorAll('.rakhi-choice').forEach(button => {
  let ghost = null;
  let dragging = false;
  let startX = 0, startY = 0;

  button.addEventListener('pointerdown', e => {
    if (rakhiTied) return;
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startY = e.clientY;
    dragging = false;
  });

  button.addEventListener('pointermove', e => {
    if (rakhiTied || !button.hasPointerCapture(e.pointerId)) return;
    if (!dragging && Math.hypot(e.clientX - startX, e.clientY - startY) > 8) {
      dragging = true;
      ghost = document.createElement('div');
      ghost.className = 'drag-ghost';
      ghost.innerHTML = button.querySelector('svg').outerHTML;
      document.body.appendChild(ghost);
    }
    if (dragging && ghost) {
      ghost.style.left = e.clientX + 'px';
      ghost.style.top = e.clientY + 'px';
      wristZone.classList.toggle('over', nearWrist(e.clientX, e.clientY));
    }
  });

  button.addEventListener('pointerup', e => {
    if (rakhiTied) return;
    wristZone.classList.remove('over');
    if (dragging && ghost) {
      const dropped = nearWrist(e.clientX, e.clientY);
      ghost.remove();
      ghost = null;
      dragging = false;
      if (dropped) tieRakhi(button);
    } else {
      // simple tap → auto-fly
      flyToWrist(button);
    }
  });

  button.addEventListener('pointercancel', () => {
    if (ghost) { ghost.remove(); ghost = null; }
    dragging = false;
    wristZone.classList.remove('over');
  });
});
