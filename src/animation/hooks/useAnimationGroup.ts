import { useMemo } from 'react';
import { Animation } from '../Animation';
import { AnimationGroup } from '../AnimationGroup';

export const useAnimationGroups = (
	animations: (Animation | null)[],
	id?: string,
): Animation | null =>
	useMemo(() => {
		if (animations.some((animation) => animation == null)) {
			return null;
		}

		return new AnimationGroup(animations as Animation[], id);
	}, [...animations, id]);
