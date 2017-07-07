import Brick from './Brick';
import Identity from './Identity';
import {getDomForURL} from './Utilities';

export default class Page extends Brick {
	constructor(url) {
		super();
		
		this.url = this.constructor.toCanonicalURL(url);
	}
	
	get dom() {
		if (!sharedDomCache[this.url]) {
			sharedDomCache[this.url] = getDomForURL(this.url);
		}
		return sharedDomCache[this.url];
	}
	
	async getElementsWithIdentities(domain) {
		let dom = await this.dom;
		return Identity.getAllIn(dom, domain);
	}
	
	// Static
	static toCanonicalURL(url) {
		return /^[^#]*/.exec(url)[0];
	}
}

let sharedDomCache = {};
