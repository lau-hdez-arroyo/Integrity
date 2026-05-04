/**
 * Complete Database Reset - Node.js version (Cross-platform)
 * Run: node scripts/full-reset-cli.js
 */
import { spawn } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const scripts = [
  { name: 'Deleting test users', script: 'scripts/delete-test-users.js' },
  { name: 'Resetting database tables', script: 'scripts/reset-database.js' },
  { name: 'Creating fresh test users', script: 'scripts/create-test-users.js' },
  { name: 'Seeding dummy data', script: 'scripts/seed-dummy-data.js' },
];

function printHeader() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  INTEGRITY DATABASE RESET                      ║
║              ⚠️  THIS WILL DELETE ALL DATA ⚠️                   ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const process = spawn('node', [scriptPath], {
      stdio: 'inherit',
      shell: true,
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script failed with code ${code}`));
      }
    });

    process.on('error', reject);
  });
}

async function runAllScripts() {
  try {
    for (let i = 0; i < scripts.length; i++) {
      const { name, script } = scripts[i];
      const step = i + 1;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`Step ${step}/${scripts.length}: ${name}...`);
      console.log('='.repeat(60));

      await runScript(script);

      if (i < scripts.length - 1) {
        console.log(`✅ Step ${step} complete\n`);
      }
    }

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    ✅ RESET COMPLETE ✅                        ║
╠════════════════════════════════════════════════════════════════╣
║ Database is now clean and ready for development!               ║
║                                                                ║
║ To start the app, run:                                         ║
║   npm run dev                                                  ║
║                                                                ║
║ Test credentials are ready at the same locations              ║
║                                                                ║
║ Login with:                                                    ║
║   admin@integrity.dev / Admin@2026                             ║
║   qa.tester@integrity.dev / Integrity@2026                     ║
║   developer@integrity.dev / Developer@2026                     ║
║   executive@integrity.dev / Executive@2026                     ║
╚════════════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    console.error(`\n❌ Error during reset: ${err.message}`);
    process.exit(1);
  }
}

async function confirmReset() {
  return new Promise((resolve) => {
    rl.question('⚠️  Are you SURE you want to reset the database? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  printHeader();

  const confirmed = await confirmReset();
  if (!confirmed) {
    console.log('\n❌ Reset cancelled.');
    process.exit(0);
  }

  await runAllScripts();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
