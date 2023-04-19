import { Observer } from 'rxjs';
import { FlowValueEvent } from './context';
import { ConnectLine } from '../model';

export class FlowManager<T> {
	private eventIndex = 0;

	constructor(private readonly eventObserver: Observer<FlowValueEvent<T>>) {}

	handleNextEvent(cl: ConnectLine) {
		// TODO
	}

	handleError(cl: ConnectLine) {
		// TODO
	}

	handleFatalError() {
		// TODO
	}
}
