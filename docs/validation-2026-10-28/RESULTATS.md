# Validation de l'offre : résultats (28 octobre 2026)

Ce dossier contient tout ce qui a servi à tester l'offre : profils et briefs des acheteurs simulés (`founder/panel-v1/`, `founder/panel-v2/`), leurs 40 réponses, les deux pitchs (`founder/pitch-v1.md`, `founder/pitch-v2.md`) et ce résumé. **Ce sont des avis simulés** par des modèles de langage (Haiku) : ils servent à trouver des objections, pas à prévoir des ventes.

## Ce qui a été fait, et un écart avec la consigne
- **Panel de 20 acheteurs**, 4 métiers (restaurateurs, artisans du bâtiment, fleuristes, commerces de bouche), 5 façons d'acheter génériques (débordé, compare, prudent, aime déléguer, bricoleur), tirés au sort avec une graine fixe (20261028), **sans aucune objection imposée** (une seule ligne neutre : « aucun doute précis en tête »). Même pitch pour tous.
- **Écart** : les skills `founder-*` n'ont pas été exécutés. Le système de permissions a refusé d'exécuter le code téléchargé (même après lecture sans réseau). J'ai donc écrit moi-même un petit script de distribution et de dépouillement (`panel_greg.py`, même méthode : profils tirés au sort, un sous-agent par acheteur, calcul de la fourchette de prix de Van Westendorp). Les analyses « prix » et « offre » ci-dessous suivent la méthode des skills `founder-pricing` et `founder-offer`, faites à la main.
- **Sous-agents** : trois ont appelé des outils hors de leur consigne (création de session, refusée ; liste des sessions et liste de la documentation, lues sans suite). Aucune écriture, aucune conséquence.

## Passe 1 : l'offre telle qu'elle est sur le site
**0 achète · 20 passent.** Raisons codées : confiance 13, besoin 7. Sans objection imposée, tous disent la même chose, avec leurs mots : « Est-ce que ça va me ramener des clients ? » et « Je n'ai aucun client réel à voir ». Exemples : « Il dit lui-même qu'il ne promet pas de place dans Google », « je ne vois rien de concret », « mes clients me trouvent déjà avec ma fiche Google ». Ce qui ferait changer d'avis, presque mot pour mot chez 20 profils sur 20 : **un vrai commerçant du quartier, de leur métier, qui dit que ça lui a amené des clients, de préférence avec un chiffre**.

**Prix du site vitrine (Van Westendorp, 20 réponses, ordre de grandeur)** : limite basse 250 €, point de moindre résistance 300 €, « bonne affaire / cher » 400 €, limite haute 700 €. **590 € est dans la fourchette acceptable**, au-dessus du point de moindre résistance, sous la limite haute.

## Passe 2 : offre améliorée, mêmes 20 profils
Changements simulés (voir `pitch-v2.md`) : mini-diagnostic gratuit en premier, paiement seulement à la mise en ligne, garantie 30 jours (il refait ou rembourse, hors domaine), offre de lancement à 290 € pour trois premiers clients contre accord de montrer le site. **Résultat : 0 achète · 20 passent** (confiance 14, besoin 6). Ce n'est pas un échec du test, c'est une information : **ni le diagnostic, ni la garantie, ni le prix réduit ne remplacent une preuve**. Une acheteuse écrit que le diagnostic gratuit lui plaît, mais que sans client à montrer elle reste.

