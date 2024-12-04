<script lang="ts">
	import type { LocalizedString } from 'typesafe-i18n';

	interface Props {
		error?: LocalizedString | string;
	}

	let { error }: Props = $props();
</script>

{#if error}
	<p class="field-error">{error}</p>
{/if}

<style>
	.field-error {
		color: tomato;
	}
</style>
