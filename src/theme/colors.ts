export interface ColorTheme {
	backgroundPrimaryColor: string;
	backgroundSecondaryColor: string;
	primaryColor: string;
	secondaryColor: string;
	tertiaryColor: string;
	textPrimaryColor: string;
	textSecondaryColor: string;
	textTertiaryColor: string;
	errorPrimaryColor: string;
	errorSecondaryColor: string;
	successPrimaryColor: string;
	successSecondaryColor: string;
}

// const mainColorTheme: ColorTheme = {
// 	backgroundColor: '#EEE',
// 	primaryColor: '#EDE4E0',
// 	secondaryColor: '#C8DBBE',
// 	tertiaryColor: '#9F8772',
// 	textColor: '#665A48',
// };

// const winterColorTheme: ColorTheme = {
// 	backgroundColor: '#EEE',
// 	primaryColor: '#F6F6C9',
// 	secondaryColor: '#BAD1C2',
// 	tertiaryColor: '#4FA095',
// 	textColor: '#153462',
// };

const seaColorTheme: ColorTheme = {
	backgroundPrimaryColor: '#EEE',
	backgroundSecondaryColor: '#616161',
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
};

export const retrieveThemeColors = (): ColorTheme => {
	return seaColorTheme;
};

