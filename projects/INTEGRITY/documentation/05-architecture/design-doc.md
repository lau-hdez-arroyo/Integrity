# Architecture Design Document: Project INTEGRITY

**Autonomous Quality Intelligence Ecosystem (AQIE)**

*Detailed Design of Core Functional Areas*

---

## 1. Heat Map Generation System

### Purpose
Create visual representation of code coverage and risk across the repository, updated every 4 hours.

### 1.1 Data Flow

```
Repository Commit
    ↓
Azure DevOps Webhook
    ↓
Service Bus Message
    ↓
Azure Function: HeatMapGenerator (triggered)
    ↓
1. Query SonarQube for coverage metrics
2. Query Azure SQL for historical defect data
3. Query ADO for test execution history
4. Calculate risk scores per file/function
5. Generate 2D heat map visualization
6. Store PNG in Blob Storage
7. Record metadata in SQL
    ↓
Dashboard: Display Heat Map
```

### 1.2 Risk Scoring Algorithm

Each file is assigned a risk score (0.0 - 10.0):

```
RiskScore = (CoverageFactor * 0.25) + (DefectDensityFactor * 0.35) + (ComplexityFactor * 0.25) + (ChangeFrequencyFactor * 0.15)

Where:
  - CoverageFactor = 10.0 * (1 - coverage_percentage)
    (Lower coverage = higher risk)
    
  - DefectDensityFactor = (defects_found / lines_of_code) * 100
    (Higher defect density = higher risk)
    
  - ComplexityFactor = cyclomatic_complexity / 15
    (Capped at 10.0)
    
  - ChangeFrequencyFactor = (commits_last_30d / 30)
    (Frequently changed code = higher risk)
```

### 1.3 Color Coding

| Risk Score | Color | Action |
|-----------|-------|--------|
| 0.0 - 2.0 | 🟢 Green | Low risk, standard testing |
| 2.1 - 5.0 | 🟡 Yellow | Medium risk, expanded testing |
| 5.1 - 7.5 | 🟠 Orange | High risk, comprehensive testing |
| 7.6 - 10.0 | 🔴 Red | Critical risk, manual review required |

### 1.4 Implementation Details

**Language:** C# / .NET 7  
**Trigger:** Azure Function Timer (4-hour interval)  
**Storage:** Azure Blob Storage (PNG), Azure SQL (metadata)  
**Performance:** Completes in <5 minutes for typical repository

```csharp
public class HeatMapGeneratorFunction
{
    private readonly ISonarQubeClient _sonarQube;
    private readonly IADOClient _ado;
    private readonly IHeatMapRepository _heatMapRepo;
    private readonly IVisualizationEngine _visualization;
    
    [FunctionName("GenerateHeatMap")]
    public async Task RunAsync([TimerTrigger("0 */4 * * * *")] TimerInfo timer)
    {
        // 1. Get code metrics from SonarQube
        var codeMetrics = await _sonarQube.GetMetricsAsync();
        
        // 2. Get defect data from SQL
        var defects = await _heatMapRepo.GetDefectsAsync(
            lastNDays: 90);
        
        // 3. Get test history from ADO
        var testHistory = await _ado.GetTestHistoryAsync();
        
        // 4. Calculate risk scores
        var riskScores = new Dictionary<string, double>();
        foreach (var file in codeMetrics.Files)
        {
            var score = CalculateRiskScore(
                file,
                defects,
                testHistory);
            riskScores[file.Path] = score;
        }
        
        // 5. Generate visualization
        var heatMap = _visualization.GenerateHeatMap(riskScores);
        
        // 6. Store in blob storage
        var blobUri = await _visualization.SaveToBlobAsync(heatMap);
        
        // 7. Record in database
        await _heatMapRepo.SaveHeatMapAsync(
            new HeatMapRecord
            {
                GeneratedAt = DateTime.UtcNow,
                BlobUri = blobUri,
                RiskScores = riskScores,
                Statistics = CalculateStatistics(riskScores)
            });
    }
}
```

