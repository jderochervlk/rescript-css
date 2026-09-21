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
  ruleOrder: number;
}>;

type CollectedLayer =
  | Readonly<{ kind: 'unlayered'; name: '' }>
  | Readonly<{ kind: 'anonymous'; name: '' }>
  | Readonly<{ kind: 'named'; name: string }>;

type CollectedRule = Readonly<{
  order: number;
  cssText: string;
  layer: CollectedLayer;
}>;

type CollectedKeyframes = Readonly<{
  temporaryName: string;
  ruleOrder: number;
}>;

type CollectedFontFace = Readonly<{
  family: string;
  ruleOrder: number;
}>;

type CollectedProperty = Readonly<{
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue: string;
  ruleOrder: number;
}>;

type CollectedScope = Readonly<{
  root: string;
  limit: string;
  hasLimit: boolean;
  selector: string;
  bodyCssText: string;
  ruleOrder: number;
}>;

type CollectedPage = Readonly<{
  selector: string;
  hasSelector: boolean;
  descriptors: readonly (readonly [string, string])[];
  ruleOrder: number;
}>;

type CollectedVariable = Readonly<{
  reference: string;
  propertyName: string;
  initialValue: string;
}>;

type StyleCollector = Readonly<{
  scope: string;
  styles: CollectedStyle[];
  rules: CollectedRule[];
  keyframes: CollectedKeyframes[];
  fontFaces: CollectedFontFace[];
  properties: CollectedProperty[];
  scopes: CollectedScope[];
  pages: CollectedPage[];
  layerOrder: string[];
  nextRuleOrder: number;
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

type KeyframesReplacement = Readonly<{
  declaration: StyleDeclaration;
  temporaryName: string;
  name: string;
}>;

type FontFaceReplacement = Readonly<{
  declaration: StyleDeclaration;
  family: string;
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
  rules: readonly CollectedRule[];
  keyframes: readonly CollectedKeyframes[];
  fontFaces: readonly CollectedFontFace[];
  properties: readonly CollectedProperty[];
  scopes: readonly CollectedScope[];
  pages: readonly CollectedPage[];
  layerOrder: readonly string[];
  variables: readonly CollectedVariable[];
  rootCssText: string;
}>;

type ScopedKeyframes = Readonly<{
  stylesheet: CollectedStylesheet;
  replacements: readonly KeyframesReplacement[];
}>;

export type CssModuleLoadFailure = Readonly<{
  _tag: 'CssModuleLoadFailure';
  message: string;
}>;

export type CssSourceAnalysisFailure = Readonly<{
  _tag: 'CssSourceAnalysisFailure';
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

type JavaScriptScanMode =
  | 'Code'
  | 'SingleQuote'
  | 'DoubleQuote'
  | 'Template'
  | 'LineComment'
  | 'BlockComment';

const codeOnlySource = (source: string): string => {
  const characters = source.split('');
  let mode: JavaScriptScanMode = 'Code';

  const mask = (index: number): void => {
    if (characters[index] !== '\n' && characters[index] !== '\r') {
      characters[index] = ' ';
    }
  };

  for (let index = 0; index < characters.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];

    if (mode === 'LineComment') {
      if (character === '\n' || character === '\r') {
        mode = 'Code';
      } else {
        mask(index);
      }
    } else if (mode === 'BlockComment') {
      mask(index);
      if (character === '*' && nextCharacter === '/') {
        mask(index + 1);
        index += 1;
        mode = 'Code';
      }
    } else if (mode !== 'Code') {
      mask(index);
      if (character === '\\') {
        mask(index + 1);
        index += 1;
      } else if (
        (mode === 'SingleQuote' && character === "'") ||
        (mode === 'DoubleQuote' && character === '"') ||
        (mode === 'Template' && character === '`')
      ) {
        mode = 'Code';
      }
    } else if (character === '/' && nextCharacter === '/') {
      mask(index);
      mask(index + 1);
      index += 1;
      mode = 'LineComment';
    } else if (character === '/' && nextCharacter === '*') {
      mask(index);
      mask(index + 1);
      index += 1;
      mode = 'BlockComment';
    } else if (character === "'") {
      mask(index);
      mode = 'SingleQuote';
    } else if (character === '"') {
      mask(index);
      mode = 'DoubleQuote';
    } else if (character === '`') {
      mask(index);
      mode = 'Template';
    }
  }

  return characters.join('');
};

const callsStylesheetApi = (source: string, moduleBinding: string): boolean => {
  const code = codeOnlySource(source);
  return [
    'style',
    '$$class',
    '$$var',
    'registerVars',
    'global',
    'keyframes',
    'fontFace',
    'layerOrder',
    'registerProperty',
    'scope',
    'page',
  ].some((method) => code.includes(`${moduleBinding}.${method}(`));
};

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

const cssModuleBindingFor = (
  source: string,
  cssModuleImportPattern: RegExp,
): string | undefined => {
  const code = codeOnlySource(source);
  return [...source.matchAll(cssModuleImportPattern)]
    .filter((match) => match.index !== undefined && code.startsWith('import', match.index))
    .map((match) => match[1])
    .find((moduleBinding) =>
      moduleBinding === undefined ? false : callsStylesheetApi(source, moduleBinding),
    );
};

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
  typeof value['cssText'] === 'string' &&
  'ruleOrder' in value &&
  typeof value['ruleOrder'] === 'number' &&
  Number.isInteger(value['ruleOrder']) &&
  value['ruleOrder'] >= 0;

const layerNamePattern =
  /^(?:--[A-Za-z0-9_-]+|-?[A-Za-z_][A-Za-z0-9_-]*)(?:\.(?:--[A-Za-z0-9_-]+|-?[A-Za-z_][A-Za-z0-9_-]*))*$/u;
const cssWideKeywords = new Set(['initial', 'inherit', 'unset', 'revert', 'revert-layer']);
const isValidLayerName = (name: string): boolean =>
  layerNamePattern.test(name) &&
  name.split('.').every((segment) => !cssWideKeywords.has(segment.toLowerCase()));

const isCollectedLayer = (value: unknown): value is CollectedLayer => {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('kind' in value) ||
    typeof value['kind'] !== 'string' ||
    !('name' in value) ||
    typeof value['name'] !== 'string'
  ) {
    return false;
  }

  return value['kind'] === 'named'
    ? isValidLayerName(value['name'])
    : (value['kind'] === 'unlayered' || value['kind'] === 'anonymous') && value['name'] === '';
};

