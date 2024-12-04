import { expect, test } from '@playwright/test';
import { format } from 'date-fns';

import { createAccount, createAccountBalanceStatements, createTransactions } from '$lib/pocketbase';
import {
	accountAutoLoanDetails,
	accountCheckingDetails,
	accountCreditCardDetails,
	accountSavingsDetails
} from '$lib/seed/data/accounts';
import { accountAutoLoanBalanceStatements } from '$lib/seed/data/balanceStatements';
import { accountSavingsTransactionSet } from '$lib/seed/data/transactions';
import { createVerifiedUniqueUser } from '$lib/seed/data/user';

import { signInAsUser } from './utils';

test('user can only see their own accounts', async ({ page }) => {
	const pbAlice = await createVerifiedUniqueUser('alice');
	const pbBob = await createVerifiedUniqueUser('bob');

	await createAccount(pbAlice, accountCheckingDetails);
	await createAccount(pbBob, accountCreditCardDetails);

	await signInAsUser(page, pbAlice);
	await page.locator('nav a', { hasText: 'Accounts' }).click();
	await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
	await expect(page.getByText('JuggernautCard Limited Rewards')).not.toBeVisible();
	await expect(page.getByText('Ransack Laughable-Yield Checking')).toBeVisible();

	await page.getByText('Sign out').click();
	await signInAsUser(page, pbBob);
	await page.locator('nav a', { hasText: 'Accounts' }).click();
	await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
	await expect(page.getByText('JuggernautCard Limited Rewards')).toBeVisible();
	await expect(page.getByText('Ransack Laughable-Yield Checking')).not.toBeVisible();
});

test('accounts list is displayed correctly and updated in real-time', async ({ page }) => {
	const pbAlice = await createVerifiedUniqueUser('alice');

	await signInAsUser(page, pbAlice);
	await page.locator('nav a', { hasText: 'Accounts' }).click();
	await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
	await expect(page.getByText('Emergency Fund')).not.toBeVisible();
	await expect(page.getByText('No accounts found')).toBeVisible();

	// Create an auto-calculated account
	const formattedToday = format(new Date(), 'MMM d, yyyy');
	const accountEmergencyFund = await createAccount(pbAlice, accountSavingsDetails);
	const accountRow = page.locator('tbody tr', { hasText: 'Emergency Fund' });
	await expect(accountRow).toBeVisible();
	await expect(accountRow).toContainText('$0');
	await expect(accountRow).toContainText('Ransack Bank');
	await expect(accountRow).toContainText('Savings');
	await expect(accountRow).toContainText('Auto-calculated');
	await expect(accountRow).toContainText(formattedToday);

	await expect(page.getByText('No accounts found')).not.toBeVisible();

	// Create a transaction to update the account balance
	const transactions = await accountSavingsTransactionSet();
	await createTransactions(pbAlice, accountEmergencyFund.id, transactions.slice(0, 1));
	await expect(accountRow).toContainText('$250');

	// Create a non-auto-calculated account
	await expect(page.getByText('Fiat Auto Loan')).not.toBeVisible();

	const accountAutoLoan = await createAccount(pbAlice, accountAutoLoanDetails);
	const accountAutoLoanRow = page.locator('tbody tr', { hasText: 'Fiat Auto Loan' });
	await expect(accountAutoLoanRow).toBeVisible();
	await expect(accountAutoLoanRow).toContainText('$0');
	await expect(accountAutoLoanRow).toContainText('Fiat Financial Services');
	await expect(accountAutoLoanRow).toContainText('Auto loan');
	await expect(accountAutoLoanRow).toContainText('~');
	await expect(accountAutoLoanRow).toContainText(formattedToday);

	// Create a balance statement to update the account balance
	await createAccountBalanceStatements(
		pbAlice,
		accountAutoLoan.id,
		accountAutoLoanBalanceStatements.slice(1, 2)
	);
	await expect(accountAutoLoanRow).toContainText('-$23,500');

	// Create a newer balance statement
	await createAccountBalanceStatements(
		pbAlice,
		accountAutoLoan.id,
		accountAutoLoanBalanceStatements.slice(0, 1)
	);
	await expect(accountAutoLoanRow).toContainText('-$21,250');

	// Check that the accounts are sorted by name
	const accountRows = page.locator('tbody tr');
	await expect(accountRows.first()).toContainText('Emergency Fund');
	await expect(accountRows.last()).toContainText('Fiat Auto Loan');
});
