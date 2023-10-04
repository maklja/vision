import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { JoinCreationOperatorDrawer } from './JoinCreationOperatorDrawer';

export const ZipOperatorDrawer = (props: ElementDrawerProps) => {
	return <JoinCreationOperatorDrawer {...props} elementType={ElementType.Zip} title="Zip" />;
};

