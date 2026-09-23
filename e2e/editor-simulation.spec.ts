import { expect, Page, test } from '@playwright/test';

interface StoredElement {
	id: string;
	type: string;
	name: string;
	x: number;
	y: number;
}

interface StoredDiagram {
	elements: StoredElement[];
	connectLines: unknown[];
}

const elementGeometry: Record<string, { width: number; height: number; margin: number }> = {
	of: { width: 100, height: 100, margin: 26 },
	map: { width: 125, height: 100, margin: 26 },
	filter: { width: 125, height: 100, margin: 26 },
	subscriber: { width: 40, height: 40, margin: 32 },
};

async function readStoredDiagram(page: Page): Promise<StoredDiagram | undefined> {
	return page.evaluate(
		() =>
			new Promise<StoredDiagram | undefined>((resolve, reject) => {
				const openRequest = indexedDB.open('keyval-store');
				openRequest.onerror = () => reject(openRequest.error);
				openRequest.onsuccess = () => {
					const database = openRequest.result;
					const transaction = database.transaction('keyval', 'readonly');
					const getRequest = transaction.objectStore('keyval').get('test');
					getRequest.onerror = () => reject(getRequest.error);
					getRequest.onsuccess = () => resolve(getRequest.result as StoredDiagram);
				};
			}),
	);
}

async function waitForDiagramCounts(page: Page, elements: number, connectLines: number) {
	await expect
		.poll(async () => {
			const diagram = await readStoredDiagram(page);
			return {
				elements: diagram?.elements.length ?? 0,
				connectLines: diagram?.connectLines.length ?? 0,
			};
		})
		.toEqual({ elements, connectLines });
}

async function addOperator(
	page: Page,
	groupName: string,
	operatorType: string,
	position: { x: number; y: number },
) {
	await page.getByRole('button', { name: groupName, exact: true }).click();
	await page
		.getByTestId(`operator-${operatorType}`)
		.dragTo(page.getByTestId('simulator-stage'), { targetPosition: position });
}

async function connectOperators(page: Page, sourceType: string, targetType: string) {
	const diagram = await readStoredDiagram(page);
	const source = diagram?.elements.find((element) => element.type === sourceType);
	const target = diagram?.elements.find((element) => element.type === targetType);
	if (!source || !target) {
		throw new Error(`Cannot connect missing ${sourceType} or ${targetType} operator`);
	}

	const sourceGeometry = elementGeometry[sourceType];
	const targetGeometry = elementGeometry[targetType];
	const sourceCenter = {
		x: source.x + sourceGeometry.width / 2,
		y: source.y + sourceGeometry.height / 2,
	};
	const sourceOutput = {
		x: source.x + sourceGeometry.width + sourceGeometry.margin,
		y: sourceCenter.y,
	};
	const targetInput = {
		x: target.x - targetGeometry.margin,
		y: target.y + targetGeometry.height / 2,
	};

	await page.mouse.click(sourceCenter.x, sourceCenter.y);
	await page.mouse.move(sourceOutput.x, sourceOutput.y);
	await page.mouse.down();
	await page.mouse.move(targetInput.x, targetInput.y, { steps: 10 });
	await page.mouse.up();
}

test('builds and runs an of → map → filter → subscriber pipeline', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByTestId('simulator-stage')).toBeVisible();

	await addOperator(page, 'creation operators', 'of', { x: 390, y: 300 });
	await waitForDiagramCounts(page, 1, 0);
	await addOperator(page, 'transformation operators', 'map', { x: 545, y: 300 });
	await waitForDiagramCounts(page, 2, 0);
	await addOperator(page, 'filtering operators', 'filter', { x: 700, y: 300 });
	await waitForDiagramCounts(page, 3, 0);
	await addOperator(page, 'subscriber', 'subscriber', { x: 855, y: 300 });
	await waitForDiagramCounts(page, 4, 0);

	await connectOperators(page, 'of', 'map');
	await waitForDiagramCounts(page, 4, 1);
	await connectOperators(page, 'map', 'filter');
	await waitForDiagramCounts(page, 4, 2);
	await connectOperators(page, 'filter', 'subscriber');
	await waitForDiagramCounts(page, 4, 3);

	await page.getByLabel('Entry operator').click();
	await page.getByRole('option', { name: 'of - of_0' }).click();
	await page.getByRole('button', { name: 'start simulation' }).click();

	await expect(page.getByLabel('simulation results')).toHaveText('1, 2, 3, 4');
});
