(function () {
  "use strict";

  var FLAG_KEY = "me-wedding-fireworks-shown";

  var alreadyShown = false;
  try { alreadyShown = localStorage.getItem(FLAG_KEY) === "1"; } catch (e) { /* ignore */ }
  if (alreadyShown) return;

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    try { localStorage.setItem(FLAG_KEY, "1"); } catch (e) { /* ignore */ }
    return;
  }

  var canvas = document.createElement("canvas");
  canvas.id = "fireworksCanvas";
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");

  var GOLD = ["#F3D67A", "#D9AE47", "#FFF6DD", "#C9A227", "#EAC873"];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  var particles = [];

  function burst(x, y) {
    var count = 46 + Math.floor(Math.random() * 18);
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.15;
      var speed = 2.2 + Math.random() * 3.4;
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.010 + Math.random() * 0.012,
        color: GOLD[Math.floor(Math.random() * GOLD.length)],
        size: 1.6 + Math.random() * 1.8
      });
    }
  }

  var bursts = [];
  function scheduleBursts() {
    var w = canvas.width, h = canvas.height;
    var spots = [
      [w * 0.28, h * 0.32],
      [w * 0.72, h * 0.26],
      [w * 0.5, h * 0.42],
      [w * 0.18, h * 0.5],
      [w * 0.82, h * 0.48]
    ];
    spots.forEach(function (spot, i) {
      bursts.push(setTimeout(function () { burst(spot[0], spot[1]); }, i * 420));
    });
  }
  scheduleBursts();

  var startTime = Date.now();
  var DURATION = 3600; // ms of active bursting before fade
  var rafId;

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.045; // gentle gravity
      p.vx *= 0.985;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    var elapsed = Date.now() - startTime;
    if (elapsed < DURATION || particles.length > 0) {
      rafId = requestAnimationFrame(frame);
    } else {
      finish();
    }
  }
  rafId = requestAnimationFrame(frame);

  function finish() {
    cancelAnimationFrame(rafId);
    canvas.classList.add("is-hidden");
    setTimeout(function () {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }, 1200);
    try { localStorage.setItem(FLAG_KEY, "1"); } catch (e) { /* ignore */ }
  }

  // Safety net: never let the overlay linger indefinitely.
  setTimeout(function () {
    if (canvas.parentNode) finish();
  }, 6000);
})();
