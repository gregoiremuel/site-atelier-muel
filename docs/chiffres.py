COT=0.256; ACRE_COT=0.256*0.75; CFP=0.002
def net(ca, cot=COT): return ca*(1-cot-CFP)
offres=[('Site vitrine',590,12),('Boutique et catalogue',1290,25),('Site d’entreprise ou refonte',1900,35)]
abos=[('Sérénité',19,0.75),('Croissance',49,1.25),('Visibilité Google',39,1.0)]
L=[]
L.append("# Chiffres de Grégoire Muel EI (28 octobre 2026)\n")
L.append("Calculs faits par script (`docs/chiffres.py`) à partir des hypothèses ci-dessous, pour servir de base au document final. **Ce sont des hypothèses et des estimations, pas des prévisions.** Ce qui vient d'une source est marqué ; ce qui est mon estimation l'est aussi ; ce qui est à vérifier l'est.\n")
L.append("## 1. Hypothèses")
L.append("- Cotisations sociales micro-BNC « libéral non réglementé » : **25,6 % du chiffre d'affaires encaissé** en 2026 (plusieurs sources, `docs/PLAN-ENTREPRISE.md` ; une source isolée dit 26,1 % : à vérifier dans l'espace Urssaf).")
L.append("- **ACRE** : si accordée, exonération de 25 % des cotisations pour une création après le 01/07/2026 d'après la plupart des sources (durée et date de référence à confirmer sur urssaf.fr) : cotisation effective 19,2 %. **Demande à faire avant le 17/12/2026** (60 jours après le 18/10/2026).")
L.append("- **Contribution à la formation professionnelle** : 0,2 % du chiffre d'affaires pour les professions libérales (d'après mes connaissances, à vérifier).")
L.append("- **Impôt** : micro-BNC, abattement de 34 % (revenu imposable = 66 % du chiffre d'affaires), barème progressif ; ou **versement libératoire 2,2 %** du chiffre d'affaires si ton revenu fiscal de référence le permet (à vérifier dans impots.gouv.fr). Âge 18 à 25 ans : un rattachement au foyer fiscal de tes parents change l'impôt (à vérifier). **Je ne connais pas ton revenu salarié** : il décide de ta tranche, donc de l'impôt réel.")
L.append("- **CFE** (cotisation foncière des entreprises) : pas de cotisation l'année de création (2026) ; due à partir de 2027, montant dépend de la commune et du chiffre d'affaires, **non trouvé : à vérifier** (déclaration initiale 1447-C-SD avant le 31/12/2026).")
L.append("- **Seuils** (sources dans `docs/PLAN-ENTREPRISE.md`, à vérifier) : franchise de TVA 37 500 € (41 250 € majoré) ; plafond micro-BNC 83 600 €.")
L.append("- **Temps de travail par offre : mes estimations** (site vitrine 12 h comme dans le plan ; boutique 25 h ; entreprise 35 h ; Sérénité 45 minutes par mois en moyenne ; Croissance 1 h 15 ; Visibilité Google 1 h). À corriger avec tes vrais temps après les pilotes.")
L.append("- Frais annuels : domaines 2 × 10 €, RC Pro environ 110 à 275 € (je prends 190 €), marque « Atelier Muel » 190 € (une fois, facultatif), compte bancaire 0 € (formule gratuite), soit environ 400 € la première année avec la marque, 210 € ensuite.\n")
L.append("## 2. Sur 100 € encaissés, ce que je garde")
L.append("| Situation | Cotisations | Formation | Impôt | **Reste** |\n|---|---:|---:|---:|---:|")
rows=[('Sans ACRE, revenu trop bas pour payer l’impôt',25.6,0.2,0.0),('Sans ACRE, versement libératoire (2,2 %)',25.6,0.2,2.2),('Sans ACRE, tranche à 11 % (revenu imposable 66 €)',25.6,0.2,66*0.11),('Sans ACRE, tranche à 30 % (revenu imposable 66 €)',25.6,0.2,66*0.30),('Avec ACRE (19,2 %), versement libératoire',19.2,0.2,2.2),('Avec ACRE (19,2 %), revenu trop bas pour l’impôt',19.2,0.2,0.0)]
for n,a,b,c in rows: L.append(f"| {n} | {a:.1f} € | {b:.1f} € | {c:.1f} € | **{100-a-b-c:.1f} €** |")
L.append("\n*L'impôt à la tranche est calculé sur 66 € (abattement de 34 %) ; il suppose que les revenus de la micro-entreprise s'ajoutent à d'autres revenus : à confirmer avec ta situation réelle. Les cotisations ne dépendent pas de ton salaire.*\n")
L.append("## 3. Prix nets de chaque offre (hors impôt)")
L.append("| Offre | Prix | Après cotisations et formation (sans ACRE) | Avec ACRE | Heures (estimation) | Net par heure (sans ACRE) |\n|---|---:|---:|---:|---:|---:|")
for n,p,h in offres: L.append(f"| {n} | {p} € une fois | {net(p):.0f} € | {net(p,ACRE_COT):.0f} € | {h} h | {net(p)/h:.0f} € |")
for n,p,h in abos: L.append(f"| {n} | {p} € par mois | {net(p):.2f} € | {net(p,ACRE_COT):.2f} € | {h:g} h par mois | {net(p)/h:.0f} € |")
L.append(f"\nAu prix de lancement de 290 € (proposé, à valider) : {net(290):.0f} € net pour 12 h, soit {net(290)/12:.0f} € de l'heure. À 490 € : {net(490)/12:.0f} € de l'heure.")
L.append("\n**Coût d'acquisition (visite, diagnostic gratuit, maquette gratuite)** : non compté ci-dessus. Mon estimation : 1 h de préparation et de visite par commerce visité, 1 h 30 de maquette par maquette montrée. C'est le vrai coût caché : voir le seuil de rentabilité.\n")
L.append("## 4. Trois scénarios sur 12 mois")
L.append("Les ventes sont des **hypothèses** (le panel simulé donne 0 sur 20 ; il ne mesure pas une visite en boutique). Base : environ 500 visites dans l'année (15 par semaine pendant 12 semaines, puis 8 par semaine). Sites vitrine vendus : 6, 12 et 24, soit 1,2 %, 2,4 % et 4,8 % des visites ; le scénario « bon » suppose aussi du bouche-à-oreille de tes pilotes.")
def scen(sp,ab):
    ca=0;h=0
    for m in range(12):
        s=sp[m]; ca+=s*590; h+=s*12
        if m>=3:
            for k,(prix,tps) in {'ser':(19,0.75),'cro':(49,1.25),'vis':(39,1.0)}.items():
                n=ab[k]*(m-2)/9; ca+=n*prix; h+=n*tps
    return ca,h
