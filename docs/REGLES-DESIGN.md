# Règles de design et de preuve (28 octobre 2026)

À relire avant toute évolution du style ou du contenu. Elles viennent de listes de défauts « UI générée par IA » (Unslop UI, MIT), de contrôles d'interface (Web Interface Guidelines de Vercel, MIT), du détecteur Impeccable (Apache-2.0, `npx impeccable detect`, télémétrie coupée avec `DO_NOT_TRACK=1`) et de repères de tailles de GOV.UK, Bootstrap et Material 3 (valeurs connues, non revérifiées en ligne le 28/10/2026).

## Contrôlé par `npm run rendu` (serveur local lancé, adresse en argument)
- Texte visible : jamais sous 14 px ; corps de page 16 px ; titre de l'accueil au plus 56 px, titres de pages au plus 48 px, titres de rubrique au plus 32 px.
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

## Outils retenus et écartés
Retenus : Unslop UI et Web Interface Guidelines (listes de contrôle locales, Markdown), Impeccable (détection seule). Écarté : Design Stack ui-ux-pro-max (installation lourde, doublon avec Playwright et axe-core).
