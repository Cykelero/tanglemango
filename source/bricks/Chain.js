import Brick from './Brick';
import Page from './Page';

export default class Chain extends Brick {
	constructor(page, forwardIdentity, backwardIdentity) {
		super();
		
		this.page = page;
		this.forwardIdentity = forwardIdentity;
		this.backwardIdentity = backwardIdentity;
	}
	
	static async getChainsForPage(startPage) {
		let chains = [];
	
		let startPageLinks = await startPage.getLinksWithIdentities();
		startPageLinks = startPageLinks.filter(link => {
			return domainForUrl(link.element.href) === domainForUrl(startPage.url);
		});
	
		// Test each forward link
		await Promise.all(startPageLinks.map(async function(forwardLink) {
			let secondPage = new Page(forwardLink.element.href),
				secondPageLinks = await secondPage.getLinksWithIdentities();
			
			let backwardLink = secondPageLinks.find(backwardLink => {
				return (backwardLink.element.href === startPage.url);
			});
			
			if (forwardLink.identity.typeName === 'rel') {
				console.log(forwardLink, backwardLink);
			}
			
			if (backwardLink) {
				// Matching backward link found: chain found
				chains.push(new Chain(startPage, forwardLink.identity, backwardLink.identity));
			}
		}));
		
		return chains;
	}
}

function domainForUrl(url) {
	let results = /\/\/([^\/]+)/.exec(url);
	return results && results[1];
};
