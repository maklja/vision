# Typed source parameters

Issue #135 adds `parameter-v1` values to schema v2 diagrams. The first rollout covers Range
`start`/`count`, Interval `period`, and Timer `startDue`/`intervalDuration`. Timer's existing numeric
`dueDateType` remains an explicit choice: 0 means relative milliseconds, 1 means an epoch date.
Callback fields keep their original names and source text.

```ts
type ParameterType = 'number' | 'boolean' | 'string' | 'date' | 'json';
type ParameterValue =
	| { kind: 'literal'; type: ParameterType; value: JsonValue }
	| { kind: 'expression'; type: ParameterType; source: string };
```

The model validates all five literal types. Only the numeric/date fields listed above accept these
envelopes in this rollout. Other operator properties retain their existing schema. For example,
`{"kind":"expression","type":"number","source":"$context.periodMs"}` is a period definition;
`"$context.periodMs"` by itself is invalid. There is no interpolation or numeric-string coercion.

| Field                         | Type   | Constraints                                                            |
| ----------------------------- | ------ | ---------------------------------------------------------------------- |
| Range start                   | number | Finite integer; may be negative                                        |
| Range count                   | number | Nonnegative integer, or absent to retain RxJS `range(start)` semantics |
| Interval period               | number | Finite and >= 0; zero retains asynchronous scheduling                  |
| Timer startDue, relative mode | number | Finite and >= 0 milliseconds                                           |
| Timer startDue, date mode     | date   | Integral UTC epoch milliseconds, absolute value <= 8.64e15             |
| Timer intervalDuration        | number | Finite and >= 0, or exactly -1 for one emission                        |

A date is saved as a number inside its typed envelope. Only the Timer factory converts it to a
JavaScript Date. Past dates keep RxJS's immediate scheduling. Date/function/class instances,
NaN/Infinity, undefined, unsafe prototype keys and cyclic/deep/non-JSON data are rejected.

## Subscription and override behavior

Required template defaults, saved definitions and then explicit direct overrides select each field.
An omitted optional Range count remains absent. Runtime `createObservable({ count: 0 })` overrides
use raw values, never parameter envelopes. An override bypasses the saved expression for that field.
Zero, false and empty text remain explicit for types that permit them; null/undefined are invalid
for these numeric/date fields. Joins consume only their own keys and do not broadcast overrides.

On every actual source subscription, the engine clones and freezes the selected raw definitions.
Each parameter expression evaluates once, with `$context` (mutable run-shared state) and `$params`
(the frozen raw definitions, not recursively evaluated values). All expressions see the same raw
snapshot; they cannot accidentally depend on earlier fields' evaluation order. Validated results
replace the definitions in the final frozen callback `$params`. Repeated cold subscriptions and
queued/concurrent inners get fresh snapshots. Unsubscribed inners never evaluate parameters.

Expressions are authored JavaScript and require explicit approval for the current source revision.
Preflight only parses source; import, migration and editor validation never evaluate it. Parameter
expressions, callbacks, context and network execution require a functioning Worker, including when
its constructor throws. Literal wrappers can use the existing limited fallback: one source branch
and an explicit Range count <= 10000. A Worker is not a security sandbox. See
[execution policy](EXECUTION_POLICY.md).

## Editing and validation

Each rolled-out field has labeled Literal and Expression modes. Both drafts survive mode switching
while the field is mounted; only the active variant is saved. Selecting another element initializes
its own editors, so an old draft cannot be written into the new element. Timer due-mode changes
explicitly initialize the corresponding numeric/date value, preserving the existing UI behavior.
Clearing optional Count removes its key. Clearing a required numeric field is invalid rather than
silently becoming zero. Invalid editor drafts remain local and cannot overwrite the last valid saved
value. Expression changes commit only after syntax validation succeeds; stale validation results are discarded.
Reloading restores the last valid value.

Field errors are associated with their input. Run remains disabled while the selected graph's
syntax/literal validation is pending or failing. Disconnected saved parameters do not block that
graph. A visible invalid or pending editor draft blocks Run until corrected or dismissed.
Expressions' dynamic return values are checked on subscription, with element/field diagnostics;
these failures remain catchable by RxJS recovery operators. Final subscription parentage/correlation
uses the graph subscription occurrences defined in [protocol v1](FLOW_EVENT_PROTOCOL.md).

Limits are 64 KiB UTF-8 per expression, 1 MiB per seed/invocation snapshot and JSON depth 64, checked
before Worker dispatch. Runtime expression results are checked again without coercion. Diagnostic
messages do not include full context, params or authored source.

## Development schema policy

Only schema v2 is accepted. The project is not in production, so older development schemas are
intentionally unsupported: unversioned/v1/future documents are not loaded, converted or executed.
Load/import failures are logged in the browser console and leave stored data unchanged. There are
no migration functions or migration-specific backups. Tests seed current-schema documents directly.

Raw numeric templates and direct engine API inputs serialize to literal envelopes when writing
current documents; callbacks are unchanged. Optional Range count remains absent when intentionally
omitted. Schema v2 files require envelopes in the rolled-out fields. See
[diagram persistence](DIAGRAM_PERSISTENCE.md). Production migration policy will be decided before release.
