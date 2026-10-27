import { test, expect, abrir, semProblemasDeAcessibilidade } from './apoio';

const estrela = (page: import('@playwright/test').Page, nome: string) => page.getByRole('switch', { name: `Favorito: ${nome}` });

test.describe('F06 favoritos', () => {
  test('F06-H1 favoritar e ver na aba Favoritos', async ({ page }) => {
    await abrir(page, '/regiao/ombro');
    await estrela(page, 'Teste de Neer').click();
    await expect(estrela(page, 'Teste de Neer')).toHaveAttribute('aria-checked', 'true');
    await abrir(page, '/favoritos');
    await expect(page.getByRole('link', { name: /^Teste de Neer/ })).toBeVisible();
    await semProblemasDeAcessibilidade(page);
  });

  test('F06-E1 favorito sobrevive a recarregar', async ({ page }) => {
    await abrir(page, '/regiao/ombro');
    await estrela(page, 'Teste de Jobe').click();
    await page.reload();
    await expect(estrela(page, 'Teste de Jobe')).toHaveAttribute('aria-checked', 'true');
  });

  test('F06-E2 desfavoritar na aba Favoritos tira da lista', async ({ page }) => {
    await abrir(page, '/regiao/ombro');
    await estrela(page, 'Teste de Neer').click();
    await abrir(page, '/favoritos');
    await estrela(page, 'Teste de Neer').click();
    await expect(page.getByText('Nenhum favorito ainda')).toBeVisible();
    await page.reload();
    await expect(page.getByText('Nenhum favorito ainda')).toBeVisible();
  });

  test('F06-E3 duas abas abertas não apagam o favorito uma da outra', async ({ page, context }) => {
    await abrir(page, '/regiao/ombro');
    const outra = await context.newPage();
    await outra.goto('/regiao/ombro');
    await outra.waitForLoadState('networkidle');
    await estrela(page, 'Teste de Neer').click();
    await estrela(outra, 'Teste de Jobe').click();
    await page.reload();
    await expect(estrela(page, 'Teste de Neer')).toHaveAttribute('aria-checked', 'true');
    await expect(estrela(page, 'Teste de Jobe')).toHaveAttribute('aria-checked', 'true');
  });

  test('F06-E4 clique duplo na estrela volta ao estado inicial', async ({ page }) => {
    await abrir(page, '/regiao/ombro');
    await estrela(page, 'Teste de Neer').dblclick();
    await expect(estrela(page, 'Teste de Neer')).toHaveAttribute('aria-checked', 'false');
  });

  test('F06-E5 sem armazenamento no navegador o app funciona', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } });
    });
    await abrir(page, '/regiao/ombro');
    await estrela(page, 'Teste de Neer').click();
    await expect(estrela(page, 'Teste de Neer')).toHaveAttribute('aria-checked', 'true');
  });
});
