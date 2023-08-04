import { ElementProps, ElementType } from '../element';
import { mapElementPropsTemplate } from '../transformationOperators';

export const mapTransformationOperatorTemplates = (elType: ElementType): ElementProps => {
	switch (elType) {
		case ElementType.Map:
			return mapElementPropsTemplate;
		default:
			return {};
	}
};

