import Brick from './Brick';
import PageLink from './PageLink';

import jsdom from 'jsdom';	

export default class Page extends Brick {
	constructor(url) {
		super();
		
		console.log(url);
		
		this.url = this.constructor.toCanonicalUrl(url);
		this.dom = null;
		
		// Initialize
		this.dom = new Promise((resolve, reject) => {
			jsdom.env({
				url: this.url,
				done: function(error, window) {
					if (error) reject(error);
					
					resolve(window.document);
				}
			})
		});
	}
	
	async getLinksWithIdentities() {
		let dom = await this.dom,
			linkElements = dom.getElementsByTagName('a');
		
		let result = [];
		
		for (let linkElement of linkElements) {
			let linkWithIdentity = new PageLink(this, linkElement),
				linkIdentity = await linkWithIdentity.identity;
			
			if (linkIdentity === null) continue;
			
			let hasEqualInResultArray = false;
			
			await Promise.all(result.map(async function(resultLink) {
				let isEqual = await resultLink.equals(linkWithIdentity);
				if (isEqual) hasEqualInResultArray = true;
			}));
			
			if (hasEqualInResultArray) continue;
			
			result.push(linkWithIdentity);
		}
		
		return result;
	}
	
	// Static
	static toCanonicalUrl(url) {
		return /^[^#]*/.exec(url)[0];
	}
}

