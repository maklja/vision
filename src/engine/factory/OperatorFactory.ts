import { Observable, OperatorFunction } from 'rxjs';
import { FlowValue } from '../context';
import { Element } from '../../model';

interface OperatorFactory {
	isSupported(el: Element): boolean;
}

export interface CreationOperatorFactory extends OperatorFactory {
	create(el: Element): Observable<FlowValue>;
}

export interface PipeOperatorFactory extends OperatorFactory {
	create(el: Element): OperatorFunction<FlowValue, FlowValue>;
}

