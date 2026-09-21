import { fileURLToPath } from 'node:url';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';
import {
  findReScriptSuffix,
  rescriptCss,
  stylesheetFor,
  stylesheetMatcher,
  suffixFromConfig,
} from '../vite-plugin.js';

const functionHook = (hook: unknown): ((...arguments_: unknown[]) => unknown) => {
  if (typeof hook !== 'function') {
    throw new Error('Expected the Vite plugin hook to be a function.');
  }

  return hook;
};

const configurePlugin = async (root: string): ReturnType<typeof rescriptCss> => {
  const plugin = rescriptCss();
  await Reflect.apply(functionHook(plugin.configResolved), undefined, [{ root }]);
  return plugin;
};

const pluginContext = {
  error: (message: string): never => {
    throw new Error(message);
  },
};

const transform = async (plugin: ReturnType<typeof rescriptCss>, source: string, id: string) => {
  const originalSource = await readFile(id, 'utf8').catch(() => undefined);

  try {
    return await Reflect.apply(functionHook(plugin.transform), pluginContext, [source, id]);
  } finally {
    if (originalSource !== undefined) {
      await writeFile(id, originalSource, 'utf8');
    }
  }
};

const codeFromTransformResult = (result: unknown): string => {
  if (
    typeof result !== 'object' ||
    result === null ||
    !('code' in result) ||
    typeof result['code'] !== 'string'
  ) {
    throw new Error('Expected the transform hook to return transformed code.');
  }

  return result['code'];
};

type StandardsStatus = 'standards-track';
type Availability = 'broad' | 'new' | 'limited' | 'partial';

type ModernProperty = Readonly<{
  batch: string;
  field: string;
  cssName: string;
  valueType: string;
  status: string;
  standardsStatus: StandardsStatus;
  availability: Availability;
  testCase: string;
}>;

const isStandardsStatus = (value: string | undefined): value is StandardsStatus =>
  value === 'standards-track';

const isAvailability = (value: string | undefined): value is Availability =>
  value === 'broad' || value === 'new' || value === 'limited' || value === 'partial';

const csvValue = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.startsWith('"') && trimmed.endsWith('"')
    ? trimmed.slice(1, -1).replaceAll('""', '"')
    : trimmed;
};

const modernPropertyFromLine = (line: string): ModernProperty => {
  const [
    batch,
    field,
    cssName,
    valueType,
    status,
    standardsStatus,
    availability,
    ...testCaseParts
  ] = line.split(',');

  if (
    batch === undefined ||
    field === undefined ||
    cssName === undefined ||
    valueType === undefined ||
    status === undefined ||
    !isStandardsStatus(standardsStatus) ||
    !isAvailability(availability) ||
    testCaseParts.length === 0
  ) {
    throw new Error(`Invalid modern-property inventory row: ${line}`);
  }

  return {
    batch,
    field,
    cssName,
    valueType,
    status,
    standardsStatus,
    availability,
    testCase: csvValue(testCaseParts.join(',')),
  };
};

const modernProperties = async (): Promise<readonly ModernProperty[]> => {
  const inventoryPath = fileURLToPath(
    new URL('../../../../docs/modern-properties.csv', import.meta.url),
  );
  const source = await readFile(inventoryPath, 'utf8');
  const [header, ...lines] = source.trim().split('\n');

  if (header !== 'batch,field,css_name,value_type,status,standards_status,availability,test_case') {
    throw new Error('Invalid modern-property inventory header.');
  }

  return lines.map(modernPropertyFromLine);
};

