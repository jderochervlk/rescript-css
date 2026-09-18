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

const fakeCssRuntime = `const key = Symbol.for('@jvlk/rescript-css.collector');
const read = () => globalThis[key];
const write = (collector) => { globalThis[key] = collector; };
const propertyName = (reference) => reference.slice(4, -1);

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

function style(definition) {
  const collector = read();
  const className = \`rc_fixture_\${collector.styles.length}\`;
  const declarations = [
    ...definition.vars.map(([reference, value]) => \`  \${propertyName(reference)}: \${value};\`),
    \`  background: \${definition.background};\`,
  ];
  const cssText = \`.\${className} {\\n\${declarations.join('\\n')}\\n}\\n\`;
  write({...collector, styles: [...collector.styles, {className, cssText}]});
  return className;
}

export {$$var, registerVars, style};
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

test('identifies compiled ReScript modules that only declare variables', () => {
  const matcher = stylesheetMatcher('.res.js');
  const source = `import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.js';
const brand = Css$RescriptCss.$$var("#0f766e");
Css$RescriptCss.registerVars([brand]);`;

  expect(matcher.isStylesheetModule('/project/Vars.res.js', source)).toBe(true);
});

test('uses the configured ReScript suffix for CSS modules and assets', () => {
  const matcher = stylesheetMatcher('.res.mjs');
  const source =
    "import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.mjs';\nconst button = Css$RescriptCss.style({});";

  expect(matcher.isStylesheetModule('/project/Component.res.mjs', source)).toBe(true);
  expect(matcher.isStylesheetModule('/project/Component.res.js', source)).toBe(false);
  expect(matcher.cssFilePathFor('/project/Component.res.mjs')).toBe('/project/Component.css');
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

test('combines collected style rules into one stylesheet', () => {
  expect(
    stylesheetFor({
      rootCssText: ':root {\n  --rc_brand: teal;\n}\n',
      variables: [],
      styles: [
        { className: 'rc_button_0', cssText: '.rc_button_0 {\n  color: white;\n}\n' },
        { className: 'rc_button_1', cssText: '.rc_button_1 {\n  display: flex;\n}\n' },
      ],
    }),
  ).toBe(
    ':root {\n  --rc_brand: teal;\n}\n\n.rc_button_0 {\n  color: white;\n}\n\n.rc_button_1 {\n  display: flex;\n}\n',
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
  h1: Css.style({vars: [], color: "teal"})
});
export {badge, box};`;

  const result = await transform(plugin, source, compiledModulePath);
  const css = await readFile(cssFilePath, 'utf8');

  expect(result).toMatchObject({ code: expect.stringContaining('const badge = "rc_fixture_0";') });
  expect(result).toMatchObject({ code: expect.stringContaining('const box = "rc_fixture_1";') });
  expect(result).toMatchObject({ code: expect.not.stringContaining('Css.$$class') });
  expect(result).toMatchObject({ code: expect.not.stringContaining('Css.style') });
  expect(css).toBe(
    '.rc_fixture_0 {\n  color: navy;\n}\n\n.rc_fixture_1 {\n  background: white;\n}\n\n.rc_fixture_1 h1 {\n  color: teal;\n}\n',
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

test('reports a corrupted style collector as a Vite error', async () => {
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
    '@jvlk/rescript-css could not load a compiled stylesheet: The stylesheet collector was corrupted.',
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
