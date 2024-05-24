import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { JoinCreationOperatorDrawer } from './JoinCreationOperatorDrawer';

export function CombineLatestOperatorDrawer(props: ElementDrawerProps) {
	return (
		<JoinCreationOperatorDrawer
			{...props}
			elementType={ElementType.CombineLatest}
			title={'Combine\nLatest'}
		/>
	);
}

