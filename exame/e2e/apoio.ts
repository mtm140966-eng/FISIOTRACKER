// Base de todos os testes: imita o Supabase, falha com erro no console,
// resposta 5xx inesperada e problema de acessibilidade.
import { createHash } from 'node:crypto';
import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export type Servidor = {
  // o que o "Supabase" falso responde; trocar dentro do teste
  versao: number | null;
  conteudo: string;
  sha256?: string; // se ausente, calcula do conteúdo (sha certo)
  status?: number;
  atrasoMs?: number;
  chamadas: { ultimo: number; pacote: number };
};

export const sha = (texto: string) => createHash('sha256').update(texto, 'utf8').digest('hex');

export const test = base.extend<{ servidor: Servidor; erros: string[] }>({
  servidor: [async ({ page }, use) => {
    const s: Servidor = { versao: null, conteudo: '', chamadas: { ultimo: 0, pacote: 0 } };
    await page.route('http://supabase.e2e.invalid/rest/v1/**', async (rota) => {
      const url = new URL(rota.request().url());
      if (s.atrasoMs) await new Promise((r) => setTimeout(r, s.atrasoMs));
      if (s.status && s.status >= 500) {
        return rota.fulfill({ status: s.status, body: '{"message":"erro simulado"}', contentType: 'application/json' });
      }
      const assinatura = s.sha256 ?? sha(s.conteudo);
      if (url.pathname.endsWith('/ultimo_pacote')) {
        s.chamadas.ultimo++;
        return rota.fulfill({ json: s.versao == null ? [] : [{ versao: s.versao, sha256: assinatura }] });
      }
      if (url.pathname.endsWith('/pacotes')) {
        s.chamadas.pacote++;
        const pedida = Number(url.searchParams.get('versao')?.replace('eq.', ''));
        return rota.fulfill({ json: pedida === s.versao ? [{ conteudo: s.conteudo, sha256: assinatura }] : [] });
      }
      return rota.fulfill({ status: 404, json: [] });
    });
    await use(s);
  }, { auto: true }],
  erros: [async ({ page }, use) => {
    const erros: string[] = [];
    page.on('console', (m) => {
      // 5xx simulado de propósito aparece como recurso falho no console
      if (m.type() === 'error' && !/status of 5\d\d/.test(m.text())) erros.push(m.text());
    });
    page.on('pageerror', (e) => erros.push(e.message));
    page.on('response', (r) => {
      if (r.status() >= 500 && !r.url().startsWith('http://supabase.e2e.invalid')) erros.push(`${r.status()} em ${r.url()}`);
    });
    await use(erros);
    expect(erros, 'erros no console ou respostas 5xx').toEqual([]);
  }, { auto: true }],
});

export { expect };

export async function semProblemasDeAcessibilidade(page: Page) {
  // o axe traz a própria cópia dos tipos do Playwright
  const r = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'] }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  const resumo = r.violations.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} elemento(s): ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(resumo, 'violações de acessibilidade (axe)').toEqual([]);
}

export async function abrir(page: Page, caminho: string) {
  await page.goto(caminho);
  await page.waitForLoadState('networkidle');
}

// Pacote de teste: válido pelo formato do app, com casos difíceis de propósito.
export function pacoteE2E(versao: number, extra: Partial<{ nomeLongo: string }> = {}) {
  const nomeLongo = extra.nomeLongo ?? 'Teste de compressão e rotação com o paciente sentado e o braço apoiado 🦴';
  return {
    versao,
    geradoEm: '2026-10-27T00:00:00Z',
    regioes: [
      { slug: 'ombro', nome: 'Ombro', nomeEn: 'Shoulder', ordem: 1, areaFigura: 'ombro' },
      { slug: 'joelho', nome: 'Joelho', nomeEn: 'Knee', ordem: 2, areaFigura: 'joelho' },
    ],
    testes: [
      {
        slug: 'teste-do-servidor', regiao: 'ombro', nome: 'Teste vindo do servidor', nomeEn: 'Server test',
        sinonimos: [], categorias: ['Categoria e2e'], posicaoPaciente: 'Posição e2e.', execucao: 'Execução e2e.',
        resultadoPositivo: 'Positivo e2e.', observacoes: '', video: null,
        propriedades: [{ id: 'p1', referenciaId: 'r1', condicaoAlvo: 'Condição e2e', padraoOuro: '', populacao: '', n: 10,
          sensibilidade: 0.9, sensIc: null, especificidade: 0.95, espIc: null, lrPositiva: null, lrNegativa: null,
          confiabilidade: null, confiabilidadeTipo: null }],
      },
      {
        slug: 'teste-nome-longo', regiao: 'ombro', nome: nomeLongo, nomeEn: '', sinonimos: ['Acentuação àéîõü'],
        categorias: [], posicaoPaciente: '', execucao: 'x', resultadoPositivo: 'y', observacoes: '', video: null, propriedades: [],
      },
    ],
    referencias: [{ id: 'r1', citacao: 'Referência fictícia e2e.', pmid: '1', doi: null, ano: 2020 }],
  };
}
