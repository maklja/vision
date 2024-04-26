import { ColorTheme } from './colors';

export interface SnapLineElementStyle {
	readonly stroke: string;
	readonly strokeWidth: number;
	readonly dash: number[];
}

export interface SnapLineTheme {
	readonly line: SnapLineElementStyle;
}

export interface SnapLineThemeOverride {
	line?: Partial<SnapLineElementStyle>;
}

const dash = [8, 3];

export const snapLineDrawerTheme = (themeColors: ColorTheme): SnapLineTheme => {
	const defaultSnapLine: SnapLineElementStyle = {
		stroke: themeColors.secondaryColor,
		strokeWidth: 1,
		dash,
	};

	return {
		line: defaultSnapLine,
	};
};
