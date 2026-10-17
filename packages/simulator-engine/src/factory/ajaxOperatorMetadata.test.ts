import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defer, Observable, of, throwError } from 'rxjs';
import {
	ajaxOperatorDefinition,
	Element,
	ElementProps,
	HttpMethod,
} from '@maklja/vision-simulator-model';
import { FlowValue } from '../context';
import { InvalidElementPropertyValueError } from '../errors';
import { creationOperatorFactory } from './creationOperatorFactory';

const { ajaxMock } = vi.hoisted(() => ({ ajaxMock: vi.fn() }));
vi.mock('rxjs/ajax', () => ({ ajax: ajaxMock }));
function factory(properties: ElementProps = ajaxOperatorDefinition.defaults) {
	const element: Element = {
		id: 'source',
		type: ajaxOperatorDefinition.type,
		name: 'ajax',
		x: 0,
		y: 0,
		visible: true,
		properties,
	};
	return creationOperatorFactory.create(element, { refObservableGenerators: [] });
}
beforeEach(() => {
	ajaxMock.mockReset();
	ajaxMock.mockReturnValue(of({ status: 200, response: { answer: 42 } }));
});
describe('Ajax metadata compatibility', () => {
	it('merges overrides, parses JSON and preserves duplicate pair semantics before subscription', () => {
		const source = factory({ url: 'stored', method: HttpMethod.Get, body: 'invalid JSON' });
		expect(ajaxMock).not.toHaveBeenCalled();
		source({
			url: '/local',
			method: HttpMethod.Post,
			body: '{"answer":42}',
			timeout: 120,
			responseType: 'json',
			headers: [
				['X-Test', 'first'],
				['X-Test', 'last'],
			],
			queryParams: [
				['tag', 'a'],
				['other', 'c'],
				['tag', 'b'],
			],
		});
		expect(ajaxMock).toHaveBeenCalledExactlyOnceWith({
			url: '/local',
			method: 'POST',
			body: { answer: 42 },
			timeout: 120,
			responseType: 'json',
			headers: { 'X-Test': 'last' },
			queryParams: { tag: ['a', 'b'], other: 'c' },
		});
	});
	it.each([
		['0', 0],
		['false', false],
		['null', null],
		['', undefined],
		[undefined, undefined],
	])('accepts JSON primitive/absent body %s', (body, expected) => {
		factory()({ body });
		expect(ajaxMock.mock.calls[0][0].body).toBe(expected);
	});
	it('rejects authored JavaScript as invalid JSON before calling Ajax', () => {
		expect(() =>
			factory()({ body: '(() => { throw new Error("never execute"); })()' }),
		).toThrow(InvalidElementPropertyValueError);
		expect(ajaxMock).not.toHaveBeenCalled();
	});
	it('keeps URLs literal and optional request settings absent', () => {
		const url = '(() => { throw new Error("literal"); })()';
		factory()({ url });
		expect(ajaxMock.mock.calls[0][0]).toEqual({
			url,
			method: HttpMethod.Get,
			body: undefined,
			headers: undefined,
			queryParams: {},
			timeout: undefined,
			responseType: undefined,
		});
	});
	it('retains the whole response, fresh FlowValue identities and subscription IDs on lazy subscriptions', () => {
		const response = { status: 200, response: { answer: 42 } };
		const request = vi.fn(() => of(response));
		ajaxMock.mockReturnValue(defer(request));
		const observable = factory()(undefined, 'parent');
		expect(request).not.toHaveBeenCalled();
		const values: FlowValue[] = [];
		observable.subscribe((value) => values.push(value));
		observable.subscribe((value) => values.push(value));
		expect(request).toHaveBeenCalledTimes(2);
		expect(values).toHaveLength(2);
		expect(values[0].id).not.toBe(values[1].id);
		for (const value of values) {
			expect(value.raw).toBe(response);
			expect(value).toMatchObject({
				elementId: 'source',
				subscribeId: 'parent',
				dependencies: [],
			});
		}
	});
	it('propagates request errors and forwards cancellation to the request', () => {
		const error = new Error('request failed');
		ajaxMock.mockReturnValue(throwError(() => error));
		const failed = vi.fn();
		factory()().subscribe({ error: failed });
		expect(failed).toHaveBeenCalledWith(error);
		const cancelled = vi.fn();
		ajaxMock.mockReturnValue(new Observable(() => cancelled));
		const subscription = factory()().subscribe();
		subscription.unsubscribe();
		expect(cancelled).toHaveBeenCalledOnce();
	});
});
