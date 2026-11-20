/* Aldebaran Labs — comportamiento del sitio (idioma, menú, copiar, formulario). */
(function () {
  "use strict";

  /* ---------- Textos comunes en inglés (header + footer) ---------- */
  var COMMON_EN = {
    "nav.ecosystem": "Ecosystem",
    "nav.capabilities": "Capabilities",
    "nav.company": "Company",
    "nav.contact": "Contact",
    "nav.cta": "Contact us",
    "brand.legal": "Inversiones Sistema Aldebaran, C.A.",
    "footer.about": "Inversiones Sistema Aldebaran, C.A. (Aldebaran Labs). Software engineering and digital platforms in Caracas, Venezuela.",
    "footer.ecosystem": "Ecosystem",
    "footer.company": "Company",
    "footer.capabilities": "Capabilities",
    "footer.about.link": "About us",
    "footer.contact": "Contact",
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

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var parts = pair.split(":");
        var attr = parts[0], key = parts[1];
        var store = "data-orig-" + attr;
        if (!el.hasAttribute(store)) el.setAttribute(store, el.getAttribute(attr) || "");
        el.setAttribute(attr, lang === "en" && EN[key] ? EN[key] : el.getAttribute(store));
      });
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

  /* ---------- Formulario de contacto (envío mediante cliente de correo) ---------- */
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
