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
    return error(`${command} ${args.join(' ')} failed:\n${details}`);
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

const packageVersion = async (packageName) => {
  const filePath = join(workspaceRoot, 'node_modules', packageName, 'package.json');
  const parsed = parseJson(await readFile(filePath, 'utf8'), filePath);
  if (parsed._tag === 'Error') return parsed;

  const version = parsed.value?.version;
  return typeof version === 'string' && version.length > 0
    ? ok(version)
    : error(`${filePath} does not contain a valid version.`);
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

const consumerPackage = (tarballPath, rescriptVersion, viteVersion) => ({
  name: 'rescript-css-package-smoke-test',
  private: true,
  type: 'module',
  dependencies: { '@jvlk/rescript-css': `file:${tarballPath}` },
  devDependencies: { rescript: rescriptVersion, vite: viteVersion },
});

const consumerConfig = {
  name: 'rescript-css-package-smoke-test',
  sources: [{ dir: 'src', subdirs: true }],
  dependencies: ['@jvlk/rescript-css'],
  'package-specs': { module: 'esmodule', 'in-source': true },
  suffix: '.res.js',
};

const consumerFiles = (tarballPath, rescriptVersion, viteVersion) => [
  ['package.json', formattedJson(consumerPackage(tarballPath, rescriptVersion, viteVersion))],
  ['rescript.json', formattedJson(consumerConfig)],
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

const writeConsumer = async (directory, files) => {
  await Promise.all(
    files.map(async ([relativePath, contents]) => {
      const filePath = join(directory, relativePath);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, contents);
    }),
  );
};

const verifyCss = async (consumerRoot) => {
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

const verifyPackage = async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'rescript-css-package-'));
  const consumerRoot = join(temporaryRoot, 'consumer');

  try {
    const [tarball, rescriptVersion, viteVersion] = await Promise.all([
      pack(temporaryRoot),
      packageVersion('rescript'),
      packageVersion('vite'),
    ]);
    const failure = [tarball, rescriptVersion, viteVersion].find(({ _tag }) => _tag === 'Error');
    if (failure !== undefined) return failure;

    await writeConsumer(
      consumerRoot,
      consumerFiles(tarball.value, rescriptVersion.value, viteVersion.value),
    );
    for (const [command, args] of [
      ['pnpm', ['install', '--no-frozen-lockfile', '--ignore-scripts']],
      ['pnpm', ['exec', 'rescript', 'build']],
      ['pnpm', ['exec', 'vite', 'build']],
    ]) {
      const result = await run(command, args, consumerRoot);
      if (result._tag === 'Error') return result;
    }

    return verifyCss(consumerRoot);
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
    console.log('Verified the packed package in a clean ReScript and Vite consumer.');
  }
} catch (cause) {
  console.error(cause instanceof Error ? cause.message : String(cause));
  process.exitCode = 1;
}
