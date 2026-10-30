/*
  Moteur de rendu « agence » : toutes les pages du site à partir du contenu (un seul objet JSON).
  Utilisé par le serveur (src/worker.js), par l'aperçu de la page de modification et par outils/apercu.mjs.
*/
import { cssPolices } from './polices.js';

/* Typographie française : espace insécable avant « : ; ! ? » et après « «», entre un nombre et son unité, dans les milliers (« 1 290 € ») */
const typo = (t) => t.replace(/\s+([:;!?»])/g, '\u00a0$1').replace(/«\s+/g, '«\u00a0').replace(/(\d)\s+(€|%|h|min|km|m²)(?![\p{L}\d])/gu, '$1\u00a0$2').replace(/(\d)\s(\d{3})(?!\d)/g, '$1\u00a0$2');
export const esc = (s) => typo(String(s == null ? '' : s)).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const slug = (s) => String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const hex = (c, d) => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? c : d);
const num = (i) => String(i + 1).padStart(2, '0');

/* Libellés du site : ceux d'Opéria par défaut ; chaque site peut les changer dans « libelles » (contenu).
   Un champ de formulaire dont le libellé est vide ("") disparaît. */
export const LIBELLES = {
  nav_expertises: 'Expertises', nav_realisations: 'Réalisations', nav_agence: 'L’agence', nav_engagements: 'Engagements',
  bouton_principal: 'Parler de votre projet', bouton_appel: 'Décrire mon projet', bouton_realisations: 'Voir les réalisations', bouton_choisir: 'Choisir cette offre',
  appel_titre: 'Parlons de votre projet', intro_lien: 'L’agence',
  exp_sur: 'Expertises', exp_titre: 'Trois métiers, un seul interlocuteur', exp_lien: 'En détail',
  real_sur: 'Réalisations', real_titre: 'Des projets livrés', real_tout: 'Toutes les réalisations',
  essai_sur: 'À essayer',
  methode_sur: 'Méthode', methode_titre: 'Du premier rendez-vous à la réception', methode_titre_page: 'Trois étapes, un seul responsable',
  refs_sur: 'Références', refs_titre: 'Ils nous ont confié leurs locaux',
  page_exp_titre: 'Concevoir, coordonner, livrer', page_exp_description: '',
  lots_sur: 'Tous corps d’état', lots_titre: 'Les travaux que nous coordonnons',
  page_real_titre: 'Des locaux transformés', page_real_chapo: '',
  fiche_client: 'Client', fiche_lieu: 'Lieu', fiche_surface: 'Surface', fiche_mission: 'Mission', fiche_annee: 'Année', fiche_secteur: 'Secteur', interventions: 'Interventions',
  garanties_sur: 'Garanties', garanties_titre: 'Nos engagements', eng_sur: 'Engagements', page_eng_titre: 'Hébergement, données, sauvegardes', page_eng_chapo: '', eng_index: 'Sur cette page', eng_lien: 'Voir tous les engagements', equipe_sur: 'L’équipe', equipe_titre: 'Vos interlocuteurs',
  contact_titre: 'Parlons de votre projet', contact_chapo: 'Quelques lignes sur vos locaux, vos délais et votre budget suffisent pour commencer.',
  form_societe: 'Société', form_type: 'Type de locaux', form_surface: 'Surface approximative', form_surface_exemple: 'Ex. : 300 m²', form_ville: 'Ville du projet',
  form_message: 'Votre projet', form_message_exemple: 'Rénovation, aménagement, déménagement, délais souhaités…', form_envoyer: 'Envoyer la demande',
  pied_trouver: 'Nous trouver', pied_joindre: 'Nous joindre',
  mentions_immatriculation: 'RCS', mentions_siege: 'Siège',
  type_schema: 'GeneralContractor', bandeau_maquette: '',
  pages_sur: 'Par métier', pages_titre: 'Un site pensé pour votre métier', page_demo: 'Essayer la démonstration', page_maquette: 'Demander ma maquette gratuite', faq_sur: 'Questions', faq_titre: 'Les questions qu’on me pose', pied_metiers: 'Par métier',
  nav_actualites: 'Actualités', actu_sur: 'Actualités', actu_titre: 'Les dernières nouvelles', actu_tout: 'Toutes les actualités', page_actu_titre: 'Actualités', page_actu_chapo: '', actu_lien_real: 'Voir la réalisation', actu_suivi: 'Actualités de ce projet',
  comparaison_sur: 'Comparer', comparaison_titre: 'Un constructeur en ligne, ou un site réalisé pour vous ?',
};
/* Valeur d'un libellé : le texte du site s'il est rempli, sinon celui par défaut ; vide("") accepté pour les champs du formulaire */
export const libelle = (C, k) => { const v = (C && C.libelles && typeof C.libelles === 'object') ? C.libelles[k] : undefined; if (typeof v !== 'string') return LIBELLES[k]; return v.trim() || (/^form_(societe|type|surface|ville)$/.test(k) ? '' : LIBELLES[k]); };

/* Libellés des lignes d'une demande de contact (récapitulatif, page de modification) */
export const libellesDemande = (C) => ({ societe: libelle(C, 'form_societe') || 'Société', type: libelle(C, 'form_type') || 'Type de locaux', surface: libelle(C, 'fiche_surface'), ville: libelle(C, 'form_ville') || 'Ville du projet', message: 'Projet' });

