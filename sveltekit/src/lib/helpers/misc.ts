import formatInTimeZone from 'date-fns-tz/esm/formatInTimeZone';
import { SortOrder } from '$lib/helpers/constants';

// Format: $1,523.00 || -$1,523.00
export const formatCurrency = (value: number, decimals?: number) => {
	return new Intl.NumberFormat('en-US', {
		currency: 'USD',
		style: 'currency',
		maximumFractionDigits: decimals ? decimals : 0
	}).format(value);
};

export const sortByKey = (array: any[], key: string, order: SortOrder) => {
	order == SortOrder.DESC
		? array.sort((a, b) => (Math.abs(a[key]) > Math.abs(b[key]) ? 1 : -1))
		: array.sort((a, b) => (Math.abs(a[key]) < Math.abs(b[key]) ? 1 : -1));
};

// Calculates the ratio between the two numbers
export const proportionBetween = (num1: number, num2: number) => {
	return Math.round((!(num1 === 0) && !(num2 === 0) ? (num1 * 100) / num2 : 0) * 1e2) / 1e2;
};

// Strip timezone from date and set to UTC
export const dateInUTC = (date: Date) => {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
};

export const formatInUTC = (date: Date, format: string) => {
	return formatInTimeZone(date, 'UTC', format);
};

// FIXME:
// - make `body` optional so we can use this helper for GET requests
// - `endpoint` shouldn't be limited to `name.json` since some ednpoints have additional params
export const api = async (endpoint: string, body: any, method?: string) => {
	const response = await fetch(`/${endpoint}.json`, {
		method: method ? method : 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
	return await response.json();
};
