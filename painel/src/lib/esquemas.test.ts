import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAMPOS_ESTUDO, CAMPOS_TESTE, errosPorCampo, esquemaEstudo, esquemaTeste, slugificar } from './esquemas.ts';

const teste = (mudar: Record<string, string> = {}) => ({
  regiaoId: '7b0c6a2e-2a43-4c3a-9a7e-0c3b1d1f2e11', nome: 'Teste de Neer', nomeEn: "Neer's test",
  sinonimos: 'Sinal de Neer; Neer impingement sign\nSinal de Neer', categorias: 'Impacto subacromial',
  posicaoPaciente: '', execucao: 'x', resultadoPositivo: 'y', observacoes: '', status: 'rascunho', ...mudar,
});

const estudo = (mudar: Record<string, string> = {}) => ({
  ...Object.fromEntries(CAMPOS_ESTUDO.map((c) => [c, ''])),
  citacao: 'Autor A. Título fictício. Revista. 2020;1:1-2.', condicaoAlvo: 'condição', sensibilidade: '72,5', ...mudar,
});

test('slug sem acento nem apóstrofo', () => {
  assert.equal(slugificar("Teste de Apreensão (Neer's)"), 'teste-de-apreensao-neers');
});

test('campos dos formulários', () => {
  assert.ok(CAMPOS_TESTE.includes('execucao') && CAMPOS_ESTUDO.includes('sensIcInf'));
});

test('teste: sinônimos separados por ; ou linha, sem repetir', () => {
  const r = esquemaTeste.parse(teste());
  assert.deepEqual(r.sinonimos, ['Sinal de Neer', 'Neer impingement sign']);
});

test('teste: publicar exige execução e resultado positivo', () => {
  const r = esquemaTeste.safeParse(teste({ status: 'publicado', execucao: '', resultadoPositivo: '' }));
  assert.equal(r.success, false);
  const erros = errosPorCampo(r.error!);
  assert.ok(erros.execucao && erros.resultadoPositivo);
  assert.equal(esquemaTeste.safeParse(teste({ status: 'rascunho', execucao: '' })).success, true);
});

test('teste: região precisa ser um id válido', () => {
  assert.equal(esquemaTeste.safeParse(teste({ regiaoId: 'ombro' })).success, false);
});

test('estudo: % vira fração e vírgula vale como decimal', () => {
  const r = esquemaEstudo.parse(estudo({ sensIcInf: '60', sensIcSup: '82,4', especificidade: '90' }));
  assert.equal(r.propriedade.sensibilidade, 0.725);
  assert.equal(r.propriedade.sens_ic_inf, 0.6);
  assert.equal(r.propriedade.sens_ic_sup, 0.824);
  assert.equal(r.propriedade.especificidade, 0.9);
  assert.equal(r.propriedade.lr_positiva, null);
  assert.equal(r.referencia.pmid, null);
});

test('estudo: recusa números fora da faixa e IC incoerente', () => {
  const casos: Record<string, string>[] = [
    { sensibilidade: '120' },
    { sensibilidade: 'abc' },
    { sensIcInf: '80', sensIcSup: '60' },
    { sensIcInf: '60' },
    { confiabilidade: '0,7' },
    { confiabilidade: '2', confiabilidadeTipo: 'kappa' },
    { sensibilidade: '' },
    { pmid: '12a' },
    { doi: 'abc' },
  ];
  for (const c of casos) assert.equal(esquemaEstudo.safeParse(estudo(c)).success, false, JSON.stringify(c));
});

test('estudo: só LR, sem Sens/Esp, é aceito', () => {
  const r = esquemaEstudo.parse(estudo({ sensibilidade: '', lrPositiva: '5,2' }));
  assert.equal(r.propriedade.lr_positiva, 5.2);
});
