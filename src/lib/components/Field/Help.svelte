<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{#if children}
	<p class="field-help">{@render children()}</p>
{/if}
