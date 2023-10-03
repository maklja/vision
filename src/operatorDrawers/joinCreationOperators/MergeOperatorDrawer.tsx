import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { JoinCreationOperatorDrawer } from './JoinCreationOperatorDrawer';

export const MergeOperatorDrawer = (props: ElementDrawerProps) => {
	return <JoinCreationOperatorDrawer {...props} elementType={ElementType.Merge} title="Merge" />;
};

