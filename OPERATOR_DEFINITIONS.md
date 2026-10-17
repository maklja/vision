# Operator definitions and registration

Issue #140 is incremental. All 30 current operator/sink types now have typed static definitions in
`packages/simulator-model/src/operators`. Internal Result and ConnectPoint drawing elements are
excluded. Group template helpers and engine registration keys consume the definitions; existing
property forms consume field labels and choices. Ajax and Subscriber drawer registrations also
consume metadata. Existing interfaces, descriptors, engine functions and themes stay in place.
No saved field, connection, callback argument or RxJS behavior changes.

The contract provides identity/category/docs, support status, declared property kinds, defaults,
callback argument/return/helper signatures, existing ports, reference classification, examples and
an explicit deferred export reason. Kinds distinguish callbacks, expressions, literal text (including
JSON text), ordered string pairs, boolean, number and choice fields. Definitions describe current
behavior; they do not implement the future parameter schema, validation or a generic plugin API.

`findOperatorDefinition` returns `undefined` for internal or unknown types. Consumers requiring
metadata use `requireOperatorDefinition`, which fails with an explicit registration diagnostic.
Never substitute `{}` or execute code to discover a definition. The all-current inventory test
requires a definition for each new operator type.

## Current inventory

This table includes every current `ElementType`. **D** means its definition metadata is migrated;
All current operator definitions are migrated; richer registration integration remains under #140.
All executable rows remain supported; **I** identifies an internal/transient type. Full readable
RxJS export is deferred to #136 for every executable row: no serializer is implemented by metadata.
Properties listed with `?` are optional in the existing interface. A propertyless operator may still
have connection-order controls; lack of a property form does not mean unsupported execution.

| Type            | State | Stored properties                                                                                                                                                                       | Property form / notes                                                 |
| --------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `of`            | D     | `argsFactoryExpression: string`                                                                                                                                                         | Arguments factory                                                     |
| `from`          | D     | `enableObservableEvent: boolean`, `inputCallbackExpression: string`, `observableFactory: string`                                                                                        | Literal input callback or connected factory mode                      |
| `iif`           | D     | `conditionExpression`, `trueCallbackExpression`, `falseCallbackExpression`: string                                                                                                      | Condition and true/false connected factories                          |
| `interval`      | D     | `period: number`                                                                                                                                                                        | Period                                                                |
| `ajax`          | D     | `url: string`, `method: HttpMethod`, `body?: string`, `headers?: [string,string][]`, `timeout?: number`, `responseType?: XMLHttpRequestResponseType`, `queryParams?: [string,string][]` | Body is JSON text; pair lists remain pair lists                       |
| `empty`         | D     | None                                                                                                                                                                                    | No property form                                                      |
| `defer`         | D     | `observableFactory: string`                                                                                                                                                             | Connected factory                                                     |
| `generate`      | D     | `initialState: string`, `condition?: string`, `iterate: string`, `resultSelector: string`                                                                                               | Initial state is an expression, others callbacks                      |
| `range`         | D     | `start: number`, `count?: number`                                                                                                                                                       | Start/count                                                           |
| `throwError`    | D     | `errorOrErrorFactory: string`                                                                                                                                                           | Existing RxJS error/factory field                                     |
| `timer`         | D     | `dueDateType: DueDateType`, `startDue: number`, `intervalDuration: number`                                                                                                              | Millisecond/date modes and one-shot sentinel below                    |
| `combineLatest` | D     | `observableInputsType: ObservableInputsType`                                                                                                                                            | Array/object selection; order/names on connections                    |
| `merge`         | D     | `limitConcurrent: number`                                                                                                                                                               | Concurrency plus input order                                          |
| `concat`        | D     | None                                                                                                                                                                                    | Input order on connections                                            |
| `forkJoin`      | D     | `observableInputsType: ObservableInputsType`                                                                                                                                            | Array/object selection; order/names on connections                    |
| `race`          | D     | None                                                                                                                                                                                    | Input order on connections                                            |
| `zip`           | D     | None                                                                                                                                                                                    | Input order on connections                                            |
| `buffer`        | D     | None                                                                                                                                                                                    | No property form; connected notifier                                  |
| `bufferCount`   | D     | `bufferSize: number`, `startBufferEvery: number`                                                                                                                                        | Size/start interval                                                   |
| `bufferTime`    | D     | `bufferTimeSpan: number`, `bufferCreationInterval?: number`, `maxBufferSize?: number`                                                                                                   | Time/creation/max size                                                |
| `bufferToggle`  | D     | `closingSelectorExpression: string`                                                                                                                                                     | Opening and closing references                                        |
| `bufferWhen`    | D     | `closingSelectorExpression: string`                                                                                                                                                     | Closing reference                                                     |
| `concatMap`     | D     | `projectExpression: string`                                                                                                                                                             | Connected project                                                     |
| `exhaustMap`    | D     | `projectExpression: string`                                                                                                                                                             | Connected project                                                     |
| `expand`        | D     | `concurrent?: number`, `projectExpression: string`                                                                                                                                      | Connected project/concurrency                                         |
| `mergeMap`      | D     | `concurrent?: number`, `projectExpression: string`                                                                                                                                      | Connected project/concurrency                                         |
| `map`           | D     | `projectExpression: string`                                                                                                                                                             | Raw-value project; adapter index caveat below                         |
| `filter`        | D     | `predicateExpression: string`                                                                                                                                                           | Current dispatcher has no property form; do not claim one in metadata |
| `subscriber`    | D     | None                                                                                                                                                                                    | Sink, no property form; not an RxJS creation/pipe factory             |
| `catchError`    | D     | `selectorExpression: string`                                                                                                                                                            | Connected recovery selector                                           |
| `result`        | I     | `hash: string`                                                                                                                                                                          | Transient result; excluded from saved documents                       |
| `connectPoint`  | I     | No operator property interface                                                                                                                                                          | Geometry/visibility belongs to ConnectPoint; not executable           |

