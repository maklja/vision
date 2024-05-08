import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { TransformationOperatorDrawer } from './TransformationOperatorDrawer';

export function BufferTimeOperatorDrawer(props: ElementDrawerProps) {
	return (
		<TransformationOperatorDrawer
			{...props}
			title={'Buffer\nTime'}
			elementType={ElementType.BufferTime}
		/>
	);
}

