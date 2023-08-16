import {
	ajaxElementPropsTemplate,
	fromElementPropsTemplate,
	iifElementPropsTemplate,
	intervalElementPropsTemplate,
	ofElementPropsTemplate,
} from '../creationOperators';
import { ElementProps, ElementType } from '../element';

export const mapToCreationOperatorPropsTemplates = (elType: ElementType): ElementProps => {
	switch (elType) {
		case ElementType.From:
			return fromElementPropsTemplate;
		case ElementType.IIf:
			return iifElementPropsTemplate;
		case ElementType.Interval:
			return intervalElementPropsTemplate;
		case ElementType.Of:
			return ofElementPropsTemplate;
		case ElementType.Ajax:
			return ajaxElementPropsTemplate;
		default:
			return {};
	}
};
