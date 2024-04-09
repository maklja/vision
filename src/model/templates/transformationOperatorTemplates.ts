import { ElementProps, ElementType } from '../element';
import {
	bufferCountElementPropsTemplate,
	bufferTimeElementPropsTemplate,
	bufferToggleElementPropsTemplate,
	bufferWhenElementPropsTemplate,
	concatMapElementPropsTemplate,
	exhaustMapElementPropsTemplate,
	expandElementPropsTemplate,
	mapElementPropsTemplate,
	mergeMapElementPropsTemplate,
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
			return expandElementPropsTemplate;
		case ElementType.ExhaustMap:
			return exhaustMapElementPropsTemplate;
		case ElementType.Map:
			return mapElementPropsTemplate;
		case ElementType.ConcatMap:
			return concatMapElementPropsTemplate;
		case ElementType.MergeMap:
			return mergeMapElementPropsTemplate;
		default:
			return {};
	}
}

