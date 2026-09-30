# WeCare by WeKongsi — Landing Page

Static, mobile-first landing page. No build step, no framework, no dependencies —
open `index.html` or drop the folder on any static host / CDN.

```
index.html     markup (all 15 sections + inline SVG icon sprite)
styles.css     design system + all section styles (mobile-first)
script.js      ~8 KB, no libraries
images/        brand + hero assets
```

---

## 1. Before you go live

Three things need real values. Everything else is ready.

### 1.1 Sign-up links
Every primary CTA is `href="#"` with `data-cta="signup"`, marked by a
`<!-- TODO -->` comment. There are 5 of them (header, hero, pricing, final CTA,
sticky bar). Replace the `href` with the Eastel/WeCare sign-up deep link:

```bash
sed -i '' 's|href="#" data-cta="signup"|href="YOUR_SIGNUP_URL" data-cta="signup"|g' index.html
```

The WeKongsi cost-sharing CTA is `data-cta="learn-more"`, and the three footer
links (Privacy Policy, Terms & Conditions, Contact / Support) are also `href="#"`.

While an `href` is still `"#"`, `script.js` swallows the click so the page does
not jump to the top. Once real URLs are in, that handler no longer applies.

### 1.2 Legal / policy copy — still `[TO BE CONFIRMED]`
The page deliberately says nothing about: exclusions, cooling-off, cancellation
and refunds, auto-renewal, renewal price, failed payment handling, payment
mandate rail, legal entity, or the complaints channel. No FAQ was invented for
any of these. Add them when approved.

### 1.3 Product images
The four "What's Included" illustrations are **in place**. Two slots remain; each
renders a designed brand-coloured placeholder until the real file exists, then
swaps in automatically on load. Nothing breaks, nothing shifts.

| Still to drop in | Used by |
|---|---|
| `images/mymed-logo.png` | MyMed section — **see §1.4** |
| `images/family-health.png` | "Healthcare When You Need It" |
| `images/wekongsi-family.png` | WeKongsi cost-sharing |

### 1.4 The MyMed logo is not in the project
The brief referred to a supplied MyMed logo (red rounded square, white ECG
mark). **No such file exists in `images/`** — the only place MyMed red appears
on the page today is inside the supplied teleconsultation illustration.

Redrawing it was explicitly out of bounds, so the MyMed section renders a
neutral dashed placeholder marked "MyMed logo" — obviously provisional, and
deliberately *not* red so nobody mistakes it for the real mark. Drop the file at
`images/mymed-logo.png` and it appears automatically, at 38×38 with
`object-fit: contain`. A square PNG or SVG with transparent padding works best.

**Supplied artwork — naming was corrected.** The originals arrived as
`benefit.unlimitedteleconsultation.png` (dot, not dash) and `careepisode.png`,
which is actually the *RM40 medication* artwork, not a care-episode one. The
source PNGs are untouched; the page reads the optimised derivatives below.

| Card | Optimised file the page uses | Source PNG |
|---|---|---|
| Unlimited Teleconsultation | `benefit-teleconsult-{400,640}.jpg` | `benefit.unlimitedteleconsultation.png` |
| 1 Care Episode Every Month | `benefit-care-episode-{400,640}.jpg` | `benefit-careepisode.png` |
| Up to RM40 Medication | `benefit-medication-{400,640}.jpg` | `careepisode.png` |
| Pharmacy Pickup or Delivery | `benefit-pharmacy-{400,640}.jpg` | `benefit-pharmacy.png` |

Card tiles are `aspect-ratio: 3/2`, matching the artwork's native 1536×1024, so
nothing is cropped. Regenerate after replacing a source:

```bash
sips -s format jpeg -s formatOptions 84 --resampleWidth 640 SOURCE.png --out benefit-SLOT-640.jpg
sips -s format jpeg -s formatOptions 84 --resampleWidth 400 SOURCE.png --out benefit-SLOT-400.jpg
```

**⚠ The supplied artwork carries baked-in copy that needs sign-off** — see §7.1.

Recommended: ~1.5–2× the displayed size, and no text or logo inside the image —
all copy lives in the HTML.

`how-it-works.png` is not used: that section is built from live HTML (numbered
steps + an animated teal connector), which stays sharp and translatable.

---

## 2. "What's Included" — three cards, then the conditions

