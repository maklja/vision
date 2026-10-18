// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { RangeElementProperties } from '@maklja/vision-simulator-model';
import { RangeElementPropertiesForm } from './creationElementForms/RangeElementPropertiesForm';

afterEach(cleanup);
function Harness() {
	const [id, setId] = useState('first');
	const [properties, setProperties] = useState<Record<string, RangeElementProperties>>({
		first: { start: 1, count: 2 },
		second: { start: 10, count: 20 },
	});
	return (
		<>
			<button onClick={() => setId(id === 'first' ? 'second' : 'first')}>
				Switch element
			</button>
			<RangeElementPropertiesForm
				id={id}
				properties={properties[id]}
				onPropertyValueChange={(target, field, value) =>
					setProperties((old) => {
						const next = { ...old[target], [field]: value };
						if (value === undefined) delete next[field];
						return { ...old, [target]: next };
					})
				}
			/>
			<output aria-label="Saved active parameters">{JSON.stringify(properties)}</output>
		</>
	);
}
function mode(value: 'Literal' | 'Expression') {
	fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Count mode' }));
	fireEvent.click(screen.getByRole('option', { name: value }));
}
const saved = () => JSON.parse(screen.getByLabelText('Saved active parameters').textContent!);
it('retains independent literal/expression drafts, saves only the active variant and isolates element edits', async () => {
	render(<Harness />);
	mode('Expression');
	expect(screen.getByLabelText('Count expression').getAttribute('aria-invalid')).toBe('true');
	fireEvent.change(screen.getByLabelText('Count expression'), {
		target: { value: '$context.count' },
	});
	await waitFor(() =>
		expect(screen.getByLabelText('Count expression').getAttribute('aria-invalid')).toBe(
			'false',
		),
	);
	mode('Literal');
	expect((screen.getByLabelText('Count') as HTMLInputElement).value).toBe('2');
	fireEvent.change(screen.getByLabelText('Count'), { target: { value: '4' } });
	mode('Expression');
	expect((screen.getByLabelText('Count expression') as HTMLInputElement).value).toBe(
		'$context.count',
	);
	expect(saved().first.count).toEqual({
		kind: 'expression',
		type: 'number',
		source: '$context.count',
	});
	mode('Literal');
	expect((screen.getByLabelText('Count') as HTMLInputElement).value).toBe('4');
	expect(saved().first.count).toEqual({ kind: 'literal', type: 'number', value: 4 });
	fireEvent.click(screen.getByText('Switch element'));
	expect((screen.getByLabelText('Count') as HTMLInputElement).value).toBe('20');
	fireEvent.change(screen.getByLabelText('Count'), { target: { value: '0' } });
	expect(saved().first.count.value).toBe(4);
	expect(saved().second.count.value).toBe(0);
});
it('preserves optional absence and marks invalid required literals and syntax with field errors', async () => {
	render(<Harness />);
	fireEvent.change(screen.getByLabelText('Count'), { target: { value: '' } });
	expect(saved().first).not.toHaveProperty('count');
	fireEvent.change(screen.getByLabelText('Start'), { target: { value: '' } });
	expect(screen.getByLabelText('Start').getAttribute('aria-invalid')).toBe('true');
	expect(saved().first.start.value).toBe('');
	mode('Expression');
	fireEvent.change(screen.getByLabelText('Count expression'), { target: { value: '1 +' } });
	await waitFor(() => expect(screen.getByText(/valid JavaScript value expression/)).toBeTruthy());
	expect(screen.getByLabelText('Count expression').getAttribute('aria-describedby')).toBeTruthy();
});
