# Changelog

## 0.2.0 - 2026-09-20

### Added

- Static global selectors, hashed keyframes, typed `@font-face`, cascade layers, and structured
  `@property`, `@scope`, and `@page` rules.
- Structured color, time, duration, angle, easing, grid-track, transform, border, scrolling, SVG,
  and modern-property values with explicit `Var` and `Raw` escape hatches.
- 118 modern CSS properties covering typography, logical borders, scrolling, motion paths, anchor
  positioning, view transitions, SVG presentation, fragmentation, containment, and UI behavior.
- Static-extraction validation for collected metadata, selectors, layer names, descriptors, and
  generated identifier rewrites.

### Changed

- Color, timing, easing, grid-track, transform, and `overscrollBehavior` fields now use structured
  value types. This is an intentional source-breaking 0.x change. See the
  [migration table](docs/values-and-properties.md#0x-structured-value-migration).
- Generated styles preserve source rule order while registered root variables and explicit layer
  order statements retain their required stylesheet positions.

### Verification

- The release surface is covered by 76 Vitest tests, a compiled 118-field ReScript fixture, all
  example builds, and a packed-consumer smoke test.
