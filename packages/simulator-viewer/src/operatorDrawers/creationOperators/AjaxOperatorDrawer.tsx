import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CreationOperatorDrawer } from './CreationOperatorDrawer';

export const AjaxOperatorDrawer = (props: ElementDrawerProps) => {
	return <CreationOperatorDrawer {...props} elementType={ElementType.Ajax} title="Ajax" />;
};

