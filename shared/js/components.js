/* ============================================================
   PETAL TALES — Shared HTML Components (rendered via JS)
   ============================================================ */

/**
 * Detect the absolute base URL of the site root by looking at
 * where this script file (components.js) lives.
 * components.js is always at {ROOT}/shared/js/components.js
 * So ROOT = everything before "/shared/js/components.js"
 *
 * This works correctly regardless of:
 *  - How deep the current page is nested
 *  - Whether the site is at the domain root or a subfolder (e.g. /Petal-Tales/)
 */
function _getBase() {
  const scripts = document.querySelectorAll('script[src]');
  for (const s of scripts) {
    if (s.src.includes('/shared/js/components.js')) {
      // e.g. https://comfyclouds.github.io/Petal-Tales/shared/js/components.js
      // → base = https://comfyclouds.github.io/Petal-Tales/
      return s.src.replace('/shared/js/components.js', '') + '/';
    }
  }
  // Fallback: use relative path (works for local file:// testing)
  const depth = window.location.pathname.split('/').filter(Boolean).length - 1;
  return depth > 0 ? '../'.repeat(depth) : './';
}

/**
 * Render the navbar into #navbar-placeholder.
 * @param {string} activePage - 'shop' | 'contact' | ''
 */
function renderNavbar(activePage = '') {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  const B = _getBase();

  placeholder.innerHTML = `
    <nav class="navbar" role="navigation" aria-label="Main navigation">
      <div class="container">
        <div class="navbar__inner">

          <a href="${B}landing/index.html" class="navbar__logo" aria-label="Petal Tales Home">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M14 24V14" stroke="#3A2428" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M14 14C14 14 10 12 10 8C10 5.8 11.8 4 14 4C16.2 4 18 5.8 18 8C18 12 14 14 14 14Z" fill="#DB96A1" stroke="#3A2428" stroke-width="1"/>
              <path d="M10 10C10 10 7 9 7 6.5C7 4.5 8.5 3 10.5 3C11.5 3 12.3 3.4 13 4" fill="#F9C5D1" stroke="#3A2428" stroke-width="0.8"/>
              <path d="M18 10C18 10 21 9 21 6.5C21 4.5 19.5 3 17.5 3C16.5 3 15.7 3.4 15 4" fill="#F9C5D1" stroke="#3A2428" stroke-width="0.8"/>
              <path d="M11 24C11 24 10 19 12 17" stroke="#7A9E7E" stroke-width="1" stroke-linecap="round"/>
              <path d="M17 24C17 24 18 19 16 17" stroke="#7A9E7E" stroke-width="1" stroke-linecap="round"/>
            </svg>
            Petal Tales
          </a>

          <ul class="navbar__nav" role="list">
            <li><a href="${B}shop/index.html" class="${activePage === 'shop' ? 'active' : ''}" data-i18n="nav_shop">Shop</a></li>
            <li><a href="${B}landing/index.html#about" data-i18n="nav_about">About</a></li>
            <li><a href="${B}contact/index.html" class="${activePage === 'contact' ? 'active' : ''}" data-i18n="nav_contact">Contact</a></li>
          </ul>

          <div class="navbar__actions">
            <div class="lang-switcher" role="group" aria-label="Language">
              <button data-lang="en" class="active">EN</button>
              <button data-lang="ar">ع</button>
            </div>

            <button class="navbar__icon-btn" aria-label="Search" onclick="toggleSearch()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>

            <a href="${B}cart/index.html" class="navbar__icon-btn" aria-label="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span class="navbar__cart-count" aria-live="polite">0</span>
            </a>

            <button class="navbar__burger" aria-label="Toggle menu" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <a href="${B}shop/index.html" data-i18n="nav_shop">Shop</a>
      <a href="${B}landing/index.html#about" data-i18n="nav_about">About</a>
      <a href="${B}contact/index.html" data-i18n="nav_contact">Contact</a>
      <div class="lang-switcher" style="margin-top:1rem">
        <button data-lang="en">EN</button>
        <button data-lang="ar">ع</button>
      </div>
    </div>
  `;

  // initNavbar runs on DOMContentLoaded in main.js — before renderNavbar is called —
  // so we call it again here now that the navbar HTML actually exists.
  if (typeof initNavbar === 'function') initNavbar();
}

/**
 * Render the footer into #footer-placeholder.
 */
function renderFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  const B = _getBase();

  placeholder.innerHTML = `
    <footer class="footer" role="contentinfo">
      <div class="container">
        <div class="footer__grid">
          <div>
            <div class="footer__brand-name">Petal Tales</div>
            <div class="footer__tagline">"Drawn with love... just for you"</div>
            <p class="footer__desc" data-i18n-block="footer_desc">
              We craft floral stories that speak the language of the heart.
              Every bouquet is a chapter, every petal a word.
            </p>
            <div class="footer__socials">
              <a href="#" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="TikTok">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.87a8.18 8.18 0 004.78 1.52V6.96a4.84 4.84 0 01-1.01-.27z"/></svg>
              </a>
              <a href="#" aria-label="WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 class="footer__col-title">Shop</h4>
            <ul class="footer__links">
              <li><a href="${B}shop/index.html?cat=bouquets">Bouquets</a></li>
              <li><a href="${B}shop/index.html?cat=special">Special Bouquets</a></li>
              <li><a href="${B}shop/index.html?cat=gift-sets">Gift Sets</a></li>
              <li><a href="${B}shop/index.html?cat=dried-flowers">Dried Flowers</a></li>
            </ul>
          </div>

          <div>
            <h4 class="footer__col-title">Help</h4>
            <ul class="footer__links">
              <li><a href="${B}contact/index.html">Contact Us</a></li>
              <li><a href="${B}legal/shipping/index.html">Delivery &amp; Shipping</a></li>
              <li><a href="${B}legal/tos/index.html">Terms of Service</a></li>
              <li><a href="${B}legal/privacy/index.html">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 class="footer__col-title">Reach Us</h4>
            <ul class="footer__links">
              <li><a href="mailto:hello@petaltales.com">hello@petaltales.com</a></li>
              <li><a href="tel:+201234567890">+20 123 456 7890</a></li>
              <li style="color:rgba(255,251,252,0.4);font-size:0.8rem;margin-top:8px">Cairo, Egypt</li>
            </ul>
          </div>
        </div>

        <div class="footer__bottom">
          <span>© ${new Date().getFullYear()} Petal Tales. All rights reserved.</span>
          <div class="footer__legal">
            <a href="${B}legal/tos/index.html">Terms</a>
            <a href="${B}legal/privacy/index.html">Privacy</a>
            <a href="${B}legal/shipping/index.html">Shipping</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}
