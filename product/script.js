/* ============================================================
   PETAL TALES — Product Page Script
   ============================================================ */

let product = null;
let selectedQty = 1;
let selectedOptions = {};

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('shop');
  renderFooter();

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { window.location.href = '../shop/index.html'; return; }

  product = await DataLayer.getProduct(id);
  if (!product) { window.location.href = '../shop/index.html'; return; }

  renderProduct();
  loadRelated();
});

function renderProduct() {
  const layout = document.getElementById('productLayout');
  const name   = I18n.productName(product);
  const desc   = I18n.productDesc(product);

  // Update breadcrumb
  document.getElementById('breadcrumbName').textContent = name;
  document.title = `${name} — Petal Tales`;

  const images = (product.images && product.images.length) ? product.images : ['https://images.unsplash.com/photo-1487530811015-780f2bb27d72?w=700'];
  const thumbsHTML = images.map((src, i) => `
    <div class="product-gallery__thumb ${i===0?'active':''}" data-index="${i}">
      <img src="${src}" alt="${name} view ${i+1}" loading="lazy"/>
    </div>`).join('');

  const badgeHTML = product.badge
    ? `<span class="product-card__badge product-card__badge--${product.badge==='special'?'special':'new'}">${product.badge}</span>`
    : '';
  const specialBadge = product.isSpecial
    ? `<span style="padding:4px 12px;border-radius:var(--r-pill);background:rgba(229,199,107,.2);color:#7a6a00;font-size:.75rem;font-weight:500">✍️ Includes Custom Drawing</span>`
    : '';

  layout.innerHTML = `
    <!-- Gallery -->
    <div class="product-gallery" data-reveal>
      <div class="product-gallery__main" id="mainImg">
        <img src="${images[0]}" alt="${name}" id="mainImgEl" width="600" height="750"/>
      </div>
      <div class="product-gallery__thumbs">${thumbsHTML}</div>
    </div>

    <!-- Info -->
    <div class="product-info" data-reveal data-reveal-delay="1">
      <div class="product-badge-row">${badgeHTML}${specialBadge}</div>
      <h1 class="product-info__name">${name}</h1>
      <div class="product-info__price">${formatPrice(product.price)}</div>
      <p class="product-info__desc">${desc}</p>

      <!-- Size options -->
      <div class="product-options" id="productOptions"></div>

      <!-- Special fields (drawing, note, delivery date) -->
      <div class="special-fields ${product.isSpecial?'visible':''}" id="specialFields">
        <div class="special-fields__title">✨ Personalise Your Order</div>
        <div class="option-group">
          <label class="option-label" for="customerNote">Personal Note</label>
          <textarea id="customerNote" class="form-textarea" placeholder="Write your heartfelt message here…" rows="3"></textarea>
        </div>
        ${product.isSpecial ? `
        <div class="option-group">
          <label class="option-label" for="drawingDesc">Describe Your Custom Drawing</label>
          <textarea id="drawingDesc" class="form-textarea" placeholder="Describe the illustration you'd like included — a portrait, a scene, a memory…" rows="4"></textarea>
        </div>
        <div class="option-group">
          <label class="option-label" for="deliveryDate">Preferred Delivery Date</label>
          <input type="date" id="deliveryDate" class="form-input"/>
          <span class="delivery-note" id="deliveryNote">Special orders require at least 7 days lead time (max 3 months ahead).</span>
        </div>` : ''}
      </div>

      <!-- Quantity -->
      <div class="qty-row">
        <label class="option-label">Quantity</label>
        <div class="qty-control">
          <button class="qty-btn" id="qtyDown" aria-label="Decrease quantity">−</button>
          <input type="number" class="qty-value" id="qtyValue" value="1" min="1" max="99" aria-label="Quantity"/>
          <button class="qty-btn" id="qtyUp" aria-label="Increase quantity">+</button>
        </div>
      </div>

      <!-- CTA -->
      <div class="product-cta-row">
        <button class="btn btn--primary" id="addToCartBtn">
          🛒 Add to Cart
        </button>
        <a href="../cart/index.html" class="btn btn--outline" id="buyNowBtn">Buy Now</a>
        <button class="btn btn--wishlist" aria-label="Add to wishlist" id="wishlistBtn">♡</button>
      </div>

      <!-- Trust -->
      <div class="product-trust">
        <div class="product-trust-item"><span>🚚</span><span>Same-day delivery available</span></div>
        <div class="product-trust-item"><span>🌷</span><span>Fresh guaranteed</span></div>
        <div class="product-trust-item"><span>💬</span><span>Custom requests welcome</span></div>
      </div>
    </div>
  `;

  // Gallery interactions
  document.querySelectorAll('.product-gallery__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.dataset.index);
      document.getElementById('mainImgEl').src = images[idx];
      document.querySelectorAll('.product-gallery__thumb').forEach(t => t.classList.toggle('active', t === thumb));
    });
  });

  // Quantity
  document.getElementById('qtyDown').addEventListener('click', () => {
    if (selectedQty > 1) { selectedQty--; document.getElementById('qtyValue').value = selectedQty; }
  });
  document.getElementById('qtyUp').addEventListener('click', () => {
    if (selectedQty < 99) { selectedQty++; document.getElementById('qtyValue').value = selectedQty; }
  });
  document.getElementById('qtyValue').addEventListener('change', e => {
    selectedQty = Math.max(1, Math.min(99, parseInt(e.target.value) || 1));
    e.target.value = selectedQty;
  });

  // Delivery date bounds
  if (product.isSpecial) {
    const dateInput = document.getElementById('deliveryDate');
    if (dateInput) {
      const { min, max } = getDeliveryDateBounds();
      dateInput.min = min; dateInput.max = max; dateInput.value = min;
      dateInput.addEventListener('change', () => validateDeliveryDate(dateInput));
    }
  }

  // Wishlist toggle
  document.getElementById('wishlistBtn').addEventListener('click', function() {
    const liked = this.textContent === '♡';
    this.textContent = liked ? '♥' : '♡';
    this.style.color = liked ? '#DB96A1' : '';
    showToast(liked ? 'Added to wishlist 🌷' : 'Removed from wishlist');
  });

  // Add to cart
  document.getElementById('addToCartBtn').addEventListener('click', () => {
    const opts = gatherOptions();
    if (!opts) return;
    Cart.add(product, selectedQty, opts);
  });

  // Buy now
  document.getElementById('buyNowBtn').addEventListener('click', () => {
    const opts = gatherOptions();
    if (!opts) return;
    Cart.add(product, selectedQty, opts);
    window.location.href = '../cart/index.html';
  });

  // Build size/wrapping options
  buildOptions();
  initScrollReveal();
}

