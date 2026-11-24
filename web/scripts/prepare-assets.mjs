// Copies the app's shared, platform-neutral code (src/) and bundled images (assets/)
// from the native app into web/shared/, so the web build reuses them unchanged.
// Also puts sql.js's WebAssembly file and the app icons into public/.
// Generated output only: edit the originals in ../src and ../assets, never web/shared.
import { cpSync, existsSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(web, '..');
const out = join(web, 'shared');

// UI code (screens, components, sheets, onboarding) is React Native; the web has its own.
const SRC = ['db', 'domain', 'lib', 'data', 'design', 'hooks', 'types.ts', 'data.ts', 'store.tsx', 'theme.ts'];
const ASSETS = ['dishes', 'grocery'];

rmSync(out, { recursive: true, force: true });
for (const name of SRC) {
  cpSync(join(repo, 'src', name), join(out, 'src', name), {
    recursive: true,
    filter: (p) => !p.includes('__tests__'),
  });
}
for (const name of ASSETS) cpSync(join(repo, 'assets', name), join(out, 'assets', name), { recursive: true });

mkdirSync(join(web, 'public'), { recursive: true });
copyFileSync(join(web, 'node_modules/sql.js/dist/sql-wasm-browser.wasm'), join(web, 'public/sql-wasm.wasm'));
if (!existsSync(join(web, 'public/icon.svg'))) copyFileSync(join(repo, 'assets/icon.svg'), join(web, 'public/icon.svg'));
console.log('[rasoi] shared code and assets ready');
