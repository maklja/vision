# Dependency maintenance and audit policy

This document is the source of truth for how dependencies are updated, which licenses and
advisories may ship, and how accepted findings are recorded. `.github/dependabot.yml` implements the
update cadence, `scripts/check-licenses.mjs` implements the license gate, and the
`dependency-audit` job in `.github/workflows/ci.yml` runs both audit gates.

## Update automation

Dependabot is used instead of Renovate because it is GitHub-native: the `npm` package ecosystem
understands the root `pnpm-workspace.yaml`, `pnpm-lock.yaml` stays the only lockfile, and no
third-party GitHub Action or bot account is introduced.

| Setting               | Value                                                                      | Rationale                                                                      |
| --------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Ecosystem / directory | `npm` at `/`                                                               | One entry covers every workspace package through the root pnpm workspace.      |
| Cadence               | Weekly, Monday 06:00 Europe/Belgrade                                       | Predictable review window in the maintainer time zone.                         |
| Grouping              | One `npm-patch-minor` group with `patterns: ['*']` for `minor` and `patch` | Patch and minor updates share one reviewable pull request.                     |
| Major updates         | Not grouped                                                                | Every major version opens its own pull request with its own migration review.  |
| Open pull requests    | 5                                                                          | Bounds the review queue; stale pull requests rebase as the queue frees up.     |
| Auto-merge            | Never enabled                                                              | No update merges without the full CI workflow passing and a human review.      |
| Version strategy      | `increase`                                                                 | Advances the exact `package.json` pins this repository treats as the baseline. |
| Label                 | `dependencies`                                                             | Keeps the dependency queue filterable.                                         |

### Version policy

- The exact versions recorded in issues #106–#113 are the Phase 2 baseline and are green on `main`.
- Patch and minor proposals may advance that baseline only after the complete Phase 1 behavior suite
  and the rest of CI pass on the pull request.
- A major update needs a dedicated issue with migration notes and compatibility checks before its
  pull request is merged. Dependabot opens those pull requests; do not merge them directly.
- Security updates from Dependabot alerts are handled like patch updates and take priority over the
  weekly cadence.

## Vulnerability policy

- Gate: `pnpm audit:vulnerabilities`, which runs `pnpm audit --audit-level high`.
- High and critical advisories fail CI. Moderate and low advisories are reported by Dependabot and
  reviewed, but do not fail the build.
- CI runs the gate on every pull request and every push to `main` in the `dependency-audit` job.

### Accepted findings

There are currently no accepted vulnerability findings.

When an advisory cannot be remediated immediately, it is accepted only by adding a row to this
table in the same pull request that introduces the exception:

| Finding | Package | Severity | Owner | Rationale | Review by |
| ------- | ------- | -------- | ----- | --------- | --------- |
| none    |         |          |       |           |           |

Rules:

- Every accepted finding records an owner, a written rationale, and a review date at most 90 days
  out. The review date is re-checked at each dependency pull request; when it passes, the finding is
  either remediated or renewed with a new rationale and review date.
- Suppressing an advisory with `pnpm.auditConfig`, `--ignore`, or a similar mechanism without a table
  row is not an accepted finding and does not satisfy this policy.

### Security overrides

An advisory that has a patched release inside the affected major line is fixed with `overrides` in
`pnpm-workspace.yaml`, scoped to that major line so unrelated consumers keep the versions they need.
An override must correspond to a fixed advisory, must not cross a major boundary, and is re-validated
by `pnpm audit:vulnerabilities` in the same pull request.

Current overrides and the advisories they close (2026-10-01):

