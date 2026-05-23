/* ============================================================
   PETAL TALES — Shop Page Script
   ============================================================ */

let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentPage = 1;
const PER_PAGE = 9;
let viewMode = 'grid';
let searchQuery = '';
let sortMode = 'default';
let priceMin = 0, priceMax = 2000;
let inStockOnly = true;

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('shop');
  renderFooter();

  // Read URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get('cat')) currentCategory = params.get('cat');

  allProducts = await DataLayer.getProducts();
  await buildSidebar();
  buildCatPills();
  applyFilters();
  bindEvents();
});

/* ── Build Sidebar ──────────────────────────────────────── */
async function buildSidebar() {
  const cats = await DataLayer.getCategories();
  const ul   = document.getElementById('sidebarCats');
  if (!ul) return;

  const allLi = document.createElement('li');
  allLi.innerHTML = `
    <button class="sidebar__cat ${currentCategory==='all'?'active':''}" data-cat="all">
      <span>All Flowers</span>
      <span class="sidebar__cat-count">${allProducts.length}</span>
    </button>`;
  ul.appendChild(allLi);

  cats.forEach(cat => {
    const count = allProducts.filter(p => p.category === cat.id).length;
    const li = document.createElement('li');
    li.innerHTML = `
      <button class="sidebar__cat ${currentCategory===cat.id?'active':''}" data-cat="${cat.id}">
        <span>${cat.icon} ${I18n.categoryName(cat)}</span>
        <span class="sidebar__cat-count">${count}</span>
      </button>`;
    ul.appendChild(li);
  });

  ul.addEventListener('click', e => {
    const btn = e.target.closest('.sidebar__cat');
    if (!btn) return;
    currentCategory = btn.dataset.cat;
    currentPage = 1;
    ul.querySelectorAll('.sidebar__cat').forEach(b => b.classList.toggle('active', b === btn));
    syncCatPills();
    applyFilters();
  });
}

/* ── Category Pills ─────────────────────────────────────── */
async function buildCatPills() {
  const cats = await DataLayer.getCategories();
  const wrap = document.getElementById('catPills');
  if (!wrap) return;

  const allPill = document.createElement('button');
  allPill.className = `cat-pill ${currentCategory==='all'?'active':''}`;
  allPill.dataset.cat = 'all';
  allPill.textContent = 'All';
  wrap.appendChild(allPill);

  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `cat-pill ${currentCategory===cat.id?'active':''}`;
    btn.dataset.cat = cat.id;
    btn.textContent = `${cat.icon} ${I18n.categoryName(cat)}`;
    wrap.appendChild(btn);
  });

  wrap.addEventListener('click', e => {
    const pill = e.target.closest('.cat-pill');
    if (!pill) return;
    currentCategory = pill.dataset.cat;
    currentPage = 1;
    wrap.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p === pill));
    syncSidebarCats();
    applyFilters();
  });
}

function syncCatPills() {
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === currentCategory));
}
function syncSidebarCats() {
  document.querySelectorAll('.sidebar__cat').forEach(b => b.classList.toggle('active', b.dataset.cat === currentCategory));
}

/* ── Filter + Sort ──────────────────────────────────────── */
function applyFilters() {
  let products = [...allProducts];

  if (currentCategory !== 'all') products = products.filter(p => p.category === currentCategory);
  if (inStockOnly) products = products.filter(p => p.inStock);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    products = products.filter(p =>
      (p.name_en || '').toLowerCase().includes(q) ||
      (p.name_ar || '').toLowerCase().includes(q) ||
      (p.desc_en || '').toLowerCase().includes(q)
    );
  }
  products = products.filter(p => p.price >= priceMin && p.price <= priceMax);

  // Sort
  if (sortMode === 'price-asc')  products.sort((a,b) => a.price - b.price);
  if (sortMode === 'price-desc') products.sort((a,b) => b.price - a.price);
  if (sortMode === 'name')       products.sort((a,b) => (a.name_en||'').localeCompare(b.name_en||''));

  filteredProducts = products;
  renderProducts();
  renderPagination();
  updateCount();
}

