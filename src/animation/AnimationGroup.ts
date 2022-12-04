import { merge, Observable } from 'rxjs';
import { v1 } from 'uuid';
import { Animation, AnimationEvent } from './Animation';

export class AnimationGroup implements Animation {
	constructor(private readonly animations: Animation[], public readonly id = v1()) {}

	observable(): Observable<AnimationEvent> {
		return merge(...this.animations.map((a) => a.observable()));
	}

	async play(): Promise<Animation> {
		await Promise.all(this.animations.map((a) => a.play()));
		return this;
	}

	async reverse(): Promise<Animation> {
		await Promise.all(this.animations.map((a) => a.reverse()));
		return this;
	}

	reset(): void {
		this.animations.forEach((a) => a.reset());
	}

	finish(): void {
		this.animations.forEach((a) => a.finish());
	}

	destroy(): void {
		this.animations.forEach((a) => a.destroy());
	}
}
