/* «ЛОГОС» автомектеби — сайттын логикасы (таза JavaScript, китепканасыз) */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var DICT = window.I18N || { ru: {}, ky: {} };
  var QUIZ = window.QUIZ || [];
  var LS = { lang: "logos.lang", form: "logos.form", quiz: "logos.quiz" };

  /* ---------- утилиталар ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function store(key, val) { try { if (val === undefined) { return window.localStorage.getItem(key); } window.localStorage.setItem(key, val); } catch (e) { return null; } }
  function drop(key) { try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ } }
  function pick(obj, lang) { if (obj == null) return ""; if (typeof obj === "string") return obj; return obj[lang] || obj.ru || obj.ky || ""; }
  function fmt(n) { return new Intl.NumberFormat("ru-RU").format(Math.round(n)); }
  function digits(s) { return String(s || "").replace(/[^\d]/g, ""); }
  function telHref(p) { return "tel:" + String(p).replace(/[^\d+]/g, ""); }

  var lang = "ru";
  function t(key) { return (DICT[lang] && DICT[lang][key]) || (DICT.ru && DICT.ru[key]) || key; }

  var ICONS = {
    teacher: '<svg viewBox="0 0 24 24"><path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M7 10.5V15c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5"/></svg>',
    smile: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 14c1 1.5 2.4 2.2 4 2.2s3-.7 4-2.2"/><path d="M9 9.5h.01M15 9.5h.01"/></svg>',
    percent: '<svg viewBox="0 0 24 24"><path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="17" r="2.2"/></svg>',
    car: '<svg viewBox="0 0 24 24"><path d="M5 16V11l1.7-4.2A2 2 0 018.6 5.5h6.8a2 2 0 011.9 1.3L19 11v5"/><path d="M3.5 11h17M5 16h14v2.5H5z"/><circle cx="7.5" cy="13.5" r=".6"/><circle cx="16.5" cy="13.5" r=".6"/></svg>',
    quiz: '<svg viewBox="0 0 24 24"><rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 8.5h8M8 12.5h8M8 16.5h5"/></svg>',
    check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/></svg>',
    moto: '<svg viewBox="0 0 24 24"><circle cx="6" cy="16" r="3"/><circle cx="18" cy="16" r="3"/><path d="M6 16l3-7h4l3 7M9 9H7M13 9l2-3h2"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/></svg>',
    bus: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="13" rx="2.5"/><path d="M4 11h16M8 20v-3M16 20v-3M8 14h.01M16 14h.01"/></svg>',
    users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.5-3 2.7-4.5 5.5-4.5s5 1.5 5.5 4.5"/><path d="M16 11a2.7 2.7 0 100-5.4M17 14.7c2 .3 3.2 1.7 3.5 4.3"/></svg>'
  };

  /* ---------- тил ---------- */
  function applyStatic() {
    $$("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $$("[data-i18n-placeholder]").forEach(function (el) { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder"))); });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    var md = $('meta[name="description"]'); if (md) md.setAttribute("content", t("meta.description"));
    var ogt = $('meta[property="og:title"]'); if (ogt) ogt.setAttribute("content", t("meta.title"));
    var ogd = $('meta[property="og:description"]'); if (ogd) ogd.setAttribute("content", t("meta.description"));
    var ogl = $('meta[property="og:locale"]'); if (ogl) ogl.setAttribute("content", lang === "ky" ? "ky_KG" : "ru_RU");
    $$(".lang__btn").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false"); });
    $("#fab .fab__apply").setAttribute("aria-label", t("btn.apply"));
    $("#fab .fab__call").setAttribute("aria-label", t("btn.call"));
  }

  function setLang(next) {
    if (next !== "ru" && next !== "ky") next = "ru";
    lang = next; store(LS.lang, lang);
    applyStatic();
    renderAll();
  }

  /* ---------- динамикалык бөлүмдөр ---------- */
  function enabledCats() { return (CFG.categories || []).filter(function (c) { return c && c.enabled; }); }

  function renderWhy() {
    var items = [["teacher", "f1"], ["smile", "f2"], ["percent", "f3"], ["car", "f4"], ["quiz", "f5"], ["check", "f6"]];
    $("#why-grid").innerHTML = items.map(function (it) {
      return '<article class="card feature"><div class="ico">' + ICONS[it[0]] + '</div><h3>' + esc(t("why." + it[1] + ".t")) + '</h3><p>' + esc(t("why." + it[1] + ".d")) + '</p></article>';
    }).join("");
  }

  function renderCourses() {
    var cats = enabledCats();
    var html = cats.map(function (c) {
      var price = (typeof c.price === "number" && c.price > 0)
        ? '<div class="course__price">' + esc(t("courses.price.from")) + ': ' + fmt(c.price) + ' ' + esc(t("courses.currency")) + '</div>'
        : '<div class="course__price is-ask">' + esc(t("courses.price.ask")) + '</div>';
      return '<article class="card course"><div class="ico">' + (ICONS[c.icon] || ICONS.car) + '</div><h3>' + esc(pick(c.title, lang)) + '</h3><p>' + esc(pick(c.text, lang)) + '</p>' + price +
        '<a class="btn btn--primary" href="#contact" data-pick-cat="' + esc(c.id) + '">' + esc(t("courses.apply")) + '</a></article>';
    }).join("");
    html += '<article class="card course course--other"><div class="ico">' + ICONS.users + '</div><h3>' + esc(t("courses.other.t")) + '</h3><p>' + esc(t("courses.other.d")) + '</p><a class="btn btn--ghost" href="#contact">' + esc(t("btn.apply")) + '</a></article>';
    $("#courses-grid").innerHTML = html;

    // категория тандоочулар (форма жана калькулятор)
    var fc = $("#f-category"), prev = fc.value;
    fc.innerHTML = '<option value="">' + esc(t("form.category.any")) + '</option>' + cats.map(function (c) {
      return '<option value="' + esc(c.id) + '">' + esc(pick(c.title, lang)) + '</option>';
    }).join("");
    fc.value = prev && cats.some(function (c) { return c.id === prev; }) ? prev : "";

    var cc = $("#calc-cat"), cprev = cc.value;
    cc.innerHTML = '<option value="">' + esc(t("calc.category.custom")) + '</option>' + cats.filter(function (c) { return typeof c.price === "number" && c.price > 0; }).map(function (c) {
      return '<option value="' + esc(c.id) + '">' + esc(pick(c.title, lang)) + " — " + fmt(c.price) + " " + esc(t("courses.currency")) + '</option>';
    }).join("");
    cc.value = cprev || "";
    $("#calc-cat-wrap").hidden = cc.options.length <= 1;
  }

  function parseDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function fmtDate(d) {
    try { return d.toLocaleDateString(lang === "ky" ? "ru-RU" : "ru-RU", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return d.toDateString(); }
  }

  function renderGroups() {
    var list = (CFG.groups || []).filter(function (g) { var d = parseDate(g.start); return d && d.getTime() >= new Date().setHours(0, 0, 0, 0); });
    $("#groups-wrap").hidden = list.length === 0;
    $("#groups-grid").innerHTML = list.map(function (g) {
      var d = parseDate(g.start);
      var seats = typeof g.seats === "number" ? '<div class="group__seats">' + esc(t("groups.seats.left")) + " " + g.seats + "</div>" : "";
      return '<article class="card group"><div>' + esc(t("groups.start")) + '</div><div class="group__date">' + esc(fmtDate(d)) + '</div><div>' + esc(pick(g.time, lang)) + '</div>' + seats +
        '<a class="btn btn--primary" href="#contact">' + esc(t("groups.apply")) + '</a></article>';
    }).join("");
  }

  function renderSteps() {
    $("#steps").innerHTML = [1, 2, 3, 4, 5].map(function (i) {
      return '<li><h3>' + esc(t("process.s" + i + ".t")) + '</h3><p>' + esc(t("process.s" + i + ".d")) + '</p></li>';
    }).join("");
  }

  function renderTeam() {
    var items = [["teacher", "1"], ["smile", "2"], ["car", "3"]];
    $("#team-grid").innerHTML = items.map(function (it) {
      return '<article class="card team"><div class="ico">' + ICONS[it[0]] + '</div><h3>' + esc(t("team.t" + it[1])) + '</h3><p>' + esc(t("team.d" + it[1])) + '</p></article>';
    }).join("");
    var ins = CFG.instructors || [];
    var ig = $("#instructors-grid");
    ig.hidden = ins.length === 0;
    ig.innerHTML = ins.map(function (p) {
      var img = p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy" width="110" height="110">' : "";
      return '<article class="card person">' + img + '<strong>' + esc(p.name) + '</strong><span>' + esc(pick(p.exp, lang)) + '</span></article>';
    }).join("");
    var g = CFG.gallery || [], gw = $("#gallery");
    gw.hidden = g.length === 0;
    gw.innerHTML = g.map(function (x) { return '<img src="' + esc(x.src) + '" alt="' + esc(pick(x.alt, lang)) + '" loading="lazy">'; }).join("");
  }

  function renderReviews() {
    var rv = CFG.reviews || [], box = $("#reviews-grid");
    if (rv.length) {
      box.innerHTML = rv.map(function (r) { return '<article class="card review"><p>«' + esc(pick(r.text, lang)) + '»</p><strong>' + esc(r.name) + '</strong></article>'; }).join("");
    } else {
      var ig = CFG.instagram ? "https://www.instagram.com/" + encodeURIComponent(CFG.instagram) + "/" : "";
      box.innerHTML = '<article class="card" style="grid-column:1/-1;text-align:center"><h3>' + esc(t("reviews.empty.t")) + '</h3><p>' + esc(t("reviews.empty.d")) + '</p>' +
        (ig ? '<a class="btn btn--primary" href="' + esc(ig) + '" target="_blank" rel="noopener">' + esc(t("reviews.empty.cta")) + '</a>' : "") + '</article>';
    }
  }

  function renderFaq() {
    var n = 8, html = "";
    for (var i = 1; i <= n; i++) html += '<details><summary>' + esc(t("faq.q" + i)) + '</summary><p>' + esc(t("faq.a" + i)) + '</p></details>';
    $("#faq-list").innerHTML = html;
  }

  /* ---------- байланыш ---------- */
  function waLink(text) { return "https://wa.me/" + digits(CFG.whatsapp) + (text ? "?text=" + encodeURIComponent(text) : ""); }
  function mapQ() { return encodeURIComponent(CFG.mapQuery || pick(CFG.address, lang)); }

  function renderContact() {
    var rows = [];
    rows.push('<div><dt>' + esc(t("contact.address")) + '</dt><dd>' + esc(pick(CFG.address, lang)) + '</dd></div>');
    var phones = [CFG.phone, CFG.phone2].filter(Boolean);
    if (phones.length) rows.push('<div><dt>' + esc(t("contact.phone")) + '</dt><dd>' + phones.map(function (p) { return '<a href="' + esc(telHref(p)) + '">' + esc(p) + '</a>'; }).join("<br>") + '</dd></div>');
    var h = pick(CFG.hours, lang);
    if (h) rows.push('<div><dt>' + esc(t("contact.hours")) + '</dt><dd>' + esc(h) + '</dd></div>');
    if (CFG.email) rows.push('<div><dt>Email</dt><dd><a href="mailto:' + esc(CFG.email) + '">' + esc(CFG.email) + '</a></dd></div>');
    $("#info-list").innerHTML = rows.join("");

    var s = [];
    if (CFG.whatsapp) s.push('<a href="' + esc(waLink("")) + '" target="_blank" rel="noopener">WhatsApp</a>');
    if (CFG.telegram) s.push('<a href="https://t.me/' + esc(CFG.telegram) + '" target="_blank" rel="noopener">Telegram</a>');
    if (CFG.instagram) s.push('<a href="https://www.instagram.com/' + esc(CFG.instagram) + '/" target="_blank" rel="noopener">Instagram</a>');
    if (CFG.facebook) s.push('<a href="' + esc(CFG.facebook) + '" target="_blank" rel="noopener">Facebook</a>');
    if (CFG.tiktok) s.push('<a href="' + esc(CFG.tiktok) + '" target="_blank" rel="noopener">TikTok</a>');
    $("#socials").innerHTML = s.join("");

    var q = mapQ();
    var frame = $("#map-frame"), src = "https://www.google.com/maps?q=" + q + "&hl=" + lang + "&z=16&output=embed";
    if (frame.getAttribute("src") !== src) frame.setAttribute("src", src);
    frame.setAttribute("title", t("contact.map"));
    $("#map-links").innerHTML =
      '<a href="https://www.google.com/maps/search/?api=1&query=' + q + '" target="_blank" rel="noopener">' + esc(t("contact.map.google")) + '</a>' +
      '<a href="https://2gis.kg/search/' + q + '" target="_blank" rel="noopener">' + esc(t("contact.map.2gis")) + '</a>' +
      '<a href="https://yandex.com/maps/?text=' + q + '" target="_blank" rel="noopener">' + esc(t("contact.map.yandex")) + '</a>';

    $("#footer-address").textContent = pick(CFG.address, lang);
    var lic = pick(CFG.license, lang), fl = $("#footer-license");
    fl.textContent = lic; fl.hidden = !lic;
  }

  function setupQuickContacts() {
    $$(".js-phone").forEach(function (a) {
      if (CFG.phone) { a.href = telHref(CFG.phone); a.hidden = false; } else { a.hidden = true; }
    });
    $$(".js-whatsapp").forEach(function (a) {
      if (CFG.whatsapp) { a.href = waLink(t("msg.hello")); a.target = "_blank"; a.rel = "noopener"; a.hidden = false; } else { a.hidden = true; }
    });
    if (CFG.logoImage) { var lg = $("#brand-logo"); lg.src = CFG.logoImage; }
  }

  function updateJsonLd() {
    var el = $("#ld-json"); if (!el) return;
    var data = {
      "@context": "https://schema.org", "@type": "DrivingSchool", name: "Автошкола «" + (CFG.brandName || "ЛОГОС") + "»",
      address: { "@type": "PostalAddress", streetAddress: "ул. Токтогул 32", addressLocality: "Жалал-Абад", addressCountry: "KG" },
      sameAs: []
    };
    if (CFG.phone) data.telephone = CFG.phone;
    if (CFG.email) data.email = CFG.email;
    if (CFG.instagram) data.sameAs.push("https://www.instagram.com/" + CFG.instagram + "/");
    if (CFG.facebook) data.sameAs.push(CFG.facebook);
    el.textContent = JSON.stringify(data);
  }

  /* ---------- бөлүп төлөө калькулятору ---------- */
  var calcState = { amount: 0, down: 30, months: 3 };

  function addMonths(date, n) {
    var d = new Date(date.getFullYear(), date.getMonth() + n, 1);
    var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(date.getDate(), last));
    return d;
  }

  function renderCalc() {
    var res = $("#calc-res");
    var a = calcState.amount;
    $("#calc-down-out").textContent = calcState.down + "%";
    $("#calc-months-out").textContent = calcState.months;
    if (!(a > 0)) { res.innerHTML = '<p class="note">' + esc(t("calc.empty")) + "</p>"; return; }
    var down = Math.round(a * calcState.down / 100);
    var rest = a - down, n = calcState.months;
    var pay = Math.ceil(rest / n);
    var last = rest - pay * (n - 1);
    if (last < 0) { pay = Math.floor(rest / n); last = rest - pay * (n - 1); }
    var today = new Date();
    var rows = '<tr><td>0</td><td>' + esc(t("calc.today")) + '</td><td>' + fmt(down) + '</td></tr>';
    for (var i = 1; i <= n; i++) rows += '<tr><td>' + i + '</td><td>' + esc(fmtDate(addMonths(today, i))) + '</td><td>' + fmt(i === n ? last : pay) + '</td></tr>';
    res.innerHTML =
      '<div class="res-grid">' +
      '<div class="res-item is-main"><span>' + esc(t("calc.res.monthly")) + '</span><strong>' + fmt(pay) + ' ' + esc(t("courses.currency")) + '</strong></div>' +
      '<div class="res-item"><span>' + esc(t("calc.res.down")) + '</span><strong>' + fmt(down) + '</strong></div>' +
      '<div class="res-item"><span>' + esc(t("calc.res.rest")) + '</span><strong>' + fmt(rest) + '</strong></div>' +
      '<div class="res-item"><span>' + esc(t("calc.res.total")) + '</span><strong>' + fmt(a) + '</strong></div>' +
      '<div class="res-item"><span>' + esc(t("calc.months")) + '</span><strong>' + n + '</strong></div></div>' +
      '<h3>' + esc(t("calc.schedule")) + '</h3><table class="sched"><thead><tr><th>' + esc(t("calc.col.n")) + '</th><th>' + esc(t("calc.col.date")) + '</th><th>' + esc(t("calc.col.sum")) + '</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<a class="btn btn--primary btn--block" href="#contact" id="calc-apply">' + esc(t("calc.apply")) + '</a>';
  }

  function initCalc() {
    var inst = CFG.installment || {};
    var maxM = Math.max(2, Math.min(36, inst.maxMonths || 12));
    var m = $("#calc-months"); m.max = maxM;
    calcState.months = Math.min(maxM, Math.max(1, inst.defaultMonths || 3));
    calcState.down = typeof inst.defaultDownPercent === "number" ? Math.min(90, Math.max(0, inst.defaultDownPercent)) : 30;
    m.value = calcState.months; $("#calc-down").value = calcState.down;

    $("#calc-amount").addEventListener("input", function (e) { calcState.amount = Math.max(0, Number(e.target.value) || 0); $("#calc-cat").value = ""; renderCalc(); });
    $("#calc-down").addEventListener("input", function (e) { calcState.down = Number(e.target.value); renderCalc(); });
    m.addEventListener("input", function (e) { calcState.months = Number(e.target.value); renderCalc(); });
    $("#calc-cat").addEventListener("change", function (e) {
      var c = enabledCats().filter(function (x) { return x.id === e.target.value; })[0];
      if (c && typeof c.price === "number") { calcState.amount = c.price; $("#calc-amount").value = c.price; }
      renderCalc();
    });
    $("#calc-form").addEventListener("submit", function (e) { e.preventDefault(); });
    $("#calc-res").addEventListener("click", function (e) {
      var a = e.target.closest("#calc-apply"); if (!a) return;
      var txt = t("calc.title") + ": " + fmt(calcState.amount) + " " + t("courses.currency") + ", " + t("calc.down") + " " + calcState.down + "%, " + calcState.months + " " + t("calc.months").toLowerCase();
      var cm = $("#f-comment"); if (cm && !cm.value) cm.value = txt;
    });
  }

  /* ---------- арыз формасы ---------- */
  function normPhone(raw) {
    var d = digits(raw);
    if (d.length === 12 && d.indexOf("996") === 0) return d;
    if (d.length === 10 && d.charAt(0) === "0") return "996" + d.slice(1);
    if (d.length === 9) return "996" + d;
    return null;
  }
  function prettyPhone(n) { return "+" + n.slice(0, 3) + " " + n.slice(3, 6) + " " + n.slice(6, 9) + " " + n.slice(9, 12); }

  function showErr(id, msg) {
    var el = $("#" + id); el.textContent = msg || ""; el.hidden = !msg;
  }
  function setInvalid(inp, bad) { if (bad) inp.setAttribute("aria-invalid", "true"); else inp.removeAttribute("aria-invalid"); }

  function labelOf(selectId, value) {
    var sel = $(selectId); if (!sel || !value) return "";
    var o = $$("option", sel).filter(function (x) { return x.value === value; })[0];
    return o ? o.textContent : value;
  }

  function buildMessage(d) {
    var lines = [t("msg.hello"), "", t("msg.name") + ": " + d.name, t("msg.phone") + ": " + d.phoneView];
    if (d.categoryLabel) lines.push(t("msg.category") + ": " + d.categoryLabel);
    if (d.transLabel) lines.push(t("msg.trans") + ": " + d.transLabel);
    if (d.timeLabel) lines.push(t("msg.time") + ": " + d.timeLabel);
    if (d.comment) lines.push(t("msg.comment") + ": " + d.comment);
    return lines.join("\n");
  }

  function copyText(text, done) {
    function fallback() {
      var ta = $("#form-result textarea"); if (!ta) return;
      ta.focus(); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); }
  }

  function showResult(kind, message, extraHtml) {
    var box = $("#form-result"), form = $("#apply-form");
    var title = kind === "fallback" ? t("form.fallback.t") : t("form.ok.t");
    var desc = kind === "fallback" ? t("form.fallback.d") : t("form.ok.d");
    box.innerHTML = '<h4>' + esc(title) + '</h4><p>' + esc(desc) + '</p>' + (extraHtml || "") +
      '<button type="button" class="btn btn--ghost" id="form-new">' + esc(t("form.new")) + '</button>';
    box.hidden = false; form.hidden = true;
    box.setAttribute("tabindex", "-1"); box.focus();
    $("#form-new").addEventListener("click", function () { box.hidden = true; form.hidden = false; form.reset(); $("#f-name").focus(); });
    var cb = $("#form-copy");
    if (cb) cb.addEventListener("click", function () { copyText(message, function () { cb.textContent = t("form.copied"); }); });
  }

  function deliver(d, message) {
    // 1) арыздарды кабыл алуучу endpoint (Formspree ж.б.)
    if (CFG.formEndpoint) {
      var ctl = ("AbortController" in window) ? new AbortController() : null;
      var timer = ctl ? setTimeout(function () { ctl.abort(); }, 12000) : null;
      return fetch(CFG.formEndpoint, {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name: d.name, phone: d.phoneView, category: d.categoryLabel, transmission: d.transLabel, time: d.timeLabel, comment: d.comment, language: lang, message: message, page: location.href }),
        signal: ctl ? ctl.signal : undefined
      }).then(function (r) {
        if (timer) clearTimeout(timer);
        if (!r.ok) throw new Error("http " + r.status);
        showResult("ok", message);
      });
    }
    // 2) WhatsApp
    if (CFG.whatsapp) {
      var url = waLink(message);
      var w = window.open(url, "_blank", "noopener");
      showResult("ok", message, '<p>' + esc(t("form.ok.wa")) + '</p><p><a class="btn btn--wa" href="' + esc(url) + '" target="_blank" rel="noopener">WhatsApp</a></p>');
      void w;
      return Promise.resolve();
    }
    // 3) email
    if (CFG.email) {
      var mail = "mailto:" + CFG.email + "?subject=" + encodeURIComponent(t("msg.hello")) + "&body=" + encodeURIComponent(message);
      window.location.href = mail;
      showResult("ok", message, '<p>' + esc(t("form.ok.email")) + '</p><p><a class="btn btn--primary" href="' + esc(mail) + '">Email</a></p>');
      return Promise.resolve();
    }
    // 4) ештеме жөндөлгөн эмес: текстти көчүрүү
    showResult("fallback", message, '<textarea readonly aria-label="' + esc(t("form.fallback.t")) + '">' + esc(message) + '</textarea><button type="button" class="btn btn--primary" id="form-copy">' + esc(t("form.copy")) + '</button>');
    return Promise.resolve();
  }

  function initForm() {
    var form = $("#apply-form");
    // мурунку маалыматты эстеп калуу
    try { var saved = JSON.parse(store(LS.form) || "{}"); if (saved.name) $("#f-name").value = saved.name; if (saved.phone) $("#f-phone").value = saved.phone; } catch (e) { /* ignore */ }

    $("#f-phone").addEventListener("blur", function (e) { var n = normPhone(e.target.value); if (n) e.target.value = prettyPhone(n); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#f-name").value.trim(), phoneRaw = $("#f-phone").value, phone = normPhone(phoneRaw), ok = true;
      showErr("err-send", "");
      if (name.length < 2) { showErr("err-name", t("form.err.name")); setInvalid($("#f-name"), true); ok = false; } else { showErr("err-name", ""); setInvalid($("#f-name"), false); }
      if (!phone) { showErr("err-phone", t("form.err.phone")); setInvalid($("#f-phone"), true); ok = false; } else { showErr("err-phone", ""); setInvalid($("#f-phone"), false); }
      if (!$("#f-consent").checked) { showErr("err-consent", t("form.err.consent")); ok = false; } else { showErr("err-consent", ""); }
      if (!ok) { var firstBad = $('#apply-form [aria-invalid="true"]') || $("#f-consent"); firstBad.focus(); return; }
      if ($('input[name="website"]', form).value) { showResult("ok", ""); return; } // spam тузак

      var d = {
        name: name, phoneView: prettyPhone(phone),
        categoryLabel: labelOf("#f-category", $("#f-category").value),
        transLabel: labelOf("#f-trans", $("#f-trans").value),
        timeLabel: labelOf("#f-time", $("#f-time").value),
        comment: $("#f-comment").value.trim()
      };
      if (!$("#f-category").value) d.categoryLabel = "";
      store(LS.form, JSON.stringify({ name: name, phone: d.phoneView }));
      var btn = $("#f-submit"), old = btn.textContent;
      btn.disabled = true; btn.textContent = t("form.sending");
      var message = buildMessage(d);
      Promise.resolve().then(function () { return deliver(d, message); }).catch(function () {
        var fb = CFG.whatsapp ? ' <a href="' + esc(waLink(message)) + '" target="_blank" rel="noopener">WhatsApp</a>' : "";
        var el = $("#err-send"); el.innerHTML = esc(t("form.err.send")) + fb; el.hidden = false;
      }).then(function () { btn.disabled = false; btn.textContent = old === t("form.sending") ? t("form.submit") : old; });
    });

    // тез форма (hero)
    $("#quick-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("#quick-phone").value;
      $("#f-phone").value = v;
      var n = normPhone(v); if (n) $("#f-phone").value = prettyPhone(n);
      document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
      setTimeout(function () { $("#f-name").focus({ preventScroll: true }); }, 500);
    });

    // курстун "Жазылуу" баскычы категорияны алдын ала тандайт
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-pick-cat]"); if (!a) return;
      $("#f-category").value = a.getAttribute("data-pick-cat");
    });

    // купуялуулук диалогу
    var dlg = $("#privacy-dialog");
    $("#privacy-link").addEventListener("click", function (e) { e.preventDefault(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); });
    $("#privacy-close").addEventListener("click", function () { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- ЖККЭ тренажёр ---------- */
  var qz = { mode: "practice", count: 10, items: [], i: 0, answers: [], done: false, locked: false };

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function qStats() { try { return JSON.parse(store(LS.quiz) || "{}"); } catch (e) { return {}; } }
  function saveStats(percent) {
    var s = qStats(); s.attempts = (s.attempts || 0) + 1; s.best = Math.max(s.best || 0, percent);
    store(LS.quiz, JSON.stringify(s));
  }

  function startQuiz(indices) {
    var pool = indices || QUIZ.map(function (_, i) { return i; });
    var n = Math.min(qz.count, pool.length);
    qz.items = shuffle(pool).slice(0, n).map(function (idx) {
      var len = QUIZ[idx].ru.o.length;
      var order = shuffle(Array.apply(null, Array(len)).map(function (_, k) { return k; }));
      return { idx: idx, order: order };
    });
    qz.i = 0; qz.answers = []; qz.done = false; qz.locked = false;
    renderQuiz(true);
  }

  function quizStart() {
    var s = qStats();
    var maxQ = QUIZ.length;
    var counts = [5, 10, maxQ].filter(function (v, i, a) { return v <= maxQ && a.indexOf(v) === i; });
    if (counts.indexOf(qz.count) < 0) qz.count = counts[Math.min(1, counts.length - 1)];
    var body = $("#quiz-body");
    body.innerHTML =
      '<div class="quiz__row"><div class="field"><span class="field-label" id="mode-l" style="font-weight:600;font-size:.92rem">' + esc(t("trainer.mode")) + '</span>' +
      '<div class="seg" role="group" aria-labelledby="mode-l"><button type="button" data-mode="practice" aria-pressed="' + (qz.mode === "practice") + '">' + esc(t("trainer.mode.practice")) + '</button>' +
      '<button type="button" data-mode="exam" aria-pressed="' + (qz.mode === "exam") + '">' + esc(t("trainer.mode.exam")) + '</button></div></div>' +
      '<div class="field"><span id="cnt-l" style="font-weight:600;font-size:.92rem">' + esc(t("trainer.count")) + '</span><div class="seg" role="group" aria-labelledby="cnt-l">' +
      counts.map(function (c) { return '<button type="button" data-count="' + c + '" aria-pressed="' + (qz.count === c) + '">' + c + '</button>'; }).join("") + '</div></div></div>' +
      '<button type="button" class="btn btn--primary" id="quiz-go">' + esc(t("trainer.start")) + '</button>' +
      ((s.attempts) ? '<div class="stats"><span>' + esc(t("trainer.progress")) + ': ' + esc(t("trainer.attempts")) + ' ' + s.attempts + ', ' + esc(t("trainer.best")) + ' ' + (s.best || 0) + '%</span><button type="button" class="linkbtn" id="quiz-reset">' + esc(t("trainer.reset")) + '</button></div>' : "");
  }

  function renderQuiz(focus) {
    var body = $("#quiz-body");
    if (!qz.items.length) { quizStart(); return; }
    if (qz.done) { renderQuizResult(); return; }
    var it = qz.items[qz.i], q = QUIZ[it.idx][lang];
    var ans = qz.answers[qz.i];                       // таандалган оригинал индекс же undefined
    var correctOrig = QUIZ[it.idx].a;
    var practice = qz.mode === "practice";
    var shown = practice && ans !== undefined;
    var letters = ["A", "B", "C", "D", "E"];
    var opts = it.order.map(function (orig, pos) {
      var cls = "opt";
      if (shown) { if (orig === correctOrig) cls += " is-correct"; else if (orig === ans) cls += " is-wrong"; }
      else if (ans === orig) cls += " is-picked";
      return '<button type="button" class="' + cls + '" data-orig="' + orig + '"' + (shown ? " disabled" : "") + ' aria-pressed="' + (ans === orig) + '"><b>' + letters[pos] + '</b><span>' + esc(q.o[orig]) + '</span></button>';
    }).join("");
    var expl = "";
    if (shown) {
      var good = ans === correctOrig;
      expl = '<div class="expl ' + (good ? "ok" : "bad") + '" role="status"><strong>' + esc(good ? t("trainer.correct") : t("trainer.wrong")) + '</strong> ' +
        (good ? "" : esc(t("trainer.right.is")) + " " + esc(q.o[correctOrig]) + ". ") + esc(q.e) + '</div>';
    }
    var last = qz.i === qz.items.length - 1;
    var canNext = ans !== undefined;
    body.innerHTML =
      '<div class="qmeta"><span>' + esc(t("trainer.q")) + ' ' + (qz.i + 1) + ' ' + esc(t("trainer.of")) + ' ' + qz.items.length + '</span><span>' + esc(practice ? t("trainer.mode.practice") : t("trainer.mode.exam")) + '</span></div>' +
      '<div class="bar" aria-hidden="true"><i style="width:' + Math.round(qz.i / qz.items.length * 100) + '%"></i></div>' +
      '<h3 class="qtext" id="qtext" tabindex="-1">' + esc(q.q) + '</h3><div class="opts" role="group" aria-labelledby="qtext">' + opts + '</div>' + expl +
      '<div class="qactions"><button type="button" class="btn btn--primary" id="quiz-next"' + (canNext ? "" : " disabled") + '>' + esc(last ? t("trainer.finish") : t("trainer.next")) + '</button></div>' +
      (canNext ? "" : '<p class="note" style="margin-top:10px">' + esc(t("trainer.pick")) + '</p>');
    if (focus) { var qt = $("#qtext"); if (qt) qt.focus({ preventScroll: true }); }
  }

  function renderQuizResult() {
    var correct = 0, wrong = [];
    qz.items.forEach(function (it, i) { if (qz.answers[i] === QUIZ[it.idx].a) correct++; else wrong.push(i); });
    var percent = Math.round(correct / qz.items.length * 100);
    if (!qz.saved) { saveStats(percent); qz.saved = true; }
    var msg = percent >= 80 ? t("trainer.pass") : t("trainer.fail");
    var mist = wrong.length ? wrong.map(function (i) {
      var it = qz.items[i], q = QUIZ[it.idx][lang], a = QUIZ[it.idx].a, my = qz.answers[i];
      return '<div class="mist"><p><strong>' + esc(q.q) + '</strong></p><p class="bad">' + esc(t("trainer.your")) + ': ' + esc(my === undefined ? "—" : q.o[my]) + '</p><p class="ok">' + esc(t("trainer.right.is")) + ' ' + esc(q.o[a]) + '</p><p>' + esc(q.e) + '</p></div>';
    }).join("") : '<p class="ok" style="font-weight:700;color:var(--ok)">' + esc(t("trainer.mistakes.none")) + '</p>';
    $("#quiz-body").innerHTML =
      '<h3>' + esc(t("trainer.result")) + '</h3><div class="score">' + correct + ' / ' + qz.items.length + ' (' + percent + '%)</div><p>' + esc(msg) + '</p>' +
      '<div class="qactions"><button type="button" class="btn btn--primary" id="quiz-retry">' + esc(t("trainer.retry")) + '</button>' +
      (wrong.length ? '<button type="button" class="btn btn--ghost" id="quiz-mist">' + esc(t("trainer.restartmistakes")) + '</button>' : "") + '</div>' +
      '<h3 style="margin-top:22px">' + esc(t("trainer.mistakes")) + '</h3>' + mist;
  }

  function initQuiz() {
    var body = $("#quiz-body");
    body.addEventListener("click", function (e) {
      var m = e.target.closest("[data-mode]"); if (m) { qz.mode = m.getAttribute("data-mode"); quizStart(); return; }
      var c = e.target.closest("[data-count]"); if (c) { qz.count = Number(c.getAttribute("data-count")); quizStart(); return; }
      if (e.target.closest("#quiz-go")) { qz.saved = false; startQuiz(); return; }
      if (e.target.closest("#quiz-reset")) { drop(LS.quiz); quizStart(); return; }
      var o = e.target.closest(".opt");
      if (o && !o.disabled) {
        var orig = Number(o.getAttribute("data-orig"));
        if (qz.mode === "practice" && qz.answers[qz.i] !== undefined) return;
        qz.answers[qz.i] = orig; renderQuiz(false);
        var nb = $("#quiz-next"); if (nb && qz.mode === "practice") nb.focus({ preventScroll: true });
        return;
      }
      if (e.target.closest("#quiz-next")) {
        if (qz.answers[qz.i] === undefined) return;
        if (qz.i < qz.items.length - 1) { qz.i++; renderQuiz(true); } else { qz.done = true; renderQuiz(true); }
        return;
      }
      if (e.target.closest("#quiz-retry")) { qz.items = []; qz.saved = false; quizStart(); return; }
      if (e.target.closest("#quiz-mist")) {
        var idxs = qz.items.filter(function (it, i) { return qz.answers[i] !== QUIZ[it.idx].a; }).map(function (it) { return it.idx; });
        qz.saved = false; qz.count = Math.max(qz.count, idxs.length); startQuiz(idxs); return;
      }
    });
    quizStart();
  }

  /* ---------- навигация ---------- */
  function initNav() {
    var nav = $("#nav"), burger = $("#burger");
    function close() { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open"); burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".header")) close(); });

    $$(".lang__btn").forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); }); });

    if ("IntersectionObserver" in window) {
      var links = $$(".nav a"), map = {};
      links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) { links.forEach(function (l) { l.classList.remove("is-active"); }); map[en.target.id].classList.add("is-active"); }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* ---------- жөндөө эскертүүсү (localhost'то гана) ---------- */
  function devBanner() {
    var h = location.hostname;
    if (!(h === "localhost" || h === "127.0.0.1" || h === "" || location.protocol === "file:")) return;
    var miss = [];
    if (!CFG.phone) miss.push(t("dev.phone"));
    if (!CFG.whatsapp) miss.push(t("dev.whatsapp"));
    if (!CFG.formEndpoint && !CFG.whatsapp && !CFG.email) miss.push(t("dev.form"));
    if (!enabledCats().some(function (c) { return typeof c.price === "number" && c.price > 0; })) miss.push(t("dev.price"));
    if (!pick(CFG.hours, "ru")) miss.push(t("dev.hours"));
    if (!(CFG.reviews || []).length) miss.push(t("dev.reviews"));
    if (!CFG.logoImage) miss.push(t("dev.logo"));
    var b = $("#dev-banner");
    if (!miss.length) { b.hidden = true; return; }
    b.innerHTML = "<strong>" + esc(t("dev.title")) + "</strong> " + esc(miss.join("; ")) + ". " + esc(t("dev.fix")) + ' <button type="button" class="btn btn--sm btn--ghost" id="dev-hide">' + esc(t("dev.hide")) + "</button>";
    b.hidden = false;
    $("#dev-hide").addEventListener("click", function () { b.hidden = true; });
  }

  /* ---------- жалпы рендер ---------- */
  function renderAll() {
    renderWhy(); renderCourses(); renderGroups(); renderSteps(); renderTeam(); renderReviews(); renderFaq();
    renderContact(); setupQuickContacts(); updateJsonLd(); renderCalc();
    if ($("#quiz-body").children.length) { if (qz.items.length) renderQuiz(false); else quizStart(); }
    devBanner();
  }

  function init() {
    var saved = store(LS.lang);
    lang = saved === "ky" || saved === "ru" ? saved : ((navigator.language || "").toLowerCase().indexOf("ky") === 0 ? "ky" : "ru");
    $("#year").textContent = new Date().getFullYear();
    applyStatic();
    initNav(); initCalc(); initForm(); initQuiz();
    renderAll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
