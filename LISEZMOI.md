# Grégoire Muel, sites internet : site et page de modification

Le site de Grégoire Muel EI pour son activité de création et refonte de sites (commerces, artisans, entreprises). « Atelier Muel » est gardé pour la joaillerie et n'apparaît pas ici ; seul le nom technique du dépôt et du projet Cloudflare (`site-atelier-muel`) le contient. Moteur « agence » de la méthode (`gregoiremuel/kit-sites-boutiques`), hébergé gratuitement chez Cloudflare, avec son page de modification (`/admin`).

- **Accueil** : promesse, trois repères, présentation (« Un site, et la main dessus ») et chiffres, les trois offres avec leur prix de départ, le bloc « Essayez la page de modification » (liens vers les démonstrations), les réalisations, la méthode, l'appel « Une maquette gratuite en 48 h ».
- **Offres** (`/expertises`) : site vitrine, boutique et catalogue, site d'entreprise ou refonte, avec le détail, **l'abonnement facultatif** (Sans abonnement 0 €, Sérénité 19 €/mois, Croissance 49 €/mois) et la méthode.
- **Réalisations** : Opéria (refonte en cours) et quatre démonstrations (atelier d'ébénisterie, fleuriste, plombier, restaurant), chacune avec sa fiche, un bouton vers la démonstration et l'étiquette « Démonstration » sur sa vignette. Les vignettes sont de vraies captures des démonstrations.
- **Offres** (`/expertises`) : site vitrine, boutique et catalogue, site d'entreprise ou refonte, avec le détail, **l'abonnement facultatif** (Sans abonnement 0 €, Sérénité 19 €/mois, Croissance 49 €/mois) et la méthode.
- **À propos** (`/agence`) : qui tu es, ta façon de travailler, un résumé de tes garanties.
- **Engagements** (`/engagements`) : hébergement, données personnelles (RGPD), sauvegardes, délai de réponse, ce qui se passe si le client arrête l'abonnement, ton accès à ses données. La page n'existe que s'il y a au moins un bloc (rubrique « Engagements » de la page de modification).
- **Contact** : formulaire « Votre demande » (créer, refaire, boutique, entretien, autre). Les demandes arrivent dans la page de modification, avec un statut.
- **Démonstrations** : `public/demos/atelier-exemple.html` (Atelier du Merrain, ébéniste), `fleuriste-exemple.html` (Le Pétale Sauvage), `plombier-exemple.html` (Plomberie Delorme : téléphone cliquable, « Dépannage ou devis » en haut) et `restaurant-exemple.html` (La Cuillère Haute : carte, réservation, horaires). Quatre sites imaginaires, chacun avec sa propre mise en page (gabarits `atelier`, `marche`, `depannage` et `carte` du moteur vitrine du kit), son jeu de polices et sa palette. Le visiteur peut les modifier lui-même (rien n'est publié, tout reste dans son navigateur). Bandeau « Démonstration » en haut, photos libres d'Unsplash étiquetées « Photo d'illustration » et créditées, aucun prix de carte (le restaurateur les saisit). Non indexées par Google. Pas de démonstration de joaillerie : ce métier est réservé à Atelier Muel.
- **Visuels** : de vraies captures d'écran des démonstrations (sans cadre de téléphone ni d'ordinateur), fabriquées par `npm run vignettes`. Aucune photo de banque d'images ne sert de visuel du site lui-même ; celles des démonstrations sont des photos d'illustration, jamais présentées comme un vrai client.
- **Design** : gabarit « studio » du moteur (`theme.gabarit`), différent d'Opéria : papier gris froid, encre presque noire, vermillon, titres en Bricolage Grotesque, texte en DM Sans, accueil en deux colonnes, boutons en pastille, bandes arrondies.

## À valider par Greg avant d'ouvrir

1. **Prix** : 590 € (vitrine), **1 290 €** (boutique) et **1 900 €** (entreprise) sont des propositions : change-les dans « Expertises et méthode ». 590 € est sous la fourchette des freelances débutants (800 à 2 500 €) : bon pour les premiers clients, à relever ensuite (voir `METHODE.md`, partie 9).
2. **Abonnement facultatif** (panneau « Abonnement mensuel ») : Sérénité 19 €/mois et Croissance 49 €/mois sont des propositions, avec leurs engagements (« sans engagement de durée », « 30 minutes » et « 2 heures » de modifications par mois, « réponse sous 2 jours ouvrés », mise à jour de la fiche Google, suivi des visites chaque trimestre) : à garder seulement si tu peux les tenir. Le domaine est dit « renouvelé » dans Sérénité : à valider (coût ~10 € par an).
3. **Opéria** : leur accord pour être cités. Sans accord : décocher « Afficher sur le site » dans la réalisation. Avec accord et site ouvert : coller leur adresse dans « Lien à ouvrir ».
4. **Téléphone** (07 80 00 81 37, déjà affiché) ; **e-mail pro** à afficher (rubrique « Coordonnées ») et e-mail des mentions légales.
5. **Zone** : « Paris et alentours, et à distance partout en France ».
6. **TVA** : « TVA non applicable, article 293 B du CGI » suppose que tu es en franchise de TVA (cas normal d'une micro-entreprise qui n'a pas choisi la TVA).
7. **Adresse** : les mentions légales affichent l'adresse déclarée au registre (36 rue Chardon-Lagache), obligatoire. Elle n'apparaît nulle part ailleurs sur le site. Si c'est ton domicile et que tu préfères ne pas la publier, il faut une domiciliation d'entreprise.
8. **Phrase « Artisan joaillier de formation »** dans « À propos » : à garder ou à retirer.
9. **Portrait** : sans photo, tes initiales s'affichent.
10. **Mentions légales et confidentialité** : brouillons, à faire relire.
11. **Page Engagements** : ce sont des propositions à valider, à garder seulement si tu peux les tenir. À vérifier : qui détient le compte Cloudflare du client (ton compte ou le sien) et donc ce que devient le site si l'abonnement s'arrête ; la phrase sur les serveurs de Cloudflare (hors d'Europe possible) ; la fréquence des sauvegardes (« régulières » avec abonnement, copie à la livraison sans) et la copie des photos ; le délai « 2 jours ouvrés » pour tous ; la fermeture de ton accès à la demande du client ; le rôle de responsable du traitement des données (à faire relire par un juriste).
12. **Photos des démonstrations** : photographes relevés sur les pages Unsplash par une recherche web, à contrôler avant l'ouverture (`exemples/photos/SOURCES.md`). Les photos Unsplash se réutilisent librement, sans obligation de crédit ; les créditer reste la règle de ce site.

## Mettre en ligne depuis un téléphone (GitHub + Cloudflare)

Comme pour Opéria, avec le dépôt `site-atelier-muel` :

1. https://dash.cloudflare.com : « Workers & Pages », « Create application », « Import a repository », « Get started ».
2. Autoriser Cloudflare sur le dépôt `site-atelier-muel`, puis le choisir.
3. Nom du projet : **site-atelier-muel** (exactement). « Save and Deploy ».
4. « Settings », « Variables and Secrets » : ajouter deux **Secrets** (pas des variables) `ADMIN_HASH` et `SESSION_SECRET`, valeurs données par Claude ou par `npm run mot-de-passe`. Relancer un déploiement.
5. Adresse : `site-atelier-muel.<ton-compte>.workers.dev`, page de modification à la même adresse suivie de `/admin`.

Tant que `MAQUETTE` vaut « oui » dans `wrangler.jsonc` : bandeau « version de travail », non indexé, formulaire en démonstration. Une fois les points ci-dessus validés : demander à Claude de passer MAQUETTE à « non » (le site devient public et les demandes arrivent vraiment), puis brancher Web3Forms pour recevoir chaque demande par e-mail.

**Nom de domaine** (plus tard) : l'acheter, l'ajouter à Cloudflare, puis demander à Claude d'ajouter la route `{ "pattern": "ton-domaine.fr", "custom_domain": true }`.

## Refaire les démonstrations et leurs vignettes

Les démonstrations viennent du moteur vitrine du kit (`modeles/fromagerie-la-fontaine` : gabarits `atelier`, `depannage`, `carte`, `marche`), avec les contenus de `exemples/*.json` et les photos de `exemples/photos/` (écrites `/photos/nom` dans le contenu). Le modèle du kit est copié dans un dossier temporaire et n'est jamais modifié.

```bash
npm run demos        # fabrique public/demos/*.html (kit attendu dans ../kit-sites-boutiques)
npm run vignettes    # refait les captures : public/assets/photos/real-*.jpg, accueil.jpg, intro.jpg, offre-*.jpg (Playwright)
```

Photos : 1200 px de large, JPEG qualité 78, sans métadonnées (GPS comprises), choisies sur Unsplash, créditées dans `credits_photos` de chaque contenu et marquées « Photo d'illustration » (`reglages.illustration`). Une démonstration ne montre jamais un vrai client.

## Les commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm run verifier` | Contrôle le contenu et liste ce qui reste à faire. |
| `npm test` | Lance le vrai serveur sur l'ordinateur et le teste de bout en bout. |
| `npm run apercu` | Fabrique `demonstration.html` (le site et son page de modification, en un fichier). |
| `npm run mot-de-passe` | Crée le mot de passe de la page de modification et son empreinte. |
| `npm run accessibilite` | Audit d'accessibilité : axe-core (WCAG 2.2 AA) sur chaque page, en bureau, mobile et « moins d'animations », puis parcours au clavier (demande Playwright). |
| `npm run demos` | Refait les quatre démonstrations avec le moteur vitrine du kit. |
| `npm run vignettes` | Refait les vignettes et visuels à partir des démonstrations (et d'Opéria si `../site-operia` est là). |

## Fichiers

| Fichier | Rôle |
|---|---|
| `contenu-initial.json` | Le contenu de départ (une fois en ligne, il vit dans la page de modification) |
| `exemples/` | Contenus des quatre démonstrations (atelier, fleuriste, plombier, restaurant), photos dans `exemples/photos/` |
| `public/demos/` | Les quatre démonstrations à essayer |
| `public/assets/photos/` | Visuels : captures des démonstrations |
| `public/fonts/` | Polices (Bricolage Grotesque, DM Sans pour ce site ; Playfair et Manrope pour le gabarit classique) |
| `public/assets/gregoire-muel-monogramme.svg` | Icône d'onglet (GM) |
| `src/worker.js`, `public/assets/*`, `outils/` | Le moteur agence (voir le kit) |
