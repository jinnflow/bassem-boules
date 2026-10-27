# Bassem Boules: portfolio website

Portfolio, lead magnet and commissions site for Bassem Boules ([@bassem_paul_art](https://www.instagram.com/bassem_paul_art/)), Egyptian artist and illustrator in Dubai.

## What's here

| Path | What it is |
| --- | --- |
| `index.html`, `css/site.css`, `js/site.js` | The site. Plain HTML/CSS/JS, no build step, no framework. |
| `content/site.json` | **All the words and artworks.** The page renders from this file. |
| `.pages.yml` | Form-based editor config for [Pages CMS](https://pagescms.org) (free). |
| `guide.html` | The lead magnet: *The Old Masters' Portrait Notes*, a 5-lesson guide. |
| `assets/works/`, `assets/img/` | Optimised artwork and studio images (sources: his public Instagram posts and published print listings). |
| `assets/uploads/` | Where Pages CMS stores images Bassem uploads. |
| `HOW-TO-EDIT.md` | Plain-language editing guide for Bassem (English + Egyptian Arabic). |

## Design

A dark gallery built on chiaroscuro, the light-and-shadow of the Old Masters he trained in.

- **Hero**: Bassem himself, black-and-white on black, with his name set very large (Latin and Arabic), a one-line positioning statement and two calls to action.
- **About**: introduction, key numbers (14 years, 500+ workshops, 48.6K followers) and "Presented with" Dubai TV, Sharjah Art Foundation and Dubai Culture.
- **Lamp section**: his charcoal *Eye Study I* sits almost black; the cursor (or a finger) is a warm lamp that lights the drawing, with a slight flicker. Idle, the light drifts on its own.
- **Mastered skills**: portrait drawing, risograph, digital art, watercolour. Hovering a row floats an example image beside the cursor; on phones the image sits in the row.
- **Gallery**: 15 works with medium filters and a full-screen viewer (story, arrow keys, swipe).
- **Work with me**: portrait commissions, public art & murals, private instruction, mentorship, workshops for organisations, illustration & design. Each links to the enquiry form with that service preselected.
- **Workshops** (the one light room), press quote, **free guide** (lead magnet) and **Start a project** enquiry form.

The site never names the institutions he teaches with, by request; only Dubai TV, Sharjah Art Foundation and Dubai Culture are named.

Type: Cormorant Garamond (display), Hanken Grotesk (text), Amiri (Arabic name).

## Go live (free, about 15 minutes)

1. **Hosting**: in GitHub, *Settings → Pages → Deploy from branch → `main` / root*. Free Pages needs a public repo; for a private repo use [Cloudflare Pages](https://pages.cloudflare.com) (also free, no build command, output directory `/`).
2. **Editor**: Bassem signs in at [app.pagescms.org](https://app.pagescms.org) with GitHub and opens this repo. `.pages.yml` gives him forms for every section.
3. **Forms**: create two free forms at [formspree.io](https://formspree.io) and paste their endpoints (`https://formspree.io/f/xxxx`) into `guide.formEndpoint` (guide sign-ups) and `contact.formEndpoint` (project enquiries). Without them, guide visitors still get the guide (emails not stored) and enquiries fall back to opening the visitor's email app.
4. **Domain (optional)**: buy e.g. `bassemboules.com` (~10–15 USD/yr), add it under *Settings → Pages → Custom domain*.

## Moving to another CMS later

Content is one structured JSON file and the site is static, so it ports cleanly: each object in `works` maps to a CMS collection item (title, year, medium, size, image, status, price, link, story), `teaching.sessions` to a second collection, and the rest to single fields. Webflow, Framer, WordPress or Squarespace can all hold it.

## Local preview

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```
(The page fetches `content/site.json`, so open it through a server, not as a file.)

## Content to confirm with Bassem

- Arabic spelling of his name (`باسم بولس`).
- Titles for Instagram pieces were written from his captions (e.g. *Eye Study I*, *Tear*, *Teaching Study*); he may prefer his own titles, and should confirm *The Pantocrator* medium.
- Images from Instagram are 640–1440 px; higher-resolution originals from him will look sharper.
- Service list and descriptions in "Work with me", and the watercolour example image (currently a teaching photo; a watercolour of his own would be better).
- The guide text in `guide.html` is a draft in his teaching voice, based on his workshop descriptions; he should read and adjust it.
