import {
	ofOperatorDefinition,
	iifOperatorDefinition,
	deferOperatorDefinition,
	fromOperatorDefinition,
	intervalOperatorDefinition,
	rangeOperatorDefinition,
	timerOperatorDefinition,
} from '../operators/operatorDefinitions';
import {
	ajaxElementPropsTemplate,
	generateElementPropsTemplate,
	throwErrorElementPropsTemplate,
} from '../creationOperators';
import { ElementProps, ElementType } from '../element';

export function mapToCreationOperatorPropsTemplates(elType: ElementType): ElementProps {
	switch (elType) {
		case ElementType.Ajax:
			return ajaxElementPropsTemplate;
		case ElementType.Defer:
			return deferOperatorDefinition.defaults;
		case ElementType.From:
			return fromOperatorDefinition.defaults;
		case ElementType.IIf:
			return iifOperatorDefinition.defaults;
		case ElementType.Interval:
			return intervalOperatorDefinition.defaults;
		case ElementType.Of:
			return ofOperatorDefinition.defaults;
		case ElementType.Generate:
			return generateElementPropsTemplate;
		case ElementType.Range:
			return rangeOperatorDefinition.defaults;
		case ElementType.ThrowError:
			return throwErrorElementPropsTemplate;
		case ElementType.Timer:
			return timerOperatorDefinition.defaults;
		default:
			return {};
	}
}
