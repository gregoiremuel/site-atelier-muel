# Dossier de refonte de l'accueil — 16 novembre 2026

À lire avec `docs/AUDIT-2026-11-16.md` (constats et défauts techniques). Ce dossier remplace
la partie « Direction proposée » de l'audit et les trois variantes de
`prototypes/accueil-variantes.html`, que Greg a rejetées comme « trop IA ».

## Pourquoi les trois variantes faisaient IA (vérifié, pas supposé)

Passées au détecteur du skill Taste (`lint.mjs`) : 4 échecs, 1 alerte (filet fin, trois ombres,
boîte à contour d'un pixel). Et à l'œil, contre les règles maison de Taste :

| Défaut | Où |
|---|---|
| Aucune vraie image : le téléphone était dessiné en CSS (un faux écran) | les trois |
| Mot du titre mis en italique et en couleur | Nuit, Papier |
| Fond crème + accent rouge : la « palette d'assistant » | Papier |
| Cadres à filet fin, double contour | Enseigne, Papier |
| Boutons de métier en boîtes à contour | les trois |
| Le même squelette (titre, champ, puces, bouton, téléphone) repeint trois fois | les trois |

Leçon : ce n'étaient pas trois directions, c'était une seule mise en page en trois couleurs,
inventée sans tirer de direction. Ce que Greg a aimé et qu'on garde : **le téléphone incliné
en 3D qui bouge**, et le nom tapé qui s'y écrit.

## Direction tirée avec Taste

`draw.mjs`, graine **1512543511**, secteur `studio-portfolio`, direction **« The pinned poster »**
(l'affiche épinglée), choisie parmi trois tirées (les deux autres : planche-contact, photographies
de tailles inégales). La feuille complète se réaffiche depuis la racine du dépôt :

```
node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show
```

Principe : **une chose reste en place pendant que tout le reste change.** Ici, la chose qui
reste, c'est le téléphone.

**La phrase d'idée.** Sur cette page, *le nom que le visiteur tape* devient *le cadre épinglé* :
un seul téléphone, incliné, reste à l'écran pendant que son nom traverse quatre vrais sites
qu'il peut toucher.

**La chose vivante.** Le champ « Le nom de votre commerce ». Le téléphone n'affiche plus un
dessin mais **la vraie démonstration** (les pages `public/demos/*.html`, déjà modifiables dans le
navigateur), chargée dans le cadre du téléphone avec le nom du visiteur. Repli sans script :
la capture réelle de la démonstration. Rien n'est envoyé au serveur avant le formulaire.

## Ce que dit la feuille, et ce qu'on en fait

| Élément tiré | Décision proposée | Raison |
|---|---|---|
| Mouvement « Pinned story » (`position: sticky`, jamais de défilement détourné) | **Adopté** | C'est la demande de Greg ; recette testée dans `references/mouvement.md` du skill `sites-boutiques` |
| Titre épinglé à 10–14 vw | **Remplacé par le téléphone épinglé** | `docs/REGLES-DESIGN.md` plafonne le titre à 56 px ; la feuille prévoit aussi « un cadre qui reste centré pendant que son contenu change » |
| Section « Un cadre, trois distances » | **Adoptée pour les démonstrations** : le téléphone reste, l'écran passe d'un métier à l'autre | Les quatre captures réelles existent |
| Tarifs « noms de formules, un seul chiffre vivant » | **Adopté** : les trois offres en liste, un seul prix affiché à la fois | Remplace les trois cartes à icône |
| « Un mot est le bouton » pour l'appel final | **Adopté** | Un seul bouton, impossible à manquer |
| Palette « marine sur blanc » + mandarine | **Proportions gardées, couleurs changées** : fond blanc, encre presque noire, et le champ de couleur de chaque écran pris à la démonstration affichée (bois, vert, bleu, bordeaux) | Greg ne veut plus du marine ; la feuille autorise « chaque panneau prend la couleur de sa photographie » |
| Police Red Hat Display 900 en capitales | **À trancher par Greg** : la prendre, ou garder Besley | Vérifier le registre des styles (`METHODE.md` partie 3) : aucun autre site de la méthode ne doit avoir la même |
| Photos du jeu « mains et fabrication » | **Refusées** | Règle d'or : pas de photo de banque d'images ; on utilise les captures réelles et les photos de Greg |
| Pied de page « une seule ligne » | **Adapté** : la ligne, plus les liens légaux obligatoires | Mentions légales et confidentialité doivent rester accessibles |

## Le déroulé de la page (un seul défilement, deux mouvements)

1. **Premier écran.** À gauche : le titre (56 px au plus), une phrase, le champ, un bouton.
   À droite : le téléphone, incliné en 3D (`perspective` + `rotateY`), qui suit légèrement le
   pointeur sur ordinateur. Dedans, la vraie démonstration au nom du visiteur.
2. **Vertical, téléphone épinglé.** En descendant, le téléphone se redresse et reste collé ;
   à côté passent les quatre métiers, un écran chacun ; l'écran du téléphone change et le fond
   de la page prend la couleur de la démonstration.
3. **Horizontal épinglé.** En continuant de descendre, la bande des offres part vers la gauche
   (trois offres + le sur-mesure), puis le défilement vertical reprend.
4. **Une seule personne.** Le portrait de Greg en grand, trois lignes à la première personne.
5. **Appel final** : un mot est le bouton. **Pied de page** : une ligne.

Sur téléphone : le téléphone épinglé devient un cadre de 70 % de la largeur collé en haut ;
la bande horizontale reste pilotée par le défilement (CSS natif), avec le carrousel au doigt
en repli. Aucun lissage du défilement.

## Ce que Greg doit décider ou fournir avant le code

1. **Les règles à changer.** `docs/REGLES-DESIGN.md` et `DESIGN.md` disent : mouvement « sobre »,
   « pas de fondu au défilement », « un seul bleu d'accent, fond papier froid », « portraits
   jamais en grand format ». La refonte contredit ces quatre lignes. Les réécrire d'abord.
2. **La police** : Red Hat Display (tirée) ou Besley (actuelle).
3. **Des photos à lui** (liste dans `docs/PHOTOS-A-FOURNIR.md`) : un portrait net en grand
   format, son poste de travail, ses mains sur le clavier ou un carnet, sa rue. C'est ce qui
   enlève le plus sûrement le « look IA » : aucune mise en page ne remplace une vraie photo.
   Sans elles, la page reposera sur les seules captures des démonstrations.
4. **La phrase « artisan joaillier de formation »**, retirée le 30/10. C'est pourtant ce
   qu'aucun concurrent ne peut dire (la précision du geste). La remettre ou non.

## Ordre de construction

1. Mettre à jour `REGLES-DESIGN.md` et `DESIGN.md` selon les décisions ci-dessus.
2. Défauts techniques de l'audit (en-têtes de sécurité, démonstrations allégées, images du
   premier écran en chargement immédiat). Les démonstrations allégées sont un préalable :
   elles vont être chargées dans le téléphone de l'accueil.
