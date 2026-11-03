// Publishes the whole site to GitHub Pages as a shareable preview at
// https://<user>.github.io/<repo>/. Only the built site is pushed, to the repo's gh-pages branch;
// the source code never leaves this folder. The live Firebase site is untouched.
//
//   npm run deploy:pages -- https://github.com/<user>/<repo>.git
//   npm run deploy:pages -- https://github.com/<user>/<repo>.git --build-only   (build, don't push)
import { execFileSync } from 'node:child_process';
import { cpSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'pages-dist');
const remote = process.argv[2];
const buildOnly = process.argv.includes('--build-only');
const [, user, repo] = remote?.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/) || [];

if (!repo) {
  console.error('Usage: npm run deploy:pages -- https://github.com/<user>/<repo>.git');
  process.exit(1);
}

const run = (command, args, cwd = root) =>
  execFileSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });

// Pages serves the site from /<repo>/, so every asset and route is built under that path.
run('npx', ['vite', 'build', '--base', `/${repo}/`, '--outDir', 'pages-dist', '--emptyOutDir']);

// In public/ but used by no page: reference and raw media files stay off the published site.
for (const file of ['BURGER-VIDEO.mp4', 'IMG_2555.MOV', 'IMG_4921.JPEG']) {
  rmSync(path.join(out, file), { force: true });
}
// Pages answers any unknown path with 404.html, so make that the app as well: a link straight to
// /<repo>/build-your-shawarma then opens the right page. .nojekyll stops Pages skipping files.
cpSync(path.join(out, 'index.html'), path.join(out, '404.html'));
writeFileSync(path.join(out, '.nojekyll'), '');

if (buildOnly) {
  console.log(`\nBuilt in pages-dist/ for https://${user}.github.io/${repo}/ (not pushed).`);
  process.exit(0);
}

// A fresh one-commit branch each time: the published copy needs no history.
rmSync(path.join(out, '.git'), { recursive: true, force: true });
run('git', ['init', '-q', '-b', 'gh-pages'], out);
run('git', ['add', '-A'], out);
run('git', ['commit', '-q', '-m', 'Publish site preview'], out);
run('git', ['push', '-f', remote, 'gh-pages'], out);

console.log(`\nPushed. The site appears at https://${user}.github.io/${repo}/ within a minute or two.`);
