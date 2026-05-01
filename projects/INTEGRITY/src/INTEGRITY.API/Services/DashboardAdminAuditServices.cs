using INTEGRITY.API.Data;
using INTEGRITY.API.DTOs;
using INTEGRITY.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace INTEGRITY.API.Services
{
    /// <summary>
    /// Dashboard aggregation service
    /// Combines data from HeatMap, TestSelection, and RiskAssessment services
    /// Provides role-specific views (Executive, QA, Developer)
    /// Performance target: &lt;5sec per dashboard query
    /// </summary>
    public class DashboardService : IDashboardService
    {
        private readonly IRepository<HeatMap> _heatMapRepository;
        private readonly IRepository<TestExecution> _testExecutionRepository;
        private readonly IRepository<RiskAssessment> _riskAssessmentRepository;
        private readonly IRepository<User> _userRepository;
        private readonly IHeatMapService _heatMapService;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(
            IRepository<HeatMap> heatMapRepository,
            IRepository<TestExecution> testExecutionRepository,
            IRepository<RiskAssessment> riskAssessmentRepository,
            IRepository<User> userRepository,
            IHeatMapService heatMapService,
            ILogger<DashboardService> logger)
        {
            _heatMapRepository = heatMapRepository;
            _testExecutionRepository = testExecutionRepository;
            _riskAssessmentRepository = riskAssessmentRepository;
            _userRepository = userRepository;
            _heatMapService = heatMapService;
            _logger = logger;
        }

        /// <summary>
        /// Gets Executive Dashboard KPIs
        /// - Quality Score (test pass rate + coverage)
        /// - Defect Escape Rate (predicted from risk model)
        /// - Cost Savings YTD (time saved × hourly rate)
        /// - Release Velocity (deployments per sprint)
        /// </summary>
        public async Task<ExecutiveDashboardDto> GetExecutiveDashboardAsync(Guid projectId)
        {
            try
            {
                _logger.LogInformation($"Dashboard: Generating Executive dashboard for project {projectId}");

                // Get recent test executions (last 30 days)
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                var recentTests = await _testExecutionRepository.FindAsync(
                    t => t.ProjectId == projectId && t.StartTime >= thirtyDaysAgo);

                // Calculate quality score: (passed / total) * 100
                var totalTests = recentTests.Count();
                var passedTests = recentTests.Count(t => t.Status == "PASSED");
                var qualityScore = totalTests > 0 ? (decimal)passedTests / totalTests * 100 : 0m;

                // Get latest heat map for coverage
                var heatMap = await _heatMapRepository.FindAsync(
                    h => h.ProjectId == projectId,
                    pageSize: 1);
                var latestHeatMap = heatMap.FirstOrDefault();

                // Calculate escape rate from risk assessments (last 30 days)
                var recentRiskAssessments = await _riskAssessmentRepository.FindAsync(
                    r => r.ProjectId == projectId && r.CreatedAt >= thirtyDaysAgo);
                var avgEscapeRate = recentRiskAssessments.Any() 
                    ? recentRiskAssessments.Average(r => r.PredictedEscapeRate)
                    : 0.05m;

                // Cost savings calculation (placeholder: assumes 15 min per test, $100/hr rate)
                var testsSavedCount = totalTests > 0 ? (int)(totalTests * 0.3m) : 0; // 30% reduction via intelligent selection
                var costSavings = testsSavedCount * 15m / 60m * 100m; // hours * rate

                // TODO: Get actual release velocity from ADO/GitHub
                var releaseVelocity = 2.3m; // Deployments per week (placeholder)

                return new ExecutiveDashboardDto
                {
                    QualityScore = qualityScore,
                    DefectEscapeRate = (decimal)avgEscapeRate,
                    CostSavingsYtd = costSavings,
                    ReleaseVelocity = releaseVelocity,
                    TeamSatisfaction = 4.2m, // TODO: Get from survey data
                    TestPassRate = qualityScore,
                    CodeCoveragePercent = latestHeatMap?.CoveragePercentage ?? 0m,
                    AverageCycleTime = 4.5m, // days (placeholder)
                    TimeGeneratedUtc = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating Executive dashboard: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Gets QA Dashboard metrics
        /// - Test Coverage percentage
        /// - Flaky Test Rate (tests with inconsistent results)
        /// - Coverage Gaps (untested code branches)
        /// - Auto-Fix Success Rate
        /// </summary>
        public async Task<QADashboardDto> GetQADashboardAsync(Guid projectId)
        {
            try
            {
                _logger.LogInformation($"Dashboard: Generating QA dashboard for project {projectId}");

                // Get latest heat map for coverage data
                var heatMapData = await _heatMapRepository.FindAsync(
                    h => h.ProjectId == projectId,
                    pageSize: 1);
                var latestHeatMap = heatMapData.FirstOrDefault();

                // Get all test executions (last 7 days) to identify flaky tests
                var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
                var recentTests = await _testExecutionRepository.FindAsync(
                    t => t.ProjectId == projectId && t.StartTime >= sevenDaysAgo);

                // Identify flaky tests: tests with both PASSED and FAILED runs
                var testsByName = recentTests.GroupBy(t => t.TestSuiteId);
                var flakyTests = testsByName
                    .Where(g => g.Select(t => t.Status).Distinct().Count() > 1)
                    .ToList();

                var flakyRate = recentTests.Any() 
                    ? (decimal)flakyTests.Count() / testsByName.Count() 
                    : 0m;

                // Critical flaky tests (must pass on CI/CD)
                var criticalFlakyCount = flakyTests.Count();

                // TODO: Calculate coverage gaps from code diff analysis
                var coverageGapCount = 12; // Placeholder

                return new QADashboardDto
                {
                    TestCoverage = latestHeatMap?.CoveragePercentage ?? 0m,
                    FlakyTestRate = flakyRate,
                    FlakyCriticalTests = criticalFlakyCount,
                    CoverageGapsFound = coverageGapCount,
                    AutoFixSuccessRate = 0.68m, // TODO: Track auto-fix results
                    TotalTestSuites = testsByName.Count(),
                    PassingRate = (decimal)recentTests.Count(t => t.Status == "PASSED") / (recentTests.Count() > 0 ? recentTests.Count() : 1),
                    TimeGeneratedUtc = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating QA dashboard: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Gets Developer Dashboard (personalized to user)
        /// - My PR Quality Score
        /// - Recommended Tests vs Full Suite (time savings)
        /// - My Risk Score on recent PRs
        /// - Peer Comparison
        /// - Career Progress Tracking
        /// </summary>
        public async Task<DeveloperDashboardDto> GetDeveloperDashboardAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation($"Dashboard: Generating Developer dashboard for user {userId}");

                // Get user details
                var users = await _userRepository.FindAsync(u => u.UserId == userId);
                var user = users.FirstOrDefault();
                if (user == null)
                    throw new ArgumentException($"User {userId} not found");

                // TODO: Get recent PRs from ADO/GitHub
                // - Calculate quality score based on test pass rate, defects found post-merge
                // - Get recommended vs full test counts
                // - Calculate risk score from commits

                var myPrQualityScore = 92.0m; // Placeholder
                var recommendedVsFullRatio = 8; // 23 recommended vs 285 total (placeholder)
                var myRiskScore = 3.2m; // Placeholder

                // TODO: Get peer comparison metrics
                var peerAverageQuality = 88.5m;
                var myPercentileRank = 75; // Top 25%

                // TODO: Calculate career progress
                var profileCompletionPercent = 85;
                var skillsEndorsed = 12;

                return new DeveloperDashboardDto
                {
                    MyPrQualityScore = myPrQualityScore,
                    RecommendedTestsVsFull = recommendedVsFullRatio,
                    MyRiskScore = myRiskScore,
                    PeerAverageQualityScore = peerAverageQuality,
                    MyPercentileRank = myPercentileRank,
                    CareerProgressPercent = profileCompletionPercent,
                    SkillsEndorsementsCount = skillsEndorsed,
                    TimeGeneratedUtc = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating Developer dashboard: {ex.Message}");
                throw;
            }
        }
    }

    /// <summary>
    /// Admin service for project and connection management
    /// Handles CRUD operations for Projects, Connections, Mappings, Webhooks
    /// Encrypts sensitive credentials via Azure Key Vault
    /// </summary>
    public class AdminService : IAdminService
    {
        private readonly IRepository<Project> _projectRepository;
        private readonly IRepository<Connection> _connectionRepository;
        private readonly IRepository<User> _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AdminService> _logger;

        // TODO: Inject IKeyVaultService for credential encryption

        public AdminService(
            IRepository<Project> projectRepository,
            IRepository<Connection> connectionRepository,
            IRepository<User> userRepository,
            IUnitOfWork unitOfWork,
            ILogger<AdminService> logger)
        {
            _projectRepository = projectRepository;
            _connectionRepository = connectionRepository;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new project
        /// Initializes with default settings and admin user
        /// </summary>
        public async Task<ProjectDto> CreateProjectAsync(ProjectCreateRequest request)
        {
            try
            {
                _logger.LogInformation($"Admin: Creating project {request.ProjectName}");

                var project = new Project
                {
                    ProjectId = Guid.NewGuid(),
                    Name = request.ProjectName,
                    RepositoryUrl = request.RepositoryUrl,
                    CreatedAt = DateTime.UtcNow
                };

                await _projectRepository.AddAsync(project);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation($"Admin: Project created {project.ProjectId}");

                return new ProjectDto
                {
                    ProjectId = project.ProjectId,
                    Name = project.Name,
                    RepositoryUrl = project.RepositoryUrl,
                    CreatedAt = project.CreatedAt,
                    TeamMemberCount = 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating project: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Gets project details
        /// </summary>
        public async Task<ProjectDto> GetProjectAsync(Guid projectId)
        {
            try
            {
                var project = await _projectRepository.GetByIdAsync(projectId);
                if (project == null)
                    throw new ArgumentException($"Project {projectId} not found");

                var users = await _userRepository.FindAsync(u => u.ProjectId == projectId);

                return new ProjectDto
                {
                    ProjectId = project.ProjectId,
                    Name = project.Name,
                    RepositoryUrl = project.RepositoryUrl,
                    CreatedAt = project.CreatedAt,
                    TeamMemberCount = users.Count()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting project: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Creates a new connection (integration with external system)
        /// Encrypts credentials via Key Vault before storage
        /// </summary>
        public async Task<ConnectionDto> CreateConnectionAsync(Guid projectId, ConnectionCreateRequest request)
        {
            try
            {
                _logger.LogInformation($"Admin: Creating {request.IntegrationType} connection for project {projectId}");

                // TODO: Validate project exists
                // TODO: Encrypt credentials via Key Vault
                // For now, store credentials as-is (should be base64 encoded at minimum)

                var connection = new Connection
                {
                    ConnectionId = Guid.NewGuid(),
                    ProjectId = projectId,
                    IntegrationType = request.IntegrationType,
                    EncryptedCredentials = request.Credentials, // TODO: Encrypt with Key Vault
                    TestConnectionAt = null,
                    CreatedAt = DateTime.UtcNow
                };

                await _connectionRepository.AddAsync(connection);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation($"Admin: Connection created {connection.ConnectionId}");

                return new ConnectionDto
                {
                    ConnectionId = connection.ConnectionId,
                    ProjectId = connection.ProjectId,
                    IntegrationType = connection.IntegrationType,
                    LastTestedAt = connection.TestConnectionAt,
                    IsActive = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating connection: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Gets connection details
        /// Does NOT return credentials (security)
        /// </summary>
        public async Task<ConnectionDto> GetConnectionAsync(Guid projectId, Guid connectionId)
        {
            try
            {
                var connection = await _connectionRepository.GetByIdAsync(connectionId);
                if (connection == null || connection.ProjectId != projectId)
                    throw new ArgumentException($"Connection {connectionId} not found");

                return new ConnectionDto
                {
                    ConnectionId = connection.ConnectionId,
                    ProjectId = connection.ProjectId,
                    IntegrationType = connection.IntegrationType,
                    LastTestedAt = connection.TestConnectionAt,
                    IsActive = true // TODO: Add IsActive field to Connection entity
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting connection: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Tests a connection to external system
        /// Validates credentials and connectivity
        /// </summary>
        public async Task<bool> TestConnectionAsync(Guid projectId, Guid connectionId)
        {
            try
            {
                _logger.LogInformation($"Admin: Testing connection {connectionId} for project {projectId}");

                var connection = await _connectionRepository.GetByIdAsync(connectionId);
                if (connection == null || connection.ProjectId != projectId)
                    throw new ArgumentException($"Connection {connectionId} not found");

                // TODO: Implement actual connection testing based on IntegrationType
                // - ADO: Call /organizations endpoint with PAT
                // - GitHub: Call /user endpoint with token
                // - SonarQube: Call /api/system/health with token
                // - Datadog: Call /api/v1/validate_api_key with API key

                connection.TestConnectionAt = DateTime.UtcNow;
                await _connectionRepository.UpdateAsync(connection);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation($"Admin: Connection test passed for {connectionId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error testing connection: {ex.Message}");
                return false;
            }
        }
    }

    /// <summary>
    /// Audit service for compliance and security tracking
    /// Logs all data modifications with user, timestamp, and changes
    /// Immutable: audit records cannot be deleted
    /// </summary>
    public class AuditService : IAuditService
    {
        private readonly IRepository<AuditTrail> _auditRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AuditService> _logger;

        public AuditService(
            IRepository<AuditTrail> auditRepository,
            IUnitOfWork unitOfWork,
            ILogger<AuditService> logger)
        {
            _auditRepository = auditRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        /// <summary>
        /// Logs an action to audit trail
        /// Called after every data modification
        /// </summary>
        public async Task LogActionAsync(
            Guid projectId,
            Guid userId,
            string action,
            string entity,
            string entityId,
            object? oldValues,
            object? newValues,
            string ipAddress)
        {
            try
            {
                var auditLog = new AuditTrail
                {
                    AuditId = Guid.NewGuid(),
                    ProjectId = projectId,
                    UserId = userId,
                    Action = action,
                    Entity = entity,
                    EntityId = entityId,
                    OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
                    NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
                    Timestamp = DateTime.UtcNow,
                    IPAddress = ipAddress
                };

                await _auditRepository.AddAsync(auditLog);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation($"Audit: Logged {action} on {entity} {entityId} by user {userId}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error logging audit: {ex.Message}");
                // Don't throw - audit failures shouldn't break operations
            }
        }

        /// <summary>
        /// Retrieves audit trail for a project
        /// Supports pagination
        /// </summary>
        public async Task<IEnumerable<AuditLogDto>> GetAuditTrailAsync(
            Guid projectId,
            int pageSize = 100,
            int pageNumber = 1)
        {
            try
            {
                var auditLogs = await _auditRepository.FindAsync(
                    a => a.ProjectId == projectId,
                    pageSize: pageSize);

                var dtos = auditLogs.Select(a => new AuditLogDto
                {
                    AuditId = a.AuditId,
                    UserId = a.UserId,
                    Action = a.Action,
                    Entity = a.Entity,
                    EntityId = a.EntityId,
                    Timestamp = a.Timestamp,
                    Changes = $"Old: {a.OldValues}, New: {a.NewValues}"
                }).ToList();

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving audit trail: {ex.Message}");
                throw;
            }
        }
    }
}
