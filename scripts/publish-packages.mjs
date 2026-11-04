import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { discoverReleasePackages, loadReleasePolicy, validateRelease } from './release-policy.mjs';

const rootDir = path.resolve(import.meta.dirname, '..');
const dryRun = process.argv.includes('--dry-run');
const accountIndex = process.argv.indexOf('--account');
const account = accountIndex === -1 ? undefined : process.argv[accountIndex + 1];
if (accountIndex !== -1 && (!account || account.startsWith('--'))) throw new Error('--account requires an npm username.');
const policy = await loadReleasePolicy(rootDir);
const packages = await discoverReleasePackages(rootDir);
validateRelease(policy, packages);
packages.sort((left, right) => policy.requiredPackages.indexOf(left.manifest.name) - policy.requiredPackages.indexOf(right.manifest.name));

function run(command, args, cwd = rootDir) {
  return spawnSync(command, args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}
function requireSuccess(result, label) {
  if (result.status !== 0) throw new Error(`${label}: ${result.stderr || result.stdout || result.error?.message}`);
  return result.stdout;
}

const npmVersion = requireSuccess(run('npm', ['--version']), 'Read npm version').trim();
if (!dryRun && account) {
  const identity = requireSuccess(run('npm', ['whoami', '--registry=https://registry.npmjs.org/']), 'Verify npm publishing identity').trim();
  if (identity !== account) throw new Error(`Expected npm account ${account}; found ${identity}.`);
} else if (!dryRun) {
  const [major, minor, patch] = npmVersion.split('.').map(Number);
  if (major < 11 || (major === 11 && (minor < 5 || (minor === 5 && patch < 1)))) {
    throw new Error(`Trusted publishing requires npm >=11.5.1; found ${npmVersion}.`);
  }
  if (process.env.GITHUB_ACTIONS !== 'true' || !process.env.ACTIONS_ID_TOKEN_REQUEST_URL) {
    throw new Error('Publish from the GitHub workflow with id-token: write. Use --dry-run for local validation.');
  }
}
console.log(`Using npm ${npmVersion}; ${dryRun ? 'dry-run' : account ? `publish as ${account}` : 'GitHub OIDC publish'} for ${packages.length} allowlisted packages.`);
const temporary = await mkdtemp(path.join(os.tmpdir(), 'mingcute-public-release-'));
try {
  for (const { directory, manifest } of packages) {
    if (!dryRun) {
      const existing = run('npm', ['view', `${manifest.name}@${manifest.version}`, 'version', '--json', '--registry=https://registry.npmjs.org/']);
      if (existing.status === 0 && JSON.parse(existing.stdout) === manifest.version) {
        console.log(`Already published: ${manifest.name}@${manifest.version}`);
        continue;
      }
      if (existing.status !== 0 && !existing.stderr.includes('E404')) requireSuccess(existing, `Check ${manifest.name}`);
    }
    requireSuccess(run('pnpm', ['--dir', directory, 'pack', '--pack-destination', temporary]), `Pack ${manifest.name}`);
    const archive = path.join(temporary, `${manifest.name.replace('@', '').replace('/', '-')}-${manifest.version}.tgz`);
    const packed = JSON.parse(requireSuccess(run('tar', ['-xOf', archive, 'package/package.json']), 'Read packed manifest'));
    if (packed.name !== manifest.name || packed.version !== policy.version || JSON.stringify(packed).includes('workspace:')) {
      throw new Error(`Packed manifest is not installable or differs from policy: ${manifest.name}`);
    }
    const args = ['publish', archive, '--access=public', '--registry=https://registry.npmjs.org/', '--loglevel=warn'];
    if (dryRun) args.push('--dry-run');
    else if (!account) args.push('--provenance');
    const published = account && !dryRun
      ? spawnSync('npm', args, { cwd: rootDir, stdio: 'inherit' })
      : run('npm', args);
    requireSuccess(published, `Publish ${manifest.name}`);
    console.log(`${dryRun ? 'Validated archive' : 'Published'}: ${manifest.name}@${manifest.version}`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
