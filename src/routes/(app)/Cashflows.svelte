<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import {
		eachMonthOfInterval,
		endOfMonth,
		format,
		isAfter,
		isBefore,
		isEqual,
		sub
	} from 'date-fns';

	import type { TransactionsResponse } from '$lib/pocketbase-types';
	import { getPbClientContext } from '$lib/pocketbase.svelte';
	import { dateInUTC, formatCurrency, proportionBetween } from '$lib/utils';

	interface PeriodCashflow {
		id: number;
		month: Date;
		income: number;
		expenses: number;
		balance: number;
		chartRatio: number;
		isHighestBalance: boolean;
		isLowestBalance: boolean;
	}

	interface CashflowChart {
		positiveRatio: number;
		negativeRatio: number;
	}

	interface Cashflow {
		periods: PeriodCashflow[];
		chart: CashflowChart;
	}

	interface PeriodAverageCashflow {
		incomeAverage: number;
		expensesAverage: number;
		balanceAverage: number;
	}

	interface TrailingCashflow {
		last6Months: PeriodAverageCashflow;
		last12Months: PeriodAverageCashflow;
	}

	// We want 13 periods, one for the current month and the 12 previous months
	const CASHFLOW_PERIODS = 13;
	const SIX_MONTHS = 6;
	const TWELVE_MONTHS = 12;

	const pbClient = getPbClientContext();
	const today = new Date();
	const monthsInPeriod = eachMonthOfInterval({
		start: sub(today, { months: CASHFLOW_PERIODS - 1 }),
		end: endOfMonth(today)
	});

	function zeroedCashflow(): Cashflow {
		const periods: PeriodCashflow[] = [];
		for (const [index, month] of monthsInPeriod.entries()) {
			periods.push({
				id: index,
				income: 0,
				expenses: 0,
				balance: 0,
				month: dateInUTC(month),
				chartRatio: 0,
				isHighestBalance: false,
				isLowestBalance: false
			});
		}

		return {
			periods,
			chart: { positiveRatio: 0, negativeRatio: 0 }
		};
	}

	async function getCashflow() {
		const transactions = await pbClient.pb.collection('transactions').getFullList({
			filter: `date >= "${monthsInPeriod[0].toISOString()}" && date <= "${endOfMonth(today).toISOString()}"`
		});

		const getTransactionsInPeriod = (
			transactions: TransactionsResponse[],
			from: Date,
			to: Date
		) => {
			return transactions.filter((transaction) => {
				return (
					(isBefore(from, transaction.date) || isEqual(from, transaction.date)) &&
					isAfter(to, transaction.date)
				);
			});
		};

		// Get the income, expense and balance totals for each month
		let cashflowPeriods = monthsInPeriod.reduce((acc: PeriodCashflow[], month, id) => {
			const transactionsInPeriod = getTransactionsInPeriod(
				transactions,
				dateInUTC(month),
				monthsInPeriod[id + 1]
					? dateInUTC(monthsInPeriod[id + 1])
					: dateInUTC(endOfMonth(new Date()))
			);

			const income = transactionsInPeriod.reduce(
				(acc, { value }) => (value > 0 ? value + acc : acc),
				0
			);
			const expenses = transactionsInPeriod.reduce(
				(acc, { value }) => (value < 0 ? value + acc : acc),
				0
			);
			const balance = expenses + income;

			return [
				...acc,
				{
					id,
					income,
					expenses,
					balance,
					month,
					// We don't know the value of `chartRatio` at this point so we set it to 0.
					// It will be overwriten later after we get the `highestBalance` and `lowestBalance`.
					chartRatio: 0,
					isHighestBalance: false,
					isLowestBalance: false
				}
			];
		}, []);

		// Get the highest positive balance and lowest negative balance
		const positiveBalancePeriods = cashflowPeriods.filter(({ balance }) => balance > 0);
		const negativeBalancePeriods = cashflowPeriods.filter(({ balance }) => balance < 0);
		const highestBalance =
			positiveBalancePeriods.length > 0
				? Math.max(...positiveBalancePeriods.map((p) => p.balance))
				: 0;
		const lowestBalance =
			negativeBalancePeriods.length > 0
				? Math.min(...negativeBalancePeriods.map((p) => p.balance))
				: 0;

		// The positive and negative ratios are used to calculate the height of the chart bars
		const balanceRange = highestBalance + Math.abs(lowestBalance);
		let positiveRatio = proportionBetween(highestBalance, balanceRange);
		let negativeRatio = proportionBetween(Math.abs(lowestBalance), balanceRange);

		if (positiveRatio > negativeRatio) {
			const isNegativeRatioZero = negativeRatio === 0;
			positiveRatio = isNegativeRatioZero ? 1 : positiveRatio / negativeRatio;
			negativeRatio = isNegativeRatioZero ? 0 : 1;
		} else {
			const isPositiveRatioZero = positiveRatio === 0;
			negativeRatio = isPositiveRatioZero ? 1 : negativeRatio / positiveRatio;
			positiveRatio = isPositiveRatioZero ? 0 : 1;
		}

		// Update the chartRatio and set isHighestBalance and isLowestBalance for each period
		cashflowPeriods = cashflowPeriods.map((cashflowPeriod) => {
			const chartRatio =
				cashflowPeriod.balance > 0
					? proportionBetween(cashflowPeriod.balance, highestBalance)
					: proportionBetween(Math.abs(cashflowPeriod.balance), Math.abs(lowestBalance));

			return {
				...cashflowPeriod,
				chartRatio: chartRatio,
				isHighestBalance: cashflowPeriod.balance === highestBalance && highestBalance !== 0,
				isLowestBalance: cashflowPeriod.balance === lowestBalance && lowestBalance !== 0
			};
		});

		cashflow = {
			periods: cashflowPeriods,
			chart: { positiveRatio, negativeRatio }
		};
	}

	// Calculate the trailing averages for the chosen period
	function getTrailingCashflow(): TrailingCashflow {
		const getAverages = (period: number) => {
			const cashflowPeriods =
				period === SIX_MONTHS
					? cashflow?.periods.slice(SIX_MONTHS, TWELVE_MONTHS)
					: cashflow?.periods.slice(0, TWELVE_MONTHS);

			// Return zeroes if there are no cashflow periods
			if (!cashflowPeriods?.length) {
				return {
					incomeAverage: 0,
					expensesAverage: 0,
					balanceAverage: 0
				};
			}

			const incomeAverage = cashflowPeriods.reduce((acc, { income }) => income + acc, 0) / period;
			const expensesAverage =
				cashflowPeriods.reduce((acc, { expenses }) => expenses + acc, 0) / period;
			const balanceAverage = expensesAverage + incomeAverage;

			return {
				incomeAverage,
				expensesAverage,
				balanceAverage
			};
		};

		return { last6Months: getAverages(SIX_MONTHS), last12Months: getAverages(TWELVE_MONTHS) };
	}

	let cashflow: Cashflow = $state(zeroedCashflow());
	let trailingCashflow: TrailingCashflow = $derived.by(() => getTrailingCashflow());
	let trailingCashflowPeriod: 'last6Months' | 'last12Months' = $state('last6Months');

	$effect(() => {
		getCashflow();
	});
