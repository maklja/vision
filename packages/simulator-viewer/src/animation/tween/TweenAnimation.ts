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
	SINGLE_TIMELINE_PATTERNS,
} from '../animationOrchestrator';

export class TweenAnimation extends AbstractAnimation {
	private readonly events$ = new Subject<AnimationEvent>();
	private tween: Konva.Tween | null = null;
	private destroyed = false;

	constructor(
		private readonly config: Konva.TweenConfig,
		private readonly options: AnimationOptions = {},
		public readonly id = v1(),
	) {
		super();
	}

	private get animationTween(): Konva.Tween {
		if (!this.tween) {
			// Capture starting values at playback, after React commits the canvas position.
			// Constructing a wrapper alone must not allocate or mutate a canvas tween.
			this.tween = new Konva.Tween(this.config);
			this.tween.onReset = this.onReset.bind(this);
			this.tween.onFinish = this.onFinish.bind(this);
		}
		return this.tween;
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

		const oPromise = animationOrchestrator(this, [[AnimationEventType.Reset]]);
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
		if (this.options.autoReverse) {
			this.animationTween.reset();
		} else {
			this.animationTween.finish();
		}
		await oPromise;
	}

	destroy(): void {
		if (this.destroyed) {
			return;
		}

		this.destroyed = true;
		this.onDestroy();
		this.tween?.destroy();
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