const cssPropertyMappings = (source: string): readonly (readonly [string, string])[] =>
  [...source.matchAll(/\(\s*"([a-z][a-z0-9-]+)",\s*css\.([A-Za-z][A-Za-z0-9]*)/gu)].flatMap(
    (match) => {
      const cssName = match[1];
      const field = match[2];
      return cssName === undefined || field === undefined ? [] : [[cssName, field] as const];
    },
  );

const structuredValues = async (): Promise<readonly string[]> => {
  const loaded: unknown = await import(
    new URL('./__fixtures__/structured-values/values.res.mjs', import.meta.url).href
  );

  if (
    typeof loaded !== 'object' ||
    loaded === null ||
    !('values' in loaded) ||
    !Array.isArray(loaded.values) ||
    !loaded.values.every((value) => typeof value === 'string')
  ) {
    throw new Error('Expected the structured-value fixture to export serialized strings.');
  }

  return loaded.values;
};

const structuredValidationResults = async (): Promise<readonly unknown[]> => {
  const loaded: unknown = await import(
    new URL('./__fixtures__/structured-values/values.res.mjs', import.meta.url).href
  );

  if (
    typeof loaded !== 'object' ||
    loaded === null ||
    !('validationResults' in loaded) ||
    !Array.isArray(loaded.validationResults)
  ) {
    throw new Error('Expected the structured-value fixture to export validation results.');
  }

  return loaded.validationResults;
};

const isStringPair = (value: unknown): value is readonly [string, string] =>
  Array.isArray(value) &&
  value.length === 2 &&
  typeof value[0] === 'string' &&
  typeof value[1] === 'string';

const modernValueCases = async (): Promise<readonly (readonly [string, string])[]> => {
  const loaded: unknown = await import(
    new URL('./__fixtures__/modern-properties/values.res.mjs', import.meta.url).href
  );

  if (
    typeof loaded !== 'object' ||
    loaded === null ||
    !('cases' in loaded) ||
    !Array.isArray(loaded.cases) ||
    !loaded.cases.every(isStringPair)
  ) {
    throw new Error('Expected the modern-property value fixture to export string pairs.');
  }

  return loaded.cases;
};

const fakeCssRuntime = `const key = Symbol.for('@jvlk/rescript-css.collector');
const read = () => globalThis[key];
const write = (collector) => { globalThis[key] = collector; };
const propertyName = (reference) => reference.slice(4, -1);
const unlayered = {kind: "unlayered", name: ""};

function namedLayer(name) {
  return {kind: "named", name};
}

const anonymousLayer = {kind: "anonymous", name: ""};

function layerOrder(names) {
  const collector = read();
  write({...collector, layerOrder: names});
}

function $$var(initialValue) {
  const collector = read();
  const name = \`--temporary-\${collector.variables.length}\`;
  const reference = \`var(\${name})\`;
  write({...collector, variables: [...collector.variables, {reference, propertyName: name, initialValue}]});
  return reference;
}

function registerVars(references) {
  const collector = read();
  const declarations = references.map((reference) => {
    const variable = collector.variables.find((candidate) => candidate.reference === reference);
    return \`  \${variable.propertyName}: \${variable.initialValue};\`;
  });
  write({...collector, rootCssText: \`:root {\\n\${declarations.join('\\n')}\\n}\\n\`});
}

function style(layerOrDefinition, optionalDefinition) {
  const definition = optionalDefinition === undefined ? layerOrDefinition : optionalDefinition;
  const layer = optionalDefinition === undefined ? unlayered : layerOrDefinition;
  const collector = read();
  const className = \`rc_fixture_\${collector.styles.length}\`;
  const declarations = [
    ...definition.vars.map(([reference, value]) => \`  \${propertyName(reference)}: \${value};\`),
    \`  background: \${definition.background};\`,
  ];
  const cssText = \`.\${className} {\\n\${declarations.join('\\n')}\\n}\\n\`;
  const ruleOrder = collector.nextRuleOrder;
  write({
    ...collector,
    styles: [...collector.styles, {className, cssText, ruleOrder}],
    rules: [...collector.rules, {order: ruleOrder, cssText, layer}],
    nextRuleOrder: ruleOrder + 1,
  });
  return className;
}

function global(selector, layerOrDefinition, optionalDefinition) {
  const definition = optionalDefinition === undefined ? layerOrDefinition : optionalDefinition;
  const layer = optionalDefinition === undefined ? unlayered : layerOrDefinition;
  const collector = read();
  const declarations = [
    ...definition.vars.map(([reference, value]) => \`  \${propertyName(reference)}: \${value};\`),
    \`  background: \${definition.background};\`,
  ];
  const cssText = \`\${selector} {\\n\${declarations.join('\\n')}\\n}\\n\`;
  write({
    ...collector,
    rules: [...collector.rules, {order: collector.nextRuleOrder, cssText, layer}],
    nextRuleOrder: collector.nextRuleOrder + 1,
  });
}

function keyframes(layerOrFrames, optionalFrames) {
  const frames = optionalFrames === undefined ? layerOrFrames : optionalFrames;
  const layer = optionalFrames === undefined ? unlayered : layerOrFrames;
  const collector = read();
  const temporaryName = 'rc_kf_temporary_' + collector.keyframes.length;
  const frameCss = frames
    .map((frame) => '  ' + frame.selector + ' {\\n    opacity: ' + frame.opacity + ';\\n  }')
    .join('\\n');
  const cssText = '@keyframes ' + temporaryName + ' {\\n' + frameCss + '\\n}\\n';
  const ruleOrder = collector.nextRuleOrder;
  write({
    ...collector,
    keyframes: [...collector.keyframes, {temporaryName, ruleOrder}],
    rules: [...collector.rules, {order: ruleOrder, cssText, layer}],
    nextRuleOrder: ruleOrder + 1,
  });
  return temporaryName;
}

function fontFace(layerOrFamily, familyOrCssText, optionalCssText) {
  const layer = optionalCssText === undefined ? unlayered : layerOrFamily;
  const family = optionalCssText === undefined ? layerOrFamily : familyOrCssText;
  const cssText = optionalCssText === undefined ? familyOrCssText : optionalCssText;
  const collector = read();
  const ruleOrder = collector.nextRuleOrder;
  write({
    ...collector,
    fontFaces: [...collector.fontFaces, {family, ruleOrder}],
    rules: [...collector.rules, {order: ruleOrder, cssText, layer}],
    nextRuleOrder: ruleOrder + 1,
  });
  return family;
}

export {$$var, registerVars, namedLayer, anonymousLayer, layerOrder, style, global, keyframes, fontFace};
`;

test('identifies a compiled ReScript module that creates styles', () => {
  const matcher = stylesheetMatcher('.res.js');
  const source =
    "import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.js';\nconst button = Css$RescriptCss.style({});";
  const classSource =
    "import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.js';\nconst box = Css$RescriptCss.$$class({});";

  expect(matcher.isStylesheetModule('/project/Component.res.js', source)).toBe(true);
  expect(matcher.isStylesheetModule('/project/Component.res.js', classSource)).toBe(true);
  expect(matcher.isStylesheetModule('/project/Component.res.js', 'const button = style({});')).toBe(
    false,
  );
});

test('serializes every structured value constructor with stable CSS formatting', async () => {
  await expect(structuredValues()).resolves.toStrictEqual([
    'transparent',
    'currentColor',
    'rebeccapurple',
    '#0f766e',
    '#fff',
    'rgb(255 0 127.5)',
    'rgb(255 0 0 / 0.5)',
    'hsl(-30.5 80.25% 45.5% / 0.75)',
    'oklch(0.42 0.09 210)',
    'var(--tone)',
    'color(display-p3 1 0 0)',
    '180.5ms',
    '-0.25s',
    '0s',
    'var(--duration)',
    'calc(1s / 2)',
    '180.5ms',
    '0.25s',
    '0s',
    'var(--duration)',
    'calc(1s / 2)',
    '-12.5deg',
    '1.5708rad',
    '100.25grad',
    '0.5turn',
    '0deg',
    'var(--angle)',
    'calc(1turn / 8)',
    'linear',
    'ease',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'cubic-bezier(0.2, 0.8, 0.2, 1)',
    'steps(4, jump-start)',
    'steps(4, jump-end)',
    'steps(4, jump-none)',
    'steps(4, jump-both)',
    'steps(4, start)',
    'steps(4, end)',
    'linear(0, 0.75 60%, 1)',
    'var(--easing)',
    'linear(0, 1)',
    'auto',
    'min-content',
    'max-content',
    '1.5fr',
    '2.25rem',
    'minmax(0, 1fr)',
    'fit-content(50.5%)',
    'var(--track)',
    'min(20ch, 40%)',
    '[start main] 1fr repeat(3, 12px) repeat(auto-fill, 10px) repeat(auto-fit, minmax(0, 1fr))',
    'subgrid',
    'subgrid [row-start] [row-end]',
    'var(--tracks)',
    'masonry',
    'none',
    'translate(-0.5rem, 25%)',
    'translateX(-1px)',
    'translateY(0)',
    'translate3d(1px, 2px, 3px)',
    'scale(1.25, 0.75)',
    'scale(-1.5)',
    'scaleX(0.5)',
    'scaleY(2)',
    'scale3d(1, 0.5, -1)',
    'rotate(-12.5deg)',
    'rotateX(1.5rad)',
    'rotateY(100grad)',
    'rotateZ(0.25turn)',
    'rotate3d(1, 0, 0.5, 45deg)',
    'skew(10deg, -5.5deg)',
    'skewX(0.1turn)',
    'skewY(0deg)',
    'perspective(40.5rem)',
    'matrix(1, 0.2, -0.1, 1, 12.5, -4)',
    'translateX(2px) rotate(5deg)',
    'var(--transform)',
    'translate3d(0, 0, 0)',
  ]);
});

test('returns typed failures for invalid bounded structured values', async () => {
  await expect(structuredValidationResults()).resolves.toStrictEqual([
    { TAG: 'Error', _0: { TAG: 'Negative', _0: -1 } },
    { TAG: 'Error', _0: { TAG: 'NonFinite', _0: Number.POSITIVE_INFINITY } },
    { TAG: 'Error', _0: { TAG: 'NonFinite', _0: Number.NEGATIVE_INFINITY } },
    { TAG: 'Error', _0: { TAG: 'InvalidStepCount', _0: 0 } },
    { TAG: 'Error', _0: 'JumpNoneRequiresTwoSteps' },
    { TAG: 'Error', _0: { TAG: 'CubicBezierXOutOfRange', _0: -0.1 } },
    { TAG: 'Error', _0: { TAG: 'NonFiniteControlPoint', _0: Number.NaN } },
    { TAG: 'Error', _0: { TAG: 'NonFiniteLinearOutput', _0: Number.NaN } },
    { TAG: 'Error', _0: { TAG: 'LinearPositionOutOfRange', _0: 101 } },
    { TAG: 'Error', _0: 'LinearFunctionRequiresTwoStops' },
    { TAG: 'Error', _0: 'NegativeLength' },
    { TAG: 'Error', _0: 'NegativeFraction' },
    { TAG: 'Error', _0: { TAG: 'NonPositiveCount', _0: 0 } },
    { TAG: 'Error', _0: 'PercentageNotAllowed' },
    { TAG: 'Error', _0: 'PercentageNotAllowed' },
    { TAG: 'Error', _0: 'NegativeLength' },
    { TAG: 'Error', _0: 'UnsupportedLength' },
    { TAG: 'Error', _0: 'NegativeLength' },
  ]);
});

test('serializes every modern-property value constructor with exact output', async () => {
  const cases = await modernValueCases();

  expect(cases).toHaveLength(220);
  for (const [actual, expected] of cases) {
    expect(actual).toBe(expected);
  }
});

test('emits structured values through the Vite collection boundary', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/structured-values/style.res.mjs', import.meta.url),
  );
  const cssFilePath = fileURLToPath(
    new URL('./__fixtures__/structured-values/style.css', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const showcase = Css.style({});
export {showcase};`;

  const result = await transform(plugin, source, compiledModulePath);
  const code = codeFromTransformResult(result);
  const css = await readFile(cssFilePath, 'utf8');

  expect(code).toMatch(/const showcase = "rc_[a-z0-9_]+";/u);
  expect(code).not.toContain('Css.style');
  expect(css).toContain(
    'grid-template-columns: [main-start] repeat(auto-fit, minmax(12rem, 1fr)) [main-end];',
  );
  expect(css).toContain('color: oklch(0.42 0.09 210);');
  expect(css).toContain('background-color: #f8fafc;');
  expect(css).toContain('transform: translateY(-1px) rotate(2.5deg);');
  expect(css).toContain('animation-delay: -0.25s;');
  expect(css).toContain('animation-duration: 180.5ms;');
  expect(css).toContain('animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);');
});

test('keeps the modern-property inventory complete and serializer mappings unique', async () => {
  const cssSourcePath = fileURLToPath(new URL('../../src/Css.res', import.meta.url));
  const compileFixturePath = fileURLToPath(
    new URL('../../../../examples/basic/src/ModernPropertiesCompile.res', import.meta.url),
  );
  const compileFixtureCssPath = fileURLToPath(
    new URL('../../../../examples/basic/src/ModernPropertiesCompile.css', import.meta.url),
  );
  const [inventory, cssSource, compileFixture, compileFixtureCss] = await Promise.all([
    modernProperties(),
    readFile(cssSourcePath, 'utf8'),
    readFile(compileFixturePath, 'utf8'),
    readFile(compileFixtureCssPath, 'utf8'),
  ]);
  const mappings = cssPropertyMappings(cssSource);
  const emittedNames = mappings.map(([cssName]) => cssName);
  const mappingByField = new Map(mappings.map(([cssName, field]) => [field, cssName]));
  const compiledNames = new Set(
    [...compileFixtureCss.matchAll(/^\s{2}([a-z][a-z0-9-]*):/gmu)].flatMap((match) =>
      match[1] === undefined ? [] : [match[1]],
    ),
  );

  expect(inventory).toHaveLength(118);
  expect(inventory.every(({ status }) => status === 'implemented')).toBe(true);
  expect(inventory.every(({ standardsStatus }) => standardsStatus === 'standards-track')).toBe(
    true,
  );
  expect(new Set(inventory.map(({ availability }) => availability))).toEqual(
    new Set(['broad', 'new', 'limited', 'partial']),
  );
  expect(new Set(inventory.map(({ field }) => field)).size).toBe(inventory.length);
  expect(new Set(inventory.map(({ cssName }) => cssName)).size).toBe(inventory.length);
  expect(new Set(emittedNames).size).toBe(emittedNames.length);
  expect(compiledNames.size).toBe(118);

  for (const property of inventory) {
    expect(cssSource).toContain(`${property.field}?: ${property.valueType}`);
    expect(mappingByField.get(property.field)).toBe(property.cssName);
    expect(compileFixture).toContain(`${property.field}:`);
    expect(compiledNames.has(property.cssName)).toBe(true);
  }
});

test.for([
  {
    name: 'standards status',
    line: 'layout,field,field,string,implemented,unknown,broad,value',
  },
  {
    name: 'availability',
    line: 'layout,field,field,string,implemented,standards-track,unknown,value',
  },
])('rejects an unrecognized modern-property $name', ({ line }) => {
  expect(() => modernPropertyFromLine(line)).toThrow('Invalid modern-property inventory row');
});

test('emits every inventoried modern property with exact CSS output', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/modern-properties/style.res.mjs', import.meta.url),
  );
  const cssFilePath = fileURLToPath(
    new URL('./__fixtures__/modern-properties/style.css', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const showcase = Css.style(undefined, {});
export {showcase};`;

  const [result, inventory] = await Promise.all([
    transform(plugin, source, compiledModulePath),
    modernProperties(),
  ]);
  const css = await readFile(cssFilePath, 'utf8');
  const declarations = new Map(
    [...css.matchAll(/^\s{2}([a-z][a-z0-9-]*): (.*);$/gmu)].flatMap((match) => {
      const cssName = match[1];
      const value = match[2];
      return cssName === undefined || value === undefined ? [] : [[cssName, value] as const];
    }),
  );

  expect(codeFromTransformResult(result)).toMatch(/const showcase = "rc_[a-z0-9_]+";/u);
  expect(declarations.size).toBe(118);
  for (const property of inventory) {
    expect(declarations.get(property.cssName)).toBe(property.testCase);
  }
});

test('identifies compiled ReScript modules that only declare variables', () => {
  const matcher = stylesheetMatcher('.res.js');
  const source = `import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.js';
const brand = Css$RescriptCss.$$var("#0f766e");
Css$RescriptCss.registerVars([brand]);`;

  expect(matcher.isStylesheetModule('/project/Vars.res.js', source)).toBe(true);
});

test('identifies a compiled ReScript module that only registers a font face', () => {
  const matcher = stylesheetMatcher('.res.js');
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.js';
const inter = Css.fontFace({family: "Inter", src: []});`;

  expect(matcher.isStylesheetModule('/project/Fonts.res.js', source)).toBe(true);
});

test('identifies a compiled ReScript module that only declares global styles', () => {
  const matcher = stylesheetMatcher('.res.js');
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.js';
Css.global("body", {vars: [], background: "white"});`;

  expect(matcher.isStylesheetModule('/project/GlobalStyles.res.js', source)).toBe(true);
});

test('identifies a compiled ReScript module that only declares keyframes', () => {
  const matcher = stylesheetMatcher('.res.js');
  const source =
    "import * as Css from '@jvlk/rescript-css/src/Css.res.js';\nconst fadeIn = Css.keyframes([]);";

  expect(matcher.isStylesheetModule('/project/Animations.res.js', source)).toBe(true);
});

test('identifies a compiled ReScript module that only declares layer order', () => {
  const matcher = stylesheetMatcher('.res.js');
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.js';
Css.layerOrder(["reset", "components"]);`;

  expect(matcher.isStylesheetModule('/project/Layers.res.js', source)).toBe(true);
});

test('uses the configured ReScript suffix for CSS modules and assets', () => {
  const matcher = stylesheetMatcher('.res.mjs');
  const source =
    "import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';\nconst button = Css$RescriptCss.style({});";
  const mixedSuffixSource =
    "import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.js';\nconst button = Css$RescriptCss.style({});";

  expect(matcher.isStylesheetModule('/project/Component.res.mjs', source)).toBe(true);
  expect(matcher.isStylesheetModule('/project/Component.res.mjs', mixedSuffixSource)).toBe(true);
  expect(matcher.isStylesheetModule('/project/Component.res.js', source)).toBe(false);
  expect(matcher.cssFilePathFor('/project/Component.res.mjs')).toBe('/project/Component.css');
  expect(matcher.removeCssModuleImport(mixedSuffixSource, 'Css$RescriptCss')).toBe(
    'const button = Css$RescriptCss.style({});',
  );
});

test('reads a configured ReScript suffix', () => {
  expect(suffixFromConfig('/project/rescript.json', '{"suffix":".res.mjs"}')).toEqual({
    _tag: 'Ok',
    value: '.res.mjs',
  });
});

test('rejects an invalid configured ReScript suffix', () => {
  expect(suffixFromConfig('/project/rescript.json', '{"suffix":""}')).toEqual({
    _tag: 'Error',
    error: {
      _tag: 'ReScriptConfigFailure',
      filePath: '/project/rescript.json',
      message: 'Expected "suffix" to be a non-empty string.',
    },
  });
});

test('accepts a configuration without a suffix and rejects non-object configuration', () => {
  expect(suffixFromConfig('/project/rescript.json', '{}')).toEqual({
    _tag: 'Ok',
    value: undefined,
  });
  expect(suffixFromConfig('/project/rescript.json', '[]')).toMatchObject({
    _tag: 'Error',
    error: { message: 'Expected the configuration to be a JSON object.' },
  });
});

test('rejects invalid ReScript configuration JSON', () => {
  expect(suffixFromConfig('/project/rescript.json', '{')).toMatchObject({
    _tag: 'Error',
    error: {
      _tag: 'ReScriptConfigFailure',
      filePath: '/project/rescript.json',
    },
  });
});

test('finds the nearest configured ReScript suffix from the Vite root', async () => {
  const viteRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );

  await expect(findReScriptSuffix(viteRoot)).resolves.toEqual({
    _tag: 'Ok',
    value: '.res.mjs',
  });
});

test('uses the default suffix when no ReScript configuration exists', async () => {
  await expect(findReScriptSuffix(resolve('/'))).resolves.toEqual({
    _tag: 'Ok',
    value: '.res.js',
  });
});

test('propagates unexpected filesystem errors while locating configuration', async () => {
  const modulePath = fileURLToPath(new URL('./__fixtures__/styled.res.mjs', import.meta.url));

  await expect(findReScriptSuffix(modulePath)).rejects.toThrow();
});

test('reports an invalid project ReScript configuration during Vite setup', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/invalid-project/vite-root', import.meta.url),
  );
  const plugin = rescriptCss();

  await expect(
    Reflect.apply(functionHook(plugin.configResolved), undefined, [{ root: pluginRoot }]),
  ).rejects.toThrow('@jvlk/rescript-css could not read');
});

test('prepares imported stylesheet modules in dependency order', async () => {
  const projectRoot = await mkdtemp(resolve(tmpdir(), 'rescript-css-'));
  const sourceDirectory = resolve(projectRoot, 'src');
  const varsPath = resolve(sourceDirectory, 'Vars.res.mjs');
  const childPath = resolve(sourceDirectory, 'Child.res.mjs');
  const appPath = resolve(sourceDirectory, 'App.res.mjs');

  await mkdir(sourceDirectory, { recursive: true });
  await mkdir(resolve(projectRoot, 'node_modules'), { recursive: true });
  await Promise.all([
    writeFile(resolve(projectRoot, 'rescript.json'), '{"suffix":".res.mjs"}', 'utf8'),
    writeFile(resolve(sourceDirectory, 'Css.res.mjs'), fakeCssRuntime, 'utf8'),
    writeFile(resolve(sourceDirectory, 'data.js'), 'export const data = true;\n', 'utf8'),
    writeFile(
      resolve(projectRoot, 'node_modules', 'Ignored.res.mjs'),
      'throw new Error("ignored directories must not be scanned");\n',
      'utf8',
    ),
    writeFile(
      varsPath,
      `import * as Css from "./Css.res.mjs";
const brand = Css.$$var("#0f766e");
Css.registerVars([brand]);
export {brand};
`,
      'utf8',
    ),
    writeFile(
      childPath,
      `import * as Css from "./Css.res.mjs";
import * as Vars from "./Vars.res.mjs";
const child = Css.style({vars: [], background: Vars.brand});
export {child};
`,
      'utf8',
    ),
    writeFile(
      appPath,
      `import * as Css from "./Css.res.mjs";
import * as Child from "./Child.res.mjs";
import * as Vars from "./Vars.res.mjs";
import {data} from "./data.js";
const app = Css.style({vars: [], background: Vars.brand});
export {app, Child, data};
`,
      'utf8',
    ),
  ]);

  try {
    await configurePlugin(projectRoot);

    const [varsSource, childSource, varsCss, childCss, appCss] = await Promise.all([
      readFile(varsPath, 'utf8'),
      readFile(childPath, 'utf8'),
      readFile(resolve(sourceDirectory, 'Vars.css'), 'utf8'),
      readFile(resolve(sourceDirectory, 'Child.css'), 'utf8'),
      readFile(resolve(sourceDirectory, 'App.css'), 'utf8'),
    ]);

    expect(varsSource).toContain('import "./Vars.css";');
    expect(varsSource).not.toContain('Css.$$var');
    expect(childSource).toContain('import "./Vars.res.mjs";');
    expect(childSource).not.toContain('import * as Vars');
    expect(varsCss).toMatch(/^:root \{/u);
    expect(childCss).not.toContain(':root');
    expect(appCss).not.toContain(':root');
    expect(childCss.match(/\.rc_fixture_0/gu)).toHaveLength(1);
    expect(appCss.match(/\.rc_fixture_0/gu)).toHaveLength(1);
    expect(childCss.match(/var\(--rc_[a-z0-9]+\)/gu)).toStrictEqual(
      appCss.match(/var\(--rc_[a-z0-9]+\)/gu),
    );
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test('preloads previously transformed stylesheet dependencies without their CSS imports', async () => {
  const projectRoot = await mkdtemp(resolve(tmpdir(), 'rescript-css-incremental-'));
  const sourceDirectory = resolve(projectRoot, 'src');
  const varsPath = resolve(sourceDirectory, 'Vars.res.mjs');
  const childPath = resolve(sourceDirectory, 'Child.res.mjs');
  const appPath = resolve(sourceDirectory, 'App.res.mjs');
  const varsSource = `// This stylesheet import is generated by @jvlk/rescript-css.
import "./Vars.css";
const brand = "var(--rc_existing)";
export {brand};
`;

  await mkdir(sourceDirectory, { recursive: true });
  await Promise.all([
    writeFile(resolve(projectRoot, 'rescript.json'), '{"suffix":".res.mjs"}', 'utf8'),
    writeFile(resolve(sourceDirectory, 'Css.res.mjs'), fakeCssRuntime, 'utf8'),
    writeFile(resolve(sourceDirectory, 'Vars.css'), ':root {}\n', 'utf8'),
    writeFile(varsPath, varsSource, 'utf8'),
    writeFile(
      childPath,
      `// This stylesheet import is generated by @jvlk/rescript-css.
import "./Child.css";
import "./Vars.res.mjs";
const child = "rc_existing";
export {child};
`,
      'utf8',
    ),
    writeFile(resolve(sourceDirectory, 'Child.css'), '.rc_existing {}\n', 'utf8'),
    writeFile(
      appPath,
      `import * as Css from "./Css.res.mjs";
import * as Child from "./Child.res.mjs";
const app = Css.style({vars: [], background: "var(--rc_existing)"});
export {app};
`,
      'utf8',
    ),
  ]);

  try {
    await configurePlugin(projectRoot);

    await expect(readFile(varsPath, 'utf8')).resolves.toBe(varsSource);
    await expect(readFile(resolve(sourceDirectory, 'App.css'), 'utf8')).resolves.toContain(
      'background: var(--rc_existing);',
    );
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test('combines collected style rules into one stylesheet', () => {
  expect(
    stylesheetFor({
      rootCssText: ':root {\n  --rc_brand: teal;\n}\n',
      layerOrder: [],
      variables: [],
      fontFaces: [],
      keyframes: [],
      properties: [],
      scopes: [],
      pages: [],
      styles: [
        {
          className: 'rc_button_0',
          cssText: '.rc_button_0 {\n  color: white;\n}\n',
          ruleOrder: 1,
        },
        {
          className: 'rc_button_1',
          cssText: '.rc_button_1 {\n  display: flex;\n}\n',
          ruleOrder: 0,
        },
      ],
      rules: [
        {
          order: 1,
          cssText: '.rc_button_0 {\n  color: white;\n}\n',
          layer: { kind: 'unlayered', name: '' },
        },
        {
          order: 0,
          cssText: '.rc_button_1 {\n  display: flex;\n}\n',
          layer: { kind: 'unlayered', name: '' },
        },
      ],
    }),
  ).toBe(
    ':root {\n  --rc_brand: teal;\n}\n\n.rc_button_1 {\n  display: flex;\n}\n\n.rc_button_0 {\n  color: white;\n}\n',
  );
});

test('emits and inlines a class with a nested heading style', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/cascade.res.mjs', import.meta.url),
  );
  const cssFilePath = fileURLToPath(new URL('./__fixtures__/cascade.css', import.meta.url));
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const badge = Css.style({vars: [], color: "navy"});
const box = Css.$$class({
  vars: [],
  background: "white",
  h1: Css.style({vars: [], color: "teal"}),
  hover: Css.style({vars: [], opacity: 0.8})
});
export {badge, box};`;

  const result = await transform(plugin, source, compiledModulePath);
  const css = await readFile(cssFilePath, 'utf8');

  expect(result).toMatchObject({ code: expect.stringContaining('const badge = "rc_fixture_0";') });
  expect(result).toMatchObject({ code: expect.stringContaining('const box = "rc_fixture_1";') });
  expect(result).toMatchObject({ code: expect.not.stringContaining('Css.$$class') });
  expect(result).toMatchObject({ code: expect.not.stringContaining('Css.style') });
  expect(css).toBe(
    '.rc_fixture_0 {\n  color: navy;\n}\n\n.rc_fixture_1 {\n  background: white;\n}\n\n.rc_fixture_1 h1 {\n  color: teal;\n}\n\n.rc_fixture_1:hover {\n  opacity: 0.8;\n}\n',
  );
});

test('emits ordered global and class rules with root variables first', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/global-style/global.res.mjs', import.meta.url),
  );
  const cssFilePath = fileURLToPath(
    new URL('./__fixtures__/global-style/global.css', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const text = Css.$$var("#172321");
Css.registerVars([text]);
Css.global("*, *::before, *::after", {vars: [], boxSizing: "border-box"});
const card = Css.style({vars: [], background: "white"});
Css.global("body", {
  vars: [],
  color: text,
  margin: "0",
  a: Css.style({vars: [], color: text}),
  selectors: [["&::selection", Css.style({vars: [], background: "teal"})]],
  media: [{condition: "@media (width >= 48rem)", style: Css.style({vars: [], fontSize: "1.125rem"})}]
});
export {card};`;

  const result = await transform(plugin, source, compiledModulePath);
  const css = await readFile(cssFilePath, 'utf8');
  const propertyName = /--rc_[a-z0-9]+/u.exec(css)?.[0];

  expect(propertyName).toBeDefined();
  expect(css).toBe(`:root {
  ${propertyName}: #172321;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.rc_fixture_0 {
  background: white;
}

body {
  color: var(${propertyName});
  margin: 0;
}

body a {
  color: var(${propertyName});
}

body::selection {
  background: teal;
}

@media (width >= 48rem) {
  body {
    font-size: 1.125rem;
  }
}
`);
  expect(result).toMatchObject({ code: expect.not.stringContaining('Css.global') });
  expect(result).toMatchObject({ code: expect.not.stringContaining('Css.registerVars') });
  expect(result).toMatchObject({ code: expect.not.stringContaining('import * as Css') });
  expect(result).toMatchObject({ code: expect.stringContaining('const card = "rc_fixture_0";') });
});

test('expands nested selector lists across every global and scoped parent selector', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/global-style/selector-lists.res.mjs', import.meta.url),
  );
  const cssFilePath = fileURLToPath(
    new URL('./__fixtures__/global-style/selector-lists.css', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
Css.global("html, body", {selectors: [["a, &.ready", Css.style({color: "red"})]]});
Css.scope(".root", undefined, ":scope > h2, :scope > h3", undefined, {
  selectors: [["a, & + p", Css.style({color: "blue"})]]
});`;

  const result = await transform(plugin, source, compiledModulePath);
  const css = await readFile(cssFilePath, 'utf8');

  expect(codeFromTransformResult(result)).not.toContain('Css.global');
  expect(codeFromTransformResult(result)).not.toContain('Css.scope');
  expect(css).toContain('html a, html.ready, body a, body.ready {');
  expect(css).toContain(':scope > h2 a, :scope > h2 + p, :scope > h3 a, :scope > h3 + p {');
  expect(css).not.toContain('html, body a');
});

test('emits layer order and groups only adjacent named rules across all rule kinds', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/layers/layers.res.mjs', import.meta.url),
  );
  const cssFilePath = fileURLToPath(new URL('./__fixtures__/layers/layers.css', import.meta.url));
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
Css.layerOrder(["reset", "base", "framework.components"]);
Css.global("*, *::before, *::after", Css.namedLayer("reset"), {});
const button = Css.style(Css.namedLayer("framework.components"), {});
const fadeIn = Css.keyframes(Css.namedLayer("framework.components"), []);
Css.global("body", Css.namedLayer("base"), {});
const inter = Css.fontFace(Css.namedLayer("framework.components"), {});
Css.global(".anonymous-one", Css.anonymousLayer, {});
Css.global(".anonymous-two", Css.anonymousLayer, {});
const utility = Css.style(undefined, {});
export {button, fadeIn, inter, utility};`;

  const result = await transform(plugin, source, compiledModulePath);
  const code = codeFromTransformResult(result);
  const css = await readFile(cssFilePath, 'utf8');
  const keyframeName = /const fadeIn = "(rc_kf_[a-z0-9]+)";/u.exec(code)?.[1];

  expect(keyframeName).toBeDefined();
  expect(code).not.toContain('Css.layerOrder');
  expect(code).not.toContain('Css.global');
  expect(code).not.toContain('Css.namedLayer');
  expect(code).not.toContain('Css.anonymousLayer');
  expect(code).toContain('const button = "rc_fixture_button";');
  expect(code).toContain('const inter = "Layer Sans";');
  expect(css.startsWith('@layer reset, base, framework.components;\n')).toBe(true);
  expect(css.indexOf(':root {')).toBeLessThan(css.indexOf('@layer reset {'));
  expect(css.match(/@layer framework\.components \{/gu)).toHaveLength(2);
  expect(css.match(/^@layer \{$/gmu)).toHaveLength(2);
  expect(css).toContain(`  @keyframes ${keyframeName} {`);
  expect(css).toContain('  @font-face {');
  expect(css).toContain('  @media (width >= 48rem) {');
  expect(css).toContain('  @supports (display: grid) {');
  expect(css.indexOf('@layer base {')).toBeLessThan(
    css.lastIndexOf('@layer framework.components {'),
  );
  expect(css.lastIndexOf('@layer framework.components {')).toBeLessThan(
    css.indexOf('.anonymous-one'),
  );
  expect(css.indexOf('.anonymous-two')).toBeLessThan(css.indexOf('.rc_fixture_utility'));
});

test.for([
  { fixture: 'invalid-layer.res.mjs', invalidName: 'components bad' },
  { fixture: 'reserved-layer.res.mjs', invalidName: 'INITIAL' },
])('reports invalid layer name $fixture before writing CSS', async ({ fixture, invalidName }) => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL(`./__fixtures__/layers/${fixture}`, import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const invalid = Css.style(Css.namedLayer(${JSON.stringify(invalidName)}), {});`;

  await expect(transform(plugin, source, compiledModulePath)).rejects.toThrow(
    `@jvlk/rescript-css: Invalid layer name "${invalidName}".`,
  );
});

