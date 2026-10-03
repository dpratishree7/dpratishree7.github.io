'use strict';

/* ══════════════════════════════════════
   CURSOR
══════════════════════════════════════ */
const cursor     = document.getElementById('cursor');
const cursorGlow = document.getElementById('cursorGlow');
let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});
(function animateGlow() {
  glowX += (mouseX - glowX) * 0.12;
  glowY += (mouseY - glowY) * 0.12;
  cursorGlow.style.left = glowX + 'px';
  cursorGlow.style.top  = glowY + 'px';
  requestAnimationFrame(animateGlow);
})();


/* ══════════════════════════════════════
   BACKGROUND CANVAS — Falling Dots
   - Elegant falling dots with smooth swaying motion
   - Variation in sizes, opacities, and speeds
   - Mouse gently repels the dots
══════════════════════════════════════ */
(function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, mouse = { x: -9999, y: -9999 };

  const COLORS = [
    'rgba(192,132,252,',
    'rgba(255,143,199,',
    'rgba(226,194,255,',
    'rgba(130,83,190,'
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    const colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x:     Math.random() * W,
      y:     Math.random() * H - H, // Start above the screen initially or anywhere
      vx:    0,
      vy:    Math.random() * 0.8 + 0.4, // Fall speed
      sway:  Math.random() * Math.PI * 2, // Initial sway phase
      swaySpeed: Math.random() * 0.02 + 0.01,
      swaySize: Math.random() * 0.8 + 0.3,
      r:     Math.random() * 3 + 1.5,     // radius 1.5–4.5
      alpha: Math.random() * 0.6 + 0.1,   // opacity 0.1–0.7
      color: colorBase
    };
  }

  function init() {
    resize();
    const count = W < 768 ? 60 : 130;
    particles = Array.from({ length: count }, () => {
      const p = makeParticle();
      p.y = Math.random() * H; // Spread initially across the screen
      return p;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.sway += p.swaySpeed;
      const swayX = Math.sin(p.sway) * p.swaySize;
      
      p.x += swayX;
      p.y += p.vy;

      // Mouse repulsion
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && dist > 0) {
        const force = (120 - dist) / 120 * 2;
        p.x -= (dx / dist) * force;
        p.y -= (dy / dist) * force;
      }

      // Reset when falling off screen
      if (p.y > H + p.r) {
        p.y = -p.r;
        p.x = Math.random() * W;
      }
      if (p.x > W + p.r) p.x = -p.r;
      if (p.x < -p.r) p.x = W + p.r;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  window.addEventListener('resize', () => {
    resize();
  }, { passive: true });

  init();
  requestAnimationFrame(draw);
})();


/* ══════════════════════════════════════
   CURSOR HOVER
══════════════════════════════════════ */
document.querySelectorAll('a, button, .proj-slide, .c-link, .skill-bubble, .stat-card, .intern-content')
  .forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
  });


/* ══════════════════════════════════════
   NAVBAR SCROLL
══════════════════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


/* ══════════════════════════════════════
   HAMBURGER
══════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  mobileNav.setAttribute('aria-hidden', String(!isOpen));
});
document.querySelectorAll('.m-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open'); mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false'); mobileNav.setAttribute('aria-hidden','true');
  });
});


/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
    siblings.forEach((sib, idx) => setTimeout(() => sib.classList.add('visible'), idx * 100));
    entry.target.classList.add('visible');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


/* ══════════════════════════════════════
   STAT COUNTER
══════════════════════════════════════ */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const start  = performance.now();
  const dur    = 1600;
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(eased * target) + '+';
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target + '+';
  }
  requestAnimationFrame(tick);
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => counterObs.observe(el));


/* ══════════════════════════════════════
   SKILLS SOLAR SYSTEM
══════════════════════════════════════ */
const SKILLS = [
  { label:'C',             cat:'Programming', color:'#59317a', size:44, ring:1, angle:0,   pct:'85%' },
  { label:'C++',           cat:'Programming', color:'#59317a', size:48, ring:1, angle:90,  pct:'80%' },
  { label:'Java',          cat:'Programming', color:'#59317a', size:48, ring:1, angle:180, pct:'90%' },
  { label:'Python',        cat:'Programming', color:'#59317a', size:52, ring:1, angle:270, pct:'88%' },
  { label:'HTML',          cat:'Web',         color:'#7c3d72', size:48, ring:2, angle:45,  pct:'95%' },
  { label:'CSS',           cat:'Web',         color:'#7c3d72', size:46, ring:2, angle:135, pct:'92%' },
  { label:'JavaScript',    cat:'Web',         color:'#7c3d72', size:54, ring:2, angle:225, pct:'85%' },
  { label:'DSA',           cat:'Core',        color:'#593c68', size:48, ring:3, angle:20,  pct:'89%' },
  { label:'OOP',           cat:'Core',        color:'#593c68', size:46, ring:3, angle:90,  pct:'85%' },
  { label:'SQL',           cat:'Core',        color:'#593c68', size:44, ring:3, angle:160, pct:'80%' },
  { label:'AutoCAD',       cat:'Tools',       color:'#754766', size:54, ring:3, angle:230, pct:'90%' },
  { label:'GitHub',        cat:'Tools',       color:'#754766', size:50, ring:3, angle:300, pct:'95%' },
  { label:'Teamwork',      cat:'Soft',        color:'#553c70', size:52, ring:4, angle:60,  pct:'90%' },
  { label:'Time Mgmt',     cat:'Soft',        color:'#553c70', size:50, ring:4, angle:150, pct:'85%' },
  { label:'Adaptability',  cat:'Soft',        color:'#553c70', size:54, ring:4, angle:240, pct:'88%' },
  { label:'Problem Solving',cat:'Soft',       color:'#553c70', size:62, ring:4, angle:330, pct:'92%' },
];
const RING_RADII  = { 1:0.28, 2:0.40, 3:0.55, 4:0.70 };
const RING_SPEEDS = { 1:0.12, 2:-0.09, 3:0.07, 4:-0.05 };
const getRingRadius = (ring, minDim) => RING_RADII[ring] * (minDim < 400 ? 0.45 : 1);

