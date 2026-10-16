import { expect, test } from '@playwright/test';
import { ElementType } from '@maklja/vision-simulator-model';
import { bootstrapEditorWithDiagram, selectEntryOperator, startSimulation } from './support/editor';
import { infiniteSourceFixture } from './support/fixtures';
import { PersistedDiagram } from './support/diagram';

const source = {
	...infiniteSourceFixture.elements[0],
	properties: { period: 1_000 },
};
const filter = {
	...source,
	id: 'filter',
	type: ElementType.Filter,
	name: 'filter_0',
	x: 360,
	properties: { predicateExpression: 'function predicate(value) { return value % 2 === 0; }' },
};
const sink = { ...infiniteSourceFixture.elements[1], x: 580 };
const wire = infiniteSourceFixture.connectLines[0];
const diagram: PersistedDiagram = {
	...infiniteSourceFixture,
	elements: [source, filter, sink],
	connectLines: [
		{
			...wire,
			id: 'interval-filter',
			target: { ...wire.target, id: filter.id },
			points: [
				{ x: 200, y: 130 },
				{ x: 215, y: 130 },
				{ x: 345, y: 130 },
				{ x: 360, y: 130 },
			],
		},
		{
			...wire,
			id: 'filter-subscribe',
			source: { ...wire.source, id: filter.id },
			points: [
				{ x: 420, y: 130 },
				{ x: 435, y: 130 },
				{ x: 565, y: 130 },
				{ x: 580, y: 130 },
			],
		},
	],
};

interface TweenOrigin {
	nodeId: number;
	start: number;
	end: number;
}

// Observe Konva's real constructor-time capture, rather than the engine trace or the
// store's intended coordinates: those were correct even while the value jumped back.
test('interval → filter → subscribe starts the outgoing value at the filter output', async ({
	page,
}) => {
	await bootstrapEditorWithDiagram(page, diagram);
	await page.evaluate(() => {
		type Tween = { node: { _id: number; x: () => number } };
		const host = globalThis as typeof globalThis & {
			Konva: {
				Tween: {
					prototype: { _addAttr: (this: Tween, key: string, end: unknown) => void };
				};
			};
			__movementOrigins: TweenOrigin[];
		};
		host.__movementOrigins = [];
		const original = host.Konva.Tween.prototype._addAttr;
		host.Konva.Tween.prototype._addAttr = function (key, end) {
			if (key === 'x' && typeof end === 'number') {
				host.__movementOrigins.push({ nodeId: this.node._id, start: this.node.x(), end });
			}
			return original.call(this, key, end);
		};
	});
	await selectEntryOperator(page, source);
	await startSimulation(page);

	await expect
		.poll(() =>
			page.evaluate(() => {
				const { __movementOrigins: origins } = globalThis as typeof globalThis & {
					__movementOrigins: TweenOrigin[];
				};
				const incoming = origins.find((origin) => origin.end === 345);
				const outgoing = origins.find((origin) => origin.end === 565);
				return incoming && outgoing
					? { incoming, outgoing, sameValue: incoming.nodeId === outgoing.nodeId }
					: null;
			}),
		)
		.toMatchObject({
			incoming: { start: 215, end: 345 },
			outgoing: { start: 435, end: 565 },
			sameValue: true,
		});
	await page.getByRole('button', { name: 'stop simulation', exact: true }).click();
});
