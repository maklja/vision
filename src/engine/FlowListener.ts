export interface FlowListenerEvent<T> {
	value: T;
	connectLineId: string;
	sourceElementId: string;
	targetElementId: string;
}

export interface FlowListener<T> {
	onNextFlow?: (event: FlowListenerEvent<T>) => void;
}