function buildOptions() {
  const container = document.getElementById('productOptions');
  if (!container) return;
  const options = product.options || [];

  if (options.includes('size')) {
    const group = document.createElement('div');
    group.className = 'option-group';
    group.innerHTML = `
      <span class="option-label">Size</span>
      <div class="option-pills">
        <button class="option-pill active" data-opt="size" data-val="small">Small</button>
        <button class="option-pill" data-opt="size" data-val="medium">Medium</button>
        <button class="option-pill" data-opt="size" data-val="large">Large</button>
      </div>`;
    container.appendChild(group);
    selectedOptions.size = 'small';
  }

  if (options.includes('wrapping')) {
    const group = document.createElement('div');
    group.className = 'option-group';
    group.innerHTML = `
      <span class="option-label">Wrapping</span>
      <div class="option-pills">
        <button class="option-pill active" data-opt="wrapping" data-val="classic">Classic Paper</button>
        <button class="option-pill" data-opt="wrapping" data-val="fabric">Silk Fabric</button>
        <button class="option-pill" data-opt="wrapping" data-val="box">Gift Box</button>
      </div>`;
    container.appendChild(group);
    selectedOptions.wrapping = 'classic';
  }

  container.addEventListener('click', e => {
    const pill = e.target.closest('.option-pill');
    if (!pill) return;
    const opt = pill.dataset.opt;
    const val = pill.dataset.val;
    selectedOptions[opt] = val;
    container.querySelectorAll(`[data-opt="${opt}"]`).forEach(p => p.classList.toggle('active', p === pill));
  });
}

function gatherOptions() {
  const opts = { ...selectedOptions };

  if (product.isSpecial) {
    const note = document.getElementById('customerNote')?.value.trim();
    const drawing = document.getElementById('drawingDesc')?.value.trim();
    const dateEl  = document.getElementById('deliveryDate');

    opts.note    = note;
    opts.drawing = drawing;

    if (dateEl) {
      if (!validateDeliveryDate(dateEl)) return null;
      opts.deliveryDate = dateEl.value;
    }
  } else {
    opts.note = document.getElementById('customerNote')?.value.trim() || '';
  }

  return opts;
}

function validateDeliveryDate(input) {
  const noteEl = document.getElementById('deliveryNote');
  const { min, max } = getDeliveryDateBounds();
  const val = input.value;
  if (!val || val < min || val > max) {
    if (noteEl) { noteEl.textContent = '⚠ Please choose a date between 7 days and 3 months from today.'; noteEl.classList.add('error'); }
    return false;
  }
  if (noteEl) { noteEl.textContent = 'Special orders require at least 7 days lead time.'; noteEl.classList.remove('error'); }
  return true;
}

async function loadRelated() {
  const products = await DataLayer.getProducts(product.category);
  const related  = products.filter(p => p.id !== product.id).slice(0, 4);
  if (!related.length) return;

  const section = document.getElementById('relatedSection');
  const grid    = document.getElementById('relatedGrid');
  if (!section || !grid) return;
  section.style.display = 'block';

  related.forEach((p, i) => {
    const name = I18n.productName(p);
    const img  = (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1487530811015-780f2bb27d72?w=400';
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-reveal', ''); card.setAttribute('data-reveal-delay', i);
    card.innerHTML = `
      <div class="product-card__image-wrap"><img src="${img}" alt="${name}" loading="lazy"/></div>
      <div class="product-card__body">
        <h3 class="product-card__name">${name}</h3>
        <div class="product-card__footer">
          <span class="product-card__price">${formatPrice(p.price)}</span>
          <button class="product-card__add" aria-label="Add to cart">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>`;
    card.querySelector('.product-card__image-wrap').addEventListener('click', () => {
      window.location.href = `../product/index.html?id=${p.id}`;
    });
    card.querySelector('.product-card__add').addEventListener('click', e => { e.stopPropagation(); Cart.add(p); });
    grid.appendChild(card);
  });
  initScrollReveal();
}
