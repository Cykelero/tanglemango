import Brick from './Brick';

export default class Identity extends Brick {
	constructor(type, value) {
		super();
		
		this.type = type;
		this.value = value;
	}
	
	equals(other) {
		return
			other
			&& this.type === other.type
			&& this.type.equals(this.value, other.value);
	}
	
	matches(element) {
		if (!this.type) return false;
		if (!element) return false;
		
		return this.type.equals(this.type.get(element), this.value);
	}
	
	static get(element, vetoCallback) {
		for (let identityType of IdentityType.types) {
			let identityValue = identityType.get(element),
				identity = new Identity(identityType, identityValue);
			
			if (!vetoCallback(identity)) continue;
			
			return identity;
		};
		
		return null;
	}
	
	static getWithPeerCheck(element, peers, peerCheckCallback) {
		return this.get(element, candidateIdentity => {
			for (let peer of peers) {
				if (candidateIdentity.matches(peer) && !peerCheckCallback(peer)) {
					return false;
				}
			}
	
			return true;
		});
	}
	
	// Common case shortcuts
	static getForLink(element) {
		return this.getWithPeerCheck(
			element,
			element.ownerDocument.getElementsByTagName('a'),
			peer => (peer.href === element.href)
		);
	}

	static getForImage(element) {
		return this.getWithPeerCheck(
			element,
			element.ownerDocument.getElementsByTagName('img'),
			peer => (peer.src === element.src)
		);
	}
}

class IdentityType {
	constructor(name, getMethod, equalsMethod) {
		this.name = name;
		this.get = getMethod;
		this.equals = equalsMethod || ((a, b) => a === b);
	}
};

IdentityType.types = [
	new IdentityType('id', e => e.getAttribute('id')),
	new IdentityType('rel', e => e.getAttribute('rel')),
	new IdentityType('alt', e => e.getAttribute('alt')),
	new IdentityType('title', e => e.getAttribute('title')),
	new IdentityType('classname', e => e.getAttribute('class')),
	new IdentityType('text', e => e.textContent)
];
