# Référencement des clients et automatisation par IA : plan préparé (29 octobre 2026)

Mis à jour le 29/10/2026 (fin de journée) : **les paliers 0 et 1 sont prêts** dans le kit (`visibilite-google/`, `outils/visibilite-google.mjs`), ainsi que l'automatisation des demandes (`automatisation/`). Rien n'est activé. Les chiffres viennent de `docs/PLAN-ENTREPRISE.md` (partie 4) et `docs/CHIFFRES.md` ; ce qui est une estimation est écrit comme tel ; ce qui n'a pas été vérifié est marqué « à vérifier ».

## 1. L'offre
**Visibilité Google, 39 € par mois, sans engagement, vendable sans site** (proposition à valider). Repères du marché (sources tierces) : CCI des Landes 50 € HT par mois, agences de 150 à 800 € par mois, Solocal environ 300 € par an. Net après cotisations (25,6 %) : environ 29 € pour une heure de travail. Ce que le client reçoit chaque mois :
1. Fiche Google à jour : horaires, jours fériés et congés, photos.
2. Un ou deux posts du mois, écrits avec l'IA, **validés par le client**.
3. Réponses aux avis préparées par l'IA, **validées par le client**. Jamais de faux avis, jamais d'avis offerts contre un rabais.
4. Une page ou une question nouvelle sur son site s'il en a un.
5. Un rapport d'une page : appels, itinéraires, visites du site, recherches. **Aucune promesse de position dans Google.**
Porte d'entrée : le mini-diagnostic gratuit de sa fiche (modèle `docs/modeles/06-script-visite-et-diagnostic.md`).

## 2. Chaîne mensuelle proposée, par paliers
| Palier | Quand | Ce qui est automatique | Ce qui reste manuel |
|---|---|---|---|
| 0 | 0 à 5 clients | Rien : prompts enregistrés | Tout : collecte, rédaction avec l'IA, validation, publication, rapport |
| 1 | 5 à 10 clients | Un script qui fabrique, depuis la fiche, les brouillons de posts, de réponses aux avis et le rapport HTML d'une page | Validation par le client, publication |
| 2 | 10 clients et plus | Publication des posts et des réponses par l'API de la fiche Google | Validation par le client |
| 3 | Plus tard | Tableau de bord des clients dans la page de modification | Décisions |
Temps par client et par mois (estimation) : 1 heure au palier 0, 30 à 45 minutes au palier 1.

## 3. Ce que coûte l'IA, et les limites
- Tarifs publics d'Anthropic relevés le 06/10/2026 : Haiku 5.5 à 0,10 $ en entrée et 0,50 $ en sortie par million de jetons ; Sonnet 5.5 à 2 $ et 10 $. Les textes d'un mois pour un client coûtent quelques centimes (estimation). **Le vrai coût est ton temps de relecture.**
- L'API de la fiche Google demande un accès approuvé à la main par Google (environ 14 jours selon leur FAQ, **à vérifier**) : on commence à la main.
- **Chatbot** sur le site d'un client : faisable (Haiku, moins de 1 $ par mois d'après l'estimation du plan) mais pas prioritaire. Il faut informer le visiteur qu'il parle à une IA (AI Act, article 50, depuis le 02/08/2026, source tierce), mettre à jour la confidentialité et le contrat de sous-traitance, et lui interdire de répondre hors du contenu validé (allergènes, prix).

## 4. Règles
Pas de faux avis. Chaque texte publié est relu par le client. Mêmes nom, adresse ou zone, téléphone et horaires partout. Pas de mots-clés répétés, pas d'achat de liens. Les avis et noms de clients finaux sont des données personnelles : contrat de sous-traitance à jour.

## 5. Mesure
Search Console (impressions, clics), fiche Google (appels, itinéraires, visites), « Visites du site » de `/admin` (sans cookie). À attendre : des appels via la fiche avant les clics du site, un classement local en plusieurs mois. Si rien ne bouge après trois mois, regarder la fiche et les avis avant le code.

## 6. Décisions (29/10/2026)
Retenues par défaut, détail dans `kit-sites-boutiques/visibilite-google/README.md` : 39 € sans engagement ; palier 0 d'abord, script prêt pour le 5e client ; un canal par client (SMS ou e-mail), 3 jours ouvrés, silence = rien de publié ; Greg gestionnaire de la fiche ; chatbot sur devis seulement ; annexe 3 du contrat mise à jour (Anthropic), à faire relire. Reste ouvert : le premier pilote.

### Questions d'origine
1. Prix : 39 € ou 49 € par mois (repère CCI : 50 € HT), engagement ou non.
2. Palier 0 d'abord, ou construire tout de suite le script du palier 1 ?
3. Canal de validation par le client (SMS, WhatsApp, e-mail) et délai.
4. Qui détient l'accès à la fiche du client (Greg comme gestionnaire, jamais le mot de passe du client).
5. Premier pilote : quel commerçant, quelle fiche.
6. Faut-il un chatbot dans l'offre, ou seulement à la demande ?

## 7. Ce que Claude peut préparer ensuite
Prompts mensuels (posts, réponses aux avis, rapport) ; script du palier 1 dans `outils/` du kit (à tester sur une fiche imaginaire, jamais sur un vrai client sans accord) ; modèle de rapport d'une page ; mise à jour de la page `/visibilite-google` si l'offre change.
