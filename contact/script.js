/* ============================================================
   PETAL TALES — Contact Page Script
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('contact');
  renderFooter();

  const form    = document.getElementById('contactForm');
  const success = document.getElementById('contactSuccess');
  const reset   = document.getElementById('resetContactForm');

  form?.addEventListener('submit', e => {
    e.preventDefault();

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(el => {
      const empty = !el.value.trim();
      el.style.borderColor = empty ? '#c0392b' : '';
      if (empty) valid = false;
    });

    if (!valid) { showToast('Please fill all required fields ⚠', '⚠'); return; }

    const btn = form.querySelector('.contact-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    // Simulate sending (replace with real API call)
    setTimeout(() => {
      form.style.display = 'none';
      success.hidden = false;
      showToast('Message sent! 🌷');
    }, 1200);
  });

  reset?.addEventListener('click', () => {
    form.reset();
    form.style.display = 'block';
    success.hidden = true;
    const btn = form.querySelector('.contact-submit');
    if (btn) { btn.innerHTML = '<span>Send Message</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'; btn.disabled = false; }
  });
});
