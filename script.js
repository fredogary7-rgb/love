/* ============================================================
   Pour Medusa ❤️ — script.js
   Navigation, particules, bouquet SVG, lettre, musique
   ============================================================ */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var TOTAL_SCREENS = 10;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Références DOM ---------- */
  var canvas = document.getElementById('fx');
  var ctx = canvas.getContext('2d');
  var progress = document.getElementById('progress');
  var musicBtn = document.getElementById('music-btn');
  var audio = document.getElementById('music');
  var screens = Array.prototype.slice.call(document.querySelectorAll('.screen'));

  var current = 1;
  var W = 0, H = 0;

  /* ---------- Helpers ---------- */
  function el(tag, attrs, parent) {
    var node = document.createElementNS(NS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ---------- Texte de la lettre ---------- */
  var letterLines = [
    { t: 'Medusa,', gap: true },
    { t: 'Je ne savais pas vraiment comment te dire certaines choses,' },
    { t: 'alors j\u2019ai choisi une mani\u00e8re un peu diff\u00e9rente.', gap: true },
    { t: 'Je voulais cr\u00e9er quelque chose qui ne soit pas seulement un message,' },
    { t: 'mais un petit moment que tu pourrais garder.', gap: true },
    { t: 'Je ne vais pas pr\u00e9tendre que quelques lignes peuvent expliquer' },
    { t: 'tout ce qu\u2019une personne peut ressentir.', gap: true },
    { t: 'Mais je peux au moins te dire une chose :', gap: true },
    { t: 'Tu es devenue une personne qui m\u00e9rite qu\u2019on prenne le temps' },
    { t: 'de cr\u00e9er quelque chose de sp\u00e9cial.', gap: true },
    { t: 'Alors j\u2019ai cr\u00e9\u00e9 ces quelques pages simplement pour toi.', gap: true },
    { t: 'Pas pour te mettre la pression.' },
    { t: 'Pas pour attendre quelque chose en retour.', gap: true },
    { t: 'Juste parce que parfois,' },
    { t: 'une personne nous inspire suffisamment' },
    { t: 'pour qu\u2019on ait envie de lui offrir quelque chose de diff\u00e9rent.', gap: true },
    { t: 'Et aujourd\u2019hui,' },
    { t: 'cette personne, c\u2019est toi.', gap: true },
    { t: '\u2014 Quelqu\u2019un qui voulait simplement te faire sourire.', sign: true }
  ];

  var HL_WORDS = ['Medusa', 'sourire', 'sp\u00e9cial', 'moment', 'toi'];

  function isWordBoundary(text, idx, len) {
    var before = idx === 0 ? ' ' : text.charAt(idx - 1);
    var after = idx + len >= text.length ? ' ' : text.charAt(idx + len);
    return !/[a-zA-Z\u00c0-\u00ff]/.test(before) && !/[a-zA-Z\u00c0-\u00ff]/.test(after);
  }

  function tokenize(text, hlWords) {
    var segs = [];
    var lower = text.toLowerCase();
    var i = 0;
    while (i < text.length) {
      var bestIdx = -1, bestLen = 0;
      for (var w = 0; w < hlWords.length; w++) {
        var word = hlWords[w].toLowerCase();
        var idx = lower.indexOf(word, i);
        while (idx !== -1 && !isWordBoundary(text, idx, word.length)) {
          idx = lower.indexOf(word, idx + 1);
        }
        if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) { bestIdx = idx; bestLen = word.length; }
      }
      if (bestIdx === -1) { segs.push({ t: text.slice(i), hl: false }); break; }
      if (bestIdx > i) segs.push({ t: text.slice(i, bestIdx), hl: false });
      segs.push({ t: text.slice(bestIdx, bestIdx + bestLen), hl: true });
      i = bestIdx + bestLen;
    }
    return segs;
  }

  /* ---------- Palette des fleurs ---------- */
  var FLOWER_TYPES = {
    pink:   { outer: '#f0b7cb', inner: '#e07fa3', center: '#9c4b4a' },
    red:    { outer: '#d98a96', inner: '#b03048', center: '#6f2030' },
    violet: { outer: '#c9a3d6', inner: '#8a4a9a', center: '#5a2f66' },
    cream:  { outer: '#f7ecd9', inner: '#e0c59a', center: '#c9a86a' }
  };

  var MAIN_FLOWERS = [
    { type: 'pink',   x: 200, y: 150, s: 1.15 },
    { type: 'red',    x: 128, y: 205, s: 0.9 },
    { type: 'violet', x: 272, y: 205, s: 0.9 },
    { type: 'cream',  x: 158, y: 108, s: 0.78 },
    { type: 'cream',  x: 242, y: 108, s: 0.78 },
    { type: 'pink',   x: 112, y: 272, s: 0.66 },
    { type: 'red',    x: 288, y: 272, s: 0.66 }
  ];

  var CORNER_FLOWERS = [
    { type: 'pink',  x: 200, y: 165, s: 1.0 },
    { type: 'red',   x: 132, y: 218, s: 0.82 },
    { type: 'cream', x: 268, y: 218, s: 0.82 }
  ];

  var MAIN_BUDS = [
    { x: 92, y: 128 }, { x: 308, y: 130 }, { x: 150, y: 62 },
    { x: 250, y: 62 }, { x: 82, y: 320 }, { x: 318, y: 320 }
  ];

  var WRAP_Y = 430;
  var bouquetUid = 0;

  /* ---------- Barre de progression ---------- */
  function buildProgress() {
    progress.innerHTML = '';
    for (var i = 1; i <= TOTAL_SCREENS; i++) {
      var s = document.createElement('span');
      s.className = 'progress-step';
      s.textContent = (i < 10 ? '0' : '') + i;
      s.setAttribute('data-step', i);
      progress.appendChild(s);
      if (i < TOTAL_SCREENS) {
        var d = document.createElement('span');
        d.className = 'progress-dash';
        d.textContent = '\u00b7';
        progress.appendChild(d);
      }
    }
  }

  function updateProgress(n) {
    progress.classList.toggle('is-visible', n > 1);
    var steps = progress.querySelectorAll('.progress-step');
    for (var i = 0; i < steps.length; i++) {
      var step = +steps[i].getAttribute('data-step');
      steps[i].classList.toggle('is-active', step === n);
      steps[i].classList.toggle('is-done', step < n);
    }
  }

  /* ---------- Génération du bouquet SVG ---------- */
  var MAIN_LEAVES = [
    { x: 150, y: 300, r: -38 }, { x: 250, y: 300, r: 38 },
    { x: 168, y: 352, r: -48 }, { x: 232, y: 352, r: 48 },
    { x: 188, y: 390, r: -22 }, { x: 212, y: 390, r: 22 }
  ];
  var CORNER_LEAVES = [
    { x: 158, y: 300, r: -40 }, { x: 242, y: 300, r: 40 }
  ];

  function stemPath(x1, y1, x2, y2) {
    var mx = (x1 + x2) / 2;
    var bend = x1 < x2 ? 22 : -22;
    return 'M ' + x1 + ' ' + y1 + ' Q ' + (mx + bend) + ' ' + ((y1 + y2) / 2) + ' ' + x2 + ' ' + y2;
  }

  function addStem(svg, x, y, delay, thin) {
    var path = el('path', { 'class': thin ? 'stem stem--thin' : 'stem', 'd': stemPath(x, y, 200, WRAP_Y) });
    path.style.animationDelay = delay.toFixed(2) + 's';
    svg.appendChild(path);
  }

  function addLeaf(svg, x, y, r, delay) {
    var leaf = el('ellipse', { 'class': 'leaf', cx: x, cy: y, rx: 6.5, ry: 17 });
    leaf.setAttribute('transform', 'rotate(' + r + ' ' + x + ' ' + y + ')');
    leaf.style.animationDelay = delay.toFixed(2) + 's';
    svg.appendChild(leaf);
  }

  function addBud(svg, x, y, delay) {
    addStem(svg, x, y, delay + 0.1, true);
    var outer = el('g', { transform: 'translate(' + x + ' ' + y + ')' });
    var g = el('g', { 'class': 'bud' });
    for (var i = 0; i < 3; i++) {
      var p = el('ellipse', { cx: 0, cy: -5, rx: 3.4, ry: 6, fill: '#f0b7cb' });
      p.setAttribute('transform', 'rotate(' + (i * 120) + ')');
      g.appendChild(p);
    }
    g.appendChild(el('circle', { 'class': 'center', r: 2.4, fill: '#c9a86a' }));
    g.style.animationDelay = delay.toFixed(2) + 's';
    outer.appendChild(g);
    svg.appendChild(outer);
  }

  function addFlower(svg, f, delayBase, uid) {
    var c = FLOWER_TYPES[f.type];
    var g = el('g', { 'class': 'flower', transform: 'translate(' + f.x + ' ' + f.y + ') scale(' + f.s + ')' });
    var glow = el('circle', { 'class': 'glow', r: 40, fill: 'url(#' + uid + ')' });
    glow.style.animationDelay = delayBase.toFixed(2) + 's';
    g.appendChild(glow);
    var i;
    for (i = 0; i < 6; i++) {
      var pg = el('g', { transform: 'rotate(' + (i * 60) + ')' });
      var p = el('ellipse', { 'class': 'petal', cx: 0, cy: -17, rx: 11, ry: 19, fill: c.outer });
      p.style.animationDelay = (delayBase + i * 0.05).toFixed(2) + 's';
      pg.appendChild(p);
      g.appendChild(pg);
    }
    for (i = 0; i < 6; i++) {
      var pg2 = el('g', { transform: 'rotate(' + (i * 60 + 30) + ')' });
      var p2 = el('ellipse', { 'class': 'petal', cx: 0, cy: -12, rx: 8, ry: 14, fill: c.inner });
      p2.style.animationDelay = (delayBase + 0.28 + i * 0.04).toFixed(2) + 's';
      pg2.appendChild(p2);
      g.appendChild(pg2);
    }
    var center = el('circle', { 'class': 'center', r: 6.5, fill: c.center });
    center.style.animationDelay = (delayBase + 0.55).toFixed(2) + 's';
    g.appendChild(center);
    svg.appendChild(g);
  }

  function addWrap(svg, delay) {
    var items = [
      { tag: 'path',    attrs: { d: 'M 200 415 L 150 540 L 250 540 Z', fill: '#4a2050' } },
      { tag: 'ellipse', attrs: { cx: 200, cy: 458, rx: 46, ry: 9, fill: '#7c2440' } },
      { tag: 'ellipse', attrs: { cx: 180, cy: 414, rx: 15, ry: 12, fill: '#c9a86a' } },
      { tag: 'ellipse', attrs: { cx: 220, cy: 414, rx: 15, ry: 12, fill: '#c9a86a' } },
      { tag: 'path',    attrs: { d: 'M 192 410 L 172 436 L 196 432 Z', fill: '#b8944f' } },
      { tag: 'path',    attrs: { d: 'M 208 410 L 228 436 L 204 432 Z', fill: '#b8944f' } }
    ];
    for (var i = 0; i < items.length; i++) {
      var node = el(items[i].tag, items[i].attrs);
      node.setAttribute('class', 'wrap');
      node.style.animationDelay = (delay + i * 0.05).toFixed(2) + 's';
      svg.appendChild(node);
    }
  }

  function addSeed(svg, uid) {
    var glow = el('circle', { 'class': 'seed-glow', cx: 200, cy: WRAP_Y - 12, r: 30, fill: 'url(#' + uid + ')' });
    var seed = el('circle', { 'class': 'seed', cx: 200, cy: WRAP_Y - 12, r: 7, fill: '#fff3e0' });
    svg.appendChild(glow);
    svg.appendChild(seed);
  }

  function buildBouquet(svg, flowers, buds, leaves) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var uid = 'g' + (++bouquetUid);
    var defs = el('defs');
    var rad = el('radialGradient', { id: uid });
    el('stop', { offset: '0%', 'stop-color': '#f6d8e4', 'stop-opacity': '0.55' }, rad);
    el('stop', { offset: '100%', 'stop-color': '#f6d8e4', 'stop-opacity': '0' }, rad);
    defs.appendChild(rad);
    svg.appendChild(defs);
    addSeed(svg, uid);
    var i;
    for (i = 0; i < flowers.length; i++) addStem(svg, flowers[i].x, flowers[i].y, 0.4 + i * 0.05);
    for (i = 0; i < leaves.length; i++) addLeaf(svg, leaves[i].x, leaves[i].y, leaves[i].r, 0.7 + i * 0.06);
    for (i = 0; i < buds.length; i++) addBud(svg, buds[i].x, buds[i].y, 0.9 + i * 0.08);
    for (i = 0; i < flowers.length; i++) addFlower(svg, flowers[i], 1.15 + i * 0.08, uid);
    addWrap(svg, 1.95);
    svg.classList.remove('is-built');
  }

  /* ---------- Particules (canvas) ---------- */
  var particles = [];
  var fxMode = 'opening';
  var isMobile = window.innerWidth < 640;

  var MODES = {
    intro:   { light: 0.3, petal: 0, star: 0 },
    opening: { light: 0.55, petal: 0.18, star: 0 },
    message: { light: 0.3, petal: 0.6, star: 0 },
    flowers: { light: 0.3, petal: 0.65, star: 0 },
    quiet:   { light: 0.35, petal: 0.14, star: 0 },
    stars:   { light: 0.3, petal: 0.5, star: 0.6 }
  };

  var PETAL_COLORS = ['#e8a0b8', '#f3c4d6', '#b84a6a', '#8a4a7a', '#d9b98a'];
  var LIGHT_COLORS = ['#f3c4d6', '#e8a0b8', '#e2c98f', '#fff3e0'];

  function maxParticles() { return isMobile ? 60 : 110; }

  function resizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    isMobile = W < 640;
  }

  function spawnParticle(type, opts) {
    opts = opts || {};
    var p = { type: type, x: 0, y: 0, vx: 0, vy: 0, size: 1, rot: 0, vr: 0, alpha: 1, tw: Math.random() * 6.28, dead: false };
    if (type === 'light') {
      p.x = Math.random() * W;
      p.y = opts.y != null ? opts.y : H + 20;
      p.size = Math.random() * 2.2 + 1;
      p.vy = -(Math.random() * 0.4 + 0.15);
      p.vx = (Math.random() - 0.5) * 0.2;
      p.alpha = Math.random() * 0.5 + 0.3;
      p.color = pick(LIGHT_COLORS);
    } else if (type === 'petal') {
      p.x = Math.random() * W;
      p.y = opts.y != null ? opts.y : -20;
      p.size = Math.random() * 7 + 5;
      p.vy = Math.random() * 0.9 + 0.5;
      p.vx = (Math.random() - 0.5) * 0.4;
      p.rot = Math.random() * 6.28;
      p.vr = (Math.random() - 0.5) * 0.04;
      p.sway = Math.random() * 6.28;
      p.swaySpeed = Math.random() * 0.02 + 0.01;
      p.alpha = Math.random() * 0.4 + 0.6;
      p.color = pick(PETAL_COLORS);
    } else if (type === 'star') {
      p.x = Math.random() * W;
      p.y = Math.random() * H * 0.75;
      p.size = Math.random() * 2 + 1;
      p.alpha = 0;
      p.color = '#fff3e0';
    } else if (type === 'heart') {
      p.x = opts.x; p.y = opts.y;
      p.size = Math.random() * 6 + 5;
      p.vx = (Math.random() - 0.5) * 1.6;
      p.vy = -(Math.random() * 2 + 1.2);
      p.rot = (Math.random() - 0.5) * 0.8;
      p.vr = (Math.random() - 0.5) * 0.06;
      p.alpha = 1;
      p.life = 1;
      p.color = pick(['#e8a0b8', '#f3c4d6', '#b84a6a', '#c9a86a']);
    } else if (type === 'spark') {
      p.x = opts.x; p.y = opts.y;
      var ang = Math.random() * 6.28;
      var speed = Math.random() * 3 + 1;
      p.vx = Math.cos(ang) * speed;
      p.vy = Math.sin(ang) * speed;
      p.size = Math.random() * 2.5 + 1;
      p.alpha = 1;
      p.life = 1;
      p.color = pick(['#fff3e0', '#f3c4d6', '#e2c98f', '#e8a0b8']);
    }
    particles.push(p);
  }

  function spawnHeartBurst(x, y) {
    var n = isMobile ? 16 : 26;
    for (var i = 0; i < n; i++) spawnParticle('heart', { x: x, y: y });
  }

  function count(type) {
    var c = 0;
    for (var i = 0; i < particles.length; i++) if (particles[i].type === type) c++;
    return c;
  }

  function spawnBasedOnMode() {
    var m = MODES[fxMode];
    var max = maxParticles();
    if (m.light > 0 && count('light') < max * m.light && Math.random() < 0.5) spawnParticle('light');
    if (m.petal > 0 && count('petal') < max * m.petal && Math.random() < 0.4) spawnParticle('petal');
    if (m.star > 0 && count('star') < max * m.star && Math.random() < 0.3) spawnParticle('star');
  }

  function setFxForScreen(n) {
    if (n === 1) fxMode = 'intro';
    else if (n === 2) fxMode = 'opening';
    else if (n === 3) fxMode = 'message';
    else if (n === 4) fxMode = 'flowers';
    else if (n === 10) fxMode = 'stars';
    else fxMode = 'quiet';
    if (fxMode !== 'stars') {
      particles = particles.filter(function (p) { return p.type !== 'star'; });
    }
  }

  function updateParticle(p, t) {
    if (p.type === 'light') {
      p.y += p.vy; p.x += p.vx;
      if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
    } else if (p.type === 'petal') {
      p.sway += p.swaySpeed;
      p.x += p.vx + Math.sin(p.sway) * 0.5;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > H + 30) { p.y = -20; p.x = Math.random() * W; }
    } else if (p.type === 'star') {
      p.tw += 0.03;
      if (fxMode === 'stars') p.alpha += (0.75 - p.alpha) * 0.05;
      else { p.alpha -= 0.04; if (p.alpha <= 0) p.dead = true; }
    } else if (p.type === 'heart') {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      p.vy += 0.02;
      p.life -= 0.012;
      if (p.life <= 0) p.dead = true;
    } else if (p.type === 'spark') {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.96; p.vy *= 0.96;
      p.life -= 0.02;
      if (p.life <= 0) p.dead = true;
    }
  }

  function drawPetalShape(x, y, s, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s, -s * 0.5, s * 0.55, s, 0, s);
    ctx.bezierCurveTo(-s * 0.55, s, -s, -s * 0.5, 0, -s);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawStarShape(x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.18, -r * 0.18, r, 0);
    ctx.quadraticCurveTo(r * 0.18, r * 0.18, 0, r);
    ctx.quadraticCurveTo(-r * 0.18, r * 0.18, -r, 0);
    ctx.quadraticCurveTo(-r * 0.18, -r * 0.18, 0, -r);
    ctx.closePath();
    ctx.fillStyle = '#fff3e0';
    ctx.fill();
    ctx.restore();
  }

  function drawHeartShape(x, y, s, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    var k = s / 14;
    ctx.scale(k, k);
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.bezierCurveTo(0, 4, -5, 0, -8, 0);
    ctx.bezierCurveTo(-14, 0, -14, 8, -14, 8);
    ctx.bezierCurveTo(-14, 14, -8, 17, 0, 21);
    ctx.bezierCurveTo(8, 17, 14, 14, 14, 8);
    ctx.bezierCurveTo(14, 8, 14, 0, 8, 0);
    ctx.bezierCurveTo(5, 0, 0, 4, 0, 7);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawParticle(p, t) {
    if (p.type === 'light') {
      var twinkle = 0.6 + 0.4 * Math.sin(t * 0.002 + p.tw);
      ctx.globalAlpha = p.alpha * twinkle;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
      ctx.globalAlpha = p.alpha * twinkle * 0.22;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2.6, 0, 6.283); ctx.fill();
    } else if (p.type === 'petal') {
      ctx.globalAlpha = p.alpha;
      drawPetalShape(p.x, p.y, p.size, p.rot, p.color);
    } else if (p.type === 'star') {
      ctx.globalAlpha = Math.max(0, p.alpha * (0.5 + 0.5 * Math.sin(p.tw)));
      drawStarShape(p.x, p.y, p.size);
    } else if (p.type === 'heart') {
      ctx.globalAlpha = Math.max(0, p.alpha * p.life);
      drawHeartShape(p.x, p.y, p.size, p.rot, p.color);
    } else if (p.type === 'spark') {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  var rafId = null;
  function loop(t) {
    if (reducedMotion) return;
    ctx.clearRect(0, 0, W, H);
    spawnBasedOnMode();
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      updateParticle(p, t);
      drawParticle(p, t);
      if (p.dead) particles.splice(i, 1);
    }
    rafId = requestAnimationFrame(loop);
  }

  /* ---------- Navigation ---------- */
  var mainBouquet = document.querySelector('.screen--flowers .bouquet');
  var cornerBouquets = Array.prototype.slice.call(document.querySelectorAll('.bouquet--corner'));

  function prepareScreen(screenEl) {
    var items = screenEl.querySelectorAll('.reveal');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove('is-in');
      items[i].style.transitionDelay = '0ms';
    }
  }

  function animateScreen(screenEl) {
    var items = Array.prototype.slice.call(screenEl.querySelectorAll('.reveal'))
      .filter(function (e) { return !e.hidden; });
    for (var i = 0; i < items.length; i++) {
      items[i].style.transitionDelay = (i * 120 + 120) + 'ms';
      items[i].classList.add('is-in');
    }
  }

  function triggerBuild(svg) {
    svg.classList.remove('is-built');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { svg.classList.add('is-built'); });
    });
  }
  function triggerBuildAll(list) {
    for (var i = 0; i < list.length; i++) triggerBuild(list[i]);
  }

  function goTo(n) {
    if (n < 1 || n > TOTAL_SCREENS || n === current) return;
    var from = current;
    current = n;
    var fromEl = screens[from - 1];
    var toEl = screens[n - 1];

    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove('is-active');
      screens[i].classList.remove('is-leaving');
    }
    toEl.classList.add('is-active');
    fromEl.classList.add('is-leaving');

    setFxForScreen(n);
    updateProgress(n);
    prepareScreen(toEl);

    if (n === 1) runIntroSequence();
    else if (n === 9) runSecretSequence();
    else if (n === 10) {
      setTimeout(function () { triggerBuildAll(cornerBouquets); }, 350);
      runFinaleSequence();
    } else {
      if (n === 4) setTimeout(function () { triggerBuild(mainBouquet); }, 350);
      if (n === 8) setTimeout(startLetter, 500);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { animateScreen(toEl); });
      });
    }
  }

  /* ---------- Lettre (écriture progressive) ---------- */
  var typeTimer = null;
  var letterDone = false;

  function letterBody() { return document.getElementById('letter-body'); }
  function letterNextBtn() { return document.getElementById('letter-next'); }
  function letterSkipBtn() { return document.getElementById('letter-skip'); }

  function renderAllLines() {
    var body = letterBody();
    body.innerHTML = '';
    for (var i = 0; i < letterLines.length; i++) {
      var p = document.createElement('p');
      if (letterLines[i].gap) p.className = 'gap';
      if (letterLines[i].sign) p.className = 'sign';
      var segs = tokenize(letterLines[i].t, HL_WORDS);
      for (var s = 0; s < segs.length; s++) {
        if (segs[s].hl) {
          var span = document.createElement('span');
          span.className = 'hl';
          span.textContent = segs[s].t;
          p.appendChild(span);
        } else {
          p.appendChild(document.createTextNode(segs[s].t));
        }
      }
      body.appendChild(p);
    }
  }

  function finishLetter() {
    letterDone = true;
    if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
    var cursor = letterBody().querySelector('.cursor');
    if (cursor) cursor.remove();
    letterSkipBtn().style.display = 'none';
    var next = letterNextBtn();
    next.hidden = false;
    next.classList.add('is-in');
    letterBody().scrollTop = letterBody().scrollHeight;
  }

  function startLetter() {
    letterDone = false;
    if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
    var body = letterBody();
    var skip = letterSkipBtn();
    var next = letterNextBtn();
    next.hidden = true;
    next.classList.remove('is-in');
    skip.style.display = '';
    body.innerHTML = '';

    if (reducedMotion) { renderAllLines(); finishLetter(); return; }

    var li = 0, si = 0, ci = 0, p = null, span = null;
    var cursor = document.createElement('span');
    cursor.className = 'cursor';

    function step() {
      if (li >= letterLines.length) { finishLetter(); return; }
      var line = letterLines[li];
      if (!line.segs) line.segs = tokenize(line.t, HL_WORDS);
      var seg = line.segs[si];
      if (!p) {
        p = document.createElement('p');
        if (line.gap) p.className = 'gap';
        if (line.sign) p.className = 'sign';
        body.appendChild(p);
        p.appendChild(cursor);
        span = null;
      }
      if (seg.hl && !span) {
        span = document.createElement('span');
        span.className = 'hl';
        p.insertBefore(span, cursor);
      }
      var charNode = document.createTextNode(seg.t.charAt(ci));
      if (seg.hl) span.appendChild(charNode);
      else p.insertBefore(charNode, cursor);
      ci++;
      body.scrollTop = body.scrollHeight;
      if (ci < seg.t.length) {
        typeTimer = setTimeout(step, 24);
      } else {
        si++; ci = 0; span = null;
        if (si >= line.segs.length) {
          li++; si = 0; p = null;
          typeTimer = setTimeout(step, 150);
        } else {
          typeTimer = setTimeout(step, 24);
        }
      }
    }
    step();
  }

  /* ---------- Sons (optionnels) ---------- */
  var sfxCache = {};
  function playSfx(name) {
    if (reducedMotion) return;
    try {
      if (!sfxCache[name]) sfxCache[name] = new Audio('assets/' + name + '.mp3');
      var a = sfxCache[name];
      a.currentTime = 0;
      var pr = a.play();
      if (pr && pr.catch) pr.catch(function () {});
    } catch (e) {}
  }

  /* ---------- Séquences ---------- */
  var seqTimers = [];

  function runIntroSequence() {
    seqTimers.forEach(clearTimeout); seqTimers = [];
    var el = screens[0];
    var steps = el.querySelectorAll('[data-intro]');
    for (var i = 0; i < steps.length; i++) steps[i].classList.remove('is-in');
    var delays = [400, 1500, 2700, 4000, 5000];
    for (var i = 0; i < steps.length; i++) {
      (function (node, d) {
        seqTimers.push(setTimeout(function () { node.classList.add('is-in'); }, d));
      })(steps[i], delays[i] || (4000 + i * 1200));
    }
  }

  function runSecretSequence() {
    seqTimers.forEach(clearTimeout); seqTimers = [];
    var el = screens[8];
    var steps = el.querySelectorAll('[data-secret]');
    for (var i = 0; i < steps.length; i++) steps[i].classList.remove('is-in');
    var delays = [300, 1500, 2800, 4200];
    for (var i = 0; i < steps.length; i++) {
      (function (node, d) {
        seqTimers.push(setTimeout(function () { node.classList.add('is-in'); }, d));
      })(steps[i], delays[i] || 4200);
    }
  }

  function runFinaleSequence() {
    seqTimers.forEach(clearTimeout); seqTimers = [];
    var el = screens[9];
    var els = Array.prototype.slice.call(el.querySelectorAll('[data-finale]'))
      .sort(function (a, b) { return (+a.getAttribute('data-finale')) - (+b.getAttribute('data-finale')); });
    for (var i = 0; i < els.length; i++) els[i].classList.remove('is-in');
    var delays = { 1: 2400, 2: 4000, 3: 5600, 4: 7000, 5: 9000, 6: 10400, 7: 12400 };
    for (var i = 0; i < els.length; i++) {
      (function (node) {
        var k = +node.getAttribute('data-finale');
        seqTimers.push(setTimeout(function () { node.classList.add('is-in'); }, delays[k] || 10400));
      })(els[i]);
    }
  }

  function spawnCelebration(x, y) {
    var n = isMobile ? 34 : 70;
    for (var i = 0; i < n; i++) {
      var type = (i % 4 === 0) ? 'star' : ((i % 3 === 0) ? 'heart' : (i % 2 ? 'petal' : 'spark'));
      spawnParticle(type, { x: x, y: y });
    }
  }

  function openSecret() {
    playSfx('reveal');
    var blackout = document.getElementById('blackout');
    var light = document.getElementById('blackout-light');
    blackout.classList.add('is-on');
    light.classList.add('is-on');
    canvas.style.zIndex = '66';
    spawnCelebration(W / 2, H / 2);
    setTimeout(function () {
      goTo(10);
      setTimeout(function () {
        blackout.classList.remove('is-on');
        light.classList.remove('is-on');
        canvas.style.zIndex = '';
      }, 600);
    }, 1200);
  }

  var finaleTaps = 0;
  function triggerEasterEgg() {
    playSfx('flower');
    var name = document.getElementById('finale-name');
    var r = name.getBoundingClientRect();
    spawnCelebration(r.left + r.width / 2, r.top + r.height / 2);
    var egg = document.getElementById('easteregg');
    egg.hidden = false;
    egg.classList.add('is-in');
    clearTimeout(triggerEasterEgg._t);
    triggerEasterEgg._t = setTimeout(function () {
      egg.classList.remove('is-in');
      setTimeout(function () { egg.hidden = true; }, 800);
    }, 5200);
  }

  /* ---------- Musique (générée, mp3 optionnel) ---------- */
  var audioCtx = null;
  var masterGain = null;
  var delayNode = null;
  var ambientPlaying = false;
  var ambientTimer = null;
  var nextNoteTime = 0;
  var stepIndex = 0;
  var musicOn = false;

  var PROGRESSION = [
    { bass: 110.00, notes: [220.00, 261.63, 329.63, 440.00] },
    { bass: 87.31,  notes: [174.61, 220.00, 261.63, 349.23] },
    { bass: 130.81, notes: [261.63, 329.63, 392.00, 523.25] },
    { bass: 146.83, notes: [246.94, 293.66, 392.00, 493.88] }
  ];

  function ensureAudioCtx() {
    if (audioCtx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 1.0;
    var compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 20;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    masterGain.connect(compressor);
    compressor.connect(audioCtx.destination);
    delayNode = audioCtx.createDelay(1.0);
    delayNode.delayTime.value = 0.45;
    var dg = audioCtx.createGain();
    dg.gain.value = 0.4;
    delayNode.connect(dg);
    dg.connect(masterGain);
  }

  function playNote(freq, time, dur, vol) {
    if (!audioCtx) return;
    var osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    var g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(g);
    g.connect(masterGain);
    if (delayNode) g.connect(delayNode);
    osc.start(time);
    osc.stop(time + dur + 0.2);
  }

  function scheduleAmbient() {
    while (nextNoteTime < audioCtx.currentTime + 0.6) {
      var chord = PROGRESSION[Math.floor(stepIndex / 4) % PROGRESSION.length];
      var noteIdx = stepIndex % 4;
      if (noteIdx === 0) playNote(chord.bass, nextNoteTime, 2.4, 0.22);
      playNote(chord.notes[noteIdx], nextNoteTime, 1.6, 0.18);
      nextNoteTime += 0.75;
      stepIndex++;
    }
  }

  function startAmbient() {
    ensureAudioCtx();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    ambientPlaying = true;
    nextNoteTime = audioCtx.currentTime + 0.1;
    stepIndex = 0;
    if (ambientTimer) clearInterval(ambientTimer);
    ambientTimer = setInterval(scheduleAmbient, 200);
  }

  function stopAmbient() {
    ambientPlaying = false;
    if (ambientTimer) { clearInterval(ambientTimer); ambientTimer = null; }
    if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
  }

  function toggleMusic() {
    hideSoundHint();
    if (musicOn) {
      musicOn = false;
      musicBtn.classList.remove('is-playing');
      musicBtn.setAttribute('aria-label', 'Activer la musique');
      audio.pause();
      stopAmbient();
      return;
    }
    musicOn = true;
    musicBtn.classList.add('is-playing');
    musicBtn.setAttribute('aria-label', 'Désactiver la musique');

    var fallbackDone = false;
    function fallbackToAmbient() {
      if (fallbackDone || !musicOn) return;
      fallbackDone = true;
      audio.pause();
      startAmbient();
    }
    var fallback = setTimeout(fallbackToAmbient, 600);

    try {
      var p = audio.play();
      if (p && p.then) {
        p.then(function () { clearTimeout(fallback); })
         .catch(fallbackToAmbient);
      } else {
        fallbackToAmbient();
      }
    } catch (e) {
      fallbackToAmbient();
    }
  }

  var soundHintTimer = null;
  function showSoundHint() {
    var hint = document.getElementById('sound-hint');
    if (!hint) return;
    hint.classList.add('is-on');
    musicBtn.classList.add('is-hinting');
    if (soundHintTimer) clearTimeout(soundHintTimer);
    soundHintTimer = setTimeout(hideSoundHint, 9000);
  }
  function hideSoundHint() {
    if (soundHintTimer) { clearTimeout(soundHintTimer); soundHintTimer = null; }
    var hint = document.getElementById('sound-hint');
    if (hint) hint.classList.remove('is-on');
    musicBtn.classList.remove('is-hinting');
  }

  /* ---------- Événements ---------- */
  function bindEvents() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-next]'), function (btn) {
      btn.addEventListener('click', function () {
        playSfx('click');
        goTo(+btn.getAttribute('data-next'));
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-choice]'), function (btn) {
      btn.addEventListener('click', function () {
        playSfx('click');
        if (btn.getAttribute('data-choice') === 'yes') {
          var r = btn.getBoundingClientRect();
          spawnHeartBurst(r.left + r.width / 2, r.top + r.height / 2);
          setTimeout(function () { goTo(8); }, 900);
        } else {
          goTo(8);
        }
      });
    });

    // Choix d'une fleur
    var chooseResult = document.getElementById('choose-result');
    var chooseCommon = document.getElementById('choose-common');
    var chooseNext = document.getElementById('choose-next');
    var FLOWER_MSGS = {
      1: 'Celle-ci repr\u00e9sente la douceur. \ud83c\udf38',
      2: 'Celle-ci repr\u00e9sente les beaux moments qu\u2019on aimerait garder. \ud83c\udf37',
      3: 'Celle-ci repr\u00e9sente les personnes qui deviennent sp\u00e9ciales sans qu\u2019on s\u2019en rende compte. \ud83c\udf39'
    };
    Array.prototype.forEach.call(document.querySelectorAll('[data-flower]'), function (btn) {
      btn.addEventListener('click', function () {
        var n = btn.getAttribute('data-flower');
        playSfx('flower');
        var all = document.querySelectorAll('[data-flower]');
        for (var i = 0; i < all.length; i++) {
          all[i].classList.add('is-chosen');
          if (all[i] !== btn) all[i].classList.add('is-dim');
          else all[i].classList.add('is-picked');
        }
        chooseResult.textContent = FLOWER_MSGS[n] || '';
        chooseResult.hidden = false;
        chooseResult.classList.add('is-in');
        setTimeout(function () {
          chooseCommon.hidden = false;
          chooseCommon.classList.add('is-in');
          chooseNext.hidden = false;
          chooseNext.classList.add('is-in');
        }, 1600);
      });
    });

    letterSkipBtn().addEventListener('click', function () {
      if (!letterDone) { renderAllLines(); finishLetter(); }
    });

    document.getElementById('secret-btn').addEventListener('click', openSecret);

    musicBtn.addEventListener('click', toggleMusic);

    // Saut de l'introduction (clic/tap)
    screens[0].addEventListener('click', function () {
      if (current === 1) { playSfx('click'); goTo(2); }
    });

    // Easter egg : 5 taps sur le prénom de la finale
    document.getElementById('finale-name').addEventListener('click', function () {
      finaleTaps++;
      if (finaleTaps >= 5) { finaleTaps = 0; triggerEasterEgg(); }
    });

    document.getElementById('replay').addEventListener('click', function () {
      playSfx('click');
      goTo(1);
    });

    window.addEventListener('resize', resizeCanvas);
  }

  /* ---------- Initialisation ---------- */
  function init() {
    buildProgress();
    buildBouquet(mainBouquet, MAIN_FLOWERS, MAIN_BUDS, MAIN_LEAVES);
    cornerBouquets.forEach(function (c) { buildBouquet(c, CORNER_FLOWERS, [], CORNER_LEAVES); });

    resizeCanvas();
    bindEvents();
    setFxForScreen(1);
    updateProgress(1);
    runIntroSequence();
    setTimeout(showSoundHint, 1800);

    if (!reducedMotion) rafId = requestAnimationFrame(loop);
  }

  init();





})();