test.for(['corrupted-layer.res.mjs', 'corrupted-layer-order.res.mjs'])(
  'rejects corrupted layer metadata from %s at the plugin boundary',
  async (fixture) => {
    const pluginRoot = fileURLToPath(
      new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
    );
    const compiledModulePath = fileURLToPath(
      new URL(`./__fixtures__/layers/${fixture}`, import.meta.url),
    );
    const plugin = await configurePlugin(pluginRoot);
    const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
Css.global("body", {color: "red"});`;

    await expect(transform(plugin, source, compiledModulePath)).rejects.toThrow(
      '@jvlk/rescript-css could not load a compiled stylesheet: The stylesheet collector was corrupted.',
    );
  },
);

test('reports conflicting layer-order declarations before writing CSS', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/layers/conflicting-order.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
Css.layerOrder(["reset", "components"]);
Css.layerOrder(["components", "reset"]);`;

  await expect(transform(plugin, source, compiledModulePath)).rejects.toThrow(
    'Layer order conflicts with the previously declared order "reset, components".',
  );
});

test('emits structured property, scope, and page rules with layers and ordinary rules', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/advanced-at-rules/advanced.res.mjs', import.meta.url),
  );
  const cssFilePath = fileURLToPath(
    new URL('./__fixtures__/advanced-at-rules/advanced.css', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
Css.layerOrder(["tokens", "base"]);
const tone = Css.$$var("teal");
Css.registerVars([tone]);
Css.registerProperty(Css.namedLayer("tokens"), {name: "--progress", syntax: "<number> | \\"auto\\"", inherits: false, initialValue: "0"});
Css.scope(".article:is(main, aside)", ".comments[data-state=\\"open\\"]", ":scope > h2", Css.namedLayer("base"), {
  color: tone,
  a: Css.style({color: "rebeccapurple"}),
  media: [Css.media("(width >= 48rem)", Css.style({fontFamily: "serif"}))]
});
Css.page(undefined, undefined, [["size", "A4"], ["margin", "2cm"]]);
Css.page("invoice:first", Css.namedLayer("base"), [["page-orientation", "upright"], ["marks", "crop cross"]]);
const card = Css.style({background: "white"});
Css.global("body", {color: "black"});
export {tone, card};`;

  const result = await transform(plugin, source, compiledModulePath);
  const code = codeFromTransformResult(result);
  const css = await readFile(cssFilePath, 'utf8');
  const propertyName = /--rc_[a-z0-9]+/u.exec(css)?.[0];

  expect(propertyName).toBeDefined();
  expect(code).not.toContain('Css.registerProperty');
  expect(code).not.toContain('Css.scope');
  expect(code).not.toContain('Css.page');
  expect(code).not.toContain('import * as Css');
  expect(code).toContain('const card = "rc_');
  expect(css).toContain('@layer tokens {\n  @property --progress {');
  expect(css).toContain('syntax: "<number> | \\"auto\\"";');
  expect(css).toContain('inherits: false;');
  expect(css).toContain('initial-value: 0;');
  expect(css).toContain('@scope (.article:is(main, aside)) to (.comments[data-state="open"]) {');
  expect(css).toContain(`color: var(${propertyName});`);
  expect(css).toContain(':scope > h2 a {\n      color: rebeccapurple;');
  expect(css).toContain('@media (width >= 48rem) {');
  expect(css).toContain('@page {\n  size: A4;\n  margin: 2cm;\n}');
  expect(css).toContain(
    '@page invoice:first {\n    page-orientation: upright;\n    marks: crop cross;\n  }',
  );
  expect(css.indexOf('@property --progress')).toBeLessThan(css.indexOf('@scope ('));
  expect(css.indexOf('@scope (')).toBeLessThan(css.indexOf('@page {'));
  expect(css.indexOf('@page invoice:first')).toBeLessThan(css.indexOf('.rc_'));
  expect(css.indexOf('.rc_')).toBeLessThan(css.indexOf('body {'));
});

test.for([
  {
    fixture: 'invalid-property.res.mjs',
    source:
      'Css.registerProperty({name: "progress", syntax: "<number>", inherits: false, initialValue: "0"});',
    message: 'Invalid custom property name "progress"',
  },
  {
    fixture: 'unsafe-property.res.mjs',
    source:
      'Css.registerProperty({name: "--progress", syntax: "<number>", inherits: false, initialValue: "0"});',
    message: '@property initial-value contains an unsafe rule boundary',
  },
  {
    fixture: 'invalid-scope.res.mjs',
    source: 'Css.scope(".article:is(main", undefined, ":scope > h2", {color: "teal"});',
    message: 'Scope root contains unbalanced brackets, parentheses, or quotes',
  },
  {
    fixture: 'invalid-page.res.mjs',
    source: 'Css.page("invoice:hover", [["size", "A4"]]);',
    message: 'Invalid page selector "invoice:hover"',
  },
  {
    fixture: 'unsafe-page.res.mjs',
    source: 'Css.page(undefined, [["margin", "2cm"]]);',
    message: '@page descriptor "margin" contains an unsafe rule boundary',
  },
])('rejects invalid advanced at-rule input from $fixture', async ({ fixture, source, message }) => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL(`./__fixtures__/advanced-at-rules/${fixture}`, import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);

  await expect(
    transform(
      plugin,
      `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';\n${source}`,
      compiledModulePath,
    ),
  ).rejects.toThrow(message);
});