The section is three cards and nothing else. Each is **image → title →
one paragraph → one small line**; no step numbers, no chips, no diagrams, no
icons inside the card body.

| Card | Title |
|---|---|
| 1 | Unlimited Teleconsultation |
| 2 | 1 Care Episode Every Month |
| 3 | Pharmacy Pickup or Delivery |

The small supporting lines (hours, Care Episode refresh, pickup/delivery cut-off)
were **removed** from these cards at the client's request. None of those facts
was lost — each still appears in the How WeCare Works step panels and in the FAQ,
confirmed by search after the edit: hours 8×, "including weekends" 5×, refresh
2×, no-carry-forward 5×, 5 PM 3×.

Titles and paragraphs are the approved wordings verbatim, verified by string
comparison rather than by eye.

Card 2 carries the Care Episode logic in one sentence: *up to RM40 worth of
eligible medication with each Care Episode*. Nothing on the page implies RM40
cash, an automatic monthly payment, unlimited medication, accumulating episodes,
or that a teleconsultation consumes an episode.

**"When You Need More Than a Teleconsultation" was removed** at the client's
request. Its safety guidance is not lost — it still appears in two places: the
light-teal footnote inside the conditions card ("Some conditions need an
in-person examination or urgent medical attention…") and the "Can I use WeCare
for emergencies?" FAQ. The section's CSS (`.not-suitable`, `.ns-*`) is
deliberately left in `styles.css`, so restoring it only means re-adding the
markup block.

**The conditions card follows directly.** Its standalone intro — the "COVERAGE"
eyebrow, the "Everyday Health Concerns, Covered." headline and its paragraph —
was removed, because it read as a second hero and opened a large white gap.
`Commonly Treated Conditions` inside the card is now the entry point, and
`aria-labelledby` points at it so the section is still named for assistive tech.

Measured gap from the last card to the conditions card: **36px mobile, 48px
tablet, 62px desktop** (it was ~250px). `.benefits` drops to half its bottom
padding and `.conditions` has `padding-top: 0`; both are white, so they read as
one block.

Supporting lines are bottom-aligned across the row (`margin-top: auto`), which
keeps the three cards scannable at a glance and is why card 1 shows a little
space above its line.

### Card photography
`benefit-teleconsultation.jpg`, `benefit-epsiode.jpg` (**note the typo in the
supplied filename — "epsiode"; the page reads it as-is, rename both file and
reference together if you fix it**) and `benefit-pharmacy.jpg` — all realistic,
1536×1024, teal-graded, no text baked in. Cards use `aspect-ratio: 3/2`, so
nothing is cropped and the three stay visually consistent.

Image share of card height measures 44% at 320px, 40–46% on desktop, and runs
to ~55% at 375–430px where the card body is shortest. Hitting 40–45% there would
mean letterboxing the photos to roughly 2.7:1, so the uncropped 3:2 was kept —
the images are the hook, and the ratio stays identical across all three cards.

Served as `card-{teleconsult,episode,pharmacy}-{480,800}.jpg`: **5.1 MB of
sources → 128 KB on a phone, 252 KB on desktop.** Regenerate after replacing a
source:

```bash
sips -s format jpeg -s formatOptions 82 --resampleWidth 800 SOURCE.jpg --out card-SLOT-800.jpg
sips -s format jpeg -s formatOptions 82 --resampleWidth 480 SOURCE.jpg --out card-SLOT-480.jpg
```

**This retired the "Anytime" problem.** The new teleconsultation photograph has
no baked-in text, so the old illustration's "MyMed — Talk to a Doctor, Anytime"
is gone from the page. §7.1's compliance table is now historical.

---

## 3. Page flow

Sections run in this order, each answering one question:

| # | Section | Answers | Ground |
|---|---|---|---|
| 1 | Hero | What is WeCare? | navy + photo |
| 2 | Teleconsultation | How does it help me? | light teal |
| 3 | What's Included | What do I get? | white |
| 4 | Commonly Treated Conditions | What can I use it for? | white, flows from 3 |
| 5 | How WeCare Works | How does the process work? | navy → teal-green |
| 6 | Eligibility | Can I join? | mint |
| 7 | Pricing + disclosure | What does it cost? | white |
| 8 | WeKongsi cost-sharing | (secondary upsell) | off-white |
| 9 | FAQ | | white |
| 10 | Final CTA + footer | | navy |

Sections 3 and 4 share a white ground deliberately — the conditions card has
`padding-top: 0` so it reads as a continuation of the benefit cards rather than
a new section.

**The "Healthcare When You Need It" lifestyle section was removed.** It duplicated
the teleconsultation section's job (both answered *how does this help me?*, both
led with a photograph and a three-point list) and its heading collided with
What's Included's *"Healthcare, When You Need It."* Restoring it means re-adding
one markup block; its CSS is still in `styles.css`.

