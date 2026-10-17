import { ElementProps, ElementType } from '../element';
import { filterOperatorDefinition } from '../operators/operatorDefinitions';

export function mapFilteringOperatorPropsTemplates(elType: ElementType): ElementProps {
	switch (elType) {
		case ElementType.Filter:
			return filterOperatorDefinition.defaults;
		default:
			return {};
	}
}
