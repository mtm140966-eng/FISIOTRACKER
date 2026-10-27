import { defineConfig, devices } from '@playwright/test';

// Os testes rodam na versão web do app, com 390 px de largura (celular).
// O servidor do Supabase é imitado dentro do navegador (e2e/apoio.ts).
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'e2e-resultado.json' }]],
  use: {
    baseURL: 'http://localhost:8098',
    ...devices['Pixel 7'],
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx expo start --web --port 8098',
    url: 'http://localhost:8098',
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      EXPO_OFFLINE: '1',
      BROWSER: 'none',
      EXPO_PUBLIC_SUPABASE_URL: 'http://supabase.e2e.invalid',
      EXPO_PUBLIC_SUPABASE_CHAVE_PUBLICA: 'chave-e2e',
    },
  },
});
