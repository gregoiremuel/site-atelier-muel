# Reprise dans une nouvelle session (29 octobre 2026, soir)

## Prompt à coller en premier message (après un « clear »)
> Lis `CLAUDE.md`, `LISEZMOI.md`, puis `docs/REPRISE.md`. Ajoute le dépôt `gregoiremuel/kit-sites-boutiques` (lis son `LISEZMOI.md` et `METHODE.md`). Branche de travail `ccr-04ab3608-pccm5z` dans les deux dépôts (si elle est fusionnée : repars de `main` avec le même nom). Sujet du jour : [à préciser]. Ne touche pas au site sans me le dire. Réponse finale en trois parties : Réponse claire, Niveau de confiance (0.0 à 1.0 avec la raison), Réserves clés.

## Où on en est
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
