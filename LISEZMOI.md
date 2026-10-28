# Grégoire Muel, sites internet : site et espace de modification

Le site de Grégoire Muel EI pour son activité de création et refonte de sites (commerces, artisans, entreprises). « Atelier Muel » est gardé pour la joaillerie et n'apparaît pas ici ; seul le nom technique du dépôt et du projet Cloudflare (`site-atelier-muel`) le contient. Moteur « agence » de la méthode (`gregoiremuel/kit-sites-boutiques`), hébergé gratuitement chez Cloudflare, avec son espace de modification (`/admin`).

- **Accueil** : promesse, trois repères, présentation (« Un site, et la main dessus ») et chiffres, les trois offres avec leur prix de départ, le bloc « Essayez l'espace de modification » (liens vers les démonstrations), les réalisations, la méthode, l'appel « Une maquette gratuite en 48 h ».
- **Offres** (`/expertises`) : site vitrine, boutique et catalogue, site d'entreprise ou refonte, avec le détail, **l'abonnement facultatif** (Sans abonnement 0 €, Sérénité 19 €/mois, Croissance 49 €/mois) et la méthode.
- **Réalisations** : Opéria (refonte en cours), un atelier d'ébénisterie imaginaire (site d'artisan avec demande de devis) et une fleuriste imaginaire (site de commerce avec commande à retirer), chacun avec sa fiche et un bouton vers la démonstration.
- **À propos** (`/agence`) : qui tu es, ta façon de travailler, tes engagements.
- **Contact** : formulaire « Votre demande » (créer, refaire, boutique, entretien, autre). Les demandes arrivent dans l'espace de modification, avec un statut.
- **Démonstrations** : `public/demos/atelier-exemple.html` (Atelier du Merrain) et `public/demos/commerce-exemple.html` (Le Pétale Sauvage), deux sites imaginaires que le visiteur peut modifier lui-même (rien n'est publié, tout reste dans son navigateur). Non indexées par Google. Pas de démonstration de joaillerie : ce métier est réservé à Atelier Muel.
- **Visuels** : de vraies captures des sites (parties sans photo) dans des cadres d'ordinateur et de téléphone, fabriquées par script. Aucune photo de banque d'images sur ce site.
- **Design** : gabarit « studio » du moteur (`theme.gabarit`), différent d'Opéria : papier gris froid, encre presque noire, vermillon, titres en Bricolage Grotesque, texte en DM Sans, accueil en deux colonnes, boutons en pastille, bandes arrondies.

## À valider par Greg avant d'ouvrir

1. **Prix** : 590 € (vitrine), **1 290 €** (boutique) et **1 900 €** (entreprise) sont des propositions : change-les dans « Expertises et méthode ». 590 € est sous la fourchette des freelances débutants (800 à 2 500 €) : bon pour les premiers clients, à relever ensuite (voir `METHODE.md`, partie 9).
2. **Abonnement facultatif** (panneau « Abonnement mensuel ») : Sérénité 19 €/mois et Croissance 49 €/mois sont des propositions, avec leurs engagements (« sans engagement de durée », « 30 minutes » et « 2 heures » de modifications par mois, « réponse sous 2 jours ouvrés », mise à jour de la fiche Google, suivi des visites chaque trimestre) : à garder seulement si tu peux les tenir. Le domaine est dit « renouvelé » dans Sérénité : à valider (coût ~10 € par an).
3. **Opéria** : leur accord pour être cités. Sans accord : décocher « Afficher sur le site » dans la réalisation. Avec accord et site ouvert : coller leur adresse dans « Lien à ouvrir ».
4. **Téléphone et e-mail pro** à afficher (rubrique « Coordonnées »), et l'e-mail des mentions légales.
5. **Zone** : « Paris et alentours, et à distance partout en France ».
6. **TVA** : « TVA non applicable, article 293 B du CGI » suppose que tu es en franchise de TVA (cas normal d'une micro-entreprise qui n'a pas choisi la TVA).
7. **Adresse** : les mentions légales affichent l'adresse déclarée au registre (36 rue Chardon-Lagache), obligatoire. Elle n'apparaît nulle part ailleurs sur le site. Si c'est ton domicile et que tu préfères ne pas la publier, il faut une domiciliation d'entreprise.
8. **Phrase « Artisan joaillier de formation »** dans « À propos » : à garder ou à retirer.
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

Elles viennent du moteur vitrine du kit, avec les contenus de `exemples/`. Dans Claude Code :

> Copie `modeles/fromagerie-la-fontaine` du kit dans un dossier temporaire, lance `node outils/apercu.mjs` avec `exemples/vitrine-atelier.json` puis `exemples/vitrine-fleuriste.json`, remplace le texte du bandeau « Proposition de site pour… » par « Site d'exemple : atelier imaginaire… » (ou « commerce imaginaire… »), seulement jusqu'au prochain `<`, et copie les deux `demonstration.html` dans `public/demos/` (atelier-exemple.html, commerce-exemple.html).

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
| `exemples/` | Contenus de l'atelier et de la fleuriste imaginaires des démonstrations |
| `public/demos/` | Les deux démonstrations à essayer |
| `public/assets/photos/` | Visuels (captures des sites dans des cadres) |
| `public/fonts/` | Polices (Bricolage Grotesque, DM Sans pour ce site ; Playfair et Manrope pour le gabarit classique) |
| `public/assets/gregoire-muel-monogramme.svg` | Icône d'onglet (GM) |
| `src/worker.js`, `public/assets/*`, `outils/` | Le moteur agence (voir le kit) |
