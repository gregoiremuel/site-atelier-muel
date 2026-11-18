# Design : gabarit « édition », version 3 « l'affiche épinglée » (16 novembre 2026, en construction)

Mode : Persuade (site de présentation). Moteur : `public/assets/rendu.js` + `public/assets/site.css` (bloc « Gabarit édition », données dans `contenu-initial.json`). Direction tirée avec Taste (graine 1512543511), détail et déroulé dans `docs/REFONTE-BRIEF.md`. Tant que la refonte n'est pas livrée, le site en ligne garde la version 2 (résumée en bas).

## Idée
Le couloir des vitrines : les quatre vraies démonstrations sont posées en grands panneaux dans un couloir en 3D. En défilant, on avance entre elles ; chacune vient remplir l'écran et porte le nom que le visiteur a tapé. Le téléphone épinglé est abandonné (16/11, jugé banal).

## Couleurs (jetons)
Fond blanc `#ffffff` · surface `#f4f4f2` · encre `#101216` (texte, presque noir) · texte secondaire `#363c44` · accent mandarine `#f7941d` (boutons d'action seulement, texte encre dessus, jamais en grande surface) · champ sombre `#05070a` (premier écran) · gris chaud `#e3e1dc` (pied de page). Pendant le passage des métiers, le fond prend la couleur de la démonstration affichée : bois de l'atelier, vert du fleuriste, bleu-vert du plombier, bordeaux du restaurant.

## Typographie
Titres : Red Hat Display 900, en capitales, tracking -0,03 em, interligne 0,92. Texte : Schibsted Grotesk 17 px / 1,6. Plafonds de Greg : titre d'accueil 56 px, titres de pages 48 px, rubriques 36 px ; 30 et 24 px sur téléphone ; rien sous 14 px.

## Formes
Angles droits partout, sauf le téléphone. Aucune ombre au repos, aucun dégradé, aucun filet, aucune boîte à contour, aucune pastille, aucun surtitre. Un seul bouton plein (mandarine) par écran ; le secondaire est un lien souligné.

## Images
Captures et pages réelles des démonstrations (`public/demos/*.html`), portrait de Greg en grand. Aucune photo de banque d'images : la rue floutée et le poste de travail Unsplash de la version 2 sortent de l'accueil. Photos à fournir : `docs/PHOTOS-A-FOURNIR.md`.

## Mouvement
Moment signature : le couloir en 3D (scène collante, `perspective`, panneaux en `translateZ`/`rotateY` pilotés par une variable CSS écrite au défilement, un seul écouteur passif + `requestAnimationFrame`, jamais de défilement détourné). Puis la bande des offres part vers la gauche (horizontal épinglé en CSS natif, carrousel au doigt en repli). Le reste discret : entrées en `transform` seulement, contenu visible dès le chargement, aucun lissage du défilement, tout coupé avec « moins d'animations ». Recettes : `references/mouvement.md` du skill `sites-boutiques`.

## Composants de l'accueil
Premier écran : titre, une phrase, champ « Le nom de votre commerce », un bouton ; l'entrée du couloir à droite. Métiers : on avance dans le couloir, une démonstration remplit l'écran à la fois. Offres : liste des formules, un seul prix affiché à la fois (plus de tuiles). Une seule personne : portrait en grand, trois lignes à la première personne. Appel final : un mot est le bouton. Pied de page : une ligne et les liens légaux.

## Version 2 (30/10/2026, encore en ligne)
Chapitres de couleur : papier `#f4f6f8`, acier, ciel, ardoise, marine `#22364f` (seul bleu, boutons), encre `#101216` ; Besley 500 + Schibsted Grotesk ; offres en tuiles qui montent ; quatre téléphones sur une photo de rue (Unsplash) ; portraits ronds de 56 et 88 px ; montée de 22 px au défilement. Sauvegarde du fichier complet : `../sauvegardes-site-atelier-muel/2026-11-16-avant-regles-refonte/`.
