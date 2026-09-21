import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const workspaceRoot = resolve(import.meta.dirname, '..');
const packageRoot = join(workspaceRoot, 'packages', 'rescript-css');

const ok = (value) => ({ _tag: 'Ok', value });
const error = (message) => ({ _tag: 'Error', message });

const run = async (command, args, cwd) => {
  try {
    return ok(await exec(command, args, { cwd, maxBuffer: 10 * 1024 * 1024 }));
  } catch (cause) {
    const details = cause instanceof Error ? cause.message : String(cause);
    const output =
      typeof cause === 'object' && cause !== null && 'stderr' in cause
        ? `${cause.stdout ?? ''}${cause.stderr ?? ''}`
        : '';
    return error(`${command} ${args.join(' ')} failed:\n${details}\n${output}`);
  }
};

const parseJson = (source, label) => {
  try {
    return ok(JSON.parse(source));
  } catch (cause) {
    const details = cause instanceof Error ? cause.message : String(cause);
    return error(`Could not parse ${label}: ${details}`);
  }
};

const pack = async (directory) => {
  const result = await run(
    'npm',
    ['pack', '--ignore-scripts', '--json', '--pack-destination', directory, packageRoot],
    workspaceRoot,
  );
  if (result._tag === 'Error') return result;

  const parsed = parseJson(result.value.stdout, 'npm pack output');
  if (parsed._tag === 'Error') return parsed;

  const filename = Array.isArray(parsed.value) ? parsed.value[0]?.filename : undefined;
  return typeof filename === 'string'
    ? ok(join(directory, filename))
    : error('npm pack did not report a tarball filename.');
};

const formattedJson = (value) => `${JSON.stringify(value, undefined, 2)}\n`;

const consumerPackage = (tarballPath, { rescriptVersion, runtimeVersion, viteVersion }) => ({
  name: 'rescript-css-package-smoke-test',
  private: true,
  type: 'module',
  dependencies: { '@jvlk/rescript-css': `file:${tarballPath}` },
  devDependencies: {
    ...(runtimeVersion === undefined ? {} : { '@rescript/runtime': runtimeVersion }),
    rescript: rescriptVersion,
    vite: viteVersion,
  },
});

const supportedConsumers = [
  { label: 'ReScript 11', rescriptVersion: '11.1.4', viteVersion: '8.3.0' },
  {
    label: 'ReScript 12',
    rescriptVersion: '12.3.1',
    runtimeVersion: '12.3.1',
    viteVersion: '8.3.0',
  },
  {
    label: 'ReScript 13 preview',
    rescriptVersion: '13.0.0-alpha.6',
    runtimeVersion: '13.0.0-alpha.6',
    viteVersion: '8.3.0',
  },
];

const consumerConfig = (rescriptVersion) => ({
  name: 'rescript-css-package-smoke-test',
  sources: [{ dir: 'src', subdirs: true }],
  ...(rescriptVersion.startsWith('11.')
    ? {
        'bs-dependencies': ['@jvlk/rescript-css'],
        'package-specs': [{ module: 'esmodule', 'in-source': true }],
      }
    : { dependencies: ['@jvlk/rescript-css'] }),
  ...(rescriptVersion.startsWith('11.')
    ? {}
    : { 'package-specs': { module: 'esmodule', 'in-source': true } }),
  suffix: '.res.js',
});