Common source-element fields remain `id`, `type`, `name`, `x`, `y`, `visible`, `properties`.
Connection order/name live on `ConnectLine`, not inside the operator properties. Existing
`ElementType` IDs and existing defaults remain authoritative; metadata parity tests preserve them.

## Invocation inventory and compatibility boundaries

No callback is evaluated while reading a definition. Metadata contains authored source text only;
reading it grants no execution approval. Helpers below are lexical connected helpers, not a claim
that browser globals are restricted. The Worker is not a security sandbox. No `$context` or
`$params` binding is introduced here.

| Field / operators                                                    | Current arguments → return                              | Connected helper scope                                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `of.argsFactoryExpression`                                           | `()` → array of emissions or one scalar                 | None                                                                                 |
| `from.inputCallbackExpression`                                       | `()` → ObservableInput                                  | None; used only with event mode disabled                                             |
| `from.observableFactory`, `defer.observableFactory`                  | `()` → connected observable                             | `createObservable(overrideProps?)`                                                   |
| `iif.conditionExpression`                                            | `()` → boolean                                          | None                                                                                 |
| `iif.trueCallbackExpression`, `falseCallbackExpression`              | `()` → connected observable                             | Each receives its own branch's `createObservable`                                    |
| `generate.initialState`                                              | Expression → initial state                              | None                                                                                 |
| `generate.condition`, `iterate`, `resultSelector`                    | `(state)` → boolean / next state / result               | None; condition optional                                                             |
| `throwError.errorOrErrorFactory`                                     | Expression → error/factory accepted by installed RxJS   | None                                                                                 |
| `map.projectExpression`, `filter.predicateExpression`                | `(rawValue, index)` → result / truthy predicate         | None; **index always 0** in current per-value adapter                                |
| `bufferToggle.closingSelectorExpression`                             | `(openingRawValue)` → closing observable                | Closing reference's `createObservable`                                               |
| `bufferWhen.closingSelectorExpression`                               | `()` → closing observable                               | Closing reference's `createObservable`                                               |
| `concatMap`, `mergeMap`, `exhaustMap`, `expand`: `projectExpression` | `(rawValue, index)` → inner observable                  | Connected reference's `createObservable`; index follows that installed RxJS operator |
| `catchError.selectorExpression`                                      | `(rawError, caughtRawObservable)` → recovery observable | Recovery reference's `createObservable`                                              |

`mapOutputToFlowValue` currently feeds one raw value to a fresh single-value observable for each
input. Thus map/filter index resets to zero, while `FlowValue.copy` preserves identity. Metadata
must describe this adapter rather than promise a stream-wide index. Regression tests preserve it;
#134 owns any deliberate invocation-contract change.

`from.enableObservableEvent` defaults to true. In that mode only the connected factory is active
and the event descriptor allows one reference; false uses the input callback with no event port.
Do not evaluate the inactive field to inventory or validate it.

