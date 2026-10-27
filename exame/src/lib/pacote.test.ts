import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PacoteInvalido, validarPacote } from './pacote.ts';

const ler = (caminho: string) => JSON.parse(readFileSync(new URL(caminho, import.meta.url), 'utf8'));
const inicial = ler('../data/pacote-inicial.json');
// Gerado por publicar_pacote() no Postgres (supabase/testes/testes.sql):
// garante que o banco e o app falam o mesmo formato.
const doBanco = ler('./fixtures/pacote-do-banco.json');

test('o pacote embutido no app é válido', () => {
  assert.equal(validarPacote(inicial).testes.length, 3);
});

test('o pacote gerado pelo banco é válido', () => {
  const p = validarPacote(doBanco);
  assert.equal(p.testes.length, 2);
  assert.deepEqual(p.testes.find((t) => t.slug === 'teste-de-neer')?.propriedades[0].sensIc, [0.4, 0.6]);
});

test('o pacote de demonstração junto com o embutido é válido', () => {
  const demo = ler('../data/pacote-demonstracao.json');
  validarPacote({ ...inicial, testes: [...inicial.testes, ...demo.testes], referencias: demo.referencias });
});

const quebrado = (mudar: (p: any) => void) => {
  const p = structuredClone(doBanco);
  mudar(p);
  return p;
};

test('recusa pacotes quebrados', () => {
  const casos: [string, (p: any) => void][] = [
    ['sem versão', (p) => delete p.versao],
    ['versão zero', (p) => (p.versao = 0)],
    ['teste sem nome', (p) => delete p.testes[0].nome],
    ['região inexistente', (p) => (p.testes[0].regiao = 'nariz')],
    ['sensibilidade acima de 1', (p) => (p.testes[1].propriedades[0].sensibilidade = 72)],
    ['referência que não existe', (p) => (p.testes[1].propriedades[0].referenciaId = 'x')],
    ['intervalo com um número só', (p) => (p.testes[1].propriedades[0].sensIc = [0.4])],
    ['vídeo sem caminho', (p) => (p.testes[0].video = { duracaoS: 1, tamanhoBytes: 1, temAudio: true })],
  ];
  for (const [nome, mudar] of casos) {
    assert.throws(() => validarPacote(quebrado(mudar)), PacoteInvalido, nome);
  }
  assert.throws(() => validarPacote(null), PacoteInvalido);
  assert.throws(() => validarPacote('texto'), PacoteInvalido);
});
