/* Page de modification. Fonctionne avec le serveur (mode normal) ou seul dans un fichier (mode démonstration). */
import { rendrePage, slug, favicon, LIBELLES, libelle, libellesDemande } from './rendu.js';
import { cssPolices } from './polices.js';

const DEMO = window.ESPACE_DEMO || null;
const $ = (s, r) => (r || document).querySelector(s);
const el = (tag, attrs, ...enfants) => {
  const e = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v == null || v === false) return;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  });
  enfants.flat(Infinity).forEach((c) => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); });
  return e;
};
const copie = (o) => JSON.parse(JSON.stringify(o));
let nId = 0; const uid = (p) => (p || 'c') + (++nId);

/* ---------- Accès aux données ---------- */
const vraiApi = {
  async charger() {
    const r = await fetch('/api/contenu', { credentials: 'same-origin' });
    if (r.status === 401) return null;
    const j = await r.json();
    if (!j.ok) throw new Error(j.erreur || 'Erreur');
    return j;
  },
  async connexion(mdp) {
    if (!String(mdp || '').trim()) throw new Error('Saisissez votre mot de passe.');
    const r = await fetch('/api/connexion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ motdepasse: mdp }) });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Connexion impossible.');
  },
  async deconnexion() { await fetch('/api/deconnexion', { method: 'POST' }); },
  async enregistrer(C) {
    const r = await fetch('/api/contenu', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(C) });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) throw Object.assign(new Error(j.erreur), { session: true });
    if (!j.ok) throw new Error(j.erreur || 'Enregistrement impossible.');
  },
  async annuler() {
    const r = await fetch('/api/annuler', { method: 'POST' });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Impossible de revenir en arrière.');
    return j.contenu;
  },
  async video(fichier) {
    const r = await fetch('/api/video', { method: 'POST', headers: { 'Content-Type': fichier.type }, body: fichier });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Envoi de la vidéo impossible.');
    return j.url;
  },
  async photo(blob) {
    const r = await fetch('/api/photo', { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Envoi de la photo impossible.');
    return j.url;
  },
  async demandes() {
    const r = await fetch('/api/demandes');
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Demandes indisponibles.');
    return j.demandes;
  },
  async motDePasse(actuel, nouveau) {
    const r = await fetch('/api/mot-de-passe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actuel, nouveau }) });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Changement impossible.');
  },
  async audience(jours) {
    const r = await fetch('/api/audience?jours=' + jours);
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Visites indisponibles.');
    return j;
  },
  async statut(id, statut) {
    const r = await fetch('/api/demandes/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statut }) });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Modification impossible.');
  },
};

/* Petite mémoire du navigateur. Si le navigateur la refuse (aperçu protégé, navigation privée),
   on garde tout en mémoire le temps de la visite : la démonstration fonctionne quand même. */
const memoire = {};
/* La mémoire du navigateur est-elle utilisable ? (non dans l'aperçu de l'app Claude) */
const stockageOk = (() => { try { localStorage.setItem('espace-test', '1'); localStorage.removeItem('espace-test'); return true; } catch (e) { return false; } })();
/* Démonstration : les images déjà dans le fichier ne sont pas recopiées dans la mémoire du navigateur (place limitée à quelques Mo) */
const imagesDemo = [], indexDemo = new Map();
if (DEMO) JSON.stringify(DEMO.contenu, (k, x) => { if (typeof x === 'string' && x.length > 2000 && x.startsWith('data:') && !indexDemo.has(x)) { indexDemo.set(x, imagesDemo.length); imagesDemo.push(x); } return x; });
const versTexte = (v) => JSON.stringify(v, (k, x) => (typeof x === 'string' && indexDemo.has(x) ? '@image-demo:' + indexDemo.get(x) : x));
const depuisTexte = (t) => JSON.parse(t, (k, x) => (typeof x === 'string' && x.startsWith('@image-demo:') ? imagesDemo[+x.slice(12)] || '' : x));
/* Chaque démonstration a sa propre mémoire : tous les fichiers ouverts depuis l'ordinateur partagent la même mémoire du navigateur,
   la clé dépend donc du site et de sa version (une nouvelle démonstration repart toujours de zéro). */
const empreinte = (t) => { let h = 5381; for (let i = 0; i < t.length; i += 7) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h.toString(36) + t.length.toString(36); };
const PREFIXE = DEMO ? 'demo-' + empreinte(JSON.stringify(DEMO.contenu)) + '-' : 'espace-';
if (DEMO) { try { Object.keys(localStorage).filter((k) => k.startsWith('espace-demo-')).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* rien */ } }
function remettreAZero() {
  Object.keys(memoire).forEach((k) => { if (k.startsWith(PREFIXE)) delete memoire[k]; });
  try { Object.keys(localStorage).filter((k) => k.startsWith(PREFIXE)).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* rien */ }
}
const memo = {
  persiste: true,
  lire(k, d) {
    const c = PREFIXE + k;
    if (c in memoire) return depuisTexte(memoire[c]);
    try { const v = localStorage.getItem(c); return v ? depuisTexte(v) : d; } catch (e) { return d; }
  },
  ecrire(k, v) {
    const c = PREFIXE + k, s = versTexte(v);
    let ok = true;
    try { localStorage.setItem(c, s); } catch (e) { ok = false; }
    if (ok || DEMO) memoire[c] = s;
    if (DEMO && k === 'contenu') memo.persiste = ok;
    return ok || !!DEMO;
  },
};
const demoApi = {
  async charger() { return memo.lire('connecte', false) ? { contenu: memo.lire('contenu', copie(DEMO.contenu)), maquette: true } : null; },
  async connexion() { memo.ecrire('connecte', true); },
  async deconnexion() { memo.ecrire('connecte', false); },
  async enregistrer(C) {
    const avant = memo.lire('contenu', copie(DEMO.contenu));
    if (!memo.ecrire('contenu', C)) throw new Error('Mémoire du téléphone pleine : retirez une photo.');
    /* « Revenir en arrière » de la démonstration : gardé pendant la visite, pour laisser la place au contenu */
    memoire[PREFIXE + 'precedent'] = versTexte(avant);
    try { localStorage.removeItem(PREFIXE + 'precedent'); } catch (e) { /* rien */ }
  },
  async annuler() { const p = memo.lire('precedent', null); if (!p) throw new Error('Aucune version précédente.'); memo.ecrire('contenu', p); return p; },
  async photo(blob) { return await new Promise((ok) => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(blob); }); },
  async video(fichier) { return await new Promise((ok) => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(fichier); }); },
  async demandes() {
    const ex = (id, h, statut, nom, lignes) => ({ id, recue: new Date(Date.now() - h * 3600e3).toISOString(), statut, nom, lignes });
    const C0 = (DEMO && DEMO.contenu) || {};
    if (C0.libelles) {
      /* Site qui a ses propres libellés : exemples neutres, avec ses types de demande */
      const Lb = libellesDemande(C0), ty = ((C0.contact || {}).types || []).filter(Boolean);
      return memo.lire('demandes', [
        ex('ex1', 3, 'nouvelle', 'Exemple : Claire Martin', [[Lb.societe, 'Exemple : Boulangerie Martin'], ['E-mail', 'exemple@exemple.fr'], ['Téléphone', '06 00 00 00 01'], [Lb.type, ty[0] || ''], [Lb.message, 'Exemple : voici comment une demande arrive ici, avec les coordonnées et le message du visiteur.']].filter(([, v]) => v)),
        ex('ex2', 50, 'devis', 'Exemple : Paul Durand', [['E-mail', 'exemple@exemple.fr'], ['Téléphone', '06 00 00 00 02'], [Lb.type, ty[1] || ty[0] || ''], [Lb.message, 'Exemple : demande déjà traitée, classée « devis envoyé ».']].filter(([, v]) => v)),
      ]);
    }
    return memo.lire('demandes', [
      ex('ex1', 3, 'nouvelle', 'Exemple : Claire Martin', [['Société', 'Exemple SAS'], ['E-mail', 'exemple@exemple.fr'], ['Téléphone', '06 00 00 00 01'], ['Type de locaux', 'Bureaux'], ['Surface', '400 m²'], ['Ville du projet', 'Nantes'], ['Projet', 'Exemple : aménagement d’un plateau de bureaux avant notre emménagement.']]),
      ex('ex2', 50, 'devis', 'Exemple : Paul Durand', [['E-mail', 'exemple@exemple.fr'], ['Téléphone', '06 00 00 00 02'], ['Type de locaux', 'Commerce ou restaurant'], ['Ville du projet', 'Saint-Nazaire'], ['Projet', 'Exemple : rénovation d’une cellule commerciale.']]),
    ]);
  },
  async motDePasse() { throw new Error('Indisponible dans la démonstration : le vrai site a son propre mot de passe.'); },
  async audience(jours) {
    const base = Date.parse(new Date().toISOString().slice(0, 10) + 'T12:00:00Z');
    const mod = [7, 12, 9, 15, 11, 6, 4];
    return { ok: true, plafond: 800, sauvegarde: null, jours: Array.from({ length: jours }, (_, i) => { const t = mod[i % 7] + (i % 3); return { jour: new Date(base - (jours - 1 - i) * 86400e3).toISOString().slice(0, 10), t, p: { '/': Math.ceil(t * 0.6), '/expertises': Math.floor(t * 0.25), '/contact': Math.floor(t * 0.15) }, s: { g: Math.floor(t * 0.4), d: Math.floor(t * 0.2), a: Math.floor(t * 0.1), i: Math.floor(t * 0.3) } }; }) };
  },
  async statut(id, statut) { const l = await demoApi.demandes(); l.forEach((c) => { if (c.id === id) c.statut = statut; }); memo.ecrire('demandes', l); },
};
const api = DEMO ? demoApi : vraiApi;

