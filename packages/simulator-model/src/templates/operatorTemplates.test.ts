import { describe, expect, it } from 'vitest';
import {
	ajaxElementPropsTemplate,
	deferElementPropsTemplate,
	fromElementPropsTemplate,
	generateElementPropsTemplate,
	iifElementPropsTemplate,
	intervalElementPropsTemplate,
	ofElementPropsTemplate,
	rangeElementPropsTemplate,
	throwErrorElementPropsTemplate,
	timerElementPropsTemplate,
} from '../creationOperators';
import { ElementType } from '../element';
import { catchErrorElementPropsTemplate } from '../errorHandlerOperators';
import { filterElementPropsTemplate } from '../filterOperators';
import {
	combineLatestElementPropsTemplate,
	forkJoinElementPropsTemplate,
	mergeElementPropsTemplate,
} from '../joinCreationOperators';
import {
	bufferCountElementPropsTemplate,
	bufferTimeElementPropsTemplate,
	bufferToggleElementPropsTemplate,
	bufferWhenElementPropsTemplate,
	concatMapElementPropsTemplate,
	exhaustMapElementPropsTemplate,
	expandElementPropsTemplate,
	mapElementPropsTemplate,
	mergeMapElementPropsTemplate,
} from '../transformationOperators';
import { mapToOperatorPropsTemplate } from './operatorTemplates';

const expectedTemplates = new Map<ElementType, Record<string, unknown>>([
	[ElementType.Ajax, ajaxElementPropsTemplate],
	[ElementType.Defer, deferElementPropsTemplate],
	[ElementType.Empty, {}],
	[ElementType.From, fromElementPropsTemplate],
	[ElementType.Generate, generateElementPropsTemplate],
	[ElementType.IIf, iifElementPropsTemplate],
	[ElementType.Interval, intervalElementPropsTemplate],
	[ElementType.Of, ofElementPropsTemplate],
	[ElementType.Range, rangeElementPropsTemplate],
	[ElementType.ThrowError, throwErrorElementPropsTemplate],
	[ElementType.Timer, timerElementPropsTemplate],
	[ElementType.CombineLatest, combineLatestElementPropsTemplate],
	[ElementType.Concat, {}],
	[ElementType.ForkJoin, forkJoinElementPropsTemplate],
	[ElementType.Merge, mergeElementPropsTemplate],
	[ElementType.Race, {}],
	[ElementType.Zip, {}],
	[ElementType.Buffer, {}],
	[ElementType.BufferCount, bufferCountElementPropsTemplate],
	[ElementType.BufferTime, bufferTimeElementPropsTemplate],
	[ElementType.BufferToggle, bufferToggleElementPropsTemplate],
	[ElementType.BufferWhen, bufferWhenElementPropsTemplate],
	[ElementType.ConcatMap, concatMapElementPropsTemplate],
	[ElementType.ExhaustMap, exhaustMapElementPropsTemplate],
	[ElementType.Expand, expandElementPropsTemplate],
	[ElementType.Map, mapElementPropsTemplate],
	[ElementType.MergeMap, mergeMapElementPropsTemplate],
	[ElementType.Filter, filterElementPropsTemplate],
	[ElementType.CatchError, catchErrorElementPropsTemplate],
	[ElementType.Subscriber, {}],
	[ElementType.Result, {}],
	[ElementType.ConnectPoint, {}],
]);

describe('mapToOperatorPropsTemplate', () => {
	it('returns the current default properties for every element type', () => {
		expect(expectedTemplates.size).toBe(Object.values(ElementType).length);

		for (const [type, expectedTemplate] of expectedTemplates) {
			expect(mapToOperatorPropsTemplate(type), type).toEqual(expectedTemplate);
		}
	});

	it('returns the same template object used by the operator definition', () => {
		expect(mapToOperatorPropsTemplate(ElementType.Of)).toBe(ofElementPropsTemplate);
		expect(mapToOperatorPropsTemplate(ElementType.Map)).toBe(mapElementPropsTemplate);
		expect(mapToOperatorPropsTemplate(ElementType.CombineLatest)).toBe(
			combineLatestElementPropsTemplate,
		);
	});

	it('rejects an unknown element type', () => {
		expect(() => mapToOperatorPropsTemplate('unknown' as ElementType)).toThrow(
			'Unknown element group for element type unknown',
		);
	});
});
