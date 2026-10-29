/*
  Serveur du site de l'agence (Cloudflare Worker).
  - Toutes les pages sont rendues à chaque visite depuis le contenu enregistré (KV « CONTENU »).
  - /admin : la page de modification (fichiers statiques dans public/admin), protégé par mot de passe.
  - /api/… : lecture et enregistrement du contenu, envoi de photos, demandes de contact reçues.
  Secrets à définir : ADMIN_HASH (npm run mot-de-passe), SESSION_SECRET (texte aléatoire). Le mot de passe se change ensuite depuis la page de modification (clé KV admin:hash, prioritaire sur ADMIN_HASH).
  Variable : MAQUETTE = "oui" tant que le site n'est pas validé (bandeau + formulaire en démonstration).
*/
import { rendrePage, routes, libellesDemande, donnees, fluxRss } from '../public/assets/rendu.js';
import initial from '../contenu-initial.json';

const COOKIE = 'boutique_session';
const DUREE_SESSION = 30 * 24 * 3600;
const enc = new TextEncoder();

/* ---------- Petits outils ---------- */
const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra },
});
const html = (corps, status = 200) => new Response(corps, {
  status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' },
});
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const deB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
function egal(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const ip = (req) => req.headers.get('CF-Connecting-IP') || 'local';
const estMaquette = (env) => String(env.MAQUETTE || '').toLowerCase() === 'oui';

async function lireContenu(env, frais) {
  const c = await env.CONTENU.get('contenu', frais ? { type: 'json' } : { type: 'json', cacheTtl: 30 });
  return c || structuredClone(initial);
}

/* ---------- Limite de tentatives (connexion, demandes) ---------- */
async function essais(env, cle) { return parseInt((await env.CONTENU.get('limite:' + cle)) || '0', 10); }
async function compter(env, cle, n, secondes) { await env.CONTENU.put('limite:' + cle, String(n + 1), { expirationTtl: Math.max(60, secondes) }); }
async function limite(env, cle, max, secondes) {
  const n = await essais(env, cle);
  if (n >= max) return false;
  await compter(env, cle, n, secondes);
  return true;
}

/* ---------- Mot de passe et session ---------- */
/* L'empreinte choisie depuis la page de modification (KV) l'emporte sur le Secret ADMIN_HASH */
async function empreinteActive(env) { return (await env.CONTENU.get('admin:hash')) || String(env.ADMIN_HASH || ''); }
async function fabriquerEmpreinte(mdp) {
  const sel = crypto.getRandomValues(new Uint8Array(16)), iter = 10000; // limite de calcul de l'offre gratuite Cloudflare
  const cle = await crypto.subtle.importKey('raw', enc.encode(mdp), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sel, iterations: iter }, cle, 256);
  return `pbkdf2$${iter}$${btoa(String.fromCharCode(...sel))}$${btoa(String.fromCharCode(...new Uint8Array(bits)))}`;
}
async function verifierMotDePasse(env, mdp) {
  const parts = (await empreinteActive(env)).split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return null;
  const iter = parseInt(parts[1], 10);
  const cle = await crypto.subtle.importKey('raw', enc.encode(mdp), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: deB64(parts[2]), iterations: iter }, cle, 256);
  return egal(btoa(String.fromCharCode(...new Uint8Array(bits))), parts[3]);
}
async function signer(env, texte) {
  const cle = await crypto.subtle.importKey('raw', enc.encode(env.SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', cle, enc.encode(texte)));
}
async function connecte(req, env) {
  if (!env.SESSION_SECRET) return false;
  const m = (req.headers.get('Cookie') || '').match(new RegExp(COOKIE + '=([0-9]+)\\.([A-Za-z0-9_-]+)'));
  if (!m || +m[1] < Date.now() / 1000) return false;
  return egal(await signer(env, 'boutique.' + m[1]), m[2]);
}
async function cookieSession(env) {
  const exp = Math.floor(Date.now() / 1000) + DUREE_SESSION;
  return `${COOKIE}=${exp}.${await signer(env, 'boutique.' + exp)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${DUREE_SESSION}`;
}

/* ---------- Vérification du contenu envoyé par la page de modification ---------- */
const CLES_OBJETS = ['agence', 'annonce', 'accueil', 'presentation', 'garanties', 'affichage', 'contact', 'mentions'];
const CLES_LISTES = ['chiffres', 'metiers', 'etapes', 'secteurs', 'realisations', 'actualites', 'equipe', 'references', 'engagements', 'redirections'];
/* Clés facultatives : gardées telles qu'elles sont enregistrées quand le contenu envoyé ne les a pas, sinon remplacées (sans elles, un contenu enregistré perdrait ses formules d'abonnement et ses libellés) */
const OBJETS_FACULTATIFS = ['abonnements', 'libelles', 'comparaison'];
const LISTES_FACULTATIVES = ['pages_metier'];
/* Réglés par Grégoire, jamais modifiables depuis la page de modification */
const CLES_FIXES = ['_schema', 'theme', 'reglages'];
const STATUTS = ['nouvelle', 'rappelee', 'devis', 'signee', 'classee'];
function nettoyer(c, actuel) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) throw new Error('Contenu illisible.');
  const out = {};
  CLES_OBJETS.forEach((k) => { out[k] = c[k] && typeof c[k] === 'object' && !Array.isArray(c[k]) ? c[k] : (actuel[k] || {}); });
  CLES_LISTES.forEach((k) => { out[k] = Array.isArray(c[k]) ? c[k].filter((x) => x && typeof x === 'object').slice(0, 200) : (actuel[k] || []); });
  OBJETS_FACULTATIFS.forEach((k) => {
    if (c[k] && typeof c[k] === 'object' && !Array.isArray(c[k])) out[k] = c[k]; else if (actuel[k]) out[k] = actuel[k];
  });
  LISTES_FACULTATIVES.forEach((k) => {
    if (Array.isArray(c[k])) out[k] = c[k].filter((x) => x && typeof x === 'object').slice(0, 40); else if (actuel[k]) out[k] = actuel[k];
  });
  out.lots = Array.isArray(c.lots) ? c.lots.filter((x) => typeof x === 'string').map((x) => x.slice(0, 200)).slice(0, 60) : (actuel.lots || []);
  out.credits_photos = String(c.credits_photos || '').slice(0, 800);
  CLES_FIXES.forEach((k) => { out[k] = actuel[k] || {}; });
  return out;
}