/* ---------- État ---------- */
const E = { C: null, base: '', maquette: false, ouverts: new Set(['realisations']), page: '/realisations' };
const modifie = () => JSON.stringify(E.C) !== E.base;
const racine = $('#app');

function toast(t) {
  let b = $('.toast'); if (!b) { b = el('div', { class: 'toast', role: 'status' }); document.body.append(b); }
  b.textContent = t; b.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { b.hidden = true; }, Math.max(3200, t.length * 55));
}

/* ---------- Connexion ---------- */
function ecranConnexion(message) {
  racine.replaceChildren();
  if (DEMO) appliquerTheme(DEMO.contenu);
  else if (!E.apparence) fetch('/api/apparence').then((r) => r.json()).then((j) => { if (j && j.ok) { E.apparence = j; appliquerTheme(j); const h = document.querySelector('.connexion h1'); if (h) h.textContent = j.boutique.nom; } }).catch(() => {});
  const nom = (DEMO && DEMO.contenu.agence.nom) || (E.apparence && E.apparence.boutique.nom) || 'Votre site';
  const input = el('input', { id: 'mdp', type: 'password', autocomplete: 'current-password', required: true, placeholder: DEMO ? 'Tapez n’importe quoi' : '' });
  const voir = el('button', { type: 'button', text: 'Afficher', onclick: () => { input.type = input.type === 'password' ? 'text' : 'password'; voir.textContent = input.type === 'password' ? 'Afficher' : 'Masquer'; } });
  const err = el('p', { class: 'erreur', role: 'alert', hidden: !message, text: message || '' });
  /* bouton simple (pas « submit ») : fonctionne aussi dans les aperçus qui bloquent les formulaires */
  const seConnecter = async (e) => {
    if (e) e.preventDefault();
    if (bouton.disabled) return;
    err.hidden = true; bouton.disabled = true; bouton.textContent = 'Connexion…';
    try { await api.connexion(input.value); await demarrer(); }
    catch (x) { err.textContent = x.message; err.hidden = false; bouton.disabled = false; bouton.textContent = 'Se connecter'; }
  };
  const bouton = el('button', { class: 'btn', type: 'button', id: 'btn-connexion', text: 'Se connecter', onclick: seConnecter });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') seConnecter(e); });
  const form = el('form', {
    onsubmit: seConnecter,
  },
  el('h1', { text: nom }),
  el('p', { class: 'sous', text: 'Page de modification' }),
  DEMO ? el('p', { class: 'aide', text: 'Démonstration : aucun mot de passe n’est demandé, vos essais restent sur cet appareil.' }) : null,
  el('div', { class: 'champ' }, el('label', { for: 'mdp', text: 'Mot de passe' }), el('div', { class: 'mdp' }, input, voir)),
  err, bouton,
  el('p', { class: 'aide', text: 'Mot de passe oublié ? Appelez Grégoire.' }),
  DEMO ? el('button', { type: 'button', class: 'btn sec', text: 'Revoir le site', onclick: vueSiteDemo }) : null,
  DEMO ? el('button', { type: 'button', class: 'btn discret', text: 'Remettre la démonstration à zéro', onclick: () => { remettreAZero(); ecranConnexion(); toast('Démonstration remise à zéro : le site est revenu à sa version d’origine.'); } }) : null);
  racine.append(el('main', { class: 'connexion' }, form));
  input.focus();
}

/* ---------- Champs ---------- */
function lire(obj, chemin) { return chemin.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj); }
function ecrire(obj, chemin, v) { const ks = chemin.split('.'); const der = ks.pop(); let o = obj; ks.forEach((k) => { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; }); o[der] = v; }

function champ(obj, def, apres) {
  const id = uid('f');
  const val = lire(obj, def.k);
  const maj = (v) => { ecrire(obj, def.k, v); changement(); if (apres) apres(); };
  const lab = el('label', { for: id }, def.l, def.ex ? el('span', { class: 'ex', text: ' (' + def.ex + ')' }) : null);
  if (def.t === 'case') {
    const c = el('input', { id, type: 'checkbox', checked: !!val, onchange: (e) => maj(e.target.checked) });
    return el('div', { class: 'champ' }, el('label', { class: 'interrupteur', for: id }, c, el('span', { class: 'rail', 'aria-hidden': 'true' }), def.l));
  }
  if (def.t === 'lignes') {
    const t = el('textarea', { id, class: 'saisie', rows: def.lignes || 5, placeholder: def.ph || 'Une ligne par élément', oninput: (e) => maj(e.target.value.split('\n').map((x) => x.trim()).filter(Boolean)) }, (Array.isArray(val) ? val : []).join('\n'));
    return el('div', { class: 'champ' }, el('label', { for: id }, def.l, el('span', { class: 'ex', text: ' (une ligne par élément)' })), t);
  }
  if (def.t === 'zone') return el('div', { class: 'champ' }, lab, el('textarea', { id, class: 'saisie', rows: def.lignes || 3, placeholder: def.ph || '', oninput: (e) => maj(e.target.value) }, val || ''));
  if (def.t === 'choix') {
    const opts = (typeof def.options === 'function' ? def.options() : def.options).map((o) => (Array.isArray(o) ? o : [o, o]));
    const s = el('select', { id, class: 'saisie', onchange: (e) => maj(e.target.value) }, el('option', { value: '', text: def.vide || '—' }), opts.map(([v, l]) => el('option', { value: v, text: l, selected: v === val })));
    return el('div', { class: 'champ' }, lab, s);
  }
  if (def.t === 'nombre') return el('div', { class: 'champ' }, lab, el('input', { id, class: 'saisie', type: 'number', inputmode: 'numeric', min: def.min, max: def.max, value: val == null ? '' : val, oninput: (e) => maj(e.target.value === '' ? '' : +e.target.value) }));
  if (def.t === 'photo') return champPhoto(id, def, val, maj);
  if (def.t === 'video') return champVideo(id, def, val, maj);
  if (def.t === 'photos') return champPhotos(obj, def, apres);
  if (def.t === 'couleur') {
    const avis = el('span', { class: 'ex', 'aria-live': 'polite' });
    const verifier = (v) => { avis.textContent = /^#[0-9a-f]{6}$/i.test(v) && contraste(v, def.contre || '#ffffff') < 4.5 ? ' Trop clair : le texte sera difficile à lire, prenez une teinte plus foncée.' : ''; };
    const texte = el('input', { class: 'saisie', value: val || '', 'aria-label': def.l + ' (code)', oninput: (e) => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) { pick.value = e.target.value; maj(e.target.value); verifier(e.target.value); } } });
    const pick = el('input', { id, type: 'color', class: 'pastille-couleur', value: /^#[0-9a-f]{6}$/i.test(val || '') ? val : '#888888', oninput: (e) => { texte.value = e.target.value; maj(e.target.value); verifier(e.target.value); } });
    verifier(val || '');
    return el('div', { class: 'champ' }, lab, el('div', { class: 'couleur' }, pick, texte), avis);
  }
  return el('div', { class: 'champ' }, lab, el('input', { id, class: 'saisie', type: def.type || 'text', inputmode: def.mode, placeholder: def.ph || '', value: val || '', oninput: (e) => maj(e.target.value) }));
}

async function reduire(fichier, maxCote, qualite) {
  const url = URL.createObjectURL(fichier);
  try {
    const im = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error('Photo illisible : essayez une autre.')); i.src = url; });
    const r = Math.min(1, maxCote / Math.max(im.naturalWidth, im.naturalHeight));
    const cv = document.createElement('canvas');
    cv.width = Math.round(im.naturalWidth * r); cv.height = Math.round(im.naturalHeight * r);
    cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
    return await new Promise((ok) => cv.toBlob(ok, 'image/jpeg', qualite));
  } finally { URL.revokeObjectURL(url); }
}

/* Vidéo de fond : fichier MP4 ou WebM (20 Mo au plus), ou lien */
const VIDEO_OK = /^(https:\/\/\S+\.(mp4|webm)(\?\S*)?|\/videos\/[a-z0-9-]+|\/assets\/\S+\.(mp4|webm)|data:video\/(mp4|webm);base64,\S+)$/i;
function champVideo(id, def, val, maj) {
  const etat = el('span', { class: 'ex', 'aria-live': 'polite' });
  const apercu = el('div', { class: 'video-apercu' });
  const montrer = (v) => {
    apercu.replaceChildren();
    if (v && VIDEO_OK.test(v)) apercu.append(el('video', { src: v, muted: true, loop: true, playsinline: true, autoplay: true, preload: 'metadata', 'aria-hidden': 'true' }));
    retirer.hidden = !v; lien.value = v && !/^data:/.test(v) ? v : '';
  };
  const max = DEMO ? 8 : 20;
  const fichier = el('input', {
    id, type: 'file', accept: 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov',
    onchange: async (e) => {
      const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
      if (!/^video\/(mp4|webm)$/.test(f.type)) { etat.textContent = 'Ce format (souvent .mov sur iPhone) ne se lit pas partout : il faut un fichier MP4. Voir « Vidéo de fond » dans le guide, ou envoyez la vidéo à Grégoire.'; return; }
      if (f.size > max * 1024 * 1024) { etat.textContent = `Vidéo trop lourde (${Math.round(f.size / 1048576)} Mo) : ${max} Mo au plus${DEMO ? ' dans la démonstration' : ''}. Raccourcissez-la (10 à 20 secondes suffisent) ou réduisez sa qualité.`; return; }
      etat.textContent = 'Envoi de la vidéo…';
      try { const u = await api.video(f); maj(u); montrer(u); etat.textContent = 'Vidéo prête : cochez « Vidéo en fond » si besoin, puis enregistrez.'; } catch (x) { etat.textContent = x.message; }
    },
  });
  const choisir = el('label', { class: 'btn sec petit', for: id, text: val ? 'Changer la vidéo' : 'Choisir une vidéo' });
  const retirer = el('button', { type: 'button', class: 'btn discret petit', text: 'Retirer', onclick: () => { maj(''); montrer(''); etat.textContent = 'Vidéo retirée : la photo reprend sa place.'; } });
  const lien = el('input', { class: 'saisie', type: 'url', placeholder: 'ou collez un lien https://….mp4', 'aria-label': 'Lien de la vidéo', onchange: (e) => { const v = e.target.value.trim(); if (!v) return; if (!VIDEO_OK.test(v)) { etat.textContent = 'Lien non valable : il doit commencer par https:// et finir par .mp4 ou .webm.'; return; } maj(v); montrer(v); etat.textContent = 'Lien enregistré : pensez à enregistrer.'; } });
  montrer(val);
  return el('div', { class: 'champ' }, el('span', { class: 'lab', text: def.l }), def.ex ? el('span', { class: 'ex', text: def.ex }) : null,
    el('div', { class: 'video-champ' }, apercu, el('div', {}, el('div', { class: 'actions' }, choisir, retirer, fichier), lien, etat)));
}

