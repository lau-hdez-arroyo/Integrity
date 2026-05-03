#!/usr/bin/env node

console.log('\n📦 INTEGRITY - Data Import via Backend\n');
console.log('═'.repeat(70));

// Check if backend is running
async function waitForBackend(maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch('http://localhost:5000/api/v1/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      // Just check if we get any response (not just 200)
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        console.log(`⏳ Waiting for backend... (${i + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
  }
  return false;
}

async function importData() {
  try {
    console.log('\n🔌 Checking backend connection...');
    const backendReady = await waitForBackend();

    if (!backendReady) {
      console.error('\n❌ Error: Backend is not running');
      console.error('Please start the backend with: npm run dev:backend');
      console.error('Or run both servers with: npm run dev\n');
      process.exit(1);
    }

    console.log('✓ Backend is ready');

    console.log('\n📤 Sending import request...');
    const response = await fetch('http://localhost:5000/api/v1/admin/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: 'seed-data.json'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Import failed');
    }

    // Display results
    console.log('\n✅ IMPORT COMPLETE\n');
    console.log('═'.repeat(70));
    console.log('\n📊 Summary:');
    console.log(`   Users:                ${result.data.users}`);
    console.log(`   Projects:             ${result.data.projects}`);
    console.log(`   Project Members:      ${result.data.project_members}`);
    console.log(`   Heat Maps:            ${result.data.heat_maps}`);
    console.log(`   Test Executions:      ${result.data.test_executions}`);
    console.log(`   Risk Assessments:     ${result.data.risk_assessments}`);

    console.log('\n🚀 Data imported successfully!');
    console.log('   Open http://localhost:5175 to see the data in dashboards\n');

  } catch (error) {
    console.error('\n❌ Import Failed:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
}

// Run import
importData();
