'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigirEditor } from '@/lib/acesso';
import {
  CAMPOS_ESTUDO, CAMPOS_TESTE, errosPorCampo, esquemaEstudo, esquemaTeste, lerFormulario, slugificar,
} from '@/lib/esquemas';
import { buscarPubmed, type ArtigoPubmed } from '@/lib/pubmed';
import { supabaseDoServidor } from '@/lib/supabase/servidor';

export type EstadoForm = { ok?: string; erro?: string; erros?: Record<string, string>; versao?: number };

export async function sair() {
  const supabase = await supabaseDoServidor();
  await supabase.auth.signOut({ scope: 'global' });
  redirect('/entrar');
}

// Cria (id null) ou atualiza um teste, com sinônimos e categorias.
export async function salvarTeste(id: string | null, _: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const { supabase, usuario } = await exigirEditor();
  const r = esquemaTeste.safeParse(lerFormulario(dados, CAMPOS_TESTE));
  if (!r.success) return { erros: errosPorCampo(r.error), erro: 'Confira os campos marcados.' };
  const t = r.data;

  const { data: atual } = id
    ? await supabase.from('testes').select('status, publicado_em').eq('id', id).single()
    : { data: null };
  const linha = {
    regiao_id: t.regiaoId,
    nome: t.nome,
    nome_en: t.nomeEn,
    sinonimos: t.sinonimos,
    posicao_paciente: t.posicaoPaciente,
    execucao: t.execucao,
    resultado_positivo: t.resultadoPositivo,
    observacoes: t.observacoes,
    status: t.status,
    publicado_em: t.status === 'publicado' ? (atual?.publicado_em ?? new Date().toISOString()) : atual?.publicado_em ?? null,
  };

  let testeId = id;
  if (id) {
    const { error } = await supabase.from('testes').update(linha).eq('id', id);
    if (error) return { erro: 'Não foi possível salvar. Tente de novo.' };
  } else {
    const base = slugificar(t.nome) || 'teste';
    for (let n = 1; n <= 20 && !testeId; n++) {
      const slug = n === 1 ? base : `${base}-${n}`;
      const { data, error } = await supabase.from('testes').insert({ ...linha, slug, autor_id: usuario.id }).select('id').single();
      if (data) testeId = data.id;
      else if (error?.code !== '23505') return { erro: 'Não foi possível criar o teste. Tente de novo.' };
    }
    if (!testeId) return { erro: 'Já existem muitos testes com esse nome.' };
  }

  // categorias: acha pelo nome na região ou cria; depois troca as do teste
  const ids: string[] = [];
  const { data: regiao } = await supabase.from('regioes').select('slug').eq('id', t.regiaoId).single();
  for (const nome of t.categorias) {
    const { data: existente } = await supabase.from('categorias').select('id').eq('regiao_id', t.regiaoId).ilike('nome', nome).maybeSingle();
    if (existente) { ids.push(existente.id); continue; }
    const { data: nova } = await supabase.from('categorias')
      .insert({ regiao_id: t.regiaoId, nome, slug: `${regiao?.slug ?? 'regiao'}-${slugificar(nome)}` }).select('id').single();
    if (nova) ids.push(nova.id);
  }
  await supabase.from('teste_categorias').delete().eq('teste_id', testeId);
  if (ids.length) await supabase.from('teste_categorias').insert(ids.map((categoria_id) => ({ teste_id: testeId, categoria_id })));

  revalidatePath('/testes');
  if (!id) redirect(`/testes/${testeId}`);
  revalidatePath(`/testes/${id}`);
  return { ok: 'Salvo.' };
}

// Adiciona um estudo (linha de acurácia) com a sua referência.
export async function salvarEstudo(testeId: string, _: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const { supabase } = await exigirEditor();
  const r = esquemaEstudo.safeParse(lerFormulario(dados, CAMPOS_ESTUDO));
  if (!r.success) return { erros: errosPorCampo(r.error), erro: 'Confira os campos marcados.' };
  const { referencia, propriedade } = r.data;

  let referenciaId: string | null = null;
  for (const [coluna, valor] of [['pmid', referencia.pmid], ['doi', referencia.doi]] as const) {
    if (!valor || referenciaId) continue;
    const { data } = await supabase.from('referencias').select('id').eq(coluna, valor).maybeSingle();
    referenciaId = data?.id ?? null;
  }
  if (!referenciaId) {
    const { data, error } = await supabase.from('referencias').insert(referencia).select('id').single();
    if (error || !data) return { erro: 'Não foi possível gravar a referência.' };
    referenciaId = data.id;
  }
  const { error } = await supabase.from('propriedades').insert({ ...propriedade, teste_id: testeId, referencia_id: referenciaId });
  if (error) return { erro: 'Não foi possível gravar o estudo. Confira os números.' };
  revalidatePath(`/testes/${testeId}`);
  return { ok: 'Estudo adicionado.' };
}

export async function excluirEstudo(dados: FormData) {
  const { supabase } = await exigirEditor();
  const id = String(dados.get('id') ?? '');
  const testeId = String(dados.get('testeId') ?? '');
  await supabase.from('propriedades').delete().eq('id', id);
  revalidatePath(`/testes/${testeId}`);
}

export async function buscarCitacao(pmid: string): Promise<ArtigoPubmed | { erro: string }> {
  await exigirEditor();
  try {
    return await buscarPubmed(pmid.trim());
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Falha ao consultar o PubMed' };
  }
}

export async function publicar(_: EstadoForm): Promise<EstadoForm> {
  const { supabase } = await exigirEditor();
  const { data, error } = await supabase.rpc('publicar_pacote');
  if (error || !data) return { erro: 'A publicação falhou. Nada mudou no app. Tente de novo.' };
  revalidatePath('/publicar');
  return { ok: `Versão ${data.versao} publicada com ${data.total_testes} testes.`, versao: data.versao };
}
