/* ============================================================
   PETAL TALES — Shared JavaScript
   Data layer, Cart, Language, Utilities
   ============================================================ */

// ─────────────────────────────────────────────────────────────
// 1. CONFIGURATION
// ─────────────────────────────────────────────────────────────

const PT_CONFIG = {
  // Google Sheets integration
  // Replace SHEET_ID with your actual Google Sheets ID
  // Sheet must be published: File → Share → Publish to Web → CSV
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID',
  // Each tab maps to a CSV endpoint
  SHEETS: {
    products:   'products',
    categories: 'categories',
    settings:   'settings',
  },
  // Toggle between mock data (true) and live Google Sheets (false)
  USE_MOCK: true,
  CURRENCY: 'EGP',
  CURRENCY_SYMBOL: 'ج.م',
};

// ─────────────────────────────────────────────────────────────
// 2. MOCK DATA  (replace with Google Sheets when ready)
// ─────────────────────────────────────────────────────────────

const MOCK_CATEGORIES = [
  { id: 'bouquets',         name_en: 'Bouquets',         name_ar: 'باقات الزهور',    icon: '🌷' },
  { id: 'special',          name_en: 'Special Bouquets', name_ar: 'باقات مميزة',      icon: '✨' },
  { id: 'gift-sets',        name_en: 'Gift Sets',        name_ar: 'طقم هدايا',       icon: '🎁' },
  { id: 'dried-flowers',    name_en: 'Dried Flowers',    name_ar: 'زهور مجففة',      icon: '🌾' },
];

const MOCK_PRODUCTS = [
  {
    id: 'PT001',
    category: 'bouquets',
    name_en: 'Blush Garden Bouquet',
    name_ar: 'باقة الحديقة الوردية',
    desc_en: 'A romantic arrangement of blush tulips, white ranunculus, and baby's breath. Wrapped in our signature petal paper.',
    desc_ar: 'تنسيق رومانسي من الزنبق الوردي والرانونكيلوس الأبيض وزهرة العروس. ملفوفة في ورق البتلة المميز لدينا.',
    price: 450,
    images: ['https://images.unsplash.com/photo-1487530811015-780f2bb27d72?w=600', 'https://images.unsplash.com/photo-1490750967868-88df5691cc04?w=600'],
    badge: 'bestseller',
    inStock: true,
    isSpecial: false,
  },
  {
    id: 'PT002',
    category: 'special',
    name_en: 'Drawn With Love Box',
    name_ar: 'صندوق مرسوم بحب',
    desc_en: 'Our signature bouquet with a custom hand-drawn artwork card. Personalized just for you.',
    desc_ar: 'باقتنا المميزة مع بطاقة فن مرسومة يدويًا ومخصصة لك.',
    price: 850,
    images: ['https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600'],
    badge: 'special',
    inStock: true,
    isSpecial: true,
    options: ['size', 'wrapping', 'note', 'drawing'],
  },
  {
    id: 'PT003',
    category: 'bouquets',
    name_en: 'Peony Dream',
    name_ar: 'حلم الفاوانيا',
    desc_en: 'Lush cream and blush peonies gathered with eucalyptus sprigs and soft ribbon.',
    desc_ar: 'فاوانيا كثيفة كريمية ووردية مع أغصان الأوكالبتوس وشريط ناعم.',
    price: 620,
    images: ['https://images.unsplash.com/photo-1490750967868-88df5691cc04?w=600'],
    badge: 'new',
    inStock: true,
    isSpecial: false,
  },
  {
    id: 'PT004',
    category: 'gift-sets',
    name_en: 'Petals & Pearls Gift Set',
    name_ar: 'طقم الزهور واللؤلؤ',
    desc_en: 'A curated gift box with a mini bouquet, scented candle, and handwritten card.',
    desc_ar: 'صندوق هدايا منتقى بعناية يحتوي على باقة صغيرة وشمعة معطرة وبطاقة بخط اليد.',
    price: 980,
    images: ['https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600'],
    badge: 'special',
    inStock: true,
    isSpecial: false,
  },
  {
    id: 'PT005',
    category: 'dried-flowers',
    name_en: 'Eternal Pampas Vase',
    name_ar: 'مزهرية البامباس الأبدية',
    desc_en: 'Dried pampas grass, bunny tails and strawflowers arranged in a handmade ceramic vase.',
    desc_ar: 'حشيش البامباس المجفف وذيل الأرنب وزهور القش في مزهرية سيراميك مصنوعة يدويًا.',
    price: 750,
    images: ['https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600'],
    badge: null,
    inStock: true,
    isSpecial: false,
  },
  {
    id: 'PT006',
    category: 'special',
    name_en: 'Tulip Love Letter',
    name_ar: 'رسالة حب الزنبق',
    desc_en: 'Wrapped tulips with a custom illustrated love letter. A story told in petals.',
    desc_ar: 'زنابق ملفوفة مع رسالة حب مصورة مخصصة. قصة تُروى في البتلات.',
    price: 1100,
    images: ['https://images.unsplash.com/photo-1487530811015-780f2bb27d72?w=600'],
    badge: 'special',
    inStock: true,
    isSpecial: true,
    options: ['size', 'note', 'drawing', 'deliveryDate'],
  },
];

