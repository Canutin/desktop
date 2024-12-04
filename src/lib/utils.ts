export const LOCALE = 'en-US';
const CURRENCY = 'USD';

// Format: $1,523.00 || -$1,523.00
export const formatCurrency = (
	value: number,
	maximumFractionDigits?: number,
	minimumFractionDigits?: number
) => {
	return new Intl.NumberFormat(LOCALE, {
		currency: CURRENCY,
		style: 'currency',
		maximumFractionDigits: maximumFractionDigits || 0,
		minimumFractionDigits: minimumFractionDigits || 0
	}).format(value);
};

// Calculates the ratio between the two numbers
export const proportionBetween = (num1: number, num2: number) => {
	return Math.round((!(num1 === 0) && !(num2 === 0) ? (num1 * 100) / num2 : 0) * 1e2) / 1e2;
};

// Strip timezone from date and set to UTC
export const dateInUTC = (date: Date) => {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
};
