import { ConnectLineCollection, Element } from '../../model';
import { GraphBranch } from '../simulationGraph';

export class SimulationModel {
	constructor(
		public readonly entryElementId: string,
		public readonly elements: ReadonlyMap<string, Element>,
		public readonly connectLineCollection: ConnectLineCollection,
		public readonly graphBranches: ReadonlyMap<string, GraphBranch>,
	) {}

	getElement(elId: string) {
		const el = this.elements.get(elId);
		if (!el) {
			throw new Error(`Element with id ${elId} was not found`);
		}

		return el;
	}

	getConnectLine(clId: string) {
		const cl = this.connectLineCollection.connectLines.get(clId);
		if (!cl) {
			throw new Error(`Connect line with id ${clId} was not found`);
		}

		return cl;
	}

	getGraphBranch(graphBranchId: string) {
		const graphBranch = this.graphBranches.get(graphBranchId);
		if (!graphBranch) {
			throw new Error(`Graph branch with id ${graphBranchId} was not found`);
		}

		return graphBranch;
	}
}
