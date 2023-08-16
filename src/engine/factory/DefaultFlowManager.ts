import { Observable, ReplaySubject } from 'rxjs';
import { ConnectLine, isErrorHandlerType, isSubscriberType } from '../../model';
import { FlowManager, FlowValue, FlowValueEvent, SimulationModel } from '../context';

export class DefaultFlowManager implements FlowManager {
	private eventIndex = 0;
	private readonly eventObserver = new ReplaySubject<FlowValueEvent<unknown>>(10_000);
	private readonly connectLinesPath: Map<string, ConnectLine[]> = new Map();

	constructor(private readonly simulationModel: SimulationModel) {}

	asObservable(): Observable<FlowValueEvent<unknown>> {
		return this.eventObserver.asObservable();
	}

	handleNextEvent(value: FlowValue, cl: ConnectLine): void {
		const { target } = cl;
		const targetEl = this.simulationModel.getElement(target.id);

		const cls = this.retrieveFlowValuePath(value.id);
		cls.push(cl);

		if (isErrorHandlerType(targetEl.type)) {
			return;
		}

		const firstConnectLine = cls[0];
		const lastConnectLine = cls[cls.length - 1];
		this.eventObserver.next({
			id: value.id,
			index: ++this.eventIndex,
			hash: value.hash,
			value,
			connectLinesId: cls.splice(0).map((cl) => cl.id),
			sourceElementId: firstConnectLine.source.id,
			targetElementId: lastConnectLine.target.id,
		});
	}

	handleError(flowValue: FlowValue, cl: ConnectLine): void {
		const { target } = cl;
		const targetEl = this.simulationModel.getElement(target.id);
		const cls = this.retrieveFlowValuePath(flowValue.id);
		cls.push(cl);

		if (!isErrorHandlerType(targetEl.type) && !isSubscriberType(targetEl.type)) {
			return;
		}

		const firstConnectLine = cls[0];
		const lastConnectLine = cls[cls.length - 1];
		this.eventObserver.next({
			id: flowValue.id,
			index: ++this.eventIndex,
			hash: flowValue.hash,
			value: flowValue,
			connectLinesId: cls.splice(0).map((cl) => cl.id),
			sourceElementId: firstConnectLine.source.id,
			targetElementId: lastConnectLine.target.id,
		});
	}

	handleFatalError(flowValue: FlowValue, cl: ConnectLine): void {
		const cls = this.retrieveFlowValuePath(flowValue.id);
		cls.push(cl);

		const firstConnectLine = cls[0];
		const lastConnectLine = cls[cls.length - 1];
		this.eventObserver.error({
			id: flowValue.id,
			index: ++this.eventIndex,
			hash: flowValue.hash,
			value: flowValue,
			connectLinesId: cls.splice(0).map((cl) => cl.id),
			sourceElementId: firstConnectLine.source.id,
			targetElementId: lastConnectLine.target.id,
		});
	}

	handleComplete() {
		this.eventObserver.complete();
	}

	private retrieveFlowValuePath(id: string) {
		let cls = this.connectLinesPath.get(id);
		if (!cls) {
			cls = [];
			this.connectLinesPath.set(id, cls);
		}

		return cls;
	}
}