function initSkills() {
  const universe      = document.getElementById('skillsUniverse');
  const ringsContainer = document.getElementById('orbitRings');
  if (!universe) return;

  let W = universe.offsetWidth || 540;
  let H = universe.offsetHeight || 440;
  let cx = W/2, cy = H/2, minDim = Math.min(W,H);

  if (ringsContainer) {
    ringsContainer.innerHTML = '';
    [1,2,3,4].forEach(ri => {
      const el = document.createElement('div');
      el.className = 'orbit-ring';
      const d = minDim * getRingRadius(ri, minDim) * 2;
      el.style.width = d+'px'; el.style.height = d+'px';
      ringsContainer.appendChild(el);
    });
  }

  const bubblesData = [];
  SKILLS.forEach(s => {
    const bubble = document.createElement('div');
    bubble.className = 'skill-bubble';
    
    // Hide percentage for Soft Skills
    const pctHtml = s.cat === 'Soft' ? '' : `<span class="skill-pct">${s.pct}</span>`;
    bubble.innerHTML = `<span>${s.label}</span>${pctHtml}`;
    
    bubble.title = `${s.label} — ${s.cat}`;
    bubble.setAttribute('role','listitem');
    bubble.style.animation = 'none';
    Object.assign(bubble.style, {
      transform: 'translate(-50%,-50%)',
      background: s.color,
      minWidth: s.size+'px',
      height: Math.round(s.size * 0.75)+'px',
      fontSize: s.label.length > 9 ? '0.67rem' : '0.78rem',
      color: '#ffffff',
    });
    universe.appendChild(bubble);
    bubblesData.push({ el:bubble, a:s.angle, r:getRingRadius(s.ring, minDim)*minDim, speed:RING_SPEEDS[s.ring] });
  });

  window.addEventListener('resize', () => {
    W = universe.offsetWidth || 540; H = universe.offsetHeight || 440;
    cx = W/2; cy = H/2; minDim = Math.min(W,H);
    if (ringsContainer) {
      Array.from(ringsContainer.children).forEach((el, i) => {
        const d = minDim * getRingRadius(i+1, minDim) * 2;
        el.style.width = d+'px'; el.style.height = d+'px';
      });
    }
    bubblesData.forEach((b,i) => { b.r = getRingRadius(SKILLS[i].ring, minDim)*minDim; });
  }, { passive:true });

  function animateOrbit() {
    bubblesData.forEach(b => {
      b.a += b.speed;
      const rad = b.a * Math.PI / 180;
      b.el.style.left = (cx + b.r * Math.cos(rad)) + 'px';
      b.el.style.top  = (cy + b.r * Math.sin(rad)) + 'px';
    });
    requestAnimationFrame(animateOrbit);
  }
  animateOrbit();
}
document.addEventListener('DOMContentLoaded', initSkills);


/* ══════════════════════════════════════
   PROJECTS SLIDER
══════════════════════════════════════ */
const track    = document.getElementById('projectsTrack');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');
const dotsWrap = document.getElementById('sliderDots');

if (track && prevBtn && nextBtn && dotsWrap) {
  const slides = Array.from(track.querySelectorAll('.proj-slide'));
  let current  = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i===0?' active':'');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getSlideWidth() { return slides[0].offsetWidth + 32; }
  function goTo(idx) {
    current = Math.max(0, Math.min(idx, slides.length - 1));
    track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
    dotsWrap.querySelectorAll('.dot').forEach((d,i) => d.classList.toggle('active', i===current));
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  window.addEventListener('resize', () => goTo(current), { passive:true });

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive:true });
  track.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current+1 : current-1);
  }, { passive:true });
}


/* ══════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════ */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.c-submit');
    const old = btn.textContent;
    btn.textContent = 'Sent! ✓';
    btn.style.background = '#2e7d5e';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = old; btn.style.background = '';
      btn.disabled = false; contactForm.reset();
    }, 3200);
  });
}


/* ══════════════════════════════════════
   HERO TEXT REVEAL (PROFESSIONAL STAGGERED)
   ══════════════════════════════════════ */
