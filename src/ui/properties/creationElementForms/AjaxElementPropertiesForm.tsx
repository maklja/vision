import { ChangeEventHandler } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { formStyle } from '../commonStyles';
import { SimpleCodeEditor } from '../../code';
import { AjaxElementProperties, HttpMethod } from '../../../model';
import { KeyValueList } from '../../pair';

const responseTypes = [
	{
		id: 'arraybuffer',
		label: 'Array buffer',
	},
	{
		id: 'blob',
		label: 'Blob',
	},
	{
		id: 'document',
		label: 'Document',
	},
	{
		id: 'json',
		label: 'JSON',
	},
	{
		id: 'text',
		label: 'Text',
	},
];

export interface AjaxElementPropertiesFormProps {
	id: string;
	properties: AjaxElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export const AjaxElementPropertiesForm = ({
	id,
	properties,
	onPropertyValueChange,
}: AjaxElementPropertiesFormProps) => {
	const handleUrlChanged: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) =>
		onPropertyValueChange?.(id, 'url', e.target.value ? e.target.value : properties.url);

	const handleMethodChanged = (e: SelectChangeEvent) =>
		onPropertyValueChange?.(id, 'method', e.target.value ? e.target.value : properties.url);

	const handleTimeoutChanged: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
		e,
	) => {
		const newTimeoutValue = Number(e.target.value);
		onPropertyValueChange?.(
			id,
			'timeout',
			isNaN(newTimeoutValue) ? properties.timeout : newTimeoutValue,
		);
	};

	const handleResponseTypeChanged = (e: SelectChangeEvent) =>
		onPropertyValueChange?.(
			id,
			'responseType',
			e.target.value ? e.target.value : properties.responseType,
		);

	const handleBodyChanged = (body: string) => onPropertyValueChange?.(id, 'body', body);

	const handleHeadersChanged = (headers: [string, string][]) =>
		onPropertyValueChange?.(id, 'headers', headers);

	const handleQueryParamsChanged = (queryParams: [string, string][]) =>
		onPropertyValueChange?.(id, 'queryParams', queryParams);

	return (
		<Stack gap={formStyle.componentGap}>
			<TextField
				id="ajax-el-url-prop"
				label="Url"
				value={properties.url}
				type="text"
				size="small"
				InputLabelProps={{
					shrink: true,
				}}
				onChange={handleUrlChanged}
				helperText="The address of the resource to request via HTTP. "
			/>

			<FormControl fullWidth size="small">
				<InputLabel shrink id="ajax-el-method-prop">
					Method
				</InputLabel>
				<Select
					labelId="ajax-el-method-prop"
					value={properties.method}
					label="Method"
					onChange={handleMethodChanged}
				>
					{Object.values(HttpMethod).map((httpMethod) => (
						<MenuItem key={httpMethod} value={httpMethod}>
							{httpMethod}
						</MenuItem>
					))}
				</Select>
				<FormHelperText>The HTTP Method to use for the request.</FormHelperText>
			</FormControl>

			<SimpleCodeEditor
				code={properties.body ?? ''}
				label="Body"
				helperText="The body of the HTTP request to send."
				language="json"
				height="200px"
				onCodeChange={handleBodyChanged}
			/>

			<TextField
				id="ajax-el-timeout-prop"
				label="Timeout"
				value={properties.timeout}
				type="number"
				size="small"
				defaultValue={0}
				InputLabelProps={{
					shrink: true,
				}}
				InputProps={{
					inputProps: { min: 0 },
				}}
				onChange={handleTimeoutChanged}
				helperText="The time to wait before causing the underlying XMLHttpRequest to timeout."
			/>

			<FormControl fullWidth size="small">
				<InputLabel shrink id="ajax-el-response-type-prop">
					Response type
				</InputLabel>
				<Select
					labelId="ajax-el-response-type-prop"
					value={properties.responseType}
					label="Response type"
					onChange={handleResponseTypeChanged}
					defaultValue="json"
				>
					{responseTypes.map((responseType) => (
						<MenuItem key={responseType.id} value={responseType.id}>
							{responseType.label}
						</MenuItem>
					))}
				</Select>
				<FormHelperText>Can be set to change the response type.</FormHelperText>
			</FormControl>

			<KeyValueList
				label="Headers"
				data={properties.headers ?? []}
				onChange={handleHeadersChanged}
			/>

			<KeyValueList
				label="Query parameters"
				data={properties.queryParams ?? []}
				onChange={handleQueryParamsChanged}
			/>
		</Stack>
	);
};