Nav anchors (`#benefits`, `#how-it-works`, `#conditions`, `#pricing`), the step
accordion, the conditions toggle, the FAQ and the dynamic trial date were all
re-verified against the live DOM after the reorder.

---

## 3b. Teleconsultation section — editorial, not cards

The four equal feature cards were replaced by a two-column editorial layout:
`teleconsultation.jpg` on the left, and on the right the eyebrow, **"Healthcare
That Fits Your Day."**, the supporting line, then three rows separated by hairline
rules — Skip the Clinic Trip · Save Time · Stay Comfortable — closing on the
hours line. Small teal markers, no numbered circles, no oversized icons.

**Source order matters here.** The grid children are `tele-head`, `tele-figure`,
`tele-body`, so mobile reads heading → image → rows → hours as specified, while
`grid-template-areas` at ≥1024px pulls the figure into the left column spanning
both rows. Do not reorder the markup to "fix" desktop — it would break mobile.

**Image crops** are responsive so the phone and the chat stay legible and the
image never gets too tall: `1/1` below 600px, `3/2` from 600px, `4/5` from
1024px (the source is 1145×1374, so the desktop crop is almost the full frame).
Served as `tele-560.jpg` / `tele-900.jpg` — **1.8 MB → 96 KB on a phone.**

**Row titles are title case** ("Skip the Clinic Trip"), not the all-caps of the
brief's layout sketch, to match every other `h3` on the page.

**Position.** It now sits between the benefit cards and the conditions list, per
the stated flow: what you get → why it helps → what you can use it for. That is a
move from its previous slot after the conditions; one block relocation, easy to
undo.

Gaps measured compact: cards → section 14–40px, section → conditions 65–96px.

> **Image content note.** The phone screen in `teleconsultation.jpg` shows a chat
> with a named fictional doctor, the phrase "mild respiratory infection", and an
> "e-Prescription" row. None of that is page copy and it reads as a UI mockup,
> but respiratory tract infection is not on the approved 21-condition list (cough
> and sore throat, which the patient message mentions, are). Worth a glance from
> whoever signs off the creative.

---

## 4. Journey sections consolidated into one

Three sections explained the same journey. Two were removed —
**"More Than a Doctor's Call"** (the chain + phone mockup) and **"Your Doctor,
Right From Your Phone"** (the MyMed block + medication journey) — and
**How WeCare Works** was rebuilt as the single consolidated explainer:
*Simple Care, From Start to Finish.*

It is now a **dark WeKongsi band** — navy `#061634` → teal `#05433E` →
teal-green `#0A5540`, with two soft radial glows for depth. Three dark-glass
panels carry the steps, and the section opts into `.on-dark` so the shared token
set flips text, borders and surfaces automatically.

The three steps are **photographic accordion cards**: `join.jpg`,
`talktodoctor.jpg`, `getyourmedication.jpg` at the top of each (served as
`step-{join,doctor,medication}-{480,800}.jpg` — 5.7 MB of sources down to
136 KB on a phone, 284 KB on desktop). Image containers are a fixed 168px on
mobile and 190px on desktop, so the three stay aligned whatever the crop.

**The whole card is the control.** Each is a single `<button>` wrapping image,
number, title and short description, with `aria-expanded` / `aria-controls` and
a keyboard focus ring — no click-the-plus-only trap. Because a `<button>` may
only contain phrasing content, the titles are styled `<span>`s rather than
headings; the section keeps its `h2`.

**True single-open accordion**, verified by driving the live DOM: opens `O--`,
clicking another gives `--O` (the first closes), clicking the open one gives
`---`. Panels ship open in the HTML and JS closes them, so a no-JS visitor still
reads every step. The `+` becomes `−` by rotating one bar of the glyph.

