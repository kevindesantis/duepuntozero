
/*
  Statistiche visualizzazioni Duepuntozero.
  Modalità attuale su GitHub Pages: localStorage demo, quindi conta le visite fatte dallo stesso browser.
  Modalità reale: crea la tabella Supabase indicata nel file supabase_page_views.sql e configura
  window.DUEPUNTOZERO_SUPABASE in assets/js/supabase-config.js.
*/

const ANALYTICS_STORAGE_KEY = 'duepuntozero_page_views_v1';

function analyticsNow(){
  return new Date();
}
function startOfToday(){
  const d = analyticsNow();
  d.setHours(0,0,0,0);
  return d;
}
function startOfLast7Days(){
  const d = analyticsNow();
  d.setDate(d.getDate() - 6);
  d.setHours(0,0,0,0);
  return d;
}
function startOfMonth(){
  const d = analyticsNow();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function getLocalViews(){
  try{
    return JSON.parse(localStorage.getItem(ANALYTICS_STORAGE_KEY) || '[]');
  }catch(err){
    return [];
  }
}
function saveLocalViews(views){
  localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(views.slice(-10000)));
}
function getAnalyticsPayload(){
  const path = location.pathname.split('/').pop() || 'index.html';
  return {
    path,
    url: location.href,
    title: document.title,
    language: (typeof getLang === 'function' ? getLang() : document.documentElement.lang || 'it'),
    referrer: document.referrer || '',
    created_at: new Date().toISOString()
  };
}
function hasSupabaseAnalytics(){
  return (typeof dpzSupabaseConfigured === 'function' && dpzSupabaseConfigured()) || !!(window.DUEPUNTOZERO_SUPABASE?.url && window.DUEPUNTOZERO_SUPABASE?.anonKey && window.supabase?.createClient);
}
function supabaseClient(){
  if(typeof dpzSupabaseClient === 'function'){
    const c = dpzSupabaseClient();
    if(c) return c;
  }
  if(!hasSupabaseAnalytics()) return null;
  if(!window.__dpzAnalyticsClient){
    window.__dpzAnalyticsClient = window.supabase.createClient(
      window.DUEPUNTOZERO_SUPABASE.url,
      window.DUEPUNTOZERO_SUPABASE.anonKey
    );
  }
  return window.__dpzAnalyticsClient;
}
async function trackPageView(){
  const path = location.pathname.split('/').pop() || 'index.html';

  // Non conteggiamo la pagina gestore.
  if(path.includes('gestione-riservata')) return;

  const payload = getAnalyticsPayload();

  const client = supabaseClient();
  if(client){
    try{
      await client.from('page_views').insert({
        path: payload.path,
        url: payload.url,
        title: payload.title,
        language: payload.language,
        referrer: payload.referrer
      });
      return;
    }catch(err){
      console.warn('Statistiche Supabase non disponibili, uso demo locale:', err);
    }
  }

  const views = getLocalViews();
  views.push(payload);
  saveLocalViews(views);
}
function localStats(){
  const views = getLocalViews();
  const today = startOfToday();
  const week = startOfLast7Days();
  const month = startOfMonth();

  const countFrom = (date) => views.filter(v => new Date(v.created_at) >= date).length;

  const byPage = {};
  views.forEach(v => {
    byPage[v.path || 'pagina'] = (byPage[v.path || 'pagina'] || 0) + 1;
  });

  return {
    mode: 'demo locale',
    today: countFrom(today),
    week: countFrom(week),
    month: countFrom(month),
    total: views.length,
    byPage
  };
}
async function countSupabaseFrom(client, date){
  const { count, error } = await client
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', date.toISOString());
  if(error) throw error;
  return count || 0;
}
async function countSupabaseTotal(client){
  const { count, error } = await client
    .from('page_views')
    .select('*', { count: 'exact', head: true });
  if(error) throw error;
  return count || 0;
}
async function countSupabaseByPage(client){
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const { data, error } = await client
    .from('page_views')
    .select('path')
    .gte('created_at', since.toISOString())
    .limit(5000);

  if(error) throw error;

  const byPage = {};
  (data || []).forEach(v => {
    byPage[v.path || 'pagina'] = (byPage[v.path || 'pagina'] || 0) + 1;
  });
  return byPage;
}
async function getViewStats(){
  const client = supabaseClient();
  if(client){
    try{
      const [today, week, month, total, byPage] = await Promise.all([
        countSupabaseFrom(client, startOfToday()),
        countSupabaseFrom(client, startOfLast7Days()),
        countSupabaseFrom(client, startOfMonth()),
        countSupabaseTotal(client),
        countSupabaseByPage(client)
      ]);

      return {
        mode: 'Supabase reale',
        today, week, month, total, byPage
      };
    }catch(err){
      console.warn('Errore statistiche Supabase, uso demo locale:', err);
    }
  }
  return localStats();
}
function formatViewNumber(n){
  return new Intl.NumberFormat('it-IT').format(Number(n || 0));
}
async function refreshViewStats(){
  const panel = document.getElementById('viewsToday');
  if(!panel) return;

  const stats = await getViewStats();

  document.getElementById('viewsToday').textContent = formatViewNumber(stats.today);
  document.getElementById('viewsWeek').textContent = formatViewNumber(stats.week);
  document.getElementById('viewsMonth').textContent = formatViewNumber(stats.month);
  document.getElementById('viewsTotal').textContent = formatViewNumber(stats.total);

  const modeEl = document.getElementById('viewsMode');
  if(modeEl){
    if(stats.mode === 'Supabase reale'){
      modeEl.innerHTML = '<strong>Modalità:</strong> statistiche reali collegate a Supabase.';
    }else{
      modeEl.innerHTML = '<strong>Modalità demo locale:</strong> su GitHub Pages, senza Supabase, questi numeri contano solo le visite fatte da questo browser. Per vedere le visite reali di tutti i clienti serve collegare Supabase.';
    }
  }

  const byPageEl = document.getElementById('viewsByPage');
  if(byPageEl){
    const rows = Object.entries(stats.byPage || {}).sort((a,b)=>b[1]-a[1]);
    byPageEl.innerHTML = rows.length
      ? rows.map(([page,count]) => `<div class="views-page-row"><span>${page}</span><strong>${formatViewNumber(count)}</strong></div>`).join('')
      : '<p style="color:var(--muted);margin:0">Ancora nessuna visualizzazione registrata.</p>';
  }
}
function resetLocalViewStats(){
  if(!confirm('Azzerare le statistiche demo salvate in questo browser?')) return;
  localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  refreshViewStats();
}

document.addEventListener('DOMContentLoaded', () => {
  if(document.getElementById('viewsToday')){
    refreshViewStats();
  }else{
    trackPageView();
  }
});
