import Brick from './Brick';
import Identity from './Identity';
import {getDomFromURL} from './Utilities';

export default class Page extends Brick {
	constructor(url) {
		super();
		
		this.url = this.constructor.toCanonicalURL(url);
		this._dom = null;
	}
	
	get dom() {
		if (this._dom) return this._dom;
		return getDomFromURL(this.url);
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
