import { ElementProps, ElementType } from '../element';
import {
	bufferCountElementPropsTemplate,
	concatMapElementPropsTemplate,
	mapElementPropsTemplate,
	mergeMapElementPropsTemplate,
} from '../transformationOperators';

export const mapTransformationOperatorTemplates = (elType: ElementType): ElementProps => {
	switch (elType) {
		case ElementType.BufferCount:
			return bufferCountElementPropsTemplate;
		case ElementType.Map:
			return mapElementPropsTemplate;
		case ElementType.ConcatMap:
			return concatMapElementPropsTemplate;
		case ElementType.MergeMap:
			return mergeMapElementPropsTemplate;
		default:
			return {};
	}
};

