(function () {
  function el(id) {
    return document.getElementById(id);
  }

  var MONTHS = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  function todaysDevUrl() {
    var now = new Date();
    var y = now.getFullYear(),
      m = now.getMonth(),
      d = now.getDate();
    var tm, td;
    if (y < 2026 || (y === 2026 && m < 6)) {
      tm = 6;
      td = 1;
    } else if (y > 2026 || (y === 2026 && m > 11)) {
      tm = 11;
      td = 31;
    } else {
      tm = m;
      td = d;
    }
    return "./2026/" + MONTHS[tm] + ".html#day-" + td;
  }

  function setHash(h) {
    try {
      history.pushState(null, "", h);
    } catch (e) {
      try {
        location.hash = h === "#" ? "" : h;
      } catch (_) {}
    }
  }

  function show2026() {
    var yearsView = el("years-view");
    var monthsView = el("months-view");
    var heroActions = el("heroActions");
    var goBack = el("goBack");
    if (!yearsView || !monthsView) return;
    yearsView.classList.remove("active");
    monthsView.classList.add("active");
    if (goBack) goBack.hidden = false;
    if (heroActions) heroActions.classList.add("with-back");
    if (location.hash !== "#2026") setHash("#2026");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showYears() {
    var yearsView = el("years-view");
    var monthsView = el("months-view");
    var heroActions = el("heroActions");
    var goBack = el("goBack");
    if (!yearsView || !monthsView) return;
    monthsView.classList.remove("active");
    yearsView.classList.add("active");
    if (goBack) goBack.hidden = true;
    if (heroActions) heroActions.classList.remove("with-back");
    if (location.hash) setHash("#");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Always expose on window so landing actions never throw ReferenceError
  window.show2026 = show2026;
  window.showYears = showYears;

  function bindLanding() {
    var todayHref = todaysDevUrl();
    window.__dvcTodayHref = todayHref;

    var todayCta = el("todayCta");
    if (todayCta) {
      todayCta.setAttribute("href", todayHref);
      todayCta.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var href = window.__dvcTodayHref || todaysDevUrl();
        if (typeof window.__dvcOpenHref === "function") {
          window.__dvcOpenHref(href, true);
        } else {
          // Fallback: open months first if reader engine is not ready
          show2026();
        }
      };
    }

    function applyHash() {
      if (location.hash === "#2026") show2026();
      else showYears();
    }

    var goBack = el("goBack");
    if (goBack) goBack.onclick = showYears;

    window.addEventListener("popstate", applyHash);
    if (location.hash === "#2026") show2026();
    else showYears();
  }

  // Delegated clicks for year cards / go-back (works after React re-injects shell)
  if (!window.__dvcNavDelegated) {
    window.__dvcNavDelegated = true;
    document.addEventListener(
      "click",
      function (e) {
        var t = e.target;
        if (t && t.nodeType === 3) t = t.parentElement;
        var btn = t && t.closest ? t.closest("[data-dvc-action]") : null;
        if (!btn) return;
        var action = btn.getAttribute("data-dvc-action");
        if (action === "2026") {
          e.preventDefault();
          show2026();
        } else if (action === "years") {
          e.preventDefault();
          showYears();
        }
      },
      true
    );
  }

  window.__dvcBindNav = bindLanding;
  bindLanding();
})();
