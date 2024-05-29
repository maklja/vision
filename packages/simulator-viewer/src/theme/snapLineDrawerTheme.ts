import { ColorTheme } from './colors';
import { LineElementStyle } from './lineDrawerTheme';

export interface SnapLineTheme {
	readonly line: LineElementStyle;
}

export interface SnapLineThemeOverride {
	line?: Partial<LineElementStyle>;
}

export const snapLineDrawerTheme = (themeColors: ColorTheme): SnapLineTheme => {
	const defaultSnapLine: LineElementStyle = {
		stroke: themeColors.secondaryColor,
		strokeWidth: 1,
		dash: [8, 3],
	};

	return {
		line: defaultSnapLine,
	};
};

