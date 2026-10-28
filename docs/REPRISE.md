# Reprise dans une nouvelle conversation

À coller en premier message d'une nouvelle session Claude Code, dans le dépôt `gregoiremuel/site-atelier-muel`, branche `claude/serene-fermi-gpn56s` :

> Lis `CLAUDE.md`, `LISEZMOI.md`, puis `docs/REPRISE.md` et `docs/PLAN-ENTREPRISE.md`. Ajoute les dépôts `gregoiremuel/kit-sites-boutiques` et `gregoiremuel/site-operia` (branche `claude/serene-fermi-gpn56s` dans les deux). Pose-moi d'abord, en une seule fois, les questions de la partie « Décisions de Greg ». Ensuite, fais les étapes de la partie « Travail à faire » dans l'ordre, sans m'interrompre sauf blocage réel. Termine par le document final décrit en dernière partie.

---

## Où on en est (au 28/10/2026)

- **Site** (`site-atelier-muel`, moteur agence, gabarit studio). Il contient :
  - quatre démonstrations faites avec le moteur vitrine du kit, chacune avec son gabarit : atelier, fleuriste (marche), plombier (depannage), restaurant (carte) ;
  - des photos Unsplash étiquetées « Photo d'illustration » et créditées (`exemples/photos/SOURCES.md`) ;
  - la page `/engagements` ;
  - les mots simples à la place du jargon (« page de modification », « mémoire du site ») ;
  - un audit d'accessibilité sans point (`npm run accessibilite`) ;
  - les outils `npm run demos`, `npm run vignettes` et `npm run accessibilite`.
- **Kit** : `METHODE.md` en version 10, moteur vitrine avec 5 gabarits et 7 jeux de polices, moteur agence reporté dans `modeles/agence-operia` et dans `site-operia`.
- **Les trois dépôts sont poussés** sur `claude/serene-fermi-gpn56s`. Aucune pull request n'est ouverte. Le site n'est **pas encore en ligne pour de vrai** (`MAQUETTE` vaut « oui »).
- **Avis simulés** :
  - 5 testeurs Haiku, tous à 6/10 : le bandeau « version de travail » fait brouillon, il manque de vrais clients, les prix sont « à valider » ;
  - panel de 10 acheteurs (skill `founder-consumer`) : 0 sur 10 achète. Les raisons : confiance (6), prix comparé à Wix (2), manque de temps pour modifier soi-même (2). Ce qui ferait changer d'avis : un vrai client du même métier, quelqu'un qui fait les modifications à leur place, un prix total clair, un humain joignable.
  - **Biais** : c'est moi qui avais donné les objections aux profils, notamment « hébergeur américain ». Voir `docs/panel-acheteurs-*`.
- **Skills « founder »** (`github.com/Jakeschincariol/founder-skill`, licence MIT, lus et sans réseau) : ils étaient installés seulement dans l'ancienne session. Pour les réinstaller :
  ```bash
  git clone --depth 1 https://github.com/Jakeschincariol/founder-skill /tmp/fs && mkdir -p ~/.claude/skills && cp -r /tmp/fs/skills/founder-* ~/.claude/skills/
  ```
  Ils apparaissent ensuite au tour suivant.
- **Administratif** (guide du 21/10/2026, vérifié le 28/10, détails dans `docs/PLAN-ENTREPRISE.md`) :
  - EI créée le 18/10/2026, SIRET 131 703 951 00015, APE 6201Z, libéral non réglementé, **nom commercial au registre : « Atelier Muel »** ;
  - échéances : ACRE avant environ le 17/12/2026, CFE (déclaration 1447-C-SD) avant le 31/12/2026 ;
  - réception des factures électroniques déjà obligatoire.

## Décisions de Greg (à poser en une fois, au début)

