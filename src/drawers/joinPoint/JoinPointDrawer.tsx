import { useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Text } from 'react-konva';
import { DrawerProps } from '../DrawerProps';
import { useConnectPointTheme, useElementDrawerTheme, useSizes } from '../../theme';

export const JoinPointDrawer = ({ highlight, select, visible, theme, size }: DrawerProps) => {
	const [connectorTextRef, setConnectorTextRef] = useState<Konva.Text | null>(null);
	const { drawerSizes, fontSizes } = useSizes(theme, size);

	const drawerStyle = useElementDrawerTheme(
		{
			highlight,
			select,
		},
		theme,
	);

	const connectPoint = useConnectPointTheme(
		{
			highlight,
			select,
		},
		theme,
	);

	const offset = 0.8;
	const connectorX = drawerSizes.width * offset;
	const connectorY = drawerSizes.height;
	const connectorTextX = (connectorTextRef?.textWidth ?? 0) / -2 + drawerSizes.width * offset;
	const connectorTextY = (connectorTextRef?.textHeight ?? 0) / -2 + drawerSizes.height;
	return (
		<Group visible={visible && Boolean(connectorTextRef)}>
			<Circle {...connectPoint} x={connectorX} y={connectorY} radius={14} listening={false} />
			<Text
				{...drawerStyle.text}
				ref={(ref) => setConnectorTextRef(ref)}
				text="1"
				x={connectorTextX}
				y={connectorTextY}
				fontSize={fontSizes.primary}
				listening={false}
			/>
		</Group>
	);
};

