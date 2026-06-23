import { readFile, writeFile } from 'node:fs/promises';

const checkOnly = process.argv.includes('--check');
const packageJsonUrl = new URL('../package.json', import.meta.url);
const versionSourceUrl = new URL('../src/version.ts', import.meta.url);

const packageJson = JSON.parse(await readFile(packageJsonUrl, 'utf8'));
const expectedSource = renderVersionSource(
  packageJson.name,
  packageJson.version,
);

if (checkOnly) {
  const actualSource = await readFile(versionSourceUrl, 'utf8');

  if (actualSource !== expectedSource) {
    throw new Error(
      'src/version.ts is out of sync with package.json. Run pnpm sync:version.',
    );
  }

  console.log(
    `Version source is in sync: ${packageJson.name}@${packageJson.version}`,
  );
} else {
  await writeFile(versionSourceUrl, expectedSource, 'utf8');
  console.log(
    `Synced version source: ${packageJson.name}@${packageJson.version}`,
  );
}

function renderVersionSource(name, version) {
  return `export const PACKAGE_NAME = '${name}';
export const VERSION = '${version}';
export const DEFAULT_USER_AGENT = \`\${PACKAGE_NAME}-js/\${VERSION}\`;

export interface PackageInfo {
  name: typeof PACKAGE_NAME;
  version: typeof VERSION;
}

export function getPackageInfo(): PackageInfo {
  return {
    name: PACKAGE_NAME,
    version: VERSION,
  };
}
`;
}
