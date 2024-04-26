import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export const DeferOperatorDrawer = (props: ElementDrawerProps) => {
	return <CreationOperatorDrawer {...props} elementType={ElementType.Defer} title="Defer" />;
};

