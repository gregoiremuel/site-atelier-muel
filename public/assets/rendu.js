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
  bouton_principal: 'Parler de votre projet', bouton_appel: 'Décrire mon projet', bouton_realisations: 'Voir les réalisations',
  appel_titre: 'Parlons de votre projet', intro_lien: 'L’agence',
  exp_sur: 'Expertises', exp_titre: 'Trois métiers, un seul interlocuteur', exp_lien: 'En détail',
  real_sur: 'Réalisations', real_titre: 'Des projets livrés', real_tout: 'Toutes les réalisations',
  essai_sur: 'À essayer',
  methode_sur: 'Méthode', methode_titre: 'Du premier rendez-vous à la réception', methode_titre_page: 'Trois étapes, un seul responsable',
  refs_sur: 'Références', refs_titre: 'Ils nous ont confié leurs locaux',
  page_exp_titre: 'Concevoir, coordonner, livrer', page_exp_description: '',
  lots_sur: 'Tous corps d’état', lots_titre: 'Les travaux que nous coordonnons',
  page_real_titre: 'Des locaux transformés',
  fiche_client: 'Client', fiche_lieu: 'Lieu', fiche_surface: 'Surface', fiche_mission: 'Mission', fiche_annee: 'Année', fiche_secteur: 'Secteur', interventions: 'Interventions',
  garanties_sur: 'Garanties', garanties_titre: 'Nos engagements', eng_sur: 'Engagements', page_eng_titre: 'Hébergement, données, sauvegardes', page_eng_chapo: '', eng_index: 'Sur cette page', eng_lien: 'Voir tous les engagements', equipe_sur: 'L’équipe', equipe_titre: 'Vos interlocuteurs',
  contact_titre: 'Parlons de votre projet', contact_chapo: 'Quelques lignes sur vos locaux, vos délais et votre budget suffisent pour commencer.',
  form_societe: 'Société', form_type: 'Type de locaux', form_surface: 'Surface approximative', form_surface_exemple: 'Ex. : 300 m²', form_ville: 'Ville du projet',
  form_message: 'Votre projet', form_message_exemple: 'Rénovation, aménagement, déménagement, délais souhaités…', form_envoyer: 'Envoyer la demande',
  pied_trouver: 'Nous trouver', pied_joindre: 'Nous joindre',
  mentions_immatriculation: 'RCS', mentions_siege: 'Siège',
  type_schema: 'GeneralContractor', bandeau_maquette: '',
  pages_sur: 'Par métier', pages_titre: 'Un site pensé pour votre métier', page_demo: 'Essayer la démonstration', page_maquette: 'Demander ma maquette gratuite', faq_sur: 'Questions', faq_titre: 'Les questions qu’on me pose', pied_metiers: 'Par métier',
  comparaison_sur: 'Comparer', comparaison_titre: 'Un constructeur en ligne ou moi ?',
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
  const formules = AB && Array.isArray(AB.formules) ? AB.formules.filter((f) => f && f.nom).map((f) => ({ ...f, points: (Array.isArray(f.points) ? f.points : []).filter(Boolean) })) : [];
  const abonnements = formules.length ? { titre: AB.titre || '', intro: AB.intro || '', note: AB.note || '', formules } : null;
  /* Pages par métier (clé facultative « pages_metier ») : une adresse /id par métier, avec sa démonstration, ses questions et son prix de départ */
  const pages = pagesMetier(C);
  /* Comparaison avec un constructeur en ligne (clé facultative « comparaison ») */
  const CP = C.comparaison && typeof C.comparaison === 'object' && !Array.isArray(C.comparaison) ? C.comparaison : null;
  const lignesCp = CP && Array.isArray(CP.lignes) ? CP.lignes.filter((l) => l && l.critere && l.a && l.b) : [];
  const colsCp = CP && Array.isArray(CP.colonnes) && CP.colonnes.length === 2 && CP.colonnes.every((c) => typeof c === 'string' && c.trim()) ? CP.colonnes : null;
  const comparaison = CP && lignesCp.length && colsCp ? { sur: CP.sur || '', titre: CP.titre || '', intro: CP.intro || '', note: CP.note || '', colonnes: colsCp, lignes: lignesCp } : null;
  return { secteurs, secteursUtiles, realisations, metiers, etapes, equipe, references, chiffres, lots, secteur, abonnements, engagements, pages, comparaison };
}

