
function dpzImageFallback(label='Duepuntozero'){
  return `<div class="image-fallback">${label}</div>`;
}
function dpzImg(src, alt, cls=''){
  if(!src) return dpzImageFallback('Foto non inserita');
  return `<img src="${src}" alt="${alt}" loading="lazy" class="${cls}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'image-fallback',textContent:'Foto non disponibile'}))">`;
}


let DATA;
let activeCategory = 'Tutto';
let query = '';
let modalItemId = null;
let lastMenuScrollY = 0;
let modalOpenedWithHistory = false;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    DATA = await getData();
  } catch (err) {
    console.error(err);
    document.getElementById('menuContent').innerHTML = '<div class="notice error">Errore caricamento menù. Controlla configurazione Supabase o dati demo.</div>';
    return;
  }

  const phoneText = document.getElementById('phoneText');
  if (phoneText) phoneText.textContent = DATA.settings.phone;

  const wa = document.getElementById('waFloating');
  if (wa) wa.href = buildWhatsApp(DATA.settings, t('waText'));

  renderAll();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      query = e.target.value.toLowerCase();
      renderMenu();
    });
  }

  if (!history.state || history.state.page !== 'menu') {
    history.replaceState({ page: 'menu' }, '', location.pathname + location.search);
  }

  window.addEventListener('popstate', event => {
    const modal = document.getElementById('itemModal');

    if (modal?.classList.contains('open')) {
      closeModal({ fromPopState: true });
      return;
    }

    if (event.state?.modalItemId) {
      openItem(event.state.modalItemId, { fromHistory: true });
    }
  });

  window.addEventListener('languagechange', () => {
    const wa = document.getElementById('waFloating');
    if (wa) wa.href = buildWhatsApp(DATA.settings, t('waText'));
    renderAll();
    if (modalItemId) openItem(modalItemId, { fromHistory: true, keepScroll: true });
  });

  const hashId = decodeURIComponent(location.hash || '').replace('#piatto-', '');
  if (hashId && DATA.items.some(it => it.id === hashId)) {
    setTimeout(() => openItem(hashId, { replaceHistory: true }), 250);
  }
});

function renderAll(){
  translateStaticPage();
  renderStatuses();
  renderTabs();
  renderMenu();
  renderLegend();
}

function renderStatuses() {
  const s = DATA.settings;
  const badges = [];
  if (s.freshFishToday) badges.push(['🐟', t('freshFishToday')]);
  if (s.tastingMenuActive) badges.push(['🍽️', t('tastingMenuActive')]);
  if (s.giroPizzaActive) badges.push(['🍕', t('giroPizzaActive')]);
  if (s.babyMenuActive) badges.push(['🧸', t('babyMenuActive')]);
  document.getElementById('statusBar').innerHTML = badges.map(b => `<span class="badge"><span>${b[0]}</span>${b[1]}</span>`).join('');
}

