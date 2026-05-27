'use strict';

/* ═══════════════════════════════════════════════════════════════════════════════
 *  THE LEGEND OF INDRA VS VRITRASUR — Main JavaScript Engine
 *  ──────────────────────────────────────────────────────────────────────────
 *  A cinematic AAA mythology game portfolio website.
 *  Pure vanilla JS · No dependencies · ES6+
 *
 *  Modules:
 *    1. DivineCursor        – Custom weapon cursor with particle trail
 *    2. StormParticles      – Canvas-based floating luminous particles
 *    3. LightningEngine     – Procedural branching lightning bolts
 *    4. ScrollAnimations    – Intersection Observer reveal effects
 *    5. Navigation          – Sticky nav, mobile toggle, smooth scroll
 *    6. ParallaxEngine      – Scroll-driven parallax transforms
 *    7. GallerySystem       – Filterable gallery with lightbox modal
 *    8. TypewriterEffect    – Character-by-character text reveal
 *    9. TimelineProgress    – Scroll-driven timeline glow fill
 *   10. ContactForm         – Form handling with styled feedback
 *   11. App Initialization  – Bootstrap & performance observers
 * ═══════════════════════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────────────────────
 *  MODULE 1 — DIVINE CURSOR SYSTEM
 *  Golden dot + trailing cyan ring + particle trail + click ripple
 * ───────────────────────────────────────────────────────────────────────────── */

class DivineCursor {
  constructor() {
    this.dot = null;
    this.ring = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.ringX = 0;
    this.ringY = 0;
    this.particles = [];
    this.frameCount = 0;
    this.isHovering = false;

    // Skip on touch-only devices
    this.isTouch = 'ontouchstart' in window && navigator.maxTouchPoints > 0;
    if (this.isTouch) return;

    this.init();
  }

  /* — Build DOM elements & bind events — */
  init() {
    // Cursor dot – small golden circle with glow
    this.dot = document.createElement('div');
    this.dot.classList.add('cursor-dot');
    Object.assign(this.dot.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#ffd700',
      boxShadow: '0 0 12px 3px rgba(255,215,0,0.6)',
      pointerEvents: 'none',
      zIndex: '999999',
      transform: 'translate(-50%, -50%)',
      transition: 'width 0.2s, height 0.2s',
    });
    document.body.appendChild(this.dot);