test.for(['corrupted.res.mjs', 'missing-property-descriptor.res.mjs'])(
  'rejects malformed structured at-rule metadata from %s before serializing CSS',
  async (fixture) => {
    const pluginRoot = fileURLToPath(
      new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
    );
    const compiledModulePath = fileURLToPath(
      new URL(`./__fixtures__/advanced-at-rules/${fixture}`, import.meta.url),
    );
    const plugin = await configurePlugin(pluginRoot);
    const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
Css.registerProperty({name: "--progress", syntax: "<number>", inherits: false, initialValue: "0"});`;

    await expect(transform(plugin, source, compiledModulePath)).rejects.toThrow(
      '@jvlk/rescript-css could not load a compiled stylesheet: The stylesheet collector was corrupted.',
    );
  },
);

test('removes a global-only collection call and its unused runtime import', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/global-style/global-only.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
Css.global("body", {vars: [], background: "white"});`;

  const result = await transform(plugin, source, compiledModulePath);

  expect(result).toMatchObject({ code: expect.not.stringContaining('Css.global') });
  expect(result).toMatchObject({ code: expect.not.stringContaining('import * as Css') });
  expect(result).toMatchObject({
    code: expect.stringContaining('import "./global-only.css";'),
  });
});

test('ignores stylesheet API text inside JavaScript strings and comments', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/global-style/global-only.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const doubleQuoted = "Css.global()";
const singleQuoted = 'Css.keyframes()';
const template = \`Css.fontFace()\`;
/* Css.page(); */
// Css.scope();
Css.global("body", {vars: [], background: "white"});
export {doubleQuoted, singleQuoted, template};`;

  const result = codeFromTransformResult(await transform(plugin, source, compiledModulePath));

  expect(result).toContain('const doubleQuoted = "Css.global()";');
  expect(result).toContain("const singleQuoted = 'Css.keyframes()';");
  expect(result).toContain('const template = `Css.fontFace()`;');
  expect(result).toContain('/* Css.page(); */');
  expect(result).toContain('// Css.scope();');
  expect(result).not.toContain('Css.global("body"');
});

