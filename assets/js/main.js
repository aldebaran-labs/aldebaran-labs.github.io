/* Aldebaran Labs — comportamiento del sitio: idioma, menú, cielo, animaciones, copiar y formulario. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Textos comunes en inglés (header + footer) ---------- */
  var COMMON_EN = {
    "nav.projects": "Missions",
    "nav.capabilities": "Capabilities",
    "nav.company": "Company",
    "nav.contact": "Contact",
    "nav.cta": "Let’s talk",
    "brand.legal": "Inversiones Sistema Aldebaran, C.A.",
    "footer.about": "Inversiones Sistema Aldebaran, C.A. (Aldebaran Labs). Software engineering and digital platforms in Caracas, Venezuela.",
    "footer.company": "Company",
    "footer.projects": "Missions",
    "footer.capabilities": "Capabilities",
    "footer.about.link": "About us",
    "footer.contact": "Contact",
    "footer.reach": "Contact",
    "footer.legal": "Legal & compliance",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.corporate": "Corporate Information",
    "footer.contact.label": "Contact",
    "back": "Back to home"
  };

  var STORAGE_KEY = "aldebaran.lang";
  var originals = new WeakMap();

  function pageDictionary() {
    var node = document.getElementById("i18n-en");
    if (!node) return {};
    try { return JSON.parse(node.textContent); } catch (e) { return {}; }
  }
  var EN = Object.assign({}, COMMON_EN, pageDictionary());

  function readStoredLang() {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q === "en" || q === "es") return q;
      return window.localStorage.getItem(STORAGE_KEY) || "es";
    } catch (e) { return "es"; }
  }

  function storeLang(lang) {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* almacenamiento no disponible */ }
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      if (!originals.has(el)) originals.set(el, el.innerHTML);
      var key = el.getAttribute("data-i18n");
      el.innerHTML = lang === "en" && EN[key] ? EN[key] : originals.get(el);
    });
    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      if (!meta.hasAttribute("data-orig")) meta.setAttribute("data-orig", meta.content);
      meta.content = lang === "en" && EN["meta.description"] ? EN["meta.description"] : meta.getAttribute("data-orig");
    }
    if (!document.documentElement.hasAttribute("data-title")) document.documentElement.setAttribute("data-title", document.title);
    document.title = lang === "en" && EN["meta.title"] ? EN["meta.title"] : document.documentElement.getAttribute("data-title");
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
  }

  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () {
      var lang = b.getAttribute("data-lang");
      storeLang(lang);
      applyLang(lang);
    });
  });
  var initial = readStoredLang();
  if (initial !== "es") applyLang(initial);

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var mobile = document.getElementById("mobile-nav");
  if (toggle && mobile) {
    var setOpen = function (open) {
      mobile.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", function () { setOpen(!mobile.classList.contains("open")); });
    mobile.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  /* ---------- Header con borde al bajar ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Cielo estrellado (posiciones fijas, como el diseño original) ---------- */
  document.querySelectorAll(".sky").forEach(function (sky, n) {
    var seed = 7 + n * 13;
    var rnd = function () { return (seed = (seed * 9301 + 49297) % 233280) / 233280; };
    var count = sky.parentElement.classList.contains("hero") ? 70 : 34;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var s = document.createElement("i");
      s.style.left = (rnd() * 100) + "%";
      s.style.top = (rnd() * 100) + "%";
      s.style.setProperty("--o", (0.15 + rnd() * 0.45).toFixed(2));
      s.style.setProperty("--t", (2.5 + rnd() * 4).toFixed(2) + "s");
      s.style.setProperty("--dl", (-rnd() * 6).toFixed(2) + "s");
      if (rnd() > 0.86) s.className = "big";
      frag.appendChild(s);
    }
    sky.appendChild(frag);
  });

  /* ---------- Emblema que sigue suavemente al cursor ---------- */
  var emblem = document.getElementById("emblem");
  if (emblem && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var hero = emblem.closest(".hero");
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      emblem.style.transform = "translate(" + (x * 14).toFixed(1) + "px," + (y * 14).toFixed(1) + "px)";
    });
    hero.addEventListener("mouseleave", function () { emblem.style.transform = ""; });
  }

  /* ---------- Aparición al hacer scroll + escenarios que corren solo en pantalla ---------- */
  var reveals = document.querySelectorAll(".reveal");
  var stages = document.querySelectorAll(".stage");
  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); revealObs.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { revealObs.observe(el); });

    var stageObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        en.target.classList.toggle("playing", en.isIntersecting);
        en.target.querySelectorAll("svg").forEach(function (svg) {
          if (!svg.pauseAnimations) return;
          if (en.isIntersecting && !reduceMotion) svg.unpauseAnimations(); else svg.pauseAnimations();
        });
      });
    }, { threshold: 0.15 });
    stages.forEach(function (el) { stageObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
    stages.forEach(function (el) { el.classList.add("playing"); });
  }
  if (reduceMotion) {
    document.querySelectorAll(".stage svg").forEach(function (svg) { if (svg.pauseAnimations) svg.pauseAnimations(); });
  }

  /* ---------- Lealtad: QR que se renueva, puntos y comercios ---------- */
  var qr = document.getElementById("qr");
  var timer = document.querySelector(".qr-timer b");
  if (qr && timer && !reduceMotion) {
    var cells = Array.prototype.filter.call(qr.children, function (c) { return !c.classList.contains("fx"); });
    var pts = document.getElementById("pts");
    var shops = document.querySelectorAll("#merchants span");
    var points = 1240, shop = 0;
    timer.addEventListener("animationiteration", function () {
      cells.forEach(function (c) { c.classList.toggle("on", Math.random() < 0.48); });
      points += 10;
      if (pts) pts.textContent = points.toLocaleString("es-VE");
      if (shops.length) {
        shops[shop].classList.remove("active");
        shop = (shop + 1) % shops.length;
        shops[shop].classList.add("active");
      }
    });
  }

  /* ---------- Copiar al portapapeles ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var label = btn.querySelector("span");
      var done = function () {
        if (!label) return;
        var prev = label.textContent;
        label.textContent = document.documentElement.lang === "en" ? "Copied" : "Copiado";
        setTimeout(function () { label.textContent = prev; }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(done, function () {});
      } else {
        var t = document.createElement("textarea");
        t.value = value; t.setAttribute("readonly", ""); t.style.position = "absolute"; t.style.left = "-9999px";
        document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); done(); } catch (e) { /* sin soporte */ }
        document.body.removeChild(t);
      }
    });
  });

  /* ---------- Formulario de contacto (envío mediante el correo del visitante) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var ok = input.value.trim() !== "" && (input.type !== "email" || emailOk(input.value.trim()));
        field.classList.toggle("invalid", !ok);
        if (!ok && valid) { input.focus(); valid = false; }
      });
      if (!valid) return;
      var d = new FormData(form);
      var reason = form.querySelector("#f-reason option:checked").textContent.trim();
      var subject = "[" + reason + "] " + d.get("name") + (d.get("company") ? " — " + d.get("company") : "");
      var body = [
        "Nombre / Name: " + d.get("name"),
        "Empresa / Company: " + (d.get("company") || "—"),
        "Correo / Email: " + d.get("email"),
        "Motivo / Reason: " + reason,
        "",
        d.get("message")
      ].join("\n");
      window.location.href = "mailto:andres@aldebaransystems.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      var status = document.getElementById("form-status");
      if (status) status.classList.add("show");
    });
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("input", function () { input.closest(".field").classList.remove("invalid"); });
    });
  }

  /* ---------- Año del footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
