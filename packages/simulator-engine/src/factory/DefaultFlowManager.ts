import type { FlowTrace } from '../trace/FlowTrace';
import { Observable, Subject } from 'rxjs';
import { ConnectLine, isErrorHandlerType, isSubscriberType } from '@maklja/vision-simulator-model';
import { FlowManager, FlowValue, FlowValueEvent, SimulationModel } from '../context';

export class DefaultFlowManager implements FlowManager {
	private eventIndex = 0;
	private readonly eventObserver = new Subject<FlowValueEvent>();
	private readonly connectLinesPath: Map<string, ConnectLine[]> = new Map();

	constructor(
		private readonly simulationModel: SimulationModel,
		private readonly trace?: FlowTrace,
	) {}

	asObservable(): Observable<FlowValueEvent> {
		return this.eventObserver.asObservable();
	}

	handleNextEvent(value: FlowValue, cl: ConnectLine, subscriptionId?: string): void {
		const pathKey = JSON.stringify([subscriptionId ?? value.subscribeId, value.id]);
		const { target } = cl;
		const targetEl = this.simulationModel.getElement(target.id);

		const cls = this.retrieveFlowValuePath(pathKey);
		cls.push(cl);

		if (isErrorHandlerType(targetEl.type)) {
			return;
		}

		const firstConnectLine = cls[0];
		const lastConnectLine = cls[cls.length - 1];
		this.connectLinesPath.delete(pathKey);
		if (subscriptionId)
			this.trace?.notification(
				subscriptionId,
				value,
				cls.map((line) => line.id),
				false,
				firstConnectLine.source.id,
				lastConnectLine.target.id,
			);
		this.eventObserver.next({
			id: value.id,
			subscribeId: value.subscribeId,
			dependencies: value.dependencies,
			index: ++this.eventIndex,
			hash: value.hash,
			value: `${value.raw}`,
			type: value.type,
			connectLinesId: cls.map((cl) => cl.id),
			sourceElementId: firstConnectLine.source.id,
			targetElementId: lastConnectLine.target.id,
		});
	}

	handleError(value: FlowValue, cl: ConnectLine, subscriptionId?: string): void {
		const pathKey = JSON.stringify([subscriptionId ?? value.subscribeId, value.id]);
		const { target } = cl;
		const targetEl = this.simulationModel.getElement(target.id);
		const cls = this.retrieveFlowValuePath(pathKey);
		cls.push(cl);
		if (subscriptionId)
			this.trace?.noteError(
				subscriptionId,
				value,
				cls.map((line) => line.id),
			);

		if (!isErrorHandlerType(targetEl.type) && !isSubscriberType(targetEl.type)) {
			return;
		}

		const firstConnectLine = cls[0];
		const lastConnectLine = cls[cls.length - 1];
		this.connectLinesPath.delete(pathKey);
		this.eventObserver.next({
			id: value.id,
			subscribeId: value.subscribeId,
			dependencies: value.dependencies,
			index: ++this.eventIndex,
			hash: value.hash,
			value: `${value.raw}`.slice(0, 2048),
			type: value.type,
			connectLinesId: cls.map((cl) => cl.id),
			sourceElementId: firstConnectLine.source.id,
			targetElementId: lastConnectLine.target.id,
		});
	}

	handleFatalError(value: FlowValue, cl: ConnectLine, subscriptionId?: string): void {
		const pathKey = JSON.stringify([subscriptionId ?? value.subscribeId, value.id]);
		const cls = this.retrieveFlowValuePath(pathKey);
		cls.push(cl);
		if (subscriptionId)
			this.trace?.noteError(
				subscriptionId,
				value,
				cls.map((line) => line.id),
			);

		const firstConnectLine = cls[0];
		const lastConnectLine = cls[cls.length - 1];
		this.connectLinesPath.delete(pathKey);
		this.eventObserver.error({
			id: value.id,
			subscribeId: value.subscribeId,
			dependencies: value.dependencies,
			index: ++this.eventIndex,
			hash: value.hash,
			value: `${value.raw}`.slice(0, 2048),
			type: value.type,
			connectLinesId: cls.map((cl) => cl.id),
			sourceElementId: firstConnectLine.source.id,
			targetElementId: lastConnectLine.target.id,
		});
	}

	releaseOccurrence(subscriptionId: string) {
		for (const key of this.connectLinesPath.keys()) {
			if (JSON.parse(key)[0] === subscriptionId) this.connectLinesPath.delete(key);
		}
	}

	handleComplete() {
		this.connectLinesPath.clear();
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