// ─────────────────────────────────────────────────────────────
// 3. DATA LAYER  (fetches from Google Sheets or mock)
// ─────────────────────────────────────────────────────────────

const DataLayer = {
  /**
   * Fetch products (from Sheets CSV or mock)
   * Google Sheet columns: id, category, name_en, name_ar, desc_en, desc_ar,
   *   price, images (pipe-separated), badge, inStock, isSpecial, options (pipe-sep)
   */
  async getProducts(categoryId = null) {
    let products;
    if (PT_CONFIG.USE_MOCK) {
      products = MOCK_PRODUCTS;
    } else {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${PT_CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=products`;
        const res = await fetch(url);
        const csv = await res.text();
        products = DataLayer._parseCSV(csv);
        // Normalize types
        products = products.map(p => ({
          ...p,
          price: parseFloat(p.price),
          images: p.images ? p.images.split('|') : [],
          options: p.options ? p.options.split('|') : [],
          inStock: p.inStock === 'TRUE' || p.inStock === 'true',
          isSpecial: p.isSpecial === 'TRUE' || p.isSpecial === 'true',
        }));
      } catch (e) {
        console.warn('Sheets fetch failed, using mock data', e);
        products = MOCK_PRODUCTS;
      }
    }
    if (categoryId) products = products.filter(p => p.category === categoryId);
    return products;
  },

  async getProduct(id) {
    const products = await DataLayer.getProducts();
    return products.find(p => p.id === id) || null;
  },

  async getCategories() {
    if (PT_CONFIG.USE_MOCK) return MOCK_CATEGORIES;
    try {
      const url = `https://docs.google.com/spreadsheets/d/${PT_CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=categories`;
      const res = await fetch(url);
      const csv = await res.text();
      return DataLayer._parseCSV(csv);
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  /** Parse a CSV string (first row = headers) into array of objects */
  _parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    return lines.slice(1).map(line => {
      // Handle quoted commas
      const vals = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = (vals[i] || '').replace(/"/g, '').trim();
      });
      return obj;
    });
  },
};

// ─────────────────────────────────────────────────────────────
// 4. CART
// ─────────────────────────────────────────────────────────────

const Cart = {
  STORAGE_KEY: 'pt_cart',

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch { return []; }
  },

  save(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this._updateUI();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: items }));
  },

  add(product, qty = 1, customOptions = {}) {
    const cart = this.get();
    const key = product.id + JSON.stringify(customOptions);
    const existing = cart.find(i => i.key === key);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ key, product, qty, customOptions, addedAt: Date.now() });
    }
    this.save(cart);
    showToast(I18n.t('cart_added', { name: I18n.productName(product) }), '🌷');
  },

  update(key, qty) {
    const cart = this.get();
    const item = cart.find(i => i.key === key);
    if (!item) return;
    if (qty <= 0) { this.remove(key); return; }
    item.qty = qty;
    this.save(cart);
  },

  remove(key) {
    const cart = this.get().filter(i => i.key !== key);
    this.save(cart);
  },

  clear() { this.save([]); },

  count() { return this.get().reduce((s, i) => s + i.qty, 0); },

  subtotal() {
    return this.get().reduce((s, i) => s + (i.product.price * i.qty), 0);
  },

  _updateUI() {
    const count = this.count();
    document.querySelectorAll('.navbar__cart-count').forEach(el => {
      el.textContent = count;
      el.classList.toggle('visible', count > 0);
    });
  },
};

