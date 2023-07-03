export enum ConnectPointType {
	Input = 'input',
	Output = 'output',
	Event = 'event',
}

export type ConnectPointTypeVisibility = {
	[key in ConnectPointType]?: boolean;
};

