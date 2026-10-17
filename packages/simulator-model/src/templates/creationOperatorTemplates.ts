import {
	ajaxOperatorDefinition,
	emptyOperatorDefinition,
	generateOperatorDefinition,
	throwErrorOperatorDefinition,
	ofOperatorDefinition,
	iifOperatorDefinition,
	deferOperatorDefinition,
	fromOperatorDefinition,
	intervalOperatorDefinition,
	rangeOperatorDefinition,
	timerOperatorDefinition,
} from '../operators/operatorDefinitions';
import { ElementProps, ElementType } from '../element';

export function mapToCreationOperatorPropsTemplates(elType: ElementType): ElementProps {
	switch (elType) {
		case ElementType.Empty:
			return emptyOperatorDefinition.defaults;
		case ElementType.Ajax:
			return ajaxOperatorDefinition.defaults;
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
			return generateOperatorDefinition.defaults;
		case ElementType.Range:
			return rangeOperatorDefinition.defaults;
		case ElementType.ThrowError:
			return throwErrorOperatorDefinition.defaults;
		case ElementType.Timer:
			return timerOperatorDefinition.defaults;
		default:
			return {};
	}
}
