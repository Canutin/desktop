<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { getAccountsContext } from '$lib/accounts.svelte';
	import { getAssetsContext } from '$lib/assets.svelte';
	import { BalanceGroup, calculateTotalBalance } from '$lib/balanceGroups';
	import Head from '$lib/components/Head.svelte';
	import { formatCurrency } from '$lib/utils';

	const accountsStore = getAccountsContext();
	const assetsStore = getAssetsContext();

	let balanceGroups = $derived.by(() => {
		const accountsOrAssets = [...accountsStore.accounts, ...assetsStore.assets];
		return [
			BalanceGroup.CASH,
			BalanceGroup.DEBT,
			BalanceGroup.INVESTMENTS,
			BalanceGroup.OTHER_ASSETS
		].map((balanceGroup) => {
			const accountsOrAssetsInBalanceGroup = accountsOrAssets.filter(
				(accountOrAsset) => accountOrAsset.balanceGroup === balanceGroup
			);
			return {
				balance: calculateTotalBalance(accountsOrAssetsInBalanceGroup),
				groups: Object.groupBy(
					accountsOrAssetsInBalanceGroup,
					(accountOrAsset) => accountOrAsset.expand?.tag?.name
				)
			};
		});
	});
</script>

<Head title={$LL.BALANCE_SHEET()} />

<h1>{$LL.BALANCE_SHEET()}</h1>

<ul>
	{#each balanceGroups as balanceGroup, index}
		<li>
			<div class="card">
				<strong>
					{#if index === BalanceGroup.CASH}
						{$LL.CASH()}
					{:else if index === BalanceGroup.DEBT}
						{$LL.DEBT()}
					{:else if index === BalanceGroup.INVESTMENTS}
						{$LL.INVESTMENTS()}
					{:else if index === BalanceGroup.OTHER_ASSETS}
						{$LL.OTHER_ASSETS()}
					{/if}
				</strong>
				<span>
					{formatCurrency(balanceGroup.balance)}
				</span>
			</div>

			<ul class="card-group">
				{#each Object.entries(balanceGroup.groups) as [name, accountsOrAssets]}
					{#if accountsOrAssets}
						<li>
							<strong>{name}</strong>
							<span>
								{formatCurrency(calculateTotalBalance(accountsOrAssets))}
							</span>
							<ul>
								{#each accountsOrAssets as accountOrAsset}
									<li>
										{accountOrAsset.name}
										<span>
											{formatCurrency(accountOrAsset.balance ?? 0)}
										</span>
									</li>
								{/each}
							</ul>
						</li>
					{/if}
				{/each}
			</ul>
		</li>
	{/each}
</ul>
