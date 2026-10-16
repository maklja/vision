import {
	concatMapOperatorDefinition,
	exhaustMapOperatorDefinition,
	expandOperatorDefinition,
	mergeMapOperatorDefinition,
	mapOperatorDefinition,
} from '../operators/operatorDefinitions';
import { ElementProps, ElementType } from '../element';
import {
	bufferCountElementPropsTemplate,
	bufferTimeElementPropsTemplate,
	bufferToggleElementPropsTemplate,
	bufferWhenElementPropsTemplate,
} from '../transformationOperators';

export function mapTransformationOperatorTemplates(elType: ElementType): ElementProps {
	switch (elType) {
		case ElementType.BufferCount:
			return bufferCountElementPropsTemplate;
		case ElementType.BufferTime:
			return bufferTimeElementPropsTemplate;
		case ElementType.BufferToggle:
			return bufferToggleElementPropsTemplate;
		case ElementType.BufferWhen:
			return bufferWhenElementPropsTemplate;
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
