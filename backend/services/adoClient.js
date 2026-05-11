function getAuthHeaders(personalAccessToken) {
  const token = Buffer.from(`:${personalAccessToken}`).toString('base64');
  return {
    Authorization: `Basic ${token}`,
    'Content-Type': 'application/json',
  };
}

function normalizeBranchName(refName) {
  if (!refName) {
    return 'main';
  }
  return String(refName).replace('refs/heads/', '');
}

function isUnitTestPath(filePath) {
  const value = String(filePath || '').toLowerCase();
  return (
    value.includes('/__tests__/')
    || value.endsWith('.test.js')
    || value.endsWith('.spec.js')
    || value.endsWith('.test.ts')
    || value.endsWith('.spec.ts')
    || value.endsWith('.test.tsx')
    || value.endsWith('.spec.tsx')
    || value.endsWith('_test.go')
    || value.endsWith('_test.py')
    || value.endsWith('test_')
    || value.includes('/tests/unit/')
    || value.includes('/test/unit/')
    || value.includes('/unit-tests/')
    || value.includes('/unittests/')
  );
}

function isTestPath(filePath) {
  const value = String(filePath || '').toLowerCase();
  return (
    isUnitTestPath(value)
    || value.includes('/tests/')
    || value.includes('/test/')
    || value.endsWith('.feature')
    || value.includes('/e2e/')
    || value.includes('/integration/')
  );
}

function isCodePath(filePath) {
  const value = String(filePath || '').toLowerCase();
  return (
    value.endsWith('.js')
    || value.endsWith('.jsx')
    || value.endsWith('.ts')
    || value.endsWith('.tsx')
    || value.endsWith('.py')
    || value.endsWith('.java')
    || value.endsWith('.cs')
    || value.endsWith('.go')
    || value.endsWith('.rb')
    || value.endsWith('.php')
  );
}

function detectCoverageConfig(filePaths) {
  const files = filePaths.map((p) => String(p).toLowerCase());
  return files.some((path) => (
    path.endsWith('jest.config.js')
    || path.endsWith('jest.config.ts')
    || path.endsWith('.nycrc')
    || path.endsWith('nyc.config.js')
    || path.endsWith('.coveragerc')
    || path.endsWith('pytest.ini')
    || path.endsWith('tox.ini')
    || path.endsWith('coverage.xml')
    || path.includes('/coverage/')
  ));
}

function detectFrameworks(filePaths) {
  const files = filePaths.map((p) => String(p).toLowerCase());
  const frameworks = [];

  if (files.some((p) => p.includes('jest.config') || p.includes('/__tests__/') || p.endsWith('.test.js') || p.endsWith('.test.ts'))) {
    frameworks.push('Jest');
  }
  if (files.some((p) => p.endsWith('vitest.config.ts') || p.endsWith('vitest.config.js'))) {
    frameworks.push('Vitest');
  }
  if (files.some((p) => p.endsWith('pytest.ini') || p.endsWith('conftest.py'))) {
    frameworks.push('Pytest');
  }
  if (files.some((p) => p.endsWith('pom.xml') || p.endsWith('build.gradle') || p.endsWith('build.gradle.kts'))) {
    frameworks.push('JUnit');
  }
  if (files.some((p) => p.endsWith('.csproj') || p.endsWith('.sln'))) {
    frameworks.push('.NET Test');
  }

  return frameworks;
}

