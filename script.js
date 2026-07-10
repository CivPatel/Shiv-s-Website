/* =======================================================================
   SHIV PATEL - interactions
   Live signal trace · clock · scroll progress · scroll reveals
   ======================================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------- Local clock ---------------------------- */
  const clock = document.getElementById("clock");
  function tick() {
    if (!clock) return;
    const t = new Date();
    const hh = String(t.getHours()).padStart(2, "0");
    const mm = String(t.getMinutes()).padStart(2, "0");
    clock.textContent = hh + ":" + mm;
  }
  tick();
  setInterval(tick, 15000);

  /* ------------------------- Scroll progress bar ----------------------- */
  const progress = document.getElementById("progress");
  function onScroll() {
    if (!progress) return;
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.width = pct + "%";
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --------------------------- Scroll reveals -------------------------- */
  const revealTargets = document.querySelectorAll(".reveal, .section-head");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("visible"));
  }

  /* ----------------- Signature: live signal / EEG trace ---------------- */
  const canvas = document.getElementById("wave");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let t = 0;
    let mouseX = -1;         // -1 => no cursor influence
    let running = true;

    const css = getComputedStyle(document.documentElement);
    const signal = (css.getPropertyValue("--signal") || "#ffb04a").trim();
    const deep = (css.getPropertyValue("--signal-deep") || "#c9741f").trim();

    function resize() {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // A composite waveform: base sine + a periodic "spike" (EEG-like event)
    function amp(x) {
      const nx = x / W;                       // 0..1 across width
      let y = Math.sin(nx * 11 + t) * 0.42;
      y += Math.sin(nx * 23 - t * 1.7) * 0.16;
      y += Math.sin(nx * 4 + t * 0.6) * 0.22;

      // Traveling spike - the "signal event"
      const sp = (t * 0.09) % 1.4 - 0.2;
      const d = nx - sp;
      y += Math.exp(-(d * d) / 0.0009) * 1.1;

      // Cursor interaction: gentle bump near the pointer
      if (mouseX >= 0) {
        const cd = nx - mouseX / W;
        y += Math.exp(-(cd * cd) / 0.004) * 0.6;
      }
      return y;
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      const mid = H / 2;
      const scale = H * 0.34;

      // baseline
      ctx.strokeStyle = "rgba(255,176,74,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(W, mid);
      ctx.stroke();

      // glow underlay
      ctx.save();
      ctx.shadowBlur = 14;
      ctx.shadowColor = signal;
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, deep);
      grad.addColorStop(0.5, signal);
      grad.addColorStop(1, deep);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      const step = Math.max(2, Math.floor(W / 260));
      for (let x = 0; x <= W; x += step) {
        const y = mid - amp(x) * scale;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // leading dot on the traveling spike
      const spX = (((t * 0.09) % 1.4 - 0.2) * W);
      if (spX >= 0 && spX <= W) {
        const y = mid - amp(spX) * scale;
        ctx.fillStyle = signal;
        ctx.shadowBlur = 12;
        ctx.shadowColor = signal;
        ctx.beginPath();
        ctx.arc(spX, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      t += 0.03;
      requestAnimationFrame(draw);
    }

    // Cursor influence (desktop only)
    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouseX = e.clientX - r.left;
    });
    canvas.addEventListener("pointerleave", () => { mouseX = -1; });

    // Pause when the hero is off-screen to save cycles
    if ("IntersectionObserver" in window) {
      const heroIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !reduceMotion) {
            if (!running) { running = true; draw(); }
          } else {
            running = false;
          }
        });
      }, { threshold: 0 });
      heroIO.observe(canvas);
    }

    if (reduceMotion) {
      // Draw a single static frame
      running = true; draw(); running = false;
    } else {
      draw();
    }
  }

  /* ------------------- Header shadow on scroll (subtle) ---------------- */
  const bar = document.querySelector(".topbar");
  function barState() {
    if (!bar) return;
    if (window.scrollY > 8) bar.style.borderBottomColor = "var(--line)";
    else bar.style.borderBottomColor = "var(--line-soft)";
  }
  document.addEventListener("scroll", barState, { passive: true });
  barState();
})();
