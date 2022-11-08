import { filter, map, Observable, switchMap, zip } from 'rxjs';
import { v1 } from 'uuid';
import { Animation, AnimationEvent, AnimationEventType } from './Animation';

export class AnimationSequence implements Animation {
	public readonly id = v1();
	private readonly animationEvents$: Observable<AnimationEvent>;

	constructor(private readonly animations: Animation[]) {
		const [startAnimation, ...otherAnimations] = animations;
		const nextAnimations = (otherAnimations || []).flatMap((animation) => [
			filter<AnimationEvent>((event) => event.type === AnimationEventType.Finish),
			switchMap(() => {
				animation.play();
				return animation.observable();
			}),
		]);
		this.animationEvents$ = startAnimation.observable().pipe(...(nextAnimations as []));
	}

	observable(): Observable<AnimationEvent> {
		return this.animationEvents$;
	}

	play(): void {
		this.animations[0].play();
	}

	reverse(): void {
		throw new Error('Method not implemented.');
	}

	reset(): void {
		this.animations.forEach((a) => a.reset());
	}

	destroy(): void {
		this.animations.forEach((a) => a.destroy());
	}
}
