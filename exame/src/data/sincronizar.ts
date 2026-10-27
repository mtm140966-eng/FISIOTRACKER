// Baixa o pacote de conteúdo publicado, se houver versão nova, e só o aceita
// depois de conferir o sha256 e o formato. Qualquer falha deixa o app como estava.

import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL, temServidor } from './config';
import { validarPacote } from '../lib/pacote';
import type { Pacote } from './types';

export type ResultadoSincronia =
  | { estado: 'sem-servidor' }
  | { estado: 'atualizado' }
  | { estado: 'novo'; pacote: Pacote; texto: string }
  | { estado: 'erro'; motivo: string };

const TEMPO_LIMITE_MS = 15000;

async function buscar<T>(caminho: string): Promise<T> {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const resposta = await fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, {
      headers: { apikey: SUPABASE_CHAVE_PUBLICA, Accept: 'application/json' },
      signal: controle.signal,
    });
    if (!resposta.ok) throw new Error(`servidor respondeu ${resposta.status}`);
    return (await resposta.json()) as T;
  } finally {
    clearTimeout(relogio);
  }
}

export async function sincronizar(versaoInstalada: number): Promise<ResultadoSincronia> {
  if (!temServidor()) return { estado: 'sem-servidor' };
  try {
    const [ultimo] = await buscar<{ versao: number; sha256: string }[]>('ultimo_pacote?select=versao,sha256');
    if (!ultimo || ultimo.versao <= versaoInstalada) return { estado: 'atualizado' };

    const [baixado] = await buscar<{ conteudo: string; sha256: string }[]>(
      `pacotes?select=conteudo,sha256&versao=eq.${ultimo.versao}`,
    );
    if (!baixado) return { estado: 'erro', motivo: 'versão anunciada não encontrada' };

    const sha = await digestStringAsync(CryptoDigestAlgorithm.SHA256, baixado.conteudo);
    if (sha !== baixado.sha256 || sha !== ultimo.sha256) return { estado: 'erro', motivo: 'conteúdo não confere (sha256)' };

    const pacote = validarPacote(JSON.parse(baixado.conteudo));
    if (pacote.versao !== ultimo.versao) return { estado: 'erro', motivo: 'versão do conteúdo não confere' };
    return { estado: 'novo', pacote, texto: baixado.conteudo };
  } catch (e) {
    return { estado: 'erro', motivo: e instanceof Error ? e.message : String(e) };
  }
}