function champPhoto(id, def, val, maj) {
  const vignette = el('div', { class: 'vignette', 'aria-hidden': 'true' });
  const montrer = (v) => { vignette.style.backgroundImage = v ? `url("${String(v).replace(/"/g, '%22')}")` : ''; retirer.hidden = !v; };
  const etat = el('span', { class: 'ex', 'aria-live': 'polite' });
  const fichier = el('input', {
    id, type: 'file', accept: 'image/*',
    onchange: async (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      etat.textContent = 'Préparation de la photo…';
      try {
        const blob = await reduire(f, DEMO ? 1200 : 1800, DEMO ? 0.72 : 0.82);
        etat.textContent = 'Envoi…';
        const u = await api.photo(blob);
        maj(u); montrer(u); etat.textContent = 'Photo prête : pensez à enregistrer.';
      } catch (x) { etat.textContent = x.message; }
      e.target.value = '';
    },
  });
  const choisir = el('label', { class: 'btn sec petit', for: id, text: val ? 'Changer la photo' : 'Choisir une photo' });
  const retirer = el('button', { type: 'button', class: 'btn discret petit', text: 'Retirer', onclick: () => { maj(''); montrer(''); choisir.textContent = 'Choisir une photo'; } });
  montrer(val);
  return el('div', { class: 'champ' }, el('span', { class: 'lab', text: def.l }),
    el('div', { class: 'photo' }, vignette, el('div', {}, el('div', { class: 'actions' }, choisir, retirer, fichier), etat)));
}

/* ---------- Listes (fromages, plateaux, questions, presse) ---------- */
function listeDe(cle) {
  const ch = cle.split('.'), dernier = ch.pop();
  const parent = ch.reduce((o, k) => (o[k] = o[k] || {}), E.C);
  return (parent[dernier] = parent[dernier] || []);
}
function editeurListe(cle, cfg) {
  const boite = el('div', { class: 'liste' });
  const dessiner = (ouvrir) => {
    const L = listeDe(cle);
    boite.replaceChildren();
    L.forEach((it, i) => {
      const titre = el('b', { text: it[cfg.titre] || cfg.sansTitre });
      const sous = el('span', { class: 's', text: cfg.sous ? cfg.sous(it) : '' });
      const ph = () => (typeof cfg.photo === 'function' ? cfg.photo(it) : it[cfg.photo]) || '';
      const mini = cfg.photo ? el('span', { class: 'mini', hidden: !ph(), style: ph() ? `background-image:url("${String(ph()).replace(/"/g, '%22')}")` : '' }) : null;
      const majResume = () => { titre.textContent = it[cfg.titre] || cfg.sansTitre; sous.textContent = cfg.sous ? cfg.sous(it) : ''; if (mini) { mini.hidden = !ph(); mini.style.backgroundImage = ph() ? `url("${String(ph()).replace(/"/g, '%22')}")` : ''; } if (cfg.apres) cfg.apres(it); };
      const sup = el('button', {
        type: 'button', class: 'btn danger petit', text: 'Supprimer',
        onclick: () => {
          if (!sup.classList.contains('confirmer')) { sup.classList.add('confirmer'); sup.textContent = 'Confirmer la suppression'; setTimeout(() => { sup.classList.remove('confirmer'); sup.textContent = 'Supprimer'; }, 4000); return; }
          L.splice(i, 1); changement(); dessiner();
        },
      });
      const bouger = (d) => { const j = i + d; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; changement(); dessiner(j); };
      const corps = el('div', { class: 'item-corps' },
        el('div', { class: 'grille' }, cfg.champs.map((def) => champ(it, def, majResume))),
        el('div', { class: 'item-outils' },
          el('div', { class: 'ordre' },
            el('button', { type: 'button', class: 'btn sec petit', disabled: i === 0, onclick: () => bouger(-1), 'aria-label': 'Monter', text: 'Monter' }),
            el('button', { type: 'button', class: 'btn sec petit', disabled: i === L.length - 1, onclick: () => bouger(1), 'aria-label': 'Descendre', text: 'Descendre' })),
          sup));
      const det = el('details', { class: 'item', open: ouvrir === i }, el('summary', {}, mini, el('span', { class: 'txt' }, titre, sous)), corps);
      if (cfg.ouvert) det.addEventListener('toggle', () => { if (det.open) cfg.ouvert(it); });
      boite.append(det);
    });
    if (!L.length) boite.append(el('p', { class: 'vide', text: cfg.vide }));
    boite.append(el('button', { type: 'button', class: 'btn sec ajouter', text: cfg.ajouter, onclick: () => { L.push(copie(cfg.nouveau)); changement(); dessiner(L.length - 1); const f = boite.querySelector('details[open] input, details[open] textarea'); if (f) f.focus(); } }));
    if (cfg.vide && !L.length) { /* déjà affiché */ }
  };
  dessiner();
  return boite;
}

/* ---------- Plusieurs photos (pièces, pages) ---------- */
function champPhotos(obj, def, apres) {
  const boite = el('div', { class: 'photos-liste' });
  const id = uid('ph');
  const etat = el('span', { class: 'ex', 'aria-live': 'polite' });
  const L = () => { const v = lire(obj, def.k); if (Array.isArray(v)) return v; ecrire(obj, def.k, []); return lire(obj, def.k); };
  const dessiner = () => {
    boite.replaceChildren();
    L().forEach((u, i) => {
      boite.append(el('div', { class: 'photo-el' },
        el('div', { class: 'vignette', style: `background-image:url("${String(u).replace(/"/g, '%22')}")`, 'aria-hidden': 'true' }),
        el('div', { class: 'actions' },
          i > 0 ? el('button', { type: 'button', class: 'btn sec petit', text: 'Mettre en premier', onclick: () => { const a = L(); a.unshift(a.splice(i, 1)[0]); changement(); if (apres) apres(); dessiner(); } }) : el('span', { class: 'ex', text: 'Photo principale' }),
          el('button', { type: 'button', class: 'btn discret petit', text: 'Retirer', onclick: () => { L().splice(i, 1); changement(); if (apres) apres(); dessiner(); } }))));
    });
    if (L().length < (def.max || 8)) {
      const fichier = el('input', {
        id, type: 'file', accept: 'image/*', multiple: true,
        onchange: async (e) => {
          const fs = Array.from(e.target.files || []).slice(0, (def.max || 8) - L().length);
          for (const f of fs) {
            etat.textContent = 'Préparation de la photo…';
            try { const blob = await reduire(f, DEMO ? 1200 : 1800, DEMO ? 0.72 : 0.82); etat.textContent = 'Envoi…'; L().push(await api.photo(blob)); changement(); if (apres) apres(); etat.textContent = 'Photo prête : pensez à enregistrer.'; } catch (x) { etat.textContent = x.message; }
          }
          e.target.value = ''; dessiner();
        },
      });
      boite.append(el('div', { class: 'actions' }, el('label', { class: 'btn sec petit', for: id, text: 'Ajouter des photos' }), fichier), etat);
    }
  };
  dessiner();
  return el('div', { class: 'champ' }, el('span', { class: 'lab', text: def.l }), def.ex ? el('span', { class: 'ex', text: def.ex }) : null, boite);
}

