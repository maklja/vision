# Phase 3 final handoff and gate verification

Verified 2026-10-02 against main `6d2748e768ffaa8f0c4a623659c4f4b990881f92`.
The Phase 3 gate is satisfied: inventory and both designs are accepted, every canonical record has
a final disposition, and all superseded PRs are closed with preserved references. This documentation
PR records the Phase 3.4 verification for review. No retained feature is claimed implemented.
Start Phase 4 from current main; operator expansion waits for the Phase 4 contract/test gate.

## Accepted evidence and source closure

| Evidence                                                                          | Verified state / identity                                                                       | Meaning                                                                    |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Inventory #128](https://github.com/maklja/vision/pull/128)                       | Merged 2026-10-01; `2af7ec09d2bec5b491eb8a110dcbbde653642cb3`                                   | All 220 changed paths covered by 21 requirements plus four exclusions      |
| [Subscription design #133](https://github.com/maklja/vision/pull/133)             | Merged 2026-10-02; `01e55a23e9ff9cc84a7689bed13323751e43ad41`                                   | Accepted S01–S08 dispositions and T1–T8/U1–U4 examples                     |
| [Context/parameter/export design #138](https://github.com/maklja/vision/pull/138) | Merged 2026-10-02; `6d2748e768ffaa8f0c4a623659c4f4b990881f92`                                   | Accepted C/P/G dispositions and E1–E9 examples; design handoff #132 closed |
| [Old #40](https://github.com/maklja/vision/pull/40)                               | Closed, unmerged; branch `context_code_execution` at `1c24e51c33ad2ab5eb48d03d202fcfb4fc9d53ce` | Replaced by accepted #138 and implementation #134–#137                     |
| [Old #42](https://github.com/maklja/vision/pull/42)                               | Closed, unmerged; branch `override_parameters` at `254a902f5b780f6e0507093b3215b4f8dc1e9948`    | Replaced by accepted #138 and implementation #134–#137                     |
| [Old #50](https://github.com/maklja/vision/pull/50)                               | Closed, unmerged; branch `subscription_event` at `f74b2faf9f911ba6e34e24daaef18d7d5d3a342c`     | Replaced by accepted #133 and implementation #129–#131                     |

The three branch refs and PR heads were checked through GitHub and equal the inventory ledger.
No branch deletion, cherry-pick, merge or rebase of old implementations is authorized by this handoff.
Their closure descriptions now point to final accepted designs and implementation issues rather
than the closed provisional design handoff #132.

## Final disposition register

This is the authoritative consolidated index. Detailed reasons, examples, immutable source paths
and compatibility criteria live in the accepted [subscription decision](decisions/subscription-flow-events.md),
[execution decision](decisions/execution-context-and-parameters.md) and
[source inventory](legacy-pr-triage.md). Historical proposal tables remain evidence, not competing
unresolved decisions. Each retained benefit has one owner; dependent consumers are identified.

| ID  | Final decision / rationale                                                           | Accepted example or regression evidence           | Canonical destination / consumers                                      |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------------------- |
| C01 | Keep run-shared coordination, replace global/factory-build lifetime                  | Execution E1/E3                                   | Phase 4.3 [#134](https://github.com/maklja/vision/issues/134)          |
| C02 | Drop separate pre-hooks; existing lazy factories initialize selected inputs          | Execution E2                                      | #134 compatibility                                                     |
| C03 | Drop duplicate IIf hooks; unchosen branch has no effects                             | Execution E2                                      | #134 compatibility                                                     |
| C04 | Drop outer-value mutation API; keep raw value/index and isolated overrides           | Execution E3                                      | #134 compatibility                                                     |
| C05 | Keep explicit trust/diagnostics/cancellation; Worker is not a sandbox                | Execution E4/E6                                   | #134; persistence import boundary #139                                 |
| P01 | Drop factory rewrite; keep validated explicit override semantics                     | Execution E3/E5                                   | #134; parameter model #135                                             |
| P02 | Drop prototype callback names/wiring; preserve working main signatures               | Execution E2/E4, current factory tests            | #134 compatibility; metadata #140                                      |
| P03 | Keep typed literal/expression modes; drop implicit interpolation/coercion            | Execution E5                                      | Phase 4.1/4.3 [#135](https://github.com/maklja/vision/issues/135)      |
| P04 | Keep versioned compatibility/recovery; drop unpublished prototype shapes             | Execution E7, current-release fixture             | #135 parameter extension; storage foundation #139                      |
| P05 | Drop duplicate forms/read-only options already implemented                           | Current property-form tests; execution E5         | Existing evidence; #135 regression / #140 registration                 |
| P06 | Drop Redux selectors/split paste APIs already covered                                | Current editor/clipboard/drop tests; execution E7 | Existing evidence; #135 regression                                     |
| G01 | Keep one full readable RxJS export; reject incomplete generators                     | Execution E8                                      | Phase 6.3 [#136](https://github.com/maklja/vision/issues/136)          |
| G02 | Defer optional explicit scaffold; drop automatic code overwrite/clearing             | Execution E9                                      | Phase 6.2 [#137](https://github.com/maklja/vision/issues/137)          |
| S01 | Keep actual lifecycle; drop unfinished Subscribe node/drawer                         | Subscription T1/T3                                | Phase 4.4 [#129](https://github.com/maklja/vision/issues/129); UI #130 |
| S02 | Keep occurrence/path/lineage correlation; drop parallel branch IDs                   | Subscription T2/T3                                | #129                                                                   |
| S03 | Keep sequence/time-driven presentation; drop parallel scheduler/wall-clock contract  | Subscription T8/U3                                | [#131](https://github.com/maklja/vision/issues/131); UI #130           |
| S04 | Keep observable vs construction/transport failures; drop snapshot/envelope prototype | Subscription T4/T5                                | #129                                                                   |
| S05 | Keep derived dashed reference lines/text; drop persisted line-kind field             | Subscription U1                                   | [#130](https://github.com/maklja/vision/issues/130)                    |
| S06 | Keep enforced mutation lock through animation drain; drop theme-only disabling       | Subscription U2                                   | #130                                                                   |
| S07 | Drop duplicate reset refactor; preserve current stop/reset/restart                   | Subscription T6/U4, infinite-source journey       | #129/#130 compatibility                                                |
| S08 | Keep bounded retention and explicit omissions; drop unbounded queues                 | Subscription T8                                   | #131                                                                   |
| X01 | Drop obsolete layout/Redux/API rewrites; current architecture covers them            | Current model/engine/store characterization       | No feature issue; #140 consolidates current definitions                |
| X02 | Drop demo/cosmetic churn; behavior examples belong to accepted contracts             | Accepted T/U/E fixtures                           | No standalone backlog                                                  |
| X03 | Drop lockfile/dependency/TODO churn; preserve upgraded baseline                      | Phase 2 gate in completion plan                   | No dependency change                                                   |
| X04 | Drop broken prototype generators/hooks/drawer/scheduler                              | Inventory hazards; accepted C/P/G/S replacements  | No prototype reuse; retained requirements owned above                  |

Regression evidence: [factory tests](../packages/simulator-engine/src/factory/creationOperatorFactory.test.ts),
[join tests](../packages/simulator-engine/src/factory/joinCreationOperatorFactory.test.ts),
[transformation tests](../packages/simulator-engine/src/factory/transformationOperatorFactory.test.ts),
[property forms](../packages/simulator-viewer/src/ui/properties/ElementPropertiesForm.test.tsx),
[editor workflows](../packages/simulator-viewer/src/store/editorWorkflows.test.ts),
[current-release fixture](../packages/simulator-model/test/fixtures/currentReleaseDiagram.ts),
[clipboard](../e2e/clipboard-group.spec.ts), [palette drop](../e2e/editor-simulation.spec.ts),
[restart](../e2e/infinite-source.spec.ts).
T/U/E examples are specifications for future tests; existing tests prove only their current scope.

## Actionable Phase 4 order

Two foundation issues close previously implicit dependencies:
[versioned persistence #139](https://github.com/maklja/vision/issues/139) and
[operator definitions #140](https://github.com/maklja/vision/issues/140).
Their scopes provide schema/metadata foundations; #135 extends schema with parameter-v1, rather
than duplicating storage/import work. #140 supplies registration metadata, not expression execution
or completed export serializers. Field/signature work is an initial slice; all-current registration
migration follows stabilized runtime contracts.

| Order          | Work                                                                                                  | Hard prerequisite / integration gate                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1              | Phase 4.1 #139 schema, backups, migration/recovery, inert JSON import/export                          | Accepted Phase 3 designs; no dependency on executing imported code                                         |
| 2              | Phase 4.2 #140 minimum property/signature/reference definitions                                       | Coordinate schema with #139; no dependency on completed #134/#129                                          |
| 3              | Phase 4.3 #134 compiler, invocation/override/trust core; #135 model/editor then evaluator integration | #139 storage/import and #140 minimum metadata; #135 evaluation consumes #134 core                          |
| 4              | Phase 4.4 #129 lifecycle protocol and diagnostic correlation                                          | #140 metadata and #134 invocation core for general instrumentation; core protocol can be developed earlier |
| 5              | Phase 4.4 #131 bounded transport/accounting/scheduler, then #130 final visualization/edit lock        | #129; #130 acceptance requires #131; #134/#135 final correlation uses #129                                 |
| 6              | Finish #140 all-current registration migration and Phase 4 integrated verification                    | Stabilized execution/parameter/event contracts; preserve all existing behavior/coverage                    |
| Later          | Phase 6.3 #136 RxJS export                                                                            | #139/#140/#134/#135 and #129/#130 completed contracts                                                      |
| Optional later | Phase 6.2 #137 explicit scaffold UX                                                                   | #139/#140/#134/#135 plus Phase 6.1 undo/redo transaction foundation                                        |

The #134 core precedes #129 integration; it does not wait for finished #129. Final #134 diagnostic
correlation then consumes #129. These are ordered slices, not mutually blocking issues.
No foundation waits for optional code export/scaffolds. Multiple small PRs are expected per issue;
an issue closes only when all its acceptance criteria pass. Use the current Node/pnpm/RxJS baseline.
Phase 4 needs contracts, implementations and tests; this completed triage is not its runtime gate.

## Issue quality and gate evidence

Audited open implementation issues #129–#131/#134–#137: each has source head/path references,
accepted contract, dependencies, exclusions, user-visible acceptance criteria, focused test
scenarios, compatibility/data impact and documentation/security/accessibility/performance guidance.
Updated their accepted-design status and numbered foundation/core/integration prerequisites.
#139/#140 have the same checklist. No duplicate context/export owner or unlinked retained TODO
remains. Deferred #137 includes its future undo dependency and cannot block Phase 4.

| Phase 3 gate                                                         | Evidence                                                                  | Result |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------ |
| Every independent change has final disposition                       | 25 rows above; source ledger covers 220 paths                             | Pass   |
| Every retained/deferred behavior has accepted contract/example/owner | Merged #133/#138; T1–T8/U1–U4/E1–E9; numbered backlog                     | Pass   |
| Trust, persistence and event compatibility decisions explicit        | Accepted designs, #139/#140 and ordered integration gates                 | Pass   |
| Old implementations closed and discoverable                          | Verified #40/#42/#50 and matching immutable heads/branch refs             | Pass   |
| Phase 4 can proceed from current main                                | Foundation issues and acyclic slice order; operator expansion still gated | Pass   |

Validation for this documentation handoff: formatting, whitespace, local source links, all 25 record
owners/examples, source head/ref preservation and issue/dependency checks. Normal CI remains enabled.
No application behavior, dependencies, fixtures, coverage gates or deployment output changes here.