    // Cursor ring – larger trailing cyan circle
    this.ring = document.createElement('div');
    this.ring.classList.add('cursor-ring');
    Object.assign(this.ring.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '2px solid rgba(6,182,212,0.6)',
      pointerEvents: 'none',
      zIndex: '999998',
      transform: 'translate(-50%, -50%)',
      transition: 'width 0.25s, height 0.25s, border-color 0.25s',
    });
    document.body.appendChild(this.ring);

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Click ripple
    document.addEventListener('mousedown', (e) => {
      this.createRipple(e.clientX, e.clientY);
      // Brief scale-down on dot
      this.dot.style.transform = 'translate(-50%, -50%) scale(0.6)';
    });
    document.addEventListener('mouseup', () => {
      this.dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    // Hover detection for interactive elements
    document.addEventListener('mouseover', (e) => {
      const interactive = e.target.closest('a, button, .interactive, .gallery-item, .nav-toggle');
      if (interactive) {
        this.isHovering = true;
        this.ring.style.width = '60px';
        this.ring.style.height = '60px';
        this.ring.style.borderColor = 'rgba(255,215,0,0.8)';
      }
    });
    document.addEventListener('mouseout', (e) => {
      const interactive = e.target.closest('a, button, .interactive, .gallery-item, .nav-toggle');
      if (interactive) {
        this.isHovering = false;
        this.ring.style.width = '40px';
        this.ring.style.height = '40px';
        this.ring.style.borderColor = 'rgba(6,182,212,0.6)';
      }
    });

    // Start render loop
    this.animate();
  }

  /* — Animation tick — */
  animate() {
    // Move dot instantly
    this.dot.style.left = `${this.mouseX}px`;
    this.dot.style.top = `${this.mouseY}px`;

    // Ring follows with smooth lerp
    this.ringX += (this.mouseX - this.ringX) * 0.15;
    this.ringY += (this.mouseY - this.ringY) * 0.15;
    this.ring.style.left = `${this.ringX}px`;
    this.ring.style.top = `${this.ringY}px`;

    // Spawn a particle every 3rd frame
    this.frameCount++;
    if (this.frameCount % 3 === 0) {
      this.spawnParticle(this.mouseX, this.mouseY);
    }

    // Update existing particles
    this.updateParticles();

    requestAnimationFrame(() => this.animate());
  }

  /* — Spawn a single trail particle — */
  spawnParticle(x, y) {
    const el = document.createElement('div');
    const size = 3 + Math.random();
    Object.assign(el.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: 'rgba(255,215,0,0.8)',
      boxShadow: '0 0 6px rgba(255,215,0,0.5)',
      pointerEvents: 'none',
      zIndex: '999997',
      transform: 'translate(-50%, -50%)',
    });
    document.body.appendChild(el);

    this.particles.push({
      el,
      x,
      y,
      driftX: (Math.random() - 0.5) * 1.5,
      driftY: (Math.random() - 0.5) * 1.5 - 0.5, // bias upward
      life: 30,
      maxLife: 30,
    });
  }

  /* — Tick all particles, remove dead ones — */
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      p.x += p.driftX;
      p.y += p.driftY;

      const alpha = p.life / p.maxLife;
      p.el.style.left = `${p.x}px`;
      p.el.style.top = `${p.y}px`;
      p.el.style.opacity = alpha;

      if (p.life <= 0) {
        p.el.remove();
        this.particles.splice(i, 1);
      }
    }
  }

  /* — Click ripple — */
  createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.classList.add('click-ripple');
    Object.assign(ripple.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: '999999',
    });
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
}


/* ─────────────────────────────────────────────────────────────────────────────
 *  MODULE 2 — STORM PARTICLES (Canvas)
 *  Floating luminous motes in the hero section
 * ───────────────────────────────────────────────────────────────────────────── */

class StormParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 150;
    this.paused = false;

    this.resize();
    this.createParticles();
    this.animate();

    window.addEventListener('resize', () => this.resize());
  }

  /* — Match canvas to its CSS dimensions — */
  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  /* — Populate particle pool — */
  createParticles() {
    const palette = ['#ffd700', '#06b6d4', '#f0f9ff'];

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: 1 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 0.6,           // gentle drift
        speedY: -(0.2 + Math.random() * 0.6),           // float upward
        opacity: 0.2 + Math.random() * 0.5,
        baseOpacity: 0.2 + Math.random() * 0.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        pulse: Math.random() * Math.PI * 2,             // phase offset
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }
  }

  /* — Render loop — */
  animate() {
    if (!this.paused) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (const p of this.particles) {
        // Movement
        p.x += p.speedX;
        p.y += p.speedY;

        // Pulsing opacity
        p.pulse += p.pulseSpeed;
        p.opacity = p.baseOpacity + Math.sin(p.pulse) * 0.15;

        // Wrap edges
        if (p.x < -p.size) p.x = this.canvas.width + p.size;
        if (p.x > this.canvas.width + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = this.canvas.height + p.size;
        if (p.y > this.canvas.height + p.size) {
          p.y = -p.size;
          p.x = Math.random() * this.canvas.width;
        }

        // Draw glowing circle via radial gradient
        const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        grad.addColorStop(0, this.hexToRgba(p.color, p.opacity));
        grad.addColorStop(1, this.hexToRgba(p.color, 0));

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = grad;
        this.ctx.fill();
      }
    }

    requestAnimationFrame(() => this.animate());
  }

  /* — Utility: hex color → rgba string — */
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}


/* ─────────────────────────────────────────────────────────────────────────────
 *  MODULE 3 — LIGHTNING ENGINE
 *  Procedural jagged bolts with branching, flash, and double-strike
 * ───────────────────────────────────────────────────────────────────────────── */

