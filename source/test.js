import Page from './Page';
import Chain from './Chain';

async function main() {
	//let testUrl = 'http://buttersafe.com/2007/04/03/breakfast-sad-turtle/';
	let testUrl = 'http://www.nerfnow.com/comic/885';
	
	let page = new Page(testUrl),
		chains = await Chain.getChainsForPage(page);
	
	console.log(chains);
}

main();
