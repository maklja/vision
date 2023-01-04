import { ThemeContext } from '../../theme';
import { AnimationTemplate } from '../AnimationTemplate';

export class AnimationRegistry {
	private readonly animationRegistry = new Map<
		string,
		(theme: ThemeContext, data?: unknown) => AnimationTemplate
	>();

	register(
		animationKey: string,
		animationConfig: (theme: ThemeContext, data?: unknown) => AnimationTemplate,
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
