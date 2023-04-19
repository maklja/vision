import { ConnectLine, Element } from '../../model';

export interface SimulationModel {
	elements: ReadonlyMap<string, Element>;
	connectLines: ReadonlyMap<string, ConnectLine>;
	creationElement: Element;
	subscriberElement: Element;
	pipeElements: readonly Element[];
}
