import Konva from 'konva';
import { AnimationOptions } from './Animation';

export interface AnimationTemplate {
	mainShape?: Konva.NodeConfig;
	secondaryShape?: Konva.NodeConfig;
	text?: Konva.NodeConfig;
	options?: AnimationOptions;
}

export interface DrawerAnimationTemplate extends AnimationTemplate {
	id: string;
	dispose: boolean;
}
