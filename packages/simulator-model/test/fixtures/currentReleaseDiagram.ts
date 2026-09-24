import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementType,
} from '../../src';

export interface CurrentReleaseDiagramFixture {
	elements: Element[];
	connectLines: ConnectLine[];
	canvasState: {
		x: number;
		y: number;
		scaleX: number;
		scaleY: number;
	};
	themeId: string;
}

export const currentReleaseDiagram: CurrentReleaseDiagramFixture = {
	elements: [
		{
			id: 'source',
			type: ElementType.Of,
			name: 'of_0',
			x: 40,
			y: 80,
			visible: true,
			properties: {
				argsFactoryExpression: 'function argsFactory() { return [1, 2, 3]; }',
			},
		},
		{
			id: 'project',
			type: ElementType.Map,
			name: 'map_0',
			x: 260,
			y: 80,
			visible: true,
			properties: {
				projectExpression: 'function project(value) { return value * 10; }',
			},
		},
		{
			id: 'sink',
			type: ElementType.Subscriber,
			name: 'subscriber_0',
			x: 480,
			y: 80,
			visible: true,
			properties: {},
		},
	],
	connectLines: [
		{
			id: 'source-project',
			source: {
				id: 'source',
				connectPointType: ConnectPointType.Output,
				connectPosition: ConnectPointPosition.Right,
			},
			target: {
				id: 'project',
				connectPointType: ConnectPointType.Input,
				connectPosition: ConnectPointPosition.Left,
			},
			points: [
				{ x: 140, y: 120 },
				{ x: 260, y: 120 },
			],
			locked: true,
			index: 0,
			name: '',
		},
		{
			id: 'project-sink',
			source: {
				id: 'project',
				connectPointType: ConnectPointType.Output,
				connectPosition: ConnectPointPosition.Right,
			},
			target: {
				id: 'sink',
				connectPointType: ConnectPointType.Input,
				connectPosition: ConnectPointPosition.Left,
			},
			points: [
				{ x: 360, y: 120 },
				{ x: 480, y: 120 },
			],
			locked: true,
			index: 0,
			name: '',
		},
	],
	canvasState: {
		x: -120,
		y: 45,
		scaleX: 0.85,
		scaleY: 0.85,
	},
	themeId: 'sea',
};
