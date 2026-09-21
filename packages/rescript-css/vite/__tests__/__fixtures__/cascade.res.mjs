const collector = globalThis[Symbol.for('@jvlk/rescript-css.collector')];

collector.styles.push({
  className: 'rc_fixture_0',
  cssText: '.rc_fixture_0 {\n  color: navy;\n}\n',
  ruleOrder: 0,
});
collector.styles.push({
  className: 'rc_fixture_1',
  cssText:
    '.rc_fixture_1 {\n  background: white;\n}\n\n.rc_fixture_1 h1 {\n  color: teal;\n}\n\n.rc_fixture_1:hover {\n  opacity: 0.8;\n}\n',
  ruleOrder: 1,
});
collector.rules.push({
  order: 0,
  cssText: '.rc_fixture_0 {\n  color: navy;\n}\n',
  layer: { kind: 'unlayered', name: '' },
});
collector.rules.push({
  order: 1,
  cssText:
    '.rc_fixture_1 {\n  background: white;\n}\n\n.rc_fixture_1 h1 {\n  color: teal;\n}\n\n.rc_fixture_1:hover {\n  opacity: 0.8;\n}\n',
  layer: { kind: 'unlayered', name: '' },
});
collector.nextRuleOrder = 2;
