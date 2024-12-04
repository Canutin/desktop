import { expect, test } from '@playwright/test';

import { createAccount } from '$lib/pocketbase';
import { accountCheckingDetails } from '$lib/seed/data/accounts';
import { createVerifiedUniqueUser } from '$lib/seed/data/user';

import { signInAsUser } from './utils';

test('imports a CSV file', async ({ page }) => {
	await page.goto('/');
	const pbAlice = await createVerifiedUniqueUser('alice');
	await signInAsUser(page, pbAlice);
	await createAccount(pbAlice, accountCheckingDetails);

	await page.getByText('Balance sheet').click();
	const checkingAccountBalance = page
		.locator('li', { hasText: accountCheckingDetails.name })
		.last();
	await expect(checkingAccountBalance).toContainText('$0');
	await expect(checkingAccountBalance).not.toContainText('-$948');

	await page.getByText('Add or update data').click();
	await expect(page.locator('h1', { hasText: 'Import transactions from CSV' })).not.toBeVisible();

	await page.getByText('Import transactions from CSV').click();
	await expect(page.locator('h1', { hasText: 'Import transactions from CSV' })).toBeVisible();

	const accountField = page.getByLabel('Account');
	await expect(accountField).toBeDisabled();

	await page.getByLabel('File').setInputFiles('tests/fixtures/ARGENTINIAN_DATE_AND_TAGS.csv');
	await expect(accountField).not.toBeDisabled();

	const dateField = page.getByLabel('Date');
	const descriptionField = page.getByLabel('Description');
	const amountField = page.getByLabel('Amount', { exact: true });
	const tagField = page.getByLabel('Tag');
	const importButton = page.getByText('Import', { exact: true });
	await expect(dateField).toBeDisabled();
	await expect(descriptionField).toBeDisabled();
	await expect(amountField).toBeDisabled();
	await expect(tagField).toBeDisabled();

	await accountField.selectOption(accountCheckingDetails.name);
	await expect(page.getByText('Transactions found in file: 0')).toBeVisible();
	await expect(dateField).not.toBeDisabled();
	await expect(descriptionField).not.toBeDisabled();
	await expect(amountField).not.toBeDisabled();
	await expect(tagField).not.toBeDisabled();
	await expect(page.getByText('No data to preview')).toBeVisible();
	expect(await page.locator('tbody tr').count()).toBe(1);

	await dateField.selectOption('Date');
	await expect(page.getByText('No data to preview')).not.toBeVisible();
	expect(await page.locator('tbody tr').count()).toBe(2);
	await expect(page.getByText('Transactions found in file: 2')).toBeVisible();
	await expect(page.getByText('Transactions that can be imported: 0')).toBeVisible();

	const firstRow = page.locator('tbody tr').first();
	await expect(firstRow).toContainText(accountCheckingDetails.name);
	await expect(firstRow).toContainText('Jan 12, 2024');
	await expect(firstRow).toContainText('~');
	await expect(firstRow).not.toContainText('Coto');
	await expect(firstRow).not.toContainText('-$765.29');

	await amountField.selectOption('Amount');
	await expect(firstRow).toContainText('-$765.29');

	await tagField.selectOption('Category');
	await expect(firstRow).toContainText('Groceries');
	await expect(importButton).toBeDisabled();

	await descriptionField.selectOption('Description');
	await expect(firstRow).toContainText('Coto');
	await expect(firstRow).not.toContainText('~');
	await expect(importButton).not.toBeDisabled();
	await expect(page.getByText('Transactions that can be imported: 2')).toBeVisible();

	await importButton.click();
	await page.getByText('Review import').click();
	await expect(checkingAccountBalance).not.toContainText('$0');
	await expect(checkingAccountBalance).toContainText('-$948');
});

