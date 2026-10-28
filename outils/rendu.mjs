// Contrôle du rendu réel (docs/REGLES-DESIGN.md) : tailles de texte, débordement mobile, contenu visible au chargement, surtitres, alt des images.
// Usage : node outils/rendu.mjs http://127.0.0.1:8787   (lancez d'abord « npm run dev » ; demande Playwright)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright est absent : npm i -D playwright, ou utilisez le Playwright global (NODE_PATH).'); process.exit(1); }
const base = (process.argv[2] || 'http://127.0.0.1:8787').replace(/\/$/, '');
const pages = ['/', '/expertises', '/realisations', '/agence', '/engagements', '/contact', '/site-restaurant', '/site-plombier', '/site-fleuriste', '/site-commerce-de-bouche', '/visibilite-google', '/mentions-legales', '/confidentialite'];
const navigateur = await chromium.launch(); let echecs = 0;
for (const [nom, vp] of [['bureau', { width: 1366, height: 820 }], ['mobile', { width: 390, height: 800 }]]) {
  const page = await navigateur.newPage({ viewport: vp });
  for (const chemin of pages) {
    const rep = await page.goto(base + chemin); if (!rep || rep.status() !== 200) continue;
    await page.waitForTimeout(1300);
    const r = await page.evaluate(() => {
      const pb = [], visible = (e) => { const c = getComputedStyle(e); return c.display !== 'none' && c.visibility !== 'hidden'; };
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let t;
      let petit = 0, cache = 0, texte = 0;
      while ((t = w.nextNode())) { const s = t.textContent.trim(); const e = t.parentElement; if (!s || e.closest('script,style,noscript,.hero-compo,[hidden],details:not([open]),[role=tabpanel][hidden]') || !visible(e)) continue; texte++; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs > 0 && fs < 14) petit++; if (parseFloat(getComputedStyle(e).opacity) < 1 && !e.closest('.piege')) cache++; }
      const titres = [...document.querySelectorAll('main h1, main h2, main h3')].filter(visible).map((e) => [e.tagName, parseFloat(getComputedStyle(e).fontSize)]);
      const grosTitre = titres.filter(([t, f]) => (t === 'H1' ? f > 56 : f > 36)).length;
      const mobileGros = innerWidth < 500 ? titres.filter(([t, f]) => (t === 'H1' ? f > 30 : f > 24)).length : 0;
      const decales = []; for (const c of document.querySelectorAll('ul,ol,div,section')) {
        if (c.closest('header,footer,nav') || c.children.length < 2 || c.children.length > 8) continue;
        const rangs = {}; for (const k of c.children) { const r = k.getBoundingClientRect(); if (r.height > 40 && getComputedStyle(k).display !== 'none') (rangs[Math.round(r.top)] = rangs[Math.round(r.top)] || []).push(k); }
        for (const g of Object.values(rangs)) { if (g.length < 2) continue; const a = g.map((k) => { const x = [...k.querySelectorAll('a,.btn,button')].filter((y) => y.offsetParent).pop(); return x ? Math.round(x.getBoundingClientRect().top - k.getBoundingClientRect().top) : null; }); if (a.every((v) => v !== null) && Math.max(...a) - Math.min(...a) > 3 && !c.matches('.contact-grille')) decales.push(c.className || c.tagName); }
      }
      const h = (s) => { const e = document.querySelector(s); return e ? parseFloat(getComputedStyle(e).fontSize) : 0; };
      return { petit, cache, texte, debord: document.documentElement.scrollWidth - innerWidth, h1: h('h1'), sur: [...document.querySelectorAll('main .sur, .tete-page .sur')].filter(visible).length, sansAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length, grosTitre, mobileGros, decales: decales.length };
    });
    const maxH1 = chemin === '/' ? 56 : 48, pb = [];
    if (r.petit) pb.push(r.petit + ' texte(s) sous 14 px'); if (r.cache) pb.push(r.cache + ' texte(s) pas totalement visibles'); if (r.debord > 0) pb.push('débordement de ' + r.debord + ' px');
    if (r.h1 > maxH1 && nom === 'bureau') pb.push('titre de ' + r.h1 + ' px (max ' + maxH1 + ')'); if (r.sur) pb.push(r.sur + ' surtitre(s)'); if (r.sansAlt) pb.push(r.sansAlt + ' image(s) sans alt'); if (r.mobileGros) pb.push(r.mobileGros + ' titre(s) trop gros sur mobile (h1 30 px, h2 et h3 24 px au plus)'); if (r.grosTitre && nom === 'bureau') pb.push(r.grosTitre + ' titre(s) trop gros'); if (r.decales) pb.push(r.decales + ' rangée(s) de blocs dont les liens ne sont pas alignés');
    console.log((pb.length ? 'ÉCHEC  ' : 'ok     ') + (nom + ' ' + chemin).padEnd(34) + pb.join(' ; ')); if (pb.length) echecs++;
  }
  await page.close();
}
await navigateur.close();
console.log(echecs ? '\n' + echecs + ' page(s) à corriger.' : '\nRendu conforme à docs/REGLES-DESIGN.md.');
process.exit(echecs ? 1 : 0);
