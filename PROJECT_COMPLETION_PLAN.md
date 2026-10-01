# RxJS Vision completion plan

Status: implementation in progress. Phase 1.4 viewer state and component characterization was completed on 2026-09-26. Phase 1.5 critical browser journeys and the Phase 1 characterization gate were completed on 2026-09-28 (issues #85–#90, PRs #91, #92, #94, #96, #98, and #103). Phase 2 was verified complete on 2026-10-01 against `main` commit `41a6b66` after PR #124 merged. Phase 3 is ready; its four reviewable triage steps are planned below and have not yet been completed.

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

| Work item                                               | Status   | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project analysis and roadmap                            | Complete | Merged in PR #54.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Phase 1.1A: unit-test foundation                        | Complete | Merged in [PR #55](https://github.com/maklja/vision/pull/55): Vitest, coverage, root validation commands, CI, and one smoke test per workspace package.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Phase 1.1B: browser test foundation                     | Complete | Merged in [PR #56](https://github.com/maklja/vision/pull/56): React Testing Library persistence characterization with `fake-indexeddb`, Playwright, and the first critical browser journey.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Phase 1.2A: model metadata characterization             | Complete | Merged in [PR #57](https://github.com/maklja/vision/pull/57): exhaustive tests for operator groups, entry classification, default templates, connection descriptors, cardinality, visibility, and malformed or unknown model inputs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Phase 1.2B: model geometry and fixture characterization | Complete | Merged in [PR #58](https://github.com/maklja/vision/pull/58): tests cover bounding boxes, line and polygon geometry, snap-line and grid boundaries, serialized model shapes, and a representative current-release saved-diagram fixture.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Phase 1.3: engine characterization                      | Complete | Merged in [PR #63](https://github.com/maklja/vision/pull/63), [PR #64](https://github.com/maklja/vision/pull/64), and [PR #65](https://github.com/maklja/vision/pull/65): core engine and worker protocol, creation and join-creation operators, and transformation, filtering, and error operators.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Phase 1.4: viewer state and component characterization  | Complete | Merged in [PR #71](https://github.com/maklja/vision/pull/71), [PR #74](https://github.com/maklja/vision/pull/74), [PR #75](https://github.com/maklja/vision/pull/75), [PR #79](https://github.com/maklja/vision/pull/79), and [PR #82](https://github.com/maklja/vision/pull/82): store slices, editor workflows, simulation state, IndexedDB persistence, palette, entry/simulation controls, error/property panel, and property forms; scoped Vitest coverage thresholds protect viewer store and non-canvas UI. Follow-up defects found during characterization were fixed in [PR #76](https://github.com/maklja/vision/pull/76), [PR #77](https://github.com/maklja/vision/pull/77), [PR #80](https://github.com/maklja/vision/pull/80), and [PR #83](https://github.com/maklja/vision/pull/83).                   |
| Phase 1.5: critical browser journeys                    | Complete | Merged through issue #85 ([PR #91](https://github.com/maklja/vision/pull/91)), issue #86 ([PR #92](https://github.com/maklja/vision/pull/92)), issue #87 ([PR #94](https://github.com/maklja/vision/pull/94)), issue #88 ([PR #96](https://github.com/maklja/vision/pull/96)), issue #89 ([PR #98](https://github.com/maklja/vision/pull/98)), and issue #90 ([PR #103](https://github.com/maklja/vision/pull/103)): the shared Playwright foundation and Worker probe, the linear, branch/join, persistence/viewport, clipboard/grouped-editing, error-recovery, cancellation, and GitHub Pages base-path journeys. Defects found while characterizing were fixed in issue #93 ([PR #95](https://github.com/maklja/vision/pull/95)), issue #97 ([PR #101](https://github.com/maklja/vision/pull/101)), and issue #99. |
| Phase 2.1: reproducible toolchain                       | Complete | Implemented in issue #106 ([PR #115](https://github.com/maklja/vision/pull/115)): Node.js 24.19.0 LTS and pnpm 12.6.0 pinned in `.nvmrc`/`.node-version`, the root `packageManager` and `engines`, the lockfile `packageManagerDependencies`, and CI; esbuild's build script approved for pnpm 12; the browser support policy documented.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Phase 2.2: lint and test tooling                        | Complete | Issue #107 / PR #116: ESLint 9 flat configuration, strict TypeScript 6, formatter and test-tool alignment, and repaired local/CI validation commands.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Phase 2.3A: build tooling                               | Complete | Issue #108 / PR #117: Vite 8.3.1, React plugin 6.1.1, and web-vitals 6.2.2; root and GitHub Pages base-path builds preserved.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Phase 2.3B: React                                       | Complete | Issue #109 / PR #118: React/React DOM 19.3.0 and aligned React Testing Library/type packages.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Phase 2.3C: viewer integrations                         | Complete | Issue #110 / PR #121: Material UI 9.4.0, date pickers 9.14.0, Emotion, Monaco, Day.js, and IndexedDB integration; React DnD retained after compatibility checks.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Phase 2.3D: canvas                                      | Complete | Issue #111 / PR #119: Konva 10.7.0, React Konva 19.3.0, and browser journeys in Chromium, Firefox, and WebKit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Phase 2.3E: state and utilities                         | Complete | Issue #112 / PR #122: Zustand 5.0.15, Immer 11.1.18, UUID 14.0.2, and utility/type updates without a persisted-model migration.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Phase 2.3F: RxJS                                        | Complete | Issue #113 / PR #123: RxJS 7.8.2 and full engine/Worker behavior characterization.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Phase 2.4: dependency maintenance                       | Complete | Merged in issue #114 ([PR #124](https://github.com/maklja/vision/pull/124)): Dependabot (`npm` ecosystem at the workspace root) groups patch and minor updates with a bound of five open pull requests and leaves every major update as its own pull request; the CI `dependency-audit` job runs `pnpm audit --audit-level high` and the production license gate `scripts/check-licenses.mjs`; the update, vulnerability, license, exception, and unused-dependency policy is documented in `DEPENDENCY_MAINTENANCE.md`; `@testing-library/user-event` and `eslint-plugin-prettier` were removed after a usage review.                                                                                                                                                                                                 |
| Phase 2: dependency updates                             | Complete | Verified 2026-10-01: issues #106–#114 closed as completed, all nine implementation PRs merged, and final CI run #125 passed the behavior/coverage/build/browser and dependency-audit jobs. See the Phase 2 verification record below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Phase 3: old PR triage                                  | Ready    | Planned as 3.1 inventory, 3.2 subscription requirements, 3.3 execution context/parameter/code-generation decisions, and 3.4 traceability and closure. PRs #40, #42, and #50 are still open; no replacement feature is implemented by this planning update.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

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

| Area               | Current state                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structure          | pnpm TypeScript monorepo with model, engine, and React viewer packages.                                                                                                                                                                                                                                                                                                           |
| Model              | Elements, connect points and lines, connection descriptors, defaults, and geometry helpers.                                                                                                                                                                                                                                                                                       |
| Engine             | Builds actual RxJS observables and reports flow events; normally runs in a Web Worker.                                                                                                                                                                                                                                                                                            |
| Viewer             | React, React Konva, Material UI, React DnD, Zustand, and Immer.                                                                                                                                                                                                                                                                                                                   |
| Persistence        | One diagram is stored in IndexedDB under the temporary key `test`; no schema version exists.                                                                                                                                                                                                                                                                                      |
| Existing operators | 11 creation, 6 join-creation, 10 transformation, `filter`, and `catchError`.                                                                                                                                                                                                                                                                                                      |
| Tests              | Vitest/V8 characterization covers model, engine, viewer, IndexedDB persistence, and the license audit. The latest local suite passed 650 tests in 55 files. Playwright exercises critical journeys against the `/vision/` production build in Chromium, Firefox, and WebKit with one worker and zero retries; coverage thresholds enforce 70% for viewer store and non-canvas UI. |
| CI                 | Frozen-lockfile install, formatting, lint, strict typecheck, tests with coverage, production build, and all three browser engines; a separate job runs vulnerability and production-license gates on pull requests and pushes to `main`.                                                                                                                                          |
| Lint               | ESLint 9 flat configuration checks TypeScript/TSX in all packages through `pnpm lint`; package-level `pnpm -r eslint` uses `eslint src`. The empty `.js` glob and ESLint API mismatch were resolved in PR #116.                                                                                                                                                                   |
| Build              | The viewer production build succeeds.                                                                                                                                                                                                                                                                                                                                             |
| Backlog            | Three older feature pull requests are still open.                                                                                                                                                                                                                                                                                                                                 |

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

Phase 1.4 notes:

- Viewer component tests replace `react-konva` and `@monaco-editor/react` with light doubles so
  accessible controls, callbacks, and store state can be asserted without canvas pixels.
- At the Phase 1.4 checkpoint, `pnpm -r eslint` failed on an empty `.js` glob and the old
  `@typescript-eslint/no-empty-function` API mismatch. Both were resolved in Phase 2.2 / PR #116;
  the current validation commands pass.

### 1.5 Critical browser journeys

Complete. The shared support foundation (`e2e/support`) and a test-only `Worker` probe back a
Playwright suite that runs against a production viewer build created with the Vite base `/vision/`
and served by Vite preview, so every journey also exercises the GitHub Pages subpath.

1. Build `of -> map -> filter -> subscriber`, run it, and observe the expected result events.
   Covered by `e2e/editor-simulation.spec.ts`.
2. Build a branch and a join graph and verify connection and execution order. Covered for a `concat`
   fan-in graph by `e2e/branch-join.spec.ts`, which builds the graph through palette drops and canvas
   gestures, edits the ordered event inputs, and asserts the resulting Worker execution order.
3. Configure an operator, reload, and verify that the diagram and viewport are restored. Covered by
   the persistence journey in `e2e/persistence-viewport.spec.ts`, which renames and reconfigures a
   `range` element, pans and zooms the stage, reloads, and asserts the restored graph, viewport, and
   property panel.
4. Copy, paste, multi-select, move, reconnect, and delete a group. Covered by
   `e2e/clipboard-group.spec.ts`.
5. Pan, zoom, snap to grid, and locate an entry element. Covered by the viewport journey, which
   shift-drags a `range` entry onto a 25-unit grid multiple, checks that its connect-line endpoint
   follows, pans and zooms, then locates the element and asserts the reset scale, centered viewport,
   and sole selection.
6. Trigger a creation error and a runtime error and recover without reloading. Both paths are
   covered from persisted fixtures in `e2e/error-recovery.spec.ts`.
7. Start an infinite source, stop it, and verify that the worker and animations are cleaned up.
   Covered by `e2e/infinite-source.spec.ts`, which stops an `interval` entry, observes the cleared
   state, restarts it in a fresh worker, and verifies that the restarted run renders fresh canvas
   animations.
8. Load the production build under the GitHub Pages base path. Covered by
   `e2e/github-pages-base.spec.ts`, which mounts the editor at `/vision/`, fails on any unsuccessful
   or off-base script, stylesheet, dynamic chunk, or Worker request, and runs a seeded
   `of -> subscriber` graph to prove the dynamically imported engine chunk and the simulation Worker
   resolve and execute below the subpath.

Phase 1.5 notes:

- The runner is self-contained: `pnpm test:e2e` builds the viewer with `VISION_BASE_PATH=/vision/`
  and serves the generated `build/` output through `vite preview`; the ordinary `pnpm build` still
  emits the root-`/` base and `docs/` is not regenerated.
- Editor navigation is centralized in `e2e/support/base.ts`, so journeys never assume `/`.
- Phase 1 initially ran Chromium only. Phase 2.3D / PR #119 expanded the same journeys to
  Chromium, Firefox, and WebKit while retaining one worker and zero retries.
- `e2e/persistence-viewport.spec.ts` no longer needs its former short-viewport skip: the operator
  palette overlap defect #93 was fixed in PR #95.

### Phase 1 gate

Complete as of 2026-09-28:

- All current operators and critical flows are covered.
- Tests are deterministic and pass repeatedly: `pnpm test:e2e` ran three consecutive times with no
  retries, and `pnpm typecheck`, `pnpm test`, `pnpm test:coverage`, and `pnpm build` are green.
- The production build remains unchanged in behavior: `pnpm build` still emits the root-`/` base and
  `docs/` is not regenerated.
- Known failures are written as explicit skipped tests linked to issues, never left undocumented. The
  suite currently contains no skipped or focused tests.

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

### Phase 2 verification record — 2026-10-01

**Result: complete.** The reviewed source is now on `main` at `41a6b66fbbe292f9983ab4dd451c566db7e0f416`.
Issues #106–#114 are closed with reason `completed`, and PRs #115, #116, #117, #118, #121,
#119, #122, #123, and #124 are merged. Their manifests, toolchain pins, lockfile, migration notes
in the README, CI configuration, and maintenance policy were checked against the issue targets.
The later removal of unused `@testing-library/user-event` and `eslint-plugin-prettier` is recorded
in the maintenance policy rather than an unfinished upgrade.

| Gate                  | Evidence                                                                                                                                                                                                                                        | Result |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Reproducible install  | Node 24.19.0 and pnpm 12.6.0 agree across version files, root manifest, and CI; only `pnpm-lock.yaml` is tracked; `allowBuilds.esbuild` is explicit; final CI frozen install passed.                                                            | Pass   |
| Tooling and behavior  | [CI run #125](https://github.com/maklja/vision/actions/runs/36831223592) on final PR #124 head `136eb29` passed format, lint, typecheck, coverage, production build, and browser tests. Its source tree is identical to the merged `main` tree. | Pass   |
| Browser compatibility | The same CI job installed and ran Chromium, Firefox, and WebKit; `playwright.config.ts` retains one worker, zero retries, and the `/vision/` production-build/Worker check.                                                                     | Pass   |
| Dependency security   | The CI `dependency-audit` job passed both gates; the latest local `pnpm audit:dependencies` reported no known vulnerabilities and allowed all 108 production packages.                                                                          | Pass   |
| Maintenance           | Weekly Dependabot patch/minor grouping, separate majors, five-open-PR limit, no automatic merging, and documented license/security exception policy are present. Audit tests cover malformed SPDX expressions and complete UTC review days.     | Pass   |

This establishes completion of the upgrade scope, not completion of future performance or feature
work. The existing large-chunk build advisory belongs to Phase 7. The documented preview-server
shutdown/launcher TODO is a tooling follow-up; the browser job is green and it is not an open
Phase 2 blocker. No new version target is introduced by the Phase 3 planning work.

## Phase 3: triage the existing feature pull requests

**Status: ready, not complete.** Phase 2 has passed its gate. Phase 3 produces reviewed decisions,
requirements, examples, and implementation issues; feature code belongs to Phases 4 and 6.
Start from the upgraded `main`, not from an old feature branch.

### Current candidates

Snapshot verified on 2026-10-01 against `main` commit `41a6b66`. Ahead/behind counts were calculated
with `git rev-list --left-right --count main...<branch>`; refresh them at the start of triage.
These are recommendations for review, not final keep/drop decisions.

| Source PR                                                              | Head / divergence              | Candidate value                                                                                              | Proposed disposition                                                                                                                                                     |
| ---------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [#50 Subscription event](https://github.com/maklja/vision/pull/50)     | `f74b2fa`; 9 ahead, 44 behind  | Subscription lifecycle, branch correlation, subscription-line styling, editing during a run, and scheduling. | Triage first. Extract requirements and event fixtures for Phase 4.4; compare with current animation reset, cancellation, and queue bounds before retaining old behavior. |
| [#40 Context code execution](https://github.com/maklja/vision/pull/40) | `1c24e51`; 24 ahead, 61 behind | Shared execution context, pre-execution hooks, expression-backed properties, and early code generation.      | Reference prototype. Extract execution/trust decisions for Phase 4.3 and code-generation requirements for Phase 6.3.                                                     |
| [#42 Override parameters](https://github.com/maklja/vision/pull/42)    | `254a902`; 13 ahead, 53 behind | Runtime parameter expressions, broader property forms, and code generation overlapping #40.                  | Consolidate overlapping requirements with #40. Defer parameter persistence to Phase 4.1/4.3 and code generation to Phase 6.3.                                            |

#40 and #42 use the old single-package source layout; #42 also adds an npm lockfile. #50 uses the
monorepo but changes engine, model, and many drawers and predates subsequent animation fixes.
None should be merged or rebased wholesale. Isolated commits may be reused only after a written
compatibility review and relevant tests on current `main`; clean reimplementation is the default.

### 3.1 Inventory and traceability foundation

Deliver a documentation-only PR adding `planning/legacy-pr-triage.md` and updating this plan.

- Inspect each source PR's complete diff and discussion at its recorded head. Compare against
  current source and characterization tests; running an old branch is optional when static
  inspection cannot clarify a behavior, and should use an isolated checkout.
- Make one row per independent requirement: source PR/head/path, user-visible behavior, current-main
  equivalent, overlap, proposed keep/drop/defer decision, reason, target phase, and test/fixture needs.
- Record unfinished/experimental code separately from behavior worth preserving. Identify behavior
  already covered by current animation, cancellation, error, or persistence handling.
- List unanswered product decisions explicitly. Do not treat a prototype's implementation choice as
  an accepted contract or mark a requirement retained without a stated user benefit.

Acceptance: every meaningful change in all three PRs is mapped to a requirement or a reason for
excluding it; duplicate ideas have one canonical record. This step unblocks 3.2 and 3.3.

### 3.2 Subscription and flow-event requirements from #50

Deliver a focused design PR updating the inventory and adding
`planning/decisions/subscription-flow-events.md`; create the corresponding implementation issues.

- Define subscribe/next/error/complete/unsubscribe semantics, sequence ordering, subscription and
  branch identity, dependency/path correlation, and observable errors versus Worker failures.
- Include expected event traces for a linear source, branch/join graph, inner cancellation, errors,
  and an infinite source stopped and restarted. Distinguish normal completion from unsubscription.
- Decide which line styling and editing restrictions are needed, including an accessible non-color
  representation; specify deterministic timing and bounded event/animation retention.
- Reconcile proposed behavior with the current `FlowManager`, Worker protocol, and animation tests.
  Record compatibility requirements for existing callbacks and persisted diagrams.
- Split retained scope into a Phase 4.4 protocol/engine issue and a dependent visualization/state
  issue; create separate scheduling/retention work only if the inventory shows an independent gap.

Acceptance: every retained #50 requirement has an issue and an expected trace or UX example;
conflicting or redundant prototype behavior has a written drop decision. No protocol or UI feature
is implemented in this triage PR.

### 3.3 Consolidated context, parameter, and code-generation decisions from #40/#42

Deliver a second design PR updating the inventory and adding
`planning/decisions/execution-context-and-parameters.md`; create focused implementation issues.

- Decide context lifetime and isolation (per diagram/run/subscription), initialization ordering,
  cancellation, restart behavior, supported variables/functions, and expression diagnostics.
- Specify literal versus expression parameter values, defaults, missing/invalid values, field UX,
  and a serializable representation. Record migration requirements for Phase 4.1 without changing
  today's persisted model during triage.
- Document the trust boundary for local versus imported/shared diagrams, Worker execution and the
  main-thread fallback, network access, time limits, and unsupported/untrusted content. Specify
  restrictions required before future sharing; do not equate a Worker with a security sandbox.
- Consolidate duplicate generators into one Phase 6.3 requirement: supported graph constructs,
  readable RxJS output, deterministic naming, copy/export behavior, and explicit diagnostics for
  constructs that cannot be represented faithfully.
- Create separate execution-context/validation, parameter-model/UX, and code-generation issues.
  Context and parameters depend on Phase 4.1/4.3; generation follows stabilized operator/event
  contracts and remains Phase 6.3 work. Record compatibility and focused test cases on every issue.

Acceptance: every retained #40/#42 requirement has one canonical issue and an example; duplicate,
unsafe, or unnecessary approaches have a documented drop/defer reason. No new operator or public
sharing/execution feature is introduced.

### 3.4 Backlog handoff and superseded-PR closure

Deliver a final documentation PR after 3.2 and 3.3 are accepted.

- Check that every requirement row has a final decision, rationale, target phase, and traceability
  link to an accepted ADR, fixture/test, or implementation issue. Eliminate unresolved duplicates.
- Each implementation issue must name its source PR and exact reference paths/head, dependencies,
  scope exclusions, user-visible acceptance criteria, relevant test scenarios, compatibility/data
  impact, and documentation/security/accessibility/performance considerations.
- Link the reviewed triage records and replacement issues from each old PR, then close #40, #42,
  and #50 as superseded. Preserve the reference branches/history; branch deletion is unnecessary.
- Mark Phase 3 complete only after the decisions are accepted and all three old PRs are closed.
  Order the Phase 4 backlog: versioned persistence, execution/parameter contracts, flow-event
  protocol, and operator-definition integration, with dependencies recorded explicitly.

Acceptance: the old PRs no longer appear merge-ready, every valuable idea remains discoverable,
and Phase 4 can be implemented from current `main` without interpreting the old branches again.

### Delivery sequence and validation

| Step | Depends on           | Reviewable output                                                 | Status  |
| ---- | -------------------- | ----------------------------------------------------------------- | ------- |
| 3.1  | Phase 2 gate         | Complete requirement inventory and overlap map                    | Planned |
| 3.2  | 3.1                  | Subscription/event decision, example traces, and Phase 4.4 issues | Planned |
| 3.3  | 3.1                  | Context/parameter decision and Phase 4/6 issues                   | Planned |
| 3.4  | Accepted 3.2 and 3.3 | Linked handoff, old-PR closure, and Phase 3 gate update           | Planned |

Use one PR per step. Keep the current Node/pnpm/RxJS baseline. Documentation-only work requires
formatting and traceability/link checks; normal CI still runs. Any executable prototype or added
characterization test must run the relevant tests plus the existing format/lint/typecheck/build
checks. Do not weaken existing coverage thresholds or browser checks to accommodate old code.

### Phase 3 gate

- Every independent old-PR requirement has a reviewed keep/drop/defer decision and rationale.
- Every retained behavior is represented by accepted tests/fixtures, ADRs, or actionable issues with
  target phases and dependencies. Deferred work has an explicit destination, not an unlinked TODO.
- Execution trust, parameter persistence, and event compatibility decisions are explicit; blockers
  are resolved or recorded as dependencies that prevent the corresponding implementation.
- #40, #42, and #50 are closed with replacement links and their reference history preserved.
- This plan records the gate evidence; Phase 4 may start and operator expansion remains gated on
  its contracts. Planning this phase does not satisfy the gate by itself.

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
