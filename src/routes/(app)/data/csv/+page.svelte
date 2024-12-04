<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { format } from 'date-fns';
	import Papa from 'papaparse';

	import { getAccountsContext } from '$lib/accounts.svelte';
	import Field from '$lib/components/Field';
	import Head from '$lib/components/Head.svelte';
	import { createTransactions } from '$lib/pocketbase';
	import type { TransactionsRecord } from '$lib/pocketbase-types';
	import { getPbClientContext } from '$lib/pocketbase.svelte';
	import type { TransactionDetails } from '$lib/seed/data/transactions';
	import { formatCurrency } from '$lib/utils';

	interface PreviewTransaction {
		date?: Date;
		description?: string;
		value?: number;
		tag?: string;
		import: string;
	}

	const pbClient = getPbClientContext();
	const accountsStore = getAccountsContext();
	const transactionFields: (keyof TransactionsRecord)[] = [
		'date',
		'description',
		'value',
		'tag',
		'account'
	];

	let file: File | null = $state(null);
	let csvData: Record<string, string | number | null>[] = $state([]);
	let csvHeaders: string[] = $state([]);
	let useCreditDebitColumns = $state(false);
	let creditColumn = $state('');
	let debitColumn = $state('');
	let errorMessage = $state<string | null>(null);
	let isImporting = $state(false);
	let wasSuccessful = $state(false);
	let columnMapping: Record<keyof TransactionsRecord, string> = $state({
		date: '',
		description: '',
		value: '',
		isExcluded: '',
		isPending: '',
		tag: '',
		account: '',
		import: ''
	});

	const isMappingFieldDisabled = $derived(!csvHeaders.length || !columnMapping.account);

	const previewTransactions: PreviewTransaction[] = $derived.by(() => {
		return (
			csvData
				// Filter out CSV headers
				.filter((row) => Object.values(row).some((value) => value !== null && value !== ''))
				// Filter out rows where date or description are not set
				.filter((row) => row[columnMapping.date] || row[columnMapping.description])
				.map((row) => {
					return {
						date: row[columnMapping.date] ? new Date(row[columnMapping.date] as string) : undefined,
						description: row[columnMapping.description] as string,
						tag: row[columnMapping.tag] as string,
						value: handleValueField(row),
						import: JSON.stringify(row)
					};
				})
		);
	});

	const importTransactions: TransactionDetails[] = $derived.by(() => {
		return previewTransactions.filter((transaction): transaction is Required<TransactionDetails> =>
			isTransactionImportable(transaction)
		);
	});

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			file = input.files[0];
			if (!file) return;

			Papa.parse(file, {
				complete: (results) => {
					csvData = results.data as Record<string, string | number | null>[];
					csvHeaders = results.meta.fields ?? [];
				},
				header: true
			});
		}
	}

	function formatValueField(value: string, isDebit: boolean = false): number | undefined {
		if (!value) return undefined;
		let parsedValue = value ? parseFloat(value.replace(/[^\d.-]/g, '')) : 0;
		if (isDebit) parsedValue = parsedValue * -1;
		return parsedValue;
	}

	function handleValueField(row: Record<string, string | number | null>) {
		let value: number | undefined = undefined;
		if (useCreditDebitColumns) value = formatValueField(row[creditColumn] as string);
		if (useCreditDebitColumns && !value) value = formatValueField(row[debitColumn] as string, true);
		if (!useCreditDebitColumns) value = formatValueField(row[columnMapping.value] as string);
		return value;
	}

	async function importData() {
		wasSuccessful = false;
		errorMessage = null;
		if (!importTransactions.length) return;
		try {
			isImporting = true;
			await createTransactions(pbClient.pb, columnMapping.account, importTransactions);
			wasSuccessful = true;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unknown error';
		} finally {
			isImporting = false;
		}
	}

	function isTransactionImportable(transaction: PreviewTransaction): boolean {
		const { date, description, value } = transaction;
		return !!date && !!description && typeof value === 'number';
	}

	function resetImport() {
		file = null;
		csvData = [];
		csvHeaders = [];
		errorMessage = null;
		wasSuccessful = false;
	}
</script>

<Head title={$LL.IMPORT_TRANSACTIONS_FROM_CSV()} />

<h1>{$LL.IMPORT_TRANSACTIONS_FROM_CSV()}</h1>

<Field>
	<Field.Label id="file">{$LL.FILE()}</Field.Label>
	<Field.Input type="file" id="file" accept=".csv" bind:value={file} onchange={handleFileChange} />
</Field>

