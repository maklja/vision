import { ChangeEvent } from 'react';

export const handleNumberInputChanged =
	(
		id: string,
		propName: string,
		defaultValue: number,
		onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void,
	) =>
	(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const newValue = Number(e.target.value);
		onPropertyValueChange?.(id, propName, isNaN(newValue) ? defaultValue : newValue);
	};

