import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { TransformationOperatorDrawer } from './TransformationOperatorDrawer';

export function ConcatMapOperatorDrawer(props: ElementDrawerProps) {
	return (
		<TransformationOperatorDrawer
			{...props}
			title={'Concat\nMap'}
			elementType={ElementType.ConcatMap}
		/>
	);
}

