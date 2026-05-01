// This file provides necessary extensions and fixes to align service interfaces with existing DTOs
// Consolidates type definitions used across the API

using INTEGRITY.API.Models;
using System.Collections.Generic;

namespace INTEGRITY.API.DTOs
{
    // =====================
    // Extended Dashboard DTOs (from existing AllDtos.cs)
    // =====================

    public class ExecutiveDashboardDto
    {
        public decimal QualityScore { get; set; }
        public decimal DefectEscapeRate { get; set; }
        public decimal CostSavingsYtd { get; set; }
        public decimal ReleaseVelocity { get; set; }
        public decimal TeamSatisfaction { get; set; }
        public decimal TestPassRate { get; set; }
        public decimal CodeCoveragePercent { get; set; }
        public decimal AverageCycleTime { get; set; }
        public DateTime TimeGeneratedUtc { get; set; }
    }

    public class QADashboardDto
    {
        public decimal TestCoverage { get; set; }
        public decimal FlakyTestRate { get; set; }
        public int FlakyCriticalTests { get; set; }
        public int CoverageGapsFound { get; set; }
        public decimal AutoFixSuccessRate { get; set; }
        public int TotalTestSuites { get; set; }
        public decimal PassingRate { get; set; }
        public DateTime TimeGeneratedUtc { get; set; }
    }

    public class DeveloperDashboardDto
    {
        public decimal MyPrQualityScore { get; set; }
        public int RecommendedTestsVsFull { get; set; }
        public decimal MyRiskScore { get; set; }
        public decimal PeerAverageQualityScore { get; set; }
        public int MyPercentileRank { get; set; }
        public int CareerProgressPercent { get; set; }
        public int SkillsEndorsementsCount { get; set; }
        public DateTime TimeGeneratedUtc { get; set; }
    }

    // =====================
    // Admin DTOs
    // =====================

    public class ProjectDto
    {
        public Guid ProjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string RepositoryUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int TeamMemberCount { get; set; }
    }

    public class ProjectCreateRequest
    {
        public string ProjectName { get; set; } = string.Empty;
        public string RepositoryUrl { get; set; } = string.Empty;
        public string RepositoryType { get; set; } = string.Empty; // ADO, GitHub, GitLab
    }

    public class ConnectionDto
    {
        public Guid ConnectionId { get; set; }
        public Guid ProjectId { get; set; }
        public string IntegrationType { get; set; } = string.Empty;
        public DateTime? LastTestedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class ConnectionCreateRequest
    {
        public string IntegrationType { get; set; } = string.Empty;
        public string Endpoint { get; set; } = string.Empty;
        public string Credentials { get; set; } = string.Empty;
    }

    // =====================
    // Audit DTOs
    // =====================

    public class AuditLogDto
    {
        public Guid AuditId { get; set; }
        public Guid UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Entity { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Changes { get; set; } = string.Empty;
    }

    // =====================
    // Additional DTOs referenced in controllers
    // =====================

    public class TestSelectionResponseDto
    {
        public List<RecommendedTestDto> RecommendedTests { get; set; } = new();
        public int EstimatedDurationMinutes { get; set; }
        public decimal ConfidenceScore { get; set; }
        public decimal CostSavingPercent { get; set; }
        public string RecommendedStrategy { get; set; } = string.Empty;
    }

    public class RecommendedTestDto
    {
        public string TestId { get; set; } = string.Empty;
        public string TestName { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public int Priority { get; set; }
        public int EstimatedDuration { get; set; }
    }

    public class RiskAssessmentResponseDto
    {
        public decimal RiskScore { get; set; }
        public decimal PredictedEscapeRate { get; set; }
        public List<RiskFactorDto> Factors { get; set; } = new();
        public string Recommendation { get; set; } = string.Empty;
    }

    public class RiskFactorDto
    {
        public string FactorName { get; set; } = string.Empty;
        public decimal Weight { get; set; }
        public decimal Value { get; set; }
        public string Impact { get; set; } = string.Empty;
    }

    public class TestSelectionRequest
    {
        public Guid ProjectId { get; set; }
        public string[] ChangedFiles { get; set; } = Array.Empty<string>();
        public string RiskTolerance { get; set; } = "BALANCED";
        public bool ExecuteNow { get; set; } = false;
    }

    public class RiskAssessmentRequest
    {
        public Guid ProjectId { get; set; }
        public string CommitSha { get; set; } = string.Empty;
        public string[] ChangedFiles { get; set; } = Array.Empty<string>();
        public string[] NewTests { get; set; } = Array.Empty<string>();
    }
}

namespace INTEGRITY.API.Services
{
    /// <summary>
    /// Repository interface for HeatMap entity
    /// Abstracts data access for heat map operations
    /// </summary>
    public interface IHeatMapRepository
    {
        Task<HeatMap?> GetLatestForProjectAsync(Guid projectId);
        Task<IEnumerable<HeatMap>> GetHistoryForProjectAsync(Guid projectId, int limit = 10);
        Task AddAsync(HeatMap heatMap);
        Task UpdateAsync(HeatMap heatMap);
    }

    /// <summary>
    /// Adapter implementation for IRepository<HeatMap>
    /// Bridges between generic repository and specialized heat map queries
    /// </summary>
    public class HeatMapRepository : IHeatMapRepository
    {
        private readonly IRepository<HeatMap> _repository;

        public HeatMapRepository(IRepository<HeatMap> repository)
        {
            _repository = repository;
        }

        public async Task<HeatMap?> GetLatestForProjectAsync(Guid projectId)
        {
            var heatMaps = await _repository.FindAsync(
                h => h.ProjectId == projectId,
                pageSize: 1);
            return heatMaps.FirstOrDefault();
        }

        public async Task<IEnumerable<HeatMap>> GetHistoryForProjectAsync(Guid projectId, int limit = 10)
        {
            return await _repository.FindAsync(
                h => h.ProjectId == projectId,
                pageSize: limit);
        }

        public async Task AddAsync(HeatMap heatMap)
        {
            await _repository.AddAsync(heatMap);
        }

        public async Task UpdateAsync(HeatMap heatMap)
        {
            await _repository.UpdateAsync(heatMap);
        }
    }
}