test('imports a CSV with separate credit and debit columns', async ({ page }) => {
	await page.goto('/');
	const pbAlice = await createVerifiedUniqueUser('alice');
	await signInAsUser(page, pbAlice);
	await createAccount(pbAlice, accountCheckingDetails);

	await page.getByText('Add or update data').click();
	await page.getByText('Import transactions from CSV').click();
	await page
		.getByLabel('File')
		.setInputFiles('tests/fixtures/AMERICAN_DATE_POSITIVE_AND_NEGATIVE_AMOUNT_COLUMNS.csv');
	await page.getByLabel('Account').selectOption(accountCheckingDetails.name);

	// Map the basic fields
	await page.getByLabel('Date').selectOption('Date');
	await page.getByLabel('Description').selectOption('Description');

	// Enable and configure dual value columns
	await page.getByLabel('Credits and debits are in separate columns').check();
	await page.getByLabel('Credits', { exact: true }).selectOption('Deposit');
	await page.getByLabel('Debits', { exact: true }).selectOption('Withdrawal');

	// Verify preview shows correct amounts
	const firstRow = page.locator('tbody tr').first();
	await expect(firstRow).toContainText('$5.46'); // First withdrawal amount
	await expect(page.getByText('Transactions that can be imported: 9')).toBeVisible();

	// Import CSV
	await page.getByText('Import', { exact: true }).click();
	await expect(page.getByText('Import successful')).toBeVisible();

	// Test reset functionality
	await page.getByText('New import').click();
	await expect(page.getByLabel('File')).toHaveValue('');
	await expect(page.getByText('No data to preview')).toBeVisible();

	// Check that the account balance has been updated
	await page.getByText('Balance sheet').click();
	const checkingAccountBalance = page
		.locator('li', { hasText: accountCheckingDetails.name })
		.last();
	await expect(checkingAccountBalance).not.toContainText('$0');
	await expect(checkingAccountBalance).toContainText('-$79');
});

test('handles import errors gracefully', async ({ page }) => {
	await page.goto('/');
	const pbAlice = await createVerifiedUniqueUser('alice');
	await signInAsUser(page, pbAlice);
	await createAccount(pbAlice, accountCheckingDetails);

	await page.getByText('Add or update data').click();
	await page.getByText('Import transactions from CSV').click();
	await page.getByLabel('File').setInputFiles('tests/fixtures/ARGENTINIAN_DATE_AND_TAGS.csv');
	await page.getByLabel('Account').selectOption(accountCheckingDetails.name);

	// Map the columns correctly
	await page.getByLabel('Date').selectOption('Date');
	await page.getByLabel('Description').selectOption('Description');
	await page.getByLabel('Amount', { exact: true }).selectOption('Amount');

	// Mock a network error for the import request
	await page.route('**/api/collections/transactions/records', async (route) => {
		await route.fulfill({
			status: 500,
			body: JSON.stringify({ message: 'Internal Server Error' })
		});
	});

	await page.getByText('Import', { exact: true }).click();
	await expect(page.getByText(/error/i)).toBeVisible();
	await expect(page.locator('.error')).toContainText('Internal Server Error');
});

test('imports a CSV with missing key values', async ({ page }) => {
	await page.goto('/');
	const pbAlice = await createVerifiedUniqueUser('alice');
	await signInAsUser(page, pbAlice);
	await createAccount(pbAlice, accountCheckingDetails);

	await page.getByText('Add or update data').click();
	await page.getByText('Import transactions from CSV').click();
	await page.getByLabel('File').setInputFiles('tests/fixtures/MOSTLY_INCOMPLETE_FILE.csv');
	await page.getByLabel('Account').selectOption(accountCheckingDetails.name);

	// Map the columns correctly
	await page.getByLabel('Date').selectOption('Date');
	await page.getByLabel('Description').selectOption('Description');
	await page.getByLabel('Credits and debits are in separate columns').check();
	await page.getByLabel('Debits', { exact: true }).selectOption('Withdrawal');
	await page.getByLabel('Credits', { exact: true }).selectOption('Deposit');

	// Verify that only one transaction can be imported
	await expect(page.getByText('Transactions found in file: 5')).toBeVisible();
	await expect(page.getByText('Transactions that can be imported: 2')).toBeVisible();

	// Check that the rows that can be imported have the 'success-bg' class
	await expect(page.locator('tbody tr.success-bg')).toHaveCount(2);

	// Attempt to import and verify the result
	await page.getByText('Import', { exact: true }).click();
	await expect(page.getByText('Import successful')).toBeVisible();

	// Check that the account balance has been updated
	await page.getByText('Review import').click();
	const checkingAccountBalance = page
		.locator('li', { hasText: accountCheckingDetails.name })
		.last();
	await expect(checkingAccountBalance).toContainText('-$100');
});
