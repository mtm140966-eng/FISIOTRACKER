// Endereço do Supabase e chave pública (publishable/anon). As duas podem ir no
// app: o que protege os dados são as regras de acesso do banco (RLS).
// Sem elas, o app funciona só com o conteúdo embutido.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_CHAVE_PUBLICA = process.env.EXPO_PUBLIC_SUPABASE_CHAVE_PUBLICA ?? '';
export const temServidor = () => SUPABASE_URL !== '' && SUPABASE_CHAVE_PUBLICA !== '';
