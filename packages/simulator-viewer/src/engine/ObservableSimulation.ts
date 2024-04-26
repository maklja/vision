import { Observer, Unsubscribable } from 'rxjs';
import { ObservableFactory } from './factory';
import { FlowValueEvent, SimulationModel } from './context';
import { DefaultFlowManager } from './factory/DefaultFlowManager';

export class ObservableSimulation {
	private subscription: Unsubscribable | null = null;

	constructor(private readonly simulationModel: SimulationModel) {}

	start(o: Partial<Observer<FlowValueEvent<unknown>>>): Unsubscribable {
		const flowManager = new DefaultFlowManager(this.simulationModel);
		const observableFactory = new ObservableFactory(this.simulationModel, flowManager);
		const observable = observableFactory.createObservable();

		const subscription = observable.subscribe({
			complete: () => flowManager.handleComplete(),
		});

		const simulationSubscription = flowManager.asObservable().subscribe(o);
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