const isCollectedRule = (value: unknown): value is CollectedRule =>
  typeof value === 'object' &&
  value !== null &&
  'order' in value &&
  typeof value['order'] === 'number' &&
  Number.isInteger(value['order']) &&
  value['order'] >= 0 &&
  'cssText' in value &&
  typeof value['cssText'] === 'string' &&
  'layer' in value &&
  isCollectedLayer(value['layer']);

const isCollectedKeyframes = (value: unknown): value is CollectedKeyframes =>
  typeof value === 'object' &&
  value !== null &&
  'temporaryName' in value &&
  typeof value['temporaryName'] === 'string' &&
  'ruleOrder' in value &&
  typeof value['ruleOrder'] === 'number' &&
  Number.isInteger(value['ruleOrder']) &&
  value['ruleOrder'] >= 0;

const isCollectedFontFace = (value: unknown): value is CollectedFontFace =>
  typeof value === 'object' &&
  value !== null &&
  'family' in value &&
  typeof value['family'] === 'string' &&
  'ruleOrder' in value &&
  typeof value['ruleOrder'] === 'number' &&
  Number.isInteger(value['ruleOrder']) &&
  value['ruleOrder'] >= 0;

const customPropertyNamePattern = /^--[A-Za-z_][A-Za-z0-9_-]*$/u;
const pageSelectorPattern =
  /^(?:(?:--[A-Za-z0-9_-]+|-?[A-Za-z_][A-Za-z0-9_-]*))?(?::(?:left|right|first|blank))*$/u;
const descriptorNamePattern = /^(?:--[A-Za-z0-9_-]+|-?[A-Za-z_][A-Za-z0-9_-]*)$/u;
const unsafeRuleBoundaryPattern = /[;{}\n\r\f]|\/\*|\*\//u;

