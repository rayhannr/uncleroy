---
name: blog-cover
description: Generate the cover/title image for a blog post using this repo's own dev-only /cover route — given an Unsplash page link, downloads the image, fills in imageCredit/imageLink, screenshots the cover headlessly, converts to webp under 100KB, and drops it into the blog images folder. Use when the user has finished a blog draft, picked an Unsplash photo, and needs the cover image made.
---

You are generating a blog cover image using this repo's own `/cover` route
(`src/pages/cover.astro`) — a dev-only page (404s outside `astro dev`) that renders
the hero styling and accepts `bg` and `title` as query params.

## 1. Gather inputs

- **Slug**: infer from context (open/referenced draft file) or ask.
- **Title**: read the `title` field from `src/contents/blog/[slug].md` frontmatter,
  lowercase it — matches the existing `imageCaption` convention
  ("An image with the text \"[title, lowercased]\"").
- **Unsplash link**: ask the user for the Unsplash *page* URL (e.g.
  `https://unsplash.com/photos/<description>-<id>`) if not already given — not a
  direct image URL.

## 2. Resolve the Unsplash page and download the image

WebFetch the Unsplash page URL, asking for the photographer's name and a direct
downloadable image asset URL (an `images.unsplash.com/...` URL — e.g. from the
page's og:image or similar). Then:

- `curl` the direct asset URL down to `public/cover-tmp/[slug].jpg` in this repo
  (create the `cover-tmp` folder if needed) — this is a throwaway file the dev
  server will serve locally, cleaned up at the end.
- Update `src/contents/blog/[slug].md` frontmatter in this repo:
  - `imageCredit`: the photographer's name (e.g. "Callum Shaw" — name only, no
    "Photo by" / "on Unsplash" wrapper, matching existing posts)
  - `imageLink`: the original Unsplash *page* URL the user gave you (not the asset
    URL used for downloading)

## 3. Start the dev server

Run `bun start` (this repo's `astro dev` script) in the background if it's not
already running, on port 3000 per `astro.config.mjs`. Poll `http://localhost:3000`
(e.g. curl, retry with short delays) until it responds before moving on.

## 4. Screenshot headlessly

Use headless Chrome or Edge directly — no browser tool needed:

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --hide-scrollbars --screenshot="<tmp-path>\[slug].png" --window-size=1888,880 "http://localhost:3000/cover?bg=/cover-tmp/[slug].jpg&title=[url-encoded lowercase title]"
```

(Fall back to Edge at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
with the same flags if Chrome isn't available.) URL-encode the `title` query param
value. Use the scratchpad/temp directory for the intermediate PNG, not the repo.

1888×880 matches the dimensions of existing published cover images.

## 5. Convert to webp, keep it under 100KB

Run `node scripts/cover-to-webp.js <tmp-path>\[slug].png [slug]` — it encodes to
webp starting at quality 80, steps quality down (70, 60, 50...) if over 100KB, and
writes the result to `src/contents/blog/images/[slug].webp`.

Existing published covers are all under 100KB — match that.

## 6. Clean up

- Delete `public/cover-tmp/[slug].jpg` (and the folder if now empty) — it must
  never end up committed or deployed.
- Only stop the dev server if this skill was the one that started it (don't kill a
  server the user already had running for other work).

## 7. Report

Tell the user the final image path (`src/contents/blog/images/[slug].webp`), its
size, and confirm `imageCredit`/`imageLink` were set on the post.
