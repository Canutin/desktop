import { expect, test } from '@playwright/test';
import { format } from 'date-fns';

import { createAsset, createAssetBalanceStatements } from '$lib/pocketbase';
import {
	assetCryptoBitcoinDetails,
	assetSecurityGamestopDetails,
	assetSecurityTeslaDetails
} from '$lib/seed/data/assets';
import {
	assetBitcoinBalanceStatements,
	assetGamestopBalanceStatements
} from '$lib/seed/data/balanceStatements';
import { createVerifiedUniqueUser } from '$lib/seed/data/user';

import { signInAsUser } from './utils';

test('user can only see their own assets', async ({ page }) => {
	const pbAlice = await createVerifiedUniqueUser('alice');
	const pbBob = await createVerifiedUniqueUser('bob');

	await createAsset(pbAlice, assetSecurityTeslaDetails);
	await createAsset(pbBob, assetCryptoBitcoinDetails);

	await signInAsUser(page, pbAlice);
	await page.locator('nav a', { hasText: 'Assets' }).click();
	await expect(page.locator('h1', { hasText: 'Assets' })).toBeVisible();
	await expect(page.getByText('Bitcoin')).not.toBeVisible();
	await expect(page.getByText('Tesla')).toBeVisible();

	await page.getByText('Sign out').click();
	await signInAsUser(page, pbBob);
	await page.locator('nav a', { hasText: 'Assets' }).click();
	await expect(page.locator('h1', { hasText: 'Assets' })).toBeVisible();
	await expect(page.getByText('Bitcoin')).toBeVisible();
	await expect(page.getByText('Tesla')).not.toBeVisible();
});

test('assets list is displayed correctly and updated in real-time', async ({ page }) => {
	const pbAlice = await createVerifiedUniqueUser('alice');

	await signInAsUser(page, pbAlice);
	await page.locator('nav a', { hasText: 'Assets' }).click();
	await expect(page.locator('h1', { hasText: 'Assets' })).toBeVisible();
	await expect(page.getByText('No assets found')).toBeVisible();

	const formattedToday = format(new Date(), 'MMM d, yyyy');
	const assetGameStop = await createAsset(pbAlice, assetSecurityGamestopDetails);
	const assetGameStopRow = page.locator('tbody tr', { hasText: 'GameStop' });
	await expect(assetGameStopRow).toBeVisible();
	await expect(assetGameStopRow).toContainText('~');
	await expect(assetGameStopRow).toContainText('GME');
	await expect(assetGameStopRow).toContainText('$0');
	await expect(page.getByText('No assets found')).not.toBeVisible();

	await createAssetBalanceStatements(
		pbAlice,
		assetGameStop.id,
		assetGamestopBalanceStatements.slice(0, 1)
	);
	await expect(assetGameStopRow).toContainText('$3,125');
	await expect(assetGameStopRow).toContainText('125');
	await expect(assetGameStopRow).toContainText('$25');
	await expect(assetGameStopRow).toContainText(formattedToday);

	const assetBitcoinRow = page.locator('tbody tr', { hasText: 'Bitcoin' });
	await expect(assetBitcoinRow).not.toBeVisible();

	const assetBitcoin = await createAsset(pbAlice, assetCryptoBitcoinDetails);
	await createAssetBalanceStatements(
		pbAlice,
		assetBitcoin.id,
		assetBitcoinBalanceStatements.slice(1, 2)
	);
	await expect(assetBitcoinRow).toContainText('Bitcoin');
	await expect(assetBitcoinRow).toContainText('Cryptocurrency');
	await expect(assetBitcoinRow).toContainText('$43,500'); // Flaky assertion
	await expect(assetBitcoinRow).toContainText('1.4');
	await expect(assetBitcoinRow).toContainText('$60,900');
	await expect(assetBitcoinRow).toContainText(formattedToday);

	// Create a newer balance statement
	await createAssetBalanceStatements(
		pbAlice,
		assetBitcoin.id,
		assetBitcoinBalanceStatements.slice(0, 1)
	);
	await expect(assetBitcoinRow).toContainText('$46,280');
	await expect(assetBitcoinRow).toContainText('1.5');
	await expect(assetBitcoinRow).toContainText('$69,420');

	// Check that the assets are sorted by name
	const assetRows = page.locator('tbody tr');
	await expect(assetRows.first()).toContainText('Bitcoin');
	await expect(assetRows.last()).toContainText('GameStop');
});
