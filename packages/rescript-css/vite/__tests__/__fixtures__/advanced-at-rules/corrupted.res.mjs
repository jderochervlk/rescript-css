const collector = globalThis[Symbol.for('@jvlk/rescript-css.collector')];

collector.properties.push({
  name: 'color',
  syntax: '<color>',
  inherits: true,
  initialValue: 'red',
  ruleOrder: 0,
});
collector.rules.push({
  order: 0,
  cssText: '',
  layer: { kind: 'unlayered', name: '' },
});
collector.nextRuleOrder = 1;
