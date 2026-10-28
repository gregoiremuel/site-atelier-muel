"""Panel d'acheteurs simulés (écrit pour ce projet, même méthode que le skill founder-consumer).
Usage : python3 panel_greg.py deal   |   python3 panel_greg.py tally
Dossier de travail : le dossier courant (founder/customer.json, founder/pitch.md ; sortie dans founder/panel/).
Les acheteurs sont des sous-agents : ce script ne fait que distribuer les profils et compter les réponses."""
import json, os, random, sys

D = os.path.join("founder", "panel")
PRENOMS = ["Maya", "Jordan", "Priya", "Marcus", "Sofia", "Ethan", "Aïcha", "Louis", "Chloé", "Daniel", "Nadia", "Olivier", "Grace", "Ravi", "Emma",
           "Kenji", "Zoé", "Lucas", "Hana", "Noé", "Fatima", "Caleb", "Isabelle", "Mateo", "Léa", "Omar", "Ava", "Théo", "Mei", "Jonas", "Sara", "Diego"]
RAISONS = ["prix", "habitude", "besoin", "confiance", "qualité", "praticité", "moment", "valeurs", "autre"]

BRIEF = """Tu es un acheteur simulé dans un panel. Un entrepreneur veut savoir, avant de dépenser quoi que ce soit, si des gens comme toi achèteraient. Ta réponse n'est utile que si elle est honnête : la plupart des gens n'achètent pas la plupart des choses, et un oui poli est pire qu'un non franc.

=== QUI TU ES ===
{nom}, {age} ans. {segment}. Tu gagnes environ {revenu:,} euros par an.
Ta façon d'acheter : {comportement}. {comportement_detail}
{habitude}Tu es l'une de ces personnes : {cible}.
{objection}
=== FIN ===

=== CE QU'ON TE PROPOSE (tu le découvres pour la première fois, comme un passant ou quelqu'un qui défile sur son téléphone) ===
{pitch}
=== FIN ===

Décide comme {nom} le ferait, avec son argent, ses habitudes et ses doutes, dans une semaine normale. Ne cherche pas à être agréable. N'invente aucun fait sur l'offre au-delà de ce qui est écrit ci-dessus. Les prix demandés plus bas concernent le prix de référence indiqué dans l'offre (le site vitrine), en euros, une fois.

Crée le fichier {sortie} avec ton outil d'écriture de fichier (n'affiche pas la réponse dans ton message) contenant UNIQUEMENT ce JSON, sans bloc de code, sans rien d'autre :
{{
  "id": "{id}",
  "achete": true ou false,
  "achats_premier_mois": combien de fois tu achèterais le premier mois (0 si tu n'achètes pas),
  "formule": "ce que tu choisirais : site_590, serenite, croissance, visibilite_google, ou aucune",
  "code_raison": une valeur parmi {raisons},
  "raison": "pourquoi, en une ou deux phrases, avec tes mots",
  "objection": "le doute qui pèse le plus pour toi, avec tes mots",
  "ce_qui_me_ferait_changer_davis": "la seule chose qui ferait basculer ta réponse, ou vide",
  "prix_trop_bas": le prix du site vitrine en dessous duquel tu douterais de sa valeur (un nombre),
  "prix_bonne_affaire": le prix du site vitrine qui te semblerait une bonne affaire (un nombre),
  "prix_cher": le prix du site vitrine qui commence à te sembler cher mais que tu pourrais payer (un nombre),
  "prix_trop_cher": le prix du site vitrine au-delà duquel tu n'achèterais pas (un nombre)
}}
"""


def quotas(items, n):
    total = sum(float(i.get("share", 1)) for i in items) or 1.0
    raw = [n * float(i.get("share", 1)) / total for i in items]
    c = [int(r) for r in raw]
    for i in sorted(range(len(items)), key=lambda i: raw[i] - c[i], reverse=True)[: n - sum(c)]:
        c[i] += 1
    return c


