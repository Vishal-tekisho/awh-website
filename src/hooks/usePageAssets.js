import { useEffect } from "react";

/**
 * Loads the original page's CSS/JS assets (from /public/css, /public/js)
 * exactly like the static HTML pages did, and cleans them up on unmount.
 *
 * IMPORTANT: because this is a single-page app, navigating between routes
 * never triggers a full page reload/global scope reset. The legacy page
 * scripts declare top-level `const`/`let` bindings (e.g.
 * `const $ = s => document.querySelector(s)`), and almost every page reuses
 * the same names (`$`, `$$`, `toast`, ...). If two of these scripts were
 * ever loaded as plain <script src> tags in the same document, the second
 * one throws:
 *
 *   Uncaught SyntaxError: Identifier '$' has already been declared
 *
 * ...because removing a <script> element does NOT undeclare the top-level
 * bindings it created; they remain in the page's global lexical
 * environment for as long as the document is alive.
 *
 * To fix this, we fetch each script's source as text and inject it as an
 * inline script wrapped in an IIFE: `(function(){ ...source... })();`. That
 * gives every page's script its own private function scope, so `const $`
 * in one page's script can never collide with another page's `const $`,
 * regardless of how many times the user navigates between routes.
 *
 * @param {Object} opts
 * @param {string} opts.title - document title for this page
 * @param {string} [opts.brand] - value for html[data-brand] attribute
 * @param {string[]} [opts.css] - list of css hrefs (e.g. "/css/login.css")
 * @param {string[]} [opts.js] - list of script srcs (e.g. "/js/login.js")
 */
const registry =
  (typeof window !== "undefined" &&
    (window.__pageAssetRegistry ||= new Map())) ||
  new Map();

// Cache fetched script source so revisiting a page doesn't refetch it.
const sourceCache =
  (typeof window !== "undefined" &&
    (window.__pageAssetSourceCache ||= new Map())) ||
  new Map();

function acquireCss(href) {
  const key = `css:${href}`;
  let entry = registry.get(key);
  if (!entry) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.dynamic = "true";
    document.head.appendChild(link);
    entry = { el: link, refCount: 0 };
    registry.set(key, entry);
  }
  entry.refCount += 1;
  return key;
}

function releaseCss(key) {
  const entry = registry.get(key);
  if (!entry) return;
  entry.refCount -= 1;
  if (entry.refCount <= 0) {
    entry.el.remove();
    registry.delete(key);
  }
}

async function fetchSource(src) {
  if (sourceCache.has(src)) return sourceCache.get(src);
  const res = await fetch(src);
  const text = await res.text();
  sourceCache.set(src, text);
  return text;
}

async function acquireJs(src) {
  const key = `js:${src}`;
  let entry = registry.get(key);
  if (entry) {
    entry.refCount += 1;
    return key;
  }

  const code = await fetchSource(src);
  const script = document.createElement("script");
  // Wrap in an IIFE so top-level const/let/function declarations in the
  // legacy script don't leak into (or collide with) the shared global
  // scope used by every other converted page.
  script.text = `(function(){\n${code}\n})();`;
  script.dataset.src = src;
  document.body.appendChild(script);

  entry = { el: script, refCount: 1 };
  registry.set(key, entry);
  return key;
}

function releaseJs(key) {
  const entry = registry.get(key);
  if (!entry) return;
  entry.refCount -= 1;
  if (entry.refCount <= 0) {
    entry.el.remove();
    registry.delete(key);
  }
}

export default function usePageAssets({ title, brand, css = [], js = [] }) {
  useEffect(() => {
    if (title) document.title = title;

    const prevBrand = document.documentElement.getAttribute("data-brand");
    if (brand) document.documentElement.setAttribute("data-brand", brand);

    const cssKeys = css.map(acquireCss);

    let cancelled = false;
    const jsKeys = [];

    (async () => {
      // Load sequentially, same order as the original <script> tags, in
      // case later scripts rely on earlier ones having already run.
      for (const src of js) {
        if (cancelled) break;
        try {
          const key = await acquireJs(src);
          jsKeys.push(key);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(`Failed to load page script ${src}`, e);
        }
      }
    })();

    return () => {
      cancelled = true;
      cssKeys.forEach(releaseCss);
      jsKeys.forEach(releaseJs);
      if (brand) {
        if (prevBrand) document.documentElement.setAttribute("data-brand", prevBrand);
        else document.documentElement.removeAttribute("data-brand");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
