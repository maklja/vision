import Konva from 'konva';
import { Observable, Subject } from 'rxjs';
import { v1 } from 'uuid';
import {
	AnimationEvent,
	AnimationOptions,
	AbstractAnimation,
	AnimationEventType,
} from '../Animation';
import {
	animationOrchestrator,
	FLIP_TIMELINE_PATTERNS,
	REVERSE_SINGLE_TIMELINE_PATTERNS,
	SINGLE_TIMELINE_PATTERNS,
} from '../animationOrchestrator';

export class TweenAnimation extends AbstractAnimation {
	private readonly events$ = new Subject<AnimationEvent>();
	private readonly animationTween: Konva.Tween;
	private destroyed = false;

	constructor(
		config: Konva.TweenConfig,
		private readonly options: AnimationOptions = {},
		public readonly id = v1(),
	) {
		super();
		this.animationTween = new Konva.Tween(config);
		this.animationTween.onReset = this.onReset.bind(this);
		this.animationTween.onFinish = this.onFinish.bind(this);
	}

	observable(): Observable<AnimationEvent> {
		return this.events$.asObservable();
	}

	async play(): Promise<void> {
		if (this.destroyed) {
			return;
		}

		const patterns = this.options.autoReverse
			? FLIP_TIMELINE_PATTERNS
			: SINGLE_TIMELINE_PATTERNS;

		const oPromise = animationOrchestrator(this, patterns);
		this.onAnimationBegin?.(this);
		this.animationTween.play();
		await oPromise;
		this.onAnimationComplete?.(this);
	}

	async reverse(): Promise<void> {
		if (this.destroyed) {
			return;
		}

		if (this.options.autoReverse) {
			return this.play();
		}

		const oPromise = animationOrchestrator(this, REVERSE_SINGLE_TIMELINE_PATTERNS);
		this.onAnimationBegin?.(this);
		this.animationTween.reverse();
		await oPromise;
		this.onAnimationComplete?.(this);
	}

	async reset(): Promise<void> {
		if (this.destroyed) {
			return;
		}

		const oPromise = animationOrchestrator(this, [[AnimationEventType.Reset]]);
		this.animationTween.reset();
		await oPromise;
	}

	async finish(): Promise<void> {
		if (this.destroyed) {
			return;
		}

		const oPromise = animationOrchestrator(this, [
			this.options.autoReverse ? [AnimationEventType.Reset] : [AnimationEventType.Finish],
		]);
		this.options.autoReverse ? this.animationTween.reset() : this.animationTween.finish();
		await oPromise;
	}

	destroy(): void {
		if (this.destroyed) {
			return;
		}

		this.onDestroy();
		this.animationTween.destroy();
		this.onAnimationDestroy?.(this);
		this.events$.complete();
	}

	private onReset(): void {
		this.events$.next(this.resetEvent());
	}

	private onFinish(): void {
		this.events$.next(this.finishEvent());

		if (this.options.autoReverse) {
			this.animationTween.reverse();
		}
	}

	private onDestroy(): void {
		this.events$.next(this.destroyEvent());
	}
}
