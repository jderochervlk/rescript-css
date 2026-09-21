const collector = globalThis[Symbol.for('@jvlk/rescript-css.collector')];

for (let index = 0; index < 11; index += 1) {
  const temporaryName = `rc_kf_many_${index}`;
  const cssText = `@keyframes ${temporaryName} {\n}\n`;
  collector.keyframes.push({ temporaryName, ruleOrder: index });
  collector.rules.push({
    order: index,
    cssText,
    layer: { kind: 'unlayered', name: '' },
  });
}

collector.nextRuleOrder = 11;
