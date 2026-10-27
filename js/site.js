/* Bassem Boules — site behaviour.
   Every word and picture comes from content/site.json (edited by Bassem in Pages CMS).
   This file renders that content and runs the interactions. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function setText(id, v) { var n = $(id); if (n && v) n.textContent = v; }
  function setHref(id, v) { var n = $(id); if (n && v) n.href = v; }
  function joinMeta(w) { return [w.medium, w.size].filter(Boolean).join(" · "); }

  /* ---------------- content ---------------- */
  var content = null, works = [], visible = [];

  function render(c) {
    content = c; works = c.works || [];
    document.querySelectorAll("[data-bind]").forEach(function (n) {
      var v = c[n.getAttribute("data-bind")]; if (v) n.textContent = v;
    });
    setText("hero-line", c.heroLine);
    if (c.heroPhoto) $("hero-photo").src = c.heroPhoto;
    setText("intro-text", c.intro);
    var stats = $("stats"); stats.textContent = "";
    (c.stats || []).forEach(function (s) {
      var d = el("div"); d.appendChild(el("dt", null, s.value)); d.appendChild(el("dd", null, s.label)); stats.appendChild(d);
    });
    var pres = $("presented"); pres.textContent = "";
    (c.presentedWith || []).forEach(function (name) { pres.appendChild(el("li", null, name)); });

    var lp = c.lamp || {};
    if (lp.image) { $("lamp-dim").src = lp.image; $("lamp-lit").src = lp.image; }
    setText("lamp-label", lp.label); setText("lamp-hint", lp.hint);
    if (lp.title) {
      var h = $("lamp-title"); h.textContent = "";
      lp.title.split("\n").forEach(function (line, i) { if (i) h.appendChild(document.createElement("br")); h.appendChild(document.createTextNode(line)); });
    }

    renderSkills(c.skills || []);

    renderFilters(c.categories || []);
    renderGrid();

    var sv = c.services || {};
    setText("services-title", sv.title); setText("services-text", sv.text);
    var list = $("services-list"), sel = $("enq-type"); list.textContent = ""; sel.textContent = "";
    (sv.items || []).forEach(function (it) {
      var li = el("li", "service");
      li.appendChild(el("h3", "service__title", it.title));
      li.appendChild(el("p", "service__text", it.text));
      var a = el("a", "textlink service__link", "Enquire"); a.href = "#contact";
      a.addEventListener("click", function () { sel.value = it.title; });
      li.appendChild(a); list.appendChild(li);
      var o = el("option", null, it.title); o.value = it.title; sel.appendChild(o);
    });
    var other = el("option", null, "Something else"); other.value = "Something else"; sel.appendChild(other);

    var t = c.teaching || {};
    setText("studio-title", t.title); setText("studio-text", t.text); setText("studio-cta", t.cta);
    var photos = $("studio-photos"); photos.textContent = "";
    (t.images || []).forEach(function (im) {
      var f = el("figure"), img = el("img");
      img.src = im.src; img.alt = im.caption || ""; img.loading = "lazy";
      f.appendChild(img); if (im.caption) f.appendChild(el("figcaption", null, im.caption));
      photos.appendChild(f);
    });
    var ses = $("sessions"); ses.textContent = "";
    (t.sessions || []).forEach(function (s) {
      var li = el("li");
      li.appendChild(el("span", "s-date", s.date)); li.appendChild(el("span", "s-title", s.title));
      if (s.place) li.appendChild(el("span", "s-place", s.place));
      ses.appendChild(li);
    });

    var press = $("press"); press.textContent = "";
    (c.press || []).forEach(function (p) {
      var f = el("figure"); f.appendChild(el("blockquote", null, p.quote));
      var cap = el("figcaption", "label");
      if (p.link) { var a = el("a", "textlink", p.source); a.href = p.link; a.target = "_blank"; a.rel = "noopener"; cap.appendChild(a); }
      else cap.textContent = p.source;
      f.appendChild(cap); press.appendChild(f);
    });

    var g = c.guide || {};
    setText("guide-eyebrow", g.eyebrow); setText("guide-title", g.title); setText("guide-text", g.text); setText("guide-button", g.button);

    var ct = c.contact || {};
    setText("contact-title", ct.title); setText("contact-text", ct.text);
    if (ct.email) { setText("email-text", ct.email); setHref("email-link", "mailto:" + ct.email + "?subject=" + encodeURIComponent("Project enquiry")); }
    setHref("ig-link", ct.instagram);
  }

  /* ---------------- skills: hover a discipline to see it ---------------- */
  var peek = $("peek"), peekImg = $("peek-img"), fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  function renderSkills(items) {
    var ol = $("skills"); ol.textContent = "";
    items.forEach(function (k) {
      var li = el("li", "skill");
      li.appendChild(el("span", "skill__title", k.title));
      li.appendChild(el("p", "skill__text", k.text));
      if (k.image) {
        var th = el("img", "skill__thumb"); th.src = k.image; th.alt = k.title; th.loading = "lazy"; li.appendChild(th);
        if (fine) {
          li.addEventListener("pointerenter", function () { peekImg.src = k.image; peek.classList.add("is-on"); });
          li.addEventListener("pointerleave", function () { peek.classList.remove("is-on"); });
          li.addEventListener("pointermove", function (e) { peek.style.left = e.clientX + "px"; peek.style.top = e.clientY + "px"; });
        }
      }
      ol.appendChild(li);
    });
  }

  /* ---------------- gallery ---------------- */
  var activeCat = "All";
  function renderFilters(cats) {
    var box = $("filters"); box.textContent = "";
    ["All"].concat(cats).forEach(function (cat) {
      if (cat !== "All" && !works.some(function (w) { return w.category === cat; })) return;
      var b = el("button", null, cat); b.type = "button";
      b.setAttribute("aria-pressed", String(cat === activeCat));
      b.addEventListener("click", function () {
        activeCat = cat;
        box.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        applyFilter();
      });
      box.appendChild(b);
    });
  }

  var io = ("IntersectionObserver" in window && !reduceMotion) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;

  function renderGrid() {
    var grid = $("grid"); grid.textContent = "";
    works.forEach(function (w, i) {
      var fig = el("figure", "tile"); fig.dataset.cat = w.category || "";
      var btn = el("button", "tile__btn"); btn.type = "button"; btn.setAttribute("aria-label", "Open " + w.title);
      var img = el("img"); img.src = w.image; img.alt = w.title + " by Bassem Boules"; img.loading = i < 3 ? "eager" : "lazy";
      btn.appendChild(img); btn.addEventListener("click", function () { openViewer(i); });
      var cap = el("figcaption", "tile__cap");
      cap.appendChild(el("span", "tile__title", w.title));
      cap.appendChild(el("span", "tile__meta", [w.category === "Print & illustration" && /riso/i.test(w.medium || "") ? "Risograph" : (w.medium || "").split(",")[0], w.year].filter(Boolean).join(", ")));
      fig.appendChild(btn); fig.appendChild(cap); grid.appendChild(fig);
      // Only animate tiles that start below the fold, so nothing visible ever blinks.
      if (io && fig.getBoundingClientRect().top > window.innerHeight) io.observe(fig);
    });
    applyFilter();
  }
  function applyFilter() {
    visible = [];
    document.querySelectorAll("#grid .tile").forEach(function (t, i) {
      var show = activeCat === "All" || t.dataset.cat === activeCat;
      t.hidden = !show; if (show) visible.push(i);
    });
  }

  /* ---------------- viewer ---------------- */
  var viewer = $("viewer"), current = 0;
  function show(i) {
    var w = works[i]; if (!w) return; current = i;
    var img = $("viewer-img"); img.src = w.image; img.alt = w.title + " by Bassem Boules";
    $("viewer-title").textContent = w.title;
    $("viewer-meta").textContent = [joinMeta(w), w.year].filter(Boolean).join(" · ");
    $("viewer-story").textContent = w.story || "";
    $("viewer-status").textContent = [w.status, w.price].filter(Boolean).join(" · ");
    var link = $("viewer-link");
    link.removeAttribute("target");
    if (w.link) {
      link.hidden = false; link.href = w.link; link.target = "_blank"; link.rel = "noopener";
      link.textContent = /\/reel\//.test(w.link) ? "Watch it being made" : "See it on Instagram";
    } else if (/available/i.test(w.status || "")) {
      link.hidden = false; link.href = "#contact"; link.textContent = "Enquire about this print";
    } else link.hidden = true;
  }
  function openViewer(i) { show(i); if (viewer.showModal) viewer.showModal(); else viewer.setAttribute("open", ""); }
  function step(d) {
    var pos = visible.indexOf(current); if (pos < 0) pos = 0;
    show(visible[(pos + d + visible.length) % visible.length]);
  }
  $("viewer-close").addEventListener("click", function () { viewer.close(); });
  $("viewer-link").addEventListener("click", function () { if (this.getAttribute("href") === "#contact") viewer.close(); });
  $("viewer-prev").addEventListener("click", function () { step(-1); });
  $("viewer-next").addEventListener("click", function () { step(1); });
  viewer.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
  var sx = null;
  viewer.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener("touchend", function (e) {
    if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  });

  fetch("content/site.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function (err) { console.warn("Could not load content/site.json", err); });

  /* ---------------- the lamp ---------------- */
  (function lamp() {
    var box = $("lamp"); if (!box) return;
    var W = 0, H = 0, cx = 0, cy = 0, tx = 0, ty = 0, base = 300;
    var lastMove = -1e9, running = false, onScreen = true, t0 = performance.now();

    function home() { return { x: W * 0.5, y: H * (W > H ? 0.3 : 0.32) }; }
    function measure() {
      var r = box.getBoundingClientRect(); W = r.width; H = r.height;
      base = Math.max(170, Math.min(440, Math.max(W, H) * (W > 700 ? 0.27 : 0.42)));
      if (!cx) { var h = home(); cx = tx = h.x; cy = ty = h.y; }
    }
    function paint(r) {
      box.style.setProperty("--x", cx.toFixed(1) + "px");
      box.style.setProperty("--y", cy.toFixed(1) + "px");
      box.style.setProperty("--r", r.toFixed(1) + "px");
    }
    function frame(now) {
      if (!onScreen) { running = false; return; }
      var t = (now - t0) / 1000;
      if (now - lastMove > 2200) {            // nobody holding the lamp: it drifts on its own
        var h = home();
        tx = h.x + Math.sin(t * 0.37) * W * 0.2;
        ty = h.y + Math.sin(t * 0.53 + 1.2) * H * 0.12;
      }
      var k = now - lastMove > 2200 ? 0.02 : 0.12;
      cx += (tx - cx) * k; cy += (ty - cy) * k;
      var flicker = 1 + Math.sin(t * 7.1) * 0.018 + Math.sin(t * 12.7 + 2) * 0.012 + Math.sin(t * 2.3) * 0.02;
      paint(base * flicker);
      requestAnimationFrame(frame);
    }
    function start() { if (!running && !reduceMotion) { running = true; requestAnimationFrame(frame); } }

    function aim(e) {
      var r = box.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top; lastMove = performance.now(); start();
    }
    box.addEventListener("pointermove", aim);
    box.addEventListener("pointerdown", aim);
    window.addEventListener("resize", function () { measure(); if (reduceMotion) paint(base); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; if (onScreen) start(); }).observe(box);
    }
    measure(); paint(base); start();
  })();

  /* ---------------- header ---------------- */
  var bar = $("bar"), ticking = false;
  function onScroll() { ticking = false; bar.classList.toggle("is-solid", window.scrollY > 40); }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------------- free guide (lead magnet) ---------------- */
  var form = $("guide-form"), msg = $("guide-msg");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("lead-email").value.trim(), name = $("lead-name").value.trim();
    msg.className = "form__msg";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = "Please enter an email address like name@example.com.";
      msg.classList.add("is-error"); $("lead-email").focus(); return;
    }
    var g = (content && content.guide) || {}, btn = $("guide-button"); btn.disabled = true;
    function done() {
      btn.disabled = false; form.reset();
      msg.textContent = (g.success || "Thank you.") + " ";
      if (g.downloadUrl) { var a = el("a", null, "Open the guide"); a.href = g.downloadUrl; a.target = "_blank"; a.rel = "noopener"; msg.appendChild(a); }
    }
    if (!g.formEndpoint) { done(); return; }   // no email service connected yet: still hand over the guide
    fetch(g.formEndpoint, {
      method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ name: name, email: email, source: "Portrait Notes guide" })
    }).then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
      .catch(function () { btn.disabled = false; msg.classList.add("is-error"); msg.textContent = "That didn't go through. Check your connection and try again."; });
  });

  /* ---------------- project enquiry ---------------- */
  $("enquiry").addEventListener("submit", function (e) {
    e.preventDefault();
    var out = $("enq-msg-out"), email = $("enq-email").value.trim();
    out.className = "form__msg";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      out.textContent = "Please enter an email address like name@example.com."; out.classList.add("is-error"); $("enq-email").focus(); return;
    }
    var ct = (content && content.contact) || {}, to = ct.email || "bassemboules23@gmail.com";
    var data = { name: $("enq-name").value.trim(), email: email, interest: $("enq-type").value, message: $("enq-msg").value.trim() };
    var btn = $("enq-button"); btn.disabled = true;
    function fallback() {
      // No form service connected: prepare the email so the visitor can send it themselves.
      btn.disabled = false;
      var body = data.message + "\n\n" + data.name + "\n" + data.email;
      out.textContent = "Almost there: send it from your email app to " + to + ". ";
      var a = el("a", null, "Open email");
      a.href = "mailto:" + to + "?subject=" + encodeURIComponent(data.interest + " enquiry") + "&body=" + encodeURIComponent(body);
      out.appendChild(a);
    }
    if (!ct.formEndpoint) { fallback(); return; }
    fetch(ct.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); btn.disabled = false; $("enquiry").reset(); out.textContent = "Thank you. Bassem will reply to " + email + " personally."; })
      .catch(fallback);
  });

  /* ---------------- copy email ---------------- */
  $("copy-email").addEventListener("click", function () {
    var b = this, text = $("email-text").textContent;
    function ok() { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1800); }
    function fallback() {
      var r = document.createRange(); r.selectNodeContents($("email-text"));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Selected";
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  });
})();
