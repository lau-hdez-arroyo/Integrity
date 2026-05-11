import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { modulePriorityData } from '../data/modulePriorityData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY,
);

const PRIORITY_RISK_WEIGHT = {
  P0: 3.2,
  P1: 2.4,
  P2: 1.5,
  P3: 0.8,
};

function getArg(flagName) {
  const arg = process.argv.find((item) => item.startsWith(`${flagName}=`));
  return arg ? arg.split('=').slice(1).join('=') : null;
}

function pickProjectId(projects) {
  const cliProjectId = getArg('--projectId');
  if (cliProjectId) {
    return cliProjectId;
  }

  const projectFromEnv = process.env.PROJECT_ID;
  if (projectFromEnv) {
    return projectFromEnv;
  }

  return projects?.[0]?.project_id || null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function computeModuleCoverage(module) {
  if (module.passRate >= 0) {
    return module.passRate;
  }

  const fallback = 52 + Math.round((module.impact || 50) * 0.28);
  return clamp(fallback, 40, 82);
}

function computeRiskScore(module, coverage) {
  const baseFromCoverage = (100 - coverage) / 10;
  const priorityWeight = PRIORITY_RISK_WEIGHT[module.priority] || 1.2;
  const impactWeight = ((module.impact || 50) / 100) * 2;
  return Number(clamp(baseFromCoverage + priorityWeight + impactWeight, 0.5, 9.9).toFixed(1));
}

function buildHeatMap(projectId) {
  const modules = modulePriorityData.map((module) => {
    const coverage = computeModuleCoverage(module);
    const riskScore = computeRiskScore(module, coverage);

    return {
      name: module.label,
      coverage,
      complexity: Number(((module.features || 1) / 2).toFixed(1)),
      riskScore,
      defectRate: Number(((100 - coverage) / 1000).toFixed(3)),
      priority: module.priority,
      status: module.status,
      totalTests: module.totalTests,
      passedTests: module.passedTests,
      impact: module.impact,
      features: module.features,
      connections: module.connections || [],
    };
  });

  const overallCoverage = Number(
    (modules.reduce((sum, mod) => sum + mod.coverage, 0) / Math.max(modules.length, 1)).toFixed(2),
  );
  const overallRisk = Number(
    (modules.reduce((sum, mod) => sum + mod.riskScore, 0) / Math.max(modules.length, 1)).toFixed(2),
  );

  return {
    project_id: projectId,
    repository_branch_id: 'main',
    coverage_percentage: overallCoverage,
    risk_score: overallRisk,
    coverage_by_module: { modules },
    generated_at: new Date().toISOString(),
  };
}

function buildTestExecutions(projectId) {
  const rows = [];
  let suiteCounter = 1;

  modulePriorityData.forEach((module) => {
    const totalTests = Number.isFinite(module.totalTests) ? module.totalTests : 3;
    const coverage = computeModuleCoverage(module);
    const passRate = clamp(coverage / 100, 0, 1);

    for (let i = 0; i < totalTests; i += 1) {
      const seed = (i + suiteCounter) % 100;
      const status = seed < passRate * 100 ? 'PASSED' : (seed % 7 === 0 ? 'PENDING' : 'FAILED');
      const duration = 35 + ((module.impact || 50) % 20) + (i % 10);
      const startTime = new Date(Date.now() - ((suiteCounter + i) * 60000));
      const endTime = new Date(startTime.getTime() + (duration * 1000));

      rows.push({
        project_id: projectId,
        test_suite_id: `${module.shortLabel || module.id}-suite-${suiteCounter}`,
        status,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration,
      });

      suiteCounter += 1;
    }
  });

  return rows;
}

function buildRiskAssessments(projectId) {
  return modulePriorityData.map((module, index) => {
    const coverage = computeModuleCoverage(module);
    const riskScore = computeRiskScore(module, coverage);

    return {
      project_id: projectId,
      change_id: `graph-${module.id}-${index + 1}`,
      risk_score: riskScore,
      predicted_escape_rate: Number(clamp(riskScore / 10, 0.01, 0.99).toFixed(2)),
      factors: {
        module: module.label,
        priority: module.priority,
        impact: module.impact,
        passRate: module.passRate,
        connections: module.connections || [],
        recommendation: riskScore >= 7 ? 'REVIEW' : 'APPROVE',
      },
      created_at: new Date().toISOString(),
    };
  });
}

async function seedProjectFromGraph() {
  console.log('🌱 Seeding project data from graph modules...');

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('project_id, name')
    .order('created_at', { ascending: false });

  if (projectsError) {
    throw new Error(`Failed to load projects: ${projectsError.message}`);
  }

  const projectId = pickProjectId(projects || []);
  if (!projectId) {
    throw new Error('No project found. Create a project first or pass --projectId=<uuid>');
  }

  const project = (projects || []).find((item) => item.project_id === projectId);
  console.log(`🎯 Target project: ${project?.name || 'Unknown'} (${projectId})`);

  await supabase.from('risk_assessments').delete().eq('project_id', projectId);
  await supabase.from('test_executions').delete().eq('project_id', projectId);
  await supabase.from('heat_maps').delete().eq('project_id', projectId);

  const heatMap = buildHeatMap(projectId);
  const testExecutions = buildTestExecutions(projectId);
  const riskAssessments = buildRiskAssessments(projectId);

  const { error: heatError } = await supabase.from('heat_maps').insert(heatMap);
  if (heatError) {
    throw new Error(`Failed to insert heat map: ${heatError.message}`);
  }

  const { error: testError } = await supabase.from('test_executions').insert(testExecutions);
  if (testError) {
    throw new Error(`Failed to insert test executions: ${testError.message}`);
  }

  const { error: riskError } = await supabase.from('risk_assessments').insert(riskAssessments);
  if (riskError) {
    throw new Error(`Failed to insert risk assessments: ${riskError.message}`);
  }

  console.log(`✅ Heat map inserted: 1`);
  console.log(`✅ Test executions inserted: ${testExecutions.length}`);
  console.log(`✅ Risk assessments inserted: ${riskAssessments.length}`);
  console.log('🏁 Graph-based seed complete.');
}

seedProjectFromGraph().catch((error) => {
  console.error('❌ Graph-based seed failed:', error.message);
  process.exit(1);
});
