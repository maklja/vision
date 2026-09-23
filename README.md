# RxJS Vision

[Live demo](https://maklja.github.io/vision/)

RxJS Vision is a browser-based visual editor and simulator for learning and exploring
[RxJS](https://rxjs.dev/) observable flows. It lets you build a pipeline by placing RxJS
operators on a canvas, connecting them into a graph, configuring their properties, and watching
values move through the graph when the simulation runs.

The project is currently in alpha, so features are incomplete and bugs are expected.

## What you can do

- Drag RxJS creation, join-creation, transformation, filtering, error-handling, and subscriber
  operators onto a canvas.
- Connect compatible operator inputs, outputs, and observable-event inputs.
- Edit operator names, positions, parameters, and inline JavaScript expressions.
- Select an entry operator and start, stop, or restart its observable simulation.
- Follow next, error, subscription, and completion events through animated connections and result
  nodes.
- Pan and zoom the canvas, select multiple elements, and copy and paste parts of a diagram.
- Continue where you left off: the current diagram, viewport, and theme are stored in the browser's
  IndexedDB.

Supported operators currently include `of`, `from`, `interval`, `timer`, `ajax`, `generate`,
`range`, `defer`, `iif`, `empty`, `throwError`, `combineLatest`, `merge`, `concat`, `forkJoin`,
`race`, `zip`, `map`, `filter`, `buffer`, `bufferCount`, `bufferTime`, `bufferToggle`, `bufferWhen`,
`concatMap`, `exhaustMap`, `expand`, `mergeMap`, and `catchError`.

## How it works

RxJS Vision is a TypeScript monorepo managed with pnpm:

| Package | Responsibility |
| --- | --- |
| `@maklja/vision-simulator-model` | Shared graph types, operator models, connection rules, and default property templates. |
| `@maklja/vision-simulator-engine` | Converts a valid graph into real RxJS observables and emits trace events. It runs in a Web Worker when the browser supports workers. |
| `@maklja/vision-simulator-viewer` | React application containing the Konva canvas, Material UI controls, Zustand state, persistence, and event animations. |

The viewer sends the selected entry element and the diagram to the engine. The engine validates the
graph, constructs the observable chain, and reports each value or error with its path through the
connections. The viewer turns those events into canvas animations. Everything runs locally in the
browser; the application has no server-side component.

## Development

### Prerequisites

- A current Node.js LTS release
- pnpm compatible with lockfile version 9 (pnpm 9 or newer)

Install the workspace dependencies:

```bash
pnpm install --frozen-lockfile
```

Start the viewer at `http://localhost:3000`:

```bash
pnpm --filter @maklja/vision-simulator-viewer start
```

Run the available validation checks:

```bash
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
```

The existing lint configuration will join the required CI checks after its ESLint and TypeScript
ESLint dependency mismatch is repaired in the dependency-modernization phase.

The production viewer build is written to `packages/simulator-viewer/build`. The versioned `docs/`
directory contains the static build served by GitHub Pages.

## Repository structure

```text
packages/
  simulator-model/   Shared diagram and operator domain model
  simulator-engine/  Graph validation and RxJS execution
  simulator-viewer/  React visual editor and simulator UI
docs/                 Generated GitHub Pages application
```
