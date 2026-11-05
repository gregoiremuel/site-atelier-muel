# Mettre le site en ligne : pas à pas (28 octobre 2026)

Cloudflare n'est pas joignable depuis l'espace de Claude : **toutes les étapes de ce document se font avec toi**, sur ton téléphone ou ton ordinateur. Compte : une heure à une heure et demie, hors délais d'achat et de propagation du domaine. Ne fais rien dans le désordre : le site reste en « version de travail » (`MAQUETTE` à « oui », non indexé) jusqu'à l'étape 7.

## Avant de commencer : ce qui doit être décidé (rien ne se met en ligne sans)
- [ ] **Franchise de TVA** : vérifie sur impots.gouv.fr (« Gérer mon activité ») ou auprès du SIE. Sans franchise, la ligne « TVA non applicable » des mentions légales et des modèles est fausse.
- [ ] **Nom commercial** : décision prise par défaut = « Grégoire Muel ». À modifier sur le **Guichet unique** (procedures.inpi.fr) : le registre dit encore « Atelier Muel » pour ton activité web. Les mentions légales du site disent « Nom commercial : Grégoire Muel ». Fais la modification **avant** l'ouverture, sinon retire la ligne (`mentions.nom_commercial`).
- [ ] **Prix** (590 € une fois, 19 / 49 / 39 € par mois) : valides-les ou donne-moi les nouveaux ; je les changerai aux trois endroits (offres, pages par métier, comparaison).
- [ ] **Tarifs du constructeur** du tableau de comparaison : relis-les sur wix.com le jour de l'ouverture (relevés le 28/10/2026 sur un comparatif, pas sur le site officiel).
- [ ] **Opéria** : masqué par défaut. Si leur accord est donné : « Afficher sur le site » dans la réalisation, et leur adresse dans « Lien à ouvrir ».
- [ ] **Mentions légales et confidentialité** : fais relire (c'est un brouillon). **Adresse** : celle du registre apparaît dans les mentions ; si c'est ton domicile et que tu ne veux pas la publier, il faut une domiciliation.
- [ ] **Promesses des formules** : tu dois pouvoir les tenir : 30 minutes (Sérénité) et 1 heure (Croissance) de modifications par mois, réponse sous 2 jours ouvrés, une copie complète chaque mois (Sérénité et plus), chiffres des visites chaque mois (Croissance), rapport d'une page chaque mois (Visibilité Google), nom de domaine renouvelé (Sérénité).
- [ ] **Compte Cloudflare** : c'est le tien qui héberge le site des clients ; les engagements disent « vous gardez la page de modification » et « je ferme mon accès à la demande du client ». Pour ton propre site, aucun problème.
- [ ] **Salarié en parallèle** : relis ton contrat (clause d'exclusivité, déclaration d'une activité annexe à l'employeur). Tu m'as dit travailler dans la joaillerie : si ton employeur est dans la même branche que ton futur Atelier Muel, c'est surtout un sujet pour la joaillerie plus tard, pas pour les sites. À confirmer par la lecture du contrat.

## 1. Le nom de domaine
1. ~~Achète le domaine~~ **Fait le 05/11/2026** : `sterenncreation.fr` acheté chez OVHcloud (commande 263462179, 5,99 € TTC la première année avec Zimbra Starter ; renouvellement ~8,60 €/an). Le nom « Sterenn Création » est différent du nom légal : à déclarer comme nom commercial au Guichet unique avant l'ouverture. `ateliermuel.fr` (joaillerie) et `gregoiremuel.fr` restent **à réserver** si tu les veux (achats séparés).
2. Ajoute le domaine à ton compte Cloudflare (« Add a domain », offre gratuite) — **fait le 05/11/2026**, serveurs Cloudflare attribués (`jobs.ns.cloudflare.com`, `shubhi.ns.cloudflare.com`), MX et SPF recopiés. Reste : changer les serveurs de noms chez OVHcloud pour ceux de Cloudflare (seulement après disparition complète du DS DNSSEC, désactivé le 05/11 vers 23 h) puis « Check nameservers ». Délai : de quelques minutes à 24 heures.
3. Dis-moi quand c'est actif : la route `{ "pattern": "sterenncreation.fr", "custom_domain": true }` est déjà préparée dans `wrangler.jsonc` (demande de fusion du lot B) et `reglages.url` = `https://sterenncreation.fr` est déjà dans le contenu.

## 2. L'e-mail professionnel — **choix fait le 05/11/2026 : Zimbra Starter chez OVHcloud** (1re année offerte, 3,60 €/an ensuite)
- `contact@sterenncreation.fr` **créée le 05/11/2026**. Webmail : https://mail.zimbra.ovh.net · application mobile « Zimbra » (Play Store / App Store).
- Réglages pour une app mail (IMAP/SMTP, doc OVH du 04/05/2026) : réception `imap.mail.ovh.net` port 993 SSL/TLS ; envoi `smtp.mail.ovh.net` port 465 SSL/TLS ; utilisateur = l'adresse complète.
- Reste à faire après la bascule Cloudflare : vérifier SPF, ajouter le DKIM du Zimbra et un DMARC (`p=none`) chez Cloudflare, test d'envoi vers Gmail et Proton, puis l'adresse dans « Coordonnées » et les mentions légales. L'ancienne piste « Email Routing Cloudflare » est abandonnée (le Zimbra la remplace).

## 3. Mettre le site sur Cloudflare (depuis GitHub, sans ordinateur)
1. https://dash.cloudflare.com : « Workers & Pages », « Create application », « Import a repository », choisis `site-atelier-muel`.
2. **Branche à déployer** : la branche principale du dépôt. Si les changements du 28/10/2026 sont encore sur `claude/integration-repos-plan-3q1kd9`, il faut d'abord les rassembler dans la branche principale (je prépare la demande de fusion quand tu me le dis ; je n'en ouvre pas sans ton accord).
3. Nom du projet : **site-atelier-muel** (exactement). « Save and Deploy ». La mémoire du site (KV) se crée toute seule.
4. « Settings » > « Variables and Secrets » : deux **Secrets** (pas des variables) : `ADMIN_HASH` et `SESSION_SECRET`. Valeurs : **demande-les-moi dans la conversation au moment de cette étape** (je lance `npm run mot-de-passe`, je te donne le mot de passe et les deux valeurs à coller) ; ne les écris jamais dans le dépôt. Relance un déploiement.
5. Adresse provisoire : `site-atelier-muel.<ton-compte>.workers.dev` ; la page de modification est à la même adresse suivie de `/admin`.
6. **Premier essai** (MAQUETTE encore à « oui ») : connexion à `/admin`, **enregistre une modification de test** (par exemple un message en haut du site), puis vérifie que « Offres » affiche toujours les quatre formules et le tableau de comparaison. *(Le moteur d'avant le 28/10 perdait ces blocs au premier enregistrement ; c'est corrigé et testé, mais ce contrôle vaut la peine.)* Retire le message ensuite.

## 4. Tester le stockage en juridiction UE (5 minutes, facultatif mais utile)
Dans un terminal (ton ordinateur) : `npx wrangler login`, puis `npx wrangler kv namespace create TEST-UE --jurisdiction=eu`.
- **Un identifiant s'affiche** : le stockage UE est disponible sur ton offre. Note-le dans `METHODE.md` partie 2.10 (« Résultat du test »). Pour l'utiliser vraiment : crée-en un nommé `CONTENU` avec `--jurisdiction=eu`, mets son `id` dans `wrangler.jsonc` à la place de l'auto-création, recopie le contenu (`kv key get` puis `kv key put`), puis seulement écris « données stockées dans l'Union européenne » (engagements, confidentialité). Supprime `TEST-UE`.
- **Une erreur parle de bêta, d'accès ou d'offre** : copie-moi le message ; on reste sur le stockage par défaut et les textes ne changent pas.
La documentation de Cloudflare se contredit sur la disponibilité (voir `METHODE.md` 2.10) : seul ce test fait foi.

## 5. Les demandes par e-mail (Web3Forms)
Clé gratuite sur https://web3forms.com avec ton e-mail pro ; colle-la dans « Demandes de contact » > « Réglages du formulaire » > « Clé Web3Forms ». Sans clé, les demandes arrivent quand même dans la page de modification. **Mets à jour l'annexe 3 du contrat de sous-traitance** (pays et garanties de Web3Forms) avant de signer un client.

## 6. La sauvegarde externe (facultatif)
La copie nocturne dans la mémoire du site est automatique après la mise en ligne (vérifie le lendemain dans « Visites du site » : « Dernière copie de sauvegarde »). Pour une copie **hors** de la mémoire du site : activer R2 dans Cloudflare (demande une carte bancaire même pour l'offre gratuite : **à vérifier**), créer un stockage (juridiction UE possible), puis dé-commenter la ligne `r2_buckets` de `wrangler.jsonc` : je le fais avec toi.

## 7. Ouvrir pour de vrai
1. Dis-moi « go » : je passe `MAQUETTE` à « non » dans `wrangler.jsonc`, j'ajoute la route du domaine, je lance `npm run verifier`, `npm test`, `npm run accessibilite`, puis je pousse.
2. Cloudflare redéploie. Vérifie : le bandeau « version de travail » a disparu ; `/robots.txt` annonce le plan du site ; `/sitemap.xml` liste les pages (dont les pages par métier) ; un envoi du formulaire arrive dans « Demandes de contact » et par e-mail.
3. **Le lendemain** : « Visites du site » compte tes propres visites (pas celles des robots) ; la dernière copie de sauvegarde est datée de la nuit.

## 8. Google (détail et liste à cocher : `docs/REFERENCEMENT.md`)
1. **Search Console** (search.google.com/search-console) : ajoute la propriété (domaine), valide par le DNS (Cloudflare), envoie `/sitemap.xml`.
2. **Ta fiche Google** (business.google.com) : « Création de sites internet », zone Paris 16e et à distance, téléphone, horaires, lien vers le site, photos, description. C'est ta meilleure vitrine ; les premiers avis de clients pilotes y comptent le plus. **Ne demande pas d'avis en échange d'un rabais ni de faux avis.**
3. Sur ta fiche et sur ton site, **les mêmes** nom, adresse, téléphone et horaires.

## 9. Ensuite
- Le **plan sur 90 jours** et le **script de visite** : `docs/PLAN-ENTREPRISE.md` (partie 7) et `docs/modeles/06-script-visite-et-diagnostic.md`.
- **Trois clients pilotes** : à leur proposer avec le contrat (`docs/modeles/04-contrat-de-creation.md`, à faire relire) et un accord écrit de portfolio.
- **Remplacer les démonstrations** par leurs vrais sites sur le tien, avec leur accord.
