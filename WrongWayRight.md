# WrongWayRight

A running log of moments where the first approach was **wrong**, and the better one that replaced it. Newest entries at the top.

---

## 2. Using `<header>` for an article title, under a global `header { position: fixed }` rule

**Wrong way:** The article reader's title block was built as `<header class="post-header">…<h1>…</h1></header>` in `post.js`. On screen the `<h1>` overflowed off the right edge, sat as a faded ghost over the body, and stayed **stuck in place while scrolling**. I first blamed a Chrome `backdrop-filter` compositing bug and removed the entrance animation — which changed nothing, because that was a symptom, not the cause.

**Right way:** Measure before theorizing. One JS probe told the whole story:
```js
getComputedStyle(document.querySelector('.post-header')).position  // "fixed"
document.querySelector('.post-header h1').getBoundingClientRect().width // 1749 (full viewport)
// …inside a container computed at 760px
```
`style.css` has a bare element selector `header { position: fixed; width: 100%; z-index: 1000; backdrop-filter: blur(10px); }` for the site nav. A bare tag selector matches **every** `<header>` on the page, so the article header inherited fixed positioning and became a second, translucent nav bar. Fix: make it a `<div class="post-header">`. After the change the probe read `position: "static"`, `h1` width `680`, no horizontal overflow.

**Why:** Bare element selectors (`header`, `section`, `article`, `nav`) in a shared stylesheet are landmines — reuse that semantic tag anywhere and it silently absorbs the global styling. The visual symptoms (overflow, ghosting, faded text) all pointed at paint/compositing and sent me down a wrong path; the "sticky on scroll" clue plus a `getComputedStyle` read cut through it in one step. Cheap check next time a new page element looks haunted: read its computed `position`/`width` before hypothesizing about the renderer. Prefer class selectors (`.site-header`) over bare tags for anything positioned.

## 1. Verifying static pages by opening file:// in the browser tool

**Wrong way:** After building the blog pages, I tried to preview them by navigating the browser automation tool straight to the file path:
`navigate → file:///Users/bijayadhs/Desktop/BijayaGithubPortfolio/bjadhs_portfolio/blog.html`
It failed immediately: `Can't interact with browser-internal or unparseable URLs. Navigate to a web page first.`

**Right way:** Serve the directory over HTTP and point the browser at localhost instead:
```
python3 -m http.server 8765   # run from the project dir, in background
# then: navigate → http://localhost:8765/blog.html
```
This also matches how the site actually runs (GitHub Pages serves over HTTP), so relative paths, `?id=` query params, and script loading all behave exactly as in production.

**Why:** The Chrome extension refuses `file://` URLs — they're treated as browser-internal/unparseable, so there's nothing to attach to. It's tempting because a static site "is just files," but a local server costs one command and removes a whole class of file:// quirks (some `fetch`/CORS behavior differs, and the address bar state is different). Cheap check next time: if a page needs a browser and it's static, start `http.server` first rather than reaching for the file path.
