import { ElementProps } from '../ElementProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export const FromOperatorDrawer = (props: ElementProps) => {
	return <CreationOperatorDrawer {...props} title="From" icon="[ ]" />;
};

