import { test, expect, abrir, semProblemasDeAcessibilidade } from './apoio';

const campo = (page: import('@playwright/test').Page) => page.getByLabel('Buscar teste');
const resultados = (page: import('@playwright/test').Page) => page.getByRole('link', { name: /^Teste/ });

test.describe('F02/F03 busca', () => {
  test.beforeEach(async ({ page }) => abrir(page, '/buscar'));

  test('F02-H1 epônimo com apóstrofo', async ({ page }) => {
    await campo(page).fill("neer's");
    await expect(resultados(page).first()).toHaveAccessibleName(/^Teste de Neer/);
    await semProblemasDeAcessibilidade(page);
  });

  test('F02-E1 campo vazio mostra a dica', async ({ page }) => {
    await expect(page.getByText(/Busque pelo nome/)).toBeVisible();
  });

  test('F02-E2 uma letra não busca', async ({ page }) => {
    await campo(page).fill('n');
    await expect(page.getByText(/Busque pelo nome/)).toBeVisible();
  });

  test('F02-E3 sem acento acha com acento', async ({ page }) => {
    await campo(page).fill('apreensao');
    await expect(resultados(page).first()).toHaveAccessibleName(/apreensão anterior/);
  });

  test('F02-E4 um erro de digitação', async ({ page }) => {
    await campo(page).fill('apreensaa');
    await expect(resultados(page).first()).toHaveAccessibleName(/apreensão anterior/);
  });

  test('F02-E5 emoji não quebra', async ({ page }) => {
    await campo(page).fill('🦴🦴');
    await expect(page.getByText(/Busque pelo nome|Nenhum teste encontrado/)).toBeVisible();
  });

  test('F02-E6 texto muito longo', async ({ page }) => {
    await campo(page).fill('ombro '.repeat(100));
    await expect(page.getByText('Nenhum teste encontrado')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });

  test('F02-E7 limpar a busca', async ({ page }) => {
    await campo(page).fill('jobe');
    await page.getByRole('button', { name: 'Limpar busca' }).click();
    await expect(campo(page)).toHaveValue('');
    await expect(page.getByText(/Busque pelo nome/)).toBeVisible();
  });

  test('F02-E8 nome em inglês e sinônimo', async ({ page }) => {
    await campo(page).fill('empty can');
    await expect(resultados(page).first()).toHaveAccessibleName(/^Teste de Jobe/);
    await campo(page).fill('lata vazia');
    await expect(resultados(page).first()).toHaveAccessibleName(/^Teste de Jobe/);
  });

  test('F03-H1 pela suspeita diagnóstica', async ({ page }) => {
    await campo(page).fill('instabilidade');
    await expect(resultados(page).first()).toHaveAccessibleName(/apreensão anterior/);
  });

  test('F02-N1 sem resultado', async ({ page }) => {
    await campo(page).fill('xyzw');
    await expect(page.getByText('Nenhum teste encontrado')).toBeVisible();
    await semProblemasDeAcessibilidade(page);
  });
});
