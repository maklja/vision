import { Element } from '../../model';
import { OperatorProps, PipeObservableFactory, PipeOperatorFactory } from './OperatorFactory';
import { transformationOperatorFactory } from './transformationOperatorFactory';
import { filteringOperatorFactory } from './filteringOperatorFactory';
import { errorHandlingOperatorFactory } from './errorHandlingOperatorFactory';

const supportedOperators: readonly PipeOperatorFactory[] = [
	transformationOperatorFactory,
	filteringOperatorFactory,
	errorHandlingOperatorFactory,
];

export const pipeOperatorFactory: PipeOperatorFactory = {
	create(el: Element, props: OperatorProps): PipeObservableFactory {
		const factory = supportedOperators.find((factory) => factory.isSupported(el));
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		return factory.create(el, props);
	},
	isSupported(el: Element): boolean {
		return supportedOperators.some((factory) => factory.isSupported(el));
	},
};

