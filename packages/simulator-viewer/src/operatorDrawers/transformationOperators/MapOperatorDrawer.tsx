import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { TransformationOperatorDrawer } from './TransformationOperatorDrawer';

export const MapOperatorDrawer = (props: ElementDrawerProps) => {
	return <TransformationOperatorDrawer {...props} title={'Map'} elementType={ElementType.Map} />;
};
