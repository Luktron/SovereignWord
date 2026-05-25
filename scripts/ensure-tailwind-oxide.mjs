import {spawnSync} from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function hasTailwindOxideBinding() {
  const check = spawnSync(process.execPath, ['-e', "require('@tailwindcss/oxide')"], {
    stdio: 'ignore',
  });

  return check.status === 0;
}

if (hasTailwindOxideBinding()) {
  process.exit(0);
}

console.warn('[setup] Missing @tailwindcss/oxide native binding. Attempting automatic repair...');

const repair = spawnSync(npmCommand, ['rebuild', '@tailwindcss/oxide', '--include=optional'], {
  stdio: 'inherit',
});

if (repair.status !== 0) {
  console.error('[setup] Automatic repair failed. Run `npm i` to refresh optional dependencies.');
  process.exit(repair.status ?? 1);
}

if (!hasTailwindOxideBinding()) {
  console.error('[setup] Repair completed but binding is still unavailable. Run `npm i` and retry.');
  process.exit(1);
}

console.warn('[setup] Tailwind native binding restored successfully.');
