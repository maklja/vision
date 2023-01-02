import { AnimationRegistry } from './AnimationRegistry';
import { errorDrawerAnimation } from './errorDrawerAnimation';
import { highlightDrawerAnimation } from './highlightDrawerAnimation';
import { snapConnectPointAnimation } from './snapConnectPointAnimation';
import { moveDrawerAnimation, MoveAnimation } from './moveDrawerAnimation';

export * from './AnimationKey';
export type { MoveAnimation };

export const animationRegistry = new AnimationRegistry();
animationRegistry
	.register(highlightDrawerAnimation.key, highlightDrawerAnimation.factory)
	.register(errorDrawerAnimation.key, errorDrawerAnimation.factory)
	.register(snapConnectPointAnimation.key, snapConnectPointAnimation.factory)
	.register(moveDrawerAnimation.key, moveDrawerAnimation.factory);
