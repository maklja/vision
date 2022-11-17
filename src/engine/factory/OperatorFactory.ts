import { Observable, OperatorFunction } from 'rxjs';
import { Element } from '../../model';

interface OperatorFactory {
	isSupported(el: Element): boolean;
}

export interface CreationOperatorFactory<T> extends OperatorFactory {
	create(el: Element): Observable<T>;
}

export interface PipeOperatorFactory<T> extends OperatorFactory {
	create(el: Element): OperatorFunction<T, unknown>;
}

