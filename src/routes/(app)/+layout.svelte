<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import type { AuthModel } from 'pocketbase';

	import { goto, onNavigate } from '$app/navigation';
	import { setAccountsContext } from '$lib/accounts.svelte';
	import { setAssetsContext } from '$lib/assets.svelte';
	import { getPbClientContext } from '$lib/pocketbase.svelte';

	const { children } = $props();

	const pbClient = getPbClientContext();
	let currentUser = $state<AuthModel | null>(pbClient.pb.authStore.model || null);

	$effect.pre(() => {
		if (currentUser && currentUser.verified) {
			setAccountsContext();
			setAssetsContext();
		} else {
			goto('/auth');
		}
	});

	onNavigate(async () => {
		try {
			const authData = await pbClient.pb.collection('users').authRefresh();
			if (!authData.record.verified) handleSignOut();
		} catch {
			handleSignOut();
		}
	});

	function handleSignOut() {
		pbClient.signOut();
		goto('/auth');
	}
</script>

{#if currentUser}
	<nav>
		<a href="/">{$LL.THE_BIG_PICTURE()}</a>
		<a href="/balance-sheet">{$LL.BALANCE_SHEET()}</a>
		<a href="/transactions">{$LL.TRANSACTIONS()}</a>
		<a href="/accounts">{$LL.ACCOUNTS()}</a>
		<a href="/assets">{$LL.ASSETS()}</a>
		<a href="/trends">{$LL.TRENDS()}</a>
		|
		<a href="/settings">{$LL.SETTINGS()}</a>
		<a href="/data">{$LL.ADD_OR_UPDATE_DATA()}</a>
		|
		<button onclick={handleSignOut}>{$LL.SIGN_OUT()}</button>
		{currentUser.email}
	</nav>

	{@render children()}
{/if}
