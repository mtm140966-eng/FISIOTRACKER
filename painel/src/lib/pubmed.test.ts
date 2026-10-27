import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montarCitacao } from './pubmed.ts';

// Resumo fictício no formato do esummary do NCBI (sem rede no teste).
const resumo = {
  authors: ['Silva A', 'Souza B', 'Costa C', 'Lima D', 'Rocha E', 'Alves F', 'Dias G'].map((name) => ({ name })),
  title: 'Um estudo fictício sobre um teste clínico.',
  source: 'Rev Exemplo',
  pubdate: '2019 Mar',
  volume: '12',
  issue: '3',
  pages: '45-52',
  articleids: [{ idtype: 'pubmed', value: '1' }, { idtype: 'doi', value: '10.0000/exemplo.1' }],
};

test('citação em Vancouver com et al depois de 6 autores', () => {
  const r = montarCitacao(resumo);
  assert.equal(r.citacao, 'Silva A, Souza B, Costa C, Lima D, Rocha E, Alves F, et al. Um estudo fictício sobre um teste clínico. Rev Exemplo. 2019;12(3):45-52.');
  assert.equal(r.ano, 2019);
  assert.equal(r.doi, '10.0000/exemplo.1');
});

test('campos ausentes não quebram a citação', () => {
  const r = montarCitacao({ title: 'Só título', source: 'Rev', pubdate: '' });
  assert.equal(r.citacao, 'Só título. Rev.');
  assert.equal(r.ano, null);
  assert.equal(r.doi, null);
});
