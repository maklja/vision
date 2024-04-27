import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { TransformationOperatorDrawer } from './TransformationOperatorDrawer';

export const ExpandOperatorDrawer = (props: ElementDrawerProps) => {
	return (
		<TransformationOperatorDrawer {...props} title="Expand" elementType={ElementType.Expand} />
	);
};
