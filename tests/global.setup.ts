import { test as setup } from '@playwright/test';

import {
	pbAdmin,
	POCKETBASE_SEED_ADMIN_EMAIL,
	POCKETBASE_SEED_DEFAULT_PASSWORD
} from '$lib/pocketbase';
import { accountTypes, assetTypes, transactionCategories } from '$lib/seed/data/tags';

setup('create admin account and seed tags', async () => {
	try {
		await pbAdmin.admins.create({
			email: POCKETBASE_SEED_ADMIN_EMAIL,
			password: POCKETBASE_SEED_DEFAULT_PASSWORD,
			passwordConfirm: POCKETBASE_SEED_DEFAULT_PASSWORD
		});

		await pbAdmin.admins.authWithPassword(
			POCKETBASE_SEED_ADMIN_EMAIL,
			POCKETBASE_SEED_DEFAULT_PASSWORD
		);

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
	} catch (error) {
		console.error('-> Error creating admin account:', error);
	}
});
