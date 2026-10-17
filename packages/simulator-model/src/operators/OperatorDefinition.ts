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
	| {
			readonly kind: 'text';
			readonly label: string;
			readonly semantics: string;
			readonly format?: 'json';
	  }
	| { readonly kind: 'pairs'; readonly label: string; readonly semantics: string }
	| {
			readonly kind: 'expression';
			readonly label: string;
			readonly returns: string;
			readonly semantics: string;
			readonly callback?: CallbackSignature;
	  }
	| { readonly kind: 'callback'; readonly label: string; readonly signature: CallbackSignature }
	| {
			readonly kind: 'number';
			readonly label: string;
			readonly semantics: string;
			/** Existing numeric mode choices, such as Timer's DueDateType. */
			readonly options?: readonly { readonly value: number; readonly label: string }[];
	  }
	| {
			readonly kind: 'choice';
			readonly label: string;
			readonly semantics: string;
			readonly options: readonly { readonly value: string; readonly label: string }[];
	  }
	| { readonly kind: 'boolean'; readonly label: string; readonly semantics: string };

/** Remove ElementProps' string index signature so missing/extra property keys fail type checking. */
type DeclaredProperties<P> = {
	[K in keyof P as string extends K ? never : number extends K ? never : K]: P[K];
};

/** Stored strings can be explicitly declared as expressions or literal text instead of callbacks. */
type StringPropertyKeys<P> = {
	[K in keyof DeclaredProperties<P>]-?: NonNullable<P[K]> extends string ? K : never;
}[keyof DeclaredProperties<P>];

type PropertyDefinitions<
	P,
	Expressions extends StringPropertyKeys<P>,
	Texts extends Exclude<StringPropertyKeys<P>, Expressions>,
> = {
	readonly [K in keyof DeclaredProperties<P>]-?: (K extends Expressions
		? Extract<PropertyDefinition, { kind: 'expression' }>
		: K extends Texts
			? Extract<PropertyDefinition, { kind: 'text' }>
			: NonNullable<P[K]> extends readonly (readonly [string, string])[]
				? Extract<PropertyDefinition, { kind: 'pairs' }>
				: NonNullable<P[K]> extends boolean
					? Extract<PropertyDefinition, { kind: 'boolean' }>
					: NonNullable<P[K]> extends number
						? Extract<PropertyDefinition, { kind: 'number' }>
						: NonNullable<P[K]> extends string
							? string extends NonNullable<P[K]>
								? Extract<PropertyDefinition, { kind: 'callback' }>
								: Omit<
										Extract<PropertyDefinition, { kind: 'choice' }>,
										'options'
									> & {
										readonly options: readonly {
											readonly value: NonNullable<P[K]>;
											readonly label: string;
										}[];
									}
							: Extract<PropertyDefinition, { kind: 'callback' }>) &
		(undefined extends P[K] ? { readonly optional: true } : { readonly optional?: false }) & {
			/** Mode selection is descriptive metadata, not authored-code evaluation. */
			readonly activeWhen?: {
				readonly property: keyof DeclaredProperties<P>;
				readonly equals: boolean;
			};
		};
};

/**
 * Static metadata only. Runtime factories and React registrations remain in their owning packages.
 * Definitions describe current adapters; they are not a validator, compiler or plugin API.
 */
export interface OperatorDefinition<
	P,
	Expressions extends StringPropertyKeys<P> = never,
	Texts extends Exclude<StringPropertyKeys<P>, Expressions> = never,
> {
	readonly type: ElementType;
	readonly name: string;
	readonly category: ElementGroup;
	readonly documentationUrl: string;
	readonly status: 'supported';
	readonly defaults: P;
	readonly properties: PropertyDefinitions<P, Expressions, Texts>;
	readonly ports: ElementDescriptor;
	/** Only operators with property-dependent ports need a resolver. Defaults still use ports. */
	readonly resolvePorts?: (properties: P) => ElementDescriptor;
	/** Candidate reference ports; intersect with the resolved ports for the current mode. */
	readonly referencePorts: readonly ('input' | 'event')[];
	readonly example: string;
	readonly codeExport: { readonly status: 'deferred'; readonly reason: string };
}
