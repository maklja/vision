import { catchError, Observable, ObservableInput, OperatorFunction, tap } from 'rxjs';
import { ConnectLine, Element, isPipeOperatorType, isSubscriberType } from '../../model';
import { FlowManager, FlowValue, SimulationModel } from '../context';
import { DefaultCreationOperatorFactory } from './DefaultCreationOperatorFactory';
import { DefaultPipeOperatorFactory } from './DefaultPipeOperatorFactory';

export interface CreateObservableParams {
	creationElement: Element;
	subscriberElement: Element;
	pipeElements: Element[];
	connectLines: ConnectLine[];
	elements: Map<string, Element>;
}

export class ObservableFactory {
	private readonly creationOperatorFactory = new DefaultCreationOperatorFactory();
	private readonly pipeOperatorFactory = new DefaultPipeOperatorFactory();

	constructor(private readonly flowManager: FlowManager) {}

	createObservable(simulationModel: SimulationModel) {
		const { creationElement, connectLines, pipeElements, subscriberElement } = simulationModel;

		const connectLinesPipes = Array.from(connectLines.values()).reduce((map, cl) => {
			const cls = map.get(cl.source.id) ?? [];
			return map.set(cl.source.id, [...cls, cl]);
		}, new Map<string, ConnectLine[]>());

		const flowElements = [creationElement, ...pipeElements, subscriberElement];

		const observable = this.creationOperatorFactory.create(creationElement);
		const pipeOperators: OperatorFunction<FlowValue, FlowValue>[] = [];
		for (const curFlowEl of flowElements) {
			const [cl] = connectLinesPipes.get(curFlowEl.id) ?? [];
			if (!cl) {
				continue;
			}

			if (isPipeOperatorType(curFlowEl.type)) {
				pipeOperators.push(this.pipeOperatorFactory.create(curFlowEl));
			}

			if (isSubscriberType(curFlowEl.type)) {
				pipeOperators.push(
					this.createControlOperator(cl),
					this.createUnhandledErrorOperator(cl),
				);
			} else {
				pipeOperators.push(
					this.createControlOperator(cl),
					this.createErrorTrackerOperator(cl),
				);
			}
		}

		return observable.pipe(...(pipeOperators as [])) as Observable<unknown>;
	}

	private createControlOperator(cl: ConnectLine) {
		return tap<FlowValue>((value) => this.flowManager.handleNextEvent(value, cl));
	}

	private createErrorTrackerOperator(cl: ConnectLine): OperatorFunction<FlowValue, FlowValue> {
		return catchError<FlowValue, ObservableInput<FlowValue>>((error: unknown) => {
			const flowValueError = error instanceof FlowValue ? error : new FlowValue(error);
			this.flowManager.handleError(flowValueError, cl);
			throw flowValueError;
		});
	}

	private createUnhandledErrorOperator(cl: ConnectLine) {
		return catchError<FlowValue, ObservableInput<FlowValue>>((error: unknown) => {
			const flowValueError = error instanceof FlowValue ? error : new FlowValue(error);
			this.flowManager.handleFatalError(flowValueError, cl);
			throw flowValueError.value;
		});
	}
}