1. Nom commercial de l'activité web : le changer en « Grégoire Muel » (recommandé) ou garder « Atelier Muel » ? Déposer la marque « Atelier Muel » en classe 14 (190 €) ?
2. Noms de domaine à acheter (proposition : `gregoiremuel.fr` et `ateliermuel.fr`) et adresse e-mail pro voulue.
3. Prix de la nouvelle offre **Visibilité Google** (proposition : entre 39 et 59 € par mois, sans engagement de durée) ; Croissance relevée ou allégée (aujourd'hui environ 18 € net de l'heure) ?
4. Métiers à viser en priorité pour les pages métier (proposition : restaurants, artisans du bâtiment, fleuristes et commerces de bouche) et quartier de prospection.
5. Clients pilotes : en a-t-il déjà en tête (noms, accord pour être montrés) ?
6. Opéria : accord pour être cité, oui ou non ?
7. Est-il salarié en parallèle (clauses d'exclusivité à relire) ? Âge entre 18 et 25 ans (ACRE) ? A-t-il déjà un deuxième compte bancaire ?

## Travail à faire, dans l'ordre

À chaque étape : `npm run verifier`, `npm test`, `npm run accessibilite` dans les dépôts touchés ; tout changement du moteur est reporté dans le kit (`modeles/agence-operia` ou `modeles/fromagerie-la-fontaine`) et dans `site-operia` ; aucun prix qui ne soit validé par Greg ; aucun vrai client inventé ; commit et push sur `claude/serene-fermi-gpn56s`.

1. **Site, contenu** :
   - mettre en avant « je m'en occupe pour vous » ;
   - afficher clairement « 590 € une fois, sans abonnement obligatoire », avec la comparaison honnête avec Wix ;
   - ajouter l'offre **Visibilité Google** (avec les prix validés) et le **mini-diagnostic gratuit de fiche Google** ;
   - appliquer le nom commercial choisi dans les mentions légales.
2. **Pages par métier**. Ce sont de nouvelles routes du moteur agence, par exemple `/site-restaurant`, `/site-plombier`, chacune avec sa démonstration, ses questions et son prix de départ. Ajouter le champ au moteur, le reporter dans le kit et dans Opéria, et les tests.
3. **Moteur** :
   - mesure d'audience sans cookie ;
   - sauvegarde nocturne du contenu et des photos (cron du Worker) ;
   - tester le stockage KV en juridiction UE (`--jurisdiction=eu`) et documenter le résultat dans `METHODE.md`.
4. **Fabrique de maquettes en 1 heure** pour la prospection : à partir du texte d'une fiche Google collé, produire `contenu.json` et la démonstration, avec le moteur vitrine, le prompt 1 du kit et `nouvelle-boutique`. Documenter dans `METHODE.md`.
5. **Modèles de documents** dans `docs/modeles/` (bases à faire relire) :
   - devis ;
   - facture (mentions EI, SIREN, « TVA non applicable, art. 293 B du CGI » si confirmé, pénalités, indemnité de 40 €) ;
   - CGV entre professionnels ;
   - contrat de création avec **licence du moteur** (pas de cession) et cession du contenu et du domaine ;
   - contrat de sous-traitance RGPD ;
   - script de visite et mini-diagnostic.
6. **Validation** :
   - relancer le panel `founder-consumer` (en version rapide, 20 acheteurs) **sans** objections imposées, avec la nouvelle offre ;
   - puis `founder-pricing` sur les réponses, et `founder-offer` ;
   - ajuster, puis cinq testeurs Haiku sur les captures (méthode, partie 2.8 quater).
7. **Mise en ligne**, avec Greg (Cloudflare n'est pas joignable depuis l'espace de Claude) : texte prêt à suivre pour le domaine, les Secrets, `MAQUETTE` à « non », Web3Forms, Search Console et sa fiche Google.

## Document final (quand tout est jugé bon à 80-90 %)

Un PDF (et un artifact privé si Greg le veut) en français, tutoiement, qui reprend `docs/PLAN-ENTREPRISE.md` mis à jour, avec en plus :

- **Banque**. Un compte dédié n'est obligatoire qu'après deux années civiles de suite au-dessus de 10 000 € de chiffre d'affaires. Avant cela, un **second compte personnel à son nom** suffit, sans qu'il soit forcément « pro » (à vérifier avec sa banque : certaines interdisent l'usage professionnel d'un compte particulier). Comparer les comptes pro gratuits ou à bas prix.
- **Taxes et cotisations** :
  - 25,6 % des encaissements ;
  - ACRE si elle est accordée ;
  - contribution à la formation professionnelle ;
  - impôt (micro-BNC avec 34 % d'abattement, ou versement libératoire de 2,2 % si éligible) ;
  - CFE à partir de 2027 ;
  - seuils de TVA et plafond micro ;
  - un tableau « sur 100 € encaissés, ce que je garde ».
- **Chiffres** :
  - prix nets de chaque offre ;
  - temps passé par offre ;
  - trois scénarios sur 12 mois (prudent, moyen, bon) ;
  - seuil de rentabilité en heures.
- **Calendrier daté** des obligations (Urssaf, CFE, impôts, factures électroniques au 01/09/2027) et **check-list** à cocher.
- **Offres finales**, plan de prospection sur 90 jours, indicateurs à suivre, risques et parades, sources.
- Chaque chiffre est daté et sourcé. Ce qui n'est pas vérifié est marqué « à vérifier ». Pas de conseil juridique présenté comme sûr.
