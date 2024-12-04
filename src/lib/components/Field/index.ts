import Error from './Error.svelte';
import Field from './Field.svelte';
import Help from './Help.svelte';
import Input from './Input.svelte';
import Label from './Label.svelte';
import Select from './Select.svelte';
import Toggle from './Toggle.svelte';

const FieldComponent = Object.assign(Field, {
	Input,
	Label,
	Select,
	Toggle,
	Error,
	Help
});

export default FieldComponent;
