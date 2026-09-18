(function () {
  "use strict";

  /* ---------- Language toggle ---------- */
  var LANG_KEY = "me-wedding-lang";
  var htmlEl = document.documentElement;
  var langToggle = document.getElementById("langToggle");
  var musicToggle = document.getElementById("musicToggle");

  function applyLang(lang) {
    var dict = I18N[lang] || I18N.pt;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });
    htmlEl.setAttribute("lang", lang === "en" ? "en" : "pt-BR");
    htmlEl.setAttribute("data-lang", lang);

    if (langToggle) {
      var ptSpan = langToggle.querySelector(".lang-pt");
      var enSpan = langToggle.querySelector(".lang-en");
      if (lang === "en") {
        ptSpan.classList.remove("is-active");
        enSpan.classList.add("is-active");
      } else {
        enSpan.classList.remove("is-active");
        ptSpan.classList.add("is-active");
      }
    }
    if (musicToggle) {
      var playing = musicToggle.classList.contains("is-playing");
      musicToggle.setAttribute("aria-label", playing ? dict["music.pause"] : dict["music.play"]);
    }
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
  }

  function getInitialLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "pt") return saved;
    } catch (e) { /* ignore */ }
    return "pt";
  }

  var currentLang = getInitialLang();
  applyLang(currentLang);

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      currentLang = currentLang === "pt" ? "en" : "pt";
      applyLang(currentLang);
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    mainNav.querySelectorAll("a.nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Countdown (present only on the home page) ---------- */
  var WEDDING_DATE = new Date("2027-01-16T20:00:00-03:00").getTime();

  var elDays = document.getElementById("cd-days");
  var elHours = document.getElementById("cd-hours");
  var elMinutes = document.getElementById("cd-minutes");
  var elSeconds = document.getElementById("cd-seconds");

  function pad(n) { return String(n).padStart(2, "0"); }

  function tickCountdown() {
    var diff = WEDDING_DATE - Date.now();
    if (diff <= 0) {
      elDays.textContent = "00";
      elHours.textContent = "00";
      elMinutes.textContent = "00";
      elSeconds.textContent = "00";
      return;
    }
    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }

  if (elDays) {
    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  /* ---------- Background music ---------- */
  var MUSIC_KEY = "me-wedding-music-on";
  var audio = document.getElementById("bgAudio");

  function setMusicIcon(playing) {
    if (!musicToggle) return;
    musicToggle.classList.toggle("is-playing", playing);
    var dict = I18N[currentLang] || I18N.pt;
    musicToggle.setAttribute("aria-label", playing ? dict["music.pause"] : dict["music.play"]);
  }

  if (audio && musicToggle) {
    musicToggle.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().then(function () {
          setMusicIcon(true);
          try { localStorage.setItem(MUSIC_KEY, "1"); } catch (e) { /* ignore */ }
        }).catch(function () {
          setMusicIcon(false);
        });
      } else {
        audio.pause();
        setMusicIcon(false);
        try { localStorage.setItem(MUSIC_KEY, "0"); } catch (e) { /* ignore */ }
      }
    });

    var wantsMusic = false;
    try { wantsMusic = localStorage.getItem(MUSIC_KEY) === "1"; } catch (e) { /* ignore */ }

    if (wantsMusic) {
      audio.play().then(function () {
        setMusicIcon(true);
      }).catch(function () {
        // Autoplay blocked (no prior user gesture on this page load) — leave paused.
        setMusicIcon(false);
      });
    }
  }
})();
