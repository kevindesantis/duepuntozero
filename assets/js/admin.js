
let DATA;
let currentId = null;
let ADMIN_USER = null;


const DPZ_CATEGORY_TRANSLATIONS_AUTO = {
  en: {
    'antipasti': 'Starters',
    'primi': 'First courses',
    'secondi': 'Main courses',
    'pizze - le piu richieste': 'Pizzas - Most requested',
    'pizze - le più richieste': 'Pizzas - Most requested',
    'pizze - specialita': 'Specialty pizzas',
    'pizze - specialità': 'Specialty pizzas',
    'pizze - classiche': 'Classic pizzas',
    'pizze - bianche': 'White pizzas',
    'pizze - fredde': 'Cold pizzas',
    'calzoni': 'Calzones',
    'rosticceria': 'Fried snacks',
    'menu speciali': 'Special menus',
    'menù speciali': 'Special menus',
    'dessert': 'Desserts',
    'bevande': 'Drinks',
    'vini': 'Wines',
    'birre': 'Beers',
    'amari e distillati': 'Digestifs & spirits'
  },
  es: {
    'antipasti': 'Entrantes',
    'primi': 'Primeros platos',
    'secondi': 'Segundos platos',
    'pizze - le piu richieste': 'Pizzas - Las más pedidas',
    'pizze - le più richieste': 'Pizzas - Las más pedidas',
    'pizze - specialita': 'Pizzas especiales',
    'pizze - specialità': 'Pizzas especiales',
    'pizze - classiche': 'Pizzas clásicas',
    'pizze - bianche': 'Pizzas blancas',
    'pizze - fredde': 'Pizzas frías',
    'calzoni': 'Calzones',
    'rosticceria': 'Fritos y aperitivos',
    'menu speciali': 'Menús especiales',
    'menù speciali': 'Menús especiales',
    'dessert': 'Postres',
    'bevande': 'Bebidas',
    'vini': 'Vinos',
    'birre': 'Cervezas',
    'amari e distillati': 'Amargos y destilados'
  }
};

