import { ElementProps, ElementType } from '../element';
import { catchErrorElementPropsTemplate } from '../errorHandlerOperators';

export const mapErrorHandlingOperatorPropsTemplates = (elType: ElementType): ElementProps => {
	switch (elType) {
		case ElementType.CatchError:
			return catchErrorElementPropsTemplate;
		default:
			return {};
	}
};

