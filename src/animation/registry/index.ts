import { AnimationRegistry } from './AnimationRegistry';
import { errorDrawerAnimation } from './errorDrawerAnimation';
import { highlightDrawerAnimation } from './highlightDrawerAnimation';
import { snapConnectPointAnimation } from './snapConnectPointAnimation';

export * from './AnimationKey';

export const animationRegistry = new AnimationRegistry();
animationRegistry
	.register(highlightDrawerAnimation.key, highlightDrawerAnimation.factory)
	.register(errorDrawerAnimation.key, errorDrawerAnimation.factory)
	.register(snapConnectPointAnimation.key, snapConnectPointAnimation.factory);
