import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { TransformationOperatorDrawer } from './TransformationOperatorDrawer';

export function BufferWhenOperatorDrawer(props: ElementDrawerProps) {
	return (
		<TransformationOperatorDrawer
			{...props}
			title={'Buffer\nWhen'}
			elementType={ElementType.BufferWhen}
		/>
	);
}

