import Page from './Page';
import Chain from './Chain';

async function main() {
	//let testURL = 'http://buttersafe.com/2007/04/03/breakfast-sad-turtle/';
	let testURL = 'http://www.nerfnow.com/comic/885';
	//let testURL = 'http://www.nerfnow.com/comic/6';
	
	let page = new Page(testURL),
		chains = await Chain.getChainsForPage(page);
	
	chains.forEach(async function(chain) {
		let secondPage = await chain.getItemAt(1);
		let thirdPage = await chain.getItemAt(2);
		console.log('###', chain);
		console.log(secondPage);
		console.log(thirdPage);
		
		if (typeof window !== 'undefined') {
			window.foundChains = window.foundChains || [];
			window.foundChains.push(chain);
		}
	});
}

main();
