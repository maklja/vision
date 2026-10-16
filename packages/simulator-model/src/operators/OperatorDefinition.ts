import type { ElementDescriptor } from '../descriptors/ElementDescriptor';
import type { ElementGroup } from '../element/ElementGroup';
import type { ElementType } from '../element/ElementType';

export interface CallbackSignature {
	/** Positional arguments supplied by today's adapter, not the future invocation contract. */
	readonly arguments: readonly { readonly name: string; readonly type: string }[];
	readonly returns: string;
	readonly helpers: readonly string[];
	readonly notes: string;
}

export type PropertyDefinition =
	| { readonly kind: 'callback'; readonly label: string; readonly signature: CallbackSignature }
	| { readonly kind: 'number'; readonly label: string; readonly semantics: string };

/** Remove ElementProps' string index signature so missing/extra property keys fail type checking. */
type DeclaredProperties<P> = {
	[K in keyof P as string extends K ? never : number extends K ? never : K]: P[K];
};

type PropertyDefinitions<P> = {
	readonly [K in keyof DeclaredProperties<P>]-?: P[K] extends number
		? Extract<PropertyDefinition, { kind: 'number' }>
		: Extract<PropertyDefinition, { kind: 'callback' }>;
};

/**
 * Static metadata only. Runtime factories and React registrations remain in their owning packages.
 * This first slice describes Of/Map/Merge; it is not a validator, compiler or plugin API.
 */
export interface OperatorDefinition<P> {
	readonly type: ElementType;
	readonly name: string;
	readonly category: ElementGroup;
	readonly documentationUrl: string;
	readonly status: 'supported';
	readonly defaults: P;
	readonly properties: PropertyDefinitions<P>;
	readonly ports: ElementDescriptor;
	readonly referencePorts: readonly ('input' | 'event')[];
	readonly example: string;
	readonly codeExport: { readonly status: 'deferred'; readonly reason: string };
}
