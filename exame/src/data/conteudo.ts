// Camada de dados do conteúdo. Começa com o pacote embutido no app, troca pelo
// pacote guardado no aparelho (se houver) e depois pelo baixado do servidor.
// As telas só usam as funções de leitura daqui.

import { useSyncExternalStore } from 'react';
import inicial from './pacote-inicial.json';
import demonstracao from './pacote-demonstracao.json';
import { gravarTexto, lerTexto } from './armazenamento';
import { sincronizar, type ResultadoSincronia } from './sincronizar';
import { buscar } from '../lib/busca';
import { validarPacote } from '../lib/pacote';
import type { Pacote, Referencia, Regiao, Teste } from './types';

const ARQUIVO = 'pacote.json';

type Estado = {
  pacote: Pacote;
  // 0 enquanto o app usa o pacote embutido
  versaoInstalada: number;
  ultimaSincronia: { quando: Date; resultado: ResultadoSincronia['estado']; motivo?: string } | null;
};

function comDemonstracao(base: Pacote): Pacote {
  if (!__DEV__) return base;
  const demo = demonstracao as Pick<Pacote, 'testes' | 'referencias'>;
  return { ...base, testes: [...base.testes, ...demo.testes], referencias: [...base.referencias, ...demo.referencias] };
}

let estado: Estado = {
  pacote: comDemonstracao(inicial as Pacote),
  versaoInstalada: 0,
  ultimaSincronia: null,
};
const ouvintes = new Set<() => void>();

function mudar(novo: Partial<Estado>) {
  estado = { ...estado, ...novo };
  ouvintes.forEach((o) => o());
}

export function useEstadoConteudo(): Estado {
  return useSyncExternalStore(
    (o) => {
      ouvintes.add(o);
      return () => ouvintes.delete(o);
    },
    () => estado,
  );
}

let iniciado: Promise<void> | null = null;

// Lê o pacote guardado no aparelho. Se estiver ilegível, fica o embutido.
export function iniciarConteudo(): Promise<void> {
  iniciado ??= (async () => {
    const texto = await lerTexto(ARQUIVO);
    if (!texto) return;
    try {
      const guardado = validarPacote(JSON.parse(texto));
      mudar({ pacote: comDemonstracao(guardado), versaoInstalada: guardado.versao });
    } catch {
      // arquivo corrompido: ignora; a próxima sincronia grava outro
    }
  })();
  return iniciado;
}

let sincronizando: Promise<ResultadoSincronia> | null = null;

export function sincronizarAgora(): Promise<ResultadoSincronia> {
  sincronizando ??= (async () => {
    await iniciarConteudo();
    const r = await sincronizar(estado.versaoInstalada);
    if (r.estado === 'novo') {
      await gravarTexto(ARQUIVO, r.texto);
      mudar({ pacote: comDemonstracao(r.pacote), versaoInstalada: r.pacote.versao });
    }
    mudar({ ultimaSincronia: { quando: new Date(), resultado: r.estado, motivo: r.estado === 'erro' ? r.motivo : undefined } });
    return r;
  })().finally(() => {
    sincronizando = null;
  });
  return sincronizando;
}

const pacote = () => estado.pacote;
const porNome = (a: Teste, b: Teste) => a.nome.localeCompare(b.nome, 'pt-BR');

export async function listarRegioes(): Promise<(Regiao & { totalTestes: number })[]> {
  await iniciarConteudo();
  return [...pacote().regioes]
    .sort((a, b) => a.ordem - b.ordem)
    .map((r) => ({ ...r, totalTestes: pacote().testes.filter((t) => t.regiao === r.slug).length }));
}

export async function obterRegiao(slug: string): Promise<Regiao | null> {
  await iniciarConteudo();
  return pacote().regioes.find((r) => r.slug === slug) ?? null;
}

export async function listarTestes(regiao?: string): Promise<Teste[]> {
  await iniciarConteudo();
  return pacote().testes.filter((t) => !regiao || t.regiao === regiao).sort(porNome);
}

export async function obterTeste(slug: string): Promise<Teste | null> {
  await iniciarConteudo();
  return pacote().testes.find((t) => t.slug === slug) ?? null;
}

export async function obterTestes(slugs: string[]): Promise<Teste[]> {
  await iniciarConteudo();
  return pacote().testes.filter((t) => slugs.includes(t.slug)).sort(porNome);
}

export async function obterReferencias(ids: string[]): Promise<Referencia[]> {
  await iniciarConteudo();
  return pacote().referencias.filter((r) => ids.includes(r.id));
}

export async function buscarTestes(texto: string): Promise<Teste[]> {
  await iniciarConteudo();
  return buscar(pacote().testes, texto);
}
