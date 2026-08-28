import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import routes from "../pages/_routes.json";

// Build a lookup of original .html filename -> SPA route path
const fileToRoute = Object.fromEntries(routes.map((r) => [r.file, r.route]));

function resolveTarget(href) {
  const [filePart, hash] = href.split("#");
  const file = filePart || "index.html";

  if (Object.prototype.hasOwnProperty.call(fileToRoute, file)) {
    return fileToRoute[file] + (hash ? `#${hash}` : "");
  }
  if (file.endsWith(".html")) {
    return `/not-converted?from=${encodeURIComponent(file)}`;
  }
  return null;
}

/**
 * Handles client-side navigation for links coming from two places:
 *
 * 1. Anchors rendered directly in the React tree (rare, but supported for
 *    completeness) - handled via a capturing click listener on the parent
 *    document.
 * 2. Anchors inside the isolated legacy <iframe> pages - these live in a
 *    completely separate document, so the parent can't intercept their
 *    clicks directly. Each generated legacy page has a small bridge script
 *    that posts a `window.postMessage({ source: 'legacy-frame', ... })`
 *    when one of its internal `.html` links is clicked; we listen for that
 *    message here and translate it into a React Router navigation so the
 *    browser address bar stays in sync with whatever page is shown.
 */
export default function NavInterceptor() {
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e) {
      const anchor = e.target.closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || /^https?:\/\//i.test(href) || href.startsWith("mailto:")) return;

      const target = resolveTarget(href);
      if (target) {
        e.preventDefault();
        navigate(target);
      }
    }

    function onMessage(e) {
      const data = e.data;
      if (!data || data.source !== "legacy-frame" || data.type !== "navigate") return;
      const target = resolveTarget(data.href);
      if (target) navigate(target);
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("message", onMessage);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("message", onMessage);
    };
  }, [navigate]);

  return null;
}
