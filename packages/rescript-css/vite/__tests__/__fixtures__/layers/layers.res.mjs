const collector = globalThis[Symbol.for('@jvlk/rescript-css.collector')];
const unlayered = { kind: 'unlayered', name: '' };
const anonymous = { kind: 'anonymous', name: '' };
const named = (name) => ({ kind: 'named', name });

collector.layerOrder = ['reset', 'base', 'framework.components'];
collector.rootCssText = ':root {\n  --layer-fixture: teal;\n}\n';
collector.styles.push({
  className: 'rc_fixture_button',
  cssText: '.rc_fixture_button {\n  display: inline-flex;\n}\n',
  ruleOrder: 1,
});
collector.styles.push({
  className: 'rc_fixture_utility',
  cssText: '.rc_fixture_utility {\n  color: inherit;\n}\n',
  ruleOrder: 8,
});
collector.keyframes.push({ temporaryName: 'rc_kf_temporary_layered', ruleOrder: 2 });
collector.fontFaces.push({ family: 'Layer Sans', ruleOrder: 4 });
collector.rules.push({
  order: 0,
  cssText: '*, *::before, *::after {\n  box-sizing: border-box;\n}\n',
  layer: named('reset'),
});
collector.rules.push({
  order: 1,
  cssText: '.rc_fixture_button {\n  display: inline-flex;\n}\n',
  layer: named('framework.components'),
});
collector.rules.push({
  order: 2,
  cssText:
    '@keyframes rc_kf_temporary_layered {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n',
  layer: named('framework.components'),
});
collector.rules.push({
  order: 3,
  cssText:
    '@media (width >= 48rem) {\n  body {\n    font-size: 1.125rem;\n  }\n}\n\n@supports (display: grid) {\n  body {\n    display: grid;\n  }\n}\n',
  layer: named('base'),
});
collector.rules.push({
  order: 4,
  cssText: '@font-face {\n  font-family: "Layer Sans";\n  src: local("Layer Sans");\n}\n',
  layer: named('framework.components'),
});
collector.rules.push({
  order: 5,
  cssText: '.component-sibling {\n  color: teal;\n}\n',
  layer: named('framework.components'),
});
collector.rules.push({
  order: 6,
  cssText: '.anonymous-one {\n  color: red;\n}\n',
  layer: anonymous,
});
collector.rules.push({
  order: 7,
  cssText: '.anonymous-two {\n  color: blue;\n}\n',
  layer: anonymous,
});
collector.rules.push({
  order: 8,
  cssText: '.rc_fixture_utility {\n  color: inherit;\n}\n',
  layer: unlayered,
});
collector.nextRuleOrder = 9;
