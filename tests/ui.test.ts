import { expect, test } from '@playwright/test';

import { createVerifiedUniqueUser } from '$lib/seed/data/user';

import { signInAsUser } from './utils';

test('page titles', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle('Sign in • Canutin');
	await expect(page).toHaveURL('/auth');

	// When signed out, 404's redirect back to /auth
	await page.goto('/404');
	await expect(page).toHaveTitle('Sign in • Canutin');
	await expect(page).toHaveURL('/auth');

	const pbAlice = await createVerifiedUniqueUser('alice');
	await signInAsUser(page, pbAlice);
	await expect(page).toHaveTitle('The big picture • Canutin');
	await expect(page).toHaveURL('/');

	await page.goto('/balance-sheet');
	await expect(page).toHaveTitle('Balance sheet • Canutin');
	await expect(page).toHaveURL('/balance-sheet');

	await page.goto('/404');
	await expect(page).toHaveTitle('Error 404 • Canutin');
	await expect(page).toHaveURL('/404');
});
