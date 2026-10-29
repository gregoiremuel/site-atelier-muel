// Vérifie le contenu du site de l'agence avant toute démonstration ou mise en ligne.
// Usage : node outils/verifier.mjs [fichier]     (par défaut : contenu-initial.json)
// ERREUR = bloquant ; ALERTE = à regarder ; « À faire » = ce qui reste avant la vraie mise en ligne.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rendrePage, routes, LIBELLES, ADRESSES_RESERVEES } from '../public/assets/rendu.js';

export const SCHEMA = 'agence v1';
const FORME = {
  '': ['_schema', 'agence', 'theme', 'annonce', 'accueil', 'chiffres', 'metiers', 'etapes', 'lots', 'secteurs', 'realisations', 'presentation', 'garanties', 'equipe', 'references', 'affichage', 'contact', 'mentions', 'credits_photos', 'reglages'],
  agence: ['nom', 'logo', 'nom_image', 'nom_image_blanc', 'activite', 'zone', 'adresse', 'code_postal', 'ville', 'telephone', 'email', 'linkedin', 'instagram', 'description_google'],
  theme: ['fond', 'encre', 'gris', 'trait', 'marine', 'or'],
  annonce: ['afficher', 'texte'],
  accueil: ['photo', 'video', 'fond_video', 'sur_titre', 'titre', 'texte', 'reperes', 'intro_titre', 'intro_texte', 'photo_intro', 'appel_titre', 'appel_texte', 'photo_appel'],
  presentation: ['titre', 'texte', 'photo', 'photo_2'],
  garanties: ['titre', 'texte', 'points'],
  affichage: ['chiffres', 'equipe', 'references'],
  contact: ['actif', 'delai_reponse', 'types', 'cle_web3forms', 'email', 'confirmation'],
  mentions: ['raison_sociale', 'forme', 'rcs', 'adresse', 'directeur_publication', 'email', 'mediateur'],
  reglages: ['url'],
};
const ELEMENTS = {
  chiffres: ['valeur', 'libelle'],
  metiers: ['id', 'nom', 'accroche', 'texte', 'points', 'photo'],
  etapes: ['titre', 'points'],
  secteurs: ['id', 'nom'],
  realisations: ['id', 'nom', 'client', 'secteur', 'lieu', 'surface', 'annee', 'mission', 'accroche', 'texte', 'interventions', 'photos', 'a_la_une', 'visible'],
  equipe: ['nom', 'role', 'photo'],
  references: ['nom', 'logo'],
};
/* Clés facultatives (ajoutées au moteur après Opéria : un contenu sans elles reste valide) */
const FACULTATIVES = { '': ['libelles', 'abonnements', 'engagements', 'comparaison', 'pages_metier'], reglages: ['image_partage'], theme: ['gabarit'], accueil: ['essai_titre', 'essai_texte', 'cartes'], mentions: ['tva', 'nom_commercial'], contact: ['traitement'], metiers: ['prix', 'lien'], realisations: ['lien', 'lien_texte', 'etiquette', 'apercu'] };
const INTERDITS = [
  [/\bbienvenue\b/i, 'Bienvenue'], [/\bdécouvr(ez|ir)\b/i, 'Découvrez'], [/n['’]hésitez pas/i, 'N’hésitez pas'], [/au c(œ|oe)ur d/i, 'au cœur de'],
  [/\bvéritable/i, 'véritable'], [/\bincontournable/i, 'incontournable'], [/\bpassion/i, 'passion'], [/savoir-faire unique/i, 'savoir-faire unique'],
  [/\bsublim/i, 'sublimer'], [/\bécrin d/i, 'écrin de'], [/\bexpérience\b/i, 'expérience'], [/\bunivers\b/i, 'univers'], [/\bauthentique/i, 'authentique'],
  [/\bde qualité\b/i, 'de qualité'], [/\bd['’]exception\b/i, 'd’exception'], [/\bexcellence\b/i, 'excellence'], [/\bintemporel/i, 'intemporel'], [/\ben savoir plus\b/i, 'En savoir plus'],
  [/\bsolutions? innovante/i, 'solution innovante'], [/\bvotre partenaire\b/i, 'votre partenaire'], [/\bà vos côtés\b/i, 'à vos côtés'], [/\bhaut de gamme\b/i, 'haut de gamme'], [/\bvéritable/i, 'véritable'],
];
const HEX = /^#[0-9a-f]{6}$/i;
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i;
const URL_HTTPS = /^https:\/\/[^\s<>"]+\.[^\s<>"]+$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const estTexte = (v) => typeof v === 'string';
const vide = (v) => !estTexte(v) || !v.trim();
function lum(h) { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
export const contraste = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

export function verifier(C) {
  const erreurs = [], alertes = [], afaire = [];
  const E = (m) => erreurs.push(m), A = (m) => alertes.push(m);
  if (!C || typeof C !== 'object' || Array.isArray(C)) { E('Le fichier ne contient pas un objet JSON.'); return { erreurs, alertes, afaire }; }
  let casse = false;
  const lire = (chemin) => chemin.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), C);
  for (const [chemin, cles] of Object.entries(FORME)) {
    const o = chemin ? lire(chemin) : C;
    if (!o || typeof o !== 'object' || Array.isArray(o)) { E(`« ${chemin || 'racine'} » doit être un objet.`); casse = true; continue; }
    cles.filter((k) => !(k in o)).forEach((k) => E(`Clé manquante : ${chemin ? chemin + '.' : ''}${k}`));
    Object.keys(o).filter((k) => !cles.includes(k) && !(FACULTATIVES[chemin] || []).includes(k)).forEach((k) => E(`Clé inconnue : ${chemin ? chemin + '.' : ''}${k}`));
  }
  for (const [liste, cles] of Object.entries(ELEMENTS)) {
    if (!Array.isArray(C[liste])) { E(`« ${liste} » doit être une liste.`); casse = true; continue; }
    C[liste].forEach((x, i) => {
      if (!x || typeof x !== 'object') { E(`${liste}[${i}] doit être un objet.`); casse = true; return; }
      cles.filter((k) => !(k in x)).forEach((k) => E(`Clé manquante : ${liste}[${i}].${k}`));
      Object.keys(x).filter((k) => !cles.includes(k) && !(FACULTATIVES[liste] || []).includes(k)).forEach((k) => E(`Clé inconnue : ${liste}[${i}].${k}`));
    });
  }
  if ('libelles' in C) {
    if (!C.libelles || typeof C.libelles !== 'object' || Array.isArray(C.libelles)) E('« libelles » doit être un objet.');
    else Object.entries(C.libelles).forEach(([k, v]) => { if (!(k in LIBELLES)) E(`Libellé inconnu : libelles.${k}`); else if (!estTexte(v)) E(`libelles.${k} doit être un texte.`); });
  }
  if ('abonnements' in C) {
    const AB = C.abonnements;
    if (!AB || typeof AB !== 'object' || Array.isArray(AB)) E('« abonnements » doit être un objet (titre, intro, formules, note).');
    else {
      Object.keys(AB).filter((k) => !['titre', 'intro', 'formules', 'note'].includes(k)).forEach((k) => E(`Clé inconnue : abonnements.${k}`));
      ['titre', 'intro', 'note'].forEach((k) => { if (k in AB && !estTexte(AB[k])) E(`abonnements.${k} doit être un texte.`); });
      if (!Array.isArray(AB.formules) || !AB.formules.length) E('abonnements.formules doit être une liste d’au moins une formule.');
      else AB.formules.forEach((f, i) => {
        if (!f || typeof f !== 'object') { E(`abonnements.formules[${i}] doit être un objet.`); return; }
        Object.keys(f).filter((k) => !['nom', 'prix', 'periode', 'description', 'points', 'recommande'].includes(k)).forEach((k) => E(`Clé inconnue : abonnements.formules[${i}].${k}`));
        ['nom', 'prix'].forEach((k) => { if (!estTexte(f[k]) || !String(f[k]).trim()) E(`abonnements.formules[${i}].${k} est vide.`); });
        ['periode', 'description'].forEach((k) => { if (k in f && !estTexte(f[k])) E(`abonnements.formules[${i}].${k} doit être un texte.`); });
        if ('points' in f && (!Array.isArray(f.points) || f.points.some((x) => !estTexte(x)))) E(`abonnements.formules[${i}].points doit être une liste de textes.`);
        if ('recommande' in f && typeof f.recommande !== 'boolean') E(`abonnements.formules[${i}].recommande doit valoir true ou false.`);
      });
      if (Array.isArray(AB.formules) && AB.formules.filter((f) => f && f.recommande).length > 1) A('abonnements : plus d’une formule recommandée.');
    }
  }
  if (C.theme && 'gabarit' in C.theme && !['classique', 'studio', 'edition'].includes(C.theme.gabarit)) E('theme.gabarit doit valoir "classique", "studio" ou "edition".');
  if (C.accueil && 'cartes' in C.accueil && typeof C.accueil.cartes !== 'boolean') E('accueil.cartes doit valoir true ou false (false : pas de vignettes de réalisations sur l’accueil).');
  (Array.isArray(C.realisations) ? C.realisations : []).forEach((x, i) => { if (x && x.lien && !/^(\/[^\s<>"]*|https:\/\/[^\s<>"]+)$/.test(String(x.lien).trim())) E(`realisations[${i}] (${x.id || x.nom || '?'}).lien doit commencer par / ou https://`); });
  if (casse) return { erreurs, alertes, afaire };
  if (C._schema !== SCHEMA) E(`_schema doit valoir "${SCHEMA}".`);

  /* Agence et couleurs */
  const G = C.agence, T = C.theme;
  if (vide(G.nom)) E('agence.nom est vide.');
  if (G.email && !EMAIL.test(G.email)) E('agence.email n’est pas une adresse valide.');
  if (vide(G.telephone)) E('agence.telephone est vide : le site affiche ce numéro partout.');
  else if (String(G.telephone).replace(/\D/g, '').length < 10) E('agence.telephone : numéro incomplet.');
  ['instagram', 'linkedin'].forEach((k) => { if (G[k] && !URL_HTTPS.test(G[k])) E(`agence.${k} doit être un lien https://`); });
  ['fond', 'encre', 'gris', 'trait', 'marine', 'or'].forEach((k) => { if (!HEX.test(T[k] || '')) E(`theme.${k} doit être une couleur #rrggbb.`); });
  if ([T.fond, T.encre, T.gris, T.marine, T.or].every((c) => HEX.test(c || ''))) {
    if (contraste(T.encre, T.fond) < 7) E('theme : texte trop peu contrasté sur le fond.');
    if (contraste(T.gris, T.fond) < 4.5) E('theme.gris trop clair sur le fond.');
    if (contraste('#ffffff', T.marine) < 7) E('theme.marine trop claire pour le texte blanc des bandes foncées.');
    if (contraste(T.marine, T.fond) < 4.5) E('theme.marine trop claire pour les titres sur le fond.');
    if (contraste(T.or, T.marine) < 4.5) E('theme.or peu lisible sur le bleu des bandes foncées.');
    if (contraste(T.encre, T.or) < 4.5) E('theme.or : le texte des boutons dorés serait peu lisible.');
  }

  /* Listes */
  const listeTextes = (v, chemin) => { if (!Array.isArray(v) || v.some((x) => !estTexte(x))) E(`${chemin} doit être une liste de textes.`); };
  const ids = (L, nom) => { const vus = new Set(); L.forEach((x, i) => { if (!/^[a-z0-9-]{1,60}$/.test(x.id || '')) E(`${nom}[${i}].id doit être en minuscules, chiffres et tirets.`); else if (vus.has(x.id)) E(`${nom} : identifiant en double « ${x.id} ».`); vus.add(x.id); if (vide(x.nom)) E(`${nom}[${i}].nom est vide.`); }); return vus; };
  const idsS = ids(C.secteurs, 'secteurs');
  ids(C.metiers, 'metiers'); ids(C.realisations, 'realisations');
  const photoOk = (chemin, v) => {
    if (vide(v)) return '';
    if (/googleusercontent|gstatic|ggpht|wixstatic/i.test(v)) E(`${chemin} : photo hébergée par Google ou Wix, à remplacer par un fichier du client.`);
    else if (/^https:\/\/images\.unsplash\.com\//.test(v)) { if (/\?/.test(v)) E(`${chemin} : lien Unsplash sans « ? ».`); return 'essai'; }
    else if (!/^(https:\/\/\S+|\/photos\/[a-z0-9-]+|\/assets\/\S+|data:image\/\S+)$/.test(v)) E(`${chemin} : lien de photo invalide.`);
    else if (/^\/assets\//.test(v) && !existsSync(fileURLToPath(new URL('../public' + v, import.meta.url)))) E(`${chemin} : le fichier public${v} n’existe pas.`);
    return '';
  };
  let essaisReal = 0, essaisAutres = 0;
  C.metiers.forEach((m, i) => { listeTextes(m.points, `metiers[${i}].points`); if (photoOk(`metiers[${i}].photo`, m.photo) === 'essai') essaisAutres++; });
  C.etapes.forEach((e, i) => { if (vide(e.titre)) E(`etapes[${i}].titre est vide.`); listeTextes(e.points, `etapes[${i}].points`); });
  listeTextes(C.lots, 'lots');
  listeTextes(C.accueil.reperes, 'accueil.reperes');
  (C.accueil.reperes || []).forEach((v, i) => { if (estTexte(v) && v.length > (v.includes('|') ? 56 : 40)) A(`accueil.reperes[${i}] : plus de ${v.includes('|') ? 56 : 40} signes, trop long sous la grande photo.`); });
  C.chiffres.forEach((c, i) => { if (vide(c.valeur) || vide(c.libelle)) E(`chiffres[${i}] : chiffre ou texte vide.`); });
  if (C.chiffres.length > 4) A('Plus de 4 chiffres : la ligne sera chargée.');
  C.realisations.forEach((x, i) => {
    const n = `realisations[${i}] (${x.nom || '?'})`;
    if (x.secteur && !idsS.has(x.secteur)) E(`${n} : secteur « ${x.secteur} » inconnu.`);
    if (!x.secteur) A(`${n} : aucun secteur, elle n’apparaîtra dans aucun filtre.`);
    if (!Array.isArray(x.photos)) E(`${n} : photos doit être une liste.`);
    else { if (!x.photos.length && x.visible !== false) A(`${n} : aucune photo.`); let ill = false; x.photos.forEach((u, j) => { if (photoOk(`${n}.photos[${j}]`, u) === 'essai') ill = true; }); if (ill) essaisReal++; }
    if (x.apercu) photoOk(`${n}.apercu`, x.apercu);
    listeTextes(x.interventions, `${n}.interventions`);
    ['a_la_une', 'visible'].forEach((k) => { if (typeof x[k] !== 'boolean') E(`${n}.${k} doit valoir true ou false.`); });
    if (x.annee && !/^(19|20)\d\d$/.test(x.annee)) E(`${n}.annee : quatre chiffres (ou vide).`);
  });
  if (!C.realisations.some((x) => x.a_la_une && x.visible !== false)) A('Aucune réalisation « à la une » : l’accueil montre les premières de la liste.');
  C.equipe.forEach((p, i) => { if (vide(p.nom)) E(`equipe[${i}].nom est vide.`); photoOk(`equipe[${i}].photo`, p.photo); });
  C.references.forEach((r, i) => { if (vide(r.nom)) E(`references[${i}].nom est vide.`); photoOk(`references[${i}].logo`, r.logo); });
  listeTextes(C.garanties.points, 'garanties.points');
  /* Comparaison avec un constructeur en ligne (facultative) */
  if ('comparaison' in C) {
    const K = C.comparaison;
    if (!K || typeof K !== 'object' || Array.isArray(K)) E('« comparaison » doit être un objet (colonnes, lignes, titre, intro, note).');
    else {
      Object.keys(K).filter((k) => !['sur', 'titre', 'intro', 'colonnes', 'lignes', 'note', 'actif'].includes(k)).forEach((k) => E(`Clé inconnue : comparaison.${k}`));
      ['sur', 'titre', 'intro', 'note'].forEach((k) => { if (k in K && !estTexte(K[k])) E(`comparaison.${k} doit être un texte.`); });
      if ('actif' in K && typeof K.actif !== 'boolean') E('comparaison.actif doit valoir true ou false.');
      if (!Array.isArray(K.colonnes) || K.colonnes.length !== 2 || K.colonnes.some((c) => vide(c))) E('comparaison.colonnes doit contenir exactement deux noms de colonne.');
      if (!Array.isArray(K.lignes) || !K.lignes.length) E('comparaison.lignes doit être une liste d’au moins une ligne.');
      else K.lignes.forEach((l, i) => {
        if (!l || typeof l !== 'object') { E(`comparaison.lignes[${i}] doit être un objet { critere, a, b }.`); return; }
        Object.keys(l).filter((k) => !['critere', 'a', 'b'].includes(k)).forEach((k) => E(`Clé inconnue : comparaison.lignes[${i}].${k}`));
        ['critere', 'a', 'b'].forEach((k) => { if (vide(l[k])) E(`comparaison.lignes[${i}].${k} est vide.`); });
      });
      afaire.push('Comparaison : relire les tarifs publics du constructeur cité et noter la date du relevé avant l’ouverture.');
    }
  }
  /* Pages par métier (facultatives) : une adresse /id chacune */
  const PAGES = Array.isArray(C.pages_metier) ? C.pages_metier : [];
  if ('pages_metier' in C && !Array.isArray(C.pages_metier)) E('« pages_metier » doit être une liste.');
  const idsPages = new Set();
  PAGES.forEach((x, i) => {
    const n = `pages_metier[${i}] (${(x && x.nom) || '?'})`;
    if (!x || typeof x !== 'object') { E(`pages_metier[${i}] doit être un objet.`); return; }
    Object.keys(x).filter((k) => !['id', 'nom', 'titre', 'description', 'accroche', 'texte', 'prix', 'points', 'demo', 'demo_texte', 'bouton', 'photo', 'questions', 'visible', 'liste', 'exemple', 'sur'].includes(k)).forEach((k) => E(`Clé inconnue : ${n}.${k}`));
    if (!/^[a-z0-9-]{3,60}$/.test(x.id || '')) E(`${n}.id doit être en minuscules, chiffres et tirets (3 à 60 signes).`);
    else if (ADRESSES_RESERVEES.includes(x.id) || idsPages.has(x.id)) E(`${n}.id « ${x.id} » est déjà pris par une autre adresse du site.`);
    idsPages.add(x.id);
    if (vide(x.nom)) E(`${n}.nom est vide.`);
    ['titre', 'description', 'accroche', 'texte', 'prix', 'demo_texte', 'bouton', 'sur'].forEach((k) => { if (k in x && !estTexte(x[k])) E(`${n}.${k} doit être un texte.`); });
    if ('points' in x) listeTextes(x.points, `${n}.points`);
    if (x.demo && !/^(\/[^\s<>"]*|https:\/\/[^\s<>"]+)$/.test(String(x.demo).trim())) E(`${n}.demo doit commencer par / ou https://`);
    ['visible', 'liste'].forEach((k) => { if (k in x && typeof x[k] !== 'boolean') E(`${n}.${k} doit valoir true ou false.`); });
    if (x.photo && photoOk(`${n}.photo`, x.photo) === 'essai') essaisAutres++;
    if ('exemple' in x) {
      const X = x.exemple;
      if (!X || typeof X !== 'object' || Array.isArray(X)) E(`${n}.exemple doit être un objet { titre, commerce, date, lignes, actions, legende }.`);
      else {
        Object.keys(X).filter((k) => !['titre', 'commerce', 'date', 'lignes', 'actions', 'legende'].includes(k)).forEach((k) => E(`Clé inconnue : ${n}.exemple.${k}`));
        ['titre', 'commerce', 'date', 'legende'].forEach((k) => { if (k in X && !estTexte(X[k])) E(`${n}.exemple.${k} doit être un texte.`); });
        if (!Array.isArray(X.lignes) || !X.lignes.length) E(`${n}.exemple.lignes doit être une liste d’au moins une ligne { point, etat, note }.`);
        else X.lignes.forEach((l, j) => {
          if (!l || typeof l !== 'object' || vide(l.point)) { E(`${n}.exemple.lignes[${j}] doit avoir un « point ».`); return; }
          Object.keys(l).filter((k) => !['point', 'etat', 'note'].includes(k)).forEach((k) => E(`Clé inconnue : ${n}.exemple.lignes[${j}].${k}`));
          if (!['ok', 'afaire', 'manque'].includes(l.etat)) E(`${n}.exemple.lignes[${j}].etat doit valoir "ok", "afaire" ou "manque".`);
        });
        if ('actions' in X) listeTextes(X.actions, `${n}.exemple.actions`);
        if (!vide(X.commerce) && !/imaginaire|exemple/i.test(String(X.commerce) + String(X.legende || ''))) A(`${n}.exemple : dire clairement que le commerce est imaginaire (commerce ou légende).`);
      }
    }
    if (!Array.isArray(x.questions) || !x.questions.length) A(`${n} : aucune question (la page n’aura pas de FAQ).`);
    else x.questions.forEach((q, j) => {
      if (!q || typeof q !== 'object' || vide(q.q) || vide(q.r)) E(`${n}.questions[${j}] doit avoir une question « q » et une réponse « r ».`);
      else Object.keys(q).filter((k) => !['q', 'r'].includes(k)).forEach((k) => E(`Clé inconnue : ${n}.questions[${j}].${k}`));
    });
  });
  C.metiers.forEach((m, i) => { if (!m.prix || !String(m.prix).trim()) A(`metiers[${i}] (${m.id || m.nom || '?'}) : pas de prix, la page n’affichera aucun tarif.`); });
  C.metiers.forEach((m, i) => { if (m.lien && !/^\/[a-z0-9#-]+$/.test(m.lien)) E(`metiers[${i}].lien doit être une adresse du site (ex. /visibilite-google).`); else if (m.lien && !idsPages.has(m.lien.slice(1)) && !ADRESSES_RESERVEES.includes(m.lien.slice(1))) A(`metiers[${i}].lien « ${m.lien} » ne correspond à aucune page.`); });
  /* Page « Engagements » (facultative) : blocs { titre, texte, points } */
  const ENG = Array.isArray(C.engagements) ? C.engagements : [];
  if ('engagements' in C && !Array.isArray(C.engagements)) E('« engagements » doit être une liste.');
  ENG.forEach((b, i) => {
    if (!b || typeof b !== 'object') { E(`engagements[${i}] doit être un objet { titre, texte, points }.`); return; }
    Object.keys(b).filter((k) => !['titre', 'texte', 'points'].includes(k)).forEach((k) => E(`Clé inconnue : engagements[${i}].${k}`));
    if (vide(b.titre)) E(`engagements[${i}].titre est vide.`);
    if (!estTexte(b.texte)) E(`engagements[${i}].texte doit être un texte.`);
    if ('points' in b) listeTextes(b.points, `engagements[${i}].points`);
  });
  if (ENG.length && !C.libelles) A('Page Engagements sans « libelles » : le menu garde le mot « Engagements ».');
  ['chiffres', 'equipe', 'references'].forEach((k) => { if (typeof C.affichage[k] !== 'boolean') E(`affichage.${k} doit valoir true ou false.`); });
  [['accueil.photo', C.accueil.photo], ['accueil.photo_intro', C.accueil.photo_intro], ['accueil.photo_appel', C.accueil.photo_appel], ['presentation.photo', C.presentation.photo], ['presentation.photo_2', C.presentation.photo_2]].forEach(([k, v]) => { if (photoOk(k, v) === 'essai') essaisAutres++; });
  [['agence.logo', G.logo], ['agence.nom_image', G.nom_image], ['agence.nom_image_blanc', G.nom_image_blanc]].forEach(([k, v]) => photoOk(k, v));
  if (C.accueil.video && !/^(https:\/\/\S+\.(mp4|webm)(\?\S*)?|\/videos\/[a-z0-9-]+|\/assets\/\S+\.(mp4|webm)|data:video\/(mp4|webm);base64,\S+)$/i.test(C.accueil.video)) E('accueil.video : un fichier envoyé, ou un lien https se terminant par .mp4 ou .webm.');
  else if (/^\/assets\//.test(C.accueil.video || '') && !existsSync(fileURLToPath(new URL('../public' + C.accueil.video, import.meta.url)))) E(`accueil.video : le fichier public${C.accueil.video} n’existe pas.`);
  if (typeof C.accueil.fond_video !== 'boolean') E('accueil.fond_video doit valoir true ou false.');
  else if (C.accueil.fond_video && !C.accueil.video) A('accueil.fond_video est coché mais aucune vidéo n’est choisie : la photo s’affiche.');
  if (essaisReal) afaire.push(`${essaisReal} réalisation(s) avec des photos d’illustration : les remplacer par les photos des chantiers.`);
  if (essaisAutres) afaire.push(`${essaisAutres} autre(s) photo(s) d’illustration (accueil, métiers, agence) : à remplacer ou garder en connaissance de cause.`);
  if (C.equipe.some((p) => vide(p.photo)) && C.affichage.equipe) afaire.push('Portraits de l’équipe : à fournir (sinon les initiales s’affichent).');
  if (C.references.some((r) => vide(r.logo)) && C.affichage.references) afaire.push('Logos des références : à fournir et à faire valider (sinon les noms s’affichent).');

  /* Contact */
  const K = C.contact;
  if (typeof K.actif !== 'boolean') E('contact.actif doit valoir true ou false.');
  listeTextes(K.types, 'contact.types');
  if (K.cle_web3forms && !UUID.test(K.cle_web3forms)) E('contact.cle_web3forms : format de clé invalide.');
  if (K.email && !EMAIL.test(K.email)) E('contact.email n’est pas une adresse valide.');
  if (!K.cle_web3forms) afaire.push('Clé Web3Forms vide : les demandes arriveront dans la page de modification, pas encore par e-mail.');

  /* Mentions */
  const Mn = C.mentions;
  const manque = ['raison_sociale', 'rcs', 'adresse', 'directeur_publication'].filter((k) => vide(Mn[k]));
  if (manque.length) afaire.push('Mentions légales à compléter : ' + manque.join(', ') + '.');
  if (!vide(Mn.nom_commercial)) afaire.push(`Nom commercial « ${Mn.nom_commercial} » : vérifier qu’il est bien celui du registre (RNE) avant l’ouverture, sinon faire la modification sur le Guichet unique.`);

  /* Style des textes */
  const textes = [['accueil.sur_titre', C.accueil.sur_titre], ['accueil.titre', C.accueil.titre], ['accueil.texte', C.accueil.texte], ...(C.accueil.reperes || []).map((v, i) => [`accueil.reperes[${i}]`, v]), ['accueil.intro_titre', C.accueil.intro_titre], ['accueil.intro_texte', C.accueil.intro_texte],
    ['accueil.appel_titre', C.accueil.appel_titre], ['accueil.appel_texte', C.accueil.appel_texte], ['annonce.texte', C.annonce.texte], ['contact.confirmation', K.confirmation],
    ...ENG.flatMap((b, i) => [[`engagements[${i}].titre`, b && b.titre], [`engagements[${i}].texte`, b && b.texte], ...((b && b.points) || []).map((v, j) => [`engagements[${i}].points[${j}]`, v])]),
    ['presentation.texte', C.presentation.texte], ['garanties.texte', C.garanties.texte], ...C.garanties.points.map((v, i) => [`garanties.points[${i}]`, v]),
    ...C.metiers.flatMap((m, i) => [[`metiers[${i}].accroche`, m.accroche], [`metiers[${i}].texte`, m.texte], ...m.points.map((v, j) => [`metiers[${i}].points[${j}]`, v])]),
    ...C.realisations.flatMap((x, i) => [[`realisations[${i}].accroche`, x.accroche], [`realisations[${i}].texte`, x.texte], [`realisations[${i}].mission`, x.mission], ...(x.interventions || []).map((v, j) => [`realisations[${i}].interventions[${j}]`, v])]),
    ...C.chiffres.map((c, i) => [`chiffres[${i}].libelle`, c.libelle]),
    ...PAGES.flatMap((x, i) => (x && typeof x === 'object' ? [[`pages_metier[${i}].accroche`, x.accroche], [`pages_metier[${i}].texte`, x.texte], [`pages_metier[${i}].prix`, x.prix], ...((Array.isArray(x.points) ? x.points : []).map((v, j) => [`pages_metier[${i}].points[${j}]`, v])), ...((Array.isArray(x.questions) ? x.questions : []).flatMap((q, j) => (q ? [[`pages_metier[${i}].questions[${j}].q`, q.q], [`pages_metier[${i}].questions[${j}].r`, q.r]] : [])))] : [])),
    ...PAGES.flatMap((x, i) => (x && x.exemple && typeof x.exemple === 'object' ? [...((Array.isArray(x.exemple.lignes) ? x.exemple.lignes : []).flatMap((l, j) => (l ? [[`pages_metier[${i}].exemple.lignes[${j}].note`, l.note]] : []))), ...((Array.isArray(x.exemple.actions) ? x.exemple.actions : []).map((v, j) => [`pages_metier[${i}].exemple.actions[${j}]`, v]))] : [])),
    ...(C.comparaison && typeof C.comparaison === 'object' ? [['comparaison.intro', C.comparaison.intro], ['comparaison.note', C.comparaison.note], ...((Array.isArray(C.comparaison.lignes) ? C.comparaison.lignes : []).flatMap((l, i) => (l ? [[`comparaison.lignes[${i}].a`, l.a], [`comparaison.lignes[${i}].b`, l.b]] : [])))] : []),
    ...(C.abonnements && typeof C.abonnements === 'object' ? [['abonnements.intro', C.abonnements.intro], ['abonnements.note', C.abonnements.note], ...((Array.isArray(C.abonnements.formules) ? C.abonnements.formules : []).flatMap((f, i) => (f ? [[`abonnements.formules[${i}].description`, f.description], ...((Array.isArray(f.points) ? f.points : []).map((v, j) => [`abonnements.formules[${i}].points[${j}]`, v]))] : [])))] : [])].filter(([, v]) => estTexte(v) && v.trim());
  textes.forEach(([c, v]) => {
    if (v.includes('!')) E(`${c} : point d’exclamation.`);
    if (/\p{Extended_Pictographic}/u.test(v)) E(`${c} : emoji.`);
    if (/—/.test(v)) E(`${c} : tiret long « — ».`);
    if (/\[|\]|TODO|lorem|xxx|à valider/i.test(v)) E(`${c} : texte provisoire.`);
    INTERDITS.forEach(([re, mot]) => { if (re.test(v)) E(`${c} : « ${mot} » fait « site IA » ou cliché, reformulez.`); });
  });

  /* Rendu réel de chaque page */
  try {
    for (const r of routes(C)) {
      const { statut, html } = rendrePage(C, r, { maquette: true, css: '', js: '' });
      const sansScript = html.replace(/<script[\s\S]*?<\/script>/g, '');
      if (statut !== 200) E(`Rendu : ${r} répond ${statut}.`);
      if (/undefined|NaN|\[object Object\]|>null</.test(sansScript)) E(`Rendu : ${r} contient « undefined » ou « NaN ».`);
      if ((html.match(/<h1[\s>]/g) || []).length !== 1) E(`Rendu : ${r} doit avoir un seul grand titre.`);
      const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
      if (ld) { try { JSON.parse(ld[1]); } catch (e) { E(`Rendu : données pour Google illisibles sur ${r}.`); } }
    }
  } catch (e) { E('Le moteur n’arrive pas à fabriquer le site : ' + e.message); }
  return { erreurs, alertes, afaire };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const fichier = resolve(process.argv[2] || fileURLToPath(new URL('../contenu-initial.json', import.meta.url)));
  let C;
  try { C = JSON.parse(readFileSync(fichier, 'utf8')); } catch (e) { console.error(`\nERREUR : ${fichier} n’est pas un JSON valide.\n  ${String(e.message).replace(/^Expected /, 'Attendu : ').replace(/ in JSON at position (\d+) \(line (\d+) column (\d+)\)/, ' à la ligne $2, colonne $3 (caractère $1)')}\n`); process.exit(1); }
  const { erreurs, alertes, afaire } = verifier(C);
  try {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')), lisez = readFileSync(new URL('../LISEZMOI.md', import.meta.url), 'utf8');
    Object.keys(pkg.scripts || {}).forEach((nom) => { if (!lisez.includes('npm run ' + nom) && !(nom === 'test' && lisez.includes('npm test'))) alertes.push(`LISEZMOI.md ne cite pas la commande « npm run ${nom} » (package.json).`); });
  } catch (e) { /* pas de LISEZMOI ou de package.json : rien à comparer */ }
  console.log(`\nVérification de ${fichier}${C.agence && C.agence.nom ? ' (' + C.agence.nom + ')' : ''}\n`);
  erreurs.forEach((m) => console.log('  ERREUR   ' + m));
  alertes.forEach((m) => console.log('  ALERTE   ' + m));
  if (afaire.length) { console.log('\n  À faire avant la vraie mise en ligne :'); afaire.forEach((m) => console.log('   - ' + m)); }
  console.log(`\n${erreurs.length ? erreurs.length + ' erreur(s) à corriger.' : 'Aucune erreur.'} ${alertes.length} alerte(s).\n`);
  process.exit(erreurs.length ? 1 : 0);
}
