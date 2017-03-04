import Brick from './Brick';

let identityTypes = {
	id: {get: e => e.getAttribute('id')},
	rel: {get: e => e.getAttribute('rel')},
	classname: {get: e => e.getAttribute('class')},
	text: {get: e => e.textContent}
};

Object.keys(identityTypes).forEach(identityTypeName => {
	let identityType = identityTypes[identityTypeName];
	if (!identityType.equals) identityType.equals = (a, b) => (a === b);
})

export default class PageLink extends Brick {
	constructor(parentPage, element) {
		super();
		
		this.parentPage = parentPage;
		this.element = element;
		this.identity = null;
		
		// Initialize
		this.identity = this.computeIdentity();
	}
	
	async computeIdentity() {
		let pageDom = await this.parentPage.dom,
			pageLinkElements = pageDom.getElementsByTagName('a'),
			linkHref = this.element.href;
		
		let result = null;
		
		for (let identityTypeName of Object.keys(identityTypes)) {
			let identityType = identityTypes[identityTypeName],
				identityValue = identityType.get(this.element);
			
			// Ensure identity value is truthy
			if (!identityValue) continue;
			
			// Ensure uniquess
			let foundProblemSibling = false;
			for (let otherLinkElement of pageLinkElements) {
				let otherLinkIdentityValue = identityType.get(otherLinkElement),
					otherLinkHref = otherLinkElement.href;
				
				if (identityType.equals(otherLinkIdentityValue, identityType) && otherLinkHref !== linkHref) {
					// Identity is shared with a link with a different src
					foundProblemSibling = true;
					break;
				}
			}
			
			if (foundProblemSibling) continue;
		
			// OK!
			result = {
				type: identityType,
				typeName: identityTypeName,
				value: identityValue
			};
			break;
		};
		
		return result;
	}
	
	async equals(other) {
		let identity = await this.identity,
			otherIdentity = await other.identity;
		
		return this.page === other.page
			&& !!(identity && otherIdentity)
			&& (identity.type === otherIdentity.type)
			&& identity.type.equals(identity.value, otherIdentity.value);
	}
}