async function adoFetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.message || payload?.error?.message || `ADO request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

async function getRepositoryFileList({
  organizationUrl,
  adoProject,
  repositoryId,
  branchName,
  personalAccessToken,
}) {
  const url = `${organizationUrl}/${adoProject}/_apis/git/repositories/${repositoryId}/items?scopePath=/&recursionLevel=Full&includeContentMetadata=true&versionDescriptor.version=${encodeURIComponent(branchName)}&versionDescriptor.versionType=branch&api-version=7.1-preview.1`;
  const payload = await adoFetchJson(url, {
    headers: getAuthHeaders(personalAccessToken),
  });

  return (payload?.value || []).map((item) => item.path).filter(Boolean);
}

async function getPipelineAnalysis({ organizationUrl, adoProject, personalAccessToken }) {
  const pipelinesUrl = `${organizationUrl}/${adoProject}/_apis/pipelines?api-version=7.1-preview.1`;
  const definitionsUrl = `${organizationUrl}/${adoProject}/_apis/build/definitions?api-version=7.1-preview.7`;

  const [pipelinesPayload, definitionsPayload] = await Promise.all([
    adoFetchJson(pipelinesUrl, { headers: getAuthHeaders(personalAccessToken) }).catch(() => ({ count: 0, value: [] })),
    adoFetchJson(definitionsUrl, { headers: getAuthHeaders(personalAccessToken) }).catch(() => ({ count: 0, value: [] })),
  ]);

  return {
    configured: (pipelinesPayload?.count || 0) > 0 || (definitionsPayload?.count || 0) > 0,
    pipelinesCount: pipelinesPayload?.count || 0,
    buildDefinitionsCount: definitionsPayload?.count || 0,
    samples: (pipelinesPayload?.value || []).slice(0, 5).map((item) => ({
      id: item.id,
      name: item.name,
    })),
  };
}

async function getLatestCoverageMetric({ organizationUrl, adoProject, personalAccessToken }) {
  const buildsUrl = `${organizationUrl}/${adoProject}/_apis/build/builds?statusFilter=completed&resultFilter=succeeded&$top=5&queryOrder=finishTimeDescending&api-version=7.1-preview.7`;
  const buildsPayload = await adoFetchJson(buildsUrl, {
    headers: getAuthHeaders(personalAccessToken),
  }).catch(() => ({ value: [] }));

  const latestBuild = (buildsPayload?.value || [])[0];
  if (!latestBuild?.id) {
    return {
      buildId: null,
      percentage: null,
      details: [],
    };
  }

  const coverageUrl = `${organizationUrl}/${adoProject}/_apis/test/codecoverage?buildId=${latestBuild.id}&flags=7&api-version=7.1-preview.1`;
  const coveragePayload = await adoFetchJson(coverageUrl, {
    headers: getAuthHeaders(personalAccessToken),
  }).catch(() => ({ value: [] }));

  const coverageItems = coveragePayload?.value || [];
  const percentages = coverageItems
    .flatMap((item) => item?.coverageData?.coverageStats || [])
    .map((stat) => {
      const total = stat?.total || 0;
      const covered = stat?.covered || 0;
      if (!total) {
        return null;
      }
      return (covered / total) * 100;
    })
    .filter((v) => v !== null);

  const averageCoverage = percentages.length
    ? Number((percentages.reduce((sum, val) => sum + val, 0) / percentages.length).toFixed(2))
    : null;

  return {
    buildId: latestBuild.id,
    percentage: averageCoverage,
    details: coverageItems.slice(0, 3).map((item) => ({
      buildFlavor: item.buildFlavor || null,
      buildPlatform: item.buildPlatform || null,
    })),
  };
}

async function analyzeRepositoryCodebase({
  organizationUrl,
  adoProject,
  personalAccessToken,
  repository,
}) {
  const branchName = normalizeBranchName(repository.defaultBranch);
  const filePaths = await getRepositoryFileList({
    organizationUrl,
    adoProject,
    repositoryId: repository.id,
    branchName,
    personalAccessToken,
  }).catch(() => []);

  const totalFiles = filePaths.length;
  const codeFiles = filePaths.filter(isCodePath);
  const testFiles = filePaths.filter(isTestPath);
  const unitTestFiles = filePaths.filter(isUnitTestPath);
  const frameworks = detectFrameworks(filePaths);

  const appIndicators = [
    'package.json',
    'pom.xml',
    'build.gradle',
    'requirements.txt',
    'pyproject.toml',
    '.sln',
    '.csproj',
    'go.mod',
    'src/',
    'app/',
  ];

  const lowerPaths = filePaths.map((p) => String(p).toLowerCase());
  const appDetected = lowerPaths.some((p) => appIndicators.some((marker) => p.includes(marker)));

  const automatedTestsDetected = testFiles.length > 0;
  const unitTestsDetected = unitTestFiles.length > 0;
  const coverageConfigured = detectCoverageConfig(filePaths);

  const codeToUnitTestRatio = codeFiles.length > 0
    ? Number((unitTestFiles.length / codeFiles.length).toFixed(3))
    : 0;

  return {
    repositoryId: repository.id,
    repositoryName: repository.name,
    branchAnalyzed: branchName,
    projectDeveloped: appDetected,
    totalFiles,
    codeFiles: codeFiles.length,
    automatedTestsDetected,
    testFiles: testFiles.length,
    unitTestsDetected,
    unitTestFiles: unitTestFiles.length,
    codeToUnitTestRatio,
    frameworks,
    coverageConfigured,
    sampleTestPaths: unitTestFiles.slice(0, 10),
  };
}

async function runWiqlQuery({ organizationUrl, adoProject, personalAccessToken, query }) {
  const url = `${organizationUrl}/${adoProject}/_apis/wit/wiql?api-version=7.1-preview.2`;
  const payload = await adoFetchJson(url, {
    method: 'POST',
    headers: getAuthHeaders(personalAccessToken),
    body: JSON.stringify({ query }),
  });

  const ids = (payload?.workItems || []).map((item) => item.id).filter(Boolean);
  return ids;
}

async function fetchWorkItemsBatch({ organizationUrl, adoProject, personalAccessToken, ids }) {
  if (!ids.length) {
    return [];
  }

  const limitedIds = ids.slice(0, 200);
  const url = `${organizationUrl}/${adoProject}/_apis/wit/workitemsbatch?api-version=7.1-preview.1`;

  const payload = await adoFetchJson(url, {
    method: 'POST',
    headers: getAuthHeaders(personalAccessToken),
    body: JSON.stringify({
      ids: limitedIds,
      fields: [
        'System.Id',
        'System.Title',
        'System.WorkItemType',
        'System.State',
        'Microsoft.VSTS.Common.Priority',
      ],
    }),
  });

  return payload?.value || [];
}

function summarizeWorkItems(workItems) {
  const byPriority = {
    P0: 0,
    P1: 0,
    P2: 0,
    P3: 0,
    Unknown: 0,
  };

  const byType = {};
  const byState = {};

  workItems.forEach((item) => {
    const fields = item.fields || {};
    const type = fields['System.WorkItemType'] || 'Unknown';
    const state = fields['System.State'] || 'Unknown';
    const priorityValue = fields['Microsoft.VSTS.Common.Priority'];

    byType[type] = (byType[type] || 0) + 1;
    byState[state] = (byState[state] || 0) + 1;

    if (priorityValue === 1) byPriority.P0 += 1;
    else if (priorityValue === 2) byPriority.P1 += 1;
    else if (priorityValue === 3) byPriority.P2 += 1;
    else if (priorityValue === 4) byPriority.P3 += 1;
    else byPriority.Unknown += 1;
  });

  return {
    total: workItems.length,
    byType,
    byState,
    byPriority,
  };
}

export async function fetchAdoProjectSummary({
  organizationUrl,
  adoProject,
  repositoryId,
  personalAccessToken,
}) {
  const cleanOrgUrl = organizationUrl.replace(/\/+$/, '');

  const reposUrl = `${cleanOrgUrl}/${adoProject}/_apis/git/repositories?api-version=7.1-preview.1`;
  const reposPayload = await adoFetchJson(reposUrl, {
    headers: getAuthHeaders(personalAccessToken),
  });

  const allRepositories = (reposPayload?.value || []).map((repo) => ({
    id: repo.id,
    name: repo.name,
    defaultBranch: repo.defaultBranch || null,
    size: repo.size || 0,
    webUrl: repo.webUrl || null,
  }));

  const repositories = repositoryId
    ? allRepositories.filter((repo) => repo.id === repositoryId)
    : allRepositories;

  const featureQuery = `
    SELECT [System.Id]
    FROM WorkItems
    WHERE [System.TeamProject] = '${adoProject}'
      AND [System.WorkItemType] IN ('Feature', 'User Story', 'Product Backlog Item')
      AND [System.State] <> 'Removed'
    ORDER BY [System.ChangedDate] DESC
  `;

  const testCaseQuery = `
    SELECT [System.Id]
    FROM WorkItems
    WHERE [System.TeamProject] = '${adoProject}'
      AND [System.WorkItemType] = 'Test Case'
      AND [System.State] <> 'Removed'
    ORDER BY [System.ChangedDate] DESC
  `;

  const [featureIds, testCaseIds] = await Promise.all([
    runWiqlQuery({
      organizationUrl: cleanOrgUrl,
      adoProject,
      personalAccessToken,
      query: featureQuery,
    }),
    runWiqlQuery({
      organizationUrl: cleanOrgUrl,
      adoProject,
      personalAccessToken,
      query: testCaseQuery,
    }),
  ]);

  const [featureItems, testItems] = await Promise.all([
    fetchWorkItemsBatch({
      organizationUrl: cleanOrgUrl,
      adoProject,
      personalAccessToken,
      ids: featureIds,
    }),
    fetchWorkItemsBatch({
      organizationUrl: cleanOrgUrl,
      adoProject,
      personalAccessToken,
      ids: testCaseIds,
    }),
  ]);

  const featureSummary = summarizeWorkItems(featureItems);
  const testSummary = summarizeWorkItems(testItems);

  const [pipelineAnalysis, coverageAnalysis, repositoryAnalyses] = await Promise.all([
    getPipelineAnalysis({
      organizationUrl: cleanOrgUrl,
      adoProject,
      personalAccessToken,
    }),
    getLatestCoverageMetric({
      organizationUrl: cleanOrgUrl,
      adoProject,
      personalAccessToken,
    }),
    Promise.all(
      repositories.slice(0, 5).map((repo) => analyzeRepositoryCodebase({
        organizationUrl: cleanOrgUrl,
        adoProject,
        personalAccessToken,
        repository: repo,
      })),
    ),
  ]);

  const aggregatedRepoAnalysis = {
    repositoriesAnalyzed: repositoryAnalyses.length,
    projectDeveloped: repositoryAnalyses.some((item) => item.projectDeveloped),
    automatedTestsDetected: repositoryAnalyses.some((item) => item.automatedTestsDetected),
    unitTestsDetected: repositoryAnalyses.some((item) => item.unitTestsDetected),
    totalUnitTestFiles: repositoryAnalyses.reduce((sum, item) => sum + (item.unitTestFiles || 0), 0),
    totalTestFiles: repositoryAnalyses.reduce((sum, item) => sum + (item.testFiles || 0), 0),
    coverageConfigured: repositoryAnalyses.some((item) => item.coverageConfigured),
    repositories: repositoryAnalyses,
  };

  return {
    syncedAt: new Date().toISOString(),
    repositoryCount: repositories.length,
    repositoryTotalInProject: allRepositories.length,
    repositories,
    features: {
      total: featureIds.length,
      sampleLoaded: featureSummary.total,
      byType: featureSummary.byType,
      byState: featureSummary.byState,
      byPriority: featureSummary.byPriority,
    },
    tests: {
      total: testCaseIds.length,
      sampleLoaded: testSummary.total,
      byState: testSummary.byState,
      byPriority: testSummary.byPriority,
    },
    repositoryAnalysis: aggregatedRepoAnalysis,
    pipelineAnalysis,
    coverageAnalysis,
  };
}

export async function validateAdoConnection({
  organizationUrl,
  adoProject,
  personalAccessToken,
}) {
  const cleanOrgUrl = organizationUrl.replace(/\/+$/, '');
  const url = `${cleanOrgUrl}/${adoProject}/_apis/project?api-version=7.1-preview.4`;

  const payload = await adoFetchJson(url, {
    headers: getAuthHeaders(personalAccessToken),
  });

  return {
    id: payload?.id,
    name: payload?.name,
    state: payload?.state,
    visibility: payload?.visibility,
  };
}
