import { ConnectLine, Element } from '@maklja/vision-simulator-model';

export interface SimulationPlayground {
	elements: ReadonlyMap<string, Element>;
	connectLines: ReadonlyMap<string, ConnectLine[]>;
}