def deal():
    cust = json.load(open("founder/customer.json", encoding="utf-8"))
    pitch = open("founder/pitch.md", encoding="utf-8").read().strip()
    n, seed = 20, 20261028
    rng = random.Random(seed)
    segs, behs = [], []
    for s, k in zip(cust["segments"], quotas(cust["segments"], n)):
        segs += [s] * k
    for b, k in zip(cust["behaviours"], quotas(cust["behaviours"], n)):
        behs += [b] * k
    rng.shuffle(segs); rng.shuffle(behs)
    noms = PRENOMS[:]; rng.shuffle(noms)
    os.makedirs(os.path.join(D, "briefs"), exist_ok=True)
    os.makedirs(os.path.join(D, "reponses"), exist_ok=True)
    cartes = []
    for i in range(n):
        s, b = segs[i], behs[i]
        c = {"id": "P%03d" % (i + 1), "nom": noms[i], "age": rng.randint(*cust["age"]), "segment": s["name"],
             "revenu": int(round(rng.uniform(*s["income"]), -3)), "comportement": b["name"], "comportement_detail": b.get("how", ""),
             "habitude": (rng.choice(cust["habits"]) if cust.get("habits") else ""), "objection": rng.choice(cust["objections"])}
        cartes.append(c)
        sortie = os.path.abspath(os.path.join(D, "reponses", c["id"] + ".json"))
        brief = BRIEF.format(nom=c["nom"], age=c["age"], segment=c["segment"], revenu=c["revenu"], comportement=c["comportement"],
                             comportement_detail=c["comportement_detail"], habitude=("Dans ta vie : " + c["habitude"] + ". ") if c["habitude"] else "",
                             cible=cust["target"], objection="Ce qui te vient d'abord à l'esprit : « " + c["objection"] + " »",
                             pitch=pitch, sortie=sortie, id=c["id"], raisons=RAISONS)
        open(os.path.join(D, "briefs", c["id"] + ".md"), "w", encoding="utf-8").write(brief)
    json.dump({"n": n, "graine": seed, "cartes": cartes}, open(os.path.join(D, "profils.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("%d profils, graine %d, briefs dans %s" % (n, seed, os.path.join(D, "briefs")))


def lire():
    cartes = json.load(open(os.path.join(D, "profils.json"), encoding="utf-8"))["cartes"]
    ok, manquants = [], []
    for c in cartes:
        p = os.path.join(D, "reponses", c["id"] + ".json")
        try:
            r = json.load(open(p, encoding="utf-8"))
            assert r["id"] == c["id"] and isinstance(r["achete"], bool)
            ok.append((c, r))
        except Exception as e:
            manquants.append(c["id"])
    return ok, manquants


def westendorp(R):
    """Prix limites de Van Westendorp (méthode classique) : intersections des courbes cumulées."""
    cles = ["prix_trop_bas", "prix_bonne_affaire", "prix_cher", "prix_trop_cher"]
    V = [[float(r[k]) for k in cles] for r in R if all(isinstance(r.get(k), (int, float)) for k in cles)]
    if len(V) < 5:
        return None
    pts = sorted({v for row in V for v in row})
    n = len(V)
    f = lambda pred: [sum(1 for row in V if pred(row, p)) / n for p in pts]
    trop_bas = f(lambda r, p: r[0] >= p)          # décroît avec le prix
    bonne = f(lambda r, p: r[1] >= p)             # décroît
    cher = f(lambda r, p: r[2] <= p)              # croît
    trop_cher = f(lambda r, p: r[3] <= p)         # croît
    pas_bonne = [1 - x for x in bonne]            # croît
    pas_cher = [1 - x for x in cher]              # décroît

    def cross(decroit, croit):
        for i in range(len(pts)):
            if decroit[i] <= croit[i]:
                return pts[i]
        return pts[-1]
    return {"PMC (limite basse : trop bas / pas une bonne affaire)": cross(trop_bas, pas_bonne),
            "OPP (le moins de résistance : trop bas / trop cher)": cross(trop_bas, trop_cher),
            "IPP (bonne affaire / cher)": cross(bonne, cher),
            "PME (limite haute : cher / trop cher)": cross(pas_cher, trop_cher), "n": n}


def tally():
    ok, manquants = lire()
    n_ok = len(ok)
    achete = [(c, r) for c, r in ok if r["achete"]]
    lignes = ["# Panel d'acheteurs simulés, deuxième passe (28/10/2026)\n",
              "**%d achètent · %d passent** (sur %d réponses valides)%s. Graine 20261028 : les mêmes profils peuvent être redistribués.\n" % (
                  len(achete), n_ok - len(achete), n_ok, ("" if not manquants else "; sans réponse valide : " + ", ".join(manquants))),
              "Ce sont des acheteurs simulés, pas des clients : à utiliser pour trouver des objections, pas pour prévoir des ventes (les modèles de langage penchent vers le oui : le taux est un plafond).\n"]
    for titre, cle in (("Par métier", "segment"), ("Par façon d'acheter", "comportement")):
        lignes += ["## " + titre, "", "| groupe | acheteurs | achètent |", "| --- | ---: | ---: |"]
        for g in sorted({c[cle] for c, _ in ok}):
            m = [(c, r) for c, r in ok if c[cle] == g]
            lignes.append("| %s | %d | %d |" % (g, len(m), sum(1 for _, r in m if r["achete"])))
        lignes.append("")
    lignes += ["## Formule choisie par ceux qui achètent", ""]
    f = {}
    for c, r in achete:
        f[r.get("formule", "?")] = f.get(r.get("formule", "?"), 0) + 1
    lignes += ["- %s : %d" % (k, v) for k, v in sorted(f.items(), key=lambda x: -x[1])] or ["- (personne)"]
    lignes += ["", "## Raisons données (code)", ""]
    rc = {}
    for c, r in ok:
        rc[(r["achete"], r.get("code_raison", "?"))] = rc.get((r["achete"], r.get("code_raison", "?")), 0) + 1
    for (a, k), v in sorted(rc.items(), key=lambda x: (-x[1])):
        lignes.append("- %s, %s : %d" % ("achète" if a else "passe", k, v))
    lignes += ["", "## Les objections, avec leurs mots (aucune n'était imposée)", ""]
    for c, r in ok:
        lignes.append("- **%s (%s, %s)** : « %s »" % (c["id"], c["segment"].split(" (")[0], "achète" if r["achete"] else "passe", r.get("objection", "").strip()))
    lignes += ["", "## Ce qui ferait changer d'avis", ""]
    for c, r in ok:
        if r.get("ce_qui_me_ferait_changer_davis", "").strip():
            lignes.append("- %s : « %s »" % (c["id"], r["ce_qui_me_ferait_changer_davis"].strip()))
    w = westendorp([r for _, r in ok])
    lignes += ["", "## Prix du site vitrine (méthode Van Westendorp, %s réponses)" % (w["n"] if w else n_ok), ""]
    if w:
        lignes += ["| point | prix |", "| --- | ---: |"] + ["| %s | %s € |" % (k, int(v)) for k, v in w.items() if k != "n"]
        lignes += ["", "Peu de réponses (20) : ordre de grandeur seulement."]
    else:
        lignes.append("Pas assez de réponses de prix valides.")
    open(os.path.join(D, "resultats.md"), "w", encoding="utf-8").write("\n".join(lignes) + "\n")
    print("\n".join(lignes))


if __name__ == "__main__":
    {"deal": deal, "tally": tally}[sys.argv[1]]()
