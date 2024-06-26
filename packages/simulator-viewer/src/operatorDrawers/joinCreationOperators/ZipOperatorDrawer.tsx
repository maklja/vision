import { ElementType } from '@maklja/vision-simulator-model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { JoinCreationOperatorDrawer } from './JoinCreationOperatorDrawer';

export function ZipOperatorDrawer(props: ElementDrawerProps) {
	return <JoinCreationOperatorDrawer {...props} elementType={ElementType.Zip} title="Zip" />;
}

