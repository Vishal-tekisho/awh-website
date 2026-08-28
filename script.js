const fs = require('fs');
let css = fs.readFileSync('../css/orders-care-plans.css', 'utf8');
if (!css.includes('.wsgrid')) {
  css += '\n.wsgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}\n.wsgrid.three{grid-template-columns:250px minmax(0,1fr) 300px}\n.wsmain{min-width:0;display:flex;flex-direction:column;gap:14px}\n.wsside{position:sticky;top:0;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);box-shadow:var(--e-1);overflow:hidden}\n';
  fs.writeFileSync('../css/orders-care-plans.css', css, 'utf8');
}
let cssEmr = fs.readFileSync('../css/emr-templates.css', 'utf8');
if (!cssEmr.includes('.wsgrid.three')) {
  cssEmr += '\n.wsgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}\n.wsgrid.three{grid-template-columns:250px minmax(0,1fr) 350px}\n.wsmain{min-width:0;display:flex;flex-direction:column;gap:14px}\n.wsside{position:sticky;top:0;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);box-shadow:var(--e-1);overflow:hidden}\n';
  fs.writeFileSync('../css/emr-templates.css', cssEmr, 'utf8');
}

