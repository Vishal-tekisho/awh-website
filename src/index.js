import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // NOTE: React.StrictMode intentionally double-invokes effects in
  // development. The legacy page scripts under /public/js declare
  // top-level `const`/`let` bindings (e.g. `const $ = ...`) and are not
  // safe to execute twice in the same global scope (it throws
  // "Identifier '...' has already been declared" and breaks all page
  // interactivity). Keep StrictMode disabled while these scripts are
  // loaded imperatively via usePageAssets.
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
