import type { Account } from './accounts.svelte';
import type { Asset } from './assets.svelte';

export enum BalanceGroup {
	CASH,
	DEBT,
	INVESTMENTS,
	OTHER_ASSETS
}

export function calculateTotalBalance(
	accountsOrAssets: (Account | Asset)[],
	balanceGroup?: number
) {
	return accountsOrAssets
		.filter(
			(accountOrAsset) => balanceGroup === undefined || accountOrAsset.balanceGroup === balanceGroup
		)
		.reduce((acc, accountOrAsset) => acc + (accountOrAsset.balance ?? 0), 0);
}
