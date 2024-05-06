import { Theme } from '../../theme';
import { AnimationTemplate } from '../AnimationTemplate';

export class AnimationRegistry {
	private readonly animationRegistry = new Map<
		string,
		(theme: Theme, data?: unknown) => AnimationTemplate
	>();

	register(
		animationKey: string,
		animationConfig: (theme: Theme, data?: unknown) => AnimationTemplate,
	) {
		this.animationRegistry.set(animationKey, animationConfig);

		return this;
	}

	retrieveAnimationConfig(animationKey: string) {
		const animationConfig = this.animationRegistry.get(animationKey);
		if (!animationConfig) {
			throw new Error(`Animation configuration with key ${animationKey} not found`);
		}

		return animationConfig;
	}
}

