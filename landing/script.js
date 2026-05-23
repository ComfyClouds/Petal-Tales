/* ============================================================
   PETAL TALES — Landing Page Script
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('');
  renderFooter();

  await loadFeaturedProducts();
  await loadCategories();
  loadTestimonials();
  loadInstagramGrid();
  initHeroInteraction();
  initFallingPetals();
});

/* ── Hero Tulip Interaction ─────────────────────────────── */
function initHeroInteraction() {
  const tulip   = document.getElementById('heroTulip');
  const cta     = document.getElementById('heroCta');
  const overlay = document.getElementById('pageOverlay');

  function triggerBloom(navigateTo) {
    if (!tulip) return;
    tulip.classList.add('blooming');

    if (navigateTo) {
      overlay.classList.add('active');
      setTimeout(() => {
        window.location.href = navigateTo;
      }, 900);
    } else {
      setTimeout(() => tulip.classList.remove('blooming'), 1400);
    }
  }

  // Click flower → bloom and navigate to shop
  const flowerWrap = document.querySelector('.hero__flower-wrap');
  if (flowerWrap) {
    flowerWrap.addEventListener('click', () => triggerBloom('../shop/index.html'));
  }

  // CTA button → same
  if (cta) {
    cta.addEventListener('click', () => triggerBloom('../shop/index.html'));
  }

  // Hover = mini bloom
  if (flowerWrap) {
    flowerWrap.addEventListener('mouseenter', () => tulip && tulip.classList.add('blooming'));
    flowerWrap.addEventListener('mouseleave', () => tulip && tulip.classList.remove('blooming'));
  }
}

/* ── Falling Petals Canvas ──────────────────────────────── */
function initFallingPetals() {
  const canvas = document.getElementById('petalsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, petals = [];
  const COLORS = ['#F9C5D1','#FFCFDF','#FDE2E8','#DDBFC4','#DB96A1'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Petal {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x     = Math.random() * W;
      this.y     = initial ? Math.random() * H : -20;
      this.size  = 4 + Math.random() * 8;
      this.speedY = 0.4 + Math.random() * 0.8;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.rot   = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.04;
      this.opacity = 0.15 + Math.random() * 0.35;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    update() {
      this.y   += this.speedY;
      this.x   += this.speedX + Math.sin(this.y * 0.01) * 0.3;
      this.rot += this.rotSpeed;
      if (this.y > H + 20) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 40; i++) petals.push(new Petal());

  let running = true;
  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    petals.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) loop();
  });
}

/* ── Featured Products ──────────────────────────────────── */
async function loadFeaturedProducts() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  const products = await DataLayer.getProducts();
  const featured = products.slice(0, 3); // show first 3

  grid.innerHTML = '';
  featured.forEach((product, i) => {
    const card = createProductCard(product, i);
    grid.appendChild(card);
  });
}

function createProductCard(product, delayIndex = 0) {
  const lang = I18n.current;
  const name = product[`name_${lang}`] || product.name_en;
  const desc = product[`desc_${lang}`] || product.desc_en;
  const img  = (product.images && product.images[0])
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1487530811015-780f2bb27d72?w=600';

  const badge = product.badge
    ? `<span class="product-card__badge product-card__badge--${product.badge === 'special' ? 'special' : 'new'}">${product.badge}</span>`
    : '';

  const div = document.createElement('article');
  div.className = 'product-card';
  div.setAttribute('data-reveal', '');
  div.setAttribute('data-reveal-delay', delayIndex);
  div.innerHTML = `
    <div class="product-card__image-wrap">
      <img src="${img}" alt="${name}" loading="lazy" width="400" height="500"/>
      ${badge}
    </div>
    <div class="product-card__body">
      <h3 class="product-card__name">${name}</h3>
      <p class="product-card__desc">${desc.substring(0, 80)}…</p>
      <div class="product-card__footer">
        <span class="product-card__price">${formatPrice(product.price)}</span>
        <button class="product-card__add" aria-label="Add ${name} to cart" data-id="${product.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>
  `;

  div.querySelector('.product-card__image-wrap').addEventListener('click', () => {
    window.location.href = `../product/index.html?id=${product.id}`;
  });
  div.querySelector('.product-card__add').addEventListener('click', (e) => {
    e.stopPropagation();
    Cart.add(product);
  });

  // Re-observe for reveal
  requestAnimationFrame(() => {
    if (window._revealObserver) window._revealObserver.observe(div);
  });

  return div;
}

/* ── Categories ─────────────────────────────────────────── */
async function loadCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  const categories = await DataLayer.getCategories();
  const products   = await DataLayer.getProducts();

  grid.innerHTML = '';
  categories.forEach((cat, i) => {
    const count = products.filter(p => p.category === cat.id).length;
    const name  = I18n.categoryName(cat);
    const a = document.createElement('a');
    a.href = `../shop/index.html?cat=${cat.id}`;
    a.className = 'category-card';
    a.setAttribute('data-reveal', '');
    a.setAttribute('data-reveal-delay', i);
    a.innerHTML = `
      <span class="category-card__icon">${cat.icon}</span>
      <div class="category-card__name">${name}</div>
      <div class="category-card__count">${count} items</div>
    `;
    grid.appendChild(a);
  });

  // Re-trigger scroll reveal for newly added elements
  initScrollReveal();
}

/* ── Testimonials ───────────────────────────────────────── */
function loadTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;

  const testimonials = [
    { text: 'The most beautiful bouquet I have ever received. The custom drawing made me cry happy tears!', author: 'Nour A.', emoji: '🌷', stars: '★★★★★' },
    { text: 'Ordered for my mother's birthday — she said it was the most thoughtful gift she's ever gotten. Will order again!', author: 'Yasmine M.', emoji: '🌸', stars: '★★★★★' },
    { text: 'The dried flower arrangement is still sitting on my desk months later. Absolutely stunning quality.', author: 'Sara K.', emoji: '🌾', stars: '★★★★★' },
  ];

  testimonials.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.setAttribute('data-reveal', '');
    card.setAttribute('data-reveal-delay', i);
    card.innerHTML = `
      <p class="testimonial-card__text">${t.text}</p>
      <div class="testimonial-card__author">
        <div class="testimonial-card__avatar">${t.emoji}</div>
        <div>
          <div class="testimonial-card__name">${t.author}</div>
          <div class="testimonial-card__stars">${t.stars}</div>
        </div>
      </div>
    `;
    track.appendChild(card);
  });

  initScrollReveal();
}

/* ── Instagram Grid (placeholder tiles) ────────────────── */
function loadInstagramGrid() {
  const grid = document.getElementById('igGrid');
  if (!grid) return;

  const imgs = [
    'https://images.unsplash.com/photo-1487530811015-780f2bb27d72?w=400&q=70',
    'https://images.unsplash.com/photo-1490750967868-88df5691cc04?w=400&q=70',
    'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=400&q=70',
    'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&q=70',
    'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&q=70',
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&q=70',
  ];

  imgs.forEach(src => {
    const tile = document.createElement('div');
    tile.className = 'ig-tile';
    tile.innerHTML = `<img src="${src}" alt="Petal Tales on Instagram" loading="lazy"/>`;
    tile.addEventListener('click', () => window.open('https://instagram.com', '_blank'));
    grid.appendChild(tile);
  });
}
