# Textes de la refonte de l'accueil (17/11/2026)

Source : `contenu-initial.json` (identique au KV du 10/11, `../sauvegardes-site-atelier-muel/2026-11-10-contenu-kv.json`). Rien d'inventé : chaque ligne reprend un texte déjà en ligne ou une décision de `REPRENDRE.md`. Marque visible : « Sterenn Création » (Grégoire Muel EI en mentions légales). Opéria et la Fromagerie La Fontaine n'apparaissent pas.

## L'argument (une ligne par section + sa preuve)

| Section | Ce qu'elle dit | Preuve montrée |
|---|---|---|
| Premier écran | Un site à votre nom, créé et tenu à jour | Le champ « nom de votre commerce » + le bouton de maquette gratuite |
| Couloir des vitrines | Voici quatre vrais sites, un par métier, que vous pouvez essayer | Les quatre démos (captures réelles), bois / vert / bleu-vert / bordeaux |
| Bande des offres | Trois formules et du sur mesure, sans prix affiché | Les quatre offres de `metiers` (aucun prix : « Sur devis ») |
| Une seule personne | Vous parlez à celui qui fait le travail | Portrait actuel de Grégoire, trois lignes à la première personne |
| Appel final | Un mot suffit | Un seul bouton |

## Premier écran
- Titre (≤ 30 caractères, 2 lignes) : **UN SITE À VOTRE NOM**
- Phrase : « Je le crée et je le tiens à jour. Vous changez vos horaires ou vos photos depuis votre téléphone. »
- Champ : étiquette « Le nom de votre commerce » ; exemple (placeholder) « Boulangerie Martin » ; aide sous le champ : « Il reste sur cet appareil jusqu'à votre demande de maquette. Rien n'est envoyé avant. »
- Bouton : « Voir ma maquette gratuite » (mène au formulaire ; le nom saisi y est repris).
- Ligne sous le bouton : « Gratuite, à votre nom, en 5 jours ouvrés. Elle ne vous plaît pas : vous ne devez rien. »

## Couloir des vitrines
- Titre de section : **QUATRE MÉTIERS, QUATRE SITES**
- Introduction : « Des sites d'exemple. Ouvrez-en un et changez un horaire : rien n'est publié. Ces entreprises sont imaginaires. »
- Panneaux (nom de la démo + une ligne tirée de `realisations`) :
  1. Atelier d'ébénisterie : « Un atelier, ses travaux, ses horaires et une demande de devis. »
  2. Fleuriste de quartier : « Les fleurs de la semaine, des bouquets à commander, un jour de retrait. »
  3. Plombier, dépannage et devis : « Le numéro à appeler en haut de chaque écran. »
  4. Restaurant : « La carte, une réservation en ligne et les horaires du service. »
- Lien de chaque panneau : « Essayer la démonstration » (vers `/demos/<nom>-exemple`). Étiquette « Démonstration » visible.

## Bande des offres (aucun prix affiché)
Le prix de chaque offre est remplacé par « Sur devis » ; les chiffres 590 € / 1 290 € / 1 900 € et 19 € / 49 € restent des propositions à valider par Greg et n'apparaissent pas sur la page.
- Titre de section : **LES FORMULES**
- Site vitrine : « Pour qu'un client vous trouve, voie vos horaires et vous appelle en un geste. » — Sur devis
- Boutique et catalogue : « Vos produits en vitrine : collections, fiches, panier et demandes de commande. » — Sur devis
- Site d'entreprise ou refonte : « Pour rassurer un client qui ne vous connaît pas : métiers, réalisations, demandes de projet. » — Sur devis
- Sur mesure et entretien : « Un besoin hors formules, ou des changements que vous préférez me confier. » — Sur devis, selon votre projet
- Sous la bande : « Le nom de domaine se renouvelle environ 10 € par an, à votre nom. L'hébergement est gratuit aujourd'hui ; je vous préviens avant toute facture. »

## Une seule personne
- Titre : **UNE SEULE PERSONNE**
- Texte : « Je suis Grégoire Muel. C'est moi que vous avez au téléphone, qui prépare votre maquette et qui fais votre site. Je travaille depuis Auteuil, Paris 16e, et à distance partout en France. »
- Image : portrait actuel (`/assets/photos/gregoire-portrait.jpg`). Aucune photo de banque d'images.

## Appel final : un mot est le bouton
- Phrase au-dessus : « Dites-moi ce que vous faites, je prépare la maquette. »
- Le bouton : **MAQUETTE** (un seul mot, grand, mandarine, texte encre).
- Dessous : « Ou appelez-moi : 07 80 00 81 37 »

## Pied de page
- Une ligne : « Sterenn Création · Grégoire Muel EI · Paris 16e · contact@sterenncreation.fr » + liens « Mentions légales » et « Confidentialité ».

## Champ nom : textes d'état
- Vide : étiquette et exemple ci-dessus.
- Rempli : le bouton devient « Voir la maquette de [nom] » (le nom suit jusqu'au formulaire).
- Honnêteté : aucune démo ne lit un nom dans l'adresse ; ne pas écrire « votre nom s'écrit sur la vitrine ».

## À valider par Greg
Titre « UN SITE À VOTRE NOM » (raccourci du titre en ligne), « Sur devis » partout, bouton « MAQUETTE », ligne du pied.