/* Contraste WCAG, pour prévenir quand une couleur de collection est trop claire */
function contraste(a, b) {
  const l = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const x = l(a), y = l(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/* Identifiants des pièces, collections et types : tirés du nom à la création, puis fixes */
function assurerIds(C) {
  ['realisations', 'metiers', 'secteurs', 'pages_metier'].forEach((k) => {
    const L = C[k] || [], pris = new Set(L.map((x) => x.id).filter(Boolean));
    L.forEach((x) => { if (!x.id && x.nom) { let b = slug(x.nom) || k, id = b, n = 2; while (pris.has(id)) id = b + '-' + n++; x.id = id; pris.add(id); } });
  });
}

/* ---------- Demandes reçues ---------- */
const STATUTS = [['nouvelle', 'Nouvelle'], ['rappelee', 'Rappelé'], ['devis', 'Devis envoyé'], ['signee', 'Signée'], ['classee', 'Classée']];
function listeCommandes() {
  const boite = el('div', { class: 'cmds' }, el('p', { class: 'aide', text: 'Chargement des demandes…' }));
  const charger = async () => {
    try {
      const L = await api.demandes();
      E.nouvelles = L.filter((c) => c.statut === 'nouvelle').length;
      majResumes();
      boite.replaceChildren();
      if (!L.length) { boite.append(el('p', { class: 'vide', text: 'Aucune demande pour l’instant. Elles arrivent aussi par e-mail.' })); return; }
      L.forEach((c) => {
        const lignes = Array.isArray(c.lignes) ? c.lignes : [];
        const etiquette = el('span', { class: 'etiquette ' + c.statut, text: (STATUTS.find((s) => s[0] === c.statut) || [, c.statut])[1] });
        const carte = el('div', { class: 'cmd ' + c.statut },
          el('div', { class: 'cmd-tete' }, el('b', { text: (c.nom || 'Contact') + (c.societe ? ' · ' + c.societe : '') }), etiquette),
          el('dl', {}, lignes.map(([k, v]) => [el('dt', { text: k }), el('dd', {}, k === 'Téléphone' ? el('a', { href: 'tel:' + String(v).replace(/[^\d+]/g, ''), text: v }) : (k === 'E-mail' ? el('a', { href: 'mailto:' + v, text: v }) : v))]),
            el('dt', { text: 'Reçue' }), el('dd', { text: new Date(c.recue).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) })),
          el('div', { class: 'statuts', role: 'group', 'aria-label': 'Statut' }, STATUTS.map(([v, tx]) => el('button', {
            type: 'button', 'aria-pressed': String(c.statut === v), text: tx,
            onclick: async () => { try { await api.statut(c.id, v); charger(); } catch (x) { toast(x.message); } },
          }))));
        boite.append(carte);
      });
    } catch (x) { boite.replaceChildren(el('p', { class: 'erreur', text: x.message })); }
  };
  charger();
  return el('div', { class: 'pan-corps', style: 'padding:0' },
    el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px' }, el('h3', { text: 'Demandes reçues', style: 'font-size:1.125rem' }), el('button', { type: 'button', class: 'btn discret petit', text: 'Actualiser', onclick: charger })),
    boite);
}

/* ---------- Visites (pages vues comptées par le serveur, sans cookie) ---------- */
function blocVisites() {
  const boite = el('div', { class: 'visites' }, el('p', { class: 'aide', text: 'Chargement des visites…' }));
  const charger = async (jours) => {
    try {
      const d = await api.audience(jours);
      const J = d.jours || [], total = J.reduce((n, x) => n + (x.t || 0), 0);
      const pages = {}, src = { g: 0, d: 0, a: 0, i: 0 };
      J.forEach((x) => { Object.entries(x.p || {}).forEach(([k, v]) => { pages[k] = (pages[k] || 0) + v; }); Object.entries(x.s || {}).forEach(([k, v]) => { src[k] = (src[k] || 0) + v; }); });
      const top = Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 8);
      const entrees = src.g + src.d + src.a;
      const max = Math.max(1, ...J.map((x) => x.t || 0));
      boite.replaceChildren(
        el('p', { class: 'aide', text: total + ' page' + (total > 1 ? 's' : '') + ' vue' + (total > 1 ? 's' : '') + ' sur ' + jours + ' jours' + (entrees ? ' · ' + entrees + ' arrivée' + (entrees > 1 ? 's' : '') + ' : ' + src.g + ' par un moteur de recherche, ' + src.a + ' par un autre site, ' + src.d + ' en tapant l’adresse ou par un favori' : '') + '.' }),
        el('div', { class: 'barres', role: 'img', 'aria-label': 'Pages vues par jour sur ' + jours + ' jours', style: 'display:flex;align-items:flex-end;gap:2px;height:64px;margin:8px 0' }, J.map((x) => el('span', { title: x.jour + ' : ' + (x.t || 0), style: 'flex:1;min-width:2px;background:currentColor;opacity:.55;border-radius:2px 2px 0 0;height:' + Math.max(2, Math.round(((x.t || 0) / max) * 64)) + 'px' }))),
        top.length ? el('ol', { class: 'aide', style: 'padding-left:1.2em;list-style:decimal' }, top.map(([k, v]) => el('li', { text: k + ' : ' + v }))) : el('p', { class: 'vide', text: 'Aucune visite comptée pour l’instant (le comptage démarre quand le site est ouvert au public).' }),
        d.sauvegarde ? el('p', { class: 'aide', text: 'Dernière copie de sauvegarde : ' + new Date(d.sauvegarde.quand).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) + (d.sauvegarde.kv ? ' (7 dernières nuits gardées)' : '') + (d.sauvegarde.r2 ? (d.sauvegarde.r2.erreur ? ' · copie externe en erreur : ' + d.sauvegarde.r2.erreur : ' · copie externe faite') : '') + '.' }) : el('p', { class: 'aide', text: 'Pas encore de copie de sauvegarde enregistrée : la première se fait la nuit qui suit la mise en ligne.' }));
    } catch (x) { boite.replaceChildren(el('p', { class: 'erreur', text: x.message })); }
  };
  charger(30);
  return el('div', { class: 'pan-corps', style: 'padding:0' },
    DEMO ? el('p', { class: 'aide', style: 'font-weight:600', text: 'Démonstration : les chiffres ci-dessous sont des exemples inventés, pas de vraies visites.' }) : null,
    el('p', { class: 'aide', text: 'Le site compte les pages vues sans cookie, sans adresse IP et sans identifier personne. Les chiffres sont un ordre de grandeur : quelques visites très rapprochées peuvent ne pas être comptées.' }),
    el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, [7, 30, 90].map((n) => el('button', { type: 'button', class: 'btn sec petit', text: n + ' jours', onclick: () => charger(n) }))),
    boite);
}

/* ---------- Mot de passe : changé ici, gardé par le serveur (empreinte, jamais le mot de passe) ---------- */
function blocMotDePasse() {
  const champMdp = (id, libelle, auto) => { const i = el('input', { id, type: 'password', autocomplete: auto, class: 'saisie' }); return [i, el('div', { class: 'champ' }, el('label', { for: id, text: libelle }), i)]; };
  const [a, ba] = champMdp('mdp-actuel', 'Mot de passe actuel', 'current-password');
  const [n, bn] = champMdp('mdp-nouveau', 'Nouveau mot de passe (12 caractères au moins)', 'new-password');
  const [c, bc] = champMdp('mdp-confirme', 'Nouveau mot de passe, une seconde fois', 'new-password');
  const msg = el('p', { class: 'aide', role: 'status', 'aria-live': 'polite' });
  const dire = (texte, erreur) => { msg.textContent = texte; msg.className = erreur ? 'erreur' : 'aide'; msg.setAttribute('role', erreur ? 'alert' : 'status'); };
  const bouton = el('button', { type: 'button', class: 'btn', text: 'Changer le mot de passe', onclick: async () => {
    if (n.value.length < 12) return dire('Le nouveau mot de passe doit faire 12 caractères au moins (une phrase, par exemple).', true);
    if (n.value !== c.value) return dire('Les deux nouveaux mots de passe ne sont pas identiques.', true);
    bouton.disabled = true; dire('Changement en cours…');
    try { await api.motDePasse(a.value, n.value); a.value = n.value = c.value = ''; dire('Mot de passe changé. Gardez-le dans un gestionnaire de mots de passe : il ne peut pas être relu.'); }
    catch (x) { dire(x.message, true); }
    bouton.disabled = false;
  } });
  return el('div', { class: 'pan-corps', style: 'padding:0' },
    el('p', { class: 'aide', text: 'Choisissez une phrase longue et unique, que vous n’utilisez nulle part ailleurs. Vous restez connecté ; les autres appareils devront utiliser le nouveau mot de passe à leur prochaine connexion. Si vous l’oubliez, Grégoire peut le réinitialiser.' }),
    ba, bn, bc, el('div', { class: 'actions' }, bouton), msg);
}

/* ---------- Rubriques ---------- */
const montrer = (chemin) => { if (E.page !== chemin) { E.page = chemin; rendreApercu(true); } };
/* Libellés modifiables, rangés pour la page de modification */
const LIBELLES_GROUPES = [
  ['Menu et boutons', ['nav_expertises', 'nav_realisations', 'nav_agence', 'nav_engagements', 'bouton_principal', 'bouton_realisations', 'bouton_appel', 'appel_titre', 'intro_lien']],
  ['Titres de l’accueil', ['exp_sur', 'exp_titre', 'exp_lien', 'essai_sur', 'real_sur', 'real_titre', 'real_tout', 'methode_sur', 'methode_titre', 'refs_sur', 'refs_titre']],
  ['Autres pages', ['page_exp_titre', 'page_exp_description', 'methode_titre_page', 'lots_sur', 'lots_titre', 'page_real_titre', 'page_real_chapo', 'garanties_sur', 'garanties_titre', 'equipe_sur', 'equipe_titre', 'eng_sur', 'page_eng_titre', 'page_eng_chapo', 'eng_index', 'eng_lien']],
  ['Fiche d’une réalisation', ['fiche_client', 'fiche_lieu', 'fiche_surface', 'fiche_mission', 'fiche_annee', 'fiche_secteur', 'interventions']],
  ['Page contact et formulaire', ['contact_titre', 'contact_chapo', 'form_societe', 'form_type', 'form_surface', 'form_surface_exemple', 'form_ville', 'form_message', 'form_message_exemple', 'form_envoyer']],
  ['Pied de page et mentions', ['pied_trouver', 'pied_joindre', 'mentions_siege', 'mentions_immatriculation']],
];
const LIBELLES_NOMS = {
  nav_expertises: 'Menu : 1re rubrique', nav_realisations: 'Menu : 2e rubrique', nav_agence: 'Menu : 3e rubrique', bouton_principal: 'Bouton de l’accueil', bouton_realisations: 'Second bouton de l’accueil', bouton_appel: 'Bouton du bandeau du bas', appel_titre: 'Titre du bandeau du bas (par défaut)', intro_lien: 'Lien sous la présentation',
  exp_sur: 'Petite ligne : offres', exp_titre: 'Titre : offres', exp_lien: 'Lien « en détail »', essai_sur: 'Petite ligne : à essayer', real_sur: 'Petite ligne : réalisations', real_titre: 'Titre : réalisations', real_tout: 'Lien « toutes les réalisations »', methode_sur: 'Petite ligne : méthode', methode_titre: 'Titre : méthode (accueil)', refs_sur: 'Petite ligne : références', refs_titre: 'Titre : références',
  page_exp_titre: 'Titre de la page des offres', page_exp_description: 'Description Google de cette page', methode_titre_page: 'Titre : méthode (page des offres)', lots_sur: 'Petite ligne : liste', lots_titre: 'Titre : liste', page_real_titre: 'Titre de la page des réalisations', page_real_chapo: 'Texte d’introduction (réalisations)', garanties_sur: 'Petite ligne : engagements', garanties_titre: 'Titre : engagements (par défaut)', equipe_sur: 'Petite ligne : équipe', equipe_titre: 'Titre : équipe',
  fiche_client: 'Client', fiche_lieu: 'Lieu', fiche_surface: 'Surface (ou autre)', fiche_mission: 'Mission', fiche_annee: 'Année', fiche_secteur: 'Secteur', interventions: 'Titre de la liste',
  contact_titre: 'Titre de la page contact', contact_chapo: 'Phrase sous le titre', form_societe: 'Champ « société »', form_type: 'Champ « type »', form_surface: 'Champ « surface »', form_surface_exemple: 'Exemple dans ce champ', form_ville: 'Champ « ville »', form_message: 'Champ « message »', form_message_exemple: 'Exemple dans le message', form_envoyer: 'Bouton d’envoi',
  nav_engagements: 'Menu : rubrique Engagements', eng_sur: 'Petite ligne : engagements', page_eng_titre: 'Titre de la page Engagements', page_eng_chapo: 'Phrase sous le titre (page Engagements)', eng_index: 'Titre du sommaire', eng_lien: 'Lien depuis « À propos »',
  pied_trouver: 'Pied : colonne adresse', pied_joindre: 'Pied : colonne contact', mentions_siege: 'Mentions : « Siège »', mentions_immatriculation: 'Mentions : « RCS »',
};

