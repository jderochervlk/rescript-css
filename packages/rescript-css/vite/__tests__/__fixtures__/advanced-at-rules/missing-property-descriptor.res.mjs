const collector = globalThis[Symbol.for('@jvlk/rescript-css.collector')];

collector.properties.push({
  name: '--progress',
  inherits: true,
  initialValue: '0',
  ruleOrder: 0,
});
collector.rules.push({
  order: 0,
  cssText: '',
  layer: { kind: 'unlayered', name: '' },
});
collector.nextRuleOrder = 1;
