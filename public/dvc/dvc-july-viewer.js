(function () {
  "use strict";

  var TOTAL_DAYS = 31;
  var MONTH_NUM = 7;
  var MONTH_YEAR = 2026;
  var JULY_2026_START_WEEKDAY = 3; /* Wednesday = 0 Sun … 3 Wed */

  var state = {
    current: 0,
    days: [],
    touchStartX: 0,
    touchDeltaX: 0,
  };

  var els = {};

  function monthApi() {
    return window.DVCMonth || null;
  }

  function defaultEntryDay() {
    var api = monthApi();
    if (api) return api.getDefaultDay(MONTH_NUM, MONTH_YEAR, TOTAL_DAYS);
    return 1;
  }

  function clampNavigableDay(day) {
    var api = monthApi();
    if (api) return api.clampDay(day, MONTH_NUM, MONTH_YEAR, TOTAL_DAYS);
    return Math.max(1, Math.min(day, TOTAL_DAYS));
  }

  function canNavigateTo(day) {
    var api = monthApi();
    if (api) return api.isNavigableDay(day, MONTH_NUM, MONTH_YEAR, TOTAL_DAYS);
    return day >= 1 && day <= TOTAL_DAYS;
  }

  function canPickInCalendar(day) {
    var api = monthApi();
    if (api) return api.isCalendarDayEnabled(day, MONTH_NUM, MONTH_YEAR, TOTAL_DAYS);
    return day >= 1 && day <= TOTAL_DAYS;
  }

  function maxDay() {
    var api = monthApi();
    if (api) return api.maxNavigableDay(MONTH_NUM, MONTH_YEAR, TOTAL_DAYS);
    return TOTAL_DAYS;
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function parseToc() {
    return $all(".toc-item").map(function (item) {
      var href = item.getAttribute("href") || "";
      var dayNum = parseInt(href.replace("#day", ""), 10);
      return {
        day: dayNum,
        theme: ($(".toc-theme", item) || {}).textContent || "",
        weekday: ($(".toc-wd", item) || {}).textContent || "",
      };
    });
  }

  function dayMeta(dayNum) {
    return state.days.find(function (d) {
      return d.day === dayNum;
    }) || { day: dayNum, theme: "Day " + dayNum, weekday: "" };
  }

  function shareUrlForDay(dayNum) {
    var base = window.location.href.split("#")[0].split("?")[0];
    return base + "#day" + dayNum;
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(els.toastTimer);
    els.toastTimer = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 2200);
  }

  function shareDay(dayNum) {
    var meta = dayMeta(dayNum);
    var url = shareUrlForDay(dayNum);
    var title = "Daily Victory Confession — July " + dayNum + ", 2026";
    var text =
      meta.theme +
      (meta.weekday ? " · " + meta.weekday : "") +
      " — Daily Victory Confession";

    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function () {
        copyShareLink(url);
      });
      return;
    }
    copyShareLink(url);
  }

  function copyShareLink(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        showToast("Link copied — share this day");
      });
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast("Link copied — share this day");
    } catch (e) {
      showToast(url);
    }
    document.body.removeChild(ta);
  }

  function buildCalendar() {
    var grid = $(".dvc-cal-grid", els.modal);
    if (!grid) return;
    grid.innerHTML = "";

    var weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var weekdayRow = $(".dvc-cal-weekdays", els.modal);
    if (weekdayRow) {
      weekdayRow.innerHTML = weekdays
        .map(function (w) {
          return "<span>" + w + "</span>";
        })
        .join("");
    }

    for (var i = 0; i < JULY_2026_START_WEEKDAY; i++) {
      var empty = document.createElement("div");
      empty.className = "dvc-cal-cell empty";
      grid.appendChild(empty);
    }

    for (var day = 1; day <= TOTAL_DAYS; day++) {
      var meta = dayMeta(day);
      var enabled = canPickInCalendar(day);
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "dvc-cal-cell" + (enabled ? "" : " disabled");
      cell.dataset.day = String(day);
      cell.disabled = !enabled;
      cell.innerHTML =
        '<span class="dvc-cal-num">' +
        String(day).padStart(2, "0") +
        "</span>" +
        '<span class="dvc-cal-theme">' +
        meta.theme +
        "</span>";
      if (enabled) {
        cell.addEventListener("click", function () {
          var d = parseInt(this.dataset.day, 10);
          closeCalendar();
          openViewer(d);
        });
      }
      grid.appendChild(cell);
    }
  }

  function highlightCalendarDay(dayNum) {
    $all(".dvc-cal-cell", els.modal).forEach(function (cell) {
      var d = parseInt(cell.dataset.day, 10);
      cell.classList.toggle("active", d === dayNum);
    });
  }

  function openCalendar() {
    highlightCalendarDay(state.current || 1);
    els.modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeCalendar() {
    els.modal.hidden = true;
    if (els.viewer.hidden) {
      document.body.style.overflow = "";
    }
  }

  function buildViewerShell() {
    var viewer = document.createElement("div");
    viewer.id = "dvc-viewer";
    viewer.hidden = true;
    viewer.innerHTML =
      '<header class="dvc-toolbar">' +
      '<div class="dvc-toolbar-left">' +
      '<button type="button" class="dvc-btn" id="dvc-btn-home">Home</button>' +
      '<button type="button" class="dvc-btn" id="dvc-btn-cal">Calendar</button>' +
      "</div>" +
      '<div class="dvc-toolbar-center">' +
      '<p class="dvc-toolbar-title">July 2026</p>' +
      '<p class="dvc-toolbar-day" id="dvc-toolbar-day">Day 01</p>' +
      "</div>" +
      '<div class="dvc-toolbar-right">' +
      '<button type="button" class="dvc-btn primary" id="dvc-btn-share">Share</button>' +
      "</div>" +
      "</header>" +
      '<div class="dvc-slider-viewport" id="dvc-slider-viewport">' +
      '<div class="dvc-slider-track" id="dvc-slider-track"></div>' +
      "</div>" +
      '<footer class="dvc-slide-nav">' +
      '<button type="button" class="dvc-btn" id="dvc-btn-prev">← Prev</button>' +
      '<span class="dvc-slide-counter" id="dvc-slide-counter">01 / 31</span>' +
      '<div class="dvc-dots" id="dvc-dots"></div>' +
      '<button type="button" class="dvc-btn" id="dvc-btn-next">Next →</button>' +
      "</footer>";

    document.body.appendChild(viewer);

    var modal = document.createElement("div");
    modal.id = "dvc-calendar-modal";
    modal.hidden = true;
    modal.innerHTML =
      '<div class="dvc-cal-panel" role="dialog" aria-modal="true" aria-label="July calendar">' +
      '<div class="dvc-cal-head">' +
      "<h2>July 2026</h2>" +
      '<button type="button" class="dvc-btn" id="dvc-cal-close">Close</button>' +
      "</div>" +
      '<p class="dvc-cal-sub">Tap a day to jump to that decree</p>' +
      '<div class="dvc-cal-weekdays"></div>' +
      '<div class="dvc-cal-grid"></div>' +
      "</div>";
    document.body.appendChild(modal);

    var toast = document.createElement("div");
    toast.className = "dvc-share-toast";
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);

    els.viewer = viewer;
    els.modal = modal;
    els.toast = toast;
    els.track = $("#dvc-slider-track", viewer);
    els.viewport = $("#dvc-slider-viewport", viewer);
    els.toolbarDay = $("#dvc-toolbar-day", viewer);
    els.counter = $("#dvc-slide-counter", viewer);
    els.dots = $("#dvc-dots", viewer);

    $("#dvc-btn-home", viewer).addEventListener("click", closeViewer);
    $("#dvc-btn-cal", viewer).addEventListener("click", openCalendar);
    $("#dvc-btn-share", viewer).addEventListener("click", function () {
      shareDay(state.current);
    });
    $("#dvc-btn-prev", viewer).addEventListener("click", function () {
      goToDay(state.current - 1);
    });
    $("#dvc-btn-next", viewer).addEventListener("click", function () {
      goToDay(state.current + 1);
    });
    $("#dvc-cal-close", modal).addEventListener("click", closeCalendar);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeCalendar();
    });

    document.addEventListener("keydown", function (e) {
      if (els.viewer.hidden) return;
      if (!els.modal.hidden && e.key === "Escape") {
        closeCalendar();
        return;
      }
      if (els.modal.hidden) {
        if (e.key === "ArrowLeft") goToDay(state.current - 1);
        if (e.key === "ArrowRight") goToDay(state.current + 1);
        if (e.key === "Escape") closeViewer();
      }
    });

    setupSwipe();
    buildDots();
  }

  function buildDots() {
    if (!els.dots) return;
    els.dots.innerHTML = "";
    for (var i = 1; i <= TOTAL_DAYS; i++) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dvc-dot";
      dot.dataset.day = String(i);
      dot.setAttribute("aria-label", "Day " + i);
      dot.addEventListener("click", function () {
        var d = parseInt(this.dataset.day, 10);
        if (canNavigateTo(d)) goToDay(d);
      });
      els.dots.appendChild(dot);
    }
  }

  function mountSlides() {
    var sections = $all("section.day");
    sections.forEach(function (section) {
      var slide = document.createElement("div");
      slide.className = "dvc-slide";
      var id = section.id || "";
      var dayNum = parseInt(id.replace("day", ""), 10);
      slide.dataset.day = String(dayNum);
      slide.appendChild(section);
      els.track.appendChild(slide);
    });
  }

  function updateUI() {
    var meta = dayMeta(state.current);
    var idx = state.current - 1;
    els.track.style.transform = "translateX(-" + idx * 100 + "%)";

    if (els.toolbarDay) {
      els.toolbarDay.textContent =
        "Day " +
        String(state.current).padStart(2, "0") +
        " · " +
        meta.theme;
    }
    if (els.counter) {
      els.counter.textContent =
        String(state.current).padStart(2, "0") + " / " + TOTAL_DAYS;
    }

    $all(".dvc-dot", els.dots).forEach(function (dot) {
      dot.classList.toggle("active", parseInt(dot.dataset.day, 10) === state.current);
    });

    highlightCalendarDay(state.current);

    var prevBtn = $("#dvc-btn-prev", els.viewer);
    var nextBtn = $("#dvc-btn-next", els.viewer);
    if (prevBtn) prevBtn.disabled = state.current <= 1;
    if (nextBtn) nextBtn.disabled = state.current >= maxDay();

    if (history.replaceState) {
      history.replaceState(null, "", "#day" + state.current);
    } else {
      window.location.hash = "day" + state.current;
    }
  }

  function goToDay(dayNum) {
    if (!canNavigateTo(dayNum)) return;
    state.current = dayNum;
    updateUI();
    if (els.viewport) els.viewport.scrollTop = 0;
    $all(".dvc-slide", els.track).forEach(function (slide) {
      if (parseInt(slide.dataset.day, 10) === dayNum) {
        slide.scrollTop = 0;
      }
    });
  }

  function openViewer(dayNum) {
    dayNum = clampNavigableDay(dayNum || defaultEntryDay());
    els.viewer.hidden = false;
    document.body.classList.add("dvc-viewer-active");
    document.body.style.overflow = "hidden";
    goToDay(dayNum);
  }

  function closeViewer() {
    els.viewer.hidden = true;
    document.body.classList.remove("dvc-viewer-active");
    document.body.style.overflow = "";
    if (history.replaceState) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setupSwipe() {
    if (!els.viewport) return;
    els.viewport.addEventListener(
      "touchstart",
      function (e) {
        state.touchStartX = e.touches[0].clientX;
        state.touchDeltaX = 0;
      },
      { passive: true }
    );
    els.viewport.addEventListener(
      "touchmove",
      function (e) {
        state.touchDeltaX = e.touches[0].clientX - state.touchStartX;
      },
      { passive: true }
    );
    els.viewport.addEventListener("touchend", function () {
      if (Math.abs(state.touchDeltaX) < 50) return;
      if (state.touchDeltaX < 0) goToDay(state.current + 1);
      else goToDay(state.current - 1);
    });
  }

  function addCoverActions() {
    var cover = $(".cover");
    if (!cover) return;
    var actions = document.createElement("div");
    actions.className = "dvc-cover-actions";
    actions.innerHTML =
      '<button type="button" class="dvc-btn primary" id="dvc-begin">Begin July</button>' +
      '<button type="button" class="dvc-btn" id="dvc-open-cal">Month at a glance</button>';
    cover.appendChild(actions);

    $("#dvc-begin").addEventListener("click", function () {
      openViewer(defaultEntryDay());
    });
    $("#dvc-open-cal").addEventListener("click", function () {
      openCalendar();
    });
  }

  function parseHashDay() {
    var hash = window.location.hash || "";
    var match = hash.match(/^#day(\d{1,2})$/i);
    if (!match) return null;
    var n = parseInt(match[1], 10);
    return n >= 1 && n <= TOTAL_DAYS ? n : null;
  }

  function init() {
    state.days = parseToc();
    buildViewerShell();
    mountSlides();
    buildCalendar();
    addCoverActions();

    window.addEventListener("hashchange", function () {
      var day = parseHashDay();
      if (!day) return;
      day = clampNavigableDay(day);
      if (els.viewer.hidden) openViewer(day);
      else goToDay(day);
    });

    var hashDay = parseHashDay();
    if (hashDay) {
      openViewer(clampNavigableDay(hashDay));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
