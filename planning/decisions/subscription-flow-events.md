# Subscription and flow events — Phase 3.2 decision

Status: proposed design, ready for review; no runtime change. Review/merge of this design is the
acceptance point. Phase 3.3/3.4 and the overall Phase 3 gate remain open. Written on 2026-10-01
against `main` `2af7ec09d2bec5b491eb8a110dcbbde653642cb3` (merged inventory PR #128).

## Decision and source disposition

Keep the ability to explain when a real RxJS subscription starts, emits, ends and is torn down.
Reimplement on current main. Reject all of #50's implementation: its unwired Subscribe drawer,
parallel `branchId`, disabled arrays, experimental scheduler and worker envelope add no reusable
implementation value. Duplicate stop/reset and mechanical drawer/theme edits are dropped.

Source: [#50](https://github.com/maklja/vision/pull/50), head
`f74b2faf9f911ba6e34e24daaef18d7d5d3a342c`; exact paths and immutable source links are in
[the inventory](../legacy-pr-triage.md). Source PR closure is administrative cleanup under the
user's instruction, independent of approval of the new design. Preserve the reference history.
#40/#42 are also superseded implementations; their remaining C/P/G decisions belong to
[Phase 3.3 handoff #132](https://github.com/maklja/vision/issues/132), not this decision.

| Record | Decision                                                               | User benefit / expected example                                          | Implementation destination                                                                               |
| ------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| S01    | Keep lifecycle; drop prototype event/drawer                            | EMPTY completes without a value; cancelled inner has no complete (T1/T3) | [#129](https://github.com/maklja/vision/issues/129), [#130](https://github.com/maklja/vision/issues/130) |
| S02    | Keep correlation; drop parallel branch IDs                             | Join records both inputs; repeated source invocations differ (T2/T3)     | #129                                                                                                     |
| S03    | Keep ordering/presentation spacing; drop wall-clock/parallel scheduler | Equal-time same-line burst separates; another line continues (T8/U3)     | [#131](https://github.com/maklja/vision/issues/131), #130                                                |
| S04    | Keep failure separation; drop graph-snapshot callback and old envelope | Runtime error has subscription; construction failure does not (T4/T5)    | #129                                                                                                     |
| S05    | Keep derived line styling; drop persisted type                         | Dashed reference plus text legend survives old-diagram reload (U1)       | #130                                                                                                     |
| S06    | Keep enforced lock; drop disabled arrays                               | Edits rejected through execution and animation drain (U2)                | #130                                                                                                     |
| S07    | Drop duplicate reset implementation; preserve compatibility            | Stop/reset clears work and restart rejects old-run events (T6/U4)        | #129/#130 regression criteria                                                                            |
| S08    | Keep bounded retention/omission; drop unbounded queues                 | Saturation shows omitted count and cannot deadlock child events (T8)     | #131                                                                                                     |

No old commit is selected for cherry-pick. No new operators, context/parameter API, saved Subscribe
nodes, full timeline UI, graph snapshot callback, or public sharing feature is in scope.

## Protocol v1 semantics

The following is a future contract, not today's `FlowValueEvent` interface. Instrument actual
subscriptions at graph source/reference boundaries, not every internal RxJS implementation
subscriber. Track one occurrence per invocation/subscription, even if it uses the same source node.
Keep operator internals out of the public trace unless mapped explicitly to a graph boundary.

| Field                           | Meaning                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `version`                       | Literal `1`; reject unsupported versions with a transport diagnostic              |
| `runId`                         | Fresh identity allocated by host before starting Worker or fallback; never reused |
| `seq`                           | Strictly increasing integer assigned by engine for every record in a run          |
| `timeMs`                        | Nondecreasing elapsed time from injected monotonic run clock, not wall-clock      |
| `eventId`                       | Unique record identity, including separate records for the same flowing value     |
| `subscriptionId`                | Actual subscription occurrence; absent for run/control diagnostics                |
| `parentSubscriptionId`          | Invoking subscription for referenced/inner subscriptions; null for root           |
| `elementId` / `referenceLineId` | Graph boundary and optional reference edge creating the occurrence                |
| `valueId`                       | Logical notification lineage for next/error; absent for lifecycle/control records |
| `dependencies`                  | Deduplicated predecessor value IDs, not arbitrary branch IDs                      |
| `path`                          | Ordered connection IDs traversed by this record; empty on node/control records    |
| `kind` / `reason`               | Tagged lifecycle/control kind; cancellation/teardown cause where observed         |

A branch is a graph route (`path` and reference edge) within a subscription occurrence. It needs no
second globally ambiguous `branchId`. Multiple root executions get different run IDs. Multiple
cold subscriptions to the same node get different subscription IDs. `parentSubscriptionId` records
invocation ownership; dependency edges record data causality and must not be conflated with it.

`next` preserves a logical value ID across identity-preserving `FlowValue.copy` transformations
and routes; each emitted trace record still has a fresh event ID. A new aggregate or generated value
has a fresh value ID with all contributing input IDs deduplicated (buffer, combineLatest, joins).
Filtered values produce no downstream next; this does not terminate their subscription. Errors
receive a fresh value ID, retain subscription and failing element, and reference triggering values
when known. Recovery values are new lineage; they do not masquerade as the original error.
Path assembly must distinguish occurrences and routes, not rely on a global value-ID map alone.

| Kind          | Rule                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `subscribe`   | Once before source side effects or any synchronous notification; parent exists first                                                                         |
| `next`        | Zero or more while open; no next after terminal notification or cancellation                                                                                 |
| `complete`    | At most once; natural notification, including EMPTY; never fabricated on cancellation                                                                        |
| `error`       | At most once; mutually exclusive with complete; observable failure, possibly caught upstream                                                                 |
| `unsubscribe` | Exactly once for observed teardown, after terminal notification if any; reason `complete`, `error`, `run-stop`, `operator-cancel`, or `consumer-unsubscribe` |
| `run-ended`   | Once after root termination and cleanup, reason completed/error/cancelled; does not mean animations drained                                                  |
| `diagnostic`  | Construction, transport, protocol or resource-limit failure; no fake observable error                                                                        |

Unsubscription is a lifecycle observation, not an RxJS notification. Operator cancellation records
`operator-cancel` plus known cancelling element (race loser, higher-order switch, take bound).
If the precise operator cause cannot be observed, use `consumer-unsubscribe`; never guess it.
Caught error terminates only that subscription; recovery continues under the enclosing subscription.
Record terminal before teardown even if RxJS synchronously unwinds; teardown hooks must be
idempotent. Root run end follows all observed teardowns. Release active records when no retained
trace references them. For a forced Worker kill, only host-observed run cancellation is guaranteed;
missing per-subscription teardown is explicitly marked unconfirmed, not synthesized as observed.

Sequence is the authoritative order; equal timestamps are allowed. Identical fixtures with an
injected clock and deterministic scheduler must have identical normalized traces. Real asynchronous
branches follow their actual dispatch order; do not promise cross-run determinism for network or
wall-clock races. Production clock is run-relative monotonic time. Virtual time is a test facility,
not a replacement execution engine. Presentation duration never delays RxJS execution.

## Expected trace fixtures

These are specification fixtures, not executable tests or claims of current behavior. Symbols are
normalized IDs; implementation tests must also assert full envelope, seq, times and paths. Each
arrow is a record in increasing seq; time is equal unless an explicit tick is shown. `N(s,v)` means
next on subscription s with value ID v; `S/C/E/U` mean subscribe/complete/error/unsubscribe.
`U(s,cause)` is an observed teardown; `R(cause)` is run-ended. Routes not shown below must be
asserted from the fixture graph. In nested fixtures parent subscribe precedes child subscribe.

### T1: synchronous linear source and EMPTY

Graph: `of(1) → map(x + 1) → subscriber`. Root `s0`: `S(s0) → N(s0,v1,1) →
N(s0,v1,2) → C(s0) → U(s0,complete) → R(completed)`. Both next records retain v1,
but have different event IDs and their corresponding paths. Only the subscriber record becomes a
subscriber result. `EMPTY → subscriber`: `S(s0) → C(s0) → U(s0,complete) → R(completed)`;
there is no next. Complete and unsubscribe labels are distinct.

### T2: branch/join, concat, merge and race

Graph: `combineLatest(A,B) → subscriber`, A/B are cold sources each emitting once at ticks 10/20.
`S(s0) → S(a,parent=s0) → S(b,parent=s0) → N(a,va) → C(a) → U(a,complete) →
N(b,vb) → N(s0,vjoin,deps=[va,vb]) → C(b) → U(b,complete) → C(s0) →
U(s0,complete) → R(completed)`. The join record has new lineage and both dependencies.

`concat(A,B)` starts B only after A's terminal/unwind, never while A is open. Both children have
parent s0. `merge(A,B)` can keep a/b open simultaneously; ending a does not end s0 while b is open.
For a timed `race(A,B)` with A winning after both subscriptions exist, b records
`U(b,operator-cancel)` without C(b); s0 completes when the winning input completes. A synchronous
winner may prevent B from being subscribed at all: do not invent S(b) or U(b). Test both forms.

### T3: cancellation of an inner subscription

Fixture: timed outer values A/B, higher-order callback cancels pending inner A when B arrives.
`S(s0) → N(s0,va,A) → S(a,parent=s0) → N(s0,vb,B) → U(a,operator-cancel) →
S(b,parent=s0) → N(b,vb1) → C(b) → U(b,complete) → C(s0) → U(s0,complete) → R(completed)`.
No C(a). The second root next precedes new inner creation and cancellation as defined by the
fixture; cancellation precedes S(b). This is a protocol cancellation fixture, not a promise to add
switchMap now. Also test existing `take(1)` against an infinite referenced input and concurrent
mergeMap inners: each occurrence has independent identity and active accounting.

### T4: observable failure and recovery

Uncaught: `S(s0) → N(s0,v1) → E(s0,e1,deps=[v1]) → U(s0,error) → R(error)`.
Root error is shown once and never followed by complete. Caught error fixture has failing child a:
`S(s0) → S(a) → E(a,e1) → U(a,error) → S(recovery,parent=s0) → N(recovery,vr) →
N(s0,vr) → C(recovery) → U(recovery,complete) → C(s0) → U(s0,complete) → R(completed)`.
The recoverable error appears in the trace but does not call the legacy fatal onError callback.

### T5: construction or transport failure

Invalid graph: `diagnostic(construction,elementId) → R(error)`; no subscription was started.
A Worker crash after S(s0) produces a host transport diagnostic and host run end with error;
no E(s0) or C(s0) is invented. Mark active subscriptions teardown-unconfirmed. A known creation
failure followed by a Worker error event must not be displayed or notified twice.

### T6: infinite source, stop and restart

Run r1: `S(s0) → [tick 10] N(s0,v1) → [tick 20] N(s0,v2)`. A responsive engine receives stop,
records `U(s0,run-stop) → R(cancelled)` and acknowledges. Host invalidates r1 for value callbacks
immediately on stop; teardown/control acknowledgement may be processed for cleanup only. Host
waits at most 100 ms for acknowledgement then terminates, allowing UI reset immediately. If no
acknowledgement, host reports cancelled with teardown-unconfirmed, not a fabricated U(s0).

Run r2 has fresh run/subscription IDs and seq starting at 1: `S(s1) → N(s1,v3) ...`.
A queued r1 notification after restart is ignored. Stop is idempotent. Main-thread fallback cannot
interrupt synchronous infinite authored code: this limit must remain explicit; forced-stop parity
is not promised in that case.

### T7: selected references and independent subscriptions

IIf fixture subscribes only its selected input: `S(s0) → S(chosen,parent=s0) ...`; unselected input
has no subscription or side effects. Two invocations of the same cold node create a/b with distinct
subscription IDs even when value/path contents coincide. Neither child completion unlocks the
editor or releases the other's animation gate. Aggregation deduplicates shared dependencies.

### T8: burst, retention and missing dependencies

At t=0, a emits 20 values across the same line while b emits on an independent line. seq orders all
records; a's retained movement records are FIFO and visually spaced, b can progress independently.
Keep at most 16 pending groups; when shedding occurs show a bounded summary with omitted count,
seq range and reason. Subscriber results are still independently capped at 100. A later error/run
end must be applied even when no animation group can be admitted. A child whose dependency was
omitted receives an explicit omission resolution, never waits forever or appears as if that
predecessor completed visually. Reset removes summaries and all queued/active work.

## Viewer and state decisions

| Example                           | Required behavior                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1: old diagram / reference input | Derive line kind from graph reference classification, not a new saved field. Value pipes solid, references dashed; text legend says “value flow” / “observable reference”. Selected/disabled styles remain distinguishable. Lifecycle text at node and accessible DOM status/log complement canvas markers.                                                          |
| U2: run and drain                 | Reject add/drop/move/resize/delete/connect, property edits, paste/duplicate, undo/redo, import/load and entry change from run start through run-ended plus animation drain. Guard store commands and UI/keyboard paths. Inspection/selection/copy, pan/zoom, theme and stop/reset stay available; graph mutation cannot be hidden behind a theme-only disabled flag. |
| U3: timing and reduced motion     | Space retained same-line movement using configurable presentation duration; reserve shared lines in seq order and allow independent lines concurrently. Reduced motion uses labels/status in seq order without moving tokens; root/lifecycle accounting is identical. Explain that animation time differs from observable time.                                      |
| U4: stop/reset/errors             | Stop/reset clears transient markers, queued/active animations and obsolete generation callbacks; reset unlocks immediately. Normal completion unlocks only after drain; error enters drain or explicit reset, never remains permanently locked. Restart starts fresh.                                                                                                |

Viewer already has the graph before start: no onCreation graph snapshot is necessary. Compilation
and readiness are internal sequencing; attach the event observer before subscribing any source to
avoid losing synchronous notifications. Run completion and presentation completion must be separate
flags; any non-next record must not imply whole-run completion. Locks and traces are transient and
must not enter IndexedDB, exports or undo history. No persisted diagram migration is needed for
this derived styling design; future parameter/schema changes remain Phase 4.1/3.3 work.

## Retention and independent scheduler gap

[FlowManager](../../packages/simulator-engine/src/context/FlowManager.ts) currently couples value
identity, subscription ancestry and animation grouping. [DefaultFlowManager](../../packages/simulator-engine/src/factory/DefaultFlowManager.ts)
has `ReplaySubject(10_000)` and value-keyed path fragments; [ObservableSimulation](../../packages/simulator-engine/src/ObservableSimulation.ts)
subscribes to the source before its trace observer. Existing viewer limits
[16 pending groups / 100 results](../../packages/simulator-viewer/src/store/simulation/simulationSlice.ts)
do not bound bytes per event or engine bookkeeping. [Animation gating](../../packages/simulator-viewer/src/store/drawerAnimations/drawerAnimationsSlice.ts)
treats queue absence as satisfied and provides no visible omission. These are independent gaps
justifying #131; keep and extend one scheduler instead of #50's parallel queues.

Initial display budgets: retain the existing 16 pending groups and 100 results; optional text trace
holds at most 1,000 records and 1 MiB estimated UTF-8 data, whichever is reached first. Display
payloads are at most 4 KiB each and path/dependency displays at most 128 IDs each, with explicit
omitted counts. These are proposed implementation constants, not measured total heap guarantees.
Do not truncate execution values or correctness-critical identity/dependencies to meet display
budgets. Metadata needed by retained records is reference-counted/released, not kept as unbounded
completed-subscription/tombstone maps. Active bookkeeping and transport require finite resource
budgets measured in #131; overflow aborts the run with a resource-limit diagnostic rather than
silently damaging causality. Final measured transport/active-map limits block #131 completion.

Apply lifecycle accounting before visual admission. Reserve control/terminal status outside the
animation budget; evict optional history/animation records with visible counts. Summaries are
bounded counters/ranges, not an array of every skipped event. Resolve omitted dependency gates
explicitly and remove subscriptions/path fragments no retained event needs. Host and Worker must
use bounded batching/backpressure with loss disclosure or abort, not unbounded postMessage queues.
Exercise synchronous bursts larger than the old replay limit and large payload/path fixtures.

## Compatibility, failure boundary and implementation order

[Launcher](../../packages/simulator-engine/src/startObservableSimulation.ts) and
[Worker](../../packages/simulator-engine/src/observableSimulationWorker.ts) currently exchange
Next/Error/Complete/CreationError envelopes. Keep existing onNext/onError/onComplete/onCreationError
signatures through an explicit adapter; introduce an opt-in versioned trace callback. Legacy
onNext still receives its existing value/subscription trace representation (including existing
Subscribe behavior); new complete/unsubscribe/control records do not become legacy onNext calls.
Legacy onComplete means successful root execution completion, not every child or teardown.
Fatal observable error invokes onError once; construction error preserves onCreationError;
transport failures need a distinct optional diagnostic callback and visible status.

Use structured-cloneable string/number/array records with bounded serialized diagnostics, never
raw Error/functions/Worker handles. Reject malformed/version-mismatched messages. Give each run
its own generation guard and detach listeners on termination. Worker/fallback normalized traces
agree for controllable fixtures; neither Worker nor fallback is a security sandbox. This design
adds no network capability or trust policy; authored/imported-code policy stays in Phase 3.3.

1. Review this decision and #129–#131; coordinate graph instrumentation with Phase 4.2 and invocation
   contracts with Phase 4.3. #132 is the separate context/parameter/export design handoff.
2. Implement #129 protocol/engine with clock fixtures and legacy adapter from current main.
3. Implement #131 scheduler/retention and #130 viewer/state in dependency order; both depend on #129
   and must land before lifecycle visualization is considered complete.
4. Run relevant engine/store/Worker tests, typecheck/lint/build and browser branch/join, error,
   infinite restart, persistence and reduced-motion journeys. Document measured budgets and limits.
5. Phase 3.4 reconciles accepted records and closure evidence; closing prototypes alone does not
   complete the Phase 3 gate. Phase 6.3 timeline/code export and Phase 7 profiling remain separate.

Design validation: normalized T1–T8 cover all retained S rows; U1–U4 cover accessible styling,
mutation policy and timing; issue links specify compatibility, test and dependency criteria. This
triage PR requires formatting and source/link checks, not a new implementation-mirroring test.
