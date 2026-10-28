# Atelier Muel : site et espace de modification

Le site de Grégoire Muel EI (nom commercial Atelier Muel) : création et refonte de sites pour les commerces, les artisans et les entreprises. Moteur « agence » de la méthode (`gregoiremuel/kit-sites-boutiques`), hébergé gratuitement chez Cloudflare, avec son espace de modification (`/admin`).

- **Accueil** : promesse, trois repères, présentation (« Un site, et la main dessus ») et chiffres, les trois offres avec leur prix de départ, le bloc « Essayez l'espace de modification » (liens vers les démonstrations), les réalisations, la méthode, l'appel « Une maquette gratuite en 48 h ».
- **Offres** (`/expertises`) : site vitrine, boutique et catalogue, site d'entreprise ou refonte, avec le détail, la méthode et ce qui est compris dans chaque site.
- **Réalisations** : Opéria (refonte en cours), la fromagerie de quartier (site d'exemple tiré de la maquette, nom masqué) et la joaillerie imaginaire, chacune avec sa fiche et un bouton vers la démonstration.
- **L'atelier** (`/agence`) : qui tu es, ta façon de travailler, tes engagements.
- **Contact** : formulaire « Votre demande » (créer, refaire, boutique, entretien, autre). Les demandes arrivent dans l'espace de modification, avec un statut.
- **Démonstrations** : `public/demos/fromagerie-exemple.html` et `public/demos/joaillerie-exemple.html`, deux commerces imaginaires que le visiteur peut modifier lui-même (rien n'est publié, tout reste dans son navigateur). Non indexées par Google.
- **Visuels** : de vraies captures des sites (parties sans photo) dans des cadres d'ordinateur et de téléphone, fabriquées par script. Aucune photo de banque d'images sur ce site.
- **Design** : vert très sombre et laiton, titres en Playfair Display, texte en Manrope.

## À valider par Greg avant d'ouvrir

1. **Prix** : 590 € puis 29 €/mois viennent de ta méthode. **1 290 €** (boutique) et **1 900 €** (site d'entreprise) sont des propositions : change-les dans « Offres et méthode ».
2. **Ce que couvrent les 29 € par mois** (hébergement, sauvegarde, petites modifications ?) : à écrire dans les offres si tu veux l'afficher.
3. **Opéria** : leur accord pour être cités. Sans accord : décocher « Afficher sur le site » dans la réalisation. Avec accord et site ouvert : coller leur adresse dans « Lien à ouvrir ».
4. **Téléphone et e-mail pro** à afficher (rubrique « Coordonnées »), et l'e-mail des mentions légales.
5. **Zone** : « Paris et alentours, et à distance partout en France ».
6. **TVA** : « TVA non applicable, article 293 B du CGI » suppose que tu es en franchise de TVA (cas normal d'une micro-entreprise qui n'a pas choisi la TVA).
7. **Adresse** : les mentions légales affichent l'adresse déclarée au registre (36 rue Chardon-Lagache), obligatoire. Elle n'apparaît nulle part ailleurs sur le site. Si c'est ton domicile et que tu préfères ne pas la publier, il faut une domiciliation d'entreprise.
8. **Phrase « Artisan joaillier de formation »** dans « L'atelier » : à garder ou à retirer.
9. **Portrait** : sans photo, tes initiales s'affichent.
10. **Mentions légales et confidentialité** : brouillons, à faire relire.

## Mettre en ligne depuis un téléphone (GitHub + Cloudflare)

Comme pour Opéria, avec le dépôt `site-atelier-muel` :

1. https://dash.cloudflare.com : « Workers & Pages », « Create application », « Import a repository », « Get started ».
2. Autoriser Cloudflare sur le dépôt `site-atelier-muel`, puis le choisir.
3. Nom du projet : **site-atelier-muel** (exactement). « Save and Deploy ».
4. « Settings », « Variables and Secrets » : ajouter deux **Secrets** (pas des variables) `ADMIN_HASH` et `SESSION_SECRET`, valeurs données par Claude ou par `npm run mot-de-passe`. Relancer un déploiement.
5. Adresse : `site-atelier-muel.<ton-compte>.workers.dev`, espace de modification à la même adresse suivie de `/admin`.

Tant que `MAQUETTE` vaut « oui » dans `wrangler.jsonc` : bandeau « version de travail », non indexé, formulaire en démonstration. Une fois les points ci-dessus validés : demander à Claude de passer MAQUETTE à « non » (le site devient public et les demandes arrivent vraiment), puis brancher Web3Forms pour recevoir chaque demande par e-mail.

**Nom de domaine** (plus tard) : l'acheter, l'ajouter à Cloudflare, puis demander à Claude d'ajouter la route `{ "pattern": "ton-domaine.fr", "custom_domain": true }`.

## Refaire les démonstrations

Elles viennent des moteurs vitrine et catalogue du kit, avec les contenus de `exemples/`. Dans Claude Code :

> Copie `modeles/fromagerie-la-fontaine` et `modeles/maison-tcheskiss` du kit dans un dossier temporaire, lance `node outils/apercu.mjs` avec `exemples/vitrine-fromagerie.json` puis `exemples/catalogue-joaillerie.json`, remplace le bandeau « Proposition de site pour… » par « Site d'exemple : commerce imaginaire… », et copie les deux `demonstration.html` dans `public/demos/` (fromagerie-exemple.html, joaillerie-exemple.html).

## Les commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm run verifier` | Contrôle le contenu et liste ce qui reste à faire. |
| `npm test` | Lance le vrai serveur sur l'ordinateur et le teste de bout en bout. |
| `npm run apercu` | Fabrique `demonstration.html` (le site et son espace de modification, en un fichier). |
| `npm run mot-de-passe` | Crée le mot de passe de l'espace de modification et son empreinte. |

## Fichiers

| Fichier | Rôle |
|---|---|
| `contenu-initial.json` | Le contenu de départ (une fois en ligne, il vit dans l'espace de modification) |
| `exemples/` | Contenus des deux commerces imaginaires des démonstrations |
| `public/demos/` | Les deux démonstrations à essayer |
| `public/assets/photos/` | Visuels (captures des sites dans des cadres) |
| `public/assets/atelier-muel-monogramme.svg` | Icône d'onglet |
| `src/worker.js`, `public/assets/*`, `outils/` | Le moteur agence (voir le kit) |
