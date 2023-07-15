import { findElementDrawerFactory } from '../../layers/drawer/createElementDrawer';
import { ElementType } from '../../model';
import { useThemeContext } from '../../store/stageSlice';
import { OperatorButton } from './OperatorButton';

export interface CreationOperatorButtonProps {
	elementType: ElementType;
}

export const CreationOperatorButton = ({ elementType }: CreationOperatorButtonProps) => {
	const theme = useThemeContext(elementType);
	const creationOperatorFactory = findElementDrawerFactory(elementType);
	if (!creationOperatorFactory) {
		return null;
	}

	const creatorOperator = creationOperatorFactory({
		id: elementType,
		x: 5,
		y: 5,
		theme: theme,
		size: 0.7,
	});
	return <OperatorButton>{creatorOperator}</OperatorButton>;
};

