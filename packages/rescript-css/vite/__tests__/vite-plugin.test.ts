import { fileURLToPath } from 'node:url';
import { chmod, readFile, writeFile } from 'node:fs/promises';
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

test('identifies a compiled ReScript module that creates styles', () => {
  const matcher = stylesheetMatcher('.res.js');
  const source =
    "import * as Css$RescriptCss from '@jvlk/rescript-css/src/Css.res.js';\nconst button = Css$RescriptCss.style({});";

  expect(matcher.isStylesheetModule('/project/Component.res.js', source)).toBe(true);
  expect(matcher.isStylesheetModule('/project/Component.res.js', 'const button = style({});')).toBe(
    false,
  );
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

test('combines collected style rules into one stylesheet', () => {
  expect(
    stylesheetFor([
      { className: 'rc_button_0', cssText: '.rc_button_0 {\n  color: white;\n}\n' },
      { className: 'rc_button_1', cssText: '.rc_button_1 {\n  display: flex;\n}\n' },
    ]),
  ).toBe('.rc_button_0 {\n  color: white;\n}\n\n.rc_button_1 {\n  display: flex;\n}\n');
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
const page = Css$RescriptCss.style({});
let Styles = {
  page: page
};

function App() {
  return {className: page, class: page};
}

export {
  Styles,
  App,
}`;

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
