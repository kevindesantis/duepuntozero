// Configurazione Supabase Duepuntozero.
// La anon key può stare nel frontend SOLO perché le policy RLS proteggono scrittura e gestione.
// NON inserire mai qui la service_role key.

window.DUEPUNTOZERO_SUPABASE = {
  enabled: true,
  url: "https://pnyounauxavtjjqvilpo.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBueW91bmF1eGF2dGpqcXZpbHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNjU3ODcsImV4cCI6MjA5MzY0MTc4N30._g_z_I5kuj6fYa7nbfvr3cjjmGoehyJUdlkoz6uRM80",
  imageBucket: "menu-images"
};
