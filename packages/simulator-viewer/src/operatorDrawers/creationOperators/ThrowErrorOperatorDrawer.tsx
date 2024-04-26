import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export const ThrowErrorOperatorDrawer = (props: ElementDrawerProps) => {
	return (
		<CreationOperatorDrawer
			{...props}
			elementType={ElementType.ThrowError}
			title={'Throw\nError'}
		/>
	);
};

