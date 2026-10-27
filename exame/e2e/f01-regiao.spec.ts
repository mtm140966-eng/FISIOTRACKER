import { test, expect, abrir, semProblemasDeAcessibilidade } from './apoio';

test.describe('F01 achar um teste pela região', () => {
  test('F01-H1 Regiões → Ombro → Teste de Neer', async ({ page }) => {
    await abrir(page, '/');
    await semProblemasDeAcessibilidade(page);
    await page.getByRole('link', { name: /^Ombro\s*\d+ testes?/ }).click();
    await expect(page).toHaveURL(/\/regiao\/ombro$/);
    await semProblemasDeAcessibilidade(page);
    await page.getByRole('link', { name: /^Teste de Neer/ }).click();
    await expect(page.getByText('Posição do paciente')).toBeVisible();
    await expect(page.getByText('Execução', { exact: true })).toBeVisible();
    await expect(page.getByText('Positivo quando')).toBeVisible();
    await semProblemasDeAcessibilidade(page);
  });

  test('F01-H2 tocar no ombro da figura abre a região', async ({ page }) => {
    await abrir(page, '/');
    await page.getByRole('button', { name: 'Ombro direito' }).click();
    await expect(page).toHaveURL(/\/regiao\/ombro$/);
  });

  test('F01-E1 só teclado, com foco visível', async ({ page }) => {
    await abrir(page, '/');
    const ir = async (nome: RegExp) => {
      for (let i = 0; i < 80; i++) {
        await page.keyboard.press('Tab');
        const r = await page.evaluate(() => (document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent || '').trim());
        if (nome.test(r)) return;
      }
      throw new Error(`o foco não chegou em ${nome}`);
    };
    await ir(/^Ombro\s*\d+ testes?/);
    expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineWidth)).toBe('2px');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/regiao\/ombro$/);
    await ir(/^Teste de Neer/);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/teste\/teste-de-neer$/);
  });

  test('F01-E2 voltar no meio do fluxo volta para a lista', async ({ page }) => {
    await abrir(page, '/');
    await page.getByRole('link', { name: /^Ombro\s*\d+ testes?/ }).click();
    await page.getByRole('link', { name: /^Teste de Neer/ }).click();
    await expect(page).toHaveURL(/teste-de-neer/);
    await page.goBack();
    await expect(page).toHaveURL(/\/regiao\/ombro$/);
    await expect(page.getByRole('link', { name: /^Teste de Jobe/ })).toBeVisible();
  });

  test('F01-E3 recarregar na ficha mantém a ficha', async ({ page }) => {
    await abrir(page, '/teste/teste-de-neer');
    await page.reload();
    await expect(page.getByText('Positivo quando')).toBeVisible();
  });

  test('F01-E4 região sem testes mostra estado vazio', async ({ page }) => {
    await abrir(page, '/regiao/joelho');
    await expect(page.getByText('Nenhum teste ainda')).toBeVisible();
    await semProblemasDeAcessibilidade(page);
  });

  test('F01-E6 tema escuro sem problemas de contraste', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    for (const caminho of ['/', '/regiao/ombro', '/teste/teste-de-demonstracao?aba=acuracia']) {
      await abrir(page, caminho);
      await semProblemasDeAcessibilidade(page);
    }
  });

  test('F01-N1 região que não existe', async ({ page }) => {
    await abrir(page, '/regiao/nariz');
    await expect(page.getByText('Região não encontrada')).toBeVisible();
  });

  test('F01-N2 teste que não existe', async ({ page }) => {
    await abrir(page, '/teste/nao-existe');
    await expect(page.getByText('Teste não encontrado')).toBeVisible();
  });
});
