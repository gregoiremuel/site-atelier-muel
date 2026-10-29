// Repère ce qui donne à un site une allure « faite par IA » : textes, couleurs, formes, mise en page.
// C'est un détecteur d'indices, pas un juge : un point relevé veut dire « regarde ça », pas « c'est faux ».
// Usage : node outils/look-ia.mjs [--hauteurs]   (--hauteurs mesure la longueur des pages avec Playwright, s'il est installé)
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';

const racine = fileURLToPath(new URL('..', import.meta.url));
const { rendrePage, routes } = await import(pathToFileURL(join(racine, 'public/assets/rendu.js')).href);
const C = JSON.parse(readFileSync(join(racine, 'contenu-initial.json'), 'utf8'));
const css = readFileSync(join(racine, 'public/assets/site.css'), 'utf8');
const T = C.theme || {};

const trouvailles = []; // { poids, titre, detail, correction }
const note = (poids, titre, detail, correction) => trouvailles.push({ poids, titre, detail, correction });

/* ---------- Textes ---------- */
const pages = routes(C).filter((r) => !r.includes('?')).map((r) => [r, rendrePage(C, r, { maquette: false }).html]);
const texte = (html) => html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;| | /g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/\s+/g, ' ');
const corps = (html) => html.replace(/<(footer|nav|summary|button|select|label)[\s\S]*?<\/\1>/g, ' ').replace(/«[^»]*»/g, ' ').replace(/<figure class="feuille">[\s\S]*?<\/figure>/g, ' ')
  /* Le bloc signé « Qui fait votre site » et la phrase du téléphone parlent à la première personne exprès : la personne derrière l'activité, identifiée */
  .replace(/<section class="sec personne"[\s\S]*?<\/section>/g, ' ').replace(/<p class="hero-tel">[\s\S]*?<\/p>/g, ' ').replace(/<a [^>]*class="btn[^"]*"[\s\S]*?<\/a>/g, ' ');
const tout = pages.map(([r, h]) => [r, texte(corps(h))]);

const PREMIERE = /\b(je|j[’']|moi|m[’']|mon|ma|mes)\b|\bJe\b/gi;
let nbJe = 0; const exJe = [];
for (const [r, t] of tout) { const m = t.match(PREMIERE) || []; nbJe += m.length; if (m.length && exJe.length < 3) exJe.push(`${r} : « ${(t.match(new RegExp('.{0,40}' + PREMIERE.source + '.{0,40}', 'i')) || [''])[0].trim()} »`); }
if (nbJe) note(Math.min(20, 4 + nbJe), 'Texte à la première personne (« je », « moi », « mon »)', `${nbJe} occurrence(s) hors boutons et questions. ${exJe.join(' ; ')}`, 'Écrire à la deuxième personne (« vous ») ou au « nous » : le site parle du projet, pas de la personne.');

const CLICHES = ['plongez', 'découvrez', 'révolutionn', 'boostez', 'booster', 'solution innovante', 'solutions innovantes', 'clé en main', 'sans compromis', 'au cœur de', 'véritable', 'n’attendez plus', 'passionné', 'expertise unique', 'décupl', 'propuls', 'synergie', 'à la pointe', 'sans détour', 'dans un monde', 'l’art de', 'en un clin d’œil', 'tout-en-un', 'cutting-edge', 'next level', 'notre mission', 'nos valeurs', 'accompagnement sur mesure', 'faire passer', 'transformez', 'libérez'];
const brut = tout.map(([, t]) => t.toLowerCase()).join(' ');
const trouves = CLICHES.filter((c) => brut.includes(c));
if (trouves.length) note(Math.min(15, trouves.length * 4), 'Formules toutes faites', trouves.map((c) => `« ${c} »`).join(', '), 'Dire la chose précise (quoi, combien, en combien de temps) à la place.');

