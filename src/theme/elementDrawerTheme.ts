import { ColorTheme } from './colors';

export interface ElementDrawerPartStyle {
	readonly stroke: string;
	readonly fill: string;
	readonly strokeWidth: number;
	readonly cornerRadius: number;
}

export interface ElementDrawerTextStyle {
	readonly stroke: string;
	readonly strokeWidth: number;
	readonly letterSpacing: number;
	readonly fontFamily: string;
}

export interface ElementDrawerStyle {
	readonly primary: ElementDrawerPartStyle;
	readonly secondary: ElementDrawerPartStyle;
}

export interface ElementDrawerTheme {
	readonly element: ElementDrawerStyle;
	readonly text: ElementDrawerTextStyle;
	readonly highlightElement: ElementDrawerStyle;
	readonly highlightText: ElementDrawerTextStyle;
	readonly selectElement: ElementDrawerStyle;
	readonly selectText: ElementDrawerTextStyle;
	readonly errorElement: ElementDrawerStyle;
	readonly errorText: ElementDrawerTextStyle;
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
		stroke: themeColors.textPrimaryColor,
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
			stroke: themeColors.textPrimaryColor,
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
			stroke: themeColors.textPrimaryColor,
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

