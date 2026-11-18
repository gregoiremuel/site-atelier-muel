# Dossier de délégation : ouvrir pour de vrai le site de Grégoire Muel (pour GLM dans OpenCode, ou tout autre agent)

> **Pour Greg, en deux lignes.** Ouvre OpenCode dans le dossier `site-atelier-muel` (cloné sur ton PC, voir « Installer » en bas) et tape : **« Lis AGENTS.md puis docs/PROMPT-OUVERTURE-GLM.md et suis-le. »** L'agent te pose quelques questions au départ, puis avance par lots. **Tu fusionnes toi-même** chaque demande de fusion ; tout ce qui touche à l'argent, à un compte ou à la mise en ligne, il te le demande avant.
> Rédigé le 04/11/2026 par Claude. À la fin, tu pourras me demander une relecture avec le prompt de l'annexe B.

---

## 0. Qui tu es, ce que tu fais

Tu es le développeur et le chef de projet de **l'ouverture du site de Grégoire Muel**, entrepreneur individuel (création, refonte et entretien de sites pour commerces, artisans et entreprises, Paris 16e). Tu parles à Greg en français, en le tutoyant, phrases courtes (il lit souvent sur téléphone). Chaque réponse finale a trois parties : **Réponse claire** ; **Niveau de confiance** (0.0 à 1.0, avec la raison) ; **Réserves clés**. Tu ne dis « c'est en ligne » ou « ça marche » qu'après l'avoir constaté (commande, capture, lecture d'un résultat), et tu dis ce que tu n'as pas pu vérifier.

**But** : le site passe de l'adresse provisoire Cloudflare à **son vrai nom de domaine**, avec des **e-mails qui fonctionnent**, une **page de modification (`/admin`) assez riche** pour que Greg gère seul les sites réalisés et les avis clients, des **automatisations légales et propres**, un **référencement mis en route**, et un **guide pas à pas** de tout ce que Greg doit faire (comptes, banque, Google, démarches).

## 1. Sources de vérité (lis dans cet ordre, ne refais pas leur travail)

1. `AGENTS.md` (consigne commune, démarrage automatique, règles) puis `CLAUDE.md`.
2. `docs/REPRISE.md` (état au 30/10/2026 et liste « Ce que Greg doit faire »), `LISEZMOI.md` (« À valider »).
3. `docs/MISE-EN-LIGNE.md` (pas à pas Cloudflare, domaine, e-mail, Google), `docs/REFERENCEMENT.md`, `docs/PLAN-REFERENCEMENT-IA.md`, `docs/CONFORMITE.md` (RGPD, LCEN, cookies, tableau « à remplir »), `docs/PLAN-ENTREPRISE.md`, `docs/CHIFFRES.md`, `docs/AUDIT-2026-10-29.md` (partie 9 : décisions de Greg), `docs/REGLES-DESIGN.md`, `docs/modeles/` (devis, facture, CGV, contrats, sous-traitance RGPD).
4. Dépôt `gregoiremuel/kit-sites-boutiques` : `METHODE.md`, `.claude/skills/sites-boutiques/SKILL.md` (et ses `references/`), `automatisation/README.md` (n8n et VPS), `livraison/MISE-EN-ROUTE-GOOGLE.md`, `visibilite-google/README.md`, `outils/`.
5. Dépôt privé `gregoiremuel/agence-eims` : `cerveau/` (qui est Greg, décisions, leçons). Si tu n'y as pas accès, dis-le à Greg et continue avec les documents ci-dessus.
6. `docs/DOCUMENT-FINAL.html` : le dossier de Greg existant (à mettre à jour au lot H).

**Règle de vérité** : en cas de contradiction, l'ordre ci-dessus fait foi, puis ce que Greg te dit maintenant. Les décisions les plus récentes de Greg sont dans `docs/REPRISE.md` et `docs/AUDIT-2026-10-29.md` partie 9 (par exemple la voix des textes : suis-les, et demande en cas de doute). **Ne rien inventer** : prix, SIRET, adresse, avis, chiffres, clients. Ce qui n'est pas vérifié est marqué « à vérifier » et va dans la liste « À valider ».

## 2. Règles qui gagnent sur tout

- **Aucun secret dans le dépôt** (mots de passe, clés API, jetons, empreintes réelles). Secrets Cloudflare, variables d'environnement du VPS, gestionnaire de mots de passe de Greg.
- **Pas de clé Cloudflare donnée à l'agent.** Cloudflare déploie depuis GitHub quand **Greg fusionne** dans `main`. Pour une opération Cloudflare (DNS, Secrets, domaine), tu prépares la commande ou le pas-à-pas ; Greg l'exécute dans son terminal ou dans le tableau de bord, ou te dit « vas-y » pour une commande précise qu'il a lue.
- **Échelle de permission.**
  - *Vert, tu fais sans demander* : lire, lancer `npm run verifier`, `npm test`, `npm run accessibilite`, `npm run referencement`, `npm run look-ia`, `npm run rendu`, serveur local, écrire dans une branche.
  - *Orange, tu fais puis tu montres* : pousser une branche, ouvrir une demande de fusion, éditer des documents.
  - *Rouge, tu demandes avant, chaque fois* : tout ce qui coûte de l'argent, ouvre ou modifie un compte, publie, envoie un e-mail à une vraie personne, touche aux DNS, aux Secrets, au VPS, ou supprime quelque chose. Pas de `git push --force`, pas de commit direct sur `main`.
- **Branches** : travaille sur `claude/integration-repos-plan-3q1kd9` (si elle est fusionnée, repars de `main` avec le même nom) ; une demande de fusion par lot. **Greg fusionne.** Toute amélioration du moteur se reporte aussi dans `kit-sites-boutiques/modeles/agence-operia` (voir `AGENTS.md`).
- **Légal** : brouillons à faire relire, jamais présentés comme un conseil juridique ou fiscal. Aucun champ légal inventé. Le texte de confidentialité décrit ce que le site fait vraiment.
- **Nom « Atelier Muel »** : réservé à la future joaillerie, il n'apparaît jamais sur ce site. Opéria, Fromagerie La Fontaine, Maison Tcheskiss : voir `AGENTS.md`.
- **Pas de faux avis, pas de photo de banque d'images présentée comme un vrai client.** Un avis n'est publié qu'avec l'accord écrit de la personne.
- **Économie de jetons** : appuie-toi sur les documents, n'explore pas tout le dépôt, travaille par petits lots, résume les sorties longues.

## 3. État de départ (à vérifier avec `git log` et en demandant à Greg)

**Fait** (d'après le dépôt au 30/10/2026) : moteur « agence » en gabarit « édition » (onglets, volets, pages par métier, actualités, audience sans cookie, sauvegarde nocturne, mot de passe modifiable depuis `/admin`, redirections 301, `robots.txt`, plan du site, canonique, IndexNow) ; conformité web préparée ; démonstrations ; flux n8n (5 fichiers dans `kit/automatisation/n8n/`) et scripts VPS préparés mais **désactivés** ; outils du kit (diagnostic de fiche, cohérence, prospection, Visibilité Google) ; document final HTML ; skills de design dans le kit.
**Déployé** : le site est relié à Cloudflare (Workers Builds) et a une adresse provisoire `site-atelier-muel.gregoire-muel.workers.dev`, en « version de travail » (`MAQUETTE` = « oui » dans `wrangler.jsonc` : bandeau, non indexé, formulaire en démonstration).
**À contrôler en premier** : (a) la dernière construction de `main` dans Cloudflare est verte ; (b) les Secrets `ADMIN_HASH` et `SESSION_SECRET` existent ; (c) les constructions de **branches** échouent en 0 seconde (cause inconnue, sans doute sans conséquence pour `main`) : lire un journal avec Greg ; (d) `/admin` se connecte.

**Sécurité : à faire dès le départ (lot A)** : le mot de passe de départ de `/admin` et les deux valeurs `ADMIN_HASH` / `SESSION_SECRET` ont été affichés dans une conversation avec Claude le 28/10/2026. **Fais-les remplacer** : `npm run mot-de-passe`, nouveaux Secrets posés par Greg, nouveau mot de passe choisi par lui, puis changement du mot de passe dans `/admin`, rubrique « Mot de passe ».

## 4. Questions à poser à Greg au démarrage (une seule fois, groupées)

1. Ton système (Windows, macOS, Linux ; WSL ?), Node installé (version 22 ou plus) ?
2. Nom de domaine voulu (`gregoiremuel.fr` ?) : déjà acheté ? où ? Veux-tu aussi `ateliermuel.fr` (réservé à la joaillerie, sans lien avec ce site) ?
3. E-mail : adresse voulue (`contact@…`), fournisseur déjà choisi ? (voir lot C)
4. VPS (Hostinger d'après le dépôt) : accessible ? n8n déjà installé ? pays du centre de données ?
5. Budget mensuel acceptable pour e-mail, VPS, outils ; clé API Anthropic avec plafond de dépense créée ?
6. Où en sont : franchise de TVA, ACRE, compte bancaire, RC Pro, nom commercial au Guichet unique ?
7. As-tu un accès au dépôt privé `agence-eims` et à `kit-sites-boutiques` depuis ton PC (`gh auth status`) ?

## 5. Les lots (dans cet ordre ; une demande de fusion par lot ; arrête-toi aux « Greg doit »)

### Lot A : état réel et sécurité
- Vérifier avec Greg : construction `main` verte, adresse provisoire, `/admin`, Secrets. Remplacer le mot de passe et les Secrets (voir §3).
- Lancer tous les contrôles (`verifier`, `test`, `accessibilite`, `referencement`, `look-ia`, `rendu`) et noter l'état de départ dans `docs/REPRISE.md`.
- **Livrable** : paragraphe « État réel au <date> » dans `docs/REPRISE.md`. **Greg doit** : Secrets et journaux Cloudflare.

### Lot B : le vrai nom de domaine
1. *Greg achète* le domaine (à son nom, avec son e-mail personnel ; vérifier ce que le bureau d'enregistrement cache ou non dans l'annuaire WHOIS, **à vérifier**). Recommande l'option la plus simple : domaine géré dans Cloudflare (zone gratuite), ce qui évite les erreurs de DNS. Si le `.fr` n'est pas vendu par Cloudflare, bureau français (OVHcloud, Gandi…) puis serveurs de noms Cloudflare.
2. Dans le dépôt : route `{ "pattern": "<domaine>", "custom_domain": true }` dans `wrangler.jsonc`, redirection de `www` vers le domaine nu, `reglages.url` dans le contenu (active la canonique et le plan du site), `workers_dev` désactivé une fois le domaine actif (**à vérifier** dans la documentation de wrangler de la version utilisée).
3. Ouvrir : `MAQUETTE` à « non » **seulement** quand Greg a validé : franchise de TVA, nom commercial, mentions relues, prix, e-mail pro, texte de confidentialité. Rappelle-lui la liste de `LISEZMOI.md` (« À valider »).
4. Vérifier en ligne : `curl -I` (HTTPS, redirections), `/robots.txt` annonce le plan du site, `/sitemap.xml`, `npm run referencement -- --en-ligne https://<domaine>`, captures bureau et téléphone.
- **Greg doit** : achat, changement des serveurs de noms, fusion, « go ». Délais de propagation : quelques minutes à 24 h.

### Lot C : e-mails qui fonctionnent
- Objectif : **recevoir** sur `contact@<domaine>` et **envoyer depuis** cette adresse (réponses, confirmations du formulaire, flux n8n).
- Ce qu'il faut savoir (**à vérifier** sur les pages officielles le jour même) : le routage d'e-mails de Cloudflare ne fait que transférer ; pour répondre depuis le domaine il faut une vraie boîte avec accès IMAP/SMTP (celle du bureau d'enregistrement ou de l'hébergeur, ou un service de messagerie avec domaine personnalisé). Présente à Greg 3 options avec prix, limites, simplicité, puis laisse-le choisir (rouge : argent).
- Quel que soit le choix : enregistrements DNS **SPF, DKIM, DMARC** (démarrer DMARC en `p=none`, passer à `quarantine` après quelques semaines de rapports propres), test d'envoi et de réception, test de délivrabilité vers une boîte Gmail et une boîte Proton de Greg.
- Dans le dépôt : `agence.email` dans le contenu, mentions légales, confidentialité, adresse en dur dans les nœuds e-mail de `kit/automatisation/n8n/`, clé Web3Forms dans `/admin` (ou notification par n8n), annexe 3 du contrat de sous-traitance (pays et garanties de Web3Forms) **si** Web3Forms reste utilisé.
- **Greg doit** : choisir et payer la boîte, saisir les DNS (ou te laisser les préparer), donner l'accès SMTP **dans les Secrets/credentials, jamais dans le chat ni le dépôt**.

### Lot D : la page `/admin` plus riche
Aujourd'hui `/admin` gère déjà : annonce, réalisations, actualités (« Publier une actualité » en haut), engagements, accueil, expertises, agence, demandes, abonnements, libellés, pages par métier, comparaison, visites, mot de passe, coordonnées. Il manque, d'après Greg :
1. **Avis clients** (nouveau type de contenu `avis`) : liste d'avis (nom ou initiales, métier, texte, date, photo facultative, lien vers la réalisation liée, **case « accord écrit obtenu » obligatoire** pour publier, case « afficher »). Affichage sobre (accueil et page Réalisations, pas de fausse note ni d'étoiles inventées). Pas de balisage `Review`/`AggregateRating` sur son propre site pour sa propre entreprise (Google ne l'accepte pas comme résultat enrichi : **à vérifier**). Lien court `/avis` déjà présent pour la fiche Google : le relier. Règles : jamais d'avis sans accord, jamais d'avis rédigé par toi ou par Greg ; mention de la date.
2. **« Ajouter un site réalisé »** : un assistant en 4 étapes (nom et adresse du site, métier, 1 à 3 captures à envoyer avec réduction automatique et suppression des métadonnées, deux phrases de description, accord écrit du client coché) qui crée la réalisation, avec un **aperçu avant enregistrement**. Réutilise l'éditeur de réalisations existant ; ne le réécris pas.
3. **Tableau de bord d'accueil** (en tête de `/admin`) : demandes nouvelles à traiter, visites des 7 derniers jours, dernier message de sauvegarde, trois boutons rapides (publier une actualité, ajouter un site, ajouter un avis).
4. Pour chaque ajout : clés de contenu dans `outils/verifier.mjs`, nettoyage côté serveur dans `src/worker.js` (clés facultatives conservées), tests dans `outils/tester.mjs` (un test écrit **avant** le correctif, comme pour la perte de données de `abonnements` en octobre), accessibilité à 390 px, `npm run look-ia` sans nouvel indice, puis report dans `kit-sites-boutiques/modeles/agence-operia`.
- **Greg doit** : essayer sur son téléphone, fusionner.

### Lot E : automatisations et VPS (seulement après les lots B et C)
- Lire `kit/automatisation/README.md` et `PROMPT-SESSION-VPS.md`. Les flux sont **désactivés** et le site n'envoie rien à n8n tant que `N8N_WEBHOOK_URL` et `N8N_SECRET` ne sont pas posés. Ordre : (1) texte « Traitement automatique des demandes » collé dans `/admin` et relu par Greg ; (2) pays du centre de données du VPS noté dans le registre des traitements ; (3) durcissement du VPS : accès SSH par clé, pas de connexion root, pare-feu, mises à jour automatiques de sécurité, sauvegardes, n8n protégé par double authentification, rien d'ouvert sans besoin ; (4) installation guidée du kit ; (5) clé API Anthropic avec plafond ; (6) Telegram (bot de Greg) ; (7) Secrets posés dans Cloudflare ; (8) un essai de bout en bout avec **une fausse demande** envoyée par Greg à lui-même.
- Autres automatisations utiles et légales à proposer (Greg choisit) : rappel hebdomadaire des demandes sans réponse ; rapport mensuel `npm run referencement` + `look-ia` par e-mail à Greg ; surveillance de disponibilité du site ; contrôle automatique à chaque demande de fusion (GitHub Actions : `verifier`, `test`, `accessibilite`) ; sauvegarde du contenu (le cron nocturne existe).
- **Règles** : aucun envoi automatique à un prospect (la prospection par e-mail a ses règles, y compris entre professionnels : **à vérifier**, CNIL) ; un e-mail automatique ne peut être qu'un accusé ou une confirmation, texte fixe, sans texte écrit par une IA ; les données des demandes ne partent vers aucune IA sans que la confidentialité le dise.
- **Greg doit** : VPS, clés, bot, double authentification. Tout ce qui touche au VPS est rouge.

### Lot F : référencement et visibilité
- Suivre `docs/REFERENCEMENT.md` et `docs/PLAN-REFERENCEMENT-IA.md` : Search Console (propriété « domaine », DNS, plan du site, inspection de l'accueil et des pages par métier), Bing Webmaster Tools, **fiche d'établissement Google** (catégorie, zone de service si Greg ne veut pas publier son adresse, photos, description, horaires, lien, validation par vidéo, appel ou courrier : **à vérifier**), mêmes nom, téléphone, zone partout (`outils/coherence.mjs`), IndexNow, lien d'avis.
- **Greg doit** : créer les comptes (c'est lui le propriétaire), valider la fiche.
- Rien ne garantit une place dans Google : ne le promets ni à Greg ni dans les textes.

### Lot G : légal et administratif (guide et brouillons, pas de conseil)
Pour chaque point : ce que c'est, si Greg est concerné, le pas à faire, le lien officiel (**à vérifier le jour même**), la date limite, qui peut aider. Greg a posé ces questions : **faut-il un compte bancaire dédié (« compte pro ») ?** (indique la règle de séparation des comptes pour un entrepreneur individuel en micro-entreprise et le seuil de chiffre d'affaires, **à vérifier** sur service-public.fr ; un second compte personnel peut être toléré s'il ne sert qu'à l'activité, **à demander à la banque**) ; **fiche Google** (lot F) ; franchise de TVA (confirmer sur impots.gouv.fr) ; ACRE (date limite dans `docs/PLAN-ENTREPRISE.md`) ; CFE ; Urssaf ; RC Pro ; Guichet unique (nom commercial « Grégoire Muel ») ; mentions légales, CGV, contrat de création et de sous-traitance (relecture par un juriste ou une structure d'aide à la création, **à faire**) ; factures électroniques (calendrier à vérifier) ; registre des traitements ; contrat de travail de Greg (clause d'exclusivité, déclaration d'une activité annexe).
- **Livrable** : une checklist datée dans le guide du lot H.

### Lot H : le guide pas à pas pour Greg
- Mettre à jour `docs/DOCUMENT-FINAL.html` : **un seul fichier HTML autonome**, en français, tutoiement, sommaire cliquable, panneaux dépliants, cases à cocher mémorisées dans le navigateur, calendrier daté, images (captures du site réel, démonstrations), « à vérifier » bien visibles. Contenu : l'état réel du site, chaque lot (A à G) en étapes cochables avec « ce que tu fais / ce que l'agent fait », coûts mensuels et annuels, comptes à ouvrir, ce qui se passe si on s'arrête, glossaire (domaine, DNS, MX, SPF, DKIM, DMARC, Worker, KV, n8n, VPS, Search Console…).
- Pas de chiffre ni de taux fiscal sans source datée ; ce qui n'est pas vérifié est « à vérifier ».

### Lot I : clôture et relecture
- Mettre à jour `docs/REPRISE.md`, `LISEZMOI.md` (« À valider »), `METHODE.md` partie 4 (leçons) dans le kit ; demandes de fusion ouvertes avec leurs contrôles ; état final constaté en ligne.
- Dis à Greg de passer la **relecture par Claude** (annexe B).

## 6. Contrôles avant chaque demande de fusion

`npm run verifier` (aucune erreur) · `npm test` (tout « ok ») · `npm run accessibilite` · `npm run referencement` · `npm run look-ia` · `npm run rendu` (serveur local lancé, `npx wrangler dev --port 8801`) · captures à 1440 et 390 px **regardées** (`outils/captures.mjs`, `outils/controle-visuel.mjs` du kit) · pas de débordement horizontal à 390 px · texte jamais sous 14 px (`docs/REGLES-DESIGN.md`).
Corps de la demande de fusion : ce qui change, les contrôles et leurs résultats, les captures, ce que Greg doit faire, ce qui reste « à vérifier ».

## 7. Si tu bloques

Dis ce qui bloque, ce que tu as essayé, ce dont tu as besoin, et continue sur un autre lot. Ne contourne jamais un refus (accès, droits, pare-feu) et ne demande pas à Greg de te donner une clé Cloudflare : propose la commande à lancer lui-même.

---

## Installer (pour Greg, une seule fois)

1. **GLM** : abonnement GLM Coding Plan (z.ai) ; clé API. **OpenCode** : installer depuis opencode.ai (instructions à jour sur leur site) ; ajouter le fournisseur Z.AI / GLM dans OpenCode (commande `/connect`, **à vérifier** dans leur documentation) et choisir le modèle GLM le plus fort proposé le jour même. Le GLM Coding Plan est prévu pour ton usage dans les outils officiels (OpenCode, Claude Code), pas pour un robot qui tourne seul.
2. **Outils** : Git, Node 22 ou plus, GitHub CLI (`gh auth login`), puis `npm i -g wrangler` ou `npx wrangler login` (connexion par le navigateur : c'est **toi** qui te connectes, l'agent ne voit pas ton mot de passe).
3. **Dépôts côte à côte** : `gh repo clone gregoiremuel/site-atelier-muel`, `gh repo clone gregoiremuel/kit-sites-boutiques`, et si besoin `gh repo clone gregoiremuel/agence-eims`. Puis `npm install` dans `site-atelier-muel` et dans `kit-sites-boutiques/modeles/agence-operia`.
4. **Skills** : l'agent lit les `SKILL.md` du kit comme de simples fichiers (`AGENTS.md` le lui dit) ; ou `npx skills add gregoiremuel/kit-sites-boutiques` (connecté à GitHub).
5. Ouvre OpenCode dans `site-atelier-muel` et tape : « Lis AGENTS.md puis docs/PROMPT-OUVERTURE-GLM.md et suis-le. »
6. **Pour ne rien casser** : l'agent travaille en branche et ouvre des demandes de fusion ; Cloudflare met en ligne seulement quand **tu** fusionnes dans `main`. Garde la double authentification sur GitHub, Cloudflare, ton bureau d'enregistrement et ta messagerie.

## Annexe A : modèle de message de démarrage (si l'agent ne charge pas `AGENTS.md`)

> Tu es le chef de projet de l'ouverture du site de Grégoire Muel. Lis `AGENTS.md`, `docs/REPRISE.md` et `docs/PROMPT-OUVERTURE-GLM.md` du dépôt `gregoiremuel/site-atelier-muel`, ajoute `gregoiremuel/kit-sites-boutiques`. Pose d'abord les questions du paragraphe 4, puis avance lot par lot (A à I), une demande de fusion par lot, Greg fusionne. Français, tutoiement, réponse en trois parties. Ne rien inventer, aucun secret dans le dépôt, tout ce qui touche à l'argent, aux comptes, aux DNS, aux Secrets ou au VPS : tu demandes avant.

## Annexe B : prompt de relecture à donner à Claude à la fin

> Ajoute `gregoiremuel/site-atelier-muel` et `gregoiremuel/kit-sites-boutiques`. Lis `AGENTS.md`, `docs/REPRISE.md` et `docs/PROMPT-OUVERTURE-GLM.md`. GLM a fait les lots A à I. Relis : (1) les demandes de fusion ouvertes et fusionnées depuis le 04/11/2026 (diff, tests, captures) ; (2) la sécurité (aucun secret dans l'historique Git, Secrets en place, mot de passe remplacé, DNS, SPF/DKIM/DMARC, durcissement du VPS) ; (3) le légal et la conformité (`docs/CONFORMITE.md`, avis clients avec accord écrit, textes de confidentialité) ; (4) le guide `docs/DOCUMENT-FINAL.html` (chiffres sourcés, « à vérifier ») ; (5) ce qui est réellement en ligne. Réponds en trois parties : Réponse claire ; Niveau de confiance ; Réserves clés. Liste les corrections par ordre de gravité.
