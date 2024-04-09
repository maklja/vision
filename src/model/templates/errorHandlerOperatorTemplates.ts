import { ElementProps, ElementType } from '../element';
import { catchErrorElementPropsTemplate } from '../errorHandlerOperators';

export function mapErrorHandlingOperatorPropsTemplates(elType: ElementType): ElementProps {
	switch (elType) {
		case ElementType.CatchError:
			return catchErrorElementPropsTemplate;
		default:
			return {};
	}
}

