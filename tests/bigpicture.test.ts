import { expect, test } from '@playwright/test';
import { format, subMonths } from 'date-fns';

import {
	createAccount,
	createAccountBalanceStatements,
	createAsset,
	createAssetBalanceStatements,
	createTransactions
} from '$lib/pocketbase';
import {
	account401kDetails,
	accountCreditCardDetails,
	accountRothIraDetails,
	accountSavingsDetails
} from '$lib/seed/data/accounts';
import {
	assetCollectibleDetails,
	assetSecurityGamestopDetails,
	assetSecurityTeslaDetails
} from '$lib/seed/data/assets';
import {
	account401kBalanceStatements,
	accountRothIraBalanceStatements,
	assetCollectibleBalanceStatements,
	assetGamestopBalanceStatements,
	assetTeslaBalanceStatements
} from '$lib/seed/data/balanceStatements';
import {
	accountCreditCardTransactionSet,
	accountSavingsTransactionSet
} from '$lib/seed/data/transactions';
import { createVerifiedUniqueUser } from '$lib/seed/data/user';

import { signInAsUser } from './utils';

test('summary totals by balance group', async ({ page }) => {
	const pbAlice = await createVerifiedUniqueUser('alice');

	// Create accounts
	// Balance group 0 / auto-calculated
	const accountSavings = await createAccount(pbAlice, accountSavingsDetails);
	let transactions = await accountSavingsTransactionSet(2);
	await createTransactions(pbAlice, accountSavings.id, transactions);

	// Balance group 1 / auto-calculated
	const accountCreditCard = await createAccount(pbAlice, accountCreditCardDetails);
	transactions = await accountCreditCardTransactionSet(2);
	await createTransactions(pbAlice, accountCreditCard.id, transactions);

	// Balance group 2 / not auto-calculated
	const accountRothIra = await createAccount(pbAlice, accountRothIraDetails);
	await createAccountBalanceStatements(
		pbAlice,
		accountRothIra.id,
		accountRothIraBalanceStatements.slice(0, 1)
	);

	// Create 2 assets
	// Balance group 3
	const assetSecurityTesla = await createAsset(pbAlice, assetSecurityTeslaDetails);
	await createAssetBalanceStatements(
		pbAlice,
		assetSecurityTesla.id,
		assetTeslaBalanceStatements.slice(0, 1)
	);
	const assetSecurityGamestop = await createAsset(pbAlice, assetSecurityGamestopDetails);
	await createAssetBalanceStatements(
		pbAlice,
		assetSecurityGamestop.id,
		assetGamestopBalanceStatements.slice(0, 1)
	);

	// Balance group 4
	const assetCollectible = await createAsset(pbAlice, assetCollectibleDetails);
	await createAssetBalanceStatements(
		pbAlice,
		assetCollectible.id,
		assetCollectibleBalanceStatements.slice(0, 1)
	);

	// Check the calculations
	await signInAsUser(page, pbAlice);
	const netWorthCard = page.locator('.card', { hasText: 'Net worth' });
	const cashCard = page.locator('.card', { hasText: 'Cash' });
	const debtCard = page.locator('.card', { hasText: 'Debt' });
	const investmentsCard = page.locator('.card', { hasText: 'Investments' });
	const otherAssetsCard = page.locator('.card', { hasText: 'Other assets' });
	await expect(netWorthCard).toBeVisible();
	await expect(cashCard).toBeVisible();
	await expect(debtCard).toBeVisible();
	await expect(investmentsCard).toBeVisible();
	await expect(otherAssetsCard).toBeVisible();
	await expect(otherAssetsCard).toBeVisible();
	await expect(netWorthCard).toContainText('$66,321');
	await expect(cashCard).toContainText('$500');
	await expect(debtCard).toContainText('-$340');
	await expect(investmentsCard).toContainText('$51,661');
	await expect(otherAssetsCard).toContainText('$14,500');

	// Check the balance sheet calculations
	await page.getByText('Balance sheet').click();
	await expect(netWorthCard).not.toBeVisible();
	await expect(cashCard).toContainText('$500');
	await expect(debtCard).toContainText('-$340');
	await expect(investmentsCard).toContainText('$51,661');
	await expect(otherAssetsCard).toContainText('$14,500');

	// Check the accounts and assets are grouped correctly
	const savingsCardGroup = page.locator('.card-group', { hasText: 'Savings' });
	await expect(savingsCardGroup).toContainText('Emergency Fund');
	await expect(savingsCardGroup).toContainText('$500');

	const creditCardCardGroup = page.locator('.card-group', { hasText: 'Credit card' });
	await expect(creditCardCardGroup).toContainText('JuggernautCard Limited Rewards');
	await expect(creditCardCardGroup).toContainText('-$340');

	const rothIraCardGroup = page.locator('.card-group', { hasText: 'Roth IRA (US)' });
	await expect(rothIraCardGroup).toContainText('Roth IRA (US)');
	await expect(rothIraCardGroup).toContainText('$18,536');

	const securityCardGroup = page.locator('.card-group', { hasText: 'Security' });
	await expect(securityCardGroup).toContainText('$33,125');
	await expect(securityCardGroup).toContainText('Tesla');
	await expect(securityCardGroup).toContainText('$30,000');
	await expect(securityCardGroup).toContainText('GameStop');
	await expect(securityCardGroup).toContainText('$3,125');

	const otherAssetsCardGroup = page.locator('.card-group', { hasText: 'Collectible' });
	await expect(otherAssetsCardGroup).toContainText('Manchild Card Collection');
	await expect(otherAssetsCardGroup).toContainText('$14,500');
});

