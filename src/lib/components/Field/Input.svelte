<script lang="ts">
	interface Props {
		id: string;
		value?: string | File | null;
		disabled?: boolean;
		placeholder?: string;
		type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'url' | 'file';
		required?: boolean;
		accept?: string;
		onchange?: (e: Event) => void;
	}

	let {
		value = $bindable(''),
		disabled = false,
		placeholder = '',
		type = 'text',
		required = false,
		id = '',
		accept = '',
		onchange
	}: Props = $props();
</script>

<div class="field-input">
	<input
		bind:value
		class="input"
		{type}
		{disabled}
		{placeholder}
		{required}
		{id}
		{accept}
		{onchange}
	/>
</div>
