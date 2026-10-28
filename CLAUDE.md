# Site Atelier Muel : instructions pour Claude

Site de Grégoire Muel EI, nom commercial Atelier Muel : création et refonte de sites pour commerces, artisans et entreprises. Moteur « agence » de la méthode de Greg (dépôt `gregoiremuel/kit-sites-boutiques`, `METHODE.md`).

- Lis `LISEZMOI.md` avant toute tâche : contenu, ce qui reste à valider, mise en ligne, démonstrations.
- Le contenu de départ est `contenu-initial.json` ; une fois en ligne, il vit dans l'espace de modification (KV) et se modifie depuis `/admin`.
- Avant de livrer ou de déployer : `npm run verifier` sans erreur, `npm test` tout « ok », `npm run apercu`, démo essayée.
- Règles : ne rien inventer (prix autres que 590 € / 29 € par mois = propositions à valider) ; Opéria cité seulement avec leur accord ; la Fromagerie La Fontaine n'apparaît jamais sous son nom (pas signée) ; rien de la Maison Tcheskiss ; aucune photo de banque d'images présentée comme un travail réel ; mentions légales à faire relire ; aucun identifiant ni secret dans le dépôt (Secrets Cloudflare).
- Toute amélioration du moteur se reporte dans `modeles/agence-operia` du kit (et dans `site-operia` si utile), avec `npm run verifier` et `npm test` relancés.
- Avec Greg : français, tutoiement, direct. Réponse finale en trois parties : Réponse claire ; Niveau de confiance (0.0 à 1.0, avec la raison) ; Réserves clés.
