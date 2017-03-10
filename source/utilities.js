import jsdom from 'jsdom';


export function domainForUrl(url) {
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

export function getDomFromURL(url) {
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
