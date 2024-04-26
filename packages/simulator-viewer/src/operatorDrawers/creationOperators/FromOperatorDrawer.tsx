import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export const FromOperatorDrawer = (props: ElementDrawerProps) => {
	return <CreationOperatorDrawer {...props} elementType={ElementType.From} title="From" />;
};

