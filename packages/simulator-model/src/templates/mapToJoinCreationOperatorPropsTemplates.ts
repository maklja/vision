import { ElementProps, ElementType } from '../element';
import {
	combineLatestElementPropsTemplate,
	forkJoinElementPropsTemplate,
	mergeElementPropsTemplate,
} from '../joinCreationOperators';

export function mapToJoinCreationOperatorPropsTemplates(elType: ElementType): ElementProps {
	switch (elType) {
		case ElementType.Merge:
			return mergeElementPropsTemplate;
		case ElementType.CombineLatest:
			return combineLatestElementPropsTemplate;
		case ElementType.ForkJoin:
			return forkJoinElementPropsTemplate;
		default:
			return {};
	}
}

