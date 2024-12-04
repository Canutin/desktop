export interface AccountDetails {
	name: string;
	balanceGroup: number;
	tag: string;
	isAutoCalculated: boolean;
	isClosed: boolean;
	institution?: string;
}

export const accountCheckingDetails: AccountDetails = {
	name: 'Ransack Laughable-Yield Checking',
	balanceGroup: 0,
	tag: 'Checking',
	isAutoCalculated: true,
	isClosed: false,
	institution: 'Ransack Bank'
};

export const accountSavingsDetails: AccountDetails = {
	name: 'Emergency Fund',
	balanceGroup: 0,
	tag: 'Savings',
	isAutoCalculated: true,
	isClosed: false,
	institution: 'Ransack Bank'
};

export const accountCreditCardDetails: AccountDetails = {
	name: 'JuggernautCard Limited Rewards',
	balanceGroup: 1,
	tag: 'Credit card',
	isAutoCalculated: true,
	isClosed: false,
	institution: 'Juggernaut Bank'
};

export const accountAutoLoanDetails: AccountDetails = {
	name: 'Fiat Auto Loan',
	balanceGroup: 1,
	tag: 'Auto loan',
	isAutoCalculated: false,
	isClosed: false,
	institution: 'Fiat Financial Services'
};

export const accountRothIraDetails: AccountDetails = {
	name: 'Retirement Roth IRA',
	balanceGroup: 2,
	tag: 'Roth IRA',
	isAutoCalculated: false,
	isClosed: false,
	institution: 'Loot Financial'
};

export const account401kDetails: AccountDetails = {
	name: 'My 401k',
	balanceGroup: 2,
	tag: '401k',
	isAutoCalculated: false,
	isClosed: false,
	institution: 'Loot Financial'
};

export const accountWalletDetails: AccountDetails = {
	name: 'Matress Wallet',
	balanceGroup: 0,
	tag: 'Cash',
	isAutoCalculated: false,
	isClosed: false
};
