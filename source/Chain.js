import Brick from './Brick';

export default class Chain extends Brick {
	constructor() {
		super();
	}
	
	//async getItemAt(index) {}
	
	async exploreToLength(targetLength) {
		while (this.discoveredLength < targetLength) {
			if (await this.hasDiscoveredAll) {
				return false;
			}
			
			let exploreForward;
			if (await this.hasDiscoveredStart) {
				exploreForward = true;
			} else if (await this.hasDiscoveredEnd) {
				exploreForward = false;
			} else {
				exploreForward = !(this.discoveredLength % 2);
			}
			
			await this.getItemAt(exploreForward ? this.maxDiscoveredId + 1 : this.minDiscoveredId - 1);
		}
		
		return true;
	}
	
	//hasDiscoveredId(id) {}
	
	get maxDiscoveredId() {
		let result = 1;
		while (this.hasDiscoveredId(result)) result++;
		return result - 1;
	}
	
	get minDiscoveredId() {
		let result = -1;
		while (this.hasDiscoveredId(result)) result--;
		return result + 1;
	}
	
	get discoveredLength() {
		return this.maxDiscoveredId - this.minDiscoveredId + 1;
	}
	
	//get hasDiscoveredStart() {}
	
	//get hasDiscoveredEnd() {}
	
	get hasDiscoveredAll() {
		return Promise.all([this.hasDiscoveredStart, this.hasDiscoveredEnd])
			.then(results => results[0] && results[1]);
	}
}
