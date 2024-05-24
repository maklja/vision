import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export function IntervalOperatorDrawer(props: ElementDrawerProps) {
	return (
		<CreationOperatorDrawer {...props} elementType={ElementType.Interval} title="Interval" />
	);
}