// ─────────────────────────────────────────────────────────────
// 5. INTERNATIONALISATION (i18n)
// ─────────────────────────────────────────────────────────────

const I18n = {
  STORAGE_KEY: 'pt_lang',
  current: 'en',

  strings: {
    en: {
      nav_shop: 'Shop',
      nav_about: 'About',
      nav_contact: 'Contact',
      cart_added: '{{name}} added to cart',
      add_to_cart: 'Add to Cart',
      view_details: 'View Details',
      price_label: 'Price',
      out_of_stock: 'Out of Stock',
      currency: 'EGP',
      search_placeholder: 'Search flowers...',
      all_categories: 'All',
    },
    ar: {
      nav_shop: 'المتجر',
      nav_about: 'من نحن',
      nav_contact: 'تواصل',
      cart_added: 'تمت إضافة {{name}} إلى السلة',
      add_to_cart: 'أضف إلى السلة',
      view_details: 'عرض التفاصيل',
      price_label: 'السعر',
      out_of_stock: 'نفذ من المخزون',
      currency: 'ج.م',
      search_placeholder: 'ابحث عن الزهور...',
      all_categories: 'الكل',
    },
  },

  t(key, vars = {}) {
    let str = this.strings[this.current]?.[key] || this.strings.en[key] || key;
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{{${k}}}`, v);
    });
    return str;
  },

  productName(product) {
    return product[`name_${this.current}`] || product.name_en;
  },
  productDesc(product) {
    return product[`desc_${this.current}`] || product.desc_en;
  },
  categoryName(cat) {
    return cat[`name_${this.current}`] || cat.name_en;
  },

  init() {
    this.current = localStorage.getItem(this.STORAGE_KEY) || 'en';
    this.apply();
  },

  set(lang) {
    this.current = lang;
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.apply();
  },

  apply() {
    const html = document.documentElement;
    html.lang = this.current;
    html.dir = this.current === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('.lang-switcher button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.current);
    });
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const translation = this.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    });
  },
};

// ─────────────────────────────────────────────────────────────
// 6. TOAST NOTIFICATION
// ─────────────────────────────────────────────────────────────

function showToast(message, icon = '✓', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

// ─────────────────────────────────────────────────────────────
// 7. SCROLL REVEAL
// ─────────────────────────────────────────────────────────────

function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

// ─────────────────────────────────────────────────────────────
// 8. NAVBAR
// ─────────────────────────────────────────────────────────────

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Scroll effect
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Cart count
  Cart._updateUI();

  // Burger menu
  const burger = document.querySelector('.navbar__burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Lang switcher
  document.querySelectorAll('.lang-switcher button').forEach(btn => {
    btn.addEventListener('click', () => I18n.set(btn.dataset.lang));
  });
}

// ─────────────────────────────────────────────────────────────
// 9. FORMAT PRICE
// ─────────────────────────────────────────────────────────────

function formatPrice(amount) {
  const symbol = I18n.t('currency');
  if (I18n.current === 'ar') return `${amount.toLocaleString('ar-EG')} ${symbol}`;
  return `${amount.toLocaleString()} ${symbol}`;
}

// ─────────────────────────────────────────────────────────────
// 10. DELIVERY DATE VALIDATION
// ─────────────────────────────────────────────────────────────

function getDeliveryDateBounds() {
  const min = new Date();
  min.setDate(min.getDate() + 7);          // min = today + 7 days
  const max = new Date();
  max.setMonth(max.getMonth() + 3);        // max = today + 3 months
  const fmt = d => d.toISOString().split('T')[0];
  return { min: fmt(min), max: fmt(max) };
}

// ─────────────────────────────────────────────────────────────
// 11. INIT ALL SHARED BEHAVIOUR
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
  initNavbar();
  initScrollReveal();
});
