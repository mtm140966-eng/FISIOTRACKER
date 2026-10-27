// Validação, no servidor, de tudo que chega dos formulários do painel.
// As mesmas regras também existem no banco; aqui elas viram mensagens claras.

import { z } from 'zod';

export const STATUS = ['rascunho', 'revisao', 'publicado', 'arquivado'] as const;

export function slugificar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// "a; b\nc" -> ["a", "b", "c"]
const lista = (max: number) =>
  z.string().max(4000).transform((s) => [...new Set(s.split(/[;\n]/).map((x) => x.trim()).filter(Boolean))])
    .pipe(z.array(z.string().max(120)).max(max, `no máximo ${max} itens`));

const textoLongo = z.string().trim().max(3000, 'texto longo demais (máximo 3000 caracteres)');

const baseTeste = z.object({
  regiaoId: z.uuid('escolha a região'),
  nome: z.string().trim().min(2, 'escreva o nome do teste').max(120),
  nomeEn: z.string().trim().max(120),
  sinonimos: lista(20),
  categorias: lista(10),
  posicaoPaciente: textoLongo,
  execucao: textoLongo,
  resultadoPositivo: textoLongo,
  observacoes: textoLongo,
  status: z.enum(STATUS),
});

export const CAMPOS_TESTE = Object.keys(baseTeste.shape);

export const esquemaTeste = baseTeste.superRefine((t, ctx) => {
    if (t.status !== 'publicado') return;
    if (!t.execucao) ctx.addIssue({ code: 'custom', path: ['execucao'], message: 'para publicar, escreva a execução' });
    if (!t.resultadoPositivo) ctx.addIssue({ code: 'custom', path: ['resultadoPositivo'], message: 'para publicar, escreva quando é positivo' });
});

export type DadosTeste = z.infer<typeof esquemaTeste>;

// Campo numérico opcional: vazio vira null; aceita vírgula decimal.
const numero = (min: number, max: number, rotulo: string) =>
  z.string().trim().transform((s, ctx) => {
    if (s === '') return null;
    const v = Number(s.replace(',', '.'));
    if (!Number.isFinite(v) || v < min || v > max) {
      ctx.addIssue({ code: 'custom', message: `${rotulo}: use um número de ${min} a ${max}` });
      return z.NEVER;
    }
    return v;
  });

const fracao = (pct: number | null) => (pct == null ? null : Math.round(pct * 10) / 1000);

const baseEstudo = z.object({
  pmid: z.string().trim().regex(/^\d{0,10}$/, 'PMID tem só números'),
  doi: z.string().trim().max(200).regex(/^(10\.\S+)?$/, 'DOI começa com 10.'),
  citacao: z.string().trim().min(10, 'confira a citação').max(1000),
  ano: numero(1900, 2100, 'Ano'),
  condicaoAlvo: z.string().trim().min(2, 'escreva a condição-alvo').max(200),
  padraoOuro: z.string().trim().max(200),
  populacao: z.string().trim().max(300),
  n: numero(1, 1000000, 'n'),
  sensibilidade: numero(0, 100, 'Sensibilidade (%)'),
  sensIcInf: numero(0, 100, 'IC inferior da sensibilidade'),
  sensIcSup: numero(0, 100, 'IC superior da sensibilidade'),
  especificidade: numero(0, 100, 'Especificidade (%)'),
  espIcInf: numero(0, 100, 'IC inferior da especificidade'),
  espIcSup: numero(0, 100, 'IC superior da especificidade'),
  lrPositiva: numero(0, 1000, 'LR+'),
  lrNegativa: numero(0, 1000, 'LR−'),
  confiabilidade: numero(-1, 1, 'Confiabilidade'),
  confiabilidadeTipo: z.enum(['', 'kappa', 'icc']),
});

export const CAMPOS_ESTUDO = Object.keys(baseEstudo.shape);

export const esquemaEstudo = baseEstudo
  .superRefine((e, ctx) => {
    const par = (inf: number | null, sup: number | null, campo: string, nome: string) => {
      if ((inf == null) !== (sup == null)) ctx.addIssue({ code: 'custom', path: [campo], message: `${nome}: preencha os dois limites do IC ou nenhum` });
      else if (inf != null && sup != null && inf > sup) ctx.addIssue({ code: 'custom', path: [campo], message: `${nome}: o limite inferior do IC é maior que o superior` });
    };
    par(e.sensIcInf, e.sensIcSup, 'sensIcInf', 'Sensibilidade');
    par(e.espIcInf, e.espIcSup, 'espIcInf', 'Especificidade');
    if ((e.confiabilidade == null) !== (e.confiabilidadeTipo === '')) {
      ctx.addIssue({ code: 'custom', path: ['confiabilidadeTipo'], message: 'confiabilidade: informe o valor e o tipo (kappa ou ICC)' });
    }
    if ([e.sensibilidade, e.especificidade, e.lrPositiva, e.lrNegativa, e.confiabilidade].every((v) => v == null)) {
      ctx.addIssue({ code: 'custom', path: ['sensibilidade'], message: 'preencha ao menos um número (Sens, Esp, LR ou confiabilidade)' });
    }
  })
  .transform((e) => ({
    referencia: { citacao: e.citacao, pmid: e.pmid || null, doi: e.doi || null, ano: e.ano },
    propriedade: {
      condicao_alvo: e.condicaoAlvo,
      padrao_ouro: e.padraoOuro,
      populacao: e.populacao,
      n: e.n,
      sensibilidade: fracao(e.sensibilidade),
      sens_ic_inf: fracao(e.sensIcInf),
      sens_ic_sup: fracao(e.sensIcSup),
      especificidade: fracao(e.especificidade),
      esp_ic_inf: fracao(e.espIcInf),
      esp_ic_sup: fracao(e.espIcSup),
      lr_positiva: e.lrPositiva,
      lr_negativa: e.lrNegativa,
      confiabilidade: e.confiabilidade,
      confiabilidade_tipo: e.confiabilidadeTipo || null,
    },
  }));

// FormData -> objeto só com textos (campos ausentes viram '').
export function lerFormulario(dados: FormData, campos: string[]): Record<string, string> {
  return Object.fromEntries(campos.map((c) => [c, String(dados.get(c) ?? '')]));
}

// Erros do zod -> { campo: mensagem } para mostrar ao lado de cada campo.
export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const i of erro.issues) {
    const campo = String(i.path[0] ?? '_');
    saida[campo] ??= i.message;
  }
  return saida;
}
