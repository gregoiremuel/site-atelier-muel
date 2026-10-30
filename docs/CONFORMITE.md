# Conformité (France, UE) et titres Google : état au 30 octobre 2026

**Ce document n'est pas un conseil juridique.** Il dit ce que le site fait, ce qui manque, et ce que Greg doit faire relire. Texte de départ : le prompt de conformité de Greg du 29/10/2026, repris dans `docs/PROMPT-CONFORMITE.md` (réutilisable pour chaque site du kit).

Cas de Greg : France, entrepreneur individuel (micro-entrepreneur), clients en France, surtout des professionnels (commerçants, artisans, entreprises).

## 1. Ce qui est réellement chargé (relevé du code et du rendu des 17 pages)

| Élément | Constat | Consentement ? |
|---|---|---|
| Cookies sur les pages publiques | aucun (test `Une visite ne dépose aucun cookie`) | sans objet |
| Cookie `boutique_session` | uniquement après connexion à `/admin` (HttpOnly, Secure, SameSite=Strict) | exempté (strictement nécessaire) |
| Mesure d'audience | compteur de pages vues par jour, sans cookie, sans IP, sans identifiant | exempté (aucune donnée personnelle) |
| Scripts tiers, polices tierces, cartes, vidéos intégrées, réseaux sociaux | aucun : polices et script servis par le site lui-même ; seuls liens sortants : Itinéraire (clic), LinkedIn/Instagram (clic) | sans objet |
| Formulaire de contact | envoie au Worker du site (Cloudflare) ; Web3Forms seulement si une clé est saisie ; copie vers n8n (VPS à Paris) et Telegram seulement si les Secrets sont posés | information, pas de consentement |

**Conséquence : aucun bandeau de cookies n'est nécessaire** (règle posée : bandeau seulement s'il reste au moins un traceur non exempté). Si un jour on ajoute Google Analytics, une carte Google, une vidéo YouTube ou un pixel, il faudra le bandeau « Tout accepter / Tout refuser » au même niveau et le blocage des scripts avant accord.

## 2. Tableau demandé : exigence, statut, ce qui reste

