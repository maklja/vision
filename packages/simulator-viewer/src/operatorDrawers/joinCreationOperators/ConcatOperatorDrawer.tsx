import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { JoinCreationOperatorDrawer } from './JoinCreationOperatorDrawer';

export function ConcatOperatorDrawer(props: ElementDrawerProps) {
	return (
		<JoinCreationOperatorDrawer {...props} elementType={ElementType.Concat} title={'Concat'} />
	);
}

