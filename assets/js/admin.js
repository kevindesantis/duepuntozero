
let DATA;
let currentId = null;
let ADMIN_USER = null;

document.addEventListener('DOMContentLoaded', async () => {
  if(typeof refreshViewStats === 'function') refreshViewStats();

  if(!dpzSupabaseConfigured()){
    showLogin();
    setLoginError('Supabase non risulta configurato. Controlla assets/js/supabase-config.js');
    return;
  }

  ADMIN_USER = await dpzGetUser();
  if(!ADMIN_USER){
    showLogin();
    return;
  }

  await showAdmin();
});

function showStatus(message, type='info'){
  const el = document.getElementById('adminStatus');
  if(!el) return;
  el.style.display = message ? 'block' : 'none';
  el.className = 'notice' + (type === 'error' ? ' error' : '');
  el.innerHTML = message || '';
}

function setLoginError(message){
  const err = document.getElementById('loginError');
  if(err) err.textContent = message || '';
}

function showLogin(){
  document.getElementById('loginPanel').style.display = 'grid';
  document.getElementById('adminApp').style.display = 'none';
}

async function showAdmin(){
  document.getElementById('loginPanel').style.display = 'none';
  document.getElementById('adminApp').style.display = 'grid';

  try{
    DATA = await loadSupabaseData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
  }catch(e){
    document.getElementById('adminApp').style.display = 'none';
    showLogin();
    setLoginError(
      'Errore caricamento Supabase: ' + (e.message || e) +
      '. Controlla di aver eseguito supabase_setup.sql nel SQL Editor.'
    );
    return;
  }

  window.DPZ_CATEGORIES_FULL = DATA.categoriesFull || [];

  const label = document.getElementById('adminUserLabel');
  if(label){
    label.innerHTML = `Connesso a Supabase: <b>${ADMIN_USER?.email || 'gestore'}</b>`;
  }

  showStatus('<strong>Supabase collegato.</strong> Le modifiche salvate da qui aggiornano il menù online.');

  renderSettings();
  renderAdminList();
  renderForm();
  renderQR();

  if(typeof refreshViewStats === 'function') refreshViewStats();
}

async function loginGestore(){
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  setLoginError('');

  try{
    ADMIN_USER = await dpzSignIn(email, password);
    await showAdmin();
  }catch(e){
    setLoginError(e.message || 'Accesso non riuscito.');
  }
}

async function logoutGestore(){
  await dpzSignOut();
  location.reload();
}

async function reloadFromSupabase(){
  DATA = await loadSupabaseData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
  renderSettings();
  renderAdminList();
  if(currentId){
    const fresh = DATA.items.find(i => i.id === currentId);
    if(fresh) renderForm(fresh);
  }
  if(typeof refreshViewStats === 'function') refreshViewStats();
}

function renderSettings(){
  const s = DATA.settings || {};
  document.getElementById('setPhone').value = s.phone || '';
  document.getElementById('setWhatsapp').value = s.whatsapp || '';
  document.getElementById('setAddress').value = s.address || '';
  document.getElementById('setMenuUrl').value = s.menuUrl || '';
  document.getElementById('freshFishToday').checked = !!s.freshFishToday;
  document.getElementById('tastingMenuActive').checked = !!s.tastingMenuActive;
  document.getElementById('giroPizzaActive').checked = !!s.giroPizzaActive;
  document.getElementById('babyMenuActive').checked = !!s.babyMenuActive;
}

async function saveSettings(){
  Object.assign(DATA.settings, {
    phone: document.getElementById('setPhone').value,
    whatsapp: document.getElementById('setWhatsapp').value,
    address: document.getElementById('setAddress').value,
    menuUrl: document.getElementById('setMenuUrl').value,
    freshFishToday: document.getElementById('freshFishToday').checked,
    tastingMenuActive: document.getElementById('tastingMenuActive').checked,
    giroPizzaActive: document.getElementById('giroPizzaActive').checked,
    babyMenuActive: document.getElementById('babyMenuActive').checked,
  });

  try{
    await dpzSaveSettings(DATA.settings);
    await reloadFromSupabase();
    showStatus('<strong>Impostazioni salvate online su Supabase.</strong>');
  }catch(e){
    showStatus(`<strong>Errore salvataggio impostazioni:</strong><br>${escapeHtml(e.message || String(e))}`, 'error');
  }
}