const cadratins = (brut.match(/—/g) || []).length, exclam = (brut.match(/!/g) || []).length, emoji = (brut.match(/\p{Extended_Pictographic}/gu) || []).length;
if (cadratins > 2) note(4, 'Tirets cadratins (—) répétés', `${cadratins} occurrences`, 'Remplacer par une virgule, un deux-points ou un point.');
if (exclam > 2) note(3, 'Points d’exclamation', `${exclam} occurrences`, 'Un ton posé : retirer.');
if (emoji) note(6, 'Emoji dans le texte', `${emoji} occurrence(s)`, 'Les retirer.');

const TITRES_FADES = ['nos services', 'pourquoi nous choisir', 'à propos de nous', 'nos valeurs', 'notre histoire', 'notre équipe', 'nos engagements', 'ce que nous faisons'];
const h2 = pages.flatMap(([, h]) => [...h.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/g)].map((m) => texte(m[1]).trim().toLowerCase()));
const fades = TITRES_FADES.filter((t) => h2.includes(t));
if (fades.length) note(5, 'Titres génériques', fades.map((t) => `« ${t} »`).join(', '), 'Un titre qui dit le contenu réel (un chiffre, un fait).');

/* Les mêmes phrases répétées sur plusieurs pages (le bandeau d'appel, etc.) */
const phrases = new Map();
for (const [, t] of pages.map(([r, h]) => [r, texte(h.replace(/<footer[\s\S]*?<\/footer>/, ''))])) for (const s of new Set(t.split(/(?<=[.!?])\s+/).filter((x) => x.length > 40))) phrases.set(s, (phrases.get(s) || 0) + 1);
const repetees = [...phrases].filter(([, n]) => n >= 4);
if (repetees.length) note(3, 'Phrases répétées sur au moins 4 pages', repetees.slice(0, 2).map(([s, n]) => `« ${s.slice(0, 70)}… » (${n} pages)`).join(' ; '), 'Garder une seule fois ou raccourcir.');

