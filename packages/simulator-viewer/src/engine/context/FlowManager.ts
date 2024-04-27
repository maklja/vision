import { v1 } from 'uuid';
import createHash from 'object-hash';
import { ConnectLine } from '@maklja/vision-simulator-model';
import { Observable } from 'rxjs';

export enum FlowValueType {
	Next = 'next',
	Error = 'error',
	Complete = 'complete',
}

export class FlowValue<T = unknown> {
	public readonly hash: string;

	constructor(
		public readonly raw: T,
		public readonly elementId: string,
		public readonly type: FlowValueType,
		public readonly id: string = v1(),
	) {
		this.hash = createHash({ id }, { algorithm: 'md5' });
	}

	static createEmptyValue(elementId: string) {
		return new FlowValue(null, elementId, FlowValueType.Next, 'EMPTY_FLOW_VALUE');
	}
}

export interface FlowValueEvent<T> {
	id: string;
	index: number;
	value: FlowValue<T>;
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
