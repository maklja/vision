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

export type ObservablePipeFactory = (o: Observable<FlowValue>) => Observable<FlowValue>;

export interface PipeOperatorFactory extends OperatorFactory {
	create(el: Element, options?: OperatorOptions): ObservablePipeFactory;
}

export type PipeOperatorFunctionFactory = (
	o: Observable<FlowValue>,
	el: Element,
	options: OperatorOptions,
) => Observable<FlowValue>;

export interface ObservableOptions {
	readonly observable: Observable<FlowValue>;
	readonly invokeTrigger?: (value: FlowValue) => void;
	readonly connectPoint: ConnectedElement;
	readonly connectLine: ConnectLine;
}

export interface OperatorOptions {
	readonly referenceObservables: readonly ObservableOptions[];
}