function panneaux() {
  const nomSecteur = (id) => ((E.C.secteurs || []).find((c) => c.id === id) || {}).nom || '';
  const groupe = (titre, sous, contenu, chemin) => {
    const d = el('details', { class: 'item' }, el('summary', {}, el('span', { class: 'txt' }, el('b', { text: titre }), sous ? el('span', { class: 's', text: sous }) : null)), el('div', { class: 'item-corps' }, contenu));
    if (chemin) d.addEventListener('toggle', () => { if (d.open) montrer(chemin); });
    return d;
  };
  const essai = (u) => /images\.unsplash\.com/.test(String(u || ''));
  return [
    {
      id: 'annonce', titre: 'Message en haut du site', page: '/',
      resume: () => (E.C.annonce && E.C.annonce.afficher && E.C.annonce.texte ? 'Affiché : « ' + E.C.annonce.texte + ' »' : 'Aucun message affiché'),
      corps: () => [
        el('p', { class: 'aide', text: 'Pour une fermeture, un salon, une nouvelle réalisation…' }),
        champ(E.C, { k: 'annonce.afficher', l: 'Afficher le message', t: 'case' }),
        champ(E.C, { k: 'annonce.texte', l: 'Texte du message', ph: 'Ex. : Fermeture du 4 au 18 août' }),
      ],
    },
    {
      id: 'realisations', titre: 'Réalisations', page: '/realisations',
      resume: () => { const R = E.C.realisations || [], ill = R.filter((x) => (x.photos || []).some(essai)).length; return R.filter((x) => x.visible !== false).length + ' en ligne' + (ill ? ', dont ' + ill + ' avec des photos d’illustration à remplacer' : ''); },
      corps: () => [
        el('p', { class: 'aide', text: 'Touchez une réalisation pour changer ses photos et ses textes. La première photo est la principale. « À la une » : montrée sur l’accueil (la première en grand). L’ordre de la liste est celui du site.' }),
        editeurListe('realisations', {
          titre: 'nom', sansTitre: 'Nouvelle réalisation', photo: (x) => (x.photos || [])[0],
          sous: (x) => [nomSecteur(x.secteur), x.surface, x.a_la_une ? 'à la une' : '', x.visible === false ? 'masquée' : '', (x.photos || []).some(essai) ? 'photos d’illustration' : ''].filter(Boolean).join(', '),
          vide: 'Aucune réalisation pour l’instant.', ajouter: 'Ajouter une réalisation',
          nouveau: { id: '', nom: '', client: '', secteur: '', lieu: '', surface: '', annee: '', mission: '', accroche: '', texte: '', interventions: [], photos: [], a_la_une: false, visible: true },
          ouvert: (x) => { assurerIds(E.C); if (x.id) montrer('/realisations/' + x.id); },
          apres: (x) => { assurerIds(E.C); if (x.id && E.page !== '/realisations/' + x.id) montrer('/realisations/' + x.id); },
          champs: [
            { k: 'nom', l: 'Nom du projet' },
            { k: 'secteur', l: 'Secteur', t: 'choix', options: () => (E.C.secteurs || []).filter((c) => c.id).map((c) => [c.id, c.nom]) },
            { k: 'photos', l: 'Photos', t: 'photos', max: 12 },
            { k: 'accroche', l: 'Phrase d’accroche' },
            { k: 'texte', l: 'Texte', t: 'zone', lignes: 6 },
            { k: 'client', l: libelle(E.C, 'fiche_client') },
            { k: 'lieu', l: libelle(E.C, 'fiche_lieu') },
            { k: 'surface', l: libelle(E.C, 'fiche_surface'), ph: libelle(E.C, 'fiche_surface') === 'Surface' ? 'Ex. : 1 500 m²' : '' },
            { k: 'annee', l: libelle(E.C, 'fiche_annee'), ex: 'facultatif' },
            { k: 'mission', l: libelle(E.C, 'fiche_mission') },
            { k: 'interventions', l: libelle(E.C, 'interventions'), t: 'lignes' },
            { k: 'lien', l: 'Lien à ouvrir', ex: 'facultatif : le site en ligne ou une démonstration', ph: 'https://… ou /demos/…' },
            { k: 'lien_texte', l: 'Texte du bouton', ph: 'Ex. : Voir le site en ligne' },
            { k: 'etiquette', l: 'Étiquette sur la vignette', ph: 'Ex. : Démonstration (laisser vide pour un vrai client)' },
            { k: 'a_la_une', l: 'À la une sur l’accueil', t: 'case' },
            { k: 'visible', l: 'Afficher sur le site', t: 'case' },
          ],
        }),
        groupe('Secteurs', 'Les filtres de la page Réalisations', [
          el('p', { class: 'aide', text: 'Seuls les secteurs qui ont des réalisations apparaissent sur le site.' }),
          editeurListe('secteurs', { titre: 'nom', sansTitre: 'Nouveau secteur', vide: 'Aucun secteur.', ajouter: 'Ajouter un secteur', nouveau: { id: '', nom: '' }, apres: () => assurerIds(E.C), champs: [{ k: 'nom', l: 'Nom' }] }),
        ], '/realisations'),
      ],
    },
    {
      id: 'engagements', titre: 'Engagements', page: '/engagements',
      resume: () => ((E.C.engagements || []).map((b) => b.titre).filter(Boolean).join(', ') || 'Page non affichée'),
      corps: () => [
        el('p', { class: 'aide', text: 'La page « Engagements » apparaît dans le menu dès qu’il y a au moins un bloc : hébergement, données personnelles, sauvegardes, délais de réponse…' }),
        editeurListe('engagements', {
          titre: 'titre', sansTitre: 'Nouvel engagement', vide: 'Aucun engagement : la page n’est pas affichée.', ajouter: 'Ajouter un engagement',
          nouveau: { titre: '', texte: '', points: [] },
          champs: [{ k: 'titre', l: 'Titre' }, { k: 'texte', l: 'Texte', t: 'zone', lignes: 7 }, { k: 'points', l: 'Liste à puces', ex: 'facultatif', t: 'lignes', lignes: 3 }],
        }),
      ],
    },
    {
      id: 'accueil', titre: 'Accueil', page: '/',
      resume: () => (E.C.accueil && E.C.accueil.titre) || '',
      corps: () => [
        groupe('Grande photo et titre', '', [
          champ(E.C, { k: 'accueil.photo', l: 'Grande photo', t: 'photo' }), champ(E.C, { k: 'accueil.video', l: 'Vidéo de fond', ex: 'MP4 sans son, 10 à 20 secondes, 20 Mo au plus. La photo reste l’image d’attente.', t: 'video' }), champ(E.C, { k: 'accueil.fond_video', l: 'Vidéo en fond (sinon la photo)', t: 'case' }),
          champ(E.C, { k: 'accueil.sur_titre', l: 'Petite ligne au-dessus du titre' }), champ(E.C, { k: 'accueil.titre', l: 'Grand titre' }), champ(E.C, { k: 'accueil.texte', l: 'Phrase sous le titre', t: 'zone' }),
          champ(E.C, { k: 'accueil.reperes', l: 'Repères sous les boutons', ph: 'Ex. : Garantie décennale SMA BTP', t: 'lignes', lignes: 3 }),
        ], '/'),
        groupe('Présentation', '', [
          champ(E.C, { k: 'accueil.intro_titre', l: 'Titre' }), champ(E.C, { k: 'accueil.intro_texte', l: 'Texte', t: 'zone', lignes: 6 }), champ(E.C, { k: 'accueil.photo_intro', l: 'Photo', t: 'photo' }),
        ], '/'),
        groupe('Bloc « À essayer »', 'Les réalisations qui ont un lien', [
          el('p', { class: 'aide', text: 'S’affiche sur l’accueil quand un titre est rempli et qu’au moins une réalisation a un lien.' }),
          champ(E.C, { k: 'accueil.essai_titre', l: 'Titre' }), champ(E.C, { k: 'accueil.essai_texte', l: 'Texte', t: 'zone', lignes: 4 }),
        ], '/'),
        groupe('Chiffres', 'Trois repères sous la présentation', [
          champ(E.C, { k: 'affichage.chiffres', l: 'Afficher les chiffres', t: 'case' }),
          editeurListe('chiffres', { titre: 'valeur', sansTitre: 'Nouveau chiffre', sous: (c) => c.libelle || '', vide: 'Aucun chiffre.', ajouter: 'Ajouter un chiffre', nouveau: { valeur: '', libelle: '' }, champs: [{ k: 'valeur', l: 'Chiffre', ph: 'Ex. : 6 200 m²' }, { k: 'libelle', l: 'Texte', ph: 'Ex. : rénovés au Parc du Perray' }] }),
        ], '/'),
        groupe('Bandeau « Parlons de votre projet »', 'En bas des pages', [
          champ(E.C, { k: 'accueil.appel_titre', l: 'Titre' }), champ(E.C, { k: 'accueil.appel_texte', l: 'Texte', t: 'zone' }), champ(E.C, { k: 'accueil.photo_appel', l: 'Photo de fond', t: 'photo' }),
        ], '/'),
      ],
    },
    {
      id: 'expertises', titre: 'Expertises et méthode', page: '/expertises',
      resume: () => (E.C.metiers || []).map((m) => m.nom).filter(Boolean).join(', '),
      corps: () => [
        groupe('Métiers', 'Space planning, maîtrise d’œuvre…', [
          editeurListe('metiers', { titre: 'nom', sansTitre: 'Nouveau métier', photo: 'photo', vide: 'Aucun métier.', ajouter: 'Ajouter un métier', nouveau: { id: '', nom: '', accroche: '', prix: '', texte: '', points: [], photo: '' }, apres: () => assurerIds(E.C),
            champs: [{ k: 'nom', l: 'Nom' }, { k: 'accroche', l: 'Accroche' }, { k: 'prix', l: 'Prix', ex: 'facultatif : « montant | précision » se compose sur deux lignes', ph: 'Ex. : 590 € | une fois, sans abonnement' }, { k: 'texte', l: 'Texte', t: 'zone', lignes: 5 }, { k: 'points', l: 'Points clés', t: 'lignes' }, { k: 'photo', l: 'Photo', t: 'photo' }] }),
        ], '/expertises'),
        groupe('Méthode', 'Les étapes d’un projet', [
          editeurListe('etapes', { titre: 'titre', sansTitre: 'Nouvelle étape', vide: 'Aucune étape.', ajouter: 'Ajouter une étape', nouveau: { titre: '', points: [] }, champs: [{ k: 'titre', l: 'Titre' }, { k: 'points', l: 'Détails', t: 'lignes' }] }),
        ], '/expertises'),
        groupe('Corps d’état', 'La liste des travaux coordonnés', [champ(E.C, { k: 'lots', l: 'Travaux', t: 'lignes', lignes: 10 })], '/expertises'),
      ],
    },
    {
      id: 'agence', titre: 'L’agence, l’équipe, les références', page: '/agence',
      resume: () => [(E.C.equipe || []).length + ' personnes', (E.C.references || []).length + ' références'].join(', '),
      corps: () => [
        groupe('Présentation', '', [champ(E.C, { k: 'presentation.titre', l: 'Titre' }), champ(E.C, { k: 'presentation.texte', l: 'Texte', t: 'zone', lignes: 8 }), champ(E.C, { k: 'presentation.photo', l: 'Photo (portrait)', t: 'photo' }), champ(E.C, { k: 'presentation.photo_2', l: 'Photo large (sous le texte)', t: 'photo' })], '/agence'),
        groupe('Garanties', 'Les points résumés sous « À propos »', [champ(E.C, { k: 'garanties.titre', l: 'Titre' }), champ(E.C, { k: 'garanties.texte', l: 'Texte', t: 'zone' }), champ(E.C, { k: 'garanties.points', l: 'Points', t: 'lignes' })], '/agence'),
        groupe('Équipe', 'Noms, rôles et portraits', [
          champ(E.C, { k: 'affichage.equipe', l: 'Afficher l’équipe', t: 'case' }),
          editeurListe('equipe', { titre: 'nom', sansTitre: 'Nouvelle personne', photo: 'photo', sous: (p) => p.role || '', vide: 'Personne pour l’instant.', ajouter: 'Ajouter une personne', nouveau: { nom: '', role: '', photo: '' }, champs: [{ k: 'nom', l: 'Nom' }, { k: 'role', l: 'Rôle' }, { k: 'photo', l: 'Portrait', ex: 'sans photo : les initiales', t: 'photo' }] }),
        ], '/agence'),
        groupe('Références', 'Noms ou logos des clients', [
          champ(E.C, { k: 'affichage.references', l: 'Afficher les références', t: 'case' }),
          el('p', { class: 'aide', text: 'Sans logo, le nom s’affiche. Un logo sur fond transparent (PNG ou SVG) rend mieux.' }),
          editeurListe('references', { titre: 'nom', sansTitre: 'Nouvelle référence', photo: 'logo', vide: 'Aucune référence.', ajouter: 'Ajouter une référence', nouveau: { nom: '', logo: '' }, champs: [{ k: 'nom', l: 'Nom' }, { k: 'logo', l: 'Logo', t: 'photo' }] }),
        ], '/agence'),
      ],
    },
    {
      id: 'demandes', titre: 'Demandes de contact', page: '/contact',
      resume: () => (E.nouvelles ? E.nouvelles + (E.nouvelles > 1 ? ' nouvelles demandes' : ' nouvelle demande') : (E.C.contact && E.C.contact.actif !== false ? 'Formulaire ouvert' : 'Formulaire fermé')),
      corps: () => [
        listeCommandes(),
        el('details', { class: 'item' }, el('summary', {}, el('span', { class: 'txt' }, el('b', { text: 'Réglages du formulaire' }), el('span', { class: 's', text: 'Ouverture, délai de réponse, e-mail' }))),
          el('div', { class: 'item-corps' },
            champ(E.C, { k: 'contact.actif', l: 'Accepter les demandes en ligne', t: 'case' }),
            champ(E.C, { k: 'contact.delai_reponse', l: 'Délai de réponse annoncé', ex: 'facultatif', ph: 'Ex. : 48 heures' }),
            champ(E.C, { k: 'contact.types', l: 'Types de locaux proposés', t: 'lignes' }),
            champ(E.C, { k: 'contact.confirmation', l: 'Message affiché après l’envoi', t: 'zone' }),
            champ(E.C, { k: 'contact.cle_web3forms', l: 'Clé Web3Forms', ex: 'pour recevoir les demandes par e-mail' }),
            champ(E.C, { k: 'contact.email', l: 'E-mail de secours', ex: 'utilisé si la clé est vide', type: 'email' }))),
      ],
    },
    {
      id: 'abonnements', titre: 'Abonnement mensuel', page: '/expertises', seulementSi: () => !!(E.C.abonnements && typeof E.C.abonnements === 'object'),
      resume: () => ((E.C.abonnements || {}).formules || []).map((f) => f.nom).filter(Boolean).join(', '),
      corps: () => [
        groupe('Présentation', 'Le bloc s’affiche sur la page des offres', [champ(E.C, { k: 'abonnements.titre', l: 'Titre' }), champ(E.C, { k: 'abonnements.intro', l: 'Texte', t: 'zone', lignes: 4 }), champ(E.C, { k: 'abonnements.note', l: 'Petite note sous les formules', t: 'zone', lignes: 3 })], '/expertises'),
        groupe('Formules', 'Nom, prix et ce qui est compris', [
          editeurListe('abonnements.formules', { titre: 'nom', sansTitre: 'Nouvelle formule', sous: (f) => [f.prix, f.periode].filter(Boolean).join(' '), vide: 'Aucune formule.', ajouter: 'Ajouter une formule', nouveau: { nom: '', prix: '', periode: 'par mois', description: '', points: [], recommande: false },
            champs: [{ k: 'nom', l: 'Nom' }, { k: 'prix', l: 'Prix', ph: 'Ex. : 19 €' }, { k: 'periode', l: 'Période', ph: 'Ex. : par mois' }, { k: 'description', l: 'Phrase de présentation', t: 'zone', lignes: 3 }, { k: 'points', l: 'Ce qui est compris', t: 'lignes' }, { k: 'recommande', l: 'Mettre en avant (Recommandée)', t: 'case' }] }),
        ], '/expertises'),
      ],
    },
    {
      id: 'libelles', titre: 'Titres et libellés', page: '/', seulementSi: () => !!(E.C.libelles && typeof E.C.libelles === 'object'),
      resume: () => { const n = Object.values(E.C.libelles || {}).filter((v) => typeof v === 'string').length; return n ? n + ' libellé(s) personnalisé(s)' : 'Libellés par défaut'; },
      corps: () => [
        el('p', { class: 'aide', text: 'Les mots du menu, des titres de rubrique et du formulaire. Laissez vide pour garder le texte grisé. Pour un champ du formulaire, effacez son nom pour le retirer.' }),
        ...LIBELLES_GROUPES.map(([titre, cles]) => groupe(titre, '', el('div', { class: 'grille' }, cles.map((k) => champ(E.C, { k: 'libelles.' + k, l: LIBELLES_NOMS[k] || k, ph: LIBELLES[k] }))))),
      ],
    },
    {
      id: 'pages', titre: 'Pages par métier', page: '/', seulementSi: () => Array.isArray(E.C.pages_metier),
      resume: () => ((E.C.pages_metier || []).filter((x) => x.visible !== false).map((x) => x.nom).filter(Boolean).join(', ') || 'Aucune page'),
      corps: () => [
        el('p', { class: 'aide', text: 'Une page par métier (restaurant, plombier…), avec sa démonstration, ses questions et son prix de départ. L’adresse de la page est « /identifiant ». Les questions et réponses de chaque page se modifient avec Claude, pour garder une forme régulière.' }),
        editeurListe('pages_metier', {
          titre: 'nom', sansTitre: 'Nouvelle page', photo: 'photo', sous: (x) => [x.id ? '/' + x.id : '', x.prix, x.visible === false ? 'masquée' : ''].filter(Boolean).join(' · '),
          vide: 'Aucune page par métier.', ajouter: 'Ajouter une page', nouveau: { id: '', nom: '', titre: '', description: '', accroche: '', texte: '', prix: '', points: [], demo: '', demo_texte: '', bouton: '', photo: '', questions: [], liste: true, visible: true },
          ouvert: (x) => { if (x.id) montrer('/' + x.id); }, apres: (x) => { assurerIds(E.C); if (x.id && E.page !== '/' + x.id) montrer('/' + x.id); },
          champs: [
            { k: 'nom', l: 'Nom (menu et liens)' }, { k: 'id', l: 'Adresse de la page', ex: 'minuscules et tirets, 3 signes au moins, ex. site-restaurant', ph: 'site-restaurant' },
            { k: 'titre', l: 'Titre de la page' }, { k: 'accroche', l: 'Phrase d’accroche', t: 'zone', lignes: 3 }, { k: 'prix', l: 'Prix de départ', ph: 'Ex. : À partir de 590 €, une fois' },
            { k: 'texte', l: 'Texte', t: 'zone', lignes: 7 }, { k: 'points', l: 'Ce qui est compris', t: 'lignes' }, { k: 'photo', l: 'Photo', t: 'photo' },
            { k: 'demo', l: 'Lien de la démonstration', ex: 'facultatif', ph: '/demos/restaurant-exemple' }, { k: 'demo_texte', l: 'Texte du bouton de la démonstration', ph: 'Essayer la démonstration' }, { k: 'bouton', l: 'Texte du bouton « contact »', ph: 'Demander ma maquette gratuite' },
            { k: 'description', l: 'Description pour Google', t: 'zone', lignes: 3 }, { k: 'liste', l: 'Dans le pied de page et la liste « par métier »', t: 'case' }, { k: 'visible', l: 'Afficher sur le site', t: 'case' },
          ],
        }),
      ],
    },
    {
      id: 'comparaison', titre: 'Comparaison avec un constructeur en ligne', page: '/expertises', seulementSi: () => !!(E.C.comparaison && typeof E.C.comparaison === 'object'),
      resume: () => (((E.C.comparaison || {}).lignes || []).length + ' lignes'),
      corps: () => [
        groupe('Présentation', 'Le tableau s’affiche sur la page des offres, dans l’onglet « Comparer »', [champ(E.C, { k: 'comparaison.actif', l: 'Afficher la comparaison sur le site', t: 'case' }), champ(E.C, { k: 'comparaison.titre', l: 'Titre' }), champ(E.C, { k: 'comparaison.intro', l: 'Texte', t: 'zone', lignes: 4 }), champ(E.C, { k: 'comparaison.note', l: 'Petite note sous le tableau', t: 'zone', lignes: 3 })], '/expertises'),
        groupe('Lignes', 'Critère, colonne A, colonne B', [
          editeurListe('comparaison.lignes', { titre: 'critere', sansTitre: 'Nouvelle ligne', vide: 'Aucune ligne.', ajouter: 'Ajouter une ligne', nouveau: { critere: '', a: '', b: '' }, champs: [{ k: 'critere', l: 'Critère' }, { k: 'a', l: 'Constructeur en ligne', t: 'zone', lignes: 3 }, { k: 'b', l: 'Mon offre', t: 'zone', lignes: 3 }] }),
        ], '/expertises'),
      ],
    },
    {
      id: 'visites', titre: 'Visites du site', page: '/',
      resume: () => 'Pages vues, sans cookie',
      corps: () => [blocVisites()],
    },
    {
      id: 'motdepasse', titre: 'Mot de passe', page: '/',
      resume: () => 'Changer le mot de passe de cette page',
      corps: () => [blocMotDePasse()],
    },
    {
      id: 'infos', titre: 'Coordonnées, logo et mentions', page: '/contact',
      resume: () => [E.C.agence.email, E.C.agence.telephone, E.C.agence.ville].filter(Boolean).join(', '),
      corps: () => [
        el('div', { class: 'grille' }, [
          { k: 'agence.nom', l: 'Nom' }, { k: 'agence.activite', l: 'Activité', ph: 'Ex. : Maître d’œuvre et contractant général' },
          { k: 'agence.zone', l: 'Zone d’intervention' }, { k: 'agence.telephone', l: 'Téléphone', type: 'tel' },
          { k: 'agence.email', l: 'E-mail', type: 'email' }, { k: 'agence.adresse', l: 'Adresse' },
          { k: 'agence.code_postal', l: 'Code postal' }, { k: 'agence.ville', l: 'Ville' },
          { k: 'agence.linkedin', l: 'Lien LinkedIn', type: 'url' }, { k: 'agence.instagram', l: 'Lien Instagram', type: 'url' },
        ].map((d) => champ(E.C, d))),
        champ(E.C, { k: 'agence.nom_image', l: 'Logo en haut du site', ex: 'sur fond transparent', t: 'photo' }),
        champ(E.C, { k: 'agence.nom_image_blanc', l: 'Logo clair (pied de page)', ex: 'version blanche', t: 'photo' }),
        champ(E.C, { k: 'agence.logo', l: 'Monogramme', ex: 'icône d’onglet', t: 'photo' }),
        champ(E.C, { k: 'agence.description_google', l: 'Description pour Google', t: 'zone' }),
        el('h3', { text: 'Mentions légales', style: 'font-size:1.125rem' }),
        el('div', { class: 'grille' }, [{ k: 'mentions.raison_sociale', l: 'Raison sociale' }, { k: 'mentions.forme', l: 'Forme et capital' }, { k: 'mentions.rcs', l: 'Immatriculation', ph: 'Ex. : 123 456 789 RCS Nantes' }, { k: 'mentions.tva', l: 'TVA', ex: 'facultatif', ph: 'Ex. : TVA non applicable, art. 293 B du CGI' }, { k: 'mentions.adresse', l: 'Adresse du siège' }, { k: 'mentions.directeur_publication', l: 'Directeur de la publication' }, { k: 'mentions.email', l: 'E-mail de contact', type: 'email' }, { k: 'mentions.mediateur', l: 'Médiateur de la consommation', ex: 'si vous travaillez pour des particuliers' }].map((d) => champ(E.C, d))),
        champ(E.C, { k: 'credits_photos', l: 'Crédit des photos', ex: 'à mettre à jour quand les photos d’illustration sont remplacées', t: 'zone' }),
      ],
    },
  ];
}
let PANNEAUX = [];

