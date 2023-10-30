import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { TransformationOperatorDrawer } from './TransformationOperatorDrawer';

export const BufferOperatorDrawer = (props: ElementDrawerProps) => {
	return (
		<TransformationOperatorDrawer {...props} title="Buffer" elementType={ElementType.Buffer} />
	);
};

