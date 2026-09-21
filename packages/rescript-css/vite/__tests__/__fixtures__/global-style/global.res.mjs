const collector = globalThis[Symbol.for('@jvlk/rescript-css.collector')];

collector.variables.push({
  reference: 'var(--rc_temporary)',
  propertyName: '--rc_temporary',
  initialValue: '#172321',
});
collector.rootCssText = ':root {\n  --rc_temporary: #172321;\n}\n';
collector.styles.push({
  className: 'rc_fixture_0',
  cssText: '.rc_fixture_0 {\n  background: white;\n}\n',
  ruleOrder: 1,
});
collector.rules.push({
  order: 0,
  cssText: '*, *::before, *::after {\n  box-sizing: border-box;\n}\n',
  layer: { kind: 'unlayered', name: '' },
});
collector.rules.push({
  order: 1,
  cssText: '.rc_fixture_0 {\n  background: white;\n}\n',
  layer: { kind: 'unlayered', name: '' },
});
collector.rules.push({
  order: 4,
  cssText:
    'body {\n  color: var(--rc_temporary);\n  margin: 0;\n}\n\nbody a {\n  color: var(--rc_temporary);\n}\n\nbody::selection {\n  background: teal;\n}\n\n@media (width >= 48rem) {\n  body {\n    font-size: 1.125rem;\n  }\n}\n',
  layer: { kind: 'unlayered', name: '' },
});
collector.nextRuleOrder = 5;