/* ---------- Démonstration en un seul fichier : le site d'abord, puis la page de modification ---------- */
const optsDemo = (extra) => ({ maquette: true, urlPolice: (f) => DEMO.polices[f] || '', css: DEMO.css, js: DEMO.js, apiContact: '', apercu: true, ...extra });
let pageDemo = '/';
function vueSiteDemo() {
  let v = document.getElementById('demo-site');
  if (!v) {
    v = el('div', { id: 'demo-site', class: 'apercu-plein', role: 'region', 'aria-label': 'Aperçu du site' },
      el('div', { class: 'barre' }, el('b', { text: 'Le site' }),
        el('button', { type: 'button', class: 'btn petit', text: 'Essayer la page de modification', onclick: () => { v.hidden = true; document.body.style.overflow = ''; } })),
      el('iframe', { title: 'Le site' }));
    document.body.append(v);
  }
  /* le site tel qu'il est « en ligne » dans la démonstration : la dernière version enregistrée */
  v.querySelector('iframe').srcdoc = rendrePage(memo.lire('contenu', copie(DEMO.contenu)), pageDemo, optsDemo()).html;
  v.hidden = false; document.body.style.overflow = 'hidden';
}
/* Les pages affichées dans un cadre (aperçu, démonstration) demandent à changer de page */
window.addEventListener('message', (e) => {
  const m = e.data || {};
  if (!m.agence) return;
  const demo = document.getElementById('demo-site');
  const dansDemo = demo && e.source === demo.querySelector('iframe').contentWindow;
  if (m.agence === 'aller' && typeof m.chemin === 'string') {
    if (dansDemo) { pageDemo = m.chemin; vueSiteDemo(); demo.querySelector('iframe').addEventListener('load', function f() { this.removeEventListener('load', f); try { this.contentWindow.scrollTo(0, 0); } catch (x) { /* rien */ } }); }
    else if (E.C) { E.page = m.chemin; rendreApercu(true); }
  }
});
let siteMontre = false;

