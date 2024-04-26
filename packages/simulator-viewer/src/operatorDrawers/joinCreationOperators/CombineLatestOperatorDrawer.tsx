import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { JoinCreationOperatorDrawer } from './JoinCreationOperatorDrawer';

export const CombineLatestOperatorDrawer = (props: ElementDrawerProps) => {
	return (
		<JoinCreationOperatorDrawer
			{...props}
			elementType={ElementType.CombineLatest}
			title={'Combine\nLatest'}
		/>
	);
};

