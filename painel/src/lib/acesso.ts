import { redirect } from 'next/navigation';
import { supabaseDoServidor } from './supabase/servidor';

// Toda página e ação do painel começa aqui. Confere o login no servidor do
// Supabase e o papel no banco; quem não é editor não passa.
export async function exigirEditor() {
  const supabase = await supabaseDoServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/entrar');
  const { data: perfil } = await supabase.from('perfis').select('nome, papel').eq('id', data.user.id).single();
  if (!perfil || !['editor', 'admin'].includes(perfil.papel)) redirect('/sem-acesso');
  return { supabase, usuario: data.user, perfil };
}