test('emits ordered keyframes with stable names and rewrites animation references', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/keyframes/keyframes.res.mjs', import.meta.url),
  );
  const cssFilePath = fileURLToPath(
    new URL('./__fixtures__/keyframes/keyframes.css', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const fadeIn = Css.keyframes([
  Css.frame("from", {vars: [], opacity: 0}),
  Css.frame("40%", {vars: [], opacity: 0.4}),
  Css.frame("60%, 80%", {vars: [], opacity: 0.8}),
  Css.frame("to", {vars: [], opacity: 1})
]);
const animated = Css.style({vars: [], animationName: fadeIn, animationDuration: "180ms"});
const pulse = Css.keyframes([
  Css.frame("from", {vars: [["var(--progress)", "0"]], transform: "scale(1)"}),
  Css.frame("to", {vars: [["var(--progress)", "1"]], transform: "scale(1.05)"})
]);
export {fadeIn, animated, pulse};`;

  const result = await transform(plugin, source, compiledModulePath);
  const code = codeFromTransformResult(result);
  const css = await readFile(cssFilePath, 'utf8');
  const fadeInName = /const fadeIn = "(rc_kf_[a-z0-9]+)";/u.exec(code)?.[1];
  const pulseName = /const pulse = "(rc_kf_[a-z0-9]+)";/u.exec(code)?.[1];

  expect(fadeInName).toBeDefined();
  expect(pulseName).toBeDefined();
  expect(fadeInName).not.toBe(pulseName);
  expect(code).toContain('const animated = "rc_fixture_0";');
  expect(code).not.toContain('Css.keyframes');
  expect(code).not.toContain('Css.frame');
  expect(code).not.toContain('import * as Css');
  expect(code).toContain('export {fadeIn, animated, pulse};');
  expect(css).toContain(`@keyframes ${fadeInName} {`);
  expect(css).toContain(`animation-name: ${fadeInName};`);
  expect(css).toContain(`@keyframes ${pulseName} {`);
  expect(css).toContain('  60%, 80% {');
  expect(css).toContain('    --progress: 0;');
  expect(css.indexOf(`@keyframes ${fadeInName}`)).toBeLessThan(css.indexOf('.rc_fixture_0'));
  expect(css.indexOf('.rc_fixture_0')).toBeLessThan(css.indexOf(`@keyframes ${pulseName}`));
  expect(css).not.toContain('rc_kf_temporary');
});

test('keeps keyframe names stable and overwrites generated rules across repeated transforms', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/keyframes/keyframes.res.mjs', import.meta.url),
  );
  const cssFilePath = fileURLToPath(
    new URL('./__fixtures__/keyframes/keyframes.css', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const fadeIn = Css.keyframes([]);
const animated = Css.style({});
const pulse = Css.keyframes([]);
export {fadeIn, animated, pulse};`;

  const firstResult = await transform(plugin, source, compiledModulePath);
  const firstCss = await readFile(cssFilePath, 'utf8');
  const secondResult = await transform(plugin, source, compiledModulePath);
  const secondCss = await readFile(cssFilePath, 'utf8');

  expect(codeFromTransformResult(secondResult)).toBe(codeFromTransformResult(firstResult));
  expect(secondCss).toBe(firstCss);
  expect(secondCss.match(/@keyframes /gu)).toHaveLength(2);
});

test('rewrites eleven keyframe names without temporary-prefix collisions', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/keyframes/many.res.mjs', import.meta.url),
  );
  const cssFilePath = fileURLToPath(new URL('./__fixtures__/keyframes/many.css', import.meta.url));
  const plugin = await configurePlugin(pluginRoot);
  const bindings = Array.from(
    { length: 11 },
    (_, index) => `const animation${index} = Css.keyframes([]);`,
  ).join('\n');
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
${bindings}`;

  const code = codeFromTransformResult(await transform(plugin, source, compiledModulePath));
  const css = await readFile(cssFilePath, 'utf8');
  const names = [...code.matchAll(/const animation\d+ = "(rc_kf_[a-z0-9]+)";/gu)].flatMap((match) =>
    match[1] === undefined ? [] : [match[1]],
  );

  expect(names).toHaveLength(11);
  expect(new Set(names).size).toBe(11);
  for (const name of names) {
    expect(css).toContain(`@keyframes ${name} {`);
  }
  expect(css).not.toContain('rc_kf_many_');
});

test('reports a keyframes call that is not assigned directly to a top-level binding', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/keyframes/keyframes.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const fadeIn = wrap(Css.keyframes([]));
const animated = Css.style({});
const pulse = Css.keyframes([]);`;

  await expect(transform(plugin, source, compiledModulePath)).rejects.toThrow(
    '@jvlk/rescript-css could not statically extract keyframes: Each top-level Css.keyframes call must be assigned directly to its own let binding.',
  );
});

test('reports an invalid keyframe selector as a stylesheet load failure', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/keyframes/invalid-selector.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const escaped = Css.keyframes([Css.frame("body {", {})]);`;

  await expect(transform(plugin, source, compiledModulePath)).rejects.toThrow(
    '@jvlk/rescript-css could not load a compiled stylesheet: @jvlk/rescript-css: Invalid keyframe selector "body {". Expected "from", "to", or percentages from 0% through 100%, separated by commas.',
  );
});

test('emits font faces in source order and inlines their quoted family value', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/font-face/font-face.res.mjs', import.meta.url),
  );
  const cssFilePath = fileURLToPath(
    new URL('./__fixtures__/font-face/font-face.css', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const inter = Css.fontFace({family: "Inter", src: [Css.fontSource("/fonts/inter.woff2", "woff2")]});
const interItalic = Css.fontFace({family: "Inter", src: [Css.fontSource("/fonts/inter-italic.woff2", "woff2")]});
export {inter, interItalic};`;

  const result = await transform(plugin, source, compiledModulePath);
  const code = codeFromTransformResult(result);
  const css = await readFile(cssFilePath, 'utf8');
  const family = '"Inter \\"Display\\"\\\\Alt"';

  expect(code).toContain(`const inter = ${JSON.stringify(family)};`);
  expect(code).toContain(`const interItalic = ${JSON.stringify(family)};`);
  expect(code).toContain('export {inter, interItalic};');
  expect(code).not.toContain('Css.fontFace');
  expect(code).not.toContain('Css.fontSource');
  expect(code).not.toContain('import * as Css');
  expect(css).toBe(String.raw`@font-face {
  font-family: "Inter \"Display\"\\Alt";
  src: local("Inter \"Local\"\\Alt"), url("/fonts/inter\"variable\\alt.woff2") format("woff2\"test\\kind") tech(variations, color-COLRv1);
  font-style: normal;
  font-weight: 100 900;
  font-stretch: 75% 125%;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131;
  font-feature-settings: "liga" 1, "kern" 0;
  font-variation-settings: "wght" 650, "wdth" 110;
  ascent-override: 90%;
  descent-override: 20%;
  line-gap-override: 0%;
  size-adjust: 105%;
}

@font-face {
  font-family: "Inter \"Display\"\\Alt";
  src: url("/fonts/inter-italic.woff2") format("woff2");
  font-style: italic;
  font-weight: 100 900;
  font-display: fallback;
}
`);
});

