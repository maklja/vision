import { Element, ElementType, ResultElement } from '@maklja/vision-simulator-model';
import { ResultDrawer } from './resultOperators';
import { useElementDrawerHandlers } from './state';
import { animationRegistry } from '../animation';
import { isSelectedElement } from '../store/elements';
import { selectElementErrorById } from '../store/errors';
import { isHighlighted } from '../store/stage';
import { useRootStore } from '../store/rootStore';
import { selectDrawerAnimationByDrawerId } from '../store/drawerAnimations';
import { selectElementSizeOptions, useThemeContext } from '../store/hooks';
import { createOperatorDrawer } from './createOperatorDrawer';

export interface OperatorDrawerProps {
	element: Element;
	visibleConnectPoints?: boolean;
	draggable: boolean;
}

export function OperatorDrawer({ element, visibleConnectPoints, draggable }: OperatorDrawerProps) {
	const theme = useThemeContext(element.type);
	const animation = useRootStore(selectDrawerAnimationByDrawerId(element.id));
	const drawerHandlers = useElementDrawerHandlers();
	const select = useRootStore(isSelectedElement(element.id));
	const highlight = useRootStore(isHighlighted(element.id));
	const error = useRootStore(selectElementErrorById(element.id));
	const elementSizeOptions = useRootStore(selectElementSizeOptions);

	const animationConfig = animation
		? {
				...animationRegistry.retrieveAnimationConfig(animation.key)(theme, animation.data),
				id: animation.id,
				groupId: animation.groupId,
				dispose: animation.dispose,
			}
		: null;

	switch (element.type) {
		case ElementType.Result:
			return (
				<ResultDrawer
					{...drawerHandlers}
					id={element.id}
					x={element.x}
					y={element.y}
					scale={elementSizeOptions.scale}
					visible={element.visible}
					properties={element.properties}
					animation={animationConfig}
					theme={theme}
					select={false}
					highlight={false}
					draggable={false}
					hash={(element as ResultElement).properties.hash}
				/>
			);
		default:
			return createOperatorDrawer(element.type, {
				...drawerHandlers,
				id: element.id,
				x: element.x,
				y: element.y,
				scale: elementSizeOptions.scale,
				visible: element.visible,
				properties: element.properties,
				animation: animationConfig,
				theme,
				select,
				highlight,
				draggable,
				visibleConnectPoints,
				hasError: Boolean(error),
			});
	}
}

