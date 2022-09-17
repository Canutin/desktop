import { type PlaywrightTestConfig, devices } from '@playwright/test';
import { pathToTestVault } from './tests/fixtures/helpers.js';

const isEnvCI = process.env.NODE_ENV === 'CI';

const enableMultipleBrowsers = [
	{
		name: 'chromium',
		use: { ...devices['Desktop Chrome'] }
	},
	{
		name: 'firefox',
		use: { ...devices['Desktop Firefox'] }
	},
	{
		name: 'webkit',
		use: { ...devices['Desktop Safari'] }
	}
];

const config: PlaywrightTestConfig = {
	globalSetup: './tests/fixtures/global-setup.ts',
	retries: isEnvCI ? 3 : 0,
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		env: {
			ELECTRON_SWITCHED_VAULT: 'true',
			DATABASE_URL: `file:${pathToTestVault}`,
			APP_VERSION: '4.2.0-next.69'
		}
	},
	use: {
		trace: isEnvCI ? 'off' : 'retain-on-failure',
		screenshot: isEnvCI ? 'off' : 'only-on-failure'
	},
	projects: isEnvCI ? enableMultipleBrowsers : undefined,
	// Can't have more than 1 worker because the tests read/write to the same DB at the same time
	workers: 1
};

export default config;