test('reports a font-face call that is not assigned directly to a top-level binding', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/font-face/font-face.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const inter = wrap(Css.fontFace({}));
const interItalic = Css.fontFace({});`;

  await expect(transform(plugin, source, compiledModulePath)).rejects.toThrow(
    '@jvlk/rescript-css could not statically extract font faces: Each top-level Css.fontFace call must be assigned directly to its own let binding.',
  );
});

test('rejects an empty font-face family before writing CSS', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/font-face/empty-family.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const invalid = Css.fontFace({});`;

  await expect(transform(plugin, source, compiledModulePath)).rejects.toThrow(
    '@jvlk/rescript-css could not load a compiled stylesheet: @jvlk/rescript-css: Expected font-face family to be a non-empty string.',
  );
});

test('rejects an empty font-face source list before writing CSS', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/font-face/empty-sources.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const invalid = Css.fontFace({});`;

  await expect(transform(plugin, source, compiledModulePath)).rejects.toThrow(
    '@jvlk/rescript-css could not load a compiled stylesheet: @jvlk/rescript-css: Expected font-face src to contain at least one source.',
  );
});

test('rejects unsafe font-face descriptor boundaries before writing CSS', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/font-face/unsafe-descriptor.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const invalid = Css.fontFace({});`;

  await expect(transform(plugin, source, compiledModulePath)).rejects.toThrow(
    '@jvlk/rescript-css could not load a compiled stylesheet: @jvlk/rescript-css: Font-face descriptor "font-weight" contains an unsafe rule boundary.',
  );
});

