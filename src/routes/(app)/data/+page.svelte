<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import Head from '$lib/components/Head.svelte';
</script>

<Head title={$LL.ADD_OR_UPDATE_DATA()} />

<h1>{$LL.ADD_OR_UPDATE_DATA()}</h1>

<a href="/data/csv">{$LL.IMPORT_TRANSACTIONS_FROM_CSV()}</a>
