import {
	bufferOperatorDefinition,
	bufferCountOperatorDefinition,
	bufferTimeOperatorDefinition,
	bufferToggleOperatorDefinition,
	bufferWhenOperatorDefinition,
	concatMapOperatorDefinition,
	exhaustMapOperatorDefinition,
	expandOperatorDefinition,
	mergeMapOperatorDefinition,
	mapOperatorDefinition,
} from '../operators/operatorDefinitions';
import { ElementProps, ElementType } from '../element';

export function mapTransformationOperatorTemplates(elType: ElementType): ElementProps {
	switch (elType) {
		case ElementType.Buffer:
			return bufferOperatorDefinition.defaults;
		case ElementType.BufferCount:
			return bufferCountOperatorDefinition.defaults;
		case ElementType.BufferTime:
			return bufferTimeOperatorDefinition.defaults;
		case ElementType.BufferToggle:
			return bufferToggleOperatorDefinition.defaults;
		case ElementType.BufferWhen:
			return bufferWhenOperatorDefinition.defaults;
		case ElementType.Expand:
			return expandOperatorDefinition.defaults;
		case ElementType.ExhaustMap:
			return exhaustMapOperatorDefinition.defaults;
		case ElementType.Map:
			return mapOperatorDefinition.defaults;
		case ElementType.ConcatMap:
			return concatMapOperatorDefinition.defaults;
		case ElementType.MergeMap:
			return mergeMapOperatorDefinition.defaults;
		default:
			return {};
	}
}
