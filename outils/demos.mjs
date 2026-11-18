// Fabrique les démonstrations de public/demos/ avec le moteur « vitrine » du kit (modeles/fromagerie-la-fontaine).
// Chaque démonstration a son contenu dans exemples/*.json (photos dans exemples/photos/, écrites « /photos/nom » dans le contenu).
// Usage : node outils/demos.mjs [dossier du kit]   (par défaut : ../kit-sites-boutiques)
// Le modèle du kit n'est jamais modifié : il est copié dans un dossier temporaire. Rien du modèle ne reste dans le site (pas de contenu de boutique).
import { cpSync, mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const racine = fileURLToPath(new URL('..', import.meta.url));
const kit = resolve(process.argv[2] || join(racine, '..', 'kit-sites-boutiques'));
const modele = join(kit, 'modeles', 'fromagerie-la-fontaine');
if (process.argv[2] !== '--alleger' && !existsSync(join(modele, 'public', 'assets', 'rendu.js'))) { console.error(`Moteur vitrine introuvable : ${modele}\nUsage : node outils/demos.mjs ../kit-sites-boutiques`); process.exit(1); }

// Allège une démonstration : images et polices intégrées en base64 sortent en fichiers (nom = empreinte).
// Images dans public/photos/demo-* : le moteur vitrine n'accepte que https://, data: ou /photos/. Polices en relatif dans public/demos/media/.
// shortcut: les démonstrations allégées ne s'ouvrent plus en file:// (images absolues) ; les ouvrir par le serveur local.
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'font/woff2': 'woff2' };
export function alleger(page) {
  const photos = join(racine, 'public', 'photos'); mkdirSync(photos, { recursive: true }); mkdirSync(media, { recursive: true });
  return page.replace(/data:(image\/(?:jpeg|png|webp|avif)|font\/woff2);base64,([A-Za-z0-9+/=]+)/g, (_, type, b64) => {
    const buf = Buffer.from(b64, 'base64'), police = type === 'font/woff2';
    const nom = (police ? '' : 'demo-') + createHash('sha1').update(buf).digest('hex').slice(0, 16) + '.' + TYPES[type];
    const f = join(police ? media : photos, nom); if (!existsSync(f)) writeFileSync(f, buf);
    return (police ? 'media/' : '/photos/') + nom;
  });
}
const media = join(racine, 'public', 'demos', 'media');
if (process.argv[2] === '--alleger') { // démonstrations déjà fabriquées : allégées sur place, sans repasser par le kit
  for (const f of readdirSync(join(racine, 'public', 'demos')).filter((f) => f.endsWith('.html'))) {
    const p = join(racine, 'public', 'demos', f), avant = readFileSync(p, 'utf8'), apres = alleger(avant);
    writeFileSync(p, apres); console.log(`public/demos/${f} : ${Math.round(avant.length / 1024)} Ko -> ${Math.round(apres.length / 1024)} Ko`);
  }
  process.exit(0);
}

const DEMOS = [['vitrine-atelier', 'atelier-exemple'], ['vitrine-fleuriste', 'fleuriste-exemple'], ['vitrine-plombier', 'plombier-exemple'], ['vitrine-restaurant', 'restaurant-exemple']];
const tmp = mkdtempSync(join(tmpdir(), 'demos-'));
try {
  cpSync(modele, tmp, { recursive: true, filter: (s) => !/node_modules|\.wrangler|demonstration\.html|apercu-site\.html|demo-en-ligne/.test(s) });
  for (const [contenu, sortie] of DEMOS) {
    // Style propre à la démonstration : exemples/css/<contenu>.css est ajouté à la fin de site.css (copie temporaire, le kit reste intact).
    const base = readFileSync(join(modele, 'public', 'assets', 'site.css'), 'utf8'); writeFileSync(join(tmp, 'public', 'assets', 'site.css'), base);
    const perso = join(racine, 'exemples', 'css', contenu + '.css'); if (existsSync(perso)) appendFileSync(join(tmp, 'public', 'assets', 'site.css'), '\n' + readFileSync(perso, 'utf8'));
    const r = spawnSync('node', ['outils/apercu.mjs', join(racine, 'exemples', contenu + '.json')], { cwd: tmp, encoding: 'utf8' });
    if (r.status !== 0) { console.error(`${contenu} : échec\n${r.stdout}${r.stderr}`); process.exit(1); }
    // Barre du haut (hors de l'iframe, donc hors de site.css) : exemples/css/<contenu>.barre.css est injecté dans la page.
    const barre = join(racine, 'exemples', 'css', contenu + '.barre.css');
    if (existsSync(barre)) writeFileSync(join(tmp, 'demonstration.html'), readFileSync(join(tmp, 'demonstration.html'), 'utf8').replace('</head>', '<style>' + readFileSync(barre, 'utf8') + '</style></head>'));
    const page = readFileSync(join(tmp, 'demonstration.html'), 'utf8');
    if (/fromagerie|la fontaine|tcheskiss|atelier muel/i.test(page)) { console.error(`${sortie} : le fichier cite un nom interdit (Fromagerie, Tcheskiss ou Atelier Muel). Arrêt.`); process.exit(1); }
    writeFileSync(join(racine, 'public', 'demos', sortie + '.html'), alleger(page));
    console.log(`public/demos/${sortie}.html (${Math.round(page.length / 1024)} Ko)`);
  }
} finally { rmSync(tmp, { recursive: true, force: true }); }
