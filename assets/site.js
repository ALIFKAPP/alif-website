(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header: transparent at the top, frosted glass once scrolled.
  var nav = document.getElementById('nav');
  function onScroll() {
    nav.classList.toggle('solid', window.scrollY > 24);
  }
  onScroll();

  // Reveal on scroll.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.rv, .rv-scale').forEach(function (el) { io.observe(el); });

  // Story: the phone stays, its screen follows the step in view.
  var steps = [].slice.call(document.querySelectorAll('.step'));
  var shots = [].slice.call(document.querySelectorAll('#screens img'));
  var glow = document.getElementById('glow');
  function setStep(i) {
    steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    shots.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    if (glow) glow.style.transform = 'translate(' + (i % 2 ? 40 : -40) + 'px,' + (i % 3 ? 20 : -20) + 'px) scale(' + (1 + (i % 3) * 0.08) + ')';
  }
  var sio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) setStep(+e.target.dataset.i);
    });
  }, { threshold: 0, rootMargin: window.matchMedia('(max-width: 860px)').matches ? '-64% 0px -22% 0px' : '-45% 0px -45% 0px' });
  steps.forEach(function (s) { sio.observe(s); });

  // Hero phone: slight parallax and shrink while scrolling away.
  var hero = document.getElementById('heroPhone');
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY, h = window.innerHeight;
    if (hero && y < h * 1.2) {
      var t = Math.min(1, y / h);
      hero.style.setProperty('--py', (y * 0.12).toFixed(1) + 'px');
      hero.style.setProperty('--sc', (1 - t * 0.12).toFixed(3));
      hero.style.setProperty('--ry', (-8 + t * 8).toFixed(2) + 'deg');
    }
    onScroll();
  }
  if (!reduce) {
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }, { passive: true });
    frame();
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Watches: tilt toward the pointer, float gently.
  var wrap = document.getElementById('watches');
  if (wrap && !reduce && window.matchMedia('(hover: hover)').matches) {
    var fr = [].slice.call(wrap.querySelectorAll('.wframe'));
    wrap.addEventListener('pointermove', function (e) {
      var r = wrap.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      fr.forEach(function (f, i) {
        f.style.setProperty('--ry', (px * 16 * (i ? -1 : 1)).toFixed(2) + 'deg');
        f.style.setProperty('--rx', (-py * 12).toFixed(2) + 'deg');
      });
    });
    wrap.addEventListener('pointerleave', function () {
      fr.forEach(function (f) { f.style.setProperty('--ry', '0deg'); f.style.setProperty('--rx', '0deg'); });
    });
  }

  // Mobile: a download button that follows the reader once the steps are behind
  // them (it would cover their text), until the download section is on screen.
  var cta = document.getElementById('stickyCta');
  var watchSection = document.querySelector('.watch');
  var dlSection = document.getElementById('telecharger');
  if (cta && watchSection && dlSection) {
    var pastSteps = false, atDownload = false, ctaTick = false;
    var showCta = function () { cta.classList.toggle('on', pastSteps && !atDownload); };
    new IntersectionObserver(function (entries) {
      atDownload = entries[0].isIntersecting;
      showCta();
    }, { threshold: 0.15 }).observe(dlSection);
    window.addEventListener('scroll', function () {
      if (ctaTick) return;
      ctaTick = true;
      requestAnimationFrame(function () {
        ctaTick = false;
        var p = watchSection.getBoundingClientRect().top < window.innerHeight * 0.6;
        if (p !== pastSteps) { pastSteps = p; showCta(); }
      });
    }, { passive: true });
  }
})();
