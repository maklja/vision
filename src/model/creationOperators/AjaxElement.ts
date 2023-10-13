import { Element, ElementType } from '../element';

export enum HttpMethod {
	Get = 'GET',
	Head = 'HEAD',
	Post = 'POST',
	Put = 'PUT',
	Delete = 'DELETE',
	Connect = 'CONNECT',
	Options = 'OPTIONS',
	Trace = 'TRACE',
	Patch = 'PATCH',
}

export interface AjaxElementProperties extends Record<string, unknown> {
	url: string;
	method: HttpMethod;
	body?: string;
	headers?: readonly [string, string][];
	timeout?: number;
	responseType?: XMLHttpRequestResponseType;
	queryParams?: readonly [string, string][];
}

export interface AjaxElement extends Element<AjaxElementProperties> {
	type: ElementType.Ajax;
}

export const ajaxElementPropsTemplate: AjaxElementProperties = {
	url: 'https://api.github.com/users/mralexgray/repos',
	method: HttpMethod.Get,
};

