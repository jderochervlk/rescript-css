import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from 'vite';

const defaultCompiledRescriptModuleSuffix = '.res.js';
const commonCompiledRescriptModuleSuffixes = ['.res.js', '.res.mjs'] as const;
const emittedCssSuffix = '.css';
const collectorSymbolName = '@jvlk/rescript-css.collector';
const stylesModuleDeclarationPattern =
  /^let Styles = \{\n(?:  [A-Za-z_$][\w$]*: [A-Za-z_$][\w$]*,\n)*(?:  [A-Za-z_$][\w$]*: [A-Za-z_$][\w$]*\n)?\};\n\n?/mu;
const stylesModuleExportPattern = /^(export \{\n(?:  [A-Za-z_$][\w$]*,\n)*)  Styles,\n/mu;

type CollectedStyle = Readonly<{
  className: string;
  cssText: string;
}>;

type CollectedVariable = Readonly<{
  reference: string;
  propertyName: string;
  initialValue: string;
}>;

type StyleCollector = Readonly<{
  scope: string;
  styles: CollectedStyle[];
  variables: CollectedVariable[];
  rootCssText: string;
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

type VariableReplacement = Readonly<{
  declaration: StyleDeclaration;
  reference: string;
}>;

type SourceReplacement = Readonly<{
  start: number;
  end: number;
  value: string;
}>;

type InlinedStyleClassNames = Readonly<{
  source: string;
  replacements: readonly StyleReplacement[];
}>;

type CollectedStylesheet = Readonly<{
  styles: readonly CollectedStyle[];
  variables: readonly CollectedVariable[];
  rootCssText: string;
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

const callsStylesheetApi = (source: string, moduleBinding: string): boolean =>
  ['style', '$$class', '$$var', 'registerVars'].some((method) =>
    source.includes(`${moduleBinding}.${method}(`),
  );

const escapeRegularExpression = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

const hashValue = (value: string): string => {
  let hash = 5381;

  for (const character of value) {
    hash = Math.imul(hash, 33) ^ character.charCodeAt(0);
  }

  return (hash >>> 0).toString(36);
};

const cssModuleImportSuffixPatternFor = (compiledModuleSuffix: string): string =>
  [...new Set([...commonCompiledRescriptModuleSuffixes, compiledModuleSuffix])]
    .map(escapeRegularExpression)
    .join('|');

const cssModuleImportPatternFor = (compiledModuleSuffix: string): RegExp => {
  const suffixPattern = cssModuleImportSuffixPatternFor(compiledModuleSuffix);

  return new RegExp(
    `import\\s+\\*\\s+as\\s+([A-Za-z_$][\\w$]*)\\s+from\\s+['"][^'"]*Css(?:${suffixPattern})['"];`,
    'gu',
  );
};

const cssModuleBindingFor = (source: string, cssModuleImportPattern: RegExp): string | undefined =>
  [...source.matchAll(cssModuleImportPattern)]
    .map((match) => match[1])
    .find((moduleBinding) =>
      moduleBinding === undefined ? false : callsStylesheetApi(source, moduleBinding),
    );

const cssModuleImportPatternForBinding = (
  compiledModuleSuffix: string,
  moduleBinding: string,
): RegExp =>
  new RegExp(
    `^import\\s+\\*\\s+as\\s+${escapeRegularExpression(moduleBinding)}\\s+from\\s+['"][^'"]*Css(?:${cssModuleImportSuffixPatternFor(compiledModuleSuffix)})['"];\\n?`,
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

const ignoredScanDirectories = new Set(['.git', 'dist', 'lib', 'node_modules']);

const compiledModulesIn = async (
  directory: string,
  compiledModuleSuffix: string,
): Promise<readonly string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry): Promise<readonly string[]> => {
      const filePath = join(directory, entry.name);

      if (entry.isDirectory()) {
        return ignoredScanDirectories.has(entry.name)
          ? []
          : compiledModulesIn(filePath, compiledModuleSuffix);
      }

      return entry.isFile() && filePath.endsWith(compiledModuleSuffix) ? [filePath] : [];
    }),
  );

  return paths.flat();
};

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

