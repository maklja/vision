import { Group } from 'react-konva';
import { ElementType } from '../../model';
import { useCircleShapeSize } from '../../store/stageSlice';
import { ConnectPointsDrawer, createDefaultElementProps } from '../ConnectPointsDrawer';
import { CheckCircleIconDrawer, CircleOperatorDrawer, CloseCircleIconDrawer } from '../../drawers';
import { ElementDrawerProps } from '../ElementDrawerProps';

export const IifOperatorDrawer = ({
	x,
	y,
	id,
	theme,
	animation,
	draggable,
	highlight,
	select,
	visible,
	visibleConnectPoints,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
	onDragEnd,
	onDragMove,
	onDragStart,
	onMouseDown,
	onMouseOut,
	onMouseOver,
}: ElementDrawerProps) => {
	const circleShapeSize = useCircleShapeSize(ElementType.IIf);
	const circleCPSize = useCircleShapeSize(ElementType.ConnectPoint);
	const connectPointsOptions = createDefaultElementProps(ElementType.IIf, circleCPSize);

	return (
		<Group>
			<ConnectPointsDrawer
				id={id}
				x={x}
				y={y}
				type={ElementType.From}
				shape={circleShapeSize}
				offset={50}
				visible={visibleConnectPoints}
				connectPointsOptions={{
					...connectPointsOptions,
					top: {
						...connectPointsOptions.top,
						icon: ({ connectPointPosition, theme, highlight }) => (
							<CheckCircleIconDrawer
								connectPointPosition={connectPointPosition}
								theme={theme}
								highlight={highlight}
								size={circleCPSize}
							/>
						),
					},
					bottom: {
						...connectPointsOptions.bottom,
						icon: ({ connectPointPosition, theme, highlight }) => (
							<CloseCircleIconDrawer
								connectPointPosition={connectPointPosition}
								theme={theme}
								highlight={highlight}
								size={circleCPSize}
							/>
						),
					},
				}}
			/>
			<CircleOperatorDrawer
				id={id}
				title="Iif"
				size={circleShapeSize}
				theme={theme}
				x={x}
				y={y}
				animation={animation}
				draggable={draggable}
				highlight={highlight}
				select={select}
				visible={visible}
				onAnimationBegin={onAnimationBegin}
				onAnimationComplete={onAnimationComplete}
				onAnimationDestroy={onAnimationDestroy}
				onDragStart={onDragStart}
				onDragMove={onDragMove}
				onDragEnd={onDragEnd}
				onMouseDown={onMouseDown}
				onMouseOver={onMouseOver}
				onMouseOut={onMouseOut}
			/>
		</Group>
	);
};
