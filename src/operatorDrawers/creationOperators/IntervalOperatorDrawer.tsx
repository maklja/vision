import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export const IntervalOperatorDrawer = (props: ElementDrawerProps) => {
	return (
		<CreationOperatorDrawer {...props} elementType={ElementType.Interval} title="Interval" />
	);
};

