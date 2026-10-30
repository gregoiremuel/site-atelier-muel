# Reprise dans une nouvelle session (30 octobre 2026)

## Prompt à coller en premier message (après un « clear »)
> Lis `CLAUDE.md`, `LISEZMOI.md`, `DESIGN.md`, `docs/REPRISE.md`, `docs/CONFORMITE.md`. Ajoute le dépôt `gregoiremuel/kit-sites-boutiques` (lis son `LISEZMOI.md` et `METHODE.md`, parties 2.11 à 2.13 ; ses skills de design sont dans `.claude/skills/`) et, si on parle d'Opéria, `gregoiremuel/site-operia` (privé). Branche de travail `ccr-04ab3608-pccm5z` dans les trois dépôts (si elle est fusionnée : repars de `main` avec le même nom). Sujet du jour : [à préciser]. Réponse finale en trois parties : Réponse claire, Niveau de confiance (0.0 à 1.0 avec la raison), Réserves clés.

## Où on en est (30/10/2026)
- **Branche `ccr-04ab3608-pccm5z`** poussée dans les trois dépôts, **pas encore fusionnée dans `main`** : fusion propre vérifiée (0 conflit). Rien n'est déployé : Cloudflare est injoignable depuis l'espace de Claude ; le site et Opéria passent en ligne quand Greg fusionne dans `main` (ou lance `npm run deploy` chez lui).
- **Fait le 30/10** : conformité web (`docs/CONFORMITE.md`, prompt `docs/PROMPT-CONFORMITE.md`), titres et descriptions Google page par page (clé `seo`), refonte visuelle du gabarit « édition » v2 (`DESIGN.md`), gabarit « classique » v2 pour Opéria, skills de direction artistique installés dans le kit (`METHODE.md` 2.13), export du VPS lu (dépôt privé `gregoiremuel/vps-docs`).
- **Correctifs du 30/10 (soir)** : téléphones de l'accueil alignés, étiquettes « Démonstration » sorties des photos, cartes de réalisations alignées (photo d'abord, texte dessous), bande d'appel des pages intérieures réparée, captures des démonstrations coupées sur un bloc entier (`npm run vignettes`), textes passés à la première personne (« je »), mots très longs qui passent à la ligne, survol seulement avec une souris, cibles tactiles de 44 px, retard d'apparition supprimé après l'affichage. Nouveaux outils du kit : `outils/controle-visuel.mjs`, `outils/captures.mjs`, `outils/pire-cas.mjs`, `outils/chrome-root.sh` ; skill chapeau `creer-site-pro`.
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
