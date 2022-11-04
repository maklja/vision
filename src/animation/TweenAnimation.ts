import Konva from 'konva';
import { Subject } from 'rxjs';
import { AnimationEventType, AnimationEvent, Animation } from './Animation';

export class TweenAnimation implements Animation {
	private readonly animationTween: Konva.Tween;
	private readonly events$ = new Subject<AnimationEvent>();

	constructor(config: Konva.TweenConfig) {
		this.animationTween = new Konva.Tween(config);
		this.animationTween.onReset = this.onReset.bind(this);
		this.animationTween.onUpdate = this.onUpdate.bind(this);
		this.animationTween.onFinish = this.onFinish.bind(this);
	}

	observable() {
		return this.events$.asObservable();
	}

	play() {
		this.animationTween.play();
	}

	reset() {
		this.animationTween.reset();
	}

	destroy() {
		this.onDestroy();
		this.animationTween.destroy();
		this.events$.complete();
	}

	private onUpdate() {
		this.events$.next({
			id: this.animationTween._id,
			type: AnimationEventType.Update,
		});
	}

	private onReset() {
		this.events$.next({
			id: this.animationTween._id,
			type: AnimationEventType.Reset,
		});
	}

	private onFinish() {
		this.events$.next({
			id: this.animationTween._id,
			type: AnimationEventType.Finish,
		});
	}

	private onDestroy() {
		this.events$.next({
			id: this.animationTween._id,
			type: AnimationEventType.Destroy,
		});
	}
}

