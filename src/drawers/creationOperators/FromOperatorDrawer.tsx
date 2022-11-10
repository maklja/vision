import { DrawerProps } from '../DrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export const FromOperatorDrawer = (props: DrawerProps) => {
	return <CreationOperatorDrawer {...props} title="From" />;
};
