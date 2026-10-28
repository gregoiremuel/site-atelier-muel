// Fabrique les captures « téléphone » des démonstrations (public/assets/photos/mobile-*.jpg), utilisées dans la composition de l'accueil.
// Usage : node outils/mobiles.mjs   (demande Playwright ; les démonstrations de public/demos/ doivent exister : npm run demos)
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const racine = new URL('../', import.meta.url).pathname;
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright est absent : npm i -D playwright, ou lancez-le avec le Playwright global (NODE_PATH).'); process.exit(1); }
const tmp = mkdtempSync(join(tmpdir(), 'mobiles-'));
const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
for (const id of ['fleuriste-exemple', 'plombier-exemple', 'restaurant-exemple', 'atelier-exemple']) {
  const src = join(racine, 'public/demos', id + '.html');
  if (!existsSync(src)) { console.error('Démonstration absente : ' + src); continue; }
  await page.goto('file://' + src); await page.waitForTimeout(900);
  const png = join(tmp, id + '.png'), jpg = join(racine, 'public/assets/photos', 'mobile-' + id.replace('-exemple', '') + '.jpg');
  await page.screenshot({ path: png });
  execFileSync('python3', ['-c', 'import sys;from PIL import Image;i=Image.open(sys.argv[1]).convert("RGB");i=i.resize((520,1126));i.save(sys.argv[2],quality=78,optimize=True)', png, jpg]);
  console.log('public/assets/photos/mobile-' + id.replace('-exemple', '') + '.jpg');
}
await navigateur.close(); rmSync(tmp, { recursive: true, force: true });
