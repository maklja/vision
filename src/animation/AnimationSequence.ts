import { merge, Observable } from 'rxjs';
import { v1 } from 'uuid';
import { AbstractAnimation, Animation, AnimationEvent } from './Animation';

// TODO remove?
export class AnimationSequence extends AbstractAnimation {
	public readonly id = v1();

	constructor(private readonly animations: Animation[]) {
		super();
	}

	observable(): Observable<AnimationEvent> {
		return merge(...this.animations.map((a) => a.observable()));
	}

	async play(): Promise<void> {
		for (const animation of this.animations) {
			animation.reset();
			await animation.play();
		}
	}

	async reverse(): Promise<void> {
		const reverseAnimations = [...this.animations].reverse();
		for (const animation of reverseAnimations) {
			animation.finish();
			await animation.reverse();
		}
	}

	async finish(): Promise<void> {
		this.animations.forEach((a) => a.finish());
	}

	async reset(): Promise<void> {
		this.animations.forEach((a) => a.reset());
	}

	destroy(): void {
		this.animations.forEach((a) => a.destroy());
	}
}
