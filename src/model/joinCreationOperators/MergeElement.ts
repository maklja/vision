import { Element, ElementType } from '../element';

export interface MergeElementProperties extends Record<string, unknown> {
	limitConcurrent: number;
}

export interface MergeElement extends Element<MergeElementProperties> {
	type: ElementType.Merge;
}

export const mergeElementPropsTemplate: MergeElementProperties = {
	limitConcurrent: 0,
};