const advancedConsumerFiles = (tarballPath, consumer) => [
  ['package.json', formattedJson(consumerPackage(tarballPath, consumer))],
  ['rescript.json', formattedJson(consumerConfig(consumer.rescriptVersion))],
  [
    'src/Animations.res',
    'let fadeIn = Css.keyframes(~layer=Css.namedLayer("components"), [Css.frame(~at="from", {opacity: 0.0}), Css.frame(~at="to", {opacity: 1.0})])\n',
  ],
  [
    'src/Fonts.res',
    'let inter = Css.fontFace(~layer=Css.namedLayer("tokens"), {family: "Smoke Sans", src: [Css.localFontSource(~name="Smoke Sans"), Css.fontSource(~url="/fonts/smoke.woff2", ~format="woff2", ~tech=["variations"])], weight: "100 900", display: Swap})\n',
  ],
  [
    'src/Smoke.res',
    'let _ = Css.layerOrder(["reset", "tokens", "base", "components"])\nlet _ = Css.registerProperty(~layer=Css.namedLayer("tokens"), {name: "--smoke-progress", syntax: "<number>", inherits: false, initialValue: "0"})\nlet _ = Css.scope(~root=".smoke", ~selector=":scope > h1", ~layer=Css.namedLayer("base"), {color: Hex("0f172a")})\nlet _ = Css.page(~selector=":first", [("size", "A4"), ("margin", "2cm")])\nlet _ = Css.global(~selector="body", ~layer=Css.namedLayer("base"), {margin: Zero})\nlet duration = switch CssValue.Duration.ms(180.5) { | Ok(value) => value | Error(_) => CssValue.Duration.zero }\nlet columns: CssValue.TrackList.t = switch (CssValue.TrackLength.make(Rem(12.0)), CssValue.TrackFraction.make(1.0)) { | (Ok(minimum), Ok(maximum)) => Tracks([AutoRepeat(AutoFit, [FixedBreadth(Minmax(minimum, MaximumFraction(maximum)))])]) | _ => Raw("repeat(auto-fit, minmax(12rem, 1fr))") }\nlet className = Css.style(~layer=Css.namedLayer("components"), {display: Block, color: Hex("0f172a"), fontFamily: `${Fonts.inter}, system-ui`, animationName: Animations.fadeIn, animationDuration: duration, animationTimingFunction: EaseOut, gridTemplateColumns: columns, transform: Transforms([TranslateY(Px(-1)), Rotate(Deg(2.5))]), borderStartStartRadius: Raw("4px"), overscrollBehavior: Contain, textWrap: Balance, translate: X(Px(1))})\n',
  ],
  [
    'src/main.js',
    'import { className } from "./Smoke.res.js";\ndocument.querySelector("#app").className = className;\n',
  ],
  [
    'vite.config.js',
    'import { defineConfig } from "vite";\nimport { rescriptCss } from "@jvlk/rescript-css/vite";\nexport default defineConfig({plugins: [rescriptCss()]});\n',
  ],
  ['index.html', '<main id="app"></main><script type="module" src="/src/main.js"></script>\n'],
];

const rescript11ConsumerFiles = (tarballPath, consumer) => [
  ['package.json', formattedJson(consumerPackage(tarballPath, consumer))],
  ['rescript.json', formattedJson(consumerConfig(consumer.rescriptVersion))],
  [
    'src/Smoke.res',
    'let className = Css.class({display: Grid, maxWidth: Rem(32.0), margin: Auto, padding: Rem(1.5), color: Named("#0f172a"), background: "#ecfeff", hover: Css.style({background: "#cffafe"})})\n',
  ],
  [
    'src/main.js',
    'import { className } from "./Smoke.res.js";\ndocument.querySelector("#app").className = className;\n',
  ],
  [
    'vite.config.js',
    'import { defineConfig } from "vite";\nimport { rescriptCss } from "@jvlk/rescript-css/vite";\nexport default defineConfig({plugins: [rescriptCss()]});\n',
  ],
  ['index.html', '<main id="app"></main><script type="module" src="/src/main.js"></script>\n'],
];

const consumerFiles = (tarballPath, consumer) =>
  consumer.rescriptVersion.startsWith('11.')
    ? rescript11ConsumerFiles(tarballPath, consumer)
    : advancedConsumerFiles(tarballPath, consumer);

const writeConsumer = async (directory, files) => {
  await Promise.all(
    files.map(async ([relativePath, contents]) => {
      const filePath = join(directory, relativePath);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, contents);
    }),
  );
};

