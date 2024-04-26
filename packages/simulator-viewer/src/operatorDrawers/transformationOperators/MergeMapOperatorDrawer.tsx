import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { TransformationOperatorDrawer } from './TransformationOperatorDrawer';

export const MergeMapOperatorDrawer = (props: ElementDrawerProps) => {
	return (
		<TransformationOperatorDrawer
			{...props}
			title={'Merge\nMap'}
			elementType={ElementType.MergeMap}
		/>
	);
};

