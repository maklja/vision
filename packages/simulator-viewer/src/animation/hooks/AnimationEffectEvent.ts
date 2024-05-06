import { AnimationKey } from '../registry';

export interface AnimationEffectEvent {
	animationId: string;
	animationKey: AnimationKey;
	drawerId: string;
}
