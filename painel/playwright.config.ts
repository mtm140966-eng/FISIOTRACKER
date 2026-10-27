import { defineConfig } from '@playwright/test';

// Só o que não depende de login. O fluxo logado precisa do Supabase de verdade:
// checklist manual em replica/test-plan.md.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'e2e-resultado.json' }]],
  use: { baseURL: 'http://localhost:3010', viewport: { width: 390, height: 844 } },
  webServer: {
    command: 'npx next build && npx next start --port 3010',
    url: 'http://localhost:3010/entrar',
    reuseExistingServer: true,
    timeout: 300_000,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
      // endereço que não existe: o login "falha" do lado do servidor, como um Supabase fora do ar
      NEXT_PUBLIC_SUPABASE_URL: 'http://supabase.e2e.invalid',
      NEXT_PUBLIC_SUPABASE_CHAVE_PUBLICA: 'chave-e2e',
    },
  },
});
