import createHash from 'object-hash';
import { catchError, Observable, tap } from 'rxjs';
import { v1 } from 'uuid';
import { ConnectLine, Element, isErrorHandlerType } from '../../model';
import { SimulationContext } from '../context';
import { DefaultCreationOperatorFactory } from './DefaultCreationOperatorFactory';
import { DefaultPipeOperatorFactory } from './DefaultPipeOperatorFactory';

export interface CreateObservableParams {
	creationElement: Element;
	subscriberElement: Element;
	pipeElements: Element[];
	connectLines: ConnectLine[];
}

export class ObservableFactory {
	private readonly creationOperatorFactory = new DefaultCreationOperatorFactory();
	private readonly pipeOperatorFactory = new DefaultPipeOperatorFactory();

	createObservable(createParams: CreateObservableParams, ctx: SimulationContext<unknown>) {
		const { creationElement, connectLines, pipeElements } = createParams;
		const hasErrorHandlers = pipeElements.filter((el) => isErrorHandlerType(el.type));

		const observable = this.creationOperatorFactory.create(creationElement);
		const pipe = connectLines.flatMap((cl, i) => {
			const pipeElement = pipeElements.at(i);
			const pipeOperator = pipeElement ? this.pipeOperatorFactory.create(pipeElement) : null;

			return pipeOperator
				? [
						this.createErrorControlOperator(cl, ctx),
						this.createControlOperator(cl, ctx),
						pipeOperator,
				  ]
				: [this.createErrorControlOperator(cl, ctx), this.createControlOperator(cl, ctx)];
		});
		return observable.pipe(...(pipe as [])) as Observable<unknown>;
	}

	private createControlOperator(cl: ConnectLine, ctx: SimulationContext<unknown>) {
		return tap((value) => {
			ctx.eventObserver.next({
				id: v1(),
				hash: createHash({ value }, { algorithm: 'md5' }),
				value,
				connectLineId: cl.id,
				sourceElementId: cl.sourceId,
				targetElementId: cl.targetId,
			});
		});
	}

	private createErrorControlOperator(cl: ConnectLine, ctx: SimulationContext<unknown>) {
		return catchError((error) => {
			ctx.eventObserver.error({
				id: v1(),
				hash: createHash({ error }, { algorithm: 'md5' }),
				error,
				connectLineId: cl.id,
				sourceElementId: cl.sourceId,
				targetElementId: cl.targetId,
			});

			throw error;
		});
	}
}

