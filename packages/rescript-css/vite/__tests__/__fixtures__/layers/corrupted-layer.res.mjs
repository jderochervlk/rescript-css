const collector = globalThis[Symbol.for('@jvlk/rescript-css.collector')];

collector.rules.push({
  order: 0,
  cssText: 'body {\n  color: red;\n}\n',
  layer: { kind: 'named', name: 'base { body' },
});
collector.nextRuleOrder = 1;
