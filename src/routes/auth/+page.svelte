<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import Field from '$lib/components/Field';
	import Head from '$lib/components/Head.svelte';
	import { getPbClientContext } from '$lib/pocketbase.svelte';

	let auth = $state({
		email: '',
		password: '123qweasdzxc' // TODO: Remove this
	});

	const pbClient = getPbClientContext();

	async function handleLogin(e: Event) {
		e.preventDefault();
		await pbClient.signIn(auth.email, auth.password);
	}
</script>

<Head title={$LL.SIGN_IN()} />

<h1>{$LL.SIGN_IN()}</h1>

{#if pbClient.authMessage}
	<p class="auth-message">{pbClient.authMessage}</p>
{/if}

<form onsubmit={(e) => handleLogin(e)}>
	<Field>
		<Field.Label id="serverUrl">{$LL.CANUTIN_SERVER_URL()}</Field.Label>
		<Field.Input type="url" id="serverUrl" bind:value={pbClient.serverUrl.value} required />
	</Field>

	<Field>
		<Field.Label id="email">{$LL.EMAIL()}</Field.Label>
		<Field.Input type="email" id="email" bind:value={auth.email} required />
	</Field>

	<Field>
		<Field.Label id="password">{$LL.PASSWORD()}</Field.Label>
		<Field.Input type="password" id="password" bind:value={auth.password} required />
	</Field>

	<button type="submit">{$LL.SIGN_IN_BUTTON()}</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.auth-message {
		color: tomato;
	}
</style>
