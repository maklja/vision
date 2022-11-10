export interface BorderStyle {
	stroke?: string;
	strokeWidth?: number;
	dash?: number[];
	cornerRadius?: number;
}

export const selectedBorderTheme: BorderStyle = {
	stroke: 'blue',
	strokeWidth: 1,
	dash: [5, 5],
	cornerRadius: 1,
};

export const highlightBorderTheme: BorderStyle = {
	stroke: 'skyblue',
	strokeWidth: 1,
	dash: [5, 5],
	cornerRadius: 1,
};

