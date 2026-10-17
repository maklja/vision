import {
	combineLatestOperatorDefinition,
	concatOperatorDefinition,
	forkJoinOperatorDefinition,
	raceOperatorDefinition,
	zipOperatorDefinition,
	mergeOperatorDefinition,
} from '../operators/operatorDefinitions';
import { ElementProps, ElementType } from '../element';

export function mapToJoinCreationOperatorPropsTemplates(elType: ElementType): ElementProps {
	switch (elType) {
		case ElementType.Concat:
			return concatOperatorDefinition.defaults;
		case ElementType.Race:
			return raceOperatorDefinition.defaults;
		case ElementType.Zip:
			return zipOperatorDefinition.defaults;
		case ElementType.Merge:
			return mergeOperatorDefinition.defaults;
		case ElementType.CombineLatest:
			return combineLatestOperatorDefinition.defaults;
		case ElementType.ForkJoin:
			return forkJoinOperatorDefinition.defaults;
		default:
			return {};
	}
}
