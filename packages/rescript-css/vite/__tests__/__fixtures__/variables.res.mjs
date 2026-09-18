const collector = globalThis[Symbol.for('@jvlk/rescript-css.collector')];

collector.variables.push({
  reference: 'var(--rc_temporary)',
  propertyName: '--rc_temporary',
  initialValue: '#0f766e',
});
collector.rootCssText = ':root {\n  --rc_temporary: #0f766e;\n}\n';
collector.styles.push({
  className: 'rc_fixture_0',
  cssText: '.rc_fixture_0 {\n  --rc_temporary: #2dd4bf;\n  color: var(--rc_temporary);\n}\n',
});
