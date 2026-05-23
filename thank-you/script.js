/* ============================================================
   PETAL TALES — Thank You Script
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('');
  renderFooter();

  const order = JSON.parse(localStorage.getItem('pt_last_order') || 'null');
  const box   = document.getElementById('tyOrderBox');
  if (!box) return;

  if (order) {
    box.innerHTML = `
      <div class="ty-order-row"><span>Order ID</span><strong>${order.id}</strong></div>
      <div class="ty-order-row"><span>Customer</span><strong>${order.customer.firstName} ${order.customer.lastName}</strong></div>
      <div class="ty-order-row"><span>Email</span><strong>${order.customer.email}</strong></div>
      <div class="ty-order-row"><span>Shipping</span><strong style="text-transform:capitalize">${order.shipping}</strong></div>
      <div class="ty-order-row"><span>Total Paid</span><strong>${formatPrice(order.total)}</strong></div>`;
  } else {
    box.innerHTML = `<div class="ty-order-row"><span>Your order has been received!</span></div>`;
  }
});
