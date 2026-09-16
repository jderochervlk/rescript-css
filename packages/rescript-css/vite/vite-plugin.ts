import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from 'vite';

const defaultCompiledRescriptModuleSuffix = '.res.js';
const emittedCssSuffix = '.css';
const collectorSymbolName = '@jvlk/rescript-css.collector';
const stylesModuleDeclarationPattern =
  /^let Styles = \{\n(?:  [A-Za-z_$][\w$]*: [A-Za-z_$][\w$]*,\n)*(?:  [A-Za-z_$][\w$]*: [A-Za-z_$][\w$]*\n)?\};\n\n?/mu;
const stylesModuleExportPattern = /^(export \{\n(?:  [A-Za-z_$][\w$]*,\n)*)  Styles,\n/mu;

type CollectedStyle = Readonly<{
  className: string;
  cssText: string;
}>;

type StyleCollector = Readonly<{
  scope: string;
  styles: CollectedStyle[];
}>;

type StyleDeclaration = Readonly<{
  classNameVariable: string;
  styleCallStart: number;
  styleCallEnd: number;
}>;

type StyleReplacement = Readonly<{
  declaration: StyleDeclaration;
  className: string;
}>;

export type CssModuleLoadFailure = Readonly<{
  _tag: 'CssModuleLoadFailure';
  message: string;
}>;

export type Result<Value, Failure> =
  | Readonly<{ _tag: 'Ok'; value: Value }>
  | Readonly<{ _tag: 'Error'; error: Failure }>;

type CssModuleLoader = (filePath: string) => Promise<unknown>;

type StylesheetMatcher = Readonly<{
  cssModuleBindingFor: (source: string) => string | undefined;
  cssFilePathFor: (compiledModulePath: string) => string;
  isStylesheetModule: (filePath: string, source: string) => boolean;
  removeCssModuleImport: (source: string, moduleBinding: string) => string;
}>;

type ConfigReadResult =
  | Readonly<{ _tag: 'NotFound' }>
  | Readonly<{ _tag: 'Found'; source: string }>;

export type ReScriptConfigFailure = Readonly<{
  _tag: 'ReScriptConfigFailure';
  filePath: string;
  message: string;
}>;

const callsCssStyle = (source: string, moduleBinding: string): boolean =>
  source.includes(`${moduleBinding}.style(`);

const escapeRegularExpression = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

const cssModuleImportPatternFor = (compiledModuleSuffix: string): RegExp =>
  new RegExp(
    `import\\s+\\*\\s+as\\s+([A-Za-z_$][\\w$]*)\\s+from\\s+['"][^'"]*Css${escapeRegularExpression(compiledModuleSuffix)}['"];`,
    'gu',
  );

const cssModuleBindingFor = (source: string, cssModuleImportPattern: RegExp): string | undefined =>
  [...source.matchAll(cssModuleImportPattern)]
    .map((match) => match[1])
    .find((moduleBinding) =>
      moduleBinding === undefined ? false : callsCssStyle(source, moduleBinding),
    );

const cssModuleImportPatternForBinding = (
  compiledModuleSuffix: string,
  moduleBinding: string,
): RegExp =>
  new RegExp(
    `^import\\s+\\*\\s+as\\s+${escapeRegularExpression(moduleBinding)}\\s+from\\s+['"][^'"]*Css${escapeRegularExpression(compiledModuleSuffix)}['"];\\n?`,
    'mu',
  );

export const stylesheetMatcher = (compiledModuleSuffix: string): StylesheetMatcher => {
  const cssModuleImportPattern = cssModuleImportPatternFor(compiledModuleSuffix);

  return {
    cssModuleBindingFor: (source) => cssModuleBindingFor(source, cssModuleImportPattern),
    isStylesheetModule: (filePath, source) => {
      if (!filePath.endsWith(compiledModuleSuffix)) {
        return false;
      }

      return cssModuleBindingFor(source, cssModuleImportPattern) !== undefined;
    },
    cssFilePathFor: (compiledModulePath) =>
      `${compiledModulePath.slice(0, -compiledModuleSuffix.length)}${emittedCssSuffix}`,
    removeCssModuleImport: (source, moduleBinding) =>
      source.replace(cssModuleImportPatternForBinding(compiledModuleSuffix, moduleBinding), ''),
  };
};

const defaultStylesheetMatcher = stylesheetMatcher(defaultCompiledRescriptModuleSuffix);

const suffixFromConfig = (
  configFilePath: string,
  source: string,
): Result<string | undefined, ReScriptConfigFailure> => {
  try {
    const config: unknown = JSON.parse(source);

    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
      return {
        _tag: 'Error',
        error: {
          _tag: 'ReScriptConfigFailure',
          filePath: configFilePath,
          message: 'Expected the configuration to be a JSON object.',
        },
      };
    }

    if (!('suffix' in config)) {
      return { _tag: 'Ok', value: undefined };
    }

    const suffix = config['suffix'];

    if (typeof suffix !== 'string' || suffix.length === 0) {
      return {
        _tag: 'Error',
        error: {
          _tag: 'ReScriptConfigFailure',
          filePath: configFilePath,
          message: 'Expected "suffix" to be a non-empty string.',
        },
      };
    }

    return { _tag: 'Ok', value: suffix };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      _tag: 'Error',
      error: { _tag: 'ReScriptConfigFailure', filePath: configFilePath, message },
    };
  }
};

