import { ElementProps, ElementType } from '../element';
import {
	concatMapElementPropsTemplate,
	mapElementPropsTemplate,
	mergeMapElementPropsTemplate,
} from '../transformationOperators';

export const mapTransformationOperatorTemplates = (elType: ElementType): ElementProps => {
	switch (elType) {
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
