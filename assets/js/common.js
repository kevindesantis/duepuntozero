
const STORAGE_KEY = 'duepuntozero_menu_demo_v2';

async function loadDefaultData(){
  // Aprendo il file HTML direttamente dal computer, alcuni browser bloccano fetch() sui file locali.
  // Per questo la demo ha anche i dati incorporati in assets/js/default-data.js.
  try {
    const res = await fetch('assets/data/default-data.json');
    if (!res.ok) throw new Error('Impossibile caricare default-data.json');
    return await res.json();
  } catch (err) {
    if (window.DEFAULT_MENU_DATA) return structuredClone(window.DEFAULT_MENU_DATA);
    throw err;
  }
}

async function getData(){
  if(typeof loadSupabaseData === 'function' && dpzSupabaseConfigured()){
    try {
      const data = await loadSupabaseData();
      // Piccola cache di sicurezza, utile se Supabase è momentaneamente irraggiungibile.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn('Supabase non disponibile, uso cache/demo locale:', err);
    }
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved) return JSON.parse(saved);
  const data = await loadDefaultData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}
function saveData(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function euro(price){ return price ? (String(price).includes('€') || String(price).includes('richiesta') || String(price).includes('persona') ? price : `€${price}`) : ''; }
function allergenName(data, id){ return data.allergens.find(a=>a.id===id)?.name || `Allergene ${id}`; }
function allergenShort(data, id){ return data.allergens.find(a=>a.id===id)?.short || id; }
function buildWhatsApp(settings, text='Ciao, vorrei prenotare da Duepuntozero.'){ return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`; }
function navToggle(){ document.querySelector('.navlinks')?.classList.toggle('open'); }
