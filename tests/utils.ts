import { expect, type Page } from '@playwright/test';

import { POCKETBASE_SEED_DEFAULT_PASSWORD } from '$lib/pocketbase';
import type { UsersResponse } from '$lib/pocketbase-types';

export async function signInAsUser(page: Page, user: UsersResponse) {
	await page.goto('/');
	await page.getByLabel('Email').fill(user.email);
	await page.getByLabel('Password').fill(POCKETBASE_SEED_DEFAULT_PASSWORD);
	await expect(page.locator('h1', { hasText: 'The big picture' })).not.toBeVisible();

	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
}
