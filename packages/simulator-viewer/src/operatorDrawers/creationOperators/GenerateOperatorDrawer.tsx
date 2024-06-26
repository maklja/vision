import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export function GenerateOperatorDrawer(props: ElementDrawerProps) {
	return (
		<CreationOperatorDrawer {...props} elementType={ElementType.Generate} title="Generate" />
	);
}

