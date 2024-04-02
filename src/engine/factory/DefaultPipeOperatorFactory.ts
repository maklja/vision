import { Observable } from 'rxjs';
import { Element } from '../../model';
import { OperatorProps, PipeOperatorFactory } from './OperatorFactory';
import { DefaultTransformationOperatorFactory } from './DefaultTransformationOperatorFactory';
import { filteringOperatorFactory } from './filteringOperatorFactory';
import { DefaultErrorHandlingOperatorFactory } from './DefaultErrorHandlingOperatorFactory';
import { FlowValue } from '../context';

export class DefaultPipeOperatorFactory implements PipeOperatorFactory {
	private readonly supportedOperators: PipeOperatorFactory[] = [
		// new DefaultTransformationOperatorFactory(),
		filteringOperatorFactory,
		// new DefaultErrorHandlingOperatorFactory(),
	];

	create(el: Element, props?: OperatorProps) {
		const factory = this.supportedOperators.find((factory) => factory.isSupported(el));
		if (!factory) {
			throw new Error(`Unsupported element type ${el.type} as pipe operator.`);
		}

		return factory.create(el, props);
	}

	isSupported(el: Element): boolean {
		return this.supportedOperators.some((factory) => factory.isSupported(el));
	}
}

