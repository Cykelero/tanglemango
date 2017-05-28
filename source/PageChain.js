import CachedChain from './CachedChain';
import Page from './Page';
import {identityDomains} from './Identity';
import {domainForURL, asyncForEach} from './Utilities';

export default class PageChain extends CachedChain {
	constructor(originPage, forwardIdentity, backwardIdentity) {
		super();
		
		this.forwardIdentity = forwardIdentity;
		this.backwardIdentity = backwardIdentity;
		
		this.cachedItems[0] = originPage;
	}
	
	async _getItemAt(index) {
		let isPositivePage = (index > 0),
			previousPageIndex = index + (isPositivePage ? -1 : 1),
			requestedPageURL = await this._getPageLinkURL(previousPageIndex, isPositivePage);
		
		if (requestedPageURL) {
			return new Page(requestedPageURL);
		}
	}
	
	get hasDiscoveredStart() {
		return this._getPageLinkURL(this.minDiscoveredId, false).then(link => !link);
	}
	
	get hasDiscoveredEnd() {
		return this._getPageLinkURL(this.maxDiscoveredId, true).then(link => !link);
	}
	
	async _getPageLinks(index, forward) {
		let sourcePage = await this.getItemAt(index),
			linkIdentity = (forward ? this.forwardIdentity : this.backwardIdentity);
		
		if (sourcePage) {
			let pageLinks = linkIdentity.getMatchesIn(await sourcePage.dom),
				linkURL = pageLinks.length && pageLinks[0].getAttribute('href');
			
			if (linkURL && new Page(linkURL).url != sourcePage.url) {
				return pageLinks;
			}
		}

		return [];
	}
	
	async _getPageLinkURL(index, forward) {
		let sourcePage = await this.getItemAt(index),
			pageLinks = await this._getPageLinks(index, forward),
			linkURL = pageLinks.length && pageLinks[0].getAttribute('href');
		
		return linkURL || null;
	}
	
	static async getChainsForPage(startPage) {
		let chains = [];
	
		let startPageLinks = (await startPage.getElementsWithIdentities(identityDomains.link))
			.filter(link => {
				return domainForURL(link.element.href) === domainForURL(startPage.url);
			});
	
		// Explore each forward link
		await asyncForEach(startPageLinks, async (forwardLink) => {
			let secondPage = new Page(forwardLink.element.href),
				secondPageLinks = await secondPage.getElementsWithIdentities(identityDomains.link);
			
			secondPageLinks.forEach(backwardLink => {
				if (backwardLink.element.href === startPage.url) {
					// We have found a forward-backward identity pair
					let newChain = new PageChain(startPage, forwardLink.identity, backwardLink.identity);
					
					let existingOppositeChain = chains.find(existingChain => (
						existingChain.forwardIdentity.equals(newChain.backwardIdentity)
						&& existingChain.backwardIdentity.equals(newChain.forwardIdentity)
					));
					
					if (!existingOppositeChain) chains.push(newChain);
				}
			});
		});
		
		// Correct orientation of chains
		let orientedChains = [];
		
		await asyncForEach(chains, async (chain) => {
			let flipChain = false;
			
			// Find backward/forward links in a single page
			let backwardLinks, forwardLinks;

			backwardLinks = await chain._getPageLinks(0, false);
			forwardLinks = await chain._getPageLinks(0, true);
			
			if (!backwardLinks.length || !forwardLinks.length) {
				backwardLinks = await chain._getPageLinks(1, false);
				forwardLinks = await chain._getPageLinks(1, true);
			}
			
			if (backwardLinks.length && forwardLinks.length) {
				// Compare link positions
				let Node_DOCUMENT_POSITION_PRECEDING = 2,
					nodeOrder = backwardLinks[0].compareDocumentPosition(forwardLinks[0]);
				
				if (nodeOrder & Node_DOCUMENT_POSITION_PRECEDING) {
					flipChain = true;
				}
			}
			
			// Orient chain
			if (flipChain) {
				let startPage = await chain.getItemAt(0);
				orientedChains.push(new PageChain(startPage, chain.backwardIdentity, chain.forwardIdentity));
			} else {
				orientedChains.push(chain);
			}
		});
		
		return orientedChains;
	}
}