**Only the open card grows.** `align-items: start` on the grid stops the row
stretching its neighbours, and `.ac-desc` carries a `min-height` so the three
*closed* cards stay level — measured 335/335/335 on mobile and 370/370/370 on
desktop. A third line is reserved between 900–1079px, where card 03's
description wraps further.

**The section explains actions, not price.** Step 01 reads *"Download the MyMed
app and sign in using your WeKongsi Membership ID"* — the free 30-day offer was
deliberately taken out of here and lives in the hero badge, hero price, pricing
heading and the CTAs instead. Audited after the edit: no "free 30-day", RM15,
RM60, 6-month or 12-month wording anywhere in this section; the only "free" left
is *free and unlimited teleconsultations*, which is the benefit, not the promo,
and RM40 appears only in the medication context.

**No icons anywhere inside it, by design.** The only step identifier is the
numeral — 42px (48px on desktop) Red Hat Display in bright turquoise. Verified
programmatically: zero `<svg>` inside the section, zero pills or badges inside
the cards. Hierarchy is number → title → description → small supporting text.

Cards are equal height where it matters (measured 379/379/379 at 900px and
353/353/353 at 1440px); below 900px they stack, so the constraint does not apply.
Supporting text is pinned with `margin-top: auto` so it bottom-aligns across the
row regardless of how much each step carries. A 1px teal line plus a small
chevron sits between panels on desktop; a single chevron between them on mobile.
The three-up information strip was removed: all three facts already sit in
steps 02 and 03, so the strip was pure repetition.

Classes are prefixed `.hw-*` rather than reusing `.jstep-*`, so none of the
previous step styling can leak in. It sits between the teleconsultation section
and the conditions list.

### Eligibility — compact, subordinate

Four large icon-circle cards became **four divider-separated text items**: one
row on desktop, stacked with hairline rules on mobile, a 14px teal check as the
only mark, no cards and no icon circles. The section moved up to sit directly
after How WeCare Works, so the page reads *how does it work? → can I join?*

It is deliberately the lighter of the pair: measured **305–449px tall against
725–1291px** for the dark band, on a mint `#E7F8F5 → #F3FCFA` ground that makes
the dark-to-light transition the visual break between them. Section padding is
`calc(var(--sec-y) * .52)`.

**A fact was rescued in the move.** *"A teleconsultation on its own does not use
a Care Episode"* existed **only** inside the deleted "More Than a Doctor's Call"
section, and the brief lists it under content accuracy. It is now a supporting
line under Step 02. Every other required fact — MyMed + Membership ID, daily
9 AM – 10 PM, 30-day refresh, no carry-forward, up to RM40, pickup or delivery,
5 PM cut-off — is carried in the three steps and verified by string match.

The page is **~17% shorter**: 13,741px → 11,365px at 390px.

Removing those sections also retired the MyMed logo placeholder, so §1.4 no
longer applies unless a MyMed block returns.

**Dead CSS.** `.wyg-*`, `.chain*`, `.phone*`, `.ps-*`, `.float-card*`,
`.mymed*`, `.mv-*`, `.medjourney*` and `.not-suitable`/`.ns-*` are now unused
but still in `styles.css` (~8 KB), left deliberately so any removed section can
be restored by re-adding markup alone. Safe to strip when the layout settles.

---

## 5. Teleconsultation enhancement (added after the first build)

Four additions, all built from the existing design system — no new colours,
type or components were introduced:

| Section | Where it sits | What it carries |
|---|---|---|
| **Healthcare That Fits Your Day** | between the benefit cards and the conditions | Two-column editorial: `teleconsultation.jpg` on the left, three rule-separated rows on the right, hours line at the foot |
| **Your Doctor, Right From Your Phone** | after How It Works | MyMed lockup, Membership ID, hours, a video-call card, and the consult → medication → pickup/delivery journey ending in the 5 PM cut-off |
| **Everyday Health Concerns** | intro *inside* the existing Conditions section | 8 icon chips that group the approved list; the 21 approved conditions are untouched below it |

Also updated in place: How It Works steps 2 and 3 now carry small timing and
delivery badges; the pharmacy benefit card says "participating pharmacies";
the medication-delivery FAQ answer was reworded; and a new emergencies FAQ was
added. Nothing else was touched — pricing, CTAs, eligibility, Care Episode
rules, the conditions list and the WeKongsi cost-sharing offer are unchanged.

