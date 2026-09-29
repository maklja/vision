import type { RefCallback } from 'react';
import type { ConnectDragSource, ConnectDropTarget } from 'react-dnd';

/**
 * `react-dnd` 16 types both of its connectors as React 18 legacy refs, `(element) => element`, so
 * they can be attached directly to an element. React 19 narrowed the ref callback contract to
 * returning either nothing or a cleanup function, which makes the returned element a type error
 * even though React still ignores it at runtime.
 *
 * Adapt the connector instead of changing how it is attached: casting keeps the connector's
 * identity stable, while wrapping it in a new function would detach and reattach the ref on every
 * render.
 */
export function toRefCallback<TElement>(
	connector: ConnectDragSource | ConnectDropTarget,
): RefCallback<TElement> {
	return connector as unknown as RefCallback<TElement>;
}
