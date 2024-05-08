import { v1 } from 'uuid';
import createHash from 'object-hash';
import { ConnectLine, FlowValueType } from '@maklja/vision-simulator-model';
import { Observable } from 'rxjs';

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

export interface FlowValueEvent {
	readonly id: string;
	readonly index: number;
	readonly value: string;
	readonly hash: string;
	readonly type: FlowValueType;
	readonly connectLinesId: readonly string[];
	readonly sourceElementId: string;
	readonly targetElementId: string;
	readonly time: number;
}

export interface FlowManager {
	handleNextEvent(value: FlowValue, cl: ConnectLine): void;

	handleError(error: FlowValue, cl: ConnectLine): void;

	handleFatalError(error: FlowValue, cl: ConnectLine): void;

	handleComplete(): void;

	asObservable(): Observable<FlowValueEvent>;
}

