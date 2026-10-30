// Teste le vrai serveur sur cet ordinateur, sans rien mettre en ligne.
// Usage : node outils/tester.mjs [fichier de contenu]   (par défaut : contenu-initial.json)
// Lance « wrangler dev » avec une mémoire vide et temporaire, un mot de passe de test et MAQUETTE = non.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { verifier } from './verifier.mjs';
import { routes, libellesDemande, rendrePage } from '../public/assets/rendu.js';
import { TOUS_FICHIERS_POLICES } from '../public/assets/polices.js';

const racine = fileURLToPath(new URL('..', import.meta.url));
const fichier = resolve(process.argv[2] || join(racine, 'contenu-initial.json'));
const C = JSON.parse(readFileSync(fichier, 'utf8'));
if (verifier(C).erreurs.length) { console.error('\nLe contenu a des erreurs : lancez d’abord « npm run verifier ».\n'); process.exit(1); }

const PORT = 8799, BASE = `http://127.0.0.1:${PORT}`;
/* Faux n8n : reçoit la copie des demandes (Secrets N8N_WEBHOOK_URL et N8N_SECRET) */
const PORT_N8N = 8798, SECRET_N8N = randomBytes(12).toString('hex'), recuN8N = [];
/* Faux IndexNow : reçoit l'avis envoyé aux moteurs quand une page change */
const PORT_IDX = 8797, CLE_IDX = randomBytes(16).toString('hex'), recuIdx = [];
const fauxIdx = createServer((q, s) => { let b = ''; q.on('data', (d) => (b += d)); q.on('end', () => { recuIdx.push(b); s.end('ok'); }); }).listen(PORT_IDX, '127.0.0.1');
const fauxN8N = createServer((q, s) => { let b = ''; q.on('data', (d) => (b += d)); q.on('end', () => { recuN8N.push({ secret: q.headers['x-webhook-secret'], corps: b }); s.end('ok'); }); }).listen(PORT_N8N, '127.0.0.1');
const MDP = 'test-' + randomBytes(6).toString('hex');
const sel = randomBytes(16);
const HASH = `pbkdf2$10000$${sel.toString('base64')}$${pbkdf2Sync(MDP, sel, 10000, 32, 'sha256').toString('base64')}`;
const memoireTest = mkdtempSync(join(tmpdir(), 'agence-test-'));
const wrangler = join(racine, 'node_modules', '.bin', 'wrangler');
/* Configuration de test : celle du site, plus un stockage R2 « SAUVEGARDE » local pour essayer la copie nocturne (la vraie configuration n'est pas modifiée) */
const configTest = join(racine, '.wrangler-test.json');
const cfg = JSON.parse(readFileSync(join(racine, 'wrangler.jsonc'), 'utf8').split('\n').filter((l) => !l.trim().startsWith('//')).join('\n'));
cfg.r2_buckets = [{ binding: 'SAUVEGARDE', bucket_name: 'sauvegarde-test' }];
delete cfg.routes;
writeFileSync(configTest, JSON.stringify(cfg, null, 2));
if (process.argv[2]) {
  const r = spawnSync(wrangler, ['kv', 'key', 'put', 'contenu', '--path', fichier, '--binding', 'CONTENU', '--local', '--persist-to', memoireTest, '-c', configTest], { cwd: racine, encoding: 'utf8' });
  if (r.status !== 0) { console.error('Impossible de déposer le contenu de test :\n' + r.stderr); process.exit(1); }
}
const serveur = spawn(wrangler, ['dev', '-c', configTest, '--test-scheduled', '--port', String(PORT), '--ip', '127.0.0.1', '--persist-to', memoireTest, '--show-interactive-dev-session=false',
  '--var', 'ADMIN_HASH:' + HASH, '--var', 'SESSION_SECRET:' + randomBytes(24).toString('hex'), '--var', 'MAQUETTE:non', '--var', `N8N_WEBHOOK_URL:http://127.0.0.1:${PORT_N8N}/webhook`, '--var', 'N8N_SECRET:' + SECRET_N8N, '--var', 'INDEXNOW_KEY:' + CLE_IDX, '--var', `INDEXNOW_URL:http://127.0.0.1:${PORT_IDX}/indexnow`, '--var', 'CREDIT_SITE:Site réalisé par Essai|https://exemple.fr'],
{ cwd: racine, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
let journal = '';
serveur.stdout.on('data', (d) => { journal += d; }); serveur.stderr.on('data', (d) => { journal += d; });
const arreter = () => { try { fauxN8N.close(); fauxIdx.close(); } catch (e) { /* déjà fermé */ } try { process.kill(-serveur.pid, 'SIGTERM'); } catch (e) { /* déjà arrêté */ } try { rmSync(memoireTest, { recursive: true, force: true }); rmSync(configTest, { force: true }); } catch (e) { /* rien */ } };
process.on('SIGINT', () => { arreter(); process.exit(130); });

let ok = 0; const echecs = [];
const verif = (cond, nom) => { if (cond) { ok++; console.log('  ok      ' + nom); } else { echecs.push(nom); console.log('  ÉCHEC   ' + nom); } };
let cookie = '';
const req = (chemin, o = {}) => fetch(BASE + chemin, { redirect: 'manual', ...o, headers: { ...(o.headers || {}), ...(cookie && o.cookie !== false ? { Cookie: cookie } : {}) } });
const corpsJson = (data) => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
async function attendre() {
  for (let i = 0; i < 90; i++) { try { const r = await fetch(BASE + '/'); if (r.status === 200) return true; } catch (e) { /* pas prêt */ } await new Promise((r) => setTimeout(r, 1000)); }
  return false;
}

async function tests() {
  console.log(`\nTest du serveur local avec ${fichier} (${C.agence.nom})\n`);
  const R = routes(C);
  let pagesOk = 0;
  for (const r of R) {
    const x = await req(r); const h = await x.text();
    if (x.status === 200 && !/undefined|NaN|\[object Object\]/.test(h.replace(/<script[\s\S]*?<\/script>/g, '')) && h.includes('</html>')) pagesOk++; else console.log('    page en défaut : ' + r + ' ' + x.status);
  }
  verif(pagesOk === R.length, `Les ${R.length} pages du site s’affichent`);
  let r = await req('/nexistepas'); verif(r.status === 404 && (await r.text()).includes('Page introuvable'), 'Adresse inconnue : page 404');
  r = await req('/'); let h = await r.text();
  verif(!h.includes('class="maquette"') && !h.includes('noindex'), 'Pas de bandeau de proposition quand MAQUETTE = non');
  if (C.abonnements) { r = await req('/expertises'); const hx = await r.text(); verif(hx.includes('class="abo-grille"') && C.abonnements.formules.every((f) => hx.includes(f.nom)), 'Les formules d’abonnement s’affichent sur la page des offres'); }
  if ((C.comparaison || {}).lignes) {
    r = await req('/expertises'); const hc = await r.text();
    verif(C.comparaison.actif === true ? hc.includes('class="cmp"') : !hc.includes('class="cmp"'), 'La comparaison n’est affichée que si elle est activée');
    const Ca = structuredClone(C); Ca.comparaison.actif = true; const ha = rendrePage(Ca, '/expertises', { maquette: false }).html;
    verif(ha.includes('class="cmp"') && Ca.comparaison.lignes.every((l) => ha.includes(l.critere.replace(/&/g, '&amp;'))) && ha.includes('id="comparaison"'), 'Activée, la comparaison s’affiche dans son chapitre');
  }
  { const hx = rendrePage(C, '/expertises', { maquette: false }).html; verif((C.theme || {}).gabarit === 'edition' ? (/class="ancres"/.test(hx) && /id="sites"/.test(hx) && (hx.match(/class="plan"/g) || []).length === (C.metiers || []).length && !/role="tablist"/.test(hx)) : !/class="ancres"/.test(hx), 'La page des offres (gabarit édition) : liens d’ancre, une tuile par offre'); }
  if ((C.pages_metier || []).length) {
    const P = C.pages_metier.filter((x) => x.visible !== false);
    let ok0 = 0;
    for (const x of P) { r = await req('/' + x.id); const hp = await r.text(); if (r.status === 200 && hp.includes('<h1>') && hp.includes('FAQPage') && (!x.demo || hp.includes(x.demo))) ok0++; else console.log('    page métier en défaut : /' + x.id + ' ' + r.status); }
    verif(ok0 === P.length, `Les ${P.length} pages par métier s’affichent (questions pour Google et démonstration)`);
    h = await (await req('/')).text(); verif(P.every((x) => h.includes('href="/' + x.id + '"')), 'Le pied de page renvoie vers chaque page par métier');
    h = await (await req('/sitemap.xml')).text(); verif(P.every((x) => h.includes('/' + x.id + '</loc>')), 'Le plan du site contient les pages par métier');
    const mauvais = structuredClone(C); mauvais.pages_metier[0].id = 'contact';
    verif(verifier(mauvais).erreurs.some((e) => /déjà pris/.test(e)), 'Une page par métier ne peut pas prendre l’adresse d’une autre page');
  }
  if ((C.theme || {}).gabarit === 'studio') { r = await req('/'); const hs = await r.text(); verif(hs.includes('g-studio') && hs.includes('Bricolage Grotesque'), 'Gabarit « studio » : classe et polices du site'); r = await req('/fonts/bricolage-grotesque-latin-700-normal.woff2'); verif(r.status === 200, 'Police du gabarit « studio » servie'); }
  if ((C.theme || {}).gabarit === 'edition') {
    r = await req('/'); const he = await r.text();
    verif(he.includes('g-edition') && he.includes('Besley') && he.includes('class="hero-gar"'), 'Gabarit « édition » : classe, polices et repères chiffrés');
    r = await req('/fonts/besley-latin-500-normal.woff2'); verif(r.status === 200, 'Police du gabarit « édition » servie');
    r = await req('/expertises'); const hv = await r.text();
    verif((hv.match(/<li class="plan"/g) || []).length === C.metiers.length, 'Gabarit « édition » : chaque offre est une tuile');
    const pe = (C.pages_metier || []).find((x) => x.exemple);
    if (pe) { r = await req('/' + pe.id); verif((await r.text()).includes('class="feuille"'), 'La feuille d’exemple du diagnostic s’affiche'); }
    verif(he.includes('\u00a0:') || he.includes('\u00a0?') || he.includes('\u00a0€'), 'Typographie française : espaces insécables');
  }
  r = await req('/robots.txt'); verif((await r.text()).includes('Sitemap:'), 'robots.txt avec plan du site');
  r = await req('/sitemap.xml'); h = await r.text(); verif(h.includes('/realisations/') && !h.includes('?secteur'), 'Plan du site avec les réalisations');
  for (const f of ['/assets/site.css', '/assets/site.js', '/assets/rendu.js', '/assets/polices.js', '/assets/admin.js', '/assets/admin.css', ...TOUS_FICHIERS_POLICES.map((f) => '/fonts/' + f)]) {
    r = await req(f); verif(r.status === 200, 'Fichier ' + f);
  }
  const imagesSite = [...new Set(JSON.stringify(C).match(/\/assets\/[\w./-]+\.(?:jpe?g|png|webp|avif|svg)/gi) || [])];
  let imagesOk = 0;
  for (const f of imagesSite) { r = await req(f); if (r.status === 200 && /^image\//.test(r.headers.get('content-type') || '')) imagesOk++; else console.log('    image en défaut : ' + f + ' ' + r.status); }
  verif(imagesOk === imagesSite.length, `Les ${imagesSite.length} images du site (dans /assets/) s’affichent`);

  /* Page de modification */
  r = await req('/admin'); verif([301, 302, 307, 308].includes(r.status), '/admin redirige vers /admin/');
  r = await req('/admin/'); verif(r.status === 200 && /no-store/.test(r.headers.get('cache-control') || '') && r.headers.get('x-frame-options') === 'DENY', 'Page de modification : jamais en cache, pas dans un cadre');
  r = await req('/api/apparence'); let j = await r.json(); verif(j.ok && j.boutique.nom === C.agence.nom, 'Nom pour l’écran de connexion');
  r = await req('/api/contenu'); verif(r.status === 401, 'Contenu refusé sans connexion');
  r = await req('/api/connexion', { method: 'POST', ...corpsJson({ motdepasse: 'mauvais' }) }); verif(r.status === 401, 'Mauvais mot de passe refusé');
  r = await req('/api/connexion', { method: 'POST', ...corpsJson({ motdepasse: MDP }) });
  const sc = r.headers.get('set-cookie') || ''; cookie = (sc.match(/boutique_session=[^;]+/) || [''])[0];
  verif(r.status === 200 && cookie && /HttpOnly/i.test(sc) && /SameSite=Strict/i.test(sc), 'Bon mot de passe : session ouverte');
  j = await (await req('/api/contenu')).json(); const base = j.contenu;
  verif(j.ok && base._schema === 'agence v1', 'Lecture du contenu une fois connecté');

  const x0 = base.realisations[0];
  /* Redirections 301 : liste du contenu, adresses WordPress, « / » final */
  {
    const mr = structuredClone(base); mr.redirections = [{ de: '/ancienne-realisation/', vers: '/realisations/' + x0.id }, { de: '/vers-dehors', vers: 'https://exemple.fr/page' }];
    await req('/api/contenu', { method: 'PUT', ...corpsJson(mr) });
    const loc = async (ch) => { const r = await fetch(BASE + ch, { redirect: 'manual' }); return r.status + ' ' + (r.headers.get('location') || ''); };
    verif((await loc('/ancienne-realisation/')).endsWith('301 ' + BASE + '/realisations/' + x0.id) || (await loc('/ancienne-realisation/')) === '301 ' + BASE + '/realisations/' + x0.id, 'Redirection 301 d’une ancienne adresse vers la nouvelle page');
    verif((await loc('/ancienne-realisation')) === '301 ' + BASE + '/realisations/' + x0.id, 'Redirection 301 aussi sans « / » final');
    verif((await loc('/vers-dehors')) === '301 https://exemple.fr/page', 'Redirection 301 vers une adresse extérieure');
    verif((await loc('/agence/')) === '301 ' + BASE + '/agence', 'Une adresse avec « / » final renvoie vers la même sans « / »');
    verif((await loc('/feed/')).startsWith('301 ') && (await loc('/category/bureaux/')).startsWith('301 ') && (await loc('/author/admin/')) === '301 ' + BASE + '/', 'Adresses WordPress (flux, catégories, auteurs) redirigées');
    verif((await fetch(BASE + '/realisations/' + x0.id, { redirect: 'manual' })).status === 200, 'Une page existante n’est pas redirigée');
    if ((C.redirections || []).length) { const r0 = C.redirections[0]; verif((await loc(r0.de)).startsWith('301 '), 'Les redirections du fichier de départ marchent même quand le contenu enregistré ne les a pas'); }
    await req('/api/contenu', { method: 'PUT', ...corpsJson(base) });
  }
  { const r1 = await fetch(BASE + '/' + CLE_IDX + '.txt'); verif(r1.status === 200 && (await r1.text()) === CLE_IDX, 'IndexNow : le fichier de clé est servi'); }
  { const ml = structuredClone(base); ml.agence.lien_avis = 'https://g.page/r/essai/review'; ml.agence.profils = ['https://maps.app.goo.gl/essai']; ml.agence.zone = 'Nantes, Vertou et Rezé';
    await req('/api/contenu', { method: 'PUT', ...corpsJson(ml) });
    { const hh = await (await req('/')).text(); verif(hh.includes('https://maps.app.goo.gl/essai') && hh.includes('"@type":"City","name":"Rezé"'), 'Données de l’entreprise : profils reliés (sameAs) et zone en liste de villes'); }
    const r2 = await fetch(BASE + '/avis', { redirect: 'manual' }); verif(r2.status === 302 && r2.headers.get('location') === 'https://g.page/r/essai/review', 'Lien court /avis vers le formulaire d’avis Google');
    await req('/api/contenu', { method: 'PUT', ...corpsJson(base) }); }
  const m = structuredClone(base);
  m.realisations[0].surface = '1 750 m²'; m.annonce = { afficher: true, texte: 'Nouvelle réalisation en ligne' };
  m.theme = { fond: '#ff00ff' }; m._schema = 'pirate'; m.lots = ['Peinture', 42, 'Sols'];
  r = await req('/api/contenu', { method: 'PUT', ...corpsJson(m) }); verif((await r.json()).ok, 'Enregistrement');
  h = await (await req('/realisations/' + x0.id)).text();
  verif(h.includes('1\u00a0750\u00a0m²') && h.includes('Nouvelle réalisation en ligne'), 'La nouvelle surface et le message apparaissent sur le site');
  j = await (await req('/api/contenu')).json();
  verif(j.contenu.theme.fond === base.theme.fond && j.contenu._schema === 'agence v1', 'Les couleurs du site ne peuvent pas être changées depuis la page de modification');
  verif(JSON.stringify(j.contenu.lots) === '["Peinture","Sols"]', 'Les listes de textes sont nettoyées par le serveur');
  verif(!C.abonnements || (j.contenu.abonnements && j.contenu.abonnements.formules.length === C.abonnements.formules.length), 'Après un enregistrement, les formules d’abonnement sont conservées');
  verif(!C.libelles || (j.contenu.libelles && j.contenu.libelles.nav_expertises === C.libelles.nav_expertises), 'Après un enregistrement, les libellés sont conservés');
  verif(!(C.comparaison) || (j.contenu.comparaison && j.contenu.comparaison.lignes.length === C.comparaison.lignes.length), 'Après un enregistrement, la comparaison est conservée');
  verif(!(C.pages_metier || []).length || (j.contenu.pages_metier || []).length === C.pages_metier.length, 'Après un enregistrement, les pages par métier sont conservées');
  if ((C.pages_metier || []).length) {
    const mp = structuredClone(j.contenu); mp.pages_metier[0].visible = false;
    await req('/api/contenu', { method: 'PUT', ...corpsJson(mp) });
    r = await req('/' + mp.pages_metier[0].id); verif(r.status === 404, 'Page par métier masquée : son adresse n’existe plus');
    await req('/api/contenu', { method: 'PUT', ...corpsJson(j.contenu) });
  }
  /* Actualités : ajoutées depuis la page de modification, publiées (menu, accueil, page, plan du site), masquables */
  {
    const ma = structuredClone(j.contenu);
    ma.actualites = [...(ma.actualites || []), { id: 'essai-actu-test', titre: 'Essai : chantier en cours', date: '2099-01-01', texte: 'Pose des cloisons cette semaine.', photos: [], realisation: x0.id, visible: true }];
    recuIdx.length = 0;
    await req('/api/contenu', { method: 'PUT', ...corpsJson(ma) });
    if (/^https:\/\//.test((j.contenu.reglages || {}).url || '')) {
      const lus = () => recuIdx.map((t) => { try { return JSON.parse(t); } catch (e) { return {}; } });
      const trouve = () => lus().some((d) => d.key === CLE_IDX && (d.urlList || []).some((u) => u.endsWith('/actualites/essai-actu-test')));
      for (let i = 0; i < 20 && !trouve(); i++) await new Promise((ok) => setTimeout(ok, 250));
      verif(trouve(), 'IndexNow : les moteurs sont prévenus de la nouvelle actualité');
    }
    h = await (await req('/actualites/essai-actu-test')).text();
    verif(h.includes('Essai : chantier en cours') && h.includes('BlogPosting') && h.includes('/realisations/' + x0.id), 'Actualité enregistrée : sa page existe, avec ses données pour Google et le lien vers la réalisation');
    h = await (await req('/')).text(); verif(h.includes('href="/actualites"') && h.includes('/actualites/essai-actu-test'), 'Actualité : lien dans le menu et carte sur l’accueil');
    h = await (await req('/sitemap.xml')).text(); verif(h.includes('/actualites/essai-actu-test</loc><lastmod>2099-01-01</lastmod>'), 'Actualité : présente dans le plan du site, avec sa date');
    h = await (await req('/realisations/' + x0.id)).text(); verif(h.includes('/actualites/essai-actu-test'), 'La réalisation liée renvoie vers son actualité');
    { const jour = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' }); const sm = await (await req('/sitemap.xml')).text();
      verif(sm.includes(`/realisations/${x0.id}</loc><lastmod>${jour}</lastmod>`) && sm.includes(`/actualites</loc><lastmod>`), 'Plan du site : date de modification des pages touchées par l’enregistrement'); }
    h = await (await req('/actualites.xml')).text(); verif(h.includes('<rss') && h.includes('/actualites/essai-actu-test</link>'), 'Flux RSS des actualités');
    h = await (await req('/')).text(); verif(h.includes('application/rss+xml') && h.includes('<a href="https://exemple.fr" rel="nofollow">Site réalisé par Essai</a>'), 'Flux RSS annoncé, lien « site réalisé par » en nofollow (règles de Google)');
    h = await (await req('/actualites/essai-actu-test')).text(); verif(h.includes('content="article"') && h.includes('"BreadcrumbList"') === /canonical/.test(h), 'Actualité : partage de type article, fil d’Ariane pour Google quand l’adresse du site est connue');
    ma.actualites[ma.actualites.length - 1].visible = false;
    await req('/api/contenu', { method: 'PUT', ...corpsJson(ma) });
    r = await req('/actualites/essai-actu-test'); verif(r.status === 404, 'Actualité masquée : sa page n’existe plus');
    await req('/api/contenu', { method: 'PUT', ...corpsJson(j.contenu) });
  }
  const m2 = structuredClone(j.contenu); m2.realisations[0].visible = false;
  await req('/api/contenu', { method: 'PUT', ...corpsJson(m2) });
  r = await req('/realisations/' + x0.id); verif(r.status === 404, 'Réalisation masquée : sa page n’existe plus');
  const m3 = structuredClone(j.contenu); m3.affichage.references = false;
  await req('/api/contenu', { method: 'PUT', ...corpsJson(m3) });
  h = await (await req('/agence')).text(); verif(!h.includes('class="refs"'), 'Interrupteur : références masquées');
  if ((C.engagements || []).length) {
    const m4 = structuredClone(j.contenu); m4.engagements = [];
    await req('/api/contenu', { method: 'PUT', ...corpsJson(m4) });
    r = await req('/engagements'); verif(r.status === 404, 'Sans bloc d’engagements, la page Engagements n’existe pas');
    await req('/api/contenu', { method: 'PUT', ...corpsJson(j.contenu) });
    r = await req('/engagements'); h = await r.text();
    verif(r.status === 200 && h.includes('id="' + 'hebergement' + '"') && h.includes('href="/engagements"'), 'Page Engagements : blocs et lien dans le menu');
  }
  await req('/api/contenu', { method: 'PUT', ...corpsJson(j.contenu) });

  /* Photo */
  const jpeg = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
  r = await req('/api/photo', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: jpeg }); j = await r.json();
  verif(j.ok && /^\/photos\//.test(j.url), 'Envoi d’une photo');
  if (j.ok) { r = await req(j.url); verif(r.status === 200 && r.headers.get('content-type') === 'image/jpeg', 'La photo envoyée s’affiche'); }

  /* Vidéo de fond : envoi et lecture par morceaux (Safari en a besoin) */
  const fauxMp4 = Buffer.alloc(4096, 7);
  r = await req('/api/video', { method: 'POST', headers: { 'Content-Type': 'video/mp4' }, body: fauxMp4 }); j = await r.json();
  verif(j.ok && /^\/videos\//.test(j.url), 'Envoi d’une vidéo');
  if (j.ok) {
    r = await req(j.url, { cookie: false, headers: { Range: 'bytes=0-99' } });
    verif(r.status === 206 && r.headers.get('content-range') === 'bytes 0-99/4096' && (await r.arrayBuffer()).byteLength === 100, 'La vidéo se lit par morceaux');
    r = await req(j.url, { cookie: false }); verif(r.status === 200 && r.headers.get('content-type') === 'video/mp4' && r.headers.get('accept-ranges') === 'bytes', 'La vidéo s’affiche en entier');
  }
  r = await req('/api/video', { method: 'POST', headers: { 'Content-Type': 'video/quicktime' }, body: fauxMp4 }); verif(r.status === 415, 'Vidéo .mov refusée (format non lu partout)');

  /* Mesure d'audience sans cookie : les visiteurs sont comptés, pas les robots ni les outils */
  const pause = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const ua = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Chrome/130.0 Safari/537.36' };
  const avant = (await (await req('/api/audience?jours=1')).json()).jours[0];
  r = await req('/', { cookie: false, headers: { ...ua, Referer: 'https://www.google.fr/' } }); h = await r.text();
  verif(!/set-cookie/i.test([...r.headers.keys()].join(',')), 'Une visite ne dépose aucun cookie');
  /* Conformité : titres et descriptions choisis page par page, pages légales complètes, aucune ressource tierce, aucun cookie */
  const net = (t) => String(t || '').replace(/&#39;/g, '’').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/[\u00a0\u202f]/g, ' ').replace(/'/g, '’').trim();
  let seoOk = true;
  for (const [chemin, v] of Object.entries(C.seo || {})) {
    const pg = await (await req(chemin, { cookie: false })).text();
    const t = net((pg.match(/<title>([\s\S]*?)<\/title>/) || [])[1]), d = net((pg.match(/<meta name="description" content="([^"]*)"/) || [])[1]);
    if (t !== net(v.titre) || (v.description && d !== net(v.description)) || /<meta name="robots" content="noindex">/.test(pg)) { seoOk = false; console.log('     seo : ' + chemin + ' → ' + t); }
  }
  verif(seoOk, 'Titres et descriptions choisis page par page (clé « seo ») : appliqués, pages indexables');
  r = await req('/confidentialite', { cookie: false }); let h2 = await r.text();
  verif(['Qui est responsable', 'id="cookies"', 'Combien de temps', '180 jours', 'cnil.fr/fr/plaintes', 'art. 6.1.b', 'Hors de l’Union européenne'].every((m) => h2.includes(m)), 'Confidentialité : responsable, cookies, finalité et base légale, durée, destinataires, droits, CNIL');
  verif(!/set-cookie/i.test([...r.headers.keys()].join(',')), 'Confidentialité : aucun cookie déposé');
  r = await req('/mentions-legales', { cookie: false }); h2 = await r.text();
  verif(['Éditeur du site', 'Hébergement', 'Directeur de la publication', 'Utilisation du site'].every((m) => h2.includes(m)), 'Mentions légales : éditeur, hébergeur, directeur de publication, utilisation du site');
  r = await req('/contact', { cookie: false }); h2 = await r.text();
  verif(/Conservation : 180 jours/.test(h2) && /href="\/confidentialite">politique de confidentialité/.test(h2) && !/type="checkbox"[^>]*(checked|name="(consent|newsletter))/.test(h2.replace(/<input type="checkbox" name="botcheck"[^>]*>/, '')), 'Formulaire : mention d’information sous le formulaire, aucune case cochée d’avance');
  verif(/href="\/confidentialite#cookies">Cookies<\/a>/.test(h), 'Pied de page : lien Cookies');
  verif(!/<(script|link|iframe)[^>]+(src|href)="https?:\/\/(?!gregoiremuel\.fr)/.test(h), 'Aucun script, style ni cadre chargé depuis un autre site (pas de consentement à demander)');
  await req('/expertises', { cookie: false, headers: ua });
  await req('/', { cookie: false, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } });
  await req('/nexistepas', { cookie: false, headers: ua });
  await pause(1500);
  const apres = (await (await req('/api/audience?jours=1')).json()).jours[0];
  verif(apres.t - avant.t === 2 && (apres.s.g || 0) - (avant.s.g || 0) === 1 && (apres.s.d || 0) - (avant.s.d || 0) === 1 && (apres.p['/'] || 0) - (avant.p['/'] || 0) === 1, 'Deux visites comptées (un robot et une page introuvable ne le sont pas), avec leur provenance');
  verif(!JSON.stringify(apres).match(/\d+\.\d+\.\d+\.\d+|Mozilla/), 'Les totaux ne contiennent ni adresse IP ni navigateur');
  r = await req('/api/audience'); verif(r.status === 200 && (await r.json()).jours.length === 30, 'La page de modification lit les 30 derniers jours');
  r = await req('/api/audience', { cookie: false }); verif(r.status === 401, 'Les visites ne sont lisibles que connecté');

  /* Sauvegarde nocturne (déclenchée à la main) : copie dans la mémoire du site et dans le stockage R2 d'essai */
  r = await req('/__scheduled?cron=*'); await pause(1500);
  let etat = (await (await req('/api/audience?jours=1')).json()).sauvegarde;
  if (!etat) { r = await req('/cdn-cgi/handler/scheduled'); await pause(1500); etat = (await (await req('/api/audience?jours=1')).json()).sauvegarde; }
  verif(etat && etat.kv && etat.r2 && etat.r2.contenu && !etat.r2.erreur, 'La sauvegarde nocturne copie le contenu (mémoire du site et stockage externe)');
  verif(etat && etat.r2 && etat.r2.fichiers >= 2, 'La sauvegarde copie les photos et vidéos envoyées (' + (etat && etat.r2 ? etat.r2.fichiers : 0) + ' fichier(s))');
  await req('/__scheduled?cron=*'); await pause(1500);
  etat = (await (await req('/api/audience?jours=1')).json()).sauvegarde;
  verif(etat && etat.r2 && etat.r2.fichiers === 0 && !etat.r2.erreur, 'Une deuxième nuit ne recopie pas les fichiers déjà copiés');

  /* Demande de contact d'un visiteur */
  const client = { nom: 'Client Test', societe: 'Test SAS', email: 'client@exemple.fr', telephone: '06 12 34 56 78', type: 'Bureaux', surface: '300 m²', ville: 'Nantes', message: 'Essai' };
  r = await req('/api/contact', { method: 'POST', cookie: false, ...corpsJson(client) }); verif(r.status === 200, 'Un visiteur envoie une demande');
  for (let i = 0; i < 20 && !recuN8N.length; i++) await new Promise((ok) => setTimeout(ok, 250));
  { const n = recuN8N[0]; let d = {}; try { d = JSON.parse(n.corps); } catch (e) { /* vide */ } verif(n && n.secret === SECRET_N8N && d.email === client.email && d.id, 'Demande copiée vers n8n avec le secret'); }
  r = await req('/api/contact', { method: 'POST', cookie: false, ...corpsJson({ ...client, email: 'faux' }) }); verif(r.status === 400, 'Demande sans e-mail valable refusée');
  r = await req('/api/contact', { method: 'POST', cookie: false, ...corpsJson({ ...client, telephone: '12' }) }); verif(r.status === 400, 'Demande avec un téléphone incomplet refusée');
  r = await req('/api/contact', { method: 'POST', cookie: false, ...corpsJson({ ...client, email: '' }) }); verif(r.status === 200, 'Demande avec le téléphone seul acceptée');
  r = await req('/api/contact', { method: 'POST', cookie: false, ...corpsJson({ ...client, email: '', telephone: '' }) }); verif(r.status === 400, 'Demande sans e-mail ni téléphone refusée');
  j = await (await req('/api/demandes')).json();
  const dem = (j.demandes || []).find((c) => c.nom === 'Client Test');
  verif(dem && dem.statut === 'nouvelle' && dem.societe === 'Test SAS' && dem.lignes.some(([k, v]) => k === libellesDemande(C).surface && v === '300 m²'), 'La demande arrive complète dans la page de modification');
  if (dem) {
    for (const s of ['rappelee', 'devis', 'signee', 'classee']) { r = await req('/api/demandes/' + dem.id, { method: 'PATCH', ...corpsJson({ statut: s }) }); verif(r.status === 200, 'Statut « ' + s + ' »'); }
    r = await req('/api/demandes/' + dem.id, { method: 'PATCH', ...corpsJson({ statut: 'nimportequoi' }) }); verif(r.status === 400, 'Statut inconnu refusé');
  }
  const ferme = structuredClone((await (await req('/api/contenu')).json()).contenu); ferme.contact.actif = false;
  await req('/api/contenu', { method: 'PUT', ...corpsJson(ferme) });
  r = await req('/api/contact', { method: 'POST', cookie: false, ...corpsJson(client) }); verif(r.status === 403, 'Formulaire fermé : demandes refusées par le serveur');

  /* Adresse canonique : seulement hors version de travail et si l'adresse du site est connue */
  const Cc = structuredClone(C); Cc.reglages = { ...(Cc.reglages || {}), url: 'https://gregoiremuel.fr/' };
  const Cs = structuredClone(C); Cs.reglages = { ...(Cs.reglages || {}), url: '' };
  verif(/<link rel="canonical" href="https:\/\/gregoiremuel\.fr\/expertises">/.test(rendrePage(Cc, '/expertises', { maquette: false }).html) && !/rel="canonical"/.test(rendrePage(Cc, '/expertises', { maquette: true }).html) && !/rel="canonical"/.test(rendrePage(Cs, '/expertises', { maquette: false }).html), 'Adresse canonique ajoutée seulement en ligne et avec l’adresse du site');

  /* Rien sur la joaillerie dans les pages vues par les visiteurs */
  { let tout = ''; for (const ch of routes(C)) tout += rendrePage(C, ch, { maquette: false }).html; verif(!/joaill|bijou/i.test(tout), 'Aucune mention de la joaillerie sur le site'); }

  /* Changer le mot de passe depuis la page de modification */
  const NOUVEAU = 'nouvelle-phrase-secrete-42';
  r = await req('/api/mot-de-passe', { method: 'POST', ...corpsJson({ actuel: 'faux-mot-de-passe', nouveau: NOUVEAU }) }); verif(r.status === 403, 'Changement de mot de passe refusé si le mot de passe actuel est faux');
  r = await req('/api/mot-de-passe', { method: 'POST', ...corpsJson({ actuel: MDP, nouveau: 'court' }) }); verif(r.status === 400, 'Nouveau mot de passe de moins de 12 caractères refusé');
  r = await req('/api/mot-de-passe', { method: 'POST', ...corpsJson({ actuel: MDP, nouveau: MDP }) }); verif(r.status === 400, 'Nouveau mot de passe identique à l’ancien refusé');
  r = await req('/api/mot-de-passe', { method: 'POST', cookie: false, ...corpsJson({ actuel: MDP, nouveau: NOUVEAU }) }); verif(r.status === 401, 'Changement de mot de passe refusé sans connexion');
  r = await req('/api/mot-de-passe', { method: 'POST', ...corpsJson({ actuel: MDP, nouveau: NOUVEAU }) }); verif(r.status === 200, 'Mot de passe changé');
  r = await req('/api/connexion', { method: 'POST', cookie: false, ...corpsJson({ motdepasse: NOUVEAU }) }); verif(r.status === 200 && /session|boutique|=/.test(r.headers.get('set-cookie') || ''), 'Connexion avec le nouveau mot de passe');
  r = await req('/api/connexion', { method: 'POST', cookie: false, ...corpsJson({ motdepasse: MDP }) }); verif(r.status === 401, 'L’ancien mot de passe ne marche plus');
  r = await req('/api/contenu'); verif(r.status === 200, 'La session en cours reste ouverte après le changement');

  /* Retour en arrière, déconnexion, limites */
  r = await req('/api/annuler', { method: 'POST' }); j = await r.json(); verif(j.ok && j.contenu.contact.actif !== false, 'Revenir en arrière rétablit la version précédente');
  r = await req('/api/deconnexion', { method: 'POST' }); verif(/Max-Age=0/.test(r.headers.get('set-cookie') || ''), 'Déconnexion');
  cookie = '';
  r = await req('/api/contenu'); verif(r.status === 401, 'Après déconnexion, le contenu est refusé');
  for (let i = 0; i < 8; i++) await req('/api/connexion', { method: 'POST', ...corpsJson({ motdepasse: 'faux-' + i }) });
  r = await req('/api/connexion', { method: 'POST', ...corpsJson({ motdepasse: MDP }) }); verif(r.status === 429, 'Après 8 mauvais mots de passe, connexion bloquée un quart d’heure');
}

const pret = await attendre();
if (!pret) { console.error('\nLe serveur local ne démarre pas. Journal :\n' + journal.slice(-3000)); arreter(); process.exit(1); }
try { await tests(); } catch (e) { echecs.push('Erreur pendant les tests : ' + e.message); console.log('  ÉCHEC   ' + e.stack); }
arreter();
console.log(`\n${ok} vérification(s) réussie(s), ${echecs.length} échec(s).\n`);
process.exit(echecs.length ? 1 : 0);
