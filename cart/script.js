/* ============================================================
   PETAL TALES — Cart Page Script
   ============================================================ */
const SHIPPING = 80;

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('');
  renderFooter();
  renderCart();
  document.addEventListener('cart:updated', renderCart);
});

function renderCart() {
  const items   = Cart.get();
  const layout  = document.getElementById('cartLayout');
  const empty   = document.getElementById('cartEmpty');
  if (!layout) return;

  if (!items.length) {
    layout.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  layout.innerHTML = `
    <div class="cart-items" id="cartItems"></div>
    <aside class="cart-summary">
      <h2>Order Summary</h2>
      <div class="summary-row"><span>Subtotal</span><span id="sumSubtotal">—</span></div>
      <div class="summary-row"><span>Shipping</span><span id="sumShipping">—</span></div>
      <div class="promo-row">
        <input type="text" class="form-input" placeholder="Promo code" id="promoInput" aria-label="Promo code"/>
        <button class="btn btn--outline" style="padding:10px 16px;font-size:.8rem" id="applyPromo">Apply</button>
      </div>
      <div class="summary-row" id="promoRow" style="display:none;color:var(--petal-rose)"><span>Promo</span><span id="promoVal"></span></div>
      <div class="summary-row summary-row--total"><span>Total</span><span id="sumTotal">—</span></div>
      <a href="../checkout/index.html" class="btn btn--primary cart-checkout-btn">Proceed to Checkout →</a>
      <a href="../shop/index.html" style="display:block;text-align:center;margin-top:var(--sp-md);font-size:.8rem;color:var(--text-muted);text-decoration:underline">Continue Shopping</a>
    </aside>`;

  const cartItems = document.getElementById('cartItems');
  items.forEach(item => {
    const name = I18n.productName(item.product);
    const img  = (item.product.images && item.product.images[0]) || 'https://images.unsplash.com/photo-1487530811015-780f2bb27d72?w=200';
    const opts = Object.entries(item.customOptions || {}).filter(([k]) => !['note','drawing','deliveryDate'].includes(k)).map(([k,v]) => `${k}: ${v}`).join(' · ');

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.setAttribute('data-reveal','');
    div.innerHTML = `
      <div class="cart-item__img"><img src="${img}" alt="${name}" loading="lazy"/></div>
      <div class="cart-item__info">
        <div class="cart-item__name">${name}</div>
        ${opts ? `<div class="cart-item__opts">${opts}</div>` : ''}
        <div class="cart-item__price">${formatPrice(item.product.price)}</div>
      </div>
      <div class="cart-item__actions">
        <div class="cart-item__qty">
          <button aria-label="Decrease" data-action="down" data-key="${item.key}">−</button>
          <input type="number" value="${item.qty}" min="1" max="99" data-key="${item.key}" aria-label="Quantity"/>
          <button aria-label="Increase" data-action="up"   data-key="${item.key}">+</button>
        </div>
        <button class="cart-item__remove" data-key="${item.key}">Remove</button>
      </div>`;
    cartItems.appendChild(div);
  });

  updateSummary();
  initScrollReveal();

  // Events
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key  = btn.dataset.key;
      const item = Cart.get().find(i => i.key === key);
      if (!item) return;
      const delta = btn.dataset.action === 'up' ? 1 : -1;
      Cart.update(key, item.qty + delta);
    });
  });
  document.querySelectorAll('.cart-item__qty input').forEach(input => {
    input.addEventListener('change', () => Cart.update(input.dataset.key, parseInt(input.value) || 1));
  });
  document.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', () => Cart.remove(btn.dataset.key));
  });

  document.getElementById('applyPromo')?.addEventListener('click', () => {
    const code = document.getElementById('promoInput')?.value.trim().toUpperCase();
    if (code === 'PETALS10') {
      document.getElementById('promoRow').style.display = 'flex';
      document.getElementById('promoVal').textContent = '−10%';
      showToast('Promo code applied! 🌷');
      updateSummary(0.1);
    } else {
      showToast('Invalid promo code.');
    }
  });
}

function updateSummary(discount = 0) {
  const sub   = Cart.subtotal();
  const disc  = sub * discount;
  const total = sub - disc + SHIPPING;
  const el = id => document.getElementById(id);
  if (el('sumSubtotal')) el('sumSubtotal').textContent = formatPrice(sub);
  if (el('sumShipping'))  el('sumShipping').textContent  = SHIPPING > 0 ? formatPrice(SHIPPING) : 'Free';
  if (el('sumTotal'))     el('sumTotal').textContent     = formatPrice(total);
}
