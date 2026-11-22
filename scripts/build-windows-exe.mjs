import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const electronDir = path.join(rootDir, 'electron');
const stageDir = path.join(rootDir, '.electron-stage');
const releaseDir = path.join(rootDir, 'release');

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('dist/index.html bulunamadı. Önce `npm run build` çalıştırın.');
  process.exit(1);
}

execSync('node scripts/generate-win-icons.mjs', { stdio: 'inherit' });

const electronPkgPath = path.join(
  rootDir,
  'node_modules/electron/package.json'
);
if (!fs.existsSync(electronPkgPath)) {
  console.error(
    'node_modules/electron bulunamadı. Önce `npm install --no-save --legacy-peer-deps electron electron-builder` çalıştırın.'
  );
  process.exit(1);
}

const electronPkg = JSON.parse(fs.readFileSync(electronPkgPath, 'utf8'));
const electronVersion = electronPkg.version;
const rootPkg = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
);

fs.rmSync(stageDir, { recursive: true, force: true });
fs.rmSync(releaseDir, { recursive: true, force: true });
fs.mkdirSync(stageDir, { recursive: true });

fs.cpSync(distDir, path.join(stageDir, 'dist'), { recursive: true });
fs.cpSync(electronDir, path.join(stageDir, 'electron'), { recursive: true });

const stagePkg = {
  name: 'mihrab-namaz-vakti',
  productName: 'Mihrab',
  version: rootPkg.version || '1.0.0',
  description: 'Mihrab Namaz Vakitleri, Kıble Pusulası ve İslami Kitaplık',
  author: 'Mihrab',
  main: 'electron/main.cjs',
};

fs.writeFileSync(
  path.join(stageDir, 'package.json'),
  JSON.stringify(stagePkg, null, 2),
  'utf8'
);

const builderConfig = {
  appId: 'com.mihrab.namazvakti',
  productName: 'Mihrab',
  copyright: 'Mihrab Namaz Vakitleri',
  electronVersion,
  npmRebuild: false,
  nodeGypRebuild: false,
  buildDependenciesFromSource: false,
  directories: {
    app: '.electron-stage',
    output: 'release',
  },
  files: ['dist/**/*', 'electron/**/*'],
  asarUnpack: ['dist/books/**/*'],
  win: {
    icon: 'electron/icon.ico',
    target: [
      {
        target: 'portable',
        arch: ['x64'],
      },
    ],
  },
  portable: {
    artifactName: 'Mihrab-Windows-Portable.exe',
  },
};

const stageConfigPath = path.join(stageDir, 'electron-builder.stage.json');
fs.writeFileSync(
  stageConfigPath,
  JSON.stringify(builderConfig, null, 2),
  'utf8'
);

try {
  execSync(
    `npx electron-builder --config "${stageConfigPath}" --win portable --publish never`,
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        CSC_IDENTITY_AUTO_DISCOVERY: 'false',
      },
    }
  );
} finally {
  fs.rmSync(stageDir, { recursive: true, force: true });
}

const outExe = path.join(releaseDir, 'Mihrab-Windows-Portable.exe');
if (!fs.existsSync(outExe)) {
  console.error('Beklenen EXE dosyası oluşturulamadı:', outExe);
  process.exit(1);
}

console.log('Windows EXE başarıyla oluşturuldu:', outExe);
