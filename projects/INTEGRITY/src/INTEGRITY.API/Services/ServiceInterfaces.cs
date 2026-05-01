using INTEGRITY.API.Models;
using INTEGRITY.API.Data;
using INTEGRITY.API.DTOs;

namespace INTEGRITY.API.Services
{
    /// <summary>
    /// Interface for heat map generation and caching
    /// </summary>
    public interface IHeatMapService
    {
        Task<HeatMapDto> GenerateHeatMapAsync(HeatMapGenerateRequest request);
        Task<HeatMapDto> GetLatestHeatMapForProjectAsync(Guid projectId);
    }

    /// <summary>
    /// Interface for intelligent test selection
    /// </summary>
    public interface ITestSelectionService
    {
        Task<TestSelectionResponseDto> RecommendTestsAsync(TestSelectionRequest request);
    }

    /// <summary>
    /// Interface for risk assessment
    /// </summary>
    public interface IRiskAssessmentService
    {
        Task<RiskAssessmentResponseDto> AssessRiskAsync(RiskAssessmentRequest request);
    }

    /// <summary>
    /// Interface for dashboard aggregations
    /// </summary>
    public interface IDashboardService
    {
        Task<ExecutiveDashboardDto> GetExecutiveDashboardAsync(Guid projectId);
        Task<QADashboardDto> GetQADashboardAsync(Guid projectId);
        Task<DeveloperDashboardDto> GetDeveloperDashboardAsync(Guid userId);
    }

    /// <summary>
    /// Interface for admin operations
    /// </summary>
    public interface IAdminService
    {
        Task<ProjectDto> CreateProjectAsync(ProjectCreateRequest request);
        Task<ProjectDto> GetProjectAsync(Guid projectId);
        Task<ConnectionDto> CreateConnectionAsync(Guid projectId, ConnectionCreateRequest request);
        Task<ConnectionDto> GetConnectionAsync(Guid projectId, Guid connectionId);
        Task<bool> TestConnectionAsync(Guid projectId, Guid connectionId);
    }

    /// <summary>
    /// Interface for audit trail logging
    /// </summary>
    public interface IAuditService
    {
        Task LogActionAsync(Guid projectId, Guid userId, string action, string entity, string entityId, object oldValues, object newValues, string ipAddress);
        Task<IEnumerable<AuditLogDto>> GetAuditTrailAsync(Guid projectId, int pageSize = 100, int pageNumber = 1);
    }
}

/// <summary>
/// Request DTOs for API endpoints
/// </summary>
namespace INTEGRITY.API.DTOs
{
    public class HeatMapGenerateRequest
    {
        public Guid ProjectId { get; set; }
        public string? RepositoryBranchId { get; set; } // Optional, defaults to main
        public bool ForceRefresh { get; set; } = false
    }

    public class HeatMapResponse
    {
        public Guid HeatMapId { get; set; }
        public HeatMapDto Data { get; set; }
        public DateTime GeneratedAt { get; set; }
        public string CacheStatus { get; set; } // "Generated" or "FromCache"
    }

    public class TestSelectionRequest
    {
        public Guid ProjectId { get; set; }
        public string[] ChangedFiles { get; set; }
        public string RiskTolerance { get; set; } = "BALANCED"; // AGGRESSIVE, BALANCED, CONSERVATIVE
        public bool ExecuteNow { get; set; } = false;
    }

    public class TestSelectionResponse
    {
        public List<RecommendedTestDto> RecommendedTests { get; set; }
        public int EstimatedDurationMinutes { get; set; }
        public decimal ConfidenceScore { get; set; } // 0-1
        public decimal CostSavingPercent { get; set; }
        public string RecommendedStrategy { get; set; }
    }

    public class RiskAssessmentRequest
    {
        public Guid ProjectId { get; set; }
        public string CommitSha { get; set; }
        public string[] ChangedFiles { get; set; }
        public string[] NewTests { get; set; }
    }

    public class RiskAssessmentResponse
    {
        public decimal RiskScore { get; set; } // 0-10
        public decimal PredictedEscapeRate { get; set; } // 0-1
        public List<RiskFactorDto> Factors { get; set; }
        public string Recommendation { get; set; } // "Safe", "Review", "Escalate"
    }

    public class ProjectCreateRequest
    {
        public string ProjectName { get; set; }
        public string RepositoryUrl { get; set; }
        public string RepositoryType { get; set; } // "ADO", "GitHub", "GitLab"
    }

    public class ProjectDto
    {
        public Guid ProjectId { get; set; }
        public string Name { get; set; }
        public string RepositoryUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TeamMemberCount { get; set; }
    }

    public class ConnectionCreateRequest
    {
        public string IntegrationType { get; set; } // "ADO", "GitHub", "SonarQube", "Datadog", "Slack"
        public string Endpoint { get; set; }
        public string Credentials { get; set; } // Base64 encoded, will be encrypted
    }
}
