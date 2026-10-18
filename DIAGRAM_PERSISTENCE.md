# Diagram persistence and JSON files

The editor shows one active diagram. Open **Diagram files** to export JSON, import a replacement,
or retry a failed load. Import validates the current schema before replacing anything and never
runs the graph. Export uses the current editor snapshot, including when autosave fails.

## Development schema policy

The application is not in production. Breaking schema changes are allowed during development;
there are no schema migrations or compatibility loaders. Only the current schema version (v2) is
accepted. Unversioned diagrams, v1 and unknown versions are rejected rather than converted. A browser
console error is logged when loading unsupported stored data or importing an unsupported file.
The diagram is not loaded or executed, and its original storage is left untouched. The existing
load-error UI allows retry or explicit replacement with a current-schema file.

Production compatibility and migration requirements must be decided before a production release.
Do not introduce migrations solely to preserve development fixtures; update fixtures to the current
schema instead.

## Current document

The framework-independent DTO/validator lives in `simulator-model/src/diagram/diagramDocument.ts`.
A document contains `schemaVersion: 2`, `id`, `name`, `createdAt`, `updatedAt`, `origin` and `diagram`.
Source data contains elements, connections, viewport, theme and optional finite JSON `contextSeed`.
Range, Interval and Timer numeric/date fields use [typed parameter envelopes](PARAMETERS.md).
Callback strings retain their separate fields. This JSON format is separate from RxJS export (#136).

Validation rejects unknown fields, invalid references/ports, duplicate or unsafe IDs, non-finite
numbers, unsupported operators, non-JSON objects and unsafe prototype keys. Disconnected/incomplete
graphs remain valid editable drafts; runtime validation checks only the selected reachable graph.
No callback, expression or request executes during load, import, export or validation.

Source snapshots explicitly project element, line and viewport fields. Transient results, selection,
queues, diagnostics, subscriptions, runtime context/params, compiled functions, Worker handles and
execution grants are not saved. Current runtime numeric templates serialize to typed literals;
this is current-schema serialization, not conversion of old stored documents.

## IndexedDB and write failures

The database is `keyval-store`, object store `keyval`.

| Key                      | Purpose                                                                    |
| ------------------------ | -------------------------------------------------------------------------- |
| `vision:active-diagram`  | Active local diagram ID                                                    |
| `vision:diagram:<id>`    | Current validated document                                                 |
| `vision:backup:<id>`     | One prior record, written before normal autosave/replacement               |
| `vision:backup:recovery` | Corrupt pointer/record snapshot before explicit replacement                |
| `test`                   | Unsupported old development storage; detected and rejected, never migrated |

Ordinary save/replacement safeguards remain: backup failure aborts the write, and commit failure
preserves the prior record. Record and pointer commit in one `setMany` transaction. The repository
serializes writes; autosave coalesces the newest snapshot with three bounded retry attempts and
exponential backoff. Unsubscribe cancels pending retries. Successful saves clear the failure status.
These safeguards do not create or support schema migrations.

Strict load/autosave will not overwrite unreadable or unsupported data. Explicit import can replace
it after validating a current document. It keeps a valid active local ID; a corrupt pointer gets a
fresh ID after its recovery snapshot. Legacy `test` data can remain unused after explicit replacement.
Backup download and restore buttons are not exposed. Browser storage may still be cleared by the
browser or user; export important diagrams to files.

## Execution approval and limits

Imported graphs open inert. Code, parameter expressions, network requests and nonempty context
require review and **Allow execution for this revision**. Approval is session-only, never imported
or persisted, and revoked by source edits/reload. Viewport/theme changes and transient results do
not change the revision. A Worker is not a security sandbox; see [execution policy](EXECUTION_POLICY.md).

Documents are limited to 5 MiB UTF-8 (conservative in-memory structural estimate), JSON depth 64,
10,000 elements, 20,000 lines and 2–1,024 finite points per line. Text fields are at most 65,536
characters; expressions additionally have a 64 KiB UTF-8 limit. Context and invocation snapshots
are limited to 1 MiB. Errors are visible, and invalid data is never silently repaired.
