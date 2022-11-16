export interface ColorTheme {
	backgroundColor: string;
	primaryColor: string;
	secondaryColor: string;
	tertiaryColor: string;
	textColor: string;
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
	backgroundColor: '#EEE',
	primaryColor: '#8BBCCC',
	secondaryColor: '#4C6793',
	tertiaryColor: '#5C2E7E',
	textColor: '#000000',
};

export const retrieveThemeColors = (): ColorTheme => {
	return seaColorTheme;
};