const DPZ_TRANSLATION_REPLACEMENTS = {
  en: [
    ['pizza bianca', 'white pizza'],
    ['pizza fredda', 'cold pizza'],
    ['quattro formaggi', 'four cheeses'],
    ['fior di latte', 'fior di latte mozzarella'],
    ['mozzarella senza lattosio', 'lactose-free mozzarella'],
    ['mozzarella di bufala', 'buffalo mozzarella'],
    ['bufala fresca', 'fresh buffalo mozzarella'],
    ['pomodorini gialli semidried', 'semi-dried yellow cherry tomatoes'],
    ['pomodorini gialli', 'yellow cherry tomatoes'],
    ['pomodorini', 'cherry tomatoes'],
    ['pomodoro', 'tomato'],
    ['prosciutto crudo', 'cured ham'],
    ['prosciutto cotto', 'ham'],
    ['crudo', 'cured ham'],
    ['cotto', 'ham'],
    ['bresaola punta d’anca', 'bresaola punta d’anca'],
    ["bresaola punta d'anca", 'bresaola punta d’anca'],
    ['cipolla caramellata', 'caramelized onion'],
    ['cipolla', 'onion'],
    ['melanzane fritte', 'fried aubergines'],
    ['zucchine fritte', 'fried courgettes'],
    ['melanzane', 'aubergines'],
    ['zucchine', 'courgettes'],
    ['crema di pistacchio', 'pistachio cream'],
    ['granella di pistacchio', 'chopped pistachios'],
    ['pistacchio', 'pistachio'],
    ['scaglie di grana', 'Grana flakes'],
    ['grana', 'Grana cheese'],
    ['gorgonzola', 'gorgonzola'],
    ['emmental', 'emmental'],
    ['formaggio', 'cheese'],
    ['formaggi', 'cheeses'],
    ['salame piccante', 'spicy salami'],
    ['salsiccia', 'sausage'],
    ['pancetta', 'pancetta'],
    ['mortadella', 'mortadella'],
    ['rucola', 'rocket'],
    ['basilico', 'basil'],
    ['prezzemolo', 'parsley'],
    ['aglio', 'garlic'],
    ['origano', 'oregano'],
    ['olive nere', 'black olives'],
    ['olive', 'olives'],
    ['acciughe', 'anchovies'],
    ['alici', 'anchovies'],
    ['tonno', 'tuna'],
    ['funghi', 'mushrooms'],
    ['carciofi', 'artichokes'],
    ['zucca', 'pumpkin'],
    ['polpo', 'octopus'],
    ['calamari', 'calamari'],
    ['gambero rosso', 'red prawn'],
    ['gamberi', 'prawns'],
    ['gambero', 'prawn'],
    ['cozze', 'mussels'],
    ['vongole', 'clams'],
    ['cernia', 'grouper'],
    ['ricciola', 'amberjack'],
    ['spada', 'swordfish'],
    ['pesce', 'fish'],
    ['patatine', 'fries'],
    ['patate', 'potatoes'],
    ['croccanti', 'crispy'],
    ['fritte', 'fried'],
    ['fritti', 'fried'],
    ['fritto', 'fried'],
    ['alla griglia', 'grilled'],
    ['al forno', 'baked'],
    ['senza glutine', 'gluten-free'],
    ['senza lattosio', 'lactose-free'],
    ['olio evo', 'extra virgin olive oil'],
    ['olio extra vergine di oliva', 'extra virgin olive oil'],
    ['olio', 'oil'],
    ['latte', 'milk'],
    ['uova', 'eggs'],
    ['farina', 'flour'],
    ['pangrattato', 'breadcrumbs'],
    ['su richiesta', 'on request'],
    ['disponibile', 'available'],
    ['rigorosamente preparato dal nostro chef', 'carefully prepared by our chef'],
    ['ai quattro formaggi', 'with four cheeses'],
    ['al momento', 'made to order'],
    ['fresco', 'fresh'],
    ['fresca', 'fresh'],
    ['selezionata', 'selected'],
    ['selezionate', 'selected']
  ],
  es: [
    ['pizza bianca', 'pizza blanca'],
    ['pizza fredda', 'pizza fría'],
    ['quattro formaggi', 'cuatro quesos'],
    ['fior di latte', 'mozzarella fior di latte'],
    ['mozzarella senza lattosio', 'mozzarella sin lactosa'],
    ['mozzarella di bufala', 'mozzarella de búfala'],
    ['bufala fresca', 'búfala fresca'],
    ['pomodorini gialli semidried', 'tomatitos amarillos semisecos'],
    ['pomodorini gialli', 'tomatitos amarillos'],
    ['pomodorini', 'tomatitos'],
    ['pomodoro', 'tomate'],
    ['prosciutto crudo', 'jamón crudo'],
    ['prosciutto cotto', 'jamón cocido'],
    ['crudo', 'jamón crudo'],
    ['cotto', 'jamón cocido'],
    ['bresaola punta d’anca', 'bresaola punta d’anca'],
    ["bresaola punta d'anca", 'bresaola punta d’anca'],
    ['cipolla caramellata', 'cebolla caramelizada'],
    ['cipolla', 'cebolla'],
    ['melanzane fritte', 'berenjenas fritas'],
    ['zucchine fritte', 'calabacines fritos'],
    ['melanzane', 'berenjenas'],
    ['zucchine', 'calabacines'],
    ['crema di pistacchio', 'crema de pistacho'],
    ['granella di pistacchio', 'granillo de pistacho'],
    ['pistacchio', 'pistacho'],
    ['scaglie di grana', 'lascas de Grana'],
    ['grana', 'queso Grana'],
    ['gorgonzola', 'gorgonzola'],
    ['emmental', 'emmental'],
    ['formaggio', 'queso'],
    ['formaggi', 'quesos'],
    ['salame piccante', 'salame picante'],
    ['salsiccia', 'salchicha'],
    ['pancetta', 'panceta'],
    ['mortadella', 'mortadela'],
    ['rucola', 'rúcula'],
    ['basilico', 'albahaca'],
    ['prezzemolo', 'perejil'],
    ['aglio', 'ajo'],
    ['origano', 'orégano'],
    ['olive nere', 'aceitunas negras'],
    ['olive', 'aceitunas'],
    ['acciughe', 'anchoas'],
    ['alici', 'anchoas'],
    ['tonno', 'atún'],
    ['funghi', 'champiñones'],
    ['carciofi', 'alcachofas'],
    ['zucca', 'calabaza'],
    ['polpo', 'pulpo'],
    ['calamari', 'calamares'],
    ['gambero rosso', 'gamba roja'],
    ['gamberi', 'gambas'],
    ['gambero', 'gamba'],
    ['cozze', 'mejillones'],
    ['vongole', 'almejas'],
    ['cernia', 'mero'],
    ['ricciola', 'serviola'],
    ['spada', 'pez espada'],
    ['pesce', 'pescado'],
    ['patatine', 'patatas fritas'],
    ['patate', 'patatas'],
    ['croccanti', 'crujientes'],
    ['fritte', 'fritas'],
    ['fritti', 'fritos'],
    ['fritto', 'frito'],
    ['alla griglia', 'a la parrilla'],
    ['al forno', 'al horno'],
    ['senza glutine', 'sin gluten'],
    ['senza lattosio', 'sin lactosa'],
    ['olio evo', 'aceite de oliva virgen extra'],
    ['olio extra vergine di oliva', 'aceite de oliva virgen extra'],
    ['olio', 'aceite'],
    ['latte', 'leche'],
    ['uova', 'huevos'],
    ['farina', 'harina'],
    ['pangrattato', 'pan rallado'],
    ['su richiesta', 'bajo petición'],
    ['disponibile', 'disponible'],
    ['rigorosamente preparato dal nostro chef', 'preparado cuidadosamente por nuestro chef'],
    ['ai quattro formaggi', 'con cuatro quesos'],
    ['al momento', 'hecho al momento'],
    ['fresco', 'fresco'],
    ['fresca', 'fresca'],
    ['selezionata', 'seleccionada'],
    ['selezionate', 'seleccionadas']
  ]
};