| Override            | Resolved | Closes                                                                                                                                                                 |
| ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@babel/runtime@7`  | 7.29.7   | GHSA-968p-4wvh-cqc8                                                                                                                                                    |
| `brace-expansion@1` | 1.1.21   | GHSA-3jxr-9vmj-r5cp, GHSA-mh99-v99m-4gvg, GHSA-rgw5-rvv9-x895, GHSA-qhr7-859c-m2p7, GHSA-6j4f-fj2g-mc7p, GHSA-f886-m6hf-6m8v, GHSA-q2hr-2g5m-vwhr, GHSA-v6h2-p8h4-qcjw |
| `dompurify@3`       | 3.4.16   | GHSA-p98j-92pf-mc4p                                                                                                                                                    |
| `flatted@3`         | 3.4.4    | GHSA-25h7-pfq9-p65f, GHSA-rf6f-7fwh-wjgh                                                                                                                               |
| `minimatch@3`       | 3.1.5    | GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74                                                                                                          |
| `yaml@1`            | 1.10.3   | GHSA-48c2-rrv3-qjmp                                                                                                                                                    |

The gate reports zero known vulnerabilities after these overrides, so there are no accepted
vulnerability findings.

## License policy

- Gate: `pnpm audit:licenses`, which runs `scripts/check-licenses.mjs` over
  `pnpm licenses list --prod --json`. The gate covers the production dependency graph only, because
  build and test tooling is never shipped to users.
- The gate fails closed: a license expression that is neither allow-listed nor covered by an
  accepted finding fails CI with the package name and license in the message.
- SPDX expressions are evaluated structurally. `OR` passes when any alternative is allowed, and
  `AND` passes only when every requirement is allowed. For example, `(MPL-2.0 OR Apache-2.0)` ships
  under Apache-2.0.

### Allowed licenses

`0BSD`, `Apache-2.0`, `BlueOak-1.0.0`, `BSD-2-Clause`, `BSD-3-Clause`, `CC0-1.0`, `ISC`, `MIT`,
`MIT-0`, `Python-2.0`, `Unlicense`, `Zlib`.

These permissive licenses need no per-package review. Changing this list is a policy change and must
be explained in the pull request that changes it.

### Denied licenses

`AGPL-3.0-only`, `AGPL-3.0-or-later`, `BUSL-1.1`, `CC-BY-NC-4.0`, `GPL-2.0-only`,
`GPL-2.0-or-later`, `GPL-3.0-only`, `GPL-3.0-or-later`, `LGPL-2.1-only`, `LGPL-2.1-or-later`,
`LGPL-3.0-only`, `LGPL-3.0-or-later`, `SSPL-1.0`, `UNLICENSED`.

Copyleft and source-available licenses are rejected by default. Shipping one requires a dedicated
issue with a legal-review note before an accepted finding is recorded.

### Accepted license findings

There are currently no accepted license findings. `acceptedFindings` in `scripts/check-licenses.mjs`
is the time-boxed override: each entry names the package and license expression and records an
owner, a rationale, and a `reviewBy` date no more than 90 days out. An expired entry fails CI with
the package and license in the message, even if the dependency was removed, changed license, or
became allow-listed. Every exception is validated before inventory matches are applied.

### Current production inventory

Snapshot from 2026-10-01: 108 packages — MIT 98, BSD-3-Clause 3, Apache-2.0 3, ISC 2, 0BSD 1, and
`(MPL-2.0 OR Apache-2.0)` 1. No package needed an exception. Refresh the snapshot when the inventory
or the allow list changes materially.

## Removing unused dependencies

Before `pnpm remove`, confirm the dependency is unused in every one of these places:

1. Source imports in every workspace package.
2. Configuration: `eslint.config.mjs`, `pnpm-workspace.yaml`, `vite.config.js`, `vitest.config.mts`,
   `playwright.config.ts`, and the package scripts.
3. Test and test-utility sources, including the viewer `test-utils` setup.
4. Generated worker output under `packages/simulator-viewer/build/assets`, because a bundled package
   can reference a dependency the viewer source never imports directly.
5. `pnpm why <package>` for unexpected transitive owners.

Then run the full CI command set, including the browser suite and the production build.

Removed on 2026-10-01:

- `@testing-library/user-event` — no source, test, configuration, or build reference existed; the
  component tests use `@testing-library/react`'s built-in interactions.
- `eslint-plugin-prettier` — the flat ESLint configuration imports only `eslint-config-prettier`, and
  formatting runs through the standalone `prettier --check .` gate, so the plugin was unreachable.

## Phase 2 gate

The Phase 2 gate is met when these commands pass on `main`:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm test:e2e
pnpm build
pnpm audit:dependencies
```

CI mirrors the commands: the `test-and-build` job runs the behavior suite and the production build,
and the `dependency-audit` job runs `pnpm audit:vulnerabilities` and `pnpm audit:licenses`. Both jobs
must be green, and the accepted-finding tables above must contain no expired entry.
