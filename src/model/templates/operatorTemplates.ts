import { ElementGroup, ElementProps, ElementType, mapElementTypeToGroup } from '../element';
import { mapToCreationOperatorPropsTemplates } from './creationOperatorTemplates';
import { mapFilteringOperatorPropsTemplates } from './filteringOperatorTemplates';

export const mapToOperatorPropsTemplate = (elType: ElementType): ElementProps => {
	const elementGroup = mapElementTypeToGroup(elType);
	switch (elementGroup) {
		case ElementGroup.Creation:
			return mapToCreationOperatorPropsTemplates(elType);
		case ElementGroup.Filtering:
			return mapFilteringOperatorPropsTemplates(elType);
		default:
			return {};
	}
};

