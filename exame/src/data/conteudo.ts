// Camada de dados do conteúdo. Hoje lê o pacote embutido no app; depois
// (/replica-backend) lerá o pacote baixado e guardado no aparelho. As telas
// só usam estas funções, então a troca não muda nenhuma tela.

import inicial from './pacote-inicial.json';
import demonstracao from './pacote-demonstracao.json';
import { buscar } from '../lib/busca';
import type { Pacote, Referencia, Regiao, Teste } from './types';

function montarPacote(): Pacote {
  const base = inicial as Pacote;
  if (!__DEV__) return base;
  const demo = demonstracao as Pick<Pacote, 'testes' | 'referencias'>;
  return {
    ...base,
    testes: [...base.testes, ...demo.testes],
    referencias: [...base.referencias, ...demo.referencias],
  };
}

const pacote = montarPacote();
const porNome = (a: Teste, b: Teste) => a.nome.localeCompare(b.nome, 'pt-BR');

export async function versaoDoConteudo(): Promise<number> {
  return pacote.versao;
}

export async function listarRegioes(): Promise<(Regiao & { totalTestes: number })[]> {
  return [...pacote.regioes]
    .sort((a, b) => a.ordem - b.ordem)
    .map((r) => ({ ...r, totalTestes: pacote.testes.filter((t) => t.regiao === r.slug).length }));
}

export async function obterRegiao(slug: string): Promise<Regiao | null> {
  return pacote.regioes.find((r) => r.slug === slug) ?? null;
}

export async function listarTestes(regiao?: string): Promise<Teste[]> {
  return pacote.testes.filter((t) => !regiao || t.regiao === regiao).sort(porNome);
}

export async function obterTeste(slug: string): Promise<Teste | null> {
  return pacote.testes.find((t) => t.slug === slug) ?? null;
}

export async function obterTestes(slugs: string[]): Promise<Teste[]> {
  return pacote.testes.filter((t) => slugs.includes(t.slug)).sort(porNome);
}

export async function obterReferencias(ids: string[]): Promise<Referencia[]> {
  return pacote.referencias.filter((r) => ids.includes(r.id));
}

export async function buscarTestes(texto: string): Promise<Teste[]> {
  return buscar(pacote.testes, texto);
}