test('summary totals update in real-time', async ({ page }) => {
	const pbAlice = await createVerifiedUniqueUser('alice');

	const account401k = await createAccount(pbAlice, account401kDetails);

	await signInAsUser(page, pbAlice);
	const netWorthCard = page.locator('.card', { hasText: 'Net worth' });
	const investmentsCard = page.locator('.card', { hasText: 'Investments' });
	await expect(netWorthCard).toContainText('$0');
	await expect(investmentsCard).toContainText('$0');

	await createAccountBalanceStatements(
		pbAlice,
		account401k.id,
		account401kBalanceStatements.slice(0, 1)
	);

	await expect(netWorthCard).toContainText('$4,251');
	await expect(investmentsCard).toContainText('$4,251');
});

test('cashflow calculations', async ({ page }) => {
	const pbAlice = await createVerifiedUniqueUser('alice');

	// Create transactions
	const accountSavings = await createAccount(pbAlice, accountSavingsDetails);
	let transactions = await accountSavingsTransactionSet(12);
	await createTransactions(pbAlice, accountSavings.id, transactions);

	const accountCreditCard = await createAccount(pbAlice, accountCreditCardDetails);
	transactions = await accountCreditCardTransactionSet(6);
	await createTransactions(pbAlice, accountCreditCard.id, transactions);

	await signInAsUser(page, pbAlice);

	// Cashflow chart
	const today = new Date();
	const period = page.locator('tbody tr');
	await expect(period.first()).toContainText(`${format(subMonths(today, 12), 'MMM')}`);
	await expect(period.first()).toContainText('$0');
	await expect(period.first()).toContainText('0%'); // TODO: should assert the CSS height
	await expect(period.nth(7)).toHaveAttribute('style', 'color: red'); // TODO: Lowest balance should be visible
	await expect(period.nth(7)).toContainText('-$315');
	await expect(period.nth(7)).toContainText('100%'); // TODO: should assert the CSS height
	await expect(period.nth(9)).toHaveAttribute('style', 'color: green'); // TODO: Highest balance should be visible
	await expect(period.nth(9)).toContainText('$410');
	await expect(period.nth(9)).toContainText('100%'); // TODO: should assert the CSS height
	await expect(period.last()).toContainText(`${format(today, 'MMM')}`);
	await expect(period.last()).toContainText('-$170');
	await expect(period.last()).toContainText('54.02%'); // TODO: should assert the CSS height

	// The January period should always includes the abbreviated year
	await expect(page.getByText(`Jan '${format(today, 'yy')}`)).toBeVisible();

	// Trailing cashflow
	const incomeCard = page.locator('.card', { hasText: 'Income per month' });
	const expenseCard = page.locator('.card', { hasText: 'Expenses per month' });
	const balanceCard = page.locator('.card', { hasText: 'Balance per month' });
	await expect(incomeCard).toContainText('$1,680');
	await expect(expenseCard).toContainText('-$1,457');
	await expect(balanceCard).toContainText('$223');

	// Switch to the previous 12 months
	await page.getByText('Previous 12 months').click();
	await expect(incomeCard).toContainText('$944');
	await expect(expenseCard).toContainText('-$729');
	await expect(balanceCard).toContainText('$216');

	// Switch back to the previous 6 months
	await page.getByText('Previous 6 months').click();
	await expect(incomeCard).toContainText('$1,680');
	await expect(expenseCard).toContainText('-$1,457');
	await expect(balanceCard).toContainText('$223');
});