const isCollectedVariable = (value: unknown): value is CollectedVariable =>
  typeof value === 'object' &&
  value !== null &&
  'reference' in value &&
  typeof value['reference'] === 'string' &&
  'propertyName' in value &&
  typeof value['propertyName'] === 'string' &&
  'initialValue' in value &&
  typeof value['initialValue'] === 'string';

const isStyleCollector = (value: unknown): value is StyleCollector =>
  typeof value === 'object' &&
  value !== null &&
  'scope' in value &&
  typeof value['scope'] === 'string' &&
  'styles' in value &&
  Array.isArray(value['styles']) &&
  value['styles'].every(isCollectedStyle) &&
  'variables' in value &&
  Array.isArray(value['variables']) &&
  value['variables'].every(isCollectedVariable) &&
  'rootCssText' in value &&
  typeof value['rootCssText'] === 'string';

const startCollection = (scope: string): void => {
  const collector: StyleCollector = { scope, styles: [], variables: [], rootCssText: '' };
  Reflect.set(globalThis, Symbol.for(collectorSymbolName), collector);
};

const stylesheetFor = ({ styles, rootCssText }: CollectedStylesheet): string =>
  [rootCssText, ...styles.map(({ cssText }) => cssText)]
    .filter((cssText) => cssText.length > 0)
    .join('\n');

const dynamicModuleLoader: CssModuleLoader = async (filePath): Promise<unknown> => {
  const moduleUrl = pathToFileURL(filePath);
  moduleUrl.searchParams.set('@jvlk/rescript-css', `${Date.now()}`);
  return import(moduleUrl.href);
};