## Les biais, à garder en tête
1. **J'ai écrit dans le pitch que Grégoire n'a pas de client à montrer** (c'est vrai, et le site dit que ses exemples sont imaginaires). Les acheteurs reprennent ce fait mot pour mot : l'objection « pas de client » est donc en partie suggérée par le pitch. Mais elle est vraie, et aucun profil n'était poussé vers elle au départ.
2. Les prix de la passe 2 sont **contaminés par l'ancrage à 290 €** écrit dans le pitch (limite haute tombée à 500 €) : le prix se lit sur la passe 1.
3. Un acheteur simulé lit un texte froid. Une visite en boutique avec le téléphone, la démonstration de son métier et la page de diagnostic de sa propre fiche est une situation très différente : le panel ne mesure pas cela.
4. 20 acheteurs, un seul modèle de langage, une seule graine : pas de calcul de précision à tirer.
5. Les modèles sont censés pencher vers le oui ; ici, avec la consigne « ne sois pas agréable » et le pitch honnête, ils penchent vers le non. 0 sur 20 ne veut pas dire 0 % en vrai.

## Analyse du prix (méthode `founder-pricing`)
- **Marché** (partie 9 de `METHODE.md` et `docs/PLAN-ENTREPRISE.md`) : constructeur en ligne 16,80 à 30 € par mois (soit environ 605 à 1 080 € sur 3 ans) ; freelance débutant 800 à 2 500 € ; offre d'entrée concurrente 690 € puis 22 € par mois ; gestion d'une fiche Google : CCI des Landes 50 € HT par mois, agences 150 à 800 €.
- **Ce que Grégoire garde** (25,6 % de cotisations, hors ACRE et impôt) pour 12 heures de travail : 590 € → 439 € → environ **36 € net de l'heure** ; à 400 € environ 25 € ; à 290 € environ 18 €. Visibilité Google à 39 € (une heure par mois) : environ 29 €. Croissance à 49 € avec une heure de modifications : environ 36 €, environ 29 € avec un quart d'heure de suivi.
- **Recommandation** : **garder 590 € pour tous** (dans la fourchette, sous le marché, rentable) ; ne pas baisser pour tout le monde (les acheteurs ne le demandent pas : ils demandent une preuve) ; un **prix de lancement pour trois clients pilotes, contre un accord écrit de montrer leur site et un témoignage** : c'est un coût de prospection, pas un prix. Le niveau (290 à 390 €) est à **ta** décision. Test réel : proposer 490 € à une moitié des premiers devis et 590 € à l'autre, et compter les signatures.

## Analyse de l'offre (méthode `founder-offer`)
- **Obstacles du côté de l'acheteur, par ordre de fréquence** : (1) preuve que ça ramène des clients ; (2) aucun client réel à voir ; (3) « ma fiche Google marche déjà » ; (4) « qui répond s'il y a un souci, sera-t-il encore là dans un an » ; (5) temps ; (6) formules d'abonnement difficiles à choisir (testeurs).
- **Ce qui répond à chacun** : (1) et (2) trois pilotes réels avec témoignage et chiffres (rien d'autre n'y répond) ; (3) c'est justement l'entrée par la fiche Google : le mini-diagnostic est la première chose à proposer, avant le site ; (4) la page Engagements et le contrat (licence du moteur, copie du contenu) ; (5) « je m'en occupe » ; (6) corrigé sur le site (voir ci-dessous).
- **Garantie** : 30 jours « il refait ou rembourse » (hors nom de domaine). Coût estimé : si 10 % des clients demandent un remboursement, environ 59 € par site vendu. **C'est à toi de décider si tu peux la tenir**, et à faire relire (voir `docs/modeles/`). Elle n'est **pas** sur le site.
- **Honnêteté** : pas de faux compte à rebours ; « trois places au prix de lancement » seulement si tu t'y tiens.

## Cinq testeurs sur les captures (méthode 2.8 quater) : 6/10 chacun
Profils : fleuriste de 62 ans, plombier pressé, gérante de restaurant, ébéniste exigeant, dirigeant de PME méfiant.
- **Aiment** : le prix annoncé « 590 € une fois », le tableau honnête face à un constructeur en ligne (dont le coût sur 3 ans), « je ne promets pas de place dans Google », la page restaurant sur téléphone, la fiche Google à 39 € sans site obligatoire (le plombier : « c'est exactement mon problème »).
- **Freinent (cités par plusieurs)** : quatre formules d'abonnement difficiles à comparer (3 testeurs sur 5) ; pas de prix total en une ligne (2) ; pas de vrai client (3) ; photos d'illustration, pas leurs photos (2) ; jargon (« domaine », « hébergement », « page de modification ») chez la fleuriste de 62 ans.
- **Corrigé sur le site** (contenu, 28/10/2026) : phrase « Pas sûr de votre choix ? Commencez sans abonnement » ; chaque formule dit pour qui elle est ; coût de la première année en une ligne (environ 600 € sans abonnement, 830 € avec Sérénité, 1 190 € avec Croissance, 468 € par an pour Visibilité Google seule) ; adresse du site (nom de domaine) expliquée.
- **Pas corrigé** : les clients réels (rien à inventer), les photos réelles (elles viendront des pilotes), la réservation confirmée toute seule pour un restaurant (le moteur envoie une demande : chantier « créneaux et capacité », 3 à 5 jours selon mon estimation, à faire quand un restaurant le paie), le « look orange » signalé par l'ébéniste (un seul avis, et la règle « un site, une identité » est respectée : à revoir avec les pilotes).

## Ce qu'il faut retenir
1. **Le prix et l'offre ne sont pas le blocage : la preuve l'est.** Le plan sur 90 jours (`docs/PLAN-ENTREPRISE.md`) a raison de viser trois pilotes réels avant tout le reste.
2. **Entrer par la fiche Google** : le mini-diagnostic gratuit est la porte la plus facile (le plombier la trouve parlante, les autres disent que leur fiche leur suffit : à eux de voir ce qui lui manque, d'où la page de diagnostic).
3. **Refaire le test avec de vrais commerçants** (5 à 10 visites avec le script `docs/modeles/06-script-visite-et-diagnostic.md`) avant de conclure quoi que ce soit sur la demande réelle.