function normalizeTranslationKey(text){
  return String(text || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,' ');
}

function escapeRegExp(str){
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function smartTranslateText(text, lang, mode='text'){
  const original = String(text || '').trim();
  if(!original) return '';

  const normalizedExact = normalizeTranslationKey(original);
  if(mode === 'category'){
    const direct = DPZ_CATEGORY_TRANSLATIONS_AUTO[lang]?.[normalizedExact] || DPZ_CATEGORY_TRANSLATIONS_AUTO[lang]?.[original.toLowerCase()];
    if(direct) return direct;
  }

  let out = original;
  const list = [...(DPZ_TRANSLATION_REPLACEMENTS[lang] || [])].sort((a,b)=>b[0].length-a[0].length);
  list.forEach(([it, translated]) => {
    out = out.replace(new RegExp(escapeRegExp(it), 'gi'), translated);
  });

  if(mode === 'category'){
    out = out
      .replace(/\bPizze\b/gi, lang === 'en' ? 'Pizzas' : 'Pizzas')
      .replace(/\bPizza\b/gi, lang === 'en' ? 'Pizza' : 'Pizza')
      .replace(/\bSpecialita\b/gi, lang === 'en' ? 'Specialties' : 'Especialidades')
      .replace(/\bSpecialità\b/gi, lang === 'en' ? 'Specialties' : 'Especialidades')
      .replace(/\bClassiche\b/gi, lang === 'en' ? 'Classic' : 'Clásicas')
      .replace(/\bBianche\b/gi, lang === 'en' ? 'White' : 'Blancas')
      .replace(/\bFredde\b/gi, lang === 'en' ? 'Cold' : 'Frías');
  }

  return out;
}

function autoFillTranslations(force=false){
  // Versione v19: non ci sono più campi EN/ES visibili.
  // Le traduzioni vengono generate automaticamente al salvataggio.
  if(force) showStatus('<strong>Traduzione automatica attiva.</strong> Ora devi scrivere solo in italiano.');
}

function translateCategoryAuto(nameIt, lang){
  return smartTranslateText(nameIt, lang, 'category');
}



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
  renderCategoryManager();
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
  renderCategoryManager();
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


function renderCategoryManager(){
  const el = document.getElementById('categoryList');
  if(!el) return;

  const full = DATA.categoriesFull || [];
  el.innerHTML = full.map(c => `<div class="admin-row">
    <div>
      <strong>${escapeHtml(c.name_it)}</strong><br>
      <span class="pill">EN: ${escapeHtml(c.name_en || translateCategoryAuto(c.name_it, 'en'))}</span>
      <span class="pill">ES: ${escapeHtml(c.name_es || translateCategoryAuto(c.name_it, 'es'))}</span>
    </div>
  </div>`).join('');
}

async function saveNewCategory(){
  const input = document.getElementById('newCategoryName');
  const nameIt = input?.value.trim();

  if(!nameIt){
    showStatus('<strong>Errore:</strong> scrivi il nome italiano della nuova categoria.', 'error');
    return;
  }

  const full = DATA.categoriesFull || [];
  const id = slugify(nameIt);
  const maxOrder = full.reduce((max, c) => Math.max(max, Number(c.sort_order || 0)), 0);

  const category = {
    id,
    name_it: nameIt,
    name_en: translateCategoryAuto(nameIt, 'en'),
    name_es: translateCategoryAuto(nameIt, 'es'),
    sort_order: maxOrder + 1,
    active: true
  };

  try{
    await dpzSaveCategory(category);
    if(input) input.value = '';
    await reloadFromSupabase();

    const select = document.getElementById('itemCategory');
    if(select) select.value = id;

    showStatus(`<strong>Categoria creata:</strong> ${escapeHtml(nameIt)}<br>Traduzioni automatiche: EN “${escapeHtml(category.name_en)}”, ES “${escapeHtml(category.name_es)}”.`);
  }catch(e){
    showStatus(`<strong>Errore creazione categoria:</strong><br>${escapeHtml(e.message || String(e))}`, 'error');
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
  const isEdit = !!item.id;
  document.getElementById('formTitle').textContent = isEdit ? 'Modifica piatto' : 'Aggiungi nuovo piatto';
  const saveBtn = document.getElementById('saveItemButton');
  if(saveBtn) saveBtn.textContent = isEdit ? 'Salva modifiche' : 'Crea nuovo piatto';

  document.getElementById('itemName').value = item.name_it || item.name || '';

  const categoriesFull = DATA.categoriesFull || window.DPZ_CATEGORIES_FULL || [];
  document.getElementById('itemCategory').innerHTML = categoriesFull.map(c =>
    `<option value="${c.id}" ${item.category_id===c.id || item.category===c.name_it ? 'selected':''}>${c.name_it}</option>`
  ).join('');

  document.getElementById('itemPrice').value = item.price || '';

  document.getElementById('itemDescription').value = item.description_it || item.description || '';

  document.getElementById('itemIngredients').value = item.ingredients_it || item.ingredients || '';

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
  showStatus('<strong>Nuovo piatto pronto.</strong> Compila nome, categoria, prezzo, ingredienti/allergeni e premi <b>Crea nuovo piatto</b>.');
  const nameInput = document.getElementById('itemName');
  if(nameInput) nameInput.focus();
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
  autoFillTranslations(false);

  const allergens = [...document.querySelectorAll('#allergenChecks input:checked')].map(x => Number(x.value));
  const categoryValue = document.getElementById('itemCategory').value;
  const nameIt = document.getElementById('itemName').value.trim();
  const descriptionIt = document.getElementById('itemDescription').value.trim();
  const ingredientsIt = document.getElementById('itemIngredients').value.trim();

  const existing = currentId ? DATA.items.find(i => i.id === currentId) : null;

  return {
    id: currentId || slugify(nameIt) + '-' + Date.now().toString().slice(-4),
    category_id: categoryValue,
    category: categoryNameFromSelection(categoryValue),
    name: nameIt,
    name_it: nameIt,
    name_en: smartTranslateText(nameIt, 'en', 'name'),
    name_es: smartTranslateText(nameIt, 'es', 'name'),
    price: document.getElementById('itemPrice').value.trim(),
    description: descriptionIt,
    description_it: descriptionIt,
    description_en: smartTranslateText(descriptionIt, 'en', 'text'),
    description_es: smartTranslateText(descriptionIt, 'es', 'text'),
    ingredients: ingredientsIt,
    ingredients_it: ingredientsIt,
    ingredients_en: smartTranslateText(ingredientsIt, 'en', 'text'),
    ingredients_es: smartTranslateText(ingredientsIt, 'es', 'text'),
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
  const isNewItem = !currentId;
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

    showStatus(`<strong>${isNewItem ? 'Nuovo piatto creato' : 'Piatto aggiornato'} online su Supabase:</strong> ${escapeHtml(item.name)}`);
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

function fieldValue(id){
  return document.getElementById(id)?.value?.trim() || '';
}
function setFieldValue(id, value){
  const el = document.getElementById(id);
  if(el) el.value = value || '';
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
