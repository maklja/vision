import { ElementProps, ElementType } from '../element';
import { filterElementPropsTemplate } from '../filterOperators';

export const mapFilteringOperatorPropsTemplates = (elType: ElementType): ElementProps => {
	switch (elType) {
		case ElementType.Filter:
			return filterElementPropsTemplate;
		default:
			return {};
	}
};

