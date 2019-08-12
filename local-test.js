const HDFCApi = require('./index');
const { HDFC_NETBANKING_USERNAME, HDFC_NETBANKING_PASSWORD } = process.env;

(async () => {
	const hdfc = new HDFCApi({
		username: HDFC_NETBANKING_USERNAME,
		password: HDFC_NETBANKING_PASSWORD
	});
	const res = await hdfc.getTransactions();
	console.log(JSON.stringify(res, null, 4));
	await hdfc.logout();
})();
