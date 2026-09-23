# RxJS Vision completion plan

Status: implementation in progress, based on `main` and the open pull requests reviewed on
2026-09-23.

## Goal

Finish RxJS Vision as a reliable browser-based editor and simulator for RxJS observable graphs.
Work must proceed in this order:

1. Protect all existing behavior with automated tests.
2. Update and stabilize the development and runtime dependencies.
3. Re-evaluate the existing open feature pull requests and extract anything still valuable.
4. Stabilize the model and simulation contracts needed by future work.
5. Add the remaining operators in small, tested groups.
6. Complete the editor, learning, accessibility, performance, and release features.

No new operator or product feature should be implemented before phases 1 through 3 are complete.

## Progress

| Work item | Status | Notes |
| --- | --- | --- |
| Project analysis and roadmap | Complete | Merged in PR #54. |
| Phase 1.1A: unit-test foundation | Complete | Merged in [PR #55](https://github.com/maklja/vision/pull/55): Vitest, coverage, root validation commands, CI, and one smoke test per workspace package. |
| Phase 1.1B: browser test foundation | In review | [PR #56](https://github.com/maklja/vision/pull/56) adds React Testing Library persistence characterization with `fake-indexeddb`, Playwright, and the first critical browser journey. |
| Phases 1.2-1.5: characterization suites | Not started | Split by model, engine, viewer state, and browser journeys. |
| Phase 2: dependency updates | Blocked | Starts only after the Phase 1 characterization gate is complete. |
| Phase 3: old PR triage | Blocked | Starts only after dependency modernization is complete. |

## Definition of complete

The project can be called complete when all of the following are true:

- The current model, engine, worker protocol, state stores, persistence, and critical editor flows
  have repeatable automated coverage.
- Pull requests run formatting, linting, type checking, unit tests, integration tests, and a
  production build in CI.
- Supported Node.js, pnpm, browser, and dependency versions are documented and reproducible.
- Every supported operator has a model, connection rules, defaults, property UI, execution logic,
  documentation, and behavior tests.
- The chosen non-deprecated RxJS operator scope is complete. Deprecated aliases are either excluded
  explicitly or supported through a documented compatibility policy.
- Saved diagrams use a versioned schema with tested migrations, import, export, recovery, and
  validation.
- Invalid graphs and invalid operator expressions produce useful errors without corrupting the
  editor or leaving simulations running.
- Subscription, next, error, and completion events are represented consistently and rendered in a
  deterministic order.
- Keyboard use, accessibility, responsive layout, large-diagram performance, offline behavior, and
  the GitHub Pages deployment meet documented acceptance criteria.
- User documentation includes a tutorial, examples, the supported-operator matrix, limitations,
  troubleshooting, and release notes.

## Current baseline

| Area | Current state |
| --- | --- |
| Structure | pnpm TypeScript monorepo with model, engine, and React viewer packages. |
| Model | Elements, connect points and lines, connection descriptors, defaults, and geometry helpers. |
| Engine | Builds actual RxJS observables and reports flow events; normally runs in a Web Worker. |
| Viewer | React, React Konva, Material UI, React DnD, Zustand, and Immer. |
| Persistence | One diagram is stored in IndexedDB under the temporary key `test`; no schema version exists. |
| Existing operators | 11 creation, 6 join-creation, 10 transformation, `filter`, and `catchError`. |
| Tests | Vitest and V8 coverage with smoke coverage in all three packages, IndexedDB persistence characterization, and one Playwright editor journey; full characterization remains in progress. |
| CI | Pull requests run type checking, tests with coverage, the production build, and the Chromium browser journey; lint and formatting remain pending. |
| Lint | `pnpm -r eslint` currently crashes because the installed ESLint and TypeScript ESLint packages are incompatible. |
| Build | The viewer production build succeeds. |
| Backlog | No open GitHub issues; three older feature pull requests are still open. |

## Delivery rules

- Keep each pull request focused and independently releasable.
- Do not combine dependency upgrades with behavior changes.
- Add a failing behavior test before fixing a discovered regression.
- Add operator support in groups of at most three to five related operators.
- Update the supported-operator matrix and example diagrams in the same pull request as an operator.
- Require all CI checks to pass before merge; do not hide flaky tests behind retries.
- Record important model, execution, security, and compatibility decisions in short ADRs.
- Treat generated files in `docs/` as deployment output, not implementation source.

## Phase 1: cover the current product with tests

This phase characterizes existing behavior. It should avoid intentional feature or data-model changes.
Small seams may be introduced where necessary to make time, workers, IndexedDB, or animation
scheduling controllable in tests.

### 1.1 Establish the test and CI foundation

Add the minimum testing dependencies compatible with the current application before performing the
general dependency upgrade:

- Vitest for TypeScript unit and integration tests, because the viewer already uses Vite.
- RxJS `TestScheduler` and fake timers for deterministic observable tests.
- React Testing Library and `user-event` for viewer components.
- `fake-indexeddb` for persistence tests.
- Playwright for a small number of browser-level editor journeys.
- Coverage reporting with source maps for all three packages.

Add root scripts for `format:check`, `lint`, `typecheck`, `test`, `test:coverage`, `test:e2e`, and
`build`. Add a GitHub Actions workflow that installs with the frozen lockfile and runs all checks.
Cache the pnpm store, but do not cache generated build output.

Initial coverage gates:

- 100% behavior coverage for operator factories and connection descriptors.
- At least 80% branch coverage for `simulator-model` and `simulator-engine`.
- At least 70% branch coverage for viewer state and non-canvas UI.
- Browser tests for every critical journey listed below.

Coverage percentage is a guardrail, not the objective. Assertions must verify emitted values,
errors, completion, paths, state transitions, and persistence rather than only executing lines.

### 1.2 Model characterization suite

Cover:

- Default property templates for every current operator.
- Operator group membership and entry-operator classification.
- Input, output, and event connection compatibility.
- Connection cardinality and rejection of invalid or duplicate connections.
- Element and connect-line creation, movement, rename, removal, and serialization shapes.
- Bounding boxes, intersections, line snapping, and grid snapping at boundary values.
- Unknown element types and malformed properties.
- Fixtures representing real diagrams saved by the current release.

Exit criterion: model behavior can be refactored without relying on the viewer for validation.

### 1.3 Engine characterization suite

Test every currently supported operator with normal, empty, completion, and relevant error cases:

- Creation: `ajax`, `defer`, `empty`, `from`, `generate`, `iif`, `interval`, `of`, `range`,
  `throwError`, and `timer`.
- Join creation: `combineLatest`, `concat`, `forkJoin`, `merge`, `race`, and `zip`.
- Transformation: `buffer`, `bufferCount`, `bufferTime`, `bufferToggle`, `bufferWhen`, `concatMap`,
  `exhaustMap`, `expand`, `map`, and `mergeMap`.
- Filtering and errors: `filter` and `catchError`.

Also cover:

- Graph traversal for linear flows, branches, joins, event inputs, and disconnected elements.
- Missing entry elements, missing references, invalid values, unsupported types, and missing next
  elements.
- `FlowValue` identity, dependencies, event order, source/target IDs, and complete/error handling.
- Start, stop, unsubscribe, restart, and cleanup behavior.
- Worker start/stop messages, emitted messages, structured-clone compatibility, worker errors, and
  the no-worker fallback.
- Network behavior for `ajax` with mocked requests; tests must never call a real service.

Use virtual time wherever possible. Do not use real sleeps for interval, timer, buffer, or animation
tests.

Exit criterion: the observable values and flow-event contract of every current operator are locked
down before RxJS or TypeScript is upgraded.

### 1.4 Viewer state and component suite

Cover each Zustand slice independently and through the root store:

- Element, connect-point, connect-line, selection, clipboard, snap-line, error, animation,
  simulation, and stage state.
- Multi-selection, copy/paste ID remapping, deletion cleanup, movement, and connection updates.
- Simulation start, event queueing, result-element lifecycle, completion, reset, and cancellation.
- Loading and saving IndexedDB data, missing or corrupt data, save failure, and exclusion of transient
  result elements.
- Operator palette contents and disabled state while a simulation runs.
- Entry selection and start/stop/restart controls.
- Property forms, code fields, numeric/date inputs, and connect-line ordering/naming.
- Error display and element-location behavior.

Keep pixel-level Konva assertions out of unit tests. Test calculated geometry and state separately,
then use browser tests for the rendered canvas behavior.

### 1.5 Critical browser journeys

Add Playwright journeys for:

1. Build `of -> map -> filter -> subscriber`, run it, and observe the expected result events. The
   first Playwright journey now covers this path.
2. Build a branch and a join graph and verify connection and execution order.
3. Configure an operator, reload, and verify that the diagram and viewport are restored.
4. Copy, paste, multi-select, move, reconnect, and delete a group.
5. Pan, zoom, snap to grid, and locate an entry element.
6. Trigger a creation error and a runtime error and recover without reloading.
7. Start an infinite source, stop it, and verify that the worker and animations are cleaned up.
8. Load the production build under the GitHub Pages base path.

### Phase 1 gate

- All current operators and critical flows are covered.
- Tests are deterministic and pass repeatedly in CI.
- The production build remains unchanged in behavior.
- Known failures are written as explicit skipped tests linked to issues, never left undocumented.

## Phase 2: update dependencies and repair tooling

Perform upgrades only after the Phase 1 suite is green. Upgrade in several pull requests so a
regression can be attributed and reverted safely.

### 2.1 Reproducible toolchain

- Choose and document an active Node.js LTS version.
- Add the `packageManager` field with an exact pnpm version and provide the same version in CI.
- Add root workspace scripts so local and CI commands are identical.
- Remove accidental npm lockfiles and keep `pnpm-lock.yaml` as the only dependency lock.
- Document the browser support policy.

### 2.2 Lint, format, test, and TypeScript stack

- Align ESLint, TypeScript ESLint, TypeScript, Prettier, React lint plugins, Vitest, and Playwright.
- Fix the current `@typescript-eslint/no-empty-function`/ESLint API mismatch.
- Decide whether to adopt ESLint flat configuration based on the target ESLint release; do not mix
  configuration migration with source refactors.
- Add a standalone `tsc --noEmit` check for all packages.
- Resolve diagnostics without weakening strictness or adding broad suppressions.

### 2.3 Build and application dependencies

Upgrade in this order, one compatibility group per pull request:

1. Vite, React plugin, web-vitals, and build tooling.
2. React and React DOM, followed by React Testing Library.
3. Material UI, Emotion, date pickers, Monaco, React DnD, and `idb-keyval`.
4. Konva and React Konva, with the browser interaction suite running against every change.
5. Zustand, Immer, `deepmerge`, UUID, and other small runtime libraries.
6. RxJS last, because its scheduling, deprecated APIs, and operator signatures directly affect
   simulation semantics.

For each group:

- Read the migration guide and record intentional behavior changes.
- Run format, lint, type checking, unit/integration tests, browser tests, and production build.
- Inspect bundle size and worker output for unexpected growth.
- Test at least Chromium, Firefox, and WebKit for browser-sensitive changes.

### 2.4 Dependency maintenance

- Add Dependabot or Renovate with grouped patch/minor updates and separate major updates.
- Run dependency and license audits in CI with an explicit policy for accepted findings.
- Remove unused dependencies only after confirming usage in source, configuration, and generated
  worker bundles.

### Phase 2 gate

- A clean checkout installs without warnings requiring manual build-script approval.
- Format, lint, typecheck, test, browser test, and build commands all pass.
- No critical or high unreviewed dependency vulnerabilities remain.
- The Phase 1 behavior suite proves that observable and editor behavior is preserved.

## Phase 3: triage the existing feature pull requests

The three old feature branches have diverged from `main`. None should be merged as-is.

| PR | Useful ideas | Current problems | Recommended disposition |
| --- | --- | --- | --- |
| [#40 Context code execution](https://github.com/maklja/vision/pull/40) | Shared execution context, pre-execution hooks, expression-backed properties, and early code generation. | 24 commits ahead and 21 behind; predates the monorepo; changes many engine/model/UI contracts at once; duplicates commits; has no safety suite; arbitrary code execution needs an explicit trust model. | Keep as a prototype. Write an ADR and focused issues for execution context and code generation, then reimplement from `main` after tests and upgrades. Close the PR after traceability links are added. |
| [#42 Override parameters](https://github.com/maklja/vision/pull/42) | Runtime parameter expressions, broader property forms, and a code-generation direction. | 13 commits ahead and 13 behind; uses the old single-package layout and npm lockfile; replaces most factories in one change; overlaps #40; no migration or behavior tests. | Extract the parameter model and UX requirements. Prototype them against the versioned diagram schema, then implement in small PRs. Do not rebase or merge the branch wholesale. |
| [#50 Subscription event](https://github.com/maklja/vision/pull/50) | Subscription events, branch IDs, subscription-line styling, disabled graph state during simulation, and deterministic scheduling concepts. | 9 commits ahead and 4 behind; conflicts with animation work already merged in #51 and later changes; touches most drawers; contains unfinished notes and experimental/commented paths. | Highest-value feature to revive first. Specify the flow-event contract and scheduler tests, then port the engine semantics and minimal UI styling in new PRs. Close the old PR once the replacement issues/PRs are linked. |

Triage procedure:

1. Run or inspect each old branch only to clarify behavior; do not spend time making it releasable.
2. Create one issue per independent requirement, with screenshots or fixtures when useful.
3. Link each issue back to its source PR and note which code is reference-only.
4. Identify any small, still-correct commits that can be cherry-picked safely; default to a clean
   implementation when model paths or contracts have changed.
5. Close the old PR after all retained requirements are represented in the backlog.

### Phase 3 gate

- Every old PR has a written keep/drop decision.
- Valuable behavior is represented by accepted tests, ADRs, or issues.
- Obsolete branches are closed so they no longer appear merge-ready.

## Phase 4: stabilize contracts for future features

Complete these design changes before adding dozens of operators.

### 4.1 Versioned diagrams

- Replace the hard-coded `test` key with diagram IDs and metadata.
- Define a serializable, versioned diagram schema separate from transient Zustand state.
- Add migration steps and fixtures for every released schema version.
- Add JSON import/export, validation, backup-before-migration, and corrupt-data recovery.
- Keep transient result nodes, animation queues, errors, and worker handles out of persisted data.

### 4.2 Operator definition contract

Create one explicit operator definition contract that can supply:

- Operator type, display name, category, and documentation link.
- Input/output/event ports and cardinality.
- Serializable property schema and defaults.
- Property-editor registration.
- Engine factory registration.
- Drawer registration and theme overrides.
- Support status and example fixture.

This is a concrete requirement for operator-scale work, not a general plugin framework. Migrate the
current operators incrementally and keep package boundaries intact.

### 4.3 Expression execution and validation

The current engine compiles user expressions with `new Function`. Before adding more expression-
driven operators:

- Define whether diagrams are always trusted local content or can be imported/shared from others.
- Document available variables, function signatures, return types, and side effects.
- Parse/compile expressions before simulation and attach diagnostics to the responsible element.
- Enforce execution in the worker, cancellation, time limits where practical, and clear warnings for
  network-capable or untrusted diagrams.
- Decide whether a restricted expression interpreter is required before public sharing is enabled.
- Add tests for syntax errors, runtime errors, infinite sources, cancellation, and malicious imports.

### 4.4 Stable flow-event protocol

Define a versioned event contract for:

- Subscribe, next, error, complete, and unsubscribe.
- Event ID, subscription ID, branch ID, dependencies, sequence number, and timestamp/virtual time.
- The traversed connection path and source/target elements.
- Worker creation errors versus observable runtime errors.

Then implement the valuable parts of PR #50: subscription visualization, branch correlation,
disabled editing during a run, and deterministic animation scheduling. Bound retained events and
animation queues so long-running observables cannot exhaust browser memory.

### Phase 4 gate

- Persistence, operator registration, expression execution, and event protocol have documented and
  tested contracts.
- Adding an operator no longer requires discovering undocumented registration points.
- Subscription behavior is correct before higher-order and multicasting operators are expanded.

## Phase 5: add the remaining RxJS operators

First generate an operator inventory from the public exports of the upgraded RxJS version. Mark each
operator as supported, planned, intentionally excluded, deprecated, or not meaningful in a visual
graph. The lists below are the candidate backlog based on the current RxJS 7 API; the upgraded API
and deprecation annotations are authoritative.

Each operator is complete only when it includes:

- Model type and serializable properties.
- Default template and connection descriptor.
- Engine implementation and flow-event propagation.
- Property form, validation, drawer/palette registration, and help text.
- Unit tests using values, errors, completion, cancellation, and virtual time where relevant.
- At least one saved example graph and an entry in the support matrix.

### Wave 1: simple filtering, selection, and aggregation

Prioritize operators with no additional observable input:

- Filtering/selection: `distinct`, `distinctUntilChanged`, `distinctUntilKeyChanged`, `elementAt`,
  `first`, `last`, `single`, `skip`, `skipLast`, `skipWhile`, `take`, `takeLast`, `takeWhile`,
  `find`, `findIndex`, `ignoreElements`, and `throwIfEmpty`.
- Conditional: `defaultIfEmpty`, `every`, `isEmpty`, and `sequenceEqual`.
- Aggregation: `count`, `max`, `min`, `reduce`, `scan`, and `toArray`.
- Utility: `tap`, `finalize`, `startWith`, `endWith`, `pairwise`, `materialize`, and `dematerialize`.

These operators validate the operator-definition contract with relatively small UI and engine risk.

### Wave 2: time, notifier, and scheduler operators

- `audit`, `auditTime`, `debounce`, `debounceTime`, `sample`, `sampleTime`, `throttle`, and
  `throttleTime`.
- `delay`, `delayWhen`, `timeInterval`, `timestamp`, and `timeout`.
- `skipUntil`, `takeUntil`, `observeOn`, and `subscribeOn`.
- Source candidates: `animationFrames` and `scheduled`.

Use virtual-time tests for every timing boundary. Reuse event-input ports for notifier observables
instead of embedding diagram references in arbitrary strings.

### Wave 3: higher-order mapping and combination

- Mapping/flattening: `switchMap`, `switchScan`, `mergeScan`, `concatAll`, `exhaustAll`, `mergeAll`,
  and `switchAll`.
- Combination: `combineLatestAll`, `combineLatestWith`, `concatWith`, `mergeWith`, `raceWith`,
  `withLatestFrom`, `zipAll`, and `zipWith`.
- Grouping: `groupBy`.

These depend on the subscription/branch protocol from Phase 4. Test nested subscriptions,
cancellation, concurrency, ordering, and inner errors explicitly.

### Wave 4: windows, repetition, and resilience

- Windows: `window`, `windowCount`, `windowTime`, `windowToggle`, and `windowWhen`.
- Resilience: `retry`, `retryWhen`, and `onErrorResumeNextWith`.
- Repetition: `repeat` and `repeatWhen`.

Window operators need a clear visual representation for observables-of-observables before they are
exposed in the palette.

### Wave 5: browser sources, resource lifetime, and multicasting

- Browser/callback sources: `fromEvent`, `fromEventPattern`, `bindCallback`, and `bindNodeCallback`.
- Other sources: `NEVER`, `using`, and any non-deprecated source utilities retained by the target
  RxJS version.
- Multicasting: `connect`, `share`, `shareReplay`, and `refCount` if it remains public and supported.

This wave requires lifecycle visualization, safe DOM target selection, cleanup tests, and clear
semantics for hot versus cold observables.

### Deprecated compatibility policy

Do not implement deprecated aliases by default. After the primary inventory is complete, decide
whether educational compatibility justifies operators such as `combineAll`, `concatMapTo`,
`mapTo`, `mergeMapTo`, `multicast`, `pluck`, `publish*`, `switchMapTo`, or `timeoutWith`. If they are
included, label them deprecated and implement them as thin compatibility definitions rather than a
second execution path.

### Phase 5 gate

- The generated support matrix has no unexplained gaps.
- Every planned operator meets the same model/engine/viewer/test/documentation definition of done.
- Deprecated and excluded operators have a documented reason.

## Phase 6: finish product features

### 6.1 Editor reliability

- Multiple named diagrams/tabs with create, rename, duplicate, close, and delete flows.
- Undo/redo with bounded history and transaction grouping for drag operations.
- JSON import/export and recovery snapshots.
- Autosave status, save-error recovery, and migration UI.
- Full graph validation before run, inline field validation, and code compilation diagnostics.
- Result/event inspector showing value, error, time, subscription, branch, and path.
- Clear handling for infinite sources and a global stop-all action.

### 6.2 Editing and navigation UX

- Searchable operator palette with implemented categories and no empty placeholder groups.
- Element tree/outline, locate action, mini-map or fit-to-content, and large-canvas navigation.
- Full-size code editor with formatting, syntax errors, and documented expression signatures.
- Complete keyboard shortcuts for select-all, copy, paste, duplicate, delete, undo, redo, run, stop,
  zoom, and focus movement.
- Configurable grid, snapping, animation speed, theme, and reduced-motion behavior.
- Clear onboarding and example diagrams for common RxJS concepts.

### 6.3 Learning and observability

- Subscription lifecycle visualization based on the Phase 4 event contract.
- Value/error/completion preview and replayable event timeline.
- Optional marble/timeline view for time-based operators.
- Generate readable RxJS code from a valid graph, revisiting the useful ideas from PRs #40 and #42.
- Copy generated code and report graph constructs that cannot be represented faithfully.

### 6.4 Platform features

- Responsive layout and touch/pen interactions where the canvas library supports them reliably.
- WCAG 2.2 AA targets for controls, focus order, labels, contrast, and non-color event states.
- Installable PWA and tested offline loading after the first visit.
- Shareable local file export first. Treat Google Drive or another cloud integration as optional and
  require a separate authentication, privacy, and maintenance decision.

### Phase 6 gate

- Core editor flows are complete without hidden keyboard-only or mouse-only requirements.
- A first-time user can build, understand, save, export, reopen, and debug a graph from the docs.
- Optional cloud integration cannot block a stable local-first release.

## Phase 7: hardening and stable release

### Performance

- Set budgets for initial JavaScript, worker bundle, startup, interaction latency, and memory.
- Profile large graphs, rapid event bursts, infinite sources, canvas redraws, IndexedDB writes, and
  Monaco loading.
- Lazy-load heavyweight editor and operator UI where it improves the measured budget.
- Cap event history and animation queues and expose truncation clearly to the user.

### Security and privacy

- Threat-model imported diagrams, `new Function`, Ajax requests, DOM event sources, and future cloud
  integrations.
- Apply a restrictive GitHub Pages content security policy where compatible with the expression
  execution design.
- Confirm that no diagram or telemetry leaves the browser without explicit user action.
- Add a vulnerability reporting policy and automated dependency scanning.

### Documentation and release engineering

- Add architecture, contributing, testing, security, supported-operator, and troubleshooting docs.
- Add versioning, changelog, release notes, and an upgrade/migration policy.
- Build the GitHub Pages artifact in CI from a tagged commit instead of editing bundles manually.
- Run smoke tests against the deployed preview before promotion.
- Publish a release candidate, resolve all release-blocking issues, then tag `1.0.0`.

## Recommended first implementation pull requests

After this planning PR is merged, use this sequence:

1. Test runner, root scripts, coverage, and CI foundation.
2. Model descriptors, templates, geometry, and serialization characterization tests.
3. Engine creation and join-creation operator tests.
4. Engine pipe operators, graph traversal, flow manager, and worker protocol tests.
5. Viewer store and IndexedDB characterization tests.
6. Critical Playwright journeys and GitHub Pages base-path smoke test.
7. Toolchain pinning, ESLint repair, typecheck command, and formatter alignment.
8. Build/test dependency upgrades, followed by application dependencies in compatibility groups.
9. RxJS upgrade with the full engine characterization suite.
10. Issues/ADRs extracted from PRs #40, #42, and #50; then close the superseded PRs.
11. Versioned diagram schema and migration/import/export foundation.
12. Stable flow-event protocol and a focused replacement for the subscription behavior in PR #50.
13. Operator-definition contract and migration of the current operator set.
14. Begin operator Wave 1 only after all earlier gates are green.

## Completion tracking

Create milestones matching phases 1 through 7. Every issue should identify:

- The phase and gate it contributes to.
- User-visible acceptance criteria.
- Required unit, integration, or browser tests.
- Data migration and compatibility impact.
- Documentation impact.
- Security, accessibility, and performance considerations when applicable.

Review this plan at each phase boundary. Change the roadmap when tests or prototypes reveal better
information, but never bypass the tests-first, dependencies-second, old-PR-triage-third sequence.
