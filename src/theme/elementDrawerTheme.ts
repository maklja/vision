import { ColorTheme } from './colors';

export interface ElementDrawerPartStyle {
	stroke: string;
	fill: string;
	strokeWidth: number;
	cornerRadius: number;
}

export interface ElementDrawerTextStyle {
	stroke: string;
	strokeWidth: number;
	letterSpacing: number;
	fontFamily: string;
}

export interface ElementDrawerStyle {
	primary: ElementDrawerPartStyle;
	secondary: ElementDrawerPartStyle;
}

export interface ElementDrawerTheme {
	element: ElementDrawerStyle;
	text: ElementDrawerTextStyle;
	highlightElement: ElementDrawerStyle;
	highlightText: ElementDrawerTextStyle;
	selectElement: ElementDrawerStyle;
	selectText: ElementDrawerTextStyle;
	errorElement: ElementDrawerStyle;
	errorText: ElementDrawerTextStyle;
}

export interface ElementDrawerThemeOverride {
	element?: Partial<ElementDrawerPartStyle>;
	text?: Partial<ElementDrawerTextStyle>;
	highlightElement?: Partial<ElementDrawerPartStyle>;
	highlightText?: Partial<ElementDrawerTextStyle>;
	selectElement?: Partial<ElementDrawerPartStyle>;
	selectText?: Partial<ElementDrawerTextStyle>;
	errorElement?: Partial<ElementDrawerPartStyle>;
	errorText?: Partial<ElementDrawerTextStyle>;
}

export const elementDrawerTheme = (themeColors: ColorTheme): ElementDrawerTheme => {
	const elementDefault = {
		stroke: themeColors.secondaryColor,
		fill: themeColors.primaryColor,
		strokeWidth: 2.5,
		cornerRadius: 10,
	};

	const textDefault = {
		stroke: themeColors.textColor,
		strokeWidth: 1,
		letterSpacing: 1.8,
		fontFamily: 'serif',
	};

	return {
		element: {
			primary: elementDefault,
			secondary: {
				...elementDefault,
				fill: themeColors.secondaryColor,
			},
		},
		text: textDefault,
		highlightElement: {
			primary: {
				...elementDefault,
				fill: themeColors.secondaryColor,
			},
			secondary: {
				...elementDefault,
				fill: themeColors.primaryColor,
			},
		},
		highlightText: {
			...textDefault,
			stroke: themeColors.textColor,
		},
		selectElement: {
			primary: {
				...elementDefault,
				fill: themeColors.secondaryColor,
			},
			secondary: {
				...elementDefault,
				fill: themeColors.primaryColor,
			},
		},
		selectText: {
			...textDefault,
			stroke: themeColors.textColor,
		},
		errorElement: {
			primary: {
				...elementDefault,
				fill: themeColors.errorPrimaryColor,
				stroke: themeColors.errorSecondaryColor,
			},
			secondary: {
				...elementDefault,
				fill: themeColors.errorSecondaryColor,
				stroke: themeColors.errorSecondaryColor,
			},
		},
		errorText: {
			...textDefault,
		},
	};
};
