import { Group } from 'react-konva';
import { animationRegistry } from '../../animation';
import { Element } from '../../model';
import { selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useAppSelector } from '../../store/rootState';
import {
	StageState,
	isHighlightedElement,
	isSelectedElement,
	selectStageState,
	useThemeContext,
} from '../../store/stageSlice';
import { findElementDrawer } from './createElementDrawer';
import { ElementConnectPointsDrawer } from './ElementConnectPointsDrawer';
import { useElementDrawerHandlers } from './state';

export interface ElementDrawerProps {
	element: Element;
}

export const ElementDrawer = ({ element }: ElementDrawerProps) => {
	const theme = useThemeContext();
	const animation = useAppSelector(selectDrawerAnimationById(element.id));
	const drawerHandlers = useElementDrawerHandlers();
	const select = useAppSelector(isSelectedElement(element.id));
	const highlight = useAppSelector(isHighlightedElement(element.id));
	const stageState = useAppSelector(selectStageState);
	const drawerFactory = findElementDrawer(element.type);
	const dragging = stageState === StageState.Dragging;

	if (!drawerFactory) {
		return null;
	}

	const drawer = drawerFactory({
		...element,
		...drawerHandlers,
		select,
		highlight,
		theme,
		animation: animation
			? {
					...animationRegistry.retrieveAnimationConfig(animation.key)(theme),
					id: animation.id,
					dispose: animation.dispose,
			  }
			: null,
	});
	return (
		<Group>
			{!select || dragging ? null : <ElementConnectPointsDrawer element={element} />}
			{drawer}
		</Group>
	);
};
