import Brick from './Brick';
import Page from './Page';
import {identityDomains} from './Identity';

export default class Chain extends Brick {
	constructor(page, forwardIdentity, backwardIdentity) {
		super();
		
		this.page = page;
		this.forwardIdentity = forwardIdentity;
		this.backwardIdentity = backwardIdentity;
	}
	
	static async getChainsForPage(startPage) {
		let chains = [];
	
		let startPageLinks = (await startPage.getElementsWithIdentities(identityDomains.link))
			.filter(link => {
				return domainForUrl(link.element.href) === domainForUrl(startPage.url);
			});
	
		// Test each forward link
		await Promise.all(startPageLinks.map(async function(forwardLink) {
			let secondPage = new Page(forwardLink.element.href),
				secondPageLinks = await secondPage.getElementsWithIdentities(identityDomains.link);
			
			secondPageLinks.forEach(backwardLink => {
				if (backwardLink.element.href === startPage.url) {
					// We have found a forward-backward identity pair
					chains.push(new Chain(startPage, forwardLink.identity, backwardLink.identity));
				}
			});
		}));
		
		return chains;
	}
}

function domainForUrl(url) {
	let results = /\/\/([^\/]+)/.exec(url);
	return results && results[1];
};
