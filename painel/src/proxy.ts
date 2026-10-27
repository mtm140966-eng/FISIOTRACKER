// Renova a sessão do Supabase a cada pedido e manda para /entrar quem não está logado.
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLICAS = ['/entrar', '/auth/'];

export async function proxy(pedido: NextRequest) {
  let resposta = NextResponse.next({ request: pedido });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_CHAVE_PUBLICA!,
    {
      cookies: {
        getAll: () => pedido.cookies.getAll(),
        setAll: (lista) => {
          lista.forEach(({ name, value }) => pedido.cookies.set(name, value));
          resposta = NextResponse.next({ request: pedido });
          lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data } = await supabase.auth.getClaims();
  const caminho = pedido.nextUrl.pathname;
  if (!data?.claims && !PUBLICAS.some((p) => caminho.startsWith(p))) {
    const destino = pedido.nextUrl.clone();
    destino.pathname = '/entrar';
    destino.search = '';
    return NextResponse.redirect(destino);
  }
  return resposta;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
