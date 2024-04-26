import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { JoinCreationOperatorDrawer } from './JoinCreationOperatorDrawer';

export const ConcatOperatorDrawer = (props: ElementDrawerProps) => {
	return (
		<JoinCreationOperatorDrawer {...props} elementType={ElementType.Concat} title={'Concat'} />
	);
};

