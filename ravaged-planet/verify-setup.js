// Verification script to check all required files exist
import { readFileSync } from 'fs';
import { existsSync } from 'fs';
import { readdirSync } from 'fs';
import { join } from 'path';

const requiredFiles = [
  'index.html',
  'assets/font.ttf',
  'src/main.js',
  'src/ai.js',
  'src/constants.js',
  'src/gfx.js',
  'src/input.js',
  'src/math.js',
  'src/projectiles.js',
  'src/sky.js',
  'src/sound.js',
  'src/terrain.js',
  'src/utils.js',
  'src/weapons.js',
];

let allGood = true;

console.log('Verifying Ravaged Planet setup...\n');

for (const file of requiredFiles) {
  const exists = existsSync(file);
  console.log(`${exists ? '✓' : '✗'} ${file}`);
  if (!exists) {
    allGood = false;
  }
}

const srcFiles = readdirSync('src').filter(f => f.endsWith('.js'));
console.log(`\nFound ${srcFiles.length} JavaScript files in src/`);

if (allGood && srcFiles.length === 12) {
  console.log('\n✅ All files present! Setup is complete.');
  process.exit(0);
} else {
  console.log('\n❌ Some files are missing. Please check the setup.');
  process.exit(1);
}

