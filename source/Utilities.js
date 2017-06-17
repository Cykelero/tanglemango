import jsdom from 'jsdom';

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
	
	do {
		result.push(nodeList[currentIndex]);
	} while(nodeList[++currentIndex]);
	
	return result;
};

export async function getDomFromURL(url) {
	if (typeof DOMParser !== 'undefined') {
		// In browser
		let response = await fetch(url),
			html = await response.text(),
			dom = new DOMParser().parseFromString(html, 'text/html');
		
		if (!dom.querySelector('base')) {
			let baseElement = dom.createElement('base');
			baseElement.href = url;
			dom.head.appendChild(baseElement);
		}
		
		return dom;
	} else {
		// In Node
		return new Promise((resolve, reject) => {
			jsdom.env({
				url: url,
				done: function(error, window) {
					if (error) {
						console.warn(`Error when retrieving \`${this.url}\`:`, error);
						reject(error);
					} else {
						resolve(window.document);
					}
				}
			});
		});
	};
};
