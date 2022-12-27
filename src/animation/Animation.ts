import { Observable } from 'rxjs';

export enum AnimationEventType {
	Reset = 'reset',
	Finish = 'finish',
	Destroy = 'destroy',
}

export interface AnimationEvent {
	id: string;
	animation: Animation;
	type: AnimationEventType;
}

export interface AnimationOptions {
	autoReverse?: boolean;
}

export type AnimationEventCallback = null | ((animation: Animation) => void);

export interface Animation {
	get id(): string;
	onAnimationBegin?: AnimationEventCallback;
	onAnimationComplete?: AnimationEventCallback;
	onAnimationDestroy?: AnimationEventCallback;
	observable(): Observable<AnimationEvent>;
	play(): Promise<void>;
	reverse(): Promise<void>;
	// TODO async for reset and finish?
	reset(): void;
	finish(): void;
	destroy(): void;
}

export abstract class AbstractAnimation implements Animation {
	abstract get id(): string;
	abstract observable(): Observable<AnimationEvent>;
	abstract play(): Promise<void>;
	abstract reverse(): Promise<void>;
	abstract reset(): void;
	abstract finish(): void;
	abstract destroy(): void;
	onAnimationBegin?: AnimationEventCallback;
	onAnimationComplete?: AnimationEventCallback;
	onAnimationDestroy?: AnimationEventCallback;

	protected resetEvent(): AnimationEvent {
		return {
			id: this.id,
			animation: this,
			type: AnimationEventType.Reset,
		};
	}

	protected finishEvent(): AnimationEvent {
		return {
			id: this.id,
			animation: this,
			type: AnimationEventType.Finish,
		};
	}

	protected destroyEvent(): AnimationEvent {
		return {
			id: this.id,
			animation: this,
			type: AnimationEventType.Destroy,
		};
	}
}
