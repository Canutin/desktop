import {
	createAccount,
	createAccountBalanceStatements,
	createAsset,
	createAssetBalanceStatements,
	createTransactions,
	pbAdmin,
	POCKETBASE_SEED_ADMIN_EMAIL,
	POCKETBASE_SEED_DEFAULT_PASSWORD
} from '$lib/pocketbase';
import type { TypedPocketBase } from '$lib/pocketbase-types';
import {
	account401kDetails,
	accountAutoLoanDetails,
	accountCheckingDetails,
	accountCreditCardDetails,
	accountRothIraDetails,
	accountSavingsDetails,
	accountWalletDetails,
	type AccountDetails
} from '$lib/seed/data/accounts';
import {
	assetCollectibleDetails,
	assetCryptoBitcoinDetails,
	assetCryptoEthereumDetails,
	assetSecurityGamestopDetails,
	assetSecurityTeslaDetails,
	assetVehicleDetails,
	type AssetDetails
} from '$lib/seed/data/assets';
import {
	account401kBalanceStatements,
	accountAutoLoanBalanceStatements,
	accountRothIraBalanceStatements,
	accountWalletBalanceStatements,
	assetBitcoinBalanceStatements,
	assetCollectibleBalanceStatements,
	assetEthereumBalanceStatements,
	assetGamestopBalanceStatements,
	assetTeslaBalanceStatements,
	assetVehicleBalanceStatements
} from '$lib/seed/data/balanceStatements';
import { accountTypes, assetTypes, transactionCategories } from '$lib/seed/data/tags';
import {
	accountCheckingTransactionSet,
	accountCreditCardTransactionSet,
	accountSavingsTransactionSet
} from '$lib/seed/data/transactions';

import { createVerifiedUniqueUser } from './data/user';

async function deleteAllData(): Promise<void> {
	const collections = [
		'users',
		'accounts',
		'assets',
		'transactions',
		'accountBalanceStatements',
		'assetBalanceStatements',
		'tags'
	];

	for (const collection of collections) {
		const records = await pbAdmin.collection(collection).getFullList();
		for (const record of records) {
			await pbAdmin.collection(collection).delete(record.id);
		}
		console.warn(`-> Deleted all records from ${collection}`);
	}
}

async function seedTags(): Promise<void> {
	// Create transaction category tags
	for (const categoryGroup of transactionCategories.categoryGroups) {
		// Create group tag
		await pbAdmin.collection('tags').create({
			name: categoryGroup.name,
			for: 'transactions',
			isLabelGroup: true
		});

		// Create individual category tags
		for (const category of categoryGroup.categories) {
			await pbAdmin.collection('tags').create({
				name: category.name,
				for: 'transactions',
				isLabelGroup: false
			});
		}
	}

	// Create account type tags
	for (const accountType of accountTypes) {
		await pbAdmin.collection('tags').create({
			name: accountType.name,
			for: 'accounts',
			isLabelGroup: false
		});
	}

	// Create asset type tags
	for (const assetType of assetTypes) {
		await pbAdmin.collection('tags').create({
			name: assetType.name,
			for: 'assets',
			isLabelGroup: false
		});
	}
	console.warn('-> Tags seeded successfully');
}

async function seedAccounts(pb: TypedPocketBase): Promise<void> {
	const accounts: AccountDetails[] = [
		accountCheckingDetails,
		accountSavingsDetails,
		accountCreditCardDetails,
		accountAutoLoanDetails,
		accountRothIraDetails,
		account401kDetails,
		accountWalletDetails
	];

	for (const account of accounts) await createAccount(pb, account);
	console.warn('-> Accounts seeded successfully');
}

async function seedAssets(pb: TypedPocketBase): Promise<void> {
	const assets: AssetDetails[] = [
		assetSecurityTeslaDetails,
		assetSecurityGamestopDetails,
		assetCryptoBitcoinDetails,
		assetCryptoEthereumDetails,
		assetCollectibleDetails,
		assetVehicleDetails
	];

	for (const asset of assets) await createAsset(pb, asset);
	console.warn('-> Assets seeded successfully');
}

async function seedTransactions(pb: TypedPocketBase): Promise<void> {
	const checkingAccount = await pb
		.collection('accounts')
		.getFirstListItem(`name="${accountCheckingDetails.name}"`);
	const savingsAccount = await pb
		.collection('accounts')
		.getFirstListItem(`name="${accountSavingsDetails.name}"`);
	const creditCardAccount = await pb
		.collection('accounts')
		.getFirstListItem(`name="${accountCreditCardDetails.name}"`);

	const checkingTransactions = await accountCheckingTransactionSet();
	const savingsTransactions = await accountSavingsTransactionSet();
	const creditCardTransactions = await accountCreditCardTransactionSet();

	await createTransactions(pb, checkingAccount.id, checkingTransactions);
	await createTransactions(pb, savingsAccount.id, savingsTransactions);
	await createTransactions(pb, creditCardAccount.id, creditCardTransactions);
	console.warn('-> Transactions seeded successfully');
}

