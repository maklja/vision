# AGENTS.md

## Project purpose

RxJS Vision is a browser-only visual editor and simulator for RxJS observable pipelines. Users drag
operators onto a canvas, connect them into a graph, configure their properties, choose an entry
operator, and run the graph. The application executes actual RxJS observables and animates values,
errors, subscriptions, and completion as they travel through the diagram.

The project is alpha software. Preserve its existing architecture and keep changes narrowly scoped;
do not add speculative abstractions or unrelated cleanup.

## Architecture

This repository is a TypeScript pnpm workspace with three packages:

- `packages/simulator-model`: framework-independent domain model. It owns element and connection
  types, operator property types, connection descriptors, geometry utilities, and default operator
  templates. Both the engine and viewer depend on it.
- `packages/simulator-engine`: converts model graphs into RxJS observables. `SimulationGraph`
  resolves graph branches, factories build operators, and `DefaultFlowManager` reports trace events.
  `startObservableSimulation` runs the engine in `observableSimulationWorker.ts` when Web Workers are
  available and falls back to the main thread otherwise.
- `packages/simulator-viewer`: React 18 application. React Konva renders the canvas, Material UI
  provides controls, React DnD handles palette drops, and Zustand/Immer slices hold editor and
  simulation state. `App.tsx` persists the current diagram, viewport, and theme to IndexedDB with
  `idb-keyval`.

Runtime flow:

1. The viewer edits an in-memory graph made from model elements and connect lines.
2. The user selects a creation or join-creation element as the simulation entry point.
3. The viewer dynamically loads the engine and passes it the graph.
4. The engine validates the graph, creates the RxJS pipeline, and emits `FlowValueEvent` records.
5. The viewer queues animations for those events and draws transient result elements.

There is no backend, API, authentication, or server-side persistence. Browser IndexedDB currently
stores one diagram under the temporary key `test`.

## Important paths

- `packages/simulator-model/src/element/ElementType.ts`: supported operator types and groupings.
- `packages/simulator-model/src/descriptors/`: connection compatibility and cardinality.
- `packages/simulator-model/src/templates/`: default properties for newly created operators.
- `packages/simulator-engine/src/ObservableSimulation.ts`: graph-to-observable entry point.
- `packages/simulator-engine/src/factory/`: RxJS creation and pipe operator factories.
- `packages/simulator-engine/src/startObservableSimulation.ts`: worker lifecycle and public
  simulation callbacks.
- `packages/simulator-viewer/src/store/`: Zustand state slices and cross-slice root store.
- `packages/simulator-viewer/src/operatorDrawers/`: canvas rendering for each operator family.
- `packages/simulator-viewer/src/ui/properties/`: operator property editors.
- `packages/simulator-viewer/src/simulator/`: composition of the stage and floating controls.
- `docs/`: generated static GitHub Pages output; do not treat it as source code.

## Development commands

Run commands from the repository root.

```bash
pnpm install --frozen-lockfile
pnpm --filter @maklja/vision-simulator-viewer start
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm -r eslint
pnpm build
```

The development server uses port 3000. The viewer build is written to
`packages/simulator-viewer/build`.

The automated characterization suite is being built incrementally. For every change, run the tests
and type checks, run the linters for the affected packages, and build the viewer. Manually exercise
relevant editor behavior for interaction or animation changes until its browser journey is covered.

## Coding conventions

- Keep TypeScript strict and resolve type errors; the shared config enables `strict`,
  `strictNullChecks`, and `noUnusedLocals`.
- Follow `.prettierrc`: tabs, single quotes, semicolons, trailing commas, and a 100-character print
  width. Avoid reformatting unrelated files.
- Keep domain concepts in `simulator-model`, RxJS execution in `simulator-engine`, and rendering or
  interaction state in `simulator-viewer`.
- Use the existing `ElementType` sets and descriptor helpers instead of duplicating operator-family
  checks.
- Keep Zustand updates inside the appropriate slice and preserve Immer-style mutations already used
  by the store.
- Keep browser-only APIs in the viewer or the worker boundary. The model package should remain
  framework-independent.
- Preserve worker-safe data transfer: objects passed to the simulation worker must be cloneable by
  the browser's structured clone algorithm.
- Do not edit bundled files under `docs/assets` by hand. Update source packages first and regenerate
  deployment artifacts only when the task includes publishing the demo.

## Adding or changing an operator

An operator usually spans all three packages. Check each applicable step:

1. Add or update its `ElementType`, model interface, exports, grouping, default template, and
   connection descriptor in `simulator-model`.
2. Add or update the corresponding RxJS factory behavior in `simulator-engine` and preserve event
   tracing through `FlowManager`.
3. Add or update the canvas drawer, palette mapping, property form, and theme values in
   `simulator-viewer`.
4. Verify valid and invalid connections, property editing, start/stop/reset behavior, error handling,
   and persistence after a reload.
5. Run `pnpm -r eslint` and the viewer production build.

When changing stored model shapes, account for diagrams already persisted in IndexedDB. Prefer
backward-compatible defaults or an explicit migration over assuming a fresh browser database.
