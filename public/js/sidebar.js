(function () {
  var STORAGE_KEY = "awh-sidebar-collapsed";
  var NARROW_BP = "(max-width: 1280px)";
  var app = document.querySelector(".app");
  var side = document.querySelector(".side");
  if (!app || !side) return;

  var narrowMq = window.matchMedia(NARROW_BP);

  side.querySelectorAll(".nav a").forEach(function (link) {
    var lbl = link.querySelector(".lbltxt");
    if (lbl) link.dataset.tip = lbl.textContent.trim();
  });

  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "side-toggle";
  toggle.setAttribute("aria-label", "Collapse sidebar");
  toggle.setAttribute("aria-expanded", "true");
  toggle.innerHTML =
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';
  var main = app.querySelector(".main");
  if (main) app.insertBefore(toggle, main);
  else side.appendChild(toggle);

  var tip = document.createElement("div");
  tip.className = "side-tip";
  tip.setAttribute("role", "tooltip");
  document.body.appendChild(tip);

  var tipLink = null;

  function isNarrow() {
    return app.classList.contains("side-narrow");
  }

  function isExpanded() {
    return app.classList.contains("side-expanded");
  }

  function isCollapsed() {
    return app.classList.contains("side-collapsed");
  }

  function labelsHidden() {
    return isCollapsed() || (isNarrow() && !isExpanded());
  }

  function hideTip() {
    tip.classList.remove("is-visible");
    tipLink = null;
  }

  function showTip(link) {
    if (!labelsHidden()) {
      hideTip();
      return;
    }
    var text = link.dataset.tip;
    if (!text) return;
    tip.textContent = text;
    var rect = link.getBoundingClientRect();
    tip.style.top = rect.top + rect.height / 2 + "px";
    tip.style.left = rect.right + 12 + "px";
    tip.classList.add("is-visible");
    tipLink = link;
  }

  function syncAria() {
    if (isNarrow()) {
      toggle.setAttribute("aria-expanded", isExpanded() ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        isExpanded() ? "Close sidebar" : "Open sidebar"
      );
      return;
    }
    toggle.setAttribute("aria-expanded", isCollapsed() ? "false" : "true");
    toggle.setAttribute(
      "aria-label",
      isCollapsed() ? "Expand sidebar" : "Collapse sidebar"
    );
  }

  function setExpanded(expanded) {
    app.classList.toggle("side-expanded", expanded);
    syncAria();
    if (!expanded) hideTip();
  }

  function setCollapsed(collapsed, persist) {
    if (isNarrow()) return;
    app.classList.toggle("side-collapsed", collapsed);
    syncAria();
    if (persist !== false) {
      try {
        localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
      } catch (_) {}
    }
    if (!collapsed) hideTip();
  }

  function applyViewport() {
    if (narrowMq.matches) {
      app.classList.add("side-narrow");
      app.classList.remove("side-collapsed");
      if (!isExpanded()) hideTip();
    } else {
      app.classList.remove("side-narrow", "side-expanded");
      var saved = false;
      try {
        saved = localStorage.getItem(STORAGE_KEY) === "1";
      } catch (_) {}
      setCollapsed(saved, false);
    }
    syncAria();
  }

  applyViewport();
  if (narrowMq.addEventListener) narrowMq.addEventListener("change", applyViewport);
  else narrowMq.addListener(applyViewport);

  toggle.addEventListener("click", function () {
    if (isNarrow()) {
      setExpanded(!isExpanded());
      return;
    }
    setCollapsed(!isCollapsed());
  });

  app.addEventListener("click", function (e) {
    if (!isNarrow() || !isExpanded()) return;
    if (e.target === toggle || toggle.contains(e.target)) return;
    if (side.contains(e.target)) return;
    setExpanded(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isNarrow() && isExpanded()) setExpanded(false);
  });

  side.addEventListener("click", function (e) {
    if (!isNarrow() || !isExpanded()) return;
    if (e.target.closest(".nav a")) setExpanded(false);
  });

  side.addEventListener("mouseover", function (e) {
    var link = e.target.closest(".nav a");
    if (link) showTip(link);
  });

  side.addEventListener("mouseout", function (e) {
    if (!tipLink) return;
    var link = e.target.closest(".nav a");
    if (link === tipLink) {
      var next = e.relatedTarget;
      if (!link.contains(next)) hideTip();
    }
  });

  window.addEventListener("scroll", hideTip, true);
  window.addEventListener("resize", hideTip);
})();
