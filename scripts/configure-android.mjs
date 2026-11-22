import fs from 'fs';
import path from 'path';

const manifestPath = path.resolve(
  process.cwd(),
  'android/app/src/main/AndroidManifest.xml'
);

if (!fs.existsSync(manifestPath)) {
  console.error('AndroidManifest.xml bulunamadı:', manifestPath);
  process.exit(1);
}

let manifest = fs.readFileSync(manifestPath, 'utf8');

const requiredPermissions = [
  '<uses-permission android:name="android.permission.INTERNET" />',
  '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
  '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />',
  '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
  '<uses-permission android:name="android.permission.VIBRATE" />',
];

for (const perm of requiredPermissions) {
  const attrMatch = perm.match(/android:name="([^"]+)"/);
  if (attrMatch && !manifest.includes(attrMatch[1])) {
    manifest = manifest.replace(
      '<application',
      `    ${perm}\n\n    <application`
    );
  }
}

fs.writeFileSync(manifestPath, manifest, 'utf8');
console.log('AndroidManifest.xml izinleri doğrulandı.');
