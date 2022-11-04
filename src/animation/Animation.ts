import { Observable } from 'rxjs';

export enum AnimationEventType {
	Update = 'update',
	Reset = 'reset',
	Finish = 'finish',
	Destroy = 'destroy',
}

export interface AnimationEvent {
	id: number;
	type: AnimationEventType;
}

export interface Animation {
	observable(): Observable<AnimationEvent>;
	play(): void;
	reset(): void;
	destroy(): void;
}

