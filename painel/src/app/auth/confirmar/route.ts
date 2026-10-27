// Destino do link mágico. Aceita os dois formatos do Supabase: ?code= (PKCE)
// e ?token_hash=&type= (modelo de e-mail recomendado para SSR).
import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseDoServidor } from '@/lib/supabase/servidor';

export async function GET(pedido: NextRequest) {
  const p = pedido.nextUrl.searchParams;
  const supabase = await supabaseDoServidor();
  const code = p.get('code');
  const tokenHash = p.get('token_hash');
  const tipo = p.get('type') as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && tipo
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })
      : { error: new Error('link incompleto') };

  const destino = pedido.nextUrl.clone();
  destino.search = '';
  destino.pathname = error ? '/entrar' : '/testes';
  return NextResponse.redirect(destino);
}
