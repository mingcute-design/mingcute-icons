import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const packageRoot = path.resolve(import.meta.dirname, '..');
const cache = await mkdtemp(path.join(os.tmpdir(), 'mingcute-svelte-pack-'));
try {
  const packed = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: packageRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, npm_config_cache: cache },
  });
  if (packed.status !== 0) throw new Error(packed.stderr || packed.stdout);
  const report = JSON.parse(packed.stdout)[0];
  const files = report.files.map(({ path: filePath }) => filePath);
  const icons = files.filter((file) => /^dist\/styles\/[^/]+\/[^/]+\.svelte$/.test(file));
  const indexes = files.filter((file) => /^dist\/styles\/[^/]+\.js$/.test(file));
  const sources = files.filter((file) => /^(?:src|scripts|tests|\.tooling)\//.test(file));
  const maps = files.filter((file) => file.endsWith('.map'));
  console.table({ package: `${report.name}@${report.version}`, files: files.length,
    iconComponents: icons.length, styleIndexes: indexes.length, sourceFiles: sources.length,
    sourceMaps: maps.length, unpackedBytes: report.unpackedSize });
  if (icons.length !== 4_526 || indexes.length !== 2 || sources.length || maps.length) {
    throw new Error('Svelte packed-artifact audit failed.');
  }
  console.log('Svelte packed-artifact audit passed.');
} finally {
  await rm(cache, { recursive: true, force: true });
}
