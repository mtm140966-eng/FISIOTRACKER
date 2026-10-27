import { test, expect, abrir, semProblemasDeAcessibilidade } from './apoio';

test.describe('F04/F05 ficha: vídeo, acurácia e referências', () => {
  test('F04-H1 sem vídeo mostra estado vazio', async ({ page }) => {
    await abrir(page, '/teste/teste-de-neer');
    await page.getByRole('tab', { name: 'Vídeo' }).click();
    await expect(page.getByText('Vídeo ainda não gravado')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Vídeo' })).toHaveAttribute('aria-selected', 'true');
  });

  test('F05-H1 acurácia: LR calculada, selos e discordância', async ({ page }) => {
    await abrir(page, '/teste/teste-de-demonstracao');
    await page.getByRole('tab', { name: 'Acurácia' }).click();
    await expect(page.getByText(/estudos discordam/)).toBeVisible();
    await expect(page.getByLabel('Razão de verossimilhança positiva 10,0, calculada')).toBeVisible();
    await expect(page.getByLabel('Sensibilidade 80 por cento, intervalo de 70 a 88')).toBeVisible();
    // o leitor de tela lê o mesmo texto do selo (BUG-002)
    await expect(page.getByText('Forte', { exact: true })).toBeVisible();
    await semProblemasDeAcessibilidade(page);
  });

  test('F05-H2 referências numeradas', async ({ page }) => {
    await abrir(page, '/teste/teste-de-demonstracao?aba=referencias');
    await expect(page.getByText(/^1\. Autor A, Autor B/)).toBeVisible();
    await expect(page.getByText(/^2\. Autor C/)).toBeVisible();
  });

  test('F05-E1 teste sem estudos', async ({ page }) => {
    await abrir(page, '/teste/teste-de-neer?aba=acuracia');
    await expect(page.getByText('Sem dados de acurácia')).toBeVisible();
    await page.getByRole('tab', { name: 'Referências' }).click();
    await expect(page.getByText('Sem referências')).toBeVisible();
  });
});