async function seedBalanceStatements(pb: TypedPocketBase): Promise<void> {
	const accounts = await pb.collection('accounts').getFullList();
	const assets = await pb.collection('assets').getFullList();

	const accountsWithBalanceStatements = [
		{ account: account401kDetails.name, data: account401kBalanceStatements },
		{ account: accountAutoLoanDetails.name, data: accountAutoLoanBalanceStatements },
		{ account: accountRothIraDetails.name, data: accountRothIraBalanceStatements },
		{ account: accountWalletDetails.name, data: accountWalletBalanceStatements }
	];

	for (const accountWithBalanceStatements of accountsWithBalanceStatements) {
		const account = accounts.find((a) => a.name.includes(accountWithBalanceStatements.account));
		if (!account) throw new Error(`Account not found: ${accountWithBalanceStatements.account}`);
		await createAccountBalanceStatements(pb, account.id, accountWithBalanceStatements.data);
	}
	console.warn('-> Created account balance statements');

	const assetsWithBalanceStatements = [
		{ asset: assetSecurityTeslaDetails.name, data: assetTeslaBalanceStatements },
		{ asset: assetSecurityGamestopDetails.name, data: assetGamestopBalanceStatements },
		{ asset: assetCryptoBitcoinDetails.name, data: assetBitcoinBalanceStatements },
		{ asset: assetCryptoEthereumDetails.name, data: assetEthereumBalanceStatements },
		{ asset: assetCollectibleDetails.name, data: assetCollectibleBalanceStatements },
		{ asset: assetVehicleDetails.name, data: assetVehicleBalanceStatements }
	];

	for (const assetWithBalanceStatements of assetsWithBalanceStatements) {
		const asset = assets.find((a) => a.name.includes(assetWithBalanceStatements.asset));
		if (!asset) throw new Error(`Asset not found: ${assetWithBalanceStatements.asset}`);
		await createAssetBalanceStatements(pb, asset.id, assetWithBalanceStatements.data);
	}
	console.warn('-> Created asset balance statements');
}

async function createAndAuthAsAdmin(): Promise<void> {
	try {
		// Attempt to authenticate with existing admin credentials
		await pbAdmin.admins.authWithPassword(
			POCKETBASE_SEED_ADMIN_EMAIL,
			POCKETBASE_SEED_DEFAULT_PASSWORD
		);
		console.warn('-> Admin authenticated successfully');
	} catch (error) {
		console.warn('-> Admin authentication failed, attempting to create new admin account');
		try {
			// Attempt to create a new admin account
			await pbAdmin.admins.create({
				email: POCKETBASE_SEED_ADMIN_EMAIL,
				password: POCKETBASE_SEED_DEFAULT_PASSWORD,
				passwordConfirm: POCKETBASE_SEED_DEFAULT_PASSWORD
			});
			console.warn('-> New admin account created successfully');

			// Authenticate with the newly created admin account
			await pbAdmin.admins.authWithPassword(
				POCKETBASE_SEED_ADMIN_EMAIL,
				POCKETBASE_SEED_DEFAULT_PASSWORD
			);
			console.warn('-> Authenticated with new admin account');
		} catch (createError) {
			console.warn('-> Failed to create new admin account:', createError);
			throw createError;
		}
	}
}

export async function createAndAuthAsUser() {
	try {
		const pbAlice = await createVerifiedUniqueUser('alice');
		console.warn(
			'-> User created:',
			pbAlice.authStore.model?.email,
			POCKETBASE_SEED_DEFAULT_PASSWORD
		);
		return pbAlice;
	} catch (error) {
		console.warn('-> Error creating or verifying regular user:', error);
		if (error instanceof Error && 'response' in error) {
			console.warn('-> Detailed error:', JSON.stringify((error as any).response, null, 2));
		}
		throw error;
	}
}

async function main(): Promise<void> {
	try {
		// Admin tasks
		await createAndAuthAsAdmin();
		await deleteAllData();
		await seedTags();

		// User tasks
		const user = await createAndAuthAsUser();
		await seedAccounts(user);
		await seedAssets(user);
		await seedTransactions(user);
		await seedBalanceStatements(user);

		console.warn('-> All data seeded successfully');
		process.exit(0);
	} catch (error) {
		console.warn('-> Error in main function:', error);
		if (error instanceof Error) {
			console.warn('-> Error message:', error.message);
			if ('response' in error) {
				console.warn('-> Detailed error:', JSON.stringify((error as any).response, null, 2));
			}
		}
		process.exit(1);
	}
}

main().catch((e) => {
	console.warn('-> Error:', e);
	process.exit(1);
});