/* ---------- Aperçu en direct ---------- */
let cadres = [];
function rendreApercu(enHaut) {
  assurerIds(E.C);
  const o = DEMO
    ? optsDemo({ calme: true })
    : { maquette: E.maquette, cssHref: '/assets/site.css', jsHref: '/assets/site.js', apiContact: '', apercu: true, calme: true };
  const page = rendrePage(E.C, E.page || '/', o).html;
  cadres.forEach((f) => {
    let y = 0; try { y = enHaut ? 0 : f.contentWindow.scrollY; } catch (e) { /* rien */ }
    f.onload = () => { try { f.contentWindow.scrollTo(0, y); } catch (e) { /* rien */ } };
    f.srcdoc = page;
  });
}
let minuteur;
function changement() {
  majBarre(); majResumes();
  clearTimeout(minuteur); minuteur = setTimeout(rendreApercu, 450);
}
function majResumes() { PANNEAUX.forEach((p) => { const r = document.getElementById('res-' + p.id); if (r) r.textContent = p.resume(); }); }

/* ---------- Barre d'enregistrement ---------- */
let barre, etatBarre, bEnr, bAnn;
function majBarre() {
  const m = modifie();
  etatBarre.textContent = m ? 'Modifications non enregistrées' : 'Tout est enregistré';
  etatBarre.className = 'etat ' + (m ? 'modifie' : 'ok');
  bEnr.disabled = !m; bAnn.textContent = m ? 'Annuler' : 'Revenir en arrière'; bAnn.title = m ? 'Annuler les modifications non enregistrées' : 'Rétablir la version enregistrée juste avant';
}
async function enregistrer() {
  bEnr.disabled = true; bEnr.textContent = 'Enregistrement…';
  try {
    assurerIds(E.C);
    await api.enregistrer(E.C);
    E.base = JSON.stringify(E.C);
    toast(DEMO ? (memo.persiste ? 'Enregistré (démonstration : dans ce navigateur seulement).' : stockageOk ? 'Enregistré pour cette visite seulement : la mémoire du navigateur est pleine. Retirez des photos pour que ça reste.' : 'Enregistré pour cette visite seulement : cet aperçu ne garde rien après fermeture. Ouvrez le fichier dans un navigateur pour garder vos essais.') : 'Enregistré. Le site est à jour d’ici une minute.');
  } catch (x) {
    if (x.session) { toast('Session expirée : reconnectez-vous, vos modifications sont gardées.'); memo.ecrire('brouillon', E.C); ecranConnexion(x.message); return; }
    toast(x.message);
  }
  bEnr.textContent = 'Enregistrer'; majBarre();
}
async function annuler() {
  if (modifie()) { E.C = JSON.parse(E.base); dessinerEditeur(); rendreApercu(); toast('Modifications annulées.'); return; }
  if (!bAnn.classList.contains('confirmer')) { bAnn.classList.add('confirmer'); bAnn.textContent = 'Confirmer'; setTimeout(() => { bAnn.classList.remove('confirmer'); majBarre(); }, 4000); return; }
  bAnn.classList.remove('confirmer');
  try { E.C = await api.annuler(); E.base = JSON.stringify(E.C); dessinerEditeur(); rendreApercu(); toast('Version précédente rétablie.'); } catch (x) { toast(x.message); }
  majBarre();
}

