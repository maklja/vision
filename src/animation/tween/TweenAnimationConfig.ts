import Konva from 'konva';
import { AnimationOptions } from '../Animation';

export interface TweenAnimationConfig {
	name: string;
	mainShape?: Konva.NodeConfig;
	secondaryShape?: Konva.NodeConfig;
	text?: Konva.NodeConfig;
	options?: AnimationOptions;
}

export interface TweenAnimationInstanceConfig extends TweenAnimationConfig {
	id: string;
}