Timer uses `dueDateType = 0` for milliseconds or `1` for a timestamp interpreted as a `Date`.
`startDue` stays numeric in either mode; `intervalDuration = -1` is the existing one-shot default.
Do not replace it with a new null/string/parameter envelope. Merge passes a concurrency limit only
when `limitConcurrent > 0`; zero and negative values leave concurrency unbounded.

## Registering the next operator

1. Inventory its current interface, defaults, descriptor, factory invocation, form, drawer and theme.
   Read the engine implementation: callback names alone do not prove argument semantics.
2. Add a concrete definition with the existing type/field names and defaults. Extend property kinds
   only for the actual migrated field; do not implement speculative compiler/parameter APIs.
3. Route its template helper through the definition. Keep default text and object shape unchanged.
   Keep engine registration/functions inside simulator-engine and React/forms/drawers/themes inside
   simulator-viewer; the model imports neither package nor browser/RxJS/React runtime APIs.
4. Connect the definition to its existing engine registration and form labels. Keep special dynamic
   descriptors (From), read-only rules, theme overrides and selection/clipboard behavior unchanged.
   Model metadata must not contain React components or execution functions.
5. Add field/default/port parity and execution behavior tests. Verify all executable types still have
   exactly one factory registration. Existing form-dispatch and persistence fixtures must pass.
   Include a source example and explicit export limitation rather than claiming #136 is implemented.
6. Remove the old registration source only after parity. Update the inventory status and plan.
   Unknown/new types must fail the completeness tests; required metadata lookups must fail clearly.

## Source modes and optional fields

From's `ports` describes its default connected mode. Use `resolvePorts(properties)` for the
current mode; this is the same built-in resolver used by the editor's descriptors. `referencePorts`
lists candidates, so consumers must intersect it with the resolved descriptor. `activeWhen`
identifies the selected callback without evaluating authored code. Only the connected factory
receives `createObservable`; input mode wraps emitted raw items while connected mode preserves
reference FlowValues. Its input callback runs at factory invocation; its connected factory runs
on subscription, although the callback-producing expression is still evaluated at factory
invocation. These current timing rules are not the future #134 invocation contract.

Timer's numeric property metadata includes the existing mode choices. `startDue` stays a number,
and the date picker still uses its existing `Due date` label; no Date object is persisted. Numeric
Range `count` has `optional: true`: omitting it preserves RxJS `range(start)` semantics, while an
explicit zero completes without values. No metadata discovery evaluates callback strings. The
built-in port resolver remains module code, not data added to saved diagrams or Worker messages.

## Conditional and deferred factories

IIf has two required event references: top is the true branch, bottom is the false branch.
Reference array order does not select the branch. Its condition receives no positional arguments
or connected helper; each branch factory receives no positional arguments and only its own
`createObservable(overrides?)` binding. Defer requires exactly one event reference and binds its
factory to that reference. Both preserve referenced FlowValues and forward explicit helper overrides.

The callback-producing expressions run at source factory invocation, including both IIf branches.
The returned condition runs on every subscription; only the selected returned branch function is
invoked. Defer's returned factory also runs on every subscription. Existing override inconsistencies
are preserved: IIf reads the stored condition but applies branch-field overrides; Defer ignores
all top-level overrides. These compatibility facts are tested, not corrected in this metadata slice.
Issue #134 owns any change to evaluation timing or override semantics. Metadata discovery never
executes these authored expressions, and no context bindings, parser or serializer is added here.

## Higher-order project compatibility

`concatMap`, `exhaustMap`, `expand` and `mergeMap` now consume definition metadata for
saved defaults, engine registration keys and form labels. Each requires one event reference;
the normal input is value flow, not a helper reference. Project receives the raw value and
running projection index, reset for each subscription. The callback-producing expression is
evaluated per projection. `createObservable(overrides?)` forwards overrides and a fresh child
subscription ID to that reference; subscription dependencies identify the projected FlowValue.
Inner FlowValues retain their identity. Expand emits source and recursive values.

ConcatMap queues; ExhaustMap ignores inputs while an inner is active (without advancing its
project index). MergeMap and Expand retain an omitted `concurrent` in their templates. Both
pass the saved value unchanged to RxJS: MergeMap with zero/negative concurrency queues forever
until cancellation; Expand normalizes values below one to unbounded. No new normalization or
invocation policy is introduced. Behavior coverage lives in
`higherOrderOperatorMetadata.test.ts` and `transformationOperatorFactory.test.ts`; the browser
journey covers forms, saved callbacks, reference execution and Worker completion.

