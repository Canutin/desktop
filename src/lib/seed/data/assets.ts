export interface AssetDetails {
	name: string;
	balanceGroup: number;
	tag: string;
	isSold: boolean;
	symbol?: string;
}

export const assetSecurityTeslaDetails: AssetDetails = {
	name: 'Tesla',
	balanceGroup: 2,
	tag: 'Security',
	isSold: false,
	symbol: 'TSLA'
};

export const assetSecurityGamestopDetails: AssetDetails = {
	name: 'GameStop',
	balanceGroup: 2,
	tag: 'Security',
	isSold: false,
	symbol: 'GME'
};

export const assetCryptoBitcoinDetails: AssetDetails = {
	name: 'Bitcoin',
	balanceGroup: 2,
	tag: 'Cryptocurrency',
	isSold: false,
	symbol: 'BTC'
};

export const assetCryptoEthereumDetails: AssetDetails = {
	name: 'Ethereum',
	balanceGroup: 2,
	tag: 'Cryptocurrency',
	isSold: false,
	symbol: 'ETH'
};

export const assetCollectibleDetails: AssetDetails = {
	name: 'Manchild Card Collection',
	balanceGroup: 3,
	tag: 'Collectible',
	isSold: false
};

export const assetVehicleDetails: AssetDetails = {
	name: `1998 Fiat Multipla`,
	balanceGroup: 3,
	tag: 'Vehicle',
	isSold: false
};
