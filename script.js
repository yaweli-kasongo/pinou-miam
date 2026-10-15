// Menu mobile
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');

burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
menu.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  })
);

// Apparition douce des blocs au défilement
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add('visible'));
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Barre de progression, header compact, bouton retour en haut
const progress = document.querySelector('.progress');
const header = document.querySelector('.header');
const toTop = document.querySelector('.to-top');
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  header.classList.toggle('scrolled', scrollY > 20);
  header.classList.toggle('over-hero', scrollY < document.getElementById('accueil').offsetHeight - 80);
  toTop.hidden = scrollY < 600;
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

// Lien actif dans le menu selon la section visible
const links = [...document.querySelectorAll('.menu a[href^="#"]:not(.btn)')];
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
}

// Mots qui défilent dans le hero
const rot = document.querySelector('.rotator');
if (rot && !reduceMotion) {
  const words = rot.dataset.words.split(',');
  let wi = 0;
  setInterval(() => {
    rot.classList.add('out');
    setTimeout(() => {
      wi = (wi + 1) % words.length;
      rot.textContent = words[wi];
      rot.classList.remove('out');
    }, 350);
  }, 2600);
}

// Estimateur de budget : les prix sont lus dans les cartes « Menus & Tarifs »
const estChoices = document.getElementById('estChoices');
const estGuests = document.getElementById('estGuests');
const estTotal = document.getElementById('estTotal');
const estDetail = document.getElementById('estDetail');
const estGuestsVal = document.getElementById('estGuestsVal');
const formules = [...document.querySelectorAll('.cards .card')].map(c => ({
  name: c.querySelector('h3').textContent.replace('Formule ', ''),
  price: parseFloat(c.querySelector('.price strong').textContent.replace(',', '.'))
})).filter(f => !isNaN(f.price));

let estIndex = Math.min(1, formules.length - 1);
let shownTotal = 0, animFrame;
const euro = n => Math.round(n).toLocaleString('fr-FR') + ' €';

let totalTimer;
function animateTotal(to) {
  cancelAnimationFrame(animFrame);
  clearTimeout(totalTimer);
  totalTimer = setTimeout(() => { shownTotal = to; estTotal.textContent = euro(to); }, 600);
  if (reduceMotion) { shownTotal = to; estTotal.textContent = euro(to); return; }
  const from = shownTotal, t0 = performance.now();
  (function step(now) {
    const k = Math.min((now - t0) / 450, 1), e = 1 - Math.pow(1 - k, 3);
    shownTotal = from + (to - from) * e;
    estTotal.textContent = euro(shownTotal);
    if (k < 1) animFrame = requestAnimationFrame(step);
  })(t0);
}
function updateEstimate() {
  const f = formules[estIndex]; if (!f) return;
  const n = +estGuests.value;
  estGuestsVal.textContent = n;
  estDetail.textContent = `Formule ${f.name} · ${n} personnes · ${f.price} € / pers.`;
  animateTotal(f.price * n);
  estGuests.style.background = `linear-gradient(90deg, var(--accent) ${(n - 5) / 195 * 100}%, #e3e0d6 0)`;
}
if (formules.length && estChoices) {
  formules.forEach((f, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'est-choice'; b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', i === estIndex);
    b.innerHTML = `<strong>${f.name}</strong><small>à partir de ${f.price} € / pers.</small>`;
    b.addEventListener('click', () => {
      estIndex = i;
      estChoices.querySelectorAll('.est-choice').forEach((x, j) => x.setAttribute('aria-checked', j === i));
      updateEstimate();
    });
    estChoices.appendChild(b);
  });
  estGuests.addEventListener('input', updateEstimate);
  updateEstimate();

  document.getElementById('estUse').addEventListener('click', () => {
    const f = formules[estIndex], n = +estGuests.value;
    const form = document.getElementById('devis-form');
    form.invites.value = n;
    form.message.value = `Bonjour, je souhaite un devis pour la formule ${f.name} pour ${n} personnes (estimation : ${euro(f.price * n)}).`;
    document.getElementById('devis').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

// Visionneuse de la galerie
const lb = document.getElementById('lightbox');
const lbContent = document.getElementById('lbContent');
const tiles = [...document.querySelectorAll('.gallery .tile')];
let lbIndex = 0;
function showTile(i) {
  lbIndex = (i + tiles.length) % tiles.length;
  const t = tiles[lbIndex];
  lbContent.className = 'lb-content ' + [...t.classList].filter(c => /^t\d$/.test(c)).join(' ');
  lbContent.innerHTML = t.innerHTML;
}
function openLb(i) { showTile(i); lb.hidden = false; document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); }
function closeLb() { lb.hidden = true; document.body.style.overflow = ''; tiles[lbIndex]?.focus(); }
tiles.forEach((t, i) => {
  t.tabIndex = 0; t.setAttribute('role', 'button');
  t.addEventListener('click', () => openLb(i));
  t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); } });
});
lb.querySelector('.lb-close').addEventListener('click', closeLb);
lb.querySelector('.lb-prev').addEventListener('click', () => showTile(lbIndex - 1));
lb.querySelector('.lb-next').addEventListener('click', () => showTile(lbIndex + 1));
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') showTile(lbIndex - 1);
  if (e.key === 'ArrowRight') showTile(lbIndex + 1);
});

