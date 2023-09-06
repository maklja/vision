import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	ElementType,
	FromElementProperties,
	IntervalElementProperties,
	RangeElementProperties,
} from '../../model';
import {
	FromElementPropertiesForm,
	IntervalElementPropertiesForm,
	RangeElementPropertiesForm,
} from './creationElementForms';

export interface ElementPropertiesFormProps {
	id: string;
	type: ElementType;
	properties: unknown;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

const createElementPropertiesForm = ({
	id,
	type,
	properties,
	onPropertyValueChange,
}: ElementPropertiesFormProps) => {
	switch (type) {
		case ElementType.Interval:
			return (
				<IntervalElementPropertiesForm
					id={id}
					properties={properties as IntervalElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.From:
			return (
				<FromElementPropertiesForm
					id={id}
					properties={properties as FromElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.Range:
			return (
				<RangeElementPropertiesForm
					id={id}
					properties={properties as RangeElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		default:
			return null;
	}
};

export const ElementPropertiesForm = ({
	id,
	type,
	properties,
	onPropertyValueChange,
}: ElementPropertiesFormProps) => {
	return (
		<Box component="form" noValidate autoComplete="off">
			<Accordion disableGutters defaultExpanded={true}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography>Element properties</Typography>
				</AccordionSummary>
				<AccordionDetails>
					{createElementPropertiesForm({
						id,
						type,
						properties,
						onPropertyValueChange,
					})}
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};

