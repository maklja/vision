import { ElementProps, ElementType } from '../element';
import { catchErrorOperatorDefinition } from '../operators/operatorDefinitions';

export function mapErrorHandlingOperatorPropsTemplates(elType: ElementType): ElementProps {
	switch (elType) {
		case ElementType.CatchError:
			return catchErrorOperatorDefinition.defaults;
		default:
			return {};
	}
}
