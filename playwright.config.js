import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4187/azure-database-navigator/',
    browserName: 'chromium',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [375, 768, 1024, 1440].flatMap((width) => ['light', 'dark'].map((theme) => ({
    name: `${width}-${theme}`,
    use: { viewport: { width, height: 1000 }, colorScheme: theme },
    metadata: { theme }
  }))),
  webServer: {
    command: 'node scripts/serve.mjs',
    env: { PORT: '4187' },
    url: 'http://127.0.0.1:4187/azure-database-navigator/',
    reuseExistingServer: false
  }
});