---

## 2. Test Selection Engine

### Purpose
Recommend optimal subset of tests based on code changes and risk.

### 2.1 Selection Strategies

#### Strategy 1: Fast (10-15 minutes)

```
Selected Tests = (tests with coverage > 70% of changes) ∩ (tests with flakiness < 10%)
Expected Coverage: 60%
Use Case: Quick smoke tests, feature branches
```

#### Strategy 2: Balanced (30-40 minutes)

```
Selected Tests = sort_by(relevance_score DESC) | take(tests where cumulative_coverage >= 85%)
Expected Coverage: 85%
Use Case: Default CI/CD, merge-to-main
```

#### Strategy 3: Comprehensive (60-90 minutes)

```
Selected Tests = all tests in repository (no filtering)
Expected Coverage: 98%+
Use Case: Release candidate validation, high-risk changes
```

### 2.2 Test Relevance Scoring

```
RelevanceScore = 
    (DirectCoverageImpact * 0.40) +
    (HistoricalEffectiveness * 0.30) +
    (CodeComplexity * 0.20) +
    (TestReliability * 0.10)

Where:
  - DirectCoverageImpact = overlap(test.covered_lines, changed_lines) / changed_lines
  - HistoricalEffectiveness = defects_detected_by_this_test / test_execution_count
  - CodeComplexity = average_cyclomatic_complexity(changed_code)
  - TestReliability = 1.0 - flakiness_score
```

### 2.3 Implementation

**Language:** C# / .NET 7  
**Execution:** Azure App Service (sync endpoint)  
**Data Sources:** ADO, SonarQube, Azure SQL  
**Performance:** <2 minutes for typical PR analysis

```csharp
public class TestSelectionService
{
    public async Task<TestRecommendation> RecommendAsync(
        string repositoryId,
        string baseBranch,
        string headBranch,
        SelectionStrategy strategy)
    {
        var recommendation = new TestRecommendation();
        
        // Phase 1: Analyze changes
        var changes = await _ado.GetChangesAsync(
            repositoryId, baseBranch, headBranch);
        var metrics = await _sonarQube.GetMetricsAsync(
            repositoryId, changes.Select(c => c.File));
        
        // Phase 2: Score tests
        var tests = await _testRepository.GetAllAsync(repositoryId);
        var scored = tests.Select(t => new
        {
            Test = t,
            Score = CalculateRelevanceScore(t, changes, metrics)
        })
        .Where(x => x.Score >= 0.3)  // Filter low-scoring tests
        .OrderByDescending(x => x.Score)
        .ToList();
        
        // Phase 3: Select based on strategy
        var selected = strategy switch
        {
            SelectionStrategy.Fast => SelectFast(scored),
            SelectionStrategy.Balanced => SelectBalanced(scored),
            SelectionStrategy.Comprehensive => SelectComprehensive(scored),
            _ => SelectBalanced(scored)
        };
        
        // Phase 4: Prepare recommendation
        recommendation.SelectedTests = selected.Select(x => x.Test).ToList();
        recommendation.EstimatedDuration = selected.Sum(x => x.Test.AverageDuration);
        recommendation.ExpectedCoverage = CalculateCumulativeCoverage(selected);
        recommendation.ConfidenceScore = CalculateConfidence(selected);
        
        return recommendation;
    }
}
```

---

## 3. Risk Assessment System

### Purpose
Predict likelihood of defects in proposed changes.

### 3.1 Risk Assessment Algorithm

```
OverallRiskScore = 
    (CodeQualityRisk * 0.30) +
    (TestCoverageRisk * 0.25) +
    (AuthorExperienceRisk * 0.15) +
    (HistoricalDefectRisk * 0.20) +
    (ChangeVelocityRisk * 0.10)

Where:
  - CodeQualityRisk = sonarqube_quality_gate_score / 100
  - TestCoverageRisk = (1 - coverage_percentage) * 100
  - AuthorExperienceRisk = (new_team_member ? 7.0 : 3.0)
  - HistoricalDefectRisk = defects_in_area_last_90d / commits_in_area
  - ChangeVelocityRisk = files_changed_count / repository_file_count
```

