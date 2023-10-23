import { Element } from '../../model';
import { OperatorOptions, PipeOperatorFactory } from './OperatorFactory';
import { DefaultTransformationOperatorFactory } from './DefaultTransformationOperatorFactory';
import { DefaultFilteringOperatorFactory } from './DefaultFilteringOperatorFactory';
import { DefaultErrorHandlingOperatorFactory } from './DefaultErrorHandlingOperatorFactory';

export class DefaultPipeOperatorFactory implements PipeOperatorFactory {
	private readonly supportedOperators: PipeOperatorFactory[] = [
		new DefaultTransformationOperatorFactory(),
		new DefaultFilteringOperatorFactory(),
		new DefaultErrorHandlingOperatorFactory(),
	];

	create(el: Element, options: OperatorOptions = { referenceObservables: [] }) {
		const factory = this.supportedOperators.find((factory) => factory.isSupported(el));
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		return factory.create(el, options);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.some((factory) => factory.isSupported(el));
	}
}

