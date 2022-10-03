import Konva from 'konva';
import { State, StateEvent } from './State';

export interface Theme {
	stroke: string;
	strokeWidth: number;
	fill?: string;
	shadowEnabled?: boolean;
	shadowColor?: string;
	shadowOffset?: Konva.Vector2d;
	shadowBlur?: number;
	shadowOpacity?: number;
}

export type EventTheme = {
	[key in StateEvent]: Theme;
};

export interface StateTheme {
	[State.Select]: EventTheme;
}

const defaultTheme: Theme = {
	stroke: 'black',
	fill: 'black',
	strokeWidth: 1,
	shadowEnabled: false,
};

const hoverTheme: Theme = {
	...defaultTheme,
	shadowEnabled: true,
	shadowColor: 'skyblue',
	shadowOffset: { x: 0, y: 1 },
	shadowBlur: 3,
	shadowOpacity: 1,
};

const selectTheme: Theme = {
	...defaultTheme,
	stroke: 'blue',
	fill: 'blue',
};

export const stateTheme: StateTheme = {
	[State.Select]: {
		default: defaultTheme,
		hover: hoverTheme,
	},
};
