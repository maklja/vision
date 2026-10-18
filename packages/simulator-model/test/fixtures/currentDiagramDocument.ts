import { DiagramDocument, diagramWithTypedParameters, validateDiagramDocument } from '../../src';

/** Build current-schema test data; this is never a loader for persisted older documents. */
export function currentDiagramDocument(
	data: unknown,
	id = 'fixture',
	now = '2026-10-15T19:00:00Z',
): DiagramDocument {
	return validateDiagramDocument({
		schemaVersion: 2,
		id,
		name: 'Test diagram',
		createdAt: now,
		updatedAt: now,
		origin: 'local',
		diagram: diagramWithTypedParameters(data),
	});
}
