import createHash from 'object-hash';
import { catchError, Observable, OperatorFunction, tap, throwError } from 'rxjs';
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
	elements: Map<string, Element>;
}

export class ObservableFactory {
	private readonly creationOperatorFactory = new DefaultCreationOperatorFactory();
	private readonly pipeOperatorFactory = new DefaultPipeOperatorFactory();

	createObservable(createParams: CreateObservableParams, ctx: SimulationContext<unknown>) {
		const { creationElement, connectLines, pipeElements } = createParams;

		const observable = this.creationOperatorFactory.create(creationElement);
		const errorHandlerConnectLines: ConnectLine[] = [];
		const pipeOperators: OperatorFunction<unknown, unknown>[] = [];
		for (let i = 0; i < connectLines.length; i++) {
			const cl = connectLines[i];
			const pipeElement = pipeElements.at(i) ?? null;

			if (!pipeElement) {
				pipeOperators.push(
					this.createControlOperator([...errorHandlerConnectLines.splice(0), cl], ctx),
					this.createUnhandledErrorOperator(cl, ctx),
				);
				continue;
			}

			const isErrorHandler = isErrorHandlerType(pipeElement.type);
			const pipeOperator = this.pipeOperatorFactory.create(pipeElement);

			if (isErrorHandler) {
				errorHandlerConnectLines.push(cl);
				pipeOperators.push(this.createErrorControlOperator(cl, ctx), pipeOperator);
			} else {
				pipeOperators.push(
					this.createControlOperator([...errorHandlerConnectLines.splice(0), cl], ctx),
					this.createErrorTrackerOperator(cl, ctx),
					pipeOperator,
				);
			}
		}

		return observable.pipe(...(pipeOperators as [])) as Observable<unknown>;
	}

	private createControlOperator(connectLines: ConnectLine[], ctx: SimulationContext<unknown>) {
		const firstConnectLine = connectLines[0];
		const lastConnectLine = connectLines[connectLines.length - 1];
		return tap((value) => {
			ctx.eventObserver.next({
				id: v1(),
				index: ctx.nextEventIndex(),
				hash: createHash({ value }, { algorithm: 'md5' }),
				value,
				connectLinesId: connectLines.map((cl) => cl.id),
				sourceElementId: firstConnectLine.sourceId,
				targetElementId: lastConnectLine.targetId,
			});
		});
	}

	private createErrorTrackerOperator(cl: ConnectLine, ctx: SimulationContext<unknown>) {
		return catchError((error) => {
			ctx.lastErrorPosition ??= {
				connectLineId: cl.id,
				sourceElementId: cl.sourceId,
				targetElementId: cl.targetId,
			};

			throw error;
		});
	}

	private createUnhandledErrorOperator(cl: ConnectLine, ctx: SimulationContext<unknown>) {
		return catchError((error: unknown) => {
			if (ctx.lastErrorPosition) {
				const { sourceElementId, targetElementId, connectLineId } = ctx.lastErrorPosition;
				ctx.eventObserver.error({
					id: v1(),
					index: ctx.nextEventIndex(),
					hash: createHash({ error }, { algorithm: 'md5' }),
					error,
					connectLineId,
					sourceElementId,
					targetElementId,
				});
			} else {
				ctx.eventObserver.error({
					id: v1(),
					index: ctx.nextEventIndex(),
					hash: createHash({ error }, { algorithm: 'md5' }),
					error,
					connectLineId: cl.id,
					sourceElementId: cl.sourceId,
					targetElementId: cl.targetId,
				});
			}

			throw error;
		});
	}

	private createErrorControlOperator(cl: ConnectLine, ctx: SimulationContext<unknown>) {
		return catchError((error: unknown) => {
			ctx.eventObserver.next({
				id: v1(),
				index: ctx.nextEventIndex(),
				hash: createHash({ error }, { algorithm: 'md5' }),
				value: error,
				connectLinesId: [cl.id],
				sourceElementId: cl.sourceId,
				targetElementId: cl.targetId,
			});
			ctx.lastErrorPosition = null;

			return throwError(() => error);
		});
	}
}
