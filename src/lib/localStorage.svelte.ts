import { browser } from '$app/environment';

export class LocalStorage<T> {
	value: T = $state<T>() as T;
	private key: string;

	constructor(key: string, defaultValue: T) {
		this.key = key;

		if (browser) {
			const initialValue = localStorage.getItem(key);
			this.value = initialValue ? this.deserialize(initialValue) : defaultValue;
		}

		$effect(() => {
			localStorage.setItem(this.key, this.serialize(this.value));
		});
	}

	private serialize(value: T): string {
		return JSON.stringify(value);
	}

	private deserialize(value: string): T {
		return JSON.parse(value);
	}
}
