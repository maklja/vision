import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export function DeferOperatorDrawer(props: ElementDrawerProps) {
	return <CreationOperatorDrawer {...props} elementType={ElementType.Defer} title="Defer" />;
}

