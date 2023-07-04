import { ConnectLine, Element } from '../../model';
import { GraphBranch } from '../simulationGraph';

export interface SimulationModel {
	entryElementId: string;
	elements: ReadonlyMap<string, Element>;
	connectLines: ReadonlyMap<string, ConnectLine>;
	graphBranches: ReadonlyMap<string, GraphBranch>;
}

