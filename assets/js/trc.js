/* Study Abroad By SiU — interactions */
(function () {
  "use strict";
  var WA = "923079499994";
  document.documentElement.classList.remove("no-js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.dataLayer = window.dataLayer || [];
  function track(ev, d) { window.dataLayer.push(Object.assign({ event: ev }, d || {})); if (typeof gtag === "function") gtag("event", ev, d || {}); }

  var top = document.querySelector(".top");
  function onScroll() { if (top) top.classList.toggle("scrolled", scrollY > 10); journey(); }
  addEventListener("scroll", onScroll, { passive: true });

  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () { var o = document.body.classList.toggle("nav-open"); burger.setAttribute("aria-expanded", o); });
    document.querySelectorAll(".menu a").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("nav-open"); }); });
  }

  /* reveal */
  var rv = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .15, rootMargin: "0px 0px -40px 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* boarding pass rotation */
  var pass = document.querySelector(".pass");
  if (pass && window.SIU_DEST) {
    var D = window.SIU_DEST, i = 0, pager = document.querySelector(".dots-pager"), timer;
    var f = function (k) { return pass.querySelector('[data-k="' + k + '"]'); };
    D.forEach(function (_, n) {
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Show " + D[n].name);
      b.addEventListener("click", function () { show(n); restart(); }); pager.appendChild(b);
    });
    function paint(n) {
      var d = D[n];
      f("code").textContent = d.code; f("city").textContent = d.city + ", " + d.name;
      f("intake").textContent = d.intake; f("perk").textContent = d.perk; f("flag").textContent = d.flag;
      f("status").textContent = d.status; pass.setAttribute("href", d.href);
      pager.querySelectorAll("button").forEach(function (b, k) { b.classList.toggle("on", k === n); });
    }
    function show(n) {
      if (reduce) { i = n; paint(n); return; }
      pass.classList.add("flip");
      setTimeout(function () { i = n; paint(n); pass.classList.remove("flip"); }, 360);
    }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show((i + 1) % D.length); }, 3600); }
    paint(0); restart();
  }

  /* split-flap text */
  var CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  function flapIn(el) {
    var target = el.getAttribute("data-flap"), cells = [];
    el.innerHTML = "";
    for (var k = 0; k < target.length; k++) { var c = document.createElement("i"); c.textContent = target[k] === " " ? " " : CH[Math.floor(Math.random() * CH.length)]; el.appendChild(c); cells.push(c); }
    if (reduce) { cells.forEach(function (c, k) { c.textContent = target[k] === " " ? " " : target[k]; }); return; }
    cells.forEach(function (c, k) {
      var n = 0, max = 6 + k * 2;
      var t = setInterval(function () {
        if (++n >= max) { clearInterval(t); c.textContent = target[k] === " " ? " " : target[k]; }
        else c.textContent = CH[Math.floor(Math.random() * CH.length)];
      }, 55);
    });
  }
  var flaps = document.querySelectorAll("[data-flap]");
  if ("IntersectionObserver" in window) {
    var fo = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { flapIn(e.target); fo.unobserve(e.target); } }); }, { threshold: .6 });
    flaps.forEach(function (el) { fo.observe(el); });
  } else flaps.forEach(flapIn);

  /* journey progress */
  var jt = document.querySelector(".jtrack");
  function journey() {
    if (!jt) return;
    var r = jt.getBoundingClientRect(), vh = innerHeight;
    var p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
    jt.style.setProperty("--p", p.toFixed(3));
    jt.querySelectorAll(".jstep").forEach(function (s, k, all) { s.classList.toggle("on", p >= (k + .2) / all.length); });
  }
  journey();

  /* tracking */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a"); if (!a) return;
    var h = a.getAttribute("href") || "";
    if (h.indexOf("wa.me") > -1) track("whatsapp_click", { location: a.getAttribute("data-loc") || "link", page: location.pathname });
    if (h.indexOf("tel:") === 0) track("phone_click", { page: location.pathname });
  });

  /* lead form */
  document.querySelectorAll("form.lead").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = new FormData(form), err = form.querySelector(".err");
      var name = (f.get("name") || "").toString().trim(), phone = (f.get("phone") || "").toString().trim();
      if (name.length < 2) { err.textContent = "Please enter your full name."; form.querySelector('[name="name"]').focus(); return; }
      if (!/^[+\d][\d\s-]{9,15}$/.test(phone)) { err.textContent = "Please enter a valid WhatsApp number."; form.querySelector('[name="phone"]').focus(); return; }
      err.textContent = "";
      var msg = ["Assalam o Alaikum The Royal Consultants,", "I would like a free consultation.", "", "Name: " + name, "Phone: " + phone,
        "Service: " + (f.get("service") || "-"), "Country: " + (f.get("country") || "-"), "City: " + (f.get("city") || "-"), "When: " + (f.get("when") || "-")].join("\n");
      track("generate_lead", { country: f.get("country") || "", page: location.pathname });
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
      form.reset();
    });
  });

  /* articles search + filter */
  var grid = document.getElementById("art-grid");
  if (grid) {
    var q = document.getElementById("art-q"), chips = document.querySelectorAll(".chip"), cat = "all", nr = document.getElementById("no-res");
    function apply() {
      var s = (q && q.value || "").toLowerCase().trim(), n = 0;
      grid.querySelectorAll(".acard").forEach(function (c) {
        var ok = (cat === "all" || c.dataset.cat === cat) && (!s || c.dataset.text.indexOf(s) > -1);
        c.hidden = !ok; if (ok) { n++; c.classList.add("in"); }
      });
      nr.hidden = n > 0;
    }
    chips.forEach(function (c) { c.addEventListener("click", function () { chips.forEach(function (x) { x.classList.remove("on"); }); c.classList.add("on"); cat = c.dataset.filter; apply(); }); });
    if (q) q.addEventListener("input", apply);
  }

  /* toc scrollspy */
  var links = document.querySelectorAll(".toc a");
  if (links.length && "IntersectionObserver" in window) {
    var m = {}; links.forEach(function (l) { m[l.getAttribute("href").slice(1)] = l; });
    var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { links.forEach(function (l) { l.classList.remove("active"); }); if (m[e.target.id]) m[e.target.id].classList.add("active"); } }); }, { rootMargin: "-100px 0px -65% 0px" });
    Object.keys(m).forEach(function (id) { var h = document.getElementById(id); if (h) so.observe(h); });
  }
  document.querySelectorAll(".copy-link").forEach(function (b) {
    b.addEventListener("click", function () { var done = function () { b.classList.add("copied"); setTimeout(function () { b.classList.remove("copied"); }, 1500); };
      navigator.clipboard ? navigator.clipboard.writeText(b.dataset.url).then(done, done) : done(); });
  });
  document.querySelectorAll("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();

/* TRC: passport stamps, service tabs, destination filter, counters */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pp = document.querySelector(".pp");
  if (pp) {
    var stamps = pp.querySelectorAll(".stamp");
    function cycle() {
      stamps.forEach(function (s) { s.classList.remove("on"); });
      pp.classList.remove("open");
      setTimeout(function () { pp.classList.add("open"); }, 500);
      stamps.forEach(function (s, i) { setTimeout(function () { s.classList.add("on"); }, 1900 + i * 650); });
    }
    if (reduce) { pp.classList.add("open"); stamps.forEach(function (s) { s.classList.add("on"); }); }
    else { cycle(); setInterval(cycle, 11000); }
    var stage = document.querySelector(".pp-stage");
    if (stage && matchMedia("(pointer:fine)").matches && !reduce) {
      stage.addEventListener("pointermove", function (e) {
        var r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        pp.style.rotate = "y " + (x * 10) + "deg"; pp.style.translate = "0 " + (y * -8) + "px";
      });
      stage.addEventListener("pointerleave", function () { pp.style.rotate = ""; pp.style.translate = ""; });
    }
  }
  var tabs = document.querySelectorAll(".svc-tabs button");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-selected", "false"); });
      t.classList.add("on"); t.setAttribute("aria-selected", "true");
      document.querySelectorAll(".svc-panel").forEach(function (p) { p.hidden = p.id !== t.getAttribute("aria-controls"); });
    });
  });
  var auto = 0, autoT = !reduce && tabs.length ? setInterval(function () { auto = (auto + 1) % tabs.length; tabs[auto].click(); }, 5000) : null;
  tabs.forEach(function (t) { t.addEventListener("pointerdown", function () { clearInterval(autoT); }); });
  var fb = document.querySelectorAll(".dfilter button");
  fb.forEach(function (b) {
    b.addEventListener("click", function () {
      fb.forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on");
      var f = b.dataset.f;
      document.querySelectorAll(".dgrid .dc").forEach(function (c) { c.hidden = !(f === "all" || c.dataset.kind === f); if (!c.hidden) c.classList.add("in"); });
    });
  });
  var cnt = document.querySelectorAll("[data-count]");
  function run(el) {
    var end = +el.dataset.count, suf = el.dataset.suffix || "", s = null;
    if (reduce) { el.textContent = end + suf; return; }
    (function step(ts) { if (!s) s = ts; var p = Math.min((ts - s) / 1600, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(step); })(performance.now());
  }
  if ("IntersectionObserver" in window) {
    var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { run(e.target); o.unobserve(e.target); } }); }, { threshold: .6 });
    cnt.forEach(function (c) { o.observe(c); });
  } else cnt.forEach(run);
})();
