import { Observable, Observer, tap } from 'rxjs';
import { v1 as createId } from 'uuid';
import createHash from 'object-hash';
import { ConnectLine, Element } from '../model';
import { mapCreationElementFactory, mapFilterOperatorElementFactory } from './factory';
import { FlowListener, FlowListenerEvent } from './FlowListener';

const createControlOperator = <T>(cl: ConnectLine, listeners: FlowListener<T>) =>
	tap<T>((value) => {
		cl.targetId &&
			listeners.onNextFlow?.({
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
	private readonly listeners: FlowListener<T>[] = [];

	constructor(params: ObservableSimulationParams) {
		const { connectLines, creationElement, pipeElements } = params;

		const observable = mapCreationElementFactory<T>(creationElement);
		const pipeOperators = pipeElements.map((el) => mapFilterOperatorElementFactory<T>(el));
		const controlOperators = connectLines.map((cl) =>
			createControlOperator(cl, {
				onNextFlow: this.onNextFlow.bind(this),
			}),
		);
		const pipe = controlOperators.flatMap((controlOperator, i) => {
			const pipeOperator = pipeOperators.at(i);
			return !pipeOperator ? [controlOperator] : [controlOperator, pipeOperator];
		});
		this.observable = observable.pipe(...(pipe as [])) as Observable<T>;
	}

	start(observer?: Partial<Observer<T>>) {
		this.observable.subscribe(observer);
	}

	addFlowListener(listener: FlowListener<T>) {
		if (this.listeners.includes(listener)) {
			return;
		}

		this.listeners.push(listener);
	}

	removeFlowListener(listener: FlowListener<T>) {
		const listenerIndex = this.listeners.indexOf(listener);

		if (listenerIndex === -1) {
			return;
		}

		this.listeners.splice(listenerIndex, 1);
	}

	private onNextFlow(event: FlowListenerEvent<T>) {
		this.listeners.forEach((l) => l.onNextFlow?.(event));
	}
}
