import Konva from 'konva';
import { AnimationOptions } from './Animation';
import { AnimationKey } from './registry';

export interface AnimationTemplate {
	key: AnimationKey;
	mainShape?: Konva.NodeConfig;
	secondaryShape?: Konva.NodeConfig;
	text?: Konva.NodeConfig;
	options?: AnimationOptions;
}

export interface DrawerAnimationTemplate extends AnimationTemplate {
	id: string;
	dispose: boolean;
}
