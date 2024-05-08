import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export function OfOperatorDrawer(props: ElementDrawerProps) {
	return <CreationOperatorDrawer {...props} elementType={ElementType.Of} title="Of" />;
}

