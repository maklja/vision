import { TweenAnimationConfig } from '..';
import { ThemeContext } from '../../theme';

export class AnimationRegistry {
	private readonly animationRegistry = new Map<
		string,
		(theme: ThemeContext) => TweenAnimationConfig
	>();

	register(animationKey: string, animationConfig: (theme: ThemeContext) => TweenAnimationConfig) {
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