/* ---------- Couleurs ---------- */
const hsl = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; const d = mx - mn; if (!d) return [0, 0, l * 100]; const s = d / (1 - Math.abs(2 * l - 1)); const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [Math.round((h * 60 + 360) % 360), Math.round(s * 100), Math.round(l * 100)]; };
const HEX = /^#[0-9a-f]{6}$/i;
if (HEX.test(T.marine || '')) {
  const [h, s, l] = hsl(T.marine);
  if (s > 60 && l > 25 && l < 62) note(10, 'Couleur d’accent trop vive', `${T.marine} : teinte ${h}°, saturation ${s} %, luminosité ${l} %`, 'Descendre sous 50 % de saturation (bleu nuit, vert sapin, bordeaux, anthracite).');
  if (h >= 225 && h <= 290 && s > 45) note(6, 'Bleu-violet typique des interfaces générées', `${T.marine} : teinte ${h}°`, 'Sortir de la plage 225–290° (bleu nuit désaturé, vert, brun, rouge sombre).');
}
const nette = css.replace(/\/\*[\s\S]*?\*\//g, '');
const edition = nette.slice(Math.max(0, nette.indexOf('.g-edition{')));
const grad = (edition.match(/(?:background(?:-image)?)\s*:[^;{}]*(?:linear|radial|conic)-gradient/g) || []).length;
if (grad) note(8, 'Dégradés de fond', `${grad} règle(s)`, 'Aplats unis. Un dégradé reste acceptable seulement pour lire un texte posé sur une photo.');
if (/backdrop-filter\s*:\s*blur/.test(edition.replace(/backdrop-filter:none/g, ''))) note(6, 'Effet de verre (flou d’arrière-plan)', '', 'Fond plein.');
const pilules = (edition.match(/border-radius\s*:\s*(?:9{3}px|50%|\d{2,}px)/g) || []).length;
if (pilules > 3) note(5, 'Coins très arrondis, pastilles', `${pilules} règle(s)`, 'Angles droits ou 2 à 4 px.');
const ombres = (edition.match(/box-shadow\s*:\s*[^;{}]*\d{2,}px[^;{}]*rgba?\([^)]*\.\d/g) || []).length;
if (ombres > 1) note(4, 'Ombres portées diffuses', `${ombres} règle(s)`, 'Filets fins plutôt qu’ombres.');
const capitales = (edition.match(/text-transform\s*:\s*uppercase/g) || []).length;
if (capitales > 1) note(4, 'Petites capitales espacées', `${capitales} règle(s)`, 'Casse normale.');
const teintes = new Set([...(css + JSON.stringify(T)).matchAll(/#([0-9a-f]{6})\b/gi)].map((m) => hsl('#' + m[1])).filter(([, s, l]) => s > 25 && l > 12 && l < 92).map(([h]) => Math.round(h / 40)));
if (teintes.size > 3) note(5, 'Trop de teintes différentes', `${teintes.size} familles de couleur`, 'Un neutre, une encre, une seule couleur d’accent.');

/* ---------- Mise en page ---------- */
const hCount = pages.map(([r, h]) => [r, (h.match(/<section/g) || []).length]).filter(([, n]) => n > 7);
if (hCount.length) note(4, 'Beaucoup de sections empilées', hCount.map(([r, n]) => `${r} : ${n}`).join(', '), 'Regrouper (onglets, volets).');
const bandeaux = pages.filter(([, h]) => /class="appel/.test(h)).length;
if (bandeaux > 5) note(3, 'Même bandeau d’appel sur presque toutes les pages', `${bandeaux} pages`, 'Le garder sur l’accueil et le contact seulement, ou le réduire à une ligne.');
const sansPhoto = pages.filter(([, h]) => !/<img /.test(h)).map(([r]) => r);
if (sansPhoto.length > 3) note(3, 'Pages sans aucune image', sansPhoto.join(', '), 'Une petite photo ou un visuel par page.');

/* ---------- Longueur (facultatif) ---------- */
if (process.argv.includes('--hauteurs')) {
  try {
    const { chromium } = createRequire(join(racine, 'package.json'))('playwright');
    const { createServer } = await import('node:http'); const { existsSync, statSync } = await import('node:fs'); const { extname } = await import('node:path');
    const MIME = { '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
    const srv = createServer((req, res) => { const u = new URL(req.url, 'http://x'); const f = join(racine, 'public', decodeURIComponent(u.pathname)); if (/^\/(assets|fonts)\//.test(u.pathname) && existsSync(f) && statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f)); return; } const r = rendrePage(C, u.pathname, { maquette: false }); res.writeHead(r.statut, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(r.html); });
    await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
    const nav = await chromium.launch(); const longues = [];
    for (const [r] of pages) { const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); await p.goto('http://127.0.0.1:' + srv.address().port + r); const h = await p.evaluate(() => document.documentElement.scrollHeight); if (h > 5 * 844) longues.push(`${r} : ${Math.round(h / 844 * 10) / 10} écrans`); await ctx.close(); }
    await nav.close(); srv.close();
    if (longues.length) note(6, 'Pages trop longues sur téléphone (plus de 5 écrans)', longues.join(', '), 'Onglets, volets, bandes qui défilent.');
  } catch (e) { console.log('(mesure des hauteurs ignorée : ' + e.message.split('\n')[0] + ')'); }
}

/* ---------- Rapport ---------- */
const score = Math.min(100, trouvailles.reduce((n, t) => n + t.poids, 0));
trouvailles.sort((a, b) => b.poids - a.poids);
console.log(`\nAllure « IA » : indice ${score} / 100 (0 = rien de repéré ; au-dessus de 25, regarde les points ci-dessous)\n`);
if (!trouvailles.length) console.log('  Aucun indice relevé.');
for (const t of trouvailles) console.log(`  [${String(t.poids).padStart(2)}] ${t.titre}\n       ${t.detail}\n       → ${t.correction}\n`);
console.log('Ce détecteur ne voit pas les photos ni le ton : à compléter par un regard humain.');