function renderAdminList(){
  const q = (document.getElementById('adminSearch')?.value || '').toLowerCase();
  const list = (DATA.items || []).filter(i => [i.name, i.name_en, i.name_es, i.category].join(' ').toLowerCase().includes(q));

  document.getElementById('adminList').innerHTML = list.map(i => `<div class="admin-row">
    <div><strong>${escapeHtml(i.name)}</strong><br><span class="pill">${escapeHtml(i.category)}</span> <span class="pill">${euro(i.price)}</span> ${i.available_today===false?'<span class="pill danger">non oggi</span>':''}</div>
    <button class="btn small secondary" onclick="editItem('${i.id}')">Modifica</button>
    <button class="btn small secondary danger" onclick="toggleToday('${i.id}')">Oggi</button>
  </div>`).join('');
}

function renderForm(item={}){
  document.getElementById('formTitle').textContent = item.id ? 'Modifica piatto' : 'Nuovo piatto';

  document.getElementById('itemName').value = item.name_it || item.name || '';
  document.getElementById('itemNameEn').value = item.name_en || '';
  document.getElementById('itemNameEs').value = item.name_es || '';

  const categoriesFull = DATA.categoriesFull || window.DPZ_CATEGORIES_FULL || [];
  document.getElementById('itemCategory').innerHTML = categoriesFull.map(c =>
    `<option value="${c.id}" ${item.category_id===c.id || item.category===c.name_it ? 'selected':''}>${c.name_it}</option>`
  ).join('');

  document.getElementById('itemPrice').value = item.price || '';

  document.getElementById('itemDescription').value = item.description_it || item.description || '';
  document.getElementById('itemDescriptionEn').value = item.description_en || '';
  document.getElementById('itemDescriptionEs').value = item.description_es || '';

  document.getElementById('itemIngredients').value = item.ingredients_it || item.ingredients || '';
  document.getElementById('itemIngredientsEn').value = item.ingredients_en || '';
  document.getElementById('itemIngredientsEs').value = item.ingredients_es || '';

  document.getElementById('itemImage').value = item.image || '';
  document.getElementById('itemImageFile').value = '';

  document.getElementById('itemAvailable').checked = item.available !== false;
  document.getElementById('itemToday').checked = item.available_today !== false;
  document.getElementById('itemFresh').checked = !!item.fresh_fish;
  document.getElementById('itemRequest').checked = !!item.on_request;
  document.getElementById('itemFeatured').checked = !!item.featured;

  document.getElementById('allergenChecks').innerHTML = (DATA.allergens || []).map(a =>
    `<label class="check-row"><input type="checkbox" value="${a.id}" ${(item.allergens||[]).includes(Number(a.id))?'checked':''}> <b>${a.id}</b> ${escapeHtml(a.short || a.name)}</label>`
  ).join('');
}

function editItem(id){
  currentId = id;
  const it = DATA.items.find(i => i.id === id);
  renderForm(it);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function newItem(){
  currentId = null;
  renderForm({
    id: null,
    category: DATA.categories?.[0],
    category_id: DATA.categoriesFull?.[0]?.id,
    available: true,
    available_today: true,
    allergens: [],
    sort_order: (DATA.items || []).length + 1
  });
}

function slugify(s){
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-|-$/g,'') || 'nuovo-piatto';
}

function categoryNameFromSelection(value){
  const full = DATA.categoriesFull || window.DPZ_CATEGORIES_FULL || [];
  return full.find(c => c.id === value)?.name_it || value;
}

