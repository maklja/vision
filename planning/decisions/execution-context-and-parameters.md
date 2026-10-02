# Execution context, parameters and RxJS export — Phase 3.3 decision

Status: proposed design, implementation handoff complete and ready for review. Merge is design
acceptance; no runtime feature is implemented. Phase 3.4 and the overall Phase 3 gate remain open.
Written 2026-10-02 against main `01e55a23e9ff9cc84a7689bed13323751e43ad41` (merged #133).
Resolves design handoff [#132](https://github.com/maklja/vision/issues/132) on merge.

## Disposition and canonical owners

Keep reusable examples with explicit inputs, bounded execution state and understandable generated
RxJS. Reject both old implementations, including implicit expression detection, competing hooks,
unversioned property renames and destructive callback generation. No commit is selected for reuse.
Sources: [#40](https://github.com/maklja/vision/pull/40) at
`1c24e51c33ad2ab5eb48d03d202fcfb4fc9d53ce` and
[#42](https://github.com/maklja/vision/pull/42) at
`254a902f5b780f6e0507093b3215b4f8dc1e9948`. Exact paths and immutable links remain in
[the complete inventory](../legacy-pr-triage.md). Both PRs are already closed as superseded.

The table governs C/P/G records after review; the original inventory remains historical evidence.
Examples below are specification fixtures, not executable tests or current behavior claims.

| Record | Decision and reason                                                                                        | Example / compatibility evidence                                         | Canonical implementation                                           |
| ------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| C01    | Keep run-shared coordination; replace factory-build/global mutable lifetime                                | E1 shared counter resets on restart; E3 isolates invocation data         | [#134](https://github.com/maklja/vision/issues/134), Phase 4.3     |
| C02    | Drop separate pre-source hook fields; existing Defer factories and explicit arguments cover initialization | E2 one factory call per actual subscription                              | #134 compatibility                                                 |
| C03    | Drop duplicate IIf hooks; only selected branch has effects                                                 | E2 both outcomes and unused branch                                       | #134 compatibility                                                 |
| C04    | Drop outer-value shared-mutation API; keep existing value/index callback and isolated overrides            | E3 queued/concurrent inner examples                                      | #134 compatibility                                                 |
| C05    | Keep explicit trust, diagnostics and cancellable Worker execution; Worker is not a sandbox                 | E4/E6 inert import and hung callback                                     | #134, Phase 4.3                                                    |
| P01    | Drop duplicate factory rewrite; keep validated explicit override contract                                  | E3/E5 precedence, join-local keys, no stored mutation                    | #134, with #135 model                                              |
| P02    | Drop old callback naming/wiring; preserve main's signatures and forms                                      | E2/E4 Defer/From/IIf/buffer/higher-order cases                           | #134 compatibility                                                 |
| P03    | Keep typed literal/expression modes; reject implicit string/path evaluation                                | E5 typed zero/date/path error and editor modes                           | [#135](https://github.com/maklja/vision/issues/135), Phase 4.1/4.3 |
| P04    | Keep versioned migration/recovery; drop unpublished prototype schema renames/enums                         | E7 current-release reload, future/corrupt version                        | #135, Phase 4.1                                                    |
| P05    | Drop duplicate property forms/read-only editor options already present                                     | Existing form tests; E5 preserves field wiring/selected element          | #135 regression; Phase 4.2 registration                            |
| P06    | Drop old Redux selectors/split paste APIs; current interaction coverage already exists                     | Existing editor/clipboard journeys; E7 first-click and paste regressions | Existing tests, #135 regression                                    |
| G01    | Keep one faithful readable graph export; neither prototype completes it                                    | E8 linear/join/inner behavior equivalence and blocked constructs         | [#136](https://github.com/maklja/vision/issues/136), Phase 6.3     |
| G02    | Defer optional explicit scaffold UX; drop automatic overwrite/clear on connection edits                    | E9 preview, cancel, accept, undo, reload                                 | [#137](https://github.com/maklja/vision/issues/137), Phase 6.2     |

## Execution state, initialization and bindings

Persist only an optional `contextSeed` finite JSON object, default `{}`, under the future versioned
diagram schema. Clone it once when a fresh run is admitted, before creating/subscribing graph
factories. The Worker owns mutable `$context`, shared by callbacks within that run. Two diagrams,
two simultaneous runs and restart never share object identity. Runtime mutations are not saved.
There is no executable initializer field, per-source pre-hook, or hidden module-global context.
Existing Defer callbacks can explicitly prepare state immediately before invoking their input.

Sharing within a run is deliberate: synchronous callbacks observe actual RxJS dispatch order.
Concurrent asynchronous branches may race logically; no cross-run determinism is promised.
Use immutable invocation inputs for independent inners instead of a shared scratch variable.
Each actual source subscription receives a newly cloned/deep-frozen `$params` snapshot of its
resolved properties. Each inner invocation has its own override snapshot. No reference to caller
or persisted objects escapes into it. Callback properties remain source strings in that snapshot.
Parameter expressions read `$context` and a snapshot of selected raw parameter definitions;
definitions are not recursively evaluated by lookup. Return values then replace definitions in the
final `$params` snapshot passed to callbacks. This avoids cyclic implicit parameter dependencies.
Calling `createObservable` builds a lazy input factory; resolution/evaluation occurs on subscription,
not graph traversal. Repeated cold subscriptions re-resolve definitions with fresh snapshots.

Only documented operator-specific arguments and the following injected bindings are supported.
No automatic RxJS namespace, DOM access helper or subscription-ID argument is added to authored
callbacks. JavaScript globals remain technically reachable in trusted JS; this is an API contract,
not a restriction mechanism. Invocation IDs belong to the internal event protocol.

| Callback family                            | Existing shape to preserve / available helper                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Of / From direct input                     | Zero-argument factory returning values / ObservableInput                                            |
| Defer / From connected mode                | Zero-argument factory with scoped `createObservable(overrides?)`                                    |
| IIf                                        | Zero-argument condition; zero-argument selected true/false callback, each with its connected helper |
| Map / Filter                               | Current raw-value and index signatures, retaining current per-notification index behavior           |
| ConcatMap / MergeMap / ExhaustMap / Expand | Current raw outer value/index and the connected input helper                                        |
| BufferWhen / BufferToggle                  | Current no-argument / raw opening-value selector and connected notifier helper                      |
| Generate / ThrowError / CatchError         | Existing operator-specific factory/iterate/predicate/error signatures                               |
| All authored callback fields               | Additional lexical `$context` and final `$params`; no renamed fields                                |

Phase 4.2 must enumerate the exact signature/return type for every registered field; the family
table is not permission to add index arguments where today's adapter omits them. Compiler wrappers
preserve those adapters. Expose helpers only to fields with matching connected ports. A callback
may invoke its helper repeatedly: each real subscription gets new params and subscription identity.

Initialization order: validate graph/schema/source syntax without execution; authorize the content
revision; create fresh run/Worker; clone context and invocation data; resolve/validate parameters;
evaluate callback-producing source in Worker; subscribe; invoke callbacks when RxJS requires.
Compile syntax before sources can run, but never invoke callback factories to preflight on host.
Neither the IIf unchosen branch nor a queued/cancelled inner may execute its callback prematurely.
Compiled artifacts are run-local and released on end/stop; no mutable compiled closure cache spans
runs. Cancellation prevents further dispatch; forced kill cannot guarantee authored cleanup effects.

## Overrides and typed parameter values

Precedence per field is operator template, saved definition, then an explicitly supplied direct
invocation override. An absent key inherits. `0`, `false` and `''` are explicit values, valid only
for their declared type/constraints. Explicit `undefined` is invalid; `null` is invalid unless the
schema permits it. Optional absence remains absence where RxJS defines a default (Range count).
Do not fill an intentionally omitted optional count from the template after merging saved data.
Unknown keys and `__proto__`/`constructor`/`prototype` keys are rejected before any merge.

Overrides are shallow per declared field; arrays/objects replace rather than recursively merge.
Clone JSON values so callbacks cannot mutate saved data. Runtime overrides use raw validated values
or existing callback source strings, not the persisted parameter envelope. They bypass the saved
expression for that field. Validate callback overrides against their signature just like saved
callbacks. An invalid override reports its target element/field and invoking element when known.

Joins consume only their own schema keys (e.g. concurrency/input mode). They do not broadcast an
untyped object to heterogeneous children. Configure children through saved definitions or explicit
connected-input invocation callbacks; no new ambiguous positional broadcast API. Nested callbacks
forward only overrides they explicitly supply. This is a deliberate correction of today's
inconsistent propagation; characterize it and document changes before release. IIf's condition
currently reads original properties, Defer ignores overrides, and merge does not forward them:
those implementation accidents are not the desired contract.

Future persisted `parameter-v1` representation (embedded in the Phase 4.1 diagram version):

```ts
type ParameterType = 'number' | 'boolean' | 'string' | 'date' | 'json';
type ParameterValue =
	| { kind: 'literal'; type: ParameterType; value: JsonValue }
	| { kind: 'expression'; type: ParameterType; source: string };
```

`JsonValue` means finite JSON only; schema validates literal value against `type`. A date is a
finite integral UTC epoch-millisecond number within JavaScript Date range, converted to `Date`
only at engine boundary. No function, undefined, BigInt, cyclic/class/DOM instance is persisted.
Expression source is a value expression, e.g. `$context.periodMs`, not a callback body or implicit
`{{path}}` string. Missing paths produce a typed diagnostic rather than a guessed default.
There is no coercion from numeric strings, no recursive interpolation and no variable picker API.
Callback strings retain their current separate signature-aware fields.

Evaluate expressions once per actual source subscription, after selecting overrides; require
the declared return type and field constraints. A wrong result fails the invocation before source
side effects. Context expressions are trusted authored JavaScript with the same limits as callbacks,
not a restricted expression language. Do not claim they are pure or a sandbox.

| First rollout field      | Validation / compatibility                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| Range start/count        | Finite integers; count nonnegative or absent (retain installed RxJS default); start may be negative |
| Interval period          | Finite number >= 0; preserve zero scheduling                                                        |
| Timer due (milliseconds) | Finite number >= 0; explicit existing due mode                                                      |
| Timer due (date)         | Epoch-ms date; past date retains RxJS immediate scheduling                                          |
| Timer interval           | Finite number >= 0 or existing `-1` one-shot sentinel; preserve defaults                            |

Other property types follow Phase 4.2 definitions incrementally, not blanket property conversion.
UI has a labeled literal/expression switch, typed editor, binding/signature help and field-associated
errors. Keep both editing drafts in transient editor state across mode switching; only active mode
is persisted. Switching elements never saves a draft into the wrong element. Empty source is invalid;
editing it does not silently fall back to a literal. Diagnostics disable Run until resolved.

## Trust, diagnostics, time and resource limits

Trusted local authored JS remains a supported capability, including documented Ajax/network access.
Opening/importing a file never evaluates code or starts requests. Imported or changed executable
content requires explicit trust for its content revision in this session; trust is never imported,
persisted, auto-restored or inherited by edited code. The same applies to network-bearing graphs.
Data-only import is validated without running callbacks. Preview/generation never executes code.
Show capability information and cancellation limits before the trust action.

A Worker protects UI responsiveness and permits termination, but shares origin/network capabilities.
It is not a security sandbox and cannot safely execute hostile code. Public sharing and automatic
execution of untrusted imports remain blocked pending a separate restricted-interpreter/capability
decision in Phase 6.4. Static syntax checking is not a security check.

When Worker is absent or cannot start, arbitrary callbacks, parameter expressions, context-based
execution and Ajax are blocked with a diagnostic; no silent unsafe fallback. Only graphs proven
literal-only from supported safe definitions may use main-thread fallback, with a visible limitation.
This deliberately narrows today's fallback and requires compatibility tests and documentation.

Host control heartbeat at 250 ms; default watchdog budget 5 seconds without responsive heartbeat,
configurable visibly from 1 to 60 seconds. Source silence is not unresponsiveness: an idle async
infinite source remains runnable while heartbeat responds. Browser background throttling can cause
a conservative timeout; expose the reason and configurable budget. Terminate unresponsive Worker;
report watchdog cancellation, reject old-run messages, release host resources. Do not synthesize
observed per-subscription teardown after kill (see [protocol](subscription-flow-events.md)).
Already dispatched network side effects cannot be undone; cooperative teardown is best effort.

Initial bounds: 64 KiB UTF-8 per authored source, 1 MiB UTF-8 JSON per contextSeed or invocation
snapshot, JSON depth 64; reject over-limit data before dispatch. Diagnostics retain at most 100
records/run with an omitted count, truncate displayed source/error text to 2 KiB and never log full
context/params automatically. These are implementation starting budgets, adjustable through a
documented measured change, not a proof against memory abuse in trusted callbacks.

Diagnostics carry category, runId, elementId, field, phase and subscriptionId/initiator where known.
Categories distinguish schema, graph/reference, compile syntax, callback shape/result, invocation
exception, transport and watchdog. Preflight failures do not invent subscriptions/observable errors.
An exception occurring within observable execution remains catchable via RxJS where appropriate;
add attribution without replacing it with an unrelated construction failure. Display errors with
keyboard focus/navigation and text, not color alone. Preserve public onNext/onError/onComplete/
onCreationError adapters; add diagnostics compatibly after #129 correlation is stable.

## Persistence and compatibility

Phase 4.1 is a hard dependency for saving new fields. Backup the current unversioned diagram before
migration, use current-release fixtures, and convert only registered numeric/date fields to literals.
Current callback text stays byte-for-byte. Seed defaults to `{}`. Do not persist runtime context,
params, compiled code, trust grants, subscriptions, result nodes, diagnostics or Worker handles.
Preserve IDs, connections, viewport and theme. Future/unknown versions, invalid required fields and
failed migrations remain recoverable; never overwrite the original or execute guessed content.
Use valid documented defaults for absent optional fields, not corrupt present fields.

Unpublished #40/#42-only renamed schemas are unsupported imports with recovery diagnostics; no
automatic heuristic migration. An explicit converter would require provenance and fixtures in a
separate issue. The stricter override/fallback/field rules are documented behavior changes, not
silent compatibility claims. Normal current-release literal diagrams and callbacks retain behavior
unless a specified validation rule rejects them, in which case explain the field and remedy.

## Readable export and optional scaffolds

G01 generates plain JavaScript ESM for the installed supported RxJS target from a selected entry.
Imports are sorted; stable IDs produce collision-free valid identifiers, labels are comments.
Preserve semantically ordered inputs and named join keys; do not sort connections merely for
pretty output. Exclude unreachable editor nodes and transient results. Use lazy source factories
to preserve cold subscription count, per-run context, invocation overrides, Defer/IIf and inners.
Never add sharing, eager evaluation or subscription reuse to simplify the export.

Phase 4.2 owns a support/serializer matrix for every current operator. Linear, array/named joins
and higher-order constructs need tested serializers; unsupported operators/cycles/custom helper
manipulation/callback AST patterns block full export with element/field diagnostics. Expand recursion
is allowed only with a tested lazy representation; no traversal that loops forever. Parsing authored
callbacks for rewrite is allowed; evaluating them to discover references is forbidden.
Partial preview is clearly labeled incomplete and cannot be copied/downloaded as a complete export.
Preserve authored semantics and explain network capabilities. Faithfulness is values/errors/
completion/cancellation and source side-effect counts, not simulator trace/animation replay.

Explicit preview, Copy and Download .js actions do not run code or modify the diagram. Report
clipboard failures accessibly. Bound graph traversal/output and provide cancellation for large
graphs. Export implementation #136 defines measured performance limits with its fixture baseline.

G02 is optional editing UX, separately deferred to #137. Connect/reconnect/disconnect/delete never
overwrites or clears user code. Missing references become diagnostics. An explicit scaffold action
shows preview/diff and requires Apply/Replace; cancel preserves exact text. Acceptance is one
undoable transaction, reload persists accepted text, and multi-input scopes/signatures come from
definitions. No generation-on-connect, hidden cleanup or automatic replacement of authored code.

## Specification examples and required verification

| Example | Graph / action                                                                                          | Expected behavior / fixture assertions                                                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E1      | Seed `{ seen: 0 }`; Of → Map increments `$context.seen`; run twice                                      | Callbacks in one run coordinate; each fresh run begins at zero; saved seed unchanged; simultaneous runs isolated                                                                     |
| E2      | Defer factory; IIf true/false; repeated cold input                                                      | Initialization in existing callback occurs once per actual subscription; unused branch never invokes; no new hook API                                                                |
| E3      | Of(1,2) → concatMap/mergeMap → Range; callback calls `createObservable({ start: value + 1, count: 1 })` | Values 2/3; queued inners resolve when subscribed; concurrent snapshots independent; no context scratch mutation; joins consume their own keys; explicit nested forwarding           |
| E4      | Invalid callback syntax, callback returns number instead of ObservableInput, inner callback throws      | Syntax preflight has no source effects; shape/result failures identify field; runtime error can be caught; missing references are separate diagnostics                               |
| E5      | Interval literal 0, expression `$context.periodMs`; Timer epoch date; invalid path/string/NaN           | Typed results, no coercion; invalid result blocks invocation; absent inherits, undefined/null rejected; switch retains drafts; no stored mutation; repeated subscription reevaluates |
| E6      | Import code/network graph; Worker unavailable; `while(true){}`; silent async interval; stop/restart     | Import inert; explicit trust; unsafe fallback blocked; watchdog kills hang, async heartbeat remains live; no guaranteed teardown after kill; stale events ignored                    |
| E7      | Current-release diagram migration/reload; corrupt/future/prototype file; edit then paste                | Backup/roundtrip of literals and callbacks; original recovery on failure; no guessed execution; ports/paste/drop-first-click/viewport/theme preserved                                |
| E8      | Linear, named/array join, lazy IIf and higher-order graph export; unknown node/cycle                    | Deterministic valid ESM; trusted fixture execution matches graph values/error/complete/cancel and side-effect counts under injected time; unsupported full export blocked            |
| E9      | Connect/disconnect one of several references; scaffold preview/cancel/apply; export copy failure        | Authored text survives edits/cancel; accepted scaffold undo/reload exact; missing-input diagnostic; keyboard focus and visible copy failure                                          |

Required test bases: [creation](../../packages/simulator-engine/src/factory/creationOperatorFactory.test.ts),
[joins](../../packages/simulator-engine/src/factory/joinCreationOperatorFactory.test.ts),
[transformations](../../packages/simulator-engine/src/factory/transformationOperatorFactory.test.ts),
[Worker launcher](../../packages/simulator-engine/src/startObservableSimulation.test.ts),
[serialization](../../packages/simulator-model/src/element/serialization.test.ts),
[persistence](../../packages/simulator-viewer/src/persistence/diagramPersistence.test.ts),
[property forms](../../packages/simulator-viewer/src/ui/properties/ElementPropertiesForm.test.tsx),
[clipboard](../../e2e/clipboard-group.spec.ts), [reload](../../e2e/persistence-viewport.spec.ts),
[restart](../../e2e/infinite-source.spec.ts). Add focused fixtures; preserve existing thresholds.
Implementation issues specify normal format/lint/typecheck/test/build and relevant three-browser
journeys. Documentation-only validation here is formatting plus source/record/link traceability.

## Dependency handoff and acceptance

| Issue | Destination / blockers                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| #134  | Phase 4.3 compiler/trust core; Phase 4.1 for persistence/import policy, 4.2 for full field registration, #129 for subscription correlation |
| #135  | Phase 4.1 schema/migration then model/editor; #134 for evaluation, 4.2 definitions; do not enable expressions before these contracts pass  |
| #136  | Phase 6.3 after 4.1/4.2, #134/#135 and #129/#130; G01 full export only                                                                     |
| #137  | Optional Phase 6.2 after 4.1/4.2 and #134/#135; G02 scaffold only, no Phase 4 blocker                                                      |

No circular prerequisite: #134 establishes evaluator/trust semantics; #135 consumes them when
integrating expressions. Schema/metadata design can proceed independently, release integration
requires all named gates. Phase 3.4 must review this handoff with the accepted subscription decision,
verify all source closures/history and order the Phase 4 backlog. Merge accepts this design;
implementation issues remain open until their runtime/model/UX features and tests are delivered.