S={'Prudent':([0,0,1,0,1,0,1,0,1,0,1,1],{'ser':3,'cro':0,'vis':3}),
   'Moyen':([0,0,1,1,1,1,1,1,2,1,2,1],{'ser':6,'cro':2,'vis':6}),
   'Bon':([0,1,2,2,2,2,2,2,3,3,3,2],{'ser':12,'cro':5,'vis':12})}
L.append("| Scénario | Sites vitrine vendus | Abonnés en fin d'année (Sérénité / Croissance / Visibilité) | CA 12 mois | Net après cotisations (sans ACRE) | Heures de production | Net par heure |\n|---|---:|---|---:|---:|---:|---:|")
for n,(sp,ab) in S.items():
    ca,h=scen(sp,ab)
    L.append(f"| {n} | {sum(sp)} | {ab['ser']} / {ab['cro']} / {ab['vis']} | {round(ca):,} € | {round(net(ca)):,} € | {h:.0f} h | {net(ca)/h:.0f} € |".replace(',',' '))
L.append("\nCes totaux supposent que **tous** les sites sont à 590 € (pas de pilote à prix réduit, ni boutique, ni site d'entreprise) et que le temps de prospection n'est pas compté. Trois pilotes à 290 € au lieu de 590 € coûtent 900 € de chiffre d'affaires (environ 670 € nets) : c'est le prix de tes trois preuves.")
L.append("\n## 5. Seuil de rentabilité")
fr1=400; fr2=210
L.append(f"- **Frais fixes** : environ {fr1} € la première année (avec la marque), {fr2} € ensuite. À 590 € le site vitrine ({net(590):.0f} € net), **le premier site couvre déjà les frais de la première année** (il reste {net(590)-fr1:.0f} €).")
L.append(f"- **Heures de production à vendre pour couvrir les frais** : {fr1/(net(590)/12):.1f} h de site vitrine la première année (environ un site), {fr2/(net(590)/12):.1f} h ensuite.")
ca1000=1000/(1-COT-CFP)
L.append(f"- **Chiffre d'affaires mensuel pour 1 000 € net par mois (avant impôt)** : {ca1000:.0f} € par mois, soit environ {ca1000/590:.1f} sites vitrine par mois.")
L.append(f"- **Temps de prospection** : 15 visites par semaine à environ 1 h chacune = 15 h par semaine. À 2 % de conversion, **un site signé coûte environ 50 visites, soit 50 h de prospection**, avant les 12 h de production : l'heure net réelle d'un site signé est alors d'environ {net(590)/62:.0f} € ({net(590):.0f} € pour 62 h), pas {net(590)/12:.0f} €. C'est pour ça que le diagnostic gratuit, les pilotes et le bouche-à-oreille comptent plus que le prix.")
L.append("\n## 6. Sources et état de la vérification")
L.append("Voir `docs/PLAN-ENTREPRISE.md` (sources du 28/10/2026 : cotisations, ACRE, franchise de TVA, facture électronique, RC Pro) et `docs/MISE-EN-LIGNE.md`. Rien de ce document n'a été validé par un expert-comptable.")
open('docs/CHIFFRES.md','w',encoding='utf8').write("\n".join(L)+"\n")
print("\n".join(L[22:]))
