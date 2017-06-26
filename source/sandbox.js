import * as TangleMango from './index';

async function main() {
	//let testURL = 'http://buttersafe.com/2007/04/03/breakfast-sad-turtle/';
	//let testURL = 'http://www.nerfnow.com/comic/885';
	//let testURL = 'http://www.nerfnow.com/comic/6';
	//let testURL = 'https://www.igen.fr/ios/2017/06/apple-plans-le-dessous-des-cartes-100029';
	let testURL = 'http://gunnerkrigg.com/?p=2';
	
	let page = new TangleMango.Page(testURL),
		chains = await TangleMango.PageChain.getChainsForPage(page);
	
	await TangleMango.utilities.parallelForEach(chains, async function(chain) {
		let pageTwo = await chain.getItemAt(2);
		if (!pageTwo) pageTwo = await chain.getItemAt(-2);
		
		if (chain.discoveredLength < 3) return;
		
		console.log('###', chain.backwardIdentity, chain.forwardIdentity);
		console.log(pageTwo);
		
		if (typeof window !== 'undefined') {
			window.foundChains = window.foundChains || [];
			window.foundChains.push(chain);
		}
	});
	
	console.log('Done.');
}

main();
