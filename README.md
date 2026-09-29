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

| Package                           | Responsibility                                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `@maklja/vision-simulator-model`  | Shared graph types, operator models, connection rules, and default property templates.                                               |
| `@maklja/vision-simulator-engine` | Converts a valid graph into real RxJS observables and emits trace events. It runs in a Web Worker when the browser supports workers. |
| `@maklja/vision-simulator-viewer` | React application containing the Konva canvas, Material UI controls, Zustand state, persistence, and event animations.               |

The viewer sends the selected entry element and the diagram to the engine. The engine validates the
graph, constructs the observable chain, and reports each value or error with its path through the
connections. The viewer turns those events into canvas animations. Everything runs locally in the
browser; the application has no server-side component.

## Development

### Prerequisites

- Node.js 24.19.0 LTS (Krypton). The exact version is pinned in `.nvmrc` and `.node-version` and
  declared by the root `engines` field.
- pnpm 12.6.0. The exact version is pinned by the root `packageManager` field, so Corepack and CI
  install the same release.

`pnpm-lock.yaml` is the only tracked dependency lockfile. Do not add a `package-lock.json` or a
`yarn.lock`.

Install the workspace dependencies:

```bash
pnpm install --frozen-lockfile
```

Start the viewer at `http://localhost:3000`:

```bash
pnpm start
```

Run the available validation checks:

```bash
pnpm typecheck
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
```

These root workspace scripts are the canonical local and CI commands; the workflow in
`.github/workflows/ci.yml` runs the same scripts after installing with `--frozen-lockfile`.

Linting uses ESLint 9's flat configuration in `eslint.config.mjs`. It covers TypeScript and TSX
sources in every workspace package; package-level legacy `.eslintrc` and `eslintConfig` settings
are intentionally not used. Formatting is checked separately with Prettier.

The viewer is built with Vite 8, which bundles with Rolldown and transforms JavaScript with Oxc.
`@vitejs/plugin-react` 6 keeps the default React path; no optional Oxc or React Compiler packages
are installed. Performance metrics use `web-vitals` 6, which removed the `getFID` metric and only
exports the `on*` readers.

Vite 8 handles CommonJS default imports with Node's semantics. The `@mui/icons-material/<Icon>`
imports therefore resolve to the package's `esm/` build through a `resolve.alias` entry in
`packages/simulator-viewer/vite.config.js`; without it the CommonJS subpath modules resolve to a
module namespace object instead of the icon component. Remove the alias when the Material UI
upgrade ships `exports` maps with ESM conditions.

The production viewer build is written to `packages/simulator-viewer/build`. The versioned `docs/`
directory contains the static build served by GitHub Pages.

### Supported browsers

RxJS Vision supports the current and previous stable release of Chromium, Firefox, and
WebKit/Safari. Browser automation uses the Playwright-managed browser revisions pinned by the exact
`@playwright/test` version in `pnpm-lock.yaml`.

## Repository structure

```text
packages/
  simulator-model/   Shared diagram and operator domain model
  simulator-engine/  Graph validation and RxJS execution
  simulator-viewer/  React visual editor and simulator UI
docs/                 Generated GitHub Pages application
```
