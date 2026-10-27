// Confere se um JSON tem o formato de Pacote antes de o app usá-lo.
// Um pacote baixado que não passa aqui é descartado e o app segue com o anterior.

import type { Pacote } from '../data/types';

export class PacoteInvalido extends Error {}

const ehTexto = (v: unknown): v is string => typeof v === 'string';
const ehNumeroOuNulo = (v: unknown) => v === null || typeof v === 'number';
const ehTextoOuNulo = (v: unknown) => v === null || typeof v === 'string';
const ehLista = (v: unknown): v is unknown[] => Array.isArray(v);
const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function exigir(cond: boolean, onde: string): asserts cond {
  if (!cond) throw new PacoteInvalido(`pacote inválido em ${onde}`);
}

function ehIntervalo(v: unknown) {
  return v === null || (ehLista(v) && v.length === 2 && v.every((x) => typeof x === 'number'));
}

export function validarPacote(dado: unknown): Pacote {
  exigir(ehObjeto(dado), 'raiz');
  exigir(Number.isInteger(dado.versao) && (dado.versao as number) > 0, 'versao');
  exigir(ehTexto(dado.geradoEm), 'geradoEm');
  exigir(ehLista(dado.regioes) && ehLista(dado.testes) && ehLista(dado.referencias), 'listas');

  dado.regioes.forEach((r, i) => {
    exigir(ehObjeto(r) && ehTexto(r.slug) && ehTexto(r.nome) && ehTexto(r.nomeEn)
      && typeof r.ordem === 'number' && ehTexto(r.areaFigura), `regioes[${i}]`);
  });
  const regioes = new Set((dado.regioes as { slug: string }[]).map((r) => r.slug));

  dado.referencias.forEach((r, i) => {
    exigir(ehObjeto(r) && ehTexto(r.id) && ehTexto(r.citacao) && ehTextoOuNulo(r.pmid)
      && ehTextoOuNulo(r.doi) && ehNumeroOuNulo(r.ano), `referencias[${i}]`);
  });
  const referencias = new Set((dado.referencias as { id: string }[]).map((r) => r.id));

  dado.testes.forEach((t, i) => {
    const onde = `testes[${i}]`;
    exigir(ehObjeto(t), onde);
    for (const campo of ['slug', 'regiao', 'nome', 'nomeEn', 'posicaoPaciente', 'execucao', 'resultadoPositivo', 'observacoes']) {
      exigir(ehTexto(t[campo]), `${onde}.${campo}`);
    }
    exigir(regioes.has(t.regiao as string), `${onde}.regiao`);
    exigir(ehLista(t.sinonimos) && t.sinonimos.every(ehTexto), `${onde}.sinonimos`);
    exigir(ehLista(t.categorias) && t.categorias.every(ehTexto), `${onde}.categorias`);
    exigir(t.video === null || (ehObjeto(t.video) && ehTexto(t.video.caminho)
      && typeof t.video.duracaoS === 'number' && typeof t.video.tamanhoBytes === 'number'
      && typeof t.video.temAudio === 'boolean'), `${onde}.video`);
    exigir(ehLista(t.propriedades), `${onde}.propriedades`);
    t.propriedades.forEach((p, j) => {
      const op = `${onde}.propriedades[${j}]`;
      exigir(ehObjeto(p) && ehTexto(p.id) && ehTexto(p.referenciaId) && ehTexto(p.condicaoAlvo)
        && ehTexto(p.padraoOuro) && ehTexto(p.populacao), op);
      exigir(referencias.has(p.referenciaId as string), `${op}.referenciaId`);
      for (const campo of ['n', 'sensibilidade', 'especificidade', 'lrPositiva', 'lrNegativa', 'confiabilidade']) {
        exigir(ehNumeroOuNulo(p[campo]), `${op}.${campo}`);
      }
      for (const campo of ['sensibilidade', 'especificidade']) {
        const v = p[campo] as number | null;
        exigir(v === null || (v >= 0 && v <= 1), `${op}.${campo} entre 0 e 1`);
      }
      exigir(ehIntervalo(p.sensIc) && ehIntervalo(p.espIc), `${op}.intervalos`);
      exigir(p.confiabilidadeTipo === null || p.confiabilidadeTipo === 'kappa' || p.confiabilidadeTipo === 'icc', `${op}.confiabilidadeTipo`);
    });
  });
  return dado as unknown as Pacote;
}
