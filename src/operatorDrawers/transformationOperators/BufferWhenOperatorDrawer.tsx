import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { TransformationOperatorDrawer } from './TransformationOperatorDrawer';

export const BufferWhenOperatorDrawer = (props: ElementDrawerProps) => {
	return (
		<TransformationOperatorDrawer
			{...props}
			title={'Buffer\nWhen'}
			elementType={ElementType.BufferWhen}
		/>
	);
};