/* ---------- Redirections permanentes (301) ----------
   1. La liste « redirections » du contenu : { de: '/ancienne-adresse/', vers: '/nouvelle' } (avec ou sans « / » final).
   2. Les adresses types de WordPress : /feed/, /category/…, /tag/…, /author/…, /page/2/.
   3. Une adresse qui finit par « / » renvoie vers la même sans « / » (une seule adresse par page). */
function redirection(C, p) {
  let chemin = p;
  try { chemin = decodeURI(p); } catch (e) { /* adresse mal codée : on la garde telle quelle */ }
  const sans = (x) => (x.length > 1 ? x.replace(/\/+$/, '') : x);
  const ok = (v) => /^(\/[^\s]*|https:\/\/\S+)$/.test(String(v || ''));
  /* Celles du contenu enregistré, puis celles du fichier de départ (déployées avec le code : valables même si la mémoire du site a déjà un contenu) */
  const R = [...(Array.isArray(C.redirections) ? C.redirections : []), ...(Array.isArray(initial.redirections) ? initial.redirections : [])].find((r) => r && ok(r.vers) && typeof r.de === 'string' && sans(r.de.trim()) === sans(chemin));
  if (R && sans(R.vers) !== sans(chemin)) return R.vers;
  const D = donnees(C);
  if (/^\/(feed|rss|comments\/feed)\/?$/.test(chemin)) return D.actualites.length ? '/actualites.xml' : '/';
  if (/^\/(category|categorie|tag|etiquette)\//.test(chemin)) return D.actualites.length ? '/actualites' : '/realisations';
  if (/^\/(author|auteur)\/|^\/page\/\d+\/?$/.test(chemin)) return '/';
  if (chemin.length > 1 && chemin.endsWith('/')) return sans(p);
  return '';
}

/* ---------- IndexNow : prévenir Bing (et la recherche de ChatGPT, qui s'appuie sur Bing), Yandex, Seznam… dès qu'une page change ----------
   Seulement site ouvert (MAQUETTE « non »), adresse définitive connue (reglages.url) et Secret INDEXNOW_KEY posé. Google n'utilise pas IndexNow : pour lui, le plan du site daté suffit. */
/* Pages touchées par un enregistrement, sans rendre les pages (calcul léger : l'offre gratuite limite le temps de calcul) */
const PAGES_PAR_CLE = { accueil: ['/'], chiffres: ['/', '/agence'], etapes: ['/', '/expertises'], references: ['/', '/agence'], metiers: ['/', '/expertises'], lots: ['/expertises'],
  abonnements: ['/expertises'], comparaison: ['/expertises'], presentation: ['/agence'], equipe: ['/agence'], garanties: ['/agence'], engagements: ['/engagements'],
  contact: ['/contact'], mentions: ['/mentions-legales', '/confidentialite'], secteurs: ['/realisations'] };
const CLES_PARTOUT = ['agence', 'annonce', 'libelles', 'affichage', 'credits_photos', 'theme'];
function pagesChangees(avant, apres) {
  const pages = new Set(), egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  if (CLES_PARTOUT.some((k) => !egal(avant[k], apres[k]))) return new Set(routes(apres).filter((r) => !r.includes('?')));
  Object.entries(PAGES_PAR_CLE).forEach(([k, L]) => { if (!egal(avant[k], apres[k])) L.forEach((r) => pages.add(r)); });
  const A = donnees(avant), B = donnees(apres);
  const parId = (L0, L1, adresse, aussi) => {
    const vieux = new Map(L0.map((x) => [x.id, JSON.stringify(x)])), ids = new Set([...L0, ...L1].map((x) => x.id));
    ids.forEach((id) => { const n = L1.find((x) => x.id === id); if (!n || vieux.get(id) !== JSON.stringify(n)) { if (n) pages.add(adresse(id)); aussi(n || L0.find((x) => x.id === id)).forEach((r) => pages.add(r)); } });
  };
  parId(A.realisations, B.realisations, (id) => '/realisations/' + id, () => ['/realisations', '/']);
  parId(A.actualites, B.actualites, (id) => '/actualites/' + id, (x) => ['/actualites', '/', ...(x && x.realisation ? ['/realisations/' + x.realisation] : [])]);
  parId(A.pages, B.pages, (id) => '/' + id, () => ['/expertises']);
  const existantes = new Set(routes(apres));
  return new Set([...pages].filter((r) => existantes.has(r)));
}
/* Après un enregistrement : date de modification des pages (plan du site), puis IndexNow */
async function apresModification(env, avant, apres) {
  const pages = pagesChangees(avant, apres);
  if (!pages.size) return;
  const dates = (await env.CONTENU.get('lastmod', { type: 'json' })) || {}, jour = jourParis();
  pages.forEach((r) => { dates[r] = jour; });
  await env.CONTENU.put('lastmod', JSON.stringify(dates));
  await prevenirMoteurs(env, apres, pages);
}
async function prevenirMoteurs(env, apres, pages) {
  const base = String((apres.reglages || {}).url || '').replace(/\/$/, '');
  if (estMaquette(env) || !env.INDEXNOW_KEY || !/^https:\/\/[^/]+$/.test(base)) return;
  const urls = pages;
  const hote = new URL(base).host;
  await fetch(env.INDEXNOW_URL || 'https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, signal: AbortSignal.timeout(10000),
    body: JSON.stringify({ host: hote, key: env.INDEXNOW_KEY, keyLocation: `${base}/${env.INDEXNOW_KEY}.txt`, urlList: [...urls].slice(0, 100).map((u) => base + u) }),
  });
}