## Empty, Generate and ThrowError compatibility

Empty, Generate and ThrowError consume definition metadata for defaults and engine registration
keys; Generate and ThrowError retain their existing form labels. Empty has no properties/form and
completes without output. The definition contract can explicitly mark stored string fields as
`expression` metadata, with an optional callback signature when the evaluated value may be a factory.
Existing callback, numeric, boolean and choice fields keep their previous typed shapes.
For example, `OperatorDefinition<GenerateElementProperties, 'initialState'>` explicitly marks the
expression key; the second type argument accepts only declared string properties and defaults to
none for existing definitions.

Generate initialState is an expression, not a callback. At source factory invocation, overrides are
merged and all active expressions are evaluated without connected helpers. Subscriptions then call
condition, iterate and resultSelector with one state argument and no index. Omitted/empty condition
strings omit the condition, so callers must cancel unbounded generation. Evaluated initial objects
and callback closures are reused across subscriptions to that observable; no cloning is added.
Expression-construction errors escape invocation, while subscribed callback errors remain RxJS
errors at this factory boundary. Emitted results receive fresh FlowValues and the supplied ID.

ThrowError accepts an expression yielding either an error value or a factory. Direct values are
reused across subscriptions; factories receive no arguments and run per subscription. Returned or
thrown errors are wrapped in fresh error FlowValues with the element and supplied subscription IDs.
Expression-construction failures occur before that wrapping. No stored shape or execution policy
changes are introduced. `generationOperatorMetadata.test.ts` covers defaults, overrides, closure/
object reuse, optional conditions with bounded cancellation, error timing and identity. Browser
journeys cover Empty/Generate and both ThrowError forms with connected recovery and persistence.

## Buffer compatibility

Buffer, BufferCount, BufferTime, BufferToggle and BufferWhen consume definition metadata for
saved defaults, engine registration keys and existing form labels. Buffer has no properties or
property form. BufferTime keeps its optional creation interval and maximum size absent from defaults;
the engine supplies the maximum only when truthy, so zero retains the uncapped behavior.

Buffer constructs its notifier and subscription event when the pipe factory is applied, before
subscription; the returned observable reuses that notifier and ID. BufferToggle constructs the
closing callback once at pipe application. Top means openings and bottom means closing reference,
regardless of reference-array order. Its callback receives only the raw opening value; the helper
can forward child overrides to the bottom reference. The opening and closing helpers share an
application-time ID, while closing trace events use separate IDs with opening-value dependencies.
This existing correlation mismatch stays explicit until #129/#134 changes the runtime.

BufferWhen rebuilds its callback expression on every buffer opening, receives no arguments, and
uses a fresh helper/subscription-event ID for each invocation. Avoid synchronous emitting closing
notifiers because they immediately reopen buffers. Buffer results contain raw arrays; dependency
IDs include buffered values, plus a notifier ID for Buffer closures. The other buffer adapters
currently record only buffered-value dependencies.

`bufferOperatorMetadata.test.ts` covers these boundaries, numeric defaults, max-size truthiness,
separate buffer creation intervals and reference requirements. Browser journeys cover each buffer,
its existing controls, saved properties and connected execution through the Worker.

## Combining operator compatibility

CombineLatest, Concat, ForkJoin, Race and Zip now consume definitions for defaults and engine
registration keys. CombineLatest/ForkJoin expose the existing string-valued array/object selection
as typed `choice` metadata. Their forms use its label and options; arbitrary callback strings remain
callbacks. This adds no runtime validation or saved-field normalization.

The engine assembles references in connection-index order before invoking these factories. Each
child factory is deferred until subscription, receives invocation overrides and a fresh child ID,
and emits a subscription event linked to the parent ID. CombineLatest/ForkJoin select the mode
from stored properties, even when forwarded child overrides contain a different mode. Named inputs
use connection names: duplicates retain the last reference, and integer-like keys retain JavaScript
property enumeration order. The model schema does not add duplicate-name rejection.

CombineLatest/ForkJoin/Zip return new FlowValues containing raw arrays/objects and input IDs as
dependencies. Concat/Race preserve their child FlowValues. Concat subscribes sequentially; a
synchronous Race winner can prevent later subscriptions. With no references, Race remains open
until cancellation; the other migrated joins complete without emitting. Existing graph validation
and connection cardinality remain unchanged.

