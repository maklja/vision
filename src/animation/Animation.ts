import { Observable } from 'rxjs';

export enum AnimationEventType {
	Reset = 'reset',
	Finish = 'finish',
	Complete = 'complete',
	Destroy = 'destroy',
}

export interface AnimationEvent {
	id: string;
	animation: Animation;
	type: AnimationEventType;
}

export interface AnimationOptions {
	autoReverse: boolean;
}

export interface Animation {
	get id(): string;
	observable(): Observable<AnimationEvent>;
	play(): void;
	reverse(): void;
	reset(): void;
	destroy(): void;
}
