import { ChangeEventHandler } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { AjaxElementProperties, ajaxOperatorDefinition } from '@maklja/vision-simulator-model';
import { formStyle } from '../commonStyles';
import { SimpleCodeEditor } from '../../code';
import { KeyValueList } from '../../pair';
import { handleNumberInputChanged } from '../utils';

const fields = ajaxOperatorDefinition.properties;

export interface AjaxElementPropertiesFormProps {
	id: string;
	properties: AjaxElementProperties;
	onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
}

export function AjaxElementPropertiesForm({
	id,
	properties,
	onPropertyValueChange,
}: AjaxElementPropertiesFormProps) {
	const handleUrlChanged: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) =>
		onPropertyValueChange?.(id, 'url', e.target.value ? e.target.value : properties.url);

	const handleMethodChanged = (e: SelectChangeEvent) =>
		onPropertyValueChange?.(id, 'method', e.target.value ? e.target.value : properties.url);

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
		<Stack
			sx={{
				gap: formStyle.componentGap,
			}}
		>
			<TextField
				id="ajax-el-url-prop"
				label={fields.url.label}
				value={properties.url}
				type="text"
				size="small"
				slotProps={{
					inputLabel: { shrink: true },
				}}
				onChange={handleUrlChanged}
				helperText="The address of the resource to request via HTTP."
			/>

			<FormControl fullWidth size="small">
				<InputLabel shrink id="ajax-el-method-prop">
					{fields.method.label}
				</InputLabel>
				<Select
					labelId="ajax-el-method-prop"
					value={properties.method}
					label={fields.method.label}
					onChange={handleMethodChanged}
				>
					{fields.method.options.map(({ value, label }) => (
						<MenuItem key={value} value={value}>
							{label}
						</MenuItem>
					))}
				</Select>
				<FormHelperText>The HTTP Method to use for the request.</FormHelperText>
			</FormControl>

			<SimpleCodeEditor
				code={properties.body ?? ''}
				label={fields.body.label}
				helperText="The body of the HTTP request to send."
				language="json"
				height="200px"
				onCodeChange={handleBodyChanged}
			/>

			<TextField
				id="ajax-el-timeout-prop"
				label={fields.timeout.label}
				value={properties.timeout}
				type="number"
				size="small"
				defaultValue={0}
				slotProps={{
					inputLabel: { shrink: true },
					htmlInput: { min: 0 },
				}}
				onChange={handleNumberInputChanged(
					id,
					'timeout',
					properties.timeout ?? 0,
					onPropertyValueChange,
				)}
				helperText="The time to wait before causing the underlying XMLHttpRequest to timeout."
			/>

			<FormControl fullWidth size="small">
				<InputLabel shrink id="ajax-el-response-type-prop">
					{fields.responseType.label}
				</InputLabel>
				<Select
					labelId="ajax-el-response-type-prop"
					value={properties.responseType}
					label={fields.responseType.label}
					onChange={handleResponseTypeChanged}
					defaultValue="json"
				>
					{fields.responseType.options.map((responseType) => (
						<MenuItem key={responseType.value} value={responseType.value}>
							{responseType.label}
						</MenuItem>
					))}
				</Select>
				<FormHelperText>Can be set to change the response type.</FormHelperText>
			</FormControl>

			<KeyValueList
				label={fields.headers.label}
				data={properties.headers ?? []}
				onChange={handleHeadersChanged}
			/>

			<KeyValueList
				label={fields.queryParams.label}
				data={properties.queryParams ?? []}
				onChange={handleQueryParamsChanged}
			/>
		</Stack>
	);
}
