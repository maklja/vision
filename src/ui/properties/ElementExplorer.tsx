import { ChangeEventHandler, Fragment } from 'react';
import FormGroup from '@mui/material/FormGroup';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import { ElementType, Point, mapElementTypeToGroup } from '../../model';
import { useShapeSize } from '../../store/stageSlice';
import { ElementShape } from '../../theme';
import { formStyle } from './commonStyles';

export interface ElementExplorerProps {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	onPositionChange?: (id: string, position: Point) => void;
}

export const ElementExplorer = ({ id, type, x, y, onPositionChange }: ElementExplorerProps) => {
	const operatorGroup = mapElementTypeToGroup(type);
	const shapeSize = useShapeSize(type);

	const handleXChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
		const newX = Number(e.target.value);
		onPositionChange?.(id, { x: isNaN(newX) ? x : newX, y });
	};

	const handleYChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
		const newY = Number(e.target.value);
		onPositionChange?.(id, { x, y: isNaN(newY) ? y : newY });
	};

	return (
		<Box component="form" noValidate autoComplete="off">
			<Accordion disableGutters>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography>Element explorer</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Stack gap={formStyle.componentGap}>
						<FormLabel>
							<Typography>Details</Typography>
						</FormLabel>
						<FormGroup sx={{ gap: formStyle.componentGap, flexWrap: 'nowrap' }}>
							<TextField
								id="element-id"
								label="Id"
								value={id}
								size="small"
								InputProps={{
									readOnly: true,
								}}
								InputLabelProps={{
									shrink: true,
								}}
							/>

							<TextField
								id="element-type"
								label="Type"
								value={type}
								size="small"
								InputProps={{
									readOnly: true,
								}}
								InputLabelProps={{
									shrink: true,
								}}
							/>

							<TextField
								id="element-group"
								label="Group"
								value={operatorGroup}
								size="small"
								InputProps={{
									readOnly: true,
								}}
								InputLabelProps={{
									shrink: true,
								}}
							/>
						</FormGroup>

						<FormLabel>
							<Typography>Position</Typography>
						</FormLabel>
						<FormGroup row sx={{ gap: formStyle.componentGap, flexWrap: 'nowrap' }}>
							<TextField
								id="x-position"
								label="X"
								type="number"
								value={x}
								size="small"
								InputLabelProps={{
									shrink: true,
								}}
								onChange={handleXChange}
							/>
							<TextField
								id="y-position"
								label="Y"
								type="number"
								value={y}
								size="small"
								InputLabelProps={{
									shrink: true,
								}}
								onChange={handleYChange}
							/>
						</FormGroup>

						<FormLabel>Size</FormLabel>
						<FormGroup row sx={{ gap: formStyle.componentGap, flexWrap: 'nowrap' }}>
							{shapeSize.type === ElementShape.Circle ? (
								<TextField
									id="element-radius"
									label="Radius"
									value={shapeSize.radius}
									type="number"
									size="small"
									InputProps={{
										readOnly: true,
									}}
									InputLabelProps={{
										shrink: true,
									}}
								/>
							) : null}

							{shapeSize.type === ElementShape.Rectangle ? (
								<Fragment>
									<TextField
										id="element-width"
										label="Width"
										value={shapeSize.width}
										type="number"
										size="small"
										InputProps={{
											readOnly: true,
										}}
										InputLabelProps={{
											shrink: true,
										}}
									/>
									<TextField
										id="element-height"
										label="Height"
										value={shapeSize.height}
										type="number"
										size="small"
										InputProps={{
											readOnly: true,
										}}
										InputLabelProps={{
											shrink: true,
										}}
									/>
								</Fragment>
							) : null}
						</FormGroup>
					</Stack>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};

