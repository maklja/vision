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
import { ChangeEventHandler } from 'react';

export interface ElementExplorerProps {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	scale: number;
	onPositionChange?: (id: string, position: Point) => void;
}

export const ElementExplorer = ({
	id,
	scale,
	type,
	x,
	y,
	onPositionChange,
}: ElementExplorerProps) => {
	const operatorGroup = mapElementTypeToGroup(type);

	const handleXChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
		const newX = Number(e.target.value);
		if (isNaN(newX)) {
			return;
		}
		onPositionChange?.(id, { x: newX, y });
	};

	const handleYChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
		const newY = Number(e.target.value);
		if (isNaN(newY)) {
			return;
		}
		onPositionChange?.(id, { x, y: newY });
	};

	return (
		<Box component="form" noValidate autoComplete="off">
			<Accordion disableGutters>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography>Element explorer</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Stack gap={1.5}>
						<FormLabel>
							<Typography>Details</Typography>
						</FormLabel>
						<FormGroup sx={{ gap: 1.5, flexWrap: 'nowrap' }}>
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
						<FormGroup row sx={{ gap: 1.5, flexWrap: 'nowrap' }}>
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
						<FormGroup row sx={{ gap: 1.5, flexWrap: 'nowrap' }}>
							<TextField
								id="scale"
								label="scale"
								value={`${scale * 100}%`}
								size="small"
								InputProps={{
									readOnly: true,
								}}
								InputLabelProps={{
									shrink: true,
								}}
							/>
						</FormGroup>
					</Stack>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};
