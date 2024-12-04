import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: [
		{
			command: 'npm run pb:clean && npm run pb',
			port: 8090
		},
		{
			command: 'npm run build && npm run preview',
			port: 4173
		}
	],
	timeout: 5000,
	fullyParallel: true,
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	projects: [
		{
			name: 'setup',
			testMatch: /global\.setup\.ts/
		},
		{
			name: 'tests',
			dependencies: ['setup']
		}
	],
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'retain-on-failure',
		viewport: { width: 1280, height: 1024 }
	},
	snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
	expect: {
		toMatchSnapshot: {
			maxDiffPixels: 500
		}
	}
};

export default config;