### 3.2 Defect Prediction

Using machine learning model trained on historical data:

```
DefectLikelihood = MLModel.Predict(
    code_complexity,
    author_experience,
    change_size,
    test_coverage,
    historical_defect_rate
)

Output: Probability (0.0 - 1.0) of defect escaping to production
```

### 3.3 Implementation

**Language:** C# / .NET 7  
**ML Framework:** ML.NET 1.7  
**Training Data:** 90-day historical records  
**Update Frequency:** Weekly retraining

```csharp
public class RiskAssessmentService
{
    private readonly MLContext _mlContext;
    private ITransformer _defectPredictionModel;
    
    public async Task<RiskAssessment> AssessAsync(string commitSha)
    {
        var changes = await _ado.GetCommitAsync(commitSha);
        var metrics = await _sonarQube.GetMetricsAsync(changes);
        
        // Calculate component risks
        var codeQualityRisk = metrics.QualityGateScore / 100.0;
        var testCoverageRisk = (1.0 - metrics.CoveragePercentage) * 100.0;
        var authorExperienceRisk = changes.Author.IsNew ? 7.0 : 3.0;
        var historicalRisk = await GetHistoricalDefectRiskAsync(changes.Files);
        var velocityRisk = (changes.Files.Count / (double)await GetTotalFileCountAsync()) * 100.0;
        
        // Calculate overall risk
        var overallRisk = (codeQualityRisk * 0.30) +
                         (testCoverageRisk * 0.25) +
                         (authorExperienceRisk * 0.15) +
                         (historicalRisk * 0.20) +
                         (velocityRisk * 0.10);
        
        // Predict defect likelihood using ML model
        var defectPredictionInput = new DefectPredictionInput
        {
            CodeComplexity = metrics.CyclomaticComplexity,
            AuthorExperience = changes.Author.CommitCount,
            ChangeSize = changes.Files.Count,
            TestCoverage = metrics.CoveragePercentage,
            HistoricalDefectRate = historicalRisk
        };
        
        var prediction = _defectPredictionModel.CreatePredictionEngine<DefectPredictionInput, DefectPredictionOutput>()
            .Predict(defectPredictionInput);
        
        return new RiskAssessment
        {
            OverallScore = overallRisk,
            Category = CategorizeRisk(overallRisk),
            DefectLikelihood = prediction.ProbabilityOfDefect,
            Factors = new[] { codeQualityRisk, testCoverageRisk, authorExperienceRisk, historicalRisk, velocityRisk },
            Recommendations = GenerateRecommendations(overallRisk, metrics)
        };
    }
}
```

---

## 4. Dashboard & Reporting

### Purpose
Provide real-time visibility into system effectiveness and KPIs.

### 4.1 Executive Dashboard

**Refresh Rate:** Every 30 minutes  
**Key Metrics:**

