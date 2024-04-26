import { Observable } from 'rxjs';
import { FlowValue } from '../context';
import { ConnectLine, ConnectedElement, Element, ElementProps } from '../../model';

interface OperatorFactory {
	isSupported(el: Element): boolean;
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

export interface JoinCreationOperatorFactory extends OperatorFactory {
	create(el: Element, props: OperatorProps): CreationObservableFactory;
}

export type PipeOperatorFunctionFactory = (
	el: Element,
	props: OperatorProps,
) => PipeObservableFactory;

export interface PipeOperatorFactory extends OperatorFactory {
	create(el: Element, props: OperatorProps): PipeObservableFactory;
}

