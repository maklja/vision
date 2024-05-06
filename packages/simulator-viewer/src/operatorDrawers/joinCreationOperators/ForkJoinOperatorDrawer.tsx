import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { JoinCreationOperatorDrawer } from './JoinCreationOperatorDrawer';

export const ForkJoinOperatorDrawer = (props: ElementDrawerProps) => {
	return (
		<JoinCreationOperatorDrawer
			{...props}
			elementType={ElementType.ForkJoin}
			title={'ForkJoin'}
		/>
	);
};