const readConfig = async (configFilePath: string): Promise<ConfigReadResult> => {
  try {
    return { _tag: 'Found', source: await readFile(configFilePath, 'utf8') };
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error['code'] === 'ENOENT'
    ) {
      return { _tag: 'NotFound' };
    }

    throw error;
  }
};

const findReScriptSuffix = async (
  directory: string,
): Promise<Result<string, ReScriptConfigFailure>> => {
  const configFilePath = join(directory, 'rescript.json');
  const config = await readConfig(configFilePath);

  if (config._tag === 'Found') {
    const result = suffixFromConfig(configFilePath, config.source);

    if (result._tag === 'Error') {
      return result;
    }

    if (result.value !== undefined) {
      return { _tag: 'Ok', value: result.value };
    }
  }

  const parentDirectory = dirname(directory);
  return parentDirectory === directory
    ? { _tag: 'Ok', value: defaultCompiledRescriptModuleSuffix }
    : findReScriptSuffix(parentDirectory);
};

const isCollectedStyle = (value: unknown): value is CollectedStyle =>
  typeof value === 'object' &&
  value !== null &&
  'className' in value &&
  typeof value['className'] === 'string' &&
  'cssText' in value &&
  typeof value['cssText'] === 'string';

const isStyleCollector = (value: unknown): value is StyleCollector =>
  typeof value === 'object' &&
  value !== null &&
  'scope' in value &&
  typeof value['scope'] === 'string' &&
  'styles' in value &&
  Array.isArray(value['styles']) &&
  value['styles'].every(isCollectedStyle);

const startCollection = (scope: string): void => {
  const collector: StyleCollector = { scope, styles: [] };
  Reflect.set(globalThis, Symbol.for(collectorSymbolName), collector);
};

const stylesheetFor = (styles: readonly CollectedStyle[]): string =>
  styles.map(({ cssText }) => cssText).join('\n');

const dynamicModuleLoader: CssModuleLoader = async (filePath): Promise<unknown> => {
  const moduleUrl = pathToFileURL(filePath);
  moduleUrl.searchParams.set('@jvlk/rescript-css', `${Date.now()}`);
  return import(moduleUrl.href);
};

const collectCss = async (
  filePath: string,
  loadModule: CssModuleLoader,
): Promise<Result<readonly CollectedStyle[], CssModuleLoadFailure>> => {
  startCollection(filePath);

  try {
    await loadModule(filePath);

    const collected = Reflect.get(globalThis, Symbol.for(collectorSymbolName));

    if (!isStyleCollector(collected)) {
      return {
        _tag: 'Error',
        error: { _tag: 'CssModuleLoadFailure', message: 'The stylesheet collector was corrupted.' },
      };
    }

    return { _tag: 'Ok', value: collected.styles };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { _tag: 'Error', error: { _tag: 'CssModuleLoadFailure', message } };
  }
};

const formatError = (error: CssModuleLoadFailure): string =>
  `@jvlk/rescript-css could not load a compiled stylesheet: ${error.message}`;

const activateStylesheet = (scope: string): string =>
  `globalThis[Symbol.for(${JSON.stringify(collectorSymbolName)})] = { scope: ${JSON.stringify(scope)}, styles: [] };`;

const stylesheetImportFor = (moduleFilePath: string, cssFilePath: string): string => {
  const relativeCssFilePath = relative(dirname(moduleFilePath), cssFilePath).replaceAll('\\', '/');
  return `// This stylesheet import is generated by @jvlk/rescript-css.\nimport ${JSON.stringify(`./${relativeCssFilePath}`)};\n`;
};

const removePreviousStylesheetTransform = (
  source: string,
  moduleFilePath: string,
  cssFilePath: string,
  scope: string,
): string =>
  source
    .replace(stylesheetImportFor(moduleFilePath, cssFilePath), '')
    .replace(`${activateStylesheet(scope)}\n`, '');

const removeStylesModule = (source: string): string =>
  source.replace(stylesModuleDeclarationPattern, '').replace(stylesModuleExportPattern, '$1');

