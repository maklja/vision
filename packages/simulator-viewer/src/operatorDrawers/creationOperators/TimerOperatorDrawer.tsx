import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export function TimerOperatorDrawer(props: ElementDrawerProps) {
	return <CreationOperatorDrawer {...props} elementType={ElementType.Timer} title="Timer" />;
}

