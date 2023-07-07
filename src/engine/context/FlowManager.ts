import { v1 } from 'uuid';
import createHash from 'object-hash';
import { ConnectLine } from '../../model';
import { Observable } from 'rxjs';

export class FlowValue<T = unknown> {
	public readonly hash: string;
	constructor(public readonly value: T, public readonly id: string = v1()) {
		this.hash = createHash({ id }, { algorithm: 'md5' });
	}

	static createEmptyValue() {
		return new FlowValue(null, 'EMPTY');
	}
}

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

export interface FlowManager {
	handleNextEvent(value: FlowValue, cl: ConnectLine): void;

	handleError(error: FlowValue, cl: ConnectLine): void;

	handleFatalError(error: FlowValue, cl: ConnectLine): void;

	handleComplete(): void;

	asObservable(): Observable<FlowValueEvent<unknown>>;
}

