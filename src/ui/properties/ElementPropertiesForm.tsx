import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	AjaxElementProperties,
	ElementProps,
	ElementType,
	FromElementProperties,
	GenerateElementProperties,
	IntervalElementProperties,
	RangeElementProperties,
	ThrowErrorElementProperties,
	TimerElementProperties,
} from '../../model';
import {
	AjaxElementPropertiesForm,
	FromElementPropertiesForm,
	GenerateElementPropertiesForm,
	IntervalElementPropertiesForm,
	RangeElementPropertiesForm,
	ThrowErrorElementPropertiesForm,
	TimerElementPropertiesForm,
} from './creationElementForms';

export interface ElementPropertiesFormProps {
	id: string;
	type: ElementType;
	properties: ElementProps;
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
		case ElementType.ThrowError:
			return (
				<ThrowErrorElementPropertiesForm
					id={id}
					properties={properties as ThrowErrorElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.Ajax:
			return (
				<AjaxElementPropertiesForm
					id={id}
					properties={properties as AjaxElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.Generate:
			return (
				<GenerateElementPropertiesForm
					id={id}
					properties={properties as GenerateElementProperties}
					onPropertyValueChange={onPropertyValueChange}
				/>
			);
		case ElementType.Timer:
			return (
				<TimerElementPropertiesForm
					id={id}
					properties={properties as TimerElementProperties}
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
	return Object.keys(properties).length > 0 ? (
		<Box
			sx={{
				overflow: 'auto',
				maxHeight: '100%',
			}}
			component="form"
			noValidate
			autoComplete="off"
		>
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
	) : null;
};

