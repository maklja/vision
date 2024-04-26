import { ConnectLine, Element } from '../../model';

export interface SimulationPlayground {
	elements: ReadonlyMap<string, Element>;
	connectLines: ReadonlyMap<string, ConnectLine[]>;
}