const isSafeDescriptorValue = (value: string): boolean =>
  value.trim().length > 0 && !unsafeRuleBoundaryPattern.test(value);

const isBalancedSelectorAt = (
  value: string,
  index: number,
  parentheses: number,
  brackets: number,
  quote: '"' | "'" | undefined,
): boolean => {
  if (index >= value.length) {
    return parentheses === 0 && brackets === 0 && quote === undefined;
  }

  const character = value[index];
  if (character === '\\') {
    return index + 1 < value.length
      ? isBalancedSelectorAt(value, index + 2, parentheses, brackets, quote)
      : false;
  }

  if (quote !== undefined) {
    return isBalancedSelectorAt(
      value,
      index + 1,
      parentheses,
      brackets,
      character === quote ? undefined : quote,
    );
  }

  if (character === '"' || character === "'") {
    return isBalancedSelectorAt(value, index + 1, parentheses, brackets, character);
  }

  if (character === '(' || character === '[') {
    return isBalancedSelectorAt(
      value,
      index + 1,
      parentheses + (character === '(' ? 1 : 0),
      brackets + (character === '[' ? 1 : 0),
      quote,
    );
  }

  if (character === ')' || character === ']') {
    const nextParentheses = parentheses - (character === ')' ? 1 : 0);
    const nextBrackets = brackets - (character === ']' ? 1 : 0);
    return (
      nextParentheses >= 0 &&
      nextBrackets >= 0 &&
      isBalancedSelectorAt(value, index + 1, nextParentheses, nextBrackets, quote)
    );
  }

  return isBalancedSelectorAt(value, index + 1, parentheses, brackets, quote);
};

const isSafeSelector = (value: string): boolean => {
  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    !normalized.startsWith('@') &&
    !unsafeRuleBoundaryPattern.test(normalized) &&
    isBalancedSelectorAt(normalized, 0, 0, 0, undefined)
  );
};

const isBalancedCssAt = (
  value: string,
  index: number,
  braces: number,
  quote: '"' | "'" | undefined,
): boolean => {
  if (index >= value.length) {
    return braces === 0 && quote === undefined;
  }

  const character = value[index];
  if (character === '\\') {
    return index + 1 < value.length ? isBalancedCssAt(value, index + 2, braces, quote) : false;
  }

  if (quote !== undefined) {
    return isBalancedCssAt(value, index + 1, braces, character === quote ? undefined : quote);
  }

  if (character === '"' || character === "'") {
    return isBalancedCssAt(value, index + 1, braces, character);
  }

  if (value.startsWith('/*', index)) {
    const commentEnd = value.indexOf('*/', index + 2);
    return commentEnd >= 0 && isBalancedCssAt(value, commentEnd + 2, braces, quote);
  }

  const nextBraces = braces + (character === '{' ? 1 : character === '}' ? -1 : 0);
  return nextBraces >= 0 && isBalancedCssAt(value, index + 1, nextBraces, quote);
};

const hasRuleOrder = (value: object): boolean =>
  'ruleOrder' in value &&
  typeof value['ruleOrder'] === 'number' &&
  Number.isInteger(value['ruleOrder']) &&
  value['ruleOrder'] >= 0;

const isCollectedProperty = (value: unknown): value is CollectedProperty =>
  typeof value === 'object' &&
  value !== null &&
  'name' in value &&
  typeof value['name'] === 'string' &&
  customPropertyNamePattern.test(value['name']) &&
  'syntax' in value &&
  typeof value['syntax'] === 'string' &&
  isSafeDescriptorValue(value['syntax']) &&
  'inherits' in value &&
  typeof value['inherits'] === 'boolean' &&
  'initialValue' in value &&
  typeof value['initialValue'] === 'string' &&
  isSafeDescriptorValue(value['initialValue']) &&
  hasRuleOrder(value);

