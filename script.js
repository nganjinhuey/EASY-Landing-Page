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
      "apps.d1": "Register on the WeKongsi WebApp and enter your promo code to activate WeCare Lite. To continue your benefit later, request an extension here too.",
      "apps.d2": "Use the MiCare MyMed app to access teleconsultation, connect with your doctor, receive e-prescriptions and manage medication pickup or delivery.",
      "apps.eyebrow": "Two platforms, one benefit",
      "apps.h2": "Where to Access WeCare Lite",
      "apps.lede": "Register and activate your benefit through WeKongsi, then access your healthcare services through MiCare MyMed.",
      "apps.note": "WeCare Lite registration and extension requests happen on the WeKongsi WebApp. MiCare MyMed is where you access your healthcare services.",
      "apps.plat1": "WeKongsi webapp",
      "apps.plat2": "MiCare MyMed app",
      "apps.t1": "Register &amp; Activate",
      "apps.t2": "Access Your Care",
      "brand.aria": "EASY × WeCare Lite by WeKongsi — home",
      "cta.how": "How to Get It",
      "cta.onecode": "Promo code required for first-time registration only.",
      "cta.redeem": "Get My Promo Code",
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
      "doc.desc": "WeCare Lite is an outpatient healthcare benefit for eligible EASY customers. Unlimited teleconsultation daily 9 AM to 10 PM, and 1 Care Episode per entitlement period.",
      "doc.title": "WeCare Lite by WeKongsi — Your EASY Healthcare Benefit",
      "elig.label": "Who can get WeCare Lite?",
      "elig.line": "Available to eligible EASY customers.",
      "elig.meta": "<span>Malaysian citizens</span><span class=\"elig-dot\" aria-hidden=\"true\">&bull;</span><span>No age limit</span>",
      "faq.a11": "<p>WeCare Lite is a free benefit for eligible EASY customers.</p>",
      "faq.a12": "<p>For your first registration, get your WeCare Lite promo code from your EASY Admin and enter it during registration on the WeKongsi WebApp.</p>",
      "faq.a13": "<p>No. The promo code is only required for first-time registration. To continue with WeCare Lite, you can request an extension through the WeKongsi WebApp.</p>",
      "faq.a14": "<p>You redeem it while registering on the WeKongsi WebApp.</p>",
      "faq.a21": "<p>After activating WeCare Lite on the WeKongsi WebApp, you access teleconsultation through the <b>MiCare MyMed</b> app.</p>",
      "faq.a22": "<p>Yes. Teleconsultation is <b>free and unlimited</b>, daily from 9&nbsp;AM to 10&nbsp;PM, including weekends and public holidays.</p>",
      "faq.a23": "<p>Yes. You can collect your prescribed medication from a participating pharmacy or choose home delivery. If you choose delivery, the delivery fee is included within the RM40 limit, so less of it remains for medication.</p>",
      "faq.a24": "<p>A Care Episode is a benefit you can use once per entitlement period for eligible medication after a consultation and a doctor&rsquo;s prescription, up to <b>RM40</b> &mdash; the same limit also covers any delivery fee.</p>",
      "faq.a31": "<p>Your benefit runs for the entitlement period set out in the promotion terms.</p>",
      "faq.a32": "<p>When your current benefit period ends, select &ldquo;Request Extension&rdquo; on the WeKongsi WebApp. EASY Admin will review your request and approve it if you remain eligible.</p>",
      "faq.a33": "<p>Not necessarily. Each request is reviewed by your EASY Admin and approved if you still meet the promotion terms.</p>",
      "faq.badge": "Need help?",
      "faq.h2": "Frequently Asked Questions",
      "faq.lede": "Find answers to common questions about WeCare Lite, registration and accessing your benefits.",
      "faq.q11": "Who is eligible for WeCare Lite?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q12": "How do I get my WeCare Lite promo code?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q13": "Do I need a new promo code every month?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q14": "Where do I redeem my promo code?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q21": "Where do I access teleconsultation?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q22": "Is teleconsultation free?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q23": "Can I choose pharmacy pickup or home delivery?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q24": "What is a Care Episode?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q31": "How long does my WeCare Lite benefit last?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q32": "How do I continue with WeCare Lite?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.q33": "Is my extension request always approved?<svg class=\"ico ico-sm faq-chevron\" aria-hidden=\"true\"><use href=\"#i-chevron\"/></svg>",
      "faq.tab1": "Getting WeCare Lite",
      "faq.tab2": "Using Your Benefit",
      "faq.tab3": "Extension &amp; Access",
      "faq.tabsaria": "FAQ categories",
      "fc.btn": "Get My Promo Code<span class=\"fc-arrow\" aria-hidden=\"true\">&rarr;</span>",
      "fc.eyebrow": "Your next step",
      "fc.h2": "Ready to Get Started With <span class=\"gold\">EASY</span>?",
      "fc.lede": "Get your WeCare Lite promo code from EASY Admin and register through the WeKongsi WebApp.",
      "foot.aria": "Footer",
      "foot.contact": "Contact / Support",
      "foot.legal": "WeCare Lite is an outpatient healthcare benefit distributed by EASY and activated on the WeKongsi platform. Teleconsultation is free and unlimited. The RM40 Care Episode limit covers eligible medication and any delivery fee together; anything above RM40 is paid by the member.",
      "foot.notins": "WeKongsi is not an insurance company and does not provide insurance. WeCare Lite is a healthcare benefit, and WeKongsi medical cost-sharing is a community programme &mdash; not an insurance policy.",
      "foot.privacy": "Privacy Policy",
      "foot.rights": "All rights reserved.",
      "foot.terms": "Terms &amp; Conditions",
      "getx.after": "The promo code is required for first-time registration only. To continue afterwards, request an extension through the WeKongsi WebApp. EASY Admin will review your request and approve it if you remain eligible.",
      "getx.d1": "Get your WeCare Lite promo code from your EASY Admin.",
      "getx.d2": "Register on the WeKongsi WebApp and enter your promo code during first-time registration.",
      "getx.d3": "Access teleconsultation, e-prescription and medication services through the <b class=\"app-name\">MiCare MyMed</b> app.",
      "getx.eyebrow": "Getting started",
      "getx.h2": "How to Get WeCare Lite",
      "getx.lede": "WeCare Lite is a free benefit for eligible EASY customers &mdash; here&rsquo;s how to get yours.",
      "getx.t1": "Get Your Promo Code",
      "getx.t2": "Register &amp; Activate",
      "getx.t3": "Access Your Healthcare",
      "hero.alt": "A young Malaysian woman using her smartphone to video-call a doctor, with healthcare icons and digital connection trails over a Kuala Lumpur skyline.",
      "hero.chip": "<b>Doctor on call</b>9 AM – 10 PM daily",
      "hero.h1": "More Than Just Staying Connected.",
      "hero.kicker": "<span>Connectivity</span><i aria-hidden=\"true\">&times;</i><span>Healthcare</span>",
      "hero.note": "Eligible EASY customers can get a WeCare Lite promo code from their EASY Admin to register.",
      "hero.promo": "<strong>Free</strong> for eligible <span class=\"gold\">EASY</span> customers.",
      "hero.sub": "With EASY you get more than high-speed data for everyday life — eligible customers also get access to WeCare Lite, a healthcare benefit for everyday needs.",
      "hours.line": "Teleconsultation available daily, 9&nbsp;AM&nbsp;–&nbsp;10&nbsp;PM, including weekends and public holidays.",
      "hww.amt3": "Up to RM40 per Care Episode",
      "hww.d1": "Get your promo code from your EASY Admin, then register on the WeKongsi WebApp and enter it during first-time registration.",
      "hww.d2": "Access teleconsultation through the <b class=\"app-name\">MiCare MyMed app</b> and connect with a doctor whenever you need to.",
      "hww.d3": "If the doctor issues a prescription, access your <span class=\"nobr\">e-prescription</span> through the <b class=\"app-name\">MiCare MyMed app</b> and choose pharmacy pickup or delivery.",
      "hww.eyebrow": "Using your benefit",
      "hww.h2": "How WeCare Lite Works",
      "hww.lede": "From registration to accessing your healthcare benefit, here&rsquo;s how the experience works.",
      "hww.p1a": "Your WeCare Lite entitlement begins once your Promo Code is successfully redeemed.",
      "hww.p1b": "No payment details are required.",
      "hww.p2a": "Available daily from 9&nbsp;AM to 10&nbsp;PM, including weekends and public holidays.",
      "hww.p2b": "Teleconsultation is free and unlimited, and does not use a Care Episode.",
      "hww.p3a": "For eligible medication. If you choose delivery, the delivery fee is included within the RM40 limit.",
      "hww.p3b": "Delivery orders must be placed before 5&nbsp;PM daily.",
      "hww.t1": "Join WeCare Lite",
      "hww.t2": "Talk to a Doctor",
      "hww.t3": "Get Your Medication",
      "incl.alt1": "A smartphone showing a doctor consultation in a health app.",
      "incl.alt2": "A calendar showing a care cycle beside a stethoscope.",
      "incl.alt3": "A pharmacist handing over medication, and a courier delivering a package to a home.",
      "incl.amt": "Up to RM40",
      "incl.amtsub": "Shared between eligible medication and any delivery fee.",
      "incl.chip1": "Always free",
      "incl.d1": "Speak to a doctor about common everyday health concerns, wherever you are.",
      "incl.d2": "Use your Care Episode when eligible medication is needed.",
      "incl.d3": "Collect your prescribed medication or have it delivered to your door.",
      "incl.eyebrow": "For eligible EASY customers",
      "incl.f1": "9&nbsp;AM to 10&nbsp;PM daily",
      "incl.f2": "Teleconsultation is free and unlimited.",
      "incl.f3": "If you choose delivery, the fee is included within the RM40 limit.",
      "incl.h2": "What&rsquo;s Included with WeCare Lite",
      "incl.lede": "Get access to everyday healthcare through teleconsultation, Care Episodes and medication services.",
      "incl.t1": "Unlimited Teleconsultation",
      "incl.t2": "1 Care Episode per Entitlement Period",
      "incl.t3": "Pharmacy Pickup or Delivery",
      "nav.aria": "Primary",
      "nav.benefits": "Benefits",
      "nav.cond": "Conditions",
      "nav.faq": "FAQ",
      "nav.how": "How to Get It",
      "orgs.d0": "Distributes the WeCare Lite programme to eligible EASY customers and facilitates access through the promo code and extension process.",
      "orgs.d1": "Provides the digital platform for customer registration, promo code redemption, benefit activation and extension requests.",
      "orgs.d2": "Provides the MyMed platform through which customers access teleconsultation, e-prescription and medication services.",
      "orgs.eyebrow": "Your WeCare Lite experience",
      "orgs.h2": "The Partners Behind WeCare Lite",
      "orgs.lede": "Each partner supports a distinct part of the WeCare Lite customer experience.",
      "orgs.r0": "WeCare Lite Distributor",
      "orgs.r1": "WeCare Lite Platform",
      "orgs.r2": "Healthcare Access Platform",
      "skip": "Skip to main content",
      "sticky.b": "First-time registration",
      "sticky.s": "Promo code from EASY Admin",
      "story.close": "EASY pairs high-speed connectivity from Eastel with a healthcare benefit through WeCare Lite.",
      "story.d1": "High-speed connectivity from Eastel for everyday life.",
      "story.d2": "Everyday healthcare through the WeCare Lite benefit.",
      "story.eyebrow": "The EASY story",
      "story.h2": "Why EASY Includes Healthcare",
      "story.lede": "<span class=\"gold gold--flat\">EASY</span> believes staying connected is about more than data &mdash; it is also about having access to the care you need and looking after the people who matter most.",
      "story.t1": "Stay Connected.",
      "story.t2": "Stay Well.",
      "wa.aria": "Need your promo code? WhatsApp EASY Admin at +60 11-7606 6551",
      "wa.href": "https://wa.me/601176066551?text=Hi%20EASY%20Admin%2C%20I%20would%20like%20to%20get%20my%20WeCare%20Lite%20promo%20code.",
      "wa.label": "Need your promo code? <b>WhatsApp EASY Admin</b>",
      "wk.alt": "A Malaysian family supporting a relative receiving hospital care.",
      "wk.alt2": "Looking for broader outpatient access? WeCare is a separate paid plan.\n        <a href=\"#\" data-cta=\"wecare-paid\">Explore WeCare <span aria-hidden=\"true\">&rarr;</span></a>\n      ",
      "wk.cta": "Discover WeKongsi<span class=\"wk-arrow\" aria-hidden=\"true\">&rarr;</span>",
      "wk.eyebrow": "Beyond WeCare Lite",
      "wk.h2": "Looking for More Healthcare Support?",
      "wk.lede": "WeCare Lite is designed for everyday healthcare needs. Explore other healthcare options available through WeKongsi.",
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
