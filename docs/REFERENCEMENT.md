# Référencement : comment être trouvé sur Google (28 octobre 2026)

Aucune promesse de position : personne ne peut garantir une place dans Google, et le site le dit (« je ne promets pas une place dans Google »). Ce document dit ce que le site fait déjà, ce qui reste à faire avec toi, et comment suivre les résultats. Les noms de boutons de Google changent : ce qui est marqué **à vérifier** est à contrôler à l'écran.

## 1. Ce que le site fait déjà (vérifié dans le code et les tests)
- Un **titre et une description différents par page**, et l'aperçu des liens partagés (Open Graph).
- Des **données structurées** pour Google : fiche d'entreprise sur l'accueil, **questions fréquentes** sur les pages par métier (`/site-restaurant`, `/site-plombier`, `/site-fleuriste`, `/site-commerce-de-bouche`, `/visibilite-google`).
- **`/robots.txt`** et **`/sitemap.xml`** : le plan du site n'est annoncé qu'une fois `MAQUETTE` passé à « non ». Tant que le site est en « version de travail », il est volontairement **fermé aux moteurs** (`noindex`).
- Une **adresse canonique** (ajoutée le 28/10/2026) : chaque page dit à Google quelle est son adresse officielle. Elle apparaît seulement hors version de travail et si l'adresse du site est renseignée (`reglages.url`, par exemple `https://gregoiremuel.fr`). Sans elle, l'adresse provisoire `…workers.dev` et le vrai domaine peuvent être vus comme deux sites identiques.
- Un site **rapide, lisible sur téléphone, en HTTPS**, sans cookie ni publicité (critères que Google regarde).
- Des pages **par métier** avec un vrai texte, des prix de départ et une démonstration : ce sont tes meilleures chances d'apparaître sur « site internet restaurant Paris 16e » et assimilés.

