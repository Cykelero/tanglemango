# TangleMango

TangleMango looks at the links between webpages to guess at the structure of websites. In practice, this means you can for instance easily find a chain of pages that are connected by previous/next links, without requiring any site-specific or even language-specific work. Handy for scrapping image galeries, and more.

TangleMango is primarily designed to run in Node.js, but also basically works in browsers.

## Usage

Get TangleMango from npm:

````
npm install tanglemango
````

Then let it loose on some URL:

````js
import { PageChain } from 'tanglemango'
let chains = await PageChain.getChainsForPage('http://gunnerkrigg.com/?p=1');
````

It will inspect the page, and return an array of `PageChain` objects. Each of one these is a chain of pages that TangleMango detected, with handy methods for exploiting them:

````js
let someChain = chains[0],
	secondPage = someChain.getItem(1);

console.log('Next page: ', secondPage.url);
````

## Development

Clone TangleMango and run `npm install`.

You can then:

- **build** the release version using `npm run build`
- run the **sandbox**, a handy testbed, using `npm run sandbox`
- build the **browser sandbox**, an even handier testbed, using `npm run sandbox`.  
	You can then open `browser-sandbox.html` in your favorite browser. Make sure to disable its cross-domain restrictions or TangleMango won't be able to load anything.