3. Écrire l'argument et tous les textes (Taste, étapes 2 et 5) avant toute mise en page.
4. Premier écran dans le moteur (`public/assets/rendu.js`, `site.css`, bloc « Gabarit édition »),
   pas dans un fichier à part. Captures bureau et 375 px regardées.
5. Sections 2 à 5 du déroulé, une par une, chacune vérifiée avant la suivante.
6. Contrôles : `lint.mjs`, `inspect.mjs` et `scenes.mjs` de Taste (0 FAIL) ; critique en
   captures avec `references/critique.md` ; passe Impeccable ; puis `npm run verifier`, `npm test`,
   `npm run rendu`, `accessibilite`, `referencement`, `look-ia`.
7. Test au doigt sur le téléphone de Greg. Supprimer `prototypes/`.
8. Reporter dans `modeles/agence-operia` du kit et dans `METHODE.md` (partie 4).

## Avec quel modèle

- Étapes 1 à 3 (décisions, textes) et le premier écran : Opus, effort élevé.
- Étapes 4 à 8 : Sonnet, effort moyen, avec le conseiller : taper `/advisor opus`
  (ou `/advisor fable` tant que Fable est accessible).
- Première phrase de la session : « Charge `methode-fable`, `sites-boutiques` et
  `design-taste-frontend`. Lis `docs/REFONTE-BRIEF.md` et `docs/AUDIT-2026-11-16.md`, puis
  exécute l'ordre de construction. Arrête-toi après chaque étape pour me montrer les captures. »

## Ce qui n'a pas été fait dans ce dossier

Aucune ligne du site n'est modifiée. Le prototype rejeté est encore dans `prototypes/`.
Le skill Impeccable n'a pas été lancé (il sert à l'étape de critique). L'étude de sites primés
tient en trois sites regardés au navigateur plus la bibliothèque de 247 sites de Taste, dont
je n'ai lu que la feuille tirée.
