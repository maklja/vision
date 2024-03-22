import {
	ConnectLineCollection,
	Element,
	ElementType,
	IntervalElementProperties,
	IntervalElementPropertiesKeys,
} from '../../model';
import {
	CodeNode,
	FUNC_PARAMS_COMMA_SEPARATOR,
	generateCreationCallbackNodes,
	generateCreationFactoryName,
} from './codeGenerator';

function deferCallbackCode(node: CodeNode) {
	const params = node.childNodes
		.map(generateCreationElementParamCode)
		.join(FUNC_PARAMS_COMMA_SEPARATOR);

	return params.length > 0
		? `function deferCallback() {
			return ${params};
		}`
		: '';
}

// function deferParamCode(node: CodeNode) {
// 	const funcName = generateCreationFactoryName(node.parentNode);
// 	return `${funcName}()`;
// }

function emptyParamCode(node: CodeNode) {
	return `${generateCreationFactoryName(node.parentNode)}()`;
}

function intervalParamCode(node: CodeNode) {
	const funcName = generateCreationFactoryName(node.parentNode);
	const props = node.parentNode.properties as IntervalElementProperties;
	return `${funcName}({ ${IntervalElementPropertiesKeys.Period}: ${props.period} })`;
}

function generateCreationElementParamCode(node: CodeNode): string {
	switch (node.parentNode.type) {
		case ElementType.Defer:
		case ElementType.Empty:
			return emptyParamCode(node);
		case ElementType.Interval:
			return intervalParamCode(node);
	}

	throw new Error(
		`Unsupported parameter code generation for creation element type ${node.parentNode.type}`,
	);
}

function generateCreationElementCallbackCode(node: CodeNode) {
	switch (node.parentNode.type) {
		case ElementType.Defer:
			return deferCallbackCode(node);
	}

	throw new Error(
		`Unsupported callback code generation for creation element type ${node.parentNode.type}`,
	);
}

export function generateCreationElementCode(
	sourceElId: string,
	elements: ReadonlyMap<string, Element>,
	connectLineCollection: ConnectLineCollection,
) {
	const rootTreeNode = generateCreationCallbackNodes(sourceElId, elements, connectLineCollection);
	const generatedFunc = generateCreationElementCallbackCode(rootTreeNode);

	console.log(generatedFunc);
}
