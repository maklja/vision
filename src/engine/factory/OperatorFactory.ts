import { Observable } from 'rxjs';
import { FlowValue } from '../context';
import { ConnectLine, ConnectedElement, Element } from '../../model';

export interface ObservableOptions {
	readonly observable: Observable<FlowValue>;
	readonly invokeTrigger?: (value: FlowValue) => void;
	readonly connectPoint: ConnectedElement;
	readonly connectLine: ConnectLine;
}

export interface OperatorOptions {
	readonly referenceObservables: readonly ObservableOptions[];
}

export interface OperatorFactoryParams {
	element: Element;
	context: Record<string, unknown>;
	options: OperatorOptions;
}

export interface PipeOperatorFactoryParams extends OperatorFactoryParams {
	observable: Observable<FlowValue>;
}

interface OperatorFactory {
	isSupported(el: Element): boolean;
}

export interface JoinCreationOperatorFactory extends OperatorFactory {
	create(params: OperatorFactoryParams): Observable<FlowValue>;
}

export interface CreationOperatorFactory extends OperatorFactory {
	create(params: OperatorFactoryParams): Observable<FlowValue>;
}

export interface PipeOperatorFactory extends OperatorFactory {
	create(params: PipeOperatorFactoryParams): Observable<FlowValue>;
}

export type CreationOperatorFunctionFactory = (
	params: OperatorFactoryParams,
) => Observable<FlowValue>;

export type PipeOperatorFunctionFactory = (
	params: PipeOperatorFactoryParams,
) => Observable<FlowValue>;

export const CONTEXT_VARIABLE_NAME = '$context';