/* Données utiles, nettoyées */
export function donnees(C) {
  const liste = (k) => (Array.isArray(C[k]) ? C[k] : []);
  const secteurs = liste('secteurs').filter((s) => s && s.id && s.nom);
  const realisations = liste('realisations').filter((x) => x && x.id && x.nom && x.visible !== false)
    .map((x) => ({ ...x, photos: (Array.isArray(x.photos) ? x.photos : []).filter(Boolean), interventions: (Array.isArray(x.interventions) ? x.interventions : []).filter(Boolean),
      lien: /^(\/[^\s<>"]*|https:\/\/[^\s<>"]+)$/.test(String(x.lien || '').trim()) ? String(x.lien).trim() : '' }));
  const metiers = liste('metiers').filter((m) => m && m.id && m.nom).map((m) => ({ ...m, points: (Array.isArray(m.points) ? m.points : []).filter(Boolean) }));
  const etapes = liste('etapes').filter((e) => e && e.titre).map((e) => ({ ...e, points: (Array.isArray(e.points) ? e.points : []).filter(Boolean) }));
  const A = C.affichage || {};
  const equipe = A.equipe === false ? [] : liste('equipe').filter((p) => p && p.nom);
  const references = A.references === false ? [] : liste('references').filter((r) => r && r.nom);
  const chiffres = A.chiffres === false ? [] : liste('chiffres').filter((c) => c && c.valeur && c.libelle);
  const lots = liste('lots').filter((l) => typeof l === 'string' && l.trim());
  /* Page « Engagements » (clé facultative « engagements ») : une liste de blocs { titre, texte, points } */
  const engagements = liste('engagements').filter((e) => e && e.titre).map((e, i) => ({ ...e, id: slug(e.titre) || 'engagement-' + (i + 1), points: (Array.isArray(e.points) ? e.points : []).filter(Boolean) }));
  const secteur = (id) => secteurs.find((s) => s.id === id) || null;
  const secteursUtiles = secteurs.filter((s) => realisations.some((x) => x.secteur === s.id));
  /* Abonnement mensuel facultatif (clé facultative « abonnements ») */
  const AB = C.abonnements && typeof C.abonnements === 'object' ? C.abonnements : null;
  const formules = AB && Array.isArray(AB.formules) ? AB.formules.filter((f) => f && f.nom).map((f) => ({ ...f, id: slug(f.nom), points: (Array.isArray(f.points) ? f.points : []).filter(Boolean) })) : [];
  const abonnements = formules.length ? { titre: AB.titre || '', intro: AB.intro || '', note: AB.note || '', formules } : null;
  /* Pages par métier (clé facultative « pages_metier ») : une adresse /id par métier, avec sa démonstration, ses questions et son prix de départ */
  const pages = pagesMetier(C);
  /* Comparaison avec un constructeur en ligne (clé facultative « comparaison ») */
  const CP = C.comparaison && typeof C.comparaison === 'object' && !Array.isArray(C.comparaison) ? C.comparaison : null;
  const lignesCp = CP && Array.isArray(CP.lignes) ? CP.lignes.filter((l) => l && l.critere && l.a && l.b) : [];
  const colsCp = CP && Array.isArray(CP.colonnes) && CP.colonnes.length === 2 && CP.colonnes.every((c) => typeof c === 'string' && c.trim()) ? CP.colonnes : null;
  const comparaison = CP && lignesCp.length && colsCp ? { actif: CP.actif === true, sur: CP.sur || '', titre: CP.titre || '', intro: CP.intro || '', note: CP.note || '', colonnes: colsCp, lignes: lignesCp } : null;
  /* Actualités (clé facultative « actualites ») : la plus récente d'abord ; une date AAAA-MM-JJ, ou pas de date */
  const actualites = liste('actualites').filter((x) => x && x.id && x.titre && x.visible !== false)
    .map((x) => ({ ...x, date: /^\d{4}-\d{2}-\d{2}$/.test(String(x.date || '')) ? x.date : '', photos: (Array.isArray(x.photos) ? x.photos : []).filter(Boolean) }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return { secteurs, secteursUtiles, realisations, actualites, metiers, etapes, equipe, references, chiffres, lots, secteur, abonnements, engagements, pages, comparaison };
}

/* Adresses qu'une page par métier ne peut pas prendre */
export const ADRESSES_RESERVEES = ['expertises', 'realisations', 'actualites', 'agence', 'engagements', 'contact', 'mentions-legales', 'confidentialite', 'admin', 'api', 'assets', 'fonts', 'photos', 'videos', 'demos'];
export function pagesMetier(C) {
  const liste = Array.isArray(C && C.pages_metier) ? C.pages_metier : [];
  return liste.filter((x) => x && typeof x === 'object' && /^[a-z0-9-]{3,60}$/.test(x.id || '') && !ADRESSES_RESERVEES.includes(x.id) && x.nom && x.visible !== false)
    .map((x) => ({ ...x, points: (Array.isArray(x.points) ? x.points : []).filter(Boolean), questions: (Array.isArray(x.questions) ? x.questions : []).filter((q) => q && q.q && q.r),
      demo: /^(\/[^\s<>"]*|https:\/\/[^\s<>"]+)$/.test(String(x.demo || '').trim()) ? String(x.demo).trim() : '' }));
}

function src(p, largeur) {
  if (!p) return '';
  p = String(p).trim();
  if (/^https:\/\/images\.unsplash\.com\//.test(p)) return p.split('?')[0] + `?auto=format&fit=crop&w=${largeur}&q=72`;
  if (/^(https:\/\/|data:image\/|\/photos\/|\/assets\/)/i.test(p)) return p;
  return '';
}
/*DIM-DEBUT*/const DIM = {"/assets/photos/accueil-1000w.jpg":[1000,1250],"/assets/photos/accueil-300w.jpg":[300,375],"/assets/photos/accueil-600w.jpg":[600,750],"/assets/photos/accueil.jpg":[1200,1500],"/assets/photos/gregoire-portrait-300w.jpg":[300,300],"/assets/photos/gregoire-portrait.jpg":[640,640],"/assets/photos/intro-1000w.jpg":[1000,1250],"/assets/photos/intro-300w.jpg":[300,375],"/assets/photos/intro-600w.jpg":[600,750],"/assets/photos/intro.jpg":[1200,1500],"/assets/photos/mobile-atelier-300w.jpg":[300,650],"/assets/photos/mobile-atelier.jpg":[520,1126],"/assets/photos/mobile-fleuriste-300w.jpg":[300,650],"/assets/photos/mobile-fleuriste.jpg":[520,1126],"/assets/photos/mobile-plombier-300w.jpg":[300,650],"/assets/photos/mobile-plombier.jpg":[520,1126],"/assets/photos/mobile-restaurant-300w.jpg":[300,650],"/assets/photos/mobile-restaurant.jpg":[520,1126],"/assets/photos/offre-catalogue-1000w.jpg":[1000,1250],"/assets/photos/offre-catalogue-300w.jpg":[300,375],"/assets/photos/offre-catalogue-600w.jpg":[600,750],"/assets/photos/offre-catalogue.jpg":[1200,1500],"/assets/photos/offre-entreprise-1000w.jpg":[1000,1250],"/assets/photos/offre-entreprise-300w.jpg":[300,375],"/assets/photos/offre-entreprise-600w.jpg":[600,750],"/assets/photos/offre-entreprise.jpg":[1200,1500],"/assets/photos/offre-vitrine-1000w.jpg":[1000,1250],"/assets/photos/offre-vitrine-300w.jpg":[300,375],"/assets/photos/offre-vitrine-600w.jpg":[600,750],"/assets/photos/offre-vitrine.jpg":[1200,1500],"/assets/photos/paris-16e-cafe-1000w.jpg":[1000,666],"/assets/photos/paris-16e-cafe-300w.jpg":[300,200],"/assets/photos/paris-16e-cafe-600w.jpg":[600,400],"/assets/photos/paris-16e-cafe.jpg":[1600,1066],"/assets/photos/partage-1000w.jpg":[1000,525],"/assets/photos/partage-300w.jpg":[300,158],"/assets/photos/partage-600w.jpg":[600,315],"/assets/photos/partage.jpg":[1200,630],"/assets/photos/real-atelier-exemple-1000w.jpg":[1000,625],"/assets/photos/real-atelier-exemple-2-1000w.jpg":[1000,625],"/assets/photos/real-atelier-exemple-2-300w.jpg":[300,188],"/assets/photos/real-atelier-exemple-2-600w.jpg":[600,375],"/assets/photos/real-atelier-exemple-2.jpg":[1600,1000],"/assets/photos/real-atelier-exemple-300w.jpg":[300,188],"/assets/photos/real-atelier-exemple-600w.jpg":[600,375],"/assets/photos/real-atelier-exemple.jpg":[1600,1000],"/assets/photos/real-fleuriste-exemple-1000w.jpg":[1000,625],"/assets/photos/real-fleuriste-exemple-2-1000w.jpg":[1000,625],"/assets/photos/real-fleuriste-exemple-2-300w.jpg":[300,188],"/assets/photos/real-fleuriste-exemple-2-600w.jpg":[600,375],"/assets/photos/real-fleuriste-exemple-2.jpg":[1600,1000],"/assets/photos/real-fleuriste-exemple-300w.jpg":[300,188],"/assets/photos/real-fleuriste-exemple-600w.jpg":[600,375],"/assets/photos/real-fleuriste-exemple.jpg":[1600,1000],"/assets/photos/real-operia-1000w.jpg":[1000,625],"/assets/photos/real-operia-2-1000w.jpg":[1000,625],"/assets/photos/real-operia-2-300w.jpg":[300,188],"/assets/photos/real-operia-2-600w.jpg":[600,375],"/assets/photos/real-operia-2.jpg":[1600,1000],"/assets/photos/real-operia-300w.jpg":[300,188],"/assets/photos/real-operia-600w.jpg":[600,375],"/assets/photos/real-operia.jpg":[1600,1000],"/assets/photos/real-plombier-exemple-1000w.jpg":[1000,625],"/assets/photos/real-plombier-exemple-2-1000w.jpg":[1000,625],"/assets/photos/real-plombier-exemple-2-300w.jpg":[300,188],"/assets/photos/real-plombier-exemple-2-600w.jpg":[600,375],"/assets/photos/real-plombier-exemple-2.jpg":[1600,1000],"/assets/photos/real-plombier-exemple-300w.jpg":[300,188],"/assets/photos/real-plombier-exemple-600w.jpg":[600,375],"/assets/photos/real-plombier-exemple.jpg":[1600,1000],"/assets/photos/real-restaurant-exemple-1000w.jpg":[1000,625],"/assets/photos/real-restaurant-exemple-2-1000w.jpg":[1000,625],"/assets/photos/real-restaurant-exemple-2-300w.jpg":[300,188],"/assets/photos/real-restaurant-exemple-2-600w.jpg":[600,375],"/assets/photos/real-restaurant-exemple-2.jpg":[1600,1000],"/assets/photos/real-restaurant-exemple-300w.jpg":[300,188],"/assets/photos/real-restaurant-exemple-600w.jpg":[600,375],"/assets/photos/real-restaurant-exemple.jpg":[1600,1000],"/assets/photos/travail-clavier-1000w.jpg":[1000,667],"/assets/photos/travail-clavier-300w.jpg":[300,200],"/assets/photos/travail-clavier-600w.jpg":[600,400],"/assets/photos/travail-clavier.jpg":[1200,800],"/assets/photos/tuile-atelier-exemple-300w.jpg":[300,375],"/assets/photos/tuile-atelier-exemple-600w.jpg":[600,749],"/assets/photos/tuile-atelier-exemple.jpg":[780,974],"/assets/photos/tuile-fleuriste-exemple-300w.jpg":[300,375],"/assets/photos/tuile-fleuriste-exemple-600w.jpg":[600,749],"/assets/photos/tuile-fleuriste-exemple.jpg":[780,974],"/assets/photos/tuile-plombier-exemple-300w.jpg":[300,375],"/assets/photos/tuile-plombier-exemple-600w.jpg":[600,749],"/assets/photos/tuile-plombier-exemple.jpg":[780,974],"/assets/photos/tuile-restaurant-exemple-300w.jpg":[300,375],"/assets/photos/tuile-restaurant-exemple-600w.jpg":[600,749],"/assets/photos/tuile-restaurant-exemple.jpg":[780,974]};/*DIM-FIN*/
const dimAttr = (u) => { const d = DIM[u]; return d ? ` width="${d[0]}" height="${d[1]}"` : ''; };
const essai = (p) => /^https:\/\/images\.unsplash\.com\//.test(String(p || ''));
/* Vidéo de fond (accueil) : fichier envoyé depuis la page de modification, lien https .mp4/.webm, ou fichier du site */
export const videoSrc = (v) => { v = String(v || '').trim(); return /^(https:\/\/\S+\.(mp4|webm)(\?\S*)?|\/videos\/[a-z0-9-]+|\/assets\/\S+\.(mp4|webm)|data:video\/(mp4|webm);base64,\S+)$/i.test(v) ? v : ''; };
const ICO_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>';
function videoFond(v, poster, cls) {
  const s = videoSrc(v);
  if (!s) return '';
  const type = /^data:video\/webm|\.webm(\?|$)/i.test(s) ? 'video/webm' : 'video/mp4';
  return `<video class="${cls}" autoplay muted loop playsinline preload="auto"${poster ? ` poster="${esc(poster)}"` : ''} aria-hidden="true" data-video-fond><source src="${esc(s)}" type="${type}"></video><button class="video-pause" type="button" data-video-pause aria-label="Mettre la vidéo en pause" aria-pressed="false">${ICO_PAUSE}</button>`;
}
/* Déclinaisons légères d'une photo du site (nom-300w.jpg…, fabriquées par npm run dimensions) : le navigateur choisit selon l'écran */
const SIZES = '(max-width: 700px) 100vw, 60vw';
function srcset(s) {
  const m = /^(\/assets\/.+?)(\.jpe?g)$/i.exec(s);
  if (!m || !DIM[s]) return '';
  const v = Object.keys(DIM).map((k) => { const x = new RegExp('^' + m[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '-(\\d+)w' + m[2].replace('.', '\\.') + '$').exec(k); return x ? [k, +x[1]] : null; }).filter(Boolean);
  return v.length ? [...v.sort((a, b) => a[1] - b[1]), [s, DIM[s][0]]].map(([u, w]) => `${u} ${w}w`).join(', ') : '';
}
function img(p, largeur, cls, prio, alt, sizes) {
  const s = src(p, largeur);
  if (!s) return '';
  const set = srcset(s);
  return `<img class="${cls}" src="${esc(s)}"${set ? ` srcset="${esc(set)}" sizes="${esc(sizes || SIZES)}"` : ''}${dimAttr(s)} alt="${esc(alt || '')}" ${prio ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}
/* Une photo de réalisation qui n'est pas encore celle du chantier le dit */
const illus = (p) => (essai(p) ? '<span class="illus">Photo d’illustration</span>' : '');

/* Texte simple : paragraphes séparés par une ligne vide, « ## titre », « - liste » */
function texteRiche(s) {
  return String(s || '').split(/\n\s*\n/).map((bloc) => {
    let html = '', liste = [], para = [];
    const finL = () => { if (liste.length) { html += '<ul>' + liste.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>'; liste = []; } };
    const finP = () => { if (para.length) { html += '<p>' + para.map(esc).join('<br>') + '</p>'; para = []; } };
    bloc.split('\n').map((l) => l.trim()).filter(Boolean).forEach((l) => {
      if (l.startsWith('## ')) { finP(); finL(); html += '<h2>' + esc(l.slice(3)) + '</h2>'; } else if (l.startsWith('- ')) { finP(); liste.push(l.slice(2)); } else { finL(); para.push(l); }
    });
    finP(); finL();
    return html;
  }).join('\n');
}

const ico = {
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h18M3 16h18"/></svg>',
  fermer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  tel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h3l1.5 4-2 1.3a12 12 0 0 0 6.1 6.1l1.3-2 4 1.5v3a1.8 1.8 0 0 1-1.9 1.8A16.6 16.6 0 0 1 4.8 5.4a1.8 1.8 0 0 1 1.8-1.9z"/></svg>',
  fleche: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
  gauche: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>',
  coche: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>',
};

export const favicon = (C) => src((C.agence || {}).logo, 64) || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#262a59"/></svg>');
/* Prix : « 590 € | une fois, sans abonnement » se compose en deux lignes (montant, précision) ; sans barre verticale, le texte reste tel quel */
const prixHtml = (p) => { const [v, ...r] = String(p == null ? '' : p).split('|'); return r.length ? `<span class="prix-v">${esc(v.trim())}</span><span class="prix-l">${esc(r.join('|').trim())}</span>` : esc(p); };
const telHref = (t) => 'tel:' + String(t || '').replace(/[^\d+]/g, '').replace(/^0/, '+33');

/* Barre d'appel au contact, réutilisée en bas de plusieurs pages */
/* Description d'une page pour les moteurs de recherche, propre à chaque page (150 signes au plus) */
const descr = (C, quoi) => { const G = C.agence || {}; const t = `${quoi} : ${G.nom || ''}${G.activite ? ', ' + G.activite.charAt(0).toLowerCase() + G.activite.slice(1) : ''}${G.zone ? ' (' + G.zone + ')' : ''}.`; return t.length <= 155 ? t : t.slice(0, 152).replace(/[\s,;:]+\S*$/, '') + '…'; };

function appel(C, court) {
  const A = C.accueil || {}, G = C.agence || {};
  if (court && (C.theme || {}).gabarit === 'edition') return `
  <section class="appel appel-court">
    <div class="wrap appel-in">
      <h2>${esc(A.appel_titre || libelle(C, 'appel_titre'))}</h2>
      <div class="actions">
        <a class="btn btn-or" href="/contact">${esc(libelle(C, 'bouton_appel'))}</a>
        ${G.telephone ? `<a class="btn btn-ligne-clair" href="${telHref(G.telephone)}">${ico.tel}<span>${esc(G.telephone)}</span></a>` : ''}
      </div>
    </div>
  </section>`;
  return `
  <section class="appel">
    ${img(A.photo_appel, 2000, 'appel-img', false, '')}
    <div class="wrap appel-in">
      <h2>${esc(A.appel_titre || libelle(C, 'appel_titre'))}</h2>
      ${A.appel_texte ? `<p>${esc(A.appel_texte)}</p>` : ''}
      <div class="actions">
        <a class="btn btn-or" href="/contact">${esc(libelle(C, 'bouton_appel'))}</a>
        ${G.telephone ? `<a class="btn btn-ligne-clair" href="${telHref(G.telephone)}">${ico.tel}<span>${esc(G.telephone)}</span></a>` : ''}
      </div>
    </div>
  </section>`;
}

/* o = { maquette, urlPolice, css | cssHref, js | jsHref, lienAdmin, apiContact, apercu, calme (aperçu de la page de modification : sans animations) } */
function document_(C, o, page) {
  const G = C.agence || {}, T = C.theme || {}, K = C.contact || {};
  const nom = G.nom || 'Agence';
  const gabarit = T.gabarit === 'edition' ? 'edition' : T.gabarit === 'studio' ? 'studio' : 'classique';
  const theme = `${cssPolices(o.urlPolice || ((f) => '/fonts/' + f), gabarit === 'classique' ? 'agence' : gabarit)}\n:root{--fond:${hex(T.fond, '#f4f6f8')};--encre:${hex(T.encre, '#15172e')};--gris:${hex(T.gris, '#585b70')};--trait:${hex(T.trait, '#e2ded4')};--marine:${hex(T.marine, '#262a59')};--or:${hex(T.or, '#f8c151')}}`;
  /* Polices du gabarit édition chargées d'avance : moins de décalage quand elles remplacent la police de secours */
  const precharge = gabarit === 'edition' && !o.urlPolice ? ['besley-latin-500-normal.woff2', 'schibsted-grotesk-latin-400-normal.woff2'].map((f) => `<link rel="preload" as="font" type="font/woff2" href="/fonts/${f}" crossorigin>`).join('\n') + '\n' : '';
  const style = precharge + (o.css != null ? `<style>\n${o.css}\n${theme}\n</style>` : `<link rel="stylesheet" href="${o.cssHref || '/assets/site.css'}">\n<style>${theme}</style>`);
  const marque = src(G.nom_image, 600) ? `<img src="${esc(src(G.nom_image, 600))}" alt="${esc(nom)}">` : esc(nom);
  const marqueClaire = src(G.nom_image_blanc, 600) ? `<img src="${esc(src(G.nom_image_blanc, 600))}" alt="${esc(nom)}">` : esc(nom);
  const avecEngagements = Array.isArray(C.engagements) && C.engagements.some((e) => e && e.titre);
  const avecActualites = donnees(C).actualites.length > 0;
  const nav = [['/expertises', libelle(C, 'nav_expertises')], ['/realisations', libelle(C, 'nav_realisations')], ...(avecActualites ? [['/actualites', libelle(C, 'nav_actualites')]] : []), ['/agence', libelle(C, 'nav_agence')], ...(avecEngagements ? [['/engagements', libelle(C, 'nav_engagements')]] : [])].map(([h, t]) => [h, esc(t)]);
  const actif = (h) => (page.rubrique === h ? ' aria-current="page"' : '');
  const reseaux = [['linkedin', 'LinkedIn'], ['instagram', 'Instagram']].filter(([k]) => /^https:\/\//.test(G[k] || ''));
  const AG = {
    nom, tel: G.telephone || '', api: o.apiContact || '', maquette: !!o.maquette, apercu: !!o.apercu, cle: K.cle_web3forms || '', email: K.email || G.email || '',
    actif: K.actif !== false, confirmation: String(K.confirmation || 'Merci, votre demande est bien partie.'),
    lib: libellesDemande(C),
  };
  const donneesJs = `var AGENCE=${JSON.stringify(AG).replace(/</g, '\\u003c')};`;
  const scripts = o.js != null ? `<script>\n${donneesJs}\n${o.js}\n</script>` : `<script>${donneesJs}</script>\n<script src="${o.jsHref || '/assets/site.js'}" defer></script>`;
  /* Google affiche environ 60 signes : le nom du site n'est ajouté au titre de la page que s'il tient */
  const titreAuto = page.titre ? (page.titre.length + nom.length + 2 <= 60 ? `${page.titre}, ${nom}` : page.titre) : `${nom}, ${G.activite || ''}`.replace(/, $/, '');
  /* Titre et description choisis page par page (clé facultative « seo » : { "/adresse": { titre, description } }) ; sinon ceux calculés ci-dessus */
  const SEO = C.seo && typeof C.seo === 'object' && !Array.isArray(C.seo) && page.chemin && C.seo[page.chemin] && typeof C.seo[page.chemin] === 'object' ? C.seo[page.chemin] : {};
  const titre = String(SEO.titre || '').trim() || titreAuto;
  const desc = String(SEO.description || '').trim() || page.description || G.description_google || '';

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(desc)}">
${o.maquette ? '<meta name="robots" content="noindex">' : ''}
${!o.maquette && page.chemin && /^https:\/\//.test((C.reglages || {}).url || '') ? `<link rel="canonical" href="${esc(C.reglages.url.replace(/\/$/, '') + (page.chemin === '/' ? '/' : page.chemin))}">` : ''}
<meta property="og:title" content="${esc(titre)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="${page.ogType || 'website'}">
${page.publie ? `<meta property="article:published_time" content="${esc(page.publie)}">` : ''}
${(() => { const u = src(page.image, 1200) || src((C.reglages || {}).image_partage, 1200); const base = /^https:\/\//.test((C.reglages || {}).url || '') ? C.reglages.url.replace(/\/$/, '') : ''; return u ? `<meta property="og:image" content="${esc(/^\//.test(u) ? base + u : u)}">` : ''; })()}
${donnees(C).actualites.length ? `<link rel="alternate" type="application/rss+xml" title="${esc(libelle(C, 'nav_actualites'))}, ${esc(nom)}" href="/actualites.xml">` : ''}
<meta name="theme-color" content="${hex(T.fond, '#f4f6f8')}">
<link rel="icon" href="${esc(favicon(C))}">
${style}
</head>
<body class="${page.classe || ''}${gabarit === 'studio' ? ' g-studio' : gabarit === 'edition' ? ' g-edition' : ' g-classique'}${o.calme ? ' calme' : ''}">
<a class="skip" href="#contenu">Aller au contenu</a>
${o.maquette ? `<aside class="maquette" aria-label="Information sur ce site">${esc(libelle(C, 'bandeau_maquette') || `Proposition de site pour ${nom}, préparée par Grégoire Muel. Version de travail non publiée : textes et photos à valider.`)}</aside>` : ''}
${C.annonce && C.annonce.afficher && C.annonce.texte ? `<aside class="annonce" aria-label="Annonce">${esc(C.annonce.texte)}</aside>` : ''}
<header class="tete">
  <div class="tete-in">
    <a class="marque" href="/" aria-label="${esc(nom)}, accueil">${marque}</a>
    <nav class="nav" aria-label="Menu principal">${nav.map(([h, t]) => `<a href="${h}"${actif(h)}>${t}</a>`).join('')}<a class="btn btn-petit" href="/contact"${actif('/contact')}>Contact</a></nav>
    <button class="ico menu-btn" type="button" id="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="menu">${ico.menu}</button>
  </div>
</header>
<div class="volet" id="menu" hidden>
  <div class="volet-in">
    <button class="ico ico-fermer" type="button" data-fermer aria-label="Fermer le menu">${ico.fermer}</button>
    <ul>${[['/', 'Accueil'], ...nav, ['/contact', 'Contact']].map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul>
    ${G.telephone ? `<a class="volet-tel" href="${telHref(G.telephone)}">${ico.tel}<span>${esc(G.telephone)}</span></a>` : ''}
  </div>
</div>
<main id="contenu">
${page.corps}
</main>
<footer class="pied">
  <div class="wrap">
    <div class="pied-haut">
      <a class="pied-marque" href="/" aria-label="${esc(nom)}, accueil">${marqueClaire}</a>
      ${G.activite || G.zone ? `<p class="pied-act">${esc([G.activite, G.zone].filter(Boolean).join(' · '))}</p>` : ''}
    </div>
    <div class="pied-cols">
      <div><h2>Le site</h2><ul>${nav.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}<li><a href="/contact">Contact</a></li></ul></div>
      ${pagesMetier(C).filter((x) => x.liste !== false).length ? `<div><h2>${esc(libelle(C, 'pied_metiers'))}</h2><ul>${pagesMetier(C).filter((x) => x.liste !== false).map((x) => `<li><a href="/${esc(x.id)}">${esc(x.nom)}</a></li>`).join('')}</ul></div>` : ''}
      <div><h2>${esc(libelle(C, 'pied_trouver'))}</h2><ul>
        ${G.adresse ? `<li>${esc(G.adresse)}<br>${esc([G.code_postal, G.ville].filter(Boolean).join(' '))}</li>` : (G.ville ? `<li>${esc(G.ville)}</li>` : '')}
      </ul></div>
      <div><h2>${esc(libelle(C, 'pied_joindre'))}</h2><ul>
        ${G.telephone ? `<li><a href="${telHref(G.telephone)}">${esc(G.telephone)}</a></li>` : ''}
        ${G.email ? `<li><a href="mailto:${esc(G.email)}">${esc(G.email)}</a></li>` : ''}
        ${reseaux.map(([k, t]) => `<li><a href="${esc(G[k])}" target="_blank" rel="noopener">${t}</a></li>`).join('')}
      </ul></div>
    </div>
    <div class="legal">
      <a href="/mentions-legales">Mentions légales</a>
      <a href="/confidentialite">Confidentialité</a>
      <a href="/confidentialite#cookies">Cookies</a>
      ${o.lienAdmin ? `<a href="${o.lienAdmin}">Page de modification</a>` : ''}
      <span>© ${new Date().getFullYear()} ${esc(nom)}</span>
      ${(() => { const [t, u] = String(o.credit || '').split('|').map((x) => x.trim()); return t && /^https:\/\/\S+$/.test(u || '') ? `<a href="${esc(u)}" rel="nofollow">${esc(t)}</a>` : ''; })()}
      ${C.credits_photos ? ((C.theme || {}).gabarit === 'edition' ? `<details class="credits"><summary>Crédits des photos</summary><p>${esc(C.credits_photos)}</p></details>` : `<span class="credits">${esc(C.credits_photos)}</span>`) : ''}
    </div>
  </div>
</footer>
${page.jsonld ? `<script type="application/ld+json">${JSON.stringify(page.jsonld).replace(/</g, '\\u003c')}</script>` : ''}
${scripts}
</body>
</html>
`;
}

/* ---------- Morceaux ---------- */
const meta = (x) => [x.lieu, x.surface].filter(Boolean).join(' · ');
/* Étiquette facultative sur la vignette (ex. « Démonstration ») */
const etiquette = (x) => (x.etiquette ? `<span class="etiq">${esc(x.etiquette)}</span>` : '');
const carte = (D, x, grande) => `<li class="carte${grande ? ' carte-grande' : ''}"><a href="/realisations/${esc(x.id)}">
      <span class="carte-txt"><span class="carte-sec">${esc((D.secteur(x.secteur) || {}).nom || '')}</span><span class="carte-nom">${esc(x.nom)}</span>${meta(x) ? `<span class="carte-meta">${esc(meta(x))}</span>` : ''}</span>
    
      <span class="carte-img">${x.photos[0] ? img(x.photos[0], grande ? 1600 : 1000, 'carte-photo', false, '') + illus(x.photos[0]) : '<span class="sans-photo">Photos à venir</span>'}${etiquette(x)}</span>
    </a></li>`;
/* Fil d'Ariane pour Google (BreadcrumbList) : seulement quand l'adresse définitive du site est connue */
const baseSite = (C) => (/^https:\/\//.test((C.reglages || {}).url || '') ? C.reglages.url.replace(/\/$/, '') : '');
const filAriane = (C, etapes) => { const b = baseSite(C); return b ? { '@type': 'BreadcrumbList', itemListElement: [[(C.agence || {}).nom || 'Accueil', '/'], ...etapes].map(([n, ch], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: b + ch })) } : null; };
const graphe = (...objets) => { const g = objets.filter(Boolean); return g.length ? { '@context': 'https://schema.org', '@graph': g } : undefined; };

/* Actualités : date en toutes lettres, extrait du texte, vignette */
const dateFr = (d) => (d ? new Date(d + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '');
const extrait = (t, n = 150) => { const s = String(t || '').replace(/^##\s+/gm, '').replace(/^-\s+/gm, '').replace(/\s+/g, ' ').trim(); return s.length <= n ? s : s.slice(0, n - 1).replace(/[\s,;:.]+\S*$/, '') + '…'; };
/* Liste éditoriale : date, titre et extrait, petite vignette à droite si l'actualité a une photo ; les lignes restent alignées avec ou sans photo */
const carteActu = (x) => `<li class="actu"><a href="/actualites/${esc(x.id)}">
      <span class="actu-date">${x.date ? `<time datetime="${esc(x.date)}">${esc(dateFr(x.date))}</time>` : ''}</span>
      <span class="actu-corps"><span class="actu-titre">${esc(x.titre)}</span>${x.texte ? `<span class="actu-extrait">${esc(extrait(x.texte))}</span>` : ''}</span>
      ${x.photos[0] ? `<span class="actu-vignette">${img(x.photos[0], 600, 'actu-img', false, '', '(max-width: 700px) 30vw, 200px')}${illus(x.photos[0])}</span>` : ''}
    </a></li>`;
const titreSection = (sur, titre, id) => `<p class="sur">${esc(sur)}</p><h2${id ? ` id="${id}"` : ''}>${esc(titre)}</h2>`;
const listeCoches = (pts) => (pts.length ? `<ul class="coches">${pts.map((p) => `<li>${ico.coche}<span>${esc(p)}</span></li>`).join('')}</ul>` : '');
const etapesHtml = (D) => (D.etapes.length ? `<ol class="etapes">${D.etapes.map((e, i) => `<li><span class="etape-num">${num(i)}</span><h3>${esc(e.titre)}</h3>${e.points.length ? `<ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ol>` : '');
const abonnementsHtml = (D) => {
  const A = D.abonnements;
  if (!A) return '';
  return `
  <section class="sec abo" id="abonnements" aria-labelledby="t-abo">
    <div class="wrap">
      <div class="sec-tete">${titreSection('Abonnement facultatif', A.titre || 'Un coup de main au mois, si vous le souhaitez', 't-abo')}${A.intro ? `<p class="chapo">${esc(A.intro)}</p>` : ''}</div>
      <ul class="abo-grille">
        ${A.formules.map((f) => `<li class="abo-carte${f.recommande ? ' abo-reco' : ''}">
          
          <h3>${esc(f.nom)}</h3>
          <p class="abo-prix"><b>${esc(f.prix || '')}</b>${f.periode ? ` <span>${esc(f.periode)}</span>` : ''}</p>
          ${f.description ? `<p class="abo-desc">${esc(f.description)}</p>` : ''}
          ${listeCoches(f.points)}
          ${f.id && f.id !== 'sans-abonnement' ? `<p class="abo-act"><a class="btn btn-choisir" href="/contact?offre=${esc(f.id)}">Choisir</a></p>` : ''}
        </li>`).join('\n        ')}
      </ul>
      ${A.note ? `<p class="abo-note">${esc(A.note)}</p>` : ''}
    </div>
  </section>`;
};
const comparaisonHtml = (C, D) => {
  const K = D.comparaison;
  if (!K || K.actif !== true) return '';
  const [c1, c2] = K.colonnes;
  return `
  <section class="sec" id="comparaison" aria-labelledby="t-cmp">
    <div class="wrap">
      <div class="sec-tete">${titreSection(K.sur || libelle(C, 'comparaison_sur'), K.titre || libelle(C, 'comparaison_titre'), 't-cmp')}${K.intro ? `<p class="chapo">${esc(K.intro)}</p>` : ''}</div>
      <table class="cmp">
        <thead><tr><th scope="col"><span class="sr">Critère</span></th><th scope="col">${esc(c1)}</th><th scope="col">${esc(c2)}</th></tr></thead>
        <tbody>${K.lignes.map((l) => `<tr><th scope="row">${esc(l.critere)}</th><td data-label="${esc(c1)}">${esc(l.a)}</td><td data-label="${esc(c2)}">${esc(l.b)}</td></tr>`).join('')}</tbody>
      </table>
      ${K.note ? `<p class="abo-note">${esc(K.note)}</p>` : ''}
    </div>
  </section>`;
};
/* Feuille d'exemple (clé « exemple » d'une page par métier) : le document remis au commerçant, pour un commerce imaginaire */
const ETATS = { ok: 'En règle', afaire: 'À faire', manque: 'Manque' };
function feuilleHtml(x) {
  const E = x.exemple;
  if (!E || typeof E !== 'object' || !Array.isArray(E.lignes) || !E.lignes.length) return '';
  const actions = (Array.isArray(E.actions) ? E.actions : []).filter(Boolean);
  return `<figure class="feuille">
        <div class="feuille-page">
          <p class="feuille-titre">${esc(E.titre || 'Mini-diagnostic de votre fiche Google')}</p>
          <p class="feuille-sous">${esc([E.commerce, E.date].filter(Boolean).join(', '))}</p>
          <table class="feuille-tab"><caption class="sr">Les points de la fiche, et leur état</caption><tbody>${E.lignes.filter((l) => l && l.point).map((l) => `<tr class="e-${esc(ETATS[l.etat] ? l.etat : 'afaire')}"><th scope="row">${esc(l.point)}</th><td class="feuille-etat">${esc(ETATS[l.etat] || ETATS.afaire)}</td><td>${esc(l.note || '')}</td></tr>`).join('')}</tbody></table>
          ${actions.length ? `<p class="feuille-actions">À faire en premier</p><ol>${actions.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>` : ''}
        </div>
        ${E.legende ? `<figcaption>${esc(E.legende)}</figcaption>` : ''}
      </figure>`;
}
const pagesListeHtml = (C, D) => (D.pages.filter((x) => x.liste !== false).length ? `
  <section class="sec sec-serre" aria-labelledby="t-pages">
    <div class="wrap">
      <div class="sec-tete">${titreSection(libelle(C, 'pages_sur'), libelle(C, 'pages_titre'), 't-pages')}</div>
      <nav class="filtres" aria-label="${esc(libelle(C, 'pages_sur'))}">${D.pages.filter((x) => x.liste !== false).map((x) => `<a href="/${esc(x.id)}">${esc(x.nom)}</a>`).join('')}</nav>
    </div>
  </section>` : '');
const referencesHtml = (D) => `<ul class="refs">${D.references.map((r) => `<li>${src(r.logo, 400) ? `<img src="${esc(src(r.logo, 400))}" alt="${esc(r.nom)}" loading="lazy">` : `<span>${esc(r.nom)}</span>`}</li>`).join('')}</ul>`;
const initiales = (n) => String(n || '').split(/[\s-]+/).filter(Boolean).map((m) => m[0]).slice(0, 2).join('').toUpperCase();

/* Repères de confiance sous la grande photo (courts : trois ou quatre) */
const garHero = (C) => (Array.isArray((C.accueil || {}).reperes) ? C.accueil.reperes : []).filter((x) => typeof x === 'string' && x.trim()).slice(0, 4);

/* Composition de l'accueil sans grande photo : un ordinateur et deux téléphones montrant des sites d'exemple (captures des démonstrations), sur un fond uni. Aucun faux client. */
const compoHero = (essais, fond) => {
  /* Quatre démonstrations ou plus avec leur capture « téléphone » : une planche de téléphones, chacun ouvre sa démonstration (gabarit édition) */
  const tels4 = essais.filter((x) => x.lien && (x.photos || [])[2]).slice(0, 4);
  if (tels4.length >= 3) return `<div class="hero-compo hero-planche${src(fond, 1600) ? ' hero-avec-fond' : ''}">
      ${src(fond, 1600) ? `${img(fond, 1600, 'hero-fond', true, '', '(max-width: 900px) 100vw, 55vw')}` : ''}
      <ul class="planche" aria-label="Démonstrations à essayer (entreprises imaginaires)">${tels4.map((x, i) => `<li><a class="planche-tel" href="${esc(x.lien)}"${/^https?:/.test(x.lien) ? ' target="_blank" rel="noopener"' : ''}><span class="planche-ecran">${img(x.photos[2], 500, 'compo-img', i < 2, '', '(max-width: 600px) 42vw, 130px')}</span><span class="planche-nom">${esc(String(x.nom).split(',')[0])}</span></a></li>`).join('')}</ul>
      <p class="planche-note">Démonstrations : entreprises imaginaires. Touchez un téléphone pour l’essayer.</p>
    </div>`;
  const bureau = (essais[0] || {}).photos && essais[0].photos[0], tels = essais.slice(1, 3).map((x) => (x.photos || [])[2] || x.apercu).filter(Boolean);
  if (!bureau || tels.length < 2) return '';
  return `<div class="hero-compo" role="group" aria-label="Aperçus de sites d’exemple sur ordinateur et sur téléphone">
      <span class="compo-ordi"><span class="compo-ecran">${img(bureau, 1000, 'compo-img', true, '', '(max-width: 700px) 85vw, 40vw')}</span><span class="compo-socle"></span></span>
      ${tels.map((v, i) => `<span class="compo-tel compo-t${i + 1}">${img(v, 500, 'compo-img', false, '', '(max-width: 700px) 25vw, 140px')}</span>`).join('')}
    </div>`;
};

const teteFig = (champ) => (src(champ, 1200) ? `<figure class="tete-fig">${img(champ, 1200, 'tete-img', false, '', '(max-width: 900px) 90vw, 40vw')}</figure>` : '');
/* ---------- Pages ---------- */
function accueil(C, D) {
  const A = C.accueil || {}, G = C.agence || {};
  const video = A.fond_video !== false ? videoSrc(A.video) : '';
  /* Grille de l'accueil : 6 projets (un grand et cinq), 4 (deux par deux) ou 3, pour qu'aucune case ne reste vide */
  const une = D.realisations.filter((x) => x.a_la_une), base = une.length >= 3 ? une : D.realisations;
  const choix = A.cartes === false ? [] : base.slice(0, base.length >= 6 ? 6 : base.length >= 4 ? 4 : Math.min(3, base.length));
  const essais = D.realisations.filter((x) => x.lien);
  return {
    classe: 'p-accueil', image: A.photo, rubrique: '/',
    jsonld: graphe({ '@type': libelle(C, 'type_schema'), name: G.nom, description: G.description_google || '', telephone: G.telephone || undefined, email: G.email || undefined,
      address: G.adresse ? { '@type': 'PostalAddress', streetAddress: G.adresse, postalCode: G.code_postal, addressLocality: G.ville, addressCountry: 'FR' } : undefined,
      image: (() => { const u = src(A.photo, 1200) || src((C.reglages || {}).image_partage, 1200); return u ? (/^\//.test(u) ? baseSite(C) + u : u) : undefined; })(),
      logo: (() => { const u = src(G.logo, 600); return u && baseSite(C) ? (/^\//.test(u) ? baseSite(C) + u : u) : undefined; })(),
      /* Zone : « Nantes, Vertou, Rezé » devient une liste de villes ; profils : fiche Google, Pages Jaunes, Houzz… relient le site à la même entreprise (Google, Bing, IA) */
      areaServed: (() => { const v = String(G.zone || '').split(/\s*[,;·]\s*|\s+et\s+/).map((x) => x.trim()).filter(Boolean); return v.length > 1 ? v.map((n) => ({ '@type': 'City', name: n })) : (G.zone || undefined); })(),
      ...((C.reglages || {}).url ? { url: C.reglages.url } : {}),
      sameAs: [...new Set([G.linkedin, G.instagram, ...(Array.isArray(G.profils) ? G.profils : [])].filter((u) => /^https:\/\/\S+$/.test(String(u || '').trim())).map((u) => u.trim()))] },
      baseSite(C) ? { '@type': 'WebSite', name: G.nom, url: baseSite(C) + '/', inLanguage: 'fr-FR' } : null),
    corps: `
  <section class="hero">
    ${video ? videoFond(video, src(A.photo, 2200), 'hero-media') : src(A.photo, 2400) ? img(A.photo, 2400, 'hero-media', true, '') : compoHero(essais, A.photo_fond)}
    <div class="hero-txt wrap">
      ${A.sur_titre ? `<p class="sur sur-clair">${esc(A.sur_titre)}</p>` : ''}
      <h1>${esc(A.titre || G.nom)}</h1>
      ${A.texte ? `<p class="hero-chapo">${esc(A.texte)}</p>` : ''}
      <div class="actions">
        <a class="btn btn-or" href="/contact">${esc(libelle(C, 'bouton_principal'))}</a>
        ${D.realisations.length ? `<a class="btn btn-ligne-clair" href="/realisations">${esc(libelle(C, 'bouton_realisations'))}</a>` : ''}
      </div>
      ${A.hero_tel && G.telephone ? `<p class="hero-tel">${src((C.presentation || {}).photo, 200) ? img(C.presentation.photo, 200, 'avatar', true, '', '56px') : ''}<span>${esc(A.hero_tel)} <a href="tel:${esc(String(G.telephone).replace(/[^\d+]/g, ''))}">${esc(G.telephone)}</a></span></p>` : ''}
      ${garHero(C).length ? `<ul class="hero-gar">${garHero(C).map((g) => { const [v, ...r] = g.split('|'); return r.length ? `<li><b>${esc(v.trim())}</b><span>${esc(r.join('|').trim())}</span></li>` : `<li>${esc(g)}</li>`; }).join('')}</ul>` : ''}
    </div>
  </section>
  ${A.intro_titre || A.intro_texte ? `
  <section class="sec intro">
    <div class="wrap intro-grille">
      <div class="intro-txt">
        <p class="sur">${esc(G.nom || '')}</p>
        ${A.intro_titre ? `<h2>${esc(A.intro_titre)}</h2>` : ''}
        <div class="prose">${texteRiche(A.intro_texte)}</div>
        <a class="lien" href="/agence">${esc(libelle(C, 'intro_lien'))} ${ico.fleche}</a>
      </div>
      ${src(A.photo_intro, 1200) ? `<figure class="intro-fig">${img(A.photo_intro, 1200, 'intro-img', false, '')}</figure>` : ''}
    </div>
    ${D.chiffres.length ? `<div class="wrap"><ul class="chiffres">${D.chiffres.map((c) => `<li><b>${esc(c.valeur)}</b><span>${esc(c.libelle)}</span></li>`).join('')}</ul></div>` : ''}
  </section>` : ''}
  ${D.metiers.length ? `
  <section class="sec sombre" aria-labelledby="t-exp">
    <div class="wrap">
      <div class="sec-tete">${titreSection(libelle(C, 'exp_sur'), libelle(C, 'exp_titre'), 't-exp')}</div>
      <ol class="metiers">
        ${D.metiers.map((m, i) => `<li><a href="${/^\/[a-z0-9#-]+$/.test(m.lien || '') ? esc(m.lien) : '/expertises#' + esc(m.id)}"><span class="metier-num">${num(i)}</span><h3>${esc(m.nom)}</h3>${m.accroche ? `<p>${esc(m.accroche)}</p>` : ''}${m.prix ? `<p class="metier-prix">${prixHtml(m.prix)}</p>` : ''}<span class="lien">${esc(libelle(C, 'exp_lien'))} ${ico.fleche}</span></a></li>`).join('\n        ')}
      </ol>
    </div>
  </section>` : ''}
  ${essais.length && A.essai_titre ? `
  <section class="sec essai" aria-labelledby="t-essai">
    <div class="wrap essai-grille">
      <div class="essai-txt">${titreSection(libelle(C, 'essai_sur'), A.essai_titre, 't-essai')}${A.essai_texte ? `<div class="prose">${texteRiche(A.essai_texte)}</div>` : ''}</div>
      <ul class="essai-liens">${essais.map((x) => `<li><a href="${esc(x.lien)}"${/^https?:/.test(x.lien) ? ' target="_blank" rel="noopener"' : ''} data-ouvrir>${(x.apercu || x.photos[0]) ? `<span class="essai-vue">${img(x.apercu || x.photos[0], 900, 'essai-img', false, '', '(max-width: 700px) 70vw, 25vw')}</span>` : ''}<span class="essai-corps"><b>${esc(x.nom)}</b>${x.accroche ? `<small>${esc(x.accroche)}</small>` : ''}${A.essai_points && (x.interventions || []).length ? `<span class="essai-points"><span class="essai-points-t">À essayer</span>${x.interventions.slice(0, 3).map((t) => `<span>${esc(t)}</span>`).join('')}</span>` : ''}</span><span class="essai-act">${esc(x.lien_texte || 'Ouvrir')} ${ico.fleche}</span></a></li>`).join('')}</ul>
    </div>
  </section>` : ''}
  ${choix.length ? `
  <section class="sec" aria-labelledby="t-real">
    <div class="wrap">
      <div class="sec-tete sec-tete-ligne"><div>${titreSection(libelle(C, 'real_sur'), libelle(C, 'real_titre'), 't-real')}</div><a class="lien" href="/realisations">${esc(libelle(C, 'real_tout'))} ${ico.fleche}</a></div>
      <ul class="cartes cartes-une${choix.length === 4 ? ' cartes-quatre' : ''}">
        ${choix.map((x, i) => carte(D, x, i === 0 && choix.length === 6)).join('\n        ')}
      </ul>
    </div>
  </section>` : ''}
  ${D.actualites.length && A.actualites !== false ? `
  <section class="sec" aria-labelledby="t-actu">
    <div class="wrap">
      <div class="sec-tete sec-tete-ligne"><div>${titreSection(libelle(C, 'actu_sur'), libelle(C, 'actu_titre'), 't-actu')}</div><a class="lien" href="/actualites">${esc(libelle(C, 'actu_tout'))} ${ico.fleche}</a></div>
      <ul class="actus">
        ${D.actualites.slice(0, 3).map(carteActu).join('\n        ')}
      </ul>
    </div>
  </section>` : ''}
  ${D.references.length ? `
  <section class="sec" aria-labelledby="t-refs">
    <div class="wrap">
      <div class="sec-tete">${titreSection(libelle(C, 'refs_sur'), libelle(C, 'refs_titre'), 't-refs')}</div>
      ${referencesHtml(D)}
    </div>
  </section>` : ''}
  ${appel(C)}`,
  };
}

/* Gabarit « édition » : chaque offre est une tuile (nom, pour qui, prix, ce qui est compris) ; le détail s'ouvre dans la tuile */
const offrePlan = (C, m, i) => `
        <li class="plan" id="${esc(m.id)}">
          ${src(m.photo, 1000) ? `<figure class="plan-vue">${img(m.photo, 1000, 'plan-img', i === 0, 'Aperçu d’un site d’exemple de cette offre', '(max-width: 900px) 90vw, 400px')}</figure>` : ''}
          <div class="plan-tete"><h2>${esc(m.nom)}</h2>${m.accroche ? `<p class="plan-pour">${esc(m.accroche)}</p>` : ''}</div>
          ${m.prix ? `<p class="plan-prix">${prixHtml(m.prix)}</p>` : ''}
          ${listeCoches(m.points.slice(0, 5))}
          ${m.texte ? `<details class="plan-plus"><summary>Le détail de l’offre</summary><div class="prose">${texteRiche(m.texte)}</div></details>` : ''}
          <p class="plan-actions"><a class="btn btn-choisir" href="/contact?offre=${esc(m.id)}">${esc(libelle(C, 'bouton_choisir'))}</a>${/^\/[a-z0-9#-]+$/.test(m.lien || '') ? `<a class="lien" href="${esc(m.lien)}">${esc(libelle(C, 'exp_lien'))} ${ico.fleche}</a>` : ''}</p>
        </li>`;

/* Page des offres, gabarit « édition » : des chapitres de couleur à la suite (les sites, les abonnements, comment ça marche, ce qui est inclus, la comparaison), avec des liens d'ancre en tête de page */
function onglets(C, D) {
  const etapes = D.etapes.length ? `
      <section class="sec clair" id="etapes" aria-labelledby="t-met"><div class="wrap">
        <div class="sec-tete">${titreSection(libelle(C, 'methode_sur'), libelle(C, 'methode_titre_page'), 't-met')}</div>
        ${etapesHtml(D)}
      </div></section>` : '';
  const lots = D.lots.length ? `
      <section class="sec ch-sable" id="inclus" aria-labelledby="t-lots"><div class="wrap">
        <div class="sec-tete">${titreSection(libelle(C, 'lots_sur'), libelle(C, 'lots_titre'), 't-lots')}</div>
        <ul class="lots">${D.lots.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      </div></section>` : '';
  const cmp = comparaisonHtml(C, D);
  const abo = abonnementsHtml(D);
  const pages = D.pages.filter((x) => x.liste !== false);
  const sites = `<section class="sec" id="sites" aria-label="${esc(libelle(C, 'page_exp_titre'))}"><div class="wrap">
        <ul class="plans">${D.metiers.map((m, i) => offrePlan(C, m, i)).join('')}</ul>
        ${pages.length ? `<nav class="metier-liens" aria-label="${esc(libelle(C, 'pages_titre'))}">${pages.map((x) => `<a href="/${esc(x.id)}"><span>${esc(x.nom)}</span>${ico.fleche}</a>`).join('')}</nav>` : ''}
      </div></section>`;
  return { ancres: [['sites', 'Les sites'], ...(abo ? [['abonnements', 'Abonnements']] : []), ...(etapes ? [['etapes', 'Comment ça marche']] : []), ...(lots ? [['inclus', 'Inclus dans chaque site']] : []), ...(cmp ? [['comparaison', 'Comparer']] : [])], html: [sites, abo, etapes, lots, cmp].join('\n') };
}
const classique = (C, D) => `
  ${D.metiers.map((m, i) => `
  <section class="sec metier${i % 2 ? ' inverse' : ''}" id="${esc(m.id)}">
    <div class="wrap metier-grille">
      ${src(m.photo, 1400) ? `<figure class="metier-fig">${img(m.photo, 1400, 'metier-img', i === 0, '')}</figure>` : ''}
      <div class="metier-txt">
        <span class="metier-num">${num(i)}</span>
        <h2>${esc(m.nom)}</h2>
        ${m.accroche ? `<p class="chapo">${esc(m.accroche)}</p>` : ''}
        ${m.prix ? `<p class="metier-prix">${prixHtml(m.prix)}</p>` : ''}
        ${m.texte ? `<div class="prose">${texteRiche(m.texte)}</div>` : ''}
        ${listeCoches(m.points)}
        ${/^\/[a-z0-9#-]+$/.test(m.lien || '') ? `<p class="actions"><a class="btn btn-ligne" href="${esc(m.lien)}">${esc(libelle(C, 'exp_lien'))} ${ico.fleche}</a></p>` : ''}
      </div>
    </div>
  </section>`).join('')}
  ${comparaisonHtml(C, D)}
  ${abonnementsHtml(D)}
  ${pagesListeHtml(C, D)}
  ${D.etapes.length ? `
  <section class="sec clair" aria-labelledby="t-met">
    <div class="wrap">
      <div class="sec-tete">${titreSection(libelle(C, 'methode_sur'), libelle(C, 'methode_titre_page'), 't-met')}</div>
      ${etapesHtml(D)}
    </div>
  </section>` : ''}
  ${D.lots.length ? `
  <section class="sec" aria-labelledby="t-lots">
    <div class="wrap">
      <div class="sec-tete">${titreSection(libelle(C, 'lots_sur'), libelle(C, 'lots_titre'), 't-lots')}</div>
      <ul class="lots">${D.lots.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    </div>
  </section>` : ''}`;

function pageExpertises(C, D) {
  const edition = (C.theme || {}).gabarit === 'edition';
  const ed = edition ? onglets(C, D) : null;
  return {
    classe: 'p-expertises', titre: libelle(C, 'nav_expertises'), rubrique: '/expertises', image: (D.metiers[0] || {}).photo,
    description: libelle(C, 'page_exp_description') || `Space planning, maîtrise d'œuvre et contractant général : les métiers de ${(C.agence || {}).nom || 'l’agence'}.`,
    corps: `
  <section class="tete-page${edition ? ' ch-marine' : ''}${edition && src((C.presentation || {}).photo_2, 1200) ? ' tete-duo' : ''}"><div class="wrap">
    <div class="tete-txt">
    <p class="sur">${esc(libelle(C, 'exp_sur'))}</p>
    <h1>${esc(libelle(C, 'page_exp_titre'))}</h1>
    <p class="chapo">${esc((C.agence || {}).activite || '')}${(C.agence || {}).zone ? ', ' + esc(C.agence.zone) : ''}.</p>
    ${edition ? `<nav class="ancres" aria-label="Rubriques de la page">${ed.ancres.map(([h, t]) => `<a href="#${h}">${esc(t)}</a>`).join('')}</nav>` : ''}
    </div>
    ${edition ? teteFig((C.presentation || {}).photo_2) : ''}
  </div></section>
  ${edition ? ed.html : classique(C, D)}`,
  };
}

function pageMetier(C, D, id) {
  const x = D.pages.find((p) => p.id === id);
  if (!x) return null;
  return {
    classe: 'p-metier', titre: x.titre || x.nom, rubrique: '/' + x.id, image: x.photo, description: x.description || x.accroche || '',
    jsonld: graphe(x.questions.length ? { '@type': 'FAQPage', mainEntity: x.questions.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.r } })) } : null, filAriane(C, [[x.nom, '/' + x.id]])),
    corps: `
  <section class="tete-page"><div class="wrap">
    <p class="sur">${esc(x.sur || libelle(C, 'pages_sur'))}</p>
    <h1>${esc(x.titre || x.nom)}</h1>
    ${x.accroche ? `<p class="chapo">${esc(x.accroche)}</p>` : ''}
    ${x.prix ? `<p class="metier-prix">${esc(x.prix)}</p>` : ''}
    <p class="actions">${x.demo ? `<a class="btn" href="${esc(x.demo)}"${/^https?:/.test(x.demo) ? ' target="_blank" rel="noopener"' : ''} data-ouvrir>${esc(x.demo_texte || libelle(C, 'page_demo'))} ${ico.fleche}</a>` : ''}<a class="btn btn-ligne" href="/contact">${esc(x.bouton || libelle(C, 'page_maquette'))}</a></p>
  </div></section>
  <section class="sec metier">
    <div class="wrap metier-grille">
      ${src(x.photo, 1400) ? `<figure class="metier-fig">${img(x.photo, 1400, 'metier-img', true, '')}</figure>` : feuilleHtml(x)}
      <div class="metier-txt">
        ${x.texte ? `<div class="prose">${texteRiche(x.texte)}</div>` : ''}
        ${listeCoches(x.points)}
      </div>
    </div>
  </section>
  ${x.questions.length ? `
  <section class="sec clair" aria-labelledby="t-faq">
    <div class="wrap">
      <div class="sec-tete">${titreSection(libelle(C, 'faq_sur'), libelle(C, 'faq_titre'), 't-faq')}</div>
      <div class="faq">${x.questions.map((q) => `<details><summary>${esc(q.q)}</summary><p>${esc(q.r)}</p></details>`).join('')}</div>
    </div>
  </section>` : ''}
  ${appel(C, true)}`,
  };
}

function pageRealisations(C, D, secteurId) {
  const s = secteurId ? D.secteur(secteurId) : null;
  const liste = s ? D.realisations.filter((x) => x.secteur === s.id) : D.realisations;
  return {
    classe: 'p-realisations', description: descr(C, s ? libelle(C, 'nav_realisations') + ' : ' + s.nom : libelle(C, 'nav_realisations')), titre: s ? libelle(C, 'nav_realisations') + ' : ' + s.nom : libelle(C, 'nav_realisations'), rubrique: '/realisations', image: (liste[0] && liste[0].photos[0]) || '',
    corps: `
  <section class="tete-page"><div class="wrap">
    <p class="sur">${esc(libelle(C, 'real_sur'))}</p>
    <h1>${esc(libelle(C, 'page_real_titre'))}</h1>
    ${libelle(C, 'page_real_chapo') ? `<p class="chapo">${esc(libelle(C, 'page_real_chapo'))}</p>` : ''}
    ${D.secteursUtiles.length > 1 ? `<nav class="filtres" aria-label="Filtrer par secteur"><a href="/realisations"${!s ? ' aria-current="page"' : ''}>Tout</a>${D.secteursUtiles.map((x) => `<a href="/realisations?secteur=${esc(x.id)}"${s && s.id === x.id ? ' aria-current="page"' : ''}>${esc(x.nom)}</a>`).join('')}</nav>` : ''}
  </div></section>
  <section class="sec sec-serre">
    <div class="wrap">
      ${liste.length ? `<ul class="cartes">${liste.map((x) => carte(D, x, false)).join('\n        ')}</ul>` : '<p class="vide">Aucune réalisation en ligne pour le moment.</p>'}
    </div>
  </section>
  ${appel(C, true)}`,
  };
}

function pageRealisation(C, D, id) {
  const i = D.realisations.findIndex((x) => x.id === id);
  if (i < 0) return null;
  const x = D.realisations[i], s = D.secteur(x.secteur);
  const prec = D.realisations[(i - 1 + D.realisations.length) % D.realisations.length], suiv = D.realisations[(i + 1) % D.realisations.length];
  const fiche = [['fiche_client', x.client], ['fiche_lieu', x.lieu], ['fiche_surface', x.surface], ['fiche_mission', x.mission], ['fiche_annee', x.annee], ['fiche_secteur', s && s.nom]].map(([k, v]) => [libelle(C, k), v]).filter(([, v]) => v);
  const [p0, ...autres] = x.photos;
  return {
    jsonld: graphe(filAriane(C, [[libelle(C, 'nav_realisations'), '/realisations'], [x.nom, '/realisations/' + x.id]])),
    classe: 'p-realisation', titre: x.nom, rubrique: '/realisations', image: p0, description: ((x.lien ? 'Démonstration : ' : '') + (x.accroche || `${x.nom} : ${meta(x)}`)).slice(0, 158),
    corps: `
  <section class="real-tete">
    <div class="real-fig">${p0 ? img(p0, 2200, 'real-img', true, x.nom) + illus(p0) : '<span class="sans-photo">Photos à venir</span>'}${etiquette(x)}</div>
    <div class="wrap real-titre">
      <nav class="fil" aria-label="Fil d’Ariane"><a href="/realisations">${esc(libelle(C, 'nav_realisations'))}</a>${s ? ` <span aria-hidden="true">/</span> <a href="/realisations?secteur=${esc(s.id)}">${esc(s.nom)}</a>` : ''}</nav>
      ${x.etiquette ? `<span class="etiq etiq-titre">${esc(x.etiquette)}</span>` : ''}
      <h1>${esc(x.nom)}</h1>
      ${x.accroche ? `<p class="chapo">${esc(x.accroche)}</p>` : ''}
    </div>
  </section>
  <section class="sec sec-serre">
    <div class="wrap real-grille">
      ${fiche.length ? `<dl class="fiche">${fiche.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
      <div class="real-txt">
        ${x.texte ? `<div class="prose">${texteRiche(x.texte)}</div>` : ''}
        ${x.interventions.length ? `<h2 class="h-petit">${esc(libelle(C, 'interventions'))}</h2>${listeCoches(x.interventions)}` : ''}
        ${x.lien ? `<p class="actions"><a class="btn" href="${esc(x.lien)}"${/^https?:/.test(x.lien) ? ' target="_blank" rel="noopener"' : ''} data-ouvrir>${esc(x.lien_texte || 'Ouvrir')} ${ico.fleche}</a></p>` : ''}
      </div>
    </div>
  </section>
  ${(() => { const L = D.actualites.filter((a) => a.realisation === x.id); return L.length ? `
  <section class="sec sec-serre" aria-labelledby="t-suivi">
    <div class="wrap"><h2 class="h-petit" id="t-suivi">${esc(libelle(C, 'actu_suivi'))}</h2>
      <ul class="actus">${L.map(carteActu).join('')}</ul></div>
  </section>` : ''; })()}
  ${autres.length ? `
  <section class="sec sec-serre" aria-label="Photos du projet">
    <div class="wrap"><ul class="galerie">${autres.map((u) => `<li>${img(u, 1400, 'galerie-img', false, x.nom)}${illus(u)}</li>`).join('')}</ul></div>
  </section>` : ''}
  ${D.realisations.length > 1 ? `
  <nav class="wrap suite" aria-label="Autres réalisations">
    <a href="/realisations/${esc(prec.id)}">${ico.gauche}<span><small>Précédente</small>${esc(prec.nom)}</span></a>
    <a href="/realisations/${esc(suiv.id)}"><span><small>Suivante</small>${esc(suiv.nom)}</span>${ico.fleche}</a>
  </nav>` : ''}
  ${appel(C, true)}`,
  };
}

function pageActualites(C, D) {
  return {
    classe: 'p-realisations p-actualites', description: descr(C, libelle(C, 'nav_actualites')), titre: libelle(C, 'nav_actualites'), rubrique: '/actualites', image: (D.actualites[0] && D.actualites[0].photos[0]) || '',
    corps: `
  <section class="tete-page"><div class="wrap">
    <p class="sur">${esc(libelle(C, 'actu_sur'))}</p>
    <h1>${esc(libelle(C, 'page_actu_titre'))}</h1>
    ${libelle(C, 'page_actu_chapo') ? `<p class="chapo">${esc(libelle(C, 'page_actu_chapo'))}</p>` : ''}
  </div></section>
  <section class="sec sec-serre">
    <div class="wrap">
      <ul class="actus">${D.actualites.map(carteActu).join('\n        ')}</ul>
    </div>
  </section>
  ${appel(C, true)}`,
  };
}

/* Une actualité : photos, date, texte, lien vers la réalisation liée ; données structurées « BlogPosting » pour les moteurs de recherche */
function pageActualite(C, D, id) {
  const i = D.actualites.findIndex((x) => x.id === id);
  if (i < 0) return null;
  const x = D.actualites[i], G = C.agence || {};
  const real = x.realisation ? D.realisations.find((r) => r.id === x.realisation) : null;
  const plusRecente = D.actualites[i - 1], plusAncienne = D.actualites[i + 1];
  const [p0, ...autres] = x.photos;
  const base = /^https:\/\//.test((C.reglages || {}).url || '') ? C.reglages.url.replace(/\/$/, '') : '';
  const absolue = (u) => (/^\//.test(u) ? base + u : u);
  return {
    classe: 'p-realisation p-actualite', titre: x.titre, rubrique: '/actualites', image: p0, description: extrait(x.texte, 155) || descr(C, x.titre), ogType: 'article', publie: x.date,
    jsonld: { '@context': 'https://schema.org', '@graph': [
      { '@type': 'BlogPosting', headline: String(x.titre).slice(0, 110), description: extrait(x.texte, 155) || undefined, inLanguage: 'fr-FR',
        datePublished: x.date || undefined, dateModified: x.date || undefined,
        image: x.photos.length ? x.photos.map((u) => absolue(src(u, 1600))).filter(Boolean) : undefined,
        author: { '@type': 'Organization', name: G.nom || undefined, url: base || undefined }, publisher: { '@type': 'Organization', name: G.nom || undefined, url: base || undefined },
        ...(real ? { about: { '@type': 'CreativeWork', name: real.nom, ...(base ? { url: base + '/realisations/' + real.id } : {}) } } : {}),
        ...(base ? { mainEntityOfPage: base + '/actualites/' + x.id, url: base + '/actualites/' + x.id } : {}) },
      ...(base ? [{ '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: G.nom || 'Accueil', item: base + '/' },
        { '@type': 'ListItem', position: 2, name: libelle(C, 'nav_actualites'), item: base + '/actualites' },
        { '@type': 'ListItem', position: 3, name: x.titre, item: base + '/actualites/' + x.id }] }] : []),
    ] },
    corps: `
  <section class="real-tete">
    ${p0 ? `<div class="real-fig">${img(p0, 2200, 'real-img', true, x.titre) + illus(p0)}</div>` : ''}
    <div class="wrap real-titre">
      <nav class="fil" aria-label="Fil d’Ariane"><a href="/actualites">${esc(libelle(C, 'nav_actualites'))}</a></nav>
      <h1>${esc(x.titre)}</h1>
      ${x.date ? `<p class="chapo"><time datetime="${esc(x.date)}">${esc(dateFr(x.date))}</time></p>` : ''}
    </div>
  </section>
  <section class="sec sec-serre">
    <div class="wrap real-grille">
      <div class="real-txt">
        ${x.texte ? `<div class="prose">${texteRiche(x.texte)}</div>` : ''}
        ${real ? `<p class="actions"><a class="btn" href="/realisations/${esc(real.id)}">${esc(libelle(C, 'actu_lien_real'))} : ${esc(real.nom)} ${ico.fleche}</a></p>` : ''}
      </div>
    </div>
  </section>
  ${autres.length ? `
  <section class="sec sec-serre" aria-label="Photos">
    <div class="wrap"><ul class="galerie">${autres.map((u) => `<li>${img(u, 1400, 'galerie-img', false, x.titre)}${illus(u)}</li>`).join('')}</ul></div>
  </section>` : ''}
  ${plusRecente || plusAncienne ? `
  <nav class="wrap suite" aria-label="Autres actualités">
    ${plusAncienne ? `<a href="/actualites/${esc(plusAncienne.id)}">${ico.gauche}<span><small>Plus ancienne</small>${esc(plusAncienne.titre)}</span></a>` : '<span></span>'}
    ${plusRecente ? `<a href="/actualites/${esc(plusRecente.id)}"><span><small>Plus récente</small>${esc(plusRecente.titre)}</span>${ico.fleche}</a>` : ''}
  </nav>` : ''}
  ${appel(C, true)}`,
  };
}

function pageAgence(C, D) {
  const P = C.presentation || {}, Gr = C.garanties || {}, G = C.agence || {};
  const gpts = (Array.isArray(Gr.points) ? Gr.points : []).filter(Boolean);
  return {
    classe: 'p-agence', description: descr(C, P.titre || libelle(C, 'nav_agence')), titre: P.titre || libelle(C, 'nav_agence'), rubrique: '/agence', image: P.photo,
    corps: `
  <section class="tete-page"><div class="wrap">
    <p class="sur">${esc(G.nom || '')}</p>
    <h1>${esc(P.titre || libelle(C, 'nav_agence'))}</h1>
  </div></section>
  <section class="sec sec-serre">
    <div class="wrap agence-grille">
      ${((C.equipe || [])[0] || {}).nom ? `<div class="agence-qui">${src(P.photo, 400) ? img(P.photo, 400, 'avatar avatar-grand', true, 'Portrait de ' + C.equipe[0].nom, '88px') : ''}<p><b>${esc(C.equipe[0].nom)}</b>${C.equipe[0].role ? `<span>${esc(C.equipe[0].role)}</span>` : ''}</p></div>` : ''}
      <div class="prose prose-grande">${texteRiche(P.texte)}</div>
      ${D.engagements.length ? `<p class="eng-lien"><a class="lien" href="/engagements">${esc(libelle(C, 'eng_lien'))} ${ico.fleche}</a></p>` : ''}
    </div>
  </section>
  ${src(P.photo_2, 1600) ? `<section class="sec sec-serre agence-bande"><div class="wrap"><figure>${img(P.photo_2, 1600, 'bande-img', false, '')}</figure></div></section>` : ''}
  ${D.equipe.length > 1 ? `
  <section class="sec" aria-labelledby="t-eq">
    <div class="wrap">
      <div class="sec-tete">${titreSection(libelle(C, 'equipe_sur'), libelle(C, 'equipe_titre'), 't-eq')}</div>
      <ul class="equipe">${D.equipe.map((p) => `<li>${src(p.photo, 600) ? img(p.photo, 600, 'portrait', false, p.nom) : `<span class="portrait portrait-vide" aria-hidden="true">${esc(initiales(p.nom))}</span>`}<b>${esc(p.nom)}</b>${p.role ? `<span>${esc(p.role)}</span>` : ''}</li>`).join('')}</ul>
    </div>
  </section>` : ''}
  ${D.references.length ? `
  <section class="sec clair" aria-labelledby="t-refs">
    <div class="wrap">
      <div class="sec-tete">${titreSection(libelle(C, 'refs_sur'), libelle(C, 'refs_titre'), 't-refs')}</div>
      ${referencesHtml(D)}
    </div>
  </section>` : ''}
  ${appel(C, true)}`,
  };
}

function pageContact(C, D) {
  const G = C.agence || {}, K = C.contact || {};
  const types = (Array.isArray(K.types) ? K.types : []).filter(Boolean);
  const formules = [...D.metiers.map((m) => ({ id: m.id, nom: m.nom, prix: m.prix })), ...(D.abonnements ? D.abonnements.formules.filter((f) => f.id !== 'sans-abonnement').map((f) => ({ id: f.id, nom: 'Abonnement ' + f.nom, prix: f.prix ? f.prix + ' / mois' : '' })) : [])];
  const L = (k) => libelle(C, k);
  const carte = G.adresse ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([G.nom, G.adresse, G.code_postal, G.ville].filter(Boolean).join(' '))}` : '';
  return {
    classe: 'p-contact', description: descr(C, 'Contact'), titre: 'Contact', rubrique: '/contact',
    corps: `
  <section class="tete-page${src((C.accueil || {}).photo_fond, 1200) ? ' tete-duo' : ''}"><div class="wrap">
    <div class="tete-txt">
    <p class="sur">Contact</p>
    <h1>${esc(libelle(C, 'contact_titre'))}</h1>
    <p class="chapo">${esc(libelle(C, 'contact_chapo'))}${K.delai_reponse ? ' Nous vous répondons sous ' + esc(K.delai_reponse) + '.' : ''}</p>
    </div>
    ${teteFig((C.accueil || {}).photo_fond)}
  </div></section>
  <section class="sec sec-serre">
    <div class="wrap contact-grille">
      ${K.actif === false ? `<div class="demande"><p>Le formulaire est fermé pour le moment : appelez-nous ou écrivez-nous.</p></div>` : `<form class="demande" id="demande" method="post" novalidate>
        <div class="champs">
          <div class="champ"><label for="d-nom">Nom et prénom</label><input class="saisie" id="d-nom" name="nom" autocomplete="name" required></div>
          ${L('form_societe') ? `<div class="champ"><label for="d-soc">${esc(L('form_societe'))} <span class="fac">(facultatif)</span></label><input class="saisie" id="d-soc" name="societe" autocomplete="organization"></div>` : ''}
          <p class="champ large champ-note" id="d-joindre">Pour vous répondre : un e-mail <b>ou</b> un téléphone suffit.</p>
          <div class="champ"><label for="d-tel">Téléphone</label><input class="saisie" id="d-tel" name="telephone" type="tel" autocomplete="tel" inputmode="tel" aria-describedby="d-joindre"></div>
          <div class="champ"><label for="d-mail">E-mail</label><input class="saisie" id="d-mail" name="email" type="email" autocomplete="email" aria-describedby="d-joindre"></div>
          ${formules.length ? `<fieldset class="champ large formules"><legend>Formule(s) qui vous intéressent <span class="fac">(facultatif)</span></legend><div class="formules-liste">${formules.map((f) => `<label class="formule"><input type="checkbox" name="formule" value="${esc(f.nom)}" data-id="${esc(f.id)}"><span>${esc(f.nom)}${f.prix ? ` <small>${esc(String(f.prix).split('|')[0].trim())}</small>` : ''}</span></label>`).join('')}</div></fieldset>` : ''}
          ${types.length && L('form_type') ? `<div class="champ"><label for="d-type">${esc(L('form_type'))} <span class="fac">(facultatif)</span></label><select class="saisie" id="d-type" name="type"><option value="">Choisir</option>${types.map((t) => `<option>${esc(t)}</option>`).join('')}</select></div>` : ''}
          ${L('form_surface') ? `<div class="champ"><label for="d-surf">${esc(L('form_surface'))} <span class="fac">(facultatif)</span></label><input class="saisie" id="d-surf" name="surface" placeholder="${esc(L('form_surface_exemple'))}"></div>` : ''}
          ${L('form_ville') ? `<div class="champ large"><label for="d-ville">${esc(L('form_ville'))} <span class="fac">(facultatif)</span></label><input class="saisie" id="d-ville" name="ville" autocomplete="address-level2"></div>` : ''}
          <div class="champ large"><label for="d-msg">${esc(L('form_message'))} <span class="fac">(facultatif)</span></label><textarea class="saisie" id="d-msg" name="message" rows="6" placeholder="${esc(L('form_message_exemple'))}"></textarea></div>
        </div>
        <input type="checkbox" name="botcheck" class="piege" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="demande-erreur" role="alert" hidden></p>
        <button class="btn" type="button" data-envoyer>${esc(L('form_envoyer'))}</button>
        <p class="note">Ces informations servent uniquement à répondre à votre demande. Responsable : ${esc(((C.mentions || {}).raison_sociale) || G.nom || '')}. Conservation : 180 jours au plus. Vos droits et la réclamation auprès de la CNIL : <a href="/confidentialite">politique de confidentialité</a>.</p>
      </form>
      <div class="demande-ok" tabindex="-1" hidden></div>`}
      <aside class="coord" aria-label="Coordonnées">
        <h2>${esc(G.nom || '')}</h2>
        <ul>
          ${G.adresse ? `<li><small>Adresse</small>${esc(G.adresse)}<br>${esc([G.code_postal, G.ville].filter(Boolean).join(' '))}${carte ? `<br><a href="${esc(carte)}" target="_blank" rel="noopener">Itinéraire</a>` : ''}</li>` : ''}
          ${G.telephone ? `<li><small>Téléphone</small><a href="${telHref(G.telephone)}">${esc(G.telephone)}</a></li>` : ''}
          ${G.email ? `<li><small>E-mail</small><a href="mailto:${esc(G.email)}">${esc(G.email)}</a></li>` : ''}
          ${G.zone ? `<li><small>Zone d’intervention</small>${esc(G.zone)}</li>` : ''}
        </ul>
      </aside>
    </div>
  </section>`,
  };
}

function pageEngagements(C, D) {
  const G = C.agence || {};
  const chapo = libelle(C, 'page_eng_chapo');
  return {
    classe: 'p-engagements', titre: libelle(C, 'nav_engagements'), rubrique: '/engagements', description: chapo || `Hébergement, données personnelles, sauvegardes, délais de réponse : les engagements de ${G.nom || 'l’agence'}.`,
    corps: `
  <section class="tete-page"><div class="wrap">
    <p class="sur">${esc(libelle(C, 'eng_sur'))}</p>
    <h1>${esc(libelle(C, 'page_eng_titre'))}</h1>
    ${chapo ? `<p class="chapo">${esc(chapo)}</p>` : ''}
  </div></section>
  ${(C.theme || {}).gabarit === 'edition' ? `<section class="sec sec-serre"><div class="wrap eng-vols">${D.engagements.map((b) => `<details class="offre eng-vol" id="${esc(b.id)}"><summary><span class="offre-tete"><h2>${esc(b.titre)}</h2></span></summary><div class="offre-corps eng-corps"><div class="metier-txt">${b.texte ? `<div class="prose">${texteRiche(b.texte)}</div>` : ''}${listeCoches(b.points)}</div></div></details>`).join('')}</div></section>` : `<section class="sec sec-serre">
    <div class="wrap eng-grille">
      <nav class="eng-index" aria-label="${esc(libelle(C, 'eng_index'))}"><p class="sur">${esc(libelle(C, 'eng_index'))}</p><ol>${D.engagements.map((b) => `<li><a href="#${esc(b.id)}">${esc(b.titre)}</a></li>`).join('')}</ol></nav>
      <div class="eng-blocs">
        ${D.engagements.map((b, i) => `<section class="eng-bloc" id="${esc(b.id)}" aria-labelledby="t-${esc(b.id)}"><span class="eng-num" aria-hidden="true">${num(i)}</span><h2 id="t-${esc(b.id)}">${esc(b.titre)}</h2>${b.texte ? `<div class="prose">${texteRiche(b.texte)}</div>` : ''}${listeCoches(b.points)}</section>`).join('\n        ')}
      </div>
    </div>
  </section>`}
  ${appel(C, true)}`,
  };
}

function pageMentions(C) {
  const M = C.mentions || {}, G = C.agence || {};
  const k = (v) => (v ? esc(v) : '<em>à compléter</em>');
  return {
    classe: 'p-texte', description: descr(C, 'Mentions légales'), titre: 'Mentions légales',
    corps: `
  <section class="tete-page"><div class="wrap"><h1>Mentions légales</h1></div></section>
  <section class="sec sec-serre"><div class="wrap prose">
    <h2>Éditeur du site</h2>
    <p>${k(M.raison_sociale)}${M.forme ? ', ' + esc(M.forme) : ''}${M.nom_commercial ? '<br>Nom commercial : ' + esc(M.nom_commercial) : ''}<br>${esc(libelle(C, 'mentions_siege'))} : ${k(M.adresse)}<br>${esc(libelle(C, 'mentions_immatriculation'))} : ${k(M.rcs)}${M.tva ? '<br>' + esc(M.tva) : ''}<br>Directeur de la publication : ${k(M.directeur_publication)}<br>Contact : ${k(M.email || G.email)}${G.telephone ? ', ' + esc(G.telephone) : ''}</p>
    <h2>Hébergement</h2>
    <p>Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, États-Unis. Téléphone : ${k(M.hebergeur_telephone)}.</p>
    ${M.mediateur ? `<h2>Médiation de la consommation</h2><p>${esc(M.mediateur)}</p>` : ''}
    <h2>Utilisation du site</h2>
    <p>Les textes, images, vignettes et démonstrations de ce site sont la propriété de ${esc(M.raison_sociale || G.nom || 'l’éditeur')} ou utilisés avec l’accord de leurs auteurs ; toute reproduction sans accord est interdite. Les démonstrations sont des sites imaginaires : elles ne montrent aucun vrai client, et ce que vous y modifiez reste dans votre navigateur. Les informations du site sont données à titre indicatif ; les prix et conditions applicables sont ceux du devis signé.</p>
    <h2>Photos</h2>
    <p>${esc(C.credits_photos || 'Photos : ' + (G.nom || ''))}</p>
  </div></section>`,
  };
}

function pageConfidentialite(C) {
  const K = C.contact || {}, G = C.agence || {}, M = C.mentions || {};
  const resp = esc(M.raison_sociale || G.nom || 'l’éditeur du site');
  const mail = M.email || G.email || '';
  const joindre = mail ? `<a href="mailto:${esc(mail)}">${esc(mail)}</a>` : '<em>adresse e-mail à compléter</em>';
  return {
    classe: 'p-texte', description: descr(C, 'Politique de confidentialité et cookies'), titre: 'Confidentialité',
    corps: `
  <section class="tete-page"><div class="wrap"><h1>Confidentialité</h1></div></section>
  <section class="sec sec-serre"><div class="wrap prose">
    <h2>Qui est responsable</h2>
    <p>${resp}${M.adresse ? ', ' + esc(M.adresse) : ''}. Contact pour vos données : ${joindre}${G.telephone ? ', ' + esc(G.telephone) : ''}.</p>
    <h2 id="cookies">Cookies</h2>
    <p>Le site ne dépose aucun cookie sur les pages publiques, ni de mesure d’audience, ni de publicité, ni de réseau social. Il ne charge aucun script ni aucune police venant d’un autre site. Il n’y a donc pas de bandeau à accepter ou à refuser. Un seul cookie technique existe, réservé à la page de modification du site (connexion de l’éditeur) ; il est exempté de consentement et n’est déposé qu’après une connexion.</p>
    <h2>La mesure des visites</h2>
    <p>Le site compte les pages vues, jour par jour : combien de visites, quelles pages, et d’où l’on vient (moteur de recherche, autre site, adresse tapée). Il n’enregistre ni adresse IP, ni identifiant, et ne dépose rien dans votre navigateur : un visiteur ne peut pas être reconnu d’un jour à l’autre. Ces totaux ne servent qu’à savoir quelles pages sont utiles (intérêt légitime ; aucune donnée personnelle n’est gardée).</p>
    <h2>Les demandes de contact</h2>
    <p><b>Données :</b> nom, téléphone ou e-mail (l’un des deux suffit), et, si vous le souhaitez, société, type de demande, type de site, ville et message.</p>
    <p><b>Pourquoi :</b> répondre à votre demande (mesures précontractuelles, art. 6.1.b du RGPD) et, si vous devenez client, suivre la relation (contrat). Ces données ne servent ni à la prospection ni à de la revente.</p>
    <p><b>Qui les reçoit :</b> ${resp}${K.cle_web3forms ? ' ; le service Web3Forms transmet la demande par e-mail' : ''}. Elles sont enregistrées dans la mémoire du site (hébergée par Cloudflare) et peuvent être traitées par ses prestataires techniques (hébergement, e-mail, notifications).</p>
    <p><b>Combien de temps :</b> 180 jours au plus après la demande, sauf si un contrat est conclu (les données utiles sont alors gardées pour la durée du contrat puis selon les obligations légales).</p>${K.traitement ? `\n    <p>${esc(K.traitement)}</p>` : ''}
    <p><b>Hors de l’Union européenne :</b> Cloudflare est une société américaine ; ses serveurs peuvent être situés hors de l’Union européenne. Les transferts sont encadrés par les garanties prévues par le RGPD (clauses contractuelles types ou décision d’adéquation).</p>
    <h2>Vos droits</h2>
    <p>Vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou la portabilité de vos données, et vous opposer à leur traitement, en écrivant à ${joindre}. Une réponse vous est donnée dans un délai d’un mois. Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL (<a href="https://www.cnil.fr/fr/plaintes" rel="noopener">cnil.fr/fr/plaintes</a>).</p>
  </div></section>`,
  };
}

function page404() {
  return { classe: 'p-texte', titre: 'Page introuvable', corps: `
  <section class="tete-page"><div class="wrap">
    <h1>Page introuvable</h1>
    <p class="chapo">Cette page n’existe pas ou plus.</p>
    <p class="actions"><a class="btn" href="/">Retour à l’accueil</a> <a class="btn btn-ligne" href="/realisations">Réalisations</a></p>
  </div></section>` };
}

/* Toutes les adresses du site (plan du site, démonstration, tests) */
export function routes(C) {
  const D = donnees(C);
  return ['/', '/expertises', '/realisations', ...(D.secteursUtiles.length > 1 ? D.secteursUtiles.map((s) => '/realisations?secteur=' + s.id) : []),
    ...D.realisations.map((x) => '/realisations/' + x.id), ...(D.actualites.length ? ['/actualites', ...D.actualites.map((x) => '/actualites/' + x.id)] : []), '/agence', ...(D.engagements.length ? ['/engagements'] : []), '/contact', '/mentions-legales', '/confidentialite', ...D.pages.map((x) => '/' + x.id)];
}

/* Rend une adresse : { statut, html } */
export function rendrePage(C, chemin, o = {}) {
  const D = donnees(C);
  const [p0, requete = ''] = String(chemin || '/').split('?');
  let p = '/';
  try { p = decodeURI(p0).replace(/\/+$/, '') || '/'; } catch (e) { p = '/__'; }
  const secQ = (new URLSearchParams(requete).get('secteur') || '').slice(0, 60);
  let page = null, m;
  if (p === '/') page = accueil(C, D);
  else if (p === '/expertises') page = pageExpertises(C, D);
  else if (p === '/realisations') page = pageRealisations(C, D, D.secteur(secQ) ? secQ : '');
  else if ((m = p.match(/^\/realisations\/([a-z0-9-]+)$/))) page = pageRealisation(C, D, m[1]);
  else if (p === '/actualites' && D.actualites.length) page = pageActualites(C, D);
  else if ((m = p.match(/^\/actualites\/([a-z0-9-]+)$/))) page = pageActualite(C, D, m[1]);
  else if (p === '/agence') page = pageAgence(C, D);
  else if (p === '/engagements' && D.engagements.length) page = pageEngagements(C, D);
  else if (p === '/contact') page = pageContact(C, D);
  else if (p === '/mentions-legales') page = pageMentions(C);
  else if (p === '/confidentialite') page = pageConfidentialite(C);
  else if ((m = p.match(/^\/([a-z0-9-]{3,60})$/))) page = pageMetier(C, D, m[1]);
  const statut = page ? 200 : 404;
  return { statut, html: document_(C, o, page ? { ...page, chemin: p } : page404()) };
}

/* Flux RSS des actualités (/actualites.xml) : les 20 plus récentes ; lu par les lecteurs de flux, Bing, et accepté comme plan du site par la Search Console */
export function fluxRss(C, origine) {
  const D = donnees(C), G = C.agence || {}, base = baseSite(C) || String(origine || '').replace(/\/$/, '');
  const x = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  const items = D.actualites.slice(0, 20).map((a) => `<item><title>${x(a.titre)}</title><link>${base}/actualites/${a.id}</link><guid isPermaLink="true">${base}/actualites/${a.id}</guid>${a.date ? `<pubDate>${new Date(a.date + 'T08:00:00Z').toUTCString()}</pubDate>` : ''}<description>${x(extrait(a.texte, 300))}</description></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${x(libelle(C, 'nav_actualites') + ', ' + (G.nom || ''))}</title><link>${base}/actualites</link><atom:link href="${base}/actualites.xml" rel="self" type="application/rss+xml"/><description>${x(G.description_google || libelle(C, 'nav_actualites'))}</description><language>fr-FR</language>${items}</channel></rss>`;
}
