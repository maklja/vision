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
pnpm exec playwright install chromium firefox webkit
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

The viewer runs React and React DOM 19.3.0 with `react-konva` 19.3.0. `react-konva` 18 cannot be
used here: it depends on `react-reconciler` 0.29, which reads React 18's shared internals
(`React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`) that React 19 removed, so the module
throws while the canvas mounts. React 19 also narrowed callback refs to return nothing or a cleanup
function, while `react-dnd` 16 still types its connectors as React 18 legacy refs that return the
attached element. `toRefCallback` in `packages/simulator-viewer/src/dragNDrop/reactDndRef.ts` adapts
those connectors; the runtime behavior is unchanged because React ignores the returned element. The
React Compiler is intentionally disabled.

Component tests use `@testing-library/react` 16, which supports React 18 and 19. The testing-only
packages live in the root `devDependencies` because no runtime source imports them; root
`devDependencies` are pinned exactly, so the upgrade stays reproducible.

The canvas renders with Konva 10.7.0. Konva 10 changed the running-animation registry from an array
to a `Set`, so the browser journeys read `Konva.Animation.animations` as a set in
`e2e/support/canvasAnimations.ts`. No application source needed a Konva 10 migration: the pointer
handling, transforms, hit testing, tweens, and connection geometry the viewer uses are unchanged.
No Node canvas implementation (`canvas` or `skia-canvas`) is installed; those exist for non-browser
use only.

The controls render with Material UI 9.4.0, with `@mui/material` and `@mui/icons-material` on the
same release, Emotion 11.14, and `@mui/x-date-pickers` 9.14 on the Day.js adapter. Material UI 9
removed the system props from `Box` and `Stack`, so the viewer passes `display`, `gap`,
`alignItems`, `justifyContent`, and `width` through `sx`. It also removed `InputProps`,
`InputLabelProps`, and the lowercase `inputProps` from `TextField`, so the forms use
`slotProps.input` for the input component, `slotProps.inputLabel` for the floating label, and
`slotProps.htmlInput` for the DOM input, including its `min`. The palette moves its single `Grid`
from the legacy `item`/`xs` API to `size={{ xs: 4 }}`. React DnD stays at 16.0.1, its latest stable
release, and keeps working against React 19.3.0.

`@mui/icons-material` 9 ships an `exports` map with ESM conditions, so the Vite alias that pointed
`@mui/icons-material/<Icon>` at the package's `esm/` build is gone; with the previous CommonJS
subpath resolution a default import returned a module namespace object instead of the icon
component. The Material UI, Emotion, and date-picker group is 413.93 kB raw and 129.39 kB gzip of
the main chunk, and the main viewer chunk grows from 1,100.98 kB to 1,172.19 kB raw and from
334.14 kB to 354.95 kB gzip.

The code editor keeps `@monaco-editor/react` 4.7.0 with `monaco-editor` 0.57.0. The viewer never
calls `loader.config({ monaco })`, so the mounted editor is still the CDN build the loader pins. The
npm package is type-only in this build and no editor core is bundled. Persistence keeps
`idb-keyval` 6.3.0 with the same `test` key and the same persisted shapes, so no IndexedDB migration
is required.

The production viewer build is written to `packages/simulator-viewer/build`. The versioned `docs/`
directory contains the static build served by GitHub Pages.

### Supported browsers

RxJS Vision supports the current and previous stable release of Chromium, Firefox, and
WebKit/Safari. Browser automation uses the Playwright-managed browser revisions pinned by the exact
`@playwright/test` version in `pnpm-lock.yaml`, and `pnpm test:e2e` runs every journey in Chromium,
Firefox, and WebKit.

One engine difference is recorded rather than normalized. Chromium forwards an uncaught error thrown
inside the simulation Worker to the page, where `startObservableSimulation` logs it and terminates
the worker. Firefox and WebKit leave the worker silent, so that safety-net listener does not run
there. Recovery from a creation error does not depend on it, because the viewer unsubscribes and
that terminates the worker in every engine, so `e2e/error-recovery.spec.ts` asserts the diagnostic
log on Chromium and asserts the recovery outcome everywhere.

## Repository structure

```text
packages/
  simulator-model/   Shared diagram and operator domain model
  simulator-engine/  Graph validation and RxJS execution
  simulator-viewer/  React visual editor and simulator UI
docs/                 Generated GitHub Pages application
```