The 8 concern chips are groupings, not new coverage claims: every one maps to
approved conditions already on the page (e.g. "Women's health" → Dysmenorrhea,
UTI). No condition was added or removed.

**Length.** The page grew from ~9,400px to ~12,500px at 390px. That is the
cost of four new sections; each is deliberately compact. If it needs trimming,
the "Why Choose Teleconsultation" grid is the most compressible.

---

## 6. The dynamic trial-end date

The payment disclosure reads *"Your free 30 days ends on **[date]**"*. The date
is **never hard-coded** — `script.js` computes `today + 30 days` and formats it
for `en-MY` (e.g. *14 October 2026*).

With JavaScript off, the sentence degrades to *"…ends on 30 days after you sign
up"*, which is still accurate.

> If sign-up happens on a later date than the page view, have the sign-up flow
> render the authoritative date. This page shows the date as seen today.

---

## 7. Approved copy — do not edit casually

These are load-bearing compliance statements, verified in place:

- Teleconsultation hours appear as **9 AM – 10 PM daily, including weekends** (10×).
  **"24/7", "anytime" and "around the clock" appear nowhere on the page** — verified.
- Medication delivery always carries the **daily 5 PM order cut-off**.
- Medication is **up to RM40 per Care Episode**; above RM40 is paid by the member.
- Care Episodes: **1 every 30 days, unused episodes lapse, no carry-forward.**
- **A teleconsultation on its own does not use a Care Episode** — stated in
  "More Than a Doctor's Call".
- All **21 approved conditions** appear, verbatim, with none added or removed.
  The supporting line says "more than 25 minor acute conditions. These include:".
- Prices are RM0 / RM15 / RM40 (was RM90) / RM60 (was RM180) / RM360 — no
  derived "you save RMxx" claims were introduced.
- WeCare is never described as insurance. No internal commercial information appears.

### 7.1 Open compliance question — text inside the supplied benefit artwork

The page's own copy is clean. The four supplied illustrations have marketing copy
baked into the pixels, and some of it does not match the approved facts:

| Image | Baked-in text | Issue |
|---|---|---|
| Teleconsultation | **"MyMed — Talk to a Doctor, Anytime"** | **Directly contradicts 9 AM – 10 PM.** The brief bans "anytime" for doctor availability. Highest priority. |
| Teleconsultation | "Chat, Voice or Video Call" | Channel detail is not in the approved product facts. |
| Care Episode | "Follow-up Care" in the checklist | Not an approved benefit. |
| Care Episode | Calendar reads "Every Month", months ticked | Approved rule is *every 30 days*, which is not a calendar month. |

