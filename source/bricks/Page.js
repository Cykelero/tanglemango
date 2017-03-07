import Brick from './Brick';
import Identity from './Identity';

import jsdom from 'jsdom';	

export default class Page extends Brick {
	constructor(url) {
		super();
		
		this.url = this.constructor.toCanonicalUrl(url);
		this.dom = null;
		
		// Initialize
		this.dom = new Promise((resolve, reject) => {
			jsdom.env({
				url: this.url,
				done: function(error, window) {
					if (error) {
						console.warn(`Error when retrieving \`${this.url}\`:`, error);
						reject(error);
					} else {
						resolve(window.document);
					}
				}
			})
		});
	}
	
	async getLinksWithIdentities() {
		let dom = await this.dom,
			linkElements = dom.getElementsByTagName('a');
		
		let result = [];
		
		for (let linkElement of linkElements) {
			let linkIdentity = Identity.getForLink(linkElement);
			
			if (linkIdentity === null) continue;
			if (result.find(resultItem => resultItem.identity.equals(linkIdentity))) continue;
			
			result.push({
				url: linkElement.href,
				identity: linkIdentity
			});
		}
		
		return result;
	}
	
	// Static
	static toCanonicalUrl(url) {
		return /^[^#]*/.exec(url)[0];
	}
}

