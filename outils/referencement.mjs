// Contrôle le référencement de chaque page du site : titre, description, titre principal, adresse canonique, données structurées, images, liens internes, longueur du texte.
// Usage : node outils/referencement.mjs [--en-ligne https://adresse-du-site]   (la seconde forme contrôle aussi robots.txt et sitemap.xml du site publié)
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';

const racine = fileURLToPath(new URL('..', import.meta.url));
const { rendrePage, routes } = await import(pathToFileURL(join(racine, 'public/assets/rendu.js')).href);
const fichier = process.argv.slice(2).find((a, i, t) => !a.startsWith('--') && t[i - 1] !== '--en-ligne'); // contenu à contrôler (par défaut : contenu-initial.json)
const C = JSON.parse(readFileSync(fichier || join(racine, 'contenu-initial.json'), 'utf8'));
const url = ((C.reglages || {}).url || '').replace(/\/$/, '');
const chemins = routes(C).filter((r) => !r.includes('?'));
const lignes = []; // { gravite: 'ERREUR'|'à revoir'|'info', page, texte }
const noter = (gravite, page, texte) => lignes.push({ gravite, page, texte });
const texte = (h) => h.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();

const titres = new Map(), descriptions = new Map();
const pages = chemins.map((r) => [r, rendrePage(C, r, { maquette: false })]);
const existe = new Set(pages.filter(([, p]) => p.statut === 200).map(([r]) => r));

for (const [r, p] of pages) {
  const h = p.html;
  if (p.statut !== 200) { noter('ERREUR', r, `la page répond ${p.statut}`); continue; }
  const titre = ((h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').trim();
  const desc = ((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').trim();
  if (!titre) noter('ERREUR', r, 'pas de titre'); else {
    if (titre.length > 65) noter('à revoir', r, `titre long (${titre.length} signes, Google coupe vers 60)`);
    if (titre.length < 15) noter('à revoir', r, `titre court (${titre.length} signes)`);
    titres.set(titre, [...(titres.get(titre) || []), r]);
  }
  if (!desc) noter('à revoir', r, 'pas de description'); else {
    if (desc.length > 160) noter('à revoir', r, `description longue (${desc.length} signes, Google coupe vers 155)`);
    if (desc.length < 50) noter('à revoir', r, `description courte (${desc.length} signes)`);
    descriptions.set(desc, [...(descriptions.get(desc) || []), r]);
  }
  const n1 = (h.match(/<h1[\s>]/g) || []).length;
  if (n1 !== 1) noter('ERREUR', r, `${n1} titre(s) principal(aux) <h1> au lieu d'un seul`);
  if (!/<html lang="fr"/.test(h)) noter('ERREUR', r, 'langue non déclarée (lang="fr")');
  if (!/<meta name="viewport"/.test(h)) noter('ERREUR', r, 'pas de balise viewport (affichage mobile)');
  if (url && !new RegExp(`<link rel="canonical" href="${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(h)) noter('à revoir', r, 'pas d\'adresse canonique');
  const sansAlt = (h.match(/<img (?![^>]*\balt=)[^>]*>/g) || []).length;
  if (sansAlt) noter('ERREUR', r, `${sansAlt} image(s) sans attribut alt`);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch (e) { noter('ERREUR', r, 'données structurées illisibles'); } }
  if (r === '/' && !/application\/ld\+json/.test(h)) noter('à revoir', r, 'pas de données structurées sur l\'accueil');
  if (!/property="og:image"/.test(h) && (r === '/' || /^\/site-|^\/visibilite/.test(r))) noter('info', r, 'pas d\'image de partage (og:image) : l\'aperçu des liens partagés sera sans visuel');
  const mots = texte(h.replace(/<(header|nav|footer)[\s\S]*?<\/\1>/g, ' ')).split(' ').length;
  if (mots < 150 && !/mentions|confidentialite|contact/.test(r)) noter('à revoir', r, `peu de texte (${mots} mots) : Google préfère des pages utiles et précises`);
  for (const m of h.matchAll(/<a [^>]*href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) { const cible = m[1].replace(/\/$/, '') || '/'; if (!/^\/(assets|fonts|photos|demos|videos|api|admin)/.test(cible) && !/\.[a-z0-9]{2,4}$/i.test(cible) && !existe.has(cible)) noter('ERREUR', r, `lien interne cassé : ${m[1]}`); }
  const niveaux = [...h.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  for (let i = 1; i < niveaux.length; i++) if (niveaux[i] - niveaux[i - 1] > 1) { noter('à revoir', r, `saut de niveau de titre (h${niveaux[i - 1]} puis h${niveaux[i]})`); break; }
}
for (const [t, rs] of titres) if (rs.length > 1) noter('à revoir', rs.join(', '), `même titre : « ${t.slice(0, 60)} »`);
for (const [d, rs] of descriptions) if (rs.length > 1) noter('à revoir', rs.join(', '), `même description : « ${d.slice(0, 60)}… »`);
if (!url) noter('à revoir', 'site', 'reglages.url vide : à renseigner avec l\'adresse définitive pour activer l\'adresse canonique et le plan du site');

if (process.argv.includes('--en-ligne')) {
  const base = (process.argv[process.argv.indexOf('--en-ligne') + 1] || '').replace(/\/$/, '');
  try {
    const rob = await (await fetch(base + '/robots.txt')).text();
    if (/Disallow:\s*\/\s*$/m.test(rob)) noter('info', base, 'robots.txt interdit tout : normal tant que le site est en version de travail (MAQUETTE = « oui »)');
    else if (!/Sitemap:/i.test(rob)) noter('ERREUR', base, 'robots.txt sans ligne Sitemap');
    const sm = await (await fetch(base + '/sitemap.xml')).text();
    const dans = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].length;
    if (!/noindex/.test(await (await fetch(base + '/')).text()) && dans < existe.size - 4) noter('à revoir', base, `le plan du site ne liste que ${dans} adresse(s) sur ${existe.size} pages`);
  } catch (e) { noter('à revoir', base, 'site injoignable depuis ici : ' + e.message); }
}

const ordre = { ERREUR: 0, 'à revoir': 1, info: 2 };
lignes.sort((a, b) => ordre[a.gravite] - ordre[b.gravite]);
const n = (g) => lignes.filter((l) => l.gravite === g).length;
console.log(`\nRéférencement de ${chemins.length} pages : ${n('ERREUR')} erreur(s), ${n('à revoir')} point(s) à revoir, ${n('info')} information(s).\n`);
for (const l of lignes) console.log(`  ${l.gravite.padEnd(8)} ${l.page.padEnd(26)} ${l.texte}`);
if (!lignes.length) console.log('  Rien à signaler.');
console.log('\nUn contrôle technique ne place pas un site dans Google : il évite les erreurs qui empêchent d\'être compris. La suite : docs/REFERENCEMENT.md.');
process.exit(n('ERREUR') ? 1 : 0);
