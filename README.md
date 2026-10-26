# Bassem Boules: portfolio website

Portfolio, lead magnet and commissions site for [Bassem Boules](https://tashkeel.org/artists/bassem-boules), Egyptian portrait artist and illustrator in Dubai.

## What's here

| Path | What it is |
| --- | --- |
| `index.html`, `css/site.css`, `js/site.js` | The site. Plain HTML/CSS/JS, no build step, no framework. |
| `content/site.json` | **All the words and artworks.** The page renders from this file. |
| `.pages.yml` | Form-based editor config for [Pages CMS](https://pagescms.org) (free). |
| `guide.html` | The lead magnet: *The Old Masters' Portrait Notes*, a 5-lesson guide. |
| `assets/works/`, `assets/img/` | Optimised artwork images. `assets/img/hero-sketch.jpg` is a pencil version of the hero painting used by the reveal. |
| `assets/uploads/` | Where Pages CMS stores images Bassem uploads. |
| `HOW-TO-EDIT.md` | Plain-language editing guide for Bassem (English + Egyptian Arabic). |

## Interactions

- **Hero reveal**: the painting *Between the Past and Future* starts as a graphite drawing. The cursor (or a finger dragged sideways) paints the finished work in with a charcoal-textured brush; it slowly fades back to the drawing, and an automatic "hand" redraws it now and then. A button shows the full painting for keyboard and touch users.
- **Riso name**: the name is printed in three layers (Riso Blue, Bright Red, key black) that drift slightly out of register with the cursor.
- **Loupe**: hovering an artwork shows a 2.6× magnifier to look at the line work.
- **Viewer**: clicking a work opens its story, dimensions, availability and a link to the Tashkeel shop.
- All motion respects `prefers-reduced-motion`; light and dark themes are both designed (toned paper / charcoal paper).

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
- Year of the *Galactic Adventure* sketchbook (left blank).
- Commission steps and wording (written as a sensible default).
- The guide text in `guide.html` is a draft in his teaching voice, based on his workshop descriptions; he should read and adjust it.
- More works: the site shows the four pieces public on Tashkeel. His Instagram (48.7K followers, 860+ posts) has much more: charcoal, soft-pastel and ink portraits should be added through the CMS.