const isCollectedScope = (value: unknown): value is CollectedScope =>
  typeof value === 'object' &&
  value !== null &&
  'root' in value &&
  typeof value['root'] === 'string' &&
  isSafeSelector(value['root']) &&
  'limit' in value &&
  typeof value['limit'] === 'string' &&
  'hasLimit' in value &&
  typeof value['hasLimit'] === 'boolean' &&
  (value['hasLimit'] ? isSafeSelector(value['limit']) : value['limit'] === '') &&
  'selector' in value &&
  typeof value['selector'] === 'string' &&
  isSafeSelector(value['selector']) &&
  'bodyCssText' in value &&
  typeof value['bodyCssText'] === 'string' &&
  value['bodyCssText'].length > 0 &&
  isBalancedCssAt(value['bodyCssText'], 0, 0, undefined) &&
  hasRuleOrder(value);

const isPageDescriptor = (value: unknown): value is readonly [string, string] =>
  Array.isArray(value) &&
  value.length === 2 &&
  typeof value[0] === 'string' &&
  descriptorNamePattern.test(value[0]) &&
  typeof value[1] === 'string' &&
  isSafeDescriptorValue(value[1]);

const isCollectedPage = (value: unknown): value is CollectedPage =>
  typeof value === 'object' &&
  value !== null &&
  'selector' in value &&
  typeof value['selector'] === 'string' &&
  'hasSelector' in value &&
  typeof value['hasSelector'] === 'boolean' &&
  (value['hasSelector']
    ? value['selector'].length > 0 && pageSelectorPattern.test(value['selector'])
    : value['selector'] === '') &&
  'descriptors' in value &&
  Array.isArray(value['descriptors']) &&
  value['descriptors'].every(isPageDescriptor) &&
  hasRuleOrder(value);

const isCollectedVariable = (value: unknown): value is CollectedVariable =>
  typeof value === 'object' &&
  value !== null &&
  'reference' in value &&
  typeof value['reference'] === 'string' &&
  'propertyName' in value &&
  typeof value['propertyName'] === 'string' &&
  'initialValue' in value &&
  typeof value['initialValue'] === 'string';

const isStyleCollectorShape = (value: unknown): value is StyleCollector =>
  typeof value === 'object' &&
  value !== null &&
  'scope' in value &&
  typeof value['scope'] === 'string' &&
  'styles' in value &&
  Array.isArray(value['styles']) &&
  value['styles'].every(isCollectedStyle) &&
  'rules' in value &&
  Array.isArray(value['rules']) &&
  value['rules'].every(isCollectedRule) &&
  'keyframes' in value &&
  Array.isArray(value['keyframes']) &&
  value['keyframes'].every(isCollectedKeyframes) &&
  'fontFaces' in value &&
  Array.isArray(value['fontFaces']) &&
  value['fontFaces'].every(isCollectedFontFace) &&
  'properties' in value &&
  Array.isArray(value['properties']) &&
  value['properties'].every(isCollectedProperty) &&
  'scopes' in value &&
  Array.isArray(value['scopes']) &&
  value['scopes'].every(isCollectedScope) &&
  'pages' in value &&
  Array.isArray(value['pages']) &&
  value['pages'].every(isCollectedPage) &&
  'layerOrder' in value &&
  Array.isArray(value['layerOrder']) &&
  value['layerOrder'].every((name) => typeof name === 'string' && isValidLayerName(name)) &&
  new Set(value['layerOrder']).size === value['layerOrder'].length &&
  'nextRuleOrder' in value &&
  typeof value['nextRuleOrder'] === 'number' &&
  Number.isInteger(value['nextRuleOrder']) &&
  value['nextRuleOrder'] >= 0 &&
  'variables' in value &&
  Array.isArray(value['variables']) &&
  value['variables'].every(isCollectedVariable) &&
  'rootCssText' in value &&
  typeof value['rootCssText'] === 'string';

const hasStructuredRuleTopology = (collector: StyleCollector): boolean => {
  const structuredOrders = [
    ...collector.properties.map(({ ruleOrder }) => ruleOrder),
    ...collector.scopes.map(({ ruleOrder }) => ruleOrder),
    ...collector.pages.map(({ ruleOrder }) => ruleOrder),
  ];
  const uniqueStructuredOrders = new Set(structuredOrders);
  const rulesByOrder = (order: number): readonly CollectedRule[] =>
    collector.rules.filter((rule) => rule.order === order);

  return (
    uniqueStructuredOrders.size === structuredOrders.length &&
    structuredOrders.every((order) => {
      const rules = rulesByOrder(order);
      return rules.length === 1 && rules[0]?.cssText === '';
    }) &&
    collector.rules.every(
      (rule) => rule.cssText.length > 0 || uniqueStructuredOrders.has(rule.order),
    )
  );
};

