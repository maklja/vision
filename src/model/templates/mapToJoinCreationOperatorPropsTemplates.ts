import { ElementProps, ElementType } from '../element';
import { mergeElementPropsTemplate } from '../joinCreationOperators';

export const mapToJoinCreationOperatorPropsTemplates = (elType: ElementType): ElementProps => {
	switch (elType) {
		case ElementType.Merge:
			return mergeElementPropsTemplate;
		default:
			return {};
	}
};

