import {
	catchError,
	Observable,
	ObservableInput,
	Observer,
	ReplaySubject,
	tap,
	Unsubscribable,
} from 'rxjs';
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

const createErrorControlOperator = <T>(cl: ConnectLine, observer: Observer<FlowEvent<T>>) =>
	catchError<T, ObservableInput<unknown>>((error) => {
		console.log(`${cl.sourceId} -> ${cl.targetId}`, error);

		throw error;
		// observer.next({
		// 	id: createId(),
		// 	hash: createHash({ value }, { algorithm: 'md5' }),
		// 	value,
		// 	connectLineId: cl.id,
		// 	sourceElementId: cl.sourceId,
		// 	targetElementId: cl.targetId,
		// });
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
	private subscription: Unsubscribable | null = null;

	constructor(params: ObservableSimulationParams) {
		const { connectLines, creationElement, pipeElements } = params;

		const observable = mapCreationElementFactory<T>(creationElement);
		const pipeOperators = pipeElements.map((el) => mapFilterOperatorElementFactory<T>(el));
		const controlOperators = connectLines.flatMap((cl) => [
			createControlOperator(cl, this.simulationSubject),
			// createErrorControlOperator(cl, this.simulationSubject),
		]);
		const pipe = controlOperators.flatMap((controlOperator, i) => {
			const pipeOperator = pipeOperators.at(i);
			return !pipeOperator ? [controlOperator] : [controlOperator, pipeOperator];
		});
		this.observable = observable.pipe(...(pipe as [])) as Observable<T>;
	}

	start(o: Partial<Observer<FlowEvent<T>>>): Unsubscribable {
		const subscription = this.observable.subscribe({
			next: (val) => console.log(val),
			error: (e) => this.simulationSubject.error(e),
			complete: () => this.simulationSubject.complete(),
		});

		const simulationSubscription = this.simulationSubject.asObservable().subscribe(o);
		this.subscription = {
			unsubscribe: () => {
				subscription.unsubscribe();
				simulationSubscription.unsubscribe();
			},
		};
		return this.subscription;
	}

	stop() {
		this.subscription?.unsubscribe();
		this.subscription = null;
	}
}