function safeCategory(c) {
  return String(c).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function renderTabs() {
  const tabs = ['Tutto', ...DATA.categories];
  document.getElementById('tabs').innerHTML = tabs.map(c => {
    const label = c === 'Tutto' ? t('all') : categoryLabel(c);
    return `<button class="tab ${c === activeCategory ? 'active' : ''}" onclick="selectCategory('${safeCategory(c)}')">${label}</button>`;
  }).join('');
}

function selectCategory(category) {
  activeCategory = category;
  renderTabs();
  renderMenu();

  const menuStart = document.getElementById('menuContent');
  if (menuStart) {
    const y = menuStart.getBoundingClientRect().top + window.scrollY - 125;
    window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
  }
}

function itemMatches(it) {
  const q = query.trim();
  if (activeCategory !== 'Tutto' && it.category !== activeCategory) return false;
  if (!q) return true;

  return [
    it.name, it.description, it.ingredients, it.category,
    itemLabel(it, 'name'), itemLabel(it, 'description'), itemLabel(it, 'ingredients'), categoryLabel(it.category)
  ].join(' ').toLowerCase().includes(q);
}

function renderMenu() {
  const wrap = document.getElementById('menuContent');
  const items = DATA.items.filter(itemMatches).filter(it => it.available !== false);
  const cats = activeCategory === 'Tutto' ? DATA.categories : [activeCategory];
  let html = '';

  cats.forEach(cat => {
    const catItems = items.filter(it => it.category === cat);
    if (catItems.length === 0) return;
    html += `<div class="category-heading"><h2>${categoryLabel(cat)}</h2></div><div class="menu-list">`;
    catItems.forEach(it => html += renderItem(it));
    html += `</div>`;
  });

  wrap.innerHTML = html || `<div class="notice">${t('noItems')}</div>`;
}

function renderItem(it) {
  const translatedName = itemLabel(it, 'name');
  const translatedDesc = itemLabel(it, 'description') || itemLabel(it, 'ingredients');

  const img = dpzImg(it.image, translatedName);
  const allergens = (it.allergens || []).map(id => `
    <button class="allergen-chip" title="${allergenLabel(DATA, id)}" onclick="event.stopPropagation(); openItem('${it.id}')">${id}</button>
  `).join('');

  const badges = [
    it.image ? `<span class="badge muted">📷 ${t('photo')}</span>` : '',
    it.fresh_fish ? `<span class="badge muted">🐟 ${t('fish')}</span>` : '',
    it.on_request ? `<span class="badge muted">${t('onRequest')}</span>` : '',
    it.available_today === false ? `<span class="badge off">${t('notToday')}</span>` : ''
  ].filter(Boolean).join('');

  return `<article class="menu-item" onclick="openItem('${it.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter') openItem('${it.id}')">
    <div class="thumb">${img}</div>
    <div class="item-info">
      <h3 class="item-name">${translatedName}</h3>
      <p class="item-desc">${translatedDesc || ''}</p>
      <div class="allergen-row" aria-label="${t('allergens')}">${allergens || `<span class="pill">${t('allergensOnRequest')}</span>`}</div>
      <div class="switch-badges">${badges}</div>
    </div>
    <div class="price">${euro(it.price)}</div>
  </article>`;
}

function openItem(id, options = {}) {
  const it = DATA.items.find(x => x.id === id);
  if (!it) return;

  const modal = document.getElementById('itemModal');
  const modalContent = document.getElementById('modalContent');

  if (!options.keepScroll) lastMenuScrollY = window.scrollY;
  modalItemId = id;

  const translatedName = itemLabel(it, 'name');
  const translatedDescription = itemLabel(it, 'description');
  const translatedIngredients = itemLabel(it, 'ingredients');

  const img = it.image ? dpzImg(it.image, translatedName) : `<div class=\"empty-photo\"><div><strong>Duepuntozero</strong><br>${t('photoMissing')}</div></div>`;

  const allergenList = (it.allergens || []).length
    ? it.allergens.map(id => `<div class="allergen-line"><b class="gold">${id}</b> — ${allergenLabel(DATA, id)}</div>`).join('')
    : `<p>${t('allergensAskStaff')}</p>`;

  modalContent.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-grid">
        <div class="modal-img">${img}</div>
        <div class="modal-body">
          <button class="close" onclick="closeModal()" aria-label="Chiudi">×</button>
          <div class="eyebrow">${categoryLabel(it.category)}</div>
          <h2 id="modalTitle">${translatedName}</h2>
          <div class="price modal-price">${euro(it.price)}</div>
          <p>${translatedDescription || ''}</p>
          <h3>${t('ingredients')}</h3>
          <p>${translatedIngredients || t('staffInfo')}</p>
          <div class="switch-badges">
            ${it.fresh_fish ? `<span class="badge">🐟 ${t('freshFishBadge')}</span>` : ''}
            ${it.on_request ? `<span class="badge">${t('onRequestBadge')}</span>` : ''}
            ${it.available_today === false ? `<span class="badge off">${t('notAvailableToday')}</span>` : ''}
          </div>
          <h3>${t('allergens')}</h3>
          <div class="allergen-list">${allergenList}</div>
          <p class="modal-note">${t('modalAllergenNote')}</p>
        </div>
      </div>
    </div>`;

  modal.classList.add('open');
  lockBodyScroll();

  if (options.fromHistory) {
    modalOpenedWithHistory = true;
  } else if (options.replaceHistory) {
    history.replaceState({ page: 'menu', modalItemId: id }, '', `#piatto-${encodeURIComponent(id)}`);
    modalOpenedWithHistory = true;
  } else {
    history.pushState({ page: 'menu', modalItemId: id }, '', `#piatto-${encodeURIComponent(id)}`);
    modalOpenedWithHistory = true;
  }
}

function closeModal(options = {}) {
  const modal = document.getElementById('itemModal');
  if (!modal) return;

  modal.classList.remove('open');
  modalItemId = null;
  unlockBodyScroll();

  if (!options.fromPopState && modalOpenedWithHistory && history.state?.modalItemId) {
    history.back();
    return;
  }

  if (location.hash.startsWith('#piatto-') && !options.fromPopState) {
    history.replaceState({ page: 'menu' }, '', location.pathname + location.search);
  }

  requestAnimationFrame(() => {
    window.scrollTo({ top: lastMenuScrollY, behavior: 'instant' });
  });

  modalOpenedWithHistory = false;
}

function lockBodyScroll() {
  document.body.dataset.scrollY = String(lastMenuScrollY);
  document.body.style.top = `-${lastMenuScrollY}px`;
  document.body.classList.add('modal-lock');
}

function unlockBodyScroll() {
  const saved = Number(document.body.dataset.scrollY || lastMenuScrollY || 0);
  document.body.classList.remove('modal-lock');
  document.body.style.top = '';
  document.body.removeAttribute('data-scroll-y');
  window.scrollTo({ top: saved, behavior: 'instant' });
}

function renderLegend() {
  document.getElementById('legendGrid').innerHTML = DATA.allergens.map(a => `<div><b>${a.id}</b> ${allergenLabel(DATA, a.id)}</div>`).join('');
}
