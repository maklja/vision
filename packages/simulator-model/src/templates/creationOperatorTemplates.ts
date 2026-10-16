import { ofOperatorDefinition } from '../operators/operatorDefinitions';
import {
	ajaxElementPropsTemplate,
	deferElementPropsTemplate,
	fromElementPropsTemplate,
	generateElementPropsTemplate,
	iifElementPropsTemplate,
	intervalElementPropsTemplate,
	rangeElementPropsTemplate,
	throwErrorElementPropsTemplate,
	timerElementPropsTemplate,
} from '../creationOperators';
import { ElementProps, ElementType } from '../element';

export function mapToCreationOperatorPropsTemplates(elType: ElementType): ElementProps {
	switch (elType) {
		case ElementType.Ajax:
			return ajaxElementPropsTemplate;
		case ElementType.Defer:
			return deferElementPropsTemplate;
		case ElementType.From:
			return fromElementPropsTemplate;
		case ElementType.IIf:
			return iifElementPropsTemplate;
		case ElementType.Interval:
			return intervalElementPropsTemplate;
		case ElementType.Of:
			return ofOperatorDefinition.defaults;
		case ElementType.Generate:
			return generateElementPropsTemplate;
		case ElementType.Range:
			return rangeElementPropsTemplate;
		case ElementType.ThrowError:
			return throwErrorElementPropsTemplate;
		case ElementType.Timer:
			return timerElementPropsTemplate;
		default:
			return {};
	}
}