const verifyCss = async (consumerRoot, consumer) => {
  if (consumer.rescriptVersion.startsWith('11.')) {
    const css = await readFile(join(consumerRoot, 'src', 'Smoke.css'), 'utf8');
    return css.includes('display: grid;') &&
      css.includes('max-width: 32rem;') &&
      css.includes('background: #ecfeff;') &&
      css.includes('background: #cffafe;')
      ? ok(undefined)
      : error(`The installed package emitted unexpected CSS:\n${css}`);
  }

  const [animationCss, fontCss, smokeCss] = await Promise.all(
    ['Animations.css', 'Fonts.css', 'Smoke.css'].map((filename) =>
      readFile(join(consumerRoot, 'src', filename), 'utf8'),
    ),
  );
  const animationName = /@keyframes (rc_kf_[a-z0-9]+) \{/u.exec(animationCss)?.[1];
  return animationName !== undefined &&
    smokeCss.startsWith('@layer reset, tokens, base, components;') &&
    animationCss.includes('@layer components {') &&
    fontCss.includes('@layer tokens {') &&
    smokeCss.includes('@layer base {') &&
    smokeCss.includes('@layer components {') &&
    smokeCss.includes(`animation-name: ${animationName};`) &&
    animationCss.match(/@keyframes /gu)?.length === 1 &&
    fontCss.includes('font-family: "Smoke Sans";') &&
    fontCss.includes(
      'src: local("Smoke Sans"), url("/fonts/smoke.woff2") format("woff2") tech(variations);',
    ) &&
    fontCss.includes('font-weight: 100 900;') &&
    smokeCss.includes('@property --smoke-progress {') &&
    smokeCss.includes('syntax: "<number>";') &&
    smokeCss.includes('@scope (.smoke) {') &&
    smokeCss.includes(':scope > h1 {') &&
    smokeCss.includes('@page :first {\n  size: A4;\n  margin: 2cm;\n}') &&
    smokeCss.includes('  body {\n    margin: 0;\n  }') &&
    smokeCss.includes('display: block;') &&
    smokeCss.includes('border-start-start-radius: 4px;') &&
    smokeCss.includes('overscroll-behavior: contain;') &&
    smokeCss.includes('text-wrap: balance;') &&
    smokeCss.includes('translate: 1px;') &&
    smokeCss.includes('color: #0f172a;') &&
    smokeCss.includes('grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));') &&
    smokeCss.includes('transform: translateY(-1px) rotate(2.5deg);') &&
    smokeCss.includes('animation-duration: 180.5ms;') &&
    smokeCss.includes('animation-timing-function: ease-out;') &&
    smokeCss.includes('font-family: "Smoke Sans", system-ui;')
    ? ok(undefined)
    : error(
        `The installed package emitted unexpected CSS:\n${animationCss}\n--- Fonts.css ---\n${fontCss}\n--- Smoke.css ---\n${smokeCss}`,
      );
};

const verifyConsumer = async (temporaryRoot, tarball, consumer) => {
  const consumerRoot = join(temporaryRoot, consumer.rescriptVersion);
  const libraryRoot = join(consumerRoot, 'node_modules', '@jvlk', 'rescript-css');
  const compiler = join(consumerRoot, 'node_modules', '.bin', 'rescript');

  await writeConsumer(consumerRoot, consumerFiles(tarball, consumer));
  const commands = [
    ['pnpm', ['install', '--no-frozen-lockfile', '--ignore-scripts'], consumerRoot],
    [compiler, ['clean'], libraryRoot],
    [compiler, ['build'], libraryRoot],
    ['pnpm', ['exec', 'rescript', 'build'], consumerRoot],
    ['pnpm', ['exec', 'vite', 'build'], consumerRoot],
  ];
  for (const [command, args, cwd] of commands) {
    const result = await run(command, args, cwd);
    if (result._tag === 'Error') return error(`${consumer.label}: ${result.message}`);
  }

  const result = await verifyCss(consumerRoot, consumer);
  return result._tag === 'Error' ? error(`${consumer.label}: ${result.message}`) : result;
};

const selectedConsumers = () => {
  const [selection] = process.argv.slice(2);
  if (selection === undefined) return ok(supportedConsumers);

  const consumer = supportedConsumers.find(({ rescriptVersion }) =>
    rescriptVersion.startsWith(`${selection}.`),
  );
  return consumer === undefined
    ? error(`Unknown ReScript compatibility target: ${selection}.`)
    : ok([consumer]);
};

const verifyPackage = async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'rescript-css-package-'));

  try {
    const [tarball, consumers] = await Promise.all([pack(temporaryRoot), selectedConsumers()]);
    if (tarball._tag === 'Error') return tarball;
    if (consumers._tag === 'Error') return consumers;

    for (const consumer of consumers.value) {
      const result = await verifyConsumer(temporaryRoot, tarball.value, consumer);
      if (result._tag === 'Error') return result;
    }

    return ok(undefined);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
};

try {
  const result = await verifyPackage();
  if (result._tag === 'Error') {
    console.error(result.message);
    process.exitCode = 1;
  } else {
    console.log('Verified the packed package in clean ReScript and Vite consumers.');
  }
} catch (cause) {
  console.error(cause instanceof Error ? cause.message : String(cause));
  process.exitCode = 1;
}
