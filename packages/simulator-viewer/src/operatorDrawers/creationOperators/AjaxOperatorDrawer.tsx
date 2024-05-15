import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export function AjaxOperatorDrawer(props: ElementDrawerProps) {
	return <CreationOperatorDrawer {...props} elementType={ElementType.Ajax} title="Ajax" />;
}

