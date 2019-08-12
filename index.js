const chromium = require('chrome-aws-lambda');

class PuppeteerWrapper {
	static async build() {
		let page;
		const browser = await chromium.puppeteer.launch({
			args: chromium.args,
			defaultViewport: chromium.defaultViewport,
			executablePath: await chromium.executablePath,
			headless: chromium.headless
		});

		page = await browser.newPage();

		const puppeteerWrapper = new PuppeteerWrapper(page);

		return new Proxy(puppeteerWrapper, {
			get(target, property) {
				return (
					puppeteerWrapper[property] ||
					browser[property] ||
					page[property]
				);
			}
		});
	}

	constructor(page) {
		this.page = page;
	}

	async goto(url, opts) {
		console.log('goto options:');
		opts && console.log(opts); // eslint-disable-line no-unused-expressions
		await this.page.goto(url, {
			waitUntil: ['domcontentloaded', 'networkidle0'],
			...opts
		});
		return Promise.resolve();
	}

	async getResponseOf(url) {
		const response = await this.page.waitForResponse(url);
		return response.json();
	}
}

class HDFCApi {
	constructor(creds = {}) {
		this.page = null;
		this.creds = creds;
		this.isLoggedIn = null;
	}

	async login(creds = {}) {
		this.page = await PuppeteerWrapper.build();
		const URL = 'https://mobilebanking.hdfcbank.com/mobilebanking/#login';

		await this.page.goto(URL, {
			waitUntil: ['domcontentloaded', 'networkidle0']
		});
		await this.page.waitForSelector('#fldLoginUserId');
		await this.page.type('#fldLoginUserId', creds.username);
		await this.page.waitFor(5000);
		await this.page.click('[name="fldSubmit"]');
		await this.page.waitForSelector('#upass');
		await this.page.type('#upass', creds.password);
		await this.page.click('#chkLogin');
		await this.page.click('[name="fldSubmit"]');
		await this.page.waitForResponse(
			'https://mobilebanking.hdfcbank.com/mobilebanking/Views/Menu/mymenu.html'
		);
		this.isLoggedIn = true;
	}
	async getTransactions() {
		if (!this.isLoggedIn) {
			await this.login(this.creds);
		}
		await this.page.goto(
			'https://mobilebanking.hdfcbank.com/mobilebanking/#rrsin01'
		);
		await this.page.waitFor('#fldFromDate', { visible: true });
		await this.page.evaluate(() => {
			// https://stackoverflow.com/a/1648448/5012005
			function addMonths(date, months) {
				date.setMonth(date.getMonth() + months);
				return date;
			}

			// https://stackoverflow.com/a/13460045/5012005
			function formattedDate(d = new Date()) {
				return [d.getDate(), d.getMonth() + 1, d.getFullYear()]
					.map(n => (n < 10 ? `0${n}` : `${n}`))
					.join('/');
			}

			const fromDt = formattedDate(addMonths(new Date(), -6));
			const toDt = formattedDate();
			document
				.querySelector('#fldFromDate')
				.setAttribute('value', fromDt);
			document.querySelector('#fldToDate').setAttribute('value', toDt);
		});
		await this.page.select('#fldNbrStmt', '40');
		await this.page.waitFor(3000);
		await this.page.click('#frmsin01 [type="submit"]');
		return this.page.getResponseOf(
			'https://mobilebanking.hdfcbank.com/meap/apps/services/api/meap/mobilewebapp/query'
		);
	}

	async logout() {
		await this.page.click('#logoutbutton a'); // Logout
		await this.page.close();
	}
}

// 1. Login
// 2. Logout
// 3. Get 6 months transactions
// 4. Get credit card account details

module.exports = HDFCApi;
