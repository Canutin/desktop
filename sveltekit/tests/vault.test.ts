import path from 'path';
import fs from 'fs-extra';
import { expect, test } from '@playwright/test';
import { databaseSetUrl } from './fixtures/helpers.js';

test.describe('Vault', () => {
	const testsPath = path.join(process.cwd(), 'tests');

	test.afterEach(async ({ baseURL }) => {
		// Reset DATABASE_URL back to the default value for tests
		const canutinTestVaultPath = path.join(testsPath, '..', 'tmp', 'Canutin.test.vault');
		await databaseSetUrl(baseURL!, `file:${canutinTestVaultPath}`);
	});

	test('New vault is created, migrated and seeded', async ({ page, baseURL }) => {
		const newVaultPath = path.join(testsPath, 'tmp', 'New.test.vault');

		if (fs.existsSync(newVaultPath)) fs.unlinkSync(newVaultPath);
		expect(fs.existsSync(newVaultPath)).toBe(false);

		await databaseSetUrl(baseURL!, `file:${newVaultPath}`);
		await page.goto('/balanceSheet');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
		await expect(page).toHaveURL('/');
		await expect(page).not.toHaveURL(/.*balanceSheet/);
		await expect(page.locator('.layout__a').first()).not.toHaveClass(/layout__a--disabled/);

		await page.reload();
		await expect(
			page.locator('.statusBar', { hasText: 'Data was last updated less than 5 seconds ago' })
		).toBeVisible();
		expect(fs.existsSync(newVaultPath)).toBe(true);
	});

	test("Invalid vaults can't be migrated", async ({ page, baseURL }) => {
		const umigratableVaultPath = path.join(testsPath, 'fixtures', 'Unmigratable.vault.test');

		await databaseSetUrl(baseURL!, `file:${umigratableVaultPath}`);
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'Vault' })).toBeVisible();
		await expect(page).toHaveURL(/.*vault/);
		expect(await page.textContent('p.notice--error')).toBe(
			`The vault at ${umigratableVaultPath} couldn't be migrated`
		);
		await expect(page.locator('.layout__a').first()).toHaveClass(/layout__a--disabled/);
	});

	test("Invalid vaults can't be seeded", async ({ page, baseURL }) => {
		const unseedableVaultPath = path.join(testsPath, 'fixtures', 'Unseedable.vault.test');

		await databaseSetUrl(baseURL!, `file:${unseedableVaultPath}`);
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'Vault' })).toBeVisible();
		await expect(page).toHaveURL(/.*vault/);
		expect(await page.textContent('p.notice--error')).toBe(
			`The vault at ${unseedableVaultPath} wasn't seeded correctly`
		);
		await expect(page.locator('.layout__a').first()).toHaveClass(/layout__a--disabled/);
	});
});