const isStyleCollector = (value: unknown): value is StyleCollector =>
  isStyleCollectorShape(value) && hasStructuredRuleTopology(value);

const startCollection = (scope: string): void => {
  const collector: StyleCollector = {
    scope,
    styles: [],
    rules: [],
    keyframes: [],
    fontFaces: [],
    properties: [],
    scopes: [],
    pages: [],
    layerOrder: [],
    nextRuleOrder: 0,
    variables: [],
    rootCssText: '',
  };
  Reflect.set(globalThis, Symbol.for(collectorSymbolName), collector);
};

type CssRuleGroup =
  | Readonly<{ _tag: 'Unlayered'; cssText: string }>
  | Readonly<{ _tag: 'Layered'; layer: CollectedLayer; cssTexts: readonly string[] }>;

const appendRuleGroup = (
  groups: readonly CssRuleGroup[],
  rule: CollectedRule,
): readonly CssRuleGroup[] => {
  if (rule.layer.kind === 'unlayered') {
    return [...groups, { _tag: 'Unlayered', cssText: rule.cssText }];
  }

  const previous = groups.at(-1);
  if (
    rule.layer.kind === 'named' &&
    previous?._tag === 'Layered' &&
    previous.layer.kind === 'named' &&
    previous.layer.name === rule.layer.name
  ) {
    return [
      ...groups.slice(0, -1),
      { ...previous, cssTexts: [...previous.cssTexts, rule.cssText] },
    ];
  }

  return [...groups, { _tag: 'Layered', layer: rule.layer, cssTexts: [rule.cssText] }];
};

const indentCssText = (cssText: string): string =>
  cssText
    .split('\n')
    .map((line) => (line.length === 0 ? line : `  ${line}`))
    .join('\n');

const cssTextForGroup = (group: CssRuleGroup): string => {
  if (group._tag === 'Unlayered') {
    return group.cssText;
  }

  const suffix = group.layer.kind === 'named' ? ` ${group.layer.name}` : '';
  return `@layer${suffix} {\n${indentCssText(group.cssTexts.join('\n'))}}\n`;
};

const layerOrderCssText = (layerOrder: readonly string[]): string =>
  layerOrder.length === 0 ? '' : `@layer ${layerOrder.join(', ')};\n`;

