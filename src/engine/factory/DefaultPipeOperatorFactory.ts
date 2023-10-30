import { Element } from '../../model';
import { PipeOperatorFactory, PipeOperatorFactoryParams } from './OperatorFactory';
import { DefaultTransformationOperatorFactory } from './DefaultTransformationOperatorFactory';
import { DefaultFilteringOperatorFactory } from './DefaultFilteringOperatorFactory';
import { DefaultErrorHandlingOperatorFactory } from './DefaultErrorHandlingOperatorFactory';

export class DefaultPipeOperatorFactory implements PipeOperatorFactory {
	private readonly supportedOperators: PipeOperatorFactory[] = [
		new DefaultTransformationOperatorFactory(),
		new DefaultFilteringOperatorFactory(),
		new DefaultErrorHandlingOperatorFactory(),
	];

	create(params: PipeOperatorFactoryParams) {
		const factory = this.supportedOperators.find((factory) =>
			factory.isSupported(params.element),
		);
		if (!factory) {
			throw new Error(`Unsupported element type ${params.element.type} as pipe operator.`);
		}

		return factory.create(params);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.some((factory) => factory.isSupported(el));
	}
}

