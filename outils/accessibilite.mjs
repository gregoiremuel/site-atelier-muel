// Audit d'accessibilité du site (WCAG 2.2 niveau AA) : axe-core lancé par Playwright sur chaque page,
// en bureau, en mobile et avec « moins d'animations », puis un parcours au clavier (anneau de focus visible sur chaque élément).
// Aucun serveur Cloudflare nécessaire : un petit serveur local rend les pages depuis le contenu.
// Usage : npm run accessibilite [fichier de contenu]     (demande Playwright et son navigateur : « npx playwright install chromium »)
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { rendrePage, routes } from '../public/assets/rendu.js';

const racine = fileURLToPath(new URL('..', import.meta.url));
console.log('Audit d’accessibilité : environ 2 min 30, une ligne par page et par mode (bureau, mobile, moins d’animations, clavier).');
const require = createRequire(import.meta.url);
let chromium, axeSource;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright introuvable : « npm i -D playwright » puis « npx playwright install chromium ».'); process.exit(1); }
try { axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'); } catch (e) { console.error('axe-core introuvable : « npm install » dans ce dossier.'); process.exit(1); }

const C = JSON.parse(readFileSync(resolve(process.argv[2] || join(racine, 'contenu-initial.json')), 'utf8'));
const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const serveur = createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const f = join(racine, 'public', decodeURIComponent(url.pathname));
  if (/^\/(assets|fonts)\//.test(url.pathname) && existsSync(f) && statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f)); return; }
  const { statut, html } = rendrePage(C, url.pathname + url.search, { maquette: true, lienAdmin: '/admin/' });
  res.writeHead(statut, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html);
});
await new Promise((ok) => serveur.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${serveur.address().port}`;

const MODES = [['bureau', { viewport: { width: 1280, height: 900 } }], ['mobile', { viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true }], ['moins d’animations', { viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' }]];
const navigateur = await chromium.launch();
let problemes = 0;
for (const route of routes(C).filter((r) => !r.includes('?'))) {
  for (const [mode, opts] of MODES) {
    const ctx = await navigateur.newContext(opts);
    const page = await ctx.newPage();
    await page.goto(base + route); await page.waitForTimeout(700);
    /* les apparitions au défilement ne doivent pas fausser la mesure des contrastes */
    await page.evaluate(() => document.querySelectorAll('.rev').forEach((e) => e.classList.add('vu')));
    await page.waitForTimeout(1600);
    await page.addScriptTag({ content: axeSource });
    const v = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } })).violations
      .map((x) => `${x.id} (${x.impact}) ×${x.nodes.length} : ${x.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' ; ')}`));
    const sortDuCadre = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    const cachees = mode === 'moins d’animations' ? await page.evaluate(() => [...document.querySelectorAll('.rev')].filter((e) => getComputedStyle(e).opacity < 0.99).length) : 0;
    const liste = [...v, ...(sortDuCadre ? ['défilement horizontal : la page déborde de l’écran'] : []), ...(cachees ? [`${cachees} élément(s) encore cachés alors que le visiteur demande moins d’animations`] : [])];
    problemes += liste.length;
    console.log(`${liste.length ? 'À CORRIGER' : 'ok        '} ${route} · ${mode}${liste.length ? '\n    ' + liste.join('\n    ') : ''}`);
    if (mode === 'bureau') {
      /* Parcours au clavier : chaque élément atteint doit montrer un anneau de focus épais d'au moins 2 px (ou une ombre) */
      const sans = [];
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press('Tab');
        const r = await page.evaluate(() => {
          const e = document.activeElement; if (!e || e === document.body || e.getBoundingClientRect().width === 0 || e.type === 'date') return null;
          const c = getComputedStyle(e); return { ok: (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 2) || c.boxShadow !== 'none', nom: (e.tagName + ' ' + (e.textContent || e.name || '').trim().slice(0, 30)) };
        });
        if (r && !r.ok) sans.push(r.nom);
      }
      problemes += sans.length;
      console.log(`${sans.length ? 'À CORRIGER' : 'ok        '} ${route} · clavier${sans.length ? ' : pas d’anneau de focus sur ' + [...new Set(sans)].join(', ') : ''}`);
    }
    await ctx.close();
  }
}
await navigateur.close(); serveur.close();
console.log(problemes ? `\n${problemes} point(s) à corriger.` : '\nAucun problème trouvé. (Un audit automatique ne remplace pas un essai au lecteur d’écran.)');
process.exit(problemes ? 1 : 0);
