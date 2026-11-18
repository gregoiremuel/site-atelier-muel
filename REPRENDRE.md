# REPRENDRE : refonte de l'accueil et du site (18/11/2026)

Branche `audit/refonte-accueil`. Textes : `docs/TEXTES-REFONTE.md`. Règles : `docs/REGLES-DESIGN.md`, `DESIGN.md`.

## Décisions de Greg (ne pas rouvrir)
- Accueil : informations d'abord (couloir « Pourquoi me choisir », 4 cartes en verre liquide sur la photo de la rue, vraie 3D au défilement), puis étapes, comparatif, formules (bande horizontale épinglée, prix 590 € / dès 1 290 € / dès 1 900 € / sur devis), exemples (4 démos), portrait, appel final. Plus aucune image dessinée ou générée.
- Couleurs : majorité blanc / gris `#f5f5f7`, encre `#1d1d1f`, bordeaux franc `#7a1f33` en touches, safran `#e3b04b`, sauge `#e3e9df`. Titres Red Hat Display 900 en capitales (hébergée). Boutons : étiquettes de prix percées.
- Tout le site (offres, réalisations, actualités, à propos, engagements, contact) suit les mêmes jetons (`body.g-edition` dans `site.css`, bloc « Tout le site »).
- Comparatif Wix : affiché sur l'accueil même si `comparaison.actif` est faux. Tarifs Wix relevés en octobre 2026 : à revérifier sur wix.com.
- Photos libres déjà créditées (Unsplash) : rue parisienne (fond), poste de travail (étapes).

## Pièges
- Le KV prime sur `contenu-initial.json` : le titre « Un site à votre nom. » est à saisir dans `/admin` (sinon l'ancien titre long passe sur 3 lignes).
- `--gris` = gris de texte ; `--gris-fond` = gris très clair des sections.
- `clip-path` des étiquettes rogne le contour de focus : règle `:focus-visible` qui l'enlève.
- Serveur local : `npm run dev` (port 8787), captures par Playwright (pas `file://`).
- Hauteur de l'accueil sur téléphone : ~8 700 px (au-dessus du plafond de 5 000 px de REGLES-DESIGN, accepté pour la densité).
- `inspect.mjs` de Taste ne démarre pas sur ce poste (Chrome sort tout de suite).

## Reste
- Reporter dans `modeles/agence-operia` du kit et `METHODE.md` partie 4.
- Relire les prix Wix du comparatif ; vérifier l'accord de Greg pour afficher le comparatif.