Baked-in text also cannot be translated to BM and is illegible at card size
(cards render 150–265px wide). Reissuing the artwork without text would fix all
four at once and match the original brief ("do not put marketing copy inside the
image").

Palette note: the teleconsultation and care-episode illustrations use bright
medical blue with red accents, which sits outside the navy/teal identity. The
pharmacy illustration is the closest to brand.

---

## 8. Theme — INFII structure, WeKongsi palette, light with dark anchors

The page was re-skinned against the INFII reference (`INFII Website Reference/`).
**Not one word of content changed** — same DOM, same 208 class names, same copy.
`styles.css` was rewritten and the font links swapped. The previous light theme is
kept at `styles.light-theme.css.bak`, and the all-dark first pass at
`styles.dark-only.css.bak`; swap either over `styles.css` to revert.

**Cache busting.** `index.html` loads `styles.css?v=N` and `script.js?v=N`. Bump
`N` on any release that changes CSS or JS, or returning visitors keep the old
copy. The local dev server also sends `Cache-Control: no-store`.

What was taken from the reference, and what was not:

| Taken | Not taken |
|---|---|
| Near-black canvas with ambient radial light | INFII's `#0a0a14` — ours is `#050B1F`, WeKongsi navy pushed near-black |
| Floating glass pill navigation over the hero | — |
| Oversized display type, tight tracking | — |
| Gradient pill CTAs with glow | INFII's `#6366f1 → #a855f7` violet — ours stays teal→turquoise |
| `rounded-full` geometry (the reference uses it 306×) | — |
| Glass cards, `backdrop-blur`, hairline white borders | — |
| Red Hat Display + Outfit typefaces | — |

**The page is light, with three dark anchors.** An all-dark page read as a
premium fintech product rather than an affordable Malaysian healthcare one, so
the rhythm alternates white, off-white `#F7FBFA` and light-teal `#E7F8F5`
washes, and drops to navy only for the hero, the What You Get product visual,
and the closing CTA + footer.

| Band | Background |
|---|---|
| Hero | navy `#071232` + teal glow — **dark** |
| Quick Benefits | white |
| Why Teleconsultation | light-teal wash |
| What You Get | navy + teal glow — **dark** |
| How It Works | white |
| MyMed | light-teal wash |
| Lifestyle | off-white |
| Conditions | white |
| Eligibility | light-teal wash |
| Pricing | white |
| Cost-sharing | off-white |
| FAQ | white |
| Final CTA + Footer | navy + teal glow — **dark** |

**One token set, two modes.** `:root` holds the light values; `.on-dark`
re-points the *same* token names, so every component works in both without a
duplicate ruleset. Four elements carry `.on-dark`: hero, What You Get, final CTA,
footer. Moving a section between modes is a one-class change.

Theme-sensitive pairs: `--accent-ink` (teal as text) is `#04625E` on light and
`#00D6C4` on dark; `--icon` (teal as an icon) is `#008F89` / `#00D6C4`. Surfaces,
lines and all three ink levels flip the same way.

**The CTA is identical in both modes** — the bright brand turquoise
`#0AE6D2 → #00C9B8` with a near-black navy label at 10.3:1. On white it gains a
hairline teal ring so its edge is defined; on navy it gains a glow. One button,
one brand colour, everywhere.

**The header flips with the page.** It floats transparent with a white logo over
the dark hero, then becomes white glass with the full-colour logo and navy nav
once you scroll past — `.is-stuck` swaps the same tokens.

**The logo is reversed to white only on the dark bands** (`filter: brightness(0)
invert(1)`), since the WeKongsi wordmark is navy and would vanish there. It shows
in full colour in the stuck header. If you have a proper reversed lockup, drop it
in and remove the filter — that is the better answer than a CSS filter.

**Length.** The bigger type scale and wider spacing take the mobile page from
~12,500px to ~14,000px. That is inherent to the reference's proportions; tightening
`--sec-y` is the single lever if it needs to come down.

---

## 9. Design notes worth knowing

**The hero is one image, cropped three ways.** Mobile stacks copy over a 4:3
card cropped to `72% 50%` so her face and the doctor call stay visible; tablet
switches to a 4:5 portrait at `78%`; desktop (≥1024px) goes full-bleed with the
copy sitting in the image's own negative space behind a left-to-right scrim.

**Contrast (light theme, kept in the `.bak`).** The brand turquoise `#00BFAE`
only reaches 2.3:1 against white, so white-on-teal buttons fail WCAG AA there.
That theme split the difference: deep teal + white text for buttons (4.7–6.1:1),
bright turquoise + navy text for badges and pills (7.8:1). The dark edition does
not have this problem — see §5.

**The "What's Included" cards are deep green with white text**, on a client
reference. The green is `--green-from: #0F5647` → `--green-to: #093B32`, taken
off the green end of the WeKongsi hand mark rather than an unrelated forest
green. White headings clear 8.9:1 on it and the 80%-white body copy clears
6.8:1 — both well past AA. Change the two tokens in `:root` to retune the shade;
nothing else needs touching.

**Prices use a raised-`RM` lockup** (`<span class="cur">RM</span>0`). At display
sizes Inter's zero is easily misread as a letter O — "RM0" is the single most
important number on the page, so the currency is set smaller and raised, leaving
the numeral unmistakable.

**Sticky mobile CTA** hides itself whenever any real sign-up button is on screen
(IntersectionObserver over every `[data-cta="signup"]`), and only appears once
the hero CTA has been scrolled past. It uses `env(safe-area-inset-bottom)`, and
`<body>` reserves matching bottom padding so it never covers the footer.

**Optional images fade in, they are never `display:none`.** A `display:none`
image with `loading="lazy"` is never fetched by the browser, so its `load` event
never fires — the swap-in would deadlock and the placeholder would stay up
forever. Each `[data-slot] > img[data-optional]` is therefore absolutely
positioned at `opacity: 0` above its placeholder and fades to `opacity: 1` when
it loads. Keep supplied artwork opaque: the placeholder stays behind it.

**Progressive enhancement.** FAQ answers ship **open** in the HTML and JS
collapses them, so a no-JS visitor reads every answer. Same for scroll reveals:
`.reveal` only hides once `<html class="js">` is set. `prefers-reduced-motion`
disables every animation.

---

## 9b. Pricing — three genuine choices

Three cards, free one as the hero.

| Card | Price | Value |
|---|---|---|
| 30 Days | **Free** (never "RM0") | 1 Care Episode · up to RM40 |
| 6 Months | RM40 with **~~RM90~~** beside it | 6 Care Episodes · up to RM240 |
| 12 Months | RM60 with **~~RM180~~** beside it | 12 Care Episodes · up to RM480 |

**All three cards are composed surfaces.** The paid cards are no longer plain
white: 6-month is a light-teal wash, 12-month a slightly greener one, each with
its own teal border and shadow, so the pair reads as related without competing
with the free card's dark gradient.

**Billing frequency is a line of type, not a box.** `**Semi-annual** · Billed
every 6 months` sits directly under the SAVE pill as part of the price
hierarchy. The tinted billing panels were removed: the only bordered-and-filled
element left inside a paid card is the SAVE pill itself (measured — free card
has none), so the cards read as typography and whitespace rather than boxes
inside boxes.

Struck prices are 30–34px muted grey-blue against the 44–48px navy promo price;
the SAVE pill is 14–15px bold uppercase teal, deliberately smaller than the
struck price but heavier in colour so it still outranks it.

> **The monthly plan was removed** from the pricing section at the client's
> instruction, so **RM15 / month no longer appears anywhere on the page** —
> verified by search. The original brief listed Monthly as an approved plan and
> said not to hide the other options, so this is worth a deliberate sign-off
> rather than an oversight. Restoring it is one markup line.

**Card terms read "6 Months Membership" / "12 Months Membership"** so RM40 and
RM60 cannot be mistaken for a monthly rate.

**SAVE sits beside the price**, not at the card foot: `SAVE RM50` / `SAVE RM120`
as an uppercase teal pill directly under `RM40 ~~RM90~~`, so price → saving →
billing reads as one block. The medication amount is emphasised in every card
(`Up to **RM240** of eligible medication`).

**The free card carries a slow attention effect** — a 5s teal glow cycling on
the card shadow and the START HERE badge. No movement, no scaling; `prefers-
reduced-motion` stops it via the global rule.

**Empty space is gone.** Measured across widths: the largest gap anywhere inside
a card is 34px (was ~86px), the price→billing gap is 14px on the free card and
28–34px on the paid ones, and bottom slack is 27–33px — the card's own padding.
Paid cards use `justify-content: space-between` so the slack from having no CTA
spreads evenly instead of pooling into one void. Desktop card height dropped
564px → 529px. Section background is a
soft teal wash with a radial light behind the cards rather than flat white.

**Billing frequency is named at the price**, because these are recurring
memberships and "Paid in advance" alone did not say so:

| Card | Cycle line |
|---|---|
| 30 Days | For your first 30 days |
| 6 Months | Semi-annual · Billed every 6 months |
| 12 Months | Annual · Billed every 12 months |
| ~~Monthly~~ | **removed from the page** — see below |

The struck normal price now sits on the price line at 24–27px rather than as a
footnote, so RM90 → RM40 reads as a promotion at a glance. "Preselected at
sign-up" and its teal border are gone — the three read as real choices.

**Tablet is 2 + 1.** Between 620–859px three columns would squeeze the cards to
215px and break their inner alignment, while a single column stretched them to
660–795px. That range now lays out two cards on the first row and centres the
third below at the same width, with `grid-auto-rows: 1fr` keeping both rows the
same height.

**Alignment is enforced, not hoped for.** Fixed-height bands (`.pp-head`,
`.pp-pricing`, `.pp-value`) make the term, price, value and benefit rows start at
the same y in all three cards, and `.pp-tail { margin-top: auto }` lands the last
line — "No payment today." / "Paid in advance" — on a shared baseline. Verified
by measuring the live DOM at 860/940/1024/1280/1440/1600: equal card heights and
all four rows aligned at every one. The 860–1023 band needed a taller value track
because "Up to RM240 of eligible medication" takes a second line there.

### The payment disclosure was removed from this section

The "Nothing is charged today." box and the computed trial-end date are gone, at
the client's request and for a good reason: the date was `today + 30 days`, which
is wrong for anyone who signs up on any day other than the one they first viewed
the page. A static page cannot know a member's sign-up date.

What still carries the no-charge message: "No payment today." under the free
card's CTA, in the hero and at the final CTA, plus two FAQs — *"Will I be charged
today?"* and *"Is WeCare really free for the first 30 days?"*

> **What was lost:** the explicit *"on that date we will charge the amount for
> your selected plan"* sentence and *"you can cancel any time before then and you
> will not be charged."* The original brief called that disclosure critical. If it
> is needed on the page, a date-free line under the CTA would restore it without
> reintroducing a wrong date — e.g. *"Your plan starts after your free 30 days.
> Cancel any time before then."* Otherwise the sign-up / payment-mandate flow must
> carry it.

`setTrialEndDate()` is left in `script.js` and no-ops safely (it exits when no
`[data-trial-end]` node exists), ready if a dynamic date is wanted later.

---

## 10. Performance

The supplied `wecare-hero.png` is 1.7 MB. Four JPEG variants were generated and
wired up with `srcset`/`sizes` + `<link rel="preload">`:

| | size | served to |
|---|---|---|
| `wecare-hero-640.jpg` | 58 KB | phones |
| `wecare-hero-960.jpg` | 106 KB | large phones / tablets |
| `wecare-hero-1280.jpg` | 162 KB | laptops |
| `wecare-hero-1672.jpg` | 250 KB | large desktops |

The four benefit illustrations arrived as 1.5–1.7 MB PNGs — **6.1 MB for four
tiles that render 150–265px wide.** They are served as JPEGs instead:

| | size |
|---|---|
| `benefit-*-400.jpg` (phones) | 32–39 KB each, **147 KB total** |
| `benefit-*-640.jpg` (desktop) | 66–81 KB each, **312 KB total** |

**6.1 MB → 147 KB on a phone.** Source PNGs are kept and no longer requested.

**A phone now downloads 58 KB instead of 1.7 MB — 97% less.** The original PNG
is kept as the source of truth; it is no longer requested by the page.

No WebP/AVIF encoder was available on this machine. If your build pipeline has
one, adding `.webp`/`.avif` sources to the `<picture>` would cut another ~30%.

Everything else is already light: all icons are one inline SVG sprite (zero
requests), no JS libraries, below-the-fold images lazy-load. The only external
request is the Inter webfont from Google Fonts (`display=swap`, with a full
system-font fallback stack) — self-host it if the telco webview blocks
third-party origins.

---

## 11. QA performed

Rendered and inspected in headless Chrome at **320, 360, 375, 390, 414, 430,
500, 600, 768, 834, 1024, 1280, 1440 and 1920px**.

- **No horizontal scrolling at any width** (`scrollWidth === clientWidth` at all 14).
- Hero crops correctly and her face stays visible at every breakpoint; no text
  sits over a busy area of the photograph.
- Heading order is clean h1 → h2 → h3 with no skips; every `<img>` has `alt`
  (empty for decorative) and explicit `width`/`height`.
- Accordion and conditions toggle drive `aria-expanded` / `aria-controls`; FAQ
  panels are labelled regions; skip link, visible focus rings, ≥48px touch targets.
- Sticky CTA, FAQ open/close and "Show all conditions" all verified in a live
  390px viewport.
- No essential information exists only inside an image.
- Re-verified after the teleconsultation enhancement at 320/375/390/430/768/
  1024/1440: no horizontal scrolling, heading order still h1→h2→h3 with no
  skips, all 21 approved conditions intact, pricing and CTAs unchanged, and the
  only "any time" strings on the page refer to cancelling a plan, never to
  doctor availability.

Not yet done: testing on physical iOS/Android devices, and a Lighthouse run
against a real host (file:// scores are not meaningful).

---

## 12. Unused asset

`images/wecare-logo.png` (2000×2000) is a WeCare hand-and-heart lockup with a
navy wordmark — on-brand, but not currently placed. The header uses a text
"WeCare" chip beside the WeKongsi logo. Say the word and it can take that slot,
or sit in the hero above the headline.
