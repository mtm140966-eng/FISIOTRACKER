'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { supabaseDoServidor } from '@/lib/supabase/servidor';

export type EstadoEntrar = { enviado?: boolean; erro?: string };

// Link mágico por e-mail, só para contas que já existem (editores convidados).
// O Supabase Auth limita quantos e-mails saem por hora.
export async function enviarLink(_: EstadoEntrar, dados: FormData): Promise<EstadoEntrar> {
  const email = z.email().safeParse(String(dados.get('email') ?? '').trim());
  if (!email.success) return { erro: 'Confira o e-mail.' };
  const origem = (await headers()).get('origin') ?? '';
  const supabase = await supabaseDoServidor();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { shouldCreateUser: false, emailRedirectTo: `${origem}/auth/confirmar` },
  });
  // Mesma resposta para e-mail cadastrado ou não: não revela quem é editor.
  if (error && error.status === 429) return { erro: 'Muitas tentativas. Espere alguns minutos.' };
  return { enviado: true };
}