/* Adresses qu'une page par métier ne peut pas prendre */
export const ADRESSES_RESERVEES = ['expertises', 'realisations', 'agence', 'engagements', 'contact', 'mentions-legales', 'confidentialite', 'admin', 'api', 'assets', 'fonts', 'photos', 'videos', 'demos'];
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
function img(p, largeur, cls, prio, alt) {
  const s = src(p, largeur);
  return s ? `<img class="${cls}" src="${esc(s)}" alt="${esc(alt || '')}" ${prio ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">` : '';
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
function appel(C) {
  const A = C.accueil || {}, G = C.agence || {};
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
  const theme = `${cssPolices(o.urlPolice || ((f) => '/fonts/' + f), gabarit === 'classique' ? 'agence' : gabarit)}\n:root{--fond:${hex(T.fond, '#f7f5f0')};--encre:${hex(T.encre, '#15172e')};--gris:${hex(T.gris, '#585b70')};--trait:${hex(T.trait, '#e2ded4')};--marine:${hex(T.marine, '#262a59')};--or:${hex(T.or, '#f8c151')}}`;
  const style = o.css != null ? `<style>\n${o.css}\n${theme}\n</style>` : `<link rel="stylesheet" href="${o.cssHref || '/assets/site.css'}">\n<style>${theme}</style>`;
  const marque = src(G.nom_image, 600) ? `<img src="${esc(src(G.nom_image, 600))}" alt="${esc(nom)}">` : esc(nom);
  const marqueClaire = src(G.nom_image_blanc, 600) ? `<img src="${esc(src(G.nom_image_blanc, 600))}" alt="${esc(nom)}">` : esc(nom);
  const avecEngagements = Array.isArray(C.engagements) && C.engagements.some((e) => e && e.titre);
  const nav = [['/expertises', libelle(C, 'nav_expertises')], ['/realisations', libelle(C, 'nav_realisations')], ['/agence', libelle(C, 'nav_agence')], ...(avecEngagements ? [['/engagements', libelle(C, 'nav_engagements')]] : [])].map(([h, t]) => [h, esc(t)]);
  const actif = (h) => (page.rubrique === h ? ' aria-current="page"' : '');
  const reseaux = [['linkedin', 'LinkedIn'], ['instagram', 'Instagram']].filter(([k]) => /^https:\/\//.test(G[k] || ''));
  const AG = {
    nom, api: o.apiContact || '', maquette: !!o.maquette, apercu: !!o.apercu, cle: K.cle_web3forms || '', email: K.email || G.email || '',
    actif: K.actif !== false, confirmation: String(K.confirmation || 'Merci, votre demande est bien partie.'),
    lib: libellesDemande(C),
  };
  const donneesJs = `var AGENCE=${JSON.stringify(AG).replace(/</g, '\\u003c')};`;
  const scripts = o.js != null ? `<script>\n${donneesJs}\n${o.js}\n</script>` : `<script>${donneesJs}</script>\n<script src="${o.jsHref || '/assets/site.js'}" defer></script>`;
  const titre = page.titre ? `${page.titre}, ${nom}` : `${nom}, ${G.activite || ''}`.replace(/, $/, '');
  const desc = page.description || G.description_google || '';

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(desc)}">
${o.maquette ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:title" content="${esc(titre)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
${page.image && src(page.image, 1200) ? `<meta property="og:image" content="${esc(src(page.image, 1200))}">` : ''}
<meta name="theme-color" content="${hex(T.fond, '#f7f5f0')}">
<link rel="icon" href="${esc(favicon(C))}">
${style}
</head>
<body class="${page.classe || ''}${gabarit === 'studio' ? ' g-studio' : gabarit === 'edition' ? ' g-edition' : ''}${o.calme ? ' calme' : ''}">
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
      ${o.lienAdmin ? `<a href="${o.lienAdmin}">Page de modification</a>` : ''}
      <span>© ${new Date().getFullYear()} ${esc(nom)}</span>
      ${C.credits_photos ? `<span class="credits">${esc(C.credits_photos)}</span>` : ''}
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
      <span class="carte-img">${x.photos[0] ? img(x.photos[0], grande ? 1600 : 1000, 'carte-photo', false, '') + illus(x.photos[0]) : '<span class="sans-photo">Photos à venir</span>'}${etiquette(x)}</span>
      <span class="carte-txt"><span class="carte-sec">${esc((D.secteur(x.secteur) || {}).nom || '')}</span><span class="carte-nom">${esc(x.nom)}</span>${meta(x) ? `<span class="carte-meta">${esc(meta(x))}</span>` : ''}</span>
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
        </li>`).join('\n        ')}
      </ul>
      ${A.note ? `<p class="abo-note">${esc(A.note)}</p>` : ''}
      <div class="actions"><a class="btn btn-or" href="/contact">${esc(libelle({}, 'bouton_appel'))}</a></div>
    </div>
  </section>`;
};
const comparaisonHtml = (C, D) => {
  const K = D.comparaison;
  if (!K) return '';
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
    jsonld: { '@context': 'https://schema.org', '@type': libelle(C, 'type_schema'), name: G.nom, description: G.description_google || '', telephone: G.telephone || undefined, email: G.email || undefined,
      address: G.adresse ? { '@type': 'PostalAddress', streetAddress: G.adresse, postalCode: G.code_postal, addressLocality: G.ville, addressCountry: 'FR' } : undefined,
      areaServed: G.zone || undefined, ...((C.reglages || {}).url ? { url: C.reglages.url } : {}), sameAs: ['linkedin', 'instagram'].map((k) => G[k]).filter((u) => /^https:\/\//.test(u || '')) },
    corps: `
  <section class="hero">
    ${video ? videoFond(video, src(A.photo, 2200), 'hero-media') : img(A.photo, 2400, 'hero-media', true, '')}
    <div class="hero-txt wrap">
      ${A.sur_titre ? `<p class="sur sur-clair">${esc(A.sur_titre)}</p>` : ''}
      <h1>${esc(A.titre || G.nom)}</h1>
      ${A.texte ? `<p class="hero-chapo">${esc(A.texte)}</p>` : ''}
      <div class="actions">
        <a class="btn btn-or" href="/contact">${esc(libelle(C, 'bouton_principal'))}</a>
        ${D.realisations.length ? `<a class="btn btn-ligne-clair" href="/realisations">${esc(libelle(C, 'bouton_realisations'))}</a>` : ''}
      </div>
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
      <ul class="essai-liens">${essais.map((x) => `<li><a href="${esc(x.lien)}"${/^https?:/.test(x.lien) ? ' target="_blank" rel="noopener"' : ''} data-ouvrir>${x.apercu || x.photos[0] ? `<span class="essai-vue">${img(x.apercu || x.photos[0], 900, 'essai-img', false, '')}</span>` : ''}<span class="essai-corps"><b>${esc(x.nom)}</b>${x.accroche ? `<small>${esc(x.accroche)}</small>` : ''}</span><span class="essai-act">${esc(x.lien_texte || 'Ouvrir')} ${ico.fleche}</span></a></li>`).join('')}</ul>
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
  ${D.etapes.length ? `
  <section class="sec clair" aria-labelledby="t-met">
    <div class="wrap">
      <div class="sec-tete">${titreSection(libelle(C, 'methode_sur'), libelle(C, 'methode_titre'), 't-met')}</div>
      ${etapesHtml(D)}
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

/* Gabarit « édition » : chaque offre est un volet (nom, accroche et prix toujours visibles ; le détail s'ouvre) */
const offreVolet = (C, m, i, ouvert) => `
      <details class="offre" id="${esc(m.id)}"${ouvert ? ' open' : ''}>
        <summary><span class="metier-num">${num(i)}</span><span class="offre-tete"><h2>${esc(m.nom)}</h2>${m.accroche ? `<span class="offre-accroche">${esc(m.accroche)}</span>` : ''}</span>${m.prix ? `<span class="metier-prix">${prixHtml(m.prix)}</span>` : ''}</summary>
        <div class="offre-corps">
          ${src(m.photo, 1400) ? `<figure class="metier-fig">${img(m.photo, 1400, 'metier-img', false, '')}</figure>` : ''}
          <div class="metier-txt">
            ${m.texte ? `<div class="prose">${texteRiche(m.texte)}</div>` : ''}
            ${listeCoches(m.points)}
            ${/^\/[a-z0-9#-]+$/.test(m.lien || '') ? `<p class="actions"><a class="btn btn-ligne" href="${esc(m.lien)}">${esc(libelle(C, 'exp_lien'))} ${ico.fleche}</a></p>` : ''}
          </div>
        </div>
      </details>`;

function pageExpertises(C, D) {
  const edition = (C.theme || {}).gabarit === 'edition';
  return {
    classe: 'p-expertises', titre: libelle(C, 'nav_expertises'), rubrique: '/expertises', image: (D.metiers[0] || {}).photo,
    description: libelle(C, 'page_exp_description') || `Space planning, maîtrise d'œuvre et contractant général : les métiers de ${(C.agence || {}).nom || 'l’agence'}.`,
    corps: `
  <section class="tete-page wrap">
    <p class="sur">${esc(libelle(C, 'exp_sur'))}</p>
    <h1>${esc(libelle(C, 'page_exp_titre'))}</h1>
    <p class="chapo">${esc((C.agence || {}).activite || '')}${(C.agence || {}).zone ? ', ' + esc(C.agence.zone) : ''}.</p>
  </section>
  ${edition ? `<section class="sec sec-serre offres" aria-label="${esc(libelle(C, 'page_exp_titre'))}"><div class="wrap">${D.metiers.map((m, i) => offreVolet(C, m, i, false)).join('')}</div></section>` : D.metiers.map((m, i) => `
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
  </section>` : ''}
  ${appel(C)}`,
  };
}

function pageMetier(C, D, id) {
  const x = D.pages.find((p) => p.id === id);
  if (!x) return null;
  return {
    classe: 'p-metier', titre: x.titre || x.nom, rubrique: '/' + x.id, image: x.photo, description: x.description || x.accroche || '',
    jsonld: x.questions.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: x.questions.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.r } })) } : undefined,
    corps: `
  <section class="tete-page wrap">
    <p class="sur">${esc(x.sur || libelle(C, 'pages_sur'))}</p>
    <h1>${esc(x.titre || x.nom)}</h1>
    ${x.accroche ? `<p class="chapo">${esc(x.accroche)}</p>` : ''}
    ${x.prix ? `<p class="metier-prix">${esc(x.prix)}</p>` : ''}
    <p class="actions">${x.demo ? `<a class="btn" href="${esc(x.demo)}"${/^https?:/.test(x.demo) ? ' target="_blank" rel="noopener"' : ''} data-ouvrir>${esc(x.demo_texte || libelle(C, 'page_demo'))} ${ico.fleche}</a>` : ''}<a class="btn btn-ligne" href="/contact">${esc(x.bouton || libelle(C, 'page_maquette'))}</a></p>
  </section>
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
  ${appel(C)}`,
  };
}

function pageRealisations(C, D, secteurId) {
  const s = secteurId ? D.secteur(secteurId) : null;
  const liste = s ? D.realisations.filter((x) => x.secteur === s.id) : D.realisations;
  return {
    classe: 'p-realisations', titre: s ? libelle(C, 'nav_realisations') + ' : ' + s.nom : libelle(C, 'nav_realisations'), rubrique: '/realisations', image: (liste[0] && liste[0].photos[0]) || '',
    corps: `
  <section class="tete-page wrap">
    <p class="sur">${esc(libelle(C, 'real_sur'))}</p>
    <h1>${esc(libelle(C, 'page_real_titre'))}</h1>
    ${D.secteursUtiles.length > 1 ? `<nav class="filtres" aria-label="Filtrer par secteur"><a href="/realisations"${!s ? ' aria-current="page"' : ''}>Tout</a>${D.secteursUtiles.map((x) => `<a href="/realisations?secteur=${esc(x.id)}"${s && s.id === x.id ? ' aria-current="page"' : ''}>${esc(x.nom)}</a>`).join('')}</nav>` : ''}
  </section>
  <section class="sec sec-serre">
    <div class="wrap">
      ${liste.length ? `<ul class="cartes">${liste.map((x) => carte(D, x, false)).join('\n        ')}</ul>` : '<p class="vide">Aucune réalisation en ligne pour le moment.</p>'}
    </div>
  </section>
  ${appel(C)}`,
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
    classe: 'p-realisation', titre: x.nom, rubrique: '/realisations', image: p0, description: x.accroche || `${x.nom} : ${meta(x)}`,
    corps: `
  <section class="real-tete">
    <div class="real-fig">${p0 ? img(p0, 2200, 'real-img', true, x.nom) + illus(p0) : '<span class="sans-photo">Photos à venir</span>'}${etiquette(x)}</div>
    <div class="wrap real-titre">
      <nav class="fil" aria-label="Fil d’Ariane"><a href="/realisations">${esc(libelle(C, 'nav_realisations'))}</a>${s ? ` <span aria-hidden="true">/</span> <a href="/realisations?secteur=${esc(s.id)}">${esc(s.nom)}</a>` : ''}</nav>
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
  ${autres.length ? `
  <section class="sec sec-serre" aria-label="Photos du projet">
    <div class="wrap"><ul class="galerie">${autres.map((u) => `<li>${img(u, 1400, 'galerie-img', false, x.nom)}${illus(u)}</li>`).join('')}</ul></div>
  </section>` : ''}
  ${D.realisations.length > 1 ? `
  <nav class="wrap suite" aria-label="Autres réalisations">
    <a href="/realisations/${esc(prec.id)}">${ico.gauche}<span><small>Précédente</small>${esc(prec.nom)}</span></a>
    <a href="/realisations/${esc(suiv.id)}"><span><small>Suivante</small>${esc(suiv.nom)}</span>${ico.fleche}</a>
  </nav>` : ''}
  ${appel(C)}`,
  };
}

function pageAgence(C, D) {
  const P = C.presentation || {}, Gr = C.garanties || {}, G = C.agence || {};
  const gpts = (Array.isArray(Gr.points) ? Gr.points : []).filter(Boolean);
  return {
    classe: 'p-agence', titre: P.titre || libelle(C, 'nav_agence'), rubrique: '/agence', image: P.photo,
    corps: `
  <section class="tete-page wrap">
    <p class="sur">${esc(G.nom || '')}</p>
    <h1>${esc(P.titre || libelle(C, 'nav_agence'))}</h1>
  </section>
  <section class="sec sec-serre">
    <div class="wrap intro-grille">
      <div class="prose prose-grande">${texteRiche(P.texte)}</div>
      ${src(P.photo, 1200) ? `<figure class="intro-fig">${img(P.photo, 1200, 'intro-img', true, '')}</figure>` : ''}
    </div>
  </section>
  ${Gr.titre || gpts.length ? `
  <section class="sec sombre" aria-labelledby="t-eng">
    <div class="wrap engagements">
      <div>${titreSection(libelle(C, 'garanties_sur'), Gr.titre || libelle(C, 'garanties_titre'), 't-eng')}${Gr.texte ? `<p class="chapo">${esc(Gr.texte)}</p>` : ''}</div>
      <div>${listeCoches(gpts)}${D.engagements.length ? `<p class="eng-lien"><a class="lien" href="/engagements">${esc(libelle(C, 'eng_lien'))} ${ico.fleche}</a></p>` : ''}</div>
    </div>
  </section>` : ''}
  ${D.equipe.length ? `
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
  ${appel(C)}`,
  };
}

function pageContact(C, D) {
  const G = C.agence || {}, K = C.contact || {};
  const types = (Array.isArray(K.types) ? K.types : []).filter(Boolean);
  const L = (k) => libelle(C, k);
  const carte = G.adresse ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([G.nom, G.adresse, G.code_postal, G.ville].filter(Boolean).join(' '))}` : '';
  return {
    classe: 'p-contact', titre: 'Contact', rubrique: '/contact',
    corps: `
  <section class="tete-page wrap">
    <p class="sur">Contact</p>
    <h1>${esc(libelle(C, 'contact_titre'))}</h1>
    <p class="chapo">${esc(libelle(C, 'contact_chapo'))}${K.delai_reponse ? ' Nous vous répondons sous ' + esc(K.delai_reponse) + '.' : ''}</p>
  </section>
  <section class="sec sec-serre">
    <div class="wrap contact-grille">
      ${K.actif === false ? `<div class="demande"><p>Le formulaire est fermé pour le moment : appelez-nous ou écrivez-nous.</p></div>` : `<form class="demande" id="demande" novalidate>
        <div class="champs">
          <div class="champ"><label for="d-nom">Nom et prénom</label><input class="saisie" id="d-nom" name="nom" autocomplete="name" required></div>
          ${L('form_societe') ? `<div class="champ"><label for="d-soc">${esc(L('form_societe'))} <span class="fac">(facultatif)</span></label><input class="saisie" id="d-soc" name="societe" autocomplete="organization"></div>` : ''}
          <div class="champ"><label for="d-mail">E-mail</label><input class="saisie" id="d-mail" name="email" type="email" autocomplete="email" required></div>
          <div class="champ"><label for="d-tel">Téléphone</label><input class="saisie" id="d-tel" name="telephone" type="tel" autocomplete="tel" inputmode="tel" required></div>
          ${types.length && L('form_type') ? `<div class="champ"><label for="d-type">${esc(L('form_type'))}</label><select class="saisie" id="d-type" name="type"><option value="">Choisir</option>${types.map((t) => `<option>${esc(t)}</option>`).join('')}</select></div>` : ''}
          ${L('form_surface') ? `<div class="champ"><label for="d-surf">${esc(L('form_surface'))} <span class="fac">(facultatif)</span></label><input class="saisie" id="d-surf" name="surface" placeholder="${esc(L('form_surface_exemple'))}"></div>` : ''}
          ${L('form_ville') ? `<div class="champ large"><label for="d-ville">${esc(L('form_ville'))}</label><input class="saisie" id="d-ville" name="ville" autocomplete="address-level2"></div>` : ''}
          <div class="champ large"><label for="d-msg">${esc(L('form_message'))}</label><textarea class="saisie" id="d-msg" name="message" rows="6" placeholder="${esc(L('form_message_exemple'))}"></textarea></div>
        </div>
        <input type="checkbox" name="botcheck" class="piege" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="demande-erreur" role="alert" hidden></p>
        <button class="btn" type="button" data-envoyer>${esc(L('form_envoyer'))}</button>
        <p class="note">Vos coordonnées servent uniquement à répondre à votre demande. <a href="/confidentialite">Confidentialité</a></p>
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
  <section class="tete-page wrap">
    <p class="sur">${esc(libelle(C, 'eng_sur'))}</p>
    <h1>${esc(libelle(C, 'page_eng_titre'))}</h1>
    ${chapo ? `<p class="chapo">${esc(chapo)}</p>` : ''}
  </section>
  <section class="sec sec-serre">
    <div class="wrap eng-grille">
      <nav class="eng-index" aria-label="${esc(libelle(C, 'eng_index'))}"><p class="sur">${esc(libelle(C, 'eng_index'))}</p><ol>${D.engagements.map((b) => `<li><a href="#${esc(b.id)}">${esc(b.titre)}</a></li>`).join('')}</ol></nav>
      <div class="eng-blocs">
        ${D.engagements.map((b, i) => `<section class="eng-bloc" id="${esc(b.id)}" aria-labelledby="t-${esc(b.id)}"><span class="eng-num" aria-hidden="true">${num(i)}</span><h2 id="t-${esc(b.id)}">${esc(b.titre)}</h2>${b.texte ? `<div class="prose">${texteRiche(b.texte)}</div>` : ''}${listeCoches(b.points)}</section>`).join('\n        ')}
      </div>
    </div>
  </section>
  ${appel(C)}`,
  };
}

function pageMentions(C) {
  const M = C.mentions || {}, G = C.agence || {};
  const k = (v) => (v ? esc(v) : '<em>à compléter</em>');
  return {
    classe: 'p-texte', titre: 'Mentions légales',
    corps: `
  <section class="tete-page wrap"><h1>Mentions légales</h1></section>
  <section class="sec sec-serre"><div class="wrap prose">
    <h2>Éditeur du site</h2>
    <p>${k(M.raison_sociale)}${M.forme ? ', ' + esc(M.forme) : ''}${M.nom_commercial ? '<br>Nom commercial : ' + esc(M.nom_commercial) : ''}<br>${esc(libelle(C, 'mentions_siege'))} : ${k(M.adresse)}<br>${esc(libelle(C, 'mentions_immatriculation'))} : ${k(M.rcs)}${M.tva ? '<br>' + esc(M.tva) : ''}<br>Directeur de la publication : ${k(M.directeur_publication)}<br>Contact : ${k(M.email || G.email)}${G.telephone ? ', ' + esc(G.telephone) : ''}</p>
    <h2>Hébergement</h2>
    <p>Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, États-Unis.</p>
    ${M.mediateur ? `<h2>Médiation de la consommation</h2><p>${esc(M.mediateur)}</p>` : ''}
    <h2>Photos</h2>
    <p>${esc(C.credits_photos || 'Photos : ' + (G.nom || ''))}</p>
  </div></section>`,
  };
}

function pageConfidentialite(C) {
  const K = C.contact || {}, G = C.agence || {};
  return {
    classe: 'p-texte', titre: 'Confidentialité',
    corps: `
  <section class="tete-page wrap"><h1>Confidentialité</h1></section>
  <section class="sec sec-serre"><div class="wrap prose">
    <h2>Ce que le site enregistre</h2>
    <p>Le site ne dépose aucun cookie, ni de mesure d’audience ni de publicité.</p>
    <h2>La mesure des visites</h2>
    <p>Le site compte les pages vues, jour par jour : combien de visites, quelles pages, et d’où l’on vient (moteur de recherche, autre site, adresse tapée). Il n’enregistre ni adresse IP, ni identifiant, et ne dépose rien dans votre navigateur : un visiteur ne peut pas être reconnu d’un jour à l’autre. Ces totaux ne servent qu’à savoir ce qui est utile.</p>
    <h2>Les demandes de contact</h2>
    <p>Quand vous envoyez une demande, les informations du formulaire sont transmises à ${esc(G.nom || 'l’agence')}${K.cle_web3forms ? ', par e-mail via le service Web3Forms' : ''}. Elles servent uniquement à répondre à votre demande et sont conservées 180 jours au plus dans la page de modification du site, sauf si un contrat est conclu.</p>
    <h2>Vos droits</h2>
    <p>Vous pouvez demander l’accès, la correction ou la suppression de vos données${G.email ? ` en écrivant à <a href="mailto:${esc(G.email)}">${esc(G.email)}</a>` : ''}, et saisir la CNIL.</p>
  </div></section>`,
  };
}

function page404() {
  return { classe: 'p-texte', titre: 'Page introuvable', corps: `
  <section class="tete-page wrap">
    <h1>Page introuvable</h1>
    <p class="chapo">Cette page n’existe pas ou plus.</p>
    <p class="actions"><a class="btn" href="/">Retour à l’accueil</a> <a class="btn btn-ligne" href="/realisations">Réalisations</a></p>
  </section>` };
}

/* Toutes les adresses du site (plan du site, démonstration, tests) */
export function routes(C) {
  const D = donnees(C);
  return ['/', '/expertises', '/realisations', ...(D.secteursUtiles.length > 1 ? D.secteursUtiles.map((s) => '/realisations?secteur=' + s.id) : []),
    ...D.realisations.map((x) => '/realisations/' + x.id), '/agence', ...(D.engagements.length ? ['/engagements'] : []), '/contact', '/mentions-legales', '/confidentialite', ...D.pages.map((x) => '/' + x.id)];
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
  else if (p === '/agence') page = pageAgence(C, D);
  else if (p === '/engagements' && D.engagements.length) page = pageEngagements(C, D);
  else if (p === '/contact') page = pageContact(C, D);
  else if (p === '/mentions-legales') page = pageMentions(C);
  else if (p === '/confidentialite') page = pageConfidentialite(C);
  else if ((m = p.match(/^\/([a-z0-9-]{3,60})$/))) page = pageMetier(C, D, m[1]);
  const statut = page ? 200 : 404;
  return { statut, html: document_(C, o, page || page404()) };
}
