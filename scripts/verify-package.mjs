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
  ['src/Smoke.res', 'let className = Css.style({display: Block, color: "#0f172a"})\n'],
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
  const css = await readFile(join(consumerRoot, 'src', 'Smoke.css'), 'utf8');
  return css.includes('display: block;') && css.includes('color: #0f172a;')
    ? ok(undefined)
    : error(`The installed package emitted unexpected CSS:\n${css}`);
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
