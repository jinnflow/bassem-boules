# Bassem Boules: portfolio website

Portfolio, lead magnet and commissions site for [Bassem Boules](https://tashkeel.org/artists/bassem-boules), Egyptian portrait artist and illustrator in Dubai.

## What's here

| Path | What it is |
| --- | --- |
| `index.html`, `css/site.css`, `js/site.js` | The site. Plain HTML/CSS/JS, no build step, no framework. |
| `content/site.json` | **All the words and artworks.** The page renders from this file. |
| `.pages.yml` | Form-based editor config for [Pages CMS](https://pagescms.org) (free). |
| `guide.html` | The lead magnet: *The Old Masters' Portrait Notes*, a 5-lesson guide. |
| `assets/works/`, `assets/img/` | Optimised artwork and studio images (sources: his public Instagram posts and the Tashkeel shop). |
| `assets/uploads/` | Where Pages CMS stores images Bassem uploads. |
| `HOW-TO-EDIT.md` | Plain-language editing guide for Bassem (English + Egyptian Arabic). |

## Design

A dark gallery lit by a single lamp, taken from the chiaroscuro of the Old Masters he studies (and the lantern in his own *Between the Past and Future*).

- **Hero lamp**: his charcoal *Eye Study I* sits almost black; the cursor (or a finger) is a warm lamp that lights the drawing, with a slight flame flicker. When nobody moves it, the light drifts across the eye on its own.
- **Gallery**: 15 works pulled from his Instagram and the Tashkeel shop, with filters by medium. Hovering one dims the rest; clicking opens a full-screen viewer with the story, keyboard arrows and swipe.
- **Close-up**: a full-width detail of his 2024 eye study with his own caption, moving slowly with scroll.
- **Workshops**: the one light (bone-white) room, with teaching photos and the workshop list.
- **Free guide** and **Commission** close the page. Motion respects `prefers-reduced-motion`.

Type: Cormorant Garamond (display), Hanken Grotesk (text), Amiri (Arabic name).

## Go live (free, about 15 minutes)

1. **Hosting**: in GitHub, *Settings → Pages → Deploy from branch → `main` / root*. Free Pages needs a public repo; for a private repo use [Cloudflare Pages](https://pages.cloudflare.com) (also free, no build command, output directory `/`).
2. **Editor**: Bassem signs in at [app.pagescms.org](https://app.pagescms.org) with GitHub and opens this repo. `.pages.yml` gives him forms for every section.
3. **Email sign-ups**: create a free form at [formspree.io](https://formspree.io), copy its endpoint (`https://formspree.io/f/xxxx`) into `guide.formEndpoint` in `content/site.json` (or via the CMS). Leads then arrive in Bassem's inbox. Without it, visitors still get the guide but emails aren't stored.
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
- Commission steps and wording (written as a sensible default).
- The guide text in `guide.html` is a draft in his teaching voice, based on his workshop descriptions; he should read and adjust it.
