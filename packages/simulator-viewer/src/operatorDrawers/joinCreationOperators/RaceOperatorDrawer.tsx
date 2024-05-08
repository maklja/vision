import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { JoinCreationOperatorDrawer } from './JoinCreationOperatorDrawer';

export function RaceOperatorDrawer(props: ElementDrawerProps) {
	return <JoinCreationOperatorDrawer {...props} elementType={ElementType.Race} title="Race" />;
}