```
┌─────────────────────────────────────────────────┐
│ INTEGRITY - Executive Dashboard                 │
├─────────────────────────────────────────────────┤
│                                                   │
│ Velocity Improvement         95% ↑               │
│ QA Burden Reduction          85% ↑               │
│ Defect Escape Reduction      87% ↑               │
│ Cost Savings (YTD)          $425K ↑              │
│                                                   │
│ Test Effectiveness (Last 30d)                    │
│  • Tests Recommended: 8,920 (↓ 95% vs baseline)  │
│  • Precision Score: 0.987                        │
│  • Missed Defects: 1                             │
│                                                   │
│ Trends                                            │
│  • Coverage: Stable ⟶                             │
│  • Defect Density: Improving ↓                   │
│  • Test Duration: Decreasing ↓                   │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 4.2 QA Engineer Dashboard

**Refresh Rate:** Real-time  
**Key Components:**

- Test suite execution status (pass/fail rates)
- Flaky test identification and trends
- Coverage by component
- Defect escape analysis (failures after deployment)

### 4.3 Developer Dashboard

**Refresh Rate:** Real-time  
**Key Components:**

- My recent test results
- Coverage by file I edited
- Risk assessment for my PRs
- Recommended tests for my changes

### 4.4 Implementation

**Frontend:** React 18 + TypeScript  
**Backend:** ASP.NET Core controllers (DashboardController)  
**Data Source:** Azure SQL (pre-aggregated tables updated nightly)  
**Caching:** Azure Cache for Redis (1-hour TTL)

```csharp
public class DashboardService
{
    public async Task<ExecutiveDashboard> GetExecutiveDashboardAsync(
        TimeRange timeRange = TimeRange.Last30Days)
    {
        // Check cache first
        var cached = await _cache.GetAsync("dashboard:executive");
        if (cached != null) return cached;
        
        // Calculate KPIs
        var metrics = new ExecutiveDashboard();
        
        metrics.VelocityImprovement = await CalculateVelocityImprovementAsync(timeRange);
        metrics.QABurdenReduction = await CalculateQABurdenReductionAsync(timeRange);
        metrics.DefectEscapeReduction = await CalculateDefectEscapeReductionAsync(timeRange);
        metrics.CostSavings = await CalculateCostSavingsAsync(timeRange);
        
        metrics.TestEffectiveness = await CalculateTestEffectivenessAsync(timeRange);
        metrics.Trends = await CalculateTrendsAsync(timeRange);
        
        // Cache for 30 minutes
        await _cache.SetAsync("dashboard:executive", metrics, TimeSpan.FromMinutes(30));
        
        return metrics;
    }
}
```

---

## 5. Administration & Configuration

### Purpose
Multi-project deployment with flexible integrations to any development toolchain.

### 5.1 Admin Console (Web UI)

**Technology:** React 18 + TypeScript  
**Backend:** ASP.NET Core (AdminController)  
**Responsibilities:**
- Project creation and management
- Integration connection setup
- Credential/token management
- Webhook configuration
- Connection testing

### 5.2 Connection Manager Service

```csharp
public class ConnectionManagerService
{
    private readonly IVaultService _vault;           // Azure Key Vault
    private readonly IEncryptionService _encryption;
    private readonly IConnectionFactory _factory;
    
    // Supported integrations
    public enum ConnectionType
    {
        AzureDevOps,
        SonarQube,
        Datadog,
        Slack,
        GitHub,
        GitLab,
        Custom
    }
    
    public async Task<Connection> CreateConnectionAsync(
        string projectId,
        ConnectionType type,
        Dictionary<string, string> credentials)
    {
        // Validate connection parameters
        ValidateConnectionParameters(type, credentials);
        
        // Encrypt sensitive data
        var encrypted = await _encryption.EncryptAsync(
            JsonConvert.SerializeObject(credentials));
        
        // Store in Key Vault
        var secretName = $"integrity-{projectId}-{type}";
        await _vault.SetSecretAsync(secretName, encrypted);
        
        // Test connection
        var testResult = await TestConnectionAsync(type, credentials);
        if (!testResult.IsSuccess)
            throw new InvalidOperationException(
                $"Connection failed: {testResult.ErrorMessage}");
        
        // Save connection metadata to database
        var connection = new Connection
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Type = type,
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            LastTestedAt = DateTime.UtcNow,
            VaultReference = secretName
        };
        