## 1 bis. Deux outils de contrôle (dans le dépôt)
- `npm run referencement` : contrôle chaque page (titre, description unique et de bonne longueur, un seul titre principal, adresse canonique, données structurées lisibles, images avec texte alternatif, liens internes, quantité de texte). Il sort en erreur si une page a un défaut qui gêne Google. `npm run referencement -- --en-ligne https://adresse-du-site` contrôle aussi `robots.txt` et `sitemap.xml` du site publié (depuis un poste qui peut joindre le site).
- `npm run look-ia` : repère ce qui donne une allure « faite par IA » (texte à la première personne, formules toutes faites, couleur d'accent trop vive, dégradés, coins arrondis, pages trop longues sur téléphone). C'est un détecteur d'indices, pas un juge.
Les deux sont à relancer après chaque changement important, avec `npm run verifier` et `npm test`.

## 2. Avant l'ouverture (avec toi, dans `docs/MISE-EN-LIGNE.md`)
1. Domaine acheté et actif sur Cloudflare.
2. Dans le contenu : `reglages.url` = `https://gregoiremuel.fr` (je le fais quand tu me dis « go »).
3. `MAQUETTE` passé à « non » (même moment).
4. **Fermer l'adresse provisoire** pour éviter le doublon : option `"workers_dev": false` dans `wrangler.jsonc` (**à vérifier** dans la documentation de wrangler de ta version), ou la désactiver dans les réglages du Worker sur Cloudflare.
5. Vérifier à la main : `/robots.txt`, `/sitemap.xml`, et dans le code source de l'accueil la ligne `rel="canonical"`.

## 3. Les cinq gestes qui comptent le plus (par ordre d'effet pour un indépendant local)
1. **Fiche d'établissement Google** (business.google.com, ex-Google My Business). Catégorie principale proche de « Service de création de sites Web » (**à vérifier** dans la liste), zone de service « Paris 16e et à distance », téléphone, horaires, lien vers le site, quelques photos, description honnête. La validation se fait par vidéo, appel ou courrier (**à vérifier**). Si tu ne veux pas publier ton adresse (domicile), choisis « zone de service » sans afficher l'adresse. C'est ce que `docs/PLAN-ENTREPRISE.md` appelle ta meilleure vitrine.
2. **Search Console** (search.google.com/search-console) : propriété « Domaine », validation par un enregistrement DNS (à ajouter dans Cloudflare), puis envoi de `https://gregoiremuel.fr/sitemap.xml`. Ensuite « Inspection de l'URL » sur l'accueil et sur chaque page par métier, puis « Demander une indexation ». Délai habituel : de quelques jours à quelques semaines (**aucune garantie**).
3. **Avis de vrais clients** : tes trois clients pilotes sont la priorité. Donne-leur le lien d'avis de ta fiche. **Jamais** de faux avis, ni d'avis offerts en échange d'un rabais (interdit par Google et par la loi).
4. **Mêmes nom, adresse (ou zone), téléphone et horaires partout** : site, fiche Google, LinkedIn, Instagram, annuaires. Une différence (« 07 80 00 81 37 » ici, un autre numéro là) affaiblit la fiche.
5. **Quelques liens depuis d'autres sites** : association ou groupement de commerçants du 16e, annuaires professionnels sérieux, les sites de tes clients (une ligne « site réalisé par Grégoire Muel » avec leur accord), LinkedIn. Peu de liens, de vrais sites, pas d'achat de liens.

## 4. Autres annuaires utiles (gratuits, à faire une fois)
Bing Webmaster Tools (importe ton site depuis Search Console), Bing Places, Apple Business Connect, Pages Jaunes (la fiche de base est gratuite, **à vérifier** : ne paie pas les options sans raison), Facebook et Instagram professionnels. Chaque fiche : mêmes informations qu'au point 3.4.

## 5. Le contenu qui travaille pour toi
- Une **étude de cas** par client pilote, avec son accord écrit : le site avant, le site après, le délai, la phrase du client. C'est ce qui manque le plus aujourd'hui (voir `docs/validation-2026-10-28/RESULTATS.md`).
- Les **pages par métier** : relis-les et enrichis-les avec ce que tu apprends en visite (questions réelles des commerçants). Un texte précis vaut mieux que plusieurs pages creuses.
- Un **texte clair sur ce que Google fait et ne fait pas** (la page Visibilité Google le fait déjà).

## 6. Suivre les résultats
- **Search Console** > « Performances » : impressions, clics, requêtes, pages. Regarde une fois par semaine au début.
- **Page de modification, rubrique « Visites du site »** : pages vues sans cookie, ni adresse IP, ni identification. Ordre de grandeur seulement.
- **Fiche Google** > « Performances » : appels, itinéraires, visites du site.
- Ce qu'il faut attendre : quelques impressions dès les premières semaines, des premiers appels via la fiche Google avant les premiers clics du site, un classement correct sur ta zone locale en **plusieurs mois**. Si rien ne bouge après trois mois, regarde d'abord la fiche Google et les avis, pas le code.

## 7. Ce qu'il ne faut pas faire
Acheter des liens ou des avis ; remplir les pages de mots-clés répétés ; copier le texte d'un autre site ; promettre à un client une place dans Google ; laisser deux adresses (provisoire et domaine) ouvertes aux moteurs ; changer d'adresse de pages sans redirection.

## 8. Liste à cocher
- [ ] Domaine actif, `reglages.url` renseigné, `MAQUETTE` à « non »
- [ ] Adresse provisoire fermée ; canonique, robots et plan du site vérifiés
- [ ] Search Console validée, plan du site envoyé, accueil et pages par métier inspectés
- [ ] Fiche Google créée, validée, complète (photos, horaires, zone, lien)
- [ ] Bing Webmaster Tools, Bing Places, Apple Business Connect
- [ ] Mêmes coordonnées partout
- [ ] Trois clients pilotes : avis demandé, étude de cas, lien depuis leur site
- [ ] Suivi chaque semaine pendant trois mois, puis chaque mois

*Sources : fonctionnement du site vérifié dans `src/worker.js`, `public/assets/rendu.js` et `outils/tester.mjs` ; recommandations de Google sur Search Console et la fiche d'établissement connues au 28/10/2026, à revérifier à l'écran.*
