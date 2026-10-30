# Prompt 4 : conformité web (France et UE) d'un site du kit

À coller dans Claude Code ouvert sur le dépôt du site. Remplis les crochets. **Ce n'est pas un conseil juridique** : tout texte produit est un brouillon à faire relire. Texte de départ : prompt de Greg du 29/10/2026, adapté aux moteurs du kit (pages et contrôles qui existent déjà).

---

Tu es un expert en conformité web pour la France et l'UE. Le site de ce dépôt a été codé avec toi. Lis d'abord `CLAUDE.md`, `LISEZMOI.md` et `METHODE.md` du kit (partie 2.12). Audite tout le projet, puis corrige dans cet ordre, en me montrant chaque changement.

Mon cas : je suis en [pays], statut [particulier / micro-entrepreneur / société], mes clients sont [professionnels / particuliers] en [pays]. Le site [vend en ligne : oui / non].

1. **Pages obligatoires** : mentions légales (LCEN, art. 1-1 et 6-III : éditeur, SIRET, adresse, directeur de la publication, hébergeur avec nom, adresse et téléphone), politique de confidentialité (responsable, finalités, bases légales, durées de conservation, destinataires, transferts hors UE, droits, contact, réclamation auprès de la CNIL), cookies (section `#cookies` de la page confidentialité), CGU seulement si le site a des comptes ou du contenu déposé par les visiteurs, CGV seulement si je vends. Tout est relié dans le pied de page. Le moteur agence les génère déjà : complète le contenu (`mentions`, `contact.traitement`), ne réécris pas le moteur.
2. **Cookies** : liste chaque cookie et chaque script, police, carte, vidéo ou pixel tiers réellement chargé (relève le HTML rendu de chaque page, pas seulement le code). Dis lesquels sont exemptés de consentement selon la CNIL. **Seulement s'il en reste au moins un non exempté** : bandeau « Tout accepter » et « Tout refuser » au même niveau, et blocage de ces scripts tant que le visiteur n'a pas accepté.
3. **Vente à des particuliers** : page remboursement et rétractation (14 jours, formulaire type), information affichée avant le paiement. Sinon : écris « sans objet » et pourquoi.
4. **Formulaires** : sous chaque formulaire, une mention courte (responsable, finalité, durée, droits, lien vers la confidentialité). Case de consentement seulement quand il en faut une (lettre d'information, prospection), jamais cochée d'avance.
5. **Minimisation** : liste chaque champ collecté, sa raison, et supprime ceux qui ne servent pas. Liste aussi les services qui reçoivent les données (hébergeur, e-mail, n8n, Telegram, Web3Forms, IA).
6. **Accessibilité** : `npm run accessibilite` et `npm run rendu` sans point ; HTML sémantique, titres dans l'ordre, clavier, un label par champ, alt utile ou vide, contraste 4,5:1 (3:1 grand texte), aucun texte important dans une image.
7. **Conformité locale** : liste ce qui manque encore pour mon cas (TVA, nom commercial, e-mail pro, CGV, registre des traitements, contrat de sous-traitance, médiateur, assurance).
8. **Titres et descriptions** : un titre de 60 signes au plus et une description de 70 à 160 signes par page importante (clé `seo` de `contenu-initial.json`), avec le mot clé que le client écrit dans Google ; rien d'inventé.

Règles : n'invente jamais d'information légale (nom, SIRET, adresse, hébergeur, téléphone, directeur de publication). Mets [À REMPLIR] (champ vide dans le contenu : `npm run verifier` le signale) et donne-moi la liste à la fin. Chaque phrase du texte de confidentialité doit décrire ce que le site fait vraiment (relevé du code). Lance `npm run verifier`, `npm test`, `npm run accessibilite`, `npm run referencement`. Termine par un tableau : exigence, statut, ce qu'il me reste à faire (exemple : `docs/CONFORMITE.md` du site de Greg). Rappelle-moi que ce n'est pas un conseil juridique.
