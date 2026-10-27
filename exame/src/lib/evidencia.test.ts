import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  avaliar, avaliarTeste, estudosDiscordam, formatarPercentual, formatarRazao,
  lrNegativa, lrPositiva, nivelLrNegativa, nivelLrPositiva, probabilidadePosTeste, rotuloNivel,
} from './evidencia.ts';

const p = (s: number | null, e: number | null, lp: number | null = null, ln: number | null = null) =>
  ({ sensibilidade: s, especificidade: e, lrPositiva: lp, lrNegativa: ln });

test('LR calculada a partir de Sens e Esp', () => {
  const pos = lrPositiva(p(0.8, 0.9));
  assert.equal(pos.calculada, true);
  assert.ok(Math.abs((pos.valor as number) - 8) < 1e-9);
  const neg = lrNegativa(p(0.8, 0.9));
  assert.ok(Math.abs((neg.valor as number) - 0.2 / 0.9) < 1e-9);
});

test('LR informada pelo estudo tem prioridade e não é marcada como calculada', () => {
  assert.deepEqual(lrPositiva(p(0.8, 0.9, 7.5)), { valor: 7.5, calculada: false });
});

test('sem Esp, ou Esp 100%, não há LR+ calculável', () => {
  assert.equal(lrPositiva(p(0.8, null)).valor, null);
  assert.equal(lrPositiva(p(0.8, 1)).valor, null);
  assert.equal(lrNegativa(p(0.8, 0)).valor, null);
});

test('limiares da LR+', () => {
  assert.equal(nivelLrPositiva(10), 'forte');
  assert.equal(nivelLrPositiva(9.99), 'moderada');
  assert.equal(nivelLrPositiva(5), 'moderada');
  assert.equal(nivelLrPositiva(2), 'fraca');
  assert.equal(nivelLrPositiva(1.9), 'minima');
  assert.equal(nivelLrPositiva(null), 'sem-dados');
});

test('limiares da LR−', () => {
  assert.equal(nivelLrNegativa(0.1), 'forte');
  assert.equal(nivelLrNegativa(0.11), 'moderada');
  assert.equal(nivelLrNegativa(0.5), 'fraca');
  assert.equal(nivelLrNegativa(0.6), 'minima');
});

test('o selo usa o melhor lado: confirmar ou descartar', () => {
  assert.deepEqual(avaliar(p(null, null, 12, 0.6)), { nivel: 'forte', uso: 'confirmar' });
  assert.deepEqual(avaliar(p(null, null, 1.5, 0.08)), { nivel: 'forte', uso: 'descartar' });
  assert.deepEqual(avaliar(p(null, null)), { nivel: 'sem-dados', uso: null });
});

test('o selo do teste é o do melhor estudo', () => {
  const r = avaliarTeste([p(null, null, 2.5), p(null, null, 6)]);
  assert.deepEqual(r, { nivel: 'moderada', uso: 'confirmar' });
  assert.deepEqual(avaliarTeste([]), { nivel: 'sem-dados', uso: null });
});

test('rótulos', () => {
  assert.equal(rotuloNivel('forte', 'descartar'), 'Evidência forte para descartar');
  assert.equal(rotuloNivel('minima', 'confirmar'), 'Evidência mínima');
  assert.equal(rotuloNivel('sem-dados', null), 'Sem dados');
});

test('estudos discordantes acima de 20 pontos', () => {
  assert.equal(estudosDiscordam([p(0.5, 0.8), p(0.75, 0.8)]), true);
  assert.equal(estudosDiscordam([p(0.5, 0.8), p(0.65, 0.9)]), false);
  assert.equal(estudosDiscordam([p(0.5, 0.8)]), false);
});

test('probabilidade pós-teste', () => {
  // pré 50% e LR 1 -> 50%; pré 20% com LR 10 -> 71,4%
  assert.ok(Math.abs(probabilidadePosTeste(0.5, 1) - 0.5) < 1e-9);
  assert.ok(Math.abs(probabilidadePosTeste(0.2, 10) - 2.5 / 3.5) < 1e-9);
  assert.equal(probabilidadePosTeste(0, 10), 0);
  assert.equal(probabilidadePosTeste(1, 0.1), 1);
});

test('formatação brasileira', () => {
  assert.equal(formatarPercentual(0.725), '73%');
  assert.equal(formatarPercentual(null), '—');
  assert.equal(formatarRazao(4.57), '4,6');
  assert.equal(formatarRazao(0.123), '0,12');
});
