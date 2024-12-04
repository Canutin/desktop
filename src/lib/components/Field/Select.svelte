<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		value?: string;
		disabled?: boolean;
		placeholder?: string;
		required?: boolean;
		children: Snippet;
	}

	let { id, value = $bindable(''), disabled, placeholder, required, children }: Props = $props();
</script>

<div class="field-select">
	<select {id} bind:value {disabled} {placeholder} {required}>
		{@render children()}
	</select>
</div>
