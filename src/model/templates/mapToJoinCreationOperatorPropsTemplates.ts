import { ElementProps, ElementType } from '../element';
import {
	combineLatestElementPropsTemplate,
	mergeElementPropsTemplate,
} from '../joinCreationOperators';

export const mapToJoinCreationOperatorPropsTemplates = (elType: ElementType): ElementProps => {
	switch (elType) {
		case ElementType.Merge:
			return mergeElementPropsTemplate;
		case ElementType.CombineLatest:
			return combineLatestElementPropsTemplate;
		default:
			return {};
	}
};

