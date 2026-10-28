# Photos et informations à fournir par Greg

Le design fonctionne **avec et sans** ces photos : tant qu'elles manquent, les emplacements affichent tes initiales ou restent masqués (aucune photo de banque d'images n'est présentée comme ton travail). Mais c'est ce qui sépare un site propre d'un site qui te ressemble. Rien n'est à envoyer en urgence : le site n'est pas en ligne.

## Photos (dans l'ordre d'utilité)

| # | Photo | Où elle apparaît | Précisions |
| --- | --- | --- | --- |
| 1 | **Portrait de toi** (buste, lumière du jour, regard vers l'appareil, fond simple) | Page « À propos » (`presentation.photo`) et ligne « équipe » (`equipe[0].photo`) | Cadrage vertical 4/5. Pas de selfie au miroir, pas de photo de groupe. |
| 2 | **Toi au travail** : mains sur le clavier, ou à l'établi de joaillerie (sans pièce de client) | Accueil, à côté de « Je m'en occupe pour vous » (`accueil.photo_intro`, aujourd'hui remplacée par la capture de la page de modification) | Cadrage vertical 4/5. L'établi montre le soin, mais **sans le mot « joaillerie »** sur le site (nom réservé à Atelier Muel). |
| 3 | **Auteuil / Paris 16e** : une rue, une vitrine, un marché que tu aimes | Page « À propos » (emplacement à prévoir au moment de l'import) | Pas de plaque de rue ni de visage reconnaissable sans accord. |
| 4 | **Logo** (facultatif) | En-tête | Le monogramme GM bleu (`public/assets/gregoire-muel-monogramme.svg`) sert déjà. À remplacer seulement si tu en as un. |
| 5 | **Un vrai client** (dès qu'il y en a un, avec son accord écrit) | Réalisations (`realisations[].photos`, `apercu`) à la place d'une démonstration | Avant / après, accord écrit du client. Le premier remplace la démonstration correspondante, sans toucher aux autres. |

## Règles techniques

- JPEG, **2000 px sur le grand côté**, sans données GPS (la fabrique et `npm run vignettes` les retirent ; si tu envoies à Claude, envoie le fichier original, il est réduit et nettoyé à l'import).
- Poids avant import : peu importe ; après import : environ 150 à 300 Ko par photo.
- Aucune photo de tiers sans accord (pour toi : ton visage, ton atelier, ton quartier ; pour un client : accord écrit).
- Aucune photo Google ou Wix, jamais.

## Informations à confirmer

- Ton **téléphone** `07 80 00 81 37` est bien celui à afficher ? (un critique extérieur l'a pris pour un faux numéro : il est réel, mais confirme.)
- **Adresse** : « Paris 16e » seulement (c'est ce qui est affiché) ou une adresse complète ?
- **Nom commercial** « Grégoire Muel » : à faire inscrire au Guichet unique avant l'ouverture.
- Des **horaires d'appel** à afficher, si tu en veux (à vérifier dans `contact` de `contenu-initial.json` ce qui est affiché aujourd'hui).
- Les **prix** (590 €, 1 290 €, 1 900 €, 19 €, 39 €, 49 €) restent des propositions à valider.

## Comment les installer

1. Envoie-les à Claude dans la conversation (ou dépose-les dans `exemples/photos/` du dépôt).
2. Claude les réduit, retire les métadonnées, les place dans `public/assets/photos/` et renseigne les champs ci-dessus dans `contenu-initial.json`, puis relance `npm run verifier` et `npm test`.
3. Une fois le site en ligne, tu peux aussi les changer toi-même depuis `/admin` (chaque photo a son champ).