/* ---------- Mesure d'audience sans cookie ---------- */
/* Pages vues comptées par jour dans un seul enregistrement : aucun cookie, aucune adresse IP, aucun identifiant de visiteur n'est gardé. */
const ROBOTS = /bot|crawl|spider|slurp|preview|headless|monitor|lighthouse|pingdom|uptime|curl|wget|python|java|go-http|node|undici|axios/i;
const PLAFOND_VUES_JOUR = 800; /* la mémoire gratuite accepte 1 000 écritures par jour : on s'arrête avant */
const jourParis = (d) => (d || new Date()).toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
async function compterVue(env, req, chemin) {
  if (ROBOTS.test(req.headers.get('User-Agent') || 'robot') || (req.headers.get('Sec-Purpose') || '').includes('prefetch')) return;
  const cle = 'vue:' + jourParis();
  const j = (await env.CONTENU.get(cle, { type: 'json' })) || { t: 0, p: {}, s: { g: 0, d: 0, a: 0, i: 0 } };
  if (j.t >= PLAFOND_VUES_JOUR) return;
  j.t++;
  const page = j.p[chemin] != null || Object.keys(j.p).length < 40 ? chemin : '(autres)';
  j.p[page] = (j.p[page] || 0) + 1;
  /* Provenance : moteur de recherche (g), lien d'un autre site (a), adresse tapée (d), navigation dans le site (i) */
  let h = '';
  try { h = new URL(req.headers.get('Referer') || '').hostname; } catch (e) { /* pas de provenance */ }
  const s = !h ? 'd' : h === new URL(req.url).hostname ? 'i' : /(^|\.)(google|bing|duckduckgo|qwant|ecosia|yahoo)\./.test(h) ? 'g' : 'a';
  j.s[s] = (j.s[s] || 0) + 1;
  await env.CONTENU.put(cle, JSON.stringify(j), { expirationTtl: 400 * 24 * 3600 });
}
/* Les n derniers jours (le plus ancien d'abord), en jours civils de Paris */
function derniersJours(n) {
  const base = Date.parse(jourParis() + 'T12:00:00Z');
  return Array.from({ length: n }, (_, i) => new Date(base - (n - 1 - i) * 86400e3).toISOString().slice(0, 10));
}

