// This hook allows setting a custom 'created' date, which is useful for seeding data in testing.
// By default, PocketBase auto-manages the 'created' field and doesn't allow modification via web APIs.
// REF: https://github.com/pocketbase/pocketbase/discussions/3248
onRecordBeforeCreateRequest((e) => {
	const info = $apis.requestInfo(e.httpContext);
	e.record.set('created', info.data.created);
});
