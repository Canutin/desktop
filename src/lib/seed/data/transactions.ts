import { addDays, startOfMonth, subMonths } from 'date-fns';

export interface TransactionDetails {
	description: string;
	value: number;
	date: Date;
	import?: string;
	tag?: string;
	isExcluded?: boolean;
	isPending?: boolean;
}

// Strip timezone from date and set to UTC
const dateInUTC = (date: Date): Date => {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
};

const MONTHS_IN_SET = 24;

export const accountCheckingTransactionSet = async (
	months: number = MONTHS_IN_SET
): Promise<TransactionDetails[]> => {
	const transactionSet = async (i: number): Promise<TransactionDetails[]> => [
		{
			description: 'Westside Apartments',
			value: -2250,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 0)),
			tag: 'Rent',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Initech HR * Payroll',
			value: 2800,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 5)),
			tag: 'Payroll & benefits',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Transfer to Ransack Savings',
			value: -250,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 6)),
			tag: 'Transfers',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Juggernaut Visa Payment',
			value: i % 2 === 0 ? -1750 : -1500,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 7)),
			tag: 'Payments',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Initech HR * Payroll',
			value: 2800,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 20)),
			tag: 'Payroll & benefits',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Transfer to Loot Financial',
			value: -500,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 24)),
			tag: 'Transfers',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Transfer to MegaCoin Exchange',
			value: i % 3 === 0 ? 0 : -500,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 26)),
			tag: 'Transfers',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Toyota - TFS Payment',
			value: -500,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 27)),
			tag: 'Automotive',
			isExcluded: false,
			isPending: false
		}
	];

	let transactions = await transactionSet(0);
	for (let i = 1; i < months; i++) {
		transactions = transactions.concat(await transactionSet(i));
	}

	return transactions;
};

export const accountSavingsTransactionSet = async (
	months: number = MONTHS_IN_SET
): Promise<TransactionDetails[]> => {
	const transactionSet = async (i: number): Promise<TransactionDetails[]> => [
		{
			description: 'Transfer from Ransack Checking',
			value: 250,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 6)),
			tag: 'Transfers',
			isExcluded: false,
			isPending: false
		}
	];

	let transactions = await transactionSet(0);
	for (let i = 1; i < months; i++) {
		transactions = transactions.concat(await transactionSet(i));
	}

	return transactions;
};

export const accountCreditCardTransactionSet = async (
	months: number = MONTHS_IN_SET
): Promise<TransactionDetails[]> => {
	const transactionSet = async (i: number): Promise<TransactionDetails[]> => [
		{
			description: 'Evergreen Market',
			value: -175.75,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 1)),
			tag: 'Groceries',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Evergreen Market',
			value: -135.5,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 7)),
			tag: 'Groceries',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Evergreen Market',
			value: -189.25,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 15)),
			tag: 'Groceries',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Evergreen Market',
			value: -105.5,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 23)),
			tag: 'Groceries',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Chorizo King',
			value: -22.5,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 3)),
			tag: 'Food & drink',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Por Que No Los Tacos?',
			value: -19.25,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 6)),
			tag: 'Food & drink',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Mainely Lobster',
			value: -43.97,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 10)),
			tag: 'Restaurants',
			isExcluded: false,
			isPending: false
		},
		{
			description: "Maria's Artisanal Gelato",
			value: -12.67,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 11)),
			tag: 'Food & drink',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Sunset Cafe',
			value: -17.81,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 14)),
			tag: 'Restaurants',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Stellar Burger',
			value: -16.23,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 20)),
			tag: 'Restaurants',
			isExcluded: false,
			isPending: false
		},
		{
			description: "Roy's Steakhouse",
			value: -55.78,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 25)),
			tag: 'Restaurants',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Stellar Burger',
			value: -19.23,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 26)),
			tag: 'Restaurants',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'NetTV Max',
			value: -14.99,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 2)),
			tag: 'Subscriptions',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Store.com',
			value: -25.9,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 12)),
			tag: 'Shops',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Store.com',
			value: -24.21,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 18)),
			tag: 'Shops',
			isExcluded: true,
			isPending: false
		},
		{
			description: 'Store.com (Refund)',
			value: -24.21,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 26)),
			tag: 'Shops',
			isExcluded: true,
			isPending: false
		},
		{
			description: 'Florida Man (Gas & Convinience Store)',
			value: -25.67,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 7)),
			tag: 'Gas stations',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Florida Man (Gas & Convinience Store)',
			value: -40.01,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 24)),
			tag: 'Gas stations',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Horizon Wireless',
			value: -90.5,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 2)),
			tag: 'Internet & phone',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Patriot Insurance',
			value: -135.67,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 27)),
			tag: 'Insurance',
			isExcluded: false,
			isPending: false
		},
		{
			description: i % 7 === 0 ? 'Hølm Home' : 'The Hardware Center',
			value: i % 7 === 0 ? -215.43 : -95.89,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 16)),
			tag: i % 2 === 0 ? 'Furnishings' : 'Home maintenance',
			isExcluded: false,
			isPending: false
		},
		{
			description: i % 5 === 0 ? 'ShortCircut Computers' : 'alphaStream',
			value: i % 5 === 0 ? -649.99 : -4.99,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 26)),
			tag: i % 5 === 0 ? 'Electronics' : 'Music',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'PurpleShield Health',
			value: -254.84,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 3)),
			tag: 'Health',
			isExcluded: false,
			isPending: false
		},
		{
			description: i % 7 === 0 ? 'Narby Warker' : "Stefano's Pizza by the Slice",
			value: i % 7 === 0 ? -150 : -7.78,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 13)),
			tag: i % 7 === 0 ? 'Health' : 'Restaurants',
			isExcluded: false,
			isPending: false
		},
		{
			description: i % 9 === 0 ? '9-5 Office Supplies' : 'Flix Movie Rentals',
			value: i % 9 === 0 ? -98.23 : -4.99,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 13)),
			tag: i % 9 === 0 ? 'Office supplies' : 'Entertainment & recreation',
			isExcluded: false,
			isPending: false
		},
		{
			description:
				i % 11 === 0 ? 'Horizon Wireless (Promotional Rebate)' : 'Juggernaut Cash Back Redemption',
			value: i % 11 === 0 ? 445 : 25.33,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 15)),
			tag: i % 11 === 0 ? 'Internet & phone' : 'Financial & banking',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Ransack Bank Payment Received — Thank You',
			value: i % 3 === 0 ? 1755 : i % 6 === 0 ? 2355 : i % 9 === 0 ? 1945 : 1675,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 8)),
			tag: 'Payments',
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Juggernaut Visa Interest',
			value: -56.89,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 8)),
			tag: 'Fees',
			isExcluded: false,
			isPending: false
		}
	];

	let transactions = await transactionSet(0);
	for (let i = 1; i < months; i++) {
		transactions = transactions.concat(await transactionSet(i));
	}

	return transactions;
};
