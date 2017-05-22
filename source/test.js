import Page from './Page';
import Chain from './Chain';

async function main() {
	//let testUrl = 'http://buttersafe.com/2007/04/03/breakfast-sad-turtle/';
	let testUrl = 'http://www.nerfnow.com/comic/885';
	
	let page = new Page(testUrl),
		chains = await Chain.getChainsForPage(page);
	
	chains.forEach(async function(chain) {
		let secondPage = await chain.getItemAt(1);
		let thirdPage = await chain.getItemAt(2);
		console.log('###', chain);
		console.log(secondPage);
		console.log(thirdPage);
		
		window.a = window.a || [];
		window.a.push(chain);
	});
}

main();
