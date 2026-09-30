/* =====================================================================
   WeCare by WeKongsi — landing page behaviour
   No dependencies. Everything degrades gracefully without JS.
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supportsIO = 'IntersectionObserver' in window;

  /* ---------------------------------------------------------------
     1. Dynamic free-trial end date  →  today + 30 days
     The date is never hard-coded. If JS is unavailable the markup
     already reads "30 days after you sign up".
     --------------------------------------------------------------- */
  function setTrialEndDate() {
    var nodes = document.querySelectorAll('[data-trial-end]');
    if (!nodes.length) return;

    var end = new Date();
    end.setDate(end.getDate() + 30);

    var pretty;
    try {
      pretty = new Intl.DateTimeFormat('en-MY', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(end);
    } catch (e) {
      pretty = end.toDateString();
    }

    var iso = end.getFullYear() + '-' +
      String(end.getMonth() + 1).padStart(2, '0') + '-' +
      String(end.getDate()).padStart(2, '0');

    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = pretty;
      if (nodes[i].tagName === 'TIME') nodes[i].setAttribute('datetime', iso);
    }
  }

  /* ---------------------------------------------------------------
     2. Footer year
     --------------------------------------------------------------- */
  function setYear() {
    var el = document.querySelector('[data-year]');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------------
     3. Optional images: show the designed fallback until (and unless)
        the real asset loads, so a missing file never breaks layout.
     --------------------------------------------------------------- */
  function wireOptionalImages() {
    var imgs = document.querySelectorAll('img[data-optional]');
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        var slot = img.closest('[data-slot]');
        if (!slot) return;
        var ready = function () { slot.classList.add('is-ready'); };
        if (img.complete && img.naturalWidth > 0) { ready(); }
        else { img.addEventListener('load', ready, { once: true }); }
      })(imgs[i]);
    }
  }

  /* ---------------------------------------------------------------
     4. Scroll reveal (and the How-It-Works connector line)
     --------------------------------------------------------------- */
  function wireReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!supportsIO || reduceMotion) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    for (var j = 0; j < items.length; j++) io.observe(items[j]);

    // Safety net. Nothing on this page may stay invisible because an observer
    // callback did not arrive (throttled background tab, restored scroll
    // position, very tall viewport). Anything already on screen is revealed
    // regardless, so content is never trapped at opacity: 0.
    var sweep = function () {
      var pending = document.querySelectorAll('.reveal:not(.is-visible)');
      for (var k = 0; k < pending.length; k++) {
        if (pending[k].getBoundingClientRect().top < window.innerHeight * 1.15) {
          pending[k].classList.add('is-visible');
          io.unobserve(pending[k]);
        }
      }
    };
    var sweeping = false;
    var queueSweep = function () {
      if (sweeping) return;
      sweeping = true;
      window.requestAnimationFrame(function () { sweep(); sweeping = false; });
    };
    window.addEventListener('scroll', queueSweep, { passive: true });
    window.addEventListener('resize', queueSweep, { passive: true });
    setTimeout(sweep, 1200);
  }

  /* ---------------------------------------------------------------
     5. FAQ accordion
        Panels ship OPEN in the HTML so a no-JS visitor reads every
        answer; JS collapses them and takes over the interaction.
     --------------------------------------------------------------- */
  function wireFaq() {
    var buttons = document.querySelectorAll('.faq-q');

    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        var item = btn.closest('.faq-item');
        if (!panel) return;

        // Collapse on init
        btn.setAttribute('aria-expanded', 'false');
        panel.setAttribute('data-collapsed', '');

        btn.addEventListener('click', function () {
          var open = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', open ? 'false' : 'true');
          if (open) {
            panel.setAttribute('data-collapsed', '');
            if (item) item.classList.remove('is-open');
          } else {
            panel.removeAttribute('data-collapsed');
            if (item) item.classList.add('is-open');
          }
        });
      })(buttons[i]);
    }
  }

  /* ---------------------------------------------------------------
     5b. Step accordion — one card open at a time.
        Panels ship OPEN so a no-JS visitor reads every step in full;
        JS closes them and takes over the interaction.
     --------------------------------------------------------------- */
  function wireSteps() {
    var buttons = document.querySelectorAll('.ac-btn');
    if (!buttons.length) return;

    var close = function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', 'false');
      if (panel) panel.setAttribute('data-collapsed', '');
    };
    var open = function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', 'true');
      if (panel) panel.removeAttribute('data-collapsed');
    };

    for (var i = 0; i < buttons.length; i++) close(buttons[i]);

    for (var j = 0; j < buttons.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var wasOpen = btn.getAttribute('aria-expanded') === 'true';
          for (var k = 0; k < buttons.length; k++) close(buttons[k]);
          if (!wasOpen) open(btn);
        });
      })(buttons[j]);
    }
  }

  /* ---------------------------------------------------------------
     6. Conditions "show all / show fewer" (mobile only)
     --------------------------------------------------------------- */
  function wireConditions() {
    var btn = document.getElementById('conditions-toggle');
    var grid = document.getElementById('condition-grid');
    if (!btn || !grid) return;

    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      grid.classList.toggle('is-collapsed', expanded);
      if (expanded) {
        grid.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  }

  /* ---------------------------------------------------------------
     7. Mobile sticky CTA
        Hidden while any in-page primary CTA is on screen, so it never
        duplicates a button the visitor can already see or tap.
     --------------------------------------------------------------- */

  /* ---------------------------------------------------------------
     FAQ category tabs. Panels ship visible so the questions are
     readable without JS; this hides all but the selected one.
     --------------------------------------------------------------- */
  function wireFaqTabs() {
    var list = document.getElementById('faq-tabs');
    if (!list) return;
    var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    var select = function (tab, focus) {
      for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle('is-active', on);
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      }
      if (focus) tab.focus();
    };

    for (var j = 0; j < tabs.length; j++) {
      (function (tab) {
        tab.addEventListener('click', function () { select(tab, false); });
        tab.addEventListener('keydown', function (ev) {
          var i = tabs.indexOf(tab), next = null;
          if (ev.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
          else if (ev.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (ev.key === 'Home') next = tabs[0];
          else if (ev.key === 'End') next = tabs[tabs.length - 1];
          if (next) { ev.preventDefault(); select(next, true); }
        });
      })(tabs[j]);
    }

    select(tabs[0], false);
  }

  function wireStickyCta() {
    var bar = document.getElementById('sticky-cta');
    if (!bar) return;

    var targets = [];
    var all = document.querySelectorAll('[data-cta="promo-code"],[data-cta="register"]');
    for (var i = 0; i < all.length; i++) {
      if (!bar.contains(all[i])) targets.push(all[i]);
    }
    if (!targets.length) return;

    if (!supportsIO) { bar.classList.add('is-visible'); return; }

    var onScreen = new Set();
    var hero = document.getElementById('hero-cta');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      });

      // Stay hidden until the hero CTA has been scrolled past at least once.
      var pastHero = !hero || hero.getBoundingClientRect().bottom < 0;
      bar.classList.toggle('is-visible', pastHero && onScreen.size === 0);
    }, { threshold: 0.25 });

    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);

    // Re-evaluate on scroll (cheap, rAF-throttled) for the "past hero" rule.
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var pastHero = !hero || hero.getBoundingClientRect().bottom < 0;
        bar.classList.toggle('is-visible', pastHero && onScreen.size === 0);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     8. Header shadow once scrolled
     --------------------------------------------------------------- */
  function wireHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;
    var update = function () {
      header.classList.toggle('is-stuck', window.scrollY > 6);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------
     9. Placeholder CTA links
        href="#" is a placeholder until the real sign-up / policy URLs
        are supplied. Swallow the click so the page does not jump to
        the top. Replace the hrefs in index.html and this becomes inert.
     --------------------------------------------------------------- */
  function wirePlaceholderLinks() {
    document.addEventListener('click', function (ev) {
      var link = ev.target.closest ? ev.target.closest('a[href="#"]') : null;
      if (link) ev.preventDefault();
    });
  }


  /* ---------------------------------------------------------------
     Language — the page ships in Malay and English is the overlay.

     The markup IS the Malay copy, so Malay renders with no JS at all
     and is what a crawler and a no-script visitor see. Only the English
     strings live here; the Malay is captured off the DOM on first run,
     which means a copy edit in index.html cannot silently drift from a
     duplicate in this file. Keys carry the kind of value they hold:
       data-i18n        innerHTML        data-i18n-alt    alt
       data-i18n-aria   aria-label       data-i18n-href   href
     --------------------------------------------------------------- */
  var I18N_EN = {
      "apps.alt1": "The WeKongsi login screen, asking for a phone number and password.",
      "apps.alt2": "The MiCare MyMed app home screen, showing Claim Submission, TeleMed and Medical Card.",
      "apps.d1": "Register on the WeKongsi webapp and enter your EASY promo code to activate your WeCare Lite benefit.",
      "apps.d2": "Use the MiCare MyMed app to access teleconsultation, connect with your doctor, receive e-prescriptions and manage medication pickup or delivery.",
      "apps.eyebrow": "One simple journey",
      "apps.h2": "<span>Activate on WeKongsi.</span> <span>Access Care Through MiCare MyMed.</span>",
      "apps.lede": "Register on WeKongsi to activate your WeCare Lite benefit, then use the MiCare MyMed app to access teleconsultation and medication services.",
      "apps.note": "Activate your benefit on WeKongsi, then access your healthcare services through MiCare MyMed.",
      "apps.plat1": "WeKongsi webapp",
      "apps.plat2": "MiCare MyMed app",
      "apps.t1": "Register &amp; Activate",
      "apps.t2": "Access Your Care",
      "brand.aria": "WeCare by WeKongsi — home",
      "cta.onecode": "1 promo code = 1 month of WeCare Lite",
      "cta.redeem": "Redeem WeCare Lite",
      "cta.register": "Register on WeKongsi",
      "cx.c1": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Cough, Cold or Flu",
      "cx.c10": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Eczema or Dermatitis",
      "cx.c11": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Gout",
      "cx.c12": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Joint Pain (Osteoarthritis)",
      "cx.c13": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Joint Sprain",
      "cx.c14": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>UTI (Uncomplicated, Female)",
      "cx.c15": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Dysmenorrhea",
      "cx.c16": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Mouth Ulcer",
      "cx.c17": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Bacterial Conjunctivitis",
      "cx.c18": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Hordeolum (Eyelid Infection)",
      "cx.c19": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Ringworm or Fungal Skin Infection",
      "cx.c2": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Sore Throat",
      "cx.c20": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Insect Bites",
      "cx.c21": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Head Lice",
      "cx.c3": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Fever or Muscle Aches",
      "cx.c4": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>GERD or Gastritis",
      "cx.c5": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Stomach ache or Bloating",
      "cx.c6": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Nausea or Vomiting",
      "cx.c7": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Infectious Gastroenteritis or Diarrhoea",
      "cx.c8": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Headache or Migraine",
      "cx.c9": "<svg class=\"ico ico-sm cx-tick\" aria-hidden=\"true\"><use href=\"#i-check-circle\"/></svg>Dizziness or Giddiness",
      "cx.eyebrow": "21 common everyday conditions",
      "cx.lede": "WeCare Lite supports teleconsultation for common everyday health concerns.",
      "cx.note": "Some conditions may require an in-person examination or urgent medical attention.",
      "doc.desc": "WeCare Lite is an outpatient healthcare benefit for eligible EASY customers. Redeem your EASY promo code for unlimited teleconsultations daily 9 AM – 10 PM and 1 Care Episode per month.",
      "doc.title": "WeCare Lite by WeKongsi — Your EASY Healthcare Benefit",
      "elig.label": "Who can get WeCare Lite?",
      "elig.line": "Available to eligible EASY customers.",
      "elig.meta": "<span>Malaysian citizens</span><span class=\"elig-dot\" aria-hidden=\"true\">&bull;</span><span>No age limit</span>",
      "faq.a1": "<p>WeCare Lite is a free outpatient healthcare benefit for eligible EASY customers. It gives you unlimited teleconsultation, 1 Care Episode per month, and access to medication pickup or delivery.</p>",
      "faq.a10": "<p>Teleconsultation services are accessed through the <b>MiCare MyMed app</b>. After activating WeCare Lite, use the MiCare MyMed app to access TeleMed and connect with a doctor.</p>",
      "faq.a2": "<p>Your benefit includes unlimited teleconsultation, 1 Care Episode per month, up to <b>RM40</b> for eligible medication + delivery, and pharmacy pickup or delivery.</p>",
      "faq.a3": "<p>Yes. Teleconsultation is <b>free and unlimited</b> during your WeCare Lite entitlement period. It is available daily from 9&nbsp;AM to 10&nbsp;PM, including weekends and public holidays.</p>",
      "faq.a4": "<p>Get your WeCare Lite promo code from your EASY Admin, register on the WeKongsi webapp, and enter your promo code to activate your benefit.</p>",
      "faq.a5": "<p>A Care Episode is used when medication is needed after your consultation. You can use 1 Care Episode per month for eligible medication + delivery costs, up to <b>RM40</b> per Care Episode.</p><p>Your consultation is <b>always free and unlimited</b>. Unused Care Episodes do not carry forward to the next month.</p>",
      "faq.a6": "<p>Yes. You can collect your prescribed medication from a participating pharmacy or have it delivered to your door. Delivery fee applies.</p>",
      "faq.a7": "<p>Each promo code provides <b>1 month</b> of WeCare Lite, counted from your activation date.</p>",
      "faq.a8": "<p>WeCare Lite does not renew automatically. When your current entitlement ends, get a new promo code from your EASY Admin and redeem it on the WeKongsi webapp.</p><p>You can use <b>up to 12 promo codes</b> per person.</p>",
      "faq.a9": "<p>If you do not redeem a new promo code after your entitlement ends, your WeCare Lite benefit will be suspended for 7 days. A new promo code can restore your benefit during this period.</p><p>After 7 days, the benefit will be terminated.</p>",
      "faq.badge": "FAQ",
      "faq.h2": "Questions? We&rsquo;ve Got You Covered.",
      "faq.lede": "Find quick answers about WeCare Lite, how it works and how to continue your benefit.",
      "faq.q1": "What is WeCare Lite?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q10": "Where do I access my teleconsultation?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q2": "What do I get with WeCare Lite?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q3": "Is teleconsultation free?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q4": "How do I join WeCare Lite?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q5": "What is a Care Episode?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q6": "Can I choose between pharmacy pickup and delivery?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q7": "How long does my WeCare Lite benefit last?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q8": "How do I continue my WeCare Lite benefit?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q9": "What happens if I don't renew?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.tab1": "About WeCare Lite",
      "faq.tab2": "Using Your Benefit",
      "faq.tab3": "Renewal &amp; Access",
      "faq.tabsaria": "FAQ categories",
      "fc.btn": "Redeem WeCare Lite<span class=\"fc-arrow\" aria-hidden=\"true\">&rarr;</span>",
      "fc.eyebrow": "Ready to get started?",
      "fc.h2": "Activate Your <span>WeCare Lite</span> Benefit.",
      "fc.lede": "Get your WeCare Lite promo code from your EASY Admin and redeem it on WeKongsi.",
      "foot.aria": "Footer",
      "foot.contact": "Contact / Support",
      "foot.legal": "WeCare Lite is an outpatient healthcare benefit offered through WeKongsi. Teleconsultation is free and unlimited. The RM40 Care Episode limit applies to eligible medication and delivery costs; any amount above RM40 is paid by the member.",
      "foot.privacy": "Privacy Policy",
      "foot.rights": "All rights reserved.",
      "foot.terms": "Terms &amp; Conditions",
      "hero.alt": "A young Malaysian woman using her smartphone to video-call a doctor, with healthcare icons and digital connection trails over a Kuala Lumpur skyline.",
      "hero.badge": "Exclusive for EASY customers",
      "hero.chip": "<b>Doctor on call</b>9 AM – 10 PM daily",
      "hero.h1": "Meet WeCare Lite. Your Everyday Healthcare Benefit.",
      "hero.note": "Get your WeCare Lite promo code from your EASY Admin and redeem it when you sign up.",
      "hero.promo": "<strong>Free</strong> with your EASY promo code.",
      "hero.sub": "Get convenient access to everyday outpatient care with unlimited teleconsultations and 1 Care Episode per month.",
      "hours.line": "Teleconsultation available daily, 9&nbsp;AM&nbsp;–&nbsp;10&nbsp;PM, including weekends and public holidays.",
      "hours.line2": "Teleconsultation available daily, 9&nbsp;AM&ndash;10&nbsp;PM, including weekends and public holidays.",
      "hww.d1": "Get your promo code from your EASY Admin, then register on the WeKongsi webapp and enter the code to activate your benefit.",
      "hww.d2": "Access teleconsultation through the <b class=\"app-name\">MiCare MyMed app</b> and connect with a doctor whenever you need it.",
      "hww.d3": "If medication is prescribed, access your <span class=\"nobr\">e-prescription</span> through the <b class=\"app-name\">MiCare MyMed app</b> and choose pharmacy pickup or delivery.",
      "hww.eyebrow": "How WeCare Lite works",
      "hww.h2": "Simple Care, From Start to Finish.",
      "hww.lede": "Getting everyday healthcare with WeCare Lite takes just a few simple steps.",
      "hww.p1a": "Your WeCare Lite entitlement begins once your promo code is accepted.",
      "hww.p1b": "No payment details are required.",
      "hww.p2a": "Available daily, 9&nbsp;AM&nbsp;&ndash;&nbsp;10&nbsp;PM, including weekends and public holidays.",
      "hww.p2b": "Teleconsultation is free and unlimited, and does not use a Care Episode.",
      "hww.p3a": "Up to RM40 per Care Episode for eligible medication and delivery.",
      "hww.p3b": "Delivery orders by 5&nbsp;PM daily.",
      "hww.t1": "Join WeCare Lite",
      "hww.t2": "Talk to a Doctor",
      "hww.t3": "Get Your Medication",
      "incl.alt1": "A smartphone showing a doctor consultation in a health app.",
      "incl.alt2": "A calendar showing a monthly care cycle beside a stethoscope.",
      "incl.alt3": "A pharmacist handing over medication, and a courier delivering a package to a home.",
      "incl.amt": "Up to RM40",
      "incl.amtsub": "For eligible medication + delivery.",
      "incl.chip1": "Always free",
      "incl.d1": "Speak to a doctor for common everyday health concerns, wherever you are.",
      "incl.d2": "When medication is needed, use your monthly Care Episode.",
      "incl.d3": "Collect your prescribed medication or have it delivered to your door.",
      "incl.eyebrow": "What's included with WeCare Lite",
      "incl.f1": "9&nbsp;AM&ndash;10&nbsp;PM daily",
      "incl.f2": "Consultation is always free and unlimited.",
      "incl.f3": "Delivery fee applies.",
      "incl.h2": "Your WeCare Lite Benefits, At a Glance.",
      "incl.lede": "From talking to a doctor to getting your medication, WeCare Lite makes everyday healthcare simpler.",
      "incl.t1": "Unlimited Teleconsultation",
      "incl.t2": "1 Care Episode per Month",
      "incl.t3": "Pharmacy Pickup or Delivery",
      "nav.aria": "Primary",
      "nav.benefits": "Benefits",
      "nav.cond": "Conditions",
      "nav.faq": "FAQ",
      "nav.how": "How It Works",
      "skip": "Skip to main content",
      "sticky.b": "1 promo code",
      "sticky.s": "= 1 month of WeCare Lite",
      "tele.alt": "A woman at home consulting a doctor through a health app on her phone.",
      "tele.app": "Teleconsultation is accessed through the <b class=\"app-name\">MiCare MyMed app</b>.",
      "tele.d1": "Speak to a doctor conveniently from wherever you are, without needing to visit a clinic for the consultation.",
      "tele.d2": "No commute. No waiting room. Get medical advice without spending time travelling or waiting at a clinic.",
      "tele.d3": "Talk to a doctor privately and comfortably from your own space.",
      "tele.eyebrow": "Teleconsultation",
      "tele.h2": "Healthcare That Fits Your Day.",
      "tele.lede": "Get convenient access to a doctor for common everyday health concerns, wherever you are.",
      "tele.t1": "Talk to a Doctor From Anywhere",
      "tele.t2": "Save Time",
      "tele.t3": "Stay Comfortable",
      "wa.aria": "Need your promo code? WhatsApp EASY Admin at +60 11-7606 6551",
      "wa.href": "https://wa.me/601176066551?text=Hi%20EASY%20Admin%2C%20I%20would%20like%20to%20get%20my%20WeCare%20Lite%20promo%20code.",
      "wa.label": "Need your promo code? <b>WhatsApp EASY Admin</b>",
      "wk.alt": "A Malaysian family supporting a relative receiving hospital care.",
      "wk.alt2": "Looking for broader outpatient access? WeCare is a separate paid plan.\n        <a href=\"#\" data-cta=\"wecare-paid\">Explore WeCare <span aria-hidden=\"true\">&rarr;</span></a>\n      ",
      "wk.cta": "Discover WeKongsi<span class=\"wk-arrow\" aria-hidden=\"true\">&rarr;</span>",
      "wk.eyebrow": "Beyond everyday healthcare",
      "wk.h2": "There's More to WeKongsi.",
      "wk.lede": "WeCare Lite helps with everyday outpatient healthcare. Bigger medical costs are a different kind of worry.",
      "wk.sub": "Supporting eligible inpatient medical costs through the WeKongsi community.",
      "wk.upto": "Up to"
  };

  function wireLang() {
    var group = document.querySelector('.lang');
    if (!group) return;
    var btns = [].slice.call(group.querySelectorAll('[data-lang]'));
    var nodes = document.querySelectorAll(
      '[data-i18n],[data-i18n-aria],[data-i18n-alt],[data-i18n-href]');
    if (!btns.length || !nodes.length) return;

    // Snapshot the Malay that shipped in the markup.
    var ms = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i], d = el.getAttribute.bind(el);
      ms.push({
        html: d('data-i18n') ? el.innerHTML : null,
        aria: d('data-i18n-aria') ? d('aria-label') : null,
        alt: d('data-i18n-alt') ? d('alt') : null,
        href: d('data-i18n-href') ? d('href') : null
      });
    }
    var descEl = document.querySelector('meta[name="description"]');
    var msTitle = document.title;
    var msDesc = descEl ? descEl.getAttribute('content') : null;

    function apply(lang) {
      var en = lang === 'en';
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i], k;
        if ((k = el.getAttribute('data-i18n')) !== null) {
          el.innerHTML = en ? I18N_EN[k] : ms[i].html;
        }
        if ((k = el.getAttribute('data-i18n-aria')) !== null) {
          el.setAttribute('aria-label', en ? I18N_EN[k] : ms[i].aria);
        }
        if ((k = el.getAttribute('data-i18n-alt')) !== null) {
          el.setAttribute('alt', en ? I18N_EN[k] : ms[i].alt);
        }
        if ((k = el.getAttribute('data-i18n-href')) !== null) {
          el.setAttribute('href', en ? I18N_EN[k] : ms[i].href);
        }
      }
      document.documentElement.lang = en ? 'en-MY' : 'ms-MY';
      document.title = en ? I18N_EN['doc.title'] : msTitle;
      if (descEl) descEl.setAttribute('content', en ? I18N_EN['doc.desc'] : msDesc);

      for (var b = 0; b < btns.length; b++) {
        var on = btns[b].getAttribute('data-lang') === lang;
        btns[b].classList.toggle('is-active', on);
        btns[b].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      try { localStorage.setItem('wcl-lang', lang); } catch (e) {}
    }

    for (var b = 0; b < btns.length; b++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          apply(btn.getAttribute('data-lang'));
        });
      })(btns[b]);
    }

    // Malay is the default for every first visit; only a returning
    // visitor who chose English gets English.
    var saved = null;
    try { saved = localStorage.getItem('wcl-lang'); } catch (e) {}
    if (saved === 'en') apply('en');
  }

  /* ---------------------------------------------------------------
     Init
     --------------------------------------------------------------- */
  function init() {
    setTrialEndDate();
    setYear();
    wireOptionalImages();
    wireLang();
    wireReveal();
    wireFaq();
    wireSteps();
    wireConditions();
    wireFaqTabs();
    wireStickyCta();
    wireHeader();
    wirePlaceholderLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