test('rejects font-face technology tokens that can break tech() syntax', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/font-face/invalid-tech.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const invalid = Css.fontFace({});`;

  await expect(transform(plugin, source, compiledModulePath)).rejects.toThrow(
    '@jvlk/rescript-css could not load a compiled stylesheet: @jvlk/rescript-css: Invalid font-face source technology "variations)". Expected an ASCII CSS identifier.',
  );
});

test('emits registered variables and scoped overrides with hashed CSS names', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/variables.res.mjs', import.meta.url),
  );
  const cssFilePath = fileURLToPath(new URL('./__fixtures__/variables.css', import.meta.url));
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';
const brand = Css$RescriptCss.$$var("#0f766e");
Css$RescriptCss.registerVars([brand]);
const dark = Css$RescriptCss.style({vars: [[brand, "#2dd4bf"]], color: brand});
export {brand, dark};`;

  const result = await transform(plugin, source, compiledModulePath);
  const css = await readFile(cssFilePath, 'utf8');

  expect(result).toMatchObject({
    code: expect.stringMatching(/const brand = "var\(--rc_[a-z0-9]+\)";/u),
  });
  expect(result).toMatchObject({ code: expect.not.stringContaining('registerVars') });
  expect(result).toMatchObject({ code: expect.stringContaining('const dark = "rc_fixture_0";') });
  expect(css).toContain(':root {');
  expect(css).toContain('--rc_');
  expect(css).toContain('#2dd4bf');
  expect(css).not.toContain('--rc_temporary');
});

test('removes a variable registration statement at the end of a module', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/variables.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const brand = Css.$$var("#0f766e");
const dark = Css.style({vars: [[brand, "#2dd4bf"]], color: brand});
Css.registerVars([brand]);`;

  const result = await transform(plugin, source, compiledModulePath);

  expect(result).toMatchObject({ code: expect.not.stringContaining('registerVars') });
});

test('replaces a variable registration used as an expression', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/variables.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const brand = Css.$$var("#0f766e");
const registration = Css.registerVars([brand]);
const dark = Css.style({vars: [[brand, "#2dd4bf"]], color: brand});
export {registration};`;

  const result = await transform(plugin, source, compiledModulePath);

  expect(result).toMatchObject({
    code: expect.stringContaining('const registration = undefined;'),
  });
});

test('retains runtime collection when variable declarations cannot be paired', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const brand = Css.$$var("#0f766e");
const button = Css.style({color: brand});`;

  const result = await transform(plugin, source, compiledModulePath);

  expect(result).toMatchObject({ code: expect.stringContaining('@jvlk/rescript-css.collector') });
  expect(result).toMatchObject({ code: expect.stringContaining('Css.$$var') });
});

test('retains runtime collection when a style call is not assigned directly', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
export const button = wrap(Css.style({}));`;

  const result = await transform(plugin, source, compiledModulePath);

  expect(result).toMatchObject({ code: expect.stringContaining('@jvlk/rescript-css.collector') });
});

test('generates and imports CSS through the Vite transform hook', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const cssFilePath = resolve(
    fileURLToPath(new URL('./__fixtures__', import.meta.url)),
    'styled.css',
  );
  const plugin = await configurePlugin(pluginRoot);
  const source =
    "import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';\nconst button = Css$RescriptCss.style({});";

  await expect(transform(plugin, source, compiledModulePath)).resolves.toMatchObject({
    code: expect.stringContaining(
      '// This stylesheet import is generated by @jvlk/rescript-css.\nimport "./styled.css";',
    ),
    map: null,
  });
  await expect(readFile(cssFilePath, 'utf8')).resolves.toContain('display: flex;');
});

test('does not collect a stylesheet module that already imports generated CSS', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `// This stylesheet import is generated by @jvlk/rescript-css.
import "./styled.css";
import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';
const button = Css$RescriptCss.style({});`;

  await expect(transform(plugin, source, compiledModulePath)).resolves.toBeNull();
});

