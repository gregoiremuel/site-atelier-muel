# Contrat de sous-traitance de données personnelles (article 28 du RGPD)

> Base à faire relire par un juriste. Le client (commerce, entreprise) est **responsable du traitement** de ses données ; tu es son **sous-traitant** pour l'hébergement et l'administration du site. *Notes en italique pour toi : à garder vraies, vérifie chaque point avant de signer.*

**Responsable du traitement** : [client, SIREN, adresse] · **Sous-traitant** : [Grégoire Muel], EI, SIRET 131 703 951 00015, [adresse]
**Date** : [JJ/MM/AAAA]

## 1. Objet et durée
Le sous-traitant héberge et administre le site internet du responsable de traitement et traite pour son compte les données décrites à l'annexe 1. Le contrat dure aussi longtemps que le sous-traitant héberge ou administre le site.

## 2. Nature, finalité, données, personnes
Voir annexe 1.

## 3. Obligations du sous-traitant
1. Traiter les données **uniquement sur instruction documentée** du responsable (les instructions sont celles de ce contrat et du devis) et l'informer s'il pense qu'une instruction viole le RGPD.
2. Garantir la **confidentialité** : les personnes autorisées sont tenues au secret.
3. Mettre en œuvre les **mesures de sécurité** de l'annexe 2.
4. **Sous-traitants ultérieurs** : le responsable autorise ceux de l'annexe 3 ; le sous-traitant l'informe de tout changement avec [30] jours de préavis, pour qu'il puisse s'y opposer.
5. **Aider le responsable** à répondre aux demandes des personnes (accès, rectification, effacement) : réponse sous [5] jours ouvrés à une demande transmise.
6. **Violation de données** : prévenir le responsable **sans retard injustifié et au plus tard 48 heures** après en avoir eu connaissance, avec les informations utiles pour que le responsable déclare à la CNIL dans les 72 heures s'il y a lieu.
7. **Fin du contrat** : sur choix du responsable, remettre une copie des données puis les **effacer** sous 30 jours (les demandes de contact sont de toute façon effacées après 180 jours), sauf obligation légale de conservation.
8. Mettre à disposition les informations nécessaires pour **démontrer le respect** du contrat et permettre des audits raisonnables, sur préavis de [15] jours.
9. Tenir un **registre** des traitements effectués pour le compte du responsable.

## 4. Obligations du responsable de traitement
Informer les personnes (page de confidentialité du site, fournie par le sous-traitant, à relire par le responsable), avoir une base légale, répondre aux personnes et à la CNIL, et ne pas demander de données inutiles dans le formulaire.

## 5. Transferts hors de l'Union européenne
Cloudflare est une société américaine : des transferts de données hors UE sont possibles. [Le sous-traitant s'appuie sur les garanties de Cloudflare : à décrire après vérification, par exemple cadre de protection des données UE-États-Unis ou clauses contractuelles types]. *À vérifier avant signature.* Si un stockage en juridiction UE est mis en place (METHODE.md, 2.10), l'annexe 3 le dira.

## 6. Responsabilité
Chaque partie répond de ses manquements au RGPD envers les personnes et la CNIL selon la loi. Pour le reste, voir les conditions générales de vente.

**Fait à [ville], le [date].** Responsable (signature) · Sous-traitant (signature)

---
## Annexe 1. Description du traitement
- **Nature** : hébergement, enregistrement, consultation et suppression de demandes envoyées par le formulaire du site ; administration technique du site.
- **Finalité** : permettre au responsable de recevoir et traiter les demandes de ses clients et prospects.
- **Données** : nom, prénom, e-mail, téléphone, société (facultative), message et précisions saisies. *Le formulaire ne demande aucune donnée sensible : ne pas en demander.*
- **Personnes** : prospects et clients du responsable.
- **Durée de conservation** : 180 jours dans la mémoire du site, puis effacement automatique. Les e-mails envoyés via Web3Forms sont conservés selon ce service et la messagerie du responsable.
- **Mesure des visites** : le site compte les pages vues, sans cookie, sans adresse IP ni identifiant : pas de donnée personnelle enregistrée.

## Annexe 2. Mesures de sécurité (état au 28/10/2026)
- Connexions chiffrées (HTTPS). Page de modification protégée par un mot de passe haché (PBKDF2) ; 8 essais ratés bloquent 15 minutes ; session de 30 jours à cookie sécurisé (HttpOnly, SameSite).
- Demandes du formulaire limitées par appareil ; effacement automatique à 180 jours.
- Accès du sous-traitant limité à son compte d'hébergement ; mot de passe unique par site, changeable sur demande du responsable ; accès fermé à la fin de la collaboration si le responsable le demande.
- Copie de sauvegarde nocturne du contenu, conservée 7 nuits.
- Aucun identifiant ni secret dans le code source.

## Annexe 3. Sous-traitants ultérieurs
| Nom | Rôle | Pays / garanties |
|---|---|---|
| Cloudflare, Inc. | Hébergement du site, de la mémoire du site et des sauvegardes | États-Unis, serveurs répartis dans le monde [garanties à compléter] |
| Web3Forms | Envoi par e-mail des demandes du formulaire (si activé) | [pays et garanties à compléter après vérification] |
| Aucun autre | | |

*Si tu ajoutes un assistant (chatbot) ou un autre service, **mets cette annexe à jour avant de l'activer** (un fournisseur d'IA recevrait les messages des visiteurs).*
