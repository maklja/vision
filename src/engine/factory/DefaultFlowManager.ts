import { Observer } from 'rxjs';
import { ConnectLine, isErrorHandlerType } from '../../model';
import { FlowManager, FlowValue, FlowValueEvent, SimulationModel } from '../context';

export class DefaultFlowManager implements FlowManager {
	private eventIndex = 0;
	private readonly connectLinesPath: Map<string, ConnectLine[]> = new Map();

	constructor(
		private readonly eventObserver: Observer<FlowValueEvent<unknown>>,
		private readonly simulationModel: SimulationModel,
	) {}

	handleNextEvent(value: FlowValue, cl: ConnectLine): void {
		const { targetId } = cl;
		const targetEl = this.simulationModel.elements.get(targetId);

		const cls = this.retrieveFlowValuePath(value.id);
		cls.push(cl);

		if (targetEl && isErrorHandlerType(targetEl.type)) {
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
			sourceElementId: firstConnectLine.sourceId,
			targetElementId: lastConnectLine.targetId,
		});
	}

	handleError(flowValue: FlowValue, cl: ConnectLine): void {
		const { targetId } = cl;
		const targetEl = this.simulationModel.elements.get(targetId);

		if (!targetEl) {
			return;
		}

		const cls = this.retrieveFlowValuePath(flowValue.id);
		cls.push(cl);

		if (!isErrorHandlerType(targetEl.type)) {
			return;
		}

		const firstConnectLine = cls[0];
		const lastConnectLine = cls[cls.length - 1];
		this.eventObserver.next({
			id: flowValue.id,
			index: ++this.eventIndex,
			hash: flowValue.hash,
			value: flowValue.value,
			connectLinesId: cls.splice(0).map((cl) => cl.id),
			sourceElementId: firstConnectLine.sourceId,
			targetElementId: lastConnectLine.targetId,
		});
	}

	handleFatalError(flowValue: FlowValue, cl: ConnectLine): void {
		const [errorCl] = this.retrieveFlowValuePath(flowValue.id) ?? [cl];
		this.eventObserver.error({
			id: flowValue.id,
			index: ++this.eventIndex,
			hash: flowValue.hash,
			error: flowValue.value,
			connectLineId: errorCl.id,
			sourceElementId: errorCl.sourceId,
			targetElementId: errorCl.targetId,
		});
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

