import { ElementType, Element } from '../element';

export interface BufferTimeElementProperties extends Record<string, unknown> {
	bufferTimeSpan: number;
	bufferCreationInterval?: number;
	maxBufferSize?: number;
}

export interface BufferTimeElement extends Element<BufferTimeElementProperties> {
	type: ElementType.BufferTime;
}

export const bufferTimeElementPropsTemplate: BufferTimeElementProperties = {
	bufferTimeSpan: 100,
};

