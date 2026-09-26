// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ElementGroup, ElementType, mapElementGroupToTypes } from '@maklja/vision-simulator-model';
import { createTestStore, createStoreWrapper } from '../test-utils';
import { OperatorsPanel } from './OperatorsPanel';

// The palette buttons render Konva previews and are dragged with react-dnd. Canvas pixels are out
// of scope for this characterization suite, so both layers are replaced with light doubles while
// the accessible buttons and the data driving them stay real.
vi.mock('react-dnd', () => ({
	useDrag: () => [{ isDragging: false }, () => undefined, () => undefined],
}));

vi.mock('react-dnd-html5-backend', () => ({
	getEmptyImage: () => ({}),
}));

function renderOperatorsPanel(props: { popperVisible?: boolean; disabled?: boolean } = {}) {
	const store = createTestStore();
	const Wrapper = createStoreWrapper(store);
	render(
		<Wrapper>
			<OperatorsPanel {...props} />
		</Wrapper>,
	);

	function click(ariaLabel: string) {
		fireEvent.click(screen.getByRole('button', { name: ariaLabel }));
	}

	return { store, click };
}

const groupButtons: { group: ElementGroup; ariaLabel: string }[] = [
	{ group: ElementGroup.Creation, ariaLabel: 'creation operators' },
	{ group: ElementGroup.JoinCreation, ariaLabel: 'join creation operators' },
	{ group: ElementGroup.Transformation, ariaLabel: 'transformation operators' },
	{ group: ElementGroup.Filtering, ariaLabel: 'filtering operators' },
	{ group: ElementGroup.Join, ariaLabel: 'join operators' },
	{ group: ElementGroup.Multicasting, ariaLabel: 'multicasting operators' },
	{ group: ElementGroup.ErrorHandling, ariaLabel: 'error handling operators' },
	{ group: ElementGroup.Utility, ariaLabel: 'utility operators' },
	{ group: ElementGroup.Conditional, ariaLabel: 'conditional and boolean operators' },
	{ group: ElementGroup.Mathematical, ariaLabel: 'mathematical and aggregate operators' },
	{ group: ElementGroup.Subscriber, ariaLabel: 'subscriber' },
];

function popperVisibility() {
	const popper = document.getElementById('operators-popper');
	return popper ? getComputedStyle(popper).visibility : null;
}

const populatedGroups: { group: ElementGroup; ariaLabel: string }[] = [
	{ group: ElementGroup.Creation, ariaLabel: 'creation operators' },
	{ group: ElementGroup.JoinCreation, ariaLabel: 'join creation operators' },
	{ group: ElementGroup.Transformation, ariaLabel: 'transformation operators' },
	{ group: ElementGroup.Filtering, ariaLabel: 'filtering operators' },
	{ group: ElementGroup.ErrorHandling, ariaLabel: 'error handling operators' },
	{ group: ElementGroup.Subscriber, ariaLabel: 'subscriber' },
];

describe('OperatorsPanel', () => {
	afterEach(() => {
		cleanup();
	});

	it('shows a button for every operator group', () => {
		renderOperatorsPanel();

		expect(screen.getByLabelText('RxJS operator types')).toBeDefined();
		for (const { ariaLabel } of groupButtons) {
			expect(screen.getByRole('button', { name: ariaLabel })).toBeDefined();
		}
	});

	it('renders the operators of the selected group from the model mappings, sorted by name', () => {
		const { click } = renderOperatorsPanel();

		click('creation operators');

		const expectedTypes = [...mapElementGroupToTypes(ElementGroup.Creation)].sort();
		const renderedTypes = screen
			.getAllByTestId(/^operator-/)
			.map((el) => el.getAttribute('data-testid')?.replace('operator-', '') as ElementType);

		expect(renderedTypes).toEqual(expectedTypes);
		expect(expectedTypes).toEqual([...expectedTypes].sort());
		expect(renderedTypes).toContain(ElementType.Of);
		expect(renderedTypes).not.toContain(ElementType.Map);
	});

	it('renders every populated group from the model mappings, including join creation', () => {
		const { click } = renderOperatorsPanel();

		for (const { group, ariaLabel } of populatedGroups) {
			click(ariaLabel);

			const expectedTypes = [...mapElementGroupToTypes(group)].sort();
			const renderedTypes = screen
				.getAllByTestId(/^operator-/)
				.map((el) => el.getAttribute('data-testid')?.replace('operator-', '') as ElementType);

			expect(renderedTypes).toEqual(expectedTypes);
		}
	});

	it('switches between groups and closes the popper when the open group is clicked again', () => {
		const { click } = renderOperatorsPanel();

		click('creation operators');
		expect(screen.getAllByTestId(/^operator-/)).toHaveLength(
			mapElementGroupToTypes(ElementGroup.Creation).size,
		);

		click('transformation operators');
		const transformedTypes = screen
			.getAllByTestId(/^operator-/)
			.map((el) => el.getAttribute('data-testid')?.replace('operator-', '') as ElementType);
		expect(transformedTypes).toEqual([...mapElementGroupToTypes(ElementGroup.Transformation)].sort());

		click('transformation operators');
		expect(screen.queryAllByTestId(/^operator-/)).toHaveLength(0);
	});

	it('renders groups without model mappings as an empty popper', () => {
		const { click } = renderOperatorsPanel();

		for (const emptyGroup of [
			'join operators',
			'multicasting operators',
			'utility operators',
			'conditional and boolean operators',
			'mathematical and aggregate operators',
		]) {
			click(emptyGroup);
			expect(screen.queryAllByTestId(/^operator-/)).toHaveLength(0);
		}
	});

	it('hides the popper content when the panel is not allowed to show it', () => {
		const { click } = renderOperatorsPanel({ popperVisible: false });

		click('creation operators');

		expect(popperVisibility()).toBe('collapse');
	});

	it('shows the popper content while a group is selected and the panel is allowed to show it', () => {
		const { click } = renderOperatorsPanel();

		click('creation operators');

		expect(popperVisibility()).toBe('visible');
	});

	it('disables every group button when the panel is disabled', () => {
		renderOperatorsPanel({ disabled: true });

		for (const { ariaLabel } of groupButtons) {
			const button = screen.getByRole('button', { name: ariaLabel }) as HTMLButtonElement;
			expect(button.disabled).toBe(true);
		}
	});

	it('highlights the selected group button', () => {
		const { click } = renderOperatorsPanel();

		const creationButton = screen.getByRole('button', { name: 'creation operators' });
		const stackBefore = creationButton.closest('.MuiStack-root') as HTMLElement;
		const borderBefore = getComputedStyle(stackBefore).borderRight;
		click('creation operators');
		const stackAfter = creationButton.closest('.MuiStack-root') as HTMLElement;
		const borderAfter = getComputedStyle(stackAfter).borderRight;

		expect(borderBefore).not.toBe(borderAfter);
		expect(borderAfter).not.toBe('');
	});

	it('renders every model-mapped operator button as a labelled drag handle', () => {
		const { click } = renderOperatorsPanel();

		click('error handling operators');

		const buttons = screen.getAllByTestId(/^operator-/);
		expect(buttons).toHaveLength(1);
		expect(buttons[0].getAttribute('data-testid')).toBe(`operator-${ElementType.CatchError}`);
		expect(within(screen.getByLabelText('RxJS operator types')).getAllByRole('button')).toHaveLength(
			groupButtons.length,
		);
	});
});
