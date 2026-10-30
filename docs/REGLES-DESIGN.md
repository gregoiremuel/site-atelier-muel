# Règles de design et de preuve (28 octobre 2026)

À relire avant toute évolution du style ou du contenu. Elles viennent de listes de défauts « UI générée par IA » (Unslop UI, MIT), de contrôles d'interface (Web Interface Guidelines de Vercel, MIT), du détecteur Impeccable (Apache-2.0, `npx impeccable detect`, télémétrie coupée avec `DO_NOT_TRACK=1`) et de repères de tailles de GOV.UK, Bootstrap et Material 3 (valeurs connues, non revérifiées en ligne le 28/10/2026).

## Contrôlé par `npm run rendu` (serveur local lancé, adresse en argument)
- Texte visible : jamais sous 14 px ; corps de page 16 px ; titre de l'accueil au plus 56 px, titres de pages au plus 48 px, titres de rubrique au plus 32 px.
- Mobile (moins de 500 px) : titre de page 30 px au plus, rubriques et sous-titres 24 px au plus (téléphone de Greg : titres jugés trop gros à 24-36 px, 28/10/2026) ; menu 22 px.
- Blocs en rangée (cartes, offres, démonstrations) : leurs liens d'action sont à la même hauteur.
- Aucun débordement horizontal à 390 px.
- Contenu visible dès le chargement (pas de fondu au défilement, pas de compteur animé).
- Aucun surtitre (« eyebrow ») visible hors pied de page.
- Chaque image a un attribut `alt`.

## À juger à l'œil (aucun outil ne le fait)
- **Preuve humaine** : jamais de faux client, faux avis, faux chiffre ni photo d'archive présentée comme un travail réel ; toute démonstration est étiquetée « Démonstration » et ses photos « Photo d'illustration » ; un vrai portrait et de vrais pilotes avec accord écrit valent mieux que n'importe quel décor.
- **Goût** : un seul bleu d'accent, fond papier froid, texte presque noir, pas de dégradé, pas de verre dépoli, pas de carte identique répétée, pas de bordure colorée d'un seul côté, pas de duo de boutons de même poids, icônes d'une bibliothèque établie (Lucide, ISC) et jamais dessinées à la main.
- **Texte** : pas de tiret cadratin, pas de formule creuse, étiquettes de boutons qui disent l'action.
- **Mouvement** : sobre, `prefers-reduced-motion` respecté.
- Un site, une identité : ne ressemble à aucun autre site de la méthode (`METHODE.md`, partie 3).

## Skills de direction artistique (30/10/2026)
Taste (`inspect.mjs`), Impeccable, Frontend UI Engineering et les skills d'Emil Kowalski sont installés dans le kit (`METHODE.md` 2.13). Quand l'un d'eux contredit une règle de ce fichier (titres à 8 vw chez Taste), ce fichier gagne : le titre d'accueil reste à 56 px au plus. Écarts défendus au 30/10/2026 : pas d'image unique couvrant un tiers de l'écran sur les pages intérieures (bandeaux de titre compacts) ; quatre images au moins seulement sur l'accueil et les offres.

## Outils retenus et écartés
Retenus : Unslop UI et Web Interface Guidelines (listes de contrôle locales, Markdown), Impeccable (détection seule). Écarté : Design Stack ui-ux-pro-max (installation lourde, doublon avec Playwright et axe-core).