const closingParenthesisIndex = (
  source: string,
  openingParenthesisIndex: number,
): number | undefined => {
  let depth = 0;
  let stringDelimiter: '"' | "'" | '`' | undefined;

  for (let index = openingParenthesisIndex; index < source.length; index += 1) {
    const character = source[index];

    if (stringDelimiter !== undefined) {
      if (character === '\\') {
        index += 1;
      } else if (character === stringDelimiter) {
        stringDelimiter = undefined;
      }

      continue;
    }

    if (character === '"' || character === "'" || character === '`') {
      stringDelimiter = character;
    } else if (character === '(') {
      depth += 1;
    } else if (character === ')') {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return undefined;
};

const declarationForStyleCall = (
  source: string,
  styleCallStart: number,
  openingParenthesisIndex: number,
): StyleDeclaration | undefined => {
  const lineStart = source.lastIndexOf('\n', styleCallStart) + 1;
  const declaration = /^(?:let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*$/u.exec(
    source.slice(lineStart, styleCallStart),
  );
  const classNameVariable = declaration?.[1];
  const closingParenthesis = closingParenthesisIndex(source, openingParenthesisIndex);

  if (
    classNameVariable === undefined ||
    closingParenthesis === undefined ||
    source[closingParenthesis + 1] !== ';'
  ) {
    return undefined;
  }

  return {
    classNameVariable,
    styleCallStart,
    styleCallEnd: closingParenthesis + 1,
  };
};

const styleDeclarationsFor = (
  source: string,
  moduleBinding: string,
): readonly StyleDeclaration[] => {
  const styleCallPattern = new RegExp(`${escapeRegularExpression(moduleBinding)}\\.style\\(`, 'gu');

  return [...source.matchAll(styleCallPattern)].flatMap((match) => {
    if (match.index === undefined) {
      return [];
    }

    const openingParenthesisIndex = match.index + match[0].length - 1;
    const declaration = declarationForStyleCall(source, match.index, openingParenthesisIndex);
    return declaration === undefined ? [] : [declaration];
  });
};

const styleReplacementsFor = (
  declarations: readonly StyleDeclaration[],
  styles: readonly CollectedStyle[],
): readonly StyleReplacement[] =>
  declarations.flatMap((declaration, index) => {
    const style = styles[index];
    return style === undefined ? [] : [{ declaration, className: style.className }];
  });

const replaceClassReference = (source: string, replacement: StyleReplacement): string =>
  source.replace(
    new RegExp(
      `\\b(className|class)\\s*:\\s*${escapeRegularExpression(replacement.declaration.classNameVariable)}\\b`,
      'gu',
    ),
    `$1: ${JSON.stringify(replacement.className)}`,
  );

const replaceStyleCalls = (source: string, replacements: readonly StyleReplacement[]): string =>
  replacements.toReversed().reduce((transformed, { className, declaration }) => {
    const { styleCallStart, styleCallEnd } = declaration;
    return `${transformed.slice(0, styleCallStart)}${JSON.stringify(className)}${transformed.slice(styleCallEnd)}`;
  }, source);

const inlineStyleClassNames = (
  source: string,
  moduleBinding: string,
  styles: readonly CollectedStyle[],
): string | undefined => {
  const declarations = styleDeclarationsFor(source, moduleBinding);
  const replacements = styleReplacementsFor(declarations, styles);

  if (declarations.length !== styles.length || replacements.length !== styles.length) {
    return undefined;
  }

  return replacements.reduce(replaceClassReference, replaceStyleCalls(source, replacements));
};

const injectStylesheetImport = (
  source: string,
  cssFilePath: string,
  moduleFilePath: string,
  moduleBinding: string,
  styles: readonly CollectedStyle[],
  removeCssModuleImport: (source: string, moduleBinding: string) => string,
): string => {
  const sourceForTransformation = removePreviousStylesheetTransform(
    source,
    moduleFilePath,
    cssFilePath,
    moduleFilePath,
  );
  const sourceWithClassNames = inlineStyleClassNames(
    sourceForTransformation,
    moduleBinding,
    styles,
  );
  const stylesheetImport = stylesheetImportFor(moduleFilePath, cssFilePath);

  if (sourceWithClassNames === undefined) {
    return `${stylesheetImport}${activateStylesheet(moduleFilePath)}\n${removeStylesModule(sourceForTransformation)}`;
  }

  return `${stylesheetImport}${removeCssModuleImport(removeStylesModule(sourceWithClassNames), moduleBinding)}`;
};

export const rescriptCss = (): Plugin => {
  let matcher = defaultStylesheetMatcher;

  return {
    name: '@jvlk/rescript-css',
    async configResolved(config) {
      const result = await findReScriptSuffix(config.root);

      if (result._tag === 'Error') {
        throw new Error(
          `@jvlk/rescript-css could not read ${result.error.filePath}: ${result.error.message}`,
        );
      }

      matcher = stylesheetMatcher(result.value);
    },
    async transform(source, id) {
      if (!matcher.isStylesheetModule(id, source)) {
        return null;
      }

      const moduleBinding = matcher.cssModuleBindingFor(source);

      if (moduleBinding === undefined) {
        return null;
      }

      const result = await collectCss(id, dynamicModuleLoader);

      if (result._tag === 'Error') {
        this.error(formatError(result.error));
        return null;
      }

      const cssFilePath = matcher.cssFilePathFor(id);
      const transformedSource = injectStylesheetImport(
        source,
        cssFilePath,
        id,
        moduleBinding,
        result.value,
        matcher.removeCssModuleImport,
      );

      try {
        await writeFile(cssFilePath, stylesheetFor(result.value), 'utf8');
        await writeFile(id, transformedSource, 'utf8');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.error(`@jvlk/rescript-css could not write generated stylesheet output: ${message}`);
        return null;
      }

      return {
        code: transformedSource,
        map: null,
      };
    },
  };
};

export { findReScriptSuffix, stylesheetFor, suffixFromConfig };
