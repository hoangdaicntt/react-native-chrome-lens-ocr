#!/usr/bin/env node

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { cp, mkdir, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const srcDir = path.join(projectRoot, 'src');
const protoSrcDir = path.join(srcDir, 'utils', 'proto_generated');
const protoDistDir = path.join(distDir, 'utils', 'proto_generated');

const entryPoints = [
  path.join(srcDir, 'index.ts'),
  path.join(srcDir, 'core.ts'),
  path.join(srcDir, 'consts.ts'),
  path.join(srcDir, 'types.ts'),
  path.join(srcDir, 'utils.ts')
];

async function run() {
  await rm(distDir, { recursive: true, force: true });

  await build({
    entryPoints,
    outdir: distDir,
    outbase: srcDir,
    bundle: false,
    sourcemap: true,
    format: 'esm',
    target: ['es2020'],
    platform: 'neutral',
    logLevel: 'info',
    tsconfig: path.join(projectRoot, 'tsconfig.json')
  });

  await mkdir(protoDistDir, { recursive: true });
  await cp(protoSrcDir, protoDistDir, { recursive: true });

  await runTsc();
}

async function runTsc() {
  const binExt = process.platform === 'win32' ? '.cmd' : '';
  const tscBin = path.join(projectRoot, 'node_modules', '.bin', `tsc${binExt}`);

  await new Promise((resolve, reject) => {
    const child = spawn(tscBin, ['--project', 'tsconfig.build.json'], {
      stdio: 'inherit',
      cwd: projectRoot,
      env: process.env
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`tsc exited with code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
