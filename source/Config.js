if (typeof fetch === 'undefined') var fetch = require('node-fetch');


let ConfigValues = {
	textForURLProvider: async function(url) {
		let response = await fetch(url),
			text = await response.text();
	
		return text;
	}
};

let ConfigProxy = {
	setTextForURLProvider: function(provider) {
		ConfigValues.textForURLProvider = provider;
	}
};

export { ConfigValues as values, ConfigProxy as proxy };