// Logo 3D : suit la souris (ou se balance doucement tout seul)
const art = document.getElementById('heroArt');
if (art && !reduceMotion) {
  let tx = 0, ty = 0, cx = 0, cy = 0, lastMove = 0;
  const hero = art.closest('section');
  const aim = (x, y) => {
    const r = art.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (x - (r.left + r.width / 2)) / (innerWidth / 2)));
    ty = Math.max(-1, Math.min(1, (y - (r.top + r.height / 2)) / (innerHeight / 2)));
    lastMove = performance.now();
  };
  hero.addEventListener('pointermove', e => aim(e.clientX, e.clientY));
  hero.addEventListener('touchmove', e => aim(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  (function loop(now) {
    if (now - lastMove > 2500) { tx = Math.sin(now / 1800) * .5; ty = Math.cos(now / 2300) * .35; }
    cx += (tx - cx) * .08; cy += (ty - cy) * .08;
    art.style.setProperty('--mx', cx.toFixed(3));
    art.style.setProperty('--my', cy.toFixed(3));
    requestAnimationFrame(loop);
  })(performance.now());
}

// Vidéo du hero : une seule lecture à l'écran, pause possible, économie de données respectée
const vBg = document.querySelector('.hv-bg');
const vMain = document.querySelector('.hv-main');
const vToggle = document.getElementById('vidToggle');
if (vBg && vMain && vToggle) {
  const narrow = window.matchMedia('(max-width: 860px), (orientation: portrait)');
  const saveData = navigator.connection && navigator.connection.saveData;
  // La vidéo s'assombrit en fin de séquence puis affiche le logo du monteur (à partir de ~60,0 s).
  // On garde le début et le fondu d'origine, mais on reboucle juste avant l'apparition du logo.
  const LOOP_START = 0, LOOP_END = 59.95;
  [vBg, vMain].forEach(v => {
    const guard = () => { if (v.currentTime >= LOOP_END) v.currentTime = LOOP_START; requestAnimationFrame(guard); };
    requestAnimationFrame(guard);
    v.addEventListener('timeupdate', () => { if (v.currentTime >= LOOP_END) v.currentTime = LOOP_START; });
  });
  let userPaused = reduceMotion || !!saveData;
  const active = () => (narrow.matches ? [vBg] : [vBg, vMain]);
  const inactive = () => (narrow.matches ? [vMain] : []);
  function sync() {
    inactive().forEach(v => v.pause());
    active().forEach(v => {
      if (userPaused) { v.pause(); if (v.readyState < 2) v.currentTime = LOOP_START; }
      else { const p = v.play(); if (p) p.catch(() => {}); }
    });
    vToggle.textContent = userPaused ? '▶' : '❚❚';
    vToggle.setAttribute('aria-pressed', userPaused);
    vToggle.setAttribute('aria-label', userPaused ? 'Lancer la vidéo' : 'Mettre la vidéo en pause');
  }
  vToggle.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  narrow.addEventListener('change', sync);
  // met en pause quand le hero n'est plus visible (économise la batterie)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      if (userPaused) return;
      active().forEach(v => { if (en.isIntersecting) { const p = v.play(); if (p) p.catch(() => {}); } else v.pause(); });
    }, { threshold: 0.05 }).observe(document.getElementById('accueil'));
  }
  sync();
}

// Année du footer
document.getElementById('year').textContent = new Date().getFullYear();

// Formulaire de devis
// Pour recevoir les demandes par email : crée un formulaire sur formspree.io
// et colle son URL ici (ex: "https://formspree.io/f/xxxxxxx").
const FORM_ENDPOINT = '';

const form = document.getElementById('devis-form');
const status = form.querySelector('.form-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.className = 'form-status';

  const nom = form.nom, email = form.email;
  let valid = true;
  [nom, email].forEach(f => f.classList.remove('invalid'));
  if (!nom.value.trim()) { nom.classList.add('invalid'); valid = false; }
  if (!/^\S+@\S+\.\S+$/.test(email.value)) { email.classList.add('invalid'); valid = false; }
  if (!valid) {
    status.textContent = 'Merci de renseigner un nom et un email valides.';
    status.classList.add('err');
    return;
  }

  if (!FORM_ENDPOINT) {
    status.textContent = 'Formulaire en mode démo : aucun email envoyé (voir script.js).';
    status.classList.add('err');
    return;
  }

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    });
    if (!res.ok) throw new Error();
    form.reset();
    status.textContent = 'Merci ! Votre demande a bien été envoyée, je vous réponds vite.';
    status.classList.add('ok');
  } catch {
    status.textContent = "Une erreur est survenue, merci d'appeler directement.";
    status.classList.add('err');
  }
});
