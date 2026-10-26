/* Bassem Boules — site behaviour.
   All words and pictures come from content/site.json, which Bassem edits through Pages CMS.
   This file only renders that content and runs the interactions. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (id) { return document.getElementById(id); };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function setText(id, value) { var n = $(id); if (n && value) n.textContent = value; }
  function setHref(id, value) { var n = $(id); if (n && value) n.href = value; }
  function paragraphs(target, text) {
    if (!target || !text) return;
    target.textContent = "";
    String(text).split(/\n\s*\n/).forEach(function (p) { target.appendChild(el("p", null, p.trim())); });
  }

  /* ---------------- content ---------------- */
  var content = null;

  function render(c) {
    content = c;
    document.querySelectorAll("[data-bind]").forEach(function (n) {
      var v = c[n.getAttribute("data-bind")];
      if (v) n.textContent = v;
    });

    if (c.about) {
      setText("about-title", c.about.title);
      paragraphs($("about-text"), c.about.text);
      if (c.about.portrait) $("about-portrait").src = c.about.portrait;
      var facts = $("about-facts"); facts.textContent = "";
      (c.about.facts || []).forEach(function (f) {
        var row = el("div");
        row.appendChild(el("dt", null, f.label));
        row.appendChild(el("dd", null, f.value));
        facts.appendChild(row);
      });
    }

    var shows = $("about-shows"); shows.textContent = "";
    if ((c.exhibitions || []).length) {
      shows.appendChild(el("p", "eyebrow", "Exhibitions"));
      var ul = el("ul", "shows__list");
      c.exhibitions.forEach(function (x) {
        var li = el("li");
        li.appendChild(el("span", "ledger__date", x.year));
        li.appendChild(el("span", null, [x.title, x.place].filter(Boolean).join(", ")));
        ul.appendChild(li);
      });
      shows.appendChild(ul);
    }

    var wall = $("wall"); wall.textContent = "";
    (c.works || []).forEach(function (w, i) {
      var fig = el("figure", "piece");
      var btn = el("button", "piece__frame");
      btn.type = "button";
      btn.setAttribute("aria-label", "Open " + w.title);
      var img = el("img");
      img.src = w.image; img.alt = w.title + " by " + (c.name || "Bassem Boules"); img.loading = "lazy";
      btn.appendChild(img);
      btn.addEventListener("click", function () { openViewer(i); });
      fig.appendChild(btn);

      var cap = el("figcaption", "label");
      cap.appendChild(el("span", "label__title", w.title));
      var meta = [w.year, w.medium, w.size].filter(Boolean).join(" · ");
      cap.appendChild(el("span", "label__meta", meta));
      if (w.status || w.price) {
        var st = el("span", "label__status", [w.status, w.price].filter(Boolean).join(" · "));
        if (/sold/i.test(w.status || "")) st.classList.add("is-sold");
        cap.appendChild(st);
      }
      fig.appendChild(cap);
      wall.appendChild(fig);
      attachLoupe(img);
    });

    if (c.teaching) {
      var t = c.teaching;
      setText("teach-title", t.title);
      setText("teach-text", t.text);
      setText("teach-cap", t.imageCaption);
      setText("teach-cta", t.cta);
      if (t.image) $("teach-img").src = t.image;
      var ledger = $("ledger"); ledger.textContent = "";
      (t.sessions || []).forEach(function (s) {
        var li = el("li");
        li.appendChild(el("span", "ledger__date", s.date));
        li.appendChild(el("span", "ledger__title", s.title));
        if (s.place) li.appendChild(el("span", "ledger__place", s.place));
        ledger.appendChild(li);
      });
    }

    var press = $("press"); press.textContent = "";
    (c.press || []).forEach(function (p) {
      var fig = el("figure", "quote");
      fig.appendChild(el("blockquote", null, p.quote));
      var cap = el("figcaption", "mono");
      if (p.link) {
        var a = el("a", null, p.source); a.href = p.link; a.target = "_blank"; a.rel = "noopener";
        cap.appendChild(a);
      } else cap.textContent = p.source;
      fig.appendChild(cap);
      press.appendChild(fig);
    });

    if (c.guide) {
      setText("guide-eyebrow", c.guide.eyebrow);
      setText("guide-title", c.guide.title);
      setText("guide-text", c.guide.text);
      setText("guide-button", c.guide.button);
    }

    if (c.commission) {
      setText("com-title", c.commission.title);
      setText("com-text", c.commission.text);
      var steps = $("com-steps"); steps.textContent = "";
      (c.commission.steps || []).forEach(function (s) { steps.appendChild(el("li", null, s)); });
    }

    var ct = c.contact || {};
    if (ct.email) {
      setText("email-text", ct.email);
      setHref("email-link", "mailto:" + ct.email + "?subject=" + encodeURIComponent("Portrait commission"));
    }
    setHref("ig-link", ct.instagram);
    if (ct.instagramHandle) setText("ig-link", ct.instagramHandle + " on Instagram");
    setHref("shop-link", ct.shop); setHref("foot-shop", ct.shop); setHref("foot-tashkeel", ct.tashkeel);
  }

  fetch("content/site.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function (err) { console.warn("Could not load content/site.json", err); });

  /* ---------------- hero: finish the drawing ---------------- */
  (function reveal() {
    var box = $("reveal"), canvas = $("reveal-canvas"), toggle = $("reveal-toggle");
    if (!box || !canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var mask = document.createElement("canvas"), mctx = mask.getContext("2d");
    var painting = new Image();
    painting.src = "assets/works/between-the-past-and-future.jpg";

    var W = 0, H = 0, R = 60, brush = null, last = null;
    var locked = false, running = false, quietFrames = 0, lastTouch = 0, frame = 0;

    function makeBrush(r) {
      var size = Math.ceil(r * 2), b = document.createElement("canvas");
      b.width = b.height = size;
      var bctx = b.getContext("2d"), img = bctx.createImageData(size, size), d = img.data;
      for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
        var dx = (x - r) / r, dy = (y - r) / r, dist = Math.sqrt(dx * dx + dy * dy);
        var fall = Math.max(0, 1 - dist); fall = fall * fall * (3 - 2 * fall);
        var grain = 0.45 + Math.random() * 0.55;               // charcoal tooth
        var a = fall * grain * (dist > 0.55 && Math.random() < 0.35 ? 0.2 : 1);
        var k = (y * size + x) * 4;
        d[k] = d[k + 1] = d[k + 2] = 255; d[k + 3] = Math.round(a * 255);
      }
      bctx.putImageData(img, 0, 0);
      return b;
    }

    function resize() {
      var rect = box.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var nw = Math.max(1, Math.round(rect.width * dpr)), nh = Math.max(1, Math.round(rect.height * dpr));
      if (nw === W && nh === H) return;
      var keep = null;
      if (W && H) { keep = document.createElement("canvas"); keep.width = W; keep.height = H; keep.getContext("2d").drawImage(mask, 0, 0); }
      W = canvas.width = mask.width = nw; H = canvas.height = mask.height = nh;
      if (keep) mctx.drawImage(keep, 0, 0, W, H);
      R = Math.max(30, W * 0.095);
      brush = makeBrush(R);
      draw();
    }

    function dab(x, y, scale) {
      var s = R * 2 * (scale || 1);
      mctx.globalCompositeOperation = "source-over";
      mctx.drawImage(brush, x - s / 2, y - s / 2, s, s);
    }
    function strokeTo(x, y, scale) {
      if (!last) { dab(x, y, scale); last = { x: x, y: y }; return; }
      var dx = x - last.x, dy = y - last.y, dist = Math.hypot(dx, dy), step = R * 0.22;
      if (dist < step) return;                 // keep the anchor until the hand has moved a full step
      var t = step;
      for (; t <= dist; t += step) dab(last.x + dx * t / dist, last.y + dy * t / dist, scale);
      t -= step;
      last = { x: last.x + dx * t / dist, y: last.y + dy * t / dist };
      quietFrames = 0; start();
    }

    function draw() {
      if (!W || !painting.complete || !painting.naturalWidth) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(painting, 0, 0, W, H);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }

    function tick() {
      frame++;
      // The drawing slowly returns to graphite, like charcoal being wiped back.
      // (Small steps every few frames; tiny per-frame fades get stuck at 8-bit rounding.)
      if (!locked && !reduceMotion && frame % 8 === 0) {
        mctx.globalCompositeOperation = "destination-out";
        mctx.fillStyle = "rgba(0,0,0,0.04)";
        mctx.fillRect(0, 0, W, H);
        mctx.globalCompositeOperation = "source-over";
      }
      quietFrames++;
      if (quietFrames > 900 && !auto && !locked && !reduceMotion) {
        mctx.clearRect(0, 0, W, H); draw(); running = false; return;
      }
      draw();
      if (quietFrames > 900 && !auto) { running = false; return; }
      requestAnimationFrame(tick);
    }
    function start() { if (!running) { running = true; requestAnimationFrame(tick); } }

    function local(e) {
      var rect = canvas.getBoundingClientRect();
      return { x: (e.clientX - rect.left) / rect.width * W, y: (e.clientY - rect.top) / rect.height * H };
    }
    box.addEventListener("pointermove", function (e) {
      if (locked) return;
      if (e.pointerType === "touch" && e.buttons === 0) return;
      var p = local(e); strokeTo(p.x, p.y); lastTouch = performance.now();
    });
    box.addEventListener("pointerdown", function (e) { var p = local(e); last = null; strokeTo(p.x, p.y, 1.1); lastTouch = performance.now(); });
    box.addEventListener("pointerleave", function () { last = null; });

    // A guided gesture: the lantern, the face, then down the red kandora (normalised coordinates).
    var introPath = [[.18,.20],[.24,.26],[.30,.40],[.38,.48],[.52,.56],[.62,.62],[.70,.70],[.66,.82],[.74,.94]];
    var auto = null;
    function playPath(path, duration, scale) {
      var job = auto = { path: path, t0: performance.now(), dur: duration, scale: scale || 1 };
      last = null; start();
      (function step(now) {
        if (auto !== job) return;              // a newer gesture took over
        var k = Math.max(0, Math.min(1, (now - job.t0) / job.dur));
        var pos = k * (job.path.length - 1), i = Math.floor(pos), f = pos - i;
        var a = job.path[i], b = job.path[Math.min(i + 1, job.path.length - 1)];
        strokeTo((a[0] + (b[0] - a[0]) * f) * W, (a[1] + (b[1] - a[1]) * f) * H, job.scale);
        if (k < 1) requestAnimationFrame(step); else { auto = null; last = null; }
      })(performance.now());
    }
    function randomPath() {
      var p = [], x = .2 + Math.random() * .3, y = .15 + Math.random() * .2;
      for (var i = 0; i < 6; i++) { p.push([x, y]); x = Math.min(.9, Math.max(.1, x + (Math.random() - .35) * .3)); y += .1 + Math.random() * .08; }
      return p;
    }

    toggle.addEventListener("click", function () {
      locked = !locked;
      toggle.setAttribute("aria-pressed", String(locked));
      toggle.textContent = locked ? "Back to the drawing" : "Show the finished painting";
      if (locked) {
        if (reduceMotion) { mctx.fillStyle = "#fff"; mctx.fillRect(0, 0, W, H); draw(); return; }
        var zig = []; for (var i = 0; i <= 10; i++) zig.push([i % 2 ? .95 : .05, i / 10]);
        playPath(zig, 900, 2.2);
        setTimeout(function () { if (locked) { mctx.fillStyle = "#fff"; mctx.fillRect(0, 0, W, H); draw(); } }, 950);
      } else { quietFrames = 0; start(); if (reduceMotion) { mctx.clearRect(0, 0, W, H); draw(); } }
    });

    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(box);
    }
    // When nobody is drawing, the artist's hand comes back now and then.
    if (!reduceMotion) setInterval(function () {
      if (visible && !locked && !auto && document.visibilityState === "visible" && performance.now() - lastTouch > 6000) {
        playPath(randomPath(), 1600, .9);
      }
    }, 7000);

    function boot() {
      resize();
      if (reduceMotion) { introPath.forEach(function (p) { strokeTo(p[0] * W, p[1] * H); }); last = null; draw(); }
      else setTimeout(function () { playPath(introPath, 2300); }, 500);
    }
    if (painting.complete && painting.naturalWidth) boot(); else painting.addEventListener("load", boot);
    window.addEventListener("resize", resize);
  })();

  /* ---------------- the riso name drifts out of register ---------------- */
  (function riso() {
    var name = $("riso-name");
    if (!name || reduceMotion || !finePointer) return;
    var pending = false, mx = 0, my = 0;
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX / window.innerWidth - .5; my = e.clientY / window.innerHeight - .5;
      if (pending) return; pending = true;
      requestAnimationFrame(function () {
        pending = false;
        name.style.setProperty("--bx", (-4 - mx * 10).toFixed(1) + "px");
        name.style.setProperty("--by", (2 - my * 8).toFixed(1) + "px");
        name.style.setProperty("--rx", (4 + mx * 10).toFixed(1) + "px");
        name.style.setProperty("--ry", (-2 + my * 8).toFixed(1) + "px");
      });
    });
  })();

  /* ---------------- loupe: look closer at the line work ---------------- */
  var loupe = $("loupe"), ZOOM = 2.6;
  function attachLoupe(img) {
    if (!finePointer || !loupe) return;
    img.addEventListener("pointerenter", function () {
      loupe.style.backgroundImage = "url(\"" + img.currentSrc + "\")";
      loupe.classList.add("is-on");
    });
    img.addEventListener("pointerleave", function () { loupe.classList.remove("is-on"); });
    img.addEventListener("pointermove", function (e) {
      var r = img.getBoundingClientRect(), half = loupe.offsetWidth / 2;
      var x = e.clientX - r.left, y = e.clientY - r.top;
      loupe.style.left = e.clientX + "px"; loupe.style.top = e.clientY + "px";
      loupe.style.backgroundSize = (r.width * ZOOM) + "px " + (r.height * ZOOM) + "px";
      loupe.style.backgroundPosition = (half - x * ZOOM) + "px " + (half - y * ZOOM) + "px";
    });
  }

  /* ---------------- viewer ---------------- */
  var viewer = $("viewer");
  function openViewer(i) {
    var w = content && content.works[i]; if (!w) return;
    loupe && loupe.classList.remove("is-on");
    $("viewer-img").src = w.image; $("viewer-img").alt = w.title;
    $("viewer-title").textContent = w.title;
    $("viewer-meta").textContent = [w.year, w.medium, w.size].filter(Boolean).join(" · ");
    $("viewer-story").textContent = w.story || "";
    $("viewer-status").textContent = [w.status, w.price].filter(Boolean).join(" · ");
    var link = $("viewer-link");
    if (w.link) { link.hidden = false; link.href = w.link; link.textContent = /sold/i.test(w.status || "") ? "See it at Tashkeel" : "Collect this print"; }
    else link.hidden = true;
    if (viewer.showModal) viewer.showModal(); else viewer.setAttribute("open", "");
  }
  $("viewer-close").addEventListener("click", function () { viewer.close ? viewer.close() : viewer.removeAttribute("open"); });
  viewer.addEventListener("click", function (e) { if (e.target === viewer) viewer.close(); });

  /* ---------------- lead magnet ---------------- */
  var form = $("guide-form"), msg = $("guide-msg");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("lead-email").value.trim(), name = $("lead-name").value.trim();
    msg.className = "form__msg";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = "Please enter an email address like name@example.com.";
      msg.classList.add("is-error"); $("lead-email").focus(); return;
    }
    var g = (content && content.guide) || {};
    var btn = $("guide-button"); btn.disabled = true;

    function done() {
      btn.disabled = false; form.reset();
      msg.textContent = (g.success || "Thank you.") + " ";
      if (g.downloadUrl) {
        var a = el("a", null, "Open the guide"); a.href = g.downloadUrl; a.target = "_blank"; a.rel = "noopener";
        msg.appendChild(a);
      }
    }
    if (!g.formEndpoint) { done(); return; }   // no email service connected yet: still hand over the guide
    fetch(g.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ name: name, email: email, source: "Portrait Notes guide" })
    }).then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
      .catch(function () {
        btn.disabled = false; msg.classList.add("is-error");
        msg.textContent = "That didn't go through. Check your connection and try again.";
      });
  });

  /* ---------------- copy email ---------------- */
  $("copy-email").addEventListener("click", function () {
    var b = this, text = $("email-text").textContent;
    function ok() { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy address"; }, 1800); }
    function fallback() {
      var r = document.createRange(); r.selectNodeContents($("email-text"));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      b.textContent = "Selected, press copy";
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
    else fallback();
  });
})();
