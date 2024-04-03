import { Element } from '../../model';
import { OperatorProps, PipeObservableFactory, PipeOperatorFactory } from './OperatorFactory';
import { DefaultTransformationOperatorFactory } from './DefaultTransformationOperatorFactory';
import { filteringOperatorFactory } from './filteringOperatorFactory';
import { DefaultErrorHandlingOperatorFactory } from './DefaultErrorHandlingOperatorFactory';

const supportedOperators: readonly PipeOperatorFactory[] = [
	// new DefaultTransformationOperatorFactory(),
	filteringOperatorFactory,
	// new DefaultErrorHandlingOperatorFactory(),
];

export const pipeOperatorFactory: PipeOperatorFactory = {
	create(el: Element, props?: OperatorProps): PipeObservableFactory {
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
