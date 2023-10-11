import { ElementGroup, ElementProps, ElementType, mapElementTypeToGroup } from '../element';
import { mapToCreationOperatorPropsTemplates } from './creationOperatorTemplates';
import { mapFilteringOperatorPropsTemplates } from './filteringOperatorTemplates';
import { mapToJoinCreationOperatorPropsTemplates } from './mapToJoinCreationOperatorPropsTemplates';
import { mapTransformationOperatorTemplates } from './transformationOperatorTemplates';

export const mapToOperatorPropsTemplate = (elType: ElementType): ElementProps => {
	const elementGroup = mapElementTypeToGroup(elType);
	switch (elementGroup) {
		case ElementGroup.JoinCreation:
			return mapToJoinCreationOperatorPropsTemplates(elType);
		case ElementGroup.Creation:
			return mapToCreationOperatorPropsTemplates(elType);
		case ElementGroup.Filtering:
			return mapFilteringOperatorPropsTemplates(elType);
		case ElementGroup.Transformation:
			return mapTransformationOperatorTemplates(elType);
		default:
			return {};
	}
};

