import { mergeOperatorDefinition } from '../operators/operatorDefinitions';
import { ElementProps, ElementType } from '../element';
import {
	combineLatestElementPropsTemplate,
	forkJoinElementPropsTemplate,
} from '../joinCreationOperators';

export function mapToJoinCreationOperatorPropsTemplates(elType: ElementType): ElementProps {
	switch (elType) {
		case ElementType.Merge:
			return mergeOperatorDefinition.defaults;
		case ElementType.CombineLatest:
			return combineLatestElementPropsTemplate;
		case ElementType.ForkJoin:
			return forkJoinElementPropsTemplate;
		default:
			return {};
	}
}
