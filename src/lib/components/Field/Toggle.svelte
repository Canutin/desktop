<script lang="ts">
	import type { LocalizedString } from 'typesafe-i18n';

	interface Props {
		label: LocalizedString;
		id: string;
		checked: boolean;
		disabled?: boolean;
	}

	let { label, id, checked = $bindable(), disabled }: Props = $props();
</script>

<label for={id} class="field-toggle">
	<input type="checkbox" {id} bind:checked {disabled} />
	{label}
</label>
