import { merge, Observable } from 'rxjs';
import { v1 } from 'uuid';
import { AbstractAnimation, Animation, AnimationEvent } from './Animation';

export class AnimationGroup extends AbstractAnimation {
	constructor(private readonly animations: Animation[], public readonly id = v1()) {
		super();
	}

	observable(): Observable<AnimationEvent> {
		return merge(...this.animations.map((a) => a.observable()));
	}

	async play(): Promise<void> {
		this.onAnimationBegin?.(this);
		await Promise.all(this.animations.map((a) => a.play()));
		this.onAnimationComplete?.(this);
	}

	async reverse(): Promise<void> {
		this.onAnimationBegin?.(this);
		await Promise.all(this.animations.map((a) => a.reverse()));
		this.onAnimationComplete?.(this);
	}

	reset(): void {
		this.animations.forEach((a) => a.reset());
	}

	finish(): void {
		this.animations.forEach((a) => a.finish());
	}

	destroy(): void {
		this.animations.forEach((a) => a.destroy());
		this.onAnimationDestroy?.(this);
	}
}
