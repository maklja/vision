export interface ColorTheme {
	readonly id: string;
	readonly backgroundPrimaryColor: string;
	readonly backgroundSecondaryColor: string;
	readonly backgroundTertiaryColor: string;
	readonly primaryColor: string;
	readonly secondaryColor: string;
	readonly tertiaryColor: string;
	readonly textPrimaryColor: string;
	readonly textSecondaryColor: string;
	readonly textTertiaryColor: string;
	readonly errorPrimaryColor: string;
	readonly errorSecondaryColor: string;
	readonly successPrimaryColor: string;
	readonly successSecondaryColor: string;
	readonly lassoPrimaryColor: string;
	readonly lassoSecondaryColor: string;
	readonly disabledPrimaryColor: string;
	readonly disabledSecondaryColor: string;
}

const seaColorTheme: ColorTheme = {
	id: 'sea',
	backgroundPrimaryColor: '#EEE',
	backgroundSecondaryColor: '#616161',
	backgroundTertiaryColor: 'rgba(0, 0, 0, 0.2)',
	primaryColor: '#8BBCCC',
	secondaryColor: '#4C6793',
	tertiaryColor: '#5C2E7E',
	textPrimaryColor: '#000000',
	textSecondaryColor: '#EEE',
	textTertiaryColor: '#FFFFFF',
	errorPrimaryColor: '#DD5353',
	errorSecondaryColor: '#ECA0A0',
	successPrimaryColor: '#198754',
	successSecondaryColor: '#22bb33',
	lassoPrimaryColor: 'rgba(0, 102, 204, 1)',
	lassoSecondaryColor: 'rgba(0, 102, 204, 0.3)',
	disabledPrimaryColor: '#808080',
	disabledSecondaryColor: '#555555',
};

const beigeColorTheme: ColorTheme = {
	id: 'beige',
	backgroundPrimaryColor: '#000',
	backgroundSecondaryColor: '#616161',
	backgroundTertiaryColor: '#222222',
	primaryColor: '#EDE4E0',
	secondaryColor: '#C8DBBE',
	tertiaryColor: '#9F8772',
	textPrimaryColor: '#665A48',
	textSecondaryColor: '#EEE',
	textTertiaryColor: '#FFFFFF',
	errorPrimaryColor: '#DD5353',
	errorSecondaryColor: '#ECA0A0',
	successPrimaryColor: '#198754',
	successSecondaryColor: '#22bb33',
	lassoPrimaryColor: 'rgba(246, 246, 201, 1)',
	lassoSecondaryColor: 'rgba(246, 246, 201, 0.3)',
	disabledPrimaryColor: '#808080',
	disabledSecondaryColor: '#555555',
};

const winterColorTheme: ColorTheme = {
	id: 'winter',
	backgroundPrimaryColor: '#EEE',
	backgroundSecondaryColor: '#616161',
	backgroundTertiaryColor: 'rgba(0, 0, 0, 0.2)',
	primaryColor: '#F6F6C9',
	secondaryColor: '#BAD1C2',
	tertiaryColor: '#4FA095',
	textPrimaryColor: '#153462',
	textSecondaryColor: '#EEE',
	textTertiaryColor: '#FFFFFF',
	errorPrimaryColor: '#DD5353',
	errorSecondaryColor: '#ECA0A0',
	successPrimaryColor: '#198754',
	successSecondaryColor: '#22bb33',
	lassoPrimaryColor: 'rgba(144, 238, 144, 1)',
	lassoSecondaryColor: 'rgba(144, 238, 144, 0.3)',
	disabledPrimaryColor: '#808080',
	disabledSecondaryColor: '#555555',
};

const defaultColorTheme = seaColorTheme;
export const themeColors: readonly ColorTheme[] = [
	seaColorTheme,
	beigeColorTheme,
	winterColorTheme,
];

export function retrieveThemeColor(id?: string): ColorTheme {
	if (!id) {
		return defaultColorTheme;
	}

	return themeColors.find((color) => color.id === id) ?? defaultColorTheme;
}

