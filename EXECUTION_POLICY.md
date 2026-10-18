# Trusted local execution

Issue #134 implements the execution core described in
[the accepted decision](planning/decisions/execution-context-and-parameters.md).
The final subscription lifecycle correlation remains tracked by #129. Issue #135 adds
[typed source parameters and editors](PARAMETERS.md) using this execution core.

Every code or network graph requires **Allow execution for this revision**, including locally
created and restored graphs. Approval lives only in this editor session and is revoked after source,
connection or context seed edits. Import, reload, export and syntax preflight never execute authored
code. Review the code and requests before approving it. A Worker shares the page's origin and network
permissions: it is **not a security sandbox**. Public untrusted execution is unsupported.

The execution settings disclosure contains a keyboard-accessible context seed editor, watchdog
budget and text diagnostics. Only `diagram.contextSeed`, an optional finite JSON object in the
versioned diagram document, is saved. Its absence means `{}`; older schemas are rejected without loading or executing them.
No initializer, runtime context, compiled closure, params, approval or Worker handle is saved.
The seed is cloned once for each run, including restart. `$context` is mutable and shared inside
that run; asynchronous branches observe actual dispatch order. Use invocation inputs for independent
inners instead of shared scratch state.

## Bindings and invocation matrix

Authored callbacks retain their field names and positional adapters. Every callback also has lexical
`$context` and `$params`. `$params` is a cloned, deeply frozen snapshot of that operator's resolved
properties. Callback-producing expressions and their closures are recreated per actual subscription.
No RxJS namespace or other global helper is injected. Normal JavaScript globals remain reachable in
trusted code. Exact field names and positional types are in `operatorDefinitions`.

| Operator / field family                       | Positional arguments             | Connected helper / result                                                   |
| --------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------- |
| Of / From direct                              | none                             | Values / ObservableInput                                                    |
| Defer / From connected                        | none                             | `createObservable(overrides?)`; ObservableInput                             |
| IIf condition / branches                      | none                             | Condition has no helper; only selected branch gets its helper and evaluates |
| Map / Filter                                  | raw value, index                 | No helper; existing one-value adapter index remains zero                    |
| ConcatMap / MergeMap / ExhaustMap / Expand    | raw outer value, index           | Connected inner helper; ObservableInput                                     |
| BufferWhen / BufferToggle closing selector    | none / raw opening value         | Connected notifier helper; ObservableInput                                  |
| Generate iterate / condition / resultSelector | state                            | No helper; initialState is a value expression                               |
| ThrowError                                    | none                             | Existing direct error value or zero-argument error factory                  |
| CatchError                                    | raw error, caught raw observable | Connected recovery helper; ObservableInput                                  |

Precedence is required template defaults, saved properties, then direct explicit overrides.
Omitted optional fields stay absent (notably Range count). Omitted override keys inherit; zero, false
and empty string remain explicit where the field type permits them. Undefined, null, unknown and
prototype keys, nonfinite numbers and mismatched types fail. JSON object/array fields replace rather
than merge. Stored callback strings are preserved byte-for-byte. Parameter envelopes/expressions
from #135 are not guessed from strings.

IIf now reads the resolved condition override; Defer honors its own factory override. Joins consume
only their own keys, including overridden input mode and concurrency, and never broadcast a bag of
parameters to children. Nested helpers forward only their explicitly supplied overrides. The helper
captures a cloned override definition when called and constructs a lazy observable. Repeated cold
subscriptions clone fresh params; unused branches and queued projections perform no source effects.
These intentionally replace the previous inconsistent eager/override behavior.

## Validation, cancellation and limits

Acorn parses source during host preflight without evaluating callback-producing code. Evaluation
happens after approval inside a fresh Worker. Function shape and ObservableInput results are checked;
callback exceptions remain RxJS errors and can be caught by CatchError. Diagnostics distinguish
schema, syntax/shape/result, invocation, references, transport, policy and watchdog failure, with run,
element, field and the actual graph subscription occurrence where available.
[Protocol v1](FLOW_EVENT_PROTOCOL.md) defines lifecycle identity and parentage. Diagnostics never dump source, context or params.

Worker control heartbeat is independent of source notifications, every 250 ms. The host kills a
Worker after five seconds without a heartbeat by default; the visible setting accepts 1–60 seconds.
Silent asynchronous sources remain valid. Browser background throttling may cause conservative
cancellation. Stop and restart ignore stale values immediately. Responsive Workers acknowledge real teardown;
the host terminates after acknowledgement or a maximum 100 ms wait. Forced termination
cannot guarantee authored cleanup or undo already dispatched network requests.

Without a Worker, code, network and context execution fail visibly; only validated literal graphs
can use the main-thread fallback, with a visible limitation. Fallback supports only a single reachable
source graph; graphs with referenced sources require a Worker, including joins and repeated references
to the same source. This prevents individually bounded Range sources from multiplying synchronous
UI-thread work. A fallback Range requires an explicit count of at most 10000. There is no unsafe
callback fallback.
Source is limited to 64 KiB UTF-8 per field, seed/params to 1 MiB JSON and depth 64, and displayed
diagnostics to 2 KiB. The host retains a bounded diagnostic list. These limits do not make trusted
JavaScript safe against resource abuse. Event transport/retention accounting remains #131.