const quoteCssString = (value: string): string =>
  `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;

const propertyCssText = (property: CollectedProperty): string =>
  `@property ${property.name} {\n  syntax: ${quoteCssString(property.syntax)};\n  inherits: ${String(property.inherits)};\n  initial-value: ${property.initialValue};\n}\n`;

const scopeCssText = (scope: CollectedScope): string => {
  const limit = scope.hasLimit ? ` to (${scope.limit})` : '';
  return `@scope (${scope.root})${limit} {\n${indentCssText(scope.bodyCssText)}}\n`;
};

const pageCssText = (page: CollectedPage): string => {
  const selector = page.hasSelector ? ` ${page.selector}` : '';
  const declarations = page.descriptors.map(([name, value]) => `  ${name}: ${value};`).join('\n');
  return `@page${selector} {\n${declarations}\n}\n`;
};

const structuredCssTextForRule = (stylesheet: CollectedStylesheet, rule: CollectedRule): string => {
  const property = stylesheet.properties.find(({ ruleOrder }) => ruleOrder === rule.order);
  if (property !== undefined) {
    return propertyCssText(property);
  }

  const scope = stylesheet.scopes.find(({ ruleOrder }) => ruleOrder === rule.order);
  if (scope !== undefined) {
    return scopeCssText(scope);
  }

  const page = stylesheet.pages.find(({ ruleOrder }) => ruleOrder === rule.order);
  return page === undefined ? rule.cssText : pageCssText(page);
};

const stylesheetFor = (stylesheet: CollectedStylesheet): string => {
  const groups = stylesheet.rules
    .map((rule) => ({ ...rule, cssText: structuredCssTextForRule(stylesheet, rule) }))
    .toSorted((left, right) => left.order - right.order)
    .reduce<readonly CssRuleGroup[]>(appendRuleGroup, []);

  return [
    layerOrderCssText(stylesheet.layerOrder),
    stylesheet.rootCssText,
    ...groups.map(cssTextForGroup),
  ]
    .filter((cssText) => cssText.length > 0)
    .join('\n');
};

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
        error: {
          _tag: 'CssModuleLoadFailure',
          message:
            'The stylesheet collector was corrupted. Expected an ordered rules array with non-negative integer order values and CSS text.',
        },
      };
    }

    return {
      _tag: 'Ok',
      value: {
        styles: collected.styles,
        rules: collected.rules,
        keyframes: collected.keyframes,
        fontFaces: collected.fontFaces,
        properties: collected.properties,
        scopes: collected.scopes,
        pages: collected.pages,
        layerOrder: collected.layerOrder,
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

const formatSourceAnalysisError = (error: CssSourceAnalysisFailure): string =>
  `@jvlk/rescript-css could not statically extract keyframes: ${error.message}`;

const formatFontFaceAnalysisError = (error: CssSourceAnalysisFailure): string =>
  `@jvlk/rescript-css could not statically extract font faces: ${error.message}`;

const activateStylesheet = (scope: string): string =>
  `globalThis[Symbol.for(${JSON.stringify(collectorSymbolName)})] = { scope: ${JSON.stringify(scope)}, styles: [], rules: [], keyframes: [], fontFaces: [], properties: [], scopes: [], pages: [], layerOrder: [], nextRuleOrder: 0, variables: [], rootCssText: "" };`;

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
  code: string,
  callStart: number,
  openingParenthesisIndex: number,
): StyleDeclaration | undefined => {
  const lineStart = source.lastIndexOf('\n', callStart) + 1;
  const declaration = /^(?:let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*$/u.exec(
    source.slice(lineStart, callStart),
  );
  const classNameVariable = declaration?.[1];
  const closingParenthesis = closingParenthesisIndex(code, openingParenthesisIndex);

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
  const code = codeOnlySource(source);
  const callPattern = new RegExp(
    `${escapeRegularExpression(moduleBinding)}\\.${escapeRegularExpression(method)}\\(`,
    'gu',
  );

  return [...code.matchAll(callPattern)].flatMap((match) => {
    if (match.index === undefined) {
      return [];
    }

    const openingParenthesisIndex = match.index + match[0].length - 1;
    const declaration = declarationForCall(source, code, match.index, openingParenthesisIndex);
    return declaration === undefined ? [] : [declaration];
  });
};

const callReplacementsFor = (
  source: string,
  moduleBinding: string,
  method: string,
  value: string,
): readonly SourceReplacement[] => {
  const code = codeOnlySource(source);
  const callPattern = new RegExp(
    `${escapeRegularExpression(moduleBinding)}\\.${escapeRegularExpression(method)}\\(`,
    'gu',
  );

  return [...code.matchAll(callPattern)].flatMap((match) => {
    if (match.index === undefined) {
      return [];
    }

    const openingParenthesisIndex = match.index + match[0].length - 1;
    const closingParenthesis = closingParenthesisIndex(code, openingParenthesisIndex);

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

const keyframesCallCount = (source: string, moduleBinding: string): number => {
  const callPattern = new RegExp(`${escapeRegularExpression(moduleBinding)}\\.keyframes\\(`, 'gu');
  return [...codeOnlySource(source).matchAll(callPattern)].length;
};

const keyframesReplacementsFor = (
  scope: string,
  declarations: readonly StyleDeclaration[],
  keyframes: readonly CollectedKeyframes[],
): readonly KeyframesReplacement[] =>
  declarations.flatMap((declaration, index) => {
    const collected = keyframes[index];
    return collected === undefined
      ? []
      : [
          {
            declaration,
            temporaryName: collected.temporaryName,
            name: `rc_kf_${hashValue(`${scope}:keyframes:${declaration.classNameVariable}`)}`,
          },
        ];
  });

const fontFaceCallCount = (source: string, moduleBinding: string): number => {
  const callPattern = new RegExp(`${escapeRegularExpression(moduleBinding)}\\.fontFace\\(`, 'gu');
  return [...codeOnlySource(source).matchAll(callPattern)].length;
};

const fontFaceReplacementsFor = (
  declarations: readonly StyleDeclaration[],
  fontFaces: readonly CollectedFontFace[],
): readonly FontFaceReplacement[] =>
  declarations.flatMap((declaration, index) => {
    const fontFace = fontFaces[index];
    return fontFace === undefined ? [] : [{ declaration, family: fontFace.family }];
  });

const analyzeFontFaces = (
  source: string,
  moduleBinding: string,
  stylesheet: CollectedStylesheet,
): Result<readonly FontFaceReplacement[], CssSourceAnalysisFailure> => {
  const declarations = declarationsForCall(source, moduleBinding, 'fontFace');
  const callCount = fontFaceCallCount(source, moduleBinding);

  if (callCount !== stylesheet.fontFaces.length || declarations.length !== callCount) {
    return {
      _tag: 'Error',
      error: {
        _tag: 'CssSourceAnalysisFailure',
        message:
          'Each top-level Css.fontFace call must be assigned directly to its own let binding.',
      },
    };
  }

  const replacements = fontFaceReplacementsFor(declarations, stylesheet.fontFaces);
  return replacements.length === stylesheet.fontFaces.length
    ? { _tag: 'Ok', value: replacements }
    : {
        _tag: 'Error',
        error: {
          _tag: 'CssSourceAnalysisFailure',
          message: 'The collected font faces could not be paired with their source bindings.',
        },
      };
};

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
    rules: stylesheet.rules.map((rule) => ({ ...rule, cssText: replaceNames(rule.cssText) })),
    keyframes: stylesheet.keyframes,
    fontFaces: stylesheet.fontFaces,
    properties: stylesheet.properties,
    scopes: stylesheet.scopes.map((scope) => ({
      ...scope,
      bodyCssText: replaceNames(scope.bodyCssText),
    })),
    pages: stylesheet.pages,
    layerOrder: stylesheet.layerOrder,
  };
};

const replaceKeyframeNames = (
  cssText: string,
  replacements: readonly KeyframesReplacement[],
): string =>
  replacements
    .toSorted((left, right) => right.temporaryName.length - left.temporaryName.length)
    .reduce(
      (result, replacement) => result.replaceAll(replacement.temporaryName, replacement.name),
      cssText,
    );

const scopeStylesheetKeyframes = (
  source: string,
  moduleBinding: string,
  scope: string,
  stylesheet: CollectedStylesheet,
): Result<ScopedKeyframes, CssSourceAnalysisFailure> => {
  const declarations = declarationsForCall(source, moduleBinding, 'keyframes');
  const callCount = keyframesCallCount(source, moduleBinding);

  if (callCount !== stylesheet.keyframes.length || declarations.length !== callCount) {
    return {
      _tag: 'Error',
      error: {
        _tag: 'CssSourceAnalysisFailure',
        message:
          'Each top-level Css.keyframes call must be assigned directly to its own let binding.',
      },
    };
  }

  const replacements = keyframesReplacementsFor(scope, declarations, stylesheet.keyframes);

  if (replacements.length !== stylesheet.keyframes.length) {
    return {
      _tag: 'Error',
      error: {
        _tag: 'CssSourceAnalysisFailure',
        message: 'The collected keyframes could not be paired with their source bindings.',
      },
    };
  }

  const replaceNames = (cssText: string): string => replaceKeyframeNames(cssText, replacements);
  return {
    _tag: 'Ok',
    value: {
      replacements,
      stylesheet: {
        ...stylesheet,
        rootCssText: replaceNames(stylesheet.rootCssText),
        styles: stylesheet.styles.map((style) => ({
          ...style,
          cssText: replaceNames(style.cssText),
        })),
        rules: stylesheet.rules.map((rule) => ({
          ...rule,
          cssText: replaceNames(rule.cssText),
        })),
        scopes: stylesheet.scopes.map((scope) => ({
          ...scope,
          bodyCssText: replaceNames(scope.bodyCssText),
        })),
      },
    },
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

const sourceReplacementForKeyframes = ({
  name,
  declaration,
}: KeyframesReplacement): SourceReplacement => ({
  start: declaration.styleCallStart,
  end: declaration.styleCallEnd,
  value: JSON.stringify(name),
});

const sourceReplacementForFontFace = ({
  family,
  declaration,
}: FontFaceReplacement): SourceReplacement => ({
  start: declaration.styleCallStart,
  end: declaration.styleCallEnd,
  value: JSON.stringify(family),
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
    ...callReplacementsFor(source, moduleBinding, 'global', 'undefined'),
    ...callReplacementsFor(source, moduleBinding, 'layerOrder', 'undefined'),
    ...callReplacementsFor(source, moduleBinding, 'registerProperty', 'undefined'),
    ...callReplacementsFor(source, moduleBinding, 'scope', 'undefined'),
    ...callReplacementsFor(source, moduleBinding, 'page', 'undefined'),
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
  keyframesReplacements: readonly KeyframesReplacement[],
  fontFaceReplacements: readonly FontFaceReplacement[],
  removeCssModuleImport: (source: string, moduleBinding: string) => string,
): string => {
  const sourceForTransformation = removePreviousStylesheetTransform(
    source,
    moduleFilePath,
    cssFilePath,
    moduleFilePath,
  );
  const sourceWithAtRuleValues = replaceCalls(sourceForTransformation, [
    ...keyframesReplacements.map(sourceReplacementForKeyframes),
    ...fontFaceReplacements.map(sourceReplacementForFontFace),
  ]);
  const inlinedStyleClassNames = inlineStylesheetValues(
    sourceWithAtRuleValues,
    moduleBinding,
    stylesheet,
  );
  const stylesheetImport = stylesheetImportFor(moduleFilePath, cssFilePath);

  if (inlinedStyleClassNames === undefined) {
    return `${stylesheetImport}${activateStylesheet(moduleFilePath)}\n${removeStylesModule(sourceWithAtRuleValues)}`;
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

  const variableScopedStylesheet =
    scopeStylesheetVariables(source, moduleBinding, moduleFilePath, result.value) ?? result.value;
  const keyframesResult = scopeStylesheetKeyframes(
    source,
    moduleBinding,
    moduleFilePath,
    variableScopedStylesheet,
  );

  if (keyframesResult._tag === 'Error') {
    throw new Error(formatSourceAnalysisError(keyframesResult.error));
  }

  const { stylesheet, replacements: keyframesReplacements } = keyframesResult.value;
  const fontFaceResult = analyzeFontFaces(source, moduleBinding, stylesheet);

  if (fontFaceResult._tag === 'Error') {
    throw new Error(formatFontFaceAnalysisError(fontFaceResult.error));
  }

  const cssFilePath = matcher.cssFilePathFor(moduleFilePath);
  const transformedSource = injectStylesheetImport(
    source,
    cssFilePath,
    moduleFilePath,
    moduleBinding,
    stylesheet,
    keyframesReplacements,
    fontFaceResult.value,
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

      const variableScopedStylesheet =
        scopeStylesheetVariables(source, moduleBinding, id, result.value) ?? result.value;
      const keyframesResult = scopeStylesheetKeyframes(
        source,
        moduleBinding,
        id,
        variableScopedStylesheet,
      );

      if (keyframesResult._tag === 'Error') {
        this.error(formatSourceAnalysisError(keyframesResult.error));
        return null;
      }

      const { stylesheet, replacements: keyframesReplacements } = keyframesResult.value;
      const fontFaceResult = analyzeFontFaces(source, moduleBinding, stylesheet);

      if (fontFaceResult._tag === 'Error') {
        this.error(formatFontFaceAnalysisError(fontFaceResult.error));
        return null;
      }

      const cssFilePath = matcher.cssFilePathFor(id);
      const transformedSource = injectStylesheetImport(
        source,
        cssFilePath,
        id,
        moduleBinding,
        stylesheet,
        keyframesReplacements,
        fontFaceResult.value,
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
