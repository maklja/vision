import Konva from 'konva';
import { Subject } from 'rxjs';
import { v1 } from 'uuid';
import { AnimationEventType, AnimationEvent, Animation, AnimationOptions } from './Animation';

export class TweenAnimation implements Animation {
	public readonly id = v1();
	private readonly animationTween: Konva.Tween;
	private readonly events$ = new Subject<AnimationEvent>();

	constructor(config: Konva.TweenConfig, private options?: AnimationOptions) {
		this.animationTween = new Konva.Tween(config);
		this.animationTween.onReset = this.onReset.bind(this);
		this.animationTween.onFinish = this.onFinish.bind(this);

		this.setupAnimation();
	}

	observable() {
		return this.events$.asObservable();
	}

	play() {
		this.animationTween.play();
	}

	reverse() {
		this.animationTween.reverse();
	}

	reset() {
		this.animationTween.reset();
	}

	destroy() {
		this.onDestroy();
		this.animationTween.destroy();
		this.events$.complete();
	}

	private setupAnimation() {
		if (!this.options) {
			return;
		}

		const { autoReverse } = this.options;
		this.events$.subscribe((event) => {
			if (autoReverse && event.type === AnimationEventType.Finish) {
				this.reverse();
			}
		});
	}

	private onReset() {
		this.events$.next({
			id: this.id,
			type: AnimationEventType.Reset,
			animation: this,
		});
	}

	private onFinish() {
		this.events$.next({
			id: this.id,
			type: AnimationEventType.Finish,
			animation: this,
		});
	}

	private onDestroy() {
		this.events$.next({
			id: this.id,
			type: AnimationEventType.Destroy,
			animation: this,
		});
	}
}

