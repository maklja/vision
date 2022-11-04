import { filter, map, Observable, zip } from 'rxjs';
import { v1 } from 'uuid';
import { Animation, AnimationEvent } from './Animation';

export class AnimationGroup implements Animation {
	public readonly id = v1();
	private readonly animationEvents$: Observable<AnimationEvent>;

	constructor(private readonly animations: Animation[]) {
		this.animationEvents$ = zip(...this.animations.map((a) => a.observable())).pipe(
			filter((events) => events.every((event, _, array) => event.type === array[0].type)),
			map((events) => ({
				id: this.id,
				type: events[0].type,
				animation: this,
			})),
		);
	}

	observable(): Observable<AnimationEvent> {
		return this.animationEvents$;
	}

	play(): void {
		this.animations.forEach((a) => a.play());
	}

	reverse(): void {
		this.animations.forEach((a) => a.reverse());
	}

	reset(): void {
		this.animations.forEach((a) => a.reset());
	}

	destroy(): void {
		this.animations.forEach((a) => a.destroy());
	}
}
