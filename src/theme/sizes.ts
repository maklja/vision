export interface SizeConfig {
	drawerSizes: {
		width: number;
		height: number;
		radius: number;
	};
	connectPointSizes: {
		radius: number;
	};
	simulationSizes: {
		radius: number;
	};
	fontSizes: {
		primary: number;
	};
}

const defaultSizeConfig: SizeConfig = {
	drawerSizes: {
		radius: 50,
		width: 125,
		height: 95,
	},
	simulationSizes: {
		radius: 14,
	},
	connectPointSizes: {
		radius: 16,
	},
	fontSizes: {
		primary: 15,
	},
};

export const sizesConfig = () => {
	return defaultSizeConfig;
};

