import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export const EmptyOperatorDrawer = (props: ElementDrawerProps) => {
	return <CreationOperatorDrawer {...props} elementType={ElementType.Empty} title="Empty" />;
};