        await _repository.AddConnectionAsync(connection);
        return connection;
    }
    
    public async Task<TestResult> TestConnectionAsync(
        ConnectionType type,
        Dictionary<string, string> credentials)
    {
        switch (type)
        {
            case ConnectionType.AzureDevOps:
                return await TestADOConnectionAsync(credentials);
            case ConnectionType.SonarQube:
                return await TestSonarQubeConnectionAsync(credentials);
            case ConnectionType.Datadog:
                return await TestDatadogConnectionAsync(credentials);
            case ConnectionType.Slack:
                return await TestSlackConnectionAsync(credentials);
            default:
                throw new NotSupportedException($"Type {type} not supported");
        }
    }
    
    private async Task<TestResult> TestADOConnectionAsync(
        Dictionary<string, string> credentials)
    {
        try
        {
            var orgUrl = credentials["OrganizationUrl"];
            var pat = credentials["PersonalAccessToken"];
            
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Basic", 
                    Convert.ToBase64String(
                        Encoding.ASCII.GetBytes($":{pat}")));
            
            var response = await client.GetAsync(
                $"{orgUrl}/_apis/projects?api-version=7.0");
            
            if (!response.IsSuccessStatusCode)
                return TestResult.Failure(
                    $"ADO returned {response.StatusCode}");
            
            return TestResult.Success("Connected successfully");
        }
        catch (Exception ex)
        {
            return TestResult.Failure(ex.Message);
        }
    }
    
    private async Task<TestResult> TestSonarQubeConnectionAsync(
        Dictionary<string, string> credentials)
    {
        try
        {
            var baseUrl = credentials["InstanceUrl"];
            var token = credentials["ApiToken"];
            
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", token);
            
            var response = await client.GetAsync(
                $"{baseUrl}/api/ce/activity");
            
            if (!response.IsSuccessStatusCode)
                return TestResult.Failure(
                    $"SonarQube returned {response.StatusCode}");
            
            return TestResult.Success("Connected successfully");
        }
        catch (Exception ex)
        {
            return TestResult.Failure(ex.Message);
        }
    }
}
```

### 5.3 Project Configuration Service

```csharp
public class ProjectConfigService
{
    private readonly IRepository _repository;
    private readonly IConnectionManagerService _connectionManager;
    
    public async Task<Project> CreateProjectAsync(
        string name,
        string repositoryUrl,
        string repositoryType) // "ADO" | "GitHub" | "GitLab"
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = name,
            RepositoryUrl = repositoryUrl,
            RepositoryType = repositoryType,
            CreatedAt = DateTime.UtcNow,
            Status = "Active"
        };
        
        await _repository.AddProjectAsync(project);
        return project;
    }
    
    public async Task<ProjectMapping> SetIntegrationMappingAsync(
        string projectId,
        string integrationName,  // "SonarQube" | "Datadog" | "Slack"
        Dictionary<string, string> mappingConfig)
    {
        var mapping = new ProjectMapping
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            IntegrationName = integrationName,
            Config = JsonConvert.SerializeObject(mappingConfig),
            CreatedAt = DateTime.UtcNow
        };
        
        await _repository.AddProjectMappingAsync(mapping);
        return mapping;
    }
    
    public async Task<IEnumerable<ProjectMapping>> GetProjectMappingsAsync(
        string projectId)
    {
        return await _repository.GetProjectMappingsByProjectIdAsync(projectId);
    }
}
```

### 5.4 Multi-Project Data Isolation

**Database Schema:**
```sql
-- Projects table
CREATE TABLE Projects (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    RepositoryUrl NVARCHAR(500) NOT NULL,
    RepositoryType NVARCHAR(50),  -- "ADO", "GitHub", "GitLab"
    TenantId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME NOT NULL,
    Status NVARCHAR(50)
);

-- Connections table
CREATE TABLE Connections (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ProjectId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY,
    Type NVARCHAR(50),  -- "AzureDevOps", "SonarQube", "Datadog", "Slack"
    Status NVARCHAR(50),
    VaultReference NVARCHAR(500),  -- Azure Key Vault secret name
    CreatedAt DATETIME NOT NULL,
    LastTestedAt DATETIME,
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id)
);

-- Project Mappings table
CREATE TABLE ProjectMappings (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ProjectId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY,
    IntegrationName NVARCHAR(100),  -- "SonarQube", "ADO", etc.
    Config NVARCHAR(MAX),  -- JSON config (project keys, channel names, etc.)
    CreatedAt DATETIME NOT NULL,
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id)
);