/* ---------- Écran principal ---------- */
let editeur;
function dessinerEditeur() {
  editeur.replaceChildren(
    el('section', { class: 'intro-edit' },
      el('h1', { text: 'Bonjour' }),
      el('p', { class: 'aide', text: 'Touchez une rubrique pour la modifier, puis « Enregistrer » en bas de l’écran. L’aperçu montre le résultat avant d’enregistrer.' })),
    ...PANNEAUX.map((p) => {
      const d = el('details', { class: 'pan', id: 'pan-' + p.id, open: E.ouverts.has(p.id) },
        el('summary', {}, el('h2', { text: p.titre }), el('span', { class: 'resume', id: 'res-' + p.id, text: p.resume() }), el('span', { class: 'chev', 'aria-hidden': 'true' })));
      let rempli = false;
      const remplir = () => { if (rempli) return; rempli = true; d.append(el('div', { class: 'pan-corps' }, p.corps())); };
      if (d.open) remplir();
      d.addEventListener('toggle', () => { if (d.open) { remplir(); E.ouverts.add(p.id); if (p.page) montrer(p.page); } else E.ouverts.delete(p.id); });
      return d;
    }));
}

function ecranPrincipal() {
  racine.replaceChildren();
  const nom = E.C.agence.nom || 'Votre site';
  document.title = nom + ' : page de modification';
  PANNEAUX = panneaux().filter((p) => !p.seulementSi || p.seulementSi());
  appliquerTheme(E.C);
  const plein = el('div', { class: 'apercu-plein', hidden: true },
    el('div', { class: 'barre' }, el('b', { text: 'Aperçu' }), el('button', { type: 'button', class: 'btn sec petit', text: 'Fermer l’aperçu', onclick: () => { plein.hidden = true; document.body.style.overflow = ''; } })),
    el('iframe', { title: 'Aperçu du site', sandbox: 'allow-scripts allow-same-origin allow-popups' }));
  editeur = el('div', { class: 'editeur' });
  const colonne = el('aside', { class: 'apercu-col', 'aria-label': 'Aperçu du site' },
    el('div', { class: 'tel-cadre' }, el('p', { text: 'Aperçu, tel que sur un téléphone' }), el('iframe', { title: 'Aperçu du site', sandbox: 'allow-scripts allow-same-origin allow-popups' })));
  cadres = [colonne.querySelector('iframe'), plein.querySelector('iframe')];

  etatBarre = el('span', { class: 'etat' });
  bEnr = el('button', { type: 'button', class: 'btn', text: 'Enregistrer', onclick: enregistrer });
  bAnn = el('button', { type: 'button', class: 'btn danger', onclick: annuler });
  barre = el('div', { class: 'barre-enr', role: 'region', 'aria-label': 'Enregistrement' }, el('div', { class: 'in' }, etatBarre,
    el('button', { type: 'button', class: 'btn sec btn-apercu', text: 'Aperçu', onclick: () => { plein.hidden = false; document.body.style.overflow = 'hidden'; rendreApercu(); } }),
    bAnn, bEnr));

  racine.append(
    el('header', { class: 'haut' }, el('div', { class: 'haut-in' },
      el('div', { class: 'haut-titre' }, el('b', { text: nom }), el('span', { text: 'Page de modification' })),
      el('a', { class: 'btn', href: DEMO ? '#' : '/', target: DEMO ? null : '_blank', rel: 'noopener', text: 'Voir le site', onclick: DEMO ? (e) => { e.preventDefault(); plein.hidden = false; rendreApercu(); } : null }),
      el('button', { type: 'button', class: 'btn', text: 'Se déconnecter', onclick: async () => { if (modifie() && !confirm2()) return; await api.deconnexion(); ecranConnexion(); } }))),
    DEMO ? el('aside', { class: 'bandeau', 'aria-label': 'Information', text: 'Démonstration : vos essais restent sur cet appareil, rien n’est publié.' })
      : (E.maquette ? el('aside', { class: 'bandeau', 'aria-label': 'Information', text: 'Le site est encore en mode proposition : les demandes ne sont pas envoyées.' }) : ''),
    el('main', { class: 'cadre' }, editeur, colonne), barre, plein);
  dessinerEditeur(); majBarre(); rendreApercu();
  api.demandes().then((L) => { E.nouvelles = L.filter((c) => c.statut === 'nouvelle').length; majResumes(); }).catch(() => {});
}
let avertiDeco = false;
function confirm2() { if (avertiDeco) return true; avertiDeco = true; toast('Des modifications ne sont pas enregistrées. Touchez encore « Se déconnecter » pour les abandonner.'); return false; }

function normaliser(C) {
  ['agence', 'annonce', 'accueil', 'presentation', 'garanties', 'affichage', 'contact', 'mentions', 'theme'].forEach((k) => { if (!C[k] || typeof C[k] !== 'object' || Array.isArray(C[k])) C[k] = {}; });
  ['chiffres', 'metiers', 'etapes', 'lots', 'secteurs', 'realisations', 'equipe', 'references'].forEach((k) => { if (!Array.isArray(C[k])) C[k] = []; });
  C.realisations.forEach((x) => { if (!Array.isArray(x.photos)) x.photos = x.photos ? [x.photos] : []; });
  return C;
}
function appliquerTheme(C) {
  let st = document.getElementById('theme-boutique');
  if (!st) { st = el('style', { id: 'theme-boutique' }); document.head.append(st); }
  st.textContent = cssPolices(DEMO ? (f) => DEMO.polices[f] || '' : (f) => '/fonts/' + f) + '\n:root{--bleu:#262a59;--bleu-fonce:#15172e;--bleu-pale:#ecebf3;--paille:#f8e3b0}';
  const meta = document.querySelector('meta[name=theme-color]'); if (meta) meta.setAttribute('content', '#262a59');
  const icone = document.querySelector('link[rel=icon]'); if (icone && C && (C.agence || C.logo)) icone.setAttribute('href', favicon(C.agence ? C : { agence: { logo: C.logo } }));
}
async function demarrer() {
  try {
    const r = await api.charger();
    if (!r) { ecranConnexion(); return; }
    const brouillon = memo.lire('brouillon', null);
    E.C = normaliser(r.contenu); E.base = JSON.stringify(E.C); E.maquette = !!r.maquette;
    if (brouillon && !DEMO) { E.C = normaliser(brouillon); memo.ecrire('brouillon', null); toast('Vos modifications non enregistrées ont été récupérées.'); }
    ecranPrincipal();
  } catch (x) {
    racine.replaceChildren(el('main', { class: 'connexion' }, el('div', { class: 'erreur', text: 'Impossible de charger la page de modification : ' + x.message + ' Vérifiez la connexion internet et rechargez la page.' })));
  } finally {
    /* démonstration : on montre d'abord le site, une seule fois */
    if (DEMO && DEMO.siteDabord && !siteMontre) { siteMontre = true; vueSiteDemo(); }
  }
}

window.addEventListener('beforeunload', (e) => { if (E.C && modifie()) { e.preventDefault(); e.returnValue = ''; } });
demarrer();