/* ---------- Sauvegarde nocturne ---------- */
/* Chaque nuit : une copie du contenu gardée 7 nuits dans la mémoire du site. Si un stockage R2 « SAUVEGARDE » est relié (wrangler.jsonc), le contenu y est aussi copié (30 jours),
   avec les photos et vidéos (une seule fois chacune, 30 fichiers par nuit au plus). */
const NUITS_GARDEES = 7, FICHIERS_PAR_NUIT = 30;
async function sauvegarder(env) {
  const jour = jourParis();
  const etat = { jour, quand: new Date().toISOString(), kv: false, r2: null };
  const c = await env.CONTENU.get('contenu');
  if (c) { await env.CONTENU.put('sauvegarde:' + jour, c, { expirationTtl: (NUITS_GARDEES + 1) * 86400 }); etat.kv = true; }
  if (env.SAUVEGARDE) {
    const r2 = { contenu: false, fichiers: 0, restants: 0 };
    try {
      await env.SAUVEGARDE.put('contenu/' + jour + '.json', c || JSON.stringify(initial), { httpMetadata: { contentType: 'application/json' } });
      r2.contenu = true;
      for (const prefixe of ['photo:', 'video:']) {
        let curseur;
        do {
          const l = await env.CONTENU.list({ prefix: prefixe, cursor: curseur, limit: 200 });
          for (const k of l.keys) {
            const nom = 'medias/' + k.name.replace(':', '/');
            if (await env.SAUVEGARDE.head(nom)) continue;
            if (r2.fichiers >= FICHIERS_PAR_NUIT) { r2.restants++; continue; }
            const { value, metadata } = await env.CONTENU.getWithMetadata(k.name, { type: 'arrayBuffer' });
            if (!value) continue;
            await env.SAUVEGARDE.put(nom, value, { httpMetadata: { contentType: (metadata && metadata.type) || 'application/octet-stream' } });
            r2.fichiers++;
          }
          curseur = l.list_complete ? undefined : l.cursor;
        } while (curseur);
      }
      const limite30 = derniersJours(31)[0];
      const anciens = (await env.SAUVEGARDE.list({ prefix: 'contenu/' })).objects.filter((o) => o.key.slice(8, 18) < limite30).map((o) => o.key);
      if (anciens.length) await env.SAUVEGARDE.delete(anciens);
    } catch (e) { r2.erreur = String((e && e.message) || e).slice(0, 200); }
    etat.r2 = r2;
  }
  await env.CONTENU.put('etat:sauvegarde', JSON.stringify(etat));
}

