import { Observable } from 'rxjs';
import { FlowValue } from '../context';
import { ConnectLine, ConnectedElement, Element } from '../../model';

interface OperatorFactory {
	isSupported(el: Element): boolean;
}

export interface JoinCreationOperatorFactory extends OperatorFactory {
	create(el: Element): Observable<FlowValue>;
}

export interface CreationOperatorFactory extends OperatorFactory {
	create(el: Element): Observable<FlowValue>;
}

export interface ObservableOptions {
	readonly observable: Observable<FlowValue>;
	readonly invokeTrigger?: (value: FlowValue) => void;
	readonly connectPoint: ConnectedElement;
	readonly connectLine: ConnectLine;
}

export interface PipeOperatorFactoryParams {
	observable: Observable<FlowValue>;
	element: Element;
	context: Record<string, unknown>;
	options: OperatorOptions;
}

export interface PipeOperatorFactory extends OperatorFactory {
	create(params: PipeOperatorFactoryParams): Observable<FlowValue>;
}

export type PipeOperatorFunctionFactory = (
	params: PipeOperatorFactoryParams,
) => Observable<FlowValue>;

export interface OperatorOptions {
	readonly referenceObservables: readonly ObservableOptions[];
}

