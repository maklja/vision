// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
} from '@maklja/vision-simulator-model';
import { createConnectLine, createElement, createStoreWrapper, createTestStore } from '../../test-utils';
import { OperatorPropertiesPanel } from './OperatorPropertiesPanel';
import { RelatedElements } from './ElementPropertiesForm';

function renderPanel(
	element = createElement(ElementType.Of, { id: 'of-1', name: 'zeta' }),
	elementNames: string[] = [],
	relatedElements: RelatedElements = [],
	handlers: {
		onPositionChange?: (id: string, position: { x: number; y: number }) => void;
		onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
		onConnectLineChange?: (id: string, changes: { index?: number; name?: string }) => void;
		onNameChange?: (id: string, name: string) => void;
	} = {},
) {
	const store = createTestStore();
	const Wrapper = createStoreWrapper(store);
	render(
		<Wrapper>
			<OperatorPropertiesPanel
				element={element}
				elementNames={elementNames}
				relatedElements={relatedElements}
				{...handlers}
			/>
		</Wrapper>,
	);
	return store;
}

describe('OperatorPropertiesPanel', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders the element explorer and the matching property form', () => {
		renderPanel();

		expect(screen.getByText('Element explorer')).toBeDefined();
		expect(screen.getByText('Element properties')).toBeDefined();
		expect(screen.getAllByText('Arguments factory').length).toBeGreaterThan(0);
	});

	it('forwards name and position edits to the callbacks', () => {
		const onNameChange = vi.fn();
		const onPositionChange = vi.fn();
		renderPanel(undefined, [], [], { onNameChange, onPositionChange });

		fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'renamed' } });
		fireEvent.change(screen.getByLabelText('X'), { target: { value: '11' } });

		expect(onNameChange).toHaveBeenCalledWith('of-1', 'renamed');
		expect(onPositionChange).toHaveBeenCalledWith('of-1', { x: 11, y: 0 });
	});

	it('forwards code, number and connect line edits to the callbacks', () => {
		const onPropertyValueChange = vi.fn();
		const onConnectLineChange = vi.fn();
		renderPanel(
			createElement(ElementType.Merge, {
				id: 'merge-1',
				properties: { limitConcurrent: 1 },
			}),
			[],
			[
				{
					connectLine: createConnectLine({
						id: 'cl-event',
						source: {
							id: 'of-1',
							connectPointType: ConnectPointType.Event,
							connectPosition: ConnectPointPosition.Right,
						},
						target: {
							id: 'merge-1',
							connectPointType: ConnectPointType.Input,
							connectPosition: ConnectPointPosition.Left,
						},
						index: 1,
					}),
					element: createElement(ElementType.Of, { id: 'of-1' }),
				},
			],
			{ onPropertyValueChange, onConnectLineChange },
		);

		fireEvent.change(screen.getByLabelText('Limit concurrent'), { target: { value: '3' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('merge-1', 'limitConcurrent', 3);

		fireEvent.change(screen.getByLabelText('Index'), { target: { value: '5' } });
		expect(onConnectLineChange).toHaveBeenCalledWith('cl-event', { index: 5 });
	});
});
