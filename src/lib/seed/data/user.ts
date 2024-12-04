import { randomUUID } from 'crypto';
import PocketBase from 'pocketbase';

import {
	pbAdmin,
	POCKETBASE_DEFAULT_URL,
	POCKETBASE_SEED_ADMIN_EMAIL,
	POCKETBASE_SEED_DEFAULT_PASSWORD
} from '$lib/pocketbase';

export async function createVerifiedUniqueUser(baseName: string) {
	const pbUser = new PocketBase(POCKETBASE_DEFAULT_URL);
	const shortUUID = randomUUID().split('-')[0];
	const email = `${baseName}.${shortUUID}@canutin.com`;

	// Create the user
	const user = await pbUser.collection('users').create({
		email,
		password: POCKETBASE_SEED_DEFAULT_PASSWORD,
		passwordConfirm: POCKETBASE_SEED_DEFAULT_PASSWORD,
		name: `${baseName.slice(0, 1).toUpperCase() + baseName.slice(1)} ${shortUUID}`
	});

	// Verify the new user with an admin account
	await pbAdmin.admins.authWithPassword(
		POCKETBASE_SEED_ADMIN_EMAIL,
		POCKETBASE_SEED_DEFAULT_PASSWORD
	);
	await pbAdmin.collection('users').update(user.id, { verified: true });

	// Authenticate the PB client with user account
	await pbUser.collection('users').authWithPassword(email, POCKETBASE_SEED_DEFAULT_PASSWORD);

	return pbUser;
}