-- Data isolation: All queries filtered by ProjectId
-- Example: SELECT * FROM HeatMaps WHERE ProjectId = @projectId
```

### 5.5 Integration Factory Pattern

```csharp
public interface IIntegrationAdapter
{
    Task<RepositoryInfo> GetRepositoryInfoAsync(string repositoryId);
    Task<IEnumerable<Commit>> GetCommitsAsync(string branch, int count);
    Task<IEnumerable<TestResult>> GetTestResultsAsync(string testSuiteId);
}

public class IntegrationFactory
{
    public IIntegrationAdapter CreateAdapter(
        ConnectionType type,
        Connection connection,
        ProjectMapping mapping)
    {
        return type switch
        {
            ConnectionType.AzureDevOps => 
                new AzureDevOpsAdapter(connection, mapping),
            ConnectionType.GitHub => 
                new GitHubAdapter(connection, mapping),
            ConnectionType.GitLab => 
                new GitLabAdapter(connection, mapping),
            _ => throw new NotSupportedException($"Type {type} not supported")
        };
    }
}

// Adapter implementations handle integration-specific logic
public class AzureDevOpsAdapter : IIntegrationAdapter
{
    private readonly string _orgUrl;
    private readonly string _pat;
    
    public AzureDevOpsAdapter(Connection conn, ProjectMapping mapping)
    {
        var credentials = await DecryptCredentialsAsync(conn);
        _orgUrl = credentials["OrganizationUrl"];
        _pat = credentials["PersonalAccessToken"];
    }
    
    public async Task<RepositoryInfo> GetRepositoryInfoAsync(
        string repositoryId)
    {
        // ADO-specific implementation
        // Uses Azure DevOps API v7.0+
    }
}
```

### 5.6 Webhook Management

```csharp
public class WebhookManagerService
{
    public async Task<Webhook> RegisterWebhookAsync(
        string projectId,
        WebhookEventType eventType)  // "Commit", "TestResult", "PullRequest"
    {
        var webhook = new Webhook
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            EventType = eventType,
            Url = GenerateWebhookUrl(projectId, eventType),
            Secret = GenerateSecurityToken(),
            CreatedAt = DateTime.UtcNow
        };
        
        // Register webhook in external system (ADO, GitHub, etc.)
        var connection = await _repository.GetPrimaryConnectionAsync(projectId);
        var adapter = _factory.CreateAdapter(connection.Type, connection, null);
        
        await adapter.RegisterWebhookAsync(
            webhook.Url,
            webhook.Secret,
            eventType);
        
        await _repository.AddWebhookAsync(webhook);
        return webhook;
    }
    
    private string GenerateWebhookUrl(string projectId, WebhookEventType type)
    {
        // Returns: https://integrity-api.azurewebsites.net/webhooks/{projectId}/{type}
        return $"{_baseUrl}/webhooks/{projectId}/{type}";
    }
}
```

---

## 6. Audit & Compliance

### Purpose
Maintain immutable audit trail for SOX 404 compliance.

### 5.1 Audit Trail Structure

```
AuditEvent
├─ EventId (UUID)
├─ Timestamp (UTC, immutable)
├─ EventType (e.g., "test_recommendation", "deployment_approval")
├─ Actor (user_id, with role)
├─ Action (human-readable description)
├─ Details (JSON payload)
├─ ImmutableHash (SHA256(previous_hash + this_event))
├─ RequestId (for tracing)
└─ Status (RECORDED, VERIFIED)
```

### 5.2 Compliance Features

**Immutability:**
- Append-only table in Azure SQL
- No UPDATE or DELETE operations allowed
- Hash chain prevents tampering (each event includes hash of previous event)

**Retention Policy:**
- Production events: 5 years
- Logs moved to Archive Blob Storage after 90 days (cold storage)
- 7-year backup copies in separate region

**Access Control:**
- Audit logs readable by Compliance Officer only
- Writes only by system (no manual edits)
- Audit log reads themselves logged (meta-audit)

### 5.3 Implementation

```csharp
public class AuditService
{
    private readonly ILogger<AuditService> _logger;
    private readonly AuditDbContext _dbContext;
    
