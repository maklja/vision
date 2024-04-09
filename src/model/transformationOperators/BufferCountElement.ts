import { ElementType, Element, ElementProps } from '../element';

export interface BufferCountElementProperties extends ElementProps {
	bufferSize: number;
	startBufferEvery: number;
}

export interface BufferCountElement extends Element<BufferCountElementProperties> {
	type: ElementType.BufferCount;
}

export const bufferCountElementPropsTemplate: BufferCountElementProperties = {
	bufferSize: 3,
	startBufferEvery: 2,
};

