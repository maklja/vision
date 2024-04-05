import dedent from 'dedent';
import {
	BufferToggleElement,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	ElementType,
	IifElement,
	MISSING_OBSERVABLE_COMMENT,
	NEXT_GENERATOR_NAME,
} from '../../model';

export interface ConnectElement {
	element: Element;
	connectPointType: ConnectPointType;
	connectPosition: ConnectPointPosition;
}

function createEmptyCallback(fnName: string, paramNames: string[] = []) {
	return dedent`function ${fnName}(${paramNames.join(', ')}) {
        return ${NEXT_GENERATOR_NAME}();
    }`;
}

function createCodeInIifProperties(iifElement: IifElement, connectPosition: ConnectPointPosition) {
	if (connectPosition === ConnectPointPosition.Top) {
		return {
			...iifElement.properties,
			trueCallbackExpression: createEmptyCallback('trueResult'),
		};
	}

	if (connectPosition === ConnectPointPosition.Bottom) {
		return {
			...iifElement.properties,
			falseCallbackExpression: createEmptyCallback('falseResult'),
		};
	}

	return iifElement.properties;
}

function clearCodeInIifProperties(iifElement: IifElement, connectPosition: ConnectPointPosition) {
	if (connectPosition === ConnectPointPosition.Top) {
		return {
			...iifElement.properties,
			trueCallbackExpression: MISSING_OBSERVABLE_COMMENT,
		};
	}

	if (connectPosition === ConnectPointPosition.Bottom) {
		return {
			...iifElement.properties,
			falseCallbackExpression: MISSING_OBSERVABLE_COMMENT,
		};
	}

	throw new Error(`Invalid connect position ${connectPosition} for iif operator.`);
}

function createCodeInBufferToggleProperties(
	bufferToggle: BufferToggleElement,
	connectPosition: ConnectPointPosition,
) {
	if (connectPosition === ConnectPointPosition.Bottom) {
		return {
			...bufferToggle.properties,
			closingSelectorExpression: createEmptyCallback('project', ['value']),
		};
	}

	return bufferToggle.properties;
}

function clearCodeInBufferToggleProperties(
	bufferToggle: BufferToggleElement,
	connectPosition: ConnectPointPosition,
) {
	if (connectPosition === ConnectPointPosition.Bottom) {
		return {
			...bufferToggle.properties,
			closingSelectorExpression: MISSING_OBSERVABLE_COMMENT,
		};
	}

	return bufferToggle.properties;
}

function createCodeInElementProperties(sourceConnectEl: ConnectElement): ElementProps {
	switch (sourceConnectEl.element.type) {
		case ElementType.Defer:
			return {
				observableFactory: createEmptyCallback('observableFactory'),
			};
		case ElementType.From:
			return {
				inputCallbackExpression: 'function input() { return [1, 2, 3, 4]; }',
				observableFactory: createEmptyCallback('input'),
			};
		case ElementType.IIf:
			return createCodeInIifProperties(
				sourceConnectEl.element as IifElement,
				sourceConnectEl.connectPosition,
			);
		case ElementType.BufferToggle:
			return createCodeInBufferToggleProperties(
				sourceConnectEl.element as BufferToggleElement,
				sourceConnectEl.connectPosition,
			);
		default:
			return sourceConnectEl.element.properties;
	}
}

function clearCodeInElementProperties(sourceConnectEl: ConnectElement): ElementProps {
	switch (sourceConnectEl.element.type) {
		case ElementType.Defer:
			return {
				observableFactory: MISSING_OBSERVABLE_COMMENT,
			};
		case ElementType.From:
			return {
				inputCallbackExpression: 'function input() { return [1, 2, 3, 4]; }',
				observableFactory: MISSING_OBSERVABLE_COMMENT,
			};
		case ElementType.IIf:
			return clearCodeInIifProperties(
				sourceConnectEl.element as IifElement,
				sourceConnectEl.connectPosition,
			);
		case ElementType.BufferToggle:
			return clearCodeInBufferToggleProperties(
				sourceConnectEl.element as BufferToggleElement,
				sourceConnectEl.connectPosition,
			);
		default:
			return sourceConnectEl.element.properties;
	}
}

export function createRefElementCode(sourceConnectEl: ConnectElement): ElementProps {
	return {
		...sourceConnectEl.element.properties,
		...createCodeInElementProperties(sourceConnectEl),
	};
}

export function clearRefElementCode(sourceConnectEl: ConnectElement): ElementProps {
	return {
		...sourceConnectEl.element.properties,
		...clearCodeInElementProperties(sourceConnectEl),
	};
}

