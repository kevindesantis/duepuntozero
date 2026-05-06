
document.addEventListener('DOMContentLoaded', async () => {
  const data = await getData();

  function renderHome(){
    document.querySelectorAll('[data-phone]').forEach(el => el.textContent = data.settings.phone);
    document.querySelectorAll('[data-wa]').forEach(el => el.href = buildWhatsApp(data.settings, t('waText')));

    const featured = data.items.filter(i => i.featured && i.image).slice(0, 6);
    const grid = document.getElementById('featuredGrid');
    if(grid){
      grid.innerHTML = featured.map(i => `
        <a class="card feature-card" href="menu.html" aria-label="${t('openMenu')}: ${itemLabel(i, 'name')}">
          <img src="${i.image}" alt="${itemLabel(i, 'name')}" loading="lazy">
          <div class="content">
            <div class="eyebrow">${categoryLabel(i.category)}</div>
            <h3>${itemLabel(i, 'name')}</h3>
            <p>${euro(i.price)}</p>
          </div>
        </a>`).join('');
    }

    const wa = document.getElementById('waFloating');
    if(wa) wa.href = buildWhatsApp(data.settings, t('waText'));

    translateStaticPage();
  }

  renderHome();
  window.addEventListener('languagechange', renderHome);
});
