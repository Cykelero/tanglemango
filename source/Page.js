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
	
	async getElementsWithIdentities(domain) {
		let dom = await this.dom;
		return Identity.getAllIn(dom, domain);
	}
	
	// Static
	static toCanonicalUrl(url) {
		return /^[^#]*/.exec(url)[0];
	}
}

