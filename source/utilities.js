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
