# Reprise dans une nouvelle session (29 octobre 2026)

## Prompt à coller en premier message (après un « clear »)
> Lis `CLAUDE.md`, `LISEZMOI.md`, puis `docs/REPRISE.md` et `docs/PLAN-REFERENCEMENT-IA.md`. Ajoute le dépôt `gregoiremuel/kit-sites-boutiques` (branche principale ; la branche de travail précédente est fusionnée : repars de `main` avec le même nom de branche, dans les deux dépôts). Sujet du jour : **faire monter le référencement des clients (offre Visibilité Google) et l'automatisation par IA**. Reprends les décisions de la partie 6 du plan, pose-moi seulement les questions qui bloquent, propose le palier 0 puis le script du palier 1, et prépare les prompts mensuels et le modèle de rapport. Ne touche pas au site sans me le dire. Réponse finale en trois parties : Réponse claire, Niveau de confiance (0.0 à 1.0 avec la raison), Réserves clés. Modèle : Sonnet, effort moyen ; sous-traite les tâches simples à Haiku.

## Où on en est
- **Site** (`site-atelier-muel`) et **moteur du kit** (`kit-sites-boutiques`, `modeles/agence-operia`) : tout est fusionné dans `main`. Le site est en ligne sur l'adresse provisoire Cloudflare, non indexé (`MAQUETTE` = « oui »). Ne passer `MAQUETTE` à « non » qu'après : franchise de TVA confirmée, nom commercial corrigé au Guichet unique, domaine actif, mentions légales relues.
- **Dossier de Greg** : `docs/DOCUMENT-FINAL.html` (fichier autonome) et l'artifact privé https://claude.ai/artifact/T41MC37ggVH4Q69m2RuxDL. Pour le mettre à jour : modifier la source, la reconstruire (l'artifact et le fichier sont le même contenu) et republier.
- **Contrôles** (tous passent le 29/10/2026) : `npm run verifier`, `npm test` (103 ; 88 moteur agence ; 61 moteur vitrine), `npm run accessibilite` (2 min 30), `npm run referencement`, `npm run rendu <adresse>` (serveur local lancé), Impeccable en détection seule.
- **Design** : règles dans `docs/REGLES-DESIGN.md` ; bandeau d'accueil gris-bleu avec ordinateur et téléphones ; tailles mobiles 28/26/20/17 px.
- **Prix** (propositions) : 590 € une fois, 1 290 €, 1 900 € ; Sérénité 19 €, Croissance 49 €, Visibilité Google 39 € par mois. Jugés cohérents ; le frein est la preuve et le temps de prospection.

## Règles de travail
- Français, tutoiement, direct. Ne rien inventer ; ce qui n'est pas vérifié est « à vérifier ». Pas de conseil juridique ou fiscal présenté comme sûr.
- Branche de travail `ccr-04ab3608-pccm5z` ; demande de fusion vers `main` des deux dépôts ; toute amélioration du moteur se reporte dans `modeles/agence-operia`.
- Skills : `.claude/skills/revue-site-pro` et `site-joaillerie` (dépôt du kit), `no-ai-slop` et `web-design-guidelines` (locaux).
- Pièges déjà rencontrés : `METHODE.md` partie 4 (version 15).

## Environnement de l'espace de travail
Cloudflare et le site en ligne sont injoignables ; les domaines externes sont refusés (pas de comparaison en direct avec d'autres sites) ; Chromium en root demande `--no-sandbox` ; `pkill -f "[w]rangler"` ; installer les dépendances (`npm install`) dans chaque modèle avant `npm test`.

## Ce qui reste à Greg
Section 2 de l'artifact : ACRE avant le 17/12/2026, CFE avant le 31/12/2026, franchise de TVA, nom commercial, compte bancaire, e-mail pro, domaine, RC Pro, plateforme de factures, mentions relues, puis « go » pour ouvrir le site. Ensuite : trois pilotes, portrait de travail, avis.

## Chantiers futurs (à la demande d'un client)
Réservation avec créneaux, acompte en ligne, version anglaise, chatbot, hébergement en France ; automatisation du référencement (`docs/PLAN-REFERENCEMENT-IA.md`).

## Site de joaillerie (Atelier Muel)
Skill `site-joaillerie` : modèle catalogue, identité propre, points à décider avec Greg avant de coder.
