# Reprise dans une nouvelle session (30 octobre 2026)

## État réel au 06/11/2026 (GLM) — LIRE CE BLOC EN PREMIER

### Le point bloquant en cours (première chose à faire en reprenant)
**La PR n° 30 est fusionnée dans `main`, mais le site ne répond pas** : `https://sterenncreation.fr` et `https://www.sterenncreation.fr` → **erreur 521**, et le site provisoire `https://site-atelier-muel.gregoire-muel.workers.dev` → **404** (mesuré à l'instant). Diagnostic probable : la construction Workers Builds après fusion a échoué ou tourné mal — piste n° 1 : **conflit entre les `custom_domain` de `wrangler.jsonc` et les enregistrements A proxied existants** (`sterenncreation.fr` et `www` → 213.186.33.5, la page parking OVH) ; l'erreur classique de wrangler est « record already exists ».
**Marche à suivre** :
1. Re-tester : `curl.exe -s -o NUL -w "%{http_code}" https://sterenncreation.fr` (et workers.dev).
2. Toujours 521/404 → **avec Greg**, dashboard Cloudflare → Workers & Pages → `site-atelier-muel` → **Deployments/Builds** : la dernière construction de `main` est-elle verte ? Si rouge, lire le journal ensemble (capture dans `captures/`, je lis par OCR Windows).
3. **Settings → Domains & Routes** : `sterenncreation.fr` et `www.sterenncreation.fr` y figurent-ils ? S'ils manquent : dans **DNS**, supprimer les enregistrements **A** de `@` et `www` (213.186.33.5) — **garder** MX ×3, TXT SPF (`~all`), TXT `_dmarc`, TXT OVH internes et CNAME ftp — puis rattacher : soit « Retry deployment » de la construction, soit bouton **« Connect Worker » / Add custom domain** sur la page du domaine (zone Overview → DNS → « No Workers connected » → Connect Worker), soit relancer un déploiement (commit trivial sur `main` — demander à Greg).
4. Dès que ça répond **200** : vérifs complètes (accueil 200, `www` → 301 vers domaine nu, `/robots.txt` (Disallow attendu, MAQUETTE=oui), `/sitemap.xml`, `/admin/` connexion, bandeau « version de travail » présent).
5. Puis **mettre à jour le contenu du site en ligne** (sa mémoire KV ne suit pas le dépôt) : `/admin` → rubrique « Coordonnées… » et réglages → `reglages.url` = `https://sterenncreation.fr`, `contact.email` = `contact@sterenncreation.fr`, `mentions.email` idem, `mentions.nom_commercial` = « Sterenn Création ».

### Ce qui est fait et acquis (06/11)
- **Domaine `sterenncreation.fr`** : acheté 05/11 chez OVH (avec Zimbra Starter), **zone Cloudflare ACTIVE** (serveurs `jobs.ns.cloudflare.com` / `shubhi.ns.cloudflare.com`, basculés le 06/11). DNSSEC désactivé chez OVH, **DS retiré partout** (vérifié sur 6 serveurs). ⚠️ Leçon : mon détecteur DS comptait les réponses « NODATA » (SOA) comme des DS présents — **toujours filtrer sur `QueryType -eq 'DS'`** avant de conclure (à reporter dans METHODE.md partie 4).
- **PR n° 30 fusionnée** dans `main` : routes `custom_domain` (`sterenncreation.fr` + `www`), `reglages.url`, e-mail pro dans `contact.email`/`mentions.email`, nom commercial « Sterenn Création » dans les mentions, prix validés (étude `docs/ETUDE-PRIX-2026-11-05.html`, LISEZMOI points 1-2), docs MISE-EN-LIGNE/REFERENCEMENT à jour, testeur 133 ok.
- **E-mail pro opérationnel** : `contact@sterenncreation.fr` (Zimbra OVH, webmail https://mail.zimbra.ovh.net). Outlook mobile configuré et testé (IMAP `imap.mail.ovh.net:993` SSL, SMTP `smtp.mail.ovh.net:465` SSL). App Zimbra abandonnée (déconnexions systématiques). Yahoo/Proton refusés (pas d'IMAP sans OAuth2 / payant).
- **DNS Cloudflare** : MX `mx1/2/3.mail.ovh.net` (1/5/100) et SPF `v=spf1 include:mx.ovh.com ~all` alignés sur la zone OVH, **DMARC posé** (`_dmarc` = `v=DMARC1; p=none; rua=mailto:contact@sterenncreation.fr`). Bot Preference Sync désactivé ; Search/Agents autorisés, Training autorisé.
- **Administratif** : nom commercial **« Sterenn Création » déclaré au Guichet unique le 06/11** (remplace « Atelier Muel »). **ACRE NON demandée** (limite **17/12/2026**) ; impots.gouv.fr jamais ouvert (TVA à confirmer). Décision : pas d'achat de `ateliermuel.fr`/`gregoiremuel.fr` pour l'instant.

### Reste à faire (après le déblocage ci-dessus)
1. DKIM : manager OVH → Web Cloud → Emails → Zimbra → `sterenncreation.fr` → activer/lire le DKIM → coller le TXT `selecteur._domainkey` chez Cloudflare (aucun DKIM dans la zone au 06/11, testé). Test d'envoi vers Gmail et Proton.
2. Réactiver **DNSSEC depuis Cloudflare** (DNS → Settings → Enable DNSSEC → DS à déclarer chez OVH) une fois le site stabilisé.
3. Avant l'ouverture : fiche RNE affichant « Sterenn Création » (quelques jours), TVA confirmée, mentions + engagements relus par Greg, photos (`docs/PHOTOS-A-FOURNIR.md`), décision marque visible (Sterenn Création vs Grégoire Muel), éventuel accord Opéria.
4. Ouverture : `MAQUETTE` à « non » + `workers_dev: false` + contrôles complets + PR, sur le « go » de Greg. Puis Search Console (propriété Domaine, DNS, `https://sterenncreation.fr/sitemap.xml`) et fiche Google. Puis lots D (/admin enrichi), E (VPS/n8n), H (DOCUMENT-FINAL.html refait).

## État réel au 05/11/2026 (soir, GLM)
- **Domaine** : `sterenncreation.fr` acheté chez OVHcloud (commande 263462179, livrée le 05/11 ; 4,99 € HT + Zimbra Starter 3,60 €/an offert la 1re année). Le nom commercial « Sterenn Création » est différent du nom légal : à déclarer au Guichet unique avant l'ouverture. `ateliermuel.fr` et `gregoiremuel.fr` non achetés (à réserver si voulu).
- **E-mail pro** : boîte `contact@sterenncreation.fr` créée sur le Zimbra (webmail https://mail.zimbra.ovh.net, app mobile Zimbra ; IMAP `imap.mail.ovh.net:993`, SMTP `smtp.mail.ovh.net:465`). MX actuels : `mx0/1/2/3.mail.ovh.net`.
- **Cloudflare** : zone `sterenncreation.fr` ajoutée (offre Free) ; MX et SPF recopiés ; serveurs à coller chez OVH : `jobs.ns.cloudflare.com` et `shubhi.ns.cloudflare.com`. **DNSSEC désactivé chez OVH** le 05/11 vers 23 h (DS en cours de disparition, TTL 1 h, jusqu'à 24 h) : basculer les serveurs de noms seulement quand le DS a disparu partout.
- **Lot B prêt** (branche, demande de fusion) : routes `sterenncreation.fr` + `www` décommentées dans `wrangler.jsonc`, `reglages.url` = `https://sterenncreation.fr`, testeur mis à jour (l'ancien domaine était codé en dur). `npm run verifier` 0 erreur, `npm test` **133 ok, 0 échec**. **Fusionner seulement quand la zone Cloudflare est « Active »** (sinon le déploiement échoue).
- **Prix validés par Greg le 05/11** (voir `docs/ETUDE-PRIX-2026-11-05.html`) : 590 / 1 290 / 1 900 € et 19 / 49 / 39 € inchangés ; pas de prix pilote — deux chantiers « connaissances » au tarif plein, avec accord écrit d'affichage et témoignage. LISEZMOI à jour (points 1 et 2).
- **À faire ensuite** : bascule serveurs de noms → fusion lot B → DKIM/DMARC chez Cloudflare + test délivrabilité → liste « À valider » restante → `MAQUETTE` à « non » → Search Console + fiche Google. Ticket OVH si problème de livraison (non nécessaire à ce jour).

## État réel au 04/11/2026 (lot A, contrôles relancés sous Windows par GLM)
- **Environnement de Greg** : Windows, Node 24.18, GitHub connecté (`gregoiremuel`). Les dépôts `kit-sites-boutiques` et `agence-eims` sont clonés à côté du site. Tout est fusionné dans `main` (le site était à jour au 30/10, rien à refusionner).
- **Correctif Windows** : `outils/tester.mjs` appelait `wrangler` à la façon Linux (échec ENOENT/INVAL sous Windows) ; il appelle maintenant wrangler par son point d'entrée JS et arrête le serveur de test par `taskkill` (plus de serveur fantôme sur le port 8799). Reporté dans `modeles/agence-operia` du kit. Playwright ajouté en dépendance de développement (nécessaire à `npm run accessibilite`).
- **Contrôles du 04/11** : `npm run verifier` aucune erreur, 0 alerte ; `npm test` **132 ok, 0 échec** ; `npm run accessibilite` aucun problème ; `npm run referencement` un point à revoir (/agence, 133 mots : peu de texte) ; `npm run look-ia` sans nouvel indice.
- **Pas encore vérifié** (Cloudflare injoignable depuis l'agent) : construction `main` verte, Secrets `ADMIN_HASH`/`SESSION_SECRET` en place, `/admin` en ligne, cause des constructions de branches qui échouent en 0 seconde. **Greg doit regarder** (voir ci-dessous).
- **Sécurité faite le 05/11** : mot de passe et Secrets `ADMIN_HASH`/`SESSION_SECRET` remplacés par Greg (posés par `npx wrangler secret put` après que le tableau Cloudflare les avait mis dans l'environnement « Preview » — piège à connaître) ; connexion à `/admin` constatée par Greg.
- **Cause des constructions de branches en échec trouvée** (journal lu avec Greg le 04/11) : Workers Builds lance `npx wrangler preview` pour les branches, et wrangler 4.149 exige un bloc `previews` dans `wrangler.jsonc` (ajouté le 05/11, avec `MAQUETTE: "oui"`). Le `main` n'a jamais été affecté.
- **Décisions du jour** : domaine probable « Sterenn Création » (Greg décide ce soir — attention : nom différent du nom légal, à réfléchir pour le registre et la protection du nom) ; e-mail pro voulu sur le futur domaine ; VPS Hostinger accessible ; rien de fait côté administratif (ACRE avant le 17/12, CFE avant le 31/12).

## Prompt à coller en premier message (après un « clear »)
> Lis `AGENTS.md` puis `docs/REPRISE.md` du dépôt, **en commençant par le bloc « État réel au 06/11/2026 »**. Reprends exactement où on s'est arrêté : la PR n° 30 est fusionnée mais `sterenncreation.fr` répond 521 et le site provisoire 404 — diagnostique avec moi (construction Cloudflare, Domains & Routes), répare, fais les vérifications complètes, puis continue la liste « Reste à faire ». Français, tutoiement, réponse en trois parties, clic par clic pour mes gestes.

Le skill `sites-boutiques` (dans le kit, importé aussi dans l'app) dit déjà quoi lire, quels skills de design lancer, quels contrôles faire et comment mettre en ligne : inutile de tout redire.

## Où on en est (30/10/2026)
- **Branche `ccr-04ab3608-pccm5z`** poussée dans les trois dépôts, **pas encore fusionnée dans `main`** : fusion propre vérifiée (0 conflit). Rien n'est déployé : Cloudflare est injoignable depuis l'espace de Claude ; le site et Opéria passent en ligne quand Greg fusionne dans `main` (ou lance `npm run deploy` chez lui).
- **Fait le 30/10** : conformité web (`docs/CONFORMITE.md`, prompt `docs/PROMPT-CONFORMITE.md`), titres et descriptions Google page par page (clé `seo`), refonte visuelle du gabarit « édition » v2 (`DESIGN.md`), gabarit « classique » v2 pour Opéria, skills de direction artistique installés dans le kit (`METHODE.md` 2.13), export du VPS lu (dépôt privé `gregoiremuel/vps-docs`).
- **Correctifs du 30/10 (soir)** : téléphones de l'accueil alignés, étiquettes « Démonstration » sorties des photos, cartes de réalisations alignées (photo d'abord, texte dessous), bande d'appel des pages intérieures réparée, captures des démonstrations coupées sur un bloc entier (`npm run vignettes`), textes passés à la première personne (« je »), mots très longs qui passent à la ligne, survol seulement avec une souris, cibles tactiles de 44 px, retard d'apparition supprimé après l'affichage. Nouveaux outils du kit : `outils/controle-visuel.mjs`, `outils/captures.mjs`, `outils/pire-cas.mjs`, `outils/chrome-root.sh` ; skill chapeau `creer-site-pro` (réuni le 31/10/2026 dans le skill unique `sites-boutiques`).
- **Contrôles du 30/10** : site `npm test` 132 ok, accessibilité et rendu sans point, référencement 0 point ; moteur du kit 116 ok ; Opéria 117 ok et accessibilité sans point.
- **À savoir** : si le site en ligne a déjà un contenu dans sa mémoire (KV), les photos d'offres, la photo de l'accueil et le nouveau titre n'y apparaissent qu'après modification dans `/admin` (les titres `seo` s'appliquent toujours). Réseau de la session : `images.unsplash.com` répond, mais ni `unsplash.com` ni les banques d'archives ni Instagram.
- **Tout est dans `main`** des trois dépôts (kit, site, Opéria) au soir du 30/10/2026. Repartir de `main` avec la branche `ccr-04ab3608-pccm5z`. Question en suspens pour Greg : retirer ou non du dépôt public `site-atelier-muel` les images d'Opéria (`real-operia*.jpg`, `offre-entreprise.jpg`) tant qu'Opéria n'a pas donné son accord.
- **Ce que Greg doit faire** : voir la liste « À valider » du `LISEZMOI.md`, plus : e-mail pro (mentions et confidentialité), téléphone de l'hébergeur Cloudflare, domaine puis `MAQUETTE` à « non » avant d'envoyer le plan du site à la Search Console, secrets Cloudflare (`N8N_WEBHOOK_URL`, `N8N_SECRET`, `INDEXNOW_KEY`), double authentification n8n (VPS). Opéria : accord et détails à confirmer avec eux, photos à héberger, 20 anciens chantiers à reprendre (mémoire du dépôt `vps-docs`).

## Historique (29/10/2026, soir)
- **Site** : en ligne sur l'adresse provisoire Cloudflare, non indexé (`MAQUETTE` = « oui »). Ouverture après : franchise de TVA confirmée, nom commercial corrigé au Guichet unique, domaine actif, mentions relues.
- **Tout est fusionné dans `main`** (site et kit, demandes de fusion n° 15, 16, 17 et suivante). Détail de la journée : `docs/AUDIT-2026-10-29.md` (audit, quatre priorités, démonstrations entièrement différentes, décisions de Greg en partie 9). Avant cela :
  - Offre **Visibilité Google** : prompts mensuels, modèle de rapport, script du palier 1 (`kit/visibilite-google/`, `kit/outils/visibilite-google.mjs`).
  - **Automatisation des demandes** (n8n sur le VPS Hostinger) : trois flux, scripts du VPS, pas-à-pas (`kit/automatisation/README.md`). Le moteur agence copie les demandes vers n8n seulement si les Secrets `N8N_WEBHOOK_URL` et `N8N_SECRET` existent ; champ « Traitement automatique des demandes » ajouté à `/admin` (vide).
  - **Vendre** : diagnostic de fiche en une page (`outils/diagnostic-fiche.mjs`), cohérence des coordonnées (`outils/coherence.mjs`), suivi de prospection (`outils/prospection.mjs`).
  - **Référencement** : `npm run referencement` dans les trois moteurs ; la vitrine a désormais `robots.txt`, plan du site, canonique, image de partage ; le catalogue a des descriptions par page et la canonique ; mise en route Google à la livraison (`kit/livraison/MISE-EN-ROUTE-GOOGLE.md`).
  - **Contrat de sous-traitance** : Anthropic en annexe 3, annexe 1 bis pour Visibilité Google (à faire relire).
- **Contrôles** (29/10, soir) : site `npm test` 104 ok ; moteurs agence 89, vitrine 63, catalogue 57 ; accessibilité des trois moteurs sans point ; essais des outils du kit 26 ok.
- **Dossier de Greg** : `docs/DOCUMENT-FINAL.html` et l'artifact https://claude.ai/artifact/T41MC37ggVH4Q69m2RuxDL (pas encore mis à jour avec le travail du 29/10 au soir).

## Ce que Greg doit faire (dans l'ordre, rien d'autre ne dépend de Claude)
1. Administratif déjà connu : ACRE avant le 17/12/2026, CFE avant le 31/12/2026, franchise de TVA, nom commercial au Guichet unique, compte bancaire, RC Pro, plateforme de factures.
2. **E-mail pro** avec accès SMTP, **domaine**.
3. **Clé API Anthropic** (console.anthropic.com) avec un plafond de dépense.
4. **VPS** : regarder le pays du centre de données dans hPanel ; puis soit l'installation guidée (`kit/automatisation/README.md`, environ 1 h), soit Remote Control pour que Claude l'installe (utilisateur `greg-claude`, `claude remote-control` dans le dossier du kit).
5. **Bot Telegram** (@BotFather) ; WhatsApp plus tard (compte Meta Business).
6. Faire relire : mentions, confidentialité (avec le texte « Traitement automatique »), contrat de sous-traitance (annexes 1 bis et 3).
7. « Go » pour ouvrir le site, puis Secrets n8n dans Cloudflare.
8. Fusionner les deux demandes de fusion quand tout est relu.
9. Premier pilote (commerçant, accord écrit) : diagnostic, maquette, puis Visibilité Google.

## Règles de travail
- Français, tutoiement, direct. Ne rien inventer ; ce qui n'est pas vérifié est « à vérifier ». Pas de conseil juridique ou fiscal présenté comme sûr.
- Toute amélioration du moteur se reporte dans `modeles/agence-operia` (et inversement).
- Pièges : `METHODE.md` partie 4 (version 16).

## Environnement de l'espace de travail
Cloudflare, le site en ligne et le VPS sont injoignables depuis l'espace de Claude ; Chromium en root demande `--no-sandbox` ; `pkill -f "[w]rangler"` ; `npm install` dans chaque modèle avant `npm test` ; `node --test <fichier>` (pas un dossier) avec Node 22.

## Chantiers futurs
Réservation avec créneaux, acompte en ligne, version anglaise, chatbot (sur devis), hébergement en France, API de la fiche Google (palier 2, accès à demander à Google), tableau de bord des clients (palier 3).
