export interface FlowListenerEvent<T> {
	id: string;
	value: T;
	hash: string;
	connectLineId: string;
	sourceElementId: string;
	targetElementId: string;
}

export interface FlowListener<T> {
	onNextFlow?: (event: FlowListenerEvent<T>) => void;
}
