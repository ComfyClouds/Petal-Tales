/* ============================================================
   PETAL TALES — Checkout Script
   ============================================================ */
const SHIPPING_COSTS = { standard: 80, express: 150, pickup: 0 };
let currentStep = 1;
let selectedShipping = 'standard';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('');
  renderFooter();

  // Redirect if cart empty
  if (!Cart.count()) { window.location.href = '../cart/index.html'; return; }

  renderOrderSummary();
  bindStepNavigation();
  bindPaymentToggle();
  bindCardFormatting();
});

/* ── Step Navigation ─────────────────────────────────────── */
function bindStepNavigation() {
  document.getElementById('toStep2')?.addEventListener('click', () => {
    if (validateStep1()) goToStep(2);
  });
  document.getElementById('toStep1')?.addEventListener('click', () => goToStep(1));
  document.getElementById('toStep3')?.addEventListener('click', () => goToStep(3));
  document.getElementById('toStep2b')?.addEventListener('click', () => goToStep(2));
  document.getElementById('placeOrder')?.addEventListener('click', placeOrder);

  document.querySelectorAll('input[name="shipping"]').forEach(radio => {
    radio.addEventListener('change', () => {
      selectedShipping = radio.value;
      renderOrderSummary();
    });
  });
}

function goToStep(n) {
  currentStep = n;
  document.querySelectorAll('.checkout-panel').forEach((p, i) => p.hidden = (i + 1 !== n));
  document.querySelectorAll('.checkout-step').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
    s.classList.toggle('done', i + 1 < n);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Validation ──────────────────────────────────────────── */
function validateStep1() {
  const fields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city'];
  let valid = true;
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const empty = !el.value.trim();
    el.style.borderColor = empty ? '#c0392b' : '';
    if (empty) valid = false;
  });
  if (!valid) showToast('Please fill all required fields ⚠', '⚠');
  return valid;
}

function validateStep3() {
  const method = document.querySelector('input[name="payment"]:checked')?.value;
  if (method !== 'card') return true;
  const fields = ['cardName', 'cardNumber', 'cardExpiry', 'cardCvv'];
  let valid = true;
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const empty = !el.value.trim();
    el.style.borderColor = empty ? '#c0392b' : '';
    if (empty) valid = false;
  });
  if (!valid) showToast('Please complete payment details ⚠', '⚠');
  return valid;
}

/* ── Place Order ─────────────────────────────────────────── */
function placeOrder() {
  if (!validateStep3()) return;

  // Build order object
  const order = {
    id: 'PT-' + Date.now(),
    date: new Date().toISOString(),
    customer: {
      firstName: document.getElementById('firstName')?.value,
      lastName:  document.getElementById('lastName')?.value,
      email:     document.getElementById('email')?.value,
      phone:     document.getElementById('phone')?.value,
    },
    address: {
      street:   document.getElementById('address')?.value,
      city:     document.getElementById('city')?.value,
      district: document.getElementById('district')?.value,
      notes:    document.getElementById('notes')?.value,
    },
    shipping:  selectedShipping,
    payment:   document.querySelector('input[name="payment"]:checked')?.value,
    items:     Cart.get(),
    subtotal:  Cart.subtotal(),
    shippingCost: SHIPPING_COSTS[selectedShipping],
    total:     Cart.subtotal() + SHIPPING_COSTS[selectedShipping],
  };

  // Save order to localStorage
  const orders = JSON.parse(localStorage.getItem('pt_orders') || '[]');
  orders.push(order);
  localStorage.setItem('pt_orders', JSON.stringify(orders));
  localStorage.setItem('pt_last_order', JSON.stringify(order));

  Cart.clear();

  // Navigate to thank you page
  window.location.href = '../thank-you/index.html';
}

/* ── Payment Method Toggle ───────────────────────────────── */
function bindPaymentToggle() {
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const cardFields = document.getElementById('cardFields');
      if (cardFields) cardFields.style.display = radio.value === 'card' ? 'flex' : 'none';
    });
  });
}

/* ── Card Number Formatting ──────────────────────────────── */
function bindCardFormatting() {
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', () => {
      let v = cardNumber.value.replace(/\D/g, '').substring(0, 16);
      cardNumber.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
  }
  const cardExpiry = document.getElementById('cardExpiry');
  if (cardExpiry) {
    cardExpiry.addEventListener('input', () => {
      let v = cardExpiry.value.replace(/\D/g, '').substring(0, 4);
      if (v.length >= 2) v = v.substring(0, 2) + ' / ' + v.substring(2);
      cardExpiry.value = v;
    });
  }
}

/* ── Order Summary ───────────────────────────────────────── */
function renderOrderSummary() {
  const items = Cart.get();
  const itemsWrap = document.getElementById('checkoutItems');
  const rowsWrap  = document.getElementById('checkoutRows');
  if (!itemsWrap || !rowsWrap) return;

  itemsWrap.innerHTML = items.map(item => {
    const name = I18n.productName(item.product);
    const img  = (item.product.images && item.product.images[0]) || '';
    return `
      <div class="co-item">
        <div class="co-item__img"><img src="${img}" alt="${name}" loading="lazy"/></div>
        <div>
          <div class="co-item__name">${name}</div>
          <div class="co-item__qty">Qty: ${item.qty}</div>
        </div>
        <span class="co-item__price">${formatPrice(item.product.price * item.qty)}</span>
      </div>`;
  }).join('');

  const sub      = Cart.subtotal();
  const shipping = SHIPPING_COSTS[selectedShipping];
  const total    = sub + shipping;

  rowsWrap.innerHTML = `
    <div class="co-row"><span>Subtotal</span><span>${formatPrice(sub)}</span></div>
    <div class="co-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
    <div class="co-row co-row--total"><span>Total</span><span>${formatPrice(total)}</span></div>`;
}
