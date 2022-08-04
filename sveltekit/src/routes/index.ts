import { isAfter, isBefore, sub, eachMonthOfInterval, isEqual, endOfMonth } from 'date-fns';

import prisma from '$lib/helpers/prismaClient';
import {
	getBalanceGroupLabel,
	SortOrder,
	BalanceGroup,
	TrailingCashflowPeriods
} from '$lib/helpers/constants';
import { getAccountCurrentBalance } from '$lib/helpers/accounts';
import { getAssetCurrentBalance } from '$lib/helpers/assets';
import { sortByKey } from '$lib/helpers/misc';

interface BigPictureBalanceGroup {
	id: BalanceGroup;
	label: string;
	currentBalance: number;
}

export interface BigPictureSummary {
	netWorth: number;
	balanceGroups: BigPictureBalanceGroup[];
}

export const GET = async () => {
	// Get Accounts and Assets
	const accounts = await prisma.account.findMany();
	const assets = await prisma.asset.findMany();
	const balanceItems = [...accounts, ...assets];

	const bigPictureBalanceGroups: BigPictureBalanceGroup[] = [];

	for (const balanceItem of balanceItems) {
		const currentBalance =
			'accountTypeId' in balanceItem // It's an Account if has the property `accountType`
				? await getAccountCurrentBalance(balanceItem)
				: await getAssetCurrentBalance(balanceItem);

		// Skip `balanceItems` with a `currentBalance` of 0
		if (currentBalance === 0) continue;

		const { balanceGroup } = balanceItem;

		// Find existing balanceGroup
		const bigPictureBalanceGroup = bigPictureBalanceGroups.find(({ id }) => id === balanceGroup);

		if (bigPictureBalanceGroup) {
			// Add currentBalance to existing group
			bigPictureBalanceGroup.currentBalance += currentBalance;
		} else {
			// Push new group
			bigPictureBalanceGroups.push({
				id: balanceGroup,
				label: getBalanceGroupLabel(balanceGroup),
				currentBalance
			});
		}
	}

	// Add balanceGroups with a balance of $0 for those without any balances
	const balanceGroups = Object.values(BalanceGroup).filter(
		(balanceGroup) => typeof balanceGroup === 'number'
	);
	for (const balanceGroup of balanceGroups) {
		if (!bigPictureBalanceGroups.find(({ id }) => id === balanceGroup)) {
			bigPictureBalanceGroups.push({
				id: balanceGroup as BalanceGroup,
				label: getBalanceGroupLabel(balanceGroup as BalanceGroup),
				currentBalance: 0
			});
		}
	}

	// Sort `balanceSheetBalanceGroups` by `balanceGroup`
	sortByKey(bigPictureBalanceGroups, 'id', SortOrder.DESC);

	// Calculate `netWorth` by the sum of all `balanceGroups` current balances
	const bigPictureSummary: BigPictureSummary = {
		netWorth: bigPictureBalanceGroups.reduce(
			(sum, { currentBalance }) => (sum += currentBalance),
			0
		),
		balanceGroups: bigPictureBalanceGroups
	};

	const trailingCashflow = await getTrailingCashflow();

	return {
		body: {
			bigPictureSummary,
			trailingCashflow
		}
	};
};

interface TransactionForCashflow {
	date: Date;
	value: number;
}

interface PeriodCashflow {
	month: Date;
	income: number;
	expenses: number;
	surplus: number;
	id: number;
}

interface PeriodAverageCashflow {
	incomeAverage: number;
	expensesAverage: number;
	surplusAverage: number;
}

export interface TrailingCashflow {
	periods: PeriodCashflow[];
	last6Months: PeriodAverageCashflow;
	last12Months: PeriodAverageCashflow;
}

const getTrailingCashflow = async () => {
	const transactions = await prisma.transaction.findMany({
		where: {
			date: {
				lte: new Date(),
				gte: sub(new Date(), { months: 13 })
			},
			isExcluded: false
		},
		select: {
			date: true,
			value: true
		},
		orderBy: {
			date: 'desc'
		}
	});

	// Don't continue if there are no transactions
	if (transactions.length === 0) return;

	const monthDates = eachMonthOfInterval({
		start: transactions[transactions.length - 1].date,
		end: new Date()
	});

	const getTransactionsInPeriod = (
		transactions: TransactionForCashflow[],
		from: Date,
		to: Date
	) => {
		return transactions.filter(
			(transaction) =>
				(isBefore(from, transaction.date) || isEqual(from, transaction.date)) &&
				isAfter(to, transaction.date)
		);
	};

	const dateInUTC = (date: Date) => {
		return new Date(
			Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0)
		);
	};

	const monthlyCashflow = monthDates.reduce((acc: PeriodCashflow[], monthDate, index) => {
		const monthlyTransactions = getTransactionsInPeriod(
			transactions,
			dateInUTC(monthDate),
			monthDates[index + 1] ? dateInUTC(monthDates[index + 1]) : dateInUTC(endOfMonth(new Date()))
		);

		const income = monthlyTransactions.reduce(
			(acc, { value }) => (value > 0 ? value + acc : acc),
			0
		);
		const expenses = monthlyTransactions.reduce(
			(acc, { value }) => (value < 0 ? value + acc : acc),
			0
		);
		const surplus = expenses + income;

		return [
			...acc,
			{
				month: monthDate,
				income,
				expenses,
				surplus,
				id: index
			}
		];
	}, []);

	const getAverages = (period: TrailingCashflowPeriods) => {
		const months = period === TrailingCashflowPeriods.LAST_6_MONTHS ? 6 : 12;

		const incomeAverage =
			monthlyCashflow.slice(0, months).reduce((acc, { income }) => income + acc, 0) / months;
		const expensesAverage =
			monthlyCashflow.slice(0, months).reduce((acc, { expenses }) => expenses + acc, 0) / months;
		const surplusAverage = expensesAverage + incomeAverage;

		return {
			incomeAverage,
			expensesAverage,
			surplusAverage
		};
	};

	const last6Months = getAverages(TrailingCashflowPeriods.LAST_6_MONTHS);
	const last12Months = getAverages(TrailingCashflowPeriods.LAST_12_MONTHS);

	return { periods: monthlyCashflow, last6Months, last12Months };
};
