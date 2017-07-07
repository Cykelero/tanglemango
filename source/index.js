export { proxy as config } from './Config';

export { default as Brick }  from './Brick';

export { default as Page }  from './Page';
export { default as Identity }  from './Identity';

export { default as Chain }  from './Chain';
export { default as CachedChain }  from './CachedChain';
export { default as PageChain }  from './PageChain';

import { parallelForEach, arrayFromNodeList } from './Utilities';
export let utilities = { parallelForEach, arrayFromNodeList };
