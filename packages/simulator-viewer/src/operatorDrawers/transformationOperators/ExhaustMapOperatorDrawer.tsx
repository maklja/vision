import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { TransformationOperatorDrawer } from './TransformationOperatorDrawer';

export const ExhaustMapOperatorDrawer = (props: ElementDrawerProps) => {
	return (
		<TransformationOperatorDrawer
			{...props}
			title={'Exhaust\nMap'}
			elementType={ElementType.ExhaustMap}
		/>
	);
};
