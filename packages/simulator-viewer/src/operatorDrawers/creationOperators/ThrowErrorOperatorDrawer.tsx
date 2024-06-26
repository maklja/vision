import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export function ThrowErrorOperatorDrawer(props: ElementDrawerProps) {
	return (
		<CreationOperatorDrawer
			{...props}
			elementType={ElementType.ThrowError}
			title={'Throw\nError'}
		/>
	);
}

