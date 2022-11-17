import Konva from 'konva';
import { Observable, Subject } from 'rxjs';
import { v1 } from 'uuid';
import { Animation, AnimationEvent, AnimationOptions, AbstractAnimation } from './Animation';
import {
	animationOrchestrator,
	FLIP_TIMELINE_PATTERNS,
	REVERSE_SINGLE_TIMELINE_PATTERNS,
	SINGLE_TIMELINE_PATTERNS,
} from './animationOrchestrator';
import { AnimationDestroyedError } from './errors';

export class TweenAnimation extends AbstractAnimation {
	public readonly id = v1();
	private readonly events$ = new Subject<AnimationEvent>();
	private readonly animationTween: Konva.Tween;

	constructor(config: Konva.TweenConfig, private options?: AnimationOptions) {
		super();
		console.log(Konva.Tween.attrs);
		this.animationTween = new Konva.Tween(config);
		this.animationTween.onReset = this.onReset.bind(this);
		this.animationTween.onFinish = this.onFinish.bind(this);
	}

	observable(): Observable<AnimationEvent> {
		return this.events$.asObservable();
	}

	async play(): Promise<Animation> {
		this.animationTween.play();
		const patterns = this.options?.autoReverse
			? FLIP_TIMELINE_PATTERNS
			: SINGLE_TIMELINE_PATTERNS;

		this.options?.onAnimationStart?.(this);
		await animationOrchestrator(this, patterns);
		this.options?.onAnimationFinish?.(this);

		return this;
	}

	async reverse(): Promise<Animation> {
		if (this.options?.autoReverse) {
			return this.play();
		}

		this.animationTween.reverse();
		this.options?.onAnimationStart?.(this);
		await animationOrchestrator(this, REVERSE_SINGLE_TIMELINE_PATTERNS);
		this.options?.onAnimationFinish?.(this);

		return this;
	}

	reset(): void {
		this.animationTween.reset();
	}

	finish(): void {
		if (this.options?.autoReverse) {
			this.animationTween.reset();
		} else {
			this.animationTween.finish();
		}
	}

	destroy(): void {
		this.onDestroy();
		this.animationTween.destroy();
		this.events$.error(new AnimationDestroyedError(this.id));
	}

	private onReset(): void {
		this.events$.next(this.resetEvent());
	}

	private onFinish(): void {
		this.events$.next(this.finishEvent());

		if (this.options?.autoReverse) {
			this.animationTween.reverse();
		}
	}

	private onDestroy(): void {
		this.events$.next(this.destroyEvent());
	}
}

