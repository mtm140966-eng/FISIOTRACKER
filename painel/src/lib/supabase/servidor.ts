import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function configSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_CHAVE_PUBLICA;
  if (!url || !chave) throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_CHAVE_PUBLICA no .env.local');
  return { url, chave };
}

// Cliente do Supabase com a sessão do editor (cookies). Tudo que ele lê ou
// grava passa pelas regras de acesso do banco.
export async function supabaseDoServidor() {
  const { url, chave } = configSupabase();
  const loja = await cookies();
  return createServerClient(url, chave, {
    cookies: {
      getAll: () => loja.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => loja.set(name, value, options));
        } catch {
          // chamado de um Server Component: o proxy renova a sessão
        }
      },
    },
  });
}
