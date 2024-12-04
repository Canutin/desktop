/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	AccountBalanceStatements = "accountBalanceStatements",
	Accounts = "accounts",
	AssetBalanceStatements = "assetBalanceStatements",
	Assets = "assets",
	Events = "events",
	Settings = "settings",
	Tags = "tags",
	Transactions = "transactions",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AccountBalanceStatementsRecord = {
	account: RecordIdString
	value?: number
}

export type AccountsRecord = {
	balanceGroup?: number
	institution?: string
	isAutoCalculated?: boolean
	isClosed?: boolean
	name: string
	owner: RecordIdString
	tag?: RecordIdString
}

export type AssetBalanceStatementsRecord = {
	asset: RecordIdString
	cost?: number
	quantity?: number
	value?: number
}

export type AssetsRecord = {
	balanceGroup?: number
	isSold?: boolean
	name: string
	owner: RecordIdString
	symbol?: string
	tag?: RecordIdString
}

export enum EventsAppearanceOptions {
	"active" = "active",
	"positive" = "positive",
	"negative" = "negative",
	"warning" = "warning",
}

export enum EventsStatusOptions {
	"read" = "read",
	"unread" = "unread",
	"ongoing" = "ongoing",
}
export type EventsRecord = {
	appearance: EventsAppearanceOptions
	dismissInMs?: number
	message: string
	status: EventsStatusOptions
}

export type SettingsRecord = {
	name: string
	value: string
}

export enum TagsForOptions {
	"accounts" = "accounts",
	"assets" = "assets",
	"transactions" = "transactions",
}
export type TagsRecord = {
	for: TagsForOptions
	isLabelGroup?: boolean
	name: string
}

export type TransactionsRecord<Timport = unknown> = {
	account?: RecordIdString
	date?: IsoDateString
	description: string
	import?: null | Timport
	isExcluded?: boolean
	isPending?: boolean
	tag?: RecordIdString[]
	value?: number
}

export type UsersRecord = {
	name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type AccountBalanceStatementsResponse<Texpand = unknown> = Required<AccountBalanceStatementsRecord> & BaseSystemFields<Texpand>
export type AccountsResponse<Texpand = unknown> = Required<AccountsRecord> & BaseSystemFields<Texpand>
export type AssetBalanceStatementsResponse<Texpand = unknown> = Required<AssetBalanceStatementsRecord> & BaseSystemFields<Texpand>
export type AssetsResponse<Texpand = unknown> = Required<AssetsRecord> & BaseSystemFields<Texpand>
export type EventsResponse<Texpand = unknown> = Required<EventsRecord> & BaseSystemFields<Texpand>
export type SettingsResponse<Texpand = unknown> = Required<SettingsRecord> & BaseSystemFields<Texpand>
export type TagsResponse<Texpand = unknown> = Required<TagsRecord> & BaseSystemFields<Texpand>
export type TransactionsResponse<Timport = unknown, Texpand = unknown> = Required<TransactionsRecord<Timport>> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	accountBalanceStatements: AccountBalanceStatementsRecord
	accounts: AccountsRecord
	assetBalanceStatements: AssetBalanceStatementsRecord
	assets: AssetsRecord
	events: EventsRecord
	settings: SettingsRecord
	tags: TagsRecord
	transactions: TransactionsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	accountBalanceStatements: AccountBalanceStatementsResponse
	accounts: AccountsResponse
	assetBalanceStatements: AssetBalanceStatementsResponse
	assets: AssetsResponse
	events: EventsResponse
	settings: SettingsResponse
	tags: TagsResponse
	transactions: TransactionsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'accountBalanceStatements'): RecordService<AccountBalanceStatementsResponse>
	collection(idOrName: 'accounts'): RecordService<AccountsResponse>
	collection(idOrName: 'assetBalanceStatements'): RecordService<AssetBalanceStatementsResponse>
	collection(idOrName: 'assets'): RecordService<AssetsResponse>
	collection(idOrName: 'events'): RecordService<EventsResponse>
	collection(idOrName: 'settings'): RecordService<SettingsResponse>
	collection(idOrName: 'tags'): RecordService<TagsResponse>
	collection(idOrName: 'transactions'): RecordService<TransactionsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
