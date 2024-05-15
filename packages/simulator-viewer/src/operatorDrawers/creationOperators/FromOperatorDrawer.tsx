import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export function FromOperatorDrawer(props: ElementDrawerProps) {
	return <CreationOperatorDrawer {...props} elementType={ElementType.From} title="From" />;
}

