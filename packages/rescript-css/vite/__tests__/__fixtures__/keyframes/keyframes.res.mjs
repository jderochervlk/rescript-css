const collector = globalThis[Symbol.for('@jvlk/rescript-css.collector')];

const fadeIn = 'rc_kf_temporary_0';
const fadeInCss = `@keyframes ${fadeIn} {
  from {
    opacity: 0;
  }
  40% {
    opacity: 0.4;
  }
  60%, 80% {
    opacity: 0.8;
  }
  to {
    opacity: 1;
  }
}
`;
collector.keyframes.push({ temporaryName: fadeIn, ruleOrder: 0 });
collector.rules.push({
  order: 0,
  cssText: fadeInCss,
  layer: { kind: 'unlayered', name: '' },
});

const styleCss = `.rc_fixture_0 {
  animation-name: ${fadeIn};
  animation-duration: 180ms;
}
`;
collector.styles.push({ className: 'rc_fixture_0', cssText: styleCss, ruleOrder: 1 });
collector.rules.push({
  order: 1,
  cssText: styleCss,
  layer: { kind: 'unlayered', name: '' },
});

const pulse = 'rc_kf_temporary_1';
const pulseCss = `@keyframes ${pulse} {
  from {
    --progress: 0;
    transform: scale(1);
  }
  to {
    --progress: 1;
    transform: scale(1.05);
  }
}
`;
collector.keyframes.push({ temporaryName: pulse, ruleOrder: 2 });
collector.rules.push({
  order: 2,
  cssText: pulseCss,
  layer: { kind: 'unlayered', name: '' },
});
collector.nextRuleOrder = 3;