    public async Task LogAsync(
        string eventType,
        string action,
        object details,
        string actor,
        string requestId)
    {
        var lastEvent = await _dbContext.AuditEvents
            .OrderByDescending(e => e.CreatedAt)
            .FirstOrDefaultAsync();
        
        var newEvent = new AuditEvent
        {
            EventId = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            EventType = eventType,
            Actor = actor,
            Action = action,
            Details = JsonSerializer.Serialize(details),
            RequestId = requestId,
            PreviousHash = lastEvent?.ImmutableHash,
            ImmutableHash = ComputeHash(lastEvent?.ImmutableHash, action, actor),
            Status = AuditEventStatus.Recorded
        };
        
        // Append to database (INSERT only, no UPDATE)
        _dbContext.AuditEvents.Add(newEvent);
        await _dbContext.SaveChangesAsync();
        
        _logger.LogInformation(
            "Audit event recorded: {EventId}, Type: {EventType}, Actor: {Actor}",
            newEvent.EventId, newEvent.EventType, newEvent.Actor);
    }
    
    private string ComputeHash(string previousHash, string action, string actor)
    {
        using (var sha256 = System.Security.Cryptography.SHA256.Create())
        {
            var input = $"{previousHash}|{action}|{actor}|{DateTime.UtcNow:O}";
            var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
            return Convert.ToHexString(hash);
        }
    }
}
```

---

## 7. Integration with External Systems

### 7.1 Azure DevOps Integration

**Webhook Triggers:**
```
Event: Push to branch
  → Parse commits
  → Trigger heat map generation
  → Record in audit log
  
Event: Pull request created
  → Analyze code changes
  → Generate test recommendations
  → Post comment in PR with recommendations
  → Record in audit log
  
Event: Pipeline completed
  → Fetch test results
  → Update database
  → Calculate test effectiveness
  → Send notifications
```

**Implementation:**
```csharp
[HttpPost("webhooks/ado")]
public async Task<IActionResult> HandleADOWebhookAsync([FromBody] ADOWebhookPayload payload)
{
    // Verify webhook signature
    if (!VerifyWebhookSignature(Request.Headers, payload))
        return Unauthorized();
    
    // Process event
    await _eventProcessor.ProcessAsync(payload);
    
    // Record audit
    await _auditService.LogAsync("webhook_received", $"ADO webhook: {payload.EventType}", payload, "system", Request.Headers["X-Request-Id"]);
    
    return Accepted();
}
```

### 7.2 SonarQube Integration

**Data Retrieval:**
- Code coverage metrics
- Code quality scores
- Technical debt metrics
- Security issues

**Sync Frequency:** Every 4 hours (aligned with heat map generation)

### 7.3 Datadog Integration

**Metrics Sent:**
- Test selection effectiveness
- API response times
- Heat map generation performance
- Cost tracking

---

## Document Information

**Created:** April 30, 2026  
**Phase:** 05-Architecture  
**Skill:** Architecture Design Document  
**Approver:** Technical Lead (Architecture Review)  
**Status:** ⏳ PENDING APPROVAL  
**Version:** 1.0

**Design Covers:**
- Heat Map Generation (RiskScore algorithm, 4-hour cycles)
- Test Selection Engine (3 strategies, relevance scoring)
- Risk Assessment (ML-based defect prediction)
- Dashboard & Reporting (Executive, QA, Developer views)
- Audit & Compliance (immutable trail, SOX 404)
- External System Integration (ADO, SonarQube, Datadog)

**Architecture Principles:**
- Microservices + managed services (no self-hosted)
- Event-driven async processing
- Immutable audit trail for compliance
- Redis caching for performance
- Multi-region disaster recovery
- Cost-optimized Azure services
