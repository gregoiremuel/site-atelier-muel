# Chiffres de Grégoire Muel EI (28 octobre 2026)

Calculs faits par script (`docs/chiffres.py`) à partir des hypothèses ci-dessous, pour servir de base au document final. **Ce sont des hypothèses et des estimations, pas des prévisions.** Ce qui vient d'une source est marqué ; ce qui est mon estimation l'est aussi ; ce qui est à vérifier l'est.

## 1. Hypothèses
- Cotisations sociales micro-BNC « libéral non réglementé » : **25,6 % du chiffre d'affaires encaissé** en 2026 (plusieurs sources, `docs/PLAN-ENTREPRISE.md` ; une source isolée dit 26,1 % : à vérifier dans l'espace Urssaf).
- **ACRE** : si accordée, exonération de 25 % des cotisations pour une création après le 01/07/2026 d'après la plupart des sources (durée et date de référence à confirmer sur urssaf.fr) : cotisation effective 19,2 %. **Demande à faire avant le 17/12/2026** (60 jours après le 18/10/2026).
- **Contribution à la formation professionnelle** : 0,2 % du chiffre d'affaires pour les professions libérales (d'après mes connaissances, à vérifier).
- **Impôt** : micro-BNC, abattement de 34 % (revenu imposable = 66 % du chiffre d'affaires), barème progressif ; ou **versement libératoire 2,2 %** du chiffre d'affaires si ton revenu fiscal de référence le permet (à vérifier dans impots.gouv.fr). Âge 18 à 25 ans : un rattachement au foyer fiscal de tes parents change l'impôt (à vérifier). **Je ne connais pas ton revenu salarié** : il décide de ta tranche, donc de l'impôt réel.
- **CFE** (cotisation foncière des entreprises) : pas de cotisation l'année de création (2026) ; due à partir de 2027, montant dépend de la commune et du chiffre d'affaires, **non trouvé : à vérifier** (déclaration initiale 1447-C-SD avant le 31/12/2026).
- **Seuils** (sources dans `docs/PLAN-ENTREPRISE.md`, à vérifier) : franchise de TVA 37 500 € (41 250 € majoré) ; plafond micro-BNC 83 600 €.
- **Temps de travail par offre : mes estimations** (site vitrine 12 h comme dans le plan ; boutique 25 h ; entreprise 35 h ; Sérénité 45 minutes par mois en moyenne ; Croissance 1 h 15 ; Visibilité Google 1 h). À corriger avec tes vrais temps après les pilotes.
- Frais annuels : domaines 2 × 10 €, RC Pro environ 110 à 275 € (je prends 190 €), marque « Atelier Muel » 190 € (une fois, facultatif), compte bancaire 0 € (formule gratuite), soit environ 400 € la première année avec la marque, 210 € ensuite.

## 2. Sur 100 € encaissés, ce que je garde
| Situation | Cotisations | Formation | Impôt | **Reste** |
|---|---:|---:|---:|---:|
| Sans ACRE, revenu trop bas pour payer l’impôt | 25.6 € | 0.2 € | 0.0 € | **74.2 €** |
| Sans ACRE, versement libératoire (2,2 %) | 25.6 € | 0.2 € | 2.2 € | **72.0 €** |
| Sans ACRE, tranche à 11 % (revenu imposable 66 €) | 25.6 € | 0.2 € | 7.3 € | **66.9 €** |
| Sans ACRE, tranche à 30 % (revenu imposable 66 €) | 25.6 € | 0.2 € | 19.8 € | **54.4 €** |
| Avec ACRE (19,2 %), versement libératoire | 19.2 € | 0.2 € | 2.2 € | **78.4 €** |
| Avec ACRE (19,2 %), revenu trop bas pour l’impôt | 19.2 € | 0.2 € | 0.0 € | **80.6 €** |

*L'impôt à la tranche est calculé sur 66 € (abattement de 34 %) ; il suppose que les revenus de la micro-entreprise s'ajoutent à d'autres revenus : à confirmer avec ta situation réelle. Les cotisations ne dépendent pas de ton salaire.*

## 3. Prix nets de chaque offre (hors impôt)
| Offre | Prix | Après cotisations et formation (sans ACRE) | Avec ACRE | Heures (estimation) | Net par heure (sans ACRE) |
|---|---:|---:|---:|---:|---:|
| Site vitrine | 590 € une fois | 438 € | 476 € | 12 h | 36 € |
| Boutique et catalogue | 1290 € une fois | 957 € | 1040 € | 25 h | 38 € |
| Site d’entreprise ou refonte | 1900 € une fois | 1410 € | 1531 € | 35 h | 40 € |
| Sérénité | 19 € par mois | 14.10 € | 15.31 € | 0.75 h par mois | 19 € |
| Croissance | 49 € par mois | 36.36 € | 39.49 € | 1.25 h par mois | 29 € |
| Visibilité Google | 39 € par mois | 28.94 € | 31.43 € | 1 h par mois | 29 € |

Au prix de lancement de 290 € (proposé, à valider) : 215 € net pour 12 h, soit 18 € de l'heure. À 490 € : 30 € de l'heure.

**Coût d'acquisition (visite, diagnostic gratuit, maquette gratuite)** : non compté ci-dessus. Mon estimation : 1 h de préparation et de visite par commerce visité, 1 h 30 de maquette par maquette montrée. C'est le vrai coût caché : voir le seuil de rentabilité.

## 4. Trois scénarios sur 12 mois
Les ventes sont des **hypothèses** (le panel simulé donne 0 sur 20 ; il ne mesure pas une visite en boutique). Base : environ 500 visites dans l'année (15 par semaine pendant 12 semaines, puis 8 par semaine). Sites vitrine vendus : 6, 12 et 24, soit 1,2 %, 2,4 % et 4,8 % des visites ; le scénario « bon » suppose aussi du bouche-à-oreille de tes pilotes.
| Scénario | Sites vitrine vendus | Abonnés en fin d'année (Sérénité / Croissance / Visibilité) | CA 12 mois | Net après cotisations (sans ACRE) | Heures de production | Net par heure |
|---|---:|---|---:|---:|---:|---:|
| Prudent | 6 | 3 / 0 / 3 | 4 410 € | 3 272 € | 98 h | 33 € |
| Moyen | 12 | 6 / 2 / 6 | 9 310 € | 6 908 € | 209 h | 33 € |
| Bon | 24 | 12 / 5 / 12 | 18 865 € | 13 998 € | 424 h | 33 € |

Ces totaux supposent que **tous** les sites sont à 590 € (pas de pilote à prix réduit, ni boutique, ni site d'entreprise) et que le temps de prospection n'est pas compté. Trois pilotes à 290 € au lieu de 590 € coûtent 900 € de chiffre d'affaires (environ 670 € nets) : c'est le prix de tes trois preuves.

## 5. Seuil de rentabilité
- **Frais fixes** : environ 400 € la première année (avec la marque), 210 € ensuite. À 590 € le site vitrine (438 € net), **le premier site couvre déjà les frais de la première année** (il reste 38 €).
- **Heures de production à vendre pour couvrir les frais** : 11.0 h de site vitrine la première année (environ un site), 5.8 h ensuite.
- **Chiffre d'affaires mensuel pour 1 000 € net par mois (avant impôt)** : 1348 € par mois, soit environ 2.3 sites vitrine par mois.
- **Temps de prospection** : 15 visites par semaine à environ 1 h chacune = 15 h par semaine. À 2 % de conversion, **un site signé coûte environ 50 visites, soit 50 h de prospection**, avant les 12 h de production : l'heure net réelle d'un site signé est alors d'environ 7 € (438 € pour 62 h), pas 36 €. C'est pour ça que le diagnostic gratuit, les pilotes et le bouche-à-oreille comptent plus que le prix.

## 6. Sources et état de la vérification
Voir `docs/PLAN-ENTREPRISE.md` (sources du 28/10/2026 : cotisations, ACRE, franchise de TVA, facture électronique, RC Pro) et `docs/MISE-EN-LIGNE.md`. Rien de ce document n'a été validé par un expert-comptable.
