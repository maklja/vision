import { ElementProps, ElementType } from '../element';
import { filterElementPropsTemplate } from '../filterOperators';

export function mapFilteringOperatorPropsTemplates(elType: ElementType): ElementProps {
	switch (elType) {
		case ElementType.Filter:
			return filterElementPropsTemplate;
		default:
			return {};
	}
}

