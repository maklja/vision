import { AjaxConfig } from 'rxjs/ajax';
import { Element, ElementType } from '../element';

export interface AjaxElement extends Element<AjaxConfig> {
	type: ElementType.Ajax;
}

export const ajaxElementPropsTemplate: AjaxConfig = {
	url: 'https://api.github.com/users/mralexgray/repos',
	method: 'GET',
};
