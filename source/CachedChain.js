import Chain from './Chain';

export default class CachedChain extends Chain {
	constructor() {
		super();
		
		this.cachedItems = {};
	}
	
	async getItemAt(index) {
		if (!this.hasDiscoveredIndex(index)) {
			this.cachedItems[index] = await this._getItemAt(index);
		}

		return this.cachedItems[index] || null;
	}
	
	//async _getItemAt(index) {}
	
	hasDiscoveredIndex(index) {
		return !!this.cachedItems[index];
	}
	
	//get hasDiscoveredStart() {}
	
	//get hasDiscoveredEnd() {}
}
