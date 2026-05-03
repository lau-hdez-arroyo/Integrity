#!/usr/bin/env node

/**
 * Generate Dummy Test Data for INTEGRITY
 * 
 * Este script genera datos de prueba aleatorios para validar la app
 * 
 * Uso:
 *   node scripts/generate-dummy-data.js                 # Genera seed-data.json
 *   node scripts/generate-dummy-data.js --file=custom.json  # Genera custom.json
 *   node scripts/generate-dummy-data.js --projects=5    # 5 proyectos
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let outputFile = 'seed-data.json';
let projectCount = 3;

args.forEach(arg => {
  if (arg.startsWith('--file=')) {
    outputFile = arg.replace('--file=', '');
  }
  if (arg.startsWith('--projects=')) {
    projectCount = parseInt(arg.replace('--projects=', ''));
  }
});

// ============================================
// DATA GENERATORS
// ============================================

const firstNames = [
  'Laura', 'Carlos', 'Sofia', 'Juan', 'Diego', 'Maria', 'Ricardo', 'Ana',
  'Pedro', 'Carmen', 'Miguel', 'Rosa', 'Antonio', 'Lucia', 'Francisco'
];

const lastNames = [
  'Hernandez', 'Martinez', 'Rodriguez', 'Torres', 'Sanchez', 'Garcia',
  'Lopez', 'Gonzalez', 'Perez', 'Ramirez', 'Flores', 'Moreno', 'Gutierrez'
];

const roles = ['admin', 'qa', 'developer', 'executive', 'manager'];
const projectRoles = ['qa_lead', 'developer', 'manager', 'tester'];

const projectNames = [
  'PayFlow Platform', 'Mobile Banking App', 'Payment Gateway',
  'Analytics Dashboard', 'Security Audit Tool', 'DevOps Pipeline',
  'Machine Learning Model', 'Real-time Chat', 'Document Management',
  'API Documentation', 'Compliance System', 'Customer Portal'
];

const moduleNames = [
  'Authentication Service', 'Payment Processing', 'Fraud Detection',
  'Reporting & Analytics', 'Database Layer', 'Cache Management',
  'Queue System', 'Email Service', 'File Storage', 'Search Engine',
  'API Endpoints', 'Error Handling', 'Rate Limiting', 'Load Balancing',
  'Logging & Monitoring', 'Security Audit'
];

const risks = [
  'Low test coverage',
  'Flaky tests',
  'Missing integration tests',
  'Security vulnerabilities',
  'Performance issues',
  'Memory leaks',
  'Unhandled edge cases',
  'Incomplete error handling',
  'Database query optimization needed',
  'API rate limiting issues'
];

const recommendations = [
  'Increase test coverage to 90%',
  'Add integration test suite',
  'Implement performance tests',
  'Conduct security audit',
  'Add monitoring and alerting',
  'Refactor legacy code',
  'Implement caching strategy',
  'Add load testing',
  'Document edge cases',
  'Implement graceful degradation'
];

// ============================================
// GENERATOR FUNCTIONS
// ============================================

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(firstName, lastName, domain = 'payflow.com') {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

function generateUsers(count = 5) {
  const users = [];
  const usedEmails = new Set();
  
  for (let i = 0; i < count; i++) {
    let firstName, lastName, email;
    
    do {
      firstName = getRandomItem(firstNames);
      lastName = getRandomItem(lastNames);
      email = generateEmail(firstName, lastName);
    } while (usedEmails.has(email));
    
    usedEmails.add(email);
    
    users.push({
      email,
      name: `${firstName} ${lastName}`,
      role: getRandomItem(roles)
    });
  }
  
  return users;
}

function generateProjects(count, adminEmail) {
  const projects = [];
  const usedNames = new Set();
  
  for (let i = 0; i < count; i++) {
    let name;
    do {
      name = getRandomItem(projectNames);
    } while (usedNames.has(name));
    usedNames.add(name);
    
    projects.push({
      name,
      description: `${name} - High-priority project for enterprise clients`,
      repo: `https://github.com/payflow/${name.toLowerCase().replace(/\s+/g, '-')}`,
      created_by_email: adminEmail
    });
  }
  
  return projects;
}

function generateProjectMembers(projects, users) {
  const members = [];
  
  projects.forEach(project => {
    // Assign 2-4 random users to each project
    const memberCount = getRandomRange(2, Math.min(4, users.length));
    const shuffled = [...users].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < memberCount; i++) {
      members.push({
        project_name: project.name,
        user_email: shuffled[i].email,
        role: getRandomItem(projectRoles)
      });
    }
  });
  
  return members;
}

function generateHeatMaps(projects) {
  const heatMaps = [];
  
  projects.forEach(project => {
    // 4-6 modules per project
    const moduleCount = getRandomRange(4, 6);
    const usedModules = new Set();
    
    for (let i = 0; i < moduleCount; i++) {
      let moduleName;
      do {
        moduleName = getRandomItem(moduleNames);
      } while (usedModules.has(moduleName));
      usedModules.add(moduleName);
      
      const coverage = getRandomRange(60, 97);
      let riskLevel;
      
      if (coverage >= 90) riskLevel = 'low';
      else if (coverage >= 75) riskLevel = 'medium';
      else if (coverage >= 50) riskLevel = 'high';
      else riskLevel = 'critical';
      
      heatMaps.push({
        project_name: project.name,
        module_name: moduleName,
        coverage_percentage: coverage,
        risk_level: riskLevel
      });
    }
  });
  
  return heatMaps;
}

function generateTestExecutions(projects) {
  const executions = [];
  
  projects.forEach(project => {
    // 2-3 test execution records per project
    const executionCount = getRandomRange(2, 3);
    
    for (let i = 0; i < executionCount; i++) {
      const totalTests = getRandomRange(800, 3000);
      const passRate = getRandomRange(0.80, 0.98);
      const passedTests = Math.floor(totalTests * passRate);
      const failedTests = getRandomRange(10, Math.floor(totalTests * 0.05));
      const skippedTests = totalTests - passedTests - failedTests;
      
      executions.push({
        project_name: project.name,
        total_tests: totalTests,
        passed_tests: passedTests,
        failed_tests: failedTests,
        skipped_tests: skippedTests,
        coverage_percentage: getRandomRange(75, 95),
        execution_time_seconds: getRandomRange(120, 400),
        status: 'completed'
      });
    }
  });
  
  return executions;
}

function generateRiskAssessments(projects) {
  const assessments = [];
  
  projects.forEach(project => {
    const riskScore = getRandomRange(2, 8);
    let riskLevel;
    
    if (riskScore <= 3) riskLevel = 'low';
    else if (riskScore <= 6) riskLevel = 'medium';
    else if (riskScore <= 8) riskLevel = 'high';
    else riskLevel = 'critical';
    
    // Pick 3-4 random risks and recommendations
    const selectedRisks = [];
    const selectedRecs = [];
    
    const riskCount = getRandomRange(3, 5);
    const recCount = getRandomRange(3, 4);
    
    for (let i = 0; i < riskCount; i++) {
      selectedRisks.push(getRandomItem(risks));
    }
    
    for (let i = 0; i < recCount; i++) {
      selectedRecs.push(getRandomItem(recommendations));
    }
    
    assessments.push({
      project_name: project.name,
      risk_score: riskScore,
      risk_level: riskLevel,
      identified_risks: selectedRisks,
      recommendations: selectedRecs
    });
  });
  
  return assessments;
}

// ============================================
// MAIN GENERATION
// ============================================

function generateDummyData() {
  console.log('🔄 Generating dummy test data...\n');
  
  // Generate users
  const users = generateUsers(5);
  console.log(`✓ Generated ${users.length} users`);
  
  const adminUser = users.find(u => u.role === 'admin') || users[0];
  
  // Generate projects
  const projects = generateProjects(projectCount, adminUser.email);
  console.log(`✓ Generated ${projects.length} projects`);
  
  // Generate project members
  const projectMembers = generateProjectMembers(projects, users);
  console.log(`✓ Generated ${projectMembers.length} project members`);
  
  // Generate heat maps
  const heatMaps = generateHeatMaps(projects);
  console.log(`✓ Generated ${heatMaps.length} heat map entries`);
  
  // Generate test executions
  const testExecutions = generateTestExecutions(projects);
  console.log(`✓ Generated ${testExecutions.length} test executions`);
  
  // Generate risk assessments
  const riskAssessments = generateRiskAssessments(projects);
  console.log(`✓ Generated ${riskAssessments.length} risk assessments`);
  
  // Create final data object
  const data = {
    users,
    projects,
    project_members: projectMembers,
    heat_maps: heatMaps,
    test_executions: testExecutions,
    risk_assessments: riskAssessments
  };
  
  return data;
}

// ============================================
// FILE OPERATIONS
// ============================================

function saveData(data, filename) {
  const outputPath = path.join(process.cwd(), filename);
  
  try {
    fs.writeFileSync(
      outputPath,
      JSON.stringify(data, null, 2),
      'utf8'
    );
    
    console.log(`\n✅ Data saved to: ${filename}`);
    console.log(`📊 Summary:`);
    console.log(`   • Users: ${data.users.length}`);
    console.log(`   • Projects: ${data.projects.length}`);
    console.log(`   • Project Members: ${data.project_members.length}`);
    console.log(`   • Heat Maps: ${data.heat_maps.length}`);
    console.log(`   • Test Executions: ${data.test_executions.length}`);
    console.log(`   • Risk Assessments: ${data.risk_assessments.length}`);
    console.log(`\n🚀 Next step: npm run import-data`);
    
  } catch (error) {
    console.error(`\n❌ Error saving file: ${error.message}`);
    process.exit(1);
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

console.log('═'.repeat(60));
console.log('  INTEGRITY Dummy Data Generator');
console.log('═'.repeat(60) + '\n');

const dummyData = generateDummyData();
saveData(dummyData, outputFile);

console.log('\n' + '═'.repeat(60));
