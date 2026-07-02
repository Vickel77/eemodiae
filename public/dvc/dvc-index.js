(function () {
  "use strict";

  function init() {
    if (!window.DVCMonth) return;

    document.querySelectorAll(".m-card.ready[data-dvc-slug]").forEach(function (card) {
      var slug = card.getAttribute("data-dvc-slug");
      var month = parseInt(card.getAttribute("data-dvc-month"), 10);
      var year = parseInt(card.getAttribute("data-dvc-year"), 10);
      var days = parseInt(card.getAttribute("data-dvc-days"), 10);
      if (!slug || !month || !year || !days) return;

      card.setAttribute("href", DVCMonth.monthReadUrl(slug, month, year, days));

      var readLabel = card.querySelector(".m-link.read");
      if (readLabel) {
        if (DVCMonth.isCurrentMonth(month, year)) {
          readLabel.textContent = "Today's confession";
        } else if (DVCMonth.isPastMonth(month, year)) {
          readLabel.textContent = "Latest confession";
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
