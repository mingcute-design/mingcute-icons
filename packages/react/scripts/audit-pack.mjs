import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const packageRoot = path.resolve(import.meta.dirname, '..');
const cacheDirectory = await mkdtemp(path.join(os.tmpdir(), 'mingcute-react-npm-cache-'));

try {
  const packed = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: packageRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, npm_config_cache: cacheDirectory },
  });
  if (packed.status !== 0) throw new Error(packed.stderr || packed.stdout || 'npm pack dry run failed');

  const report = JSON.parse(packed.stdout)[0];
  const files = report.files.map(({ path: filePath }) => filePath);
  const iconModules = files.filter((filePath) => /^dist\/styles\/[^/]+\/[^/]+\.js$/.test(filePath));
  const styleIndexes = files.filter((filePath) => /^dist\/styles\/[^/]+\.js$/.test(filePath));
  const sourceFiles = files.filter((filePath) =>
    /^(?:src|scripts|tests|\.tooling)\//.test(filePath));
  const sourceMaps = files.filter((filePath) => filePath.endsWith('.map'));
  const failures = [];

  if (iconModules.length !== 4_526) failures.push(`expected 4526 icon modules, found ${iconModules.length}`);
  if (styleIndexes.length !== 2) failures.push(`expected 2 style indexes, found ${styleIndexes.length}`);
  if (sourceFiles.length) failures.push(`source/tooling files present: ${sourceFiles.join(', ')}`);
  if (sourceMaps.length) failures.push(`source maps present: ${sourceMaps.join(', ')}`);

  console.table({
    package: `${report.name}@${report.version}`,
    files: files.length,
    iconModules: iconModules.length,
    styleIndexes: styleIndexes.length,
    sourceFiles: sourceFiles.length,
    sourceMaps: sourceMaps.length,
    unpackedBytes: report.unpackedSize,
  });

  if (failures.length) throw new Error(failures.join('\n'));
  console.log('React packed-artifact audit passed.');
} finally {
  await rm(cacheDirectory, { recursive: true, force: true });
}
