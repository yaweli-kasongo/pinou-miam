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

// Année du footer
document.getElementById('year').textContent = new Date().getFullYear();

// Formulaire de devis
// Pour recevoir les demandes par email : crée un formulaire sur formspree.io
// et colle son URL ici (ex: "https://formspree.io/f/xxxxxxx").
const FORM_ENDPOINT = '';

const form = document.getElementById('devis');
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