const collectCss = async (
  filePath: string,
  loadModule: CssModuleLoader,
): Promise<Result<CollectedStylesheet, CssModuleLoadFailure>> => {
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

    return {
      _tag: 'Ok',
      value: {
        styles: collected.styles,
        variables: collected.variables,
        rootCssText: collected.rootCssText,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { _tag: 'Error', error: { _tag: 'CssModuleLoadFailure', message } };
  }
};

const formatError = (error: CssModuleLoadFailure): string =>
  `@jvlk/rescript-css could not load a compiled stylesheet: ${error.message}`;

const activateStylesheet = (scope: string): string =>
  `globalThis[Symbol.for(${JSON.stringify(collectorSymbolName)})] = { scope: ${JSON.stringify(scope)}, styles: [], variables: [], rootCssText: "" };`;

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

const declarationForCall = (
  source: string,
  callStart: number,
  openingParenthesisIndex: number,
): StyleDeclaration | undefined => {
  const lineStart = source.lastIndexOf('\n', callStart) + 1;
  const declaration = /^(?:let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*$/u.exec(
    source.slice(lineStart, callStart),
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
    styleCallStart: callStart,
    styleCallEnd: closingParenthesis + 1,
  };
};

const declarationsForCall = (
  source: string,
  moduleBinding: string,
  method: string,
): readonly StyleDeclaration[] => {
  const callPattern = new RegExp(
    `${escapeRegularExpression(moduleBinding)}\\.${escapeRegularExpression(method)}\\(`,
    'gu',
  );

  return [...source.matchAll(callPattern)].flatMap((match) => {
    if (match.index === undefined) {
      return [];
    }

    const openingParenthesisIndex = match.index + match[0].length - 1;
    const declaration = declarationForCall(source, match.index, openingParenthesisIndex);
    return declaration === undefined ? [] : [declaration];
  });
};

const callReplacementsFor = (
  source: string,
  moduleBinding: string,
  method: string,
  value: string,
): readonly SourceReplacement[] => {
  const callPattern = new RegExp(
    `${escapeRegularExpression(moduleBinding)}\\.${escapeRegularExpression(method)}\\(`,
    'gu',
  );

  return [...source.matchAll(callPattern)].flatMap((match) => {
    if (match.index === undefined) {
      return [];
    }

    const openingParenthesisIndex = match.index + match[0].length - 1;
    const closingParenthesis = closingParenthesisIndex(source, openingParenthesisIndex);

    if (closingParenthesis === undefined) {
      return [];
    }

    const callEnd = closingParenthesis + 1;
    const lineStart = source.lastIndexOf('\n', match.index) + 1;
    const isStatement =
      /^\s*$/u.test(source.slice(lineStart, match.index)) && source[callEnd] === ';';
    const statementEnd = source[callEnd + 1] === '\n' ? callEnd + 2 : callEnd + 1;
    return isStatement
      ? [{ start: lineStart, end: statementEnd, value: '' }]
      : [{ start: match.index, end: callEnd, value }];
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

const variableReplacementsFor = (
  declarations: readonly StyleDeclaration[],
  variables: readonly CollectedVariable[],
): readonly VariableReplacement[] =>
  declarations.flatMap((declaration, index) => {
    const variable = variables[index];
    return variable === undefined ? [] : [{ declaration, reference: variable.reference }];
  });

const scopedVariable = (
  scope: string,
  declaration: StyleDeclaration,
  variable: CollectedVariable,
): CollectedVariable => {
  const propertyName = `--rc_${hashValue(`${scope}:var:${declaration.classNameVariable}`)}`;
  return {
    reference: `var(${propertyName})`,
    propertyName,
    initialValue: variable.initialValue,
  };
};

const replaceVariableNames = (
  cssText: string,
  variables: readonly CollectedVariable[],
  scopedVariables: readonly CollectedVariable[],
): string =>
  variables.reduce((result, variable, index) => {
    const scoped = scopedVariables[index];
    return scoped === undefined
      ? result
      : result.replaceAll(variable.propertyName, scoped.propertyName);
  }, cssText);

const scopeStylesheetVariables = (
  source: string,
  moduleBinding: string,
  scope: string,
  stylesheet: CollectedStylesheet,
): CollectedStylesheet | undefined => {
  const declarations = declarationsForCall(source, moduleBinding, '$$var');

  if (declarations.length !== stylesheet.variables.length) {
    return undefined;
  }

  const variables = declarations.flatMap((declaration, index) => {
    const variable = stylesheet.variables[index];
    return variable === undefined ? [] : [scopedVariable(scope, declaration, variable)];
  });

  if (variables.length !== stylesheet.variables.length) {
    return undefined;
  }

  const replaceNames = (cssText: string): string =>
    replaceVariableNames(cssText, stylesheet.variables, variables);

  return {
    variables,
    rootCssText: replaceNames(stylesheet.rootCssText),
    styles: stylesheet.styles.map((style) => ({ ...style, cssText: replaceNames(style.cssText) })),
  };
};

const replaceClassReference = (source: string, replacement: StyleReplacement): string =>
  source.replace(
    new RegExp(
      `\\b(className|class)\\s*:\\s*${escapeRegularExpression(replacement.declaration.classNameVariable)}\\b`,
      'gu',
    ),
    `$1: ${JSON.stringify(replacement.className)}`,
  );

const sourceReplacementForStyle = ({
  className,
  declaration,
}: StyleReplacement): SourceReplacement => ({
  start: declaration.styleCallStart,
  end: declaration.styleCallEnd,
  value: JSON.stringify(className),
});

const sourceReplacementForVariable = ({
  reference,
  declaration,
}: VariableReplacement): SourceReplacement => ({
  start: declaration.styleCallStart,
  end: declaration.styleCallEnd,
  value: JSON.stringify(reference),
});

const replaceCalls = (source: string, replacements: readonly SourceReplacement[]): string =>
  replacements
    .toSorted((left, right) => right.start - left.start)
    .reduce(
      (transformed, replacement) =>
        `${transformed.slice(0, replacement.start)}${replacement.value}${transformed.slice(replacement.end)}`,
      source,
    );

const literalDeclarationPatternFor = ({ className, declaration }: StyleReplacement): RegExp =>
  new RegExp(
    `^(?:let|const)\\s+${escapeRegularExpression(declaration.classNameVariable)}\\s*=\\s*${escapeRegularExpression(JSON.stringify(className))};(?:\\r?\\n(?:\\r?\\n)?|$)`,
    'mu',
  );

const identifierPatternFor = (identifier: string): RegExp =>
  new RegExp(`(?<![A-Za-z0-9_$])${escapeRegularExpression(identifier)}(?![A-Za-z0-9_$])`, 'u');

const quotedStringEndIndex = (source: string, startIndex: number, quote: "'" | '"'): number => {
  for (let index = startIndex + 1; index < source.length; index += 1) {
    if (source[index] === '\\') {
      index += 1;
    } else if (source[index] === quote) {
      return index + 1;
    }
  }

  return source.length;
};

const lineCommentEndIndex = (source: string, startIndex: number): number => {
  const lineEndIndex = source.indexOf('\n', startIndex + 2);
  return lineEndIndex === -1 ? source.length : lineEndIndex + 1;
};

const blockCommentEndIndex = (source: string, startIndex: number): number => {
  const commentEndIndex = source.indexOf('*/', startIndex + 2);
  return commentEndIndex === -1 ? source.length : commentEndIndex + 2;
};

const isIdentifierCharacter = (character: string | undefined): boolean =>
  character !== undefined && /[A-Za-z0-9_$]/u.test(character);

const hasIdentifierAt = (source: string, identifier: string, index: number): boolean =>
  source.startsWith(identifier, index) &&
  !isIdentifierCharacter(source[index - 1]) &&
  !isIdentifierCharacter(source[index + identifier.length]);

const nonCodeEndIndex = (source: string, index: number): number | undefined => {
  const character = source[index];

  if (character === "'" || character === '"') {
    return quotedStringEndIndex(source, index, character);
  }

  if (character === '/' && source[index + 1] === '/') {
    return lineCommentEndIndex(source, index);
  }

  return character === '/' && source[index + 1] === '*'
    ? blockCommentEndIndex(source, index)
    : undefined;
};

const containsCodeIdentifier = (source: string, identifier: string): boolean => {
  const identifierPattern = identifierPatternFor(identifier);

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const segmentEndIndex = nonCodeEndIndex(source, index);

    if (segmentEndIndex !== undefined) {
      index = segmentEndIndex - 1;
    } else if (character === '`' || character === '/') {
      return identifierPattern.test(source.slice(index));
    } else if (hasIdentifierAt(source, identifier, index)) {
      return true;
    }
  }

  return false;
};

const removeGeneratedPurityComment = (source: string, identifier: string): string =>
  source.replace(
    new RegExp(
      `(?:\\r?\\n)?/\\* ${escapeRegularExpression(identifier)} Not a pure module \\*/\\s*$`,
      'u',
    ),
    '',
  );

const removeUnusedStyleDeclaration = (source: string, replacement: StyleReplacement): string => {
  const declarationMatch = literalDeclarationPatternFor(replacement).exec(source);

  if (declarationMatch?.index === undefined) {
    return source;
  }

  const sourceWithoutDeclaration = `${source.slice(0, declarationMatch.index)}${source.slice(declarationMatch.index + declarationMatch[0].length)}`;
  const identifier = replacement.declaration.classNameVariable;
  const sourceWithoutPurityComment = removeGeneratedPurityComment(
    sourceWithoutDeclaration,
    identifier,
  );

  return containsCodeIdentifier(sourceWithoutPurityComment, identifier)
    ? source
    : sourceWithoutPurityComment;
};

const removeUnusedStyleDeclarations = (
  source: string,
  replacements: readonly StyleReplacement[],
): string => replacements.reduce(removeUnusedStyleDeclaration, source);

const replaceUnusedNamespaceImport = (source: string, match: RegExpMatchArray): string => {
  const [statement, moduleBinding, specifier] = match;

  if (moduleBinding === undefined || specifier === undefined) {
    return source;
  }

  const sourceWithoutImport = source.replace(statement, '');
  return containsCodeIdentifier(sourceWithoutImport, moduleBinding)
    ? source
    : source.replace(statement, `import ${JSON.stringify(specifier)};`);
};

const replaceUnusedNamespaceImports = (source: string): string => {
  const importPattern = /^import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+["'](\.[^"']+)["'];$/gmu;
  const imports = [...source.matchAll(importPattern)];
  return imports.reduce(replaceUnusedNamespaceImport, source);
};

const inlineStylesheetValues = (
  source: string,
  moduleBinding: string,
  stylesheet: CollectedStylesheet,
): InlinedStyleClassNames | undefined => {
  const styleDeclarations = [
    ...declarationsForCall(source, moduleBinding, 'style'),
    ...declarationsForCall(source, moduleBinding, '$$class'),
  ].toSorted((left, right) => left.styleCallStart - right.styleCallStart);
  const variableDeclarations = declarationsForCall(source, moduleBinding, '$$var');
  const styleReplacements = styleReplacementsFor(styleDeclarations, stylesheet.styles);
  const variableReplacements = variableReplacementsFor(variableDeclarations, stylesheet.variables);

  if (
    styleDeclarations.length !== stylesheet.styles.length ||
    styleReplacements.length !== stylesheet.styles.length ||
    variableDeclarations.length !== stylesheet.variables.length ||
    variableReplacements.length !== stylesheet.variables.length
  ) {
    return undefined;
  }

  const callReplacements = [
    ...styleReplacements.map(sourceReplacementForStyle),
    ...variableReplacements.map(sourceReplacementForVariable),
    ...callReplacementsFor(source, moduleBinding, 'registerVars', 'undefined'),
  ];
  const sourceWithValues = replaceCalls(source, callReplacements);

  return {
    source: styleReplacements.reduce(replaceClassReference, sourceWithValues),
    replacements: styleReplacements,
  };
};

const injectStylesheetImport = (
  source: string,
  cssFilePath: string,
  moduleFilePath: string,
  moduleBinding: string,
  stylesheet: CollectedStylesheet,
  removeCssModuleImport: (source: string, moduleBinding: string) => string,
): string => {
  const sourceForTransformation = removePreviousStylesheetTransform(
    source,
    moduleFilePath,
    cssFilePath,
    moduleFilePath,
  );
  const inlinedStyleClassNames = inlineStylesheetValues(
    sourceForTransformation,
    moduleBinding,
    stylesheet,
  );
  const stylesheetImport = stylesheetImportFor(moduleFilePath, cssFilePath);

  if (inlinedStyleClassNames === undefined) {
    return `${stylesheetImport}${activateStylesheet(moduleFilePath)}\n${removeStylesModule(sourceForTransformation)}`;
  }

  const sourceWithoutCssModule = removeCssModuleImport(
    removeStylesModule(inlinedStyleClassNames.source),
    moduleBinding,
  );
  const sourceWithoutStyleDeclarations = removeUnusedStyleDeclarations(
    sourceWithoutCssModule,
    inlinedStyleClassNames.replacements,
  );
  return `${stylesheetImport}${replaceUnusedNamespaceImports(sourceWithoutStyleDeclarations)}`;
};

const prepareStylesheetModule = async (
  moduleFilePath: string,
  source: string,
  matcher: StylesheetMatcher,
): Promise<void> => {
  if (!matcher.isStylesheetModule(moduleFilePath, source)) {
    const cssFilePath = matcher.cssFilePathFor(moduleFilePath);
    const stylesheetImport = stylesheetImportFor(moduleFilePath, cssFilePath);

    if (!source.includes(stylesheetImport)) {
      return;
    }

    await writeFile(moduleFilePath, source.replace(stylesheetImport, ''), 'utf8');

    try {
      await import(pathToFileURL(moduleFilePath).href);
    } finally {
      await writeFile(moduleFilePath, source, 'utf8');
    }

    return;
  }

  const moduleBinding = matcher.cssModuleBindingFor(source);

  if (moduleBinding === undefined) {
    return;
  }

  const result = await collectCss(moduleFilePath, dynamicModuleLoader);

  if (result._tag === 'Error') {
    throw new Error(formatError(result.error));
  }

  const stylesheet =
    scopeStylesheetVariables(source, moduleBinding, moduleFilePath, result.value) ?? result.value;
  const cssFilePath = matcher.cssFilePathFor(moduleFilePath);
  const transformedSource = injectStylesheetImport(
    source,
    cssFilePath,
    moduleFilePath,
    moduleBinding,
    stylesheet,
    matcher.removeCssModuleImport,
  );
  const stylesheetImport = stylesheetImportFor(moduleFilePath, cssFilePath);
  const sourceWithoutStylesheetImport = transformedSource.replace(stylesheetImport, '');

  await writeFile(cssFilePath, stylesheetFor(stylesheet), 'utf8');
  await writeFile(moduleFilePath, sourceWithoutStylesheetImport, 'utf8');

  try {
    await import(pathToFileURL(moduleFilePath).href);
  } finally {
    await writeFile(moduleFilePath, transformedSource, 'utf8');
  }
};

const localModuleDependencies = (
  moduleFilePath: string,
  source: string,
  modulePaths: ReadonlySet<string>,
): readonly string[] => {
  const importPattern = /^import\s+(?:[^;\n]*?\sfrom\s+)?["'](\.[^"']+)["'];/gmu;
  return [...source.matchAll(importPattern)].flatMap((match) => {
    const specifier = match[1];

    if (specifier === undefined) {
      return [];
    }

    const dependencyPath = resolve(dirname(moduleFilePath), specifier);
    return modulePaths.has(dependencyPath) ? [dependencyPath] : [];
  });
};

const prepareModuleAndDependencies = async (
  moduleFilePath: string,
  modulePaths: ReadonlySet<string>,
  matcher: StylesheetMatcher,
  prepared: Set<string>,
  preparing: Set<string>,
): Promise<void> => {
  if (prepared.has(moduleFilePath) || preparing.has(moduleFilePath)) {
    return;
  }

  preparing.add(moduleFilePath);
  const source = await readFile(moduleFilePath, 'utf8');
  const dependencies = localModuleDependencies(moduleFilePath, source, modulePaths);

  for (const dependency of dependencies) {
    await prepareModuleAndDependencies(dependency, modulePaths, matcher, prepared, preparing);
  }

  await prepareStylesheetModule(moduleFilePath, source, matcher);
  preparing.delete(moduleFilePath);
  prepared.add(moduleFilePath);
};

const prepareStylesheetModules = async (
  root: string,
  compiledModuleSuffix: string,
  matcher: StylesheetMatcher,
): Promise<void> => {
  const modulePaths = new Set(await compiledModulesIn(root, compiledModuleSuffix));
  const prepared = new Set<string>();
  const preparing = new Set<string>();

  for (const modulePath of modulePaths) {
    await prepareModuleAndDependencies(modulePath, modulePaths, matcher, prepared, preparing);
  }
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
      await prepareStylesheetModules(config.root, result.value, matcher);
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

      const scopedStylesheet = scopeStylesheetVariables(source, moduleBinding, id, result.value);
      const stylesheet = scopedStylesheet ?? result.value;
      const cssFilePath = matcher.cssFilePathFor(id);
      const transformedSource = injectStylesheetImport(
        source,
        cssFilePath,
        id,
        moduleBinding,
        stylesheet,
        matcher.removeCssModuleImport,
      );

      try {
        await writeFile(cssFilePath, stylesheetFor(stylesheet), 'utf8');
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
