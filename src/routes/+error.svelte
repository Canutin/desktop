<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { page } from '$app/stores';
	import Head from '$lib/components/Head.svelte';
</script>

<Head title={`${$LL.ERROR()} ${$page.status}`} />

<section class="error">
	<div class="error-message">
		{#if $page.status === 404}
			<strong>{$LL.ERROR()} {$page.status}</strong>
			<span>{$LL.NOT_FOUND()}</span>
		{:else if $page.status !== 200}
			<strong>{$LL.ERROR()} {$page.status}</strong>
			<span>{$LL.INTERNAL_SERVER_ERROR()}</span>
		{/if}
	</div>
</section>
