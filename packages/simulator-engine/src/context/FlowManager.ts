import { v1 } from 'uuid';
import { Observable } from 'rxjs';
import createHash from 'object-hash';
import { ConnectLine, FlowValueType } from '@maklja/vision-simulator-model';

export class FlowValue<T = unknown> {
	public readonly hash: string;

	constructor(
		public readonly raw: T,
		public readonly elementId: string,
		public readonly branchId: string,
		public readonly type: FlowValueType,
		public readonly id: string = v1(),
	) {
		this.hash = createHash({ id }, { algorithm: 'md5' });
	}

	static createFlowValue(elementId: string, branchId: string) {
		return new FlowValue(null, elementId, branchId, FlowValueType.Next);
	}
}

export interface FlowValueEvent {
	readonly id: string;
	readonly branchId: string;
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

