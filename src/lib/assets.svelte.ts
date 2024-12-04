import { ClientResponseError } from 'pocketbase';
import { getContext, setContext } from 'svelte';

import type { AssetsResponse, TagsResponse, TypedPocketBase } from '$lib/pocketbase-types';
import { getPbClientContext } from '$lib/pocketbase.svelte';

export interface Asset extends AssetsResponse {
	balance: number | null;
	cost: number | null;
	quantity: number | null;
	expand: { tag: TagsResponse };
}

class Assets {
	assets = $state<Asset[]>([]);
	private pbClient = getPbClientContext();

	private get pb(): TypedPocketBase {
		return this.pbClient.pb!;
	}

	constructor() {
		this.fetchAssets();
		this.subscribeToAssetChanges();
	}

	private async fetchAssets() {
		try {
			const assetsCollection = await this.pb
				.collection('assets')
				.getFullList<Asset>({ expand: 'tag' });
			const assetsWithBalance = await Promise.all(
				assetsCollection.map(async (asset) => {
					try {
						const { balance, cost, quantity } = await this.getAssetBalance(asset);
						return { ...asset, balance, cost, quantity };
					} catch (error) {
						if (error instanceof ClientResponseError && error.isAbort) {
							console.warn('Asset balance fetch cancelled for:', asset.name);
							return { ...asset, balance: null };
						}
						throw error;
					}
				})
			);
			this.assets = assetsWithBalance;
		} catch (error) {
			if (error instanceof ClientResponseError && error.isAbort) {
				console.error('Assets fetch cancelled');
			} else {
				console.error('Error fetching assets:', error);
			}
		}
	}

	private async getAssetBalance(
		asset: Asset
	): Promise<{ balance: number | null; cost: number | null; quantity: number | null }> {
		try {
			const latestStatement = await this.pb.collection('assetBalanceStatements').getList(1, 1, {
				filter: `asset="${asset.id}"`,
				sort: '-created',
				requestKey: null // Disable auto-cancellation for this request
			});
			return {
				balance: latestStatement.items[0]?.value ?? null,
				cost: latestStatement.items[0]?.cost ?? null,
				quantity: latestStatement.items[0]?.quantity ?? null
			};
		} catch (error) {
			if (error instanceof ClientResponseError) {
				if (error.isAbort) {
					console.warn('Balance fetch cancelled for asset:', asset.name);
				} else {
					console.error('Error fetching balance for asset:', asset.name, error);
				}
			} else {
				console.error('Unexpected error fetching balance for asset:', asset.name, error);
			}
			return { balance: null, cost: null, quantity: null };
		}
	}

	private subscribeToAssetChanges() {
		this.pb.collection('assets').subscribe(
			'*',
			(e) => {
				this.handleAssetChange(e.action, e.record as Asset);
			},
			{ expand: 'tag' }
		);
		this.pb.collection('assetBalanceStatements').subscribe('*', (e) => {
			const asset = this.assets.find((a) => a.id === e.record.asset);
			if (!asset) throw new Error('Balance statement asset not found');
			this.handleAssetChange('update', asset);
		});
	}

	private async handleAssetChange(action: string, record: Asset) {
		const { balance, cost, quantity } = await this.getAssetBalance(record);
		const assetWithBalance = { ...record, balance, cost, quantity };
		switch (action) {
			case 'create':
				this.assets = [assetWithBalance, ...this.assets];
				break;
			case 'update':
				this.assets = this.assets.map((a) => (a.id === record.id ? assetWithBalance : a));
				break;
			case 'delete':
				this.assets = this.assets.filter((a) => a.id !== record.id);
				break;
		}

		// Sort by name
		this.assets = this.assets.sort((a, b) => a.name.localeCompare(b.name));
	}

	dispose() {
		this.pb.collection('assets').unsubscribe();
	}
}

export const CONTEXT_KEY_ASSETS = 'assets';

export function setAssetsContext() {
	return setContext(CONTEXT_KEY_ASSETS, new Assets());
}

export function getAssetsContext() {
	return getContext<ReturnType<typeof setAssetsContext>>(CONTEXT_KEY_ASSETS);
}