</script>

<h3>{$LL.CASHFLOW()}</h3>

<table>
	<thead>
		<tr>
			<th>Month</th>
			<th>Income</th>
			<th>Expenses</th>
			<th>Balance</th>
			<th>Height</th>
		</tr>
	</thead>
	<tbody>
		{#each cashflow.periods as period}
			{@const isJanuary = period.month.getMonth() === 0}
			<tr
				style={`color: ${period.isHighestBalance ? 'green' : period.isLowestBalance ? 'red' : ''}`}
			>
				<td>
					<time>
						{format(period.month, 'MMM')}
						{isJanuary ? `'${format(period.month, 'yy')}` : ''}
					</time>
				</td>
				<td>{formatCurrency(period.income)}</td>
				<td>{formatCurrency(period.expenses)}</td>
				<td>{formatCurrency(period.balance)}</td>
				<td>{period.chartRatio}%</td>
			</tr>
		{/each}
	</tbody>
</table>

<h3>{$LL.TRAILING_CASHFLOW()}</h3>

<nav>
	<button onclick={() => (trailingCashflowPeriod = 'last6Months')}>
		{$LL.PREVIOUS_6_MONTHS()}
	</button>
	<button onclick={() => (trailingCashflowPeriod = 'last12Months')}>
		{$LL.PREVIOUS_12_MONTHS()}
	</button>
</nav>

<div class="card">
	{$LL.INCOME_PER_MONTH()}
	<p>
		{formatCurrency(
			trailingCashflowPeriod === 'last6Months'
				? trailingCashflow.last6Months.incomeAverage
				: trailingCashflow.last12Months.incomeAverage
		)}
	</p>
</div>
<div class="card">
	{$LL.EXPENSES_PER_MONTH()}
	<p>
		{formatCurrency(
			trailingCashflowPeriod === 'last6Months'
				? trailingCashflow.last6Months.expensesAverage
				: trailingCashflow.last12Months.expensesAverage
		)}
	</p>
</div>
<div class="card">
	{$LL.BALANCE_PER_MONTH()}
	<p>
		{formatCurrency(
			trailingCashflowPeriod === 'last6Months'
				? trailingCashflow.last6Months.balanceAverage
				: trailingCashflow.last12Months.balanceAverage
		)}
	</p>
</div>
