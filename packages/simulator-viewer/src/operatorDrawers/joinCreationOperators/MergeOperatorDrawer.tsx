import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { JoinCreationOperatorDrawer } from './JoinCreationOperatorDrawer';

export function MergeOperatorDrawer(props: ElementDrawerProps) {
	return <JoinCreationOperatorDrawer {...props} elementType={ElementType.Merge} title="Merge" />;
}

