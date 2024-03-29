import { Observable } from 'rxjs';
import { FlowValue } from '../context';
import { ConnectLine, ConnectedElement, Element, ElementProps } from '../../model';

interface OperatorFactory {
	isSupported(el: Element): boolean;
}

export interface JoinCreationOperatorFactory extends OperatorFactory {
	create(el: Element): Observable<FlowValue>;
}

export interface ObservableOptions {
	readonly observable: Observable<FlowValue>;
	readonly invokeTrigger?: (value: FlowValue) => void;
	readonly connectPoint: ConnectedElement;
	readonly connectLine: ConnectLine;
}

export interface OperatorOptions {
	readonly referenceObservables: readonly ObservableOptions[];
}

export type CreationObservableGenerator = (overrideProps?: ElementProps) => Observable<FlowValue>;

export type PipeObservableGenerator = (observable: Observable<FlowValue>) => Observable<FlowValue>;

export interface ObservableGeneratorProps {
	readonly observableGenerator: CreationObservableGenerator;
	readonly connectPoint: ConnectedElement;
	readonly connectLine: ConnectLine;
	readonly onSubscribe?: (value: FlowValue) => void;
}

export interface OperatorProps {
	readonly refObservableGenerators: readonly ObservableGeneratorProps[];
}

export type CreationObservableFactory = <T extends ElementProps = ElementProps>(
	overrideParameters?: Partial<T>,
) => Observable<FlowValue>;

export type PipeObservableFactory = (o: Observable<FlowValue>) => Observable<FlowValue>;

export interface CreationOperatorFactory extends OperatorFactory {
	create(el: Element, props: OperatorProps): CreationObservableFactory;
}

export type PipeOperatorFunctionFactory = (
	el: Element,
	props?: OperatorProps,
) => PipeObservableFactory;

export interface PipeOperatorFactory extends OperatorFactory {
	create(el: Element, props?: OperatorProps): PipeObservableFactory;
}

