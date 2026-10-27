import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buscar, normalizar } from './busca.ts';

const t = (slug: string, nome: string, nomeEn = '', sinonimos: string[] = [], categorias: string[] = []) =>
  ({ slug, nome, nomeEn, sinonimos, categorias });

const itens = [
  t('neer', 'Teste de Neer', "Neer's test", ['Neer impingement sign'], ['Impacto subacromial']),
  t('jobe', 'Teste de Jobe', 'Empty can test', ['Lata vazia'], ['Lesão do supraespinal']),
  t('apreensao', 'Teste de apreensão anterior', 'Apprehension test', [], ['Instabilidade anterior']),
  t('lachman', 'Teste de Lachman', 'Lachman test', [], ['Lesão do LCA']),
];

test('normaliza acento, apóstrofo, caixa e "teste de"', () => {
  assert.equal(normalizar("Neer's Test"), 'neer');
  assert.equal(normalizar('Teste de Apreensão'), 'apreensao');
  assert.equal(normalizar('  LESÃO   do  LCA '), 'lesao do lca');
});

test('acha pelo epônimo com ou sem apóstrofo', () => {
  assert.equal(buscar(itens, "neer's")[0].slug, 'neer');
  assert.equal(buscar(itens, 'NEER')[0].slug, 'neer');
});

test('acha pelo nome em inglês e pelo sinônimo', () => {
  assert.equal(buscar(itens, 'empty can')[0].slug, 'jobe');
  assert.equal(buscar(itens, 'lata vazia')[0].slug, 'jobe');
});

test('acha sem acento', () => {
  assert.equal(buscar(itens, 'apreensao')[0].slug, 'apreensao');
});

test('tolera um erro de digitação em palavra longa', () => {
  assert.equal(buscar(itens, 'lachmann')[0].slug, 'lachman');
});

test('acha pela suspeita diagnóstica, abaixo dos acertos de nome', () => {
  assert.deepEqual(buscar(itens, 'instabilidade').map((i) => i.slug), ['apreensao']);
  assert.deepEqual(buscar(itens, 'lca').map((i) => i.slug), ['lachman']);
});

test('menos de 2 letras não busca; sem acerto devolve vazio', () => {
  assert.deepEqual(buscar(itens, 'n'), []);
  assert.deepEqual(buscar(itens, 'xyzw'), []);
});
