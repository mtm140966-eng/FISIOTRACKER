import { test, expect, abrir, pacoteE2E, semProblemasDeAcessibilidade, sha } from './apoio';

const versao = (page: import('@playwright/test').Page) => page.getByText(/^Versão:/);

test.describe('F07 vídeos offline', () => {
  test('F07-H1 sem vídeos publicados', async ({ page }) => {
    await abrir(page, '/downloads');
    await expect(page.getByText('Nenhum vídeo publicado ainda')).toBeVisible();
  });
});

test.describe('F08 atualização do conteúdo', () => {
  test('F08-H1 versão nova é baixada, aparece e fica guardada', async ({ page, servidor }) => {
    servidor.versao = 3;
    servidor.conteudo = JSON.stringify(pacoteE2E(3));
    await abrir(page, '/mais');
    await expect(versao(page)).toHaveText('Versão: 3');
    await expect(page.getByText('Conteúdo novo baixado.')).toBeVisible();
    await abrir(page, '/regiao/ombro');
    await expect(page.getByRole('link', { name: /^Teste vindo do servidor/ })).toBeVisible();
    // o que não foi publicado sai do app
    await expect(page.getByRole('link', { name: /^Teste de Jobe/ })).toHaveCount(0);
    servidor.versao = null; // servidor fora do ar: continua a versão guardada
    await page.reload();
    await abrir(page, '/mais');
    await expect(versao(page)).toHaveText('Versão: 3');
  });

  test('F01-E5 nome longo com emoji não quebra a lista', async ({ page, servidor }) => {
    servidor.versao = 3;
    servidor.conteudo = JSON.stringify(pacoteE2E(3));
    await abrir(page, '/mais');
    await expect(versao(page)).toHaveText('Versão: 3');
    await abrir(page, '/regiao/ombro');
    await expect(page.getByRole('link', { name: /Teste de compressão.*🦴/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await semProblemasDeAcessibilidade(page);
  });

  test('F08-E1 conteúdo adulterado é recusado', async ({ page, servidor }) => {
    servidor.versao = 4;
    servidor.conteudo = JSON.stringify(pacoteE2E(4));
    servidor.sha256 = sha('outra coisa');
    await abrir(page, '/mais');
    await expect(page.getByText(/Não foi possível atualizar/)).toBeVisible();
    await expect(versao(page)).toHaveText('Versão: a que veio com o app');
  });

  test('F08-E2 JSON com formato errado é recusado', async ({ page, servidor }) => {
    const ruim = { ...pacoteE2E(5), testes: [{ slug: 'x' }] };
    servidor.versao = 5;
    servidor.conteudo = JSON.stringify(ruim);
    await abrir(page, '/mais');
    await expect(page.getByText(/Não foi possível atualizar/)).toBeVisible();
    await abrir(page, '/regiao/ombro');
    await expect(page.getByRole('link', { name: /^Teste de Neer/ })).toBeVisible();
  });

  test('F08-E3 servidor com erro 500 mantém o conteúdo', async ({ page, servidor }) => {
    servidor.status = 500;
    await abrir(page, '/mais');
    await expect(page.getByText(/Não foi possível atualizar/)).toBeVisible();
    await abrir(page, '/regiao/ombro');
    await expect(page.getByRole('link', { name: /^Teste de Neer/ })).toBeVisible();
  });

  test('F08-E4 rede lenta não trava o app', async ({ page, servidor }) => {
    servidor.versao = 6;
    servidor.conteudo = JSON.stringify(pacoteE2E(6));
    servidor.atrasoMs = 5000;
    await page.goto('/regiao/ombro');
    await expect(page.getByRole('link', { name: /^Teste de Neer/ })).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('link', { name: /^Teste vindo do servidor/ })).toBeVisible({ timeout: 20000 });
  });

  test('F08-E5 clique duplo em Procurar atualização baixa uma vez só', async ({ page, servidor }) => {
    await abrir(page, '/mais');
    servidor.versao = 7;
    servidor.conteudo = JSON.stringify(pacoteE2E(7));
    servidor.atrasoMs = 800;
    servidor.chamadas.pacote = 0;
    await page.getByRole('button', { name: 'Procurar atualização' }).dblclick();
    await expect(versao(page)).toHaveText('Versão: 7');
    expect(servidor.chamadas.pacote).toBe(1);
  });

  test('F08-E7 versão igual ou mais antiga não é baixada de novo', async ({ page, servidor }) => {
    servidor.versao = 8;
    servidor.conteudo = JSON.stringify(pacoteE2E(8));
    await abrir(page, '/mais');
    await expect(versao(page)).toHaveText('Versão: 8');
    servidor.chamadas.pacote = 0;
    await page.getByRole('button', { name: 'Procurar atualização' }).click();
    await expect(page.getByText('O conteúdo já está na versão mais recente.')).toBeVisible();
    expect(servidor.chamadas.pacote).toBe(0);
  });
});