/* ── Render Products ────────────────────────────────────── */
function renderProducts() {
  const grid  = document.getElementById('productsGrid');
  const empty = document.getElementById('shopEmpty');
  if (!grid) return;

  if (filteredProducts.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  const start = (currentPage - 1) * PER_PAGE;
  const page  = filteredProducts.slice(start, start + PER_PAGE);

  grid.className = `products-grid ${viewMode === 'list' ? 'list-view' : ''}`;
  grid.innerHTML = '';

  page.forEach((product, i) => {
    const card = buildProductCard(product, i);
    grid.appendChild(card);
  });

  initScrollReveal();
  window.scrollTo({ top: document.querySelector('.shop-layout')?.offsetTop - 100 || 0, behavior: 'smooth' });
}

function buildProductCard(product, delay) {
  const name = I18n.productName(product);
  const desc = I18n.productDesc(product);
  const img  = (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1487530811015-780f2bb27d72?w=600';
  const badge = product.badge
    ? `<span class="product-card__badge product-card__badge--${product.badge === 'special' ? 'special' : 'new'}">${product.badge}</span>`
    : '';

  const art = document.createElement('article');
  art.className = 'product-card';
  art.setAttribute('data-reveal', '');
  art.setAttribute('data-reveal-delay', delay % 4);
  art.setAttribute('role', 'listitem');
  art.innerHTML = `
    <div class="product-card__image-wrap">
      <img src="${img}" alt="${name}" loading="lazy" width="400" height="500"/>
      ${badge}
    </div>
    <div class="product-card__body">
      <h3 class="product-card__name">${name}</h3>
      <p class="product-card__desc">${(desc||'').substring(0, 80)}…</p>
      <div class="product-card__footer">
        <span class="product-card__price">${formatPrice(product.price)}</span>
        <button class="product-card__add" aria-label="Add to cart" data-id="${product.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>`;

  art.querySelector('.product-card__image-wrap').addEventListener('click', () => {
    window.location.href = `../product/index.html?id=${product.id}`;
  });
  art.querySelector('.product-card__add').addEventListener('click', e => {
    e.stopPropagation();
    Cart.add(product);
  });
  return art;
}

/* ── Pagination ─────────────────────────────────────────── */
function renderPagination() {
  const wrap = document.getElementById('shopPagination');
  if (!wrap) return;
  const total = Math.ceil(filteredProducts.length / PER_PAGE);
  if (total <= 1) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = '';
  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.innerHTML = '‹';
  prev.disabled = currentPage === 1;
  prev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderProducts(); renderPagination(); } });
  wrap.appendChild(prev);

  for (let i = 1; i <= total; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => { currentPage = i; renderProducts(); renderPagination(); });
    wrap.appendChild(btn);
  }

  const next = document.createElement('button');
  next.className = 'page-btn';
  next.innerHTML = '›';
  next.disabled = currentPage === total;
  next.addEventListener('click', () => { if (currentPage < total) { currentPage++; renderProducts(); renderPagination(); } });
  wrap.appendChild(next);
}

function updateCount() {
  const el = document.getElementById('shopCount');
  if (el) el.textContent = `${filteredProducts.length} items`;
}

/* ── Event Bindings ─────────────────────────────────────── */
function bindEvents() {
  // Search
  let searchTimer;
  const searchInput = document.getElementById('shopSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = searchInput.value.trim();
        currentPage = 1;
        applyFilters();
      }, 300);
    });
  }

  // Sort
  const sortEl = document.getElementById('shopSort');
  if (sortEl) sortEl.addEventListener('change', () => { sortMode = sortEl.value; currentPage = 1; applyFilters(); });

  // Price filter
  document.getElementById('applyPrice')?.addEventListener('click', () => {
    priceMin = parseInt(document.getElementById('priceMin')?.value || 0);
    priceMax = parseInt(document.getElementById('priceMax')?.value || 2000);
    currentPage = 1; applyFilters();
  });

  // In stock
  document.getElementById('inStockOnly')?.addEventListener('change', e => {
    inStockOnly = e.target.checked; currentPage = 1; applyFilters();
  });

  // View toggle
  document.querySelectorAll('.view-toggle__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      viewMode = btn.dataset.view;
      document.querySelectorAll('.view-toggle__btn').forEach(b => b.classList.toggle('active', b === btn));
      renderProducts();
    });
  });

  // Mobile filter toggle
  const filterToggle = document.getElementById('filterToggle');
  const sidebar = document.getElementById('shopSidebar');
  if (filterToggle && sidebar) {
    filterToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!sidebar.contains(e.target) && !filterToggle.contains(e.target)) sidebar.classList.remove('open');
    });
  }

  // Reset filters
  document.getElementById('resetFilters')?.addEventListener('click', () => {
    currentCategory = 'all'; searchQuery = ''; sortMode = 'default';
    priceMin = 0; priceMax = 2000; inStockOnly = true; currentPage = 1;
    if (document.getElementById('shopSearch')) document.getElementById('shopSearch').value = '';
    if (document.getElementById('shopSort'))   document.getElementById('shopSort').value   = 'default';
    if (document.getElementById('inStockOnly'))document.getElementById('inStockOnly').checked = true;
    syncCatPills(); syncSidebarCats(); applyFilters();
  });
}
