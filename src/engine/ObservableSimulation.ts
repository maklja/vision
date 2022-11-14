import { Observable, Observer, ReplaySubject, tap } from 'rxjs';
import { v1 as createId } from 'uuid';
import createHash from 'object-hash';
import { ConnectLine, Element } from '../model';
import { mapCreationElementFactory, mapFilterOperatorElementFactory } from './factory';

export interface FlowEvent<T> {
	id: string;
	value: T;
	hash: string;
	connectLineId: string;
	sourceElementId: string;
	targetElementId: string;
}

const createControlOperator = <T>(cl: ConnectLine, observer: Observer<FlowEvent<T>>) =>
	tap<T>((value) => {
		observer.next({
			id: createId(),
			hash: createHash({ value }, { algorithm: 'md5' }),
			value,
			connectLineId: cl.id,
			sourceElementId: cl.sourceId,
			targetElementId: cl.targetId,
		});
	});

export interface ObservableSimulationParams {
	creationElement: Element;
	subscriberElement: Element;
	pipeElements: Element[];
	connectLines: ConnectLine[];
}

export class ObservableSimulation<T> {
	private readonly observable: Observable<T>;
	private readonly simulationSubject = new ReplaySubject<FlowEvent<T>>(10_000);

	constructor(params: ObservableSimulationParams) {
		const { connectLines, creationElement, pipeElements } = params;

		const observable = mapCreationElementFactory<T>(creationElement);
		const pipeOperators = pipeElements.map((el) => mapFilterOperatorElementFactory<T>(el));
		const controlOperators = connectLines.map((cl) =>
			createControlOperator(cl, this.simulationSubject),
		);
		const pipe = controlOperators.flatMap((controlOperator, i) => {
			const pipeOperator = pipeOperators.at(i);
			return !pipeOperator ? [controlOperator] : [controlOperator, pipeOperator];
		});
		this.observable = observable.pipe(...(pipe as [])) as Observable<T>;
	}

	start() {
		this.observable.subscribe({
			error: (e) => this.simulationSubject.error(e),
			complete: () => {
				this.simulationSubject.complete();
			},
		});

		return this.simulationSubject.asObservable();
	}
}

