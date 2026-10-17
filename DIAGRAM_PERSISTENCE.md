# Diagram persistence and file recovery

The editor still shows one active diagram. Open **Diagram files** in the upper left to export JSON,
import a replacement, or retry a failed load. Import validates before replacing anything, backs up
the current saved record and never runs the graph. Export uses the current editor snapshot even
when an autosave fails. Invalid drafts must be corrected before they can be exported as a supported diagram.

After a file import, review its code and network requests, then explicitly choose
**Allow execution for this revision** to enable Run. This permission exists only in memory and is
revoked after source edits or reload. Viewport/theme changes and transient result animations do not
change the source revision. A pending Start also verifies the current permission and captured
revision after the engine chunk loads; approving a different revision cannot revive an old request.
`origin: file` is persisted provenance, not a permission: imported files
cannot mark themselves trusted, and import forces this provenance regardless of the file's value.
Existing local authored diagrams retain their normal Run behavior. The broader expression compiler,
watchdog and trusted-local execution policy remain issue #134. JavaScript still has the page's
capabilities; a Worker is not a security sandbox.

## Schema and compatibility

The model package owns the framework-independent DTO and inert validator in
`packages/simulator-model/src/diagram/diagramDocument.ts`. Storage and controls belong to the viewer.
This is plain diagram JSON, not runnable RxJS export (#136).

| Version                                              | Accepted shape                                                                                            | Migration / behavior                                                                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| v0 (unversioned released data)                       | `{ elements, connectLines, canvasState, themeId }` at legacy key `test`                                   | Validated; source IDs, connections, numeric/date values, callback text, viewport and theme preserved; transient result nodes excluded |
| v1                                                   | `{ schemaVersion: 1, id, name, createdAt, updatedAt, origin, diagram }`, with v0 source data in `diagram` | Stable local ID/name/timestamps and provenance; exact supported fields only                                                           |
| Unknown future version / unpublished prototype shape | Not admitted                                                                                              | Original storage remains unchanged; import a supported document                                                                       |

v1 does not wrap numeric/date properties or rename callback fields. Deliberately absent optional
values remain absent, including Range count; legacy IndexedDB `undefined` optional properties are
normalized to absence. Missing required fields, unknown fields, invalid ports/references, duplicate
or unsafe IDs, non-finite numbers and unsupported source operators produce field/path diagnostics.
No expressions, factories, callbacks or Ajax requests execute during load, validation, preview,
migration, export or import. An incomplete/disconnected graph is a valid editable draft; missing
required runtime inputs still receive engine diagnostics on Run.

Defaults added by the migration are document metadata only (`My diagram`, fresh ID/timestamps,
local provenance). It does not repair corrupt present fields or substitute callback source. Connections must point from Output/Event to Input; reversed lines are rejected
before import. Existing
templates define current required property types; known optional properties are validated separately.
This narrow validator is not the operator registration framework planned in #140.

**Future version step:** #135 must introduce an explicit v1 → next-version migration before adding
parameter-v1 envelopes; #134 must likewise version `contextSeed` before persisting it. These fields
are rejected in v1 today. There is no speculative extension bag, executable initializer or evaluator.
Versioned migration fixtures and the current-release fixture protect this boundary.

## IndexedDB layout and backup ordering

Database `keyval-store`, object store `keyval` remain unchanged.

| Key                      | Value / retention                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `vision:active-diagram`  | Active local diagram ID                                                                    |
| `vision:diagram:<id>`    | Current validated v1 document                                                              |
| `vision:backup:<id>`     | One prior saved record, written before replacement/autosave; bounded rolling recovery slot |
| `vision:backup:legacy`   | Untouched unversioned source before migration or explicit replacement                      |
| `vision:backup:recovery` | One corrupt active-pointer/record snapshot saved before explicit recovery                  |
| `test`                   | Original unversioned data retained without modification; never the autosave destination    |

Migration validates v0, awaits the original-data backup write, then atomically commits the new record
and active pointer using one `idb-keyval.setMany` transaction. Reopening v1 does not repeat migration.
Autosave and explicit replacement likewise await a durable previous-record backup before committing
record/pointer. Backup failure aborts the write. Commit failure leaves the prior record and backup
available. One repository queue serializes in-flight autosave and explicit replacement; replacement
cancels pending old-store retries, and a failed replacement resumes the old editor and its unsaved work.

Source snapshots explicitly project element, line and viewport fields. Results, selection/highlight,
canvas dimensions, queues, errors, subscriptions, compiled functions, context/params, Worker handles
and execution grants are excluded. Autosave retains its existing newest-snapshot coalescing, three
attempts, exponential backoff and unsubscribe cleanup; successful saves clear the visible failure
message. Storage quota/read/validation failures are reported in accessible text rather than replacing
unreadable data with an empty autosave. The recovery editor stays unsaved and execution-disabled.

If the active pointer is malformed or its record is missing, strict load/autosave still refuse to
write. Explicit import instead awaits a recovery snapshot of the pointer and any readable record,
then atomically establishes a fresh active ID. Backup or commit failure preserves the invalid
pointer and permits retry. The recovery snapshot preserves raw evidence internally. Legacy data
remains intact. Original-data download, backup download and backup restore are no longer exposed.

A fresh file import receives a local ID; replacing an existing active record keeps its local ID and
known creation timestamp. The imported name and content become the active document. Imported origin
survives later autosave and reload, so file contents never silently become local/trusted.

## Limits and measured fixture

- File/source-data validation budget: 5 MiB UTF-8 (conservative structural estimate for in-memory
  objects), maximum JSON depth 64, at most 10,000 elements and 20,000 lines.
- Each text field is at most 65,536 characters; a wire has 2–1,024 finite coordinate points. Runtime
  expression-specific execution limits remain #134.
- Only finite JSON and plain objects are admitted; prototype-sensitive object keys are rejected.
  Validation does not use `eval`, `new Function`, source compilation or network inspection.
- Measured locally with Node 24.19.0: the deterministic 2,000 disconnected Of-node fixture migrates
  to a 323,156-byte v1 document in approximately 53 ms. This is one measurement, not a latency or heap
  guarantee. A regression fixture exercises the same size/roundtrip without a timing assertion.

The previous-record backup is an internal data-preservation safeguard. Multiple tabs, named diagram
management, cloud sync and undo transactions remain later work. Browser storage can still be cleared
by the user or browser; export important diagrams to files.

## Verification

Focused tests cover current-release migration and repeat load, numeric/date/optional properties,
all current source operator templates, future/corrupt/prototype files, invalid references/ports,
bounded JSON, inert callback text, prior backups, failed backup/commit, serialized replacements,
permission reset on source edit/remount, file diagnostics and existing retry/dispose behavior.
Playwright keeps existing legacy-seeded recovery/cancellation journeys and adds import → approval →
run → reload → export and invalid-import journeys in Chromium, Firefox and WebKit. The common test
reader follows the active versioned pointer while legacy seeds continue testing v0 migration.

## Context seed

Versioned documents may include optional `diagram.contextSeed`, a finite JSON object (1 MiB, depth
64). Existing version-1 documents without it use `{}`. Save/export/import preserve only this seed;
runtime mutations and execution approval are never persisted. See [execution policy](EXECUTION_POLICY.md).
