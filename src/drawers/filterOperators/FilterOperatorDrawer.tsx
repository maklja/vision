import { DrawerProps } from '../DrawerProps';
import { PipeOperatorDrawer } from '../pipeOperator';

export const FilterOperatorDrawer = (props: DrawerProps) => {
	return <PipeOperatorDrawer {...props} title="Filter" />;
};

