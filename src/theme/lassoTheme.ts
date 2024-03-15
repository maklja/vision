export interface LassoTheme {
	readonly stroke: string;
	readonly fill: string;
	readonly strokeWidth: number;
	readonly cornerRadius: number;
}

export const lassoTheme = (): LassoTheme => {
	return {
		stroke: 'rgba(0, 102, 204, 1)',
		fill: 'rgba(0, 102, 204, 0.3)',
		strokeWidth: 1,
		cornerRadius: 2,
	};
};