test('imports generated CSS without exporting the compiled Styles module', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';
let page = Css$RescriptCss.style({});
let Styles = {
  page: page
};

function App() {
  return {className: page, class: page, element: "page"};
}

export {
  Styles,
  App,
}
/* page Not a pure module */`;

  const result = await transform(plugin, source, compiledModulePath);

  expect(result).toMatchObject({
    code: expect.stringContaining(
      '// This stylesheet import is generated by @jvlk/rescript-css.\nimport "./styled.css";',
    ),
    map: null,
  });
  expect(result).toMatchObject({
    code: expect.stringContaining('className: "rc_fixture_0", class: "rc_fixture_0"'),
  });
  expect(result).toMatchObject({
    code: expect.not.stringContaining('let Styles ='),
  });
  expect(result).toMatchObject({
    code: expect.not.stringContaining('  Styles,'),
  });
  expect(result).toMatchObject({
    code: expect.not.stringContaining('Css$RescriptCss.style'),
  });
  expect(result).toMatchObject({
    code: expect.not.stringContaining('import * as Css$RescriptCss'),
  });
  expect(result).toMatchObject({
    code: expect.not.stringContaining('@jvlk/rescript-css.collector'),
  });
  expect(result).toMatchObject({
    code: expect.not.stringContaining('let page = "rc_fixture_0";'),
  });
  expect(result).toMatchObject({
    code: expect.not.stringContaining('/* page Not a pure module */'),
  });
});

test('persists the transformed ReScript module for HMR', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const originalSource = await readFile(compiledModulePath, 'utf8');
  const source = `import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';
const page = Css$RescriptCss.style({});
let Styles = {
  page: page
};

export {
  Styles,
  page,
}`;

  try {
    const result = await Reflect.apply(functionHook(plugin.transform), pluginContext, [
      source,
      compiledModulePath,
    ]);
    const transformedSource = codeFromTransformResult(result);

    await expect(readFile(compiledModulePath, 'utf8')).resolves.toBe(transformedSource);
    expect(transformedSource).toContain(
      '// This stylesheet import is generated by @jvlk/rescript-css.',
    );
    expect(transformedSource).not.toContain('Styles');
  } finally {
    await writeFile(compiledModulePath, originalSource, 'utf8');
  }
});

test('preserves exported class names as literal strings', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';
const button = Css$RescriptCss.style({});
let Styles = {
  button: button
};

export {
  Styles,
  button,
}`;

  const result = await transform(plugin, source, compiledModulePath);

  expect(result).toMatchObject({
    code: expect.stringContaining('const button = "rc_fixture_0";'),
  });
  expect(result).toMatchObject({
    code: expect.stringContaining('export {\n  button,'),
  });
});

test('preserves class-name declarations used outside class properties', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';
const button = Css$RescriptCss.style({});
const buttonCopy = button;

function App() {
  return {className: button};
}

export {
  buttonCopy,
  App,
}`;

  const result = await transform(plugin, source, compiledModulePath);

  expect(result).toMatchObject({
    code: expect.stringContaining('const button = "rc_fixture_0";'),
  });
  expect(result).toMatchObject({
    code: expect.stringContaining('const buttonCopy = button;'),
  });
  expect(result).toMatchObject({
    code: expect.stringContaining('className: "rc_fixture_0"'),
  });
});

test('preserves a style declaration when its generated statement cannot be isolated', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source =
    "import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';\nconst button = Css$RescriptCss.style({});const adjacent = true;";

  const result = await transform(plugin, source, compiledModulePath);

  expect(result).toMatchObject({
    code: expect.stringContaining('const button = "rc_fixture_0";const adjacent = true;'),
  });
});

test('ignores strings, comments, and longer names when pruning style declarations', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';
const button = Css$RescriptCss.style({});
const buttonLabel = ["button", 'styled \\'button'];
// button is inlined below.
/* button is not a live reference. */
function App() {
  return {className: button};
}

export {
  buttonLabel,
  App,
}`;

  const result = await transform(plugin, source, compiledModulePath);

  expect(result).toMatchObject({
    code: expect.not.stringContaining('const button = "rc_fixture_0";'),
  });
  expect(result).toMatchObject({
    code: expect.stringContaining("const buttonLabel = [\"button\", 'styled \\'button'];"),
  });
});

test('ignores unterminated trailing comments when pruning style declarations', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const lineCommentPlugin = await configurePlugin(pluginRoot);
  const blockCommentPlugin = await configurePlugin(pluginRoot);
  const lineCommentSource = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const button = Css.style({});
function App() { return {className: button}; }
// button`;
  const blockCommentSource = `import * as Css from '@jvlk/rescript-css/src/Css.res.mjs';
const button = Css.style({});
function App() { return {className: button}; }
/* button`;

  const lineResult = await transform(lineCommentPlugin, lineCommentSource, compiledModulePath);
  const blockResult = await transform(blockCommentPlugin, blockCommentSource, compiledModulePath);

  expect(lineResult).toMatchObject({ code: expect.not.stringContaining('const button =') });
  expect(blockResult).toMatchObject({ code: expect.not.stringContaining('const button =') });
});

test('preserves style declarations around ambiguous template and regular-expression syntax', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const templatePlugin = await configurePlugin(pluginRoot);
  const templateSource = `import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';
const button = Css$RescriptCss.style({});
const label = \`button\`;`;
  const regularExpressionSource = `import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';
const button = Css$RescriptCss.style({});
const pattern = /button/u;`;

  const templateResult = await transform(templatePlugin, templateSource, compiledModulePath);
  const regularExpressionResult = await transform(
    plugin,
    regularExpressionSource,
    compiledModulePath,
  );

  expect(templateResult).toMatchObject({
    code: expect.stringContaining('const button = "rc_fixture_0";'),
  });
  expect(regularExpressionResult).toMatchObject({
    code: expect.stringContaining('const button = "rc_fixture_0";'),
  });
});

test('inlines class names when CSS arguments contain nested calls and escaped strings', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = String.raw`import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';
const page = Css$RescriptCss.style({color: makeColor("red\"blue")});
export {page};`;

  const result = await transform(plugin, source, compiledModulePath);

  expect(result).toMatchObject({
    code: expect.stringContaining('const page = "rc_fixture_0";'),
  });
  expect(result).toMatchObject({
    code: expect.not.stringContaining('@jvlk/rescript-css.collector'),
  });
});

test('retains the runtime collector when style calls cannot be safely inlined', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const compiledModulePath = fileURLToPath(
    new URL('./__fixtures__/styled.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source = `import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';
const page = Css$RescriptCss.style({});
const title = Css$RescriptCss.style({});`;

  const result = await transform(plugin, source, compiledModulePath);

  expect(result).toMatchObject({
    code: expect.stringContaining('@jvlk/rescript-css.collector'),
  });
  expect(result).toMatchObject({
    code: expect.stringContaining('Css$RescriptCss.style'),
  });
});

test('leaves modules without styles alone', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);

  await expect(
    transform(plugin, 'export const answer = 42;', '/project/Answer.res.mjs'),
  ).resolves.toBe(null);
});

test('reports a corrupted collected-rule shape as a Vite error', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const corruptedModulePath = fileURLToPath(
    new URL('./__fixtures__/corrupted.res.mjs', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source =
    "import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';\nconst button = Css$RescriptCss.style({});";

  await expect(transform(plugin, source, corruptedModulePath)).rejects.toThrow(
    '@jvlk/rescript-css could not load a compiled stylesheet: The stylesheet collector was corrupted. Expected an ordered rules array with non-negative integer order values and CSS text.',
  );
});

test('reports modules that cannot be loaded as Vite errors', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const plugin = await configurePlugin(pluginRoot);
  const source =
    "import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';\nconst button = Css$RescriptCss.style({});";

  await expect(transform(plugin, source, '/tmp/missing.res.mjs')).rejects.toThrow(
    '@jvlk/rescript-css could not load a compiled stylesheet:',
  );
});

test('reports CSS write failures as Vite errors', async () => {
  const pluginRoot = fileURLToPath(
    new URL('./__fixtures__/configured-project/vite-root', import.meta.url),
  );
  const fixtureDirectory = fileURLToPath(new URL('./__fixtures__/read-only', import.meta.url));
  const compiledModulePath = resolve(fixtureDirectory, 'styled.res.mjs');
  const plugin = await configurePlugin(pluginRoot);
  const source =
    "import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';\nconst button = Css$RescriptCss.style({});";

  await chmod(fixtureDirectory, 0o555);

  try {
    await expect(transform(plugin, source, compiledModulePath)).rejects.toThrow(
      '@jvlk/rescript-css could not write',
    );
  } finally {
    await chmod(fixtureDirectory, 0o755);
  }
});
