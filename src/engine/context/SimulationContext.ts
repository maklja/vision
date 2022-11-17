import { Observer } from 'rxjs';

export interface FlowValueEvent<T> {
	id: string;
	value: T;
	hash: string;
	connectLineId: string;
	sourceElementId: string;
	targetElementId: string;
}

export interface FlowErrorEvent<E> {
	id: string;
	error: E;
	hash: string;
	connectLineId: string;
	sourceElementId: string;
	targetElementId: string;
}

export interface SimulationContext<T> {
	eventObserver: Observer<FlowValueEvent<T>>;
}

