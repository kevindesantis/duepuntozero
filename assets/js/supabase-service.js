
/*
  Duepuntozero - servizio Supabase.
  Gestisce menù pubblico, login gestore, modifiche menù, impostazioni e upload foto.
*/

function dpzSupabaseConfigured(){
  const c = window.DUEPUNTOZERO_SUPABASE;
  return !!(c && c.enabled === true && c.url && c.anonKey && window.supabase?.createClient);
}

function dpzSupabaseClient(){
  if(!dpzSupabaseConfigured()) return null;
  if(!window.__dpzSupabaseClient){
    window.__dpzSupabaseClient = window.supabase.createClient(
      window.DUEPUNTOZERO_SUPABASE.url,
      window.DUEPUNTOZERO_SUPABASE.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }
  return window.__dpzSupabaseClient;
}

function dpzCategoryIdFromName(name){
  const full = window.DPZ_CATEGORIES_FULL || [];
  return full.find(c => c.name_it === name)?.id || null;
}

function dpzCategoryNameFromId(id){
  const full = window.DPZ_CATEGORIES_FULL || [];
  return full.find(c => c.id === id)?.name_it || id;
}

function dpzNormalizeSettings(row){
  const fallback = window.DEFAULT_MENU_DATA?.settings || {};
  return {
    restaurantName: row?.restaurant_name || fallback.restaurantName || 'Duepuntozero',
    subtitle: row?.subtitle || fallback.subtitle || 'Ristorante • Pizzeria • Cucina di Mare',
    phone: row?.phone || fallback.phone || '',
    whatsapp: row?.whatsapp || fallback.whatsapp || '',
    address: row?.address || fallback.address || '',
    menuUrl: row?.menu_url || fallback.menuUrl || '',
    freshFishToday: row?.fresh_fish_today ?? fallback.freshFishToday ?? false,
    tastingMenuActive: row?.tasting_menu_active ?? fallback.tastingMenuActive ?? false,
    giroPizzaActive: row?.giro_pizza_active ?? fallback.giroPizzaActive ?? false,
    babyMenuActive: row?.baby_menu_active ?? fallback.babyMenuActive ?? false
  };
}

async function dpzFetchTable(client, table, select='*', order='sort_order'){
  let query = client.from(table).select(select);
  if(order) query = query.order(order, { ascending: true });
  const { data, error } = await query;
  if(error) throw error;
  return data || [];
}

async function loadSupabaseData(){
  const client = dpzSupabaseClient();
  if(!client) throw new Error('Supabase non configurato');

  const [settingsRes, categories, allergens, items, rels] = await Promise.all([
    client.from('site_settings').select('*').eq('id', 1).maybeSingle(),
    dpzFetchTable(client, 'categories'),
    dpzFetchTable(client, 'allergens', '*', 'id'),
    dpzFetchTable(client, 'menu_items'),
    dpzFetchTable(client, 'menu_item_allergens', '*', null)
  ]);

  if(settingsRes.error) throw settingsRes.error;

  const sortedCategories = [...categories].sort((a,b)=>(a.sort_order ?? 999)-(b.sort_order ?? 999));
  window.DPZ_CATEGORIES_FULL = sortedCategories;

  const categoryById = Object.fromEntries(sortedCategories.map(c => [c.id, c]));
  const relMap = {};
  rels.forEach(r => {
    if(!relMap[r.item_id]) relMap[r.item_id] = [];
    relMap[r.item_id].push(Number(r.allergen_id));
  });

  const normalizedAllergens = allergens.map(a => ({
    id: Number(a.id),
    name: a.name_it,
    short: a.short_it || a.name_it,
    name_en: a.name_en,
    short_en: a.short_en,
    name_es: a.name_es,
    short_es: a.short_es
  }));

  const normalizedItems = [...items].sort((a,b)=>(a.sort_order ?? 999)-(b.sort_order ?? 999)).map(i => {
    const cat = categoryById[i.category_id];
    return {
      id: i.id,
      category_id: i.category_id,
      category: cat?.name_it || i.category_id,
      name: i.name_it || '',
      name_it: i.name_it || '',
      name_en: i.name_en || '',
      name_es: i.name_es || '',
      description: i.description_it || '',
      description_it: i.description_it || '',
      description_en: i.description_en || '',
      description_es: i.description_es || '',
      ingredients: i.ingredients_it || '',
      ingredients_it: i.ingredients_it || '',
      ingredients_en: i.ingredients_en || '',
      ingredients_es: i.ingredients_es || '',
      price: i.price || '',
      image: i.image_url || '',
      available: i.available !== false,
      available_today: i.available_today !== false,
      fresh_fish: !!i.fresh_fish,
      on_request: !!i.on_request,
      featured: !!i.featured,
      allergens: (relMap[i.id] || []).sort((a,b)=>a-b),
      sort_order: i.sort_order ?? 999
    };
  });

  return {
    settings: dpzNormalizeSettings(settingsRes.data),
    allergens: normalizedAllergens,
    categories: sortedCategories.map(c => c.name_it),
    categoriesFull: sortedCategories,
    items: normalizedItems,
    source: 'supabase'
  };
}

async function dpzGetUser(){
  const client = dpzSupabaseClient();
  if(!client) return null;
  const { data, error } = await client.auth.getUser();
  if(error) return null;
  return data?.user || null;
}

async function dpzSignIn(email, password){
  const client = dpzSupabaseClient();
  if(!client) throw new Error('Supabase non configurato');
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if(error) throw error;
  return data.user;
}

async function dpzSignOut(){
  const client = dpzSupabaseClient();
  if(!client) return;
  await client.auth.signOut();
}

async function dpzSaveSettings(settings){
  const client = dpzSupabaseClient();
  if(!client) throw new Error('Supabase non configurato');

  const row = {
    id: 1,
    restaurant_name: settings.restaurantName || 'Duepuntozero',
    subtitle: settings.subtitle || 'Ristorante • Pizzeria • Cucina di Mare',
    phone: settings.phone || '',
    whatsapp: settings.whatsapp || '',
    address: settings.address || '',
    menu_url: settings.menuUrl || '',
    fresh_fish_today: !!settings.freshFishToday,
    tasting_menu_active: !!settings.tastingMenuActive,
    giro_pizza_active: !!settings.giroPizzaActive,
    baby_menu_active: !!settings.babyMenuActive,
    updated_at: new Date().toISOString()
  };

  const { error } = await client.from('site_settings').upsert(row, { onConflict: 'id' });
  if(error) throw error;
}


async function dpzSaveCategory(category){
  const client = dpzSupabaseClient();
  if(!client) throw new Error('Supabase non configurato');

  const row = {
    id: category.id,
    name_it: category.name_it || '',
    name_en: category.name_en || '',
    name_es: category.name_es || '',
    sort_order: category.sort_order ?? 999,
    active: category.active !== false,
    updated_at: new Date().toISOString()
  };

  const { error } = await client.from('categories').upsert(row, { onConflict: 'id' });
  if(error) throw error;
}

async function dpzSaveMenuItem(item){
  const client = dpzSupabaseClient();
  if(!client) throw new Error('Supabase non configurato');

  const row = {
    id: item.id,
    category_id: item.category_id || dpzCategoryIdFromName(item.category),
    name_it: item.name_it || item.name || '',
    name_en: item.name_en || '',
    name_es: item.name_es || '',
    description_it: item.description_it || item.description || '',
    description_en: item.description_en || '',
    description_es: item.description_es || '',
    ingredients_it: item.ingredients_it || item.ingredients || '',
    ingredients_en: item.ingredients_en || '',
    ingredients_es: item.ingredients_es || '',
    price: item.price || '',
    image_url: item.image || '',
    available: item.available !== false,
    available_today: item.available_today !== false,
    fresh_fish: !!item.fresh_fish,
    on_request: !!item.on_request,
    featured: !!item.featured,
    sort_order: item.sort_order ?? 999,
    updated_at: new Date().toISOString()
  };

  const { error } = await client.from('menu_items').upsert(row, { onConflict: 'id' });
  if(error) throw error;

  const { error: delError } = await client.from('menu_item_allergens').delete().eq('item_id', item.id);
  if(delError) throw delError;

  const allergenRows = (item.allergens || []).map(id => ({ item_id: item.id, allergen_id: Number(id) }));
  if(allergenRows.length){
    const { error: insError } = await client.from('menu_item_allergens').insert(allergenRows);
    if(insError) throw insError;
  }
}

async function dpzDeleteMenuItem(id){
  const client = dpzSupabaseClient();
  if(!client) throw new Error('Supabase non configurato');
  const { error } = await client.from('menu_items').delete().eq('id', id);
  if(error) throw error;
}

async function dpzToggleAvailableToday(id, nextValue){
  const client = dpzSupabaseClient();
  if(!client) throw new Error('Supabase non configurato');
  const { error } = await client.from('menu_items').update({
    available_today: !!nextValue,
    updated_at: new Date().toISOString()
  }).eq('id', id);
  if(error) throw error;
}

async function dpzUploadImage(file, itemId='piatto'){
  const client = dpzSupabaseClient();
  if(!client) throw new Error('Supabase non configurato');
  if(!file) throw new Error('Nessun file selezionato.');

  const bucket = window.DUEPUNTOZERO_SUPABASE?.imageBucket || 'menu-images';
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
  const safeItem = String(itemId || 'piatto').replace(/[^a-zA-Z0-9_-]/g,'-');
  const fileName = `${safeItem}/${Date.now()}.${ext}`;

  const { error } = await client.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: true
  });
  if(error) throw error;

  const { data } = client.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

async function dpzImportLocalDataToSupabase(localData){
  const client = dpzSupabaseClient();
  if(!client) throw new Error('Supabase non configurato');

  await dpzSaveSettings(localData.settings);

  for(const item of localData.items || []){
    const full = {
      ...item,
      category_id: dpzCategoryIdFromName(item.category),
      name_it: item.name_it || item.name,
      description_it: item.description_it || item.description,
      ingredients_it: item.ingredients_it || item.ingredients
    };
    await dpzSaveMenuItem(full);
  }
}
