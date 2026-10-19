# Subscription and flow-event protocol v1

Issue #129 implements the engine/transport portion of the accepted
[subscription design](planning/decisions/subscription-flow-events.md). Use the optional `onTrace`
callback on `startObservableSimulation` to receive `FlowTraceEvent` records. Direct engine tests can
pass `{ onTrace, clock }` as the fifth `ObservableSimulation` constructor argument. Traces are
transient; they are never stored in diagram JSON, IndexedDB or editor history.

## Identity and ordering

Every record carries `version: 1`, a fresh `runId`, contiguous `seq` starting at 1, nondecreasing
run-relative `timeMs`, unique `eventId`, ordered connection `path`, and deduplicated predecessor
value IDs in `dependencies`. Equal timestamps are valid; sequence defines dispatch order. The
production clock uses `performance.now`; deterministic tests inject a clock independently of RxJS
scheduling. Animation never changes observable timing.

The engine allocates record IDs as `<runId>:event:<seq>` and occurrence IDs as
`<runId>:subscription:<ordinal>`. These identities are separate from logical `valueId` and legacy
animation IDs. `FlowValue.copy` preserves value identity; aggregate values receive a fresh ID and
all contributing input IDs. Routes are keyed by occurrence and value, so repeated subscriptions to
the same cold node cannot share partial paths. Completed occurrence state is released after teardown.

A traced occurrence is an actual subscription to a graph branch: one root and one per subscription
to a connected reference. A helper returning an observable does not itself create an occurrence.
Repeated subscriptions to that observable do. `parentSubscriptionId` identifies the invoking graph
subscription; `referenceLineId` identifies its connected reference. This is ownership, independent
of the data dependencies of an aggregate. Internal RxJS implementation subscribers are not public
occurrences. A caught error inside an otherwise continuing graph branch does not terminate that
branch; a failing referenced branch records its own terminal error while the parent may recover.

## Records

| Kind          | Meaning                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `subscribe`   | Occurrence opens before source evaluation, side effects or synchronous notifications.                     |
| `next`        | Value traverses a graph route in an open occurrence. The record identifies its emitting element and path. |
| `complete`    | Natural terminal notification, including EMPTY; never synthesized for cancellation.                       |
| `error`       | Terminal observable failure at that occurrence, with failing element and triggering lineage where known.  |
| `unsubscribe` | Observed teardown, once, after upstream cleanup and any terminal notification.                            |
| `diagnostic`  | Structured execution/construction/transport diagnostic; never a fabricated observable error.              |
| `run-ended`   | Root execution and observed cleanup ended; animation drain is separate.                                   |

Unsubscribe reasons are `complete`, `error`, `run-stop`, `operator-cancel`, or
`consumer-unsubscribe`. A known race cancellation includes `cancellingElementId`. When the cancelling
operator is not observable at a graph boundary, the engine reports `consumer-unsubscribe` rather
than guessing. Parent completion is distinct from child completion. A run ends only after the root
terminates and all observed graph occurrences have torn down. Source teardown returned after a
synchronous notification is processed before reporting observed teardown/run end.

Execution diagnostics now use the same occurrence IDs for parameter resolution, callback compilation
and invocation. They contain element/field/category/phase where known. New trace errors use a generic
message; they do not stringify raw exceptions, authored source, context or parameter snapshots.

## Worker, fallback and cancellation

All Worker messages carry `version: 1` and the host-allocated run ID. The host validates record
shape, contiguous sequence, monotonic time, unique occurrence allocation, parentage, terminal order
and teardown before forwarding a trace. Unsupported/malformed records fail with a transport
diagnostic. Messages belonging to an obsolete run are ignored. Listeners and timers are detached
when the Worker is terminated.

Stop disables value callbacks immediately and sends a run-scoped stop request. A responsive Worker
unsubscribes the actual RxJS subscription, sends cleanup records/run end and acknowledges stop.
The host allows at most 100 ms for acknowledgement, then terminates. If acknowledgement/teardown is
missing, the host reports `run-ended` with `teardownConfirmed: false`; it never invents observed
unsubscribe records. Worker crash/watchdog failures likewise report an error run end with unconfirmed
teardown. Forced termination cannot undo network effects or guarantee authored cleanup.

Worker and direct/fallback execution use the same instrumentation. The existing
[execution policy](EXECUTION_POLICY.md) still restricts public main-thread fallback to finite literal
work without references or authored code. It cannot interrupt synchronous infinite authored code;
the protocol does not relax this restriction or turn a Worker into a security sandbox.

## Existing callbacks and follow-up scope

The legacy adapter keeps `onNext` (including existing reference Subscribe markers), fatal `onError`,
successful root `onComplete` and `onCreationError` shapes. Lifecycle records are delivered only to
`onTrace`; child completion and recoverable child errors do not call fatal/root callbacks.
`onDiagnostic` remains available for visible host/field failures. Construction/transport failures
use diagnostics and the existing creation-failure UI adapter, never a fake observable error.

The legacy value observer attaches before source subscription, removing dependence on the old
10,000-record replay buffer. This prevents loss of synchronous bursts; it does not provide bounded
Worker postMessage transport. #131 owns transport/retention budgets, omission accounting and
presentation scheduling. #130 owns lifecycle visualization, accessible status and the full editing
lock through animation drain. No lifecycle canvas nodes, persisted fields or second scheduler are
introduced here. Legacy animation marker semantics remain unchanged; the new occurrence protocol
is the authority for lifecycle identity.
