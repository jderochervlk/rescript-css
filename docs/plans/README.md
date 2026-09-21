# CSS Surface Expansion Plans

These plans turn the remaining major CSS surface gaps into bounded implementation tasks. Each plan
contains a proposed API, architecture notes, affected files, verification requirements, and explicit
non-goals.

## Plans

1. [Global styles](global-styles.md)
2. [Keyframes](keyframes.md)
3. [`@font-face`](font-face.md)
4. [Cascade layers](cascade-layers.md)
5. [Advanced at-rules](advanced-at-rules.md)
6. [Structured values](structured-values.md)
7. [Modern properties](modern-properties.md)

## Recommended Order

The first five plans all affect the runtime collector and generated stylesheet ordering. Implement
them serially in the order above, or as a deliberately managed stack of branches. The global-style
work establishes the generic collected-rule foundation used by the later at-rule plans.

Structured values and modern properties form a second lane. Implement structured values before
modern properties so newly added fields can use the richer value types immediately. This lane can
run alongside the collector lane only when ownership of `Css.res` is coordinated; otherwise keep it
serial to avoid resolving large generated-record conflicts.

## Shared Constraints

- Preserve static extraction: no feature may require browser runtime style injection.
- Preserve deterministic output and source-level names while hashing generated CSS identifiers.
- Keep collection data immutable and isolate filesystem writes in the Vite plugin boundary.
- Model expected collection or parsing failures with the existing `Result` pattern.
- Keep `custom` and `Raw` as forward-compatible escape hatches.
- Add public behavior tests and extend the packed-package smoke test when exports or build behavior
  change.
- Update the package documentation and at least one example for every user-facing API.

## Handoff Checklist

Before assigning a plan, confirm its prerequisite plans have landed. The implementing agent should
return a focused commit, the commands used for verification, any API deviation from the plan, and
remaining follow-up work. Do not combine unrelated refactors with these tasks.
