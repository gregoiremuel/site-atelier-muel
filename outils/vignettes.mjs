// Fabrique les vignettes des réalisations (public/assets/photos/real-*.jpg) : de vraies captures d'écran des démonstrations,
// sans cadre d'appareil. Deux images par réalisation : le haut de la page, puis la partie suivante (« Ce que fait… », la carte…).
// Outil de développement : demande Playwright (déjà là dans l'espace de Claude ; sinon « npm i -D playwright »).
// Usage : node outils/vignettes.mjs [dossier du kit] [dossier de site-operia]
import { cpSync, mkdtempSync, rmSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const racine = fileURLToPath(new URL('..', import.meta.url));
const kit = resolve(process.argv[2] || join(racine, '..', 'kit-sites-boutiques'));
const operia = resolve(process.argv[3] || join(racine, '..', 'site-operia'));
const modele = join(kit, 'modeles', 'fromagerie-la-fontaine');
const sortie = join(racine, 'public', 'assets', 'photos');
let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch (e) { console.error('Playwright introuvable : « npm i -D playwright » puis « npx playwright install chromium ».'); process.exit(1); }

const tmp = mkdtempSync(join(tmpdir(), 'vignettes-'));
const L = 1440, H = 900;            /* fenêtre ; le facteur 1,111 donne des images de 1600 × 1000 */
const echelle = 1600 / L;
try {
  const sites = [['vitrine-atelier', 'atelier-exemple'], ['vitrine-fleuriste', 'fleuriste-exemple'], ['vitrine-plombier', 'plombier-exemple'], ['vitrine-restaurant', 'restaurant-exemple']];
  cpSync(modele, join(tmp, 'moteur'), { recursive: true, filter: (s) => !/node_modules|\.wrangler|demonstration\.html|apercu-site\.html|demo-en-ligne/.test(s) });
  mkdirSync(sortie, { recursive: true });
  const b = await chromium.launch();
  const capturer = async (page, nom, haut, y) => {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(tmp, nom + '.png'), clip: { x: 0, y: 0, width: L, height: H } });
    const r = spawnSync('convert', [join(tmp, nom + '.png'), '-resize', '1600x1000!', '-strip', '-interlace', 'JPEG', '-quality', '82', join(sortie, nom + '.jpg')]);
    if (r.status !== 0) { console.error('ImageMagick (convert) est nécessaire.'); process.exit(1); }
    console.log('public/assets/photos/' + nom + '.jpg');
  };
  for (const [contenu, id] of sites) {
    const r = spawnSync('node', ['outils/apercu.mjs', join(racine, 'exemples', contenu + '.json')], { cwd: join(tmp, 'moteur'), encoding: 'utf8' });
    if (r.status !== 0) { console.error(r.stdout + r.stderr); process.exit(1); }
    const ctx = await b.newContext({ viewport: { width: L, height: H }, deviceScaleFactor: echelle, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    copyFileSync(join(tmp, 'moteur', 'apercu-site.html'), join(tmp, 'moteur-' + id + '.html'));
    await page.goto(pathToFileURL(join(tmp, 'moteur', 'apercu-site.html')).href);
    await page.waitForTimeout(800);
    const bandeau = await page.evaluate(() => { const m = document.querySelector('.maquette'); return m ? m.getBoundingClientRect().height : 0; });
    await page.evaluate((h) => { const m = document.querySelector('.maquette'); if (m) m.remove(); document.querySelectorAll('.bar').forEach((e) => e.remove()); }, bandeau);
    await capturer(page, `real-${id}`, 0, 0);
    const y = await page.evaluate(() => { const s = document.getElementById('produits'); return s ? Math.max(0, s.getBoundingClientRect().top + scrollY - 40) : 1000; });
    await capturer(page, `real-${id}-2`, 0, y);
    await ctx.close();
  }
  if (existsSync(join(operia, 'outils', 'apercu.mjs'))) {
    const r = spawnSync('node', ['outils/apercu.mjs'], { cwd: operia, encoding: 'utf8' });
    if (r.status !== 0) { console.error(r.stdout + r.stderr); process.exit(1); }
    const ctx = await b.newContext({ viewport: { width: L, height: H + 90 }, deviceScaleFactor: echelle, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(pathToFileURL(join(operia, 'demonstration.html')).href);
    await page.waitForTimeout(2500);
    const cadre = page.frames().find((f) => f !== page.mainFrame());
    await cadre.evaluate(() => { const m = document.querySelector('.maquette'); if (m) m.remove(); document.querySelectorAll('.bar').forEach((e) => e.remove()); });
    const zone = await page.locator('iframe').first().boundingBox();
    for (const [nom, y] of [['real-operia', 0], ['real-operia-2', 1100]]) {
      await cadre.evaluate((y) => scrollTo(0, y), y);
      await page.waitForTimeout(900);
      await page.screenshot({ path: join(tmp, nom + '.png'), clip: { x: zone.x, y: zone.y, width: L, height: H } });
      spawnSync('convert', [join(tmp, nom + '.png'), '-resize', '1600x1000!', '-strip', '-interlace', 'JPEG', '-quality', '82', join(sortie, nom + '.jpg')]);
      console.log('public/assets/photos/' + nom + '.jpg');
    }
    const ctxM = await b.newContext({ viewport: { width: 390, height: 560 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const pm = await ctxM.newPage();
    await pm.goto(pathToFileURL(join(operia, 'demonstration.html')).href); await pm.waitForTimeout(2500);
    const cm = pm.frames().find((f) => f !== pm.mainFrame());
    await cm.evaluate(() => { const m = document.querySelector('.maquette'); if (m) m.remove(); document.querySelectorAll('.bar').forEach((e) => e.remove()); });
    const zm = await pm.locator('iframe').first().boundingBox();
    await pm.screenshot({ path: join(tmp, 'offre-entreprise.png'), clip: { x: zm.x, y: zm.y, width: 390, height: 487 } });
    spawnSync('convert', [join(tmp, 'offre-entreprise.png'), '-resize', '1200x1500!', '-strip', '-interlace', 'JPEG', '-quality', '80', join(sortie, 'offre-entreprise.jpg')]);
    console.log('public/assets/photos/offre-entreprise.jpg');
    await ctxM.close();
    await ctx.close();
  }

  /* Visuels de l'accueil et des offres : toujours des captures réelles (jamais de cadre de téléphone), aux formats 4:5 du site */
  const convertir = (...args) => { const r = spawnSync('convert', args); if (r.status !== 0) { console.error('convert a échoué : ' + r.stderr); process.exit(1); } };
  const mobile = async (url, nom, ecran) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: ecran }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(url); await page.waitForTimeout(900);
    return { ctx, page };
  };
  const tuiles = [];
  for (const [contenu, id] of sites) {
    const { ctx, page } = await mobile(pathToFileURL(join(tmp, 'moteur-' + id + '.html')).href, id, 487);
    await page.evaluate(() => { const m = document.querySelector('.maquette'); if (m) m.remove(); document.querySelectorAll('.bar').forEach((e) => e.remove()); });
    /* Coupe propre : la capture s'arrête à la fin du dernier bloc entièrement visible (titre, paragraphe, image, bouton), le reste prend la couleur de fond de la page */
    const coupe = await page.evaluate(() => {
      let bas = 0;
      for (const e of document.querySelectorAll('body *')) {
        const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
        if (!r.height || r.height < 8 || cs.position === 'fixed' || cs.position === 'sticky' || cs.visibility === 'hidden') continue;
        if (!e.matches('h1,h2,h3,p,img,a.btn,a[class*=btn],button,figure,picture,ul,ol,li,header,nav')) continue;
        if (r.bottom <= window.innerHeight - 6 && r.bottom > bas) bas = r.bottom;
      }
      return { bas: Math.max(300, Math.ceil(bas + 18)), fond: getComputedStyle(document.body).backgroundColor };
    });
    await page.screenshot({ path: join(tmp, 'tuile-' + id + '.png') });
    const [, rr, gg, bb] = (coupe.fond.match(/\d+/g) || []).length >= 3 ? ['', ...coupe.fond.match(/\d+/g)] : ['', 255, 255, 255];
    const fondHex = '#' + [rr, gg, bb].map((v) => Number(v).toString(16).padStart(2, '0')).join('');
    convertir(join(tmp, 'tuile-' + id + '.png'), '-crop', `780x${Math.min(974, coupe.bas * 2)}+0+0`, '+repage', '-background', fondHex, '-gravity', 'north', '-extent', '780x974', join(tmp, 'tuile-' + id + '.png'));
    tuiles.push(join(tmp, 'tuile-' + id + '.png'));
    convertir(join(tmp, 'tuile-' + id + '.png'), '-strip', '-interlace', 'JPEG', '-quality', '80', join(sortie, 'tuile-' + id + '.jpg')); console.log('public/assets/photos/tuile-' + id + '.jpg');
    /* offres : une partie plus bas dans la page */
    const cible = { 'plombier-exemple': ['produits', 'offre-vitrine'], 'fleuriste-exemple': ['offres', 'offre-catalogue'] }[id];
    if (cible) {
      const ctx2 = await b.newContext({ viewport: { width: 390, height: 487 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
      const p2 = await ctx2.newPage(); await p2.goto(pathToFileURL(join(tmp, 'moteur-' + id + '.html')).href); await p2.waitForTimeout(700);
      await p2.evaluate(() => { const m = document.querySelector('.maquette'); if (m) m.remove(); document.querySelectorAll('.bar').forEach((e) => e.remove()); });
      await p2.evaluate((c) => { const e = document.getElementById(c); scrollTo(0, e.getBoundingClientRect().top + scrollY - 20); }, cible[0]); await p2.waitForTimeout(700);
      await p2.screenshot({ path: join(tmp, cible[1] + '.png') });
      convertir(join(tmp, cible[1] + '.png'), '-resize', '1200x1500!', '-strip', '-interlace', 'JPEG', '-quality', '80', join(sortie, cible[1] + '.jpg')); console.log('public/assets/photos/' + cible[1] + '.jpg');
      await ctx2.close();
    }
    await ctx.close();
  }
  /* Accueil : les quatre démonstrations côte à côte, pour montrer que deux sites ne se ressemblent pas */
  convertir(...tuiles, '-resize', '594x742!', '-bordercolor', '#f6f6f2', '-border', '3', '(', '-clone', '0,1', '+append', ')', '(', '-clone', '2,3', '+append', ')', '-delete', '0-3', '-append', '-resize', '1200x1500!', '-strip', '-interlace', 'JPEG', '-quality', '80', join(sortie, 'accueil.jpg'));
  console.log('public/assets/photos/accueil.jpg');
  /* « La main dessus » : la page de modification d'une démonstration, sur un téléphone */
  { const { ctx, page } = await mobile(pathToFileURL(join(racine, 'public', 'demos', 'restaurant-exemple.html')).href, 'intro', 844);
    await page.getByRole('button', { name: /Essayer la page de modification/ }).click(); await page.waitForTimeout(500);
    const mdp = page.locator('input[type=password]'); if (await mdp.count()) { await mdp.fill('demonstration'); await page.keyboard.press('Enter'); await page.waitForTimeout(1500); }
    await page.screenshot({ path: join(tmp, 'intro.png'), clip: { x: 0, y: 0, width: 390, height: 487 } });
    convertir(join(tmp, 'intro.png'), '-resize', '1200x1500!', '-strip', '-interlace', 'JPEG', '-quality', '80', join(sortie, 'intro.jpg')); console.log('public/assets/photos/intro.jpg');
    await ctx.close(); }
  await b.close();
} finally { rmSync(tmp, { recursive: true, force: true }); }
