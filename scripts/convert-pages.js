/*
 * Automated HTML -> React page converter (iframe isolation strategy).
 *
 * Why iframes: the legacy per-page scripts (login.js, treatments-procedures.js,
 * etc.) attach document-level event listeners (`document.addEventListener`)
 * and timers that are never cleaned up. When pages were injected directly
 * into the SPA's single document, navigating away left those listeners
 * alive; they kept firing afterwards and crashed with errors like
 * "Cannot read properties of null (reading 'classList')" because the DOM
 * nodes they expected no longer existed.
 *
 * The fix: render each legacy page inside its own <iframe>, each with a
 * completely separate `window`/`document`/global scope. When React unmounts
 * or swaps the iframe (route change), the entire document - including every
 * listener and timer registered by its scripts - is destroyed by the
 * browser. There is no way for one page's script to leak into another's.
 *
 * This script generates one standalone HTML document per page under
 * public/legacy-pages/<file>.html with:
 *   - the original <head> (fonts, css links rewritten to /css/...)
 *   - the original <body> markup, unmodified
 *   - the original <script src> tags rewritten to /js/...
 *   - a small bridge script appended before </body> that intercepts clicks
 *     on internal `href="xxx.html"` links and posts a message to the parent
 *     window instead of navigating the iframe itself, so the outer React
 *     Router can update the browser's address bar to match.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", ".."); // Hospital-UI-UX root
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const LEGACY_DIR = path.join(PUBLIC_DIR, "legacy-pages");
const PAGES_DIR = path.resolve(__dirname, "..", "src", "pages");

const PAGES = [
  { file: "index.html", route: "/", component: "Index", redirectTo: "/admin-dashboard" },
  { file: "login.html", route: "/login", component: "Login" },
  { file: "admin-dashboard.html", route: "/admin-dashboard", component: "AdminDashboard" },
  { file: "availability.html", route: "/availability", component: "Availability" },
  { file: "clinic-branch.html", route: "/clinic-branch", component: "ClinicBranch" },
  { file: "counters-points.html", route: "/counters-points", component: "CountersPoints" },
  { file: "doctors-staff.html", route: "/doctors-staff", component: "DoctorsStaff" },
  { file: "equipment-resources.html", route: "/equipment-resources", component: "EquipmentResources" },
  { file: "knowledge-base.html", route: "/knowledge-base", component: "KnowledgeBase" },
  { file: "notifications-reminders.html", route: "/notifications-reminders", component: "NotificationsReminders" },
  { file: "packages-pricing.html", route: "/packages-pricing", component: "PackagesPricing" },
  { file: "patient-fields.html", route: "/patient-fields", component: "PatientFields" },
  { file: "reference-audit.html", route: "/reference-audit", component: "ReferenceAudit" },
  { file: "resource-availability.html", route: "/resource-availability", component: "ResourceAvailability" },
  { file: "roles-departments.html", route: "/roles-departments", component: "RolesDepartments" },
  { file: "rooms-areas.html", route: "/rooms-areas", component: "RoomsAreas" },
  { file: "roster-sessions.html", route: "/roster-sessions", component: "RosterSessions" },
  { file: "services-consultation-types.html", route: "/services-consultation-types", component: "ServicesConsultationTypes" },
  { file: "treatments-procedures.html", route: "/treatments-procedures", component: "TreatmentsProcedures" },
  { file: "user-onboard.html", route: "/user-onboard", component: "UserOnboard" },
  { file: "slots-queue-rules.html", route: "/slots-queue-rules", component: "SlotsQueueRules" },
  { file: "emr-templates.html", route: "/emr-templates", component: "EmrTemplates" },
  { file: "medication-config.html", route: "/medication-config", component: "MedicationConfig" },
  { file: "orders-care-plans.html", route: "/orders-care-plans", component: "OrdersCarePlans" },
  { file: "clinical-support-masters.html", route: "/clinical-support-masters", component: "ClinicalSupportMasters" },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

ensureDir(LEGACY_DIR);
ensureDir(PAGES_DIR);

// Bridge script injected into every generated legacy page. It intercepts
// clicks on same-site anchors pointing at another converted page's .html
// file and asks the parent (React) window to navigate there via React
// Router, keeping the browser address bar/back-forward history correct
// while still letting the iframe fully reload for isolation.
const BRIDGE_SCRIPT = `
<script>
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || /^https?:\\/\\//i.test(href) || href.indexOf('mailto:') === 0) return;
    if (href.indexOf('.html') === -1) return;
    e.preventDefault();
    try {
      window.parent.postMessage({ source: 'legacy-frame', type: 'navigate', href: href }, '*');
    } catch (err) {
      // no-op: if parent isn't reachable, do nothing rather than throw
    }
  }, true);
})();
</script>
`;

function buildLegacyHtml(originalHtml) {
  let html = originalHtml;

  // Rewrite relative css/js asset paths to be absolute against the public
  // root, since these documents live at /legacy-pages/<file>.html.
  html = html.replace(/(href|src)="(\.\/)?(css|js)\/([^"]+)"/g, '$1="/$3/$4"');

  // Shared collapsible sidebar (toggle + icon hover labels).
  if (!html.includes("/css/sidebar.css")) {
    html = html.replace(
      /(<link rel="stylesheet" href="\/css\/[^"]+\.css">)/,
      '$1\n<link rel="stylesheet" href="/css/sidebar.css">'
    );
  }
  if (!html.includes("/js/sidebar.js")) {
    html = html.replace(
      /(<script src="\/js\/[^"]+\.js"><\/script>)/,
      '<script src="/js/sidebar.js"></script>\n$1'
    );
  }

  // Inject the navigation bridge right before </body>.
  html = html.replace(/<\/body>/i, `${BRIDGE_SCRIPT}\n</body>`);

  return html;
}

const generated = [];

for (const page of PAGES) {
  const filePath = path.join(ROOT, page.file);
  if (!fs.existsSync(filePath)) {
    console.warn("MISSING", filePath);
    continue;
  }
  const html = fs.readFileSync(filePath, "utf8");
  const legacyHtml = buildLegacyHtml(html);

  const legacyOutPath = path.join(LEGACY_DIR, page.file);
  fs.writeFileSync(legacyOutPath, legacyHtml, "utf8");

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const componentSource = `import LegacyFrame from "../components/LegacyFrame";

export default function ${page.component}() {
  return <LegacyFrame file="${page.file}" title={${JSON.stringify(title)}} />;
}
`;

  const outPath = path.join(PAGES_DIR, `${page.component}.jsx`);
  fs.writeFileSync(outPath, componentSource, "utf8");

  generated.push({ ...page, outPath, legacyOutPath });
  console.log("Generated", legacyOutPath, "+", outPath);
}

const manifestPath = path.join(PAGES_DIR, "_routes.json");
fs.writeFileSync(
  manifestPath,
  JSON.stringify(
    generated.map((g) => ({
      route: g.route,
      component: g.component,
      file: g.file,
      redirectTo: g.redirectTo || null,
    })),
    null,
    2
  )
);
console.log("Wrote", manifestPath);
