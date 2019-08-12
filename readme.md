# hdfc-bank-api

> Unofficial HDFC bank API

## Install

```
$ npm install hdfc-bank-api
```


## Usage

```js
const HDFCApi = require('hdfc-bank-api');

(async () => {
	const hdfc = new HDFCApi({username:HDFC_NETBANKING_USERNAME,password:HDFC_NETBANKING_PASSWORD});
	const res = await hdfc.getTransactions();
	console.log(JSON.stringify(res, null, 4));
	await hdfc.logout();

})();

```


## API

### getTransactions()
Get last 6 months transactions

## License

MIT © [Ashik Nesin](https://ashiknesin.com)
