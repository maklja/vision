import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export const RangeOperatorDrawer = (props: ElementDrawerProps) => {
	return <CreationOperatorDrawer {...props} elementType={ElementType.Range} title="Range" />;
};

