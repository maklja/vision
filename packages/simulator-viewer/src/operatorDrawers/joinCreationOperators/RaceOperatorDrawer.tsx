import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { JoinCreationOperatorDrawer } from './JoinCreationOperatorDrawer';

export const RaceOperatorDrawer = (props: ElementDrawerProps) => {
	return <JoinCreationOperatorDrawer {...props} elementType={ElementType.Race} title="Race" />;
};