`joinOperatorMetadata.test.ts` covers those boundaries alongside the existing factory tests.
`join-metadata.spec.ts` exercises all five operators, reversed connection indices, array/object
selection, edited names, Worker results, and persistence through reload.

## Filter and recovery compatibility

Filter and CatchError now consume definition metadata for defaults and engine registration keys;
the existing CatchError form consumes its unchanged Project label. Filter still has no property
form in the dispatcher. Its expression is constructed at pipe application, with the predicate
reused across values and subscriptions. The per-value adapter supplies raw values and index zero;
truthiness determines retention, and copied FlowValues preserve raw values and identity fields.

CatchError requires one recovery event reference even for successful inputs. Its selector expression
and helper subscription ID are created at pipe application and reused across recoveries and
subscriptions. On an error, the selector receives the error FlowValue's raw value and a caught
observable mapped to raw values. The subscription event uses the shared helper ID and error ID as
a dependency, even when the selector never invokes the helper. Helper overrides reach only the
recovery reference; original passthrough and recovery FlowValues retain their object identity.
Returning caught forwards its raw items without rewrapping; metadata does not promise a new retry
or invocation contract. These lifecycle/invocation boundaries remain #129/#134 work.

`filterRecoveryMetadata.test.ts` covers argument and construction timing, predicate truthiness,
identity fields, error dependencies, child overrides, shared IDs, caught raw values and failure
paths. The browser journeys cover saved no-form predicates, Filter errors, connected recovery
through the Worker, existing labels, child overrides and reload persistence.

## Ajax and Subscriber compatibility

Ajax stores literal URL and JSON body text, not authored JavaScript. Body parsing happens after
invocation overrides and before subscription; empty/omitted text supplies undefined, JSON primitives
are accepted, and malformed JSON fails before Ajax is called. Optional request fields remain absent
from the saved defaults. Method and response-type options preserve the existing form choices.

Headers/query parameters stay ordered pair arrays in persisted diagrams. Exact duplicate header
keys reduce with the last value winning. Duplicate query keys group into arrays in the adapter;
installed RxJS 7.8 passes that record through URLSearchParams, serializing arrays as comma-separated
values rather than repeated wire keys. The whole AjaxResponse becomes the FlowValue raw value,
including status and nested response. Each subscription produces fresh FlowValue identities; request
errors and cancellation retain existing behavior. No runtime behavior is changed here.

Subscriber is a propertyless terminal sink with one value input, no output/event port and no
creation/pipe factory. It retains its category, entry eligibility and no-form behavior. Its defaults
and drawer registration consume metadata without inventing an RxJS factory.

`ajaxOperatorMetadata.test.ts` covers overrides, parsing timing/primitives, literal URLs, optional
fields, pair reduction, response identity, lazy subscriptions, errors and cancellation. The browser
journey uses a same-origin mocked endpoint to verify the real Worker/XHR request, response projection
through Map to Subscriber, and pair-array persistence after reload, without external HTTP requests.

## Remaining #140 work

The initial field/default/signature/reference inventory is complete for all current operators.
These metadata slices do not complete the issue. Finish richer form/drawer/theme registration
integration after #134/#135 invocation/parameter rules and #129 lifecycle boundaries stabilize. Keep #140 open
through that integrated gate. No new operators, serializer, schema migration, or execution policy
is delivered here.

Validation uses model metadata/template/descriptor tests, all-current engine registration coverage,
Of scalar/array behavior, Map raw-value/index/identity, From inactive fields/helper scope, and
Range/Interval/Timer defaults, overrides and mode/sentinel regressions, and IIf/Defer branch
selection, helper scope, invocation timing and override compatibility, plus the existing factory,
form, persistence and browser journeys. Metadata adds only static records; no evaluation, discovery
scan, event retention, extra scheduler or heavyweight UI registration is introduced. Labels and
input callbacks remain unchanged, preserving accessible controls and keyboard behavior.

## Execution core integration (#134)

The exact positional signatures above remain unchanged. [Execution policy](EXECUTION_POLICY.md)
is the runtime binding/override matrix: callbacks receive lexical `$context` and frozen `$params`,
are evaluated per actual subscription, IIf selects using resolved overrides, Defer honors its own
factory override, and joins consume their own parameters without broadcasting to children. Metadata notes now describe these subscription boundaries. Final lifecycle correlation remains #129 and typed expressions remain #135.
