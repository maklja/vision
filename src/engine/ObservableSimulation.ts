import { Observable, Observer, ReplaySubject, Unsubscribable } from 'rxjs';
import { ObservableFactory } from './factory';
import { FlowValueEvent, SimulationModel } from './context';
import { DefaultFlowManager } from './factory/DefaultFlowManager';

export class ObservableSimulation {
	private readonly observable: Observable<unknown>;
	private readonly simulationSubject = new ReplaySubject<FlowValueEvent<unknown>>(10_000);
	private readonly observableFactory;
	private subscription: Unsubscribable | null = null;

	constructor(simModel: SimulationModel) {
		this.observableFactory = new ObservableFactory(
			new DefaultFlowManager(this.simulationSubject, simModel),
		);
		this.observable = this.observableFactory.createObservable(simModel);
	}

	start(o: Partial<Observer<FlowValueEvent<unknown>>>): Unsubscribable {
		const subscription = this.observable.subscribe({
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

