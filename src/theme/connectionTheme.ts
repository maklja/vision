export interface ConnectPointStyle {
	stroke?: string;
	strokeWidth?: number;
	fill: string;
}

export const connectPointTheme: ConnectPointStyle = {
	stroke: 'blue',
	strokeWidth: 1,
	fill: '#eee',
};

export const highlightConnectPointTheme: ConnectPointStyle = {
	...connectPointTheme,
	fill: 'blue',
};

