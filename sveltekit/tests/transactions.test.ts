import { expect, test } from '@playwright/test';
import { format, startOfMonth, subMonths } from 'date-fns';

import { databaseSeed, databaseWipe } from './fixtures/helpers.js';

test.describe('Transactions', () => {
	test.beforeEach(async ({ baseURL }) => {
		await databaseWipe(baseURL!);
	});

	test('UI is rendered correctly when there are no transactions', async ({ page }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();
		expect(await page.locator('.card', { hasText: 'Transactions' }).textContent()).toMatch('0');
		expect(await page.locator('.card', { hasText: 'Net balance' }).textContent()).toMatch('$0');
		expect(await page.locator('.table').textContent()).toMatch('No transactions found');

		// Check segmented control is set to the correct default value
		const segmentedControls = page.locator('.segmentedControl__button');
		expect(await segmentedControls.nth(0).textContent()).toMatch('All');
		await expect(segmentedControls.nth(0)).toHaveClass(/segmentedControl__button--active/);
		expect(await segmentedControls.nth(1).textContent()).toMatch('Credits');
		await expect(segmentedControls.nth(1)).not.toHaveClass(/segmentedControl__button--active/);
		expect(await segmentedControls.nth(2).textContent()).toMatch('Debits');
		await expect(segmentedControls.nth(2)).not.toHaveClass(/segmentedControl__button--active/);

		// Check out the period filters are set to the correct default values
		const selectOptions = page.locator('.formSelect__select option');
		expect(await selectOptions.count()).toBe(8);
		expect(await selectOptions.nth(0).textContent()).toMatch('This month');
		expect(await selectOptions.nth(1).textContent()).toMatch('Last month');
		expect(await selectOptions.nth(2).textContent()).toMatch('Last 3 months');
		expect(await selectOptions.nth(3).textContent()).toMatch('Last 6 months');
		expect(await selectOptions.nth(4).textContent()).toMatch('Last 12 months');
		expect(await selectOptions.nth(5).textContent()).toMatch('Year to date');
		expect(await selectOptions.nth(6).textContent()).toMatch('Last year');
		expect(await selectOptions.nth(7).textContent()).toMatch('Lifetime');
		expect(await page.locator('.formSelect__select').inputValue()).toMatch('2');

		// Check table columns are in the right order and with the correct default properties
		const tableHeaders = page.locator('button.table__sortable');
		expect(await tableHeaders.count()).toBe(5);
		expect(await tableHeaders.nth(0).textContent()).toMatch('Date');
		await expect(tableHeaders.nth(0)).toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(0)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(0)).toHaveClass(/table__sortable--desc/);
		expect(await tableHeaders.nth(1).textContent()).toMatch('Description');
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--desc/);
		expect(await tableHeaders.nth(2).textContent()).toMatch('Category');
		await expect(tableHeaders.nth(2)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(2)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(2)).not.toHaveClass(/table__sortable--desc/);
		expect(await tableHeaders.nth(3).textContent()).toMatch('Account');
		await expect(tableHeaders.nth(3)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(3)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(3)).not.toHaveClass(/table__sortable--desc/);
		expect(await tableHeaders.nth(4).textContent()).toMatch('Amount');
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--desc/);
	});

	test('UI is rendered correctly when there are transactions present', async ({
		page,
		baseURL
	}) => {
		await databaseSeed(baseURL!);
		await page.goto('/');
		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();

		// NOTE: have to set the locator by the value of the card and then match it to the label,
		// otherwise the card with the label is rendered with a value of "0" and breaks the assertion.
		expect(await page.locator('.card', { hasText: '132' }).textContent()).toMatch('Transactions');
		expect(await page.locator('.card', { hasText: '$2,074.78' }).textContent()).toMatch(
			'Net balance'
		);

		const tableRows = page.locator('.table__tr');
		expect(await tableRows.count()).toBe(132);
		expect(await tableRows.nth(0).textContent()).toMatch('Transfer to MegaCoin Exchange');
		expect(await tableRows.nth(0).textContent()).toMatch('Transfers');
		expect(await tableRows.nth(0).textContent()).toMatch("Bob's Laughable-Yield Checking");
		expect(await tableRows.nth(0).textContent()).toMatch('$0.00');
		expect(await tableRows.nth(131).textContent()).toMatch("Maria's Artisanal Gelato");
		expect(await tableRows.nth(131).textContent()).toMatch('Food & drink');
		expect(await tableRows.nth(131).textContent()).toMatch("Alice's Limited Rewards");
		expect(await tableRows.nth(131).textContent()).toMatch('-$12.67');

		const tableHeaders = page.locator('button.table__sortable');

		// Reverse sort order while sorting by date
		await tableHeaders.nth(0).click();
		await expect(tableHeaders.nth(0)).toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(0)).toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(0)).not.toHaveClass(/table__sortable--desc/);
		expect(await tableRows.nth(0).textContent()).toMatch("Maria's Artisanal Gelato");
		// When the date order is reversed the first 2 transactions become the last 2
		// but they are also sorted in reserve order alphabetically by description.
		expect(await tableRows.nth(131).textContent()).toMatch('Horizon Wireless (Promotional Rebate)');

		// Sort by description
		await tableHeaders.nth(1).click();
		await expect(tableHeaders.nth(0)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(1)).toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(1)).toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--desc/);
		expect(await tableRows.nth(0).textContent()).toMatch('9-5 Office Supplies');

		// Reverse sort order while sorting by description
		await tableHeaders.nth(1).click();
		await expect(tableHeaders.nth(1)).toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(1)).toHaveClass(/table__sortable--desc/);
		expect(await tableRows.nth(0).textContent()).toMatch('alphaStream');

		// Sort by amount
		await tableHeaders.nth(4).click();
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(4)).toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(4)).toHaveClass(/table__sortable--desc/);
		expect(await tableRows.nth(0).textContent()).toMatch('Initech HR * Payroll');
		expect(await tableRows.nth(0).textContent()).toMatch('$2,800.00');

		// Reverse sort order while sorting by amount
		await tableHeaders.nth(4).click();
		await expect(tableHeaders.nth(4)).toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(4)).toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--desc/);
		expect(await tableRows.nth(0).textContent()).toMatch('Westside Apartments');
		expect(await tableRows.nth(0).textContent()).toMatch('-$2,250.00');

		// Check positive values have a different color than 0 and negative value
		await expect(page.locator('.table__td', { hasText: '$2,800.00' }).first()).toHaveClass(
			/table__td--positive/
		);
		await expect(page.locator('.table__td', { hasText: '$0.00' }).first()).not.toHaveClass(
			/table__td--positive/
		);
		await expect(page.locator('.table__td', { hasText: '-$2,250.00' }).first()).not.toHaveClass(
			/table__td--positive/
		);
		await expect(page.locator('.table__excluded', { hasText: '-$24.21' }).first()).toHaveAttribute(
			'title',
			"This transaction is excluded from 'The big picture' and 'Balance sheet' totals"
		);

		// Filter transactions by typing a keyword
		const formInput = page.locator('.formInput');
		await expect(formInput).toHaveAttribute(
			'placeholder',
			'Type to filter by description, amount, category or account'
		);

		await formInput.type('transfer');
		expect(await page.locator('.card', { hasText: '14' }).textContent()).toMatch('Transactions');
		expect(await page.locator('.card', { hasText: '-$3,000.00' }).textContent()).toMatch(
			'Net balance'
		);
		expect(await tableRows.count()).toBe(14);

		// Filter transactions by date range
		const formSelect = page.locator('.formSelect__select');

		// This month
		await formSelect.selectOption('0');
		await formSelect.dispatchEvent('change');
		await formInput.click(); // Need to click on the input field for the change event to really fire
		expect(await tableRows.count()).toBe(4);
		expect(await page.locator('.card', { hasText: '-$500.00' }).textContent()).toMatch(
			'Net balance'
		);

		// Last month
		await formSelect.selectOption('1');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		expect(await tableRows.count()).toBe(4);
		expect(await page.locator('.card', { hasText: '-$1,000.00' }).textContent()).toMatch(
			'Net balance'
		);

		// Last 3 months
		await formSelect.selectOption('2');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		expect(await tableRows.count()).toBe(14);
		expect(await page.locator('.card', { hasText: '-$3,000.00' }).textContent()).toMatch(
			'Net balance'
		);

		// Last 6 months
		await formSelect.selectOption('3');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		expect(await tableRows.count()).toBe(26);
		expect(await page.locator('.card', { hasText: '-$5,500.00' }).textContent()).toMatch(
			'Net balance'
		);

		// Last 12 months
		await formSelect.selectOption('4');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		expect(await tableRows.count()).toBe(50);
		expect(await page.locator('.card', { hasText: '-$10,500.00' }).textContent()).toMatch(
			'Net balance'
		);

		// Year to date
		await formSelect.selectOption('5');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		expect(await tableRows.count()).toBe(32);
		expect(await page.locator('.card', { hasText: '-$6,500.00' }).textContent()).toMatch(
			'Net balance'
		);

		// Last year
		await formSelect.selectOption('6');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		expect(await tableRows.count()).toBe(48);
		expect(await page.locator('.card', { hasText: '-$10,000.00' }).textContent()).toMatch(
			'Net balance'
		);

		// Lifetime
		await formSelect.selectOption('7');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		expect(await tableRows.count()).toBe(96);
		expect(await page.locator('.card', { hasText: '-$20,000.00' }).textContent()).toMatch(
			'Net balance'
		);
	});
});