function buildItemFromForm(){
  const allergens = [...document.querySelectorAll('#allergenChecks input:checked')].map(x => Number(x.value));
  const categoryValue = document.getElementById('itemCategory').value;
  const nameIt = document.getElementById('itemName').value.trim();

  const existing = currentId ? DATA.items.find(i => i.id === currentId) : null;

  return {
    id: currentId || slugify(nameIt) + '-' + Date.now().toString().slice(-4),
    category_id: categoryValue,
    category: categoryNameFromSelection(categoryValue),
    name: nameIt,
    name_it: nameIt,
    name_en: document.getElementById('itemNameEn').value.trim(),
    name_es: document.getElementById('itemNameEs').value.trim(),
    price: document.getElementById('itemPrice').value.trim(),
    description: document.getElementById('itemDescription').value.trim(),
    description_it: document.getElementById('itemDescription').value.trim(),
    description_en: document.getElementById('itemDescriptionEn').value.trim(),
    description_es: document.getElementById('itemDescriptionEs').value.trim(),
    ingredients: document.getElementById('itemIngredients').value.trim(),
    ingredients_it: document.getElementById('itemIngredients').value.trim(),
    ingredients_en: document.getElementById('itemIngredientsEn').value.trim(),
    ingredients_es: document.getElementById('itemIngredientsEs').value.trim(),
    image: document.getElementById('itemImage').value.trim(),
    available: document.getElementById('itemAvailable').checked,
    available_today: document.getElementById('itemToday').checked,
    fresh_fish: document.getElementById('itemFresh').checked,
    on_request: document.getElementById('itemRequest').checked,
    featured: document.getElementById('itemFeatured').checked,
    sort_order: existing?.sort_order ?? (DATA.items || []).length + 1,
    allergens
  };
}

async function saveItem(){
  const item = buildItemFromForm();

  if(!item.name){
    showStatus('<strong>Errore:</strong> inserisci almeno il nome italiano del piatto.', 'error');
    return;
  }

  try{
    await dpzSaveMenuItem(item);
    currentId = item.id;
    await reloadFromSupabase();

    const fresh = DATA.items.find(i => i.id === item.id);
    if(fresh) renderForm(fresh);

    showStatus(`<strong>Piatto salvato online su Supabase:</strong> ${escapeHtml(item.name)}`);
  }catch(e){
    showStatus(
      `<strong>Errore salvataggio piatto:</strong><br>${escapeHtml(e.message || String(e))}<br><br>
      Controlla: <b>supabase_setup.sql</b> eseguito, utente loggato, RLS create.`,
      'error'
    );
  }
}

async function uploadItemImage(){
  const file = document.getElementById('itemImageFile').files?.[0];
  if(!file){
    showStatus('Seleziona prima una foto.', 'error');
    return;
  }

  try{
    const tempItem = buildItemFromForm();
    const itemId = tempItem.id || slugify(tempItem.name);
    const url = await dpzUploadImage(file, itemId);
    document.getElementById('itemImage').value = url;
    showStatus('Foto caricata su Supabase Storage. Ora premi <b>Salva piatto</b>.');
  }catch(e){
    showStatus(`<strong>Errore upload foto:</strong><br>${escapeHtml(e.message || String(e))}`, 'error');
  }
}

async function deleteItem(){
  if(!currentId){
    showStatus('Seleziona prima un piatto.', 'error');
    return;
  }
  if(!confirm('Eliminare questo piatto?')) return;

  try{
    await dpzDeleteMenuItem(currentId);
    currentId = null;
    await reloadFromSupabase();
    renderForm();
    showStatus('Piatto eliminato da Supabase.');
  }catch(e){
    showStatus(`<strong>Errore eliminazione piatto:</strong><br>${escapeHtml(e.message || String(e))}`, 'error');
  }
}

async function toggleToday(id){
  const it = DATA.items.find(i => i.id === id);
  if(!it) return;
  const next = !it.available_today;

  try{
    await dpzToggleAvailableToday(id, next);
    await reloadFromSupabase();
    showStatus('Disponibilità giornaliera aggiornata su Supabase.');
  }catch(e){
    showStatus(`<strong>Errore disponibilità:</strong><br>${escapeHtml(e.message || String(e))}`, 'error');
  }
}

function exportJson(){
  const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'duepuntozero-menu-export.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function resetDemo(){
  if(!confirm('Ricaricare dati da Supabase e svuotare la cache locale?')) return;
  localStorage.removeItem(STORAGE_KEY);
  await reloadFromSupabase();
  renderForm();
}

function renderQR(){
  const el = document.getElementById('qrUrl');
  if(el) el.textContent = DATA.settings?.menuUrl || location.origin + location.pathname.replace('gestione-riservata.html','menu.html');
}

function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  }[ch]));
}
