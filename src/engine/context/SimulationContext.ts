import { Observer } from 'rxjs';

export interface FlowValueEvent<T> {
	id: string;
	index: number;
	value: T;
	hash: string;
	connectLinesId: string[];
	sourceElementId: string;
	targetElementId: string;
}

export interface FlowErrorEvent<E> {
	id: string;
	index: number;
	error: E;
	hash: string;
	connectLinesId: string[];
	sourceElementId: string;
	targetElementId: string;
}

export interface SimulationContext<T> {
	lastErrorPosition: {
		connectLineId: string;
		sourceElementId: string;
		targetElementId: string;
	} | null;
	eventObserver: Observer<FlowValueEvent<T>>;
	nextEventIndex(): number;
}