| # | Exigence | Statut | Ce qui reste à faire |
|---|---|---|---|
| 1 | Mentions légales (LCEN art. 1-1 / 6-III) | fait : éditeur, SIRET, adresse, TVA, directeur de la publication, hébergeur, utilisation du site | **[À REMPLIR]** e-mail de contact ; **[À REMPLIR]** téléphone de l'hébergeur (Cloudflare : à reprendre sur son site, je n'ai pas pu le vérifier d'ici) ; faire relire |
| 1 | Politique de confidentialité | refaite : responsable, cookies, mesure des visites, données, finalité et base légale (art. 6.1.b), destinataires, durée (180 jours), transferts hors UE, droits, réclamation CNIL | e-mail à renseigner ; relecture ; phrase sur les transferts à vérifier ; ajouter Anthropic/Web3Forms/SMTP au texte le jour où ils servent |
| 1 | Politique cookies | faite : section `#cookies` de la page confidentialité, lien « Cookies » dans le pied de page | rien |
| 1 | CGU | pas de page séparée : le site n'a ni compte ni contenu déposé par les visiteurs ; la section « Utilisation du site » des mentions couvre propriété et démonstrations | décision de Greg : page séparée inutile à mon avis |
| 1 | CGV | **non faites** : les prix de vente et conditions de paiement sont des décisions de Greg | à rédiger avec les devis : prix, acompte, délai, pénalités de retard et indemnité forfaitaire de 40 € (clients professionnels), garantie, propriété du site, fin d'abonnement ; à faire relire. Elles ne s'affichent en ligne qu'une fois décidées |
| 2 | Cookies | voir le tableau 1 : aucun bandeau requis | rien aujourd'hui |
| 3 | Vente à des particuliers : rétractation 14 jours, formulaire type, information avant paiement | **sans objet aujourd'hui** : pas de paiement en ligne, clientèle professionnelle | si un particulier commande un site hors activité professionnelle (ou si un paiement en ligne est ajouté) : droit de rétractation, formulaire type, médiateur de la consommation (champ `mentions.mediateur`, vide) |
| 4 | Formulaires | fait : mention sous le formulaire (responsable, finalité, 180 jours, droits, CNIL, lien) ; aucune case de consentement (pas de newsletter ni de prospection) | si une lettre d'information est ajoutée : case non cochée d'avance |
| 5 | Minimisation | revue ci-dessous : aucun champ à retirer | voir le point 5 |
| 6 | Accessibilité | `npm run accessibilite` (axe, WCAG 2.2 AA, bureau, mobile, moins d'animations, clavier) : aucun problème sur les 17 pages ; `npm run rendu` : conforme | essai au lecteur d'écran (un audit automatique ne le remplace pas) ; pas de déclaration d'accessibilité (obligatoire seulement pour les organismes publics et grandes entreprises) |
| 7 | Conformité locale | voir le point 7 | voir le point 7 |

## 5. Champs collectés par le formulaire

| Champ | Obligatoire | Utile ? |
|---|---|---|
| Nom et prénom | oui | pour répondre |
| Téléphone **ou** e-mail | l'un des deux | pour répondre |
| Commerce ou entreprise | non | contexte de la demande |
| Votre demande (type) | non | tri de la demande |
| Ville | non | zone d'intervention (à Paris ou à distance) |
| Message | non | le projet |
| Case piège `botcheck` | invisible | antispam, ne garde rien |

Aucun champ à supprimer. Rien d'autre n'est collecté : pas de date de naissance, pas d'adresse postale, pas d'adresse IP gardée (`CF-Connecting-IP` sert seulement à limiter les envois, comptés 15 minutes).

## 7. Ce qui manque encore pour le cas de Greg (France, micro-entrepreneur, clients en France)

1. **E-mail professionnel** (mentions légales, droits RGPD, expéditeur de l'accusé de réception).
2. **Franchise de TVA** confirmée avec le service des impôts (la mention « article 293 B » en dépend).
3. **Nom commercial** « Grégoire Muel » à faire correspondre au registre (Guichet unique).
4. **Adresse publiée** : l'adresse du registre est affichée (obligation) ; domiciliation si c'est un domicile.
5. **CGV** et modèles de devis/factures avec les mentions obligatoires (clients professionnels).
6. **Contrat de sous-traitance (RGPD, art. 28)** avec les clients dont tu héberges les données (annexes déjà dans le kit : à faire relire).
7. **Registre des traitements** (art. 30 du RGPD) : une page suffit ; liste en point 1 et 5 ci-dessus.
8. **Prestataires hors UE** : Cloudflare (États-Unis), Telegram, Anthropic si l'IA est activée : vérifier leurs engagements (DPA) avant d'ouvrir.
9. **Assurance RC Pro**, **ACRE** (avant le 17/12/2026), **CFE** (avant le 31/12/2026) : voir `docs/REPRISE.md`.
10. **Médiateur de la consommation** : seulement si vente à des consommateurs.

## 8. Titres et descriptions Google (29 et 30 octobre 2026)

- Clé facultative **`seo`** de `contenu-initial.json` : `{ "/adresse": { "titre": "…", "description": "…" } }`. Le moteur l'utilise à la place du titre calculé ; `npm run verifier` signale un titre de plus de 60 signes ou une description hors de 70 à 160. Les 11 pages principales ont leur mot clé : création et refonte de site internet (Paris), site vitrine, boutique en ligne, site de restaurant, de plombier, de fleuriste, de commerce de bouche, fiche Google, maquette gratuite. Les pages de réalisations gardent leur titre automatique.
- Ces titres viennent du **fichier de départ**, déployé avec le code : ils s'appliquent même si la mémoire du site (KV) a déjà un contenu, et se changent en modifiant le fichier (ou en demandant à Claude). La page de modification n'a pas encore de rubrique pour eux.
- Aucune promesse de position : voir `docs/REFERENCEMENT.md`.

### Search Console : point d'attention
Tant que `MAQUETTE` vaut « oui », le site se ferme volontairement aux moteurs (`robots.txt` « Disallow: / », balise `noindex`). Search Console affichera donc « bloqué par robots.txt » : c'est normal. Le plan du site (`/sitemap.xml`) liste les adresses de `reglages.url` (`https://gregoiremuel.fr`, domaine **pas encore acheté**) : si la propriété ajoutée est l'adresse provisoire `workers.dev`, Google refusera ces adresses (autre domaine). L'ordre : acheter le domaine, l'activer sur Cloudflare, passer `MAQUETTE` à « non », puis ajouter la propriété « Domaine » et envoyer le plan du site.
