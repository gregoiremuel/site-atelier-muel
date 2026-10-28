# Reprise dans une nouvelle conversation

À coller en premier message d'une nouvelle session Claude Code (de préférence **en Opus**, pour le document final), dans le dépôt `gregoiremuel/site-atelier-muel`, branche `claude/integration-repos-plan-3q1kd9` (et `claude/serene-fermi-gpn56s` dans `kit-sites-boutiques` et `site-operia`) :

> Lis `CLAUDE.md`, `LISEZMOI.md`, puis `docs/REPRISE.md`, `docs/PLAN-ENTREPRISE.md`, `docs/CHIFFRES.md` et `docs/validation-2026-10-28/RESULTATS.md`. Ajoute les dépôts `gregoiremuel/kit-sites-boutiques` et `gregoiremuel/site-operia` (branche `claude/serene-fermi-gpn56s` dans les deux). Fais le **document final** décrit en dernière partie de `docs/REPRISE.md`, sans me poser de question sauf blocage réel.

---

## Où on en est (au 28/10/2026, fin de la deuxième session)

**Les sept étapes de travail sont faites et poussées** (tests : `npm run verifier` sans erreur, `npm test` 80 vérifications sur le site et 69 dans le kit et dans Opéria, `npm run accessibilite` sans point). Aucune pull request n'est ouverte. Le site n'est **pas encore en ligne** (`MAQUETTE` vaut « oui »).

1. **Site, contenu** : « Votre site, et je m'en occupe », « 590 € une fois, sans abonnement obligatoire », tableau de comparaison avec un constructeur en ligne (tarifs du 28/10/2026, à relire), offre **Visibilité Google 39 €/mois** avec mini-diagnostic gratuit, Croissance allégée à 1 heure, coût de la première année en une ligne, nom commercial « Grégoire Muel » dans les mentions légales (à faire inscrire au registre), Opéria masqué.
2. **Pages par métier** (moteur, kit, Opéria, tests) : `/site-restaurant`, `/site-plombier`, `/site-fleuriste`, `/site-commerce-de-bouche`, `/visibilite-google`, avec démonstration, questions (données FAQ pour Google) et prix de départ.
3. **Moteur** : mesure d'audience sans cookie (panneau « Visites du site »), copie de sauvegarde nocturne (cron, 7 nuits ; R2 facultatif), **correction d'un défaut** (le premier enregistrement depuis `/admin` supprimait `abonnements` et `libelles`). Stockage KV en juridiction UE : **documenté mais pas testé** (`METHODE.md` 2.10, `docs/MISE-EN-LIGNE.md` étape 4).
4. **Fabrique de maquettes en 1 heure** : `kit-sites-boutiques/outils/fabrique-maquette.mjs` (testée de bout en bout avec un commerce imaginaire, contrôle croisé fiche / contenu refusant un faux téléphone, de faux horaires et une fausse note ; `METHODE.md` 2.2 bis).
5. **Modèles de documents** : `docs/modeles/` (devis, facture, CGV, contrat de création avec licence du moteur, sous-traitance RGPD, script de visite et mini-diagnostic) : **bases non relues par un juriste**.
6. **Validation** : panel simulé de 20 acheteurs sans objection imposée, deux passes (0 achète les deux fois ; la preuve manque, pas le prix), cinq testeurs sur captures (6/10 chacun), analyses de prix et d'offre : `docs/validation-2026-10-28/`.
7. **Mise en ligne** : `docs/MISE-EN-LIGNE.md` (à faire avec Greg) ; chiffres et plan : `docs/CHIFFRES.md`, `docs/PLAN-ENTREPRISE.md` (partie « Mise à jour du 28 octobre »).

**Branches.** `site-atelier-muel` : `claude/integration-repos-plan-3q1kd9` (branche désignée pour cette session ; la branche `claude/serene-fermi-gpn56s` du même dépôt n'a pas reçu ces changements). `kit-sites-boutiques` et `site-operia` : `claude/serene-fermi-gpn56s`.

**Skills « founder »** : les scripts du dépôt MIT n'ont **pas** été exécutés (le système de permissions l'a refusé). J'ai écrit un petit script équivalent (`docs/validation-2026-10-28/panel_greg.py`) ; voir `RESULTATS.md`. Ne pas insister pour les installer sans accord explicite de Greg.

