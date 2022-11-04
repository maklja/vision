import { filter, map, merge, Observable, zip } from 'rxjs';
import { Animation, AnimationEvent } from './Animation';

export class AnimationGroup implements Animation {
	private readonly animationEvents$: Observable<AnimationEvent>;
	constructor(private readonly animations: Animation[]) {
		this.animationEvents$ = zip(...this.animations.map((a) => a.observable())).pipe(
			filter((events) => events.every((event, i, array) => event.type === array[0].type))
            map(events),
		);
	}

	observable(): Observable<AnimationEvent> {
		return merge(...this.animations.map((a) => a.observable()));
	}

	play(): void {
		this.animations.forEach((a) => a.play());
	}
	reset(): void {
		this.animations.forEach((a) => a.reset());
	}
	destroy(): void {
		this.animations.forEach((a) => a.destroy());
	}
}

