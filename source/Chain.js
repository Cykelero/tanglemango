import Brick from './Brick';
import Page from './Page';
import {identityDomains} from './Identity';
import {domainForURL} from './Utilities';

export default class Chain extends Brick {
	constructor(page, forwardIdentity, backwardIdentity) {
		super();
		
		this.pages = {};
		this.forwardIdentity = forwardIdentity;
		this.backwardIdentity = backwardIdentity;
		
		this.pages[0] = page;
	}
	
	async getItemAt(index) {
		if (!this.pages.hasOwnProperty(index)) {
			let isPositivePage = (index > 0),
				previousPageIndex = index + (isPositivePage ? -1 : 1),
				requestedPageURL = await this._getLinkURL(previousPageIndex, isPositivePage);
			
			if (requestedPageURL) {
				this.pages[index] = new Page(requestedPageURL);
			}
		}

		return this.pages[index] || null;
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
		return this.maxDiscoveredId - this.minDiscoveredId + 1;
	}
	
	get hasDiscoveredStart() {
		return this._getLinkURL(this.minDiscoveredId, false).then(link => !link);
	}
	
	get hasDiscoveredEnd() {
		return this._getLinkURL(this.maxDiscoveredId, true).then(link => !link);
	}
	
	get hasDiscoveredAll() {
		return Promise.all([this.hasDiscoveredStart, this.hasDiscoveredEnd])
			.then(results => results[0] && results[1]);
	}
	
	async _getLinkURL(index, forward) {
		let sourcePage = await this.getItemAt(index),
			linkIdentity = (forward ? this.forwardIdentity : this.backwardIdentity),
			linkElement = linkIdentity.getFirstMatchIn(await sourcePage.dom),
			linkURL = linkElement && linkElement.getAttribute('href');
		
		if (linkURL && new Page(linkURL).url != sourcePage.url) {
			return linkURL;
		}
		
		return null;
	}
	
	static async getChainsForPage(startPage) {
		let chains = [];
	
		let startPageLinks = (await startPage.getElementsWithIdentities(identityDomains.link))
			.filter(link => {
				return domainForURL(link.element.href) === domainForURL(startPage.url);
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
