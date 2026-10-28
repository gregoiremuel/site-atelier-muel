# Modèles de documents (28 octobre 2026)

Ce sont des **bases de travail**, écrites par Claude, **pas des conseils juridiques**. Aucune de ces bases n'a été relue par un juriste. Avant d'en envoyer une à un vrai client : la faire relire une fois (un juriste, ta banque, la CCI ou un service gratuit pour créateurs d'entreprise), puis la réutiliser.

Les **[crochets]** sont à remplir. Les points marqués **« à vérifier »** sont des règles dont je suis sûr à moins de 100 % : elles sont rassemblées plus bas.

| Fichier | À quoi il sert |
|---|---|
| `01-devis.md` | Devis (maquette gratuite, puis devis signé avec acompte) |
| `02-facture.md` | Facture d'EI en franchise de TVA, avec les nouvelles mentions de la facture électronique |
| `03-cgv-professionnels.md` | Conditions générales de vente, entre professionnels |
| `04-contrat-de-creation.md` | Contrat de création : **licence du moteur** (pas de cession) et **cession du contenu et du nom de domaine** |
| `05-contrat-sous-traitance-rgpd.md` | Contrat de sous-traitance des données personnelles (tu es sous-traitant du client) |
| `06-script-visite-et-diagnostic.md` | Script de visite en boutique et mini-diagnostic gratuit de la fiche Google |

## Les points à décider par toi
1. **Remise du code du moteur** : par défaut, le client ne reçoit **pas** le code, mais une copie lisible de son contenu (textes, photos). Il garde donc son site tant que tu l'héberges ; s'il part, il ne peut pas réinstaller le même site ailleurs sans ton moteur. C'est honnête mais c'est un vrai choix : le dire clairement dans le devis (c'est fait dans le contrat, article 4). Alternative : publier le moteur sous une licence libre (le client pourrait alors le réutiliser), à décider plus tard.
2. **Compte Cloudflare** : qui détient le compte qui héberge le site (le tien ou celui du client) ? Le contrat suppose **le tien** et prévoit un transfert sur demande. À vérifier avec le fonctionnement réel avant de signer le premier client.
3. **Acompte et rétractation** (voir ci-dessous) : à trancher avec le juriste.
4. **Tribunal compétent** et **assurance RC Pro** (à citer dans le devis et les CGV une fois le contrat souscrit).

## Les points « à vérifier »
- **Droit de rétractation pour un contrat signé en boutique.** Un commerçant de 5 salariés au plus qui signe, **hors de ses compétences principales** (un site internet pour un fleuriste), peut être traité comme un consommateur pour les contrats conclus « hors établissement » : 14 jours de rétractation, et **aucun paiement ne peut être demandé dans les 7 premiers jours** (articles L221-3 et L221-10 du Code de la consommation, d'après mes connaissances). Si c'est exact, **l'acompte de 30 % ne peut pas être encaissé à la signature en boutique**. Les modèles prévoient donc : signature, puis démarrage du travail après un délai, et acompte demandé après 7 jours, avec un formulaire de rétractation. À faire confirmer.
- **Mentions de la facture électronique** à partir du 1er septembre 2026 pour la réception, 2027 pour l'émission : SIREN du client, nature de l'opération (prestation de services), adresse de livraison si différente, option de TVA sur les débits (non applicable en franchise). Source citée dans `docs/PLAN-ENTREPRISE.md` ; à confirmer sur impots.gouv.fr.
- **Pénalités de retard** : « trois fois le taux d'intérêt légal » est le minimum légal d'après mes connaissances ; indemnité forfaitaire de **40 €**.
- **Mention « EI »** : l'entrepreneur individuel doit faire figurer « EI » ou « entrepreneur individuel » avec son nom sur ses documents (d'après mes connaissances).
- **Franchise de TVA** : la mention « TVA non applicable, article 293 B du CGI » n'est valable **que si tu es en franchise**. Tu m'as dit ne pas le savoir : l'espace impots.gouv.fr (« Gérer mon activité ») ou le service des impôts des entreprises le dit. Sans franchise, il faut facturer la TVA (20 %).
- **Droits d'auteur** : une cession de droits doit nommer chaque droit cédé, son étendue, sa durée et son territoire (article L131-3 du Code de la propriété intellectuelle) ; l'article 5 du contrat le fait.
- **Contrat de sous-traitance** : les mentions de l'article 28 du RGPD y sont ; les mesures de sécurité décrites sont celles du moteur au 28/10/2026 et doivent rester vraies.