class LightningEngine {
  constructor(canvasId, flashElementId) {
    this.canvas = document.getElementById(canvasId);
    this.flashEl = document.getElementById(flashElementId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.paused = false;

    this.resize();
    this.scheduleLightning();

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  /* — Schedule the next strike at a random interval — */
  scheduleLightning() {
    const delay = 4000 + Math.random() * 6000; // 4-10 seconds
    setTimeout(() => {
      if (!this.paused) {
        this.strike();
      }
      this.scheduleLightning();
    }, delay);
  }

  /* — Execute a lightning strike — */
  strike() {
    const startX = Math.random() * this.canvas.width;
    const startY = 0;

    // Draw the main bolt
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBolt(startX, startY, Math.PI / 2, this.canvas.height * 0.85, 3, 5);

    // Flash the overlay
    this.triggerFlash();

    // Clear bolt after a brief moment
    const clearDelay = 100 + Math.random() * 100;
    setTimeout(() => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }, clearDelay);

    // 30% chance of a double-strike
    if (Math.random() < 0.3) {
      setTimeout(() => {
        if (this.paused) return;
        const x2 = startX + (Math.random() - 0.5) * 120;
        this.drawBolt(x2, 0, Math.PI / 2, this.canvas.height * 0.75, 2.5, 4);
        this.triggerFlash();
        setTimeout(() => {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }, clearDelay);
      }, 100);
    }
  }

  /* — Recursively draw a jagged, branching bolt — */
  drawBolt(x, y, angle, remainingLength, width, maxBranches) {
    if (remainingLength <= 0 || width < 0.3) return;

    const segmentLength = 10 + Math.random() * 15;
    const deviation = (Math.random() - 0.5) * 1.2; // angular jitter
    const newAngle = angle + deviation;

    const endX = x + Math.cos(newAngle) * segmentLength;
    const endY = y + Math.sin(newAngle) * segmentLength;

    // Draw segment with glowing stroke
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(endX, endY);

    // Core bright line
    this.ctx.strokeStyle = 'rgba(200, 230, 255, 0.9)';
    this.ctx.lineWidth = width;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = 'rgba(120, 180, 255, 0.8)';
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // Brighter inner core
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(endX, endY);
    this.ctx.strokeStyle = 'rgba(235, 245, 255, 0.95)';
    this.ctx.lineWidth = width * 0.4;
    this.ctx.shadowBlur = 25;
    this.ctx.shadowColor = 'rgba(180, 220, 255, 0.9)';
    this.ctx.stroke();
    this.ctx.restore();

    // Possibly branch
    if (maxBranches > 0 && Math.random() < 0.2) {
      const branchAngle = newAngle + (Math.random() - 0.5) * 1.5;
      const branchLength = remainingLength * (0.3 + Math.random() * 0.3);
      this.drawBolt(endX, endY, branchAngle, branchLength, width * 0.6, maxBranches - 1);
    }

    // Continue main bolt
    this.drawBolt(endX, endY, newAngle, remainingLength - segmentLength, width * 0.98, maxBranches);
  }

  /* — Brief bright flash on the hero overlay — */
  triggerFlash() {
    if (!this.flashEl) return;
    this.flashEl.classList.add('active');
    setTimeout(() => {
      this.flashEl.classList.remove('active');
    }, 100);
  }
}


/* ─────────────────────────────────────────────────────────────────────────────
 *  MODULE 4 — SCROLL ANIMATIONS (Intersection Observer)
 *  One-shot reveal classes triggered as elements enter the viewport
 * ───────────────────────────────────────────────────────────────────────────── */

class ScrollAnimations {
  constructor() {
    // Respect user's motion preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  init() {
    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (targets.length === 0) return;

    // If the user prefers reduced motion, reveal everything immediately
    if (this.reducedMotion) {
      targets.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // one-shot
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((el) => observer.observe(el));
  }
}


/* ─────────────────────────────────────────────────────────────────────────────
 *  MODULE 5 — NAVIGATION
 *  Sticky scroll class, mobile toggle, smooth-scroll anchor links
 * ───────────────────────────────────────────────────────────────────────────── */

class Navigation {
  constructor() {
    this.nav = document.querySelector('.nav');
    this.toggle = document.querySelector('.nav-toggle');
    this.links = document.querySelector('.nav-links');
    this.init();
  }

