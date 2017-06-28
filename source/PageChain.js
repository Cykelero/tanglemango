import CachedChain from './CachedChain';
import Page from './Page';
import {identityDomains} from './Identity';
import {domainForURL, parallelForEach} from './Utilities';

export default class PageChain extends CachedChain {
	constructor(originPage, forwardIdentity, backwardIdentity) {
		super();
		
		this.forwardIdentity = forwardIdentity;
		this.backwardIdentity = backwardIdentity;
		
		this.cachedItems[0] = originPage;
	}
	
	async _getItemAt(index) {
		if (index === 0) return this.cachedItems[0];
		
		let isPositivePage = (index > 0),
			previousPageIndex = index + (isPositivePage ? -1 : 1),
			requestedPageURL = await this._getLinkURLAt(previousPageIndex, isPositivePage);
		
		if (requestedPageURL) {
			let page = new Page(requestedPageURL);
			if (await this._validatePage(page, index)) return page;
		}
	}
	
	async _hasDiscoveredExtremity(edgeIndex, forward) {
		let nextPageURL = await this._getLinkURLAt(edgeIndex, forward);
		
		if (!nextPageURL) {
			return true;
		} else {
			let nextPage = new Page(nextPageURL),
				nextPageIndex = edgeIndex + (forward ? 1 : -1);
			
			return !(await this._validatePage(nextPage, nextPageIndex));
		}
	}
	
	get hasDiscoveredStart() {
		return this._hasDiscoveredExtremity(this.minDiscoveredIndex, false);
	}
	
	get hasDiscoveredEnd() {
		return this._hasDiscoveredExtremity(this.maxDiscoveredIndex, true);
	}
	
	async _getLinksFromPage(sourcePage, forward) {
		let linkIdentity = (forward ? this.forwardIdentity : this.backwardIdentity);
		
		if (sourcePage) {
			let pageLinks = linkIdentity.getMatchesIn(await sourcePage.dom),
				linkURL = pageLinks.length && pageLinks[0].href;
			
			if (linkURL && new Page(linkURL).url != sourcePage.url) {
				return pageLinks;
			}
		}

		return [];
	}
	
	async _getLinksAt(index, forward) {
		let sourcePage = await this.getItemAt(index);
		
		return this._getLinksFromPage(sourcePage, forward);
	}
	
	async _getLinkURLAt(index, forward) {
		let pageLinks = await this._getLinksAt(index, forward),
			linkURL = pageLinks.length && pageLinks[0].href;
		
		return linkURL || null;
	}
	
	async _validatePage(page, index) {
		let isPositivePage = (index > 0),
			checkForward = !isPositivePage;
		
		let previousPageIndex = index + (checkForward ? 1 : -1),
			previousPage = await this.getItemAt(previousPageIndex);
		
		let previousLinks = await this._getLinksFromPage(page, checkForward),
			previousURL = previousLinks.length && previousLinks[0].href;
			
		if (!previousURL) return false;
		
		return new Page(previousURL).url === previousPage.url;
	}
	
	static async getChainsForPage(startPage) {
		let chains = [];
	
		let startPageLinks = (await startPage.getElementsWithIdentities(identityDomains.link))
			.filter(link => {
				return domainForURL(link.element.href) === domainForURL(startPage.url);
			});
	
		// Explore each forward link
		await parallelForEach(startPageLinks, async (forwardLink) => {
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
		
		await parallelForEach(chains, async (chain) => {
			let flipChain = false;
			
			// Find backward/forward links in a single page
			let backwardLinks, forwardLinks;

			backwardLinks = await chain._getLinksAt(0, false);
			forwardLinks = await chain._getLinksAt(0, true);
			
			if (!backwardLinks.length || !forwardLinks.length) {
				backwardLinks = await chain._getLinksAt(1, false);
				forwardLinks = await chain._getLinksAt(1, true);
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
