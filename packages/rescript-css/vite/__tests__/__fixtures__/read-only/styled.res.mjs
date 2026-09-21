const collector = globalThis[Symbol.for('@jvlk/rescript-css.collector')];

collector.styles.push({
  className: 'rc_fixture_read_only',
  cssText: '.rc_fixture_read_only {\n  display: flex;\n}\n',
  ruleOrder: 0,
});
collector.rules.push({
  order: 0,
  cssText: '.rc_fixture_read_only {\n  display: flex;\n}\n',
  layer: { kind: 'unlayered', name: '' },
});
collector.nextRuleOrder = 1;
