import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { TransformationOperatorDrawer } from './TransformationOperatorDrawer';

export function BufferCountOperatorDrawer(props: ElementDrawerProps) {
	return (
		<TransformationOperatorDrawer
			{...props}
			title={'Buffer\nCount'}
			elementType={ElementType.BufferCount}
		/>
	);
}

