<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { format } from 'date-fns';

	import { getAccountsContext } from '$lib/accounts.svelte';
	import Head from '$lib/components/Head.svelte';
	import { formatCurrency } from '$lib/utils';

	const accountsStore = getAccountsContext();
</script>

<Head title={$LL.ACCOUNTS()} />

<h1>{$LL.ACCOUNTS()}</h1>

{#if !accountsStore.accounts.length}
	<p>{$LL.NO_ACCOUNTS_FOUND()}</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>{$LL.NAME()}</th>
				<th>{$LL.INSTITUTION()}</th>
				<th>{$LL.ACCOUNT_TYPE()}</th>
				<th>{$LL.BALANCE_TYPE()}</th>
				<th>{$LL.BALANCE()}</th>
				<th>{$LL.LAST_UPDATED()}</th>
			</tr>
		</thead>
		<tbody>
			{#each accountsStore.accounts as account}
				<tr>
					<td>{account.name}</td>
					<td>{account.institution}</td>
					<td>{account.expand.tag.name}</td>
					<td>{account.isAutoCalculated ? $LL.AUTO_CALCULATED() : '~'}</td>
					<td>{formatCurrency(account.balance ?? 0)}</td>
					<td>{format(account.updated, 'MMM d, yyyy')}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
