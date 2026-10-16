import 'fake-indexeddb/auto';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ElementType, migrateLegacyDiagram } from '@maklja/vision-simulator-model';
import { currentReleaseDiagram } from '../../../simulator-model/test/fixtures/currentReleaseDiagram';
import { createRootStore } from '../store/rootStore';
import { DiagramFiles } from './DiagramFiles';
import { DiagramRepository } from './diagramPersistence';
import { DiagramExecutionGate, useDiagramExecutionAllowed } from './DiagramExecutionGate';

const doc = () => migrateLegacyDiagram(currentReleaseDiagram, 'id', '2026-10-15T19:00:00Z');
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

function Permission() {
	return (
		<output aria-label="execution permission">{String(useDiagramExecutionAllowed())}</output>
	);
}

describe('imported execution permission', () => {
	it('requires approval each mount, revokes it after source edits, and ignores viewport/results changes', () => {
		const store = createRootStore(currentReleaseDiagram);
		const view = render(
			<DiagramExecutionGate store={store} imported>
				<Permission />
			</DiagramExecutionGate>,
		);
		expect(screen.getByLabelText('execution permission').textContent).toBe('false');
		fireEvent.click(screen.getByRole('button', { name: 'Allow execution for this revision' }));
		expect(screen.getByLabelText('execution permission').textContent).toBe('true');
		act(() => store.getState().updateCanvasState({ x: 99 }));
		expect(screen.getByLabelText('execution permission').textContent).toBe('true');
		act(() =>
			store.getState().addElement({
				...currentReleaseDiagram.elements[0],
				id: 'transient',
				type: ElementType.Result,
				properties: {},
			}),
		);
		expect(screen.getByLabelText('execution permission').textContent).toBe('true');
		act(() =>
			store.getState().updateElementProperty({
				id: 'source',
				propertyName: 'argsFactoryExpression',
				propertyValue: '() => [99]',
			}),
		);
		expect(screen.getByLabelText('execution permission').textContent).toBe('false');
		fireEvent.click(screen.getByRole('button', { name: 'Allow execution for this revision' }));
		view.unmount();
		render(
			<DiagramExecutionGate store={store} imported>
				<Permission />
			</DiagramExecutionGate>,
		);
		expect(screen.getByLabelText('execution permission').textContent).toBe('false');
	});

	it('keeps current local authored diagrams usable without adding import permission flags', () => {
		render(
			<DiagramExecutionGate store={createRootStore()} imported={false}>
				<Permission />
			</DiagramExecutionGate>,
		);
		expect(screen.getByLabelText('execution permission').textContent).toBe('true');
	});
});

describe('diagram file controls', () => {
	const repository = new DiagramRepository();
	function controls(onReplace = vi.fn().mockResolvedValue(undefined)) {
		const store = createRootStore(currentReleaseDiagram);
		render(
			<DiagramFiles
				store={store}
				repository={repository}
				blocked={false}
				message="Saved"
				onReplace={onReplace}
				onRetry={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText('Diagram files'));
		return { onReplace, store };
	}
	function choose(source: string) {
		const file = new File([source], 'graph.json', { type: 'application/json' });
		Object.defineProperty(file, 'text', { value: () => Promise.resolve(source) });
		fireEvent.change(screen.getByLabelText('Import diagram JSON'), {
			target: { files: [file] },
		});
	}

	it('validates an import before replacement, and reports malformed files without changing the editor', async () => {
		const { onReplace, store } = controls();
		choose('{');
		await screen.findByText('file: invalid JSON');
		expect(onReplace).not.toHaveBeenCalled();
		expect(Object.values(store.getState().elements)).toHaveLength(3);
	});

	it('imports callback text inertly and reports backup/write failures without a permission grant', async () => {
		const replace = vi.fn().mockRejectedValue(new Error('backup failed'));
		controls(replace);
		const source = doc();
		source.diagram.elements[0].properties.argsFactoryExpression =
			'(() => { throw new Error("executed"); })()';
		choose(JSON.stringify(source));
		await screen.findByText('backup failed');
		expect(replace).toHaveBeenCalledWith(source);
	});

	it('exports source-only JSON without requiring a successful database write', async () => {
		let exported: Blob | undefined;
		vi.stubGlobal('URL', {
			...URL,
			createObjectURL: vi.fn((blob: Blob) => {
				exported = blob;
				return 'blob:diagram';
			}),
			revokeObjectURL: vi.fn(),
		});
		vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
		controls();
		fireEvent.click(screen.getByRole('button', { name: 'Export diagram JSON' }));
		await screen.findByText('Diagram exported.');
		expect(exported?.type).toBe('application/json');
		vi.unstubAllGlobals();
	});

	it('offers diagram JSON export without recovery download or restore controls', () => {
		controls();
		expect(
			screen.getByRole('button', { name: 'Export diagram JSON' }).hasAttribute('disabled'),
		).toBe(false);
		expect(screen.queryByRole('button', { name: 'Download original data' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Download backup' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Restore previous backup' })).toBeNull();
	});
});
