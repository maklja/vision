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
	onAnimationStart?: (animation: Animation) => void;
	onAnimationFinish?: (animation: Animation) => void;
}

export interface Animation {
	get id(): string;
	observable(): Observable<AnimationEvent>;
	play(): Promise<Animation>;
	reverse(): Promise<Animation>;
	reset(): void;
	finish(): void;
	destroy(): void;
}

export abstract class AbstractAnimation implements Animation {
	abstract get id(): string;
	abstract observable(): Observable<AnimationEvent>;
	abstract play(): Promise<Animation>;
	abstract reverse(): Promise<Animation>;
	abstract reset(): void;
	abstract finish(): void;
	abstract destroy(): void;

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
