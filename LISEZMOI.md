# Grégoire Muel, sites internet : site et page de modification

Le site de Grégoire Muel EI pour son activité de création et refonte de sites (commerces, artisans, entreprises). « Atelier Muel » est gardé pour la joaillerie et n'apparaît pas ici ; seul le nom technique du dépôt et du projet Cloudflare (`site-atelier-muel`) le contient. Moteur « agence » de la méthode (`gregoiremuel/kit-sites-boutiques`), hébergé gratuitement chez Cloudflare, avec son page de modification (`/admin`).

- **Accueil** : planche des quatre démonstrations en premier écran, bloc « Qui fait votre site » (portrait, téléphone), démonstrations avec « À essayer » ; promesse « Votre site, et je m’en occupe », trois repères (dont « 590 € une fois, sans abonnement »), présentation (« Je m’en occupe pour vous ») et chiffres, les quatre offres (trois sites et la Visibilité Google) avec leur prix, le bloc « Essayez la page de modification » (liens vers les démonstrations), les réalisations, la méthode, l'appel « Une maquette gratuite en 48 h ».
- **Offres** (`/expertises`) : site vitrine, boutique et catalogue, site d'entreprise ou refonte, **Visibilité Google**, le tableau « un constructeur en ligne, ou moi ? » (coût sur 3 ans, relevé du 28/10/2026), **l'abonnement facultatif** (Sans abonnement 0 €, Sérénité 19 €/mois, Croissance 49 €/mois avec 1 heure de modifications, Visibilité Google 39 €/mois) avec le coût de la première année, les liens vers les pages par métier et la méthode.
- **Pages par métier** : `/site-restaurant`, `/site-plombier`, `/site-fleuriste`, `/site-commerce-de-bouche` (chacune avec sa démonstration, ses questions et son prix de départ) et `/visibilite-google` (fiche Google tenue chaque mois, mini-diagnostic gratuit). Bloc `pages_metier` du contenu.
- **Réalisations** : Opéria (refonte en cours) et quatre démonstrations (atelier d'ébénisterie, fleuriste, plombier, restaurant), chacune avec sa fiche, un bouton vers la démonstration et l'étiquette « Démonstration » sur sa vignette. Les vignettes sont de vraies captures des démonstrations.
- **Actualités** (`/actualites`, ajoutée le 29/10/2026) : la rubrique « Actualités » de la page de modification publie une actualité datée (titre, date, photos, texte, réalisation liée). Le lien de menu, les 3 dernières sur l'accueil et la page n'apparaissent **qu'à partir de la première actualité** en ligne ; aujourd'hui il n'y en a aucune. Idées : une maquette livrée, un commerce mis en ligne, un conseil (fiche Google, photos, avis). Une toutes les une à deux semaines, 300 à 800 signes, le quartier écrit en toutes lettres. Méthode : `METHODE.md` du kit, partie 2.11.
- **Visibilité** (29/10/2026) : IndexNow prévient Bing (et la recherche de ChatGPT) à chaque actualité ou réalisation enregistrée, une fois le site ouvert et le Secret `INDEXNOW_KEY` posé (`openssl rand -hex 16`, puis `npx wrangler secret put INDEXNOW_KEY`). Lien court `/avis` vers ton formulaire d'avis Google (champ « Lien pour laisser un avis Google » dans « Coordonnées, logo et mentions »), à mettre en QR code. Veille du lundi sur Telegram : flux n8n n° 4 du kit. Méthode : `METHODE.md` du kit, partie 2.11.
- **Profils reliés et zone** (29/10/2026) : `agence.profils` (une adresse par ligne : fiche Google, Pages Jaunes, Houzz, Facebook…) s'ajoute aux liens LinkedIn et Instagram dans les données de l'entreprise (`sameAs`) ; `agence.zone` écrite « Nantes, Vertou et Rezé » devient une liste de villes (`areaServed`). Champ « Autres profils en ligne » dans « Coordonnées, logo et mentions ».
- **À propos** (`/agence`) : qui tu es, ta façon de travailler, un résumé de tes garanties.
- **Engagements** (`/engagements`) : hébergement, données personnelles (RGPD), sauvegardes, délai de réponse, ce qui se passe si le client arrête l'abonnement, ton accès à ses données. La page n'existe que s'il y a au moins un bloc (rubrique « Engagements » de la page de modification).
- **Contact** : formulaire « Votre demande » (créer, refaire, boutique, entretien, autre). Les demandes arrivent dans la page de modification, avec un statut.
- **Démonstrations** : `public/demos/atelier-exemple.html` (Atelier du Merrain, ébéniste), `fleuriste-exemple.html` (Le Pétale Sauvage), `plombier-exemple.html` (Plomberie Delorme : téléphone cliquable, « Dépannage ou devis » en haut) et `restaurant-exemple.html` (La Cuillère Haute : carte, réservation, horaires). Quatre sites imaginaires, chacun avec sa propre mise en page (gabarits `atelier`, `marche`, `depannage` et `carte` du moteur vitrine du kit), son jeu de polices et sa palette. Le visiteur peut les modifier lui-même (rien n'est publié, tout reste dans son navigateur). Bandeau « Démonstration » en haut, photos libres d'Unsplash étiquetées « Photo d'illustration » et créditées, aucun prix de carte (le restaurateur les saisit). Non indexées par Google. Pas de démonstration de joaillerie : ce métier est réservé à Atelier Muel.
- **Visuels** : de vraies captures d'écran des démonstrations (sans cadre de téléphone ni d'ordinateur), fabriquées par `npm run vignettes`. Aucune photo de banque d'images ne sert de visuel du site lui-même ; celles des démonstrations sont des photos d'illustration, jamais présentées comme un vrai client.
- **Mesure des visites et sauvegarde** : le site compte les pages vues par jour sans cookie ni adresse IP (panneau « Visites du site »), et garde chaque nuit une copie du contenu pendant 7 nuits ; mise en route : `docs/MISE-EN-LIGNE.md`.
- **Design** : gabarit « édition » du moteur (`theme.gabarit`), différent d'Opéria et des démonstrations : papier blanc, encre, un seul bleu de travail, titres en Besley, texte en Schibsted Grotesk, angles droits, filets fins, offres en volets, tarifs composés comme un tarif imprimé. Il a été refait après trois avis extérieurs (directeur artistique, détecteur de look IA, commerçant) ; il lui manque encore **ta présence** : un portrait, quelques photos de ton établi ou de ton quartier, un logo si tu en veux un (voir `docs/PHOTOS-A-FOURNIR.md`).

## À valider par Greg avant d'ouvrir

1. **Prix** : 590 € (vitrine, **une fois**), **1 290 €** (boutique) et **1 900 €** (entreprise) sont des propositions : change-les dans « Expertises et méthode », dans « Pages par métier » et dans « Comparaison » (trois endroits). 590 € est sous la fourchette des freelances débutants (800 à 2 500 €) et dans la fourchette acceptable du panel simulé (250 à 700 €) : bon pour les premiers clients, à relever ensuite (voir `METHODE.md`, partie 9 et `docs/validation-2026-10-28/RESULTATS.md`).
2. **Abonnement facultatif** (panneau « Abonnement mensuel ») : Sérénité 19 €/mois, Croissance 49 €/mois et Visibilité Google 39 €/mois sont des propositions, avec leurs engagements (« sans engagement de durée », « 30 minutes » et « 1 heure » de modifications par mois, une copie complète chaque mois, chiffres des visites chaque mois, rapport d'une page chaque mois pour Visibilité Google, « réponse sous 2 jours ouvrés », suivi des visites chaque trimestre) : à garder seulement si tu peux les tenir. Le domaine est dit « renouvelé » dans Sérénité : à valider (coût ~10 € par an).
3. **Opéria** : **masqué par défaut** (leur accord n'est pas confirmé). Avec leur accord : cocher « Afficher sur le site » dans la réalisation. Avec accord et site ouvert : coller leur adresse dans « Lien à ouvrir ».
4. **Téléphone** (07 80 00 81 37, déjà affiché) ; **e-mail pro** à afficher (rubrique « Coordonnées ») et e-mail des mentions légales.
5. **Zone** : « Paris et alentours, et à distance partout en France ».
6. **TVA** : « TVA non applicable, article 293 B du CGI » suppose que tu es en franchise de TVA (cas normal d'une micro-entreprise qui n'a pas choisi la TVA).
7. **Adresse** : les mentions légales affichent l'adresse déclarée au registre (36 rue Chardon-Lagache), obligatoire. Elle n'apparaît nulle part ailleurs sur le site. Si c'est ton domicile et que tu préfères ne pas la publier, il faut une domiciliation d'entreprise.
8. **Phrase « Artisan joaillier de formation »** dans « À propos » : à garder ou à retirer.
9. **Portrait** : sans photo, tes initiales s'affichent.
10. **Mentions légales et confidentialité** : brouillons, à faire relire.
11. **Page Engagements** : ce sont des propositions à valider, à garder seulement si tu peux les tenir. À vérifier : qui détient le compte Cloudflare du client (ton compte ou le sien) et donc ce que devient le site si l'abonnement s'arrête ; la phrase sur les serveurs de Cloudflare (hors d'Europe possible) ; la fréquence des sauvegardes (« régulières » avec abonnement, copie à la livraison sans) et la copie des photos ; le délai « 2 jours ouvrés » pour tous ; la fermeture de ton accès à la demande du client ; le rôle de responsable du traitement des données (à faire relire par un juriste).
12. **Photos des démonstrations** : photographes relevés sur les pages Unsplash par une recherche web, à contrôler avant l'ouverture (`exemples/photos/SOURCES.md`). Les photos Unsplash se réutilisent librement, sans obligation de crédit ; les créditer reste la règle de ce site.

13. **Nom commercial** : « Grégoire Muel » est affiché dans les mentions légales ; le registre dit encore « Atelier Muel » : modification à faire sur le Guichet unique avant l'ouverture.
14. **Comparaison** : les tarifs du constructeur (17 à 30 € par mois) viennent d'un comparatif public (28/10/2026), pas du site officiel : à relire le jour de l'ouverture.
15. **Franchise de TVA** : à confirmer (la mention de la ligne TVA et des modèles de documents en dépend).
16. **Pages par métier** : questions et réponses relues par toi (elles disent ce que tu peux tenir) ; pas de démonstration « commerce de bouche » (la démonstration fleuriste sert d'exemple de produits frais).
17. **Pas de clients réels pour l'instant** : les démonstrations sont dites imaginaires sur le site ; c'est le principal frein relevé par le panel simulé (`docs/validation-2026-10-28/RESULTATS.md`).

## Mettre en ligne depuis un téléphone (GitHub + Cloudflare)

Comme pour Opéria, avec le dépôt `site-atelier-muel` :

1. https://dash.cloudflare.com : « Workers & Pages », « Create application », « Import a repository », « Get started ».
2. Autoriser Cloudflare sur le dépôt `site-atelier-muel`, puis le choisir.
3. Nom du projet : **site-atelier-muel** (exactement). « Save and Deploy ».
4. « Settings », « Variables and Secrets » : ajouter deux **Secrets** (pas des variables) `ADMIN_HASH` et `SESSION_SECRET`, valeurs données par Claude ou par `npm run mot-de-passe`. Relancer un déploiement.
5. Adresse : `site-atelier-muel.<ton-compte>.workers.dev`, page de modification à la même adresse suivie de `/admin`.

Pas à pas complet, étape par étape : `docs/MISE-EN-LIGNE.md`.

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
| `npm run dev` | Lance le site en local (wrangler). |
| `npm run deploy` | Lance `verifier` puis déploie (wrangler). |
| `npm run verifier` | Contrôle le contenu (erreurs bloquantes) et signale quelques points à faire avant l'ouverture (la liste complète est dans « À valider par Greg »). |
| `npm test` | Lance le vrai serveur sur l'ordinateur et le teste de bout en bout. |
| `npm run apercu` | Fabrique `demonstration.html` (le site et son page de modification, en un fichier). |
| `npm run referencement` | Contrôle le référencement de chaque page (titres, descriptions, canonique, données structurées, liens). |
| `npm run look-ia` | Repère ce qui donne une allure « faite par IA » (textes, couleurs, formes, longueur). |
| `npm run mot-de-passe` | Crée le mot de passe de départ de la page de modification et son empreinte (Secret `ADMIN_HASH`). |
| `npm run accessibilite` | Audit d'accessibilité : axe-core (WCAG 2.2 AA) sur chaque page, en bureau, mobile et « moins d'animations », puis parcours au clavier (demande Playwright ; environ 2 min 30, sans affichage pendant le calcul). |
| `npm run rendu` | Contrôle du rendu réel selon `docs/REGLES-DESIGN.md` (serveur local lancé, adresse en argument) : taille du texte, titres, débordement mobile, contenu visible, `alt`. |
| `npm run dimensions` | Écrit dans `public/assets/rendu.js` la table des dimensions des images (python3 et Pillow requis) ; à relancer après l'ajout d'une photo. |
| `npm run mobiles` | Refait les captures « téléphone » des démonstrations (`mobile-*.jpg`, Playwright). |
| `npm run demos` | Refait les quatre démonstrations avec le moteur vitrine du kit. |
| `npm run vignettes` | Refait les vignettes et visuels à partir des démonstrations (et d'Opéria si `../site-operia` est là). |

## Fichiers

| Fichier | Rôle |
|---|---|
| `contenu-initial.json` | Le contenu de départ (une fois en ligne, il vit dans la page de modification) |
| `exemples/` | Contenus des quatre démonstrations (atelier, fleuriste, plombier, restaurant), photos dans `exemples/photos/` |
| `public/demos/` | Les quatre démonstrations à essayer |
| `public/assets/photos/` | Visuels : captures des démonstrations |
| `public/fonts/` | Polices (Besley et Schibsted Grotesk pour ce site, gabarit « édition » ; Bricolage Grotesque et DM Sans pour « studio » ; Playfair et Manrope pour « classique ») |
| `public/assets/gregoire-muel-monogramme.svg` | Icône d'onglet (GM) |
| `src/worker.js`, `public/assets/*`, `outils/` | Le moteur agence (voir le kit) |


## Changer le mot de passe de la page de modification
- **Depuis la page de modification** : rubrique « Mot de passe » (mot de passe actuel, nouveau de 12 caractères au moins, confirmation). Le serveur enregistre une empreinte (jamais le mot de passe) dans la mémoire du site, clé `admin:hash`, qui **l'emporte sur le Secret `ADMIN_HASH`**. La session ouverte reste valable. Après 8 essais ratés en 15 minutes, le changement est bloqué.
- **Mot de passe oublié** : supprimer la clé pour revenir au mot de passe du Secret `ADMIN_HASH` : `npx wrangler kv key delete admin:hash --binding CONTENU --remote` (syntaxe à vérifier avec `npx wrangler kv key --help` selon la version de wrangler), ou donner un nouveau `ADMIN_HASH` (`npm run mot-de-passe`) puis supprimer la clé.
- Dans la démonstration, la rubrique répond qu'elle n'est pas disponible.