## Décisions de Greg : prises par défaut le 28/10/2026
Nom commercial « Grégoire Muel » ; domaines `gregoiremuel.fr` et `ateliermuel.fr` ; prix 590 € une fois, 1 290 €, 1 900 €, Sérénité 19 €, Croissance 49 € (1 heure), Visibilité Google 39 € ; métiers : restaurants, artisans du bâtiment, fleuristes, commerces de bouche (Paris 16e, Boulogne, Paris 15e) ; aucun pilote connu ; Opéria non cité ; salarié en parallèle (joaillerie) ; 18 à 25 ans ; pas de second compte bancaire (Crédit Agricole) ; franchise de TVA non confirmée.

## Ce qui reste à Greg (mis de côté, rien ne peut le faire à sa place)
- Confirmer la **franchise de TVA** ; faire la demande d'**ACRE avant le ~17/12/2026** ; activer l'espace Urssaf ; choisir une plateforme de réception des factures électroniques ; déclaration de **CFE (1447-C-SD) avant le 31/12/2026** ; devis RC Pro.
- **Guichet unique** : modifier le nom commercial ; décider du dépôt de la marque « Atelier Muel » (190 €).
- **Acheter les domaines**, choisir l'e-mail pro, mettre le site sur Cloudflare, tester le stockage UE, clé Web3Forms, Search Console, fiche Google : `docs/MISE-EN-LIGNE.md` (demander les valeurs de `ADMIN_HASH` et `SESSION_SECRET` à Claude à l'étape voulue).
- **Faire relire** par un juriste : mentions légales, confidentialité, CGV, contrats, sous-traitance (points « à vérifier » listés dans `docs/modeles/README.md`, en particulier **rétractation et acompte en boutique**).
- **Décider** : garantie 30 jours, prix de lancement pour trois pilotes (290 à 390 €), remise du code du moteur, qui détient le compte Cloudflare des clients.
- Relire le **contrat de travail** (clauses d'exclusivité, déclaration d'une activité annexe).
- Trouver les **trois clients pilotes** (script : `docs/modeles/06-script-visite-et-diagnostic.md`).
- Ouvrir un **compte bancaire dédié** (obligatoire pour la joaillerie quel que soit le chiffre d'affaires, d'après une source à vérifier).

## Document final (à faire dans la prochaine session, en Opus)

Un PDF (et un artifact privé si Greg le veut) en français, tutoiement, qui reprend `docs/PLAN-ENTREPRISE.md` mis à jour et `docs/CHIFFRES.md`, avec :

- **Banque** : obligation du compte dédié (10 000 € deux années de suite ; joaillerie : dès le début, à vérifier) ; second compte personnel possible s'il sert seulement à l'activité (à demander à la banque) ; comparaison des comptes (Shine, Finom, Revolut Business, Qonto, offre de Crédit Agricole à demander) avec tarifs à revérifier sur leurs sites.
- **Taxes et cotisations** : 25,6 % des encaissements ; ACRE si accordée (25 %, à confirmer) ; contribution à la formation professionnelle ; impôt (micro-BNC avec 34 % d'abattement, ou versement libératoire de 2,2 % si éligible, rattachement au foyer fiscal à vérifier) ; CFE à partir de 2027 ; seuils de TVA et plafond micro ; le tableau « sur 100 € encaissés, ce que je garde » est dans `docs/CHIFFRES.md`.
- **Chiffres** : prix nets de chaque offre, temps passé par offre, trois scénarios sur 12 mois, seuil de rentabilité en heures (tout est dans `docs/CHIFFRES.md` ; y ajouter le coût de prospection, qui fait passer l'heure net d'un site signé de 36 € à environ 7 € à 2 % de conversion).
- **Calendrier daté** des obligations (ACRE avant le 17/12/2026, CFE avant le 31/12/2026, déclarations Urssaf, impôts au printemps 2027, factures électroniques : réception depuis le 01/09/2026, émission au 01/09/2027) et **check-list à cocher** (reprendre `docs/MISE-EN-LIGNE.md`).
- **Offres finales**, plan de prospection sur 90 jours (avec les trois pilotes en premier), indicateurs à suivre, risques et parades (dont la rétractation en boutique, la dépendance à Cloudflare, le temps de prospection), sources.
- Chaque chiffre est daté et sourcé. Ce qui n'est pas vérifié est marqué « à vérifier ». Pas de conseil juridique ou fiscal présenté comme sûr. Les trois parties de réponse de `CLAUDE.md` (Réponse claire, Niveau de confiance, Réserves clés) s'appliquent à la réponse finale.
