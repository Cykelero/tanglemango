import Brick from './Brick';
import Page from './Page';
import {identityDomains} from './Identity';
import {domainForUrl} from './Utilities';

export default class Chain extends Brick {
	constructor(page, forwardIdentity, backwardIdentity) {
		super();
		
		this.pages = {};
		this.forwardIdentity = forwardIdentity;
		this.backwardIdentity = backwardIdentity;
		
		this.pages[0] = Promise.resolve(page);
	}
	
	async getItemAt(index) {
		let isPositivePage = (index > 0);
		
		if (this.pages.hasOwnProperty(index)) {
			return this.pages[index];
		} else {
			let previousPageIndex = index + (isPositivePage ? -1 : 1),
				previousPage = await this.getItemAt(previousPageIndex),
				linkIdentity = (isPositivePage ? this.forwardIdentity : this.backwardIdentity),
				linkElement = linkIdentity.getFirstMatchIn(await previousPage.dom);
			
			if (!linkElement) {
				return Promise.reject(`No ${isPositivePage ? 'forward' : 'backward'} link on page ${previousPageIndex}`);
			} else {
				let requestedPageUrl = linkElement.getAttribute('href'),
					requestedPage = new Page(requestedPageUrl);
				
				this.pages[index] = requestedPage;
				
				return Promise.resolve(requestedPage);
			}
		}
	}
	
	get maxDiscoveredId() {
		let result = 1;
		while (this.pages.hasOwnProperty(result)) result++;
		return result - 1;
	}
	
	get minDiscoveredId() {
		let result = -1;
		while (this.pages.hasOwnProperty(result)) result--;
		return result + 1;
	}
	
	get discoveredLength() {
		return this.maxDiscoveredId - this.minDiscoveredId;
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
					let newChain = new Chain(startPage, forwardLink.identity, backwardLink.identity);
					
					let existingOppositeChain = chains.find(existingChain => (
						existingChain.forwardIdentity.equals(newChain.backwardIdentity)
						&& existingChain.backwardIdentity.equals(newChain.forwardIdentity)
					));
					
					if (!existingOppositeChain) chains.push(newChain);
				}
			});
		}));
		
		return chains;
	}
}