<Field>
	<Field.Label id="accountColumn">{$LL.ACCOUNT()}</Field.Label>
	<Field.Select id="accountColumn" bind:value={columnMapping.account} disabled={!csvHeaders.length}>
		{#each accountsStore.accounts as account}
			<option value={account.id}>{account.name}</option>
		{/each}
	</Field.Select>
</Field>

<h2>{$LL.MAPPING_COLUMNS()}</h2>

{#snippet headerOptions()}
	<option value=""></option>
	{#each csvHeaders as header}
		<option value={header}>{header}</option>
	{/each}
{/snippet}

<Field>
	<Field.Label id="dateColumn">{$LL.DATE()}</Field.Label>
	<Field.Select id="dateColumn" bind:value={columnMapping.date} disabled={isMappingFieldDisabled}>
		{@render headerOptions()}
	</Field.Select>
</Field>

<Field>
	<Field.Label id="descriptionColumn">{$LL.DESCRIPTION()}</Field.Label>
	<Field.Select
		id="descriptionColumn"
		bind:value={columnMapping.description}
		disabled={isMappingFieldDisabled}
	>
		{@render headerOptions()}
	</Field.Select>
</Field>

<p>{$LL.AMOUNT()}</p>

<Field>
	<Field.Toggle
		label={$LL.CREDITS_DEBITS_SEPARATE()}
		id="useCreditDebitColumns"
		bind:checked={useCreditDebitColumns}
	/>
</Field>

{#if useCreditDebitColumns}
	<Field>
		<Field.Label id="creditColumn">{$LL.CREDITS()}</Field.Label>
		<Field.Select id="creditColumn" bind:value={creditColumn} disabled={isMappingFieldDisabled}>
			{@render headerOptions()}
		</Field.Select>
	</Field>
	<Field>
		<Field.Label id="debitsColumn">{$LL.DEBITS()}</Field.Label>
		<Field.Select id="debitsColumn" bind:value={debitColumn} disabled={isMappingFieldDisabled}>
			{@render headerOptions()}
		</Field.Select>
	</Field>
{:else}
	<Field>
		<Field.Label id="valueColumn">{$LL.AMOUNT()}</Field.Label>
		<Field.Select
			id="valueColumn"
			bind:value={columnMapping.value}
			disabled={isMappingFieldDisabled}
		>
			{@render headerOptions()}
		</Field.Select>
	</Field>
{/if}

<Field>
	<Field.Label id="tagColumn">{$LL.TAG_OPTIONAL()}</Field.Label>
	<Field.Select id="tagColumn" bind:value={columnMapping.tag} disabled={isMappingFieldDisabled}>
		{@render headerOptions()}
	</Field.Select>
</Field>

<h2>{$LL.COLUMNS_PREVIEW()}</h2>

<h3>{$LL.TRANSACTIONS_FOUND()}: {previewTransactions.length}</h3>
<h3>{$LL.TRANSACTIONS_IMPORTABLE()}: {importTransactions.length}</h3>

<table>
	<thead>
		<tr>
			{#each transactionFields as field}
				<th>{field}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each previewTransactions.slice(0, 5) as transaction}
			<tr class:success-bg={isTransactionImportable(transaction)}>
				{#each transactionFields as field}
					<td>
						{#if field === 'date'}
							{transaction.date ? format(transaction.date, 'MMM d, yyyy') : '~'}
						{:else if field === 'value'}
							{typeof transaction.value === 'number' ? formatCurrency(transaction.value, 2) : '~'}
						{:else if field === 'account' && columnMapping.account}
							{@const account = accountsStore.accounts.find(
								(account) => account.id === columnMapping.account
							)}
							{account ? account.name : '~'}
						{:else}
							{(transaction[field as keyof PreviewTransaction] as string | number | null) || '~'}
						{/if}
					</td>
				{/each}
			</tr>
		{:else}
			<tr>
				<td colspan={transactionFields.length}>{$LL.NO_DATA_PREVIEW()}</td>
			</tr>
		{/each}
	</tbody>
</table>

{#if errorMessage}
	<p class="error">{errorMessage}</p>
{/if}

{#if wasSuccessful}
	<p class="success">{$LL.IMPORT_SUCCESSFUL()}</p>
	<button onclick={resetImport}>{$LL.NEW_IMPORT()}</button>
	<a href="/balance-sheet">{$LL.REVIEW_IMPORT()}</a>
{:else}
	<button
		onclick={importData}
		disabled={!importTransactions.length || isImporting || wasSuccessful}
	>
		{$LL.IMPORT()}
	</button>
{/if}

<style>
	.error {
		color: tomato;
	}

	.success {
		color: seagreen;
	}

	.success-bg {
		color: white;
		background-color: seagreen;
	}
</style>
