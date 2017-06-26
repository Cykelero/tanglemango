import Brick from './Brick';
import {arrayFromNodeList} from './Utilities';

export default class Identity extends Brick {
	constructor(selector, type, value) {
		super();
		
		this.selector = selector;
		this.type = type;
		this.value = value;
	}
	
	equals(other) {
		return other
			&& this.selector === other.selector
			&& this.type === other.type
			&& this.type.equals(this.value, other.value);
	}
	
	matches(element) {
		if (!element) return false;
		
		return element.matches(this.selector)
			&& this.type.equals(this.type.valueFor(element), this.value);
	}
	
	getMatchesIn(container) {
		let candidates = container.querySelectorAll(this.selector);
		candidates = arrayFromNodeList(candidates);
		
		return candidates.filter(candidate => this.matches(candidate));
	}
	
	getFirstMatchIn(container) {
		return this.getMatchesIn(container)[0];
	}
	
	static getFor(element, domain, context = element.ownerDocument) {
		let peers = context.querySelectorAll(domain.selector);
		peers = arrayFromNodeList(peers);
		
		function checkPeers(candidateIdentity) {
			for (let peer of peers) {
				if (candidateIdentity.matches(peer) && !domain.checkPeer(peer, element)) {
					return false;
				}
			}
			return true;
		}
		
		// Search for a valid identity
		for (let identityType of IdentityType.types) {
			let identityValue = identityType.valueFor(element),
				identity = new Identity(domain.selector, identityType, identityValue);
			
			if (!checkPeers(identity)) continue;
			
			return identity;
		}
		
		return null;
	}
	
	static getAllIn(container, domain, context = container) {
		let candidates = container.querySelectorAll(domain.selector);
		candidates = arrayFromNodeList(candidates);
	
		let result = [];
	
		for (let candidate of candidates) {
			let candidateIdentity = Identity.getFor(candidate, domain, context);
		
			if (candidateIdentity === null) continue;
			if (result.find(resultItem => resultItem.identity.equals(candidateIdentity))) continue;
		
			result.push({
				element: candidate,
				identity: candidateIdentity
			});
		}
	
		return result;
	}
}

class IdentityType {
	constructor(name, valueForMethod, equalsMethod) {
		this.name = name;
		this.valueFor = valueForMethod;
		this.equals = equalsMethod || ((a, b) => a === b);
	}
};

IdentityType.types = [
	new IdentityType('id', e => e.getAttribute('id')),
	new IdentityType('rel', e => e.getAttribute('rel')),
	new IdentityType('alt', e => e.getAttribute('alt')),
	new IdentityType('title', e => e.getAttribute('title')),
	new IdentityType('classname', e => e.getAttribute('class')),
	new IdentityType('text', e => e.textContent),
	new IdentityType('childImageSrc', e => {
		let firstImageChild = e.querySelector('img'),
			imageSrc = firstImageChild && firstImageChild.src;
		
		return imageSrc;
	})
];

class IdentityDomain {
	constructor(selector, checkPeerMethod) {
		this.selector = selector;
		this.checkPeer = checkPeerMethod;
	}
}

IdentityDomain.domains = {
	link: new IdentityDomain('a', ((a, b) => a.href === b.href)),
	image: new IdentityDomain('img', ((a, b) => a.src === b.src))
};

export let identityDomains = IdentityDomain.domains;
