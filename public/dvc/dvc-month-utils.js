(function (global) {
  "use strict";

  function isCurrentMonth(month, year) {
    var now = new Date();
    return now.getFullYear() === year && now.getMonth() + 1 === month;
  }

  function isPastMonth(month, year) {
    var now = new Date();
    if (year < now.getFullYear()) return true;
    return year === now.getFullYear() && month < now.getMonth() + 1;
  }

  function isFutureMonth(month, year) {
    var now = new Date();
    if (year > now.getFullYear()) return true;
    return year === now.getFullYear() && month > now.getMonth() + 1;
  }

  function todayDay() {
    return new Date().getDate();
  }

  /**
   * Entry day when opening a month:
   * - current month → today
   * - past month → last day (most recent confession)
   * - future month → day 1
   */
  function getDefaultDay(month, year, totalDays) {
    if (isCurrentMonth(month, year)) {
      return Math.min(todayDay(), totalDays);
    }
    if (isPastMonth(month, year)) {
      return totalDays;
    }
    return 1;
  }

  /** Calendar: current month — today and earlier enabled; future dates greyed out. */
  function isCalendarDayEnabled(day, month, year, totalDays) {
    if (day < 1 || day > totalDays) return false;
    if (isCurrentMonth(month, year)) {
      return day <= todayDay();
    }
    if (isFutureMonth(month, year)) return false;
    return true;
  }

  function isNavigableDay(day, month, year, totalDays) {
    return isCalendarDayEnabled(day, month, year, totalDays);
  }

  function clampDay(day, month, year, totalDays) {
    day = Math.max(1, Math.min(day, totalDays));
    if (isCurrentMonth(month, year)) {
      return Math.min(day, todayDay());
    }
    return day;
  }

  function maxNavigableDay(month, year, totalDays) {
    if (isCurrentMonth(month, year)) {
      return Math.min(todayDay(), totalDays);
    }
    return totalDays;
  }

  function monthReadUrl(slug, month, year, totalDays) {
    var day = getDefaultDay(month, year, totalDays);
    return "/dvc/" + slug + "#day" + day;
  }

  global.DVCMonth = {
    isCurrentMonth: isCurrentMonth,
    isPastMonth: isPastMonth,
    isFutureMonth: isFutureMonth,
    getDefaultDay: getDefaultDay,
    isCalendarDayEnabled: isCalendarDayEnabled,
    isNavigableDay: isNavigableDay,
    clampDay: clampDay,
    maxNavigableDay: maxNavigableDay,
    monthReadUrl: monthReadUrl,
  };
})(typeof window !== "undefined" ? window : this);
