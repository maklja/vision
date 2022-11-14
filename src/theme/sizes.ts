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
		radius: 40,
		width: 80,
		height: 80,
	},
	simulationSizes: {
		radius: 8,
	},
	connectPointSizes: {
		radius: 8,
	},
	fontSizes: {
		primary: 15,
	},
};

export const sizesConfig = () => {
	return defaultSizeConfig;
};
