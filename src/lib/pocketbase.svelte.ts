import LL from '$i18n/i18n-svelte';
import PocketBase, { ClientResponseError } from 'pocketbase';
import { getContext, setContext } from 'svelte';
import { get } from 'svelte/store';

import { goto } from '$app/navigation';
import type { TypedPocketBase } from '$lib/pocketbase-types';

import { LocalStorage } from './localStorage.svelte';
import { POCKETBASE_DEFAULT_URL } from './pocketbase';

const CONTEXT_KEY_PB = 'pbClient';

class PocketBaseClient {
	pb = $state<TypedPocketBase>()!;
	serverUrl = new LocalStorage('serverUrl', POCKETBASE_DEFAULT_URL);
	authMessage = $state<string | null>(null);
	private ll = get(LL);

	constructor() {
		this.pb = new PocketBase(POCKETBASE_DEFAULT_URL) as TypedPocketBase;

		// Disable auto-cancel of duplicated pending requests
		this.pb.autoCancellation(false);

		$effect(() => {
			this.checkAuthIsValid();
		});
	}

	async signIn(email: string, password: string) {
		this.signOut();
		this.authMessage = null;

		try {
			const authData = await this.pb.collection('users').authWithPassword(email, password);

			if (authData?.token) {
				this.checkAuthIsValid();

				if (this.pb.authStore.model && this.pb.authStore.model.verified) {
					goto('/');
				} else {
					this.authMessage = this.ll.ACCOUNT_VERIFICATION_REQUIRED();
				}
			} else {
				this.authMessage = this.ll.AUTHENTICATION_FAILED();
			}
		} catch (error) {
			if (error instanceof ClientResponseError && error.status === 400) {
				this.authMessage = this.ll.INCORRECT_CREDENTIALS();
			} else {
				this.authMessage = this.ll.CONNECTION_ERROR();
			}
		}
	}

	signOut() {
		this.pb.authStore.clear();
		this.authMessage = null;
	}

	private checkAuthIsValid() {
		if (!this.pb.authStore.isValid) goto('/auth');
	}
}

export function setPbClientContext() {
	return setContext(CONTEXT_KEY_PB, new PocketBaseClient());
}

export function getPbClientContext() {
	return getContext<ReturnType<typeof setPbClientContext>>(CONTEXT_KEY_PB);
}
