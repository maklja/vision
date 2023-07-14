import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PhoneIcon from '@mui/icons-material/Phone';
import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import { CreationOperatorIcon, FilteringOperatorIcon, JoinCreationOperatorIcon } from './icons';

export const OperatorsPanel = () => {
	return (
		<Box>
			<Paper>
				<Tabs value={0} orientation="vertical" aria-label="RxJS operator types">
					<Tab
						icon={<CreationOperatorIcon color="primary" fontSize="large" />}
						title="Creation operators"
					/>
					<Tab
						icon={<JoinCreationOperatorIcon color="primary" fontSize="large" />}
						title="Join creation operators"
					/>
					<Tab
						icon={<PhoneIcon color="primary" fontSize="large" />}
						title="Transformation operators"
					/>
					<Tab
						icon={<FilteringOperatorIcon color="primary" fontSize="large" />}
						title="Filtering operators"
					/>
					<Tab icon={<PhoneIcon />} title="Join operators" />
					<Tab icon={<PhoneIcon />} title="Multicasting operators" />
					<Tab icon={<PhoneIcon />} title="Utility operators" />
					<Tab icon={<PhoneIcon />} title="Conditional and Boolean operators" />
					<Tab icon={<PhoneIcon />} title="Mathematical and Aggregate operators" />
					<Tab
						icon={<RadioButtonCheckedOutlinedIcon color="primary" fontSize="large" />}
						title="Subscriber"
					/>
				</Tabs>
			</Paper>
		</Box>
	);
};

