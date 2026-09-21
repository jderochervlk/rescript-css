import { spawn } from 'node:child_process';
import { lstat, readdir, readlink, realpath, rm, symlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const exampleRoot = fileURLToPath(new URL('..', import.meta.url));
const packageRuntimePath = fileURLToPath(
  new URL('../../../packages/rescript-css/node_modules/@rescript/runtime', import.meta.url),
);
const packageSourcePath = fileURLToPath(
  new URL('../../../packages/rescript-css/src', import.meta.url),
);
const previewRescriptPath = fileURLToPath(new URL('../node_modules/rescript', import.meta.url));
const previewRuntimePath = resolve(
  dirname(await realpath(previewRescriptPath)),
  '@rescript/runtime',
);

const runViteBuild = () =>
  new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'vite', 'build'], {
      cwd: exampleRoot,
      stdio: 'inherit',
    });

    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`Vite exited with code ${code ?? 'unknown'}.`));
      }
    });
  });

const originalRuntimeLink = async () => {
  const details = await lstat(packageRuntimePath);

  if (!details.isSymbolicLink()) {
    throw new Error('Expected the workspace ReScript runtime to be a symbolic link.');
  }

  return readlink(packageRuntimePath);
};

const replaceRuntimeLink = async (target) => {
  await rm(packageRuntimePath);
  await symlink(target, packageRuntimePath);
};

const removePreviewModules = async () => {
  const entries = await readdir(packageSourcePath);
  const previewModules = entries
    .filter((entry) => entry.endsWith('.res.mjs'))
    .map((entry) => `${packageSourcePath}/${entry}`);

  await Promise.all(previewModules.map((path) => rm(path)));
};

const build = async () => {
  const originalLink = await originalRuntimeLink();

  try {
    await replaceRuntimeLink(previewRuntimePath);
    await runViteBuild();
  } finally {
    await removePreviewModules();
    await replaceRuntimeLink(originalLink);
  }
};

await build();
