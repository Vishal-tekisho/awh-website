import { useEffect, useRef } from "react";

/**
 * Renders a fully isolated legacy page inside an <iframe>.
 *
 * Each legacy page (login, admin-dashboard, treatments-procedures, ...) has
 * its own hand-written script full of top-level `const`/`let` declarations
 * and `document.addEventListener` calls that are never torn down. Rendering
 * these directly into the SPA's single document causes:
 *   - "Identifier '...' has already been declared" (duplicate top-level
 *     bindings across pages sharing the same global scope), and
 *   - "Cannot read properties of null (reading 'classList')" and similar
 *     (stale document-level listeners from a previous page firing after
 *     its DOM has been replaced).
 *
 * An <iframe> gives every page its own independent `window`/`document` and
 * global scope. When the iframe unmounts (route change), the browser
 * discards that entire document - including every listener/timer it
 * registered - so none of the above can happen, no matter how many pages
 * share variable names like `$`, `toast`, `go`, etc.
 */
export default function LegacyFrame({ file, title }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  return (
    <iframe
      ref={iframeRef}
      src={`/legacy-pages/${file}`}
      title={title || file}
      style={{
        display: "block",
        border: "none",
        width: "100%",
        height: "100vh",
      }}
    />
  );
}
