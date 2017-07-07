import { JSDOM } from 'jsdom';
import { values as ConfigValues } from './Config';

export function parallelForEach(array, callback) {
	return Promise.all(array.map(callback));
};

export function domainForURL(url) {
	let results = /\/\/([^\/]+)/.exec(url);
	return results && results[1];
};

export function arrayFromNodeList(nodeList) {
	// Circumvent jsdom performance issue with getting the length of a node list
	let result = [],
		currentIndex = 0;
	
	while(nodeList[currentIndex]) {
		result.push(nodeList[currentIndex]);
		currentIndex++;
	}
	
	return result;
};

export async function getTextForURL(url) {
	return ConfigValues.textForURLProvider(url);
}

export async function getDomForURL(url) {
	let text = await getTextForURL(url);
	
	if (typeof DOMParser !== 'undefined') {
		// In browser
		let dom = new DOMParser().parseFromString(text, 'text/html');
		
		if (!dom.querySelector('base')) {
			let baseElement = dom.createElement('base');
			baseElement.href = url;
			dom.head.appendChild(baseElement);
		}
		
		return dom;
	} else {
		// In Node
		let parsed = new JSDOM(text, {url: url});
		return parsed.window.document;
	};
};
