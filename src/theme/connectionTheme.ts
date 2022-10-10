import Konva from 'konva';

export const connectionTheme: Konva.CircleConfig = {
	stroke: 'blue',
	strokeWidth: 1,
};

export const highlightConnectionTheme: Konva.CircleConfig = {
	...connectionTheme,
	fill: 'blue',
};

