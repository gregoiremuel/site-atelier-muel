/* Agence : menu et demande de contact. Sans bibliothèque. */
(function () {
  'use strict';
  var A = window.AGENCE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  document.documentElement.classList.add('js');

  /* Vidéo de fond : pause au clic, et à l'arrêt si le visiteur a demandé moins d'animations */
  (function () {
    var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>', LECTURE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5l11 6.5-11 6.5z"/></svg>';
    Array.prototype.forEach.call(document.querySelectorAll('[data-video-fond]'), function (v) {
      var b = v.parentNode.querySelector('[data-video-pause]');
      var etat = function (pause) { if (!b) return; b.setAttribute('aria-pressed', String(pause)); b.setAttribute('aria-label', pause ? 'Lancer la vidéo' : 'Mettre la vidéo en pause'); b.innerHTML = pause ? LECTURE : PAUSE; };
      var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (calme) { v.removeAttribute('autoplay'); try { v.pause(); } catch (e) { /* rien */ } etat(true); }
      v.addEventListener('error', function () { setTimeout(function () { if (b && (v.error || v.networkState === 3)) b.hidden = true; }, 0); }, true);
      if (b) b.addEventListener('click', function () { if (v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); etat(false); } else { v.pause(); etat(true); } });
    });
  })();

  /* Volets des offres : l'adresse « #identifiant » ouvre le bon volet */
  (function () {
    var ouvrir = function () { var h = decodeURIComponent((location.hash || '').slice(1)); var d = h && document.getElementById(h); if (d && d.tagName === 'DETAILS') d.open = true; };
    ouvrir(); window.addEventListener('hashchange', ouvrir);
  })();

  /* Photos manquantes : on les cache */
  $$('img').forEach(function (im) { im.addEventListener('error', function () { im.style.visibility = 'hidden'; }); });

  /* Aperçu (page de modification, démonstration) : les liens internes changent la page affichée par le parent */
  if (A.apercu) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var h = a.getAttribute('href');
      if (h && (a.hasAttribute('data-ouvrir') || /^\/[^?#]*\.[a-z0-9]+$/i.test(h))) { e.preventDefault(); try { window.open(new URL(h, parent.location.href).href, '_blank', 'noopener'); } catch (x) { /* rien */ } return; }
      if (h && h.charAt(0) === '/') { e.preventDefault(); try { parent.postMessage({ agence: 'aller', chemin: h }, '*'); } catch (x) { /* rien */ } }
    }, true);
  }

  /* Mouvement : apparitions au défilement, chiffres qui défilent, en-tête qui s'affine. Rien si le visiteur demande moins d'animations,
     ni dans l'aperçu de la page de modification (classe « calme »). */
  (function () {
    var calme = document.body.classList.contains('calme') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var tete = document.querySelector('.tete');
    if (tete) {
      var majTete = function () { tete.classList.toggle('defile', window.scrollY > 24); };
      majTete(); window.addEventListener('scroll', majTete, { passive: true });
    }
    if (calme) return;
    document.documentElement.classList.add('anime');
    var CIBLES = ['.sec-tete', '.intro-txt', '.intro-fig', '.chiffres li', '.metiers li', '.cartes .carte', '.etapes > li', '.refs li', '.metier-fig', '.metier-txt', '.lots li', '.fiche', '.real-txt', '.galerie li', '.equipe li', '.engagements > *', '.coord', '.demande', '.appel-in > *', '.tete-page > *', '.prose-grande', '.suite a', '.essai-txt', '.essai-liens li'];
    var els = [];
    CIBLES.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        if (el.closest('.hero') || el.classList.contains('rev')) return;
        var freres = Array.prototype.filter.call(el.parentNode.children, function (x) { return x.matches(sel); });
        var i = freres.indexOf(el);
        el.classList.add('rev');
        el.style.transitionDelay = Math.min(i, 7) * 70 + 'ms';
        els.push(el);
      });
    });
    /* Chiffres : la partie numérique monte jusqu'à sa valeur */
    var compter = function (b) {
      var t = b.textContent, m = /^([\d\s  ]+)(.*)$/.exec(t);
      if (!m) return;
      var cible = parseInt(m[1].replace(/\D/g, ''), 10);
      if (!(cible > 1)) return;
      var debut = null, d = 1400;
      var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
      var pas = function (ts) {
        if (!debut) debut = ts;
        var p = Math.min(1, (ts - debut) / d), e = 1 - Math.pow(1 - p, 3);
        b.textContent = fmt(Math.round(cible * e)) + m[2];
        if (p < 1) requestAnimationFrame(pas); else b.textContent = t;
      };
      requestAnimationFrame(pas);
    };
    var montrer = function (el) {
      el.classList.add('vu');
      if (el.matches('.chiffres li')) { var b = el.querySelector('b'); if (b) compter(b); }
    };
    if (!('IntersectionObserver' in window)) { els.forEach(montrer); return; }
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { if (en.isIntersecting) { montrer(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
    /* Filet de sécurité : rien ne reste caché */
    setTimeout(function () { els.forEach(function (el) { if (!el.classList.contains('vu')) { var r = el.getBoundingClientRect(); if (r.top < innerHeight) montrer(el); } }); }, 2500);
  })();

  /* Liens vers une rubrique de la page (#produits…) : dans un aperçu (démonstration, page de modification),
     la page est affichée dans un cadre et le navigateur comprendrait le lien comme une autre page.
     On fait alors défiler nous-mêmes jusqu'à la rubrique. Sur le site en ligne, le navigateur s'en charge. */
  if (location.protocol === 'about:') {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = decodeURIComponent(a.getAttribute('href').slice(1));
      var cible = id && document.getElementById(id);
      if (!cible) return;
      e.preventDefault();
      var doux = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      setTimeout(function () {
        cible.scrollIntoView({ behavior: doux ? 'smooth' : 'auto', block: 'start' });
        if (!cible.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(cible.tagName)) cible.setAttribute('tabindex', '-1');
        try { cible.focus({ preventScroll: true }); } catch (x) { /* rien */ }
      }, 0);
    });
  }

  /* Menu (téléphone) */
  var btn = $('#menu-btn'), volet = $('#menu');
  if (btn && volet) {
    var ouvrir = function (o) {
      volet.hidden = !o; btn.setAttribute('aria-expanded', String(o));
      document.documentElement.classList.toggle('menu-ouvert', o);
      if (o) { var a = $('a', volet); if (a) a.focus(); } else btn.focus();
    };
    btn.addEventListener('click', function () { ouvrir(volet.hidden); });
    volet.addEventListener('click', function (e) { if (e.target.closest('[data-fermer]') || e.target.closest('a')) ouvrir(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !volet.hidden) ouvrir(false); });
  }

  /* Demande de contact */
  var form = $('#demande');
  if (!form) return;
  var erreur = $('.demande-erreur', form), bouton = $('[data-envoyer]', form), okBox = $('.demande-ok');
  var val = function (n) { var f = form.elements[n]; return f ? String(f.value || '').trim() : ''; };
  var montrer = function (h) { erreur.innerHTML = h; erreur.hidden = false; };
  var envoyer = function (e) {
    if (e) e.preventDefault();
    erreur.hidden = true;
    var d = { nom: val('nom'), societe: val('societe'), email: val('email'), telephone: val('telephone'), type: val('type'), surface: val('surface'), ville: val('ville'), message: val('message') };
    var manque = [];
    if (!d.nom) manque.push('votre nom');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) manque.push('une adresse e-mail valide');
    if (d.telephone.replace(/\D/g, '').length < 6) manque.push('un numéro de téléphone');
    if (manque.length) { montrer('Il manque ' + manque.join(', ') + '.'); return; }
    var Lb = A.lib || {};
    var recap = [['Nom', d.nom], [Lb.societe || 'Société', d.societe], ['E-mail', d.email], ['Téléphone', d.telephone], [Lb.type || 'Type de locaux', d.type], [Lb.surface || 'Surface', d.surface], [Lb.ville || 'Ville du projet', d.ville], [Lb.message || 'Projet', d.message]].filter(function (l) { return l[1]; });
    var sujet = 'Demande de projet' + (d.type ? ' : ' + d.type : '') + (d.societe ? ' (' + d.societe + ')' : '');
    var fini = function (titre, texte) {
      okBox.innerHTML = '<h2>' + esc(titre) + '</h2><p>' + esc(texte) + '</p><dl>' + recap.map(function (l) { return '<dt>' + esc(l[0]) + '</dt><dd>' + esc(l[1]) + '</dd>'; }).join('') + '</dl>';
      form.hidden = true; okBox.hidden = false; okBox.focus();
    };
    if (form.elements.botcheck && form.elements.botcheck.checked) { fini('Demande envoyée', A.confirmation); return; }
    if (A.maquette) { fini('Aperçu de la demande', 'Démonstration : rien n’a été envoyé. Une fois le site en ligne, l’agence reçoit exactement ce message.'); return; }
    var envois = [];
    if (A.api) envois.push(fetch(A.api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(function (r) { if (!r.ok) throw new Error('refus'); }));
    if (A.cle) {
      var fd = new FormData();
      fd.append('access_key', A.cle); fd.append('subject', sujet); fd.append('from_name', 'Site ' + A.nom); fd.append('email', d.email);
      recap.forEach(function (l) { fd.append(l[0], l[1]); });
      envois.push(fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: fd }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.success) throw new Error('refus'); }); }));
    }
    if (!envois.length) {
      if (A.email) { location.href = 'mailto:' + A.email + '?subject=' + encodeURIComponent(sujet) + '&body=' + encodeURIComponent(recap.map(function (l) { return l[0] + ' : ' + l[1]; }).join('\n')); fini('Dernière étape', 'Votre messagerie s’ouvre avec la demande déjà rédigée : envoyez-la.'); return; }
      montrer('Le formulaire n’est pas encore ouvert.'); return;
    }
    bouton.disabled = true; bouton.textContent = 'Envoi…';
    var ok = false, restants = envois.length;
    envois.forEach(function (pr) {
      pr.then(function () { ok = true; }, function () {}).then(function () {
        if (--restants) return;
        bouton.disabled = false; bouton.textContent = 'Envoyer la demande';
        if (ok) fini('Demande envoyée', A.confirmation);
        else montrer('L’envoi n’a pas abouti. Réessayez dans un instant' + (A.email ? ', ou écrivez à <a href="mailto:' + esc(A.email) + '">' + esc(A.email) + '</a>' : '') + '.');
      });
    });
  };
  bouton.addEventListener('click', envoyer);
  form.addEventListener('submit', envoyer);
})();
