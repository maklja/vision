import { DrawerProps } from '../DrawerProps';
import { JoinCreationOperatorDrawer } from './JoinCreationOperatorDrawer';

export const MergeOperatorDrawer = (props: DrawerProps) => {
	return <JoinCreationOperatorDrawer {...props} title="Merge" />;
};

