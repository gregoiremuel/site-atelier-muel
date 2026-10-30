# Design : gabarit « édition », version 2 (30 octobre 2026)

Mode : Persuade (site de présentation). Moteur : `public/assets/rendu.js` + `public/assets/site.css` (bloc « Gabarit édition », données dans `contenu-initial.json`).

## Idée
Des chapitres de couleur : chaque rubrique est un aplat plein, séparé du suivant par un changement de ton, jamais par un filet. Les offres sont des tuiles plates qui montent comme un graphique (plus l'offre est grande, plus la tuile est haute).

## Couleurs (jetons)
Papier `#f4f6f8` · acier `#e4e9ef` · ciel `#cfdbe8` · ardoise `#38557a` · marine `#22364f` (le seul bleu, aussi couleur des boutons) · encre `#101216` · texte secondaire `#363c44`. Boutons blancs sur fonds sombres, marine sur fonds clairs.

## Typographie
Titres : Besley 500 (tracking -0,02 à -0,03 em). Texte : Schibsted Grotesk 17 px / 1,6. Plafonds de Greg : titre d'accueil 56 px, titres de pages 48 px, rubriques 36 px ; 30 et 24 px sur téléphone ; rien sous 14 px.

## Formes
Angles droits partout (sauf les téléphones des démonstrations). Aucune ombre au repos, aucun dégradé, aucune capitale espacée, aucune pastille. Icônes Lucide (ISC).

## Photos
Panneau d'accueil : rue de Paris 16e (Unsplash, Shalev Cohen), étiquetée « Photo d'illustration » ; en-tête des offres et bande de « À propos » : poste de travail (Unsplash, Christin Hume) ; portrait de Greg ; captures réelles des démonstrations. Aucune ne montre un vrai client.

## Mouvement
Transformations seulement (montée de 22 px au défilement, téléphones qui montent à l'arrivée, tuiles qui se soulèvent au survol, appui à 97 %), contenu visible dès le chargement, tout coupé avec « moins d'animations ».

## Boutons (version 3, 30/10/2026)
Principal : plein, filet de 3 px qui monte en fond au survol, flèche qui avance (hover souris seulement), appui à 97 %. Secondaire : texte souligné, sans rectangle. « Choisir » : case « + » collée au libellé. Portraits : ronds (56 px accueil, 88 px À propos), jamais en grand format. Atouts : quatre bandes sous le premier écran.