  init() {
    if (!this.nav) return;

    // — Sticky nav on scroll —
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.nav.classList.toggle('scrolled', window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    });

    // — Mobile toggle —
    if (this.toggle && this.links) {
      this.toggle.addEventListener('click', () => {
        this.toggle.classList.toggle('active');
        this.links.classList.toggle('active');
      });
    }

    // — Smooth scroll for anchor links & close mobile menu —
    const anchorLinks = this.nav.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Close mobile menu
          if (this.toggle && this.links) {
            this.toggle.classList.remove('active');
            this.links.classList.remove('active');
          }
        }
      });
    });
  }
}


/* ─────────────────────────────────────────────────────────────────────────────
 *  MODULE 6 — PARALLAX ENGINE
 *  Scroll-driven translateY on [data-parallax] elements
 * ───────────────────────────────────────────────────────────────────────────── */

class ParallaxEngine {
  constructor() {
    this.elements = document.querySelectorAll('[data-parallax]');
    if (this.elements.length === 0) return;

    // Respect reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.init();
  }

  init() {
    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;

      this.elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.3;

        // Only process elements near the viewport
        if (rect.bottom < -100 || rect.top > windowH + 100) return;

        // Offset relative to how far the element has scrolled into view
        const center = rect.top + rect.height / 2 - windowH / 2;
        const offset = center * speed;

        el.style.transform = `translateY(${offset}px)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    });

    // Initial call
    update();
  }
}


/* ─────────────────────────────────────────────────────────────────────────────
 *  MODULE 7 — GALLERY SYSTEM
 *  Filterable grid + lightbox modal
 * ───────────────────────────────────────────────────────────────────────────── */

class GallerySystem {
  constructor() {
    this.modal = document.querySelector('.gallery-modal');
    this.modalImg = this.modal ? this.modal.querySelector('img') : null;
    this.closeBtn = this.modal ? this.modal.querySelector('.gallery-modal-close') : null;
    this.filterBtns = document.querySelectorAll('.gallery-filter-btn');
    this.items = document.querySelectorAll('.gallery-item');

    this.init();
  }

  init() {
    if (this.items.length === 0) return;

    // — Open modal on item click (event delegation on body) —
    document.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item) {
        const img = item.querySelector('img');
        if (img) {
          // Use data-full attribute if present, otherwise the displayed src
          const fullSrc = img.getAttribute('data-full') || img.src;
          this.openModal(fullSrc);
        }
      }
    });

    // — Close modal —
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Click outside the image
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });

    // — Filter buttons —
    this.filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Toggle active state on buttons
        this.filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');

        this.items.forEach((item) => {
          if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = '';
            // Re-trigger reveal animation
            requestAnimationFrame(() => item.classList.add('visible'));
          } else {
            item.style.display = 'none';
            item.classList.remove('visible');
          }
        });
      });
    });
  }

  /* — Open lightbox — */
  openModal(src) {
    if (!this.modal || !this.modalImg) return;
    this.modalImg.src = src;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /* — Close lightbox — */
  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}


/* ─────────────────────────────────────────────────────────────────────────────
 *  MODULE 8 — TYPEWRITER EFFECT
 *  Character-by-character text reveal with blinking cursor
 * ───────────────────────────────────────────────────────────────────────────── */

class TypewriterEffect {
  constructor(elementId, text, speed = 50) {
    this.element = document.getElementById(elementId);
    this.text = text;
    this.speed = speed;
    this.index = 0;

    if (!this.element) return;
  }

  start() {
    if (!this.element) return;

    // Ensure element starts empty and has cursor style
    this.element.textContent = '';
    this.element.classList.add('typewriter-active');

    this.type();
  }

  type() {
    if (this.index < this.text.length) {
      this.element.textContent += this.text.charAt(this.index);
      this.index++;
      setTimeout(() => this.type(), this.speed);
    } else {
      // Typing complete – add blinking cursor class
      this.element.classList.remove('typewriter-active');
      this.element.classList.add('typewriter-done');
    }
  }
}


/* ─────────────────────────────────────────────────────────────────────────────
 *  MODULE 9 — TIMELINE PROGRESS
 *  Scroll-driven golden glow that fills the timeline track
 * ───────────────────────────────────────────────────────────────────────────── */

class TimelineProgress {
  constructor() {
    this.timeline = document.querySelector('.timeline');
    this.glowLine = document.querySelector('.timeline-glow');

    if (!this.timeline || !this.glowLine) return;
    this.init();
  }

  init() {
    let ticking = false;

    const update = () => {
      const rect = this.timeline.getBoundingClientRect();
      const windowH = window.innerHeight;

      // How much of the timeline the user has scrolled through
      // 0 → top of timeline just entering viewport, 1 → bottom has passed
      const totalHeight = rect.height;
      const scrolledPast = windowH - rect.top;
      let progress = scrolledPast / totalHeight;

      // Clamp 0–1
      progress = Math.min(Math.max(progress, 0), 1);

      this.glowLine.style.transform = `scaleY(${progress})`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    });

    // Initial
    update();
  }
}


/* ─────────────────────────────────────────────────────────────────────────────
 *  MODULE 10 — CONTACT FORM
 *  Graceful submit handling with styled notification (no backend)
 * ───────────────────────────────────────────────────────────────────────────── */

class ContactForm {
  constructor() {
    this.form = document.getElementById('contact-form');
    if (!this.form) return;
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Quick validation: check required fields
      const inputs = this.form.querySelectorAll('[required]');
      let valid = true;
      inputs.forEach((input) => {
        if (!input.value.trim()) {
          valid = false;
          input.classList.add('error');
        } else {
          input.classList.remove('error');
        }
      });

      if (!valid) {
        this.showNotification('Please fill in all required fields.', 'error');
        return;
      }

      // Show sending state on submit button
      const submitBtn = document.getElementById('form-submit-btn');
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Proposal...';

      // Gather input values
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const subject = document.getElementById('form-subject').value;
      const message = document.getElementById('form-message').value;

      // Web3Forms payload
      const formData = {
        access_key: "dc50ab3d-b2df-4b4e-965a-1fb3bc7627ad",
        name: name,
        email: email,
        subject: `[Indra Game Pitch] ${subject}`,
        message: message
      };

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(async (response) => {
        let json = await response.json();
        if (response.status === 200) {
          this.showNotification('Your proposal has been sent successfully! ⚡', 'success');
          this.form.reset();
        } else {
          console.error(json);
          this.showNotification(json.message || 'Something went wrong. Please try again.', 'error');
        }
      })
      .catch((error) => {
        console.error(error);
        this.showNotification('Network error. Please check your connection.', 'error');
      })
      .finally(() => {
        // Revert submit button back to normal
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      });
    });
  }

  /* — Display a floating notification toast — */
  showNotification(message, type = 'success') {
    // Remove any existing notification
    const existing = document.querySelector('.form-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.classList.add('form-notification', `form-notification--${type}`);
    toast.textContent = message;

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      padding: '16px 28px',
      borderRadius: '8px',
      color: '#fff',
      fontFamily: 'inherit',
      fontSize: '0.95rem',
      zIndex: '10003',
      opacity: '0',
      transform: 'translateY(20px)',
      transition: 'opacity 0.4s, transform 0.4s',
      background:
        type === 'success'
          ? 'linear-gradient(135deg, rgba(6,182,212,0.9), rgba(255,215,0,0.85))'
          : 'linear-gradient(135deg, rgba(220,38,38,0.9), rgba(180,40,40,0.85))',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      maxWidth: '400px',
    });

    document.body.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Auto dismiss
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }
}


/* ─────────────────────────────────────────────────────────────────────────────
 *  MODULE 10.5 — CINEMATIC CAROUSEL
 *  Provides button-triggered horizontal sliding with boundary checks
 * ───────────────────────────────────────────────────────────────────────────── */

class CinematicCarousel {
  constructor(sliderId, prevBtnId, nextBtnId) {
    this.slider = document.getElementById(sliderId);
    this.prevBtn = document.getElementById(prevBtnId);
    this.nextBtn = document.getElementById(nextBtnId);

    if (!this.slider || !this.prevBtn || !this.nextBtn) return;
    this.init();
  }

  init() {
    const scrollByAmount = (direction) => {
      const card = this.slider.firstElementChild;
      const cardWidth = card ? card.offsetWidth : 350;
      const style = window.getComputedStyle(this.slider);
      const gap = parseInt(style.gap || style.columnGap) || 40;
      const step = cardWidth + gap;

      this.slider.scrollBy({
        left: direction * step,
        behavior: 'smooth'
      });
    };

    this.prevBtn.addEventListener('click', () => scrollByAmount(-1));
    this.nextBtn.addEventListener('click', () => scrollByAmount(1));

    const checkBoundaries = () => {
      const scrollLeft = Math.ceil(this.slider.scrollLeft);
      const maxScroll = this.slider.scrollWidth - this.slider.clientWidth;

      if (scrollLeft <= 5) {
        this.prevBtn.style.opacity = '0';
        this.prevBtn.style.pointerEvents = 'none';
      } else {
        this.prevBtn.style.opacity = '1';
        this.prevBtn.style.pointerEvents = 'auto';
      }

      if (scrollLeft >= maxScroll - 5) {
        this.nextBtn.style.opacity = '0';
        this.nextBtn.style.pointerEvents = 'none';
      } else {
        this.nextBtn.style.opacity = '1';
        this.nextBtn.style.pointerEvents = 'auto';
      }
    };

    this.slider.addEventListener('scroll', checkBoundaries);
    window.addEventListener('resize', checkBoundaries);

    setTimeout(checkBoundaries, 500);
  }
}


/* ─────────────────────────────────────────────────────────────────────────────
 *  MODULE 11 — APP INITIALIZATION
 *  Bootstrap all modules, set up performance observers
 * ───────────────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  /* ── Instantiate core modules ── */
  const cursor       = new DivineCursor();
  const particles    = new StormParticles('hero-particles');
  const lightning    = new LightningEngine('hero-lightning', 'hero-flash');
  const scrollAnims  = new ScrollAnimations();
  const nav          = new Navigation();
  const parallax     = new ParallaxEngine();
  const gallery      = new GallerySystem();
  const timeline     = new TimelineProgress();
  const contactForm  = new ContactForm();
  const charCarousel = new CinematicCarousel('characters-slider', 'char-prev-btn', 'char-next-btn');

  /* ── Typewriter for hero tagline ── */
  const tagline = document.getElementById('hero-tagline');
  if (tagline) {
    const text = tagline.getAttribute('data-text');
    if (text) {
      tagline.textContent = '';
      // Delay until the hero entrance animation has settled (~2 s)
      setTimeout(() => {
        const tw = new TypewriterEffect('hero-tagline', text, 40);
        tw.start();
      }, 2000);
    }
  }

  /* ── Performance: pause hero canvases when out of view ── */
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const offScreen = !entry.isIntersecting;
        if (particles) particles.paused = offScreen;
        if (lightning) lightning.paused = offScreen;
      });
    });
    heroObserver.observe(heroSection);
  }

  // eslint-disable-next-line no-console
  console.log(
    '%c⚡ The Legend of Indra vs Vritrasur — Engine Loaded',
    'color:#ffd700;font-size:14px;font-weight:bold;text-shadow:0 0 10px rgba(255,215,0,0.6);'
  );
});
