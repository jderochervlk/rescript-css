const collector = globalThis[Symbol.for('@jvlk/rescript-css.collector')];

collector.rules.push({
  order: 0,
  cssText: 'body {\n  background: white;\n}\n',
  layer: { kind: 'unlayered', name: '' },
});
collector.nextRuleOrder = 1;
