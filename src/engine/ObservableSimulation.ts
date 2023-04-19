import { Observable, Observer, ReplaySubject, Unsubscribable } from 'rxjs';
import { ObservableFactory } from './factory';
import { FlowValueEvent, SimulationModel } from './context';

export class ObservableSimulation {
	private readonly observable: Observable<unknown>;
	private readonly simulationSubject = new ReplaySubject<FlowValueEvent<unknown>>(10_000);
	private readonly observableFactory = new ObservableFactory();
	private subscription: Unsubscribable | null = null;
	private eventGeneratorIndex = 0;

	constructor(simModel: SimulationModel) {
		this.observable = this.observableFactory.createObservable(params, {
			eventObserver: this.simulationSubject,
			nextEventIndex: () => ++this.eventGeneratorIndex,
			lastErrorPosition: null,
		});
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
