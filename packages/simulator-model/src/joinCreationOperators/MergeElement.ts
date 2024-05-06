import { Element, ElementProps, ElementType } from '../element';

export interface MergeElementProperties extends ElementProps {
	limitConcurrent: number;
}

export interface MergeElement extends Element<MergeElementProperties> {
	type: ElementType.Merge;
}

export const mergeElementPropsTemplate: MergeElementProperties = {
	limitConcurrent: 0,
};

