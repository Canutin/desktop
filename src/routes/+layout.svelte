<script lang="ts">
	import { setLocale } from '$i18n/i18n-svelte';
	import { loadLocale } from '$i18n/i18n-util.sync';

	import { setPbClientContext } from '$lib/pocketbase.svelte';

	$effect.pre(() => {
		loadLocale('en');
		setLocale('en');
	});

	const { children } = $props();

	setPbClientContext();
</script>

{@render children()}
