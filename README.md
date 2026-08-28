# Alabama Pet Transport Services — website

A static, dependency-free site. No build step, no framework, no server code: upload the
files as they are and the site works.

## Structure

Everything sells from **one page**. The nav scrolls to sections rather than loading new
pages; only the two legal pages are separate documents.

| File | Purpose |
| --- | --- |
| `index.html` | The whole site: hero, `#services` (positioning + the five trip types), how it works, `#pricing`, `#about`, `#reviews`, `#faq`, `#contact` |
| `privacy.html` | Privacy Policy |
| `terms.html` | Terms of Use |
| `404.html` | Not-found page |

Supporting files: `sitemap.xml`, `robots.txt`, `site.webmanifest`, `_headers`,
`assets/css/styles.css`, `assets/js/main.js`, `assets/img/`.

Section anchors are `#services`, `#pricing`, `#about`, `#reviews`, `#faq`, `#contact`
(plus `#top`). Links from the legal and 404 pages use the `index.html#section` form. If
you rename a section id, update the nav, the footer, and those cross-page links together.

## Deploying

Upload the whole folder to any static host (Netlify, Cloudflare Pages, Vercel, S3,
cPanel). Point `alabamapettransport.com` at it and serve over HTTPS.

* `_headers` sets security headers and asset caching. It is read automatically by
  Netlify and Cloudflare Pages; on other hosts, configure the equivalent or delete it.
* Configure the host to serve `404.html` for missing pages.
* After launch, submit `https://alabamapettransport.com/sitemap.xml` in Google Search
  Console, and connect the Google Business Profile so reviews and the map listing tie
  to the site.

## How the quote form works

Leads are delivered by **text**, so the form does not post to a server. It gathers the
details, opens the visitor's own messaging app with the message pre-written to
(205) 753-5659, and the visitor presses send. If the messaging app does not open, the
message is shown on the page with a copy button.

This means there is no backend to maintain and no database holding customer data. If
you later want emailed leads as well, that is the piece to add.

## Things to keep current

* **Reviews.** The review cards live in the `#reviews` section, and the matching
  `Review` / `aggregateRating` structured data sits in the `<head>` of `index.html`.
  When you gain new reviews, add the card and the schema entry together, and bump
  `reviewCount`. That count is required by schema.org but is deliberately not shown
  anywhere on the page.
* **Phone number.** Appears as `tel:+12057535659` / `sms:+12057535659` and as display
  text. Search all files for `753-5659` and `12057535659` if it ever changes.
* **Pricing.** `$0.50 per mile` and the over-eight-hours fee appear in the hero, the
  `#pricing` and `#faq` sections, `terms.html`, and the `Service` structured data.
* **Service types.** The cards in `#services` are mirrored by `hasOfferCatalog` in the
  `Service` structured data. Add or remove a card and update that list to match.
* **FAQ.** The questions in `#faq` are mirrored in the `FAQPage` structured data in the
  `<head>`. Edit both, or the schema stops matching the page.
* **Legal pages.** `privacy.html` and `terms.html` are dated January 2025. Update the
  date whenever you change them, and have a lawyer review them before relying on them.

## Editing notes

* One stylesheet, `assets/css/styles.css`. Colours, spacing and shadows are CSS custom
  properties in the `:root` block at the top — change the brand colour in one place.
* `assets/js/main.js` handles the mobile menu, the sticky-header shadow, the nav
  section highlighting, the scroll reveal and the quote form. The site is fully usable
  with JavaScript disabled.
* The header and footer are duplicated in each HTML file. Edit one, then copy the same
  change into the others.

## Source material

Content came from the completed onboarding form and five Google review screenshots in
`images/`. Customer photographs from those screenshots were deliberately not
republished — only the review text, which is already public.
