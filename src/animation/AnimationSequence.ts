import { merge, Observable } from 'rxjs';
import { v1 } from 'uuid';
import { AbstractAnimation, Animation, AnimationEvent } from './Animation';

export class AnimationSequence extends AbstractAnimation {
	public readonly id = v1();

	constructor(private readonly animations: Animation[]) {
		super();
	}

	observable(): Observable<AnimationEvent> {
		return merge(...this.animations.map((a) => a.observable()));
	}

	async play(): Promise<Animation> {
		for (const animation of this.animations) {
			animation.reset();
			await animation.play();
		}

		return this;
	}

	async reverse(): Promise<Animation> {
		const reverseAnimations = [...this.animations].reverse();
		for (const animation of reverseAnimations) {
			animation.finish();
			await animation.reverse();
		}

		return this;
	}

	finish(): void {
		this.animations.forEach((a) => a.finish());
	}

	reset(): void {
		this.animations.forEach((a) => a.reset());
	}

	destroy(): void {
		this.animations.forEach((a) => a.destroy());
	}
}