/* ---------- Routes ---------- */
export default {
  async scheduled(event, env, ctx) { ctx.waitUntil(sauvegarder(env)); },
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname;
    const methode = req.method;

    try {
      /* Lien court vers le formulaire d'avis Google (agence.lien_avis) : à imprimer en QR code sur les factures, cartes, vitrine */
      if (methode === 'GET' && p === '/avis') {
        const lien = String(((await lireContenu(env)).agence || {}).lien_avis || '').trim();
        return /^https:\/\/\S+$/.test(lien) ? Response.redirect(lien, 302) : new Response('Introuvable', { status: 404 });
      }
      /* IndexNow : fichier de clé qui prouve que le site appartient bien à celui qui prévient Bing (Secret INDEXNOW_KEY) */
      if (methode === 'GET' && env.INDEXNOW_KEY && p === '/' + env.INDEXNOW_KEY + '.txt') {
        return new Response(env.INDEXNOW_KEY, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
      if (methode === 'GET' && p === '/actualites.xml') {
        const C = await lireContenu(env);
        if (!donnees(C).actualites.length) return new Response('Introuvable', { status: 404 });
        return new Response(fluxRss(C, url.origin), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' } });
      }
      /* Robots et plan du site */
      if (methode === 'GET' && p === '/robots.txt') {
        const C = await lireContenu(env), base = ((C.reglages || {}).url || url.origin).replace(/\/$/, '');
        const corps = estMaquette(env) ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nDisallow: /admin/\nSitemap: ${base}/sitemap.xml\n`;
        return new Response(corps, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
      if (methode === 'GET' && p === '/sitemap.xml') {
        const C = await lireContenu(env), base = ((C.reglages || {}).url || url.origin).replace(/\/$/, '');
        /* Date de la dernière modification connue : celle de l'actualité, et la plus récente pour l'accueil et la liste des actualités */
        const A = donnees(C).actualites, dates = { ...((await env.CONTENU.get('lastmod', { type: 'json' })) || {}) };
        const plusRecente = (r, d) => { if (d && (!dates[r] || dates[r] < d)) dates[r] = d; };
        A.forEach((a) => plusRecente('/actualites/' + a.id, a.date));
        if (A[0]) { plusRecente('/actualites', A[0].date); plusRecente('/', A[0].date); }
        const corps = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes(C).filter((r) => !r.includes('?')).map((r) => `<url><loc>${base}${r}</loc>${dates[r] ? `<lastmod>${dates[r]}</lastmod>` : ''}</url>`).join('')}</urlset>`;
        return new Response(corps, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
      }
      /* Vidéos envoyées depuis la page de modification : lecture par morceaux (Range), indispensable pour Safari */
      if ((methode === 'GET' || methode === 'HEAD') && p.startsWith('/videos/')) {
        const id = p.slice(8);
        if (!/^[a-z0-9-]{6,40}$/.test(id)) return new Response('Introuvable', { status: 404 });
        const { value, metadata } = await env.CONTENU.getWithMetadata('video:' + id, { type: 'arrayBuffer', cacheTtl: 86400 });
        if (!value) return new Response('Introuvable', { status: 404 });
        const total = value.byteLength, type = (metadata && metadata.type) || 'video/mp4';
        const base = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' };
        const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('Range') || '');
        if (m && (m[1] || m[2])) {
          let debut = m[1] ? parseInt(m[1], 10) : Math.max(0, total - parseInt(m[2], 10));
          let fin = m[1] && m[2] ? Math.min(parseInt(m[2], 10), total - 1) : total - 1;
          if (debut >= total || debut > fin) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
          return new Response(methode === 'HEAD' ? null : value.slice(debut, fin + 1), { status: 206, headers: { ...base, 'Content-Range': `bytes ${debut}-${fin}/${total}`, 'Content-Length': String(fin - debut + 1) } });
        }
        return new Response(methode === 'HEAD' ? null : value, { headers: { ...base, 'Content-Length': String(total) } });
      }
      if (methode === 'GET' && p.startsWith('/photos/')) {
        const id = p.slice(8);
        if (!/^[a-z0-9-]{6,40}$/.test(id)) return new Response('Introuvable', { status: 404 });
        const { value, metadata } = await env.CONTENU.getWithMetadata('photo:' + id, { type: 'arrayBuffer', cacheTtl: 86400 });
        if (!value) return new Response('Introuvable', { status: 404 });
        return new Response(value, { headers: { 'Content-Type': (metadata && metadata.type) || 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
      }

      /* Demande de contact envoyée par un visiteur */
      if (methode === 'POST' && p === '/api/contact') {
        if (estMaquette(env)) return json({ ok: false, erreur: 'Site en démonstration : la demande n’a pas été envoyée.' }, 403);
        const Cc = await lireContenu(env);
        if ((Cc.contact || {}).actif === false) return json({ ok: false, erreur: 'Le formulaire est fermé.' }, 403);
        if (!(await limite(env, 'dem:' + ip(req), 10, 600))) return json({ ok: false, erreur: 'Trop de demandes, réessayez dans quelques minutes.' }, 429);
        const corps = await req.json().catch(() => null);
        const t2 = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
        const mail = corps ? t2(corps.email, 200) : '', telChiffres = corps ? String(corps.telephone || '').replace(/\D/g, '') : '';
        /* Un nom, et un moyen de répondre : e-mail ou téléphone ; celui qui est donné doit être valable */
        if (!corps || !t2(corps.nom, 120) || (!mail && !telChiffres) || (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) || (telChiffres && telChiffres.length < 6)) return json({ ok: false, erreur: 'Demande incomplète.' }, 400);
        const Lb = libellesDemande(Cc);
        const lignes = [[Lb.societe, t2(corps.societe, 160)], ['E-mail', t2(corps.email, 200)], ['Téléphone', t2(corps.telephone, 40)], [Lb.type, t2(corps.type, 80)], [Lb.surface, t2(corps.surface, 60)], [Lb.ville, t2(corps.ville, 120)], [Lb.message, t2(corps.message, 3000)]].filter(([, v]) => v);
        const id = (9999999999999 - Date.now()).toString(36) + '-' + Math.random().toString(36).slice(2, 8);
        const dem = { id, recue: new Date().toISOString(), statut: 'nouvelle', nom: t2(corps.nom, 120), societe: t2(corps.societe, 160), telephone: t2(corps.telephone, 40), email: t2(corps.email, 200), lignes };
        await env.CONTENU.put('demande:' + id, JSON.stringify(dem), { expirationTtl: 180 * 24 * 3600 });
        /* Facultatif : copie de la demande vers un outil d'automatisation (n8n), si les deux Secrets existent. Un échec ne gêne pas le visiteur. */
        if (env.N8N_WEBHOOK_URL && env.N8N_SECRET && /^https?:\/\//.test(env.N8N_WEBHOOK_URL)) {
          const envoi = { ...dem, type: t2(corps.type, 80), ville: t2(corps.ville, 120), message: t2(corps.message, 3000), site: url.origin };
          ctx.waitUntil(fetch(env.N8N_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': env.N8N_SECRET }, body: JSON.stringify(envoi), signal: AbortSignal.timeout(10000) }).catch(() => {}));
        }
        return json({ ok: true });
      }

      /* Page de modification : connexion */
      if (methode === 'POST' && p === '/api/connexion') {
        if (!(await empreinteActive(env)) || !env.SESSION_SECRET) return json({ ok: false, erreur: 'Page de modification pas encore configuré : demandez à Grégoire.' }, 503);
        const n = await essais(env, 'cnx:' + ip(req));
        if (n >= 8) return json({ ok: false, erreur: 'Trop d’essais. Réessayez dans un quart d’heure.' }, 429);
        const corps = await req.json().catch(() => ({}));
        const ok = await verifierMotDePasse(env, String(corps.motdepasse || ''));
        if (!ok) { await compter(env, 'cnx:' + ip(req), n, 900); return json({ ok: false, erreur: 'Mot de passe incorrect.' }, 401); }
        return json({ ok: true }, 200, { 'Set-Cookie': await cookieSession(env) });
      }
      if (methode === 'POST' && p === '/api/deconnexion') {
        return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });
      }

      /* Nom et couleurs de la boutique pour l'écran de connexion */
      if (methode === 'GET' && p === '/api/apparence') {
        const C = await lireContenu(env);
        return json({ ok: true, boutique: { nom: (C.agence || {}).nom || '' }, theme: C.theme || {}, logo: (C.agence || {}).logo || '' });
      }

      /* Tout le reste de /api demande d'être connecté */
      if (p.startsWith('/api/')) {
        if (!(await connecte(req, env))) return json({ ok: false, erreur: 'Session expirée : reconnectez-vous.' }, 401);

        if (methode === 'POST' && p === '/api/mot-de-passe') {
          const n = await essais(env, 'mdp:' + ip(req));
          if (n >= 8) return json({ ok: false, erreur: 'Trop d’essais. Réessayez dans un quart d’heure.' }, 429);
          const corps = await req.json().catch(() => ({}));
          const actuel = String(corps.actuel || ''), nouveau = String(corps.nouveau || '');
          if (!(await verifierMotDePasse(env, actuel))) { await compter(env, 'mdp:' + ip(req), n, 900); return json({ ok: false, erreur: 'Le mot de passe actuel est incorrect.' }, 403); }
          if (nouveau.length < 12) return json({ ok: false, erreur: 'Le nouveau mot de passe doit faire 12 caractères au moins.' }, 400);
          if (nouveau.length > 200) return json({ ok: false, erreur: 'Le nouveau mot de passe est trop long.' }, 400);
          if (nouveau === actuel) return json({ ok: false, erreur: 'Choisissez un mot de passe différent de l’actuel.' }, 400);
          await env.CONTENU.put('admin:hash', await fabriquerEmpreinte(nouveau));
          return json({ ok: true });
        }

        if (methode === 'GET' && p === '/api/contenu') {
          return json({ ok: true, contenu: await lireContenu(env, true), maquette: estMaquette(env) });
        }
        if (methode === 'PUT' && p === '/api/contenu') {
          const texte = await req.text();
          if (texte.length > 400000) return json({ ok: false, erreur: 'Contenu trop long.' }, 413);
          const actuel = await lireContenu(env, true);
          const C = nettoyer(JSON.parse(texte), actuel);
          await env.CONTENU.put('contenu:precedent', JSON.stringify(actuel));
          await env.CONTENU.put('contenu', JSON.stringify(C));
          ctx.waitUntil(apresModification(env, actuel, C).catch(() => {}));
          return json({ ok: true, enregistre: new Date().toISOString() });
        }
        if (methode === 'POST' && p === '/api/annuler') {
          const prec = await env.CONTENU.get('contenu:precedent');
          if (!prec) return json({ ok: false, erreur: 'Aucune version précédente.' }, 404);
          const actuel = await env.CONTENU.get('contenu');
          await env.CONTENU.put('contenu', prec);
          if (actuel) await env.CONTENU.put('contenu:precedent', actuel);
          if (actuel) ctx.waitUntil(apresModification(env, JSON.parse(actuel), JSON.parse(prec)).catch(() => {}));
          return json({ ok: true, contenu: JSON.parse(prec) });
        }
        if (methode === 'POST' && p === '/api/photo') {
          const type = (req.headers.get('Content-Type') || '').split(';')[0];
          if (!/^image\/(jpeg|png|webp)$/.test(type)) return json({ ok: false, erreur: 'Format de photo non accepté.' }, 415);
          const buf = await req.arrayBuffer();
          if (buf.byteLength > 3 * 1024 * 1024) return json({ ok: false, erreur: 'Photo trop lourde (3 Mo au plus).' }, 413);
          const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
          await env.CONTENU.put('photo:' + id, buf, { metadata: { type } });
          return json({ ok: true, url: '/photos/' + id });
        }
        if (methode === 'POST' && p === '/api/video') {
          const type = (req.headers.get('Content-Type') || '').split(';')[0];
          if (!/^video\/(mp4|webm)$/.test(type)) return json({ ok: false, erreur: 'Format de vidéo non accepté : MP4 ou WebM.' }, 415);
          const buf = await req.arrayBuffer();
          if (buf.byteLength > 20 * 1024 * 1024) return json({ ok: false, erreur: 'Vidéo trop lourde (20 Mo au plus).' }, 413);
          const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
          await env.CONTENU.put('video:' + id, buf, { metadata: { type } });
          return json({ ok: true, url: '/videos/' + id });
        }
        if (methode === 'GET' && p === '/api/audience') {
          const n = Math.min(90, Math.max(1, parseInt(url.searchParams.get('jours') || '30', 10) || 30));
          const jours = derniersJours(n);
          const vues = await Promise.all(jours.map((j) => env.CONTENU.get('vue:' + j, { type: 'json' })));
          return json({ ok: true, jours: jours.map((jour, i) => ({ jour, ...(vues[i] || { t: 0, p: {}, s: {} }) })), plafond: PLAFOND_VUES_JOUR, sauvegarde: await env.CONTENU.get('etat:sauvegarde', { type: 'json' }) });
        }
        if (methode === 'GET' && p === '/api/demandes') {
          const liste = await env.CONTENU.list({ prefix: 'demande:', limit: 60 });
          const dems = (await Promise.all(liste.keys.map((k) => env.CONTENU.get(k.name, { type: 'json' })))).filter(Boolean);
          return json({ ok: true, demandes: dems });
        }
        const m = p.match(/^\/api\/demandes\/([a-z0-9-]{4,40})$/);
        if (m && methode === 'PATCH') {
          const cle = 'demande:' + m[1];
          const cmd = await env.CONTENU.get(cle, { type: 'json' });
          if (!cmd) return json({ ok: false, erreur: 'Demande introuvable.' }, 404);
          const corps = await req.json().catch(() => ({}));
          if (!STATUTS.includes(corps.statut)) return json({ ok: false, erreur: 'Statut inconnu.' }, 400);
          cmd.statut = corps.statut;
          await env.CONTENU.put(cle, JSON.stringify(cmd), { expirationTtl: 180 * 24 * 3600 });
          return json({ ok: true });
        }
        return json({ ok: false, erreur: 'Adresse inconnue.' }, 404);
      }

      if (p === '/admin') return Response.redirect(url.origin + '/admin/', 301);
      if (/^\/(assets|fonts|admin)\//.test(p) || /\.[a-z0-9]{2,5}$/i.test(p)) return env.ASSETS.fetch(req);

      /* Toutes les autres adresses : les pages du site */
      if (methode === 'GET' || methode === 'HEAD') {
        const C = await lireContenu(env);
        /* Anciennes adresses (refonte d'un site, WordPress…) : redirection permanente, pour garder leur classement */
        const cible = redirection(C, p);
        if (cible) return Response.redirect(/^https:\/\//.test(cible) ? cible : url.origin + cible, 301);
        const { statut, html: page } = rendrePage(C, p + url.search, { maquette: estMaquette(env), lienAdmin: '/admin/', apiContact: '/api/contact', credit: env.CREDIT_SITE || '' });
        if (statut === 200 && methode === 'GET' && !estMaquette(env)) ctx.waitUntil(compterVue(env, req, p.replace(/\/+$/, '').slice(0, 80) || '/').catch(() => {}));
        return html(page, statut);
      }
      return new Response('Méthode non permise', { status: 405 });
    } catch (e) {
      return json({ ok: false, erreur: 'Erreur du serveur : réessayez.' }, 500);
    }
  },
};