function initHeroReveal() {
  const nameEl = document.getElementById('heroName');
  if (!nameEl) return;
  
  const text = nameEl.innerText;
  nameEl.innerHTML = '';
  nameEl.style.setProperty('--typing-finish', `${0.3 + ([...text].length - 1) * 0.08 + 0.02}s`);
  
  let isLastName = false;
  
  [...text].forEach((char, i) => {
    if (char === '\n') {
      nameEl.appendChild(document.createElement('br'));
      return;
    }

    const span = document.createElement('span');
    span.innerText = char;
    span.className = 'char';
    
    if (char === ' ') {
      span.classList.add('space');
      isLastName = true; 
    } else {
      span.classList.add(isLastName ? 'char-last' : 'char-first');
    }
    
    // Professional staggered reveal with smooth easing
    span.style.setProperty('--typing-delay', `${0.3 + i * 0.08}s`);
    
    nameEl.appendChild(span);
  });
}

/* ══════════════════════════════════════
   MAGNETIC & TILT EFFECTS
   ══════════════════════════════════════ */
function initInteractions() {
  // Magnetic Buttons
  document.querySelectorAll('.nav-resume,.c-submit,.resume-dl,.slider-btn,.btn-primary,.btn-ghost').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) * 0.28;
      const dy = (e.clientY - (r.top + r.height/2)) * 0.28;
      el.style.transform = `translate(${dx}px,${dy}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  // Hero Name 3D Tilt
  const heroWrap = document.querySelector('.hero-name-wrap');
  if (heroWrap) {
    document.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20; 
      const y = (e.clientY / window.innerHeight - 0.5) * -20;
      heroWrap.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    });
  }

  // About Card 3D Tilt
  const aboutCard = document.querySelector('.about-text-card');
  if (aboutCard) {
    const parent = document.querySelector('.about-card-wrap');
    parent.addEventListener('mousemove', e => {
      const r = aboutCard.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width/2)) / 15;
      const y = (e.clientY - (r.top + r.height/2)) / -15;
      aboutCard.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    });
    parent.addEventListener('mouseleave', () => {
      aboutCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroReveal();
  initInteractions();
});


/* ══════════════════════════════════════
   SMOOTH SCROLL
══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - (navbar ? navbar.offsetHeight : 70), behavior:'smooth' });
  });
});


/* ══════════════════════════════════════
   ACTIVE NAV
══════════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const secObs   = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(l => l.classList.toggle('nav-active', l.getAttribute('href') === `#${id}`));
    }
  });
}, { rootMargin:'-40% 0px -40% 0px' });
sections.forEach(s => secObs.observe(s));


/* ══════════════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════════════ */
function initMagnetic() {
  document.querySelectorAll('.nav-resume,.c-submit,.resume-dl,.slider-btn,.btn-primary,.btn-ghost').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) * 0.28;
      const dy = (e.clientY - (r.top + r.height/2)) * 0.28;
      el.style.transform = `translate(${dx}px,${dy}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}
document.addEventListener('DOMContentLoaded', initMagnetic);


/* ══════════════════════════════════════
   HERO 3D TILT
══════════════════════════════════════ */
const heroWrap = document.querySelector('.hero-name-wrap');
if (heroWrap) {
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20; 
    const y = (e.clientY / window.innerHeight - 0.5) * -20;
    heroWrap.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  });
}

/* ══════════════════════════════════════
   REVEAL OBSERVER (BUG FIX)
   ══════════════════════════════════════ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .about-card-wrap').forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════
   LIQUID WAVE ENGINE (SVG FILTER ANIMATION)
   ══════════════════════════════════════ */
function initLiquidWave() {
  const turb = document.querySelector('#glass-shimmer feTurbulence');
  const disp = document.querySelector('#glass-shimmer feDisplacementMap');
  const hero = document.getElementById('heroName');
  if (!turb || !disp || !hero) return;

  let frame = 0;
  let targetScale = 2;
  let currentScale = 2;

  function animate() {
    frame += 0.012;
    // Ultra-subtle shimmer for frosted glass
    const bfX = 0.012 + Math.sin(frame * 0.3) * 0.001;
    const bfY = 0.018 + Math.cos(frame * 0.4) * 0.002;
    turb.setAttribute('baseFrequency', `${bfX} ${bfY}`);

    currentScale += (targetScale - currentScale) * 0.08;
    disp.setAttribute('scale', currentScale);

    requestAnimationFrame(animate);
  }

  hero.addEventListener('mouseenter', () => { targetScale = 8; });
  hero.addEventListener('mouseleave', () => { targetScale = 2; });

  requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroReveal();
  initInteractions();
  initLiquidWave(); // Start the liquid engine
});

/* ══════════════════════════════════════
   NAV ACTIVE STYLE
   ══════════════════════════════════════ */
if (!document.getElementById('navStyles')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'navStyles';
  styleTag.textContent = `.nav-active{color:var(--primary)!important}.nav-active::after{width:50%!important}`;
  document.head.appendChild(styleTag);
}