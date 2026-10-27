import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function semProblemasDeAcessibilidade(page: Page) {
  const r = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'] })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  const erros: string[] = [];
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  page.on('response', (r) => r.status() >= 500 && erros.push(`${r.status()} ${r.url()}`));
  test.info().annotations.push({ type: 'erros', description: '' });
  (page as unknown as { erros: string[] }).erros = erros;
});

test.afterEach(async ({ page }) => {
  expect((page as unknown as { erros: string[] }).erros, 'erros no console ou 5xx').toEqual([]);
});

test.describe('P01 entrar no painel', () => {
  test('P01-H1 e-mail válido mostra a mensagem neutra', async ({ page }) => {
    await page.goto('/entrar');
    await semProblemasDeAcessibilidade(page);
    await page.getByLabel('E-mail').fill('editor@exemplo.test');
    await page.getByRole('button', { name: 'Enviar link de acesso' }).click();
    await expect(page.getByRole('status')).toContainText('Se este e-mail for de um editor');
  });

  test('P01-N1 e-mail inválido é recusado também no servidor', async ({ page }) => {
    await page.goto('/entrar');
    await page.locator('form').evaluate((f) => ((f as HTMLFormElement).noValidate = true));
    await page.getByLabel('E-mail').fill('nao-e-email');
    await page.getByRole('button', { name: 'Enviar link de acesso' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Confira' })).toHaveText('Confira o e-mail.');
    await expect(page.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true');
  });

  test('P01-E1 páginas internas exigem login', async ({ page }) => {
    for (const caminho of ['/', '/testes', '/testes/novo', '/publicar', '/testes/00000000-0000-0000-0000-000000000000']) {
      await page.goto(caminho);
      await expect(page, caminho).toHaveURL(/\/entrar$/);
    }
  });

  test('P01-E2 tema escuro e tela larga', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/entrar');
    await semProblemasDeAcessibilidade(page);
  });

  test('P01-E3 clique duplo em enviar', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByLabel('E-mail').fill('editor@exemplo.test');
    await page.getByRole('button', { name: 'Enviar link de acesso' }).dblclick();
    await expect(page.getByRole('status')).toContainText('Se este e-mail for de um editor');
  });

  test('P01-E4 link de confirmação incompleto volta para entrar', async ({ page }) => {
    await page.goto('/auth/confirmar');
    await expect(page).toHaveURL(/\/entrar$/);
    await page.goto('/auth/confirmar?token_hash=abc&type=email');
    await expect(page).toHaveURL(/\/entrar$/);
  });
});
